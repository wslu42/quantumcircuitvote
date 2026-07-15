# Firebase data model

```text
sessions/{sessionId}/
  experiment/
    title
    instructions
    circuitSource
    circuit
    updatedAt
  round/
    id
    status: draft | open | closed
    allowMultiple
  counts/{outcome}: number
```

Publishing replaces the current experiment, creates a new round identifier, sets the round to `draft`, and clears prior counts. Opening and closing responses only changes `round/status`. Student votes use a Realtime Database transaction.

The browser stores a key containing the session and round IDs to enforce the default one-response-per-browser behavior. This is classroom friction, not authentication or a security boundary.

Firebase configuration is read from `VITE_FIREBASE_*` variables. The legacy project settings are fallback defaults so the existing deployment continues to work; deployments can override every value using `.env.example`.

## Security status

The Author and Host routes use Firebase Authentication with Google Sign-In and only admit the verified account `wslu42@gmail.com`. The database rules independently enforce the same account restriction for experiment, round, and count-reset writes. Anonymous students retain public read access and may only create a count at `1` or increment an existing count by exactly one.

Before deploying, enable Google in Firebase Console under **Authentication → Sign-in method**, ensure `wslu42.github.io` is listed under **Authentication → Settings → Authorized domains**, and publish `firebase.rules.json` from **Realtime Database → Rules**. A GitHub Pages deployment does not deploy Realtime Database rules.

The browser-storage vote marker remains classroom friction rather than an identity boundary. Anonymous students can clear local storage or call the public increment operation directly, so add per-student authentication before using response counts in an adversarial setting.
