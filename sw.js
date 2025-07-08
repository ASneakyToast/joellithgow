// sw.js
// Service Worker for caching and offline functionality

const CACHE_NAME = 'portfolio-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/css/themes.css',
    '/css/layout.css',
    '/css/components.css',
    '/css/animations.css',
    '/css/responsive.css',
    '/js/main.js',
    '/js/data/projects.js',
    '/js/data/themes.js',
    '/js/data/content.js',
    '/js/components/theme-manager.js',
    '/js/components/project-cards.js',
    '/js/components/ui-interactions.js',
    '/js/components/ui-components.js',
    '/js/performance.js'
];

// Runtime caching strategies
const RUNTIME_CACHE_STRATEGIES = {
    images: 'cache-first',
    api: 'network-first',
    static: 'stale-while-revalidate'
};

// Install event - precache assets
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Precaching assets...');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                console.log('Assets precached successfully');
                // Force activation
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Precaching failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                // Take control of all pages
                return self.clients.claim();
            })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }
    
    // Handle different types of requests
    if (request.destination === 'document') {
        event.respondWith(handleDocumentRequest(request));
    } else if (request.destination === 'image') {
        event.respondWith(handleImageRequest(request));
    } else if (request.url.includes('/api/')) {
        event.respondWith(handleApiRequest(request));
    } else {
        event.respondWith(handleStaticRequest(request));
    }
});

// Handle document requests (HTML pages)
async function handleDocumentRequest(request) {
    try {
        // Try network first
        const response = await fetch(request);
        
        // If successful, update cache
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        // Network failed, try cache
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // If no cache, return offline page
        return caches.match(OFFLINE_URL);
    }
}

// Handle image requests
async function handleImageRequest(request) {
    try {
        // Try cache first
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // If not in cache, fetch from network
        const response = await fetch(request);
        
        if (response.ok) {
            // Cache the response
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.error('Image request failed:', error);
        
        // Return placeholder image if available
        return caches.match('/assets/placeholder.png') || 
               new Response('', { status: 404 });
    }
}

// Handle API requests
async function handleApiRequest(request) {
    try {
        // Try network first
        const response = await fetch(request);
        
        if (response.ok) {
            // Cache successful responses
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        // Network failed, try cache
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return error response
        return new Response(
            JSON.stringify({ error: 'Network unavailable' }),
            { 
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Handle static asset requests
async function handleStaticRequest(request) {
    try {
        // Try cache first
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            // Start background fetch to update cache
            fetch(request)
                .then(response => {
                    if (response.ok) {
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(request, response));
                    }
                })
                .catch(() => {
                    // Ignore background fetch failures
                });
            
            return cachedResponse;
        }
        
        // If not in cache, fetch from network
        const response = await fetch(request);
        
        if (response.ok) {
            // Cache the response
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.error('Static request failed:', error);
        return new Response('', { status: 404 });
    }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
    console.log('Background sync:', event.tag);
    
    if (event.tag === 'contact-form') {
        event.waitUntil(syncContactForm());
    }
});

// Sync contact form submissions
async function syncContactForm() {
    try {
        const db = await openDB();
        const tx = db.transaction(['contact-forms'], 'readonly');
        const store = tx.objectStore('contact-forms');
        const forms = await store.getAll();
        
        for (const form of forms) {
            try {
                await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form.data)
                });
                
                // Remove from local storage after successful sync
                const deleteTx = db.transaction(['contact-forms'], 'readwrite');
                const deleteStore = deleteTx.objectStore('contact-forms');
                await deleteStore.delete(form.id);
            } catch (error) {
                console.error('Failed to sync form:', error);
            }
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Push notifications
self.addEventListener('push', event => {
    console.log('Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New update available!',
        icon: '/assets/icon-192x192.png',
        badge: '/assets/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            url: '/',
            timestamp: Date.now()
        },
        actions: [
            {
                action: 'open',
                title: 'Open Portfolio',
                icon: '/assets/action-open.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: '/assets/action-dismiss.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Joel Lithgow Portfolio', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    console.log('Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});

// Message handling for cache updates
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_UPDATE') {
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then(cache => {
                    return cache.addAll(event.data.urls);
                })
        );
    }
});

// Utility function to open IndexedDB
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('PortfolioDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = event => {
            const db = event.target.result;
            
            if (!db.objectStoreNames.contains('contact-forms')) {
                db.createObjectStore('contact-forms', { keyPath: 'id' });
            }
        };
    });
}

// Analytics tracking for service worker events
function trackEvent(eventName, data = {}) {
    if (self.clients) {
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'SW_ANALYTICS',
                    eventName,
                    data
                });
            });
        });
    }
}

// Track service worker installation
trackEvent('sw_install', { cacheName: CACHE_NAME });

console.log('Service Worker loaded successfully');