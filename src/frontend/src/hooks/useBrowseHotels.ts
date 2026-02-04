import { useQuery } from '@tanstack/react-query';
import { useActorSafe } from './useActorSafe';
import type { HotelProfile, HotelProfileWithPrincipal } from '../backend';

// NOTE: This hook is guest-facing and now uses useActorSafe for health-verified actor initialization.
// Admin panels should use admin-specific hooks from useHotelVisibilityAdmin.ts
// that use useActorSafe with timeout protection.

export function useGetAllHotelsWithPrincipals(effectiveTestingMode: boolean = false) {
  const { actor, actorLoading, actorError } = useActorSafe();

  const query = useQuery<HotelProfileWithPrincipal[]>({
    queryKey: ['allHotelsWithPrincipals', effectiveTestingMode],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.getAllHotelsWithPrincipals();
    },
    enabled: !!actor && !actorLoading,
    retry: 2,
    retryDelay: 1000,
  });

  // If actor initialization failed, propagate that error
  if (actorError && !query.error) {
    return {
      ...query,
      error: actorError,
      isError: true,
      isLoading: false,
    };
  }

  return {
    ...query,
    isLoading: actorLoading || query.isLoading,
  };
}

export function useGetAllHotels(effectiveTestingMode: boolean = false) {
  const { actor, actorLoading, actorError } = useActorSafe();

  const query = useQuery<HotelProfile[]>({
    queryKey: ['allHotels', effectiveTestingMode],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // Fetch with principals and extract profiles for backward compatibility
      const hotelsWithPrincipals = await actor.getAllHotelsWithPrincipals();
      return hotelsWithPrincipals.map(h => h.profile);
    },
    enabled: !!actor && !actorLoading,
    retry: 2,
    retryDelay: 1000,
  });

  // If actor initialization failed, propagate that error
  if (actorError && !query.error) {
    return {
      ...query,
      error: actorError,
      isError: true,
      isLoading: false,
    };
  }

  return {
    ...query,
    isLoading: actorLoading || query.isLoading,
  };
}

export function useGetHotelsByCountry(country: string, effectiveTestingMode: boolean = false) {
  const { actor, actorLoading, actorError } = useActorSafe();

  const query = useQuery<HotelProfile[]>({
    queryKey: ['hotelsByCountry', country, effectiveTestingMode],
    queryFn: async () => {
      if (!actor || !country) return [];
      return await actor.getHotelsByCountry(country);
    },
    enabled: !!actor && !actorLoading && !!country,
    retry: 2,
    retryDelay: 1000,
  });

  // If actor initialization failed, propagate that error
  if (actorError && !query.error) {
    return {
      ...query,
      error: actorError,
      isError: true,
      isLoading: false,
    };
  }

  return {
    ...query,
    isLoading: actorLoading || query.isLoading,
  };
}
