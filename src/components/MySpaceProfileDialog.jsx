import { useState, useEffect } from "react";
import TitleBar from "./TitleBar";
import MySpaceMusicPlayer from "./MySpaceMusicPlayer";
import { dbGetDoc, dbAddDoc, dbGetDocs } from "../firebase";
import { Share } from "@capacitor/share";
import { isIAPSupported, fetchProductDetails, purchaseProduct, restorePurchases } from "../services/iap";

const extractSpotifyTrackId = (input) => {
  const trimmed = input.trim();
  if (!trimmed) return "";

  const urlPattern = /open\.spotify\.com\/(?:[a-zA-Z-]+\/)?track\/([a-zA-Z0-9]{22})/;
  const uriPattern = /spotify:track:([a-zA-Z0-9]{22})/;
  const rawPattern = /^[a-zA-Z0-9]{22}$/;

  const urlMatch = trimmed.match(urlPattern);
  if (urlMatch) return urlMatch[1];

  const uriMatch = trimmed.match(uriPattern);
  if (uriMatch) return uriMatch[1];

  const rawMatch = trimmed.match(rawPattern);
  if (rawMatch) return rawMatch[0];

  return null;
};


const EMOJI_PRESETS = [
  // Faces & People
  "😀", "😎", "😍", "🤩", "😏", "😒", "😔", "😭", "😤", "😠",
  "😡", "🤬", "😱", "😨", "🤯", "🥴", "😴", "🤪", "😑", "😐",
  "🙄", "🥺", "😢", "😂", "🤣", "😆", "😋", "😛", "🤤", "😇",
  "🤓", "🤡", "👻", "💀", "🤖", "👽", "🎃", "🦊", "🐱", "🐶",
  "🐸", "🐼", "🦁", "🐯", "🐻", "🐺", "🦄", "🐉", "🦋", "🐝",
  // Hearts & Love
  "💖", "💗", "💘", "💝", "💓", "💞", "💕", "❤️", "🧡", "💛",
  "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💟", "♥️",
  // Objects & Activities
  "🥃", "🍹", "🍻", "🥂", "🍺", "🍷", "🍸", "🧃", "☕", "🧋",
  "🍕", "🍔", "🌮", "🍜", "🍣", "🍩", "🍦", "🎂", "🍫", "🍬",
  "🎸", "🎤", "🎧", "🎵", "🎶", "🎹", "🥁", "🎷", "🎺", "🎻",
  "🎮", "👾", "🕹️", "🎯", "🎱", "🃏", "🎲", "♟️", "🧩", "🎰",
  "📟", "💾", "💿", "📼", "📺", "📻", "☎️", "📡", "🖥️", "⌨️",
  "📱", "📷", "🎥", "📽️", "🎞️", "🔍", "🔭", "🧪", "🔬", "💊",
  // Nature & Weather
  "🌧️", "⛈️", "🌈", "☀️", "🌙", "⭐", "🌟", "✨", "❄️", "🔥",
  "💧", "🌊", "🌵", "🌴", "🌸", "🌺", "🌻", "🍀", "🍁", "🌾",
  // Symbols & Misc
  "⚡", "💥", "🎉", "🎈", "🎀", "🏆", "🥇", "🎖️", "🏅", "🚀",
  "✊", "👊", "✌️", "🤘", "🤞", "👌", "👍", "🖤", "🎨", "📖",
  "💎", "👑", "🗡️", "🛹", "🏍️", "🌆", "🌃", "🌉", "🌌", "🌠",
  // Classic retro / nostalgic
  "👥", "🕵️", "📠", "🏃‍♂️", "💰", "💡", "📟", "💾", "📼", "🔌",
  "🧲", "💣", "🔫", "🃏", "🚬", "🎠", "🎡", "🎢", "🎪", "🎭"
];

