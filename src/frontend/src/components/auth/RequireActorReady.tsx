import { ReactNode } from 'react';
import { useActorSafe } from '../../hooks/useActorSafe';
import RouteDiagnosticsErrorCard from '../diagnostics/RouteDiagnosticsErrorCard';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Info } from 'lucide-react';

interface RequireActorReadyProps {
  children: ReactNode;
  loadingMessage?: string;
}

export default function RequireActorReady({ children, loadingMessage = 'Initializing connection...' }: RequireActorReadyProps) {
  const { actorReady, actorError, actorLoading, accessControlWarning, retry } = useActorSafe();

  // TERMINAL STATE 1: Loading (bounded by useActorSafe timeout)
  if (actorLoading && !actorError) {
    return (
      <div className="container py-8 md:py-12">
        <div className="mx-auto max-w-3xl space-y-6 px-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{loadingMessage}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // TERMINAL STATE 2: Error - use consolidated diagnostics card with retry
  if (actorError) {
    return (
      <RouteDiagnosticsErrorCard
        title="Connection Failed"
        description="Unable to initialize backend connection"
        errorMessage={actorError.message}
        onRetry={retry}
      />
    );
  }

  // TERMINAL STATE 3: Ready state with optional warning
  if (actorReady) {
    return (
      <>
        {accessControlWarning && (
          <div className="container py-4">
            <div className="mx-auto max-w-6xl px-4">
              <Alert className="border-amber-500/50 bg-amber-500/5">
                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertTitle className="text-amber-600 dark:text-amber-400">
                  Initialization Warning
                </AlertTitle>
                <AlertDescription className="text-xs text-amber-600/80 dark:text-amber-400/80">
                  {accessControlWarning}
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}
        {children}
      </>
    );
  }

  // TERMINAL STATE 4: Unexpected state fallback (should never reach here)
  // This ensures no state combination can leave the UI in perpetual loading
  return (
    <RouteDiagnosticsErrorCard
      title="Unexpected State"
      description="Actor initialization reached an unexpected state"
      errorMessage="Actor is not ready, not loading, and has no error. This should not happen."
      onRetry={retry}
    />
  );
}
