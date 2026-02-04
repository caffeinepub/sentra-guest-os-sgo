import { useState } from 'react';
import { useCreateStayRecord } from '../../hooks/useStayHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';

export default function RecordStayCard() {
  const [guestPrincipal, setGuestPrincipal] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [validationError, setValidationError] = useState('');

  const createStay = useCreateStayRecord();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Client-side validation: Guest Principal ID is required
    if (!guestPrincipal.trim()) {
      setValidationError('Guest Principal ID is required');
      return;
    }

    // Validate Principal ID format
    let guestPrincipalObj: Principal;
    try {
      guestPrincipalObj = Principal.fromText(guestPrincipal.trim());
    } catch (error) {
      setValidationError('Invalid Principal ID format');
      return;
    }

    // Validate check-in date is required
    if (!checkInDate) {
      setValidationError('Check-in date is required');
      return;
    }

    try {
      // Convert dates to nanoseconds (Time type in backend)
      const checkInTime = BigInt(new Date(checkInDate).getTime() * 1000000);
      const checkOutTime = checkOutDate
        ? BigInt(new Date(checkOutDate).getTime() * 1000000)
        : undefined;

      // Note: hotel and hotelName will be set by the backend based on caller
      await createStay.mutateAsync({
        guest: guestPrincipalObj,
        hotel: guestPrincipalObj, // Placeholder, backend will override
        hotelName: '', // Placeholder, backend will override
        checkInDate: checkInTime,
        checkOutDate: checkOutTime,
      });

      toast.success('Stay record created successfully');
      
      // Reset form
      setGuestPrincipal('');
      setCheckInDate('');
      setCheckOutDate('');
    } catch (error: any) {
      console.error('Failed to create stay record:', error);
      const errorMessage = error?.message || 'Failed to create stay record';
      toast.error(errorMessage);
      setValidationError(errorMessage);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl">Record Guest Stay</CardTitle>
            <CardDescription className="text-sm">
              Create a stay record for a guest who checked in at your hotel
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Guest Principal ID */}
          <div className="space-y-2">
            <Label htmlFor="guestPrincipal">
              Guest Principal ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="guestPrincipal"
              type="text"
              placeholder="Enter guest's Internet Identity Principal ID"
              value={guestPrincipal}
              onChange={(e) => {
                setGuestPrincipal(e.target.value);
                setValidationError('');
              }}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              The guest's Internet Identity Principal ID (starts with a letter, contains hyphens)
            </p>
          </div>

          {/* Check-in Date */}
          <div className="space-y-2">
            <Label htmlFor="checkInDate">
              Check-in Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="checkInDate"
              type="date"
              value={checkInDate}
              onChange={(e) => {
                setCheckInDate(e.target.value);
                setValidationError('');
              }}
            />
          </div>

          {/* Check-out Date (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="checkOutDate">Check-out Date (Optional)</Label>
            <Input
              id="checkOutDate"
              type="date"
              value={checkOutDate}
              onChange={(e) => {
                setCheckOutDate(e.target.value);
                setValidationError('');
              }}
              min={checkInDate}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty if the guest is still checked in
            </p>
          </div>

          {/* Validation Error */}
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {createStay.isSuccess && !validationError && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-600 dark:text-green-400">
                Stay record created successfully! The guest can now view this stay in their history.
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={createStay.isPending} className="w-full">
            {createStay.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Stay Record...
              </>
            ) : (
              'Create Stay Record'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
