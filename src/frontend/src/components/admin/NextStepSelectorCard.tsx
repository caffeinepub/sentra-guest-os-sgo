import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useNextStep, NextStepOption } from '../../hooks/useNextStep';
import { Loader2, Rocket } from 'lucide-react';

const NEXT_STEP_OPTIONS: Array<{ value: NextStepOption; label: string; description: string }> = [
  {
    value: 'payment-integration',
    label: 'Payment Integration',
    description: 'Integrate automated payment processing (Stripe, PayPal API)',
  },
  {
    value: 'email-notifications',
    label: 'Email Notifications',
    description: 'Send booking confirmations and updates via email',
  },
  {
    value: 'advanced-booking',
    label: 'Advanced Booking Features',
    description: 'Room selection, pricing tiers, availability calendar',
  },
  {
    value: 'analytics-dashboard',
    label: 'Analytics Dashboard',
    description: 'Booking trends, revenue reports, occupancy metrics',
  },
  {
    value: 'none',
    label: 'No Priority',
    description: 'No specific feature prioritized at this time',
  },
];

export default function NextStepSelectorCard() {
  const { selectedStep, setSelectedStep, isLoading } = useNextStep();

  if (isLoading) {
    return (
      <Card id="next-step">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Next Step</CardTitle>
              <CardDescription>Loading roadmap selection...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="next-step">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
            <Rocket className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Next Step</CardTitle>
            <CardDescription>
              Select the feature you'd like to prioritize for development
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedStep}
          onValueChange={(value) => setSelectedStep(value as NextStepOption)}
          className="space-y-3"
        >
          {NEXT_STEP_OPTIONS.map((option) => (
            <div
              key={option.value}
              className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
            >
              <RadioGroupItem value={option.value} id={option.value} className="mt-0.5" />
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor={option.value}
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {option.label}
                </Label>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </div>
          ))}
        </RadioGroup>
        <p className="text-xs text-muted-foreground mt-4">
          Your selection is saved locally and persists across sessions.
        </p>
      </CardContent>
    </Card>
  );
}
