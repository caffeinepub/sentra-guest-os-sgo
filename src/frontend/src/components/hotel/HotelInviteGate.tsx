import { useState } from 'react';
import { useConsumeInviteToken } from '../../hooks/useHotelInvites';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Lock, Mail, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface HotelInviteGateProps {
  onSuccess?: () => void;
}

export default function HotelInviteGate({ onSuccess }: HotelInviteGateProps) {
  const [token, setToken] = useState('');
  const consumeToken = useConsumeInviteToken();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token.trim()) {
      toast.error('Please enter an invite token');
      return;
    }

    try {
      await consumeToken.mutateAsync(token.trim());
      toast.success('Invite token accepted! You now have access to the Hotel Area.');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Failed to consume invite token:', error);
      toast.error('Invalid or already used invite token. Please check and try again.');
    }
  };

  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-lg space-y-6 px-4">
        <Card>
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">Hotel Area Access Required</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              This area is restricted to invited hotels only. Please enter your invite token to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertTitle>Need an invite?</AlertTitle>
              <AlertDescription className="text-sm">
                To register your hotel, please contact us at{' '}
                <a
                  href="mailto:sentraguestos.info@gmail.com"
                  className="font-medium text-primary hover:underline"
                >
                  sentraguestos.info@gmail.com
                </a>
                {' '}to request an invite token.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Invite Token</Label>
                <Input
                  id="token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter your invite token"
                  disabled={consumeToken.isPending}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the invite token you received via email
                </p>
              </div>

              <Button
                type="submit"
                disabled={!token.trim() || consumeToken.isPending}
                className="w-full"
                size="lg"
              >
                {consumeToken.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Submit Token
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
