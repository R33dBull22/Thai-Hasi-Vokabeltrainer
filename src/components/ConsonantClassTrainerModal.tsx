import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Flame,
  Layers,
  Eye,
  EyeOff,
  BookOpen,
  Shuffle,
  Filter,
  Type,
  ChevronDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { THAI_CONSONANTS, ThaiConsonant, ConsonantClass, CONSONANT_CLASS_CONFIG } from '../data/thaiAlphabet';
import { speakThai } from '../utils/thaiAudio';

interface ConsonantClassTrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  colorCodingEnabled?: boolean;
}

type TrainerRoundMode = 'endless' | 'round20' | 'all44' | 'mistakes';

// Educational mnemonics and tips for Thai consonant classes
const CLASS_EXPLANATIONS: Record<ConsonantClass, {
  thaiTitle: string;
  count: number;
  germanTitle: string;
  shortRule: string;
  mnemonicThai: string;
  mnemonicPhonetic: string;
  mnemonicGerman: string;
  toneCharacteristics: string;
}> = {
  mid: {
    thaiTitle: 'อักษรกลาง (Mitte)',
    count: 9,
    germanTitle: 'Mittlere Konsonanten',
    shortRule: '9 Buchstaben: ก จ ฎ ฏ ด ต บ ป อ',
    mnemonicThai: 'ไก่จิกเด็กตายเด็กตายบนปากโอ่ง',
    mnemonicPhonetic: 'Gài jìk dèk dtaai dèk dtaai bon bpàak oòng',
    mnemonicGerman: '„Das Huhn pickt das Kind tot, das Kind tot auf dem Rand des Tonkrugs.“',
    toneCharacteristics: 'Einzige Klasse, die mit den 4 Tonzeichen alle 5 Töne sauber bilden kann! Ohne Tonzeichen: Lebend = Mitte, Tot = Tief.',
  },
  high: {
    thaiTitle: 'อักษรสูง (Hoch)',
    count: 11,
    germanTitle: 'Hohe Konsonanten',
    shortRule: '11 Buchstaben: ข ฃ ฉ ฐ ถ ผ ฝ ศ ษ ส ห',
    mnemonicThai: 'ผีฝากถุงข้าวสารให้ฉัน',
    mnemonicPhonetic: 'Phĕe fàak thŭng khâao-săan hâi chăn',
    mnemonicGerman: '„Ein Geist übergab mir einen Sack ungesottenen Reis.“',
    toneCharacteristics: 'Beginnen von Natur aus mit Steigton (Rising Tone) bei lebender Silbe ohne Tonzeichen! Mit Mai Ek = Tiefton, mit Mai Tho = Fallton.',
  },
  low: {
    thaiTitle: 'อักษรต่ำ (Tief)',
    count: 24,
    germanTitle: 'Tiefe Konsonanten',
    shortRule: '24 Buchstaben: Alle restlichen Konsonanten (ค ง ช ซ ท น พ ม ย ร ล ว ...)',
    mnemonicThai: 'งูใหญ่นอนอยู่ ณ ริมวัดโมฬีโลก (10 Sonoranten)',
    mnemonicPhonetic: 'Ngoo yài naawn yòo ná rim wát moo-lee lôok',
    mnemonicGerman: '„Die große Schlange schläft am Ufer des Wat Molee Lok.“ (Merksatz für ungepaarte tiefe Sonoranten)',
    toneCharacteristics: 'Verschieben Tonzeichen um 1 Stufe nach oben: Mai Ek erzeugt Fallton, Mai Tho erzeugt Hochton! Ohne Zeichen: Mittelton (lebend), Hoch (kurz tot), Fallend (lang tot).',
  },
};

