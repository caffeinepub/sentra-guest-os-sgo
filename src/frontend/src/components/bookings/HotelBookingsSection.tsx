import { useState } from 'react';
import { useGetHotelBookings, useConfirmBooking, useRejectBooking, useCancelHotelBooking, useDeleteHotelBooking } from '../../hooks/useBookings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Calendar, Users, AlertCircle, Hotel, RefreshCw, Check, X, Trash2, Loader2 } from 'lucide-react';
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

type ActionType = 'cancel' | 'delete' | null;

export default function HotelBookingsSection() {
  const { t } = useI18n();
  const { data: bookings, isLoading, error, refetch, isFetching } = useGetHotelBookings();
  const confirmBooking = useConfirmBooking();
  const rejectBooking = useRejectBooking();
  const cancelBooking = useCancelHotelBooking();
  const deleteBooking = useDeleteHotelBooking();

  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<bigint | null>(null);
  const [actionType, setActionType] = useState<ActionType>(null);

  const handleActionClick = (bookingId: bigint, type: ActionType) => {
    setSelectedBookingId(bookingId);
    setActionType(type);
    setActionDialogOpen(true);
  };

  const handleActionConfirm = async () => {
    if (!selectedBookingId || !actionType) return;

    try {
      if (actionType === 'cancel') {
        await cancelBooking.mutateAsync(selectedBookingId);
        toast.success('Booking cancelled successfully');
      } else if (actionType === 'delete') {
        await deleteBooking.mutateAsync(selectedBookingId);
        toast.success('Booking deleted successfully');
      }
      setActionDialogOpen(false);
      setSelectedBookingId(null);
      setActionType(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${actionType} booking`);
    }
  };

  const handleConfirm = async (bookingId: bigint) => {
    try {
      await confirmBooking.mutateAsync(bookingId);
      toast.success('Booking confirmed successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to confirm booking');
    }
  };

  const handleReject = async (bookingId: bigint) => {
    try {
      await rejectBooking.mutateAsync(bookingId);
      toast.success('Booking rejected successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reject booking');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('hotelBookings.title')}</CardTitle>
          <CardDescription>{t('hotelBookings.description')}</CardDescription>
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
          <CardTitle>{t('hotelBookings.title')}</CardTitle>
          <CardDescription>{t('hotelBookings.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : t('hotelBookings.errorLoading')}
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

  const pendingCount = bookings?.filter(b => b.status === BookingStatus.pending).length ?? 0;
  const confirmedCount = bookings?.filter(b => b.status === BookingStatus.confirmed).length ?? 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('hotelBookings.title')}</CardTitle>
              <CardDescription>
                {bookings?.length ?? 0} total bookings ({pendingCount} pending, {confirmedCount} confirmed)
              </CardDescription>
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
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No bookings yet. All bookings will appear here.</AlertDescription>
            </Alert>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {bookings.map((booking) => {
                  const isPending = booking.status === BookingStatus.pending;

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
                            <span>Room:</span>
                            <span className="truncate">{booking.room_type}</span>
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground truncate">
                          Guest: {booking.guest.toString()}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(Number(booking.createdAt / BigInt(1000000))).toLocaleDateString()}
                        </div>

                        {isPending && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleConfirm(booking.id)}
                              disabled={confirmBooking.isPending}
                              className="flex-1 gap-2"
                            >
                              {confirmBooking.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                              Confirm
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleReject(booking.id)}
                              disabled={rejectBooking.isPending}
                              className="flex-1 gap-2"
                            >
                              {rejectBooking.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                              Reject
                            </Button>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleActionClick(booking.id, 'cancel')}
                            disabled={cancelBooking.isPending}
                            className="flex-1 gap-2"
                          >
                            {cancelBooking.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleActionClick(booking.id, 'delete')}
                            disabled={deleteBooking.isPending}
                            className="flex-1 gap-2"
                          >
                            {deleteBooking.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'cancel' ? 'Cancel Booking' : 'Delete Booking'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'cancel'
                ? 'Are you sure you want to cancel this booking? The guest will be notified.'
                : 'Are you sure you want to delete this booking? This action cannot be undone and will permanently remove the booking from the system.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep Booking</AlertDialogCancel>
            <AlertDialogAction onClick={handleActionConfirm}>
              {actionType === 'cancel' ? 'Yes, Cancel Booking' : 'Yes, Delete Booking'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
