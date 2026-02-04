import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActorSafe } from './useActorSafe';
import { useInternetIdentity } from './useInternetIdentity';
import type { InviteToken } from '../backend';
import { withTimeout } from '../utils/withTimeout';

export function useIsCallerInvited() {
  const { actor, actorReady, actorLoading } = useActorSafe();
  const { identity } = useInternetIdentity();

  // Scope query key by Principal ID to prevent cache leaks across identities
  const principalId = identity?.getPrincipal().toString() ?? 'anonymous';

  const query = useQuery<boolean>({
    queryKey: ['isCallerInvited', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return withTimeout(
        actor.isCallerInvited(),
        10000,
        'Invite status check timed out. Please retry.'
      );
    },
    enabled: actorReady && !!identity,
    retry: 1,
    staleTime: 30000,
    // Propagate errors instead of returning false
    throwOnError: false,
  });

  return {
    ...query,
    isLoading: actorLoading || (query.isLoading && query.data === undefined),
  };
}

export function useConsumeInviteToken() {
  const { actor } = useActorSafe();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (token: string) => {
      if (!actor) throw new Error('Actor not available');
      const success = await withTimeout(
        actor.consumeInviteToken(token),
        10000,
        'Invite token consumption timed out. Please retry.'
      );
      if (!success) {
        throw new Error('Invalid or already used token');
      }
      return success;
    },
    onSuccess: () => {
      const principalId = identity?.getPrincipal().toString() ?? 'anonymous';
      queryClient.invalidateQueries({ queryKey: ['isCallerInvited', principalId] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile', principalId] });
      queryClient.invalidateQueries({ queryKey: ['accountStatus', principalId] });
    },
  });
}

export function useGenerateInviteToken() {
  const { actor } = useActorSafe();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const token = `invite-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      return withTimeout(
        actor.generateHotelInviteToken(token),
        15000,
        'Invite token generation timed out. Please retry.'
      );
    },
    onSuccess: (newToken) => {
      const principalId = identity?.getPrincipal().toString() ?? 'anonymous';
      
      // Optimistically update the cache with the new token
      queryClient.setQueryData<InviteToken[]>(
        ['allInviteTokens', principalId],
        (oldData) => {
          const newTokenData: InviteToken = {
            token: newToken,
            isConsumed: false,
          };
          return oldData ? [newTokenData, ...oldData] : [newTokenData];
        }
      );
      
      // Invalidate to refetch in background without clearing cache
      queryClient.invalidateQueries({ 
        queryKey: ['allInviteTokens', principalId],
        refetchType: 'none' // Don't trigger immediate refetch, just mark as stale
      });
    },
    onError: (error) => {
      // On error, don't clear the cache - keep showing previous tokens
      console.error('Token generation failed:', error);
    },
  });
}

export function useGetAllInviteTokens() {
  const { actor, actorReady, actorLoading } = useActorSafe();
  const { identity } = useInternetIdentity();

  const principalId = identity?.getPrincipal().toString() ?? 'anonymous';

  const query = useQuery<InviteToken[]>({
    queryKey: ['allInviteTokens', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return withTimeout(
        actor.getAllInviteTokens(),
        15000,
        'Invite tokens fetch timed out. Please retry.'
      );
    },
    enabled: actorReady && !!identity,
    retry: 2,
    staleTime: 30000,
    // Keep previous data during refetch to prevent blank states
    placeholderData: (previousData) => previousData,
  });

  return {
    ...query,
    // Only show loading on initial load, not during refetch
    isLoading: actorLoading || (query.isLoading && !query.data),
  };
}
