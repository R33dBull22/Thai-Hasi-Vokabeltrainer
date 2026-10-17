let cachedThaiVoice: SpeechSynthesisVoice | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;

function findThaiVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Exact match 'th-TH'
  let voice = voices.find((v) => v.lang.toLowerCase() === 'th-th');
  if (voice) return voice;

  // 2. Starts with 'th'
  voice = voices.find((v) => v.lang.toLowerCase().startsWith('th'));
  if (voice) return voice;

  // 3. Name or language contains 'thai' or 'th'
  voice = voices.find(
    (v) => v.lang.toLowerCase().includes('th') || v.name.toLowerCase().includes('thai')
  );
  return voice || null;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const updateVoice = () => {
    cachedThaiVoice = findThaiVoice();
  };
  updateVoice();

  try {
    window.speechSynthesis.addEventListener('voiceschanged', updateVoice);
  } catch {}
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = updateVoice;
  }
}

/**
 * Prepares and sanitizes text for Thai speech synthesis:
 * - If text contains Thai script, removes parenthesized Latin annotations (e.g. "(Danke)" or "(sà-baai)")
 * - Replaces slashes and line breaks with comma for natural phrasing
 * - Removes brackets/parentheses so TTS does not read them out loud
 */
export function cleanThaiSpeechText(text: string): string {
  if (!text) return '';

  let cleaned = text.trim();

  // If text contains Thai characters, remove bracketed/parenthesized non-Thai text (e.g. "กิน (to eat)" -> "กิน")
  if (/[ก-๙]/.test(cleaned)) {
    // Remove parenthesized Latin text like (Danke) or (gin)
    cleaned = cleaned.replace(/\([a-zA-Z0-9\s,.\-_/]+\)/g, ' ');
    cleaned = cleaned.replace(/\[[a-zA-Z0-9\s,.\-_/]+\]/g, ' ');
  }

  // Remove parentheses, brackets, and quotes
  cleaned = cleaned.replace(/[\(\)\[\]\{\}"'„“]/g, ' ');

  // Replace slashes, semicolons, and newlines with commas for natural audio pauses
  cleaned = cleaned.replace(/\s*[\/;\n]+\s*/g, ', ');

  // Collapse consecutive whitespaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

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
    // Cancel previous ongoing speech cleanly
    window.speechSynthesis.cancel();

    // Chrome bug workaround: resume if speech engine is in paused state
    if (window.speechSynthesis.paused) {
      try {
        window.speechSynthesis.resume();
      } catch {}
    }

    const speechText = cleanThaiSpeechText(text);
    if (!speechText) return false;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = 'th-TH';

    let rate = 0.85;
    if (typeof onEndOrRate === 'number') {
      rate = onEndOrRate;
    } else if (typeof rateParam === 'number') {
      rate = rateParam;
    }
    utterance.rate = Math.max(0.5, Math.min(rate, 1.5));
    utterance.pitch = 1.0;

    // Retain global reference so V8 GC does not collect active utterance mid-playback
    activeUtterance = utterance;

    utterance.onend = () => {
      activeUtterance = null;
      if (typeof onEndOrRate === 'function') {
        onEndOrRate();
      }
    };

    utterance.onerror = (e) => {
      activeUtterance = null;
      // Do not log routine cancellation errors
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('Speech synthesis error:', e.error);
      }
      if (typeof onEndOrRate === 'function') {
        onEndOrRate();
      }
    };

    // Use cached or freshly looked-up voice
    const voice = findThaiVoice() || cachedThaiVoice;
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || 'th-TH';
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    activeUtterance = null;
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
      activeUtterance = null;
      window.speechSynthesis.cancel();
    } catch {}
  }
}
