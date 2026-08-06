/* =====================================================================
 *  Katha Kids — Firebase layer (Authentication + Firestore)
 *  -------------------------------------------------------------------
 *  Adds cloud storage so stories can be saved by BOTH signed-in and
 *  anonymous users:
 *    • Guests are auto-signed-in anonymously (so they have a cloud id).
 *    • Anyone can sign in with Google for a persistent account.
 *    • Every saved story is written to Firestore under the "stories"
 *      collection, tagged with the author.
 *    • The library ("My Stories") shows the community feed = all users'
 *      stories, newest first. When offline / not configured it falls
 *      back to the on-device library.
 *  Uses the Firebase v9 *compat* SDK, loaded from the Google CDN.
 * ===================================================================== */

const FirebaseStore = (() => {
  const configured = firebaseConfigured();

  let app = null, auth = null, db = null;
  let currentUser = null;             // { uid, name, email, photoURL, isAnonymous }
  const listeners = [];               // auth-change subscribers

  /* ---------- Init (call once on app start) ---------- */
  function init() {
    if (!configured) {
      console.warn('FirebaseStore: not configured — running local-only mode.');
      return;
    }
    try {
      app = firebase.apps.length ? firebase.app() : firebase.initializeApp(FIREBASE_CONFIG);
      auth = firebase.auth(app);
      db = firebase.firestore(app);

      auth.onAuthStateChanged((user) => {
        if (user) {
          currentUser = {
            uid: user.uid,
            name: user.displayName || (user.isAnonymous ? 'Guest' : ''),
            email: user.email || '',
            photoURL: user.photoURL || '',
            isAnonymous: !!user.isAnonymous,
          };
        } else {
          // No session -> sign the visitor in anonymously so they can save too.
          if (FIREBASE_ANON_SIGNIN) {
            auth.signInAnonymously().catch(e =>
              console.warn('FirebaseStore: anonymous sign-in failed', e));
          }
          currentUser = null;
        }
        emit();
      });
    } catch (e) {
      console.error('FirebaseStore: init failed', e);
      app = null; auth = null; db = null;
    }
  }

  /* ---------- Observers (auth state) ---------- */
  function subscribe(fn) { listeners.push(fn); return () => { const i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); }; }
  function emit() { const u = currentUser; listeners.forEach(fn => { try { fn(u); } catch (e) {} }); }

  function getUser() { return currentUser; }
  function isConfigured() { return configured; }
  function isReady() { return configured && !!(auth && db && currentUser); }

  /* True if the signed-in user is on the admin allowlist. The
     allowlist lives in ADMIN_EMAILS (firebase-config.js) and MUST
     match the email list in firestore.rules. */
  function isAdmin() {
    const u = currentUser;
    if (!u || u.isAnonymous || !u.email) return false;
    if (!Array.isArray(ADMIN_EMAILS) || ADMIN_EMAILS.length === 0) return false;
    return ADMIN_EMAILS.map(e => String(e).trim().toLowerCase())
                        .includes(u.email.trim().toLowerCase());
  }

  /* ---------- Authentication ---------- */
  function signInWithGoogle() {
    if (!auth) return Promise.reject(new Error('Firebase not configured yet. Add your keys in js/firebase-config.js.'));
    const provider = new firebase.auth.GoogleAuthProvider();
    return auth.signInWithPopup(provider).catch(e => {
      console.warn('Google sign-in error', e);
      throw e;
    });
  }

  function signOut() {
    if (!auth) return Promise.resolve();
    return auth.signOut().catch(e => console.warn('Sign-out error', e));
  }

  /* ---------- Saving a story (works for signed-in AND anonymous) ----------
   * Saves are IDEMPOTENT: the story's content-derived id is used as the
   * Firestore document id, so re-saving the same story updates the same
   * document instead of creating a duplicate. The caller is expected to
   * have run ensureStoryId() (State.addStory does this). */
  async function addStory(story) {
    // Always keep an on-device copy as an offline fallback. This also
    // ensures the story has a content-derived id.
    const r = State.addStory({ ...story });
    const localStory = r.story;
    const deduped = r.deduped;

    if (!configured || !db) return { story: localStory, local: true, cloud: false, deduped };

    const u = currentUser;
    const doc = {
      ...localStory,
      uid: u ? u.uid : null,
      authorName: u ? (u.name || (u.isAnonymous ? 'Guest' : '')) : 'Guest',
      authorEmail: u ? u.email : '',
      authorPhoto: u ? u.photoURL : '',
      anonymous: u ? u.isAnonymous : true,
      createdAt: localStory.createdAt || Date.now(),
      savedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    try {
      // Use the content-derived id as the document id so re-saves are
      // idempotent at the cloud level (no duplicate rows in the feed).
      await db.collection(FIREBASE_STORY_COLLECTION)
              .doc(localStory.id)
              .set(doc, { merge: true });
      return { story: localStory, local: true, cloud: true, deduped, id: localStory.id };
    } catch (e) {
      console.warn('FirebaseStore: cloud save failed, kept locally', e);
      return { story: localStory, local: true, cloud: false, deduped };
    }
  }

  /* ---------- Community feed (all users, newest first) ---------- */
  async function getStories(limit = 100) {
    if (!configured || !db) return null;          // null -> caller falls back to local
    try {
      const snap = await db.collection(FIREBASE_STORY_COLLECTION)
        .orderBy('savedAt', 'desc')
        .limit(limit)
        .get();
      return snap.docs.map(d => ({ ...d.data(), cloudId: d.id }));
    } catch (e) {
      console.warn('FirebaseStore: fetch failed', e);
      return null;
    }
  }

  /* Real-time subscription to the community feed. Returns an unsubscribe fn. */
  function onStoriesSnapshot(cb, limit = 100) {
    if (!configured || !db) { cb(null); return () => {}; }
    return db.collection(FIREBASE_STORY_COLLECTION)
      .orderBy('savedAt', 'desc')
      .limit(limit)
      .onSnapshot(
        snap => cb(snap.docs.map(d => ({ ...d.data(), cloudId: d.id }))),
        err => { console.warn('FirebaseStore: snapshot error', err); cb(null); }
      );
  }

  /* ---------- Admin: delete a community story ---------- */
  /* Deletes a single story from the cloud by its Firestore doc id.
     Throws if Firebase isn't configured, the user isn't an admin,
     or Firestore rejects the delete (PERMISSION_DENIED). */
  async function deleteStory(cloudId) {
    if (!configured || !db) throw new Error('Firebase not configured.');
    if (!cloudId) throw new Error('Missing story id.');
    if (!isAdmin()) {
      throw new Error('Only admins can delete stories. Sign in with an admin account.');
    }
    await db.collection(FIREBASE_STORY_COLLECTION).doc(cloudId).delete();
    return { id: cloudId };
  }

  return {
    init, subscribe, getUser,
    isConfigured, isReady, isAdmin,
    signInWithGoogle, signOut,
    addStory, getStories, onStoriesSnapshot,
    deleteStory,
  };
})();
