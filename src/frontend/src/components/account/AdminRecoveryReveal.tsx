import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';
import ResetAdminAccessCard from '../admin/ResetAdminAccessCard';

export default function AdminRecoveryReveal() {
  // This component is now only rendered for admins (gated at page level)
  // Show the reset card directly without any reveal mechanism
  return (
    <Card className="border-orange-500/50 bg-orange-500/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 flex-shrink-0">
            <ShieldAlert className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg sm:text-xl">Admin Recovery</CardTitle>
            <CardDescription className="text-sm">
              Reset admin access to your current Internet Identity
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you've lost admin access or need to reassign admin privileges to your current Internet Identity, 
            you can reset it here using the admin recovery token.
          </p>
          <ResetAdminAccessCard />
        </div>
      </CardContent>
    </Card>
  );
}
