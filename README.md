# EmoteModer

EmoteModer is a web app for expressing feelings through moodboards, browsing boards people choose to share, joining live mood rooms, and chatting with an optional supportive AI companion. It is a product to share emotions in a social media type way, not a medical, mental-health, or crisis-support service.

## What the app does

| Feature | Behavior |
| --- | --- |
| Sign-in and profile | Google sign-in through Firebase Authentication; the profile and protected features require a verified Google account. |
| Moodboards | Compose and create personal boards, then view or delete them. Boards are private by default; public boards can appear in the gallery. Board data is stored in MongoDB through the API. |
| Public gallery | Browse paginated previews of boards explicitly marked public. The API does not include board-owner IDs in public responses. |
| Mood rooms | Join one of six shared, real-time rooms: happy, sad, angry, fear, disgust, or surprise. Messages and typing indicators use Cloud Firestore and its security rules. |
| Demo | Explore a guided sample experience. It uses browser state and does not write to an account or call the app's data services. |
| Emotion reflection | Receive an optional, non-clinical text/moodboard reflection. A local fallback is used if the optional Hugging Face service is not configured or available. |
| Modobot | Send a message to the backend for a supportive response. The backend uses Kilo when available and returns a local fallback if it cannot reply. Conversations are not persisted by this app. |

The board-context option for Modobot is off by default. When enabled, the backend can include only the titles, descriptions, and selected moods from the three latest boards—not board items or image links. The current prompt and any enabled summary are sent to the configured external AI provider.

## How it is built

- **Frontend:** React 18, React Router, Vite, and Firebase's browser SDK.
- **API:** Node.js and Express. It verifies Firebase ID tokens with Firebase Admin and handles profiles, moodboards, emotion analysis, and Modobot requests.
- **Persistence:** MongoDB stores profiles and moodboards. Cloud Firestore stores live room messages and typing indicators; the browser connects directly under Firestore Security Rules.
- **Identity:** Firebase Authentication with Google sign-in. The API derives account ownership from the verified token rather than trusting a user ID supplied by the browser.
- **Deployment:** The repository is configured for a Vercel frontend and a Render API. Firebase Authentication, Firestore, and MongoDB still need to be configured for each environment.

The demo is intentionally limited: images are HTTPS links rather than uploads; rooms are shared rather than private; there are no direct messages, video calls, collaborative boards, or built-in moderation/reporting tools. API rate limits are held in process memory and are not shared across multiple API instances.

## Application routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page; signed-in users are redirected to their dashboard. |
| `/login` | Public | Google sign-in. |
| `/demo` | Public | Static guided demo. |
| `/gallery` | Public | Public moodboard gallery. |
| `/dashboard` | Signed in | Personal moodboards. |
| `/chat` | Signed in | Live mood rooms. |
| `/profile` | Signed in | Account profile. |

## Run locally

### Prerequisites

- Node.js **22 or newer** and npm.
- A MongoDB database (local or MongoDB Atlas).
- A Firebase project with Google Authentication and Cloud Firestore enabled.
- Firebase web-app configuration and Firebase Admin service-account credentials.

Install dependencies from the repository root:

```sh
npm ci
npm ci --prefix frontend
npm ci --prefix backend
```

Create local environment files. In PowerShell:

```powershell
Copy-Item frontend/.env.example frontend/.env
Copy-Item backend/.env.example backend/.env
```

Set the `VITE_FIREBASE_*` values in `frontend/.env` from the Firebase web app configuration. Set `MONGO_URI`, `FRONTEND_URL`, and `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` in `backend/.env`. Use the same Firebase project ID in both environments. Keep MongoDB and Firebase Admin credentials only in the backend environment; every `VITE_*` value is exposed in the browser build.

Start the frontend and API together:

```sh
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to the API at `http://localhost:5000`. The backend can start in a degraded local mode when MongoDB is unavailable, but database-backed features need a working database and protected features need valid Firebase Admin configuration. The frontend requires its Firebase web configuration at startup.

## Common commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run Vite and the watched Express API together. |
| `npm run dev:web` / `npm run dev:api` | Run only the frontend or API. |
| `npm run build` | Build the frontend into `frontend/dist`. |
| `npm start` | Build the frontend, then run the production API, which also serves the built frontend when present. |
| `npm test` | Run backend API, schema, rate-limit, and service tests. |
| `npm run lint --prefix frontend` | Lint the frontend. |
| `npm run check:config` | Validate local environment values without printing secrets. |
| `npm run check:config -- --connect` | Also check MongoDB connectivity and inspect configured collection indexes. |
| `npm run test:rules` | Run Firestore rules tests in the local emulator; requires Java and the Firebase CLI. |

## Configuration at a glance

**Frontend environment** (`frontend/.env`):

- Required Firebase web-app values: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and `VITE_FIREBASE_APP_ID`.
- Optional `VITE_BACKEND_URL` for a separately hosted API. Leave it unset for local development to use the Vite proxy.

**Backend environment** (`backend/.env`):

- `MONGO_URI` for MongoDB.
- `FRONTEND_URL` for the allowed frontend origin.
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` for Firebase Admin.
- Optional `HUGGING_FACE_API_KEY` and `HUGGING_FACE_MODEL` for provider-backed emotion analysis. Without a usable provider, analysis falls back locally.

Do not put backend secrets in frontend variables, source files, or public deployment settings. The config checker validates local files and does not print the secret values.

## Deploy

The supported deployment shape is a Vercel-hosted frontend and a separate Render-hosted API. Configure Firebase web values on Vercel and backend secrets on Render; set the API's allowed `FRONTEND_URL` to the exact frontend origin and the frontend's `VITE_BACKEND_URL` to the API origin. Firebase must authorize the deployed hostname, and the repository's Firestore rules must be deployed to the same Firebase project.

Free hosting services may sleep or pause; a health endpoint does not prevent that. Review provider quotas and terms before public use. See the deployment guide for the full setup and verification steps.

## Documentation

The documents in [`docs/`](docs/) describe the implementation and its operational boundaries:

- [Technical guide](docs/technical-guide.md) — architecture, data flow, routes, and runtime behavior.
- [API reference](docs/api-reference.md) — endpoints, authentication, request/response shapes, and limits.
- [Deployment guide](docs/deployment.md) — Vercel, Render, environment variables, and deployment checks.
- [Architecture diagram](docs/arch-diagram.md) — architecture and product design.
- [Architecture review](docs/architecture-review.md) — implemented decisions, security boundaries, and remaining launch work.
- [API and chat audit](docs/api-chat-audit.md) — implementation guarantees, validation record, and operational limits.
