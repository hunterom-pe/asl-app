/**
 * Grant (or revoke) the SysOp `admin` custom claim on a user account.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node set_admin.js <email> [--revoke]
 *
 * Download a service-account key from:
 *   Firebase Console -> Project Settings -> Service accounts -> Generate new private key
 * (Keep that JSON out of git — it is already gitignored.)
 *
 * After running, the user must sign out and back in for the new claim to take
 * effect in their ID token.
 */
const admin = require("firebase-admin");

admin.initializeApp();

const email = process.argv[2];
const revoke = process.argv.includes("--revoke");

if (!email) {
  console.error("Usage: node set_admin.js <email> [--revoke]");
  process.exit(1);
}

admin
  .auth()
  .getUserByEmail(email)
  .then((user) => admin.auth().setCustomUserClaims(user.uid, { admin: !revoke }))
  .then(() => {
    console.log(`${revoke ? "Revoked" : "Granted"} admin for ${email}. They must re-authenticate to refresh their token.`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to set admin claim:", err);
    process.exit(1);
  });
