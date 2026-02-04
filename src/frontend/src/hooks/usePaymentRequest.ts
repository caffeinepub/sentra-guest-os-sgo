import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PaymentRequest, PaymentOption } from '../backend';

export function useCreatePaymentRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      amount,
      id,
      reference,
      option,
    }: {
      amount: bigint;
      id: string;
      reference: string;
      option: PaymentOption;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPaymentRequest(amount, id, reference, option);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentRequest'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionStatus'] });
    },
  });
}

export function useGetPaymentRequest(id: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PaymentRequest | null>({
    queryKey: ['paymentRequest', id],
    queryFn: async () => {
      if (!actor || !id) return null;
      try {
        return await actor.getPaymentRequest(id);
      } catch (error) {
        console.error('Failed to fetch payment request:', error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!id,
  });
}

export function useSubscriptionStatus() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<'unpaid' | 'pending' | 'active'>({
    queryKey: ['subscriptionStatus'],
    queryFn: async () => {
      if (!actor) return 'unpaid';
      
      try {
        const payments = await actor.getAllPaymentRequests();
        
        // Check if user has any confirmed payment
        const hasConfirmedPayment = payments.some(
          (p) => p.status === 'confirmed'
        );
        
        if (hasConfirmedPayment) return 'active';
        
        // Check if user has any pending payment
        const hasPendingPayment = payments.some(
          (p) => p.status === 'pending'
        );
        
        if (hasPendingPayment) return 'pending';
        
        return 'unpaid';
      } catch (error) {
        // If not admin, we can't see all payments, so check individual payment
        return 'unpaid';
      }
    },
    enabled: !!actor && !actorFetching,
  });
}
