import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActorSafe } from './useActorSafe';
import { useInternetIdentity } from './useInternetIdentity';
import type { PaymentRequest } from '../backend';
import { withTimeout } from '../utils/withTimeout';

export function useAdminPayments() {
  const { actor, actorReady, actorLoading } = useActorSafe();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const principalId = identity?.getPrincipal().toString() ?? 'anonymous';

  const allPayments = useQuery<PaymentRequest[]>({
    queryKey: ['allPaymentRequests', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return withTimeout(
        actor.getAllPaymentRequests(),
        10000,
        'Payment requests fetch timed out. Please retry.'
      );
    },
    enabled: actorReady && !!identity,
    retry: 1,
    staleTime: 30000,
  });

  const confirmPayment = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return withTimeout(
        actor.confirmPaymentRequest(id),
        10000,
        'Payment confirmation timed out. Please retry.'
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPaymentRequests'] });
      queryClient.invalidateQueries({ queryKey: ['paymentRequest'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionStatus'] });
    },
  });

  const rejectPayment = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return withTimeout(
        actor.rejectPaymentRequest(id),
        10000,
        'Payment rejection timed out. Please retry.'
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPaymentRequests'] });
      queryClient.invalidateQueries({ queryKey: ['paymentRequest'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionStatus'] });
    },
  });

  return {
    allPayments: {
      ...allPayments,
      isLoading: actorLoading || (allPayments.isLoading && !allPayments.data),
    },
    confirmPayment,
    rejectPayment,
  };
}
