/**
 * Seeding script Batch 3: Generates 50 users (25 Phoenix, 25 Austin),
 * 25 missed connection posts, 15 accepted claims (handshakes),
 * active chat rooms with AIM-style back-and-forth messages, and 10 lurkers.
 * 
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./functions/serviceAccount.json node seed_batch_3.cjs
 */
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// ── Venue Definitions (Phoenix & Austin) ──
const PHOENIX_VENUES = [
  { id: "venue_cobra",       name: "Cobra Arcade Bar",           address: "801 N 2nd St, Phoenix, AZ 85004",              city: "Phoenix", zone: "Downtown" },
  { id: "venue_valley",      name: "Valley Bar",                 address: "130 N Central Ave, Phoenix, AZ 85004",          city: "Phoenix", zone: "Downtown" },
  { id: "venue_gracies",     name: "Gracies Tax Bar",            address: "711 N 7th Ave, Phoenix, AZ 85007",              city: "Phoenix", zone: "Downtown" },
  { id: "venue_linger",      name: "Linger Longer Lounge",       address: "6522 N 16th St, Phoenix, AZ 85016",             city: "Phoenix", zone: "Downtown" },
  { id: "venue_caseys",      name: "Casey Moore's Oyster House",  address: "850 S Ash Ave, Tempe, AZ 85281",               city: "Phoenix", zone: "Tempe" },
  { id: "venue_yucca",       name: "Yucca Tap Room",             address: "29 W Southern Ave, Tempe, AZ 85282",            city: "Phoenix", zone: "Tempe" },
  { id: "venue_sunbar",      name: "Sunbar Tempe",               address: "24 W 5th St, Tempe, AZ 85281",                  city: "Phoenix", zone: "Tempe" },
  { id: "venue_bottled",     name: "Bottled Blonde",             address: "7340 E Indian Plaza, Scottsdale, AZ 85251",      city: "Phoenix", zone: "Old Town" },
  { id: "venue_riot",        name: "Riot House",                 address: "4425 N Saddlebag Trail, Scottsdale, AZ 85251",   city: "Phoenix", zone: "Old Town" },
  { id: "venue_coach",       name: "Coach House",                address: "7011 E Indian School Rd, Scottsdale, AZ 85251", city: "Phoenix", zone: "Old Town" },
  { id: "venue_theodore",    name: "The Theodore",               address: "110 E Roosevelt St, Phoenix, AZ 85004",         city: "Phoenix", zone: "Downtown" },
  { id: "venue_thunderbird", name: "Thunderbird Lounge",         address: "710 W Montecito Ave, Phoenix, AZ 85013",        city: "Phoenix", zone: "Midtown" }
];

const AUSTIN_VENUES = [
  { id: "venue_chalmers",              name: "Chalmers",                  address: "1700 E Cesar Chavez St, Austin, TX 78702",     city: "Austin", zone: "East Austin" },
  { id: "venue_central_machine",       name: "Central Machine Works",     address: "4824 E Cesar Chavez St, Austin, TX 78702",     city: "Austin", zone: "East Austin" },
  { id: "venue_dainty_dillo",          name: "Dainty Dillo",              address: "3201 E Cesar Chavez St, Austin, TX 78702",     city: "Austin", zone: "East Austin" },
  { id: "venue_armadillo_den",         name: "Armadillo Den",             address: "10001 Menchaca Rd, Austin, TX 78748",          city: "Austin", zone: "South Austin" },
  { id: "venue_moontower",             name: "Moontower Saloon",          address: "10203 Menchaca Rd, Austin, TX 78748",          city: "Austin", zone: "South Austin" },
  { id: "venue_little_darlin",         name: "The Little Darlin'",        address: "6507 Circle S Rd, Austin, TX 78745",           city: "Austin", zone: "South Austin" },
  { id: "venue_star_bar",              name: "Star Bar",                  address: "600 W 6th St, Austin, TX 78701",               city: "Austin", zone: "Downtown" },
  { id: "venue_parlor_yard",           name: "Parlor & Yard",             address: "601 W 6th St, Austin, TX 78701",               city: "Austin", zone: "Downtown" },
  { id: "venue_little_woodrows",       name: "Little Woodrow’s",          address: "520 W 6th St, Austin, TX 78701",               city: "Austin", zone: "Downtown" },
  { id: "venue_golden_goose",          name: "The Golden Goose",          address: "2034 S Lamar Blvd, Austin, TX 78704",          city: "Austin", zone: "South Lamar" },
  { id: "venue_black_sheep",           name: "Black Sheep Lodge",         address: "2108 S Lamar Blvd, Austin, TX 78704",          city: "Austin", zone: "South Lamar" },
  { id: "venue_barton_springs_saloon", name: "Barton Springs Saloon",     address: "424 S Lamar Blvd, Austin, TX 78704",          city: "Austin", zone: "South Lamar" },
  { id: "venue_bouldin_acres",         name: "Bouldin Acres",             address: "2027 S Lamar Blvd, Austin, TX 78704",          city: "Austin", zone: "South Lamar" }
];

const ALL_VENUES_MAP = {};
PHOENIX_VENUES.forEach(v => ALL_VENUES_MAP[v.id] = v);
AUSTIN_VENUES.forEach(v => ALL_VENUES_MAP[v.id] = v);

