import React, { useState, useMemo } from 'react';
import {
  Search,
  Volume2,
  BookOpen,
  Info,
  Check,
  Sparkles,
  HelpCircle,
  Layers,
  ChevronDown,
  ChevronUp,
  X,
  Sliders,
  Palette,
  Type,
} from 'lucide-react';
import {
  THAI_CONSONANTS,
  THAI_VOWELS,
  THAI_TONE_RULES,
  CONSONANT_CLASS_CONFIG,
  ConsonantClass,
  ThaiConsonant,
  ThaiVowel,
} from '../data/thaiAlphabet';
import { speakThai } from '../utils/thaiAudio';
import { THAI_TONES, ThaiTone } from '../utils/thaiTones';
import { ThaiColorWord } from './ThaiColorWord';
import { ToneRulesCheatsheet } from './ToneRulesCheatsheet';

interface ThaiReferenceViewProps {
  colorCodingEnabled?: boolean;
  onToggleColorCoding?: (enabled: boolean) => void;
  onNavigateLearn?: () => void;
  onOpenToneTrainer?: () => void;
  onOpenFontTrainer?: () => void;
}

export const ThaiReferenceView: React.FC<ThaiReferenceViewProps> = ({
  colorCodingEnabled = true,
  onToggleColorCoding,
  onNavigateLearn,
  onOpenToneTrainer,
  onOpenFontTrainer,
}) => {
  const [activeSection, setActiveSection] = useState<'consonants' | 'vowels' | 'tone_rules' | 'cheatsheet'>('consonants');
  const [previewFont, setPreviewFont] = useState<'classic' | 'modern'>('classic');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<'all' | ConsonantClass>('all');
  const [vowelFilter, setVowelFilter] = useState<'all' | 'short' | 'long' | 'special'>('all');
  const [selectedConsonant, setSelectedConsonant] = useState<ThaiConsonant | null>(null);

  // Interactive tone simulator state
  const [simClass, setSimClass] = useState<ConsonantClass>('mid');
  const [simEnding, setSimEnding] = useState<'live' | 'dead_short' | 'dead_long'>('live');
  const [simToneMark, setSimToneMark] = useState<'none' | 'mai_ek' | 'mai_tho' | 'mai_tri' | 'mai_chattawa'>('none');

  // Filtered Consonants
  const filteredConsonants = useMemo(() => {
    return THAI_CONSONANTS.filter((c) => {
      if (selectedClass !== 'all' && c.class !== selectedClass) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchLetter = c.letter.includes(q);
        const matchThai = c.nameThai.toLowerCase().includes(q);
        const matchPhonetic = c.namePhonetic.toLowerCase().includes(q);
        const matchMeaning = c.meaningGerman.toLowerCase().includes(q);
        const matchInitial = c.initialSound.toLowerCase().includes(q);
        const matchFinal = c.finalSound.toLowerCase().includes(q);
        return matchLetter || matchThai || matchPhonetic || matchMeaning || matchInitial || matchFinal;
      }
      return true;
    });
  }, [selectedClass, searchQuery]);

  // Filtered Vowels
  const filteredVowels = useMemo(() => {
    return THAI_VOWELS.filter((v) => {
      if (vowelFilter !== 'all' && v.length !== vowelFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSymbol = v.symbol.includes(q);
        const matchThai = v.nameThai.toLowerCase().includes(q);
        const matchPhonetic = v.phonetic.toLowerCase().includes(q);
        const matchEx = v.exampleWord.includes(q) || v.exampleGerman.toLowerCase().includes(q);
        return matchSymbol || matchThai || matchPhonetic || matchEx;
      }
      return true;
    });
  }, [vowelFilter, searchQuery]);

  // Simulated tone calculation
  const calculatedSimTone = useMemo((): ThaiTone => {
    if (simClass === 'mid') {
      if (simToneMark === 'mai_ek') return 'low';
      if (simToneMark === 'mai_tho') return 'falling';
      if (simToneMark === 'mai_tri') return 'high';
      if (simToneMark === 'mai_chattawa') return 'rising';
      return simEnding === 'live' ? 'mid' : 'low';
    } else if (simClass === 'high') {
      if (simToneMark === 'mai_ek') return 'low';
      if (simToneMark === 'mai_tho') return 'falling';
      return simEnding === 'live' ? 'rising' : 'low';
    } else {
      // Low class
      if (simToneMark === 'mai_ek') return 'falling';
      if (simToneMark === 'mai_tho') return 'high';
      if (simEnding === 'live') return 'mid';
      if (simEnding === 'dead_short') return 'high';
      return 'falling'; // dead_long
    }
  }, [simClass, simEnding, simToneMark]);

  const toneInfo = THAI_TONES[calculatedSimTone];

  return (
    <div className="max-w-md mx-auto px-4 pt-3 pb-32 text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2 mb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Thai-Tafel & Spickzettel</span>
          </h1>
          <p className="text-xs text-[#8E8E93]">
            44 Konsonanten, Vokale & Tonregeln interaktiv
          </p>
        </div>
        {onToggleColorCoding && (
          <button
            type="button"
            onClick={() => onToggleColorCoding(!colorCodingEnabled)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[11px] transition-colors cursor-pointer ${
              colorCodingEnabled
                ? 'bg-amber-400/15 border-amber-400/40 text-amber-300'
                : 'bg-[#242426] border-[#323236] text-[#8E8E93]'
            }`}
            title="Konsonanten nach Klassen farblich hervorheben"
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="font-semibold">{colorCodingEnabled ? 'Farben: An' : 'Farben: Aus'}</span>
          </button>
        )}
      </div>

      {/* Main Section Navigation Bar */}
      <div className="flex items-center gap-1 bg-[#1C1C1E] p-1 rounded-2xl border border-[#2C2C2E] mb-4 overflow-x-auto no-scrollbar touch-scroll overscroll-contain text-xs">
        <button
          type="button"
          onClick={() => setActiveSection('consonants')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-center whitespace-nowrap font-medium transition-colors cursor-pointer ${
            activeSection === 'consonants'
              ? 'bg-[#FF7A00] text-black font-bold shadow-sm'
              : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          Konsonanten (44)
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('vowels')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-center whitespace-nowrap font-medium transition-colors cursor-pointer ${
            activeSection === 'vowels'
              ? 'bg-[#FF7A00] text-black font-bold shadow-sm'
              : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          Vokale (25)
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('tone_rules')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-center whitespace-nowrap font-medium transition-colors cursor-pointer ${
            activeSection === 'tone_rules'
              ? 'bg-[#FF7A00] text-black font-bold shadow-sm'
              : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          Ton-Matrix
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('cheatsheet')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-center whitespace-nowrap font-medium transition-colors cursor-pointer ${
            activeSection === 'cheatsheet'
              ? 'bg-[#FF7A00] text-black font-bold shadow-sm'
              : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          Spickzettel
        </button>
        <button
          type="button"
          onClick={() => onOpenToneTrainer && onOpenToneTrainer()}
          className="flex-1 py-2 px-2.5 rounded-xl text-center whitespace-nowrap font-medium transition-colors cursor-pointer bg-gradient-to-r from-amber-500/15 to-orange-500/20 text-[#FF7A00] hover:text-white border border-[#FF7A00]/40 flex items-center justify-center gap-1 shadow-sm"
          title="Interaktiven Ton-Detektiv Trainer öffnen"
        >
          <span>🥋</span>
          <span className="font-bold">Ton-Detektiv</span>
        </button>
      </div>

      {/* SECTION 1: KONSONANTEN */}
      {activeSection === 'consonants' && (
        <div className="space-y-4">
          {/* Legend Banner: 3 Classes */}
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => setSelectedClass(selectedClass === 'mid' ? 'all' : 'mid')}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                selectedClass === 'mid'
                  ? 'border-amber-400 bg-amber-400/20 text-white font-bold ring-1 ring-amber-400'
                  : 'border-amber-400/30 bg-amber-400/10 text-amber-300 hover:border-amber-400/60'
              }`}
            >
              <span className="block font-bold">Mitte (9)</span>
              <span className="text-[9px] opacity-75">ก จ ด ต บ ป อ ...</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedClass(selectedClass === 'high' ? 'all' : 'high')}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                selectedClass === 'high'
                  ? 'border-emerald-400 bg-emerald-400/20 text-white font-bold ring-1 ring-emerald-400'
                  : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:border-emerald-400/60'
              }`}
            >
              <span className="block font-bold">Hoch (11)</span>
              <span className="text-[9px] opacity-75">ข ฉ ถ ผ ฝ ส ห ...</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedClass(selectedClass === 'low' ? 'all' : 'low')}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                selectedClass === 'low'
                  ? 'border-sky-400 bg-sky-400/20 text-white font-bold ring-1 ring-sky-400'
                  : 'border-sky-400/30 bg-sky-400/10 text-sky-300 hover:border-sky-400/60'
              }`}
            >
              <span className="block font-bold">Tief (24)</span>
              <span className="text-[9px] opacity-75">ค ง ช ซ ท น พ ...</span>
            </button>
          </div>

          {/* Search Input & Font Preview Toggle */}
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E8E93]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Suche Konsonant (z. B. ก, Huhn, gor, kh)..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#242426] rounded-xl text-xs text-white placeholder-[#8E8E93] border border-[#323236] focus:outline-none focus:border-[#FF7A00]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-[#8E8E93] hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Font Preview Switcher & Trainer Launch */}
            <div className="flex items-center justify-between bg-[#1C1C1E] p-2 rounded-xl border border-[#2C2C2E] text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#8E8E93] font-medium">Schrift:</span>
                <div className="flex items-center bg-[#242426] rounded-lg p-0.5 border border-[#323236]">
                  <button
                    type="button"
                    onClick={() => setPreviewFont('classic')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                      previewFont === 'classic'
                        ? 'bg-[#FF7A00] text-black shadow-xs'
                        : 'text-[#8E8E93] hover:text-white'
                    }`}
                  >
                    Klassisch (mit Kopf)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewFont('modern')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                      previewFont === 'modern'
                        ? 'bg-sky-400 text-black shadow-xs'
                        : 'text-[#8E8E93] hover:text-white'
                    }`}
                  >
                    Modern (Kanit)
                  </button>
                </div>
              </div>

              {onOpenFontTrainer && (
                <button
                  type="button"
                  onClick={onOpenFontTrainer}
                  className="px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Type className="w-3 h-3" />
                  <span>Trainer öffnen</span>
                </button>
              )}
            </div>
          </div>

          {/* Consonant Cards Grid */}
          <div className="grid grid-cols-2 gap-2">
            {filteredConsonants.map((c) => {
              const cfg = CONSONANT_CLASS_CONFIG[c.class];
              return (
                <div
                  key={c.letter}
                  onClick={() => setSelectedConsonant(c)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer bg-[#242426] hover:bg-[#2A2A2E] flex flex-col justify-between ${
                    c.isObsolete ? 'opacity-50 border-neutral-700' : cfg.borderClass
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-3xl font-bold ${previewFont === 'modern' ? 'font-thai-kanit' : 'font-thai'} ${cfg.colorClass}`}>
                        {c.letter}
                      </span>
                      <p className="text-xs font-bold text-white mt-0.5">{c.nameThai}</p>
                      <p className="text-[11px] text-[#A1A1AA]">{c.namePhonetic}</p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakThai(c.nameThai);
                      }}
                      className="p-1.5 rounded-full bg-[#1C1C1E] text-[#8E8E93] hover:text-[#FF7A00] transition-colors"
                      title="Aussprache anhören"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#323236]/60 text-[10px] space-y-0.5">
                    <div className="flex items-center justify-between text-[#8E8E93]">
                      <span>Bedeutung:</span>
                      <span className="text-white font-medium truncate max-w-[95px]">
                        {c.meaningGerman}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[#8E8E93]">
                      <span>Laut (An/Aus):</span>
                      <span className="text-amber-300 font-mono">
                        {c.initialSound.split(' ')[0]} / {c.finalSound}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredConsonants.length === 0 && (
            <p className="text-center py-8 text-xs text-[#8E8E93]">
              Kein Konsonant entspricht der aktuellen Suche.
            </p>
          )}
        </div>
      )}

      {/* SECTION 2: VOKALE */}
      {activeSection === 'vowels' && (
        <div className="space-y-4">
          {/* Vowel Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setVowelFilter('all')}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                vowelFilter === 'all'
                  ? 'bg-[#FF7A00] text-black font-bold'
                  : 'bg-[#242426] text-[#8E8E93] border border-[#323236]'
              }`}
            >
              Alle ({THAI_VOWELS.length})
            </button>
            <button
              onClick={() => setVowelFilter('short')}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                vowelFilter === 'short'
                  ? 'bg-rose-500 text-white font-bold'
                  : 'bg-[#242426] text-rose-400 border border-rose-500/30'
              }`}
            >
              Kurz / Tot (คำตาย)
            </button>
            <button
              onClick={() => setVowelFilter('long')}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                vowelFilter === 'long'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'bg-[#242426] text-emerald-400 border border-emerald-500/30'
              }`}
            >
              Lang / Lebend (คำเป็น)
            </button>
            <button
              onClick={() => setVowelFilter('special')}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                vowelFilter === 'special'
                  ? 'bg-purple-500 text-white font-bold'
                  : 'bg-[#242426] text-purple-400 border border-purple-500/30'
              }`}
            >
              Sonderzeichen (-ำ, ใ-, ไ-)
            </button>
          </div>

          {/* Vowels List */}
          <div className="space-y-2">
            {filteredVowels.map((v) => (
              <div
                key={v.symbol}
                className="p-3 bg-[#242426] rounded-2xl border border-[#323236] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => speakThai(v.nameThai)}
                    className="text-2xl font-bold font-thai text-amber-400 min-w-[55px] text-center bg-[#1C1C1E] hover:bg-[#2A2A2D] py-1 px-2 rounded-xl border border-[#3A3A3D] cursor-pointer transition-colors"
                    title={`Vokalname anhören (${v.nameThai})`}
                  >
                    {v.symbol}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => speakThai(v.nameThai)}
                        className="font-bold text-xs text-white hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                        title={`Vokalname anhören (${v.nameThai})`}
                      >
                        <span>{v.nameThai}</span>
                        <Volume2 className="w-3 h-3 text-[#8E8E93]" />
                      </button>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                          v.length === 'short'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : v.length === 'long'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}
                      >
                        {v.length === 'short' ? 'Kurz' : v.length === 'long' ? 'Lang' : 'Sonder'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                      Laut: <span className="text-white font-semibold">{v.phonetic}</span> • Beispiel:{' '}
                      <span className="text-[#FF7A00] font-thai">{v.exampleWord}</span> ({v.exampleGerman})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => speakThai(v.exampleWord)}
                  className="p-2 rounded-full bg-[#1C1C1E] text-[#8E8E93] hover:text-[#FF7A00] shrink-0 transition-colors"
                  title="Beispielwort anhören"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: TON-MATRIX & INTERAKTIVER SIMULATOR */}
      {activeSection === 'tone_rules' && (
        <div className="space-y-4">
          {/* Interactive Ton-Detektiv Call-to-Action */}
          {onOpenToneTrainer && (
            <div className="bg-gradient-to-r from-[#FF7A00]/20 via-[#242426] to-[#242426] p-4 rounded-3xl border border-[#FF7A00]/40 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FF7A00] text-black flex items-center justify-center font-bold text-lg shadow-sm">
                  🥋
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Ton-Detektiv: Tonregeln trainieren</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#FF7A00] text-black font-extrabold uppercase">
                      Quiz
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#A1A1A6]">
                    Wörter sehen, Konsonantenklasse & Tonregeln spielerisch erkennen
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenToneTrainer}
                className="py-2.5 px-3.5 rounded-2xl bg-[#FF7A00] text-black font-bold text-xs hover:bg-[#FF881A] transition-colors shrink-0 shadow-sm active:scale-95 cursor-pointer"
              >
                Trainer starten →
              </button>
            </div>
          )}

          {/* Interactive Tone Simulator Card */}
          <div className="p-4 bg-gradient-to-br from-[#242426] to-[#1C1C1E] rounded-3xl border border-[#3A3A3D] space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Interaktiver Ton-Rechner
              </h2>
              <span className="text-[10px] text-[#8E8E93]">Live-Vorschau</span>
            </div>

            {/* 1. Konsonantenklasse wählen */}
            <div>
              <label className="text-[10px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1.5">
                1. Klasse des Anfangskonsonanten:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setSimClass('mid')}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    simClass === 'mid'
                      ? 'bg-amber-400 text-black border-amber-400'
                      : 'bg-[#1C1C1E] text-amber-400 border-amber-400/30'
                  }`}
                >
                  Mitte (กลาง)
                </button>
                <button
                  type="button"
                  onClick={() => setSimClass('high')}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    simClass === 'high'
                      ? 'bg-emerald-400 text-black border-emerald-400'
                      : 'bg-[#1C1C1E] text-emerald-400 border-emerald-400/30'
                  }`}
                >
                  Hoch (สูง)
                </button>
                <button
                  type="button"
                  onClick={() => setSimClass('low')}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    simClass === 'low'
                      ? 'bg-sky-400 text-black border-sky-400'
                      : 'bg-[#1C1C1E] text-sky-400 border-sky-400/30'
                  }`}
                >
                  Tief (ต่ำ)
                </button>
              </div>
            </div>

            {/* 2. Silbenende / Vokallänge */}
            <div>
              <label className="text-[10px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1.5">
                2. Silbenende (Lebend oder Tot):
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSimEnding('live')}
                  className={`py-2 px-1 text-center rounded-xl border transition-colors cursor-pointer ${
                    simEnding === 'live'
                      ? 'bg-emerald-500 text-black font-bold border-emerald-500'
                      : 'bg-[#1C1C1E] text-[#D1D1D6] border-[#3A3A3D]'
                  }`}
                >
                  <span className="block font-bold">Lebend</span>
                  <span className="text-[9px] opacity-75">Lang / N,M,Ng</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSimEnding('dead_short')}
                  className={`py-2 px-1 text-center rounded-xl border transition-colors cursor-pointer ${
                    simEnding === 'dead_short'
                      ? 'bg-rose-500 text-white font-bold border-rose-500'
                      : 'bg-[#1C1C1E] text-[#D1D1D6] border-[#3A3A3D]'
                  }`}
                >
                  <span className="block font-bold">Tot (Kurz)</span>
                  <span className="text-[9px] opacity-75">Kurz / K,P,T</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSimEnding('dead_long')}
                  className={`py-2 px-1 text-center rounded-xl border transition-colors cursor-pointer ${
                    simEnding === 'dead_long'
                      ? 'bg-rose-600 text-white font-bold border-rose-600'
                      : 'bg-[#1C1C1E] text-[#D1D1D6] border-[#3A3A3D]'
                  }`}
                >
                  <span className="block font-bold">Tot (Lang)</span>
                  <span className="text-[9px] opacity-75">Lang + K,P,T</span>
                </button>
              </div>
            </div>

            {/* 3. Tonzeichen */}
            <div>
              <label className="text-[10px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1.5">
                3. Tonzeichen (วรรณยุกต์):
              </label>
              <div className="grid grid-cols-5 gap-1 text-[11px]">
                {[
                  { id: 'none', label: 'Keines', mark: '—' },
                  { id: 'mai_ek', label: 'Mai Ek', mark: '่' },
                  { id: 'mai_tho', label: 'Mai Tho', mark: '้' },
                  { id: 'mai_tri', label: 'Mai Tri', mark: '๊' },
                  { id: 'mai_chattawa', label: 'Chattawa', mark: '๋' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSimToneMark(m.id as any)}
                    className={`min-w-0 p-1.5 text-center rounded-xl border transition-colors cursor-pointer ${
                      simToneMark === m.id
                        ? 'bg-[#FF7A00] text-black font-bold border-[#FF7A00]'
                        : 'bg-[#1C1C1E] text-[#A1A1AA] border-[#3A3A3D]'
                    }`}
                  >
                    <span className="block text-sm font-thai font-bold">{m.mark}</span>
                    <span className="text-[9px] block truncate">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Result Display */}
            <div
              className={`p-3.5 rounded-2xl border text-center flex items-center justify-between gap-3 ${toneInfo.bgClass} ${toneInfo.borderClass}`}
            >
              <div className="text-left">
                <span className="text-[10px] uppercase tracking-wider opacity-75 block">
                  Ergebnis-Ton:
                </span>
                <span className={`text-base font-bold ${toneInfo.colorClass}`}>
                  {toneInfo.germanName} ({toneInfo.name.split(' ')[0]})
                </span>
                <p className="text-[11px] text-[#D1D1D6]">{toneInfo.description}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 border ${toneInfo.bgClass} ${toneInfo.colorClass} ${toneInfo.borderClass}`}
              >
                {toneInfo.symbol}
              </div>
            </div>
          </div>

          {/* Full Rules Reference Sections */}
          <div className="space-y-3">
            {THAI_TONE_RULES.map((ruleSet) => (
              <div
                key={ruleSet.class}
                className="bg-[#242426] rounded-2xl p-4 border border-[#323236] space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-white">{ruleSet.classNameGerman}</h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      CONSONANT_CLASS_CONFIG[ruleSet.class].bgClass
                    } ${CONSONANT_CLASS_CONFIG[ruleSet.class].colorClass}`}
                  >
                    {ruleSet.class}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {ruleSet.rules.map((r, idx) => {
                    const t = THAI_TONES[r.tone];
                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-[#1C1C1E] border border-[#2E2E32] flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-[#D1D1D6] text-[11px] leading-tight">{r.condition}</p>
                          <p className="text-[10px] text-[#8E8E93] mt-0.5">
                            Bsp.: <span className="text-white font-thai font-semibold">{r.example}</span>{' '}
                            ({r.exampleRom}) – {r.meaning}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-md text-[10px] font-bold shrink-0 border ${t.bgClass} ${t.colorClass} ${t.borderClass}`}
                        >
                          {t.symbol} {t.germanName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: SPICKZETTEL & MERKHILFEN */}
      {activeSection === 'cheatsheet' && (
        <div className="space-y-6 text-xs animate-in fade-in">
          {/* Complete Interactive Tone Rules Cheatsheet */}
          <ToneRulesCheatsheet />

          {/* Traditional School Mnemonics */}
          <div className="pt-2 border-t border-[#2C2C2E] space-y-4">
            <h3 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider">
              Traditionelle thailändische Schul-Merksätze:
            </h3>

            {/* Merksatz 1: Die 9 Mittleren Konsonanten */}
            <div className="bg-[#242426] p-4 rounded-2xl border border-amber-400/40 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <span>🐔</span>
                <h4>Merksatz: Die 9 Mittleren Konsonanten</h4>
              </div>
              <p className="text-[#D1D1D6] text-xs leading-relaxed">
                In thailändischen Schulen lernt jedes Kind diesen Merkvers für die 9 mittleren Zeichen:
              </p>
              <div className="p-3 bg-[#1C1C1E] rounded-xl border border-[#3A3A3D] space-y-1 font-thai text-sm text-amber-300">
                <p className="font-bold">ไก่ จิก เด็ก ตาย เด็ก ตาย บน ปาก โอ่ง</p>
                <p className="text-xs text-[#8E8E93] font-sans">
                  gài jik dèk dtaai dèk dtaai bon bpàak òhng
                </p>
                <p className="text-[11px] text-[#A1A1AA] font-sans italic">
                  (Das Huhn pickt das Kind tot auf dem Rand des Wassertrogs)
                </p>
              </div>
              <div className="text-[11px] text-[#8E8E93] grid grid-cols-2 gap-1 pt-1">
                <span>• ก = ไก่ (Huhn)</span>
                <span>• จ = จิก (picken)</span>
                <span>• ด, ฎ = เด็ก (Kind)</span>
                <span>• ต, ฏ = ตาย (tot)</span>
                <span>• บ = บน (auf)</span>
                <span>• ป = ปาก (Mund/Rand)</span>
                <span>• อ = โอ่ง (Wassertrog)</span>
              </div>
            </div>
            <div className="text-[11px] text-[#8E8E93] grid grid-cols-2 gap-1 pt-1">
              <span>• ก = ไก่ (Huhn)</span>
              <span>• จ = จิก (picken)</span>
              <span>• ด, ฎ = เด็ก (Kind)</span>
              <span>• ต, ฏ = ตาย (tot)</span>
              <span>• บ = บน (auf)</span>
              <span>• ป = ปาก (Mund/Rand)</span>
              <span>• อ = โอ่ง (Wassertrog)</span>
            </div>
          </div>

          {/* Merksatz 2: Lebend vs. Tot (คำเป็น / คำตาย) */}
          <div className="bg-[#242426] p-4 rounded-2xl border border-[#323236] space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <span>💀</span>
              <span>Wann ist eine Silbe „Tot“ (คำตาย) oder „Lebend“ (คำเป็น)?</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-1">
                <span className="font-bold text-rose-400 block text-xs">Tote Silbe (K-P-T)</span>
                <p className="text-[#D1D1D6] leading-tight">
                  Merke dir das Wort <span className="font-bold text-rose-300">„KOBAT / กบด“</span>:
                </p>
                <ul className="list-disc pl-3 text-[#A1A1AA] space-y-0.5">
                  <li>Endet auf k, p oder t (Stopp-Laut)</li>
                  <li>Oder offene Silbe mit kurzem Vokal (z. B. มะ, กะ)</li>
                  <li>Klingt abgehackt und stirbt sofort</li>
                </ul>
              </div>

              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-1">
                <span className="font-bold text-emerald-400 block text-xs">Lebende Silbe (N-M-Y)</span>
                <p className="text-[#D1D1D6] leading-tight">
                  Merke dir das Wort <span className="font-bold text-emerald-300">„NOM-YUANG / นมยวง“</span>:
                </p>
                <ul className="list-disc pl-3 text-[#A1A1AA] space-y-0.5">
                  <li>Endet auf n, m, ng, y oder w (Nasal/Gleitlaut)</li>
                  <li>Oder offene Silbe mit langem Vokal (z. B. มา, ดี)</li>
                  <li>Klang kann summen und weiterklingen</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Merksatz 3: Stumme Tonführer (ห นำ) */}
          <div className="bg-[#242426] p-4 rounded-2xl border border-[#323236] space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <span>🪄</span>
              <span>Das stumme „H“ als Tonführer (ห นำ)</span>
            </h3>
            <p className="text-[#D1D1D6] text-xs leading-relaxed">
              Wenn das Zeichen <span className="font-thai font-bold text-emerald-400 text-sm">ห</span> (hoher Konsonant) vor einem tiefen Konsonanten (wie ม, น, ล, ว, ย) steht, wird es <span className="underline">nicht gesprochen</span>, verwandelt den tiefen Konsonanten aber regeltechnisch in einen <span className="text-emerald-400 font-bold">hohen Konsonanten</span>!
            </p>
            <div className="p-2.5 bg-[#1C1C1E] rounded-xl border border-[#3A3A3D] text-[11px] text-[#A1A1AA] space-y-1">
              <p>• <span className="text-white font-thai font-semibold">หมอ</span> = mò̜o (Arzt) ➔ tiefer Ton statt fallend!</p>
              <p>• <span className="text-white font-thai font-semibold">หนึ่ง</span> = nùeng (eins) ➔ tiefer Ton!</p>
              <p>• <span className="text-white font-thai font-semibold">ใหม่</span> = mài (neu) ➔ tiefer Ton!</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Consonant Detail View */}
      {selectedConsonant && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-safe pb-safe bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedConsonant(null)}
        >
          <div
            className="bg-[#1C1C1E] border border-[#3A3A3D] rounded-3xl p-5 w-full max-w-sm max-h-[88vh] overflow-y-auto overscroll-contain touch-scroll text-white shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#2C2C2E] pb-3">
              <div className="flex items-center gap-3">
                <span
                  className={`text-5xl font-bold font-thai ${
                    CONSONANT_CLASS_CONFIG[selectedConsonant.class].colorClass
                  }`}
                >
                  {selectedConsonant.letter}
                </span>
                <div>
                  <h3 className="text-lg font-bold">{selectedConsonant.nameThai}</h3>
                  <p className="text-xs text-[#A1A1AA]">{selectedConsonant.namePhonetic}</p>
                  <span
                    className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      CONSONANT_CLASS_CONFIG[selectedConsonant.class].bgClass
                    } ${CONSONANT_CLASS_CONFIG[selectedConsonant.class].colorClass} ${
                      CONSONANT_CLASS_CONFIG[selectedConsonant.class].borderClass
                    }`}
                  >
                    {CONSONANT_CLASS_CONFIG[selectedConsonant.class].labelGerman}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedConsonant(null)}
                className="w-7 h-7 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#8E8E93] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {/* Dual Font Comparison: Classic vs Modern */}
              <div className="flex items-center justify-around p-2.5 bg-[#242426] rounded-xl border border-[#323236]">
                <div className="text-center">
                  <span className="text-3xl font-thai-classic text-white block">
                    {selectedConsonant.letter}
                  </span>
                  <span className="text-[9px] text-[#8E8E93]">Klassisch (mit Kopf)</span>
                </div>
                <span className="text-sm text-[#71717A]">➔</span>
                <div className="text-center">
                  <span className="text-3xl font-thai-kanit text-[#FF7A00] font-bold block">
                    {selectedConsonant.letter}
                  </span>
                  <span className="text-[9px] text-[#FF7A00]">Modern (Kanit)</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#242426] rounded-xl border border-[#323236]">
                <span className="text-[#8E8E93]">Deutsche Bedeutung:</span>
                <span className="font-semibold text-white">{selectedConsonant.meaningGerman}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#242426] rounded-xl border border-[#323236]">
                <span className="text-[#8E8E93]">Aussprache als Anfangslaut:</span>
                <span className="font-semibold text-amber-400 font-mono">
                  {selectedConsonant.initialSound}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#242426] rounded-xl border border-[#323236]">
                <span className="text-[#8E8E93]">Aussprache als Endlaut:</span>
                <span className="font-semibold text-amber-400 font-mono">
                  {selectedConsonant.finalSound}
                </span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed pt-1">
                {CONSONANT_CLASS_CONFIG[selectedConsonant.class].description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => speakThai(selectedConsonant.nameThai)}
              className="w-full py-3 rounded-full bg-[#FF7A00] text-black font-semibold text-xs hover:bg-[#FF881A] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <Volume2 className="w-4 h-4" />
              <span>Aussprache „{selectedConsonant.nameThai}“ abspielen</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
