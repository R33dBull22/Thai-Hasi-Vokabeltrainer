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
  '-ะ': 'สะหระ อะ',
  '◌ะ': 'สะหระ อะ',
  '-า': 'สะหระ อา',
  '◌า': 'สะหระ อา',
  '-ิ': 'สะหระ อิ',
  '◌ิ': 'สะหระ อิ',
  '-ี': 'สะหระ อี',
  '◌ี': 'สะหระ อี',
  '-ึ': 'สะหระ อึ',
  '◌ึ': 'สะหระ อึ',
  '-ื': 'สะหระ อือ',
  '◌ื': 'สะหระ อือ',
  '-ุ': 'สะหระ อุ',
  '◌ุ': 'สะหระ อุ',
  '-ู': 'สะหระ อู',
  '◌ู': 'สะหระ อู',
  'เ-ะ': 'สะหระ เอะ',
  'เ-': 'สะหระ เอ',
  'แ-ะ': 'สะหระ แอะ',
  'แ-': 'สะหระ แอ',
  'โ-ะ': 'สะหระ โอะ',
  'โ-': 'สะหระ โอ',
  'เ-าะ': 'สะหระ เอาะ',
  '-อ': 'สะหระ ออ',
  'เ-อะ': 'สะหระ เออะ',
  'เ-อ': 'สะหระ เออ',
  'เ-ียะ': 'สะหระ เอียะ',
  'เ-ีย': 'สะหระ เอีย',
  'เ-ือะ': 'สะหระ เอือะ',
  'เ-ือ': 'สะหระ เอือ',
  '◌ัวะ': 'สะหระ อัวะ',
  '-ัวะ': 'สะหระ อัวะ',
  '◌ัว': 'สะหระ อัว',
  '-ัว': 'สะหระ อัว',
  '-ำ': 'สะหระ อำ',
  '◌ำ': 'สะหระ อำ',
  'ใ-': 'สะหระ ไอ ไม้ม้วน',
  'ไ-': 'สะหระ ไอ ไม้มลาย',
  'เ-า': 'สะหระ เอา',
  '่': 'ไม้เอก',
  '้': 'ไม้โท',
  '๊': 'ไม้ตรี',
  '๋': 'ไม้จัตวา',
  '์': 'ตัวการันต์',
  'ๆ': 'ไม้ยมก',
  '็': 'ไม้ไต่คู้',
  'ฯ': 'ไปยาลน้อย',
  'ฯลฯ': 'ไปยาลใหญ่',
  '◌ั': 'ไม้หันอากาศ',
  'ั': 'ไม้หันอากาศ',
  'ฤ': 'ตัวรึ',
  'ฤๅ': 'ตัวรือ',
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

    // Check direct map for symbols without parentheses
    if (SPECIAL_AUDIO_MAP[trimmed]) {
      targetText = SPECIAL_AUDIO_MAP[trimmed];
    } else {
      // If text is in the format "ก (ก ไก่)", extract what is inside parentheses ("ก ไก่")
      const parenMatch = trimmed.match(/\(([^)]+)\)/);
      if (parenMatch && parenMatch[1].trim()) {
        targetText = parenMatch[1].trim();
      }
    }

    // Phonetic normalization for vowels:
    // In Thai, "สระ" is a homograph:
    // 1) /sà/ (สะ) = pond/wash
    // 2) /sà-rà/ (สะ-หระ) = vowel
    // Standard TTS speech synthesizers (Google/Apple) default to /sà/ when seeing "สระ",
    // causing vowels like "สระอำ" to blur into /sà-am/ ("sam") or drop the second syllable.
    // Replacing "สระ" with phonetic "สะหระ " guarantees unambiguous pronunciation of "Sara" (sà-rà).
    targetText = targetText
      .replace(/^สระ/g, 'สะหระ ')
      .replace(/\s*สระ([^\s])/g, ' สะหระ $1')
      .replace(/\bสระ\b/g, 'สะหระ')
      .replace(/สะหระ\s*ใอม้วน/g, 'สะหระ ไอ ไม้ม้วน')
      .replace(/สะหระ\s*ไอไม้มลาย/g, 'สะหระ ไอ ไม้มลาย')
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
