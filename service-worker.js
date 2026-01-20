const CACHE_NAME = 'cryptoai-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event (Cleanup old caches)
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

// Fetch Event (Network first, then Cache)
self.addEventListener('fetch', (event) => {
  // Ignora requisições para APIs externas (CoinGecko, Gemini, OpenRouter) para não cachear dados obsoletos
  if (event.request.url.includes('api.coingecko.com') || 
      event.request.url.includes('generativelanguage.googleapis.com') ||
      event.request.url.includes('openrouter.ai')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});