import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertCircle, CheckCircle2, RefreshCw, Rocket, AlertTriangle } from 'lucide-react';

export default function PublishingDeploymentHelpSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          Publishing & Deployment Help
        </CardTitle>
        <CardDescription>
          Step-by-step guidance for deploying and troubleshooting your application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="how-to-publish">
            <AccordionTrigger className="text-sm font-medium">
              How to Request Deployment
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm text-muted-foreground">
              <p>To deploy your application to production:</p>
              <ol className="list-decimal list-inside space-y-2 pl-2">
                <li>Ensure all features are implemented and tested in draft mode</li>
                <li>Request deployment from the editor or build interface</li>
                <li>Wait for the deployment process to complete (usually 2-5 minutes)</li>
                <li>Once deployed, you'll receive a live URL for your application</li>
              </ol>
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  The live URL will be displayed in the deployment output and typically follows the format: <code className="text-xs">https://[canister-id].icp0.io/</code>
                </AlertDescription>
              </Alert>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="deployment-failures">
            <AccordionTrigger className="text-sm font-medium">
              Handling Deployment Failures
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm text-muted-foreground">
              <p>If deployment fails:</p>
              <ol className="list-decimal list-inside space-y-2 pl-2">
                <li>Check the deployment logs for specific error messages</li>
                <li>Common issues include:
                  <ul className="list-disc list-inside pl-6 mt-1 space-y-1">
                    <li>Network timeouts - retry deployment</li>
                    <li>Build errors - check code syntax and dependencies</li>
                    <li>Canister capacity issues - contact support</li>
                  </ul>
                </li>
                <li>Wait a few minutes and retry the deployment</li>
                <li>If issues persist, use the troubleshooting tools below</li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="ui-not-updating">
            <AccordionTrigger className="text-sm font-medium">
              UI Not Updating After Deployment
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm text-muted-foreground">
              <p>If the UI doesn't reflect your latest changes after deployment:</p>
              <ol className="list-decimal list-inside space-y-2 pl-2">
                <li><strong>Hard Refresh:</strong> Press <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl+Shift+R</kbd> (Windows/Linux) or <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Cmd+Shift+R</kbd> (Mac)</li>
                <li><strong>Clear Browser Cache:</strong> Go to browser settings and clear cached images and files</li>
                <li><strong>Disable PWA Cache:</strong> Use the "Disable PWA Offline Cache" button in the <a href="#troubleshooting" className="text-primary hover:underline">Troubleshooting section</a></li>
                <li><strong>Verify Deployment:</strong> Check that the deployment completed successfully and note the live URL</li>
              </ol>
              <Alert>
                <RefreshCw className="h-4 w-4" />
                <AlertDescription>
                  After clearing caches, always perform a hard refresh to ensure you're loading the latest version.
                </AlertDescription>
              </Alert>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="canister-id-not-resolved">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                "Canister ID Not Resolved" Error
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm text-muted-foreground">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>What This Error Means</AlertTitle>
                <AlertDescription>
                  This error indicates that the URL you're trying to access does not point to a deployed canister on the Internet Computer network. The gateway cannot determine which canister should handle the request.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <p className="font-medium">How to Find the Correct Live URL:</p>
                <ol className="list-decimal list-inside space-y-2 pl-2">
                  <li><strong>Check Deployment Output:</strong> After a successful deployment, the live URL is displayed in the deployment logs or output panel</li>
                  <li><strong>Look for the Canister ID:</strong> The URL format is typically <code className="text-xs bg-muted px-1 py-0.5 rounded">https://[canister-id].icp0.io/</code></li>
                  <li><strong>Copy the Correct URL:</strong> Use the exact URL provided in the deployment output</li>
                  <li><strong>Bookmark the URL:</strong> Save the correct URL to avoid confusion in the future</li>
                </ol>
              </div>

              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <strong>Example:</strong> If your deployment output shows <code className="text-xs">https://abc123-xyz.icp0.io/</code>, that is your correct live URL. Any other URL will result in this error.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <p className="font-medium">Common Causes:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Using a draft/preview URL instead of the production URL</li>
                  <li>Typing the URL manually with incorrect canister ID</li>
                  <li>Using an old URL from a previous deployment</li>
                  <li>Accessing the app before deployment has completed</li>
                </ul>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Solution:</strong> Always use the live URL provided in your deployment output. If you've lost the URL, redeploy the application and copy the URL from the deployment logs.
                </AlertDescription>
              </Alert>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            For additional help, refer to the <a href="#troubleshooting" className="text-primary hover:underline">Troubleshooting section</a> below or contact support if issues persist.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