// ── 50 Customized Users (25 Phoenix, 25 Austin) ──
const USER_PROFILES = [
  // Phoenix Active Users (20)
  { key: "cyber_cactus",       city: "Phoenix", username: "cyber_cactus",       theme: "sunset",    avatar: "🌵💻✨", mood: "Happy 😊",          bio: "Surfing the web at 56k from the desert. Let's chat!" },
  { key: "retro_roosevelt",    city: "Phoenix", username: "retro_roosevelt",    theme: "classic",   avatar: "📸🎨🎨", mood: "Creative 🎨",       bio: "Roosevelt Row art walks and vintage Polaroid cameras." },
  { key: "gracies_regular",    city: "Phoenix", username: "gracies_regular",    theme: "classic",   avatar: "🍺👾🎲", mood: "Chillin' 😎",       bio: "Always at Gracie's Tax Bar drinking cheap beer." },
  { key: "viper_arcade",       city: "Phoenix", username: "viper_arcade",       theme: "cyberpunk", avatar: "🕹️🐍🔥", mood: "Excited ⚡",        bio: "Cobra Arcade high scorer. Beat my Pac-Man record!" },
  { key: "mill_ave_music",     city: "Phoenix", username: "mill_ave_music",     theme: "sunset",    avatar: "🎸📻🤘", mood: "Reflective 📖",     bio: "Yucca Tap Room band seeker. Music is life." },
  { key: "scottsdale_glam",    city: "Phoenix", username: "scottsdale_glam",    theme: "glitter",   avatar: "💅✨🍸", mood: "Ready to Party 🍹", bio: "Glitter and gloss. Spotted at Bottled Blonde." },
  { key: "desert_grooves",     city: "Phoenix", username: "desert_grooves",     theme: "cyberpunk", avatar: "🪩🎧🕺", mood: "Vibing ✨",         bio: "Dancing at Valley Bar. Let the bass line drop." },
  { key: "tempe_dreamer",      city: "Phoenix", username: "tempe_dreamer",      theme: "sunset",    avatar: "☀️🍹🌴", mood: "Happy 😊",          bio: "Sunbar patio vibes and college radio playlists." },
  { key: "polaroid_valley",    city: "Phoenix", username: "polaroid_valley",    theme: "classic",   avatar: "📷📼🌾", mood: "Nostalgic 📼",      bio: "Capturing downtown Phoenix on expired 35mm film." },
  { key: "glow_in_dark",       city: "Phoenix", username: "glow_in_dark",       theme: "cyberpunk", avatar: "💡⚡🌃", mood: "Excited ⚡",        bio: "Neon sign collector. Glowing through the desert heat." },
  { key: "cholla_chic",        city: "Phoenix", username: "cholla_chic",        theme: "classic",   avatar: "🌵☕👢", mood: "Reflective 📖",     bio: "Desert dweller. I love vintage denim and cold brews." },
  { key: "analog_heart",       city: "Phoenix", username: "analog_heart",       theme: "classic",   avatar: "📼❤️📻", mood: "Emo 🖤",            bio: "Cassette tapes are better than CDs. Change my mind." },
  { key: "valley_skater",      city: "Phoenix", username: "valley_skater",      theme: "classic",   avatar: "🛹🍺🍟", mood: "Chillin' 😎",       bio: "Skatetime at Tempe park, then beers at Casey's." },
  { key: "pixel_dust",         city: "Phoenix", username: "pixel_dust",         theme: "cyberpunk", avatar: "🎮🌌👾", mood: "Excited ⚡",        bio: "Gamer girl. Retro arcade cabinets are my sanctuary." },
  { key: "prickly_pearl",      city: "Phoenix", username: "prickly_pearl",      theme: "glitter",   avatar: "🌶️🍸✨", mood: "Crushing 😍",       bio: "Spicy margaritas and neon lights." },
  { key: "sonic_youth99",      city: "Phoenix", username: "sonic_youth99",      theme: "classic",   avatar: "🎸🎙️🖤", mood: "Rebellious ✊",     bio: "Grunge will never die. Checking out local shows." },
  { key: "sunset_runner",      city: "Phoenix", username: "sunset_runner",      theme: "sunset",    avatar: "RUN🏃‍♂️⛰️", mood: "Happy 😊",          bio: "Hiking Camelback, then relaxing at the Theodore." },
  { key: "velvet_underground", city: "Phoenix", username: "velvet_underground", theme: "classic",   avatar: "🍷🕯️📖", mood: "Reflective 📖",     bio: "Late night deep talks at Linger Longer Lounge." },
  { key: "downtown_diva",      city: "Phoenix", username: "downtown_diva",      theme: "glitter",   avatar: "🛼🪩💖", mood: "Ready to Party 🍹", bio: "Platform shoes and body glitter. Catch me on the dancefloor." },
  { key: "tempe_taps",         city: "Phoenix", username: "tempe_taps",         theme: "classic",   avatar: "🍻🍔🧢", mood: "Chillin' 😎",       bio: "Yucca Tap Room regular. IPA connoisseur." },

  // Phoenix Lurkers (5) - 0 posts, 0 claims
  { key: "phoenix_lurker",     city: "Phoenix", username: "phoenix_lurker",     theme: "classic",   avatar: "🍕🍕👀", mood: "Chillin' 😎",       bio: "Just browsing. Love the local food scene.", isLurker: true },
  { key: "cactus_silent",      city: "Phoenix", username: "cactus_silent",      theme: "classic",   avatar: "🌵🗺️📖", mood: "Reflective 📖",     bio: "Here for the bar recommendations.", isLurker: true },
  { key: "neon_ghost",         city: "Phoenix", username: "neon_ghost",         theme: "cyberpunk", avatar: "🌌🌃👻", mood: "Spacey 🚀",         bio: "Invisible observer of the downtown light trails.", isLurker: true },
  { key: "shadow_valley",      city: "Phoenix", username: "shadow_valley",      theme: "classic",   avatar: "☕📚🍺", mood: "Reflective 📖",     bio: "Quiet coffee shop reader. Occasionally out for drafts.", isLurker: true },
  { key: "quiet_chaser",       city: "Phoenix", username: "quiet_chaser",       theme: "sunset",    avatar: "🌅🏜️🚶", mood: "Happy 😊",          bio: "Only watching the sunsets.", isLurker: true },

  // Austin Active Users (20)
  { key: "austin_aim_god",     city: "Austin",  username: "austin_aim_god",     theme: "classic",   avatar: "🖥️💬🍺", mood: "Chillin' 😎",       bio: "AIM user since '97. Catch me at Chalmers beer garden." },
  { key: "keep_it_weird",      city: "Austin",  username: "keep_it_weird",      theme: "glitter",   avatar: "🎨🔮🌈", mood: "Creative 🎨",       bio: "East Austin artist. Let's keep things strange." },
  { key: "vinyl_dillo",        city: "Austin",  username: "vinyl_dillo",        theme: "classic",   avatar: "📻🦫🎼", mood: "Nostalgic 📼",      bio: "Collecting classic vinyl. Spotted at Barton Springs Saloon." },
  { key: "taco_trail",         city: "Austin",  username: "taco_trail",         theme: "sunset",    avatar: "🌮🍺🌶️", mood: "Happy 😊",          bio: "Looking for the best food truck tacos. Dainty Dillo fan." },
  { key: "south_lamar_soul",   city: "Austin",  username: "south_lamar_soul",   theme: "classic",   avatar: "🍔🍻🤠", mood: "Chillin' 😎",       bio: "Black Sheep Lodge burger critic. Draft beer only." },
  { key: "central_machine_chic",city: "Austin", username: "central_machine_chic",theme: "cyberpunk",avatar: "⚙️🍺🎸", mood: "Vibing ✨",         bio: "Industrial space fan. Love Central Machine Works." },
  { key: "moontower_magician", city: "Austin",  username: "moontower_magician", theme: "sunset",    avatar: "🏐🍹☀️", mood: "Excited ⚡",        bio: "Volleyball at Moontower. Cold pitchers, hot nights." },
  { key: "star_bar_star",      city: "Austin",  username: "star_bar_star",      theme: "glitter",   avatar: "🍹🌶️✨", mood: "Ready to Party 🍹", bio: "Bloody Marys at Star Bar are my weekend ritual." },
  { key: "parlor_princess",    city: "Austin",  username: "parlor_princess",    theme: "glitter",   avatar: "🎯🏓👑", mood: "Happy 😊",          bio: "Yard games champion at Parlor & Yard. Let's play." },
  { key: "little_darling_99",  city: "Austin",  username: "little_darling_99",  theme: "sunset",    avatar: "🐎🍺🌾", mood: "Chillin' 😎",       bio: "Horseshoes and washers in the spacious backyard." },
  { key: "pickleball_pioneer", city: "Austin",  username: "pickleball_pioneer", theme: "classic",   avatar: "🏓🥒🏃‍♂️", mood: "Excited ⚡",        bio: "Bouldin Acres pickleball expert. Paddle at the ready!" },
  { key: "retro_woodrow",      city: "Austin",  username: "retro_woodrow",      theme: "classic",   avatar: "🐢🍺🍿", mood: "Happy 😊",          bio: "Watching turtle racing at Little Woodrow's." },
  { key: "golden_goose_groove",city: "Austin", username: "golden_goose_groove",theme: "classic",   avatar: "🪩🍸📼", mood: "Nostalgic 📼",      bio: "70s decor and vintage jukebox at Golden Goose." },
  { key: "cyber_armadillo",    city: "Austin",  username: "cyber_armadillo",    theme: "cyberpunk", avatar: "💻🐕🌳", mood: "Spacey 🚀",         bio: "Moontower regular. Code by day, dogs by night." },
  { key: "neon_rainey",        city: "Austin",  username: "neon_rainey",        theme: "cyberpunk", avatar: "🍹💡🌃", mood: "Vibing ✨",         bio: "Rainey street nostalgic. Craft cocktail enthusiast." },
  { key: "east_side_vibe",     city: "Austin",  username: "east_side_vibe",     theme: "sunset",    avatar: "🎨🍺🌵", mood: "Creative 🎨",       bio: "East Austin galleries, backyard patios, cold drafts." },
  { key: "south_austin_goth",  city: "Austin",  username: "south_austin_goth",  theme: "classic",   avatar: "🦇🍷🔥", mood: "Emo 🖤",            bio: "Goth aesthetic under the hot Texas sun. Little Darlin patio." },
  { key: "slacker_99",         city: "Austin",  username: "slacker_99",         theme: "classic",   avatar: "💤🍺🎸", mood: "Chillin' 😎",       bio: "Slacker vibe. Hanging out at Barton Springs Saloon." },
  { key: "glitter_truck",      city: "Austin",  username: "glitter_truck",      theme: "glitter",   avatar: "🌮✨🎒", mood: "Ready to Party 🍹", bio: "Taco truck fan with a glittery backpack." },
  { key: "sunset_austin",      city: "Austin",  username: "sunset_austin",      theme: "sunset",    avatar: "🌅🌊🍹", mood: "Happy 😊",          bio: "Chasing lake sunsets and cold seltzers." },

  // Austin Lurkers (5) - 0 posts, 0 claims
  { key: "austin_silent",      city: "Austin",  username: "austin_silent",      theme: "classic",   avatar: "🤫📖🌳", mood: "Reflective 📖",     bio: "Shy observer. Looking for quiet patio spots.", isLurker: true },
  { key: "dillo_watcher",      city: "Austin",  username: "dillo_watcher",      theme: "classic",   avatar: "🦫👀📰", mood: "Nostalgic 📼",      bio: "Just reading the missed connections. Fun times.", isLurker: true },
  { key: "quiet_sheep",        city: "Austin",  username: "quiet_sheep",        theme: "classic",   avatar: "🐑🍺🍔", mood: "Chillin' 😎",       bio: "Mainly browsing. Black Sheep Lodge regular.", isLurker: true },
  { key: "star_gazer_tx",      city: "Austin",  username: "star_gazer_tx",      theme: "cyberpunk", avatar: "🌌🌙🔭", mood: "Spacey 🚀",         bio: "Watching the stars over the Moontower patio.", isLurker: true },
  { key: "east_listener",      city: "Austin",  username: "east_listener",      theme: "sunset",    avatar: "🎧🎸🌾", mood: "Reflective 📖",     bio: "Listening to live music quietly in the back.", isLurker: true }
];

