import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from './useInternetIdentity';
import { type backendInterface } from '../backend';
import { createActorWithConfig } from '../config';
import { getSecretParameter } from '../utils/urlParams';
import { withTimeout } from '../utils/withTimeout';

const ACTOR_SAFE_QUERY_KEY = 'actorSafe';
const ACTOR_INIT_TIMEOUT_MS = 15000; // 15 seconds
const ACCESS_CONTROL_TIMEOUT_MS = 10000; // 10 seconds
const HEALTH_CHECK_TIMEOUT_MS = 5000; // 5 seconds

export interface ActorSafeState {
  actor: backendInterface | null;
  actorReady: boolean;
  actorError: Error | null;
  actorLoading: boolean;
  accessControlWarning: string | null;
  retry: () => void;
}

export function useActorSafe(): ActorSafeState {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const actorQuery = useQuery<{
    actor: backendInterface;
    accessControlWarning: string | null;
  }>({
    queryKey: [ACTOR_SAFE_QUERY_KEY, identity?.getPrincipal().toString()],
    queryFn: async () => {
      const isAuthenticated = !!identity;
      let accessControlWarning: string | null = null;

      // Step 1: Create actor with timeout
      const actorOptions = isAuthenticated
        ? { agentOptions: { identity } }
        : undefined;

      const actor = await withTimeout(
        createActorWithConfig(actorOptions),
        ACTOR_INIT_TIMEOUT_MS,
        'Actor initialization timed out. Please check your connection and retry.'
      );

      // Step 2: Verify backend liveness with health check
      try {
        await withTimeout(
          actor.health(),
          HEALTH_CHECK_TIMEOUT_MS,
          'Backend health check timed out'
        );
      } catch (healthError) {
        // Health check failed - treat as terminal actor initialization error
        const message = healthError instanceof Error ? healthError.message : 'Backend health check failed';
        throw new Error(`Backend is unavailable: ${message}`);
      }

      // Step 3: Initialize access control (non-blocking, only after health succeeds)
      if (isAuthenticated) {
        try {
          const adminToken = getSecretParameter('caffeineAdminToken') || '';
          await withTimeout(
            actor._initializeAccessControlWithSecret(adminToken),
            ACCESS_CONTROL_TIMEOUT_MS,
            'Access control initialization timed out'
          );
        } catch (error) {
          // Non-blocking: log warning but don't fail actor creation
          const message = error instanceof Error ? error.message : 'Unknown error';
          accessControlWarning = `Access control initialization failed: ${message}. Some admin features may be limited.`;
          console.warn(accessControlWarning);
        }
      }

      return { actor, accessControlWarning };
    },
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  const retry = () => {
    queryClient.invalidateQueries({ queryKey: [ACTOR_SAFE_QUERY_KEY] });
  };

  // Derive actorLoading: only true during initial load, not during refetch
  const actorLoading = actorQuery.isLoading && !actorQuery.data;

  return {
    actor: actorQuery.data?.actor || null,
    actorReady: actorQuery.isSuccess && !!actorQuery.data?.actor,
    actorError: actorQuery.error as Error | null,
    actorLoading,
    accessControlWarning: actorQuery.data?.accessControlWarning || null,
    retry,
  };
}
