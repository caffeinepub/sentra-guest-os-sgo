import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActorSafe } from './useActorSafe';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, UserRole } from '../backend';
import { useRef, useEffect } from 'react';
import { withTimeout } from '../utils/withTimeout';

export function useCurrentUser() {
  const { actor, actorReady, actorLoading } = useActorSafe();
  const { identity } = useInternetIdentity();

  // Scope query key by Principal ID to prevent cache leaks across identities
  const principalId = identity?.getPrincipal().toString() ?? 'anonymous';

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: actorReady && !!identity,
    retry: false,
    staleTime: 30000,
  });

  return {
    userProfile: query.data,
    isLoading: actorLoading || (query.isLoading && !query.data),
    isFetched: actorReady && query.isFetched,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
}

export function useCurrentUserRole() {
  const { actor, actorReady, actorLoading } = useActorSafe();

  return useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: actorReady,
  });
}

export function useIsAdmin() {
  const { actor, actorReady, actorLoading } = useActorSafe();
  const { identity } = useInternetIdentity();

  // Scope query key by Principal ID to prevent cache leaks across identities
  const principalId = identity?.getPrincipal().toString() ?? 'anonymous';

  // Persist last known successful admin=true result per Principal
  const lastKnownAdminRef = useRef<Map<string, boolean>>(new Map());

  const query = useQuery<boolean>({
    queryKey: ['isAdmin', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // Wrap the admin check with a 10-second timeout
      return withTimeout(
        actor.isCallerAdmin(),
        10000,
        'Admin verification timed out. Please retry.'
      );
    },
    enabled: actorReady && !!identity,
    retry: 2, // Allow retries for transient failures
    retryDelay: 1000,
    staleTime: 30000,
    // Propagate errors instead of returning false
    throwOnError: false,
  });

  // Update last known admin status when we get a successful admin=true result
  useEffect(() => {
    if (query.isSuccess && query.data === true && principalId !== 'anonymous') {
      lastKnownAdminRef.current.set(principalId, true);
    }
  }, [query.isSuccess, query.data, principalId]);

  // Clear last known status when Principal changes or logs out
  useEffect(() => {
    if (principalId === 'anonymous') {
      lastKnownAdminRef.current.clear();
    }
  }, [principalId]);

  // Derive verification state
  const lastKnownAdmin = lastKnownAdminRef.current.get(principalId) ?? false;
  const isVerified = query.isSuccess && query.data === true;
  const isFailed = query.isError && !query.isRefetching;
  
  // CRITICAL FIX: Only show loading during initial load, not during refetch
  // This prevents infinite loading spinner when data is already available
  const isLoading = actorLoading || (query.isLoading && query.data === undefined);

  // Admin UI should show if:
  // 1. Currently verified as admin, OR
  // 2. Last known admin=true for this Principal (keeps UI stable during refetch)
  const showAdminUI = isVerified || (lastKnownAdmin && !isFailed);

  return {
    ...query,
    // Expose derived states for consumers
    isVerified,
    isFailed,
    isLoading,
    showAdminUI,
    lastKnownAdmin,
  };
}

export function useSaveUserProfile() {
  const { actor } = useActorSafe();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      // Invalidate the Principal-scoped profile query
      const principalId = identity?.getPrincipal().toString() ?? 'anonymous';
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile', principalId] });
      // Also invalidate account status which includes userProfileExists
      queryClient.invalidateQueries({ queryKey: ['accountStatus', principalId] });
    },
  });
}
