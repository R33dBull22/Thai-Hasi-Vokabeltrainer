import { normalizeThai } from './thaiTones';

let cachedThaiVoice: SpeechSynthesisVoice | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Searches available browser voices for the highest quality Thai voice.
 * Prioritizes natural, neural, and provider-specific Thai voices.
 */
function findBestThaiVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const thaiVoices = voices.filter(
    (v) =>
      v.lang.toLowerCase().startsWith('th') ||
      v.lang.toLowerCase().includes('th-') ||
      v.lang.toLowerCase().includes('th_') ||
      /thai/i.test(v.name)
  );

  if (thaiVoices.length === 0) return null;

  // Prioritize enhanced, neural, natural, or recognized vendor Thai voices
  const preferred = thaiVoices.find((v) =>
    /google|natural|premium|enhanced|siri|kanya|narisa|premwadee|niwat/i.test(v.name)
  );

  return preferred || thaiVoices[0];
}

function updateVoiceCache() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    const voices = window.speechSynthesis.getVoices();
    const best = findBestThaiVoice(voices);
    if (best) {
      cachedThaiVoice = best;
    }
  } catch {
    // ignore
  }
}

// Initialize voices listener as early as possible
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  updateVoiceCache();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = updateVoiceCache;
  }
  window.speechSynthesis.addEventListener?.('voiceschanged', updateVoiceCache);
}

/**
 * Prepares Thai text for optimal pronunciation by text-to-speech engines:
 * - Normalizes decomposed Sara Am (e.g. นํ้า -> น้ำ) and misplaced tone marks
 * - Removes non-Thai notes in parentheses e.g. "สบายดี (wie geht es dir)" -> "สบายดี"
 * - Converts dividers (/, ;) into pauses
 * - Strips unneeded non-Thai punctuation
 */
export function prepareThaiForSpeech(text: string): string {
  if (!text) return '';
  let clean = normalizeThai(text);
  // Strip annotations in parentheses like (Hallo) or (stilles Wasser)
  clean = clean.replace(/\([a-zA-ZäöüÄÖÜß\s\d.,!?'-]+\)/g, '');
  // Replace slashes/semicolons/linebreaks with comma for brief acoustic pause
  clean = clean.replace(/\s*[\/;\n]\s*/g, ', ');
  // Clean up non-Thai characters except punctuation
  clean = clean.replace(/[^\u0E00-\u0E7F\s,!?.-]/g, '');
  // Normalize whitespace
  clean = clean.replace(/\s+/g, ' ').trim();
  return clean;
}

/**
 * Stops any currently playing Thai audio immediately
 */
export function stopThaiSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
  activeUtterance = null;
}

/**
 * Synchronous, reliable speech synthesis for Thai language.
 * Executed directly inside user gesture to comply with all browser autoplay and security policies.
 */
export function speakThai(text: string, onEnd?: () => void): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) {
    onEnd?.();
    return false;
  }

  const cleanText = prepareThaiForSpeech(text);
  if (!cleanText) {
    onEnd?.();
    return false;
  }

  try {
    // 1. Resume audio context if the browser synthesis is in a paused state
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // 2. Cancel existing queued utterances
    window.speechSynthesis.cancel();

    // 3. Create utterance
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'th-TH';
    utterance.rate = 0.88; // clear, natural cadence preserving tonal contours
    utterance.pitch = 1.0;

    // 4. Ensure voice selection
    if (!cachedThaiVoice) {
      updateVoiceCache();
    }
    if (cachedThaiVoice) {
      utterance.voice = cachedThaiVoice;
    }

    // 5. Retain reference at module scope to prevent V8 garbage collection bug mid-speech
    activeUtterance = utterance;

    let finished = false;
    const handleFinish = () => {
      if (finished) return;
      finished = true;
      if (activeUtterance === utterance) {
        activeUtterance = null;
      }
      onEnd?.();
    };

    utterance.onend = handleFinish;
    utterance.onerror = () => {
      handleFinish();
    };

    // 6. Speak immediately within the user gesture event loop
    window.speechSynthesis.speak(utterance);

    // Chrome bugfix: Sometimes Chrome needs a resume kick if queued
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    return true;
  } catch (err) {
    console.warn('Speech synthesis error:', err);
    activeUtterance = null;
    onEnd?.();
    return false;
  }
}
