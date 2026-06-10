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

// ── 25 Mock Users for Cupertino ──
const USERS_TO_SEED = [
  { key: "u_steve", email: "steve.fan@asl.com", username: "steve_jobs_fan", theme: "classic", avatar: "🖥️💡👓", mood: "Inspired ⚡", bio: "Design is how it works. Cupertino native." },
  { key: "u_woz", email: "woz.legend@asl.com", username: "woz_legend", theme: "gameboy", avatar: "🕹️🔧📻", mood: "Chillin' 😎", bio: "Building things in my garage. HP calculator collector." },
  { key: "u_jony", email: "jony.al@asl.com", username: "aluminum_jony", theme: "classic", avatar: "📐⚪✨", mood: "Reflective 📖", bio: "Obsessed with CNC milled aluminum and white surfaces." },
  { key: "u_reviewer", email: "appstore.review@asl.com", username: "reviewer_appstore", theme: "sunset", avatar: "📱🧐🍎", mood: "Busy 🏙️", bio: "Checking metadata, testing guidelines. iPhone developer." },
  { key: "u_wizard", email: "wizard.code@asl.com", username: "code_wizard", theme: "cyberpunk", avatar: "💻☕🧙", mood: "Vibing ✨", bio: "Vim bindings everywhere. Writing compiler code on coffee." },
  { key: "u_siri", email: "siri.whisperer@asl.com", username: "siri_whisperer", theme: "cyberpunk", avatar: "🎙️🔮🌌", mood: "Happy 😊", bio: "Speaking to neural nets all day. Whisper secrets to me." },
  { key: "u_cocoa", email: "cocoa.toucher@asl.com", username: "cocoa_toucher", theme: "classic", avatar: "🍫📱⌨️", mood: "Reflective 📖", bio: "Subclassing NSObject since 2008. Swift is my language." },
  { key: "u_swift", email: "swiftie.dev@asl.com", username: "swiftie_dev", theme: "sunset", avatar: "🐦🔥💅", mood: "Excited ⚡", bio: "Safety, speed, and expressive syntax. Swift UI advocate." },
  { key: "u_glass", email: "glassmorphic@asl.com", username: "glassmorphic", theme: "glitter", avatar: "🔮💎✨", mood: "Creative 🎨", bio: "If it's not translucent with a backdrop-filter, I don't want it." },
  { key: "u_infinite", email: "infinite.runner@asl.com", username: "infinite_runner", theme: "sunset", avatar: "🏃‍♂️🌀💨", mood: "Happy 😊", bio: "Lapping Infinite Loop at lunch. 5k runner." },
  { key: "u_espresso", email: "double.shot@asl.com", username: "double_shot", theme: "classic", avatar: "☕⚡☕", mood: "Caffeinated ☕", bio: "Caffe Macs bar regular. I know the grind." },
  { key: "u_keynote", email: "keynote.master@asl.com", username: "keynote_master", theme: "classic", avatar: "📊🎬🎩", mood: "Sassy 💅", bio: "Magic Move transition is the cure for boring presentations." },
  { key: "u_transistor", email: "silicon_sally@asl.com", username: "silicon_sally", theme: "cyberpunk", avatar: "🔌⚡👩‍💻", mood: "Inspired ⚡", bio: "Custom silicon design. Nanometer precision." },
  { key: "u_retail", email: "genius.barfly@asl.com", username: "genius_barfly", theme: "classic", avatar: "🛠️🍎🍺", mood: "Tired 😴", bio: "Explaining how iCloud works to grandparents. Beer please." },
  { key: "u_dongle", email: "dongle_life@asl.com", username: "dongle_life", theme: "classic", avatar: "🔌📦🙃", mood: "Mellow 🎧", bio: "USB-C to headphone jack, HDMI, Ethernet, and SD card." },
  { key: "u_laser", email: "laser.etcher@asl.com", username: "laser_etcher", theme: "cyberpunk", avatar: "⚡🔴🎨", mood: "Creative 🎨", bio: "Engraving names on iPad backs. Clean lines only." },
  { key: "u_compiler", email: "llvm.coder@asl.com", username: "llvm_coder", theme: "classic", avatar: "💾🛠️⚙️", mood: "Reflective 📖", bio: "Optimizing ASTs. Zero-cost abstractions are my drug." },
  { key: "u_halo", email: "halo.ring@asl.com", username: "halo_ring", theme: "sunset", avatar: "🪐🔘✨", mood: "Vibing ✨", bio: "Walking the Apple Park ring. 1.2 miles of spaceship architecture." },
  { key: "u_solder", email: "solder.queen@asl.com", username: "solder_queen", theme: "gameboy", avatar: "📻🔥🛠️", mood: "Happy 😊", bio: "Lead-free solder, hot air stations, and custom mechanical keyboards." },
  { key: "u_vision", email: "spatial.spud@asl.com", username: "spatial_spud", theme: "cyberpunk", avatar: "🥽👾🌌", mood: "Dreamy 🌌", bio: "Living in simulated coordinates. Vision Pro dev." },
  { key: "u_unboxing", email: "unboxing.asmr@asl.com", username: "unboxing_asmr", theme: "glitter", avatar: "📦✂️✨", mood: "Excited ⚡", bio: "Peeling the screen plastic off pristine Apple hardware." },
  { key: "u_vintage", email: "vintage.newton@asl.com", username: "vintage_newton", theme: "classic", avatar: "📟📝📂", mood: "Nostalgic 📼", bio: "Green screen PDA collector. Handwriting recognition is fine." },
  { key: "u_darkmode", email: "dark.mode.only@asl.com", username: "dark_mode_only", theme: "cyberpunk", avatar: "🕶️🖤🌑", mood: "Emo 🖤", bio: "RGB 0, 0, 0 is the only acceptable background color." },
  { key: "u_designer", email: "pixel_pusher@asl.com", username: "pixel_pusher", theme: "sunset", avatar: "📐🖌️💻", mood: "Creative 🎨", bio: "Kerning is everything. 1px misalignment keeps me awake." },
  { key: "u_corgi", email: "campus_corgi@asl.com", username: "campus_corgi", theme: "classic", avatar: "🐕🐾🌳", mood: "Friendly 🙂", bio: "Chasing squirrels in Apple Park lawn. Pet me please!" }
];

