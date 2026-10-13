// Comprehensive Thai Tone Analysis & Romanization Engine

export type ThaiTone = 'mid' | 'low' | 'falling' | 'high' | 'rising';

export interface SyllableTone {
  syllable: string;
  tone: ThaiTone;
  toneName: string;
  toneSymbol: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

export interface ToneInfo {
  name: string;
  germanName: string;
  symbol: string;
  description: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

export const THAI_TONES: Record<ThaiTone, ToneInfo> = {
  mid: {
    name: 'Mid Tone (สามัญ)',
    germanName: 'Mitte',
    symbol: '—',
    description: 'Gleichbleibend auf normaler Tonhöhe',
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-400/15',
    borderClass: 'border-amber-400/30',
  },
  low: {
    name: 'Low Tone (เอก)',
    germanName: 'Tief',
    symbol: '↘',
    description: 'Tiefe, ruhige Stimmlage',
    colorClass: 'text-sky-400',
    bgClass: 'bg-sky-400/15',
    borderClass: 'border-sky-400/30',
  },
  falling: {
    name: 'Falling Tone (โท)',
    germanName: 'Fallend',
    symbol: 'ᴧ',
    description: 'Hoch ansetzen und deutlich abfallen',
    colorClass: 'text-rose-400',
    bgClass: 'bg-rose-400/15',
    borderClass: 'border-rose-400/30',
  },
  high: {
    name: 'High Tone (ตรี)',
    germanName: 'Hoch',
    symbol: '↗',
    description: 'Hohe, gespannte Tonlage',
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-400/15',
    borderClass: 'border-emerald-400/30',
  },
  rising: {
    name: 'Rising Tone (จัตวา)',
    germanName: 'Steigend',
    symbol: 'v',
    description: 'Tief ansetzen und wie eine Frage ansteigen',
    colorClass: 'text-violet-400',
    bgClass: 'bg-violet-400/15',
    borderClass: 'border-violet-400/30',
  },
};

// High quality dictionary for common Thai words and morphemes
const THAI_DICTIONARY: Record<string, string> = {
  // Begrüßung & Höflichkeit
  'สวัสดีครับ': 'sà-wàt-dee kráp',
  'สวัสดีค่ะ': 'sà-wàt-dee khâ',
  'สวัสดี': 'sà-wàt-dee',
  'สบายดีไหม': 'sà-baai-dee măi',
  'สบายดี': 'sà-baai-dee',
  'ขอบคุณมาก': 'kò̜ːp-kun mâak',
  'ขอบคุณ': 'kò̜ːp-kun',
  'ไม่เป็นไร': 'mâi pen rai',
  'ยินดีที่ได้รู้จัก': 'yin-dee thêe dâai róo-jàk',
  'ยินดี': 'yin-dee',
  'ขอโทษ': 'khăaw-thôot',
  'ขอโทษครับ': 'khăaw-thôot kráp',
  'ขอโทษค่ะ': 'khăaw-thôot khâ',
  'ลาก่อน': 'laa-gò̜on',
  'เจอกันใหม่': 'jooe-gan mài',

  // Essen & Trinken
  'อร่อยมาก': 'à-rò̜i mâak',
  'อร่อย': 'à-rò̜i',
  'ข้าวผัด': 'khâao-pàt',
  'ข้าวผัดไก่': 'khâao-pàt gài',
  'ข้าวผัดหมู': 'khâao-pàt mŏo',
  'ข้าว': 'khâao',
  'ผัด': 'pàt',
  'เผ็ดนิดหน่อย': 'phèt nít-nò̜i',
  'ไม่เผ็ด': 'mâi phèt',
  'เผ็ด': 'phèt',
  'น้ำเปล่า': 'nám-bplào',
  'น้ำแข็ง': 'nám-khăeng',
  'น้ำ': 'nám',
  'เช็คบิลด้วยครับ': 'chék-bin dûai kráp',
  'เช็คบิล': 'chék-bin',
  'เก็บเงินด้วย': 'gèp-ngoen dûai',
  'หิวน้ำ': 'hĭo nám',
  'หิวข้าว': 'hĭo khâao',
  'หิว': 'hĭo',
  'อิ่มแล้ว': 'ìm láaeo',
  'อิ่ม': 'ìm',
  'กินข้าว': 'gin khâao',
  'กิน': 'gin',
  'ดื่ม': 'dùem',
  'ชาเย็น': 'chaa-yen',
  'กาแฟ': 'gaa-faae',
  'ต้มยำกุ้ง': 'dtôm-yam-gûng',
  'ผัดไทย': 'pàt-thai',

  // Einkaufen & Zahlen
  'อันนี้เท่าไหร่': 'an-née thâo-rài',
  'เท่าไหร่': 'thâo-rài',
  'ลดหน่อยได้ไหม': 'lót nò̜i dâai măi',
  'ลดได้ไหม': 'lót dâai măi',
  'แพงมาก': 'phaaeng mâak',
  'แพง': 'phaaeng',
  'ถูก': 'thòok',
  'หนึ่งร้อยบาท': 'nùeng ró̜i bàat',
  'หนึ่ง': 'nùeng',
  'สอง': 'săawng',
  'สาม': 'săam',
  'สี่': 'sèe',
  'ห้า': 'hâa',
  'หก': 'hòk',
  'เจ็ด': 'jèt',
  'แปด': 'bpàaet',
  'เก้า': 'gâao',
  'สิบ': 'sìp',
  'ยี่สิบ': 'yêe-sìp',
  'ร้อย': 'ró̜i',
  'พัน': 'phan',
  'บาท': 'bàat',
  'ซื้อ': 'súe',
  'ขาย': 'khăai',

  // Unterwegs & Orientierung
  'ห้องน้ำอยู่ที่ไหน': 'hông-nám yòo thêe-năi',
  'ห้องน้ำ': 'hông-nám',
  'อยู่ที่ไหน': 'yòo thêe-năi',
  'ที่ไหน': 'thêe-năi',
  'ไปสนามบิน': 'bpai sà-năam-bin',
  'สนามบิน': 'sà-năam-bin',
  'โรงแรม': 'roong-raaem',
  'โรงพยาบาล': 'roong-phá-yaa-baan',
  'สถานีรถไฟ': 'sà-thăa-nee rót-fai',
  'เลี้ยวซ้าย': 'líao-sáai',
  'เลี้ยวขวา': 'líao-khwăa',
  'เลี้ยว': 'líao',
  'ตรงไป': 'dtrong-bpai',
  'หยุด': 'yùt',
  'ใกล้': 'glâi',
  'ไกล': 'glai',
  'รถแท็กซี่': 'rót-tháaek-sêe',
  'รถเมล์': 'rót-mee',
  'รถไฟฟ้า': 'rót-fai-fáa',
  'รถ': 'rót',

  // Kommunikation & Verständnis
  'คุณพูดภาษาอังกฤษได้ไหม': 'khun phôot phaa-săa ang-grìt dâai măi',
  'พูดภาษาอังกฤษได้ไหม': 'phôot phaa-săa ang-grìt dâai măi',
  'พูดภาษาไทย': 'phôot phaa-săa thai',
  'ภาษาอังกฤษ': 'phaa-săa ang-grìt',
  'ภาษาไทย': 'phaa-săa thai',
  'ภาษา': 'phaa-săa',
  'พูด': 'phôot',
  'ไม่เข้าใจ': 'mâi khâo-jai',
  'เข้าใจไหม': 'khâo-jai măi',
  'เข้าใจ': 'khâo-jai',
  'พูดช้าๆ หน่อย': 'phôot cháa-cháa nò̜i',
  'ช้าๆ': 'cháa-cháa',
  'เร็วๆ': 'reo-reo',
  'ใช่ไหม': 'châi măi',
  'ใช่': 'châi',
  'ไม่ใช่': 'mâi-châi',
  'ช่วยด้วย': 'chûai dûai',
  'ช่วย': 'chûai',

  // Pronomen & Partikel
  'ผม': 'phŏm',
  'ฉัน': 'chăn',
  'คุณ': 'khun',
  'เขา': 'khăo',
  'พวกเรา': 'phûak-rao',
  'ครับ': 'kráp',
  'ค่ะ': 'khâ',
  'คะ': 'khá',
  'นะ': 'ná',
  'ด้วย': 'dûai',
  'ไหม': 'măi',
  'มั้ย': 'mái',
  'หรือ': 'rŭe',
  'และ': 'láae',
  'กับ': 'gàp',
  'แต่': 'dtàae',
  'เพราะ': 'phró̜',
  'ทำไม': 'tham-mai',
  'อะไร': 'à-rai',
  'เมื่อไหร่': 'mûea-rài',
  'อย่างไร': 'yàang-rai',
  'ใคร': 'khrai',

  // Eigenschaften & Gefühle
  'สวย': 'sŭai',
  'หล่อ': 'lò̜ː',
  'น่ารัก': 'nâa-rák',
  'ดี': 'dee',
  'ไม่ดี': 'mâi dee',
  'ชอบ': 'chô̜ːp',
  'ไม่ชอบ': 'mâi chô̜ːp',
  'รัก': 'rák',
  'สนุก': 'sà-nùk',
  'เหนื่อย': 'nùeai',
  'ร้อน': 'ró̜ːn',
  'หนาว': 'năao',
  'ฝนตก': 'fŏn-dtòk',
  'มีความสุข': 'mee khwaam-sùk',
};

// Thai consonant classes
const HIGH_CONSONANTS = new Set(['ข', 'ฃ', 'ฉ', 'ฐ', 'ถ', 'ผ', 'ฝ', 'ศ', 'ษ', 'ส', 'ห']);
const MID_CONSONANTS = new Set(['ก', 'จ', 'ฎ', 'ฏ', 'ด', 'ต', 'บ', 'ป', 'อ']);
const LOW_CONSONANTS = new Set([
  'ค', 'ฅ', 'ฆ', 'ง', 'ช', 'ซ', 'ฌ', 'ญ', 'ฑ', 'ฒ', 'ณ', 'ท', 'ธ', 'น',
  'พ', 'ฟ', 'ภ', 'ม', 'ย', 'ร', 'ล', 'ว', 'ฬ', 'ฮ',
]);

// Initial consonant mapping to RTGS romanization
const INITIAL_CONSONANTS: Record<string, string> = {
  'ก': 'g', 'ข': 'kh', 'ฃ': 'kh', 'ค': 'kh', 'ฅ': 'kh', 'ฆ': 'kh',
  'ง': 'ng', 'จ': 'j', 'ฉ': 'ch', 'ช': 'ch', 'ซ': 's', 'ฌ': 'ch',
  'ญ': 'y', 'ฎ': 'd', 'ฏ': 'dt', 'ฐ': 'th', 'ฑ': 'th', 'ฒ': 'th',
  'ณ': 'n', 'ด': 'd', 'ต': 'dt', 'ถ': 'th', 'ท': 'th', 'ธ': 'th',
  'น': 'n', 'บ': 'b', 'ป': 'bp', 'ผ': 'ph', 'ฝ': 'f', 'พ': 'ph',
  'ฟ': 'f', 'ภ': 'ph', 'ม': 'm', 'ย': 'y', 'ร': 'r', 'ล': 'l',
  'ว': 'w', 'ศ': 's', 'ษ': 's', 'ส': 's', 'ห': 'h', 'ฬ': 'l',
  'ฮ': 'h', 'อ': '',
};

// Final consonant mapping
const FINAL_CONSONANTS: Record<string, string> = {
  'ก': 'k', 'ข': 'k', 'ค': 'k', 'ฆ': 'k',
  'ง': 'ng',
  'จ': 't', 'ฉ': 't', 'ช': 't', 'ซ': 't', 'ฌ': 't',
  'ฎ': 't', 'ฏ': 't', 'ฐ': 't', 'ฑ': 't', 'ฒ': 't',
  'ด': 't', 'ต': 't', 'ถ': 't', 'ท': 't', 'ธ': 't',
  'ศ': 't', 'ษ': 't', 'ส': 't',
  'ญ': 'n', 'ณ': 'n', 'น': 'n', 'ร': 'n', 'ล': 'n', 'ฬ': 'n',
  'บ': 'p', 'ป': 'p', 'ผ': 'p', 'พ': 'p', 'ฟ': 'p', 'ภ': 'p',
  'ม': 'm',
  'ย': 'y',
  'ว': 'w',
};

// Diacritic mappings for each tone
const DIACRITIC_MAP: Record<ThaiTone, Record<string, string>> = {
  mid: {
    a: 'a', e: 'e', i: 'i', o: 'o', u: 'u', y: 'y',
  },
  low: {
    a: 'à', e: 'è', i: 'ì', o: 'ò', u: 'ù', y: 'ỳ',
  },
  falling: {
    a: 'â', e: 'ê', i: 'î', o: 'ô', u: 'û', y: 'ŷ',
  },
  high: {
    a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú', y: 'ý',
  },
  rising: {
    a: 'ă', e: 'ĕ', i: 'ĭ', o: 'ŏ', u: 'ŭ', y: 'y̌',
  },
};

/**
 * Applies a tone diacritic to the main vowel of a romanized syllable
 */
export function applyToneToSyllable(syllable: string, tone: ThaiTone): string {
  if (tone === 'mid') return syllable;

  // Find the first vowel to place the accent
  const vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
  let charIdx = -1;
  for (let i = 0; i < syllable.length; i++) {
    const ch = syllable[i].toLowerCase();
    if (vowels.includes(ch)) {
      charIdx = i;
      break;
    }
  }

  if (charIdx === -1) return syllable;

  const char = syllable[charIdx];
  const isUpper = char === char.toUpperCase();
  const lowerChar = char.toLowerCase();
  const accented = DIACRITIC_MAP[tone]?.[lowerChar] || lowerChar;
  const finalChar = isUpper ? accented.toUpperCase() : accented;

  return syllable.substring(0, charIdx) + finalChar + syllable.substring(charIdx + 1);
}

/**
 * Extracts tone from a single romanized syllable based on diacritics or tone numbers
 */
export function detectToneFromSyllable(syllable: string): ThaiTone {
  const norm = syllable.normalize('NFD');

  // Check explicit tone markers (Gravis, Zirkumflex, Akut, Hatschek/Caron)
  // Low: Grave accent (\u0300) or precomposed à, è, ì, ò, ù
  if (/[àèìòùỳ]/.test(syllable) || norm.includes('\u0300')) {
    return 'low';
  }

  // Falling: Circumflex (\u0302) or precomposed â, ê, î, ô, û
  if (/[âêîôûŷ]/.test(syllable) || norm.includes('\u0302')) {
    return 'falling';
  }

  // High: Acute accent (\u0301) or precomposed á, é, í, ó, ú
  if (/[áéíóúý]/.test(syllable) || norm.includes('\u0301')) {
    return 'high';
  }

  // Rising: Caron/Hatschek (\u030C), Breve (\u0306), or precomposed ă, ĕ, ĭ, ŏ, ŭ
  if (/[ăĕĭŏŭǎěǐǒǔ]/.test(syllable) || norm.includes('\u030C') || norm.includes('\u0306')) {
    return 'rising';
  }

  // Check numerical tone markers at end of syllable (e.g., dee1, mai4)
  if (/[1]$/.test(syllable)) return 'mid';
  if (/[2]$/.test(syllable)) return 'low';
  if (/[3]$/.test(syllable)) return 'falling';
  if (/[4]$/.test(syllable)) return 'high';
  if (/[5]$/.test(syllable)) return 'rising';

  // Default to mid tone
  return 'mid';
}

/**
 * Analyzes a romanized text and returns each syllable with its detected tone
 */
export function extractTonesFromRomanization(romanization: string): SyllableTone[] {
  if (!romanization || !romanization.trim()) return [];

  // Split on spaces, hyphens, and slashes while keeping structure
  const tokens = romanization
    .trim()
    .split(/[\s-]+/)
    .filter(Boolean);

  return tokens.map((token) => {
    // Clean punctuation from token edges
    const cleanSyllable = token.replace(/^[.,!?()":;]+|[.,!?()":;]+$/g, '');
    const tone = detectToneFromSyllable(cleanSyllable);
    const info = THAI_TONES[tone];

    return {
      syllable: cleanSyllable,
      tone,
      toneName: info.germanName,
      toneSymbol: info.symbol,
      colorClass: info.colorClass,
      bgClass: info.bgClass,
      borderClass: info.borderClass,
    };
  });
}

/**
 * Rule-based transliteration of a single Thai word/chunk into romanization with tones
 */
function transliterateThaiChunk(chunk: string): { romanization: string; tone: ThaiTone } {
  const clean = chunk.trim();
  if (!clean) return { romanization: '', tone: 'mid' };

  // 1. Direct dictionary match
  if (THAI_DICTIONARY[clean]) {
    return {
      romanization: THAI_DICTIONARY[clean],
      tone: detectToneFromSyllable(THAI_DICTIONARY[clean]),
    };
  }

  // Extract tone mark if present
  let toneMark: 'mai_ek' | 'mai_tho' | 'mai_tri' | 'mai_chattawa' | null = null;
  if (clean.includes('\u0e48')) toneMark = 'mai_ek'; // ่
  else if (clean.includes('\u0e49')) toneMark = 'mai_tho'; // ้
  else if (clean.includes('\u0e4a')) toneMark = 'mai_tri'; // ๊
  else if (clean.includes('\u0e4b')) toneMark = 'mai_chattawa'; // ๋

  // Find initial consonant and class
  let initial = '';
  let initialClass: 'high' | 'mid' | 'low' = 'mid';
  let initialIdx = 0;

  // Handle leading vowels like เ, แ, โ, ใ, ไ
  const leadingVowels = new Set(['เ', 'แ', 'โ', 'ใ', 'ไ']);
  if (leadingVowels.has(clean[0]) && clean.length > 1) {
    initialIdx = 1;
  }

  const firstConsonant = clean[initialIdx];
  if (firstConsonant) {
    // Check silent leading ห (ห นำ)
    if (firstConsonant === 'ห' && clean.length > initialIdx + 1 && LOW_CONSONANTS.has(clean[initialIdx + 1])) {
      initial = INITIAL_CONSONANTS[clean[initialIdx + 1]] || '';
      initialClass = 'high'; // Turns low consonant into high class!
    } else if (HIGH_CONSONANTS.has(firstConsonant)) {
      initial = INITIAL_CONSONANTS[firstConsonant] || '';
      initialClass = 'high';
    } else if (MID_CONSONANTS.has(firstConsonant)) {
      initial = INITIAL_CONSONANTS[firstConsonant] || '';
      initialClass = 'mid';
    } else if (LOW_CONSONANTS.has(firstConsonant)) {
      initial = INITIAL_CONSONANTS[firstConsonant] || '';
      initialClass = 'low';
    } else {
      initial = INITIAL_CONSONANTS[firstConsonant] || '';
    }
  }

  // Determine syllable tone based on Thai tone rules
  let calculatedTone: ThaiTone = 'mid';
  if (toneMark === 'mai_ek') {
    calculatedTone = initialClass === 'low' ? 'falling' : 'low';
  } else if (toneMark === 'mai_tho') {
    calculatedTone = initialClass === 'low' ? 'high' : 'falling';
  } else if (toneMark === 'mai_tri') {
    calculatedTone = 'high';
  } else if (toneMark === 'mai_chattawa') {
    calculatedTone = 'rising';
  } else {
    // Unmarked tone rules (Live vs Dead)
    // Check if dead syllable: ending in stop sound or short vowel without sonorant
    const hasDeadEnding = /[กขคฆดตถทธศษสบปผพภ]$/.test(clean);
    const hasShortVowel = /[ะิึุั]/.test(clean) || clean.includes('เ-ะ');

    if (hasDeadEnding || hasShortVowel) {
      if (initialClass === 'high' || initialClass === 'mid') {
        calculatedTone = 'low';
      } else {
        calculatedTone = hasShortVowel ? 'high' : 'falling';
      }
    } else {
      // Live syllable
      if (initialClass === 'high') {
        calculatedTone = 'rising';
      } else {
        calculatedTone = 'mid';
      }
    }
  }

  // Basic phonetic vowel mapping
  let vowelPart = 'aa';
  if (clean.includes('ี')) vowelPart = 'ee';
  else if (clean.includes('ิ')) vowelPart = 'i';
  else if (clean.includes('ื')) vowelPart = 'uee';
  else if (clean.includes('ึ')) vowelPart = 'ue';
  else if (clean.includes('ู')) vowelPart = 'oo';
  else if (clean.includes('ุ')) vowelPart = 'u';
  else if (clean.includes('โ')) vowelPart = 'oh';
  else if (clean.includes('ใ') || clean.includes('ไ')) vowelPart = 'ai';
  else if (clean.includes('แ')) vowelPart = 'aae';
  else if (clean.includes('เ')) vowelPart = 'eh';
  else if (clean.includes('ะ') || clean.includes('ั')) vowelPart = 'a';
  else if (clean.includes('ำ')) vowelPart = 'am';
  else if (clean.includes('า')) vowelPart = 'aa';
  else if (clean.includes('อ')) vowelPart = 'aw';

  // Final consonant
  let finalPart = '';
  const lastChar = clean[clean.length - 1];
  if (lastChar && FINAL_CONSONANTS[lastChar] && lastChar !== firstConsonant) {
    finalPart = FINAL_CONSONANTS[lastChar];
  }

  const rawSyllable = `${initial || ''}${vowelPart}${finalPart}` || clean;
  const withTone = applyToneToSyllable(rawSyllable, calculatedTone);

  return {
    romanization: withTone,
    tone: calculatedTone,
  };
}

/**
 * Automatically generates phonetic romanization with tone marks from Thai text
 */
export function generateRomanizationFromThai(thaiText: string): {
  romanization: string;
  syllables: SyllableTone[];
} {
  const clean = thaiText.trim();
  if (!clean) return { romanization: '', syllables: [] };

  // 1. Direct dictionary match for entire phrase
  if (THAI_DICTIONARY[clean]) {
    const rom = THAI_DICTIONARY[clean];
    return {
      romanization: rom,
      syllables: extractTonesFromRomanization(rom),
    };
  }

  // 2. Greedy phrase matching using our dictionary
  const words: string[] = [];
  let remaining = clean;

  while (remaining.length > 0) {
    let matched = false;
    // Check dictionary prefixes from longest to shortest
    for (let len = Math.min(remaining.length, 12); len >= 2; len--) {
      const sub = remaining.substring(0, len);
      if (THAI_DICTIONARY[sub]) {
        words.push(THAI_DICTIONARY[sub]);
        remaining = remaining.substring(len).trim();
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Split by spaces if present
      const spaceIdx = remaining.indexOf(' ');
      if (spaceIdx !== -1) {
        const chunk = remaining.substring(0, spaceIdx);
        const translit = transliterateThaiChunk(chunk);
        if (translit.romanization) words.push(translit.romanization);
        remaining = remaining.substring(spaceIdx + 1).trim();
      } else {
        // Fallback: transliterate remainder chunk
        const translit = transliterateThaiChunk(remaining);
        if (translit.romanization) words.push(translit.romanization);
        break;
      }
    }
  }

  const resultRom = words.join(' ').replace(/\s*-\s*/g, '-');
  return {
    romanization: resultRom,
    syllables: extractTonesFromRomanization(resultRom),
  };
}
