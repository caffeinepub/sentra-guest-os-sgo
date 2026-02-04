import { useState } from 'react';
import { useCreateBooking } from '../../hooks/useBookings';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActorSafe } from '../../hooks/useActorSafe';
import { useI18n } from '../../i18n/I18nProvider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar, Users, Loader2, CheckCircle2, AlertCircle, RefreshCw, BedDouble } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../utils/getErrorMessage';
import BookingPaymentInstructions from './BookingPaymentInstructions';
import BookingDatePickerField from './BookingDatePickerField';
import type { Principal } from '@icp-sdk/core/principal';
import type { RoomInventory } from '../../backend';

interface BookingRequestDialogProps {
  hotelName: string;
  hotelPrincipal: Principal;
  rooms: RoomInventory[];
  trigger?: React.ReactNode;
}

export default function BookingRequestDialog({
  hotelName,
  hotelPrincipal,
  rooms,
  trigger,
}: BookingRequestDialogProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState('2');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('');
  const [bookingId, setBookingId] = useState<bigint | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    checkInDate?: string;
    checkOutDate?: string;
    guests?: string;
    roomType?: string;
  }>({});

  const { identity } = useInternetIdentity();
  const { actorReady, actorError, retry: retryActor } = useActorSafe();
  const createBooking = useCreateBooking();

  const isAuthenticated = !!identity;

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};
    let isValid = true;

    if (!selectedRoomType) {
      errors.roomType = t('booking.roomRequired');
      isValid = false;
    }

    if (!checkInDate) {
      errors.checkInDate = 'Check-in date is required';
      isValid = false;
    } else {
      const tomorrow = new Date();
      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const checkIn = new Date(checkInDate);
      checkIn.setHours(0, 0, 0, 0);
      
      if (checkIn < tomorrow) {
        errors.checkInDate = 'Check-in date must be at least tomorrow';
        isValid = false;
      }
    }

    if (!checkOutDate) {
      errors.checkOutDate = 'Check-out date is required';
      isValid = false;
    } else if (checkInDate) {
      const checkIn = new Date(checkInDate);
      checkIn.setHours(0, 0, 0, 0);
      const checkOut = new Date(checkOutDate);
      checkOut.setHours(0, 0, 0, 0);
      if (checkOut <= checkIn) {
        errors.checkOutDate = 'Check-out date must be after check-in date';
        isValid = false;
      }
    }

    const guestCount = parseInt(guests);
    if (!guests || isNaN(guestCount) || guestCount < 1) {
      errors.guests = 'At least 1 guest is required';
      isValid = false;
    } else if (guestCount > 20) {
      errors.guests = 'Maximum 20 guests allowed';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    setValidationErrors({});

    if (!isAuthenticated) {
      toast.error('Please log in to create a booking request');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    if (!checkInDate || !checkOutDate) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    const checkInUTC = new Date(Date.UTC(
      checkInDate.getFullYear(),
      checkInDate.getMonth(),
      checkInDate.getDate(),
      0, 0, 0, 0
    ));
    const checkOutUTC = new Date(Date.UTC(
      checkOutDate.getFullYear(),
      checkOutDate.getMonth(),
      checkOutDate.getDate(),
      0, 0, 0, 0
    ));

    const checkIn = checkInUTC.getTime() * 1000000;
    const checkOut = checkOutUTC.getTime() * 1000000;

    try {
      const id = await createBooking.mutateAsync({
        guest: identity!.getPrincipal(),
        hotel: hotelPrincipal,
        room_type: selectedRoomType,
        checkInDate: BigInt(checkIn),
        checkOutDate: BigInt(checkOut),
        guests: BigInt(guests),
      });
      setBookingId(id);
      setShowInstructions(true);
      toast.success(`${t('booking.bookingSubmitted')}! ${t('booking.bookingId')}: ${id.toString()}`);
    } catch (error: unknown) {
      console.error('Failed to create booking:', error);
      
      let errorMessage: string;
      try {
        errorMessage = getErrorMessage(error);
      } catch (normalizationError) {
        console.error('Error normalization failed:', normalizationError);
        errorMessage = 'An unexpected error occurred. Please try again or contact support.';
      }
      
      setBookingError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setCheckInDate(undefined);
      setCheckOutDate(undefined);
      setGuests('2');
      setSelectedRoomType('');
      setBookingId(null);
      setShowInstructions(false);
      setBookingError(null);
      setValidationErrors({});
    }, 300);
  };

  const handleRetryConnection = async () => {
    setBookingError(null);
    await retryActor();
  };

  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const minCheckOutDate = checkInDate ? new Date(checkInDate.getTime() + 86400000) : new Date(tomorrow.getTime() + 86400000);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" size="sm">
            {t('booking.requestBooking')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        {showInstructions && bookingId !== null ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <DialogTitle>{t('booking.bookingSubmitted')}</DialogTitle>
                  <DialogDescription>
                    {t('booking.bookingId')}: {bookingId.toString()}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <BookingPaymentInstructions bookingId={bookingId} hotelName={hotelName} />
            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                {t('common.close')}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t('booking.requestBooking')} {hotelName}</DialogTitle>
              <DialogDescription>
                {t('booking.fillDetails')}
              </DialogDescription>
            </DialogHeader>

            {!isAuthenticated && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('booking.authRequired')}</AlertTitle>
                <AlertDescription>
                  {t('booking.mustLogin')}
                </AlertDescription>
              </Alert>
            )}

            {!actorReady && actorError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('booking.connectionError')}</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>{getErrorMessage(actorError)}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetryConnection}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    {t('booking.retryConnection')}
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {bookingError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('booking.bookingFailed')}</AlertTitle>
                <AlertDescription>{bookingError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomType" className="flex items-center gap-2">
                  <BedDouble className="h-4 w-4" />
                  {t('booking.roomType')} *
                </Label>
                <Select
                  value={selectedRoomType}
                  onValueChange={(value) => {
                    setSelectedRoomType(value);
                    setValidationErrors((prev) => ({ ...prev, roomType: undefined }));
                  }}
                  disabled={!isAuthenticated || !actorReady || rooms.length === 0}
                >
                  <SelectTrigger className={validationErrors.roomType ? 'border-destructive' : ''}>
                    <SelectValue placeholder={t('booking.selectRoom')} />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.roomType} value={room.roomType}>
                        {room.roomType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.roomType && (
                  <p className="text-sm text-destructive">{validationErrors.roomType}</p>
                )}
              </div>

              <BookingDatePickerField
                id="checkIn"
                label={t('booking.checkInDate')}
                value={checkInDate}
                onChange={(date) => {
                  setCheckInDate(date);
                  setValidationErrors((prev) => ({ ...prev, checkInDate: undefined }));
                }}
                disabled={!isAuthenticated || !actorReady}
                minDate={tomorrow}
                error={validationErrors.checkInDate}
                icon={<Calendar className="h-4 w-4" />}
              />

              <BookingDatePickerField
                id="checkOut"
                label={t('booking.checkOutDate')}
                value={checkOutDate}
                onChange={(date) => {
                  setCheckOutDate(date);
                  setValidationErrors((prev) => ({ ...prev, checkOutDate: undefined }));
                }}
                disabled={!isAuthenticated || !actorReady}
                minDate={minCheckOutDate}
                error={validationErrors.checkOutDate}
                icon={<Calendar className="h-4 w-4" />}
              />

              <div className="space-y-2">
                <Label htmlFor="guests" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t('booking.numberOfGuests')}
                </Label>
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  max="20"
                  value={guests}
                  onChange={(e) => {
                    setGuests(e.target.value);
                    setValidationErrors((prev) => ({ ...prev, guests: undefined }));
                  }}
                  required
                  disabled={!isAuthenticated || !actorReady}
                  className={validationErrors.guests ? 'border-destructive' : ''}
                />
                {validationErrors.guests && (
                  <p className="text-sm text-destructive">{validationErrors.guests}</p>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={createBooking.isPending}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={!isAuthenticated || !actorReady || createBooking.isPending}
                >
                  {createBooking.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('booking.submitting')}
                    </>
                  ) : (
                    t('booking.submitRequest')
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
