import { useIsCallerInvited } from './useHotelInvites';
import { useIsAdmin } from './useCurrentUser';
import { useInternetIdentity } from './useInternetIdentity';

/**
 * Unified hook for determining Hotel Area access.
 * Returns stable signals for navigation and CTA rendering.
 */
export function useHotelAccess() {
  const { identity } = useInternetIdentity();
  const { data: isInvited, isLoading: inviteLoading, isError: inviteError } = useIsCallerInvited();
  const { data: isAdmin, isLoading: adminLoading, isError: adminError } = useIsAdmin();

  const isAuthenticated = !!identity;

  // User can access Hotel Area if they are invited OR admin
  const canAccessHotelArea = isAuthenticated && (isInvited === true || isAdmin === true);

  // Show CTA/navigation only when status is resolved and access is granted
  const showHotelAreaCTA = canAccessHotelArea;

  // Status is resolved when both checks are complete (or failed)
  const isResolved = !inviteLoading && !adminLoading;

  // Loading state
  const isLoading = inviteLoading || adminLoading;

  // Error state
  const hasError = inviteError || adminError;

  return {
    canAccessHotelArea,
    showHotelAreaCTA,
    isResolved,
    isLoading,
    hasError,
    isAuthenticated,
  };
}
