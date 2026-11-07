const CACHE = 'mano-keto-v57';
const PORTION_ASSET='./recipe-portions.mjs?v=57';
const ASSETS = ['./', './index.html', './styles.css?v=57', './meal-planner.css?v=57', './app.js?v=57', './sync.js?v=57', './meal-planner.js?v=57', './planner-state.mjs?v=57', './data/planner/recipes.json', './data/library/recipes.json', './ingredient-dictionary.json', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll([...ASSETS,PORTION_ASSET])).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith(
    fetch(event.request).then(response => {
      const copy = response.clone();
      if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(() => {});
      return response;
    }).catch(() => caches.match(event.request).then(cached => cached || (event.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
