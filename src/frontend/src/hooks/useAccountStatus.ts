import { useQuery } from '@tanstack/react-query';
import { useActorSafe } from './useActorSafe';
import { useInternetIdentity } from './useInternetIdentity';
import type { AccountStatus } from '../backend';

export function useAccountStatus() {
  const { actor, actorReady, actorLoading } = useActorSafe();
  const { identity } = useInternetIdentity();

  // Scope query key by Principal ID to prevent cache leaks across identities
  const principalId = identity?.getPrincipal().toString() ?? 'anonymous';

  const query = useQuery<AccountStatus>({
    queryKey: ['accountStatus', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAccountStatus();
    },
    enabled: actorReady && !!identity,
    retry: 1,
    staleTime: 30000, // 30 seconds
  });

  return {
    ...query,
    isLoading: actorLoading || query.isLoading,
    // Expose refetch and isFetching for manual refresh UI
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
