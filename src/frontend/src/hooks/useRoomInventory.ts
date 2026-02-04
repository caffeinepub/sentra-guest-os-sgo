import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActorSafe } from './useActorSafe';
import { useInternetIdentity } from './useInternetIdentity';
import type { RoomInventory } from '../backend';
import { withTimeout } from '../utils/withTimeout';
import { getErrorMessage } from '../utils/getErrorMessage';
import type { Principal } from '@icp-sdk/core/principal';

export function useUpdateRoomInventory() {
  const { actor } = useActorSafe();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async ({ hotelPrincipal, room }: { hotelPrincipal: Principal; room: RoomInventory }) => {
      if (!actor) throw new Error('Connection not available. Please retry.');
      try {
        return await withTimeout(
          actor.updateRoomInventory(hotelPrincipal, room),
          10000,
          'Room update timed out after 10 seconds. Please retry.'
        );
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error));
      }
    },
    onSuccess: () => {
      const principalId = identity?.getPrincipal().toString() ?? 'anonymous';
      queryClient.invalidateQueries({ queryKey: ['hotelProfile', principalId] });
      queryClient.invalidateQueries({ queryKey: ['allHotelsWithPrincipals'] });
      queryClient.invalidateQueries({ queryKey: ['allHotels'] });
    },
  });
}

export function useDeleteRoomInventory() {
  const { actor } = useActorSafe();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async ({ hotelPrincipal, roomType }: { hotelPrincipal: Principal; roomType: string }) => {
      if (!actor) throw new Error('Connection not available. Please retry.');
      try {
        return await withTimeout(
          actor.deleteRoomInventory(hotelPrincipal, roomType),
          10000,
          'Room deletion timed out after 10 seconds. Please retry.'
        );
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error));
      }
    },
    onSuccess: () => {
      const principalId = identity?.getPrincipal().toString() ?? 'anonymous';
      queryClient.invalidateQueries({ queryKey: ['hotelProfile', principalId] });
      queryClient.invalidateQueries({ queryKey: ['allHotelsWithPrincipals'] });
      queryClient.invalidateQueries({ queryKey: ['allHotels'] });
    },
  });
}
