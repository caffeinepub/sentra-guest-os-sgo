import { buildInfo } from '../buildInfo';

// Custom event for SW update available
export const SW_UPDATE_EVENT = 'sw-update-available';

// Track the last prompted SW version to avoid duplicate prompts
let lastPromptedSwVersion: string | null = null;

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Register with version query param to force cache busting
      const swUrl = `/sw.js?v=${buildInfo.version}`;
      
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('[App] Service Worker registered:', registration.scope, 'version:', buildInfo.version);
          
          // Track if we have a waiting worker to avoid redundant update checks
          let hasWaitingWorker = false;
          
          // Check for updates periodically, but only if no update is already waiting
          const updateInterval = setInterval(() => {
            if (!hasWaitingWorker && registration.waiting === null) {
              registration.update();
            }
          }, 60000); // Check every minute
          
          // Clean up interval when page unloads
          window.addEventListener('beforeunload', () => {
            clearInterval(updateInterval);
          });
          
          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  hasWaitingWorker = true;
                  
                  // Get SW version identifier
                  const swVersion = getSwVersionFromWorker(registration.waiting);
                  
                  // Only dispatch if this is a new version we haven't prompted for
                  if (swVersion !== lastPromptedSwVersion) {
                    console.log('[App] New version available:', swVersion);
                    lastPromptedSwVersion = swVersion;
                    
                    window.dispatchEvent(new CustomEvent(SW_UPDATE_EVENT, {
                      detail: { registration, version: swVersion }
                    }));
                  }
                }
              });
            }
          });

          // Check if there's already a waiting worker
          if (registration.waiting && navigator.serviceWorker.controller) {
            hasWaitingWorker = true;
            const swVersion = getSwVersionFromWorker(registration.waiting);
            
            if (swVersion !== lastPromptedSwVersion) {
              console.log('[App] Update already waiting:', swVersion);
              lastPromptedSwVersion = swVersion;
              
              window.dispatchEvent(new CustomEvent(SW_UPDATE_EVENT, {
                detail: { registration, version: swVersion }
              }));
            }
          }
        })
        .catch((error) => {
          console.warn('[App] Service Worker registration failed:', error);
        });
    });
  }
}

// Extract version identifier from service worker
function getSwVersionFromWorker(worker: ServiceWorker | null): string {
  if (!worker) return 'unknown';
  
  try {
    const url = new URL(worker.scriptURL);
    return url.searchParams.get('v') || worker.scriptURL;
  } catch {
    return worker.scriptURL;
  }
}
