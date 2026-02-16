import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetGuestBookings, useCancelBooking } from '../../hooks/useBookings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Calendar, Users, AlertCircle, Hotel, RefreshCw, Loader2, X } from 'lucide-react';
import { BookingStatus } from '../../backend';
import { useI18n } from '../../i18n/I18nProvider';
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
  const { t } = useI18n();
  const { data: bookings, isLoading, error, refetch, isFetching } = useGetGuestBookings();
  const cancelBooking = useCancelBooking();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<bigint | null>(null);

  const handleCancelClick = (bookingId: bigint) => {
    setSelectedBookingId(bookingId);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedBookingId) return;

    try {
      await cancelBooking.mutateAsync(selectedBookingId);
      toast.success('Booking cancelled successfully');
      setCancelDialogOpen(false);
      setSelectedBookingId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel booking');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('guestBookings.title')}</CardTitle>
          <CardDescription>{t('guestBookings.description')}</CardDescription>
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
          <CardTitle>{t('guestBookings.title')}</CardTitle>
          <CardDescription>{t('guestBookings.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : t('guestBookings.errorLoading')}
            </AlertDescription>
          </Alert>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('common.retry')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('guestBookings.title')}</CardTitle>
              <CardDescription>{t('guestBookings.description')}</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!bookings || bookings.length === 0 ? (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{t('guestBookings.noBookings')}</AlertDescription>
              </Alert>
              <Button
                onClick={() => navigate({ to: '/browse' })}
                className="w-full gap-2"
              >
                <Hotel className="h-4 w-4" />
                {t('guestBookings.browseHotels')}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => {
                const canCancel = booking.status === BookingStatus.pending;

                return (
                  <Card key={booking.id.toString()} className="overflow-hidden">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                            <Hotel className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">{booking.hotelName}</h3>
                            <p className="text-xs text-muted-foreground">
                              {t('guestBookings.roomType')}: {booking.room_type}
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
                          <span className="text-muted-foreground">{t('guestBookings.checkIn')}:</span>
                          <span className="font-medium truncate">
                            {new Date(Number(booking.checkInDate / BigInt(1000000))).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground">{t('guestBookings.checkOut')}:</span>
                          <span className="font-medium truncate">
                            {new Date(Number(booking.checkOutDate / BigInt(1000000))).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground">{t('guestBookings.guests')}:</span>
                          <span className="font-medium">{booking.guests.toString()}</span>
                        </div>
                      </div>

                      {canCancel && (
                        <div className="pt-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelClick(booking.id)}
                            disabled={cancelBooking.isPending}
                            className="w-full gap-2"
                          >
                            {cancelBooking.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <X className="h-4 w-4" />
                                Cancel Booking
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep Booking</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelConfirm}>
              Yes, Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
