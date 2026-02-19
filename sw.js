const CACHE_NAME = 'bms-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/index.css',
    './js/supabase.js',
    './js/state.js',
    './js/db.js',
    './js/utils.js',
    './js/auth.js',
    './js/simulation.js',
    './js/modals.js',
    './js/app.js',
    './js/owner/overview.js',
    './js/owner/branches.js',
    './js/owner/tasks.js',
    './js/owner/analytics.js',
    './js/owner/security.js',
    './js/branch/dashboard.js',
    './js/branch/sales.js',
    './js/branch/expenses.js',
    './js/branch/inventory.js',
    './js/branch/customers.js',
    './js/branch/tasks.js',
    './js/branch/reports.js',
    './js/branch/notes.js',
    './js/branch/loans.js',
    './logo.jpg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Mobile/Simulated environments might use weird schemes
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});
