import admin from 'firebase-admin';
import { env, hasFirebaseServiceAccount } from '../config/env.js';

let firebaseEnabled = false;

if (hasFirebaseServiceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.firebase.projectId,
        clientEmail: env.firebase.clientEmail,
        privateKey: env.firebase.privateKey
      }),
      storageBucket: env.firebase.storageBucket || undefined
    });
    firebaseEnabled = true;
  } catch (error) {
    console.warn('Firebase Admin failed to initialize. Falling back to demo mode.', error.message);
  }
}

export const isFirebaseEnabled = firebaseEnabled;
export const firebaseAdmin = firebaseEnabled ? admin : null;
export const db = firebaseEnabled ? admin.firestore() : null;
export const bucket =
  firebaseEnabled && env.firebase.storageBucket ? admin.storage().bucket() : null;
