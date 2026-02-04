import { useState } from 'react';
import { useGetHotelProfile } from '../../hooks/useHotelProfile';
import { useI18n } from '../../i18n/I18nProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Copy, CheckCircle2, Mail, Info } from 'lucide-react';
import { toast } from 'sonner';

interface BookingPaymentInstructionsProps {
  bookingId: bigint;
  hotelName: string;
}

export default function BookingPaymentInstructions({
  bookingId,
  hotelName,
}: BookingPaymentInstructionsProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const bookingReference = `SGO-BOOKING-${bookingId.toString()}`;
  const paymentEmail = 'sentraguestos.info@gmail.com';

  const bookingDetails = `Booking Reference: ${bookingReference}
Hotel: ${hotelName}
Booking ID: ${bookingId.toString()}

Please include this reference in your payment email.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingDetails);
    setCopied(true);
    toast.success('Booking details copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <Alert className="border-blue-500/50 bg-blue-500/5">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-600 dark:text-blue-400">{t('payment.paymentInstructions')}</AlertTitle>
        <AlertDescription className="text-blue-600/80 dark:text-blue-400/80 text-sm">
          {t('payment.bookingSubmittedDesc')}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('payment.manualPayment')}</CardTitle>
          <CardDescription>{t('payment.sendConfirmation')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium">{t('payment.email')}:</span>
              <a
                href={`mailto:${paymentEmail}`}
                className="text-primary hover:underline break-all"
              >
                {paymentEmail}
              </a>
            </div>

            <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('payment.bookingDetails')}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8 gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      {t('payment.copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      {t('payment.copy')}
                    </>
                  )}
                </Button>
              </div>
              <pre className="text-xs whitespace-pre-wrap break-all font-mono bg-background p-2 rounded border">
                {bookingDetails}
              </pre>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-medium">{t('payment.stepsToComplete')}</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground pl-2">
              <li>{t('payment.step1')}</li>
              <li>{t('payment.step2')} {paymentEmail}</li>
              <li>{t('payment.step3')}</li>
              <li>{t('payment.step4')}</li>
            </ol>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {t('payment.viewStatus')}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
