# Push Notifications — Future Plan

Status: **Deferred.** Not currently implemented. This document captures the design and tradeoffs so we can pick it up later.

## Why defer

Push notifications require backend infrastructure that conflicts with our "minimal infrastructure" goal. Most use cases we have today (announcements, new content) can be handled by a CDN-polled announcements JSON file — no backend, works on PWA too.

Revisit push when we have a real-time use case: social features, live events, friend activity.

## What push enables

- **Announcements** — "2 new states available!" (see also: CDN announcement alternative below)
- **Events/promos** — "Weekend scavenger hunt: find 10 Military plates"
- **Re-engagement** for lapsed users (richer than local notifications)
- **Social features** — friend activity, leaderboards, invites
- **Urgency** — anything time-sensitive where "next app open" isn't fast enough

## What push requires

| Requirement | Effort |
|---|---|
| Apple Developer APNs certificate/key | ~1 hour in Apple Developer portal (free) |
| Backend service (store tokens, send pushes) | The big cost — see options below |
| Privacy policy update | Required — must disclose push data collection |
| App Store opt-in/permission flow | Required on iOS |
| `@capacitor/push-notifications` plugin wiring | 1-2 hours |

## Backend options

| Approach | Cost | Fits "minimal infrastructure"? |
|---|---|---|
| **Firebase Cloud Messaging (FCM)** | Free tier handles millions of pushes | Yes — Google manages APNs relay, send via a simple HTTP endpoint |
| **OneSignal** | Free up to 10k users | Yes — dashboard-based, no code to send |
| **Self-hosted (Node + APNs)** | $5–10/mo VPS | No |
| **AWS SNS / Azure Notification Hubs** | Pay-per-use, ~free at small scale | Medium |

Recommended if/when we adopt push: **FCM** or **OneSignal**. Neither requires us to run a server.

## The CDN announcement alternative

For most "broadcast a message to all users" needs, a CDN-polled JSON file is simpler:

```json
// https://cdn.example.com/every-pl8/announcements.json
{
  "id": "2026-04-15-new-states",
  "message": "2 new states available: Colorado and Connecticut!",
  "publishedAt": "2026-04-15"
}
```

App fetches on launch, compares `id` against last-seen, shows a banner if new.

**Pros:**
- Zero backend — just a JSON file on Cloudflare R2
- Works on PWA too (iOS PWA can't receive pushes)
- No privacy policy changes, no opt-in flow
- No APNs setup
- User sees it on next app open — fine for non-urgent content

**Cons:**
- Not real-time (acceptable trade-off for announcements)
- User must open the app (push can reach them)

Build this **first** if we need to broadcast anything. Only move to push when a use case genuinely requires real-time delivery.

## PWA impact

Push notifications do **not** work in iOS PWAs. If we add push, it's iOS-native-only. The CDN announcement approach works on both PWA and native, which is another reason to prefer it for general-purpose broadcasts.

## Implementation outline (when we're ready)

1. Generate APNs Auth Key in Apple Developer portal, upload to FCM/OneSignal
2. Install `@capacitor/push-notifications`
3. Register for push on first launch (behind a settings toggle)
4. Send device token to backend on registration
5. Handle `pushNotificationReceived` (foreground) and `pushNotificationActionPerformed` (tap) events
6. Update privacy policy
7. Add "Push notifications" toggle in Settings → Display
8. Test silent push, actionable notifications, notification categories

## Related work already in place

- `@capacitor/local-notifications` — scheduled local notifications (daily reminder, inactivity tickler, badge proximity). Does NOT require a backend.
- CDN migration plan (memory: `project_cdn_plan.md`) — already scoped; would enable the announcement JSON approach.
