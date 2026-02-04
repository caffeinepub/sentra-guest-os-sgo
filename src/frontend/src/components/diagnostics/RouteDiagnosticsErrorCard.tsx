import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertCircle, RefreshCw, Info, Copy, Check, ChevronDown, ServerOff, Wrench } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActorSafe } from '../../hooks/useActorSafe';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { analyzeReplicaRejection } from '../../utils/replicaRejection';

interface RouteDiagnosticsErrorCardProps {
  title?: string;
  description?: string;
  errorMessage?: string;
  onRetry?: () => void;
}

export default function RouteDiagnosticsErrorCard({
  title = 'Connection Error',
  description = 'Unable to load this page',
  errorMessage,
  onRetry,
}: RouteDiagnosticsErrorCardProps) {
  const { identity } = useInternetIdentity();
  const { actorError, retry: retryActor } = useActorSafe();
  const navigate = useNavigate();
  const [copiedPrincipal, setCopiedPrincipal] = useState(false);
  const [copiedCanister, setCopiedCanister] = useState(false);
  const [showRawDetails, setShowRawDetails] = useState(false);

  const principalId = identity?.getPrincipal().toString() ?? 'Not available';
  const isAuthenticated = !!identity;
  const displayError = errorMessage || actorError?.message || 'Unknown error occurred';

  // Analyze the error for stopped-canister patterns
  const replicaInfo = analyzeReplicaRejection(displayError);
  const isStoppedCanister = replicaInfo.isStoppedCanister;

  // Override title/description for stopped-canister state
  const effectiveTitle = isStoppedCanister ? 'Backend Temporarily Unavailable' : title;
  const effectiveDescription = isStoppedCanister 
    ? 'The backend service is currently stopped' 
    : description;

  const handleRetry = () => {
    // First retry actor initialization
    retryActor();
    // Then call custom retry if provided (with slight delay to allow actor to initialize)
    if (onRetry) {
      setTimeout(() => onRetry(), 500);
    }
  };

  const handleCopyPrincipal = async () => {
    if (principalId !== 'Not available') {
      await navigator.clipboard.writeText(principalId);
      setCopiedPrincipal(true);
      setTimeout(() => setCopiedPrincipal(false), 2000);
    }
  };

  const handleCopyCanister = async () => {
    if (replicaInfo.canisterId) {
      await navigator.clipboard.writeText(replicaInfo.canisterId);
      setCopiedCanister(true);
      setTimeout(() => setCopiedCanister(false), 2000);
    }
  };

  const handleHardRefresh = () => {
    window.location.reload();
  };

  const handleNavigateToTroubleshooting = () => {
    navigate({ to: '/account', hash: 'troubleshooting' });
  };

  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-3xl space-y-6 px-4">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 flex-shrink-0">
                {isStoppedCanister ? (
                  <ServerOff className="h-6 w-6 text-destructive" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-destructive" />
                )}
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl">{effectiveTitle}</CardTitle>
                <CardDescription className="text-sm">{effectiveDescription}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error Details */}
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Details</AlertTitle>
              <AlertDescription className="text-xs break-words">
                {replicaInfo.userMessage}
              </AlertDescription>
            </Alert>

            {/* Canister ID (if detected) */}
            {replicaInfo.canisterId && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle className="text-xs">Canister ID</AlertTitle>
                <AlertDescription className="space-y-2">
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-muted px-2 py-1 rounded break-all font-mono">
                      {replicaInfo.canisterId}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 flex-shrink-0"
                      onClick={handleCopyCanister}
                    >
                      {copiedCanister ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Expandable Raw Technical Details */}
            {replicaInfo.isReplicaRejection && (
              <Collapsible open={showRawDetails} onOpenChange={setShowRawDetails}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between">
                    <span className="text-xs font-medium">Show raw technical details</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showRawDetails ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle className="text-xs">Raw Error Message</AlertTitle>
                    <AlertDescription className="text-xs break-all font-mono">
                      {replicaInfo.rawMessage}
                    </AlertDescription>
                  </Alert>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Diagnostics */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Diagnostics</AlertTitle>
              <AlertDescription className="space-y-3 text-xs">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Authenticated:</span>
                    <Badge variant={isAuthenticated ? 'default' : 'secondary'} className="text-xs">
                      {isAuthenticated ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Principal ID:</span>
                      {principalId !== 'Not available' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 px-2"
                          onClick={handleCopyPrincipal}
                        >
                          {copiedPrincipal ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                    <code className="block text-xs bg-muted px-2 py-1 rounded break-all">
                      {principalId}
                    </code>
                  </div>

                  {actorError && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Actor Status:</span>
                      <Badge variant="destructive" className="text-xs">
                        Failed
                      </Badge>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {/* Actions */}
            <div className="space-y-3">
              {isStoppedCanister ? (
                <p className="text-sm text-muted-foreground">
                  The backend canister is currently stopped. This is usually temporary. 
                  Try retrying the connection, or use the troubleshooting tools if the issue persists.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This could be due to network issues, backend problems, or authentication state. 
                  Try retrying the connection or checking your account status.
                </p>
              )}
              
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleRetry}
                  variant="default"
                  className="w-full gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry Connection
                </Button>

                {isStoppedCanister && (
                  <>
                    <Button
                      onClick={handleHardRefresh}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Hard Refresh Page
                    </Button>

                    <Button
                      onClick={handleNavigateToTroubleshooting}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <Wrench className="h-4 w-4" />
                      Open Troubleshooting Tools
                    </Button>
                  </>
                )}
                
                <Button asChild variant="outline" className="w-full">
                  <Link to="/account">
                    Open Account Status
                  </Link>
                </Button>

                <Button asChild variant="outline" className="w-full">
                  <Link to="/">
                    Return to Home
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
