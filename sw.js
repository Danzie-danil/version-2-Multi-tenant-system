const CACHE_NAME = 'bms-v4';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/index.css',
    './js/supabase.js',
    './js/state.js',
    './js/db.js',
    './js/utils.js',
    './js/theme.js',
    './js/auth.js',
    './js/modals.js',
    './js/app.js',
    './js/particles.js',
    './js/simulation.js',
    './js/owner/overview.js',
    './js/owner/branches.js',
    './js/owner/tasks.js',
    './js/owner/analytics.js',
    './js/owner/security.js',
    './js/owner/settings.js',
    './js/branch/dashboard.js',
    './js/branch/sales.js',
    './js/branch/expenses.js',
    './js/branch/inventory.js',
    './js/branch/customers.js',
    './js/branch/tasks.js',
    './js/branch/reports.js',
    './js/branch/notes.js',
    './js/branch/loans.js',
    './js/branch/settings.js',
    './assets/logo.jpg',
    './assets/logout.svg',
    './logout.svg',
    './manifest.json',
    './logo.jpg',
    './bg_logo.png'
];

self.addEventListener('install', (event) => {
    // Force new SW to enter waiting state immediately
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (event) => {
    // Force new SW to become active immediately
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            caches.keys().then((keyList) => {
                return Promise.all(
                    keyList.map((key) => {
                        if (key !== CACHE_NAME) {
                            return caches.delete(key);
                        }
                    })
                );
            })
        ])
    );
});

self.addEventListener('fetch', (event) => {
    // Network First for HTML and JS to ensure fresh code during development
    // Fallback to cache if offline
    if (event.request.mode === 'navigate' || event.request.destination === 'script' || event.request.destination === 'document') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                })
                .catch(() => {
                    return caches.match(event.request);
                })
        );
    } else {
        // Cache First for other assets (images, css, etc.)
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
    }
});
