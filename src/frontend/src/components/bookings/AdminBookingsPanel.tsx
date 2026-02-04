import { useGetAllBookings } from '../../hooks/useBookings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Users, AlertCircle, Hotel, RefreshCw } from 'lucide-react';
import { BookingStatus } from '../../backend';
import { getErrorMessage } from '../../utils/getErrorMessage';

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

export default function AdminBookingsPanel() {
  const { data: bookings, isLoading, error, refetch } = useGetAllBookings();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>System-wide booking requests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-24 w-full" />
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
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>System-wide booking requests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load bookings: {getErrorMessage(error)}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const pendingCount = bookings?.filter(b => b.status === BookingStatus.pending).length ?? 0;
  const confirmedCount = bookings?.filter(b => b.status === BookingStatus.confirmed).length ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Bookings</CardTitle>
        <CardDescription>
          {bookings?.length ?? 0} total bookings ({pendingCount} pending, {confirmedCount} confirmed)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!bookings || bookings.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No bookings in the system yet.</AlertDescription>
          </Alert>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {bookings.map((booking) => (
                <Card key={booking.id.toString()} className="overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                          <Hotel className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{booking.hotelName}</h3>
                          <p className="text-xs text-muted-foreground truncate">
                            ID: {booking.id.toString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={statusVariants[booking.status]} className="flex-shrink-0">
                        {statusLabels[booking.status]}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">In:</span>
                        <span className="font-medium truncate">
                          {new Date(Number(booking.checkInDate / BigInt(1000000))).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">Out:</span>
                        <span className="font-medium truncate">
                          {new Date(Number(booking.checkOutDate / BigInt(1000000))).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">Guests:</span>
                        <span className="font-medium">{booking.guests.toString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span>Created:</span>
                        <span className="truncate">
                          {new Date(Number(booking.createdAt / BigInt(1000000))).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground truncate">
                      Guest: {booking.guest.toString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
