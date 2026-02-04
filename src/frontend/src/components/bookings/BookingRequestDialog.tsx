import { useState } from 'react';
import { useCreateBooking } from '../../hooks/useBookings';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActorSafe } from '../../hooks/useActorSafe';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar, Users, Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../utils/getErrorMessage';
import BookingPaymentInstructions from './BookingPaymentInstructions';
import BookingDatePickerField from './BookingDatePickerField';
import type { Principal } from '@icp-sdk/core/principal';

interface BookingRequestDialogProps {
  hotelName: string;
  hotelPrincipal: Principal;
  isTestingMode?: boolean;
  trigger?: React.ReactNode;
}

export default function BookingRequestDialog({
  hotelName,
  hotelPrincipal,
  isTestingMode = false,
  trigger,
}: BookingRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState('2');
  const [bookingId, setBookingId] = useState<bigint | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    checkInDate?: string;
    checkOutDate?: string;
    guests?: string;
  }>({});

  const { identity } = useInternetIdentity();
  const { actorReady, actorError, retry: retryActor } = useActorSafe();
  const createBooking = useCreateBooking(isTestingMode);

  const isAuthenticated = !!identity;

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};
    let isValid = true;

    if (!checkInDate) {
      errors.checkInDate = 'Check-in date is required';
      isValid = false;
    } else {
      // Backend requires check-in to be in the future (at least tomorrow)
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

    // Convert dates to UTC midnight to avoid timezone issues
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
        checkInDate: BigInt(checkIn),
        checkOutDate: BigInt(checkOut),
        guests: BigInt(guests),
      });
      setBookingId(id);
      setShowInstructions(true);
      toast.success(`Booking request created! Reference ID: ${id.toString()}`);
    } catch (error: unknown) {
      console.error('Failed to create booking:', error);
      
      // Normalize error through getErrorMessage to ensure no internal runtime strings leak
      let errorMessage: string;
      try {
        errorMessage = getErrorMessage(error);
      } catch (normalizationError) {
        // If error normalization itself fails, use a safe fallback
        console.error('Error normalization failed:', normalizationError);
        errorMessage = 'An unexpected error occurred. Please try again or contact support.';
      }
      
      // Keep the dialog open and show the error inline
      setBookingError(errorMessage);
      toast.error(errorMessage);
      
      // Do NOT close the dialog or reset form state - let the user retry or edit inputs
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setCheckInDate(undefined);
      setCheckOutDate(undefined);
      setGuests('2');
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

  // Get tomorrow's date for minimum check-in validation
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get minimum checkout date (day after check-in)
  const minCheckOutDate = checkInDate ? new Date(checkInDate.getTime() + 86400000) : new Date(tomorrow.getTime() + 86400000);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" size="sm">
            Request Booking
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
                  <DialogTitle>Booking Request Submitted</DialogTitle>
                  <DialogDescription>
                    Booking ID: {bookingId.toString()}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <BookingPaymentInstructions bookingId={bookingId} hotelName={hotelName} />
            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Request Booking at {hotelName}</DialogTitle>
              <DialogDescription>
                Fill in your booking details. You'll receive payment instructions after submission.
              </DialogDescription>
            </DialogHeader>

            {!isAuthenticated && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Authentication Required</AlertTitle>
                <AlertDescription>
                  You must be logged in to create a booking request. Please log in and try again.
                </AlertDescription>
              </Alert>
            )}

            {!actorReady && actorError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>{getErrorMessage(actorError)}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetryConnection}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry Connection
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {bookingError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Booking Failed</AlertTitle>
                <AlertDescription>{bookingError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <BookingDatePickerField
                id="checkIn"
                label="Check-in Date"
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
                label="Check-out Date"
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
                  Number of Guests
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
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isAuthenticated || !actorReady || createBooking.isPending}
                >
                  {createBooking.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
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