// Verify we defined exactly 50 users
if (USER_PROFILES.length !== 50) {
  console.error(`FATAL: Defined ${USER_PROFILES.length} profiles instead of 50.`);
  process.exit(1);
}

// ── 25 Customized Missed Connection Posts (12 Phoenix, 13 Austin) ──
const POSTS_DATA = [
  // Phoenix Posts (12)
  {
    key: "p_post_1",
    authorKey: "cyber_cactus",
    venueId: "venue_cobra",
    timeRange: "Night",
    daysAgo: 1.2,
    text: "Saw you at Cobra Arcade. You were playing the retro X-Men cabinet and using Wolverine. I was watching from the coin exchange. We locked eyes when the game ended. Drink next time?"
  },
  {
    key: "p_post_2",
    authorKey: "viper_arcade",
    venueId: "venue_valley",
    timeRange: "Evening",
    daysAgo: 2.1,
    text: "Valley Bar basement near the back booths. You had a vintage Motorola Razr and were wearing a corduroy jacket. We both ordered Old Fashioneds at the same time and laughed. Let's dial up."
  },
  {
    key: "p_post_3",
    authorKey: "gracies_regular",
    venueId: "venue_gracies",
    timeRange: "Late Night",
    daysAgo: 0.5,
    text: "Gracies Tax Bar. You were sitting on the patio feeding cheese curds to a stray cat. I was wearing a faded green band shirt. You smiled when the cat purred. Chat soon?"
  },
  {
    key: "p_post_4",
    authorKey: "mill_ave_music",
    venueId: "venue_linger",
    timeRange: "Night",
    daysAgo: 3.4,
    text: "Linger Longer Lounge dance floor. You were doing amazing spin moves during a Daft Punk song. I was the one holding two plastic cups of draft beer trying not to spill them on you. Let's dance!"
  },
  {
    key: "p_post_5",
    authorKey: "scottsdale_glam",
    venueId: "venue_caseys",
    timeRange: "Happy Hour",
    daysAgo: 1.8,
    text: "Casey Moore's Oyster House. You were reading a vintage sci-fi paperback at the corner patio table. I accidentally knocked over my chair, and you asked if I was reading the future. Let's write it."
  },
  {
    key: "p_post_6",
    authorKey: "desert_grooves",
    venueId: "venue_yucca",
    timeRange: "Night",
    daysAgo: 4.2,
    text: "Yucca Tap Room. You were standing in the front row of the ska show. You lost your silver bracelet in the mosh pit, I picked it up but lost you in the crowd. I still have it. Claim it!"
  },
  {
    key: "p_post_7",
    authorKey: "tempe_dreamer",
    venueId: "venue_sunbar",
    timeRange: "Afternoon",
    daysAgo: 0.8,
    text: "Sunbar Tempe line. We waited for 20 minutes in the heat and you shared your hand-held fan with me. You had a yellow visor and cool retro shades. Let me buy you a drink to repay you."
  },
  {
    key: "p_post_8",
    authorKey: "polaroid_valley",
    venueId: "venue_bottled",
    timeRange: "Night",
    daysAgo: 2.7,
    text: "Bottled Blonde. You had a sparkly silver cowboy hat and were taking group selfies. You bumped into me and spilled your seltzer, then bought me a shot of tequila to apologize. Let's hang!"
  },
  {
    key: "p_post_9",
    authorKey: "glow_in_dark",
    venueId: "venue_riot",
    timeRange: "Late Night",
    daysAgo: 3.1,
    text: "Riot House. You were wearing a retro windbreaker and showing your friends a video of a storm on your phone. You almost knocked over my drink. You had a great laugh. Drink again?"
  },
  {
    key: "p_post_10",
    authorKey: "cholla_chic",
    venueId: "venue_coach",
    timeRange: "Happy Hour",
    daysAgo: 1.5,
    text: "Coach House. You had a bright pink hair clip and were drawing caricatures on coasters. You slid a funny drawing of me wearing a cowboy hat over. I still have it! Let's get another."
  },
  {
    key: "p_post_11",
    authorKey: "analog_heart",
    venueId: "venue_theodore",
    timeRange: "Afternoon",
    daysAgo: 4.8,
    text: "The Theodore. We sat at the window looking out at Roosevelt Row. You had a laptop with a giant 'Linux' sticker. We talked briefly about dial-up internet. Wanna connect?"
  },
  {
    key: "p_post_12",
    authorKey: "valley_skater",
    venueId: "venue_thunderbird",
    timeRange: "Evening",
    daysAgo: 0.2,
    text: "Thunderbird Lounge patio. You were showing off your vintage tamagotchi that was 'dying'. I offered to watch it while you went to the bar. Let's keep our digital pets alive together."
  },

  // Austin Posts (13)
  {
    key: "a_post_1",
    authorKey: "austin_aim_god",
    venueId: "venue_chalmers",
    timeRange: "Evening",
    daysAgo: 1.1,
    text: "Chalmers beer garden. You were trying to win a stuffed armadillo from the claw machine. I cheered you on from the patio tables. You finally won it and gave me a high five. Let's meet!"
  },
  {
    key: "a_post_2",
    authorKey: "keep_it_weird",
    venueId: "venue_central_machine",
    timeRange: "Afternoon",
    daysAgo: 2.3,
    text: "Central Machine Works. You were sketching the industrial brick walls in your black notebook. I was sipping a pale ale nearby. You had a silver hoop nose ring. Can I see your drawing?"
  },
  {
    key: "a_post_3",
    authorKey: "vinyl_dillo",
    venueId: "venue_dainty_dillo",
    timeRange: "Night",
    daysAgo: 0.6,
    text: "Dainty Dillo. You were wearing a vintage Austin FC jersey and ordering a frozen margarita. We split a plate of fries because the kitchen was closing. Let's get a full meal next time."
  },
  {
    key: "a_post_4",
    authorKey: "taco_trail",
    venueId: "venue_armadillo_den",
    timeRange: "Afternoon",
    daysAgo: 1.9,
    text: "Armadillo Den. You brought the cutest golden retriever and we sat under the giant oak trees. You had a green canvas backpack with a Lone Star patch. Let's set up a dog playdate."
  },
  {
    key: "a_post_5",
    authorKey: "south_lamar_soul",
    venueId: "venue_moontower",
    timeRange: "Evening",
    daysAgo: 3.2,
    text: "Moontower Saloon volleyball courts. You hit a crazy spike that landed right in my pitcher. You ran over and apologized profusely, then bought a fresh pitcher to share. Volleyball again?"
  },
  {
    key: "a_post_6",
    authorKey: "central_machine_chic",
    venueId: "venue_little_darlin",
    timeRange: "Afternoon",
    daysAgo: 2.8,
    text: "The Little Darlin' backyard. You were playing horseshoes and wore a retro trucker hat. I cheered when you got a ringer. You gave me a cool smile. Let's toss some shoes again."
  },
  {
    key: "a_post_7",
    authorKey: "moontower_magician",
    venueId: "venue_star_bar",
    timeRange: "Happy Hour",
    daysAgo: 0.9,
    text: "Star Bar patio. You ordered the most complex Bloody Mary with a whole slider on top. I asked if you were planning to eat it or build a house with it. We laughed. Bloody Mary date?"
  },
  {
    key: "a_post_8",
    authorKey: "star_bar_star",
    venueId: "venue_parlor_yard",
    timeRange: "Night",
    daysAgo: 2.2,
    text: "Parlor & Yard. You were playing giant Jenga and the tower fell on your foot. I was the one who handed you ice from the bar. Hope your toe is okay! Let's play a safer game next time."
  },
  {
    key: "a_post_9",
    authorKey: "parlor_princess",
    venueId: "venue_little_woodrows",
    timeRange: "Night",
    daysAgo: 4.1,
    text: "Little Woodrow's turtle racing night. We both bet on the turtle named 'Slow Lightning'. It came in last but we celebrated like we won. Let's bet on turtles again."
  },
  {
    key: "a_post_10",
    authorKey: "little_darling_99",
    venueId: "venue_golden_goose",
    timeRange: "Night",
    daysAgo: 3.6,
    text: "The Golden Goose retro lounge. You were standing by the vintage jukebox playing some 90s alternative rock. I was wearing a black leather jacket. We hummed along. Jukebox drinks?"
  },
  {
    key: "a_post_11",
    authorKey: "pickleball_pioneer",
    venueId: "venue_black_sheep",
    timeRange: "Happy Hour",
    daysAgo: 1.4,
    text: "Black Sheep Lodge. We were playing shuffleboard and you beat me by 1 point. You had a cool laugh and a retro AIM buddy icon sticker on your phone. Rematch sometime soon?"
  },
  {
    key: "a_post_12",
    authorKey: "retro_woodrow",
    venueId: "venue_barton_springs_saloon",
    timeRange: "Afternoon",
    daysAgo: 4.7,
    text: "Barton Springs Saloon. You sat under the outdoor patio holding a vintage Game Boy Color. We chatted about Pokemon Red vs Blue. I'd love to trade some Pokemon (or drinks)."
  },
  {
    key: "a_post_13",
    authorKey: "golden_goose_groove",
    venueId: "venue_bouldin_acres",
    timeRange: "Evening",
    daysAgo: 0.4,
    text: "Bouldin Acres pickleball courts. You played in the adjacent court and ran back to fetch an errant ball, bumping into me and spilling a bit of my seltzer. You smiled so nicely. Rematch?"
  }
];

