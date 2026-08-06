/* Tiny localStorage wrapper used across the app */
const DB = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem('kk_' + key);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('kk_' + key, JSON.stringify(value)); }
    catch (e) { console.warn('Storage full or blocked', e); }
  },
  remove(key) {
    try { localStorage.removeItem('kk_' + key); } catch (e) {}
  },
};

/* ---------------------------------------------------------------------
 *  Story identity (idempotency)
 *  -------------------------------------------------------------------
 *  Each story gets a stable `id` derived from its CONTENT (not the
 *  timestamp). Re-saving the same story is a no-op; saving a different
 *  story always creates a new entry. This prevents accidental double-
 *  taps / multi-clicks from creating duplicates in the user's library
 *  and in the Firestore community feed.
 *  --------------------------------------------------------------------- */

/* djb2 string hash — small, fast, deterministic. Returns a hex string. */
function hashString(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) + s.charCodeAt(i);          // h * 33 + c
    h = h & 0xFFFFFFFF;                            // keep 32-bit
  }
  // unsigned, hex
  return (h >>> 0).toString(16);
}

/* Canonical content used to derive a story's id. Volatile fields
 * (imageUrl, createdAt, authorName, etc.) are intentionally excluded
 * so that the same story re-generated or re-saved is recognized as
 * the same. Whitespace is collapsed. */
function storyContentFingerprint(story) {
  if (!story) return '';
  const norm = (v) => {
    if (v == null) return '';
    if (Array.isArray(v)) return v.map(norm).join(' | ');
    return String(v).replace(/\s+/g, ' ').trim();
  };
  // Use a stable, delimited layout so e.g. titleEn=ab + textEn=cd
  // never collides with titleEn=abc + textEn=d.
  return [
    'cat:',   norm(story.categoryId),
    'lang:',  norm(story.lang),
    'tE:',    norm(story.titleEn),
    'tH:',    norm(story.titleHi),
    'xE:',    norm(story.textEn),
    'xH:',    norm(story.textHi),
    'mE:',    norm(story.moralEn),
    'mH:',    norm(story.moralHi),
  ].join('\n');
}

/* Compute and assign a stable content-derived id. Mutates and returns
 * the same story object for convenience. */
function ensureStoryId(story) {
  if (!story) return story;
  if (story.id) return story;                    // already has one
  const fp = storyContentFingerprint(story);
  story.id = 'st-' + (fp ? hashString(fp) : Date.now().toString(36));
  return story;
}

/* State container */
const State = {
  lang: DB.get('lang', 'en'),                 // 'en' | 'hi'
  savedStories: DB.get('savedStories', []),   // user library
  dailyCache: DB.get('dailyCache', {}),       // { 'YYYY-MM-DD': story }
  /* Returns { story, deduped } — deduped=true when the story was
   * already in the library (idempotent no-op). */
  addStory(story) {
    ensureStoryId(story);
    const existingIdx = this.savedStories.findIndex(s => s && s.id === story.id);
    if (existingIdx >= 0) {
      // Refresh content but keep the existing position; don't add a dup.
      this.savedStories[existingIdx] = { ...this.savedStories[existingIdx], ...story };
      DB.set('savedStories', this.savedStories);
      return { story: this.savedStories[existingIdx], deduped: true };
    }
    this.savedStories.unshift(story);
    // keep the library from growing without bound
    this.savedStories = this.savedStories.slice(0, 200);
    DB.set('savedStories', this.savedStories);
    return { story, deduped: false };
  },
  /* True if a story with this id is already in the local library. */
  hasStory(id) {
    if (!id) return false;
    return this.savedStories.some(s => s && s.id === id);
  },
  setDaily(dateKey, story) {
    this.dailyCache[dateKey] = story;
    DB.set('dailyCache', this.dailyCache);
  },
};
