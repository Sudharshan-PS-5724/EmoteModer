# Deploy EmoteModer: Vercel frontend + Render API

This guide deploys the frontend to Vercel and the Express API to Render. The two services are separate: Vercel hosts browser files, while Render holds secrets, calls MongoDB, and talks to AI services.

## Before you deploy

Have these ready:

- a working MongoDB Atlas connection string;
- a Firebase project with Google Authentication and Firestore enabled;
- Firebase web-app values from **Project settings → General → Your apps**;
- Firebase Admin SDK values from **Project settings → Service accounts**;
- the public Vercel URL you will use for the frontend.

Never put `MONGO_URI`, `FIREBASE_PRIVATE_KEY`, or any provider key into Vercel. The frontend is public JavaScript, so every `VITE_...` value is visible to visitors.

## Part 1: Deploy the backend on Render

The included [`render.yaml`](../render.yaml) is a safe blueprint. You can connect the repository in Render and choose **New → Blueprint**, or create a Web Service manually with the same settings.

### Render service settings

| Render field | Value |
| --- | --- |
| Runtime | Node |
| Root directory | `backend` |
| Build command | `npm ci` |
| Start command | `npm run start:prod` |
| Health check path | `/api/health` |

### Render environment variables

Add these under **Environment**. Paste the private key with its line breaks preserved, or use the same escaped `\n` format as `backend/.env`.

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | Your exact Vercel origin, for example `https://your-project.vercel.app` |
| `MONGO_URI` | MongoDB Atlas connection string |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Service-account client email |
| `FIREBASE_PRIVATE_KEY` | Service-account private key |

Deploy, then open `https://YOUR-RENDER-SERVICE.onrender.com/api/health`. A correctly configured production service returns an `OK` response with MongoDB connected and Firebase Admin configured. Do not continue until this works.

### MongoDB Atlas networking

Atlas must allow the Render service's outbound connection. Add the appropriate deployment egress network access according to your Atlas and Render configuration. Do not solve this by permanently allowing the entire internet unless you have accepted that security trade-off and applied a strong least-privilege database user.

## Part 2: Deploy the frontend on Vercel

Import the same repository into Vercel. The included [`vercel.json`](../vercel.json) builds `frontend`, serves `frontend/dist`, and sends client-side routes such as `/demo` and `/chat` to the React app.

Add these Vercel environment variables for **Production**, then redeploy:

| Variable | Value |
| --- | --- |
| `VITE_BACKEND_URL` | The complete Render origin, for example `https://your-api.onrender.com` - no trailing slash |
| `VITE_FIREBASE_API_KEY` | Firebase web app API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket value |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase web app ID |

After Vercel gives you its production URL:

1. Set Render's `FRONTEND_URL` to that exact origin and redeploy Render.
2. In Firebase Authentication, add the Vercel hostname under **Authentication → Settings → Authorized domains**.
3. Deploy the repository Firestore rules from a local terminal: `firebase deploy --only firestore`.
4. Visit the Vercel app, sign in, create a private board, send a chat message, and test Modobot.

## Render sleep: what can and cannot be fixed

Render's free web service can sleep after inactivity. **No code inside this repository can guarantee that a free Render instance stays awake.** A health endpoint helps Render check a running service, but it does not change the free-plan sleep policy.

Choose one of these approaches:

1. **Best for a real public app:** move the API to a paid always-on Render instance or another always-on host. This is the only reliable no-cold-start option.
2. **Fine for a demo:** accept the first request after inactivity may take longer. The endpoint `/api/health` gives you a simple link to open before demonstrating.
3. **Only if Render's current terms allow it:** use an external monitor to request `https://YOUR-API.onrender.com/api/health` periodically. This may keep a demo warmer, but it can stop working at any time, may be against a provider's free-plan intent, and is not a production reliability strategy. Do not depend on it without checking Render's current policy.

The frontend already turns a slow API request into a clear retry message after 20 seconds. That is a better user experience than silently failing, but an always-on backend is still the correct solution for launch.

## SEO, browser chrome, and social sharing

The frontend now includes a branded SVG favicon, web manifest, robot rules, a descriptive landing-page title, standard description/Open Graph/Twitter metadata, and route-specific browser titles/descriptions. The theme color changes with the in-app light/dark toggle, which lets supported mobile browsers color their address/status bar to match.

This is a client-rendered Vite app. Search engines that execute JavaScript can see route-specific metadata; social crawlers often read only the first HTML response. If rich per-board social cards become important, add server-side rendering or pre-rendered public-gallery/board pages and generate a real PNG Open Graph image. Do not claim per-board SEO before that work exists.

## Deployment checks

```sh
npm run check:config
npm test
npm run lint --prefix frontend
npm run build
```

Finally, use your deployed Vercel URL-not `localhost`-to verify Firebase Google sign-in. If it fails, check the Firebase authorized-domain entry, Render `FRONTEND_URL`, Vercel `VITE_BACKEND_URL`, and the browser's network request to `/api/health`.
