const CACHE = 'mano-keto-v122';
const PORTION_ASSET='./recipe-portions.mjs?v=122';
const ASSETS = ['./', './index.html', './styles.css?v=122', './meal-planner.css?v=122', './app.js?v=122', './sync.js?v=122', './meal-planner.js?v=122', './planner-state.mjs?v=122', './data/planner/recipes.json', './data/library/recipes.json', './ingredient-dictionary.json', './product-translations.mjs?v=122', './household-portions.mjs?v=122', './keto-classification.mjs?v=122', './manifest.webmanifest', './icons/cupcake.svg', './icons/cupcake-192.png', './icons/cupcake-512.png', './icons/apple-touch-icon-cupcake.png', './icons/icon-192.png', './icons/icon-512.png'];
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
