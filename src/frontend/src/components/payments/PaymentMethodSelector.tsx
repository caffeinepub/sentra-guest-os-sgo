import { PaymentOption } from '../../backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard } from 'lucide-react';

interface PaymentMethodSelectorProps {
  value: PaymentOption | null;
  onChange: (value: PaymentOption) => void;
}

const paymentMethods = [
  {
    value: PaymentOption.paypal,
    label: 'PayPal',
    description: 'International payment via PayPal',
  },
  {
    value: PaymentOption.dana,
    label: 'DANA',
    description: 'Indonesian digital wallet',
  },
  {
    value: PaymentOption.gopay,
    label: 'GoPay',
    description: 'Indonesian digital wallet',
  },
];

export default function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Select Payment Method
        </CardTitle>
        <CardDescription>
          Choose your preferred payment method for the hotel subscription
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={value || ''}
          onValueChange={(val) => onChange(val as PaymentOption)}
        >
          <div className="grid gap-3">
            {paymentMethods.map((method) => (
              <div key={method.value} className="flex items-center space-x-3 space-y-0">
                <RadioGroupItem value={method.value} id={method.value} />
                <Label
                  htmlFor={method.value}
                  className="flex flex-col cursor-pointer flex-1"
                >
                  <span className="font-medium">{method.label}</span>
                  <span className="text-sm text-muted-foreground">{method.description}</span>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
