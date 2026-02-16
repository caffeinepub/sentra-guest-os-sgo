import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActorSafe } from './useActorSafe';
import { useInternetIdentity } from './useInternetIdentity';
import type { Review, ReviewInput } from '../backend';
import { Principal } from '@icp-sdk/core/principal';
import { withTimeout } from '../utils/withTimeout';
import { getErrorMessage } from '../utils/getErrorMessage';

export function useSubmitReview() {
  const { actor } = useActorSafe();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (input: ReviewInput) => {
      if (!actor) throw new Error('Connection not available. Please retry.');
      try {
        return await withTimeout(
          actor.submitReview(input),
          10000,
          'Review submission timed out after 10 seconds. Please retry.'
        );
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error));
      }
    },
    onSuccess: (_data, variables) => {
      const principalId = identity?.getPrincipal().toString() ?? 'anonymous';
      queryClient.invalidateQueries({ queryKey: ['reviews', principalId] });
      queryClient.invalidateQueries({ queryKey: ['reviewsByTarget', variables.targetId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['allReviews'] });
    },
  });
}

export function useGetReviewsByTarget(targetType: string, targetId: Principal) {
  const { actor, actorReady, actorLoading } = useActorSafe();
  const { identity } = useInternetIdentity();

  const query = useQuery<Review[]>({
    queryKey: ['reviewsByTarget', targetId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Connection not available');
      try {
        return await withTimeout(
          actor.getReviewsByTarget(targetType, targetId),
          10000,
          'Loading reviews timed out after 10 seconds. Please retry.'
        );
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error));
      }
    },
    enabled: actorReady && !!identity,
    retry: 1,
    staleTime: 30000,
    placeholderData: (previousData) => previousData,
  });

  return {
    ...query,
    isLoading: actorLoading || (query.isLoading && !query.data),
  };
}

export function useGetAllReviews() {
  const { actor, actorReady, actorLoading } = useActorSafe();
  const { identity } = useInternetIdentity();

  const principalId = identity?.getPrincipal().toString() ?? 'anonymous';

  const query = useQuery<Review[]>({
    queryKey: ['allReviews', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Connection not available');
      try {
        return await withTimeout(
          actor.getAllReviews(),
          10000,
          'Loading reviews timed out after 10 seconds. Please retry.'
        );
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error));
      }
    },
    enabled: actorReady && !!identity,
    retry: 1,
    staleTime: 30000,
    placeholderData: (previousData) => previousData,
  });

  return {
    ...query,
    isLoading: actorLoading || (query.isLoading && !query.data),
  };
}