export const ConsonantClassTrainerModal: React.FC<ConsonantClassTrainerModalProps> = ({
  isOpen,
  onClose,
  colorCodingEnabled = true,
}) => {
  // Mode & configuration
  const [roundMode, setRoundMode] = useState<TrainerRoundMode>('endless');
  const [includeObsolete, setIncludeObsolete] = useState<boolean>(true);
  const [fontStyle, setFontStyle] = useState<'classic' | 'modern'>('classic');
  const [showHintsBeforeAnswer, setShowHintsBeforeAnswer] = useState<boolean>(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState<boolean>(false);

  // Deck & Current Card State
  const [activeDeck, setActiveDeck] = useState<ThaiConsonant[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedClass, setSelectedClass] = useState<ConsonantClass | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);

  // Stats
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [mistakes, setMistakes] = useState<ThaiConsonant[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Cheatsheet Drawer peek
  const [showCheatsheet, setShowCheatsheet] = useState<boolean>(false);

  // Shuffle helper
  const shuffle = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Base consonants pool
  const basePool = useMemo(() => {
    return THAI_CONSONANTS.filter((c) => (includeObsolete ? true : !c.isObsolete));
  }, [includeObsolete]);

  // Initialize or reset round
  const startNewSession = (mode: TrainerRoundMode, customDeck?: ThaiConsonant[]) => {
    let newDeck: ThaiConsonant[] = [];

    if (customDeck && customDeck.length > 0) {
      newDeck = shuffle(customDeck);
    } else if (mode === 'mistakes') {
      newDeck = mistakes.length > 0 ? shuffle(mistakes) : shuffle(basePool);
    } else if (mode === 'round20') {
      newDeck = shuffle(basePool).slice(0, 20);
    } else if (mode === 'all44') {
      newDeck = shuffle(basePool);
    } else {
      // Endless: full shuffled pool, will loop/re-shuffle
      newDeck = shuffle(basePool);
    }

    setActiveDeck(newDeck);
    setCurrentIndex(0);
    setSelectedClass(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setWrongCount(0);
    setStreak(0);
    setIsFinished(false);
    if (mode !== 'mistakes') {
      setMistakes([]);
    }
  };

  // Initial load when opened
  useEffect(() => {
    if (isOpen) {
      startNewSession(roundMode);
    }
  }, [isOpen, includeObsolete, roundMode]);

  // Current Target Consonant
  const currentTarget = activeDeck[currentIndex] || activeDeck[0];

  // Auto-play audio when target changes if enabled
  useEffect(() => {
    if (isOpen && autoPlayAudio && currentTarget && !isAnswered) {
      speakThai(currentTarget.nameThai || currentTarget.letter);
    }
  }, [currentTarget, autoPlayAudio, isOpen]);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    if (!isOpen || isFinished || !currentTarget) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if an input is focused
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      if (!isAnswered) {
        if (key === '1' || key === 'm') {
          handleSelectClass('mid');
        } else if (key === '2' || key === 'h') {
          handleSelectClass('high');
        } else if (key === '3' || key === 't' || key === 'l') {
          handleSelectClass('low');
        } else if (key === 'a' || key === 's') {
          speakThai(currentTarget.nameThai);
        }
      } else {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
          e.preventDefault();
          handleNext();
        } else if (key === 'a' || key === 's') {
          speakThai(currentTarget.nameThai);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isAnswered, currentTarget, isFinished]);

  if (!isOpen) return null;

  // Handle selection of a consonant class
  const handleSelectClass = (chosenClass: ConsonantClass) => {
    if (isAnswered || !currentTarget) return;

    setSelectedClass(chosenClass);
    setIsAnswered(true);

    const isCorrect = chosenClass === currentTarget.class;

    if (isCorrect) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > maxStreak) {
        setMaxStreak(nextStreak);
      }
      setCorrectCount((c) => c + 1);

      // Trigger celebratory confetti on milestones
      if (nextStreak > 0 && nextStreak % 5 === 0) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.65 },
        });
      }
    } else {
      setStreak(0);
      setWrongCount((w) => w + 1);
      setMistakes((prev) => {
        if (!prev.some((m) => m.letter === currentTarget.letter)) {
          return [...prev, currentTarget];
        }
        return prev;
      });
    }
  };

  // Move to next consonant
  const handleNext = () => {
    if (currentIndex + 1 >= activeDeck.length) {
      if (roundMode === 'endless') {
        // Endless mode reshuffles and continues seamlessly
        setActiveDeck(shuffle(basePool));
        setCurrentIndex(0);
        setSelectedClass(null);
        setIsAnswered(false);
      } else {
        // Round mode finished
        setIsFinished(true);
      }
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedClass(null);
      setIsAnswered(false);
    }
  };

  const totalAnswered = correctCount + wrongCount;
  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
  const isCorrect = selectedClass !== null && currentTarget && selectedClass === currentTarget.class;
  const targetClassConfig = currentTarget ? CONSONANT_CLASS_CONFIG[currentTarget.class] : null;
  const targetExplanation = currentTarget ? CLASS_EXPLANATIONS[currentTarget.class] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-white">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#2C2C2E] bg-[#242426]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#FF7A00]/20 flex items-center justify-center text-[#FF7A00] border border-[#FF7A00]/30 shadow-inner">
              <Sparkles className="w-5 h-5 text-[#FF7A00]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5 leading-tight">
                <span>Konsonantenklassen-Trainer</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">
                  Mitte · Hoch · Tief
                </span>
              </h2>
              <p className="text-[11px] text-[#8E8E93] leading-tight">
                Die 44 Konsonanten den 3 Tonklassen zuordnen
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
              title="Klassen-Spickzettel & Eselsbrücken anzeigen"
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

        {/* Subheader: Mode selector & Streak/Stats bar */}
        <div className="px-5 py-2.5 bg-[#1F1F22] border-b border-[#2C2C2E] flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Mode Pill Switcher */}
          <div className="flex items-center gap-1 bg-[#161618] p-1 rounded-xl border border-[#2C2C2E]">
            <button
              type="button"
              onClick={() => {
                setRoundMode('endless');
                startNewSession('endless');
              }}
              className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-all cursor-pointer ${
                roundMode === 'endless'
                  ? 'bg-[#FF7A00] text-black font-bold shadow'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              Endlos
            </button>
            <button
              type="button"
              onClick={() => {
                setRoundMode('round20');
                startNewSession('round20');
              }}
              className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-all cursor-pointer ${
                roundMode === 'round20'
                  ? 'bg-[#FF7A00] text-black font-bold shadow'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              20er Runde
            </button>
            <button
              type="button"
              onClick={() => {
                setRoundMode('all44');
                startNewSession('all44');
              }}
              className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-all cursor-pointer ${
                roundMode === 'all44'
                  ? 'bg-[#FF7A00] text-black font-bold shadow'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              Alle 44
            </button>
            {mistakes.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setRoundMode('mistakes');
                  startNewSession('mistakes');
                }}
                className={`px-2 py-1 rounded-lg font-medium text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                  roundMode === 'mistakes'
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

        {/* Collapsible Cheatsheet Drawer */}
        {showCheatsheet && (
          <div className="px-5 py-3 bg-[#18181A] border-b border-[#2C2C2E] text-xs space-y-2 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#FF7A00]" />
                Übersicht der 3 Konsonantenklassen
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
              {/* Mid */}
              <div className="p-2.5 rounded-xl border border-amber-400/30 bg-amber-400/10">
                <div className="flex items-center justify-between text-amber-400 font-bold text-[11px] mb-1">
                  <span>Mitte (9)</span>
                  <span className="text-[9px] opacity-75">อักษรกลาง</span>
                </div>
                <div className="text-[10px] text-amber-200/90 font-mono mb-1">
                  ก จ ฎ ฏ ด ต บ ป อ
                </div>
                <p className="text-[9px] text-amber-300/80 leading-tight">
                  Können alle 5 Töne bilden. Standardton: Mitte.
                </p>
              </div>

              {/* High */}
              <div className="p-2.5 rounded-xl border border-emerald-400/30 bg-emerald-400/10">
                <div className="flex items-center justify-between text-emerald-400 font-bold text-[11px] mb-1">
                  <span>Hoch (11)</span>
                  <span className="text-[9px] opacity-75">อักษรสูง</span>
                </div>
                <div className="text-[10px] text-emerald-200/90 font-mono mb-1">
                  ข ฃ ฉ ฐ ถ ผ ฝ ศ ษ ส ห
                </div>
                <p className="text-[9px] text-emerald-300/80 leading-tight">
                  Beginnen mit Steigton (Rising). Bilden tiefe & fallende Töne.
                </p>
              </div>

              {/* Low */}
              <div className="p-2.5 rounded-xl border border-sky-400/30 bg-sky-400/10">
                <div className="flex items-center justify-between text-sky-400 font-bold text-[11px] mb-1">
                  <span>Tief (24)</span>
                  <span className="text-[9px] opacity-75">อักษรต่ำ</span>
                </div>
                <div className="text-[10px] text-sky-200/90 font-mono mb-1">
                  ค ฅ ฆ ง ช ซ ฌ ญ ฑ ฒ ...
                </div>
                <p className="text-[9px] text-sky-300/80 leading-tight">
                  Größte Gruppe. Verschieben Tonzeichen um 1 Stufe nach oben.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Finish Screen for Round 20 / All 44 */}
          {isFinished ? (
            <div className="py-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-[#FF7A00]/20 border border-[#FF7A00]/40 flex items-center justify-center mx-auto text-[#FF7A00]">
                <Trophy className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Runde abgeschlossen!</h3>
                <p className="text-sm text-[#8E8E93]">
                  Du hast {totalAnswered} Konsonanten trainiert.
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
                  onClick={() => startNewSession(roundMode)}
                  className="px-5 py-3 rounded-full bg-[#FF7A00] text-black font-bold text-xs hover:bg-[#FF8A1A] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Gleiche Runde wiederholen</span>
                </button>
                {mistakes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setRoundMode('mistakes');
                      startNewSession('mistakes');
                    }}
                    className="px-5 py-3 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-xs hover:bg-rose-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Nur Fehler wiederholen ({mistakes.length})</span>
                  </button>
                )}
              </div>
            </div>
          ) : currentTarget ? (
            <>
              {/* Progress indicator in round */}
              {roundMode !== 'endless' && (
                <div className="w-full bg-[#242426] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#FF7A00] h-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, ((currentIndex + 1) / activeDeck.length) * 100)}%`,
                    }}
                  />
                </div>
              )}

              {/* Central Consonant Card */}
              <div
                className={`relative p-6 rounded-3xl border text-center transition-all duration-200 ${
                  isAnswered
                    ? isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                      : 'bg-rose-500/10 border-rose-500/40 shadow-lg shadow-rose-500/5'
                    : 'bg-[#242426] border-[#323236] hover:border-[#3E3E42]'
                }`}
              >
                {/* Obsolete badge if applicable */}
                {currentTarget.isObsolete && (
                  <div className="absolute top-4 left-4 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                    Historisch
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
                    title="Zwischen klassischer Kringelschrift (Sarabun) und moderner Loopless-Schrift (Kanit) wechseln"
                  >
                    {fontStyle === 'classic' ? 'Klassisch' : 'Modern'}
                  </button>
                  <button
                    type="button"
                    onClick={() => speakThai(currentTarget.nameThai)}
                    className="p-2 rounded-xl bg-[#1C1C1E] text-[#FF7A00] border border-[#FF7A00]/30 hover:bg-[#FF7A00]/10 transition-colors cursor-pointer"
                    title="Name & Buchstabe anhören (Taste A)"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Big Consonant Glyph */}
                <div className="my-2">
                  <span
                    className={`inline-block text-8xl font-bold select-none transition-transform hover:scale-105 active:scale-95 cursor-pointer ${
                      fontStyle === 'modern' ? 'font-thai-kanit' : 'font-thai-classic'
                    } ${
                      isAnswered && colorCodingEnabled && targetClassConfig
                        ? targetClassConfig.colorClass
                        : 'text-white'
                    }`}
                    onClick={() => speakThai(currentTarget.nameThai)}
                  >
                    {currentTarget.letter}
                  </span>
                </div>

                {/* Clues / Name (Revealed or toggled) */}
                <div className="space-y-1">
                  {(isAnswered || showHintsBeforeAnswer) ? (
                    <div className="animate-in fade-in duration-200">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-base font-bold text-white">
                          {currentTarget.nameThai}
                        </span>
                        <span className="text-xs text-[#FF7A00] font-mono">
                          ({currentTarget.namePhonetic})
                        </span>
                      </div>
                      <p className="text-xs text-[#8E8E93]">
                        Bedeutung: <span className="text-white font-medium">{currentTarget.meaningGerman}</span>
                        <span className="mx-2">·</span>
                        Anlaut: <span className="text-amber-300 font-mono">{currentTarget.initialSound}</span>
                        {currentTarget.finalSound && currentTarget.finalSound !== '-' && (
                          <>
                            <span className="mx-1">/</span>
                            Auslaut: <span className="text-sky-300 font-mono">{currentTarget.finalSound}</span>
                          </>
                        )}
                      </p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowHintsBeforeAnswer(true)}
                      className="text-[11px] text-[#8E8E93] hover:text-white flex items-center justify-center gap-1 mx-auto cursor-pointer py-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Name & Laut anzeigen</span>
                    </button>
                  )}
                </div>
              </div>

              {/* The 3 Class Selection Buttons */}
              <div className="space-y-2 pt-1">
                <div className="text-center">
                  <span className="text-xs text-[#8E8E93] font-medium">
                    Zu welcher Konsonantenklasse gehört dieser Buchstabe?
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* MITTLERE KLASSE */}
                  <button
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectClass('mid')}
                    className={`relative p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isAnswered
                        ? currentTarget.class === 'mid'
                          ? 'bg-amber-400/25 border-amber-400 text-white font-bold ring-2 ring-amber-400 scale-[1.02] shadow-lg'
                          : selectedClass === 'mid'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300 opacity-80'
                          : 'bg-[#1C1C1E] border-[#2C2C2E] text-[#8E8E93] opacity-50'
                        : 'bg-amber-400/10 border-amber-400/30 text-amber-300 hover:bg-amber-400/20 hover:border-amber-400 active:scale-95'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-amber-400">Mitte (9)</span>
                      <span className="text-[10px] text-amber-300/70 font-mono px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                        Taste 1
                      </span>
                    </div>
                    <span className="text-[11px] opacity-80 font-thai leading-tight">
                      อักษรกลาง · 9 Konsonanten
                    </span>
                  </button>

                  {/* HOHE KLASSE */}
                  <button
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectClass('high')}
                    className={`relative p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isAnswered
                        ? currentTarget.class === 'high'
                          ? 'bg-emerald-400/25 border-emerald-400 text-white font-bold ring-2 ring-emerald-400 scale-[1.02] shadow-lg'
                          : selectedClass === 'high'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300 opacity-80'
                          : 'bg-[#1C1C1E] border-[#2C2C2E] text-[#8E8E93] opacity-50'
                        : 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/20 hover:border-emerald-400 active:scale-95'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-emerald-400">Hoch (11)</span>
                      <span className="text-[10px] text-emerald-300/70 font-mono px-1.5 py-0.5 rounded bg-emerald-400/10 border border-emerald-400/20">
                        Taste 2
                      </span>
                    </div>
                    <span className="text-[11px] opacity-80 font-thai leading-tight">
                      อักษรสูง · 11 Konsonanten
                    </span>
                  </button>

                  {/* TIEFE KLASSE */}
                  <button
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectClass('low')}
                    className={`relative p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isAnswered
                        ? currentTarget.class === 'low'
                          ? 'bg-sky-400/25 border-sky-400 text-white font-bold ring-2 ring-sky-400 scale-[1.02] shadow-lg'
                          : selectedClass === 'low'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300 opacity-80'
                          : 'bg-[#1C1C1E] border-[#2C2C2E] text-[#8E8E93] opacity-50'
                        : 'bg-sky-400/10 border-sky-400/30 text-sky-300 hover:bg-sky-400/20 hover:border-sky-400 active:scale-95'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-sky-400">Tief (24)</span>
                      <span className="text-[10px] text-sky-300/70 font-mono px-1.5 py-0.5 rounded bg-sky-400/10 border border-sky-400/20">
                        Taste 3
                      </span>
                    </div>
                    <span className="text-[11px] opacity-80 font-thai leading-tight">
                      อักษรต่ำ · 24 Konsonanten
                    </span>
                  </button>
                </div>
              </div>

              {/* Feedback & Explanation Banner when Answered */}
              {isAnswered && targetExplanation && targetClassConfig && (
                <div
                  className={`p-4 rounded-2xl border space-y-2.5 animate-in slide-in-from-bottom-2 duration-200 ${
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
                          {isCorrect ? 'Richtig!' : 'Nicht ganz!'}
                        </span>
                        <span className="text-xs opacity-90 ml-1.5">
                          {currentTarget.letter} ({currentTarget.nameThai}) ist{' '}
                          <span className={`font-bold ${targetClassConfig.colorClass}`}>
                            {targetExplanation.germanTitle} ({targetExplanation.count})
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Educational Details & Mnemonic */}
                  <div className="text-xs space-y-1 bg-black/25 p-2.5 rounded-xl border border-white/10 text-white/90">
                    <div className="text-[11px] font-semibold text-[#FF7A00]">
                      💡 Merksatz & Tonverhalten:
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {targetExplanation.mnemonicGerman}
                    </p>
                    <p className="text-[10px] opacity-75 leading-tight">
                      {targetExplanation.toneCharacteristics}
                    </p>
                  </div>

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full py-3 px-4 rounded-full bg-white text-black font-bold text-xs hover:bg-[#E5E5EA] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-98"
                  >
                    <span>Nächster Konsonant (Leertaste / Enter)</span>
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
                checked={includeObsolete}
                onChange={(e) => setIncludeObsolete(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-[#FF7A00]"
              />
              <span className="text-[11px]">Veraltete (ฃ, ฅ)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-white">
              <input
                type="checkbox"
                checked={autoPlayAudio}
                onChange={(e) => setAutoPlayAudio(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-[#FF7A00]"
              />
              <span className="text-[11px]">Audio sofort</span>
            </label>
          </div>

          <button
            type="button"
            onClick={() => startNewSession(roundMode)}
            className="text-[11px] text-[#8E8E93] hover:text-[#FF7A00] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Neu mischen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
