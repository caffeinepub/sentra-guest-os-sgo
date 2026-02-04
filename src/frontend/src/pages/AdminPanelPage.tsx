import { useEffect, useState, useRef } from 'react';
import RequireAuthenticated from '../components/auth/RequireAuthenticated';
import RequireActorReady from '../components/auth/RequireActorReady';
import RouteDiagnosticsErrorCard from '../components/diagnostics/RouteDiagnosticsErrorCard';
import AdminHotelInvitePanel from '../components/hotel/AdminHotelInvitePanel';
import AdminHotelVisibilityPanel from '../components/hotel/AdminHotelVisibilityPanel';
import AdminPaymentReviewPanel from '../components/payments/AdminPaymentReviewPanel';
import AdminBookingsPanel from '../components/bookings/AdminBookingsPanel';
import NextStepSelectorCard from '../components/admin/NextStepSelectorCard';
import { PanelErrorBoundary } from '../components/common/PanelErrorBoundary';
import { useIsAdmin } from '../hooks/useCurrentUser';
import { useActorSafe } from '../hooks/useActorSafe';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, Shield, Info } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { analyzeReplicaRejection } from '../utils/replicaRejection';

function AdminPanelContent() {
  const { actorReady, actorLoading, actorError, retry: retryActor } = useActorSafe();
  const { data: isAdmin, isLoading, isError, error, refetch, showAdminUI, lastKnownAdmin, isFailed } = useIsAdmin();
  
  // Bounded loading watchdog: force terminal state after 15 seconds
  const [watchdogExpired, setWatchdogExpired] = useState(false);
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Start watchdog when actor is ready and verification begins
  useEffect(() => {
    // Only start watchdog if actor is ready and we're in initial loading state
    if (actorReady && !actorError && isLoading && !showAdminUI) {
      // Clear any existing timer
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
      }
      
      // Start new timer
      watchdogTimerRef.current = setTimeout(() => {
        setWatchdogExpired(true);
      }, 15000); // 15 second hard limit
    }
    
    // Cleanup on unmount or when conditions change
    return () => {
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
    };
  }, [actorReady, actorError, isLoading, showAdminUI]);

  // Reset watchdog when verification completes successfully
  useEffect(() => {
    if (showAdminUI || !isLoading) {
      setWatchdogExpired(false);
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
    }
  }, [showAdminUI, isLoading]);

  // TERMINAL STATE 1: Watchdog expired - force diagnostics
  if (watchdogExpired && isLoading && !showAdminUI) {
    const handleRetry = () => {
      setWatchdogExpired(false);
      retryActor();
      setTimeout(() => refetch(), 500);
    };

    return (
      <RouteDiagnosticsErrorCard
        title="Admin Verification Timeout"
        description="Admin verification did not complete within the expected time"
        errorMessage="Admin verification timed out after 15 seconds. Please retry."
        onRetry={handleRetry}
      />
    );
  }

  // TERMINAL STATE 2: Loading (bounded by watchdog)
  if (isLoading && !showAdminUI) {
    return (
      <div className="container py-8 md:py-12">
        <div className="mx-auto max-w-6xl space-y-6 px-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  // TERMINAL STATE 3: Error - show diagnostics with retry
  if (isError && !showAdminUI) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const replicaInfo = analyzeReplicaRejection(errorMessage);
    
    const effectiveTitle = replicaInfo.isStoppedCanister 
      ? 'Backend Temporarily Unavailable'
      : 'Admin Verification Failed';
    const effectiveDescription = replicaInfo.isStoppedCanister
      ? 'Unable to verify admin status due to backend unavailability'
      : 'Could not verify admin status';
    
    const handleRetry = () => {
      retryActor();
      setTimeout(() => refetch(), 500);
    };

    return (
      <RouteDiagnosticsErrorCard
        title={effectiveTitle}
        description={effectiveDescription}
        errorMessage={errorMessage}
        onRetry={handleRetry}
      />
    );
  }

  // TERMINAL STATE 4: Access denied (non-admin)
  if (!showAdminUI && !lastKnownAdmin) {
    return (
      <div className="container py-8 md:py-12">
        <div className="mx-auto max-w-2xl space-y-6 px-4">
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-xl sm:text-2xl">Access Denied</CardTitle>
                  <CardDescription className="text-sm">
                    Admin privileges required
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You do not have admin privileges to access this panel. Only administrators can:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-2">
                <li>Generate hotel invite tokens</li>
                <li>Review and confirm payment requests</li>
                <li>Manage hotel registrations</li>
                <li>View and manage all bookings</li>
                <li>Control hotel visibility and subscription status</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                If you believe you should have admin access, please check your account status or contact support.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button asChild variant="default">
                  <Link to="/account">
                    View Account Status
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/">
                    Return to Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // TERMINAL STATE 5: Admin dashboard (with optional warning for transient verification failures)
  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-6xl space-y-6 md:space-y-8 px-4">
        {/* Non-blocking warning if verification failed but we have lastKnownAdmin */}
        {lastKnownAdmin && isFailed && (
          <Alert className="border-amber-500/50 bg-amber-500/5">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-600 dark:text-amber-400">
              Verification Warning
            </AlertTitle>
            <AlertDescription className="text-xs text-amber-600/80 dark:text-amber-400/80 space-y-2">
              <p>
                Admin verification encountered an issue, but you were previously verified as admin. 
                The admin panel remains accessible.
              </p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                className="mt-2 h-7 text-xs"
              >
                Retry Verification
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Admin Panel</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage hotel invites, visibility, payments, and bookings
              </p>
            </div>
          </div>
        </div>

        {/* Admin Panels - Each wrapped with PanelErrorBoundary for isolation */}
        <div className="space-y-6">
          <PanelErrorBoundary
            onRetry={() => {
              retryActor();
              setTimeout(() => window.location.reload(), 500);
            }}
          >
            <NextStepSelectorCard />
          </PanelErrorBoundary>

          <PanelErrorBoundary
            onRetry={() => {
              retryActor();
              setTimeout(() => window.location.reload(), 500);
            }}
          >
            <AdminHotelInvitePanel />
          </PanelErrorBoundary>

          <PanelErrorBoundary
            onRetry={() => {
              retryActor();
              setTimeout(() => refetch(), 500);
            }}
          >
            <AdminHotelVisibilityPanel />
          </PanelErrorBoundary>

          <PanelErrorBoundary
            onRetry={() => {
              retryActor();
              setTimeout(() => window.location.reload(), 500);
            }}
          >
            <AdminPaymentReviewPanel />
          </PanelErrorBoundary>

          <PanelErrorBoundary
            onRetry={() => {
              retryActor();
              setTimeout(() => window.location.reload(), 500);
            }}
          >
            <AdminBookingsPanel />
          </PanelErrorBoundary>
        </div>
      </div>
    </div>
  );
}

export default function AdminPanelPage() {
  return (
    <RequireAuthenticated>
      <RequireActorReady loadingMessage="Verifying admin access...">
        <AdminPanelContent />
      </RequireActorReady>
    </RequireAuthenticated>
  );
}
