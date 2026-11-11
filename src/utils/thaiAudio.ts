import { autocorrectThaiTypingOrder } from './thaiTones';

let cachedThaiVoice: SpeechSynthesisVoice | null = null;

function findBestThaiVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;
  const thaiVoices = voices.filter(
    (v) => v.lang.startsWith('th') || v.lang.includes('TH') || v.lang.toLowerCase() === 'th'
  );
  if (thaiVoices.length === 0) return null;

  // Prioritize enhanced / Siri / natural / Google voices for best pronunciation quality
  return (
    thaiVoices.find((v) => /siri|enhanced|premium|natural/i.test(v.name)) ||
    thaiVoices.find((v) => /google/i.test(v.name)) ||
    thaiVoices.find((v) => /kanya|narisa|premwadee|niwat/i.test(v.name)) ||
    thaiVoices[0]
  );
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const updateVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    cachedThaiVoice = findBestThaiVoice(voices);
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

  // Complex words & Pali/Sanskrit compounds requiring clear syllabification in TTS
  'พิพิธภัณฑ์': 'พิพิดทะพัน',
  'พิพิธภัณฑสถาน': 'พิพิดทะพันทะสะถาน',
  'อนุสาวรีย์': 'อะนุสาวะรี',
  'มหาวิทยาลัย': 'มะหาวิดทะยาลัย',
  'ไปรษณีย์': 'ไปรสะนี',
  'สวนสาธารณะ': 'สวนสาทาระนะ',
  'สาธารณะ': 'สาทาระนะ',
  'สะพานลอย': 'สะพานลอย',
  'ท่าอากาศยาน': 'ท่าอากาดสะยาน',

  // Problematic everyday words & English loanwords in standard Web Speech API TTS
  // "เชฟ" (Chef) ends with 'ฟ' (unreleased foreign coda); Royal Institute phonetics is 'เช้บ' (Mae Kop, high tone [chêp])
  'เชฟ': 'เช้บ',
  // Standalone "ข้าว" in Web Speech engines suffers from pitch-drop clipping and vocoder fluttering;
  // "ค่าว" (/kʰâːw/) is an exact 100% homophone (identical IPA, falling tone, aspirated velar stop) that synthesizes cleanly
  'ข้าว': 'ค่าว',
  'กอล์ฟ': 'ก๊อบ',
  'ลิฟต์': 'ลิบ',
  'เซฟ': 'เซ้บ',
  'บอร์ด': 'บอด',
  'การ์ด': 'กาด',
  'เสิร์ฟ': 'เสิบ',
  'บุฟเฟต์': 'บุบเฟ่',
  'บุฟเฟ่ต์': 'บุบเฟ่',
  'คอนเสิร์ต': 'คอนเสิด',
  'คอมพิวเตอร์': 'คอมพิวเต้อ',
  'อินเทอร์เน็ต': 'อินเทอเน็ต',
  'ออฟฟิศ': 'อ๊อฟฟิด',
  'ออฟฟิส': 'อ๊อฟฟิด',
  'ไอศกรีม': 'ไอสะกรีม',
  'ไอศครีม': 'ไอสะครีม',
  'แซนด์วิช': 'แซนวิด',
  'ช็อกโกแลต': 'ช็อกโกแลต',
  'แอปเปิ้ล': 'แอบเปิ้ล',
  'โพสต์': 'โพด',
  'เว็บไซต์': 'เว็บไซ',
};

// Regex replacements applied within phrases/sentences for words Thai TTS engines typically choke on
const TTS_PHONETIC_REPLACEMENTS: Array<[RegExp, string]> = [
  // "เชฟ" -> "เช้บ" (Mae Kop, high tone [chêp])
  [/เชฟ/g, 'เช้บ'],
  // Standalone or word-bounded "ข้าว" -> "ค่าว" (exact homophone with clean falling tone)
  [/(?<=^|[\s,.\-—–/])ข้าว(?=$|[\s,.\-—–/])/g, 'ค่าว'],
  // Common English loanwords with foreign codas
  [/กอล์ฟ/g, 'ก๊อบ'],
  [/ลิฟต์/g, 'ลิบ'],
  [/เซฟ/g, 'เซ้บ'],
  [/บอร์ด/g, 'บอด'],
  [/การ์ด/g, 'กาด'],
  [/เสิร์ฟ/g, 'เสิบ'],
  [/บุฟเฟ[ต์่ต์]+/g, 'บุบเฟ่'],
  [/คอนเสิร์ต/g, 'คอนเสิด'],
  [/คอมพิวเตอร์/g, 'คอมพิวเต้อ'],
  [/อินเทอร์เน็ต/g, 'อินเทอเน็ต'],
  [/ออฟฟิ[ศส]/g, 'อ๊อฟฟิด'],
  [/ไอศ[กค]รีม/g, 'ไอสะกรีม'],
  [/แซนด์วิช/g, 'แซนวิด'],
  [/แอปเปิ้ล/g, 'แอบเปิ้ล'],
  [/โพสต์/g, 'โพด'],
  [/เว็บไซต์/g, 'เว็บไซ'],
];

/**
 * Plays Thai pronunciation using Web Speech API synthesis
 */
export function speakThai(
  text: string,
  onEndOrRate?: (() => void) | number,
  rateParam: number = 0.95
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // cancel any ongoing speech

    // 1. Correct any typing order quirks (e.g. vowel before tone mark or misplaced marks)
    let rawText = autocorrectThaiTypingOrder(text || '').trim();
    if (!rawText) return false;

    let targetText = rawText;

    // Check direct map for symbols or letters without parentheses
    if (SPECIAL_AUDIO_MAP[rawText]) {
      targetText = SPECIAL_AUDIO_MAP[rawText];
    } else {
      // Smart parenthetical handling:
      // Case 1: "ก (ก ไก่)" or "-ิ (สระอิ)" or "่ (ไม้เอก)" -> before is short symbol (<= 3 chars), inside is Thai name -> speak inside!
      // Case 2: "สวัสดีครับ (männlich)" or "กินข้าว (Essen)" -> inside is German/English note -> speak before!
      // Case 3: "กินข้าว (รับประทานอาหาร)" -> before is full Thai word, inside is synonym/formal note -> speak before!
      const parenMatch = rawText.match(/^([^\(\[\{（【]+)[\(\[\{（【]([^\)\]\}）】]+)[\)\]\}）】]/);
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
        const cleanSymbol = rawText.replace(/[\u25CC\u25CB\u25CF\s\-]/g, '');
        if (cleanSymbol && SPECIAL_AUDIO_MAP[cleanSymbol]) {
          targetText = SPECIAL_AUDIO_MAP[cleanSymbol];
        }
      }
    }

    // Apply phonetic replacements for words TTS engines mispronounce (like เชฟ, ข้าว, loanwords)
    for (const [pattern, replacement] of TTS_PHONETIC_REPLACEMENTS) {
      targetText = targetText.replace(pattern, replacement);
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
    
    // 0.95 provides the sweet spot: natural human pacing without the time-stretching vocoder flutter of <=0.85
    let rate = 0.95;
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
      cachedThaiVoice = findBestThaiVoice(voices);
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
