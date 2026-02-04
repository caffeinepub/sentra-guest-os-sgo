import { useGetCallerStayHistory } from '../../hooks/useStayHistory';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Hotel, Calendar, Clock, Info, RefreshCw, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function StayHistorySection() {
  const { data: stays, isLoading, error, refetch, isRefetching } = useGetCallerStayHistory();

  // Loading state - only show skeleton on initial load
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state with retry
  if (error) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertTitle>Error Loading Stay History</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>Failed to load stay history. Please try again.</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            {isRefetching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </>
            )}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (!stays || stays.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No stay history yet. Your hotel check-ins will appear here once recorded by hotels.
        </AlertDescription>
      </Alert>
    );
  }

  // List state - stays are already sorted in reverse chronological order by backend
  return (
    <div className="space-y-4">
      {isRefetching && (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
          <span className="text-xs text-muted-foreground">Refreshing...</span>
        </div>
      )}
      {stays.map((stay) => (
        <Card key={stay.id.toString()} className="hover:bg-muted/50 transition-colors">
          <CardContent className="pt-6">
            <div className="space-y-3">
              {/* Hotel Name */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0 mt-0.5">
                  <Hotel className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg truncate">
                    {stay.hotelName}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {stay.hotel.toString()}
                  </p>
                </div>
              </div>

              {/* Check-in Date */}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Check-in:</span>
                <span className="font-medium">
                  {format(new Date(Number(stay.checkInDate) / 1000000), 'PPP')}
                </span>
              </div>

              {/* Check-out Date (if available) */}
              {stay.checkOutDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Check-out:</span>
                  <span className="font-medium">
                    {format(new Date(Number(stay.checkOutDate) / 1000000), 'PPP')}
                  </span>
                </div>
              )}

              {/* Created At */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span>
                  Recorded on {format(new Date(Number(stay.createdAt) / 1000000), 'PPP')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
