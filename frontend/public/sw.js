const CACHE_NAME = 'cyberguard-pwa-v8-detail-sync';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          console.log('[SW] Purging stale cache key:', key);
          return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Always fetch fresh from network
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Push & Native Mobile Notification Listeners
self.addEventListener('push', (event) => {
  let data = { title: 'CyberGuard Threat Alert', body: 'Inbound threat intercepted!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'CyberGuard Threat Alert', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: '/shield.svg',
    badge: '/shield.svg',
    vibrate: [300, 100, 300, 100, 300],
    data: data,
    tag: 'cyberguard-quarantine-alert',
    requireInteraction: true,
    actions: [
      { action: 'allow', title: '🟢 ALLOW (Release)' },
      { action: 'drop', title: '🔴 DROP (Block IP)' }
    ]
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Native Notification Click Handler (Admin Quick Release / Block from Mobile Lockscreen or Shade)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;
  const threatId = event.notification.data && (
    event.notification.data.threat_id || 
    event.notification.data.id || 
    event.notification.data.quarantineId
  );

  // If Admin tapped quick action button "ALLOW" or "DROP" directly on phone notification
  if ((action === 'allow' || action === 'drop') && threatId) {
    const decision = action === 'allow' ? 'ALLOW' : 'DROP';
    const host = self.location.hostname || '127.0.0.1';
    const backendUrl = (host === 'localhost' || host === '127.0.0.1') ? 'http://127.0.0.1:8000' : `http://${host}:8000`;

    event.waitUntil(
      fetch(`${backendUrl}/api/v1/relay/quarantine/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threat_id: threatId, decision: decision, admin_notes: 'Decided via Native Mobile PWA Push Action' })
      })
      .then((r) => r.json())
      .then((res) => {
        console.log('Quarantine decision via Mobile Notification Action:', res);
      })
      .catch((err) => {
        console.error('Failed to decide quarantine via SW action:', err);
      })
    );
    return;
  }

  // Otherwise, user tapped notification body -> Focus or Open PWA window
  const urlToOpen = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
