// Service worker: maakt de app offline bruikbaar.
const CACHE = "huishouden-v1";
const BESTANDEN = ["./", "./index.html", "./manifest.json", "./icon-180.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BESTANDEN)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
// Netwerk eerst (zodat updates binnenkomen), val terug op cache als offline.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(r => {
      const kopie = r.clone();
      if (new URL(e.request.url).origin === location.origin) {
        caches.open(CACHE).then(c => c.put(e.request, kopie));
      }
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
