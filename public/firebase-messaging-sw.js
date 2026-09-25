importScripts(
  'https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js',
);

importScripts(
  'https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js',
);

firebase.initializeApp({
  apiKey: 'AIzaSyCRjnfzWZP--r03Qm1McbpXcUp0V2jZntA',
  authDomain: 'dominion-city-asaba-hq-portal.firebaseapp.com',
  projectId: 'dominion-city-asaba-hq-portal',
  storageBucket: 'dominion-city-asaba-hq-portal.firebasestorage.app',
  messagingSenderId: '559550118696',
  appId: '1:559550118696:web:c193ff880fc2f77d53ae1d',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Church Portal';

  const body = payload.notification?.body || 'You have a new notification.';

  self.registration.showNotification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: payload.data || {},
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/member/announcements';

  const absoluteUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin)) {
            client.navigate(absoluteUrl);
            return client.focus();
          }
        }

        return clients.openWindow(absoluteUrl);
      }),
  );
});
