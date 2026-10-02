/* Madhouse — background helper for lock-screen notifications.
   Pushes arrive with no data; this asks the Madhouse server what to show. */
var APP = 'https://script.google.com/macros/s/AKfycbzTqJTkZlwfPH6uiaSX5zuB434uXBGW49Ap8eXPtDcqD0ZTehTEAC4hHqdp9yp_SHbZKA/exec';
var KEY = new URL(self.location.href).searchParams.get('u') || '';

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (e) {
  e.waitUntil(
    fetch(APP + '?format=push&a=msg&k=' + KEY + '&t=' + Date.now())
      .then(function (r) { return r.json(); })
      .catch(function () { return { title: 'Madhouse', body: 'You have chores to do after school. Open Madhouse to check.', tag: 'chores' }; })
      .then(function (m) {
        return self.registration.showNotification(m.title || 'Madhouse', {
          body: m.body || '',
          tag: m.tag || 'madhouse',
          renotify: true,
          requireInteraction: true,        // stays on screen until she taps or swipes it
          vibrate: [300, 150, 300, 150, 300],
          data: { url: self.registration.scope + '?u=' + KEY }
        });
      })
  );
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) { if (list[i].url.indexOf(self.registration.scope) === 0) return list[i].focus(); }
    return self.clients.openWindow(url);
  }));
});
