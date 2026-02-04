import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActorSafe } from './useActorSafe';
import { useInternetIdentity } from './useInternetIdentity';
import type { StayRecord, CreateStayRecordInput } from '../backend';
import { withTimeout } from '../utils/withTimeout';

export function useGetCallerStayHistory() {
  const { actor, actorReady, actorLoading } = useActorSafe();
  const { identity } = useInternetIdentity();

  // Scope query key by Principal ID to prevent cache leaks across identities
  const principalId = identity?.getPrincipal().toString() ?? 'anonymous';

  const query = useQuery<StayRecord[]>({
    queryKey: ['stayHistory', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return withTimeout(
        actor.getCallerStayHistory(),
        10000,
        'Stay history fetch timed out. Please retry.'
      );
    },
    enabled: actorReady && !!identity,
    retry: 1,
    staleTime: 30000,
  });

  return {
    ...query,
    isLoading: actorLoading || (query.isLoading && !query.data),
    refetch: query.refetch,
  };
}

export function useCreateStayRecord() {
  const { actor } = useActorSafe();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateStayRecordInput) => {
      if (!actor) throw new Error('Actor not available');
      return withTimeout(
        actor.createStayRecord(input),
        10000,
        'Stay record creation timed out. Please retry.'
      );
    },
    onSuccess: () => {
      // Invalidate stay history queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['stayHistory'] });
    },
  });
}
