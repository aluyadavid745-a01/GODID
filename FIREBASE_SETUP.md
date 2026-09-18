# GODID Firebase setup

The storefront supports an explicit local demo mode. The preferred non-Firebase demo backend is now `server/`, an Express + PostgreSQL API. The older Firebase files remain available for reference but are no longer needed for browser login.

## Express + PostgreSQL demo

From the project root:

```bash
docker compose up -d postgres
cp server/.env.example server/.env
cd server
npm run dev
```

Set `VITE_API_BASE_URL=http://localhost:8787` and `VITE_DEMO_MODE=false` in the frontend `.env.local`, then start Vite in a second terminal. Change `ADMIN_PASSWORD` in `server/.env`; it stays server-side and is never bundled into the frontend.

For another device to reach a local demo, deploy the API and frontend or use a network-accessible host. `localhost` only points to the device being used.

## 1. Create the Firebase project

1. Create a project at https://console.firebase.google.com.
2. Enable Firestore in production mode.
3. Enable Authentication with Email/Password.
4. Enable Storage.
5. Add a Web App and copy its config into a local `.env` using `.env.example`.
6. Install the web SDK: `npm install firebase`.
7. Install the Firebase CLI: `npm install -g firebase-tools`.
8. Run `firebase login` and copy `.firebaserc.example` to `.firebaserc`, replacing the project id.

9. Set `VITE_API_BASE_URL` to the deployed `api` function URL in the hosting environment. Keep `VITE_DEMO_MODE=false`.

## 2. Install and deploy the Node.js functions

From the project root:

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only firestore:rules,firestore:indexes,storage,functions
```

The deployed API exposes:

- `GET /api/health`
- `POST /api/orders`
- `GET /api/orders/track?orderNumber=%23COL-10294&email=customer@example.com`
- `POST /api/admin/orders/:orderId`

## 3. Create an admin user

Create the user in Firebase Authentication, then set the custom `admin: true` claim using a trusted environment with the Firebase Admin SDK. Never put a service-account key or Admin SDK credentials in Vite variables.

## Data shape

Create product documents under `products/{productId}` using the existing GODID product shape. The backend reads `variants`, `images`, `price`, `salePrice`, and `status` when creating an order. Product image files belong under the Storage `products/` path and their public download URLs should be stored in the product `images` array.

## WhatsApp

The website continues opening a prefilled WhatsApp message to `+234 705 541 9856`. No payment gateway is required. If automatic WhatsApp Business messages are added later, call Meta from a Cloud Function and keep the access token in Firebase Functions secrets.
