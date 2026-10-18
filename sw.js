/* =====================================================================
   sw.js – minimális service worker
   Csak két dolga van:
     1) a Chrome csak service workerrel kínálja fel a saját telepítő ablakát;
     2) ha nincs internet, egy barátságos „nincs kapcsolat” oldalt mutat.
   A tartalmat (oldalakat, hanganyagokat, videókat) SEMMILYEN módon nem
   gyorsítótárazza és nem módosítja → soha nem okoz elavult oldalt.
   Új változatnál a CACHE nevét kell átírni (pl. offline-v2).
   ===================================================================== */
const CACHE = 'offline-v1';
const OFFLINE = '/offline.html';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll([OFFLINE, '/icon-192.png']))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(nevek => Promise.all(nevek.filter(n => n !== CACHE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Csak az oldalbetöltéseket figyeljük; minden más (hang, videó, kép, adat) érintetlenül megy.
  if (e.request.mode !== 'navigate') return;
  e.respondWith(fetch(e.request).catch(() => caches.match(OFFLINE)));
});
