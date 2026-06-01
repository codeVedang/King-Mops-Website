# King Brand Mops D2C Website

Full-stack e-commerce implementation for King Brand Mops / Sri Tirumala Products. The project follows the June 2026 SRS: React + Vite storefront, admin panel, Express API, Firebase Auth/Firestore/Storage, Razorpay checkout, role-protected admin routes, and Firebase security rules.

## What Is Included

- Customer storefront: home, product listing, category filters, search, sorting, pagination, product detail, cart, checkout, order confirmation, and account order history.
- Customer auth: email/password registration, Firebase mobile OTP verification, Firebase email verification, Google OAuth, and password reset.
- Checkout: saved delivery address option, GST and delivery calculation, Razorpay order creation, Razorpay Checkout, backend HMAC-SHA256 signature verification, and Firestore order creation only after verification.
- Admin panel at `/admin`: separate login screen, server-side role check, analytics dashboard, recent orders, revenue chart, order status breakdown, order management, CSV export, product management, Firebase Storage image upload, soft delete, and read-only customer management.
- Firebase deliverables: Firestore rules, Storage rules, and Firebase config file.
- Local no-secret demo mode so the UI can be inspected before real Firebase and Razorpay values are added.

## Project Structure

```text
client/                 React/Vite app
server/                 Express REST API
firebase/               Firestore and Storage security rules
dist/                   Frontend production build output
```

## Environment Setup

Copy the examples and fill the real values after Firebase and Razorpay are ready:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Client variables:

```bash
VITE_API_BASE_URL=/api
VITE_RAZORPAY_KEY_ID=rzp_test_your_public_key_id
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

The supplied `google-services.json` is an Android client config. It provides the project id, storage bucket, project number, and API key, but Firebase Web Auth is most reliable with an actual Web App config from Firebase Console.

Server variables:

```bash
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=...
RAZORPAY_KEY_ID=rzp_test_your_public_key_id
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

The Razorpay key secret belongs only in `server/.env`. Do not add it to any `VITE_` variable.

## Run Locally

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`
Backend health: `http://localhost:5000/api/health`

Without full Firebase Admin credentials, demo fallback stays available. Demo admin login:

```text
admin@kingmops.local
admin123
```

## Firebase Setup

1. Create a Firebase project.
2. Enable Email/Password, Phone, and Google providers in Firebase Auth.
3. Create Firestore in production mode.
4. Enable Firebase Storage.
5. Create a web app and paste the Firebase web config into `client/.env`.
6. Create a service account key and paste `project_id`, `client_email`, and `private_key` into `server/.env`.
7. Create the first admin user in Firebase Auth, then create a Firestore document at `users/{uid}`:

```json
{
  "name": "King Mops Admin",
  "email": "admin@example.com",
  "phone": "9876543210",
  "role": "admin",
  "admin": true,
  "addresses": [],
  "createdAt": "server timestamp"
}
```

8. Deploy rules:

You can also seed/update the initial admin from `server/.env`:

```bash
npm run seed:admin
```

The seed script creates or updates the Firebase Auth user, writes `role: "admin"` and `admin: true` to Firestore, and sets admin custom claims.

```bash
firebase deploy --only firestore:rules,storage
```

## Razorpay Setup

1. Use test keys during development.
2. Put `RAZORPAY_KEY_ID` in both client and server env files.
3. Put `RAZORPAY_KEY_SECRET` only in `server/.env`.
4. Configure webhook URL to `/api/payments/webhook` if webhook events are enabled.
5. Switch to live keys only after Firebase rules and backend deployment are verified.

## Deployment

Frontend can be deployed to Vercel or Netlify with the `npm run build` command and `dist` as output.

Backend can be deployed to Render or Railway with:

```bash
npm install
npm run server
```

Set `FRONTEND_ORIGIN` to the deployed frontend URL and keep all server secrets in the backend host only. Enforce HTTPS in the hosting dashboard for both frontend and backend.

## Data Model

`products`: `id`, `name`, `category`, `description`, `pricePaise`, `mrpPaise`, `stock`, `images[]`, `specs[]`, `isActive`, `isFeatured`, `createdAt`.

`orders`: `id`, `userId`, `items[]`, `subtotalPaise`, `gstPaise`, `deliveryPaise`, `totalAmountPaise`, `paymentMethod`, `paymentStatus`, `razorpayPaymentId`, `razorpayOrderId`, `orderStatus`, `address`, `createdAt`.

`users`: `uid`, `name`, `email`, `phone`, `phoneVerified`, `addresses[]`, `role`, `admin`, `createdAt`.
