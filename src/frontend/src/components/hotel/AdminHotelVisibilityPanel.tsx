import { useState, useEffect, useRef } from 'react';
import { Principal } from '@dfinity/principal';
import type { AdminHotelVisibilityView } from '../../backend';
import { useAdminGetAllHotelVisibilityStats, useSetHotelVisibility, useSetHotelPaymentStatus } from '../../hooks/useHotelVisibilityAdmin';
import { useAdminRecoveryDiagnostics } from '../../hooks/useAdminRecoveryDiagnostics';
import { useActorSafe } from '../../hooks/useActorSafe';
import { PanelErrorBoundary } from '../common/PanelErrorBoundary';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Loader2,
  Eye,
  EyeOff,
  TestTube,
  Building2,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Clock,
  ChevronDown,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface HotelVisibilityControlProps {
  hotelView: AdminHotelVisibilityView;
}

function HotelVisibilityControl({ hotelView }: HotelVisibilityControlProps) {
  const setVisibility = useSetHotelVisibility();
  const setPaymentStatus = useSetHotelPaymentStatus();

  const { hotel, visibility } = hotelView;

  const handleToggleActive = async () => {
    try {
      await setVisibility.mutateAsync({
        hotel,
        isActive: !visibility.isActive,
        isDummyHotel: visibility.isDummyHotel,
      });
      toast.success(
        `Hotel ${!visibility.isActive ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleToggleDummy = async () => {
    try {
      await setVisibility.mutateAsync({
        hotel,
        isActive: visibility.isActive,
        isDummyHotel: !visibility.isDummyHotel,
      });
      toast.success(
        `Hotel ${!visibility.isDummyHotel ? 'marked as TEST' : 'unmarked as TEST'} successfully`
      );
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleTogglePaid = async () => {
    try {
      await setPaymentStatus.mutateAsync({
        hotel,
        isPaid: !visibility.isPaid,
      });
      toast.success(
        `Hotel payment status updated to ${!visibility.isPaid ? 'PAID' : 'UNPAID'}`
      );
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    }
  };

  const isActive = visibility.isActive;
  const isDummy = visibility.isDummyHotel;
  const isPaid = visibility.isPaid;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {isDummy && (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20">
            <TestTube className="h-3 w-3 mr-1" />
            TEST
          </Badge>
        )}
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? (
            <>
              <Eye className="h-3 w-3 mr-1" />
              Active
            </>
          ) : (
            <>
              <EyeOff className="h-3 w-3 mr-1" />
              Inactive
            </>
          )}
        </Badge>
        <Badge variant={isPaid ? 'default' : 'destructive'}>
          <DollarSign className="h-3 w-3 mr-1" />
          {isPaid ? 'Paid' : 'Unpaid'}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={isActive ? 'destructive' : 'default'}
          onClick={handleToggleActive}
          disabled={setVisibility.isPending}
        >
          {setVisibility.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : isActive ? (
            <EyeOff className="h-4 w-4 mr-2" />
          ) : (
            <Eye className="h-4 w-4 mr-2" />
          )}
          {isActive ? 'Deactivate' : 'Activate'}
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleToggleDummy}
          disabled={setVisibility.isPending}
        >
          {setVisibility.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <TestTube className="h-4 w-4 mr-2" />
          )}
          {isDummy ? 'Remove TEST' : 'Mark as TEST'}
        </Button>

        <Button
          size="sm"
          variant={isPaid ? 'outline' : 'default'}
          onClick={handleTogglePaid}
          disabled={setPaymentStatus.isPending}
        >
          {setPaymentStatus.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <DollarSign className="h-4 w-4 mr-2" />
          )}
          {isPaid ? 'Mark Unpaid' : 'Mark Paid'}
        </Button>
      </div>
    </div>
  );
}

function AdminHotelVisibilityPanelContent() {
  const { retry: retryActor } = useActorSafe();
  const { data: hotelViews, isLoading, isFetching, error, refetch } = useAdminGetAllHotelVisibilityStats();
  const { data: diagnostics, refetch: refetchDiagnostics } = useAdminRecoveryDiagnostics(false);

  // Timeout watchdog for hotels fetch
  const [fetchTimeout, setFetchTimeout] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  useEffect(() => {
    if (isLoading) {
      timeoutRef.current = setTimeout(() => {
        setFetchTimeout(true);
      }, 15000);
    } else {
      setFetchTimeout(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isLoading]);

  // Fetch diagnostics when error occurs
  useEffect(() => {
    if (error || fetchTimeout) {
      refetchDiagnostics();
    }
  }, [error, fetchTimeout, refetchDiagnostics]);

  const handleRetry = () => {
    setFetchTimeout(false);
    retryActor();
    setTimeout(() => refetch(), 500);
  };

  // Safe empty state
  const safeHotelViews = hotelViews ?? [];
  const hasData = safeHotelViews.length > 0;

  // Always render the Card wrapper to prevent unmounting
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hotel Visibility & Subscription Management</CardTitle>
        <CardDescription>
          Control which hotels are visible to guests and manage subscription status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timeout State */}
        {fetchTimeout && (
          <>
            <Alert variant="destructive">
              <Clock className="h-4 w-4" />
              <AlertTitle>Request Timeout</AlertTitle>
              <AlertDescription>
                Hotel visibility fetch timed out after 15 seconds. Please check your connection and retry.
              </AlertDescription>
            </Alert>

            {diagnostics && (
              <Collapsible open={showDiagnostics} onOpenChange={setShowDiagnostics}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between">
                    <span className="text-xs font-medium">Show diagnostics</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showDiagnostics ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle className="text-xs">Backend Diagnostics</AlertTitle>
                    <AlertDescription className="text-xs space-y-1">
                      <p><strong>Admin Status:</strong> {diagnostics.callerIsAdmin ? 'Confirmed' : 'Not Admin'}</p>
                      <p><strong>Access Control:</strong> {diagnostics.accessControlInitialized ? 'Initialized' : 'Not Initialized'}</p>
                      <p className="font-mono text-xs break-all"><strong>Principal:</strong> {diagnostics.caller.toString()}</p>
                    </AlertDescription>
                  </Alert>
                </CollapsibleContent>
              </Collapsible>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </>
        )}

        {/* Error State */}
        {!fetchTimeout && error && (
          <>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Failed to Load Hotels</AlertTitle>
              <AlertDescription>
                {getErrorMessage(error)}
              </AlertDescription>
            </Alert>

            {diagnostics && (
              <Collapsible open={showDiagnostics} onOpenChange={setShowDiagnostics}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between">
                    <span className="text-xs font-medium">Show diagnostics</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showDiagnostics ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle className="text-xs">Backend Diagnostics</AlertTitle>
                    <AlertDescription className="text-xs space-y-1">
                      <p><strong>Admin Status:</strong> {diagnostics.callerIsAdmin ? 'Confirmed' : 'Not Admin'}</p>
                      <p><strong>Access Control:</strong> {diagnostics.accessControlInitialized ? 'Initialized' : 'Not Initialized'}</p>
                      <p className="font-mono text-xs break-all"><strong>Principal:</strong> {diagnostics.caller.toString()}</p>
                    </AlertDescription>
                  </Alert>
                </CollapsibleContent>
              </Collapsible>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </>
        )}

        {/* Loading State (initial load only) */}
        {!fetchTimeout && !error && isLoading && !hasData && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Success State with Data */}
        {!fetchTimeout && !error && hasData && (
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>How it works</AlertTitle>
              <AlertDescription className="text-sm space-y-1">
                <p>
                  <strong>Active/Inactive:</strong> Only active hotels appear in guest browse. Deactivate to hide from guests.
                </p>
                <p>
                  <strong>TEST/DUMMY:</strong> Mark example hotels as TEST. TEST hotels are hidden from guests even if active.
                </p>
                <p>
                  <strong>Paid/Unpaid:</strong> Monthly subscription status. Unpaid hotels are hidden from guests and cannot be booked.
                </p>
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  All Hotels ({safeHotelViews.length})
                  {isFetching && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      <Loader2 className="inline h-3 w-3 animate-spin" /> Refreshing...
                    </span>
                  )}
                </h3>
              </div>
              <div className="space-y-3">
                {safeHotelViews.map((hotelView) => {
                  // Defensive rendering: handle missing fields
                  const hotelName = hotelView.profile?.name ?? 'Unknown Hotel';
                  const hotelCountry = hotelView.profile?.country ?? 'Unknown';
                  const hotelLogo = hotelView.profile?.logo;
                  const hotelPrincipal = hotelView.hotel.toString();

                  return (
                    <div
                      key={hotelPrincipal}
                      className="p-4 border rounded-lg bg-card space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        {hotelLogo ? (
                          <img
                            src={hotelLogo}
                            alt={`${hotelName} logo`}
                            className="h-12 w-12 rounded object-cover border flex-shrink-0"
                            onError={(e) => {
                              // Safe fallback on image load error
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling;
                              if (fallback) {
                                (fallback as HTMLElement).style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div 
                          className="h-12 w-12 rounded bg-muted flex items-center justify-center border flex-shrink-0"
                          style={{ display: hotelLogo ? 'none' : 'flex' }}
                        >
                          <Building2 className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{hotelName}</p>
                          <p className="text-sm text-muted-foreground">{hotelCountry}</p>
                          <p className="text-xs text-muted-foreground font-mono break-all mt-1">
                            {hotelPrincipal}
                          </p>
                        </div>
                      </div>
                      <HotelVisibilityControl hotelView={hotelView} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Empty State (no data after successful load) */}
        {!fetchTimeout && !error && !isLoading && !hasData && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Hotels Found</AlertTitle>
            <AlertDescription className="text-sm">
              No hotel profiles have been created yet. Hotels will appear here once they register.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminHotelVisibilityPanel() {
  const { retry: retryActor } = useActorSafe();
  
  return (
    <PanelErrorBoundary
      onRetry={() => {
        retryActor();
        setTimeout(() => window.location.reload(), 500);
      }}
    >
      <AdminHotelVisibilityPanelContent />
    </PanelErrorBoundary>
  );
}
