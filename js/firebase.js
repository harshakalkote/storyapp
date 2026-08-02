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

  /* ---------- Saving a story (works for signed-in AND anonymous) ---------- */
  async function addStory(story) {
    // Always keep an on-device copy as an offline fallback.
    const local = State.addStory({ ...story });

    if (!configured || !db) return { local, cloud: false };

    const u = currentUser;
    const doc = {
      ...story,
      uid: u ? u.uid : null,
      authorName: u ? (u.name || (u.isAnonymous ? 'Guest' : '')) : 'Guest',
      authorEmail: u ? u.email : '',
      authorPhoto: u ? u.photoURL : '',
      anonymous: u ? u.isAnonymous : true,
      createdAt: story.createdAt || Date.now(),
      savedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    try {
      const ref = await db.collection(FIREBASE_STORY_COLLECTION).add(doc);
      return { local, cloud: true, id: ref.id };
    } catch (e) {
      console.warn('FirebaseStore: cloud save failed, kept locally', e);
      return { local, cloud: false };
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

  return {
    init, subscribe, getUser,
    isConfigured, isReady,
    signInWithGoogle, signOut,
    addStory, getStories, onStoriesSnapshot,
  };
})();
