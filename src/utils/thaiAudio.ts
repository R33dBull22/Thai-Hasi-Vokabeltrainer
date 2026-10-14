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

/**
 * Plays Thai pronunciation using Web Speech API synthesis
 */
export function speakThai(text: string): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // cancel any ongoing speech

    // Replace slashes or semicolons with commas to create a natural pause without reading punctuation
    const speechText = text
      .replace(/\s*[\/;\n]\s*/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!speechText) return false;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = 'th-TH';
    utterance.rate = 0.85; // slightly slower for better tone discernment
    utterance.pitch = 1.0;

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
    return false;
  }
}
