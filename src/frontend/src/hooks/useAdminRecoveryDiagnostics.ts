import { useQuery } from '@tanstack/react-query';
import { useActorSafe } from './useActorSafe';
import { useInternetIdentity } from './useInternetIdentity';
import type { AdminRecoveryDiagnostics } from '../backend';

export function useAdminRecoveryDiagnostics(enabled: boolean = true) {
  const { actor, actorReady, actorLoading } = useActorSafe();
  const { identity } = useInternetIdentity();

  // Scope query key by Principal ID to prevent cache leaks across identities
  const principalId = identity?.getPrincipal().toString() ?? 'anonymous';

  const query = useQuery<AdminRecoveryDiagnostics>({
    queryKey: ['adminRecoveryDiagnostics', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminRecoveryDiagnostics();
    },
    enabled: actorReady && !actorLoading && !!identity && enabled,
    retry: 1,
    staleTime: 30000, // 30 seconds
    throwOnError: false,
  });

  return {
    ...query,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
