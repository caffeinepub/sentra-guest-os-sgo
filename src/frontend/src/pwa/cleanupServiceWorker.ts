/**
 * One-time cleanup utility to unregister existing service workers and clear Cache Storage.
 * This helps users recover from stale SW caches that cause infinite loading loops.
 * Safe to run multiple times (idempotent) and never blocks the UI.
 */

const CLEANUP_FLAG_KEY = 'sgo-sw-cleanup-done';
const CLEANUP_VERSION = 'v53'; // Increment if you need to force cleanup again

export async function cleanupServiceWorker(): Promise<void> {
  // Check if cleanup already ran for this version
  const lastCleanupVersion = localStorage.getItem(CLEANUP_FLAG_KEY);
  if (lastCleanupVersion === CLEANUP_VERSION) {
    console.log('[SW Cleanup] Already ran for version:', CLEANUP_VERSION);
    return;
  }

  console.log('[SW Cleanup] Starting cleanup...');

  try {
    // 1. Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('[SW Cleanup] Found', registrations.length, 'service worker(s)');
      
      for (const registration of registrations) {
        try {
          const success = await registration.unregister();
          console.log('[SW Cleanup] Unregistered SW:', registration.scope, 'success:', success);
        } catch (err) {
          console.warn('[SW Cleanup] Failed to unregister SW:', err);
        }
      }
    }

    // 2. Clear Cache Storage
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log('[SW Cleanup] Found', cacheNames.length, 'cache(s)');
      
      for (const cacheName of cacheNames) {
        try {
          const success = await caches.delete(cacheName);
          console.log('[SW Cleanup] Deleted cache:', cacheName, 'success:', success);
        } catch (err) {
          console.warn('[SW Cleanup] Failed to delete cache:', err);
        }
      }
    }

    // Mark cleanup as done
    localStorage.setItem(CLEANUP_FLAG_KEY, CLEANUP_VERSION);
    console.log('[SW Cleanup] Cleanup complete');
  } catch (error) {
    console.error('[SW Cleanup] Cleanup failed:', error);
    // Don't block the app if cleanup fails
  }
}
