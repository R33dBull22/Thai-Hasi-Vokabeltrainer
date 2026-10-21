let cachedThaiVoice: SpeechSynthesisVoice | null = null;
let fallbackAudio: HTMLAudioElement | null = null;

/**
 * Searches for an authentic Thai voice in the browser's speech synthesis engine.
 */
function getThaiVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }
  if (
    cachedThaiVoice &&
    (cachedThaiVoice.lang.startsWith('th') ||
      cachedThaiVoice.lang.includes('TH') ||
      cachedThaiVoice.name.toLowerCase().includes('thai'))
  ) {
    return cachedThaiVoice;
  }
  try {
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const match = voices.find(
        (v) =>
          v.lang.startsWith('th') ||
          v.lang.includes('TH') ||
          v.name.toLowerCase().includes('thai')
      );
      if (match) {
        cachedThaiVoice = match;
        return match;
      }
    }
  } catch {}
  return null;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  getThaiVoice();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      getThaiVoice();
    };
  }
}

/**
 * Normalizes Thai Unicode text:
 * - Fixes malformed vowel + tone mark sequences, especially Sara Am (\u0e33) followed by tone marks:
 *   e.g. นำ้ (\u0e19\u0e33\u0e49) => น้ำ (\u0e19\u0e49\u0e33)
 * - Converts Nikhahit + Sara Aa combinations to proper Sara Am (\u0e33)
 * - Reorders tone marks that were typed before upper/lower vowels
 * - Deduplicates accidental double tone marks
 * - Strips zero-width spaces and invisible control characters
 */
export function normalizeThaiText(text: string): string {
  if (!text) return '';
  // 1. Strip zero-width & invisible control characters first
  let str = text
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .normalize('NFC');

  // 2. Loop up to 3 passes to ensure multi-step composite transformations settle
  for (let round = 0; round < 3; round++) {
    const prev = str;
    str = str
      // Sara Am (\u0e33) followed by tone mark (่ ้ ๊ ๋) or thanthakhat (์):
      // Standard Thai Unicode: Consonant + Tone Mark + Sara Am (\u0e33)
      .replace(/\u0e33([\u0e48-\u0e4c])/g, '$1\u0e33')
      // Nikhahit (\u0e4d) + Tone mark + Sara Aa (\u0e32) => Tone mark + Sara Am
      .replace(/\u0e4d([\u0e48-\u0e4c])\u0e32/g, '$1\u0e33')
      // Tone mark + Nikhahit + Sara Aa => Tone mark + Sara Am
      .replace(/([\u0e48-\u0e4c])\u0e4d\u0e32/g, '$1\u0e33')
      // Nikhahit + Sara Aa without tone => Sara Am
      .replace(/\u0e4d\u0e32/g, '\u0e33')
      // Tone mark before vowel above/below: swap so vowel is directly attached to consonant
      .replace(/([\u0e48-\u0e4c])([\u0e31\u0e34-\u0e39\u0e47])/g, '$2$1')
      // Deduplicate redundant identical tone marks (keep first)
      .replace(/([\u0e48-\u0e4c])[\u0e48-\u0e4c]+/g, '$1');

    if (str === prev) break;
  }

  // 3. Expand Maiyamok (ๆ - Thai duplication mark) to duplicate preceding word for authentic TTS and parsing
  str = str.replace(/([ก-๙]+)\s*ๆ/g, '$1 $1');

  // 4. Clean trailing or isolated Paiyannoi (ฯ) abbreviations so TTS does not stutter
  str = str.replace(/ฯ(?:\s*ล\s*ฯ)?/g, '').replace(/\s+/g, ' ');

  return str.trim();
}

/**
 * Plays online Google Translate TTS audio fallback for Thai with multi-endpoint fallback.
 */