// ── 25 Posts (one per user) ──
const POSTS_TO_SEED = [
  { userKey: "u_steve", venueIdx: 0, text: "Saw someone with a classic Macintosh SE/30 T-shirt near the espresso bar. You smiled when I mentioned HyperCard. Next latte is on me?" },
  { userKey: "u_woz", venueIdx: 1, text: "Had a great conversation about dial-up modems and blue boxes near the bar last night. You had a retro Apple II pins collection. Let's connect!" },
  { userKey: "u_jony", venueIdx: 2, text: "Locked eyes with a designer carrying a vintage translucent Bondi Blue iMac sketch. You were sitting near the olive trees. Let's chat." },
  { userKey: "u_wizard", venueIdx: 3, text: "You were playing darts and hit three bullseyes in a row! I was the guy with the mechanical keyboard. Let's grab another pint of draft ale." },
  { userKey: "u_reviewer", venueIdx: 4, text: "To the person with the golden retriever who shared their patio table: let's chat about native iOS guidelines again!" },
  { userKey: "u_siri", venueIdx: 0, text: "You were speaking to your phone using voice commands in a British accent, ordering a cortado. I was the developer sitting next to you laughing at the Siri reply. Let's chat." },
  { userKey: "u_cocoa", venueIdx: 1, text: "You had a green Xcode laptop decal and were debugging a memory leak in Instruments. I offered to help, but got distracted by our coffee delivery. Let's get another drink." },
  { userKey: "u_swift", venueIdx: 2, text: "Locked eyes at the Visitor Center Cafe. You had a custom orange Swift logo on your tote bag. I wanted to ask what you were building, but you hopped on a shuttle. Find me!" },
  { userKey: "u_glass", venueIdx: 3, text: "You were explaining CSS backdrop-filters to a friend over a plate of fish & chips. I was admiring your designer eye from the next table. Let's grab a beer!" },
  { userKey: "u_infinite", venueIdx: 4, text: "We kept pacing each other on the Stevens Creek running trail, then both ended up at the Lazy Dog bar. You had custom blue running shoes. Let's talk splits." },
  { userKey: "u_espresso", venueIdx: 5, text: "You ordered a quadruple shot of espresso and drank it straight. Respect. You had black glasses and a retro Apple Park map printed on your shirt. Let's get coffee again." },
  { userKey: "u_keynote", venueIdx: 0, text: "You were fine-tuning a presentation with incredible slide transitions, showing a sleek new hardware concept. I sat next to you looking over. Beautiful work." },
  { userKey: "u_transistor", venueIdx: 1, text: "You were reading a textbook on VLSI chip design and drinking an IPA. I haven't seen anyone read physical engineering books in forever. You looked awesome." },
  { userKey: "u_retail", venueIdx: 2, text: "Blue shirt employee with the kind eyes who helped me reset my Apple Watch. You spent 20 minutes making sure I didn't lose my workout data. Let's get a drink after your shift?" },
  { userKey: "u_dongle", venueIdx: 3, text: "You lent me your USB-C to USB-A adapter so I could present my demo. I completely forgot to return it to you before leaving! Let me buy you a drink to return it." },
  { userKey: "u_laser", venueIdx: 4, text: "You had a laser-engraved steel flask and were showing your friends custom typography layout designs. I was sitting at the corner booth watching. Let's connect!" },
  { userKey: "u_compiler", venueIdx: 5, text: "We argued about LLVM compiler flags vs GCC at the bar. You were incredibly smart and passionate about optimization. I'd love to continue the debate." },
  { userKey: "u_halo", venueIdx: 0, text: "You had an Apple Park campus badge and were walking the loop path listening to music. We smiled as we passed each other. Let's walk together sometime." },
  { userKey: "u_solder", venueIdx: 1, text: "You had solder burns on your hands and a beautiful custom split mechanical keyboard on the table. I was the one asking about your keycaps. Let's chat gear." },
  { userKey: "u_vision", venueIdx: 2, text: "You were wearing a spatial computing headset and typing in mid-air. You looked hilarious but also futuristic. I was the one grinning from the bench. Let's meet." },
  { userKey: "u_unboxing", venueIdx: 3, text: "You were unboxing a brand new device at the table and the sound of the cardboard peel tab made us both laugh. Let's do an unboxing together." },
  { userKey: "u_vintage", venueIdx: 4, text: "You were taking notes on an old Apple Newton message pad! I couldn't believe my eyes. I was the guy with the retro Casio watch who asked about it. Let's chat vintage tech." },
  { userKey: "u_darkmode", venueIdx: 5, text: "You were wearing a matte black hoodie, typing in a dark theme editor. We locked eyes when the bartender turned on the neon sign. Let's meet in the dark." },
  { userKey: "u_designer", venueIdx: 0, text: "You were sketching layouts on an iPad Pro with a paper-like screen protector. The scratching sound was soothing. You had a great style. Next coffee on me?" },
  { userKey: "u_corgi", venueIdx: 2, text: "To the girl who threw the tennis ball for my corgi at the lawn: you had a great laugh and a green backpack. Let's get a coffee and walk the pup again!" }
];

