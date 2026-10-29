let cachedThaiVoice: SpeechSynthesisVoice | null = null;

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const updateVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    cachedThaiVoice = voices.find((v) => v.lang.startsWith('th') || v.lang.includes('TH')) || null;
  };
  updateVoice();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = updateVoice;
  }
}

// Direct phonetic mappings for standalone vowel symbols and special signs
const SPECIAL_AUDIO_MAP: Record<string, string> = {
  '-ะ': 'สะระ อะ',
  '◌ะ': 'สะระ อะ',
  'ะ': 'สะระ อะ',
  '-า': 'สะระ อา',
  '◌า': 'สะระ อา',
  'า': 'สะระ อา',
  '-ิ': 'สะระ อิ',
  '◌ิ': 'สะระ อิ',
  'ิ': 'สะระ อิ',
  '-ี': 'สะระ อี',
  '◌ี': 'สะระ อี',
  'ี': 'สะระ อี',
  '-ึ': 'สะระ อึ',
  '◌ึ': 'สะระ อึ',
  'ึ': 'สะระ อึ',
  '-ื': 'สะระ อือ',
  '◌ื': 'สะระ อือ',
  'ื': 'สะระ อือ',
  'ือ': 'สะระ อือ',
  '-ุ': 'สะระ อุ',
  '◌ุ': 'สะระ อุ',
  'ุ': 'สะระ อุ',
  '-ู': 'สะระ อู',
  '◌ู': 'สะระ อู',
  'ู': 'สะระ อู',
  'เ-ะ': 'สะระ เอะ',
  'เะ': 'สะระ เอะ',
  'เ-': 'สะระ เอ',
  'เ': 'สะระ เอ',
  'แ-ะ': 'สะระ แอะ',
  'แะ': 'สะระ แอะ',
  'แ-': 'สะระ แอ',
  'แ': 'สะระ แอ',
  'โ-ะ': 'สะระ โอะ',
  'โะ': 'สะระ โอะ',
  'โ-': 'สะระ โอ',
  'โ': 'สะระ โอ',
  'เ-าะ': 'สะระ เอาะ',
  'เาะ': 'สะระ เอาะ',
  '-อ': 'สะระ ออ',
  'เ-อะ': 'สะระ เออะ',
  'เอะ': 'สะระ เออะ',
  'เ-อ': 'สะระ เออ',
  'เอ': 'สะระ เออ',
  'เ-ียะ': 'สะระ เอียะ',
  'เียะ': 'สะระ เอียะ',
  'เ-ีย': 'สะระ เอีย',
  'เีย': 'สะระ เอีย',
  'เ-ือะ': 'สะระ เอือะ',
  'เือะ': 'สะระ เอือะ',
  'เ-ือ': 'สะระ เอือ',
  'เือ': 'สะระ เอือ',
  '◌ัวะ': 'สะระ อัวะ',
  '-ัวะ': 'สะระ อัวะ',
  'ัวะ': 'สะระ อัวะ',
  '◌ัว': 'สะระ อัว',
  '-ัว': 'สะระ อัว',
  'ัว': 'สะระ อัว',
  '-ำ': 'สะระ อำ',
  '◌ำ': 'สะระ อำ',
  'ำ': 'สะระ อำ',
  'ใ-': 'สะระ ไอ ไม้ม้วน',
  'ใ': 'สะระ ไอ ไม้ม้วน',
  'ไ-': 'สะระ ไอ ไม้มลาย',
  'ไ': 'สะระ ไอ ไม้มลาย',
  'เ-า': 'สะระ เอา',
  'เา': 'สะระ เอา',
  // Consonants 1-44 (single letters speak their full official Thai name)
  'ก': 'ก ไก่',
  'ข': 'ข ไข่',
  'ฃ': 'ฃ ขวด',
  'ค': 'ค ควาย',
  'ฅ': 'ฅ คน',
  'ฆ': 'ฆ ระฆัง',
  'ง': 'ง งู',
  'จ': 'จ จาน',
  'ฉ': 'ฉ ฉิ่ง',
  'ช': 'ช ช้าง',
  'ซ': 'ซ โซ่',
  'ฌ': 'ฌ เฌอ',
  'ญ': 'ญ ผู้หญิง',
  'ฎ': 'ฎ ชฎา',
  'ฏ': 'ฏ ปฏัก',
  'ฐ': 'ฐ ฐาน',
  'ฑ': 'ฑ มณโฑ',
  'ฒ': 'ฒ ผู้เฒ่า',
  'ณ': 'ณ เณร',
  'ด': 'ด เด็ก',
  'ต': 'ต เต่า',
  'ถ': 'ถ ถุง',
  'ท': 'ท ทหาร',
  'ธ': 'ธ ธง',
  'น': 'น หนู',
  'บ': 'บ ใบไม้',
  'ป': 'ป ปลา',
  'ผ': 'ผ ผึ้ง',
  'ฝ': 'ฝ ฝา',
  'พ': 'พ พาน',
  'ฟ': 'ฟ ฟัน',
  'ภ': 'ภ สำเภา',
  'ม': 'ม ม้า',
  'ย': 'ย ยักษ์',
  'ร': 'ร เรือ',
  'ล': 'ล ลิง',
  'ว': 'ว แหวน',
  'ศ': 'ศ ศาลา',
  'ษ': 'ษ ฤๅษี',
  'ส': 'ส เสือ',
  'ห': 'ห หีบ',
  'ฬ': 'ฬ จุฬา',
  'อ': 'อ อ่าง',
  'ฮ': 'ฮ นกฮูก',

  // Tone marks
  '่': 'ไม้เอก',
  '-่': 'ไม้เอก',
  '◌่': 'ไม้เอก',
  '้': 'ไม้โท',
  '-้': 'ไม้โท',
  '◌้': 'ไม้โท',
  '๊': 'ไม้ตรี',
  '-๊': 'ไม้ตรี',
  '◌๊': 'ไม้ตรี',
  '๋': 'ไม้จัตวา',
  '-๋': 'ไม้จัตวา',
  '◌๋': 'ไม้จัตวา',

  // Special marks & vowels
  '์': 'ตัวการันต์',
  '-์': 'ตัวการันต์',
  '◌์': 'ตัวการันต์',
  'ๆ': 'ไม้ยมก',
  '็': 'ไม้ไต่คู้',
  '-็': 'ไม้ไต่คู้',
  '◌็': 'ไม้ไต่คู้',
  'ฯ': 'ไปยาลน้อย',
  'ฯลฯ': 'ไปยาลใหญ่',
  '-ั': 'ไม้หันอากาศ',
  '◌ั': 'ไม้หันอากาศ',
  'ั': 'ไม้หันอากาศ',
  'ฤ': 'ตัวรึ',
  'ฤๅ': 'ตัวรือ',
  'ฦ': 'ตัวลึ',
  'ฦๅ': 'ตัวลือ',
};

