/* =====================================================================
 *  Katha Kids — Data Layer
 *  Categories, bilingual (EN/HI) UI strings, SVG illustrations,
 *  and a curated mock story library (used in "mock mode" and as
 *  the offline cache).
 * ===================================================================== */

const CATEGORIES = [
  {
    id: 'social',
    nameEn: 'Social Communication',
    nameHi: 'सामाजिक संवाद',
    icon: '💬',
    color: '#FF8FA3',
    descEn: 'Making friends, talking kindly, sharing feelings.',
    descHi: 'दोस्त बनाना, प्यार से बात करना, अपनी भावनाएँ बाँटना।',
  },
  {
    id: 'bravery',
    nameEn: 'Bravery',
    nameHi: 'साहस',
    icon: '🦁',
    color: '#FFB24C',
    descEn: 'Courage, facing fears, standing up for what is right.',
    descHi: 'हिम्मत, डर का सामना, सही के लिए खड़े होना।',
  },
  {
    id: 'smartness',
    nameEn: 'Smartness',
    nameHi: 'चतुराई',
    icon: '🦉',
    color: '#6FB1FC',
    descEn: 'Quick thinking, clever ideas, solving problems.',
    descHi: 'तेज दिमाग, नई बातें, मुसीबतों का हल निकालना।',
  },
  {
    id: 'habits',
    nameEn: 'Good Habits',
    nameHi: 'अच्छी आदतें',
    icon: '🪥',
    color: '#7DD181',
    descEn: 'Brushing, washing, eating on time, keeping clean.',
    descHi: 'ब्रश करना, हाथ धोना, समय पर खाना, स्वच्छता रखना।',
  },
  {
    id: 'study',
    nameEn: 'Study & Learning',
    nameHi: 'पढ़ाई',
    icon: '📚',
    color: '#B07CF0',
    descEn: 'Curiosity, reading, practice and the joy of learning.',
    descHi: 'जिज्ञासा, पढ़ना, अभ्यास और सीखने का मज़ा।',
  },
  {
    id: 'scientists',
    nameEn: 'Great Scientists',
    nameHi: 'महान वैज्ञानिक',
    icon: '🔬',
    color: '#4FC3D9',
    descEn: 'C.V. Raman, Kalam, Curie, Einstein and more.',
    descHi: 'सी.वी. रमन, कलाम, क्यूरी, आइंस्टीन और अन्य।',
  },
  {
    id: 'rishi',
    nameEn: 'Rishi & Sant of India',
    nameHi: 'भारत के ऋषि और संत',
    icon: '🕉️',
    color: '#E0A458',
    descEn: 'Vedic sages and saints: wisdom, kindness, dharma.',
    descHi: 'वैदिक ऋषि और संत: ज्ञान, दया, धर्म।',
  },
];

