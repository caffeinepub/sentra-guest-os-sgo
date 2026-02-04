import { PaymentOption } from '../../backend';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PaymentInstructionsProps {
  paymentOption: PaymentOption;
  reference: string;
  amount: number;
}

const getInstructions = (option: PaymentOption) => {
  switch (option) {
    case PaymentOption.paypal:
      return {
        title: 'PayPal Payment Instructions',
        steps: [
          'Log in to your PayPal account',
          'Send payment to: lucky.jamaludin@gmail.com',
          'Enter the payment reference in the note/message field',
          'Complete the payment',
        ],
      };
    case PaymentOption.dana:
      return {
        title: 'DANA Payment Instructions',
        steps: [
          'Open your DANA app',
          'Select "Transfer" or "Send Money"',
          'Send to DANA number: 089639541438',
          'Enter the payment reference in the message field',
          'Complete the payment',
        ],
      };
    case PaymentOption.gopay:
      return {
        title: 'GoPay Payment Instructions',
        steps: [
          'Open your Gojek app',
          'Select "GoPay" then "Transfer"',
          'Send to GoPay number: 089639541438',
          'Enter the payment reference in the message field',
          'Complete the payment',
        ],
      };
  }
};

export default function PaymentInstructions({
  paymentOption,
  reference,
  amount,
}: PaymentInstructionsProps) {
  const instructions = getInstructions(paymentOption);

  const copyReference = () => {
    navigator.clipboard.writeText(reference);
    toast.success('Payment reference copied to clipboard');
  };

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Payment Pending</AlertTitle>
        <AlertDescription>
          Your payment request has been created. Please complete the payment using the instructions below.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>{instructions.title}</CardTitle>
          <CardDescription>
            Amount: <span className="font-semibold text-foreground">${amount}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 p-3 bg-muted rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Payment Reference</p>
                <p className="font-mono text-sm font-semibold break-all">{reference}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyReference}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Please include this reference in your payment to ensure proper processing.
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-medium text-sm">Steps:</p>
            <ol className="space-y-2">
              {instructions.steps.map((step, index) => (
                <li key={index} className="flex gap-3 text-sm">
                  <Badge variant="outline" className="shrink-0 h-6 w-6 rounded-full p-0 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>After Payment</AlertTitle>
            <AlertDescription>
              Your payment will be verified within 24 hours. You'll receive access to all hotel features once confirmed.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
