import React from 'react';
import { ConsonantClass } from '../data/thaiAlphabet';

const HIGH_CONSONANTS = new Set(['ข', 'ฃ', 'ฉ', 'ฐ', 'ถ', 'ผ', 'ฝ', 'ศ', 'ษ', 'ส', 'ห']);
const MID_CONSONANTS = new Set(['ก', 'จ', 'ฎ', 'ฏ', 'ด', 'ต', 'บ', 'ป', 'อ']);
const LOW_CONSONANTS = new Set([
  'ค', 'ฅ', 'ฆ', 'ง', 'ช', 'ซ', 'ฌ', 'ญ', 'ฑ', 'ฒ', 'ณ', 'ท', 'ธ', 'น',
  'พ', 'ฟ', 'ภ', 'ม', 'ย', 'ร', 'ล', 'ว', 'ฬ', 'ฮ', 'ฤ', 'ฦ',
]);

export function getCharConsonantClass(char: string): ConsonantClass | null {
  if (MID_CONSONANTS.has(char)) return 'mid';
  if (HIGH_CONSONANTS.has(char)) return 'high';
  if (LOW_CONSONANTS.has(char)) return 'low';
  return null;
}

/**
 * Splits Thai text into intact grapheme clusters so that combining
 * vowels (ิ, ี, ึ, ื, ุ, ู, ั, ็) and tone marks (่, ้, ๊, ๋, ์)
 * always stay attached to their base consonant in a single DOM element.
 */
function segmentThaiGraphemes(text: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    try {
      const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
      return Array.from(segmenter.segment(text)).map((s) => s.segment);
    } catch {
      // Fallback below
    }
  }
  // Fallback regex: match base character followed by any attached combining vowels / tone marks
  const matches = text.match(/[\s\S][\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]*/g);
  return matches || Array.from(text);
}

interface ThaiColorWordProps {
  text: string;
  enabled?: boolean;
  className?: string;
  charClassName?: string;
}

export const ThaiColorWord: React.FC<ThaiColorWordProps> = ({
  text,
  enabled = true,
  className = '',
  charClassName = '',
}) => {
  if (!text) return null;
  if (!enabled) {
    return <span className={className}>{text}</span>;
  }

  const clusters = segmentThaiGraphemes(text);

  return (
    <span className={`inline-block tracking-normal ${className}`}>
      {clusters.map((cluster, index) => {
        const baseChar = cluster[0];
        const cls = getCharConsonantClass(baseChar);
        let colorClass = '';

        if (cls === 'mid') {
          colorClass = 'text-amber-400';
        } else if (cls === 'high') {
          colorClass = 'text-emerald-400';
        } else if (cls === 'low') {
          colorClass = 'text-sky-400';
        }

        return (
          <span
            key={`${cluster}-${index}`}
            className={`${colorClass} ${charClassName}`}
          >
            {cluster}
          </span>
        );
      })}
    </span>
  );
};