/* ---------- UI strings (EN / HI) ---------- */
const I18N = {
  appName:     { en: 'Katha Kids',                    hi: 'कथा किड्स' },
  tagline:     { en: 'A new story every day ✨',       hi: 'हर दिन एक नई कहानी ✨' },
  todayStory:  { en: "Today's Story",                 hi: 'आज की कहानी' },
  pickCategory:{ en: 'Or pick a category',            hi: 'या एक श्रेणी चुनें' },
  newStory:    { en: 'Create a New Story',            hi: 'नई कहानी बनाएँ' },
  generate:    { en: '✨ Create Story',               hi: '✨ कहानी बनाएँ' },
  generating:  { en: 'Creating magic…',               hi: 'जादू बन रहा है…' },
  readAloud:   { en: '🔊 Read Aloud',                 hi: '🔊 सुनिए' },
  stop:        { en: '⏹ Stop',                        hi: '⏹ रोकें' },
  moral:       { en: 'Moral of the story',            hi: 'कहानी की सीख' },
  back:        { en: '← Back',                        hi: '← वापस' },
  settings:    { en: 'Settings',                      hi: 'सेटिंग्स' },
  home:        { en: 'Home',                          hi: 'घर' },
  language:    { en: 'Language',                      hi: 'भाषा' },
  aiMode:      { en: 'Story Engine',                  hi: 'कहानी इंजन' },
  mockMode:    { en: 'Library (offline)',             hi: 'लाइब्रेरी (ऑफलाइन)' },
  freeMode:    { en: 'Free AI (Pollinations)',        hi: 'मुफ़्त ए.आई. (पोलिनेशन्स)' },
  freeHint:    { en: 'No key needed · needs internet',hi: 'कुंजी की ज़रूरत नहीं · इंटरनेट चाहिए' },
  realMode:    { en: 'AI (live)',                     hi: 'ए.आई. (लाइव)' },
  apiKey:      { en: 'API Key',                       hi: 'ए.पी.आई. कुंजी' },
  save:        { en: 'Save',                          hi: 'सहेजें' },
  saved:       { en: 'Saved!',                        hi: 'सहेज लिया!' },
  promptHint:  { en: 'Optional: add a name or idea',  hi: 'वैकल्पिक: कोई नाम या विचार जोड़ें' },
  share:       { en: 'Share',                         hi: 'शेयर' },
  library:     { en: 'My Stories',                    hi: 'मेरी कहानियाँ' },
  empty:       { en: 'No stories yet — create one!',  hi: 'अभी कोई कहानी नहीं — बनाइए!' },
  errorGen:    { en: 'Could not create story. Check your key in Settings, or use Library mode.', hi: 'कहानी नहीं बन पाई। सेटिंग्स में कुंजी जाँचें, या लाइब्रेरी मोड चुनें।' },
  daysAgo:     { en: 'today',                         hi: 'आज' },
};

/* ---------- SVG illustration generator (data URIs, works offline) ----------
 * Lightweight, flat, colorful art so the app has real images even in
 * mock mode with no network. Each returns a data-URI string.
 */
