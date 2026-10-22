import React, { useState } from 'react';
import {
  extractTonesFromRomanization,
  generateRomanizationFromThai,
  getEffectiveRomanization,
  SyllableTone,
  THAI_TONES,
  ThaiTone,
} from '../utils/thaiTones';
import { Info, X } from 'lucide-react';

interface ToneVisualizerProps {
  romanization?: string;
  thai?: string;
  compact?: boolean;
  showHelpIcon?: boolean;
  className?: string;
}

export const ToneVisualizer: React.FC<ToneVisualizerProps> = ({
  romanization,
  thai,
  compact = false,
  showHelpIcon = false,
  className = '',
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  // Derive syllables & tones using canonical effective romanization
  const effectiveRom = getEffectiveRomanization(thai, romanization);
  let syllables: SyllableTone[] = [];
  if (effectiveRom) {
    syllables = extractTonesFromRomanization(effectiveRom);
    // If romanization has no diacritic tone marks at all (every syllable detected as 'mid'),
    // but Thai script is available, prefer the phonetically analyzed tones from Thai!
    if (thai && thai.trim() && syllables.length > 0 && syllables.every((s) => s.tone === 'mid')) {
      const generated = generateRomanizationFromThai(thai);
      if (generated.syllables.some((s) => s.tone !== 'mid')) {
        syllables = generated.syllables;
      }
    }
  } else if (thai && thai.trim()) {
    const generated = generateRomanizationFromThai(thai);
    syllables = generated.syllables;
  }

  if (syllables.length === 0) return null;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 flex-wrap ${className}`}>
        {syllables.map((s, idx) => (
          <span
            key={`${s.syllable}-${idx}`}
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${s.bgClass} ${s.colorClass} ${s.borderClass}`}
            title={`${s.syllable}: ${s.toneName} (${s.toneSymbol})`}
          >
            <span>{s.toneSymbol}</span>
            <span className="text-[9px] opacity-80">{s.toneName}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between flex-wrap gap-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mr-0.5">
            Töne:
          </span>
          {syllables.map((s, idx) => (
            <div
              key={`${s.syllable}-${idx}`}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${s.bgClass} ${s.colorClass} ${s.borderClass}`}
            >
              <span className="font-semibold">{s.syllable}</span>
              <span className="text-[11px] font-bold opacity-90">{s.toneSymbol}</span>
              <span className="text-[10px] uppercase tracking-wider opacity-75">
                {s.toneName}
              </span>
            </div>
          ))}
        </div>

        {showHelpIcon && (
          <button
            type="button"
            onClick={() => setShowExplanation(true)}
            className="p-1 text-[#8E8E93] hover:text-[#FF7A00] transition-colors"
            title="Die 5 thailändischen Töne erklärt"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Modal / Sheet explaining the 5 Thai Tones */}
      {showExplanation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowExplanation(false)}
        >
          <div
            className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl p-5 w-full max-w-sm text-white shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#2C2C2E] mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>🎶 Die 5 thailändischen Töne</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowExplanation(false)}
                className="p-1 rounded-full text-[#8E8E93] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#8E8E93] mb-3">
              Thailändisch ist eine tonale Sprache. Die Tonhöhe und Melodie bestimmen die Bedeutung eines Wortes:
            </p>

            <div className="space-y-2">
              {(['mid', 'low', 'falling', 'high', 'rising'] as ThaiTone[]).map((toneKey) => {
                const info = THAI_TONES[toneKey];
                return (
                  <div
                    key={toneKey}
                    className={`p-2.5 rounded-xl border flex items-center gap-3 ${info.bgClass} ${info.borderClass}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-base ${info.colorClass} bg-black/30 shrink-0`}
                    >
                      {info.symbol}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold ${info.colorClass}`}>
                          {info.germanName}
                        </span>
                        <span className="text-[10px] text-[#8E8E93]">({info.name})</span>
                      </div>
                      <p className="text-[11px] text-[#D1D1D6] mt-0.5 leading-snug">
                        {info.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowExplanation(false)}
              className="w-full mt-4 py-2.5 rounded-full bg-[#FF7A00] text-black font-semibold text-xs hover:bg-[#FFA040] transition-colors"
            >
              Verstanden
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
