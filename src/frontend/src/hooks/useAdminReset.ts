import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useRestoreAdminAccess() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userProvidedToken: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.restoreAdminAccess(userProvidedToken);
    },
    onSuccess: () => {
      // Invalidate all admin-related queries to refresh UI state
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['inviteTokens'] });
      queryClient.invalidateQueries({ queryKey: ['paymentRequests'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerInvited'] });
      
      // CRITICAL: Invalidate accountStatus query (used by AccountStatusPanel)
      queryClient.invalidateQueries({ queryKey: ['accountStatus'] });
      
      // CRITICAL: Invalidate diagnostics query (used by AccountStatusPanel debug section)
      queryClient.invalidateQueries({ queryKey: ['adminRecoveryDiagnostics'] });
      
      // Refetch immediately to update UI
      queryClient.refetchQueries({ queryKey: ['isAdmin'] });
      queryClient.refetchQueries({ queryKey: ['accountStatus'] });
      queryClient.refetchQueries({ queryKey: ['adminRecoveryDiagnostics'] });
    },
  });
}
