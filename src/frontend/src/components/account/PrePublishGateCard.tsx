import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, AlertCircle, FileText, ExternalLink } from 'lucide-react';

const CHECKLIST_ITEMS = [
  { id: 'guest-area', label: 'Guest Area (/) loads within 5 seconds' },
  { id: 'browse-hotels', label: 'Browse Hotels loads within 10 seconds' },
  { id: 'guest-account', label: 'Guest Account loads all sections within 10 seconds' },
  { id: 'account-status', label: 'Account Status page loads within 10 seconds' },
  { id: 'hotel-area', label: 'Hotel Area loads or shows invite gate within 10 seconds' },
  { id: 'admin-panel', label: 'Admin Panel loads or shows access-denied within 10 seconds' },
  { id: 'is-admin-query', label: 'useIsAdmin resolves within 10 seconds (no infinite loading)' },
  { id: 'stay-history', label: 'Stay History section always visible on Guest Account' },
  { id: 'actor-init', label: 'Actor initialization completes or shows error within 15 seconds' },
  { id: 'error-states', label: 'All error states show retry button and link to /account' },
];

const POST_DEPLOY_VERIFICATION = [
  { id: 'hard-refresh', label: 'Performed hard refresh (Ctrl+Shift+R / Cmd+Shift+R) after deployment' },
  { id: 'footer-check', label: 'Verified footer or a specific UI change is visible in the new version' },
  { id: 'key-routes', label: 'Confirmed key routes (/, /browse, /guest-account) load without stale assets' },
  { id: 'no-console-errors', label: 'Checked browser console for no critical errors or warnings' },
  { id: 'cache-cleared', label: 'If changes not visible, used Troubleshooting tools to clear caches' },
  { id: 'non-admin-troubleshooting', label: 'Verified non-admin users do NOT see Troubleshooting section on Account Status' },
  { id: 'non-admin-publishing', label: 'Verified non-admin users do NOT see Publishing & Deployment section on Account Status' },
];

export default function PrePublishGateCard() {
  const [changeSummary, setChangeSummary] = useState('');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [verificationChecked, setVerificationChecked] = useState<Set<string>>(new Set());

  const allChecked = checkedItems.size === CHECKLIST_ITEMS.length;
  const hasSummary = changeSummary.trim().length > 10;
  const isReadyToPublish = allChecked && hasSummary;

  const handleCheckChange = (itemId: string, checked: boolean) => {
    const newChecked = new Set(checkedItems);
    if (checked) {
      newChecked.add(itemId);
    } else {
      newChecked.delete(itemId);
    }
    setCheckedItems(newChecked);
  };

  const handleVerificationChange = (itemId: string, checked: boolean) => {
    const newChecked = new Set(verificationChecked);
    if (checked) {
      newChecked.add(itemId);
    } else {
      newChecked.delete(itemId);
    }
    setVerificationChecked(newChecked);
  };

  const scrollToTroubleshooting = () => {
    const element = document.getElementById('troubleshooting');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Card className="border-amber-500/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 flex-shrink-0">
            <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl">Pre-Publish Gate - Draft Version 53</CardTitle>
            <CardDescription className="text-sm">
              Complete this checklist before publishing Draft Version 53 to live/production
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Change Summary */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">Change Summary (Required)</label>
          <Textarea
            placeholder="Briefly describe what was changed in this version (1-3 sentences)..."
            value={changeSummary}
            onChange={(e) => setChangeSummary(e.target.value)}
            rows={3}
            className="resize-none"
          />
          {changeSummary.trim().length > 0 && changeSummary.trim().length < 10 && (
            <p className="text-xs text-muted-foreground">
              Please provide a more detailed summary (at least 10 characters)
            </p>
          )}
        </div>

        {/* Regression Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">Regression Checklist</label>
            <Badge variant={allChecked ? 'default' : 'secondary'} className="text-xs">
              {checkedItems.size} / {CHECKLIST_ITEMS.length}
            </Badge>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
            {CHECKLIST_ITEMS.map((item) => (
              <div key={item.id} className="flex items-start gap-2">
                <Checkbox
                  id={item.id}
                  checked={checkedItems.has(item.id)}
                  onCheckedChange={(checked) => handleCheckChange(item.id, checked as boolean)}
                  className="mt-0.5"
                />
                <label
                  htmlFor={item.id}
                  className="text-sm leading-tight cursor-pointer select-none"
                >
                  {item.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Status Alert */}
        {isReadyToPublish ? (
          <Alert className="border-green-500/50 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-600 dark:text-green-400">Ready to Publish Draft Version 53</AlertTitle>
            <AlertDescription className="text-xs text-green-600/80 dark:text-green-400/80">
              All checklist items are complete and change summary is provided. You may proceed with publishing Draft Version 53 to live/production.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-amber-500/50 bg-amber-500/10">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-600 dark:text-amber-400">Not Ready to Publish</AlertTitle>
            <AlertDescription className="text-xs text-amber-600/80 dark:text-amber-400/80">
              {!hasSummary && 'Please provide a change summary. '}
              {!allChecked && `Please complete all ${CHECKLIST_ITEMS.length} checklist items. `}
              Do not publish until all requirements are met.
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        {/* Post-Deploy Verification */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">Post-Deploy Verification</label>
            <Badge variant={verificationChecked.size === POST_DEPLOY_VERIFICATION.length ? 'default' : 'secondary'} className="text-xs">
              {verificationChecked.size} / {POST_DEPLOY_VERIFICATION.length}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            After publishing Draft Version 53 to live/production, complete these verification steps to ensure the new build is live and that non-admin users no longer see Troubleshooting and Publishing & Deployment sections:
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
            {POST_DEPLOY_VERIFICATION.map((item) => (
              <div key={item.id} className="flex items-start gap-2">
                <Checkbox
                  id={`verify-${item.id}`}
                  checked={verificationChecked.has(item.id)}
                  onCheckedChange={(checked) => handleVerificationChange(item.id, checked as boolean)}
                  className="mt-0.5"
                />
                <label
                  htmlFor={`verify-${item.id}`}
                  className="text-sm leading-tight cursor-pointer select-none"
                >
                  {item.label}
                </label>
              </div>
            ))}
          </div>
          <Alert className="border-blue-500/50 bg-blue-500/10">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-xs text-blue-600 dark:text-blue-400">Stale Assets / Cache Issues?</AlertTitle>
            <AlertDescription className="text-xs text-blue-600/80 dark:text-blue-400/80 space-y-2">
              <p>
                If the new build appears not to be live due to caching, use the Troubleshooting actions below 
                to clear caches and service workers, then retry verification.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 mt-2"
                onClick={scrollToTroubleshooting}
              >
                <ExternalLink className="h-3 w-3" />
                Go to Troubleshooting Tools
              </Button>
            </AlertDescription>
          </Alert>
        </div>

        {/* Instructions */}
        <div className="pt-4 border-t">
          <h3 className="text-sm font-semibold mb-2">Instructions</h3>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Test each route manually in production before checking</li>
            <li>Verify no infinite loading states (all queries resolve within timeout)</li>
            <li>Ensure Stay History section is always visible on Guest Account</li>
            <li>Check that all error states show retry buttons</li>
            <li>Do NOT publish if any item exhibits infinite loading or blank screens</li>
            <li>After deployment, always perform a hard refresh to verify changes are live</li>
            <li>Verify non-admin users do NOT see Troubleshooting or Publishing & Deployment sections on Account Status page</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
