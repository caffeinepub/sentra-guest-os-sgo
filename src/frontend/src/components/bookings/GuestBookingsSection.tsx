import { useNavigate } from '@tanstack/react-router';
import { useGetGuestBookings, useCancelBooking } from '../../hooks/useBookings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Hotel, Users, Loader2, AlertCircle, XCircle, Search, RefreshCw } from 'lucide-react';
import { BookingStatus } from '../../backend';
import { toast } from 'sonner';

const statusLabels: Record<BookingStatus, string> = {
  [BookingStatus.pending]: 'Pending',
  [BookingStatus.confirmed]: 'Confirmed',
  [BookingStatus.rejected]: 'Rejected',
  [BookingStatus.cancelled]: 'Cancelled',
};

const statusVariants: Record<BookingStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  [BookingStatus.pending]: 'secondary',
  [BookingStatus.confirmed]: 'default',
  [BookingStatus.rejected]: 'destructive',
  [BookingStatus.cancelled]: 'outline',
};

export default function GuestBookingsSection() {
  const navigate = useNavigate();
  const { data: bookings, isLoading, error, refetch, isFetching } = useGetGuestBookings();
  const cancelBooking = useCancelBooking();

  const handleCancel = async (bookingId: bigint) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await cancelBooking.mutateAsync(bookingId);
      toast.success('Booking cancelled successfully');
    } catch (error: any) {
      console.error('Failed to cancel booking:', error);
      toast.error(error.message || 'Failed to cancel booking');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
          <CardDescription>Your booking requests and their status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
          <CardDescription>Your booking requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load bookings</span>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>My Bookings</CardTitle>
            <CardDescription>Your booking requests and their status</CardDescription>
          </div>
          {!isLoading && bookings && bookings.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!bookings || bookings.length === 0 ? (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You haven't made any booking requests yet.
              </AlertDescription>
            </Alert>
            <Button
              variant="default"
              onClick={() => navigate({ to: '/browse' })}
              className="w-full sm:w-auto gap-2"
            >
              <Search className="h-4 w-4" />
              Browse Hotels & Make a Booking
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id.toString()} className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                        <Hotel className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base truncate">{booking.hotelName}</h3>
                        <Badge variant={statusVariants[booking.status]} className="mt-1">
                          {statusLabels[booking.status]}
                        </Badge>
                      </div>
                    </div>
                    {booking.status === BookingStatus.pending && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancelBooking.isPending}
                        className="flex-shrink-0"
                      >
                        {cancelBooking.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">Check-in:</span>
                      <span className="font-medium">
                        {new Date(Number(booking.checkInDate / BigInt(1000000))).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">Check-out:</span>
                      <span className="font-medium">
                        {new Date(Number(booking.checkOutDate / BigInt(1000000))).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">Guests:</span>
                      <span className="font-medium">{booking.guests.toString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Requested:</span>
                      <span>
                        {new Date(Number(booking.createdAt / BigInt(1000000))).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
