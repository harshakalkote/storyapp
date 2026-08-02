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

/* State container */
const State = {
  lang: DB.get('lang', 'en'),                 // 'en' | 'hi'
  savedStories: DB.get('savedStories', []),   // user library
  dailyCache: DB.get('dailyCache', {}),       // { 'YYYY-MM-DD': story }
  addStory(story) {
    this.savedStories.unshift(story);
    // keep the library from growing without bound
    this.savedStories = this.savedStories.slice(0, 200);
    DB.set('savedStories', this.savedStories);
    return story;
  },
  setDaily(dateKey, story) {
    this.dailyCache[dateKey] = story;
    DB.set('dailyCache', this.dailyCache);
  },
};
