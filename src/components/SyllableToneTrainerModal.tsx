import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Volume2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  Flame,
  Layers,
  Eye,
  BookOpen,
  Shuffle,
  Filter,
  Type,
  ChevronDown,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ThaiTone, THAI_TONES } from '../utils/thaiTones';
import { speakThai } from '../utils/thaiAudio';
import {
  RandomSyllableItem,
  SyllableTrainerFilter,
  generateRandomSyllable,
} from '../data/randomSyllables';

interface SyllableToneTrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  colorCodingEnabled?: boolean;
}

type RoundType = 'endless' | 'round20' | 'mistakes';

const TONE_ORDER: ThaiTone[] = ['mid', 'low', 'falling', 'high', 'rising'];

export const SyllableToneTrainerModal: React.FC<SyllableToneTrainerModalProps> = ({
  isOpen,
  onClose,
  colorCodingEnabled = true,
}) => {
  // Session configuration
  const [filter, setFilter] = useState<SyllableTrainerFilter>('all');
  const [roundType, setRoundType] = useState<RoundType>('endless');
  const [fontStyle, setFontStyle] = useState<'classic' | 'modern'>('classic');
  const [autoPlayAudio, setAutoPlayAudio] = useState<boolean>(false);
  const [showHintsBeforeAnswer, setShowHintsBeforeAnswer] = useState<boolean>(false);

  // Current Syllable State
  const [currentSyllable, setCurrentSyllable] = useState<RandomSyllableItem | null>(null);
  const [selectedTone, setSelectedTone] = useState<ThaiTone | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);

  // Round 20 & stats
  const [roundCurrentIndex, setRoundCurrentIndex] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [mistakes, setMistakes] = useState<RandomSyllableItem[]>([]);
  const [isRoundFinished, setIsRoundFinished] = useState<boolean>(false);

  // Cheatsheet peek drawer
  const [showCheatsheet, setShowCheatsheet] = useState<boolean>(false);

  // Load next syllable
  const loadNextSyllable = (nextFilter = filter, currentMistakes = mistakes) => {
    setSelectedTone(null);
    setIsAnswered(false);

    if (roundType === 'mistakes' && currentMistakes.length > 0) {
      const idx = roundCurrentIndex % currentMistakes.length;
      setCurrentSyllable(currentMistakes[idx]);
      return;
    }

    const next = generateRandomSyllable(nextFilter, history);
    setCurrentSyllable(next);
    setHistory((prev) => [next.syllable, ...prev.slice(0, 45)]);
  };

  // Start new round / session
  const startNewSession = (type: RoundType = roundType, targetFilter: SyllableTrainerFilter = filter) => {
    setRoundType(type);
    setFilter(targetFilter);
    setRoundCurrentIndex(0);
    setCorrectCount(0);
    setWrongCount(0);
    setStreak(0);
    setIsRoundFinished(false);
    setSelectedTone(null);
    setIsAnswered(false);

    if (type !== 'mistakes') {
      setMistakes([]);
    }

    const next = generateRandomSyllable(targetFilter, []);
    setCurrentSyllable(next);
    setHistory([next.syllable]);
  };

  // Initial mount / open
  useEffect(() => {
    if (isOpen) {
      startNewSession(roundType, filter);
    }
  }, [isOpen]);

  // Auto-play audio when a new syllable appears
  useEffect(() => {
    if (isOpen && autoPlayAudio && currentSyllable && !isAnswered) {
      speakThai(currentSyllable.syllable);
    }
  }, [currentSyllable, autoPlayAudio, isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen || isRoundFinished || !currentSyllable) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      if (!isAnswered) {
        if (key === '1') handleSelectTone('mid');
        else if (key === '2') handleSelectTone('low');
        else if (key === '3') handleSelectTone('falling');
        else if (key === '4') handleSelectTone('high');
        else if (key === '5') handleSelectTone('rising');
        else if (key === 'a' || key === 's') speakThai(currentSyllable.syllable);
      } else {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
          e.preventDefault();
          handleNext();
        } else if (key === 'a' || key === 's') {
          speakThai(currentSyllable.syllable);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isAnswered, currentSyllable, isRoundFinished]);

  if (!isOpen) return null;

  // Handle tone selection
  const handleSelectTone = (tone: ThaiTone) => {
    if (isAnswered || !currentSyllable) return;

    setSelectedTone(tone);
    setIsAnswered(true);

    const isCorrect = tone === currentSyllable.tone;

    if (isCorrect) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > maxStreak) {
        setMaxStreak(nextStreak);
      }
      setCorrectCount((c) => c + 1);

      // Trigger celebratory confetti on streak milestones
      if (nextStreak > 0 && nextStreak % 5 === 0) {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.65 },
        });
      }
    } else {
      setStreak(0);
      setWrongCount((w) => w + 1);
      setMistakes((prev) => {
        if (!prev.some((m) => m.syllable === currentSyllable.syllable)) {
          return [...prev, currentSyllable];
        }
        return prev;
      });
    }
  };

  // Advance to next syllable or finish round
  const handleNext = () => {
    if (roundType === 'round20') {
      if (roundCurrentIndex + 1 >= 20) {
        setIsRoundFinished(true);
        return;
      }
      setRoundCurrentIndex((prev) => prev + 1);
      loadNextSyllable(filter);
    } else if (roundType === 'mistakes') {
      if (roundCurrentIndex + 1 >= mistakes.length) {
        setIsRoundFinished(true);
        return;
      }
      setRoundCurrentIndex((prev) => prev + 1);
      loadNextSyllable(filter, mistakes);
    } else {
      // Endless
      setRoundCurrentIndex((prev) => prev + 1);
      loadNextSyllable(filter);
    }
  };

  const totalAnswered = correctCount + wrongCount;
  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
  const isCorrect = selectedTone !== null && currentSyllable && selectedTone === currentSyllable.tone;
  const correctToneData = currentSyllable ? THAI_TONES[currentSyllable.tone] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-white">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#2C2C2E] bg-[#242426]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#FF7A00]/20 flex items-center justify-center text-[#FF7A00] border border-[#FF7A00]/30 shadow-inner">
              <Sparkles className="w-5 h-5 text-[#FF7A00]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5 leading-tight">
                <span>Zufalls-Silbentrainer</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-400/20 text-violet-300 font-semibold border border-violet-400/30">
                  5 Töne
                </span>
              </h2>
              <p className="text-[11px] text-[#8E8E93] leading-tight">
                Zufällige Silben mit & ohne Tonzeichen entschlüsseln
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowCheatsheet(!showCheatsheet)}
              className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                showCheatsheet
                  ? 'bg-[#FF7A00]/20 text-[#FF7A00] border-[#FF7A00]/50'
                  : 'bg-[#1C1C1E] text-[#8E8E93] border-[#323236] hover:text-white'
              }`}
              title="Tonregeln Spickzettel einblenden"
            >
              <BookOpen className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-[#1C1C1E] text-[#8E8E93] hover:text-white border border-[#323236] transition-colors cursor-pointer"
              title="Schließen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Subheader: Mode & Stats */}
        <div className="px-5 py-2.5 bg-[#1F1F22] border-b border-[#2C2C2E] flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Mode Pill Switcher */}
          <div className="flex items-center gap-1 bg-[#161618] p-1 rounded-xl border border-[#2C2C2E]">
            <button
              type="button"
              onClick={() => startNewSession('endless', filter)}
              className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-all cursor-pointer ${
                roundType === 'endless'
                  ? 'bg-[#FF7A00] text-black font-bold shadow'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              Endlos
            </button>
            <button
              type="button"
              onClick={() => startNewSession('round20', filter)}
              className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-all cursor-pointer ${
                roundType === 'round20'
                  ? 'bg-[#FF7A00] text-black font-bold shadow'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              20er Runde
            </button>
            {mistakes.length > 0 && (
              <button
                type="button"
                onClick={() => startNewSession('mistakes', filter)}
                className={`px-2 py-1 rounded-lg font-medium text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                  roundType === 'mistakes'
                    ? 'bg-rose-500 text-white font-bold shadow'
                    : 'text-rose-400 hover:bg-rose-500/10'
                }`}
                title={`${mistakes.length} Fehler wiederholen`}
              >
                <span>Fehler ({mistakes.length})</span>
              </button>
            )}
          </div>

          {/* Live Streak & Score */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{streak}</span>
              {maxStreak > 1 && (
                <span className="text-[10px] text-[#8E8E93] font-normal">
                  (Best: {maxStreak})
                </span>
              )}
            </div>
            <div className="text-[11px] text-[#8E8E93]">
              <span className="text-emerald-400 font-bold">{correctCount}</span>
              <span className="mx-1">/</span>
              <span>{totalAnswered}</span>
              {totalAnswered > 0 && (
                <span className="ml-1 text-[10px] opacity-80">({accuracy}%)</span>
              )}
            </div>
          </div>
        </div>

        {/* Filter Bar (All / With marks / Without marks / Classes) */}
        <div className="px-5 py-2 bg-[#19191C] border-b border-[#2C2C2E] flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
          <span className="text-[10px] uppercase font-bold text-[#8E8E93] shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#FF7A00]" />
            Fokus:
          </span>
          <button
            type="button"
            onClick={() => startNewSession(roundType, 'all')}
            className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-[#FF7A00]/20 text-[#FF7A00] border border-[#FF7A00]/40 font-bold'
                : 'bg-[#242426] text-[#8E8E93] hover:text-white border border-transparent'
            }`}
          >
            Alle Silben
          </button>
          <button
            type="button"
            onClick={() => startNewSession(roundType, 'with_tone_marks')}
            className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors cursor-pointer ${
              filter === 'with_tone_marks'
                ? 'bg-[#FF7A00]/20 text-[#FF7A00] border border-[#FF7A00]/40 font-bold'
                : 'bg-[#242426] text-[#8E8E93] hover:text-white border border-transparent'
            }`}
          >
            Mit Tonzeichen (่ , ้ , ๊ , ๋)
          </button>
          <button
            type="button"
            onClick={() => startNewSession(roundType, 'without_tone_marks')}
            className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors cursor-pointer ${
              filter === 'without_tone_marks'
                ? 'bg-[#FF7A00]/20 text-[#FF7A00] border border-[#FF7A00]/40 font-bold'
                : 'bg-[#242426] text-[#8E8E93] hover:text-white border border-transparent'
            }`}
          >
            Ohne Tonzeichen (Tot / Lebend)
          </button>
          <button
            type="button"
            onClick={() => startNewSession(roundType, 'low_class')}
            className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors cursor-pointer ${
              filter === 'low_class'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                : 'bg-[#242426] text-[#8E8E93] hover:text-white border border-transparent'
            }`}
          >
            Nur Tiefklasse
          </button>
        </div>

        {/* Collapsible Tone Rules Cheatsheet Drawer */}
        {showCheatsheet && (
          <div className="px-5 py-3 bg-[#18181A] border-b border-[#2C2C2E] text-xs space-y-2 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#FF7A00]" />
                Übersicht der thailändischen Tonregeln
              </span>
              <button
                type="button"
                onClick={() => setShowCheatsheet(false)}
                className="text-[10px] text-[#8E8E93] hover:text-white cursor-pointer"
              >
                Ausblenden ✕
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl border border-amber-400/30 bg-amber-400/10 text-[10px] space-y-1">
                <span className="font-bold text-amber-300 block">Mittelklasse (ก จ ด ต บ ป อ)</span>
                <p className="text-white/80">Ohne Zeichen: Lebend = Mitte, Tot = Tief.</p>
                <p className="text-amber-200/90 font-mono">่ = Tief · ้ = Fallend · ๊ = Hoch · ๋ = Steigend</p>
              </div>
              <div className="p-2.5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-[10px] space-y-1">
                <span className="font-bold text-emerald-300 block">Hochklasse (ข ฉ ถ ผ ฝ ส ห)</span>
                <p className="text-white/80">Ohne Zeichen: Lebend = Steigend, Tot = Tief.</p>
                <p className="text-emerald-200/90 font-mono">่ = Tief · ้ = Fallend</p>
              </div>
              <div className="p-2.5 rounded-xl border border-sky-400/30 bg-sky-400/10 text-[10px] space-y-1">
                <span className="font-bold text-sky-300 block">Tiefklasse (ค ง ช ซ ท น พ ...)</span>
                <p className="text-white/80">Ohne Zeichen: Lebend = Mitte, Tot kurz = Hoch, Tot lang = Fallend.</p>
                <p className="text-sky-200/90 font-mono">่ = Fallend (!) · ้ = Hoch (!)</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Finish Screen for Round 20 */}
          {isRoundFinished ? (
            <div className="py-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-[#FF7A00]/20 border border-[#FF7A00]/40 flex items-center justify-center mx-auto text-[#FF7A00]">
                <Trophy className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Runde abgeschlossen!</h3>
                <p className="text-sm text-[#8E8E93]">
                  Du hast {totalAnswered} Silben trainiert.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
                <div className="p-3 bg-[#242426] rounded-2xl border border-[#323236]">
                  <span className="block text-lg font-bold text-emerald-400">{correctCount}</span>
                  <span className="text-[10px] text-[#8E8E93]">Richtig</span>
                </div>
                <div className="p-3 bg-[#242426] rounded-2xl border border-[#323236]">
                  <span className="block text-lg font-bold text-rose-400">{wrongCount}</span>
                  <span className="text-[10px] text-[#8E8E93]">Falsch</span>
                </div>
                <div className="p-3 bg-[#242426] rounded-2xl border border-[#323236]">
                  <span className="block text-lg font-bold text-amber-400">{accuracy}%</span>
                  <span className="text-[10px] text-[#8E8E93]">Quote</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => startNewSession('round20', filter)}
                  className="px-5 py-3 rounded-full bg-[#FF7A00] text-black font-bold text-xs hover:bg-[#FF8A1A] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Neue 20er Runde starten</span>
                </button>
                {mistakes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => startNewSession('mistakes', filter)}
                    className="px-5 py-3 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-xs hover:bg-rose-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Nur Fehler wiederholen ({mistakes.length})</span>
                  </button>
                )}
              </div>
            </div>
          ) : currentSyllable ? (
            <>
              {/* Progress Bar for Round 20 */}
              {roundType === 'round20' && (
                <div className="w-full bg-[#242426] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#FF7A00] h-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, ((roundCurrentIndex + 1) / 20) * 100)}%`,
                    }}
                  />
                </div>
              )}

              {/* Central Syllable Display Card */}
              <div
                className={`relative p-6 rounded-3xl border text-center transition-all duration-200 ${
                  isAnswered
                    ? isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                      : 'bg-rose-500/10 border-rose-500/40 shadow-lg shadow-rose-500/5'
                    : 'bg-[#242426] border-[#323236] hover:border-[#3E3E42]'
                }`}
              >
                {/* Tone mark badge if present */}
                {currentSyllable.hasToneMark && (
                  <div className="absolute top-4 left-4 text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-medium">
                    {currentSyllable.toneMarkName}
                  </div>
                )}

                {/* Font toggle & Audio controls in card corners */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFontStyle(fontStyle === 'classic' ? 'modern' : 'classic')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors cursor-pointer ${
                      fontStyle === 'modern'
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-[#1C1C1E] text-[#8E8E93] border-[#323236] hover:text-white'
                    }`}
                    title="Zwischen klassischer Schrift und moderner Loopless-Schrift wechseln"
                  >
                    {fontStyle === 'classic' ? 'Klassisch' : 'Modern'}
                  </button>
                  <button
                    type="button"
                    onClick={() => speakThai(currentSyllable.syllable)}
                    className="p-2 rounded-xl bg-[#1C1C1E] text-[#FF7A00] border border-[#FF7A00]/30 hover:bg-[#FF7A00]/10 transition-colors cursor-pointer"
                    title="Silbe anhören (Taste A)"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Giant Thai Syllable Glyph */}
                <div className="my-3">
                  <span
                    className={`inline-block text-8xl font-bold select-none transition-transform hover:scale-105 active:scale-95 cursor-pointer leading-tight ${
                      fontStyle === 'modern' ? 'font-thai-kanit' : 'font-thai-classic'
                    } ${
                      isAnswered && colorCodingEnabled && correctToneData
                        ? correctToneData.colorClass
                        : 'text-white'
                    }`}
                    onClick={() => speakThai(currentSyllable.syllable)}
                  >
                    {currentSyllable.syllable}
                  </span>
                </div>

                {/* Clues / Romanization (Revealed or toggled) */}
                <div className="space-y-1">
                  {isAnswered || showHintsBeforeAnswer ? (
                    <div className="animate-in fade-in duration-200">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-[#FF7A00] font-mono font-bold">
                          [{currentSyllable.romanization}]
                        </span>
                        {currentSyllable.meaningGerman && (
                          <span className="text-xs text-[#8E8E93]">
                            = <span className="text-white font-medium">{currentSyllable.meaningGerman}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowHintsBeforeAnswer(true)}
                      className="text-[11px] text-[#8E8E93] hover:text-white flex items-center justify-center gap-1 mx-auto cursor-pointer py-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Umschrift & Laut anzeigen</span>
                    </button>
                  )}
                </div>
              </div>

              {/* The 5 Tone Selection Choices */}
              <div className="space-y-2 pt-1">
                <div className="text-center">
                  <span className="text-xs text-[#8E8E93] font-medium">
                    Welche Tonlage hat diese Silbe?
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {TONE_ORDER.map((toneKey, idx) => {
                    const info = THAI_TONES[toneKey];
                    const shortcutNumber = idx + 1;
                    const isTarget = currentSyllable.tone === toneKey;
                    const isChosen = selectedTone === toneKey;

                    let btnClasses =
                      'bg-[#242426] border-[#323236] text-white hover:border-[#FF7A00]/50 hover:bg-[#2A2A2E]';

                    if (isAnswered) {
                      if (isTarget) {
                        btnClasses = `${info.bgClass} border-2 ${info.borderClass} ${info.colorClass} font-bold ring-2 ring-white/20 scale-[1.02] shadow-lg`;
                      } else if (isChosen) {
                        btnClasses = 'bg-rose-500/20 border-2 border-rose-500 text-rose-300 opacity-80';
                      } else {
                        btnClasses = 'bg-[#1C1C1E] border-[#2C2C2E] text-[#8E8E93] opacity-40';
                      }
                    }

                    return (
                      <button
                        key={toneKey}
                        type="button"
                        disabled={isAnswered}
                        onClick={() => handleSelectTone(toneKey)}
                        className={`relative p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between min-h-[72px] active:scale-95 ${btnClasses}`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-base font-bold font-mono">{info.symbol}</span>
                          <span className="text-[10px] text-[#8E8E93] font-mono px-1.5 py-0.2 rounded bg-black/30 border border-white/10">
                            {shortcutNumber}
                          </span>
                        </div>
                        <span className="block text-xs font-bold leading-tight">
                          {info.germanName}
                        </span>
                        <span className="block text-[9px] text-[#8E8E93] leading-tight">
                          {info.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback & Detailed Step-by-Step Explanation when Answered */}
              {isAnswered && (
                <div
                  className={`p-4 rounded-2xl border space-y-3 animate-in slide-in-from-bottom-2 duration-200 ${
                    isCorrect
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-100'
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold text-sm">
                          {isCorrect ? 'Richtig!' : 'Leider falsch!'}
                        </span>
                        <span className="text-xs opacity-90 ml-1.5">
                          {currentSyllable.syllable} wird als{' '}
                          <span className={`font-bold ${correctToneData?.colorClass}`}>
                            {correctToneData?.germanName}-Ton ({correctToneData?.symbol})
                          </span>{' '}
                          gesprochen.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 4-Step Analysis Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                    <div className="bg-black/30 p-2 rounded-xl border border-white/10">
                      <span className="block text-[9px] text-[#8E8E93] uppercase font-bold">
                        1. Anlaut-Klasse
                      </span>
                      <span className="font-bold text-amber-300">
                        {currentSyllable.initialClassName} ({currentSyllable.initialChar})
                      </span>
                    </div>
                    <div className="bg-black/30 p-2 rounded-xl border border-white/10">
                      <span className="block text-[9px] text-[#8E8E93] uppercase font-bold">
                        2. Tonzeichen
                      </span>
                      <span className="font-bold text-violet-300">
                        {currentSyllable.toneMarkName}
                      </span>
                    </div>
                    <div className="bg-black/30 p-2 rounded-xl border border-white/10 col-span-2 sm:col-span-1">
                      <span className="block text-[9px] text-[#8E8E93] uppercase font-bold">
                        3. Silbentyp & Länge
                      </span>
                      <span className="font-bold text-sky-300">
                        {currentSyllable.syllableTypeName} ({currentSyllable.vowelLengthName})
                      </span>
                    </div>
                  </div>

                  {/* Formula & Explanation */}
                  <div className="text-xs space-y-1 bg-black/35 p-2.5 rounded-xl border border-white/10 text-white/90">
                    <div className="text-[11px] font-semibold text-[#FF7A00] flex items-center gap-1">
                      <span>🎯 Formel:</span>
                      <span className="text-white font-mono">{currentSyllable.ruleFormula}</span>
                    </div>
                    <p className="text-[11px] text-[#8E8E93] leading-relaxed">
                      💡 {currentSyllable.ruleExplanation}
                    </p>
                  </div>

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full py-3 px-4 rounded-full bg-white text-black font-bold text-xs hover:bg-[#E5E5EA] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-98"
                  >
                    <span>Nächste Silbe (Leertaste / Enter)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Bottom Options & Quick Controls */}
        <div className="px-5 py-3 border-t border-[#2C2C2E] bg-[#1F1F22] flex items-center justify-between text-xs text-[#8E8E93]">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-white">
              <input
                type="checkbox"
                checked={autoPlayAudio}
                onChange={(e) => setAutoPlayAudio(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-[#FF7A00]"
              />
              <span className="text-[11px]">Audio sofort abspielen</span>
            </label>
          </div>

          <button
            type="button"
            onClick={() => loadNextSyllable(filter)}
            className="text-[11px] text-[#8E8E93] hover:text-[#FF7A00] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Neue Silbe generieren</span>
          </button>
        </div>
      </div>
    </div>
  );
};
