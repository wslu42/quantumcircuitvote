# Firebase data model

```text
sessions/{sessionId}/
  lesson/
    lessonId
    title
    activeActivityId
    activeRoundId
    createdAt
  activities/{activityId}/
    id, sectionId, order, title, shortTitle
    studentInstructions, circuitSource, circuit
    expectedDistribution, conceptSummary
  rounds/{roundId}/
    id, activityId
    status: draft | open | closed | revealed
    allowMultiple
    createdAt, openedAt?, closedAt?
    counts/{outcome}: number
  reflections/{reflectionId}/
    id, roundId, text, createdAt
```

Activity snapshots make an existing class session reviewable even if a future application release changes its built-in template. Activating or repeating an activity creates a new round and changes only the active pointers; it never deletes history. Reset clears only the selected active round's counts.

## Legacy migration

Loading Foundations uses a multi-location update that adds `lesson`, `activities`, and a first `rounds/{id}` node. It does not replace the session root, so legacy `experiment`, `round`, `counts`, or `config` nodes remain intact. Lesson clients ignore those legacy nodes. There is no automatic conversion of old aggregate counts because they do not contain enough activity/round metadata.

## Security

Google-authenticated, verified `wslu42@gmail.com` may write lesson metadata, activity snapshots, round controls, and resets. Anonymous students have public read access and may only create an outcome count at `1` or increment an existing numeric count by exactly one. Reflections are create-only, limited to 280 characters, and accepted only for a revealed round.

Enable Google in **Firebase Authentication → Sign-in method**, add `wslu42.github.io` to **Authorized domains**, and separately publish `firebase.rules.json` in **Realtime Database → Rules**. GitHub Pages does not deploy rules.

Browser storage keys include the session and round ID. This reduces accidental duplicate responses but anonymous students can bypass it; student authentication is outside this task.
