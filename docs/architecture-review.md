# Architecture review

This is the operational companion to the [technical guide](technical-guide.md). It focuses on why the current architecture was chosen, what it protects, and what still needs work before a broad production launch.

## Decisions that are already implemented

| Decision | Reason |
| --- | --- |
| React/Vite frontend + Express API | Keeps the visual application fast while allowing secrets and business rules to stay on the server. |
| Firebase Authentication | Google sign-in produces signed, revocable ID tokens for both the browser and API. No custom password database is needed. |
| MongoDB for profiles and boards | Moodboards are naturally nested documents, and MongoDB supports owner and public-feed queries with compact indexes. |
| Firestore for room chat | It supplies real-time listeners and security rules for direct browser chat writes. |
| Server-side Kilo call | Prevents the browser from calling an untrusted model endpoint and provides central limits and fallback behavior. |

## Security boundaries

- Firebase web config is public app identity and is placed in frontend environment variables.
- Firebase Admin credentials, MongoDB URI, and optional Hugging Face key are backend-only secrets.
- Express verifies Firebase ID tokens before loading a MongoDB user or operating on a board.
- MongoDB board ownership comes from the verified user record, never from request JSON.
- Firestore rules independently enforce the six-room allowlist, verified Google identity, sender-owned messages, bounded reads, and immutable messages.
- API error responses stay JSON, request bodies are bounded, and user-facing API responses use `Cache-Control: no-store`.

## Database efficiency

`users` uses unique identity fields and an email index for safe legacy linking. `moodboards` uses compound owner and public-feed indexes and cursor pagination based on `updatedAt` plus `_id`. Board list endpoints return a maximum of four items as a preview, avoiding repeated transfer of full boards.

Firestore chat reads are bounded to 100 documents. This limits initial reads and matches the rules. Typing records are separate from messages so frequent keystroke updates do not rewrite conversation documents.

## AI boundaries

The local/Hugging Face emotion classifier stores only compact result metadata on a board. Modobot uses Kilo only for the current conversation request. Opt-in board context is minimized to title, description, and selected mood from three recent boards. Neither feature is clinical, and no model result should silently replace the mood selected by the user.

## Launch work still required

1. Run `npm run test:rules` after installing Java and Firebase CLI, then deploy the rules to the correct project.
2. Verify the real MongoDB URI, indexes, backup/restore procedure, and existing-user linking against a safe staging database.
3. Add deployment-wide rate limiting and monitoring if more than one API instance will run. Current limits are process-local.
4. Define moderation/reporting and abuse response before marketing community rooms widely.
5. Add object storage and upload scanning before accepting uploaded media. Current image support is HTTPS links only.
6. Publish privacy, retention, and acceptable-use policies before collecting real public community content.
7. Keep Firestore Spark free by leaving managed TTL disabled; manually clean demonstration data or make an explicit paid-retention decision later.
