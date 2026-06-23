// ============================================
// SW.JS - Service Worker para modo offline
// ============================================

const CACHE_NAME = 'ober-crm-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/leads.html',
    '/propiedades.html',
    '/pipeline.html',
    '/tareas.html',
    '/reportes.html',
    '/configuracion.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/dashboard.js',
    '/js/leads.js',
    '/js/propiedades.js',
    '/js/pipeline.js',
    '/js/tareas.js',
    '/js/reportes.js',
    '/js/configuracion.js',
    '/manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// ===== INSTALACIÓN =====
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Cache abierto');
                return cache.addAll(urlsToCache);
            })
    );
});

// ===== ACTIVACIÓN =====
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// ===== FETCH =====
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                
                // Clone request
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest)
                    .then(function(response) {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone response
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });
                            
                        return response;
                    })
                    .catch(function() {
                        // Si offline y no está en cache, mostrar página de error
                        return caches.match('/offline.html');
                    });
            })
    );
});

// ===== NOTIFICACIONES PUSH (opcional) =====
self.addEventListener('push', function(event) {
    const data = event.data.json();
    const options = {
        body: data.message || 'Tienes una nueva notificación',
        icon: 'img/icon-192.png',
        badge: 'img/icon-192.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('Ober CRM', options)
    );
});

// ===== CLICK EN NOTIFICACIÓN =====
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    const url = event.notification.data.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then(function(windowClients) {
                for (let client of windowClients) {
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});