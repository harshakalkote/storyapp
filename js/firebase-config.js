/* =====================================================================
 *  Katha Kids — Firebase Configuration  (FILL IN YOUR OWN VALUES)
 *  -------------------------------------------------------------------
 *  The app ships with this block as placeholders. Until you paste real
 *  values the app runs in **local-only mode** (stories are saved to the
 *  device) so everything still works — it just won't sync to the cloud
 *  or let people sign in.
 *
 *  HOW TO SET UP YOUR OWN FIREBASE PROJECT (one time, ~5 minutes):
 *    1. Go to https://console.firebase.google.com → "Add project".
 *    2. Inside your project, click the "</>" (Web) icon to register a
 *       new web app, then copy the `firebaseConfig` object it shows.
 *    3. **Authentication** → Get started → enable the **Google**
 *       provider (set a support email if asked).
 *    4. **Firestore Database** → Create database (start in **Test mode**
 *       for now so you can try it; switch to the security rules at the
 *       bottom of this repo's README before going public).
 *    5. Paste your values below (replace the "YOUR_..." placeholders).
 * ===================================================================== */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCRNMbM5L_F35NIk98-ZI4AarSw0wBOd9Q",
  authDomain: "storyapp-3b136.firebaseapp.com",
  projectId: "storyapp-3b136",
  storageBucket: "storyapp-3b136.firebasestorage.app",
  messagingSenderId: "563127405991",
  appId: "1:563127405991:web:515adc3197061f248d7a82",
  measurementId: "G-81FYBNCG3B"
};

/* Name of the Firestore collection that holds all community stories. */
const FIREBASE_STORY_COLLECTION = "stories";

/* Auto-sign-in visitors anonymously so guests can also save to the cloud. */
const FIREBASE_ANON_SIGNIN = true;

/* True once you've pasted real credentials. Used to enable cloud features. */
function firebaseConfigured() {
  return !!(FIREBASE_CONFIG &&
    FIREBASE_CONFIG.apiKey && !FIREBASE_CONFIG.apiKey.startsWith("YOUR_") &&
    FIREBASE_CONFIG.projectId && !FIREBASE_CONFIG.projectId.startsWith("YOUR_") &&
    FIREBASE_CONFIG.appId && !FIREBASE_CONFIG.appId.startsWith("YOUR_"));
}
