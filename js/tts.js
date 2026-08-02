/* Read-aloud using the browser's Web Speech API.
 * Picks an appropriate voice for EN/HI automatically. */
const TTS = (() => {
  let voices = [];
  let currentUtter = null;

  function loadVoices() {
    voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  }
  if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  function pickVoice(lang) {
    const want = lang === 'hi' ? 'hi' : 'en';
    // Prefer Indian English for English stories
    let v = voices.find(x => x.lang && x.lang.toLowerCase().startsWith(want) &&
                             x.lang.toLowerCase().includes('in'));
    if (!v) v = voices.find(x => x.lang && x.lang.toLowerCase().startsWith(want));
    return v || null;
  }

  function speak(text, lang, { onend } = {}) {
    if (!('speechSynthesis' in window)) return;
    stop();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    const v = pickVoice(lang);
    if (v) u.voice = v;
    u.rate = 0.92;
    u.pitch = 1.05;
    u.onend = () => { currentUtter = null; onend && onend(); };
    u.onerror = () => { currentUtter = null; onend && onend(); };
    currentUtter = u;
    window.speechSynthesis.speak(u);
  }

  function stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      currentUtter = null;
    }
  }

  function speaking() { return 'speechSynthesis' in window && window.speechSynthesis.speaking; }

  return { speak, stop, speaking };
})();