function playThaiAudioFallback(text: string, onEnd?: () => void): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (fallbackAudio) {
      fallbackAudio.pause();
      fallbackAudio.currentTime = 0;
    }
    const cleanQuery = encodeURIComponent(text.slice(0, 120));
    const primaryUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=th&client=tw-ob&q=${cleanQuery}`;
    const secondaryUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=th&client=gtx&q=${cleanQuery}`;

    fallbackAudio = new Audio(primaryUrl);
    let handled = false;
    const safeEnd = () => {
      if (!handled) {
        handled = true;
        if (onEnd) onEnd();
      }
    };

    fallbackAudio.onended = safeEnd;
    fallbackAudio.onerror = () => {
      // Try secondary endpoint if primary encounters an error
      try {
        if (fallbackAudio && fallbackAudio.src !== secondaryUrl) {
          fallbackAudio.src = secondaryUrl;
          fallbackAudio.play().catch(() => {
            safeEnd();
          });
        } else {
          safeEnd();
        }
      } catch {
        safeEnd();
      }
    };

    fallbackAudio.play().catch(() => {
      // If play promise rejects, try secondary endpoint
      try {
        if (fallbackAudio && fallbackAudio.src !== secondaryUrl) {
          fallbackAudio.src = secondaryUrl;
          fallbackAudio.play().catch(() => {
            safeEnd();
          });
        } else {
          safeEnd();
        }
      } catch {
        safeEnd();
      }
    });

    return true;
  } catch {
    if (onEnd) onEnd();
    return false;
  }
}

/**
 * Plays Thai pronunciation using Web Speech API synthesis with automatic Thai Unicode normalization
 * and seamless audio fallback.
 *
 * CRITICAL FIX: If no authentic Thai voice is installed on the user's OS/browser (common on Windows,
 * Linux, and some mobile devices), this function automatically routes to the native online Thai
 * audio stream rather than letting the browser speak with an English or German default voice!
 */
export function speakThai(
  text: string,
  onEndOrRate?: (() => void) | number,
  rateParam: number = 0.85
): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // 1. Normalize Thai Unicode (fixing malformed Sara Am sequences e.g. นำ้ -> น้ำ)
  const normalized = normalizeThaiText(text);

  // 2. Clean speech text: strip parenthetical latin text e.g. "(nám)" or "(Wasser)"
  const speechText = normalized
    .replace(/\([a-zA-Z0-9\säöüÄÖÜßáàâãéèêíìîóòôúùû\-_,.]*\)/g, ' ')
    .replace(/\s*[\/;\n]\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!speechText) return false;

  const callback = typeof onEndOrRate === 'function' ? onEndOrRate : undefined;
  const rate = typeof onEndOrRate === 'number' ? onEndOrRate : (typeof rateParam === 'number' ? rateParam : 0.85);

  // Check if speech synthesis is available AND an authentic Thai voice is present
  const thaiVoice = getThaiVoice();

  // If speechSynthesis is not supported OR NO authentic Thai voice is available,
  // DO NOT allow the browser to use a default German/English voice!
  // Immediately play the native Thai audio stream fallback!
  if (!('speechSynthesis' in window) || !thaiVoice) {
    return playThaiAudioFallback(speechText, callback);
  }

  try {
    window.speechSynthesis.cancel(); // cancel any ongoing speech
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.voice = thaiVoice;
    utterance.lang = thaiVoice.lang || 'th-TH';
    utterance.rate = rate;
    utterance.pitch = 1.0;

    let hasEnded = false;
    const safeEnd = () => {
      if (!hasEnded) {
        hasEnded = true;
        if (callback) callback();
      }
    };

    utterance.onend = safeEnd;
    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error, falling back to audio stream:', e);
      // Fallback to audio element if speech synthesis fails
      playThaiAudioFallback(speechText, safeEnd);
    };

    // Watchdog timer: If utterance gets hung or silently stalls, invoke fallback
    const timer = setTimeout(() => {
      if (!hasEnded) {
        safeEnd();
      }
    }, 4500);

    utterance.addEventListener('end', () => clearTimeout(timer));
    utterance.addEventListener('error', () => clearTimeout(timer));

    // Prevent Chromium garbage collection bug on long utterances
    (window as any)._thaiUtterance = utterance;

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('Speech synthesis error, trying fallback:', err);
    return playThaiAudioFallback(speechText, callback);
  }
}

/**
 * Stops any ongoing Thai speech synthesis and fallback audio
 */
export function stopThaiSpeech(): void {
  if (typeof window !== 'undefined') {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    if (fallbackAudio) {
      try {
        fallbackAudio.pause();
        fallbackAudio.currentTime = 0;
      } catch {}
    }
  }
}
