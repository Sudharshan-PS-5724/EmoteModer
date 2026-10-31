# EmoteModer API reference

Base URL: local development uses `http://localhost:5000`. The Vite frontend normally calls relative `/api/...` URLs and proxies them locally. A deployed frontend can use `VITE_BACKEND_URL`.

All API responses are JSON. Request bodies must be JSON and are capped at 1 MB.

## Authentication

Protected endpoints require this header:

```http
Authorization: Bearer <Firebase ID token>
```

The browser obtains the token from Firebase Authentication. Do not invent a token, pass a user ID in request JSON, or send the Firebase Admin private key. The API verifies the token, requires a verified Google sign-in, then resolves the MongoDB user.

Common protected-route errors:

| Status | Meaning |
| --- | --- |
| `401` | Missing, expired, revoked, or invalid Firebase sign-in. |
| `403` | The provider is not verified Google sign-in. |
| `409` | A legacy account-linking conflict needs manual resolution. |
| `429` | The route's limit was reached; check `Retry-After`. |
| `503` | Firebase Admin or MongoDB is temporarily unavailable. |

## Public endpoints

### `GET /api/health`

Reports whether MongoDB and Firebase Admin are configured. In production it returns `503` when dependencies are not ready; development can return `200` with `DEGRADED` so UI work remains possible.

```json
{
  "status": "OK",
  "message": "EmoteModer API",
  "mongodb": { "connected": true },
  "firebaseAdminConfigured": true
}
```

### `GET /api/moodboards/public`

Returns public moodboard previews. It does not require sign-in and never exposes a board owner ID.

Query options:

| Name | Meaning |
| --- | --- |
| `limit` | Optional integer 1–100. Default 30. |
| `cursor` | Opaque cursor from the previous response's `X-Next-Cursor` header. |

The response is an array. A page with more results sends `X-Next-Cursor`; clients must pass it unchanged rather than constructing one.

## Profile endpoint

### `GET /api/user` (protected)

Returns the MongoDB profile linked to the verified Firebase identity.

```json
{
  "_id": "...",
  "firebaseUid": "...",
  "googleId": "...",
  "displayName": "A person",
  "email": "person@example.com",
  "photo": "https://...",
  "createdAt": "2026-10-25T00:00:00.000Z"
}
```

## Moodboards

### `GET /api/moodboards` (protected)

Returns the caller's board previews, newest first. Uses the same `limit` and `cursor` contract as the public endpoint. A preview contains no more than four board items plus `itemCount`; request a single board for all items.

### `GET /api/moodboards/:id` (protected)

Returns a complete board only if the caller owns it. Invalid IDs return `400`; missing or other-user boards both return `404` to avoid disclosing private board existence.

### `POST /api/moodboards` (protected)

Creates a board. Limit: 10 requests per minute per user, per API process.

```json
{
  "title": "A slow Sunday",
  "description": "Tea, window light, and no alarms.",
  "mood": "happy",
  "isPublic": false,
  "items": [
    { "type": "color", "content": "#e8b343", "position": { "x": 40, "y": 30 } },
    { "type": "text", "content": "leave space for nothing", "position": { "x": 100, "y": 160 } },
    { "type": "image", "content": "https://images.example.com/window.jpg", "position": { "x": 220, "y": 30 } }
  ]
}
```

Validation rules:

- `title`: 1–80 characters.
- `description`: optional, up to 500 characters.
- `mood`: one of `happy`, `sad`, `angry`, `fear`, `disgust`, `surprise`, `neutral`.
- `isPublic`: optional boolean.
- `items`: optional array of at most 100 items.
- text item: non-empty, up to 4,000 characters.
- colour item: exactly `#RRGGBB`.
- image item: durable `https://` URL, up to 2,048 characters; `blob:` URLs are rejected.
- positions: optional finite `x`/`y` values from 0 to 10,000.

The API sets ownership itself. It adds `detectedEmotion` and `emotionConfidence` when analysis succeeds, but a board is still created when optional analysis fails.

### `DELETE /api/moodboards/:id` (protected)

Deletes a board only for its owner. Returns `{ "message": "Mood board deleted" }`, otherwise `404`.

## Emotion reflection

### `POST /api/analyze-emotion` (protected)

Limit: 10 requests per minute per user, per API process.

```json
{ "text": "I had a small win today and feel lighter." }
```

`text` is required and limited to 4,000 characters. The response contains `emotion`, `confidence`, `model`, and details such as keywords. It is an optional reflection, not a diagnosis.

## Modobot

### `POST /api/chatbot` (protected)

Limits: 20 requests per minute and 200 requests per day per user, per API process.

```json
{
  "message": "I feel nervous about sharing my work.",
  "emotion": "fear",
  "history": [
    { "role": "user", "content": "I have something on my mind." },
    { "role": "assistant", "content": "I am here with you." }
  ],
  "includeMoodboardContext": false
}
```

Rules for input:

- `message` is required and up to 4,000 characters.
- `emotion` falls back to `neutral` unless it is a supported app mood.
- only the latest eight valid history entries are used, with each entry trimmed to 1,000 characters.
- `includeMoodboardContext` must be explicitly `true` before the server queries a summary of three latest boards.

Successful response:

```json
{ "reply": "That sounds like a lot to hold. What feels like the smallest next step?", "source": "kilo-free" }
```

If Kilo cannot reply, the API returns `source: "local-fallback"` with a local supportive response instead.

## Firestore is not an Express endpoint

Live chat uses Firestore directly, not `/api/chat`. The authoritative contract is [`firebase/firestore.rules`](../firebase/firestore.rules): verified Google users can list/get/create in allowed rooms; only a sender can delete their own message; message edits are rejected. The frontend uses at most 100 messages per room query.

Unknown `/api/...` paths return JSON `404`. Oversized request bodies return `413`, and malformed JSON returns `400`.
