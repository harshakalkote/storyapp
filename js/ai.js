/* =====================================================================
 *  Katha Kids — AI Integration Layer
 *  -------------------------------------------------------------------
 *  Two providers supported out of the box:
 *    • OpenAI  — gpt-4o-mini (text) + dall-e-3 (image)
 *    • Google Gemini — gemini-2.5-flash (text) + gemini-2.5-flash-image (image)
 *
 *  The app runs in the browser, so calls go directly from the browser
 *  to the provider. This is fine for a family/prototype app; for a
 *  production launch you'd proxy through your own small backend so
 *  keys are never shipped to clients.
 * ===================================================================== */

const AI = (() => {

  /* ---------- Settings (persisted) ---------- */
  const defaults = {
    mode: 'mock',          // 'mock' | 'free' | 'real'
    provider: 'openai',    // 'openai' | 'gemini'  (used only when mode='real')
    openaiKey: '',
    geminiKey: '',
  };
  let cfg = { ...defaults, ...DB.get('aiConfig', {}) };

  function getConfig() { return cfg; }
  function setConfig(patch) {
    cfg = { ...cfg, ...patch };
    DB.set('aiConfig', cfg);
  }

  /* ---------- Build the story prompt ---------- */
  function buildPrompt(category, lang, userIdea, ageBand = '4 to 7') {
console.log("category:", category);
    console.log("lang:", lang);
    console.log("userIdea:", userIdea);
    console.log("ageBand:", ageBand);
    const nameEn = category.nameEn;
    const isHindi = lang === 'hi';
    const ideaLine = userIdea
      ? (isHindi ? `विचार: ${userIdea}` : `Idea to include: ${userIdea}`)
      : '';
    const sys = `You are a master children's book author specializing in magical, educational stories for young children (${ageBand}).
=== YOUR MISSION ===
Create a delightful story that sparks curiosity, imagination, and learning.
=== STORY REQUIREMENTS ===
1. STRUCTURE (300-400 words total):
   - A captivating title (3-6 words, exciting and clear)
   - 5-7 short paragraphs (2-3 sentences each)
   - End with a meaningful takeaway that naturally follows from the story 
2. TONE & STYLE:
   - Warm, encouraging, and full of wonder
   - Simple vocabulary suitable for ages 4-6
   - Active voice, present or simple past tense
   - Use repetition for engagement when appropriate 
   - Include onomatopoeia where fitting (Buzz! Splash! Giggle!) 
   - Allow a natural range of emotions, including happiness, curiosity
3. CHARACTER GUIDELINES:
   - Relatable child protagonist or friendly animal 
   - Give the main character a simple, memorable name 
   - Characters should have distinct personalities, wants, and motivations 
   - Characters may make mistakes, disagree, compete, fail, change their minds, or solve problems 
   - Keep characters age-appropriate and avoid genuinely frightening situations 
   - Do not automatically make cooperation, generosity, independence, competition, obedience, rebellion, or sacrifice the "correct" choice; let the story determine what works
4. FOR SCIENCE THEMES:
   - Frame science as asking "Why?" and "How?" 
   - Introduce 1-2 simple science concepts with child-friendly explanations 
   - Include a mini experiment or discovery moment 
   - Use sensory details such as colors, sounds, textures, and movement 
   - Do not sacrifice scientific accuracy merely to make the story more sentimental
5. ENGAGEMENT ELEMENTS:
   -Include 1-2 direct questions to the reader where natural 
   - End with a "Think About It" question for discussion 
   - Create a satisfying resolution, but the protagonist does not always need to win or get exactly what they wanted
6. MORAL / TAKEAWAY: 
	- The lesson must arise naturally from the events of the story 
	- Do not force every story to teach kindness, cooperation, sharing, or helping others
	- Vary lessons across stories when appropriate 
	- Possible themes include curiosity, courage, honesty, responsibility, perseverance, patience, creativity, independence, friendship, generosity, self-reliance, fair competition, keeping promises, learning from mistakes, respecting others, problem-solving, and accepting consequences 
	- Do not present one political, social, economic, or philosophical worldview as universally correct 
	- Avoid preaching or political messaging 
7. WHAT TO AVOID: 
	- Complex sentences or advanced vocabulary 
	- Abstract concepts without concrete examples 
	- Graphic violence, cruelty, abuse, or genuinely frightening situations
	- More than 3 named characters - Explicit political, religious, or ideological messaging 
	- Forced moral lessons unrelated to the plot 
	- Making one character morally superior simply because they are more generous, cooperative, rebellious, traditional, competitive, independent, or socially conscious
=== OUTPUT FORMAT ===
Return ONLY valid JSON with this exact structure:
{
  "title": "The Magic Bubble",
  "paragraphs": [
    "Lily loved blowing bubbles in her backyard.",
    "One day, she noticed something strange...",
    "..."
  ],
  "moral": "Asking questions helps us discover amazing things!"
}`;
    const user = `Create a children's story with these details:
Category: ${nameEn} and
Plot: ${ideaLine}
Guidelines:  Write for children ages 4-6 years - Keep the story age-appropriate, engaging, and imaginative - Allow natural emotions and age-appropriate problems or challenges - 5-7 short paragraphs that flow naturally - Let the characters' actions and experiences produce the lesson naturally - Vary the type of lesson from story to story - Do not automatically make helping others, cooperation, independence, competition, obedience, rebellion, generosity, or self-sacrifice the moral - Avoid political or ideological messaging - End with a simple takeaway that fits the specific story - Return ONLY the JSON object, no markdown, no explanations
Story:`;
   console.log("user prompt int the function:", user);
    return { sys, user};
  }

  /* ---------- Image prompt ---------- */
  function buildImagePrompt(category, title, lang) {
    const isHindi = lang === 'hi';
    const theme = category.nameEn;
    return [
      `Cute, friendly children's book illustration for the story "${title}".`,
      `Theme: ${theme}.`,
      `Soft flat colors, rounded shapes, cheerful, simple, no text, no words, no letters.`,
      `Suitable for ages 4-7, warm and kind mood, storybook art style.`,
    ].join(' ');
  }

  /* ---------- Provider: Pollinations (FREE) ----------
   *  As of April 2026, anonymous browser requests require a `referrer`
   *  parameter (register free at https://auth.pollinations.ai). Without
   *  it the API returns 403. We send the app's own domain/origin.
   */
  function pollinationsReferrer() {
    try { return location.hostname || 'katha-kids.local'; }
    catch (_) { return 'katha-kids.local'; }
  }

  async function pollinationsText(sys, user) {
    const ref = pollinationsReferrer();
    const url = `https://text.pollinations.ai/openai?referrer=${encodeURIComponent(ref)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai',
        temperature: 0.9,
        referrer: ref,
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: user },
        ],
      }),
    });
    if (!res.ok) {
      const hint = res.status === 403
        ? 'Pollinations blocked this site (403). Register your domain free at auth.pollinations.ai, or switch to Library mode / a Gemini key.'
        : 'Pollinations text ' + res.status;
      throw new Error(hint);
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    return parseJsonLoose(content);
  }

  /* Probe Pollinations — used by Settings "Test connection". */
  async function pollinationsTest() {
    const ref = pollinationsReferrer();
    try {
      const res = await fetch(`https://text.pollinations.ai/openai?referrer=${encodeURIComponent(ref)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'openai', referrer: ref,
          messages: [{ role: 'user', content: 'Say OK' }] }),
      });
      if (res.ok) return { ok: true, message: '✅ Pollinations is working from this site (referrer: ' + ref + ').' };
      if (res.status === 403) return { ok: false, message: '❌ 403: Pollinations does not recognize this site. Register "' + ref + '" free at auth.pollinations.ai, or use a Gemini key instead.' };
      return { ok: false, message: '❌ HTTP ' + res.status + ' from Pollinations.' };
    } catch (e) {
      return { ok: false, message: '❌ Network error — check your internet connection.' };
    }
  }

  /* Tolerant JSON extractor — models sometimes wrap JSON in prose or code fences */
  function parseJsonLoose(text) {
    if (!text) throw new Error('Empty AI response');
    try { return JSON.parse(text); } catch (_) {}
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) { try { return JSON.parse(fenced[1]); } catch (_) {} }
    const obj = text.match(/\{[\s\S]*\}/);
    if (obj) { try { return JSON.parse(obj[0]); } catch (_) {} }
    throw new Error('Could not parse story JSON');
  }

  function pollinationsImageUrl(prompt, seed) {
    const enc = encodeURIComponent(prompt);
    const params = new URLSearchParams({
      width: 640, height: 480, nologo: 'true', model: 'flux', seed,
      referrer: pollinationsReferrer(),
    });
    return `https://image.pollinations.ai/prompt/${enc}?${params.toString()}`;
  }

  /* ---------- Provider: OpenAI ---------- */
  async function openaiText(sys, user) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cfg.openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.9,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: user },
        ],
      }),
    });
    if (!res.ok) throw new Error('OpenAI text ' + res.status);
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    return JSON.parse(content);
  }

  async function openaiImage(prompt) {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cfg.openaiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    });
    if (!res.ok) throw new Error('OpenAI image ' + res.status);
    const data = await res.json();
    return data.data?.[0]?.url;
  }

  /* ---------- Provider: Gemini ----------
   *  Google frequently renames/deploys/depregates models (a big outage on
   *  2026-07-09 returned 404 for gemini-2.5-flash). So we try a chain of
   *  known-good model names and use whichever responds.
   */
  const GEMINI_TEXT_MODELS = [
	'gemini-3.5-flash',
	'gemini-3.5-flash-lite'
  ];
  const GEMINI_IMAGE_MODELS = [
    'gemini-2.5-flash-image-preview',
    'gemini-2.0-flash-exp-image-generation',
    'gemini-1.5-flash',
  ];

  async function geminiText(sys, user) {
	console.log("sys: ", sys);
	console.log("user:", user);
    if (!cfg.geminiKey) throw new Error('Add your Gemini key in Settings.');
    const body = JSON.stringify({
      systemInstruction: { parts: [{ text: sys }] },
      contents: [
    {
      role: "user",
      parts: [{ text: user }]
    }
  ],
      generationConfig: { temperature: 0.9, responseMimeType: 'application/json' },
    });
    // Try each model until one works.
    const errors = [];
    for (const model of GEMINI_TEXT_MODELS) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cfg.geminiKey}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }
        );
        if (res.ok) {
          const data = await res.json();
          const txt = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (txt) return parseJsonLoose(txt);
        }
        errors.push(`${model}: ${res.status}`);
        if (res.status === 401 || res.status === 403) break; // bad key — no point trying more
      } catch (e) {
        errors.push(`${model}: network`);
      }
    }
    throw new Error('Gemini text failed (' + errors.join('; ') + ')');
  }

  async function geminiImage(prompt) {
    if (!cfg.geminiKey) return null;
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE'] },
    });
    for (const model of GEMINI_IMAGE_MODELS) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cfg.geminiKey}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }
        );
        if (!res.ok) continue;
        const data = await res.json();
        const parts = data.candidates?.[0]?.content?.parts || [];
        const imgPart = parts.find(p => p.inlineData || p.inline_data);
        const b64 = imgPart?.inlineData?.data || imgPart?.inline_data?.data;
        const mime = imgPart?.inlineData?.mimeType || imgPart?.inline_data?.mimeType || 'image/png';
        if (b64) return `data:${mime};base64,${b64}`;
      } catch (e) { /* try next */ }
    }
    return null;
  }

  /* Probe the Gemini key + list which models actually work for it.
   * Used by the Settings "Test connection" button. */
  async function geminiTest() {
    if (!cfg.geminiKey) return { ok: false, message: 'No key entered.' };
    const out = [];
    let anyOk = false;
    for (const model of GEMINI_TEXT_MODELS) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cfg.geminiKey}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'Say OK' }] }] }) }
        );
        out.push(`${model}: ${res.status}`);
        if (res.ok) anyOk = true;
        if (res.status === 401 || res.status === 403) {
          return { ok: false, message: `Key rejected by Google (${res.status}). It is invalid or revoked. Get a fresh AIzaSy… key from aistudio.google.com.` };
        }
      } catch (e) { out.push(`${model}: network`); }
    }
    return anyOk
      ? { ok: true, message: '✅ Key works! Working models: ' + out.filter(s=>s.includes('200')).join(', ') }
      : { ok: false, message: 'All models failed: ' + out.join('; ') };
  }

  /* ---------- Mock generator: random story from library ---------- */
  function mockStory(categoryId) {
    const pool = MOCK_STORIES.filter(s => s.categoryId === categoryId);
    const story = pool[Math.floor(Math.random() * pool.length)];
    return { ...story };
  }

  /* ---------- Main entry: generate a full story with image ---------- */
  async function generate({ categoryId, lang, userIdea }) {
    const category = CATEGORIES.find(c => c.id === categoryId);
    if (!category) throw new Error('Unknown category');

    // 1) Text
    let story;
    if (cfg.mode === 'free') {
      // Pollinations — no key required
      const { sys, user } = buildPrompt(category, lang, userIdea);
      const raw = normalizeAI(await pollinationsText(sys, user));
      story = aiToStory(raw, category, lang);
    } else if (cfg.mode === 'real') {
      const { sys, user } = buildPrompt(category, lang, userIdea);
	console.log("system prompt:", sys);
	console.log("user prompt:", user);
      let raw;
      if (cfg.provider === 'openai') {
        if (!cfg.openaiKey) throw new Error('Add your OpenAI key in Settings.');
        raw = await openaiText(sys, user);
      } else {
        if (!cfg.geminiKey) throw new Error('Add your Gemini key in Settings.');
        raw = await geminiText(sys, user);
      }
      raw = normalizeAI(raw);
      // AI returns ONE language; place it in the right bilingual slot.
      story = aiToStory(raw, category, lang);
    } else {
      // Mock stories are already bilingual (titleEn/Hi, textEn/Hi, moralEn/Hi).
      story = { ...mockStory(categoryId) };
    }

    // 2) Image
    let imageUrl;
    try {
      if (cfg.mode === 'free') {
        // Pollinations: the URL *is* the image — no fetch round-trip needed.
        const prompt = buildImagePrompt(category, story.titleEn || story.titleHi, lang);
        const seed = Math.floor(Math.random() * 1e6);
        imageUrl = pollinationsImageUrl(prompt, seed);
      } else if (cfg.mode === 'real') {
        const prompt = buildImagePrompt(category, story.titleEn || story.titleHi, lang);
        if (cfg.provider === 'openai') imageUrl = await openaiImage(prompt);
        else imageUrl = await geminiImage(prompt);
      }
    } catch (e) {
      console.warn('Image generation failed, using art fallback:', e.message);
    }
    if (!imageUrl) imageUrl = svgArt(category.id);
    story.imageUrl = imageUrl;

    // 3) Bookkeeping
    story.id = 'st-' + Date.now();
    story.categoryId = categoryId;
    story.createdAt = Date.now();
    story.engine = cfg.mode;

    return story;
  }

  /* Place a single-language AI result into the correct bilingual slot. */
  function aiToStory(raw, category, lang) {
    const title = raw.title || category.nameEn;
    const paras = Array.isArray(raw.paragraphs) ? raw.paragraphs : [raw.paragraphs];
    const moral = raw.moral || '';
    if (lang === 'hi') {
      return { titleHi: title, titleEn: '', textHi: paras, textEn: [], moralHi: moral, moralEn: '' };
    }
    return { titleEn: title, titleHi: '', textEn: paras, textHi: [], moralEn: moral, moralHi: '' };
  }

  function normalizeAI(raw) {
    if (typeof raw === 'string') raw = { title: 'Story', paragraphs: [raw], moral: '' };
    if (raw.paragraphs && typeof raw.paragraphs === 'string') {
      raw.paragraphs = raw.paragraphs.split(/\n+/).filter(Boolean);
    }
    return raw;
  }

  /* Public API: test whichever provider is currently selected. */
  async function testConnection() {
    if (cfg.mode === 'free') return pollinationsTest();
    if (cfg.mode === 'real' && cfg.provider === 'gemini') return geminiTest();
    if (cfg.mode === 'real' && cfg.provider === 'openai') {
      if (!cfg.openaiKey) return { ok: false, message: 'No key entered.' };
      try {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${cfg.openaiKey}` }
        });
        return res.ok
          ? { ok: true, message: '✅ OpenAI key works!' }
          : { ok: false, message: '❌ OpenAI rejected the key (' + res.status + ').' };
      } catch (e) { return { ok: false, message: '❌ Network error.' }; }
    }
    return { ok: true, message: '✅ Library mode needs no connection.' };
  }

  return { generate, getConfig, setConfig, testConnection };
})();
