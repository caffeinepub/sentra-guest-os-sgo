import { useState } from 'react';
import { useRestoreAdminAccess } from '../../hooks/useAdminReset';
import { useNavigate } from '@tanstack/react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldAlert, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetAdminAccessCard() {
  const [token, setToken] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const restoreAdmin = useRestoreAdminAccess();
  const navigate = useNavigate();

  const handleResetAdmin = async () => {
    if (!token.trim()) {
      toast.error('Please enter the admin token');
      return;
    }

    setErrorMessage(null);

    try {
      await restoreAdmin.mutateAsync(token.trim());
      toast.success('Admin access successfully restored to your account!');
      setIsDialogOpen(false);
      setToken('');
      
      // Navigate to Hotel Area to see admin panels
      setTimeout(() => {
        navigate({ to: '/hotel' });
      }, 1000);
    } catch (error: unknown) {
      console.error('Failed to restore admin access:', error);
      
      // Sanitize error message for display (remove any token echoes)
      let displayMessage = 'Failed to restore admin access';
      if (error instanceof Error) {
        let message = error.message;
        
        // Sanitize: replace any occurrence of the entered token with [redacted]
        if (token.trim()) {
          message = message.replace(new RegExp(token.trim(), 'g'), '[redacted]');
        }
        
        if (message.includes('already have admin') || message.includes('already admin')) {
          displayMessage = 'You already have admin privileges';
        } else if (message.includes('Unauthorized') || message.includes('Invalid') || message.includes('incorrect')) {
          displayMessage = 'Invalid admin token provided. Please check the token and try again.';
        } else {
          displayMessage = message;
        }
      }
      
      setErrorMessage(displayMessage);
      toast.error(displayMessage);
    }
  };

  return (
    <Card className="border-orange-500/50 bg-orange-500/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 flex-shrink-0">
            <ShieldAlert className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl">Reset Admin Access</CardTitle>
            <CardDescription className="text-sm">
              Restore admin privileges to your current account
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          If you've lost admin access or need to reassign admin privileges to your current Internet Identity, 
          you can reset it here using the admin token.
        </p>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="admin-token">Admin Token</Label>
          <Input
            id="admin-token"
            type="password"
            placeholder="Enter admin token"
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
              setErrorMessage(null); // Clear error when user types
            }}
            disabled={restoreAdmin.isPending}
          />
        </div>

        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button 
              className="w-full" 
              variant="default"
              disabled={!token.trim() || restoreAdmin.isPending}
            >
              {restoreAdmin.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Admin to This Account'
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Admin Reset</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  <strong>Warning:</strong> This action will reassign admin/owner privileges to your currently 
                  logged-in Internet Identity Principal.
                </p>
                <p>
                  After this reset, only your current account will have admin access to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Generate hotel invite tokens</li>
                  <li>Review and confirm payments</li>
                  <li>Access admin panels</li>
                </ul>
                <p className="font-semibold">
                  Are you sure you want to proceed?
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleResetAdmin}>
                Yes, Reset Admin Access
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
