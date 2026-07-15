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

Firebase configuration is read from `VITE_FIREBASE_*` variables. See `.env.example`.
