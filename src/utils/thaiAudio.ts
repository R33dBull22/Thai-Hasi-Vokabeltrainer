import { normalizeThai } from './thaiTones';

let currentAudio: HTMLAudioElement | null = null;
let cachedThaiVoice: SpeechSynthesisVoice | null = null;

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const updateVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const thaiVoices = voices.filter((v) => v.lang.startsWith('th') || v.lang.includes('TH'));
    cachedThaiVoice =
      thaiVoices.find((v) => /google|natural|premium|siri|kanya|narisa/i.test(v.name)) ||
      thaiVoices[0] ||
      null;
  };
  updateVoice();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = updateVoice;
  }
}

/**
 * Stops any currently playing Thai audio (both HTML5 Audio and SpeechSynthesis)
 */
export function stopThaiSpeech() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      // ignore
    }
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

function getBestThaiVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const thaiVoices = voices.filter((v) => v.lang.startsWith('th') || v.lang.includes('TH'));
  if (thaiVoices.length === 0) return null;

  return (
    thaiVoices.find((v) => /google|natural|premium|siri|kanya|narisa/i.test(v.name)) ||
    thaiVoices[0]
  );
}

function speakWithSpeechSynthesis(speechText: string, onEnd?: () => void): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = 'th-TH';
    utterance.rate = 0.9; // natural pace preserving tone contours
    utterance.pitch = 1.0;

    const voice = cachedThaiVoice || getBestThaiVoice();
    if (voice) {
      utterance.voice = voice;
    }

    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('Speech synthesis fallback error:', err);
    return false;
  }
}

/**
 * Plays authentic Thai pronunciation using native Thai audio stream with Web Speech fallback.
 * Automatically normalizes Thai text (including decomposed Sara Am and tone marks).
 */
export function speakThai(text: string, onEnd?: () => void): boolean {
  if (typeof window === 'undefined' || !text) {
    return false;
  }

  stopThaiSpeech();

  // Normalize Thai Unicode and clean formatting
  const cleanText = normalizeThai(text)
    .replace(/\s*[\/;\n]\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) return false;

  // 1. Primary Engine: High-Definition native Thai neural audio
  try {
    const encoded = encodeURIComponent(cleanText);
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=th&client=tw-ob&q=${encoded}`;
    const audio = new Audio(audioUrl);
    currentAudio = audio;

    let finished = false;
    const handleFinish = () => {
      if (finished) return;
      finished = true;
      if (currentAudio === audio) {
        currentAudio = null;
      }
      onEnd?.();
    };

    audio.onended = handleFinish;

    audio.onerror = () => {
      // Offline or network block fallback
      if (currentAudio === audio) {
        currentAudio = null;
      }
      speakWithSpeechSynthesis(cleanText, onEnd);
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay policy or playback error fallback
        if (currentAudio === audio) {
          currentAudio = null;
        }
        speakWithSpeechSynthesis(cleanText, onEnd);
      });
    }

    return true;
  } catch (err) {
    console.warn('Native audio play error, falling back to speech synthesis:', err);
    return speakWithSpeechSynthesis(cleanText, onEnd);
  }
}

