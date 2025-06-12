/**
 * NutriBruin Service Worker
 * Implements offline functionality and caching for PWA
 */

const CACHE_NAME = 'nutribruin-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/favicon.ico',
  '/formulae.wasm',
  '/formulae.js',
  '/offline.html'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const { request } = event;
  const url = new URL(request.url);

  // API calls - network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response before caching
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME).then((cache) => {
            // Cache successful API responses
            if (response.status === 200) {
              cache.put(request, responseToCache);
            }
          });
          
          return response;
        })
        .catch(() => {
          // Try to get from cache if network fails
          return caches.match(request).then((response) => {
            if (response) {
              console.log('[ServiceWorker] Serving API from cache:', request.url);
              return response;
            }
            
            // Return offline message for API calls
            return new Response(JSON.stringify({
              error: 'Offline',
              message: 'Unable to fetch data. Please check your internet connection.',
              cached: true
            }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Static assets - cache first, fallback to network
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          console.log('[ServiceWorker] Serving from cache:', request.url);
          return response;
        }

        return fetch(request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        });
      })
      .catch(() => {
        // Offline fallback for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      })
  );
});

// Background sync for offline recommendations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-recommendations') {
    event.waitUntil(syncRecommendations());
  }
});

async function syncRecommendations() {
  try {
    const cache = await caches.open(CACHE_NAME);
    
    // Get any pending recommendation requests
    const requests = await cache.match('/api/recommendations');
    
    if (requests) {
      // Retry the request
      const response = await fetch('/api/recommendations');
      
      if (response.ok) {
        // Update the cache with fresh data
        await cache.put('/api/recommendations', response.clone());
        
        // Notify the app that sync is complete
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'SYNC_COMPLETE',
              data: 'Recommendations updated'
            });
          });
        });
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Sync failed:', error);
  }
}

// Push notifications for meal reminders
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Check out today\'s menu recommendations!',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 'meal-reminder'
    },
    actions: [
      {
        action: 'view',
        title: 'View Menu',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('NutriBruin Meal Reminder', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
self.addEventListener("install", (e) => {
    self.skipWaiting();
  });
  
  self.addEventListener("fetch", (e) => {
    e.respondWith(
      fetch(e.request).catch(() => new Response("Attempting to fetch data...", {
        headers: { "Content-Type": "text/html" }
      }))
    );
  });  