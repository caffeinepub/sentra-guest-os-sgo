import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RefreshCw, Trash2, Loader2, Wrench } from 'lucide-react';
import { toast } from 'sonner';

export default function TroubleshootingSection() {
  const queryClient = useQueryClient();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isOfflineDialogOpen, setIsOfflineDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetCache = async () => {
    setIsResetting(true);
    try {
      // Clear all React Query caches
      queryClient.clear();
      
      // Refetch critical queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['accountStatus'] }),
        queryClient.invalidateQueries({ queryKey: ['isAdmin'] }),
        queryClient.invalidateQueries({ queryKey: ['isCallerInvited'] }),
        queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] }),
      ]);
      
      toast.success('App cache reset successfully');
      setIsResetDialogOpen(false);
    } catch (error) {
      console.error('Failed to reset cache:', error);
      toast.error('Failed to reset cache');
    } finally {
      setIsResetting(false);
    }
  };

  const handleDisableOfflineCache = async () => {
    try {
      // Unregister all service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
        toast.success('Service workers unregistered');
      }

      // Clear Cache Storage
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        toast.success('Cache storage cleared');
      }

      // Force reload
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Failed to disable offline cache:', error);
      toast.error('Failed to disable offline cache');
    }
  };

  return (
    <Card id="troubleshooting" className="border-amber-500/50 bg-amber-500/5 scroll-mt-20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 flex-shrink-0">
            <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl">Troubleshooting</CardTitle>
            <CardDescription className="text-sm">
              Tools to fix common issues with cached data
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          If you're experiencing issues with admin access, invite status, or profile data not updating, 
          try these troubleshooting actions:
        </p>

        {/* Reset App Cache */}
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => setIsResetDialogOpen(true)}
          >
            <RefreshCw className="h-4 w-4" />
            Reset app cache
          </Button>
          <p className="text-xs text-muted-foreground pl-6">
            Clears cached data and refetches your account status, admin privileges, and profile
          </p>
        </div>

        {/* Disable Offline Cache */}
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => setIsOfflineDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Disable offline cache & reload
          </Button>
          <p className="text-xs text-muted-foreground pl-6">
            Removes service workers and cache storage, then reloads the page (use if reset doesn't work)
          </p>
        </div>

        {/* Reset Cache Dialog */}
        <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset App Cache</AlertDialogTitle>
              <AlertDialogDescription>
                This will clear all cached data and refetch your account information. 
                Your login session will remain active.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleResetCache} disabled={isResetting}>
                {isResetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Cache'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Disable Offline Cache Dialog */}
        <AlertDialog open={isOfflineDialogOpen} onOpenChange={setIsOfflineDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Disable Offline Cache & Reload</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  This will unregister all service workers, clear the cache storage, and reload the page.
                </p>
                <p className="font-semibold">
                  Use this if the regular cache reset doesn't solve your issue.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDisableOfflineCache}>
                Disable & Reload
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
