import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Volume2,
  Sparkles,
  Zap,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  Layers,
  Eye,
  Sliders,
  Type,
  SplitSquareVertical,
  Compass,
  MapPin,
  Check,
  ChevronRight,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { speakThai } from '../utils/thaiAudio';
import { ThaiColorWord } from './ThaiColorWord';
import {
  THAI_FONTS,
  TRICKY_PAIRS,
  REAL_WORLD_SIGNS,
  CONSONANTS_FONT_GUIDE,
  ThaiFontId,
  TrickyPair,
  RealWorldSign,
  ConsonantFontClue,
} from '../data/thaiFontsData';

interface ThaiFontTrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  colorCodingEnabled?: boolean;
}

type TabMode = 'explorer' | 'tricky_pairs' | 'quiz_chars' | 'quiz_signs';

export const ThaiFontTrainerModal: React.FC<ThaiFontTrainerModalProps> = ({
  isOpen,
  onClose,
  colorCodingEnabled = true,
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>('explorer');

  // Explorer State
  const [selectedClassicFont, setSelectedClassicFont] = useState<ThaiFontId>('sarabun');
  const [selectedModernFont, setSelectedModernFont] = useState<ThaiFontId>('kanit');
  const [explorerFilter, setExplorerFilter] = useState<'tricky' | 'all' | 'signs' | 'custom'>('tricky');
  const [customWord, setCustomWord] = useState('สวัสดีครับ');
  const [compareViewMode, setCompareViewMode] = useState<'side_by_side' | 'morph'>('side_by_side');
  const [selectedTrickyPair, setSelectedTrickyPair] = useState<TrickyPair | null>(TRICKY_PAIRS[0]);

  // Quiz: Characters State
  const [charQuizIndex, setCharQuizIndex] = useState(0);
  const [charQuizFont, setCharQuizFont] = useState<ThaiFontId>('kanit');
  const [charQuizAnswer, setCharQuizAnswer] = useState<string | null>(null);
  const [charQuizStreak, setCharQuizStreak] = useState(0);
  const [charQuizScore, setCharQuizScore] = useState({ correct: 0, total: 0 });

  // Quiz: Real-world Signs State
  const [signQuizIndex, setSignQuizIndex] = useState(0);
  const [signQuizFont, setSignQuizFont] = useState<ThaiFontId>('kanit');
  const [signQuizAnswer, setSignQuizAnswer] = useState<string | null>(null);
  const [signQuizStreak, setSignQuizStreak] = useState(0);
  const [signQuizScore, setSignQuizScore] = useState({ correct: 0, total: 0 });

  // Shuffled pools for quizzes
  const shuffledChars = useMemo(() => {
    return [...CONSONANTS_FONT_GUIDE].sort(() => 0.5 - Math.random());
  }, []);

  const shuffledSigns = useMemo(() => {
    return [...REAL_WORLD_SIGNS].sort(() => 0.5 - Math.random());
  }, []);

  const currentCharTarget = shuffledChars[charQuizIndex % shuffledChars.length];
  const currentSignTarget = shuffledSigns[signQuizIndex % shuffledSigns.length];

  // Options for Character Quiz: 4 options
  const charOptions = useMemo(() => {
    if (!currentCharTarget) return [];
    const others = CONSONANTS_FONT_GUIDE.filter((c) => c.letter !== currentCharTarget.letter);
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
    return [currentCharTarget, ...shuffledOthers].sort(() => 0.5 - Math.random());
  }, [currentCharTarget]);

  // Options for Sign Quiz: 4 meanings
  const signOptions = useMemo(() => {
    if (!currentSignTarget) return [];
    const others = REAL_WORLD_SIGNS.filter((s) => s.id !== currentSignTarget.id);
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
    return [currentSignTarget, ...shuffledOthers].sort(() => 0.5 - Math.random());
  }, [currentSignTarget]);

  if (!isOpen) return null;

  const classicFontClass = THAI_FONTS[selectedClassicFont].fontClass;
  const modernFontClass = THAI_FONTS[selectedModernFont].fontClass;

  // Handle Char Quiz Answer
  const handleCharAnswer = (chosenLetter: string) => {
    if (charQuizAnswer !== null) return;
    setCharQuizAnswer(chosenLetter);
    const isCorrect = chosenLetter === currentCharTarget.letter;
    if (isCorrect) {
      setCharQuizStreak((s) => s + 1);
      setCharQuizScore((prev) => ({ correct: prev.correct + 1, total: prev.total + 1 }));
      if ((charQuizStreak + 1) % 5 === 0) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      }
    } else {
      setCharQuizStreak(0);
      setCharQuizScore((prev) => ({ ...prev, total: prev.total + 1 }));
    }
  };

  const handleNextCharQuiz = () => {
    setCharQuizAnswer(null);
    setCharQuizIndex((i) => i + 1);
  };

  // Handle Sign Quiz Answer
  const handleSignAnswer = (chosenId: string) => {
    if (signQuizAnswer !== null) return;
    setSignQuizAnswer(chosenId);
    const isCorrect = chosenId === currentSignTarget.id;
    if (isCorrect) {
      setSignQuizStreak((s) => s + 1);
      setSignQuizScore((prev) => ({ correct: prev.correct + 1, total: prev.total + 1 }));
      if ((signQuizStreak + 1) % 5 === 0) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      }
    } else {
      setSignQuizStreak(0);
      setSignQuizScore((prev) => ({ ...prev, total: prev.total + 1 }));
    }
  };

  const handleNextSignQuiz = () => {
    setSignQuizAnswer(null);
    setSignQuizIndex((i) => i + 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121214] text-white flex flex-col justify-between overflow-hidden">
      {/* Top Header */}
      <div className="bg-[#1C1C1E] border-b border-[#2C2C2E] px-4 pt-safe pb-3 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF7A00] to-[#E06000] text-black flex items-center justify-center font-bold shadow-md shrink-0">
            <Type className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                Schriftarten-Trainer
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] font-bold border border-[#FF7A00]/40">
                Klassisch ↔ Modern
              </span>
            </div>
            <p className="text-[11px] text-[#8E8E93]">
              Kringel (มีหัว) vs. Loopless (ไม่มีหัว) meistern
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-[#242426] text-[#8E8E93] hover:text-white hover:bg-[#2C2C2E] transition-colors cursor-pointer"
          aria-label="Schließen"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="bg-[#18181A] border-b border-[#2C2C2E] px-3 py-2 shrink-0">
        <div className="max-w-xl mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-scroll overscroll-contain">
          <button
            onClick={() => setActiveTab('explorer')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'explorer'
                ? 'bg-[#FF7A00] text-black shadow-md'
                : 'bg-[#242426] text-[#8E8E93] hover:text-white border border-[#323236]'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Labor & Vergleich</span>
          </button>

          <button
            onClick={() => setActiveTab('tricky_pairs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'tricky_pairs'
                ? 'bg-[#FF7A00] text-black shadow-md'
                : 'bg-[#242426] text-[#8E8E93] hover:text-white border border-[#323236]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>10 Verwechslungsfallen</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz_chars')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'quiz_chars'
                ? 'bg-[#FF7A00] text-black shadow-md'
                : 'bg-[#242426] text-[#8E8E93] hover:text-white border border-[#323236]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Buchstaben-Quiz</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz_signs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'quiz_signs'
                ? 'bg-[#FF7A00] text-black shadow-md'
                : 'bg-[#242426] text-[#8E8E93] hover:text-white border border-[#323236]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Bangkok-Schilder</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto touch-scroll overscroll-contain p-4 max-w-xl mx-auto w-full space-y-4">
        {/* ==================== TAB 1: EXPLORER LABOR ==================== */}
        {activeTab === 'explorer' && (
          <div className="space-y-4">
            {/* Top Font Selectors */}
            <div className="bg-[#1C1C1E] rounded-2xl p-3.5 border border-[#2C2C2E] shadow-sm">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#FF7A00]" />
                  <span>Schriften konfigurieren</span>
                </span>
                <div className="flex items-center gap-1 bg-[#242426] p-0.5 rounded-lg border border-[#323236]">
                  <button
                    onClick={() => setCompareViewMode('side_by_side')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                      compareViewMode === 'side_by_side'
                        ? 'bg-[#FF7A00] text-black'
                        : 'text-[#8E8E93] hover:text-white'
                    }`}
                  >
                    Split
                  </button>
                  <button
                    onClick={() => setCompareViewMode('morph')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                      compareViewMode === 'morph'
                        ? 'bg-[#FF7A00] text-black'
                        : 'text-[#8E8E93] hover:text-white'
                    }`}
                  >
                    Schieberegler
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Classic Font Select */}
                <div className="bg-[#242426] p-2.5 rounded-xl border border-[#323236]">
                  <span className="block text-[10px] text-[#8E8E93] mb-1 font-medium">
                    Klassisch (mit Kopf):
                  </span>
                  <select
                    value={selectedClassicFont}
                    onChange={(e) => setSelectedClassicFont(e.target.value as ThaiFontId)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3D] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF7A00]"
                  >
                    <option value="sarabun">Sarabun (Behördenstandard)</option>
                    <option value="noto_serif">Noto Serif (Traditionell)</option>
                  </select>
                </div>

                {/* Modern Font Select */}
                <div className="bg-[#242426] p-2.5 rounded-xl border border-[#323236]">
                  <span className="block text-[10px] text-[#8E8E93] mb-1 font-medium">
                    Modern (ohne Kopf):
                  </span>
                  <select
                    value={selectedModernFont}
                    onChange={(e) => setSelectedModernFont(e.target.value as ThaiFontId)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3D] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF7A00]"
                  >
                    <option value="kanit">Kanit (BTS & Schilder)</option>
                    <option value="prompt">Prompt (Geometrisch Clean)</option>
                    <option value="mitr">Mitr (Sanft abgerundet)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
              <button
                onClick={() => setExplorerFilter('tricky')}
                className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
                  explorerFilter === 'tricky'
                    ? 'bg-[#FF7A00] text-black shadow-sm'
                    : 'bg-[#1C1C1E] text-[#8E8E93] border border-[#2C2C2E] hover:text-white'
                }`}
              >
                Fallen ({TRICKY_PAIRS.length})
              </button>
              <button
                onClick={() => setExplorerFilter('all')}
                className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
                  explorerFilter === 'all'
                    ? 'bg-[#FF7A00] text-black shadow-sm'
                    : 'bg-[#1C1C1E] text-[#8E8E93] border border-[#2C2C2E] hover:text-white'
                }`}
              >
                Alle 44 Konsonanten
              </button>
              <button
                onClick={() => setExplorerFilter('signs')}
                className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
                  explorerFilter === 'signs'
                    ? 'bg-[#FF7A00] text-black shadow-sm'
                    : 'bg-[#1C1C1E] text-[#8E8E93] border border-[#2C2C2E] hover:text-white'
                }`}
              >
                Schilder ({REAL_WORLD_SIGNS.length})
              </button>
              <button
                onClick={() => setExplorerFilter('custom')}
                className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
                  explorerFilter === 'custom'
                    ? 'bg-[#FF7A00] text-black shadow-sm'
                    : 'bg-[#1C1C1E] text-[#8E8E93] border border-[#2C2C2E] hover:text-white'
                }`}
              >
                Eigenes Wort ✍️
              </button>
            </div>

            {/* Custom Word Input when 'custom' is active */}
            {explorerFilter === 'custom' && (
              <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E] space-y-3">
                <label className="block text-xs font-semibold text-white">
                  Tippe oder füge ein beliebiges Thai-Wort ein:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customWord}
                    onChange={(e) => setCustomWord(e.target.value)}
                    placeholder="สวัสดี..."
                    className="flex-1 bg-[#242426] border border-[#3A3A3D] rounded-xl px-3 py-2 text-base text-white focus:outline-none focus:border-[#FF7A00] font-thai"
                  />
                  <button
                    onClick={() => speakThai(customWord)}
                    className="p-2.5 rounded-xl bg-[#242426] border border-[#3A3A3D] text-[#FF7A00] hover:bg-[#2E2E32]"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Render Custom Word in all 5 Fonts side by side */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider block">
                    Direktvergleich in allen 5 Schriften:
                  </span>
                  {(Object.keys(THAI_FONTS) as ThaiFontId[]).map((fid) => {
                    const f = THAI_FONTS[fid];
                    return (
                      <div
                        key={fid}
                        className="bg-[#242426] p-3 rounded-xl border border-[#323236] flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{f.name}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                f.category === 'classic'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}
                            >
                              {f.category === 'classic' ? 'mit Kopf' : 'ohne Kopf'}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#8E8E93]">{f.popularUsage}</span>
                        </div>
                        <div className={`text-2xl font-medium text-white ${f.fontClass}`}>
                          {customWord || '—'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tricky Pairs List */}
            {explorerFilter === 'tricky' && (
              <div className="space-y-3">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-amber-200">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Tippe auf ein Paar, um die Erkennungs-Geheimtipps und Alltagsbeispiele zu sehen!
                  </p>
                </div>

                {TRICKY_PAIRS.map((pair) => {
                  const isSelected = selectedTrickyPair?.id === pair.id;
                  return (
                    <div
                      key={pair.id}
                      onClick={() => setSelectedTrickyPair(isSelected ? null : pair)}
                      className={`rounded-2xl p-4 border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#242426] border-[#FF7A00] shadow-lg shadow-[#FF7A00]/5'
                          : 'bg-[#1C1C1E] border-[#2C2C2E] hover:border-[#3E3E42]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-white">{pair.title}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakThai(`${pair.letterA} ${pair.letterB}`);
                          }}
                          className="p-1 text-[#8E8E93] hover:text-[#FF7A00]"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Side by side display of the two letters in classic vs modern */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {/* Letter A */}
                        <div className="bg-[#18181A] rounded-xl p-3 border border-[#2E2E32] text-center">
                          <span className="text-[10px] text-[#8E8E93] font-semibold block mb-1">
                            {pair.nameA}
                          </span>
                          <div className="flex items-center justify-center gap-4 py-1">
                            <div>
                              <span className={`text-3xl text-white ${classicFontClass}`}>
                                {pair.letterA}
                              </span>
                              <span className="block text-[9px] text-[#8E8E93] mt-0.5">Klassisch</span>
                            </div>
                            <span className="text-[#8E8E93] font-light">➔</span>
                            <div>
                              <span className={`text-3xl text-[#FF7A00] ${modernFontClass}`}>
                                {pair.letterA}
                              </span>
                              <span className="block text-[9px] text-[#FF7A00] mt-0.5">Modern</span>
                            </div>
                          </div>
                          {pair.latinLookalikeA && (
                            <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                              Wirkt wie: <strong>{pair.latinLookalikeA}</strong>
                            </span>
                          )}
                        </div>

                        {/* Letter B */}
                        <div className="bg-[#18181A] rounded-xl p-3 border border-[#2E2E32] text-center">
                          <span className="text-[10px] text-[#8E8E93] font-semibold block mb-1">
                            {pair.nameB}
                          </span>
                          <div className="flex items-center justify-center gap-4 py-1">
                            <div>
                              <span className={`text-3xl text-white ${classicFontClass}`}>
                                {pair.letterB}
                              </span>
                              <span className="block text-[9px] text-[#8E8E93] mt-0.5">Klassisch</span>
                            </div>
                            <span className="text-[#8E8E93] font-light">➔</span>
                            <div>
                              <span className={`text-3xl text-[#FF7A00] ${modernFontClass}`}>
                                {pair.letterB}
                              </span>
                              <span className="block text-[9px] text-[#FF7A00] mt-0.5">Modern</span>
                            </div>
                          </div>
                          {pair.latinLookalikeB && (
                            <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                              Wirkt wie: <strong>{pair.latinLookalikeB}</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Detail Drawer if selected */}
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-[#323236] text-xs space-y-2.5">
                          <p className="text-[#D1D1D6] leading-relaxed">
                            <strong className="text-[#FF7A00]">Warum verwirrend? </strong>
                            {pair.whyConfusing}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            <div className="p-2 rounded-lg bg-[#242426] border border-[#2E2E32]">
                              <span className="font-bold text-white block mb-0.5">Erkennen von {pair.letterA}:</span>
                              <p className="text-[#A1A1AA]">{pair.clueA}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-[#242426] border border-[#2E2E32]">
                              <span className="font-bold text-white block mb-0.5">Erkennen von {pair.letterB}:</span>
                              <p className="text-[#A1A1AA]">{pair.clueB}</p>
                            </div>
                          </div>

                          {/* Words example */}
                          <div className="pt-1">
                            <span className="text-[10px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1">
                              Beispiele im modernen {THAI_FONTS[selectedModernFont].name}:
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                {pair.examplesA.map((ex, i) => (
                                  <div
                                    key={i}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      speakThai(ex.thai);
                                    }}
                                    className="p-1.5 rounded-lg bg-[#18181A] hover:bg-[#202024] flex items-center justify-between cursor-pointer"
                                  >
                                    <span className={`text-base text-white ${modernFontClass}`}>
                                      {ex.thai}
                                    </span>
                                    <span className="text-[10px] text-[#8E8E93] text-right truncate">
                                      {ex.de}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              <div className="space-y-1">
                                {pair.examplesB.map((ex, i) => (
                                  <div
                                    key={i}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      speakThai(ex.thai);
                                    }}
                                    className="p-1.5 rounded-lg bg-[#18181A] hover:bg-[#202024] flex items-center justify-between cursor-pointer"
                                  >
                                    <span className={`text-base text-white ${modernFontClass}`}>
                                      {ex.thai}
                                    </span>
                                    <span className="text-[10px] text-[#8E8E93] text-right truncate">
                                      {ex.de}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* All 44 Consonants Grid */}
            {explorerFilter === 'all' && (
              <div className="space-y-3">
                <p className="text-xs text-[#8E8E93]">
                  Hier siehst du alle 44 Konsonanten im direkten Gegenüberstellungs-Modus ({THAI_FONTS[selectedClassicFont].name} vs. {THAI_FONTS[selectedModernFont].name}):
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CONSONANTS_FONT_GUIDE.map((item) => (
                    <div
                      key={item.letter}
                      onClick={() => speakThai(item.nameThai)}
                      className="bg-[#1C1C1E] rounded-xl p-3 border border-[#2C2C2E] hover:border-[#FF7A00] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-[#8E8E93] group-hover:text-white">
                          {item.nameRom}
                        </span>
                        <Volume2 className="w-3 h-3 text-[#71717A] group-hover:text-[#FF7A00]" />
                      </div>

                      <div className="flex items-center justify-around py-1">
                        <div className="text-center">
                          <span className={`text-2xl text-white ${classicFontClass}`}>
                            {item.letter}
                          </span>
                          <span className="block text-[8px] text-[#71717A]">Klassisch</span>
                        </div>
                        <span className="text-[#3A3A3D]">|</span>
                        <div className="text-center">
                          <span className={`text-2xl text-[#FF7A00] ${modernFontClass}`}>
                            {item.letter}
                          </span>
                          <span className="block text-[8px] text-[#FF7A00]/80">Modern</span>
                        </div>
                      </div>

                      <p className="text-[9px] text-[#A1A1AA] mt-1.5 line-clamp-2 leading-tight">
                        {item.modernTip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Signs List */}
            {explorerFilter === 'signs' && (
              <div className="space-y-3">
                <p className="text-xs text-[#8E8E93]">
                  Echte thailändische Schilder aus Bangkok und dem Alltag:
                </p>

                <div className="grid grid-cols-1 gap-2.5">
                  {REAL_WORLD_SIGNS.map((sign) => (
                    <div
                      key={sign.id}
                      onClick={() => speakThai(sign.thai)}
                      className="bg-[#1C1C1E] rounded-2xl p-3.5 border border-[#2C2C2E] hover:border-[#3A3A3D] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#242426] text-[#A1A1AA] border border-[#323236]">
                          {sign.category}
                        </span>
                        <span className="text-xs text-[#FF7A00] font-medium flex items-center gap-1">
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{sign.romanization}</span>
                        </span>
                      </div>

                      {/* Realistic Sign Card */}
                      <div className="bg-[#141416] p-3 rounded-xl border border-[#2E2E32] flex items-center justify-between mb-2">
                        <div>
                          <div className={`text-2xl font-bold text-white tracking-wide ${modernFontClass}`}>
                            {sign.thai}
                          </div>
                          <span className="text-xs text-white/90 font-medium mt-0.5 block">
                            {sign.meaningGerman}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className={`text-lg text-[#8E8E93] ${classicFontClass}`}>
                            {sign.thai}
                          </span>
                          <span className="block text-[8px] text-[#71717A]">Klassisch</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                        <strong className="text-emerald-400">Tipp: </strong>
                        {sign.clueModernFont}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 2: 10 VERWECHSLUNGSFALLEN ==================== */}
        {activeTab === 'tricky_pairs' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-amber-500/15 via-[#242426] to-[#FF7A00]/15 rounded-2xl p-4 border border-amber-500/30">
              <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Die 10 Meister-Fallen</span>
              </h2>
              <p className="text-xs text-[#D1D1D6] leading-relaxed">
                Diese Zeichenpaare sehen im modernen kopflosen Font (Loopless) auf Plakaten und Speisekarten extrem ähnlich aus oder ähneln lateinischen Buchstaben (wie d, s, u, o, n). Präge dir die Details ein!
              </p>
            </div>

            <div className="space-y-4">
              {TRICKY_PAIRS.map((pair, idx) => (
                <div
                  key={pair.id}
                  className="bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E] shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#FF7A00] text-black font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-white">{pair.title}</h3>
                    </div>
                    <button
                      onClick={() => speakThai(`${pair.letterA} ... ${pair.letterB}`)}
                      className="p-1.5 rounded-full bg-[#242426] text-[#8E8E93] hover:text-[#FF7A00] transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Visual comparison display */}
                  <div className="grid grid-cols-2 gap-3 bg-[#141416] p-3 rounded-xl border border-[#262629]">
                    <div className="text-center p-2 rounded-lg bg-[#1C1C1E] border border-[#2E2E32]">
                      <span className="text-[11px] font-bold text-white block mb-1">
                        {pair.nameA}
                      </span>
                      <div className="flex items-center justify-center gap-3 py-1">
                        <span className="text-3xl text-[#8E8E93] font-thai-classic">
                          {pair.letterA}
                        </span>
                        <span className="text-xs text-[#52525B]">➔</span>
                        <span className="text-4xl text-[#FF7A00] font-thai-kanit font-bold">
                          {pair.letterA}
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-300 font-medium block mt-1">
                        {pair.soundA}
                      </span>
                    </div>

                    <div className="text-center p-2 rounded-lg bg-[#1C1C1E] border border-[#2E2E32]">
                      <span className="text-[11px] font-bold text-white block mb-1">
                        {pair.nameB}
                      </span>
                      <div className="flex items-center justify-center gap-3 py-1">
                        <span className="text-3xl text-[#8E8E93] font-thai-classic">
                          {pair.letterB}
                        </span>
                        <span className="text-xs text-[#52525B]">➔</span>
                        <span className="text-4xl text-[#FF7A00] font-thai-kanit font-bold">
                          {pair.letterB}
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-300 font-medium block mt-1">
                        {pair.soundB}
                      </span>
                    </div>
                  </div>

                  {/* Clues */}
                  <div className="space-y-2 text-xs">
                    <p className="text-[#D1D1D6] leading-relaxed">
                      <strong className="text-white">Das Geheimnis: </strong>
                      {pair.whyConfusing}
                    </p>

                    <div className="p-2.5 rounded-xl bg-[#242426] border border-[#323236] space-y-1.5">
                      <p className="text-[11px] text-[#A1A1AA]">
                        🔍 <strong className="text-white">{pair.letterA}:</strong> {pair.clueA}
                      </p>
                      <p className="text-[11px] text-[#A1A1AA]">
                        🔍 <strong className="text-white">{pair.letterB}:</strong> {pair.clueB}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: QUIZ BUCHSTABEN ==================== */}
        {activeTab === 'quiz_chars' && (
          <div className="space-y-4">
            {/* Quiz Stats Bar */}
            <div className="bg-[#1C1C1E] rounded-2xl p-3 border border-[#2C2C2E] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#FF7A00]" />
                <span className="text-[#D1D1D6]">
                  Streak: <strong className="text-[#FF7A00]">{charQuizStreak}</strong>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#8E8E93]">
                  Richtig:{' '}
                  <strong className="text-white">
                    {charQuizScore.correct} / {charQuizScore.total}
                  </strong>
                </span>
                <select
                  value={charQuizFont}
                  onChange={(e) => setCharQuizFont(e.target.value as ThaiFontId)}
                  className="bg-[#242426] border border-[#3A3A3D] rounded-lg px-2 py-0.5 text-[11px] text-white focus:outline-none"
                >
                  <option value="kanit">Schrift: Kanit</option>
                  <option value="prompt">Schrift: Prompt</option>
                  <option value="mitr">Schrift: Mitr</option>
                </select>
              </div>
            </div>

            {/* Target Display Card */}
            <div className="bg-[#1C1C1E] rounded-3xl p-6 border border-[#2C2C2E] text-center shadow-lg relative overflow-hidden">
              <span className="text-[11px] text-[#8E8E93] font-semibold uppercase tracking-wider block mb-2">
                Welcher Buchstabe ist das im klassischen Zeichensatz?
              </span>

              {/* Huge Modern Letter */}
              <div className="py-4">
                <span
                  className={`text-8xl sm:text-9xl font-bold text-white tracking-normal drop-shadow-md select-none ${
                    charQuizFont === 'prompt'
                      ? 'font-thai-prompt'
                      : charQuizFont === 'mitr'
                      ? 'font-thai-mitr'
                      : 'font-thai-kanit'
                  }`}
                >
                  {currentCharTarget.letter}
                </span>
              </div>

              <span className="inline-block px-3 py-1 rounded-full bg-[#242426] text-[11px] text-[#A1A1AA] border border-[#323236]">
                Modern ({THAI_FONTS[charQuizFont].name} - ohne Kringelkopf)
              </span>
            </div>

            {/* 4 Answer Options */}
            <div className="grid grid-cols-2 gap-2.5">
              {charOptions.map((opt) => {
                const isSelected = charQuizAnswer === opt.letter;
                const isCorrect = opt.letter === currentCharTarget.letter;
                let btnStyle = 'bg-[#1C1C1E] border-[#2C2C2E] text-white hover:border-[#3E3E42]';

                if (charQuizAnswer !== null) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500/20 border-emerald-500 text-white font-bold';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-500/20 border-rose-500 text-white line-through';
                  } else {
                    btnStyle = 'bg-[#1C1C1E] border-[#2C2C2E] opacity-50 text-[#8E8E93]';
                  }
                }

                return (
                  <button
                    key={opt.letter}
                    onClick={() => handleCharAnswer(opt.letter)}
                    disabled={charQuizAnswer !== null}
                    className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${btnStyle}`}
                  >
                    <span className="text-4xl font-thai-classic">{opt.letter}</span>
                    <span className="text-xs font-semibold text-white">{opt.nameThai}</span>
                    <span className="text-[11px] text-[#8E8E93]">{opt.nameRom}</span>
                  </button>
                );
              })}
            </div>

            {/* Answer Feedback Card */}
            {charQuizAnswer !== null && (
              <div className="p-4 rounded-2xl bg-[#242426] border border-[#323236] space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {charQuizAnswer === currentCharTarget.letter ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm font-bold text-emerald-400">
                          Richtig gelöst!
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-rose-400" />
                        <span className="text-sm font-bold text-rose-400">
                          Nicht ganz! Es ist {currentCharTarget.nameThai}
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => speakThai(currentCharTarget.nameThai)}
                    className="p-1.5 rounded-full bg-[#1C1C1E] text-[#8E8E93] hover:text-[#FF7A00]"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Direct comparison */}
                <div className="p-3 rounded-xl bg-[#1C1C1E] border border-[#2E2E32] flex items-center justify-around">
                  <div className="text-center">
                    <span className="text-3xl text-white font-thai-classic">
                      {currentCharTarget.letter}
                    </span>
                    <span className="block text-[9px] text-[#8E8E93] mt-0.5">Klassisch (mit Kopf)</span>
                  </div>
                  <span className="text-[#8E8E93] font-light">⟷</span>
                  <div className="text-center">
                    <span className="text-3xl text-[#FF7A00] font-thai-kanit">
                      {currentCharTarget.letter}
                    </span>
                    <span className="block text-[9px] text-[#FF7A00] mt-0.5">Modern (Kanit)</span>
                  </div>
                </div>

                <p className="text-xs text-[#D1D1D6] leading-relaxed">
                  <strong className="text-white">Erkennungs-Tipp: </strong>
                  {currentCharTarget.modernTip}
                </p>

                <button
                  onClick={handleNextCharQuiz}
                  className="w-full py-3.5 rounded-xl bg-[#FF7A00] text-black font-semibold text-xs hover:bg-[#FF881A] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Nächster Buchstabe</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 4: QUIZ SCHILDER ==================== */}
        {activeTab === 'quiz_signs' && (
          <div className="space-y-4">
            {/* Quiz Stats Bar */}
            <div className="bg-[#1C1C1E] rounded-2xl p-3 border border-[#2C2C2E] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF7A00]" />
                <span className="text-[#D1D1D6]">
                  Streak: <strong className="text-[#FF7A00]">{signQuizStreak}</strong>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#8E8E93]">
                  Richtig:{' '}
                  <strong className="text-white">
                    {signQuizScore.correct} / {signQuizScore.total}
                  </strong>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#242426] text-[#A1A1AA] border border-[#323236]">
                  {currentSignTarget.category}
                </span>
              </div>
            </div>

            {/* Authentic Street Sign Simulation Box */}
            <div
              className={`rounded-3xl p-6 text-center shadow-xl relative overflow-hidden border ${
                currentSignTarget.signStyle === 'exit_green'
                  ? 'bg-gradient-to-b from-[#0F3822] to-[#0A2617] border-emerald-500/40'
                  : currentSignTarget.signStyle === 'warning_yellow'
                  ? 'bg-gradient-to-b from-[#3B2C05] to-[#241B03] border-amber-500/40 text-amber-100'
                  : currentSignTarget.signStyle === 'prohibition_red'
                  ? 'bg-gradient-to-b from-[#3E1114] to-[#260A0C] border-rose-500/40 text-rose-100'
                  : currentSignTarget.signStyle === 'cafe_warm'
                  ? 'bg-gradient-to-b from-[#2E2015] to-[#1C140D] border-amber-600/40 text-amber-50'
                  : 'bg-gradient-to-b from-[#14233C] to-[#0D1626] border-sky-500/40 text-sky-50'
              }`}
            >
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-75 block mb-2">
                Bangkok Street & Station Sign
              </span>

              {/* Large Modern Thai Sign Text */}
              <div className="py-4">
                <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-thai-kanit drop-shadow-md">
                  {currentSignTarget.thai}
                </h2>
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => speakThai(currentSignTarget.thai)}
                  className="px-3 py-1 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Aussprache</span>
                </button>
              </div>
            </div>

            {/* Question Prompt */}
            <p className="text-xs font-semibold text-[#8E8E93] text-center">
              Was bedeutet dieses thailändische Schild?
            </p>

            {/* 4 Multiple Choice Options */}
            <div className="space-y-2">
              {signOptions.map((opt) => {
                const isSelected = signQuizAnswer === opt.id;
                const isCorrect = opt.id === currentSignTarget.id;
                let btnStyle = 'bg-[#1C1C1E] border-[#2C2C2E] text-white hover:border-[#3E3E42]';

                if (signQuizAnswer !== null) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500/20 border-emerald-500 text-white font-bold';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-500/20 border-rose-500 text-white line-through';
                  } else {
                    btnStyle = 'bg-[#1C1C1E] border-[#2C2C2E] opacity-50 text-[#8E8E93]';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSignAnswer(opt.id)}
                    disabled={signQuizAnswer !== null}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <div>
                      <span className="text-sm font-semibold text-white block">
                        {opt.meaningGerman}
                      </span>
                      <span className="text-[11px] text-[#8E8E93] font-medium">
                        Lautschrift: {opt.romanization}
                      </span>
                    </div>
                    {signQuizAnswer !== null && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sign Feedback Card */}
            {signQuizAnswer !== null && (
              <div className="p-4 rounded-2xl bg-[#242426] border border-[#323236] space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#FF7A00]" />
                    <span>Hintergrund & Entzifferungs-Tipp</span>
                  </span>
                  <span className="text-[11px] text-[#FF7A00] font-mono">
                    {currentSignTarget.romanization}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#1C1C1E] border border-[#2E2E32] flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#8E8E93] block">Klassische Schrift (Sarabun):</span>
                    <span className="text-xl text-white font-thai-classic">
                      {currentSignTarget.thai}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#FF7A00] block">Moderne Schrift (Kanit):</span>
                    <span className="text-xl text-[#FF7A00] font-thai-kanit font-bold">
                      {currentSignTarget.thai}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#D1D1D6] leading-relaxed">
                  <strong className="text-emerald-400">Erkennen: </strong>
                  {currentSignTarget.clueModernFont}
                </p>

                <p className="text-[11px] text-[#8E8E93] italic">
                  📍 {currentSignTarget.notes}
                </p>

                <button
                  onClick={handleNextSignQuiz}
                  className="w-full py-3.5 rounded-xl bg-[#FF7A00] text-black font-semibold text-xs hover:bg-[#FF881A] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Nächstes Schild</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Sticky Status / Actions */}
      <div className="bg-[#1C1C1E] border-t border-[#2C2C2E] px-4 py-3 shrink-0 flex items-center justify-between text-xs pb-safe">
        <span className="text-[#8E8E93]">
          Tipp: In den <strong className="text-white">Optionen</strong> kannst du auch alle normalen Vokabeln auf modern umstellen!
        </span>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-full bg-[#242426] text-white hover:bg-[#2C2C2E] border border-[#3A3A3D] font-medium transition-colors cursor-pointer"
        >
          Schließen
        </button>
      </div>
    </div>
  );
};
