# 📖 Katha Kids — Daily Stories for Little Ones

A **bilingual (English + हिंदी)** story app for kids **ages 4–7**. Every day it serves one new story, across 7 thoughtful themes, each with a picture and **read-aloud** narration. Installable as a **PWA** (works offline on a phone like a native app).

> **Categories:** Social Communication · Bravery · Smartness · Good Habits · Study & Learning · Great Scientists · Rishi & Sant of India

---

## ✨ Features

| Feature | Detail |
|---|---|
| 🗓 **One story per day** | Deterministically picked & cached locally — same story all day, a new one tomorrow. |
| 🎨 **Auto image per story** | AI-generated in live mode; charming built-in SVG art in offline/library mode. |
| 🔊 **Read-aloud** | Browser text-to-speech picks an Indian-English / Hindi voice automatically. |
| 🌐 **Bilingual** | Tap the **EN / हिंदी** pill in the top bar any time. |
| 🧩 **7 categories** | Tap any tile to **create a new story** on demand in that theme. |
| 📚 **My Stories** | Every story you create is saved on-device for re-reading. |
| 📲 **Installable PWA** | Add to home screen; works offline once loaded. |
| 🔌 **Two engines** | **Library (offline)** mode by default · switch to **AI (live)** in Settings when you add a key. |
| 🔒 **Privacy** | Keys and stories are stored only in *your* browser — nothing is sent to any server except the AI provider you choose. |

---

## 🚀 Run it locally

It's a static site — any static server works. Pick one:

```bash
# Option A — Python (already installed almost everywhere)
python3 -m http.server 8000

# Option B — Node
npx serve .
```

Then open **http://localhost:8000** in your browser.
> ⚠️ Use `http://localhost` (not `file://`) so the service worker, speech, and storage all work.

**Install on your phone:** open the URL in Chrome (Android) or Safari (iOS) → menu → *Add to Home Screen*.

---

## 🤖 Enabling real AI (optional)

The app ships with **three engines** — switch in **Settings → Story Engine**:

| Engine | Cost | What it does |
|---|---|---|
| **📚 Library (offline)** *(default)* | Free, no key | Curated stories + built-in SVG art. Works offline. |
| **🌸 Free AI (Pollinations)** ⭐ | **Free, no key** | Live AI text **and** images via [Pollinations.ai](https://pollinations.ai). Needs internet. Anonymous tier is rate-limited (~1 req/15s). |
| **🔑 AI (live)** | Needs your key | Your own OpenAI or Gemini key for unlimited generation. |

### 🌸 Free AI mode (Pollinations) — recommended for trying it out
- **No account, no key, no credit card.** Just select it and tap *Create Story*.
- Story **text** is generated live by an OpenAI-class model.
- Story **images** are generated live by the Flux model. If Pollinations' image endpoint is rate-limited or down, the app automatically falls back to the built-in SVG illustration — you always get a picture.
- Great for a personal/family app. For many users or production, use your own key (below).

### 🔑 Using your own key (OpenAI or Gemini)
1. Open **Settings** → set **Story Engine** to **AI (live)**.
2. Pick a provider and paste your key:
   - **OpenAI** → text = `gpt-4o-mini`, image = `dall-e-3`. Key looks like `sk-...`
   - **Google Gemini** → text = `gemini-2.5-flash` (free tier ~250/day), image = `imagen`. Key looks like `AIza...`
3. Tap **Save**. Now any *Create Story* uses live AI with your quota.

Get keys:
- OpenAI — https://platform.openai.com/api-keys
- Gemini — https://aistudio.google.com/app/apikey  *(free tier, no card)*

> 🔐 **For a public launch**, don't ship keys in the browser. Put a tiny backend (Cloudflare Worker, Vercel function, etc.) in front that holds the key and proxies the call. The `AI` object in `js/ai.js` is the only file you'd change.

---

## 🗂 Project structure

```
.
├── index.html              # App shell (header, view, bottom nav)
├── manifest.webmanifest    # PWA manifest
├── sw.js                   # Service worker (offline caching)
├── css/
│   └── styles.css          # All styling (kid-friendly, responsive)
├── js/
│   ├── data.js             # Categories, EN/HI strings, SVG art, mock stories
│   ├── db.js               # localStorage + app State
│   ├── tts.js              # Read-aloud (Web Speech API)
│   ├── ai.js               # AI layer (OpenAI / Gemini / mock)
│   └── app.js              # Views, routing, events
├── icons/                  # App icons (svg + 192/512 png)
└── README.md
```

---

## 🛠 Customising

- **Add categories** → edit `CATEGORIES` in `js/data.js`.
- **Add more library stories** → push objects into `MOCK_STORIES` (same file).
- **Change colours / theme** → edit the CSS variables at the top of `css/styles.css`.
- **Tweak age level** → the prompt in `AI.buildPrompt()` has an `ageBand` ("4 to 7") you can change.
- **Change AI models** → edit the `model:` strings in `js/ai.js`.

---

## 💡 Ideas to extend

- Parental reading-time tracker & streaks 🔥
- Audio recording of a *parent's* voice instead of TTS 🎙
- Multiple illustrations per story (carousel)
- Daily streaks & a "story of the week" print-out 🖨
- Translation pipeline so one generated story fills *both* EN and HI slots

Enjoy the stories! 🌟
