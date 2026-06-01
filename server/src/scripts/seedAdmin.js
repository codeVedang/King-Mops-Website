import { env } from '../config/env.js';
import { firebaseAdmin, isFirebaseEnabled } from '../lib/firebaseAdmin.js';

if (!isFirebaseEnabled) {
  console.error('Firebase Admin is not configured. Check server/.env service-account values.');
  process.exit(1);
}

const email = process.env.INITIAL_ADMIN_EMAIL || 'admin@kingbrandmops.in';
const password = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@12345';
const name = process.env.INITIAL_ADMIN_NAME || 'King Mops Admin';
const phone = process.env.INITIAL_ADMIN_PHONE || '9876543210';

const auth = firebaseAdmin.auth();
const db = firebaseAdmin.firestore();

let userRecord;
try {
  userRecord = await auth.getUserByEmail(email);
  await auth.updateUser(userRecord.uid, {
    password,
    displayName: name,
    phoneNumber: `+91${phone}`,
    emailVerified: true
  });
} catch (error) {
  if (error.code !== 'auth/user-not-found') throw error;
  userRecord = await auth.createUser({
    email,
    password,
    displayName: name,
    phoneNumber: `+91${phone}`,
    emailVerified: true
  });
}

await db.collection('users').doc(userRecord.uid).set(
  {
    uid: userRecord.uid,
    name,
    email,
    phone,
    phoneVerified: true,
    appScope: env.appScope,
    role: 'admin',
    admin: true,
    addresses: [],
    updatedAt: new Date(),
    createdAt: new Date()
  },
  { merge: true }
);

await auth.setCustomUserClaims(userRecord.uid, { admin: true, role: 'admin' });

console.log(`Admin ready: ${email}`);
