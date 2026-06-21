const CACHE = 'munabbahi-v3';
const ASSETS = ['./', './index.html', './manifest.json',
  './icons/icon-72.png','./icons/icon-96.png','./icons/icon-128.png','./icons/icon-144.png',
  './icons/icon-152.png','./icons/icon-192.png','./icons/icon-384.png','./icons/icon-512.png',
  './icons/icon-192-maskable.png','./icons/icon-512-maskable.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      // Cache each asset individually so one failure doesn't break the whole install
      Promise.all(ASSETS.map(u => c.add(u).catch(() => null)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Cache-first for everything we control; network-first fallback for anything else.
// Never let a failed/slow network request (e.g. Google Fonts when offline) block the page.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        // Opportunistically cache same-origin successful responses
        if (resp && resp.ok && e.request.url.startsWith(self.location.origin)) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone)).catch(() => {});
        }
        return resp;
      }).catch(() => {
        // Offline and not cached: for navigations, serve the cached app shell instead of failing
        if (e.request.mode === 'navigate') return caches.match('./index.html');
        return new Response('', { status: 408, statusText: 'Offline' });
      });
    })
  );
});

/* ── Background alarm check every minute ── */
self.addEventListener('periodicsync', e => { if (e.tag === 'alarm-check') e.waitUntil(checkAlarms()); });

/* ── Push notification handler ── */
self.addEventListener('push', e => {
  const d = e.data ? e.data.json() : {};
  e.waitUntil(self.registration.showNotification(d.title || '🔔 منبّهي', {
    body: d.body || 'حان وقت التنبيه!', icon: './icons/icon-192.png',
    badge: './icons/icon-192.png', vibrate: [300, 100, 300, 100, 300],
    dir: 'rtl', lang: 'ar', requireInteraction: true, tag: d.tag || 'alarm',
    actions: [{ action: 'done', title: '✓ تم' }, { action: 'snooze', title: '⏰ تأجيل' }]
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    if (cs.length > 0) { cs[0].focus(); cs[0].postMessage({ type: 'alarm-action', action: e.action, tag: e.notification.tag }); }
    else clients.openWindow('./');
  }));
});

/* Alarm check from stored reminders */
async function checkAlarms() {
  const cs = await clients.matchAll({ type: 'window', includeUncontrolled: true });
  if (cs.length > 0) return; // app is open, let it handle
  try {
    const cache = await caches.open(CACHE);
    const resp = await cache.match('/alarms-data');
    if (!resp) return;
    const data = await resp.json();
    const reminders = data.reminders || [];
    const now = new Date();
    const nm = now.getHours() * 60 + now.getMinutes();
    reminders.forEach(r => {
      r.times.forEach((slot, idx) => {
        if (slot.done) return;
        const [h, m] = slot.time.split(':').map(Number);
        const slotMins = h * 60 + m;
        const diff = Math.abs(nm - slotMins);
        if (diff <= 1) {
          const cats = { prayer: '🕌', meds: '💊', study: '📚', gym: '🏋️', checkup: '🩺', custom: '✨' };
          self.registration.showNotification(`${cats[r.cat] || '🔔'} ${r.title}`, {
            body: r.note || 'حان وقت التنبيه!', icon: './icons/icon-192.png',
            badge: './icons/icon-192.png', vibrate: [300, 100, 300, 100, 300],
            dir: 'rtl', requireInteraction: true, tag: `${r.id}-${idx}`,
            actions: [{ action: 'done', title: '✓ تم' }, { action: 'snooze', title: '⏰ تأجيل 5د' }]
          });
        }
      });
    });
  } catch (e) {}
}
