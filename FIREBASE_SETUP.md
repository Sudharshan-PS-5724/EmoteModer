# Firebase Authentication and Firestore

Firebase Authentication is the single sign-in system for the browser, API, and Firestore. The browser sends its Firebase ID token to Express; Express verifies it with Firebase Admin before reading or writing MongoDB data. Firebase's verified Google identity links older MongoDB profiles.

## Configure Firebase Auth

1. In Firebase Console, select the project named by `VITE_FIREBASE_PROJECT_ID`. Open **Project settings → General → Your apps** and create or select a **Web app**. Copy that app's complete Firebase config into `frontend/.env`; do not reuse an API key from another Google Cloud project.
2. Open **Authentication → Get started** to initialize Firebase Authentication. Then open **Sign-in method**, enable **Google**, choose a support email, and save.
3. Open **Authentication → Settings → Authorized domains** and add `localhost` (required for newer Firebase projects) plus the production frontend host when applicable.
4. In Firebase **Project settings → Service accounts**, generate an Admin SDK private key. Copy its `project_id`, `client_email`, and `private_key` into backend `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`. Keep this private key only in the ignored `backend/.env` and the backend deployment's secret settings. Never put it in a `VITE_` variable or commit it.
5. Configure `MONGO_URI` and `FRONTEND_URL`, then stop and restart the Vite dev server so it reloads `frontend/.env`.

## `auth/configuration-not-found` on localhost

This response comes from Firebase before EmoteModer's API receives a request. It means the web API key cannot retrieve the Firebase Authentication configuration. In the selected Firebase project, initialize Authentication, enable Google, and replace the six `VITE_FIREBASE_*` values with a fresh config copied from **Project settings → General → Your apps → Web app**. Confirm that the API key and project ID come from the same web app, then restart Vite. If API-key restrictions were changed manually in Google Cloud, ensure the Firebase Authentication APIs remain allowed, or use the auto-provisioned Firebase key from the freshly copied config.

## Firestore rules

Deploy [`firebase/firestore.rules`](firebase/firestore.rules). Never use rules with `allow read, write: if true`. These rules require a Firebase Auth token, bind message and typing writes to the token UID, and prevent users from editing or deleting another person's messages. MongoDB board ownership retains the existing Google provider ID; Firebase UID is stored separately.

Every protected API route requires `Authorization: Bearer <Firebase ID token>`. The backend verifies the token signature, project, expiry, Google provider, and verified email with Firebase Admin. Do not trust a Firebase UID or profile sent by the browser as identity proof. Bearer auth also avoids cross-site session cookies when the frontend and API use separate hosting domains.

## Firestore free quota

Firebase's Spark plan does not require a payment method. If a free quota is exceeded, the affected Firebase request is denied until the provider's reset/availability rules allow it again; Spark does not automatically charge a card. Exact limits change, so check Firebase's current pricing and quota pages before launch rather than copying an old screenshot or number.

To deploy the included rules and indexes, install the Firebase CLI, select the same project used by the web app, and run `firebase deploy --only firestore` from the repository root. Review the selected project before deployment.

## Message retention

Firestore records include an `expiresAt` timestamp for future retention tooling: chat messages are marked for 30 days and typing indicators for 10 minutes. **Do not configure managed Firestore TTL while staying on the no-cost Spark plan:** Firebase bills TTL deletes and enabling it requires billing. The app works without it; expired records remain stored until you deliberately add a paid retention solution or manually remove test data. Chat rooms currently use `happy`, `sad`, `angry`, `fear`, `disgust`, and `surprise`.
