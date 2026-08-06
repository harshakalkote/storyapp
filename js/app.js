/* =====================================================================
 *  Katha Kids — App Controller
 *  Handles: home (today's story + categories), story view, generator,
 *  library, settings, read-aloud, share.
 * ===================================================================== */

const App = (() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const t = (key) => (I18N[key] && I18N[key][State.lang]) || key;

  function category(id) { return CATEGORIES.find(c => c.id === id); }

  /* ---------- Date helpers (for "one story per day") ---------- */
  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  function pickDailyCategoryIndex() {
    // deterministic rotation across days
    const epoch = Math.floor(Date.now() / 86400000);
    return epoch % CATEGORIES.length;
  }

  /* ---------- Daily story ---------- */
  async function getTodayStory(force = false) {
    const key = todayKey();
    if (!force && State.dailyCache[key]) return State.dailyCache[key];

    // In mock mode, deterministic pick from the library
    const idx = pickDailyCategoryIndex();
    const cat = CATEGORIES[idx];
    const cfg = AI.getConfig();
    try {
      const story = await AI.generate({ categoryId: cat.id, lang: State.lang });
      State.setDaily(key, story);
      return story;
    } catch (e) {
      console.warn('Daily story failed', e);
      return null;
    }
  }

  /* ---------- Render: HOME ---------- */
  async function renderHome() {
    const main = $('#view');
    main.innerHTML = `
      <section class="hero fade-up">
        <!-- decorative SVGs -->
        <svg class="hero-deco cloud" viewBox="0 0 100 50"><path d="M20 40 Q5 40 5 28 Q5 18 18 18 Q20 6 35 8 Q45 0 55 10 Q72 6 75 20 Q92 20 92 32 Q92 42 78 42 Z" fill="rgba(255,255,255,.9)"/></svg>
        <svg class="hero-deco star1" viewBox="0 0 24 24"><path d="M12 2l2.6 6.6L21 9.3l-5 4.3 1.7 6.9L12 16.9 6.3 20.5 8 13.6 3 9.3l6.4-.7z" fill="#fff"/></svg>
        <svg class="hero-deco star2" viewBox="0 0 24 24"><path d="M12 2l2.6 6.6L21 9.3l-5 4.3 1.7 6.9L12 16.9 6.3 20.5 8 13.6 3 9.3l6.4-.7z" fill="#fff"/></svg>
        <svg class="hero-deco balloon" viewBox="0 0 60 90"><ellipse cx="30" cy="32" rx="24" ry="30" fill="rgba(255,255,255,.9)"/><path d="M30 62 L27 70 L33 70 Z" fill="rgba(255,255,255,.9)"/><path d="M30 70 Q40 80 30 90" stroke="rgba(255,255,255,.6)" stroke-width="2" fill="none"/></svg>

        <div class="brand">
          <span class="logo">🌈</span>
          <div class="brand-text">
            <h1>${t('appName')}</h1>
            <p>${t('tagline')}</p>
          </div>
        </div>
        <div class="hero-badge">🧸 ${State.lang === 'hi' ? '4–7 साल के बच्चों के लिए' : 'For little ones aged 4–7'}</div>
      </section>

      <section class="card fade-up" style="animation-delay:.08s">
        <div class="card-head">
          <h2>⭐ ${t('todayStory')}</h2>
        </div>
        <div id="today-slot" class="loading">
          <div class="loading-emoji">📖</div>
          <div class="loading-dots"><span></span><span></span><span></span></div>
          <p>${t('generating')}</p>
        </div>
      </section>

      <section class="card fade-up" style="animation-delay:.16s">
        <div class="card-head"><h2>${t('pickCategory')}</h2></div>
        <div class="cat-grid" id="cat-grid"></div>
      </section>
    `;

    // Category tiles (staggered entrance)
    const grid = $('#cat-grid');
    grid.innerHTML = CATEGORIES.map((c, i) => `
      <button class="cat-tile stagger" style="--c:${c.color}; --i:${i}" data-cat="${c.id}">
        <span class="cat-emoji">${c.icon}</span>
        <span class="cat-name">${State.lang === 'hi' ? c.nameHi : c.nameEn}</span>
        <span class="cat-desc">${State.lang === 'hi' ? c.descHi : c.descEn}</span>
      </button>
    `).join('');
    grid.querySelectorAll('.cat-tile').forEach(b =>
      b.addEventListener('click', () => openGenerator(b.dataset.cat))
    );

    // Today's story (async)
    const slot = $('#today-slot');
    const story = await getTodayStory();
    if (!story) {
      slot.className = 'error-box';
      slot.textContent = t('errorGen');
      return;
    }
    slot.className = 'story-card pop-in';
    slot.innerHTML = storyCardHTML(story, { open: true });
    bindStoryCard(slot, story);
  }

  /* ---------- Story card markup ---------- */
  function storyCardHTML(story, { open = false } = {}) {
    const cat = category(story.categoryId) || {};
    const title = pickLang(story, 'title');
    const text = pickLang(story, 'text');
    const moral = pickLang(story, 'moral');
    const readMins = Math.max(1, Math.round(text.join(' ').split(/\s+/).length / 110));
    const hasLang = text.length > 0;
    const tag = State.lang === 'hi' ? `⏱ ${readMins} मिनट` : `⏱ ${readMins} min`;
    // If the AI image URL fails to load (rate limit, offline, etc.), swap to built-in SVG art.
    const fallback = svgArt(story.categoryId);
    const onError = `this.onerror=null; this.src='${fallback}';`;
    // Idempotent save button: show "Saved" if the story is already in
    // the local library. The id is set by ensureStoryId() in db.js.
    ensureStoryId(story);
    const alreadySaved = State.hasStory(story.id);
    const saveLabel = alreadySaved
      ? (State.lang === 'hi' ? '✓ सहेजा गया' : '✓ Saved')
      : (State.lang === 'hi' ? 'सहेजें' : 'Save');
    const saveEmoji = alreadySaved ? '' : '💾 ';
    const saveDisabled = alreadySaved ? 'disabled' : '';
    return `
      <div class="story-img-wrap">
        <img class="story-img" src="${story.imageUrl}" alt="${escapeHtml(title)}" loading="lazy" onerror="${escapeHtml(onError)}"/>
        <span class="story-img-tag">${cat.icon || '📖'} ${escapeHtml(tag)}</span>
      </div>
      <div class="story-body">
        <span class="chip" style="--c:${cat.color || '#ccc'}">${cat.icon || ''} ${State.lang === 'hi' ? (cat.nameHi || '') : (cat.nameEn || '')}</span>
        ${(story.authorName || story.authorPhoto || story.uid) ? authorHTML(story) : ''}
        <h3 class="story-title">${escapeHtml(title)}</h3>
        <div class="story-text">${
          hasLang
            ? text.map(p => `<p>${escapeHtml(p)}</p>`).join('')
            : `<p class="muted">${State.lang === 'hi' ? 'इस भाषा में अभी तैयार नहीं है। ऊपर भाषा बदलें।' : 'Not available in this language yet. Switch language using the EN / हिंदी pill at the top.'}</p>`
        }</div>
        ${moral ? `<div class="moral"><strong>🌟 ${t('moral')}:</strong> ${escapeHtml(moral)}</div>` : ''}
        ${open ? `<div class="story-actions">
          <button class="btn ghost" data-act="tts">${t('readAloud')}</button>
          <button class="btn ghost" data-act="share">${t('share')}</button>
          <button class="btn ghost" data-act="save" data-story-id="${escapeHtml(story.id)}" ${saveDisabled}>${saveEmoji}${saveLabel}</button>
        </div>` : ''}
      </div>
    `;
  }

  function bindStoryCard(root, story) {
    root.querySelectorAll('[data-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        const act = btn.dataset.act;
        if (act === 'tts') toggleRead(root, btn, story);
        if (act === 'share') shareStory(story);
        if (act === 'save') saveStory({ ...story }, btn);
      });
    });
  }

  function toggleRead(root, btn, story) {
    if (TTS.speaking()) { TTS.stop(); btn.textContent = t('readAloud'); return; }
    const title = pickLang(story, 'title');
    const text = pickLang(story, 'text');
    const lang = text.length ? State.lang : (State.lang === 'hi' ? 'en' : 'hi');
    const actualText = pickLang(story, 'text', lang);
    TTS.speak([title, ...actualText].join('. '), lang, {
      onend: () => { btn.textContent = t('readAloud'); },
    });
    btn.textContent = t('stop');
  }

  function shareStory(story) {
    const title = pickLang(story, 'title');
    const text = pickLang(story, 'text').join('\n\n');
    const moral = pickLang(story, 'moral');
    if (navigator.share) {
      navigator.share({ title: title + ' — ' + t('appName'), text: text + '\n\n🌟 ' + moral }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
      toast(t('saved'));
    }
  }

  /* Save a story — always to the device, and to Firestore (cloud) when
     Firebase is configured. Works for signed-in AND anonymous users.
     IDEMPOTENT: re-saving the same story is a no-op; the button gets
     disabled and shows "✓ Saved" so the user gets clear feedback and
     cannot accidentally create duplicates. */
  function saveStory(story, btn) {
    if (btn) btn.disabled = true;
    if (story && !story.createdAt) story.createdAt = Date.now();
    FirebaseStore.addStory({ ...story }).then(r => {
      if (r && r.deduped) {
        toast(State.lang === 'hi' ? '✓ पहले से सहेजी हुई' : '✓ Already saved');
      } else if (r && r.cloud) {
        toast(State.lang === 'hi' ? '☁️ कहानी क्लाउड में सहेजी गई' : '☁️ Saved to cloud');
      } else {
        toast(t('saved'));
      }
      if (btn) {
        // Permanently mark as saved; further clicks become a no-op.
        btn.textContent = (State.lang === 'hi' ? '✓ सहेजा गया' : '✓ Saved');
        btn.disabled = true;
      }
    }).catch((e) => {
      console.error('Save failed', e);
      toast(t('saved'));
      if (btn) btn.disabled = false;   // let the user retry
    });
  }

  /* ---------- Render: GENERATOR ---------- */
  let genCat = null;
  let currentView = 'home';
  function openGenerator(catId) {
    genCat = catId;
    const cat = category(catId);
    const main = $('#view');
    main.innerHTML = `
      <button class="btn ghost back-btn" data-act="home">← ${t('home')}</button>
      <section class="card gen-card fade-up" style="--c:${cat.color}">
        <div class="gen-head">
          <span class="big-emoji">${cat.icon}</span>
          <div>
            <h2>${t('newStory')} — ${State.lang === 'hi' ? cat.nameHi : cat.nameEn}</h2>
            <p class="muted">${State.lang === 'hi' ? cat.descHi : cat.descEn}</p>
          </div>
        </div>
        <div class="gen-form">
          <input id="idea" class="input" maxlength="120"
                 placeholder="${t('promptHint')} (e.g. ${sampleIdea(catId)})"/>
          <button id="gen-btn" class="btn primary big">${t('generate')}</button>
        </div>
        <div id="gen-slot"></div>
      </section>
    `;
    $('#gen-btn').addEventListener('click', doGenerate);
    $('.back-btn').addEventListener('click', () => navigate('home'));
  }

  function sampleIdea(catId) {
    const map = {
      social: 'a shy rabbit at a birthday party',
      bravery: 'a tiny ant crossing a river',
      smartness: 'a crow that needs water',
      habits: 'washing hands before dinner',
      study: 'counting stars at night',
      scientists: 'A.P.J. Abdul Kalam',
      rishi: 'Rishi Vyasa',
    };
    return map[catId] || '';
  }

  async function doGenerate() {
    const btn = $('#gen-btn');
    const slot = $('#gen-slot');
    const idea = $('#idea').value.trim();
    btn.disabled = true;
    btn.textContent = t('generating');
    slot.className = 'loading';
    slot.innerHTML = `
      <div class="loading-emoji">✨</div>
      <div class="loading-dots"><span></span><span></span><span></span></div>
      <p>${t('generating')}</p>
    `;
    try {
      const story = await AI.generate({ categoryId: genCat, lang: State.lang, userIdea: idea });
      saveStory({ ...story });
      slot.className = 'story-card pop-in';
      slot.innerHTML = storyCardHTML(story, { open: true });
      bindStoryCard(slot, story);
    } catch (e) {
      console.error(e);
      slot.className = 'error-box';
      slot.innerHTML = formatGenError(e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = t('generate');
    }
  }

  /* ---------- Render: LIBRARY (community feed) ---------- */
  async function renderLibrary() {
    const main = $('#view');
    main.innerHTML = `
      <button class="btn ghost back-btn" data-act="home">← ${t('home')}</button>
      <section class="card fade-up">
        <div class="card-head"><h2>📚 ${t('library')} <span class="count" id="lib-count"></span></h2></div>
        <p class="muted">${State.lang==='hi' ? 'समुदाय की कहानियाँ — सभी उपयोगकर्ताओं से ☁️' : 'Community stories — from everyone ☁️'}</p>
        <div id="lib-list" class="loading">
          <div class="loading-emoji">📚</div>
          <div class="loading-dots"><span></span><span></span><span></span></div>
          <p>${t('generating')}</p>
        </div>
      </section>
    `;
    $('.back-btn').addEventListener('click', () => navigate('home'));

    // Load the community feed from Firestore; fall back to on-device stories
    // when Firebase is not configured or is offline.
    let list = State.savedStories;
    const cloud = await FirebaseStore.getStories();
    if (cloud !== null) list = cloud;

    const listEl = $('#lib-list');
    $('#lib-count').textContent = `(${list.length})`;
    if (list.length === 0) {
      listEl.className = 'loading';
      listEl.innerHTML = `<div class="loading-emoji">📚</div><p>${t('empty')}</p>`;
      return;
    }
    listEl.className = 'story-list';
    const isAdmin = FirebaseStore.isAdmin();
    listEl.innerHTML = list.map((s, i) => {
      const cat = category(s.categoryId) || {};
      const id = s.id || s.cloudId || i;
      const cloudId = s.cloudId || '';
      const deleteBtn = (isAdmin && cloudId)
        ? `<button class="admin-delete-btn" data-cloud-id="${escapeHtml(cloudId)}" title="${State.lang==='hi'?'व्यवस्थापक: हटाएँ':'Admin: delete'}" aria-label="Delete">🗑</button>`
        : '';
      return `<div class="story-card-mini stagger" style="--i:${i}" data-id="${id}">
        <img src="${s.imageUrl}" alt=""/>
        <div>
          <span class="chip" style="--c:${cat.color||'#ccc'}">${cat.icon||''} ${State.lang==='hi'?(cat.nameHi||''):(cat.nameEn||'')}</span>
          <h3 class="story-title sm">${escapeHtml(pickLang(s, 'title'))}</h3>
          ${authorHTML(s)}
        </div>
        ${deleteBtn}
      </div>`;
    }).join('');

    listEl.querySelectorAll('.story-card-mini').forEach(el =>
      el.addEventListener('click', () => {
        const s = list.find(x => (x.id || x.cloudId) === el.dataset.id);
        if (s) openStoryView(s);
      })
    );

    // Admin delete buttons: confirm, then call FirebaseStore.deleteStory.
    // The card's own click listener is fine — we stop propagation so it
    // doesn't also open the story.
    listEl.querySelectorAll('.admin-delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const cloudId = btn.dataset.cloudId;
        const card = btn.closest('.story-card-mini');
        const titleEl = card && card.querySelector('.story-title');
        const title = titleEl ? titleEl.textContent : 'this story';
        const ok = confirm((State.lang==='hi'
          ? 'क्या आप वाक़ई यह कहानी हटाना चाहते हैं?\n\n'
          : 'Permanently delete this story?\n\n')
          + '“' + title + '”');
        if (!ok) return;
        btn.disabled = true;
        try {
          await FirebaseStore.deleteStory(cloudId);
          toast(State.lang==='hi' ? '🗑 कहानी हटा दी गई' : '🗑 Story deleted');
          renderLibrary(); // re-render the feed
        } catch (err) {
          console.error(err);
          toast((State.lang==='hi' ? 'हटाने में विफल: ' : 'Delete failed: ') + (err.message || err));
          btn.disabled = false;
        }
      });
    });
  }

  function openStoryView(story) {
    const main = $('#view');
    main.innerHTML = `
      <button class="btn ghost back-btn" data-act="lib">← ${t('library')}</button>
      <section class="card"><div class="story-card pop-in" id="sv">${
        storyCardHTML(story, { open: true })
      }</div></section>
    `;
    bindStoryCard($('#sv'), story);
    $('.back-btn').addEventListener('click', () => navigate('library'));
  }

  /* ---------- Render: SETTINGS ---------- */
  function renderSettings() {
    const cfg = AI.getConfig();
    const main = $('#view');
    main.innerHTML = `
      <button class="btn ghost back-btn" data-act="home">← ${t('home')}</button>
      <section class="card fade-up">
        <div class="card-head"><h2>⚙️ ${t('settings')}</h2></div>

        <div class="set-row">
          <div>
            <strong>${State.lang==='hi' ? 'खाता' : 'Account'}</strong>
            <p class="muted" id="acct-status"></p>
          </div>
          <button id="auth-btn" class="btn primary">${State.lang==='hi' ? 'साइन इन करें' : 'Sign in'}</button>
        </div>
        <hr/>

        <div class="set-row">
          <div>
            <strong>${t('language')}</strong>
            <p class="muted">English / हिंदी</p>
          </div>
          <div class="seg" id="lang-seg">
            <button data-lang="en" class="${State.lang==='en'?'on':''}">English</button>
            <button data-lang="hi" class="${State.lang==='hi'?'on':''}">हिंदी</button>
          </div>
        </div>

        <hr/>

        <div class="set-row">
          <div>
            <strong>${t('aiMode')}</strong>
            <p class="muted">${t('mockMode')} · ${t('freeMode')} · ${t('realMode')}</p>
          </div>
        </div>

        <div class="engine-grid" id="mode-seg">
          <button class="engine-card ${cfg.mode==='mock'?'on':''}" data-mode="mock">
            <span class="engine-emoji">📚</span>
            <span class="engine-title">${t('mockMode')}</span>
            <span class="engine-sub">${State.lang==='hi'?'कुंजी नहीं · ऑफलाइन':'No key · offline'}</span>
          </button>
          <button class="engine-card ${cfg.mode==='free'?'on':''}" data-mode="free">
            <span class="engine-emoji">🌸</span>
            <span class="engine-title">${t('freeMode')}</span>
            <span class="engine-sub">${t('freeHint')}</span>
            <span class="engine-tag">${State.lang==='hi'?'अनुशंसित':'Recommended'}</span>
          </button>
          <button class="engine-card ${cfg.mode==='real'?'on':''}" data-mode="real">
            <span class="engine-emoji">🔑</span>
            <span class="engine-title">${t('realMode')}</span>
            <span class="engine-sub">${State.lang==='hi'?'अपनी कुंजी':'Your own key'}</span>
          </button>
        </div>

        <div id="real-only" style="display:${cfg.mode==='real'?'block':'none'}">
          <div class="set-row">
            <div>
              <strong>Provider</strong>
              <p class="muted">OpenAI or Google Gemini</p>
            </div>
            <div class="seg" id="prov-seg">
              <button data-prov="openai" class="${cfg.provider==='openai'?'on':''}">OpenAI</button>
              <button data-prov="gemini" class="${cfg.provider==='gemini'?'on':''}">Gemini</button>
            </div>
          </div>

          <div class="set-row col">
            <label><strong>OpenAI ${t('apiKey')}</strong></label>
            <input id="openai-key" class="input" type="password" placeholder="sk-..." value="${escapeHtml(cfg.openaiKey)}"/>
          </div>
          <div class="set-row col">
            <label><strong>Google Gemini ${t('apiKey')} <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" style="font-size:.8rem;font-weight:700">→ get a free key</a></strong></label>
            <input id="gemini-key" class="input" type="password" placeholder="AIzaSy... (39 chars)" value="${escapeHtml(cfg.geminiKey)}"/>
          </div>
          <p class="muted">Keys are stored only in this device's browser. They never leave it except to call the provider directly.</p>
          <div class="set-actions">
            <button id="save-keys" class="btn primary">${t('save')}</button>
            <button id="test-keys" class="btn ghost">🔌 Test connection</button>
          </div>
          <div id="test-result" class="test-result" style="display:none"></div>
        </div>

        <hr/>
        <p class="muted">Version 1.0 · ${t('appName')}</p>
      </section>
    `;
    $('.back-btn').addEventListener('click', () => navigate('home'));

    // Account section
    const acctStatus = $('#acct-status');
    const authBtn = $('#auth-btn');
    if (!FirebaseStore.isConfigured()) {
      acctStatus.textContent = State.lang==='hi'
        ? 'Firebase सेट नहीं — js/firebase-config.js में कुंजियाँ भरें'
        : 'Firebase not configured — add keys in js/firebase-config.js';
      authBtn.disabled = true; authBtn.textContent = '—';
    } else {
      const u = FirebaseStore.getUser();
      if (u && !u.isAnonymous) {
        acctStatus.innerHTML = (State.lang==='hi' ? 'इस रूप में साइन इन:' : 'Signed in as') + ' <b>' + escapeHtml(u.name || u.email) + '</b>';
        authBtn.textContent = State.lang==='hi' ? 'साइन आउट' : 'Sign out';
      } else if (u && u.isAnonymous) {
        acctStatus.textContent = State.lang==='hi' ? 'मेहमान के रूप में सहेजना (क्लाउड पर) ☁️' : 'Saving as guest (cloud) ☁️';
        authBtn.textContent = State.lang==='hi' ? 'Google से साइन इन' : 'Sign in with Google';
      } else {
        acctStatus.textContent = State.lang==='hi' ? 'कनेक्ट हो रहा है…' : 'Connecting…';
        authBtn.textContent = State.lang==='hi' ? 'साइन इन करें' : 'Sign in';
      }
      authBtn.addEventListener('click', async () => {
        const cu = FirebaseStore.getUser();
        if (cu && !cu.isAnonymous) {
          await FirebaseStore.signOut(); toast(State.lang==='hi' ? 'साइन आउट' : 'Signed out');
        } else {
          try {
            await FirebaseStore.signInWithGoogle();
            toast(State.lang==='hi' ? 'स्वागत है! ☁️' : 'Welcome! ☁️');
          } catch (e) { toast(e.message || 'Sign-in failed'); }
          renderSettings(); // reflect the new account
        }
      });
    }

    $('#lang-seg').querySelectorAll('button').forEach(b =>
      b.addEventListener('click', () => {
        State.lang = b.dataset.lang; DB.set('lang', State.lang);
        document.documentElement.lang = State.lang;
        renderSettings(); updateChrome();
      })
    );
    $('#mode-seg').querySelectorAll('button').forEach(b =>
      b.addEventListener('click', () => {
        AI.setConfig({ mode: b.dataset.mode });
        renderSettings();
      })
    );
    $('#prov-seg').querySelectorAll('button').forEach(b =>
      b.addEventListener('click', () => {
        AI.setConfig({ provider: b.dataset.prov });
        renderSettings();
      })
    );
    $('#save-keys').addEventListener('click', () => {
      AI.setConfig({
        openaiKey: $('#openai-key').value.trim(),
        geminiKey: $('#gemini-key').value.trim(),
      });
      toast(t('saved'));
    });
    $('#test-keys').addEventListener('click', async () => {
      AI.setConfig({
        openaiKey: $('#openai-key').value.trim(),
        geminiKey: $('#gemini-key').value.trim(),
      });
      const box = $('#test-result');
      box.style.display = 'block';
      box.className = 'test-result testing';
      box.textContent = '🔌 Testing…';
      try {
        const result = await AI.testConnection();
        box.className = 'test-result ' + (result.ok ? 'ok' : 'bad');
        box.textContent = result.message;
      } catch (e) {
        box.className = 'test-result bad';
        box.textContent = '❌ ' + e.message;
      }
    });
  }

  /* ---------- Navigation ---------- */
  function navigate(view) {
    currentView = view;
    TTS.stop();
    document.querySelectorAll('.nav-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.view === view)
    );
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (view === 'home') renderHome();
    else if (view === 'library') renderLibrary();
    else if (view === 'settings') renderSettings();
  }

  /* ---------- Chrome (header / nav / language pill / user button) ---------- */
  function updateChrome() {
    $('#lang-pill').textContent = State.lang === 'hi' ? 'हिंदी' : 'EN';
    const ub = $('#user-btn');
    if (!ub) return;
    const u = FirebaseStore.getUser();
    if (u && !u.isAnonymous && u.photoURL) {
      ub.innerHTML = `<img class="avatar" src="${escapeHtml(u.photoURL)}" alt="" referrerpolicy="no-referrer"/>`;
      ub.title = u.name || u.email || 'Signed in';
      ub.classList.add('signed');
    } else {
      ub.innerHTML = '👤';
      ub.title = u && u.isAnonymous ? (State.lang==='hi' ? 'मेहमान के रूप में साइन इन' : 'Signed in as guest') : 'Sign in';
      ub.classList.remove('signed');
    }
  }

  /* ---------- Tiny utilities ---------- */
  function pickLang(obj, field, forceLang) {
    const lang = forceLang || State.lang;
    const en = obj[field + 'En'];
    const hi = obj[field + 'Hi'];
    if (lang === 'hi') return (hi && (Array.isArray(hi) ? hi.length : hi)) ? hi : (en || hi || '');
    return (en && (Array.isArray(en) ? en.length : en)) ? en : (hi || en || '');
  }
  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }
  /* Human-friendly error explainer for generation failures. */
  function formatGenError(msg) {
    msg = String(msg || '');
    let hint = '';
    if (/403|blocked/i.test(msg)) {
      hint = `This site is blocked by the free AI service. Fix: open <b>Settings → AI (live) → Gemini</b> and paste a free key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">aistudio.google.com</a>, or pick <b>Library</b> mode (works offline).`;
    } else if (/404|not found|no longer available/i.test(msg)) {
      hint = `The AI model name changed (Google updates these often). Try <b>Settings → Test connection</b>, or switch to <b>Library</b> mode for now.`;
    } else if (/401|invalid.*credential|key rejected|API key/i.test(msg)) {
      hint = `Your API key is invalid or expired. Get a fresh free Gemini key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">aistudio.google.com</a> and paste it in <b>Settings</b>.`;
    } else if (/network|fetch|Failed to fetch/i.test(msg)) {
      hint = `Network problem — check your internet connection, then try again.`;
    } else {
      hint = `Tip: try <b>Library</b> mode (always works), or run <b>Settings → Test connection</b> to diagnose.`;
    }
    return `<div>😕 ${t('errorGen')}</div>
            <div style="margin-top:8px; font-weight:600; line-height:1.5">${hint}</div>
            <div style="margin-top:8px; font-size:.8rem; opacity:.7">Details: ${escapeHtml(msg)}</div>`;
  }

  function timeAgo(ts) {
    if (!ts) return '';
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    return Math.floor(hrs / 24) + 'd ago';
  }
  /* Author row shown on community stories (avatar, name, guest badge). */
  function authorHTML(s) {
    const photo = s.authorPhoto;
    const name = s.authorName || 'Guest';
    const anon = !!(s.anonymous || !s.authorName);
    const badge = anon ? `<span class="guest-badge">${State.lang==='hi' ? 'मेहमान' : 'Guest'}</span>` : '';
    const avatar = photo
      ? `<img class="author-avatar" src="${escapeHtml(photo)}" alt="" referrerpolicy="no-referrer"/>`
      : `<span class="author-avatar">👤</span>`;
    return `<div class="author-row">
      ${avatar}
      <span class="author-name">${escapeHtml(name)}</span>${badge}
      ${s.createdAt ? `<span class="muted"> · ${timeAgo(s.createdAt)}</span>` : ''}
    </div>`;
  }

  let toastTimer;
  function toast(msg) {
    let el = $('#toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; document.body.appendChild(el); }
    el.textContent = msg; el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
  }

  /* ---------- Init ---------- */
  function init() {
    // Register service worker for offline/PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch((e) =>
          console.warn('SW registration failed', e)
        );
      });
    }
    document.documentElement.lang = State.lang;
    $('#lang-pill').addEventListener('click', () => {
      State.lang = State.lang === 'en' ? 'hi' : 'en';
      DB.set('lang', State.lang);
      document.documentElement.lang = State.lang;
      updateChrome();
      navigate('home');
    });

    // Firebase: init once, then keep the UI in sync when auth changes
    // (signed-in vs anonymous). Works for both.
    FirebaseStore.init();
    FirebaseStore.subscribe(() => {
      updateChrome();
      if (currentView === 'settings') renderSettings();
      if (currentView === 'library') renderLibrary(); // show/hide admin 🗑 buttons
    });
    $('#user-btn').addEventListener('click', () => {
      const u = FirebaseStore.getUser();
      if (u && !u.isAnonymous) {
        FirebaseStore.signOut();
      } else if (FirebaseStore.isConfigured()) {
        FirebaseStore.signInWithGoogle()
          .then(() => toast(State.lang === 'hi' ? 'स्वागत है! ☁️' : 'Welcome! ☁️'))
          .catch(e => toast(e.message || 'Sign-in failed'));
      } else {
        toast(State.lang === 'hi' ? 'पहले Firebase सेट करें' : 'Set up Firebase first');
      }
    });

    document.querySelectorAll('.nav-btn').forEach(b =>
      b.addEventListener('click', () => navigate(b.dataset.view))
    );
    updateChrome();
    navigate('home');

    // PWA install prompt capture
    let deferred;
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault(); deferred = e;
      const btn = $('#install-btn');
      if (btn) { btn.style.display = 'inline-flex'; btn.onclick = async () => {
        deferred.prompt(); await deferred.userChoice; deferred = null; btn.style.display = 'none';
      }; }
    });
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
