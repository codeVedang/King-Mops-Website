import { initializeApp } from 'firebase/app';
import {
  getAnalytics,
  isSupported as isAnalyticsSupported,
  logEvent
} from 'firebase/analytics';
import {
  browserLocalPersistence,
  getAuth,
  setPersistence
} from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const requiredFirebaseConfig = {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId
};

export const isFirebaseConfigured = Object.values(requiredFirebaseConfig).every(Boolean);

export const firebaseApp = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const storage = firebaseApp ? getStorage(firebaseApp) : null;
export const analyticsPromise =
  firebaseApp && firebaseConfig.measurementId
    ? isAnalyticsSupported()
        .then((supported) => (supported ? getAnalytics(firebaseApp) : null))
        .catch(() => null)
    : Promise.resolve(null);

export const trackAnalyticsEvent = async (eventName, params = {}) => {
  const analytics = await analyticsPromise;
  if (analytics) {
    logEvent(analytics, eventName, params);
  }
};

if (auth) {
  setPersistence(auth, browserLocalPersistence).catch(() => {});
}