/**
 * Plays Thai pronunciation using Web Speech API synthesis
 */
export function speakThai(
  text: string,
  onEndOrRate?: (() => void) | number,
  rateParam: number = 0.85
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // cancel any ongoing speech

    const trimmed = (text || '').trim();
    let targetText = trimmed;

    // Check direct map for symbols or letters without parentheses
    if (SPECIAL_AUDIO_MAP[trimmed]) {
      targetText = SPECIAL_AUDIO_MAP[trimmed];
    } else {
      // Smart parenthetical handling:
      // Case 1: "ก (ก ไก่)" or "-ิ (สระอิ)" or "่ (ไม้เอก)" -> before is short symbol (<= 3 chars), inside is Thai name -> speak inside!
      // Case 2: "สวัสดีครับ (männlich)" or "กินข้าว (Essen)" -> inside is German/English note -> speak before!
      // Case 3: "กินข้าว (รับประทานอาหาร)" -> before is full Thai word, inside is synonym/formal note -> speak before!
      const parenMatch = trimmed.match(/^([^\(\[\{（【]+)[\(\[\{（【]([^\)\]\}）】]+)[\)\]\}）】]/);
      if (parenMatch) {
        const beforeParen = parenMatch[1].trim();
        const insideParen = parenMatch[2].trim();

        // If inside parenthesis has NO Thai characters, speak the Thai word before it
        if (!/[ก-๙]/.test(insideParen)) {
          targetText = beforeParen;
        } else {
          // If before parenthesis is a single letter or short vowel/sign symbol (e.g. "ก", "-ิ", "่", "ฯลฯ"),
          // then the parenthesis contains its spoken name (e.g. "ก ไก่", "สระอิ", "ไม้เอก"), so speak inside!
          const cleanBefore = beforeParen.replace(/[\s\-\u25CC\u25CB]/g, '');
          if (cleanBefore.length <= 3) {
            targetText = insideParen;
          } else {
            targetText = beforeParen;
          }
        }
      } else {
        // Also check if stripping placeholder circles (◌) or leading hyphens matches SPECIAL_AUDIO_MAP
        const cleanSymbol = trimmed.replace(/[\u25CC\u25CB\u25CF\s\-]/g, '');
        if (cleanSymbol && SPECIAL_AUDIO_MAP[cleanSymbol]) {
          targetText = SPECIAL_AUDIO_MAP[cleanSymbol];
        }
      }
    }

    // Phonetic normalization for vowels:
    // In Thai, "สระ" (written without vowel after ส) causes TTS to cluster ส+ร into /s/ ("Sa" or "sam" for -ำ).
    // Replacing with "สะระ " separates into two syllables /sà/ + /rà/ ("Sara"), avoiding the intrusive 'h/ch' of 'ห'.
    targetText = targetText
      .replace(/^สระ/g, 'สะระ ')
      .replace(/\s*สระ([^\s])/g, ' สะระ $1')
      .replace(/\bสระ\b/g, 'สะระ')
      .replace(/สะระ\s*ใอม้วน/g, 'สะระ ไอ ไม้ม้วน')
      .replace(/สะระ\s*ไอไม้มลาย/g, 'สะระ ไอ ไม้มลาย')
      .replace(/\s+/g, ' ');

    // Replace slashes or semicolons with commas to create a natural pause without reading punctuation
    const speechText = targetText
      .replace(/\s*[\/;\n]\s*/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!speechText) return false;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = 'th-TH';
    
    let rate = 0.85;
    if (typeof onEndOrRate === 'number') {
      rate = onEndOrRate;
    } else if (typeof rateParam === 'number') {
      rate = rateParam;
    }
    utterance.rate = rate;
    utterance.pitch = 1.0;

    if (typeof onEndOrRate === 'function') {
      utterance.onend = onEndOrRate;
      utterance.onerror = onEndOrRate;
    }

    // Use cached or fresh Thai voice if available
    if (!cachedThaiVoice) {
      const voices = window.speechSynthesis.getVoices();
      cachedThaiVoice = voices.find((v) => v.lang.startsWith('th') || v.lang.includes('TH')) || null;
    }
    if (cachedThaiVoice) {
      utterance.voice = cachedThaiVoice;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('Speech synthesis error:', err);
    if (typeof onEndOrRate === 'function') {
      onEndOrRate();
    }
    return false;
  }
}

/**
 * Stops any ongoing Thai speech synthesis
 */
export function stopThaiSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}