export default function MySpaceProfileDialog({ 
  username, 
  mood, 
  bio, 
  profileTheme = "classic", 
  emoji_avatar = "👥🥃💖",
  spotify_track_uri = "spotify:track:4PTG3Z6ehGkBF3zI7YSp6g",
  spotify_song_title = "",
  spotify_artist_name = "",
  headline = "Everyone's favorite dial-up partner",
  onClose,
  onOpenChat,
  userId,
  currentUserId,
  currentUserDoc,
  onSaveProfile,
  unlockedThemes = [],
  favorited_bars = [],
  venues = [],
  onSelectVenue,
  acceptedConnections = [],
  onOpenProfile,
  lastActiveAt
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(username);

  const isAdmin = currentUserDoc?.isAdmin || false;

  const isUserOnline = () => {
    if (userId === currentUserId) return true;
    if (!lastActiveAt) return false;
    const activeThreshold = 5 * 60 * 1000; // 5 minutes
    return (Date.now() - lastActiveAt) < activeThreshold;
  };

  const getStatusText = () => {
    if (isUserOnline()) return "Online 📡";
    if (!lastActiveAt) return "Offline 💤";
    const diffMs = Date.now() - lastActiveAt;
    const diffMins = Math.floor(diffMs / (60 * 1000));
    if (diffMins < 60) {
      return `Offline 💤 (active ${diffMins}m ago)`;
    }
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `Offline 💤 (active ${diffHours}h ago)`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `Offline 💤 (active ${diffDays}d ago)`;
  };

  const [editMood, setEditMood] = useState(mood);
  const [editBio, setEditBio] = useState(bio);
  const [editProfileTheme, setEditProfileTheme] = useState(profileTheme);
  const [editEmojiAvatar, setEditEmojiAvatar] = useState(emoji_avatar);
  const [editSpotifyTrackUri, setEditSpotifyTrackUri] = useState(spotify_track_uri);
  const [editSpotifySongTitle, setEditSpotifySongTitle] = useState(spotify_song_title);
  const [editSpotifyArtistName, setEditSpotifyArtistName] = useState(spotify_artist_name);
  const [editHeadline, setEditHeadline] = useState(headline);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [profileError, setProfileError] = useState("");

  const handleShareProfile = async () => {
    const shareText = `Check out ${username}'s profile on asl! Add them to your Top 8!`;
    const shareUrl = `asl://profile/${userId}`;
    
    try {
      const canShareResult = await Share.canShare();
      if (canShareResult && canShareResult.value) {
        await Share.share({
          title: `asl profile: ${username}`,
          text: shareText,
          url: shareUrl,
          dialogTitle: `Share ${username}'s profile`
        });
      } else {
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.warn("Sharing failed, falling back to clipboard:", err);
      try {
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        alert("Link copied to clipboard!");
      } catch (clipErr) {
        console.error("Clipboard copy failed:", clipErr);
        alert("Could not share or copy link.");
      }
    }
  };
  const [friendProfiles, setFriendProfiles] = useState({});

  // Guestbook states
  const [guestbookEntries, setGuestbookEntries] = useState([]);
  const [isLoadingGuestbook, setIsLoadingGuestbook] = useState(false);
  const [showSignGuestbook, setShowSignGuestbook] = useState(false);
  const [newGuestbookMessage, setNewGuestbookMessage] = useState("");
  const [newGuestbookStamp, setNewGuestbookStamp] = useState("glitter_heart");
  const [isSubmittingGuestbook, setIsSubmittingGuestbook] = useState(false);

  const GUESTBOOK_STAMPS = {
    glitter_heart: { emoji: "💖", label: "Glitter Heart" },
    pixel_rose: { emoji: "🌹", label: "Pixel Rose" },
    ufo: { emoji: "🛸", label: "UFO" },
    flame: { emoji: "🔥", label: "Flame" },
    skateboard: { emoji: "🛹", label: "Skateboard" },
    skull: { emoji: "☠️", label: "Skull" },
    floppy_disk: { emoji: "💾", label: "Floppy Disk" }
  };

  const getTimestampMs = (ts) => {
    if (!ts) return Date.now();
    if (typeof ts === "number") return ts;
    if (ts.toMillis) return ts.toMillis();
    if (ts.seconds) return ts.seconds * 1000;
    if (ts.toDate) return ts.toDate().getTime();
    return Date.now();
  };

  const formatDate = (ts) => {
    const ms = getTimestampMs(ts);
    return new Date(ms).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const fetchGuestbook = async () => {
    if (!userId) return;
    setIsLoadingGuestbook(true);
    try {
      const snap = await dbGetDocs("guestbook_entries", [
        { type: "where", field: "profileUid", op: "==", value: userId }
      ]);
      const entries = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort client-side by timestamp descending
      entries.sort((a, b) => getTimestampMs(b.timestamp) - getTimestampMs(a.timestamp));
      setGuestbookEntries(entries);
    } catch (err) {
      console.error("Error loading guestbook:", err);
    } finally {
      setIsLoadingGuestbook(false);
    }
  };

  useEffect(() => {
    fetchGuestbook();
  }, [userId]);

  const parseBBCode = (text) => {
    if (!text) return "";
    
    // Escape HTML first to prevent XSS injection
    let escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    // Replace [b]content[/b] -> <strong>content</strong>
    escaped = escaped.replace(/\[b\]([\s\S]*?)\[\/b\]/gi, "<strong>$1</strong>");
    
    // Replace [i]content[/i] -> <em>content</em>
    escaped = escaped.replace(/\[i\]([\s\S]*?)\[\/i\]/gi, "<em>$1</em>");
    
    // Replace [rainbow]content[/rainbow] -> <span class="rainbow-text">content</span>
    escaped = escaped.replace(/\[rainbow\]([\s\S]*?)\[\/rainbow\]/gi, '<span class="rainbow-text">$1</span>');

    return { __html: escaped };
  };

  const insertBBCode = (tag) => {
    const textarea = document.getElementById("guestbook-textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);

    const replacement = `[${tag}]${selected}[/${tag}]`;
    setNewGuestbookMessage(before + replacement + after);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length + 2, start + tag.length + 2 + selected.length);
    }, 0);
  };

  const handleSignGuestbook = async (e) => {
    e.preventDefault();
    if (!newGuestbookMessage.trim()) return;
    setIsSubmittingGuestbook(true);
    try {
      let signerName = "Anonymous Partner";
      let signerAvatar = "👥";
      if (currentUserId) {
        const userSnap = await dbGetDoc("users", currentUserId);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          signerName = userData.username || signerName;
          signerAvatar = userData.emoji_avatar || signerAvatar;
        }
      }

      await dbAddDoc("guestbook_entries", {
        profileUid: userId,
        authorUid: currentUserId || "anonymous",
        authorName: signerName,
        authorAvatar: signerAvatar,
        message: newGuestbookMessage,
        stamp: newGuestbookStamp
      });

      setNewGuestbookMessage("");
      setNewGuestbookStamp("glitter_heart");
      setShowSignGuestbook(false);
      await fetchGuestbook();
    } catch (err) {
      console.error("Error signing guestbook:", err);
      alert("Failed to sign guestbook: " + err.message);
    } finally {
      setIsSubmittingGuestbook(false);
    }
  };

  // IAP Simulation states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState("idle");
  const [checkoutStatusText, setCheckoutStatusText] = useState("");
  const [restoring, setRestoring] = useState(false);

  const ownedThemes = unlockedThemes && unlockedThemes.length ? unlockedThemes : ["classic", "glitter", "cyberpunk", "sunset", "goth", "gameboy"];

  const isThemeUnlocked = (themeName) => {
    const freeThemes = ["classic", "glitter", "cyberpunk", "sunset", "goth", "gameboy"];
    if (freeThemes.includes(themeName)) return true;
    return ownedThemes.includes(themeName);
  };

  const handleSimulatePurchase = async () => {
    setCheckoutStep("processing");
    setCheckoutStatusText("CONNECTING TO APPLE APP STORE...");
    
    try {
      const result = await purchaseProduct(checkoutProduct.id);
      if (result.success) {
        setCheckoutStatusText("VERIFYING PURCHASE RECEIPT...");
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (onSaveProfile) {
          const isCozy = checkoutProduct.id === "cozy_pack";
          const isBadBitch = checkoutProduct.id === "badbitch_pack";
          const themesToUnlock = isCozy 
            ? ["animal-crossing", "spirited-away", "matcha-tea"]
            : isBadBitch
            ? ["8-ball", "long-nails", "sheer"]
            : ["one-piece", "demon-slayer", "jujutsu-kaisen"];
          const updatedUnlocked = [
            ...new Set([...ownedThemes, ...themesToUnlock])
          ];
          await onSaveProfile(currentUserId, {
            unlockedThemes: updatedUnlocked
          });
        }
        setCheckoutStep("success");
      } else {
        alert("Purchase Failed: " + (result.error || "User cancelled or transaction error."));
        setCheckoutStep("idle");
        setShowCheckoutModal(false);
      }
    } catch (err) {
      console.error("Purchase failed:", err);
      alert("Billing Gateway Error. Please try again.");
      setCheckoutStep("idle");
      setShowCheckoutModal(false);
    }
  };

  const handleRestorePurchases = async () => {
    setRestoring(true);
    try {
      const restoredIds = await restorePurchases();
      if (restoredIds.length > 0) {
        let themesToUnlock = [];
        if (restoredIds.includes("cozy_pack")) {
          themesToUnlock.push("animal-crossing", "spirited-away", "matcha-tea");
        }
        if (restoredIds.includes("badbitch_pack")) {
          themesToUnlock.push("8-ball", "long-nails", "sheer");
        }
        if (restoredIds.includes("weeb_pack")) {
          themesToUnlock.push("one-piece", "demon-slayer", "jujutsu-kaisen");
        }
        
        if (themesToUnlock.length > 0 && onSaveProfile) {
          const updatedUnlocked = [
            ...new Set([...ownedThemes, ...themesToUnlock])
          ];
          await onSaveProfile(currentUserId, {
            unlockedThemes: updatedUnlocked
          });
          alert("Success: Restored " + restoredIds.length + " package(s) and credited themes to your profile!");
        } else {
          alert("Restore Complete: No previous theme pack purchases found on your App Store account.");
        }
      } else {
        alert("Restore Complete: No previous theme pack purchases found on this device.");
      }
    } catch (err) {
      console.error("Restore failed:", err);
      alert("Failed to restore purchases: " + err.message);
    } finally {
      setRestoring(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowCheckoutModal(false);
    if (checkoutProduct && checkoutProduct.targetTheme) {
      setEditProfileTheme(checkoutProduct.targetTheme);
    }
  };

  const favoritedVenueList = (favorited_bars || []).map(id => {
    return (venues || []).find(v => v.fsq_id === id);
  }).filter(Boolean);

  // Load display profiles for accepted connections
  useEffect(() => {
    if (!acceptedConnections || acceptedConnections.length === 0) return;
    acceptedConnections.forEach(async (conn) => {
      const friendId = conn.userId;
      if (friendProfiles[friendId]) return;
      try {
        const snap = await dbGetDoc("users", friendId);
        if (snap.exists()) {
          setFriendProfiles(prev => ({ ...prev, [friendId]: snap.data() }));
        }
      } catch {
        // silently ignore
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acceptedConnections]);

  const handleSendMessage = () => {
    if (onOpenChat) {
      onOpenChat(null, {
        id: `connection_${userId}`,
        senderId: userId,
        receiverId: "me",
        proofText: `Starting profile chat with ${username}...`,
        status: "accepted",
        venueName: "asl Profile Link",
        postText: "Connecting from profile"
      });
      onClose();
    }
  };

  const handleAddEmoji = (em) => {
    const current = Array.from(editEmojiAvatar);
    if (current.length < 3) {
      setEditEmojiAvatar(current.concat(em).join(""));
    }
  };

  const handleRemoveEmojiAtIndex = (index) => {
    const current = Array.from(editEmojiAvatar);
    current.splice(index, 1);
    setEditEmojiAvatar(current.join(""));
  };

  const handleSave = () => {
    if (!editUsername.trim()) {
      alert("Display name cannot be empty.");
      return;
    }
    if (editUsername.length > 25) {
      alert("Display name must be 25 characters or less.");
      return;
    }
    if (editHeadline.length > 100) {
      alert("Tagline must be 100 characters or less.");
      return;
    }
    // Tagline must be plain text — no URLs, emails, markdown links, or @handles
    const headlineHasBadContent =
      /https?:\/\//i.test(editHeadline) ||          // http:// or https://
      /www\./i.test(editHeadline) ||                 // www. links
      /\S+@\S+\.\S+/.test(editHeadline) ||           // email addresses
      /\[.+\]\(.+\)/.test(editHeadline) ||           // markdown links [text](url)
      /(?:^|\s)@\S+/.test(editHeadline);             // @handle mentions
    if (headlineHasBadContent) {
      alert("Tagline cannot contain URLs, email addresses, links, or @mentions. Keep it plain text.");
      return;
    }
    if (editBio.length > 500) {
      alert("Biography must be 500 characters or less.");
      return;
    }
    if (Array.from(editEmojiAvatar).length !== 3) {
      alert("Please select exactly 3 emojis for your avatar.");
      return;
    }

    let formattedSpotifyTrackUri = "";
    if (editSpotifyTrackUri.trim() !== "") {
      const trackId = extractSpotifyTrackId(editSpotifyTrackUri);
      if (!trackId) {
        setProfileError("SYSTEM ERROR: INVALID SPOTIFY AUDIO IDENTIFIER. TRACK ID MUST BE A 22-CHARACTER ALPHANUMERIC STRING.");
        return;
      }
      formattedSpotifyTrackUri = `spotify:track:${trackId}`;
    }

    if (onSaveProfile) {
      onSaveProfile(userId, {
        username: editUsername,
        mood: editMood,
        bio: editBio,
        profileTheme: editProfileTheme,
        emoji_avatar: editEmojiAvatar,
        spotify_track_uri: formattedSpotifyTrackUri,
        spotify_song_title: editSpotifySongTitle,
        spotify_artist_name: editSpotifyArtistName,
        headline: editHeadline
      });
      setIsEditing(false);
      setProfileError("");
    }
  };

  const getThemeClass = () => {
    switch (isEditing ? editProfileTheme : profileTheme) {
      case "glitter": return "myspace-theme-glitter";
      case "cyberpunk": return "myspace-theme-cyberpunk";
      case "sunset": return "myspace-theme-sunset";
      case "goth": return "myspace-theme-goth";
      case "gameboy": return "myspace-theme-gameboy";
      case "one-piece": return "myspace-theme-onepiece";
      case "demon-slayer": return "myspace-theme-demonslayer";
      case "jujutsu-kaisen": return "myspace-theme-jujutsukaisen";
      case "animal-crossing": return "myspace-theme-animalcrossing";
      case "spirited-away": return "myspace-theme-spiritedaway";
      case "matcha-tea": return "myspace-theme-matchatea";
      case "8-ball": return "myspace-theme-8ball";
      case "long-nails": return "myspace-theme-longnails";
      case "sheer": return "myspace-theme-sheer";
      default: return "myspace-theme-classic";
    }
  };

  return (
    <div className={`window ${getThemeClass()}`} style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <TitleBar title={`asl - ${isEditing ? "Editing Profile" : `${username}'s Profile`}`} onClose={onClose} />
      
      <div className="window-body myspace-profile-body" style={{ flex: 1, overflowY: "auto", padding: "12px", margin: 0 }}>
        
        {/* Top Header Card */}
        <div className="profile-top-section">
          {isEditing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", width: "100%" }}>
                <label style={{ fontSize: "11px", fontWeight: "bold" }}>Display Name:</label>
                <input 
                  type="text" 
                  value={editUsername} 
                  onChange={(e) => setEditUsername(e.target.value)} 
                  style={{ width: "100%", fontSize: "16px", padding: "4px" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", width: "100%" }}>
                <label style={{ fontSize: "11px", fontWeight: "bold" }}>Tagline (Headline):</label>
                <input 
                  type="text" 
                  value={editHeadline} 
                  onChange={(e) => setEditHeadline(e.target.value)} 
                  style={{ width: "100%", fontSize: "14px", padding: "4px" }}
                  placeholder="e.g. Everyone's favorite dial-up partner"
                />
              </div>
            </div>
          ) : (
            <>
              <h2 className="profile-name-header" style={{ margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "26px", fontWeight: "bold" }}>
                <span>{username}</span>
                <span style={{ fontSize: "26px" }}>{emoji_avatar || "👥🥃💖"}</span>
              </h2>
              <p className="profile-headline">"{headline || "Everyone's favorite dial-up partner"}"</p>
            </>
          )}
        </div>

        <div className="profile-main-grid">
          {/* Left Column: Avatar & Bio */}
          <div className="profile-left-col">

            {/* Emoji Avatar Customizer — edit mode only */}
            {isEditing && (
              <div className="profile-edit-card" style={{ marginBottom: "8px" }}>
                <div style={{ fontSize: "11px", fontWeight: "bold", marginBottom: "6px", color: "inherit" }}>Customize Avatar (pick exactly 3):</div>
                
                {/* Currently selected emojis */}
                <div style={{ display: "flex", gap: "6px", marginBottom: "8px", minHeight: "48px", alignItems: "center" }}>
                  {Array.from(editEmojiAvatar).map((em, idx) => (
                    <span 
                      key={idx} 
                      onClick={() => handleRemoveEmojiAtIndex(idx)}
                      className="selected-emoji-btn"
                      style={{ fontSize: "36px" }}
                      title="Click to remove"
                    >
                      {em}
                    </span>
                  ))}
                  {Array.from(editEmojiAvatar).length === 0 && (
                    <span style={{ fontSize: "12px", color: "#888", fontStyle: "italic" }}>Click emojis below to select up to 3</span>
                  )}
                  {Array.from(editEmojiAvatar).length > 0 && Array.from(editEmojiAvatar).length < 3 && (
                    <span style={{ fontSize: "12px", color: "#666" }}>({3 - Array.from(editEmojiAvatar).length} more needed)</span>
                  )}
                </div>

                {/* Large emoji presets grid */}
                <div className="emoji-presets-grid">
                  {EMOJI_PRESETS.map((em, i) => (
                    <span 
                      key={`${em}-${i}`}
                      onClick={() => handleAddEmoji(em)}
                      style={{ 
                        fontSize: "22px", 
                        cursor: "pointer", 
                        textAlign: "center", 
                        padding: "3px", 
                        borderRadius: "2px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        userSelect: "none"
                      }}
                      title={em}
                    >
                      {em}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className={`profile-details-table ${isEditing ? "profile-edit-card" : ""}`} style={{ padding: "6px" }}>
              {isEditing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", margin: "4px 0" }}>
                  <label style={{ fontSize: "11px", fontWeight: "bold", color: "inherit" }}>Mood:</label>
                  <select 
                    value={editMood} 
                    onChange={(e) => setEditMood(e.target.value)} 
                    style={{ width: "100%", padding: "2px" }}
                  >
                    <option>Chillin' 😎</option>
                    <option>Excited ⚡</option>
                    <option>Crushing 😍</option>
                    <option>Mellow 🎧</option>
                    <option>Melancholy 🌧️</option>
                    <option>Emo 🖤</option>
                    <option>Gay 🌈</option>
                    <option>Ready to Party 🍹</option>
                    <option>Hyper 🤪</option>
                    <option>Sassy 💅</option>
                    <option>Pissed 😡</option>
                    <option>Bored 😑</option>
                    <option>Creative 🎨</option>
                    <option>Spacey 🚀</option>
                    <option>Tired 😴</option>
                    <option>Reflective 📖</option>
                    <option>Rebellious ✊</option>
                    <option>Nostalgic 📼</option>
                  </select>
                </div>
              ) : (
                <p><strong>Mood:</strong> {mood || "Chillin' 😎"}</p>
              )}
              <p>
                <strong>Status:</strong>{" "}
                <span style={{ color: isUserOnline() ? "#00ff66" : "#aaaaaa", fontWeight: "bold" }}>
                  {getStatusText()}
                </span>
              </p>
              <p><strong>Region:</strong> Phoenix Area</p>
            </div>

            {!isEditing && (
              <MySpaceMusicPlayer 
                key={spotify_track_uri}
                spotifyTrackUri={spotify_track_uri} 
                spotifySongTitle={spotify_song_title}
                spotifyArtistName={spotify_artist_name}
              />
            )}

            {/* Custom Theme Selector (only visible in edit mode) */}
            {isEditing && (
              <>
                <div className="profile-edit-card" style={{ display: "flex", flexDirection: "column", gap: "2px", margin: "4px 0" }}>
                  <label style={{ fontSize: "11px", fontWeight: "bold", color: "inherit" }}>Profile Theme:</label>
                  <select 
                    value={editProfileTheme} 
                    onChange={(e) => {
                      const selectedTheme = e.target.value;
                      if (!isThemeUnlocked(selectedTheme) && userId === currentUserId) {
                        const cozyThemes = ["animal-crossing", "spirited-away", "matcha-tea"];
                        const badBitchThemes = ["8-ball", "long-nails", "sheer"];
                        const isCozy = cozyThemes.includes(selectedTheme);
                        const isBadBitch = badBitchThemes.includes(selectedTheme);
                        const packId = isCozy ? "cozy_pack" : isBadBitch ? "badbitch_pack" : "weeb_pack";
                        const packName = isCozy ? "Cozy Girl Theme Bundle" : isBadBitch ? "Bad Bitch Theme Bundle" : "Weeb Theme Bundle";
                        const packThemes = isCozy ? cozyThemes : isBadBitch ? badBitchThemes : ["one-piece", "demon-slayer", "jujutsu-kaisen"];
                        
                        setCheckoutProduct({ id: packId, name: packName, cost: "$1.99", themes: packThemes, targetTheme: selectedTheme });
                        setCheckoutStep("idle");
                        setShowCheckoutModal(true);
                        
                        fetchProductDetails([packId]).then(products => {
                          const prod = products.find(p => p.productIdentifier === packId);
                          if (prod) {
                            setCheckoutProduct(prev => prev ? { ...prev, cost: prod.price, name: prod.title } : null);
                          }
                        }).catch(err => console.log("Failed loading real IAP metadata:", err));
                      } else {
                        setEditProfileTheme(selectedTheme);
                      }
                    }}
                    style={{ width: "100%", padding: "2px" }}
                  >
                    <option value="classic">Classic (Blue/Pink)</option>
                    <option value="glitter">Glitter 💖</option>
                    <option value="cyberpunk">Cyberpunk 🟢</option>
                    <option value="sunset">Sunset 🌅</option>
                    <option value="goth">Goth 🖤</option>
                    <option value="gameboy">Gameboy 🎮</option>
                    <option value="one-piece">
                      {isThemeUnlocked("one-piece") ? "One Piece ⚓" : "One Piece ⚓ (🔒 Weeb Pack - $1.99)"}
                    </option>
                    <option value="demon-slayer">
                      {isThemeUnlocked("demon-slayer") ? "Demon Slayer ⚔️" : "Demon Slayer ⚔️ (🔒 Weeb Pack - $1.99)"}
                    </option>
                    <option value="jujutsu-kaisen">
                      {isThemeUnlocked("jujutsu-kaisen") ? "Jujutsu Kaisen 💀" : "Jujutsu Kaisen 💀 (🔒 Weeb Pack - $1.99)"}
                    </option>
                    <option value="animal-crossing">
                      {isThemeUnlocked("animal-crossing") ? "Animal Crossing 🍃" : "Animal Crossing 🍃 (🔒 Cozy Girl Pack - $1.99)"}
                    </option>
                    <option value="spirited-away">
                      {isThemeUnlocked("spirited-away") ? "Spirited Away 🏮" : "Spirited Away 🏮 (🔒 Cozy Girl Pack - $1.99)"}
                    </option>
                    <option value="matcha-tea">
                      {isThemeUnlocked("matcha-tea") ? "Matcha Tea 🍵" : "Matcha Tea 🍵 (🔒 Cozy Girl Pack - $1.99)"}
                    </option>
                    <option value="8-ball">
                      {isThemeUnlocked("8-ball") ? "8-Ball 🎱" : "8-Ball 🎱 (🔒 Bad Bitch Pack - $1.99)"}
                    </option>
                    <option value="long-nails">
                      {isThemeUnlocked("long-nails") ? "Long Nails 💅" : "Long Nails 💅 (🔒 Bad Bitch Pack - $1.99)"}
                    </option>
                    <option value="sheer">
                      {isThemeUnlocked("sheer") ? "Sheer ✨" : "Sheer ✨ (🔒 Bad Bitch Pack - $1.99)"}
                    </option>
                  </select>
                  {userId === currentUserId && (
                    <div style={{ marginTop: "4px", fontSize: "10px", display: "flex", gap: "10px" }}>
                      <button
                        type="button"
                        style={{ background: "none", border: "none", color: "blue", textDecoration: "underline", cursor: "pointer", padding: 0 }}
                        onClick={async () => {
                          if (onSaveProfile) {
                            await onSaveProfile(currentUserId, {
                              unlockedThemes: ["classic", "glitter", "cyberpunk", "sunset", "goth", "gameboy"]
                            });
                            alert("Theme purchases reset! Anime themes are now locked again.");
                          }
                        }}
                      >
                        Reset Theme Purchases (Developer Test)
                      </button>
                      <button
                        type="button"
                        style={{ background: "none", border: "none", color: "green", textDecoration: "underline", cursor: "pointer", padding: 0, fontWeight: "bold" }}
                        onClick={handleRestorePurchases}
                        disabled={restoring}
                      >
                        {restoring ? "Restoring..." : "Restore App Store Purchases"}
                      </button>
                    </div>
                  )}
                </div>
                <div className="profile-edit-card" style={{ display: "flex", flexDirection: "column", gap: "8px", margin: "4px 0" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label style={{ fontSize: "11px", fontWeight: "bold", color: "inherit" }}>Spotify Track URI:</label>
                      <button 
                        type="button"
                        onClick={() => setShowHelpModal(true)} 
                        className="profile-help-btn"
                      >
                        [ ? ]
                      </button>
                    </div>
                    <input 
                      type="text" 
                      value={editSpotifyTrackUri}
                      onChange={(e) => {
                        setEditSpotifyTrackUri(e.target.value);
                        if (profileError) setProfileError("");
                      }}
                      placeholder="e.g. spotify:track:4PTG3Z6ehGkBF3zI7YSp6g"
                      style={{ width: "100%", fontSize: "12px", padding: "4px", minHeight: "28px", height: "28px" }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "bold", color: "inherit" }}>Display Song Title (Optional):</label>
                    <input 
                      type="text" 
                      value={editSpotifySongTitle}
                      onChange={(e) => setEditSpotifySongTitle(e.target.value)}
                      placeholder="e.g. Hum of Hurt"
                      style={{ width: "100%", fontSize: "12px", padding: "4px", minHeight: "28px", height: "28px" }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "bold", color: "inherit" }}>Display Artist Name (Optional):</label>
                    <input 
                      type="text" 
                      value={editSpotifyArtistName}
                      onChange={(e) => setEditSpotifyArtistName(e.target.value)}
                      placeholder="e.g. Converge"
                      style={{ width: "100%", fontSize: "12px", padding: "4px", minHeight: "28px", height: "28px" }}
                    />
                  </div>

                  {profileError && (
                    <div 
                      style={{ 
                        backgroundColor: "#ff007f", 
                        color: "#fff", 
                        border: "2px outset #ff007f", 
                        padding: "6px", 
                        marginTop: "4px", 
                        fontSize: "10px", 
                        fontFamily: "monospace", 
                        fontWeight: "bold",
                        lineHeight: "1.3"
                      }}
                    >
                      🚨 {profileError}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Contact Box — shown when viewing another user's profile */}
            {userId !== currentUserId && (
              <div className="contact-box">
                <div className="contact-box-header">Contacting {username}</div>
                <div className="contact-box-grid">
                  <div className="contact-action" onClick={handleSendMessage}>
                    ✉️ Send Message (AIM)
                  </div>
                  <div className="contact-action" onClick={() => alert(`${username} added to friends list!`)}>
                    ➕ Add to Friends
                  </div>
                  <div className="contact-action" onClick={handleShareProfile}>
                    🔗 Share Profile
                  </div>
                  <div className="contact-action" onClick={() => alert("Reported to system sysop.")}>
                    ⚠️ Report User
                  </div>
                  <div className="contact-action" style={{ gridColumn: "span 2" }} onClick={() => {
                    setNewGuestbookMessage("");
                    setNewGuestbookStamp("glitter_heart");
                    setShowSignGuestbook(true);
                  }}>
                    ✍️ Sign {username}'s Guestbook
                  </div>
                </div>
              </div>
            )}

            <div className="profile-bio-box beveled-box" style={{ marginTop: "12px", backgroundColor: "#fff", padding: "8px" }}>
              <div className="section-header-orange">About Me:</div>
              {isEditing ? (
                <textarea 
                  rows="4" 
                  value={editBio} 
                  onChange={(e) => setEditBio(e.target.value)} 
                  style={{ width: "100%", fontFamily: "Arial, sans-serif", fontSize: "13px", padding: "4px" }}
                />
              ) : (
                <p 
                  style={{ margin: "5px 0", fontSize: "13px", lineHeight: "1.3", whiteSpace: "pre-wrap" }}
                >
                  {bio || "This user is keeping it mysterious and hasn't written a biography yet."}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Friend Space + Favorited Bars */}
          <div className="profile-right-col">
            <div className="top8-container beveled-box">
              <div className="section-header-orange">{username}'s Friend Space</div>

              <div className="top8-grid">
                {/* Tom is always first */}
                <div
                  className="top8-friend"
                  onClick={() => onOpenProfile && onOpenProfile("tom", {
                    username: "Tom",
                    mood: "Friendly 🙂",
                    bio: "Remember me?",
                    headline: "Everyones first friend!",
                    profileTheme: "classic",
                    emoji_avatar: "👥🥃💖"
                  })}
                >
                  <span style={{ fontSize: "28px", lineHeight: 1 }}>👥🥃💖</span>
                  <span className="friend-name">Tom</span>
                </div>

                {/* Hunter is always second */}
                <div
                  className="top8-friend"
                  onClick={() => onOpenProfile && onOpenProfile("hunter", {
                    username: "Hunter",
                    mood: "Coding 💻",
                    bio: "Founder of asl. Let me know if you have any questions!",
                    profileTheme: "classic",
                    emoji_avatar: "⚡🖥️🛹"
                  })}
                >
                  <span style={{ fontSize: "28px", lineHeight: 1 }}>⚡🖥️🛹</span>
                  <span className="friend-name">Hunter</span>
                </div>

                {/* Real accepted connections */}
                {acceptedConnections.slice(0, 6).map(conn => {
                  const profile = friendProfiles[conn.userId];
                  const displayName = profile?.username || conn.username || "Connection";
                  const displayEmoji = profile?.emoji_avatar || "👥🥃💖";
                  return (
                    <div
                      key={conn.userId}
                      className="top8-friend"
                      onClick={() => onOpenProfile && onOpenProfile(conn.userId, {
                        username: displayName,
                        mood: profile?.mood || "Chillin' 😎",
                        bio: profile?.bio || "",
                        profileTheme: profile?.profileTheme || "classic",
                        emoji_avatar: displayEmoji
                      })}
                    >
                      <span style={{ fontSize: "28px", lineHeight: 1 }}>{displayEmoji}</span>
                      <span className="friend-name">{displayName}</span>
                    </div>
                  );
                })}
              </div>
              
              {acceptedConnections.length === 0 && (
                <p style={{ fontSize: "10px", color: "#888", fontStyle: "italic", marginTop: "8px", padding: "0 4px", lineHeight: "1.4" }}>
                  Your friend space fills up when someone matches your "That Was Me!" — or you match theirs.
                </p>
              )}
            </div>

            {/* Favorited Bars Section */}
            <div className="top8-container beveled-box" style={{ marginTop: "12px", padding: "6px" }}>
              <div className="section-header-orange" style={{ margin: "0 0 8px 0" }}>{username}'s Favorited Bars</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {favoritedVenueList.length === 0 ? (
                  <div style={{ padding: "10px", textAlign: "center", color: "#888", fontSize: "11px", fontStyle: "italic" }}>
                    No favorited bars yet.
                  </div>
                ) : (
                  favoritedVenueList.map(venue => (
                    <div 
                      key={venue.fsq_id}
                      onClick={() => onSelectVenue && onSelectVenue(venue.fsq_id)}
                      className="favorited-bar-item"
                      title="Click to view bar details"
                    >
                      <span>🍹 {venue.name}</span>
                      <span>{venue.zone} ➡️</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Guestbook Section */}
        <div className="top8-container beveled-box" style={{ marginTop: "16px", padding: "6px" }}>
          <div className="section-header-orange" style={{ margin: "0 0 8px 0" }}>{username}'s Guestbook</div>
          
          {isLoadingGuestbook ? (
            <div style={{ padding: "12px", textAlign: "center", fontSize: "11px", fontStyle: "italic" }}>
              Loading guestbook signatures...
            </div>
          ) : guestbookEntries.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#888", fontSize: "11px", fontStyle: "italic", background: "#f9f9f9", border: "1px inset #808080" }} className="guestbook-ledger">
              This guestbook is empty. Be the first to sign it!
            </div>
          ) : (
            <div className="guestbook-ledger">
              {guestbookEntries.map((entry) => (
                <div key={entry.id} className="guestbook-entry-row">
                  <div className="guestbook-stamp-col" title={GUESTBOOK_STAMPS[entry.stamp]?.label || "Stamp"}>
                    {GUESTBOOK_STAMPS[entry.stamp]?.emoji || "✍️"}
                  </div>
                  <div className="guestbook-msg-col">
                    <span dangerouslySetInnerHTML={parseBBCode(entry.message)} />
                  </div>
                  <div className="guestbook-meta-col">
                    <a onClick={() => {
                      if (onOpenProfile) {
                        onOpenProfile(entry.authorUid, {
                          username: entry.authorName,
                          emoji_avatar: entry.authorAvatar,
                          mood: "Vibing",
                          bio: "Retro traveler...",
                          profileTheme: "classic"
                        });
                      }
                    }}>
                      {entry.authorAvatar} {entry.authorName}
                    </a>
                    <span style={{ display: "block", marginTop: "2px" }}>{formatDate(entry.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sign Guestbook Modal Window Overlay */}
        {showSignGuestbook && (
          <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999
          }}>
            <form onSubmit={handleSignGuestbook} className="window" style={{ width: "320px", fontFamily: "inherit" }}>
              <div className="title-bar">
                <div className="title-bar-text">Sign {username}'s Guestbook</div>
                <div className="title-bar-controls">
                  <button type="button" aria-label="Close" onClick={() => setShowSignGuestbook(false)} />
                </div>
              </div>
              <div className="window-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <p style={{ margin: 0, fontSize: "11px" }}>Leave a message for {username}:</p>
                
                {/* BBCode shortcuts */}
                <div style={{ display: "flex", gap: "4px" }}>
                  <button type="button" onClick={() => insertBBCode("b")} style={{ minWidth: "24px", padding: "2px 4px", fontSize: "10px" }}><b>B</b></button>
                  <button type="button" onClick={() => insertBBCode("i")} style={{ minWidth: "24px", padding: "2px 4px", fontSize: "10px" }}><i>I</i></button>
                  <button type="button" onClick={() => insertBBCode("rainbow")} style={{ padding: "2px 6px", fontSize: "10px", fontWeight: "bold" }}>🌈 Rainbow</button>
                </div>

                <textarea
                  id="guestbook-textarea"
                  rows="4"
                  value={newGuestbookMessage}
                  onChange={(e) => setNewGuestbookMessage(e.target.value)}
                  placeholder="Type your message here..."
                  maxLength="250"
                  style={{ width: "100%", boxSizing: "border-box", resize: "none" }}
                  required
                />
                
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "bold" }}>Select a Retro Stamp:</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", background: "#ffffff", padding: "6px", border: "1px inset #808080", borderRadius: 0 }}>
                    {Object.entries(GUESTBOOK_STAMPS).map(([key, stampInfo]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setNewGuestbookStamp(key)}
                        style={{
                          width: "32px",
                          height: "32px",
                          fontSize: "20px",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: newGuestbookStamp === key ? "2px solid #000080" : "1px solid #dfdfdf",
                          background: newGuestbookStamp === key ? "#fff0f5" : "#f0f0f0",
                          boxShadow: newGuestbookStamp === key ? "inset 1px 1px #808080" : "none"
                        }}
                        title={stampInfo.label}
                      >
                        {stampInfo.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px", marginTop: "4px" }}>
                  <button type="button" onClick={() => setShowSignGuestbook(false)} style={{ width: "70px" }}>Cancel</button>
                  <button type="submit" disabled={isSubmittingGuestbook} style={{ width: "100px", fontWeight: "bold" }}>
                    {isSubmittingGuestbook ? "Signing..." : "Sign Guestbook"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Profile Operations — at the very bottom, only visible to profile owner */}
        {(userId === currentUserId || isAdmin) && (
          <div className="contact-box" style={{ marginTop: "16px" }}>
            <div className="contact-box-header">{userId === currentUserId ? "Profile Operations" : `Moderate ${username}'s Profile`}</div>
            <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {isEditing ? (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button 
                    className="default" 
                    onClick={handleSave} 
                    style={{ flex: 1, minHeight: "42px", fontSize: "14px" }}
                  >
                    💾 Save
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setEditUsername(username);
                      setEditMood(mood);
                      setEditBio(bio);
                      setEditProfileTheme(profileTheme);
                      setEditEmojiAvatar(emoji_avatar);
                      setEditSpotifyTrackUri(spotify_track_uri);
                      setEditSpotifySongTitle(spotify_song_title);
                      setEditSpotifyArtistName(spotify_artist_name);
                      setEditHeadline(headline);
                      setProfileError("");
                    }} 
                    style={{ flex: 1, minHeight: "42px", fontSize: "14px" }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <button 
                    onClick={() => setIsEditing(true)} 
                    style={{ width: "100%", minHeight: "42px", fontSize: "14px" }}
                  >
                    {userId === currentUserId ? "⚙️ Edit My Profile" : "⚙️ Moderate Profile Details"}
                  </button>
                  <button 
                    onClick={handleShareProfile} 
                    style={{ width: "100%", minHeight: "42px", fontSize: "14px" }}
                  >
                    🔗 Share My Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {showHelpModal && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999
          }}
          onClick={() => setShowHelpModal(false)}
        >
          <div 
            style={{
              width: "320px",
              backgroundColor: "#dfdfdf",
              border: "2px solid #fff",
              borderRightColor: "#808080",
              borderBottomColor: "#808080",
              padding: "2px",
              boxShadow: "0 0 10px rgba(0,0,0,0.5)",
              boxSizing: "border-box"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title Bar */}
            <div 
              style={{
                backgroundColor: "#003399",
                color: "#fff",
                padding: "4px 6px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: "bold",
                fontSize: "11px",
                fontFamily: "Tahoma, sans-serif"
              }}
            >
              <span>Spotify Help & Instructions</span>
              <button 
                onClick={() => setShowHelpModal(false)}
                style={{
                  width: "14px",
                  height: "14px",
                  fontSize: "9px",
                  lineHeight: "10px",
                  padding: 0,
                  cursor: "pointer",
                  backgroundColor: "#dfdfdf",
                  border: "1px solid #808080",
                  fontWeight: "bold"
                }}
              >
                X
              </button>
            </div>

            {/* Content */}
            <div 
              style={{
                padding: "12px",
                fontSize: "12px",
                color: "#000",
                lineHeight: "1.5",
                fontFamily: "Arial, Helvetica, sans-serif"
              }}
            >
              <p style={{ fontWeight: "bold", margin: "0 0 8px 0" }}>How to get your Spotify Track URI:</p>
              <ol style={{ paddingLeft: "20px", margin: "0 0 12px 0" }}>
                <li>Open the Spotify app or web player.</li>
                <li>Find your favorite song.</li>
                <li>Click the three dots next to the song title.</li>
                <li>Go to <strong>Share</strong> -&gt; <strong>Copy Song Link</strong>.</li>
                <li>Paste that link directly into the input field!</li>
              </ol>
              <p style={{ margin: 0, fontSize: "11px", color: "#666" }}>
                We will automatically extract the 22-character track ID for you!
              </p>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px", borderTop: "1px solid #ccc" }}>
              <button 
                onClick={() => setShowHelpModal(false)}
                style={{
                  padding: "4px 16px",
                  fontSize: "12px",
                  cursor: "pointer",
                  backgroundColor: "#dfdfdf",
                  border: "2px solid #fff",
                  borderRightColor: "#808080",
                  borderBottomColor: "#808080",
                  fontWeight: "bold"
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECURE CHECKOUT MODAL OVERLAY */}
      {showCheckoutModal && checkoutProduct && (
        <div className="modal-overlay" style={{ zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="window" style={{ width: "320px" }}>
            <div className="title-bar">
              <div className="title-bar-text">asl Secure Billing Gateway</div>
              <div className="title-bar-controls">
                <button aria-label="Close" onClick={() => setShowCheckoutModal(false)} />
              </div>
            </div>
            <div className="window-body" style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {checkoutStep === "idle" && (
                <>
                  <div style={{ textAlign: "center", fontSize: "24px", margin: "10px 0" }}>💳🔒</div>
                  <p style={{ margin: 0, fontWeight: "bold", fontSize: "14px", textAlign: "center" }}>
                    Secure In-App Purchase
                  </p>
                  <div className="profile-edit-card" style={{ padding: "10px", margin: 0 }}>
                    <p style={{ margin: "0 0 6px 0" }}><strong>Item:</strong> {checkoutProduct.name}</p>
                    <p style={{ margin: "0 0 6px 0" }}><strong>Price:</strong> {checkoutProduct.cost}</p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#666" }}>
                      {checkoutProduct.id === "cozy_pack"
                        ? "Unlocks 3 themes: Animal Crossing 🍃, Spirited Away 🏮, and Matcha Tea 🍵."
                        : "Unlocks 3 themes: One Piece ⚓, Demon Slayer ⚔️, and Jujutsu Kaisen 💀."}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "10px" }}>
                    <button onClick={() => setShowCheckoutModal(false)}>Cancel</button>
                    <button className="default" onClick={handleSimulatePurchase}>Buy Now</button>
                  </div>
                </>
              )}

              {checkoutStep === "processing" && (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div className="retro-blink" style={{ fontWeight: "bold", color: "#003399", marginBottom: "15px" }}>
                    {checkoutStatusText}
                  </div>
                  <div style={{ width: "100%", height: "12px", backgroundColor: "#dfdfdf", border: "1px solid #808080", padding: "1px", boxSizing: "border-box" }}>
                    <div style={{ width: "100%", height: "100%", background: "linear-gradient(90deg, #003399 0%, #ff66cc 100%)" }} />
                  </div>
                </div>
              )}

              {checkoutStep === "success" && (
                <>
                  <div style={{ textAlign: "center", fontSize: "28px", color: "green", margin: "10px 0" }}>✅ APPROVED</div>
                  <p style={{ margin: 0, fontWeight: "bold", textAlign: "center", color: "green" }}>
                    Purchase Successful!
                  </p>
                  <p style={{ margin: "6px 0", fontSize: "12px", textAlign: "center" }}>
                    The "{checkoutProduct.id === "cozy_pack" ? "Cozy Girl" : "Weeb"}" themes bundle has been permanently unlocked and credited to your node.
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
                    <button className="default" onClick={handleCloseSuccess}>OK</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
