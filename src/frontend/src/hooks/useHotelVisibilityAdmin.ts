import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActorSafe } from './useActorSafe';
import { useInternetIdentity } from './useInternetIdentity';
import { Principal } from '@dfinity/principal';
import type { AdminHotelVisibilityView, PersistentHotelVisibility } from '../backend';
import { withTimeout } from '../utils/withTimeout';

// Use the new combined admin query that returns hotels with principals and visibility
export function useAdminGetAllHotelVisibilityStats() {
  const { actor, actorReady, actorLoading } = useActorSafe();
  const { identity } = useInternetIdentity();

  const principalId = identity?.getPrincipal().toString() ?? 'anonymous';

  const query = useQuery<AdminHotelVisibilityView[]>({
    queryKey: ['adminHotelVisibilityStats', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      return withTimeout(
        actor.adminGetAllHotelVisibilityStats(),
        15000,
        'Hotel visibility stats fetch timed out after 15 seconds. Please retry.'
      );
    },
    enabled: actorReady && !!identity,
    retry: 1,
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
    throwOnError: false,
  });

  return {
    ...query,
    isLoading: actorLoading || (query.isLoading && !query.data),
    isFetching: query.isFetching,
  };
}

export function useSetHotelVisibility() {
  const { actor } = useActorSafe();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      hotel,
      isActive,
      isDummyHotel,
    }: {
      hotel: Principal;
      isActive: boolean;
      isDummyHotel: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return withTimeout(
        actor.setHotelVisibility(hotel, isActive, isDummyHotel),
        10000,
        'Hotel visibility update timed out. Please retry.'
      );
    },
    onSuccess: () => {
      // Invalidate all hotel-related queries
      queryClient.invalidateQueries({ queryKey: ['allHotels'] });
      queryClient.invalidateQueries({ queryKey: ['hotelsByCountry'] });
      queryClient.invalidateQueries({ queryKey: ['adminHotelVisibilityStats'] });
    },
  });
}

export function useSetHotelPaymentStatus() {
  const { actor } = useActorSafe();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      hotel,
      isPaid,
    }: {
      hotel: Principal;
      isPaid: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return withTimeout(
        actor.setHotelPaymentStatus(hotel, isPaid),
        10000,
        'Payment status update timed out. Please retry.'
      );
    },
    onSuccess: () => {
      // Invalidate all hotel-related queries
      queryClient.invalidateQueries({ queryKey: ['allHotels'] });
      queryClient.invalidateQueries({ queryKey: ['hotelsByCountry'] });
      queryClient.invalidateQueries({ queryKey: ['adminHotelVisibilityStats'] });
    },
  });
}
