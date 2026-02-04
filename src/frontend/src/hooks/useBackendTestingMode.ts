import { useQuery } from '@tanstack/react-query';
import { useActorSafe } from './useActorSafe';
import { withTimeout } from '../utils/withTimeout';

/**
 * Hook to fetch the backend testing mode state
 * This is the authoritative source for whether testing-mode bookings are allowed
 */
export function useBackendTestingMode() {
  const { actor, actorReady, actorLoading } = useActorSafe();

  const query = useQuery<boolean>({
    queryKey: ['backendTestingMode'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await withTimeout(
        actor.getTestingMode(),
        5000,
        'Failed to fetch testing mode status'
      );
    },
    enabled: actorReady,
    retry: 2,
    staleTime: 60000, // Cache for 1 minute
  });

  return {
    ...query,
    isLoading: actorLoading || query.isLoading,
  };
}