// Verify we defined exactly 25 posts
if (POSTS_DATA.length !== 25) {
  console.error(`FATAL: Defined ${POSTS_DATA.length} posts instead of 25.`);
  process.exit(1);
}

// ── 15 Handshake claims + Active Chats ──
const HANDSHAKES_DATA = [
  // Phoenix Handshakes (8)
  {
    postKey: "p_post_1",
    senderKey: "pixel_dust",
    proofText: "Omg yes! That Wolverine run was legendary! I was wearing the green windbreaker. I remember you waving at me. Let's grab that drink!",
    chat: [
      { senderKey: "pixel_dust", text: "hey! u there? dial up is slow today lol" },
      { senderKey: "cyber_cactus", text: "hey!! yea i'm here. wuts up? still can't believe u got that Wolverine high score B)" },
      { senderKey: "pixel_dust", text: "haha told u i'm the arcade king! we should play co-op next time. Cobra arcade on thursday?" },
      { senderKey: "cyber_cactus", text: "definitely! see u there. g2g mom needs the phone line ttyl!" }
    ]
  },
  {
    postKey: "p_post_2",
    senderKey: "sunset_runner",
    proofText: "That was me with the corduroy jacket! I loved that Old Fashioned. Let's dial up indeed! What's your AIM screenname?",
    chat: [
      { senderKey: "sunset_runner", text: "sup! found your post on RetroConnect. cool site right?" },
      { senderKey: "viper_arcade", text: "ikr! dial-up speed is getting better. anyway, that corduroy jacket was awesome" },
      { senderKey: "sunset_runner", text: "thanks! vintage thrift find. let's grab another old fashioned soon" }
    ]
  },
  {
    postKey: "p_post_3",
    senderKey: "velvet_underground",
    proofText: "Yes! That kitty is so sweet, I feed him every Friday. I remember your green band shirt. Let's grab a cheap beer at Gracies!",
    chat: [
      { senderKey: "velvet_underground", text: "hey! are u going to Gracies this weekend?" },
      { senderKey: "gracies_regular", text: "probly on friday. they have cheap pitchers. u in?" },
      { senderKey: "velvet_underground", text: "deal! i'll bring some cat treats for our patio friend too haha" }
    ]
  },
  {
    postKey: "p_post_4",
    senderKey: "downtown_diva",
    proofText: "Haha that was me spinning! I saw you holding those two drafts, thanks for not spilling them! Let's dance again next weekend.",
    chat: [
      { senderKey: "downtown_diva", text: "yo! thanks for not spilling those beers on me while i was spinning lol" },
      { senderKey: "mill_ave_music", text: "haha i had to use all my balancing skills! u have crazy moves" },
      { senderKey: "downtown_diva", text: "what can i say, daft punk gets me going. let's meet up at Linger Longer Lounge again?" },
      { senderKey: "mill_ave_music", text: "for sure! i'll buy the next round B)" }
    ]
  },
  {
    postKey: "p_post_5",
    senderKey: "tempe_taps",
    proofText: "Haha I was reading 'Dune'! Your chair knock was loud, but it was a great icebreaker. Let's write the future over some oysters!",
    chat: [
      { senderKey: "tempe_taps", text: "hey! did u finish reading that sci-fi book?" },
      { senderKey: "scottsdale_glam", text: "not yet! got distracted by all the patio dogs. it's so cozy at Casey's" },
      { senderKey: "tempe_taps", text: "totally. let me know if u want to grab oysters and talk about the ending!" }
    ]
  },
  {
    postKey: "p_post_6",
    senderKey: "sonic_youth99",
    proofText: "Oh my gosh, you found it! That silver bracelet was my grandma's. I was wearing the torn Ramones shirt. I can't believe you have it!",
    chat: [
      { senderKey: "sonic_youth99", text: "hey, thank u so much for saving my grandma's bracelet!" },
      { senderKey: "desert_grooves", text: "no problem! the pit was wild. glad it didn't get crushed." },
      { senderKey: "sonic_youth99", text: "me too! let's meet at Yucca Tap Room so I can get it back and buy u a drink!" }
    ]
  },
  {
    postKey: "p_post_7",
    senderKey: "prickly_pearl",
    proofText: "That hand-held fan is a lifesaver! I remember your yellow visor. Let's definitely grab that drink, how about this Friday?",
    chat: [
      { senderKey: "prickly_pearl", text: "hey! how is the yellow visor doing?" },
      { senderKey: "tempe_dreamer", text: "blocking the sun and looking retro as always! thanks to your fan I didn't melt." },
      { senderKey: "prickly_pearl", text: "haha glad to help. let's meet at Sunbar this friday! :)" }
    ]
  },
  {
    postKey: "p_post_8",
    senderKey: "retro_roosevelt",
    proofText: "That was me with the sparkly cowboy hat! I was so embarrassed for spilling my seltzer. Glad you found the group selfie fun. Rematch at Bottled Blonde?",
    chat: [
      { senderKey: "retro_roosevelt", text: "hey! did the seltzer stain wash out? sorry again!" },
      { senderKey: "polaroid_valley", text: "haha yes it did, no worries. the cowboy hat was worth it." },
      { senderKey: "retro_roosevelt", text: "sweet! let's grab a real tequila shot soon, on me this time. B)" }
    ]
  },

  // Austin Handshakes (7)
  {
    postKey: "a_post_1",
    senderKey: "neon_rainey",
    proofText: "Yes! Hubert the armadillo is now sitting on my desk. That claw machine was brutal! Thanks for cheering. Let's meet up!",
    chat: [
      { senderKey: "neon_rainey", text: "hey aim_god! hubert says hi from my desk" },
      { senderKey: "austin_aim_god", text: "hahaha awesome name for an armadillo! claw machine master B)" },
      { senderKey: "neon_rainey", text: "it took like 10 tries lol. Chalmers soon?" },
      { senderKey: "austin_aim_god", text: "absolutely, dial me in!" }
    ]
  },
  {
    postKey: "a_post_2",
    senderKey: "east_side_vibe",
    proofText: "That was me drawing! I was sketching the gears. I'd love to show you the finished notebook page. Let's get a beer!",
    chat: [
      { senderKey: "east_side_vibe", text: "hey! can i see that drawing of the gears now?" },
      { senderKey: "keep_it_weird", text: "sure! i added some neon watercolors to it. looks pretty rad." },
      { senderKey: "east_side_vibe", text: "nice! let's meet at Central Machine Works and you can show me in person." }
    ]
  },
  {
    postKey: "a_post_3",
    senderKey: "slacker_99",
    proofText: "Oh those fries saved my life! I was wearing the vintage Austin FC jersey. Let's do a real dinner next time, my treat!",
    chat: [
      { senderKey: "slacker_99", text: "hey! thanks for sharing those fries, i was starving" },
      { senderKey: "vinyl_dillo", text: "no worries, late night cravings are real! that jersey was cool btw" },
      { senderKey: "slacker_99", text: "thanks! let's grab a real dinner on Cesar Chavez next time." }
    ]
  },
  {
    postKey: "a_post_4",
    senderKey: "glitter_truck",
    proofText: "My dog Rusty loved meeting you! Yes, that green canvas backpack is mine. Let's schedule a dog playdate at Moontower soon!",
    chat: [
      { senderKey: "glitter_truck", text: "yo! is rusty ready for the playdate?" },
      { senderKey: "taco_trail", text: "he has his favorite tennis ball packed! Moontower backyard?" },
      { senderKey: "glitter_truck", text: "perfect, let's do Saturday afternoon. I'll get a pitcher of shiner." }
    ]
  },
  {
    postKey: "a_post_5",
    senderKey: "cyber_armadillo",
    proofText: "Haha I was so embarrassed about spiking it into your beer! Thanks for being such a good sport. Let's play volleyball again!",
    chat: [
      { senderKey: "cyber_armadillo", text: "hey! volleyball practice going well?" },
      { senderKey: "south_lamar_soul", text: "getting better! trying not to aim for people's pitchers this time lol" },
      { senderKey: "cyber_armadillo", text: "haha it's a target! see u on the court." }
    ]
  },
  {
    postKey: "a_post_6",
    senderKey: "south_austin_goth",
    proofText: "Ringer! I love playing horseshoes there. My retro trucker hat is my lucky charm. Let's play another game soon, I'll bring friends.",
    chat: [
      { senderKey: "south_austin_goth", text: "hey! did u get any ringers at horseshoes today?" },
      { senderKey: "central_machine_chic", text: "a couple! but it's mainly about the cold drafts. Little Darlin patio is the best." },
      { senderKey: "south_austin_goth", text: "agreed. let's grab a table under the trees this weekend." }
    ]
  },
  {
    postKey: "a_post_7",
    senderKey: "sunset_austin",
    proofText: "Hey! That Bloody Mary is a meal in itself, haha! The slider was delicious. I'd love a Bloody Mary date, let's do it!",
    chat: [
      { senderKey: "sunset_austin", text: "hey! bloody mary enthusiast reporting in." },
      { senderKey: "moontower_magician", text: "haha! still can't believe the slider on top. star bar is wild" },
      { senderKey: "sunset_austin", text: "it's an art form! let's grab one this sunday." }
    ]
  }
];