// ── 8 Connections (5 accepted, 3 pending) ──
const CONNECTIONS_TO_SEED = [
  { senderKey: "u_wizard", postIdx: 0, status: "accepted", proofText: "OMG that was me! I still develop HyperCard stacks. I remember your retro glasses!" },
  { senderKey: "u_woz", postIdx: 2, status: "pending", proofText: "I was sketching the iMac! The Bondi Blue color is timeless. Let's meet up." },
  { senderKey: "u_siri", postIdx: 0, status: "accepted", proofText: "I was wearing that Macintosh SE/30 shirt! I love HyperCard so much. Let's get that latte!" },
  { senderKey: "u_corgi", postIdx: 4, status: "accepted", proofText: "That was my corgi, Barnaby! He loved the attention. Let's definitely talk iOS guidelines over coffee." },
  { senderKey: "u_cocoa", postIdx: 7, status: "pending", proofText: "I had that Swift logo bag! I was heading to Cupertino Transit Center. Let's chat Swift UI!" },
  { senderKey: "u_infinite", postIdx: 2, status: "accepted", proofText: "Yes, I was the runner with the blue shoes! Those Stevens Creek sprints are killer. Let's get a drink!" },
  { senderKey: "u_espresso", postIdx: 5, status: "pending", proofText: "I needed that quad shot for a late release! Let's get espresso." },
  { senderKey: "u_designer", postIdx: 23, status: "accepted", proofText: "I love drawing layouts on the patio! Thanks for noticing my sketches. Let's get that coffee." }
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
        if (err.code === "auth/email-already-in-use" || err.code === "auth/email-already-exists") {
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
