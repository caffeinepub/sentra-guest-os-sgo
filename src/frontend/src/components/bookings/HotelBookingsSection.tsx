import { useGetHotelBookings, useConfirmBooking, useRejectBooking } from '../../hooks/useBookings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Users, Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
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

export default function HotelBookingsSection() {
  const { data: bookings, isLoading, error, refetch } = useGetHotelBookings();
  const confirmBooking = useConfirmBooking();
  const rejectBooking = useRejectBooking();

  const handleConfirm = async (bookingId: bigint) => {
    try {
      await confirmBooking.mutateAsync(bookingId);
      toast.success('Booking confirmed successfully');
    } catch (error: any) {
      console.error('Failed to confirm booking:', error);
      toast.error(error.message || 'Failed to confirm booking');
    }
  };

  const handleReject = async (bookingId: bigint) => {
    if (!confirm('Are you sure you want to reject this booking?')) {
      return;
    }

    try {
      await rejectBooking.mutateAsync(bookingId);
      toast.success('Booking rejected');
    } catch (error: any) {
      console.error('Failed to reject booking:', error);
      toast.error(error.message || 'Failed to reject booking');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking Requests</CardTitle>
          <CardDescription>Manage incoming booking requests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking Requests</CardTitle>
          <CardDescription>Manage incoming booking requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load booking requests</span>
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
        <CardTitle>Booking Requests</CardTitle>
        <CardDescription>Manage incoming booking requests for your hotel</CardDescription>
      </CardHeader>
      <CardContent>
        {!bookings || bookings.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No pending booking requests at the moment.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id.toString()} className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-base">Booking #{booking.id.toString()}</h3>
                        <Badge variant={statusVariants[booking.status]}>
                          {statusLabels[booking.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        Guest: {booking.guest.toString().slice(0, 20)}...
                      </p>
                    </div>
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

                  {booking.status === BookingStatus.pending && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleConfirm(booking.id)}
                        disabled={confirmBooking.isPending || rejectBooking.isPending}
                        className="flex-1 gap-2"
                      >
                        {confirmBooking.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Confirming...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Confirm
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(booking.id)}
                        disabled={confirmBooking.isPending || rejectBooking.isPending}
                        className="flex-1 gap-2"
                      >
                        {rejectBooking.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Rejecting...
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4" />
                            Reject
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