// Verify we defined exactly 15 handshakes
if (HANDSHAKES_DATA.length !== 15) {
  console.error(`FATAL: Defined ${HANDSHAKES_DATA.length} handshakes instead of 15.`);
  process.exit(1);
}

// Helper to format date string like "Jun 1, 2026"
function formatDateStr(timestamp) {
  const dateObj = new Date(timestamp);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return dateObj.toLocaleDateString('en-US', options);
}

async function seed() {
  console.log('🌱 Starting Batch 3 seeding (50 users, 25 posts, 15 handshakes with active chats)...\n');

  const keyToUidMap = {};
  const usernameToProfileMap = {};

  // 1. Create or fetch Firebase Auth accounts + Firestore user & profile docs for 50 users
  console.log('👤 PHASE 1: Seeding 50 Users...');
  for (const user of USER_PROFILES) {
    const email = `${user.key}@asl.com`;
    const password = 'password123';
    let uid;

    try {
      // Firebase Auth Creation
      try {
        const userRecord = await admin.auth().createUser({
          email,
          password
        });
        uid = userRecord.uid;
        console.log(`  Auth Created: ${email} → ${uid}`);
      } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
          const userRecord = await admin.auth().getUserByEmail(email);
          uid = userRecord.uid;
          console.log(`  Auth Exists:  ${email} → ${uid}`);
        } else {
          throw err;
        }
      }

      keyToUidMap[user.key] = uid;
      usernameToProfileMap[user.username] = { ...user, uid };

      // Assign 1-6 favorite bars (Phoenix bars for Phoenix users, Austin bars for Austin users)
      const barsPool = user.city === "Phoenix" ? PHOENIX_VENUES : AUSTIN_VENUES;
      const numBars = Math.floor(Math.random() * 6) + 1; // 1 to 6
      const shuffledBars = [...barsPool].sort(() => 0.5 - Math.random());
      const selectedBars = shuffledBars.slice(0, numBars).map(b => b.id);

      const timestamp = Date.now() - Math.floor((Math.random() * 5 + 1) * 24 * 60 * 60 * 1000); // 1-6 days ago

      // Write private users document
      await db.collection("users").doc(uid).set({
        uid,
        email,
        username: user.username,
        mood: user.mood,
        bio: user.bio,
        emoji_avatar: user.avatar,
        profileTheme: user.theme,
        unlockedThemes: ["classic", "glitter", "cyberpunk", "sunset"],
        favorited_bars: selectedBars,
        homeCity: user.city,
        selectedCity: user.city,
        isAnonymous: false,
        flag_count: 0,
        banned: false,
        uuid: "seed_batch3_" + user.key,
        createdAt: timestamp,
        lastLogin: timestamp,
        lastActiveAt: timestamp
      });

      // Write public profiles document directly to ensure instant sync
      await db.collection("profiles").doc(uid).set({
        username: user.username,
        mood: user.mood,
        bio: user.bio,
        profileTheme: user.theme,
        emoji_avatar: user.avatar,
        favorited_bars: selectedBars,
        createdAt: timestamp,
        lastLogin: timestamp,
        lastActiveAt: timestamp
      });

      console.log(`  ✅ Synced Firestore profile: ${user.username}`);
    } catch (err) {
      console.error(`  ❌ Error processing user ${user.key}:`, err);
      process.exit(1);
    }
  }

  // 2. Create 25 Missed Connection Posts
  console.log('\n📝 PHASE 2: Seeding 25 Missed Connection Posts...');
  const keyToPostIdMap = {};

  for (const post of POSTS_DATA) {
    const authorUid = keyToUidMap[post.authorKey];
    const authorProfile = USER_PROFILES.find(u => u.key === post.authorKey);
    const venue = ALL_VENUES_MAP[post.venueId];

    if (!authorUid || !venue) {
      console.error(`  ❌ FATAL: Could not resolve authorUid (${post.authorKey}) or venueId (${post.venueId}) for post ${post.key}`);
      process.exit(1);
    }

    const postTimestamp = Date.now() - Math.floor(post.daysAgo * 24 * 60 * 60 * 1000);
    const dateStr = formatDateStr(postTimestamp);

    const postRef = await db.collection("posts").add({
      userId: authorUid,
      username: authorProfile.username,
      emoji_avatar: authorProfile.avatar,
      mood: authorProfile.mood,
      profileTheme: authorProfile.theme,
      venueId: venue.id,
      venueName: venue.name,
      venueCity: venue.city,
      venueZone: venue.zone,
      venueAddress: venue.address,
      text: post.text,
      timestamp: postTimestamp,
      date: dateStr,
      timeRange: post.timeRange,
      status: "active",
      thumbsUpCount: Math.floor(Math.random() * 5)
    });

    keyToPostIdMap[post.key] = postRef.id;
    console.log(`  📝 Created Post: ${authorProfile.username} @ ${venue.name} → ${postRef.id}`);
  }

  // 3. Create 15 accepted Handshakes, update posts, and build chat systems
  console.log('\n🤝 PHASE 3: Seeding 15 Handshake connections with AIM chats...');
  for (const hs of HANDSHAKES_DATA) {
    const postId = keyToPostIdMap[hs.postKey];
    const senderUid = keyToUidMap[hs.senderKey];
    const senderProfile = USER_PROFILES.find(u => u.key === hs.senderKey);

    if (!postId || !senderUid) {
      console.error(`  ❌ FATAL: Could not resolve postId (${hs.postKey}) or senderUid (${hs.senderKey})`);
      process.exit(1);
    }

    // Resolve post details
    const postSnap = await db.collection("posts").doc(postId).get();
    const postData = postSnap.data();
    const receiverUid = postData.userId;

    const hsTimestamp = Date.now() - Math.floor(Math.random() * 600000); // within last 10 minutes

    // Write connection doc
    const connRef = await db.collection("connections").add({
      postId: postId,
      postText: postData.text,
      venueName: postData.venueName,
      senderId: senderUid,
      receiverId: receiverUid,
      proofText: hs.proofText,
      status: "accepted",
      timestamp: hsTimestamp
    });

    // Update original post status
    await db.collection("posts").doc(postId).update({
      status: "connected",
      connectedWithId: senderUid,
      connectedWithUsername: senderProfile.username,
      connectedProofText: hs.proofText
    });

    // Create chat doc
    const lastMsgText = hs.chat[hs.chat.length - 1].text;
    const chatRef = await db.collection("chats").add({
      connectionId: connRef.id,
      participants: [senderUid, receiverUid],
      lastMessage: lastMsgText,
      lastTimestamp: hsTimestamp,
      venueName: postData.venueName
    });

    console.log(`  🤝 Handshake: ${senderProfile.username} ⇆ ${postData.username} [${postData.venueName}] → Chat: ${chatRef.id}`);

    // Create messages subcollection
    let timeOffset = 5 * 60 * 1000; // 5 mins back
    for (const msg of hs.chat) {
      const msgSenderUid = keyToUidMap[msg.senderKey];
      await db.collection("chats").doc(chatRef.id).collection("messages").add({
        senderId: msgSenderUid,
        text: msg.text,
        timestamp: hsTimestamp - timeOffset,
        read: true
      });
      timeOffset -= 1 * 60 * 1000; // subsequent messages closer in time
    }
  }

  // ── Verification phase ──
  console.log('\n🔍 SEED VALIDATION CHECKS...');
  
  const authUsersResult = await admin.auth().listUsers(100);
  console.log(`  Firebase Auth total accounts: ${authUsersResult.users.length}`);

  const usersSnap = await db.collection("users").get();
  console.log(`  Firestore '/users' total docs: ${usersSnap.size}`);

  const profilesSnap = await db.collection("profiles").get();
  console.log(`  Firestore '/profiles' total docs: ${profilesSnap.size}`);

  const postsSnap = await db.collection("posts").get();
  console.log(`  Firestore '/posts' total docs: ${postsSnap.size}`);

  const connectionsSnap = await db.collection("connections").get();
  console.log(`  Firestore '/connections' total docs: ${connectionsSnap.size}`);

  const chatsSnap = await db.collection("chats").get();
  console.log(`  Firestore '/chats' total docs: ${chatsSnap.size}`);

  // Count lurkers
  let lurkerCount = 0;
  for (const doc of usersSnap.docs) {
    const user = doc.data();
    // A user is a lurker if they have no posts and no connections
    const usersPosts = postsSnap.docs.filter(d => d.data().userId === user.uid);
    const usersConns = connectionsSnap.docs.filter(d => d.data().senderId === user.uid || d.data().receiverId === user.uid);
    if (usersPosts.length === 0 && usersConns.length === 0) {
      lurkerCount++;
    }
  }
  console.log(`  Calculated lurkers (0 posts & 0 connections): ${lurkerCount}`);

  if (usersSnap.size !== 50 || postsSnap.size !== 25 || connectionsSnap.size !== 15 || chatsSnap.size !== 15) {
    console.error('  ⚠️  WARNING: DB counts do not exactly match constraints!');
  } else {
    console.log('  🎉 All constraints satisfied perfectly!');
  }

  console.log('\n\n═══════════════════════════════════════');
  console.log('  🌵 BATCH 3 SEEDING COMPLETE');
  console.log('═══════════════════════════════════════\n');

  process.exit(0);
}

seed().catch(err => {
  console.error("Batch 3 Seeding error:", err);
  process.exit(1);
});
