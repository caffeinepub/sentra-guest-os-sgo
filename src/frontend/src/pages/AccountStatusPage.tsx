import RequireAuthenticated from '../components/auth/RequireAuthenticated';
import RequireActorReady from '../components/auth/RequireActorReady';
import AccountStatusPanel from '../components/account/AccountStatusPanel';
import AdminRecoveryReveal from '../components/account/AdminRecoveryReveal';
import TroubleshootingSection from '../components/account/TroubleshootingSection';
import PrePublishGateCard from '../components/account/PrePublishGateCard';
import PublishingDeploymentHelpSection from '../components/account/PublishingDeploymentHelpSection';
import { useAccountStatus } from '../hooks/useAccountStatus';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';
import { useEffect } from 'react';
import { useLocation, Link } from '@tanstack/react-router';

function AccountStatusContent() {
  const { data: accountStatus } = useAccountStatus();
  const isAdmin = accountStatus?.callerIsAdmin ?? false;
  const location = useLocation();

  // Scroll to hash target on mount or hash change
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location.hash]);

  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-4xl space-y-6 md:space-y-8 px-4">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold">Account Status</h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            View your account details and troubleshooting tools
          </p>
        </div>

        {/* Account Status Panel - Always visible */}
        <AccountStatusPanel />

        {/* Publishing & Deployment Help - Always visible for authenticated users */}
        <Separator />
        <PublishingDeploymentHelpSection />

        {/* Admin-only sections */}
        {isAdmin && (
          <>
            <Separator />
            
            {/* Admin Next Step Link */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">Roadmap Planning</h2>
                <p className="text-sm text-muted-foreground">
                  Select the next feature to prioritize for development
                </p>
              </div>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link to="/admin" hash="next-step">
                  <Rocket className="h-4 w-4 mr-2" />
                  Go to Next Step Selector
                </Link>
              </Button>
            </div>

            <Separator />
            
            {/* Admin Recovery */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">Admin Recovery</h2>
                <p className="text-sm text-muted-foreground">
                  Reset admin access if needed
                </p>
              </div>
              <AdminRecoveryReveal />
            </div>

            <Separator />

            {/* Pre-Publish Gate */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">Pre-Publish Checklist</h2>
                <p className="text-sm text-muted-foreground">
                  Complete before deploying changes to production
                </p>
              </div>
              <PrePublishGateCard />
            </div>

            <Separator />

            {/* Troubleshooting */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">Troubleshooting</h2>
                <p className="text-sm text-muted-foreground">
                  Advanced actions for debugging issues
                </p>
              </div>
              <TroubleshootingSection />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AccountStatusPage() {
  return (
    <RequireAuthenticated>
      <RequireActorReady loadingMessage="Loading account status...">
        <AccountStatusContent />
      </RequireActorReady>
    </RequireAuthenticated>
  );
}
