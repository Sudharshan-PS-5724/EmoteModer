# API and chat verification notes

For endpoint inputs and outputs, use the [API reference](api-reference.md). For the full architecture, use the [technical guide](technical-guide.md). This page is a short verification record and a practical handoff list.

## Current guarantees

- Protected Express endpoints require a verified Firebase Google identity and create/read MongoDB data only through that identity.
- Board payloads are validated at the HTTP layer and in the MongoDB schema. Board access is owner-only; the public feed removes owner identity.
- Lists are bounded and cursor-paginated. A feed preview has at most four board items.
- Chat is direct Firestore traffic protected by versioned Firestore rules. Only the message author can delete a message; no one can edit one.
- Supported rooms come from one shared room list used by the frontend and rule tests.
- There are no meeting rooms, participant pools, private rooms, video calls, automatic media uploads, or application analytics collections.
- Modobot has a provider timeout, server-side limits, minimized opt-in board context, and a local fallback response.

## Checks already run in this workspace

| Check | Result |
| --- | --- |
| `npm test` | 12 backend/API/schema/rate-limit/AI regression tests passed. |
| `npm run lint --prefix frontend` | Passed. |
| `npm run build --prefix frontend` | Passed. |
| `npm audit` | No known package vulnerabilities after the local-development tooling update. |
| `npm run dev` | Started Vite and the watched API successfully. |

## Check before each deployment

1. Run `npm run check:config`; it checks required local configuration without exposing secrets.
2. Run the tests above.
3. Install Java and Firebase CLI, then run `npm run test:rules`. It uses a loopback Firestore emulator and never targets production data.
4. Deploy rules with `firebase deploy --only firestore` from the repository root and confirm the selected Firebase project.
5. In a staging environment, test Google sign-in, private board ownership, public gallery disclosure, send/delete chat, and Modobot's provider and fallback replies.
6. Check MongoDB connectivity and indexes against the actual deployment database; a unit test cannot prove network access or provider IAM permissions.

## Known operational limits

- API rate limits are memory-local to one Express process. Use an external, deployment-level control before scaling to multiple instances.
- Firestore rules limit shape and identity but cannot replace community moderation, reporting, or abuse operations.
- Spark-plan Firestore remains free only while its current quota and product rules are respected. This repository intentionally does not enable managed TTL because it needs billing. `expiresAt` does not delete anything by itself.
- Free hosts and databases may sleep, pause, change quotas, or decline requests. Treat them as demonstration infrastructure and review provider terms before public use.
