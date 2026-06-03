import admin from "firebase-admin";
import { readFileSync } from "fs";

// Load Firebase credentials
const serviceAccount = JSON.parse(readFileSync("./functions/serviceAccount.json", "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

// ── Cupertino Venues ──
const CUPERTINO_VENUES = [
  { id: "venue_cafemacs", name: "Caffe Macs", city: "Cupertino", address: "1 Infinite Loop, Cupertino, CA 95014", zone: "HQ" },
  { id: "venue_infiniteloop", name: "Infinite Loop Lounge", city: "Cupertino", address: "2 Infinite Loop, Cupertino, CA 95014", zone: "HQ" },
  { id: "venue_applepark", name: "Apple Park Visitor Center Cafe", city: "Cupertino", address: "10600 N Tantau Ave, Cupertino, CA 95014", zone: "Campus" },
  { id: "venue_duke", name: "The Duke of Edinburgh", city: "Cupertino", address: "10801 N Wolfe Rd, Cupertino, CA 95014", zone: "Main Street" },
  { id: "venue_lazydog", name: "Lazy Dog Restaurant & Bar", city: "Cupertino", address: "19359 Stevens Creek Blvd, Cupertino, CA 95014", zone: "Main Street" },
  { id: "venue_oasis", name: "The Oasis Cupertino", city: "Cupertino", address: "Stevens Creek Blvd, Cupertino, CA 95014", zone: "Main Street" }
];

// ── 5 Mock Users for Cupertino ──
const USERS_TO_SEED = [
  { key: "u_steve", email: "steve.fan@asl.com", username: "steve_jobs_fan", theme: "classic", avatar: "🖥️💡👓", mood: "Inspired ⚡", bio: "Design is how it works. Cupertino native." },
  { key: "u_woz", email: "woz.legend@asl.com", username: "woz_legend", theme: "gameboy", avatar: "🕹️🔧📻", mood: "Chillin' 😎", bio: "Building things in my garage. HP calculator collector." },
  { key: "u_jony", email: "jony.al@asl.com", username: "aluminum_jony", theme: "classic", avatar: "📐⚪✨", mood: "Reflective 📖", bio: "Obsessed with CNC milled aluminum and white surfaces." },
  { key: "u_reviewer", email: "appstore.review@asl.com", username: "reviewer_appstore", theme: "sunset", avatar: "📱🧐🍎", mood: "Busy 🏙️", bio: "Checking metadata, testing guidelines. iPhone developer." },
  { key: "u_wizard", email: "wizard.code@asl.com", username: "code_wizard", theme: "cyberpunk", avatar: "💻☕🧙", mood: "Vibing ✨", bio: "Vim bindings everywhere. Writing compiler code on coffee." }
];

// ── 5 Posts (one per user) ──
const POSTS_TO_SEED = [
  { userKey: "u_steve", venueIdx: 0, text: "Saw someone with a classic Macintosh SE/30 T-shirt near the espresso bar. You smiled when I mentioned HyperCard. Next latte is on me?" },
  { userKey: "u_woz", venueIdx: 1, text: "Had a great conversation about dial-up modems and blue boxes near the bar last night. You had a retro Apple II pins collection. Let's connect!" },
  { userKey: "u_jony", venueIdx: 2, text: "Locked eyes with a designer carrying a vintage translucent Bondi Blue iMac sketch. You were sitting near the olive trees. Let's chat." },
  { userKey: "u_wizard", venueIdx: 3, text: "You were playing darts and hit three bullseyes in a row! I was the guy with the mechanical keyboard. Let's grab another pint of draft ale." },
  { userKey: "u_reviewer", venueIdx: 4, text: "To the person with the golden retriever who shared their patio table: let's chat about native iOS guidelines again!" }
];

// ── 2 Connections (1 accepted, 1 pending) ──
const CONNECTIONS_TO_SEED = [
  { senderKey: "u_wizard", postIdx: 0, status: "accepted", proofText: "OMG that was me! I still develop HyperCard stacks. I remember your retro glasses!" },
  { senderKey: "u_woz", postIdx: 2, status: "pending", proofText: "I was sketching the iMac! The Bondi Blue color is timeless. Let's meet up." }
];

async function run() {
  console.log("🚀 Seeding Cupertino users, posts, and handshakes...\n");
  
  const uidMap = {}; // key -> Firebase auth uid
  
  // ── Step 1: Create or Get Auth Users and set User profile documents ──
  for (const u of USERS_TO_SEED) {
    try {
      let uid;
      try {
        const userRecord = await admin.auth().createUser({
          email: u.email,
          password: "password123",
          displayName: u.username
        });
        uid = userRecord.uid;
        console.log(`Created Auth account: ${u.email} → uid: ${uid}`);
      } catch (err) {
        if (err.code === "auth/email-already-in-use") {
          const userRecord = await admin.auth().getUserByEmail(u.email);
          uid = userRecord.uid;
          console.log(`Auth account already exists: ${u.email} → uid: ${uid}`);
        } else {
          throw err;
        }
      }
      uidMap[u.key] = uid;
      
      // Save User Doc
      await db.collection("users").doc(uid).set({
        uid,
        email: u.email,
        username: u.username,
        mood: u.mood,
        bio: u.bio,
        emoji_avatar: u.avatar,
        profileTheme: u.theme,
        unlockedThemes: ["classic", "glitter", "cyberpunk", "sunset", "gameboy"],
        favorited_bars: ["venue_cafemacs", "venue_applepark"],
        homeCity: "Cupertino",
        selectedCity: "Cupertino",
        isAnonymous: false,
        flag_count: 0,
        banned: false,
        uuid: "seed_cupertino_" + u.key,
        createdAt: Date.now() - Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000)
      });
      
      // Save Public Profile Doc
      await db.collection("profiles").doc(uid).set({
        userId: uid,
        username: u.username,
        emoji_avatar: u.avatar,
        mood: u.mood,
        bio: u.bio,
        profileTheme: u.theme,
        homeCity: "Cupertino",
        selectedCity: "Cupertino",
        headline: "Cupertino missed connection portal."
      });
      
      console.log(`   Public Profile sync completed for ${u.username}`);
    } catch (err) {
      console.error(`❌ Error seeding user ${u.username}:`, err);
    }
  }

  // ── Step 2: Create 5 posts (assigned to users) ──
  console.log("\n📝 Creating Cupertino posts...");
  const createdPosts = [];

  for (let idx = 0; idx < POSTS_TO_SEED.length; idx++) {
    const postData = POSTS_TO_SEED[idx];
    const uid = uidMap[postData.userKey];
    if (!uid) {
      console.log(`   Skipping post idx ${idx} - user uid not found`);
      continue;
    }
    const user = USERS_TO_SEED.find(u => u.key === postData.userKey);
    const venue = CUPERTINO_VENUES[postData.venueIdx];

    const postDocRef = await db.collection("posts").add({
      userId: uid,
      username: user.username,
      emoji_avatar: user.avatar,
      mood: user.mood,
      profileTheme: user.theme,
      venueId: venue.id,
      venueName: venue.name,
      venueCity: venue.city,
      venueZone: venue.zone,
      venueAddress: venue.address,
      text: postData.text,
      timestamp: Date.now() - Math.floor(Math.random() * 4 * 24 * 60 * 60 * 1000), // within 4 days
      date: "Jun 3, 2026",
      timeRange: "12:15 PM",
      status: "active",
      thumbsUpCount: Math.floor(Math.random() * 5)
    });

    createdPosts.push({
      id: postDocRef.id,
      userId: uid,
      username: user.username,
      venueName: venue.name,
      text: postData.text
    });
    console.log(`   Created post ${postDocRef.id} by ${user.username} at ${venue.name}`);
  }

  // ── Step 3: Create 2 connections (1 accepted, 1 pending) ──
  console.log("\n🤝 Creating Cupertino connections...");
  for (let idx = 0; idx < CONNECTIONS_TO_SEED.length; idx++) {
    const connData = CONNECTIONS_TO_SEED[idx];
    const senderUid = uidMap[connData.senderKey];
    const senderUser = USERS_TO_SEED.find(u => u.key === connData.senderKey);
    const targetPost = createdPosts[connData.postIdx];

    if (!senderUid || !targetPost) {
      console.log(`   Skipping connection idx ${idx} - sender or target post not resolved`);
      continue;
    }

    // Add connection record
    const connDocRef = await db.collection("connections").add({
      postId: targetPost.id,
      postText: targetPost.text,
      venueName: targetPost.venueName,
      senderId: senderUid,
      senderUsername: senderUser.username,
      receiverId: targetPost.userId,
      receiverUsername: targetPost.username,
      proofText: connData.proofText,
      status: connData.status,
      timestamp: Date.now() - Math.floor(Math.random() * 12 * 60 * 60 * 1000) // within 12 hours
    });

    console.log(`   Created connection ${connDocRef.id} [${connData.status}] from ${senderUser.username} to ${targetPost.username}`);

    if (connData.status === "accepted") {
      // 1. Update the original post to "connected" status
      await db.collection("posts").doc(targetPost.id).update({
        status: "connected",
        connectedWithId: senderUid,
        connectedWithUsername: senderUser.username,
        connectedProofText: connData.proofText
      });
      console.log(`      Updated post ${targetPost.id} status to connected`);

      // 2. Add an associated chat document
      const chatDocRef = await db.collection("chats").add({
        connectionId: connDocRef.id,
        participants: [senderUid, targetPost.userId],
        lastMessage: "System: Connection accepted. Start chatting!",
        lastTimestamp: Date.now(),
        venueName: targetPost.venueName
      });
      console.log(`      Created AIM chat ${chatDocRef.id} for participants`);
    }
  }

  console.log("\n🌱 Cupertino Database seed completed successfully.");
  process.exit(0);
}

run().catch(err => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
