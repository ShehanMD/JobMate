
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const serviceAccount = require("../private/serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

async function setAdmin() {
  try {
    const email = process.argv[2];

    if (!email) {
      throw new Error("Please provide an email address.");
    }

    const user = await getAuth().getUserByEmail(email);

    await getAuth().setCustomUserClaims(user.uid, {
      admin: true,
    });

    console.log(`Admin access assigned successfully to ${email}`);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

setAdmin();
