import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActorSafe } from './useActorSafe';
import { useInternetIdentity } from './useInternetIdentity';
import type { BookingRequest, CreateBookingInput } from '../backend';
import { withTimeout } from '../utils/withTimeout';
import { getErrorMessage } from '../utils/getErrorMessage';

export function useCreateBooking(isTestingMode: boolean = false) {
  const { actor } = useActorSafe();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (input: CreateBookingInput) => {
      if (!actor) throw new Error('Connection not available. Please retry.');
      try {
        // Use testing-mode endpoint when testing mode is ON
        const bookingMethod = isTestingMode 
          ? actor.createBookingRequestWithTesting 
          : actor.createBookingRequest;
        
        return await withTimeout(
          bookingMethod(input),
          10000,
          'Booking creation timed out after 10 seconds. Please retry.'
        );
      } catch (error: unknown) {
        // Enhance error message for common booking failures
        const message = getErrorMessage(error);
        if (message.includes('not available for booking')) {
          const enhancedError = new Error('This hotel is not currently accepting bookings. It may be inactive or have an unpaid subscription.');
          throw enhancedError;
        } else if (message.includes('Invalid hotel')) {
          const enhancedError = new Error('Unable to create booking: Hotel information could not be verified. Please contact support.');
          throw enhancedError;
        } else if (message.includes('Invalid guest')) {
          const enhancedError = new Error('Unable to create booking: Guest authentication failed. Please log in again.');
          throw enhancedError;
        } else if (message.includes('testing mode may be off')) {
          const enhancedError = new Error('This hotel is only available in testing mode. Please enable testing mode to book.');
          throw enhancedError;
        } else if (message.includes('Invalid check-in date')) {
          const enhancedError = new Error('Check-in date must be at least tomorrow. Please select a future date.');
          throw enhancedError;
        } else if (message.includes('Invalid check-out date')) {
          const enhancedError = new Error('Check-out date must be after check-in date. Please adjust your dates.');
          throw enhancedError;
        }
        // Re-throw as Error instance with normalized message
        throw new Error(message);
      }
    },
    onSuccess: () => {
      const principalId = identity?.getPrincipal().toString() ?? 'anonymous';
      queryClient.invalidateQueries({ queryKey: ['guestBookings', principalId] });
      queryClient.invalidateQueries({ queryKey: ['guestPendingBookings', principalId] });
      queryClient.invalidateQueries({ queryKey: ['guestProcessingBookings', principalId] });
    },
  });
}

export function useGetGuestBookings() {
  const { actor, actorReady, actorLoading } = useActorSafe();
  const { identity } = useInternetIdentity();

  const principalId = identity?.getPrincipal().toString() ?? 'anonymous';

  const query = useQuery<BookingRequest[]>({
    queryKey: ['guestProcessingBookings', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Connection not available');
      try {
        return await withTimeout(
          actor.getCallerProcessingBookings(),
          10000,
          'Loading bookings timed out after 10 seconds. Please retry.'
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

export function useCancelBooking() {
  const { actor } = useActorSafe();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (bookingId: bigint) => {
      if (!actor) throw new Error('Connection not available. Please retry.');
      try {
        return await withTimeout(
          actor.cancelBooking(bookingId),
          10000,
          'Booking cancellation timed out after 10 seconds. Please retry.'
        );
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error));
      }
    },
    onSuccess: () => {
      const principalId = identity?.getPrincipal().toString() ?? 'anonymous';
      queryClient.invalidateQueries({ queryKey: ['guestBookings', principalId] });
      queryClient.invalidateQueries({ queryKey: ['guestPendingBookings', principalId] });
      queryClient.invalidateQueries({ queryKey: ['guestProcessingBookings', principalId] });
      queryClient.invalidateQueries({ queryKey: ['hotelBookings'] });
      queryClient.invalidateQueries({ queryKey: ['hotelPendingBookings'] });
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });
}

export function useGetHotelBookings() {
  const { actor, actorReady, actorLoading } = useActorSafe();
  const { identity } = useInternetIdentity();

  const principalId = identity?.getPrincipal().toString() ?? 'anonymous';

  const query = useQuery<BookingRequest[]>({
    queryKey: ['hotelPendingBookings', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Connection not available');
      try {
        return await withTimeout(
          actor.getHotelPendingBookings(),
          10000,
          'Loading hotel bookings timed out after 10 seconds. Please retry.'
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

export function useConfirmBooking() {
  const { actor } = useActorSafe();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: bigint) => {
      if (!actor) throw new Error('Connection not available. Please retry.');
      try {
        return await withTimeout(
          actor.confirmBooking(bookingId),
          10000,
          'Booking confirmation timed out after 10 seconds. Please retry.'
        );
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotelBookings'] });
      queryClient.invalidateQueries({ queryKey: ['hotelPendingBookings'] });
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });
}

export function useRejectBooking() {
  const { actor } = useActorSafe();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: bigint) => {
      if (!actor) throw new Error('Connection not available. Please retry.');
      try {
        return await withTimeout(
          actor.rejectBooking(bookingId),
          10000,
          'Booking rejection timed out after 10 seconds. Please retry.'
        );
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotelBookings'] });
      queryClient.invalidateQueries({ queryKey: ['hotelPendingBookings'] });
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });
}

export function useGetAllBookings() {
  const { actor, actorReady, actorLoading } = useActorSafe();
  const { identity } = useInternetIdentity();

  const principalId = identity?.getPrincipal().toString() ?? 'anonymous';

  const query = useQuery<BookingRequest[]>({
    queryKey: ['allBookings', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Connection not available');
      try {
        return await withTimeout(
          actor.getAllBookingRequests(),
          10000,
          'Loading all bookings timed out after 10 seconds. Please retry.'
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
