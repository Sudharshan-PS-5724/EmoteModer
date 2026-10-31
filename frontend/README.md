# EmoteModer frontend

This folder is the React/Vite browser application. It is separate from the Express API so the visual app can be deployed as static files while database credentials and AI requests stay private on the backend.

## Important folders

- `src/App.jsx` - client routes, authentication gates, and lazy-loaded screens.
- `src/components/` - landing, dashboard, chat, gallery, profile, demo, and Modobot UI.
- `src/hooks/useAuth.jsx` - Firebase Google sign-in state.
- `src/hooks/useMoodBoards.js` - authenticated moodboard API calls.
- `src/hooks/useChat.js` - direct Firestore live-chat subscription and typing state.
- `src/lib/api.js` - attaches a fresh Firebase ID token to protected API requests.
- `src/firebase.js` - initializes Firebase from `VITE_FIREBASE_*` values.
- `src/design-system.css` and `src/index.css` - shared visual tokens and responsive styles.

## Browser routes

| URL | Sign-in needed? | Purpose |
| --- | --- | --- |
| `/` | No | Landing page; signed-in people go to their dashboard. |
| `/login` | No | Google sign-in and demo entry point. |
| `/demo` | No | Static guided tour. Nothing is sent to Firebase, MongoDB, or the API. |
| `/gallery` | No | Public moodboards only. |
| `/dashboard` | Yes | Create, browse, and delete personal moodboards. |
| `/chat` | Yes | Choose and join a live community mood room. |
| `/profile` | Yes | View the signed-in profile. |

## Environment and commands

Create `frontend/.env` from `.env.example`. Only names beginning with `VITE_` reach browser code. Firebase web configuration belongs here; it identifies the Firebase app and is safe to be public. Never put an Admin SDK private key, MongoDB URI, or AI credential in it.

For a separately hosted API, set `VITE_BACKEND_URL=https://your-api.example`. Leave it unset locally; Vite proxies `/api` to port 5000.

```sh
npm run dev --prefix frontend
npm run lint --prefix frontend
npm run build --prefix frontend
```

The full-stack guide is in the repository [README](../README.md).
