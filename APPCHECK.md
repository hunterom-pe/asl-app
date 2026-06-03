# Firebase App Check — activation runbook

App Check makes Firebase serve Firestore / Cloud Functions requests **only** when
they come from a genuine, untampered build of this app. It blocks scripted abuse
of the paid Gemini (`moderateText`) and Foursquare (`searchVenuesSecure`)
endpoints and bulk profile scraping — even from a caller holding a valid
anonymous auth token.

The client wiring already ships in `src/firebase.js` (`setupAppCheck`). It is
**inert** until you set the env vars below, so the steps here are what turn it on.

> ⚠️ **Golden rule:** never enable *enforcement* in the Firebase console until the
> "Verified requests" metric shows tokens arriving from real devices. Enforcing
> early locks out every user. Always: ship token-sending build → watch metric →
> then enforce.

---

## 1. Install the native attestation plugin (iOS = App Attest)

The Firebase JS SDK can't get a hardware-attested token inside a WKWebView on its
own. The client uses a `CustomProvider` that reads the token from a Capacitor
plugin:

```bash
npm install @capacitor-firebase/app-check
npx cap sync ios
```

This plugin requires the **native** Firebase iOS SDK to be configured in the
Xcode project:

1. In the Firebase console, download **`GoogleService-Info.plist`** for the iOS app.
2. Add it to `ios/App/App/` (drag into the Xcode project so it's in the bundle).
3. Ensure `FirebaseApp.configure()` runs at launch — the plugin's docs cover the
   `AppDelegate.swift` line if it isn't auto-added by `cap sync`.

(The plugin is referenced at runtime via `Capacitor.Plugins.FirebaseAppCheck`, so
if it isn't installed the client just leaves App Check off — nothing breaks.)

## 2. Register providers in the Firebase console

**Console → Build → App Check.**

- **iOS app → App Attest:** register the app, enter the **Apple Team ID**. (App
  Attest needs a real device + a provisioning profile; it does not run in the
  Simulator.)
- **Web app (only if you also ship the hosted web build) → reCAPTCHA v3:** create
  a site key and paste it; the client uses it via `VITE_APPCHECK_RECAPTCHA_KEY`.

### Debug token for Simulator / local dev

App Attest can't run in the Simulator. To develop with App Check on:

1. Run the app once with `VITE_APPCHECK_DEBUG_TOKEN` set to any GUID you choose
   (or let the SDK print one to the console and copy it).
2. Console → App Check → your app → **Manage debug tokens** → add that token.

## 3. Environment variables

Add to `.env.production` (and `.env.local` for dev). All are optional — omit them
and App Check stays off.

```sh
# Master switch — App Check is fully inert unless this is set.
VITE_APPCHECK_ENABLED=true

# Web (hosted build) reCAPTCHA v3 site key. Not needed for the iOS app.
VITE_APPCHECK_RECAPTCHA_KEY=

# Dev / Simulator only. Must match a debug token registered in the console.
# NEVER set this in a real production build.
VITE_APPCHECK_DEBUG_TOKEN=
```

## 4. Staged rollout (the safe order)

1. **Ship a build with `VITE_APPCHECK_ENABLED=true`** (plugin installed, console
   providers registered). Enforcement still **off**.
2. **Watch** Console → App Check → APIs (Firestore, Cloud Functions). The
   "Verified requests" share should climb toward ~100% as real devices update.
3. Only once verified requests dominate and unverified are negligible, click
   **Enforce** on Cloud Functions, then Firestore.
4. Keep an eye on crash/error rates for a day after enforcing.

## 5. Rollback

- **Fastest:** Console → App Check → **un-enforce** the API (takes effect within
  minutes). No app update needed.
- **Client:** unset `VITE_APPCHECK_ENABLED` and rebuild to stop sending tokens.

## Notes

- App Check is defense-in-depth. It does **not** replace Firestore rules / the
  Cloud Function auth checks — keep both.
- The per-user rate limits and non-anonymous gates already in the functions
  remain the first line of defense; App Check stops the off-app traffic those
  can't.
