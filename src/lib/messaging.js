import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
} from 'firebase/messaging';

import { firebaseApp } from './firebase.js';
import { apiFetch } from './api.js';

let foregroundListenerInitialized = false;

async function getFirebaseMessaging() {
  const supported = await isSupported();

  if (!supported) {
    console.log('Firebase Messaging is not supported in this browser.');

    return null;
  }

  if (Notification.permission !== 'granted') {
    return null;
  }

  const serviceWorkerRegistration = await navigator.serviceWorker.register(
    '/firebase-messaging-sw.js',
    {
      scope: '/firebase-cloud-messaging-push-scope',
    },
  );

  const messaging = getMessaging(firebaseApp);

  return {
    messaging,
    serviceWorkerRegistration,
  };
}

function setupForegroundMessages(messaging) {
  if (foregroundListenerInitialized) {
    return;
  }

  foregroundListenerInitialized = true;

  onMessage(messaging, (payload) => {
    console.log('Foreground notification received:', payload);

    const title = payload.notification?.title || 'Church Portal';

    const body = payload.notification?.body || '';

    if (Notification.permission !== 'granted') {
      return;
    }

    const notification = new Notification(title, {
      body,
      icon: '/icon-192.png',
      data: payload.data || {},
    });

    notification.onclick = () => {
      const targetUrl = payload.data?.url || '/member/announcements';

      window.focus();
      window.location.href = targetUrl;
    };
  });
}

async function registerNotificationToken(messaging, serviceWorkerRegistration) {
  const token = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration,
  });

  if (!token) {
    console.log('No FCM registration token available.');
    return null;
  }

  await apiFetch('/notifications/token', {
    method: 'POST',
    body: JSON.stringify({
      token,
      platform: 'web',
    }),
  });

  return token;
}

export async function requestNotificationPermission() {
  try {
    const supported = await isSupported();

    if (!supported) {
      console.log('[Notifications] Firebase Messaging is not supported');

      return null;
    }

    if (Notification.permission === 'denied') {
      console.log('[Notifications] Notifications are blocked');

      return null;
    }

    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.log('[Notifications] Permission was not granted');

      return null;
    }

    const token = await initializeMessaging();

    return token;
  } catch (error) {
    console.error('[Notifications] Failed:', error);

    return null;
  }
}

export async function initializeMessaging() {
  try {
    const result = await getFirebaseMessaging();

    if (!result) {
      return null;
    }

    const { messaging, serviceWorkerRegistration } = result;

    setupForegroundMessages(messaging);

    return await registerNotificationToken(
      messaging,
      serviceWorkerRegistration,
    );
  } catch (error) {
    console.error('Failed to initialize Firebase Messaging:', error);

    return null;
  }
}
