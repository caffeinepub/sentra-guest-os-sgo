import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PublishingDeploymentHelpSection() {
  const scrollToTroubleshooting = () => {
    const element = document.getElementById('troubleshooting');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Card className="border-blue-500/50 bg-blue-500/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 flex-shrink-0">
            <Rocket className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl">Publishing & Deployment</CardTitle>
            <CardDescription className="text-sm">
              Step-by-step guide for deploying changes and verifying updates
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* How to Publish/Deploy */}
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">1</span>
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-semibold">How to Publish/Deploy</h3>
              <p className="text-xs text-muted-foreground">
                To publish your changes to production, use the chat interface to request a deployment. 
                The AI agent will build and deploy your application to the Internet Computer network.
              </p>
              <p className="text-xs text-muted-foreground">
                Example: "Please deploy the latest changes" or "Publish to production"
              </p>
            </div>
          </div>
        </div>

        {/* What to Do When Deploy Fails */}
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">2</span>
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-sm font-semibold">When Deployment Fails</h3>
              <p className="text-xs text-muted-foreground">
                If the deployment fails, simply request to retry the deployment:
              </p>
              <Alert className="border-amber-500/50 bg-amber-500/10">
                <RefreshCw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertTitle className="text-xs text-amber-600 dark:text-amber-400">Retry Action</AlertTitle>
                <AlertDescription className="text-xs text-amber-600/80 dark:text-amber-400/80">
                  Say: "Please retry the deployment" or "Deploy again"
                </AlertDescription>
              </Alert>
              <p className="text-xs text-muted-foreground">
                Most deployment failures are temporary network issues. Retrying usually resolves the problem.
              </p>
            </div>
          </div>
        </div>

        {/* What to Do When UI Doesn't Update After Successful Deploy */}
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10 flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-green-600 dark:text-green-400">3</span>
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-sm font-semibold">When Changes Don't Appear After Successful Deploy</h3>
              <p className="text-xs text-muted-foreground">
                If deployment succeeds but you don't see your changes, the issue is likely cached assets. 
                Follow these steps in order:
              </p>
              <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside pl-2">
                <li>
                  <strong>Hard Refresh:</strong> Press <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded">Ctrl+Shift+R</kbd> (Windows/Linux) 
                  or <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded">Cmd+Shift+R</kbd> (Mac) to bypass browser cache
                </li>
                <li>
                  <strong>Clear App Cache:</strong> Use the "Reset app cache" action in the Troubleshooting section below
                </li>
                <li>
                  <strong>Disable Offline Cache:</strong> If the above doesn't work, use "Disable offline cache & reload" 
                  in the Troubleshooting section to remove service workers and cache storage
                </li>
                <li>
                  <strong>Verify Version:</strong> Check the footer or a specific UI element you changed to confirm the new version is loaded
                </li>
              </ol>
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-xs text-green-600 dark:text-green-400">Pro Tip</AlertTitle>
                <AlertDescription className="text-xs text-green-600/80 dark:text-green-400/80">
                  After deployment, always do a hard refresh first. This solves 90% of "changes not visible" issues.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>

        {/* Link to Troubleshooting Tools */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={scrollToTroubleshooting}
          >
            <AlertCircle className="h-4 w-4" />
            Go to Troubleshooting Tools
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Access cache reset and offline cache management tools to resolve stale asset issues
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
