import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActorSafe } from './useActorSafe';
import { useInternetIdentity } from './useInternetIdentity';
import type { HotelProfile } from '../backend';
import { withTimeout } from '../utils/withTimeout';

export function useGetHotelProfile() {
  const { actor, actorReady, actorLoading } = useActorSafe();
  const { identity } = useInternetIdentity();

  const principalId = identity?.getPrincipal().toString() ?? 'anonymous';

  const query = useQuery<HotelProfile | null>({
    queryKey: ['hotelProfile', principalId],
    queryFn: async () => {
      if (!actor || !identity) return null;
      return withTimeout(
        actor.getHotelProfile(identity.getPrincipal()),
        15000,
        'Hotel profile fetch timed out. Please retry.'
      );
    },
    enabled: actorReady && !!identity,
    retry: 2,
    staleTime: 30000,
    // Keep previous data during refetch to prevent blank states
    placeholderData: (previousData) => previousData,
  });

  return {
    ...query,
    // Only show loading on initial load, not during refetch
    isLoading: actorLoading || (query.isLoading && query.data === undefined),
    isFetched: actorReady && query.isFetched,
  };
}

export function useSaveHotelProfile() {
  const { actor } = useActorSafe();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (profile: HotelProfile) => {
      if (!actor) throw new Error('Actor not available');
      return withTimeout(
        actor.saveHotelProfile(profile),
        15000,
        'Hotel profile save timed out. Please retry.'
      );
    },
    onSuccess: (_, savedProfile) => {
      const principalId = identity?.getPrincipal().toString() ?? 'anonymous';
      
      // Optimistically update the cache with saved profile
      queryClient.setQueryData<HotelProfile | null>(
        ['hotelProfile', principalId],
        savedProfile
      );
      
      // Invalidate to refetch in background without clearing cache
      queryClient.invalidateQueries({ 
        queryKey: ['hotelProfile', principalId],
        refetchType: 'none' // Don't trigger immediate refetch, just mark as stale
      });
    },
    onError: (error) => {
      // On error, don't clear the cache - keep showing previous profile
      console.error('Profile save failed:', error);
    },
  });
}
