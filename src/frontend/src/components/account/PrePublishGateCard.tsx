import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function PrePublishGateCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pre-Publish Verification Required</CardTitle>
        <CardDescription>
          This release must not be published until all requested features are verified
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Ready to Publish</AlertTitle>
          <AlertDescription>
            The following features must be implemented and verified before publishing:
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-sm">Reviews & Ratings System</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Guest Account: Submit reviews with 1-5 star rating and optional comment</li>
                <li>Guest Account: View reviews for selected hotels</li>
                <li>Hotel Area: Submit reviews for other hotels</li>
                <li>Hotel Area: View reviews for own hotel</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-sm">Booking Actions & UI Alignment</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Guest Account: Cancel button for pending bookings</li>
                <li>Hotel Area: Cancel and Delete buttons for all bookings</li>
                <li>Hotel Area: Bookings UI aligned with Admin panel layout (scrollable list, consistent card structure)</li>
                <li>Confirmation dialogs for cancel/delete actions</li>
                <li>Success/error toasts for all booking actions</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-sm">Publishing Guidance</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Troubleshooting help for "Canister ID Not Resolved" errors</li>
                <li>Instructions to find correct live URL from deployment outputs</li>
              </ul>
            </div>
          </div>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Post-Deploy Verification Checklist:</strong>
            <br />
            After deployment, verify that:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Reviews can be submitted and viewed in both Guest Account and Hotel Area</li>
              <li>Guest bookings show Cancel button for pending bookings</li>
              <li>Hotel bookings show Cancel and Delete buttons with working confirmation dialogs</li>
              <li>Hotel bookings list uses scrollable layout matching Admin panel</li>
              <li>All booking actions trigger proper cache invalidation and UI refresh</li>
              <li>No existing features are broken or regressed</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
