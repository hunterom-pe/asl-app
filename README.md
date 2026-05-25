# asl

**asl** is a retro dial-up missed connections portal built with React, Vite, and Tailwind/Vanilla CSS, styled with late 90s and early 2000s web aesthetics (MySpace profile dialogs, AIM messaging layout, Winamp music player widgets, and vintage Windows dialogs).

It's a digital bulletin board designed to help you reconnect with the people who crossed your path last night—like that friend you made in the bathroom line, or that 10/10 you met sharing a lighter outside the venue.

---

## 📟 Key Features

### 1. Active Winamp Streaming Bridge
- **Headless Audio Mount:** Integrates the official Spotify IFrame API script to programmatically load and stream track URIs without authentication walls.
- **Vintage Controller Mapping:** Features custom SVG vector buttons mapping the play and pause icons to controller play/pause triggers.
- **Autoplay Compliance Gate:** Displays a blinking high-contrast `>> CLICK PLAY TO TUNE IN <<` overlay over the player display screen, instantly clearing once the user initiates streaming and audio resolves.

### 2. High-Stakes Signal Handshakes
- **Proof-of-Connection Verification:** Missed connections are claimed using blind proof answers. Posters can verify the responder's claim or purge the signal.
- **Lockout Cooldown Constraints:** Purging a transmission deletes the connection request and enforces a strict 12-hour lockout cooldown timestamp on the responder.
- **One-and-Done Throttle:** Users are limited to a maximum of one concurrent pending claim at a time to prevent signal flooding.

### 3. Spite-Ban Safety Shield
- **Rate-Throttled Reporting:** Restricts warning reports to a maximum of 3 reports per day per user.
- **Trust Scopes:** Reports from anonymous users, accounts newer than 48 hours, or users without active chat links are silently ignored to prevent system abuse.
- **Strike 3 Hardware Lock:** 
  - **Strike 2:** Displays a warning alerting the user that a 3rd strike triggers a hardware lockout.
  - **Strike 3:** Triggers a hardware blacklist based on local UUID, logs out the user, clears the DOM, and locks the browser into a full-screen **Blue Screen of Death (BSOD)**.

### 4. SysOp Terminal & Auditor Backdoor
- **Monochromatic Operator Console:** Navigating to `/sysop` launches a vintage green-on-black terminal portal.
- **Admin Management:** Authenticated operators can review user ban appeals, reinstate suppressed posts, unban blacklisted device IDs, and monitor active nodes.
- **Audit Trails:** All SysOp actions write to a secure, write-only `admin_audit_log` collection in Firestore.

### 5. Gemini 3.5 Flash Moderation & Slang Roasts
- **AI-Powered Gatekeeper:** Leverages Gemini 3.5 Flash to automatically check new posts and claim submissions for doxxing (full names, numbers), handles, spam, or cringe.
- **Retro Slang Roasts:** When submissions fail moderation, the application displays a retro gray error box containing a randomly selected slang roast targeting the specific violation (e.g. `"Bro tried to sneak a social handle in. We don't do that here."`).

### 6. Dynamic MySpace Aesthetics
- **Flat Layouts:** Clean, flat 1px borders, cobalt titlebars (`#003399`), hot pink buttons (`#ff007f`), and custom retro theme options.
- **Scroll-locked Dashboard:** Includes a user profile widget, quick links, notification badge tracking, and a tabbed feed panel displaying "My Radar" (favorited venues) and "Global Feed".

---

## 🛠️ Tech Stack
- **Frontend Framework:** React + Vite
- **Styling:** Custom retro CSS overrides (`src/index.css`)
- **Backend:** Firebase (Firestore rules, Authentication, and dynamic database simulation)
- **External Integration:** Foursquare API (geographic portal boundaries) & Spotify Embed API (Winamp audio bridge)

---

## 🚀 Setup & Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the local development server:
   ```bash
   npm run dev
   ```

3. Build the bundle for production:
   ```bash
   npm run build
   ```