function svgArt(scene) {
  const W = 640, H = 400;
  const sky = '#FFF6E6';
  let body = '';
  switch (scene) {
    case 'social':
      body = `
        <circle cx="240" cy="170" r="48" fill="#FFD56B"/>
        <rect x="196" y="220" width="88" height="90" rx="22" fill="#FF8FA3"/>
        <circle cx="240" cy="170" r="40" fill="#FFCAA0"/>
        <circle cx="400" cy="170" r="48" fill="#7DD181"/>
        <rect x="356" y="220" width="88" height="90" rx="22" fill="#6FB1FC"/>
        <circle cx="400" cy="170" r="40" fill="#FFCAA0"/>
        <g fill="#fff" stroke="#333" stroke-width="3">
          <path d="M300 90 q40 0 40 30 q0 26 -40 30 q-40 -4 -40 -30 q0 -30 40 -30 z"/>
          <path d="M300 110 l10 8 l-10 8 z" fill="#6FB1FC" stroke="none"/>
        </g>`;
      break;
    case 'bravery':
      body = `
        <ellipse cx="320" cy="300" rx="160" ry="40" fill="#E9C46A"/>
        <circle cx="320" cy="180" r="80" fill="#FFB24C"/>
        <circle cx="320" cy="180" r="60" fill="#FFD08A"/>
        <path d="M255 150 q15 -30 30 0 q15 -30 30 0 q15 -30 30 0 l-15 25 q-45 25 -90 0 z" fill="#E9872B"/>
        <circle cx="300" cy="185" r="7" fill="#5A3A1A"/>
        <circle cx="340" cy="185" r="7" fill="#5A3A1A"/>
        <path d="M320 205 q10 8 20 0" stroke="#5A3A1A" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      break;
    case 'smartness':
      body = `
        <ellipse cx="320" cy="320" rx="120" ry="26" fill="#C9A7E8"/>
        <circle cx="320" cy="175" r="95" fill="#8E78D6"/>
        <path d="M240 165 q80 -70 160 0 q-30 50 -80 50 q-50 0 -80 -50 z" fill="#B39BE8"/>
        <circle cx="285" cy="170" r="22" fill="#fff"/>
        <circle cx="355" cy="170" r="22" fill="#fff"/>
        <circle cx="288" cy="173" r="10" fill="#2D2A55"/>
        <circle cx="358" cy="173" r="10" fill="#2D2A55"/>
        <path d="M300 220 q20 18 40 0" stroke="#2D2A55" stroke-width="4" fill="none" stroke-linecap="round"/>
        <polygon points="455,70 465,95 492,95 470,112 478,138 455,123 432,138 440,112 418,95 445,95" fill="#FFE066"/>`;
      break;
    case 'habits':
      body = `
        <rect x="150" y="150" width="80" height="180" rx="14" fill="#7DD181"/>
        <rect x="380" y="150" width="80" height="180" rx="14" fill="#FF8FA3"/>
        <circle cx="190" cy="120" r="34" fill="#FFCAA0"/>
        <circle cx="420" cy="120" r="34" fill="#FFCAA0"/>
        <rect x="120" y="120" width="540" height="0" />
        <g transform="translate(70,210)">
          <rect x="0" y="0" width="70" height="40" rx="8" fill="#6FB1FC"/>
          <rect x="70" y="12" width="40" height="16" rx="6" fill="#6FB1FC"/>
          <rect x="110" y="14" width="14" height="12" fill="#fff" stroke="#6FB1FC" stroke-width="3"/>
        </g>`;
      break;
    case 'study':
      body = `
        <ellipse cx="320" cy="350" rx="180" ry="28" fill="#C9A7E8"/>
        <g transform="translate(160,150) rotate(-6)">
          <rect x="0" y="0" width="320" height="150" rx="10" fill="#4A6FA5"/>
          <rect x="10" y="10" width="150" height="130" fill="#fff"/>
          <rect x="160" y="10" width="150" height="130" fill="#fff"/>
          <g stroke="#B7C4DC" stroke-width="3">
            <line x1="25" y1="35" x2="140" y2="35"/><line x1="25" y1="55" x2="140" y2="55"/>
            <line x1="25" y1="75" x2="140" y2="75"/><line x1="25" y1="95" x2="120" y2="95"/>
          </g>
          <g stroke="#B7C4DC" stroke-width="3">
            <line x1="180" y1="35" x2="295" y2="35"/><line x1="180" y1="55" x2="295" y2="55"/>
            <line x1="180" y1="75" x2="295" y2="75"/>
          </g>
        </g>
        <circle cx="540" cy="150" r="46" fill="#FFE066"/>`;
      break;
    case 'scientists':
      body = `
        <ellipse cx="320" cy="200" rx="40" ry="40" fill="none" stroke="#4FC3D9" stroke-width="6"/>
        <ellipse cx="320" cy="200" rx="40" ry="16" fill="none" stroke="#4FC3D9" stroke-width="6" transform="rotate(60 320 200)"/>
        <ellipse cx="320" cy="200" rx="40" ry="16" fill="none" stroke="#4FC3D9" stroke-width="6" transform="rotate(120 320 200)"/>
        <circle cx="320" cy="200" r="12" fill="#FFB24C"/>
        <g transform="translate(120,80)">
          <rect x="0" y="20" width="140" height="80" rx="10" fill="#6FB1FC"/>
          <rect x="20" y="40" width="100" height="60" fill="#E8F3FF"/>
          <circle cx="70" cy="70" r="18" fill="#FFB24C"/>
        </g>
        <g transform="translate(420,250)">
          <rect x="0" y="20" width="80" height="50" rx="8" fill="#7DD181"/>
          <rect x="20" y="0" width="40" height="30" rx="6" fill="#FF8FA3"/>
        </g>`;
      break;
    case 'rishi':
      body = `
        <ellipse cx="320" cy="370" rx="220" ry="24" fill="#D9A85F"/>
        <rect x="120" y="120" width="26" height="200" fill="#8B5A2B"/>
        <ellipse cx="133" cy="120" rx="70" ry="50" fill="#7BB661"/>
        <ellipse cx="133" cy="110" rx="56" ry="40" fill="#9BD17A"/>
        <ellipse cx="320" cy="330" rx="70" ry="20" fill="#E8B96B"/>
        <circle cx="320" cy="200" r="46" fill="#E0A458"/>
        <path d="M270 250 q50 110 100 0 q20 60 0 70 q-50 30 -100 0 q-20 -10 0 -70 z" fill="#F2C879"/>
        <path d="M300 150 q20 -20 40 0" stroke="#7B4A12" stroke-width="5" fill="none"/>
        <circle cx="320" cy="200" r="6" fill="#7B4A12"/>`;
      break;
    default:
      body = `<circle cx="320" cy="200" r="90" fill="#FFD56B"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="${sky}"/>
    <circle cx="560" cy="70" r="40" fill="#FFE066"/>
    ${body}
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

/* ---------- Mock story library (one+ per category, bilingual) ---------- */
const MOCK_STORIES = [
  {
    categoryId: 'social',
    titleEn: 'Aarav and the New Boy',
    titleHi: 'आरव और नया लड़का',
    textEn: [
      'Aarav loved the playground. Every evening he ran to the slide with his friends.',
      'One day a new boy sat on a bench all alone. He looked a little sad.',
      'Aarav wanted to play, but a small voice inside said, "What if he does not want to talk?"',
      'Aarav took a deep breath, walked over, and smiled. "Hi! I am Aarav. Want to play?"',
      'The new boy’s face lit up. "Yes! I am Kabir. I was scared no one would talk to me."',
      'That evening, Aarav had one more friend, and Kabir had a big smile.',
    ],
    textHi: [
      'आरव को मैदान बहुत पसंद था। हर शाम वह अपने दोस्तों के साथ स्लाइड पर दौड़ता।',
      'एक दिन एक नया लड़का अकेला बेंच पर बैठा था। वह थोड़ा उदास लग रहा था।',
      'आरव खेलना चाहता था, पर अंदर एक आवाज़ आई, "क्या होगा अगर वह बात न करना चाहे?"',
      'आरव ने गहरी साँस ली, पास गया, और मुस्कुराया। "नमस्ते! मैं आरव हूँ। खेलोगे?"',
      'नए लड़के का चेहरा खिल गया। "हाँ! मैं कबीर हूँ। मुझे डर था कोई बात न करेगा।',
      'उस शाम आरव को एक और दोस्त मिला, और कबीर के चेहरे पर बड़ी मुस्कान आ गई।',
    ],
    moralEn: 'A friendly hello can turn a stranger into a friend.',
    moralHi: 'प्यार भरी नमस्ते अजनबी को दोस्त बना सकती है।',
  },
  {
    categoryId: 'bravery',
    titleEn: 'The Little Lion’s First Roar',
    titleHi: 'छोटे शेर की पहली दहाड़',
    textEn: [
      'Little lion Leo lived with his family in the tall grass.',
      'One night a loud storm came. Thunder boomed! Baby animals ran everywhere.',
      'Leo’s tummy felt funny. He was scared. He wanted to hide.',
      'Then he saw his tiny sister shaking under a bush. She needed him.',
      'Leo stood tall, took a big breath, and gave his very first ROAR!',
      'The noise was so big, the storm seemed smaller. His sister smiled. Leo was brave.',
    ],
    textHi: [
      'छोटा शेर लियो अपने परिवार के साथ ऊँची घास में रहता था।',
      'एक रात भयानक तूफ़ान आया। बादल गरजे! छोटे जानवर इधर-उधर भागे।',
      'लियो के पेट में अजीब सा महसूस हुआ। वह डर गया। वह छिपना चाहता था।',
      'तभी उसने अपनी छोटी बहन को झाड़ी के नीचे काँपते देखा। उसे अपने भाई की ज़रूरत थी।',
      'लियो खड़ा हुआ, गहरी साँस ली, और अपनी पहली दहाड़ गरजाई — गRRरR!',
      'आवाज़ इतनी बड़ी थी कि तूफ़ान भी छोटा लगा। बहन मुस्कुराई। लियो बहादुर था।',
    ],
    moralEn: 'Bravery is being scared — and doing the right thing anyway.',
    moralHi: 'साहस का मतलब है डरना — फिर भी सही काम करना।',
  },
  {
    categoryId: 'smartness',
    titleEn: 'Mia and the Stuck Jar',
    titleHi: 'मिया और बंद जार',
    textEn: [
      'Mia wanted cookies from a glass jar, but the lid would not open!',
      'She pulled and pulled. "Ugh!" said Mia. Her hands slipped.',
      'Grandma smiled. "Strong is good, but clever is better. Think, Mia."',
      'Mia looked at the jar. She ran warm water over the metal lid.',
      'Pop! The lid turned easily. "The warm water made the metal grow!" Mia cheered.',
      'From that day, Mia tried thinking before trying hard.',
    ],
    textHi: [
      'मिया को काँच के जार से कुकीज़ चाहिए थीं, पर ढक्कन नहीं खुल रहा था!',
      'वह खींचती रही। "उफ़!" बोली मिया। हाथ फिसल गए।',
      'दादी मुस्कुराईं। "ताक़त अच्छी है, पर समझदारी बेहतर। सोचो, मिया।"',
      'मिया ने जार देखा। उसने ढक्कन पर गर्म पानी डाला।',
      'पॉप! ढक्कन आसानी से घुमा। "गर्म पानी ने धातु को बढ़ा दिया!" मिया खुश हो गई।',
      'उस दिन से मिया पहले सोचने लगी, फिर मेहनत करने।',
    ],
    moralEn: 'A clever idea can be stronger than strong hands.',
    moralHi: 'समझदारी का विचार ताक़त से भी बलवान हो सकता है।',
  },
  {
    categoryId: 'habits',
    titleEn: 'The Sugar Bug Visit',
    titleHi: 'चीनी-कीड़े की आमद',
    textEn: [
      'Rohan loved sweets. Chocolates, laddoos, ice cream — yum!',
      'But at night, Rohan never brushed. "Too sleepy," he always said.',
      'One morning his tooth hurt. "Ouch!" he cried.',
      'The dentist smiled kindly. "Tiny sugar bugs party in your teeth at night. Brushing chases them away!"',
      'Rohan chose a shiny blue toothbrush. Every night, the sugar bugs had to run.',
      'Soon his teeth felt strong and his smile was bright again.',
    ],
    textHi: [
      'रोहन को मिठाइयाँ बहुत पसंद थीं। चॉकलेट, लड्डू, आइसक्रीम — यम!',
      'पर रात को रोहन ब्रश नहीं करता था। "बहुत नींद आती है," वह हमेशा कहता।',
      'एक सुबह उसके दाँत में दर्द हुआ। "आउच!" वह रो पड़ा।',
      'दंत-डॉक्टर प्यार से मुस्कुराए। "छोटे चीनी-कीड़े रात को तुम्हारे दाँतों में पार्टी करते हैं। ब्रश उन्हें भगा देता है!"',
      'रोहन ने एक चमकीला नीला टूथब्रश चुना। हर रात चीनी-कीड़े भागने लगे।',
      'जल्द ही उसके दाँत मज़बूत और मुस्कान फिर चमकदार हो गई।',
    ],
    moralEn: 'Brush twice a day to keep the sugar bugs away.',
    moralHi: 'चीनी-कीड़े दूर रखने के लिए दिन में दो बार ब्रश करें।',
  },
  {
    categoryId: 'study',
    titleEn: 'The Book That Whispered',
    titleHi: 'वह किताब जो फुसफुसाती थी',
    textEn: [
      'Ananya had a big bookshelf, but she never opened the books.',
      '"Too many pages," she sighed. "I will never finish."',
      'Mama said, "Books are friends. Open one page today. Just one."',
      'Ananya opened a book about stars. One page became two, then five.',
      'Each night she read a little more. The stories whispered new worlds to her.',
      'Soon her shelf was not scary — it was a door to a thousand adventures.',
    ],
    textHi: [
      'अनन्या के पास बड़ा किताबों का शेल्फ था, पर वह कभी किताबें नहीं खोलती थी।',
      '"इतने पन्ने," वह सिसकी। "मैं कभी पूरी नहीं कर पाऊँगी।"',
      'मम्मी बोलीं, "किताबें दोस्त हैं। आज एक पन्ना खोलो। बस एक।"',
      'अनन्या ने तारों की एक किताब खोली। एक पन्ना दो हुआ, फिर पाँच।',
      'हर रात वह थोड़ा और पढ़ती। कहानियाँ उसे नई दुनियाएँ फुसफुसातीं।',
      'जल्द ही उसका शेल्फ डरावना नहीं रहा — हज़ारों रोमांचों का दरवाज़ा बन गया।',
    ],
    moralEn: 'A little reading every day opens big new worlds.',
    moralHi: 'रोज़ थोड़ी पढ़ाई बड़ी नई दुनियाएँ खोलती है।',
  },
  {
    categoryId: 'scientists',
    titleEn: 'C.V. Raman and the Blue Sea',
    titleHi: 'सी. वी. रमन और नीला समुद्र',
    textEn: [
      'Long ago, a curious boy grew up in India. His name was Chandrasekhara Venkata Raman.',
      'On a ship, Raman looked at the sea. "Why is the sea blue?" he wondered.',
      'Most people said, "It just reflects the sky." But Raman was not satisfied.',
      'He went home and did many experiments with light and colours.',
      'He discovered that light itself changes colour as it scatters. This is the "Raman Effect"!',
      'The whole world honoured him with the Nobel Prize. Curiosity had found a great truth.',
    ],
    textHi: [
      'बहुत समय पहले भारत में एक जिज्ञासु लड़का बड़ा हुआ। उसका नाम था चंद्रशेखर वेंकट रमन।',
      'जहाज़ पर रमन ने समुद्र को देखा। "समुद्र नीला क्यों है?" उन्होंने सोचा।',
      'ज़्यादातर लोग कहते, "यह बस आसमान की परछाई है।" पर रमन संतुष्ट नहीं थे।',
      'वे घर गए और रोशनी व रंगों से कई प्रयोग किए।',
      'उन्होंने पाया कि रोशनी बिखरते हुए अपना रंग बदलती है। यही "रमन प्रभाव" है!',
      'पूरी दुनिया ने उन्हें नोबेल पुरस्कार देकर सम्मानित किया। जिज्ञासा ने एक बड़ा सत्य खोजा।',
    ],
    moralEn: 'Always ask "why?" — a great scientist lives inside every curious child.',
    moralHi: 'हमेशा पूछो "क्यों?" — हर जिज्ञासु बच्चे के अंदर एक महान वैज्ञानिक बसता है।',
  },
  {
    categoryId: 'rishi',
    titleEn: 'Rishi Valmiki and the Two Doves',
    titleHi: 'ऋषि वाल्मीकि और दो कबूतर',
    textEn: [
      'Long ago in a forest lived a sage named Valmiki. He was kind to all living things.',
      'One day a hunter shot an arrow. A dove fell, hurt and crying.',
      'Valmiki’s heart filled with sorrow. Gentle words of care came flowing from his lips.',
      'To his surprise, his words formed beautiful poetry — the very first shloka (verse)!',
      'He cared for the dove until it flew again, strong and free.',
      'Valmiki later wrote the great Ramayana, teaching the world kindness to all.',
    ],
    textHi: [
      'बहुत समय पहले एक जंगल में वाल्मीकि नाम के ऋषि रहते थे। वे सब जीवों पर दयालु थे।',
      'एक दिन एक शिकारी ने तीर मारा। एक कबूतर घायल, रोता हुआ गिर पड़ा।',
      'वाल्मीकि का हृदय दुःख से भर गया। उनके होठों से दया के कोमल शब्द बहने लगे।',
      'आश्चर्य! उनके शब्दों से सुंदर कविता बनी — अत्यंत पहला श्लोक!',
      'उन्होंने कबूतर की सेवा की जब तक वह पुनः मज़बूत व मुक्त उड़ न गया।',
      'वाल्मीकि ने बाद में महाकाव्य रामायण लिखा, संसार को सब पर दया सिखाई।',
    ],
    moralEn: 'Kindness to every living being is the highest wisdom.',
    moralHi: 'हर जीव के प्रति दया ही सबसे बड़ा ज्ञान है।',
  },
];

window.CATEGORIES = CATEGORIES;
window.I18N = I18N;
window.svgArt = svgArt;
window.MOCK_STORIES = MOCK_STORIES;
