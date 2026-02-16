import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActorSafe } from './useActorSafe';
import { useInternetIdentity } from './useInternetIdentity';
import type { BookingRequest, CreateBookingInput } from '../backend';
import { withTimeout } from '../utils/withTimeout';
import { getErrorMessage } from '../utils/getErrorMessage';

export function useCreateBooking() {
  const { actor } = useActorSafe();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (input: CreateBookingInput) => {
      if (!actor) throw new Error('Connection not available. Please retry.');
      try {
        return await withTimeout(
          actor.createBookingRequest(input),
          10000,
          'Booking creation timed out after 10 seconds. Please retry.'
        );
      } catch (error: unknown) {
        // Enhance error message for common booking failures
        const message = getErrorMessage(error);
        
        // Testing mode errors
        if (message.includes('Testing mode required') || message.includes('testing mode')) {
          throw new Error('This hotel requires testing mode to be enabled. Testing mode is currently disabled on the backend.');
        }
        
        // Hotel availability errors
        if (message.includes('not available for booking') || message.includes('Unauthorized: This hotel')) {
          throw new Error('This hotel is not currently accepting bookings. It may be inactive, have an unpaid subscription, or be a test hotel.');
        }
        
        // Hotel not found
        if (message.includes('Hotel not found')) {
          throw new Error('Unable to create booking: The selected hotel could not be found. Please try again or contact support.');
        }
        
        // Unpaid hotel
        if (message.includes('Unpaid Hotel')) {
          throw new Error('This hotel has not yet paid the onboarding fee. Please contact support if you believe this is an error.');
        }
        
        // Inactive hotel
        if (message.includes('Inactive Hotel')) {
          throw new Error('This hotel has not yet been activated. Please contact support if you believe this is an error.');
        }
        
        // Date validation errors
        if (message.includes('Invalid check-in date')) {
          throw new Error('Check-in date must be at least tomorrow. Please select a future date.');
        }
        if (message.includes('Invalid stay period') || message.includes('Check-out date must be after')) {
          throw new Error('Check-out date must be after check-in date. Please adjust your dates.');
        }
        
        // Guest count validation
        if (message.includes('Invalid guests') || message.includes('Cannot create booking with 0 guests')) {
          throw new Error('At least 1 guest is required for a booking.');
        }
        
        // Re-throw with normalized message
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
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });
}

export function useCancelHotelBooking() {
  const { actor } = useActorSafe();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (bookingId: bigint) => {
      if (!actor) throw new Error('Connection not available. Please retry.');
      try {
        return await withTimeout(
          actor.cancelHotelBooking(bookingId),
          10000,
          'Booking cancellation timed out after 10 seconds. Please retry.'
        );
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error));
      }
    },
    onSuccess: () => {
      const principalId = identity?.getPrincipal().toString() ?? 'anonymous';
      queryClient.invalidateQueries({ queryKey: ['hotelBookings', principalId] });
      queryClient.invalidateQueries({ queryKey: ['guestProcessingBookings'] });
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });
}

export function useDeleteHotelBooking() {
  const { actor } = useActorSafe();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (bookingId: bigint) => {
      if (!actor) throw new Error('Connection not available. Please retry.');
      try {
        return await withTimeout(
          actor.deleteHotelBooking(bookingId),
          10000,
          'Booking deletion timed out after 10 seconds. Please retry.'
        );
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error));
      }
    },
    onSuccess: () => {
      const principalId = identity?.getPrincipal().toString() ?? 'anonymous';
      queryClient.invalidateQueries({ queryKey: ['hotelBookings', principalId] });
      queryClient.invalidateQueries({ queryKey: ['guestProcessingBookings'] });
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });
}

export function useGetHotelBookings() {
  const { actor, actorReady, actorLoading } = useActorSafe();
  const { identity } = useInternetIdentity();

  const principalId = identity?.getPrincipal().toString() ?? 'anonymous';

  const query = useQuery<BookingRequest[]>({
    queryKey: ['hotelBookings', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Connection not available');
      try {
        return await withTimeout(
          actor.getHotelBookings(),
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
  const { identity } = useInternetIdentity();

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
      const principalId = identity?.getPrincipal().toString() ?? 'anonymous';
      queryClient.invalidateQueries({ queryKey: ['hotelBookings', principalId] });
      queryClient.invalidateQueries({ queryKey: ['guestProcessingBookings'] });
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });
}

export function useRejectBooking() {
  const { actor } = useActorSafe();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

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
      const principalId = identity?.getPrincipal().toString() ?? 'anonymous';
      queryClient.invalidateQueries({ queryKey: ['hotelBookings', principalId] });
      queryClient.invalidateQueries({ queryKey: ['guestProcessingBookings'] });
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
