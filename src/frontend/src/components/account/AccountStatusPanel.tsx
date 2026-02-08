import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useAccountStatus } from '../../hooks/useAccountStatus';
import { useAdminRecoveryDiagnostics } from '../../hooks/useAdminRecoveryDiagnostics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Copy, User, Shield, Key, CheckCircle, XCircle, Loader2, RefreshCw, ChevronDown, Bug, Code } from 'lucide-react';
import { toast } from 'sonner';
import { buildInfo } from '../../buildInfo';

export default function AccountStatusPanel() {
  const { identity } = useInternetIdentity();
  const { data: accountStatus, isLoading, error, refetch, isFetching } = useAccountStatus();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  
  // Only fetch diagnostics when advanced section is opened AND user is admin
  const isAdmin = accountStatus?.callerIsAdmin === true;
  const shouldFetchDiagnostics = advancedOpen && isAdmin;
  const { data: diagnostics, refetch: refetchDiagnostics, isFetching: diagnosticsFetching } = useAdminRecoveryDiagnostics(shouldFetchDiagnostics);

  if (!identity) {
    return null;
  }

  const principalId = identity.getPrincipal().toString();

  const handleCopyPrincipal = () => {
    navigator.clipboard.writeText(principalId);
    toast.success('Principal ID copied to clipboard');
  };

  const handleCopyDiagnosticPrincipal = () => {
    if (diagnostics?.caller) {
      navigator.clipboard.writeText(diagnostics.caller.toString());
      toast.success('Diagnostic Principal ID copied to clipboard');
    }
  };

  const handleCopyBuildVersion = () => {
    navigator.clipboard.writeText(buildInfo.version);
    toast.success('Build version copied to clipboard');
  };

  const handleRefresh = async () => {
    try {
      // Refetch account status
      await refetch();
      // Only refetch diagnostics if the advanced section is open and user is admin
      if (shouldFetchDiagnostics) {
        await refetchDiagnostics();
      }
      toast.success('Account status refreshed');
    } catch (err) {
      toast.error('Failed to refresh account status');
    }
  };

  const isRefreshing = isFetching || (shouldFetchDiagnostics && diagnosticsFetching);

  return (
    <Card className="border-blue-500/50 bg-blue-500/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 flex-shrink-0">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg sm:text-xl">Account Status</CardTitle>
            <CardDescription className="text-sm">
              Your Internet Identity authentication details
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex-shrink-0"
            title="Refresh status"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Build Version */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Build Version</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-muted px-3 py-2 text-xs font-mono">
              {buildInfo.version}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyBuildVersion}
              className="flex-shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            This version changes with each deployment. Use it to verify you're seeing the latest build.
          </p>
        </div>

        {/* Principal ID */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Principal ID</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-muted px-3 py-2 text-xs font-mono break-all">
              {principalId}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyPrincipal}
              className="flex-shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Status Indicators */}
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">Failed to load account status</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Principal ID is still available above. Try refreshing the page or clicking the refresh button.
            </p>
          </div>
        ) : accountStatus ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Admin Status */}
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Role</p>
                <Badge
                  variant={accountStatus.callerIsAdmin ? 'default' : 'outline'}
                  className="mt-1"
                >
                  {accountStatus.callerIsAdmin ? (
                    <>
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </>
                  ) : (
                    <>
                      <User className="h-3 w-3 mr-1" />
                      User
                    </>
                  )}
                </Badge>
              </div>
            </div>

            {/* Invited Status */}
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <Key className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Invited</p>
                <Badge
                  variant={accountStatus.callerIsInvited ? 'default' : 'outline'}
                  className="mt-1"
                >
                  {accountStatus.callerIsInvited ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Yes
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      No
                    </>
                  )}
                </Badge>
              </div>
            </div>

            {/* Profile Status */}
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Profile</p>
                <Badge
                  variant={accountStatus.userProfileExists ? 'default' : 'outline'}
                  className="mt-1"
                >
                  {accountStatus.userProfileExists ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Exists
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Missing
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>
        ) : null}

        {/* Advanced / Troubleshooting Collapsible - only for admins */}
        {isAdmin && (
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  <span className="text-sm font-medium">Advanced / Troubleshooting</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-3">
              {diagnostics ? (
                <>
                  <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Backend Caller Principal</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleCopyDiagnosticPrincipal}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <code className="block text-xs font-mono break-all">
                      {diagnostics.caller.toString()}
                    </code>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground mb-1">Backend isAdmin</p>
                      <Badge variant={diagnostics.callerIsAdmin ? 'default' : 'outline'}>
                        {diagnostics.callerIsAdmin ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            True
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            False
                          </>
                        )}
                      </Badge>
                    </div>

                    <div className="rounded-lg border bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground mb-1">Access Control Init</p>
                      <Badge variant={diagnostics.accessControlInitialized ? 'default' : 'outline'}>
                        {diagnostics.accessControlInitialized ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Yes
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            No
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    These values are fetched directly from the backend canister and show the internal state 
                    of your authentication and authorization.
                  </p>
                </>
              ) : (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
