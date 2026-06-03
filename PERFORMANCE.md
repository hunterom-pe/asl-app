# Performance & cost notes

## What changed (read-cost reduction)

Firestore bills per document read. Several listeners previously streamed **entire
collections** to every client and filtered in JS — so per-client cost grew with
the whole database. These are now bounded:

| Surface | Before | After |
|---|---|---|
| Venue feed | stream all posts, filter by venueId in JS | `where("venueId","==")` + `limit(100)` |
| Venue "fans" | stream all profiles, filter in JS | `where("favorited_bars","array-contains")` + `limit(50)` |
| Global feed | stream all posts | `orderBy("timestamp","desc")` + `limit(200)` |
| Total-posts stat | 2nd full-collection stream | derived from the global feed (listener removed) |
| Active-buddies stat | download all active profiles to count | `getCountFromServer` aggregation (1 read) |

Venue search results are also cached in-memory for 5 min (`foursquare.js`) to cut
repeat Cloud Function / Foursquare calls.

No composite indexes are required — every query uses a single equality, single
range, single `array-contains`, or single-field `orderBy`, all auto-indexed.

## Operational follow-ups (no code; do in console / gcloud)

### 1. Native Firestore TTL for post expiry (recommended)
The client only sweeps expired posts that fall inside the bounded feed window, so
posts from inactive users can linger in storage. Add a **Firestore TTL policy** on
the `posts` collection keyed on a timestamp field so Google auto-deletes them:

- Posts already store `timestamp`. Either point the TTL policy at a dedicated
  `expiresAt` field (set it in `createPostSecure` to `now + 7 days`) or at
  `timestamp` with a 7-day offset via a scheduled function.
- Console → Firestore → TTL → create policy. Deletion is free and server-side.

Lingering docs don't cost *reads* (queries are bounded), only storage — so this is
a storage-hygiene / correctness item, not an urgent cost leak.

### 2. App Store review data
Reviewer mode now only relocates the reviewer to Cupertino; the old client-side
demo seeding was removed (it wrote `users/tom` + posts + connections directly,
which the security rules / secure Cloud Functions reject in production — it only
ever worked in the local mock backend). To give Apple reviewers something to see,
**seed demo content into the production database** for a Cupertino venue (a couple
of posts authored by a demo account), e.g. via the Admin SDK seed scripts.

## If you outgrow the current bounds
The global feed is capped at 200 newest posts and several views filter that set
client-side (radar/favorites/my-posts). That's correct and cheap at launch scale.
If active posts regularly exceed ~200, move those views to their own server-side
queries (e.g. a dedicated `where("userId","==",me)` listener for "my posts", and
`where("venueId","in", favoritedBarIds)` batched in 10s for the favorites feed)
rather than raising the global limit.
