# In-App Purchases — how they work & how to ship them

## What the code now does (legit, validated purchases)

Theme packs are **non-consumable** purchases, validated **server-side**:

1. User taps buy → `purchaseProduct()` runs Apple's native checkout (real money).
2. The app sends the **App Store receipt** to the `validatePurchaseSecure` Cloud
   Function.
3. That function verifies the receipt with **Apple** (`verifyReceipt`, production
   with automatic sandbox fallback), confirms the bundle ID, reads which packs the
   receipt proves ownership of, and grants the matching themes by writing
   `unlockedThemes` with the Admin SDK.
4. `unlockedThemes` is **server-only** — `firestore.rules` forbids clients from
   writing it. So a user cannot self-grant packs; the only way in is a real,
   Apple-verified purchase.
5. **Restore Purchases** re-verifies the receipt and re-grants (idempotent via
   `arrayUnion`). The 6 default themes are always free.

> The earlier client-trusted flow (client wrote `unlockedThemes` directly) and the
> "Reset Theme Purchases (Developer Test)" button have been removed.

Product IDs (must match everywhere — StoreKit file, code, App Store Connect):

```
cozy_pack  y2k_glam_pack  weeb_pack  screamo_pack
teen_idol_pack  skateland_punk_pack  file_share_pack  socialite_gossip_pack
```

---

## What YOU must do to make them production-ready

### 1. Provide the Apple shared secret (required — validation fails without it)
App Store Connect → **Apps → (your app) → In-App Purchases**, or **Users and
Access → Integrations → In-App Purchase** → generate the **App-Specific Shared
Secret**. Then store it as a Firebase secret:

```sh
firebase functions:secrets:set APPLE_SHARED_SECRET
# paste the secret when prompted
```

⚠️ The functions deploy will **fail** if `APPLE_SHARED_SECRET` doesn't exist yet,
because `validatePurchaseSecure` declares it. Set it before `npm run
deploy:functions`.

### 2. Business setup in App Store Connect (one-time)
- **Agreements, Tax, and Banking** → sign the **Paid Apps Agreement** and complete
  banking + tax forms. IAP products stay "Missing Metadata"/non-submittable until
  this is done.

### 3. Create the 8 products in App Store Connect
For each product ID above: **App → In-App Purchases → +**, type **Non-Consumable**,
set:
- **Product ID** — exactly as listed above (case-sensitive).
- **Reference Name** — e.g. "Otaku Legends Pack".
- **Price** — the $1.99 tier.
- **Localized display name + description** (shown on the App Store sheet).
- **Review screenshot** — a screenshot of the store/checkout UI (Apple requires one
  per product).

### 4. Submit the IAPs WITH the app
On a brand-new app, **at least one in-app purchase must be submitted together with
the first app version** (attach them in the version's "In-App Purchases" section),
or Apple won't review them. Submit all 8 with v1.

### 5. Test in sandbox before submitting
- Create a **Sandbox Apple ID**: App Store Connect → Users and Access → Sandbox →
  Testers.
- On a real device, sign that account into **Settings → App Store → Sandbox
  Account** (or you'll be prompted at purchase).
- Build to the device, buy a pack, confirm:
  - the purchase sheet shows the right price,
  - the theme unlocks **after** server validation,
  - deleting + reinstalling, then **Restore Purchases**, re-unlocks it,
  - `unlockedThemes` appears on your user doc in Firestore.
- The Cloud Function auto-falls back to Apple's sandbox endpoint (status 21007), so
  the same code path works for sandbox, TestFlight, and production.

### 6. `.storekit` file
`asl_purchases.storekit` is for **local Xcode testing only** (StoreKit Testing in
the simulator) — it is NOT App Store Connect. Keep the product IDs in sync with it.

---

## Optional hardening (post-launch)
- Bind `original_transaction_id` → uid to stop one Apple ID's receipt unlocking
  packs on multiple app accounts (low risk for cosmetic themes).
- Migrate from `verifyReceipt` (works, but Apple is steering people off it) to the
  **App Store Server API (StoreKit 2 / JWS)** — the plugin already returns
  `jwsRepresentation`, so it's a server-side swap when you want it.
