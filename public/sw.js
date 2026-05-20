// Qazi Enterprises Service Worker
// Strategy:
//   - App shell + assets: cache-first (so the app loads instantly and offline)
//   - Supabase / API calls: network-first, never cached (avoid stale auth tokens)
//   - Background Sync tag "qazi-sync-queue" wakes the app so useOfflineSync flushes its queue
const CACHE = "qazi-v1";
const APP_SHELL = ["/", "/index.html", "/manifest.webmanifest", "/favicon.ico"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP_SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Never cache Supabase / API traffic — always go to network
  if (url.hostname.endsWith(".supabase.co") || url.pathname.startsWith("/functions/")) return;

  // SPA navigation fallback
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Static assets: cache-first with background refresh
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});

// Background sync: notify all clients to flush the offline queue
self.addEventListener("sync", (event) => {
  if (event.tag === "qazi-sync-queue") {
    event.waitUntil(
      self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
        for (const c of clients) c.postMessage({ type: "FLUSH_OFFLINE_QUEUE" });
      })
    );
  }
});
