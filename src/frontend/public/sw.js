// Extract version from SW script URL query param or use timestamp
const getSwVersion = () => {
  try {
    const url = new URL(self.location.href);
    return url.searchParams.get('v') || 'default';
  } catch {
    return 'default';
  }
};

const SW_VERSION = getSwVersion();
const CACHE_NAME = `sgo-cache-${SW_VERSION}`;

// Define what should be cached - only static same-origin assets
const STATIC_CACHE_PATTERNS = [
  /^\/$/,
  /^\/index\.html$/,
  /^\/assets\//,
  /\.(?:js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|webp|ico)$/i
];

// Assets to precache on install
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/generated/sgo-logo.dim_512x512.png',
  '/assets/generated/pwa-icon.dim_192x192.png',
  '/assets/generated/pwa-icon.dim_512x512.png'
];

// Check if a request should be cached
function shouldCache(request) {
  const url = new URL(request.url);
  
  // Only cache same-origin requests
  if (url.origin !== self.location.origin) {
    return false;
  }
  
  // Check against static cache patterns
  return STATIC_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing version:', SW_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[SW] Cache addAll failed:', err);
      });
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating version:', SW_VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Delete all SGO caches except the current version
            return cacheName.startsWith('sgo-cache-') && cacheName !== CACHE_NAME;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// Message handler for skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message');
    self.skipWaiting();
  }
});

// Fetch event - network first for navigation, selective caching for assets
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Navigation requests: network-first, fallback to cached index.html when offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Don't cache navigation responses to avoid stale HTML/asset mismatches
          return response;
        })
        .catch(() => {
          // Offline: serve cached index.html
          return caches.match('/index.html').then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
        })
    );
    return;
  }

  // Static assets: network-first with selective caching
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful responses for allowed static assets
        if (response.status === 200 && shouldCache(event.request)) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});
