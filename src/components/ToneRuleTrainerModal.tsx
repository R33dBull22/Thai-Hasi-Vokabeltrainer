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
  ChevronDown,
  BookOpen,
  Compass,
} from 'lucide-react';
import { Vocabulary } from '../types/vocab';
import { speakThai } from '../utils/thaiAudio';
import { THAI_TONES, ThaiTone } from '../utils/thaiTones';
import { ConsonantClass, CONSONANT_CLASS_CONFIG } from '../data/thaiAlphabet';
import {
  CURATED_TONE_LEVELS,
  ToneTrainerWord,
  ToneTrainerLevel,
  analyzeThaiWordForToneTrainer,
  TONE_MARK_INFO,
  SYLLABLE_TYPE_INFO,
} from '../data/thaiToneTrainerData';
import { ToneVisualizer } from './ToneVisualizer';
import { ToneRulesCheatsheet } from './ToneRulesCheatsheet';

interface ToneRuleTrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  deckVocabs?: Vocabulary[];
}

type TrainerMode = 'guided' | 'speed';
type GuidedStep = 'initial_class' | 'tone_mark' | 'syllable_type' | 'result_tone' | 'resolved';

export const ToneRuleTrainerModal: React.FC<ToneRuleTrainerModalProps> = ({
  isOpen,
  onClose,
  deckVocabs = [],
}) => {
  const [selectedLevelId, setSelectedLevelId] = useState<number | 'deck'>(1);
  const [mode, setMode] = useState<TrainerMode>('guided');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeSyllableIndex, setActiveSyllableIndex] = useState(0);
  const [guidedStep, setGuidedStep] = useState<GuidedStep>('initial_class');

  // Romanization visibility toggle
  const [showRomanization, setShowRomanization] = useState(false);

  // Stats & Progress
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [mistakes, setMistakes] = useState<ToneTrainerWord[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Speed Mode specific states
  const [speedAnswerStatus, setSpeedAnswerStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [selectedToneSpeed, setSelectedToneSpeed] = useState<ThaiTone | null>(null);

  // Guided Step Feedback
  const [stepFeedback, setStepFeedback] = useState<{
    status: 'correct' | 'wrong';
    message: string;
  } | null>(null);

  // Cheatsheet Quick Peek Drawer
  const [showCheatsheetPeek, setShowCheatsheetPeek] = useState(false);
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);

  // Prepare Word Pool for current selection
  const wordPool = useMemo((): ToneTrainerWord[] => {
    if (selectedLevelId === 'deck') {
      if (deckVocabs.length === 0) {
        // Fallback to Level 1 if deck is empty
        return CURATED_TONE_LEVELS[0].words;
      }
      return deckVocabs.map((v) =>
        analyzeThaiWordForToneTrainer(v.thai, v.german, v.romanization)
      );
    }
    const foundLevel = CURATED_TONE_LEVELS.find((l) => l.id === selectedLevelId);
    return foundLevel ? foundLevel.words : CURATED_TONE_LEVELS[0].words;
  }, [selectedLevelId, deckVocabs]);

  const currentWord = wordPool[currentIndex] || wordPool[0];

  const activeSyllable = useMemo(() => {
    if (currentWord?.syllables && currentWord.syllables[activeSyllableIndex]) {
      return currentWord.syllables[activeSyllableIndex];
    }
    return {
      syllableIndex: 0,
      totalSyllables: 1,
      syllable: currentWord?.targetSyllableText || currentWord?.thai || '',
      romanization: currentWord?.targetSyllableRoman || currentWord?.romanization || '',
      initialLetter: currentWord?.initialLetter || 'ก',
      initialClass: currentWord?.initialClass || 'mid',
      initialClassName: currentWord?.initialClassName || 'Mittelklasse',
      toneMark: currentWord?.toneMark || 'none',
      toneMarkName: currentWord?.toneMarkName || 'Kein Zeichen',
      syllableType: currentWord?.syllableType || 'live',
      syllableTypeName: currentWord?.syllableTypeName || 'Lebende Silbe',
      vowelLength: currentWord?.vowelLength || 'long',
      vowelLengthName: currentWord?.vowelLengthName || 'Langer Vokal',
      tone: currentWord?.tone || 'mid',
      ruleFormula: currentWord?.ruleFormula || '',
      ruleTip: currentWord?.ruleTip || '',
    };
  }, [currentWord, activeSyllableIndex]);

  // Reset active syllable when moving to a new word or level
  useEffect(() => {
    setActiveSyllableIndex(0);
  }, [currentIndex, selectedLevelId]);

  // Reset or restart session when level or mode changes
  const startNewSession = (newLevelId: number | 'deck', newMode: TrainerMode = mode) => {
    setSelectedLevelId(newLevelId);
    setMode(newMode);
    setCurrentIndex(0);
    setActiveSyllableIndex(0);
    setGuidedStep('initial_class');
    setStepFeedback(null);
    setSpeedAnswerStatus('idle');
    setSelectedToneSpeed(null);
    setStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setMistakes([]);
    setIsCompleted(false);
  };

  // Switch to revenge round with mistakes
  const startRevengeSession = () => {
    if (mistakes.length === 0) return;
    setCurrentIndex(0);
    setActiveSyllableIndex(0);
    setGuidedStep('initial_class');
    setStepFeedback(null);
    setSpeedAnswerStatus('idle');
    setSelectedToneSpeed(null);
    setCorrectCount(0);
    setWrongCount(0);
    setIsCompleted(false);
  };

  // Play audio on new word or manual click
  const handlePlayAudio = (thaiWord: string = currentWord?.thai) => {
    if (!thaiWord) return;
    speakThai(thaiWord);
  };

  // Reset step when advancing to next word
  const goToNextWord = () => {
    setStepFeedback(null);
    setSpeedAnswerStatus('idle');
    setSelectedToneSpeed(null);

    if (currentIndex + 1 < wordPool.length) {
      setCurrentIndex((prev) => prev + 1);
      setActiveSyllableIndex(0);
      setGuidedStep('initial_class');
    } else {
      setIsCompleted(true);
    }
  };

  // Handle Guided Step 1: Initial Consonant Class
  const handleSelectInitialClass = (selectedClass: ConsonantClass) => {
    if (stepFeedback?.status === 'correct') return;

    if (selectedClass === currentWord.initialClass) {
      setStepFeedback({
        status: 'correct',
        message: `Richtig! ${currentWord.initialLetter} gehört zur ${currentWord.initialClassName}.`,
      });
      setTimeout(() => {
        setStepFeedback(null);
        setGuidedStep('tone_mark');
      }, 700);
    } else {
      setStreak(0);
      setStepFeedback({
        status: 'wrong',
        message: `Nicht ganz: ${currentWord.initialLetter} gehört zur ${currentWord.initialClassName}!`,
      });
      // Mark as mistake
      if (!mistakes.some((m) => m.id === currentWord.id)) {
        setMistakes((prev) => [...prev, currentWord]);
      }
    }
  };

  // Handle Guided Step 2: Tone Mark
  const handleSelectToneMark = (
    selectedMark: 'none' | 'mai_ek' | 'mai_tho' | 'mai_tri' | 'mai_chattawa'
  ) => {
    if (stepFeedback?.status === 'correct') return;

    if (selectedMark === currentWord.toneMark) {
      setStepFeedback({
        status: 'correct',
        message:
          currentWord.toneMark === 'none'
            ? 'Richtig! Kein Tonzeichen vorhanden.'
            : `Richtig erkannt: ${currentWord.toneMarkName}!`,
      });
      setTimeout(() => {
        setStepFeedback(null);
        // If tone mark is present, tone mark rules determine the tone without needing live/dead check!
        if (currentWord.toneMark !== 'none') {
          setGuidedStep('result_tone');
        } else {
          setGuidedStep('syllable_type');
        }
      }, 700);
    } else {
      setStreak(0);
      setStepFeedback({
        status: 'wrong',
        message: `Schau genauer hin: Die Silbe hat ${currentWord.toneMarkName}.`,
      });
      if (!mistakes.some((m) => m.id === currentWord.id)) {
        setMistakes((prev) => [...prev, currentWord]);
      }
    }
  };

  // Handle Guided Step 3: Syllable Type (Live vs Dead)
  const handleSelectSyllableType = (selectedType: 'live' | 'dead') => {
    if (stepFeedback?.status === 'correct') return;

    if (selectedType === currentWord.syllableType) {
      setStepFeedback({
        status: 'correct',
        message: `Richtig! ${currentWord.syllableTypeName} (${currentWord.vowelLengthName}).`,
      });
      setTimeout(() => {
        setStepFeedback(null);
        setGuidedStep('result_tone');
      }, 700);
    } else {
      setStreak(0);
      setStepFeedback({
        status: 'wrong',
        message: `Fast: Dies ist eine ${currentWord.syllableTypeName}!`,
      });
      if (!mistakes.some((m) => m.id === currentWord.id)) {
        setMistakes((prev) => [...prev, currentWord]);
      }
    }
  };

  // Handle Guided Step 4: Resulting Tone Pick
  const handleSelectResultTone = (selectedTone: ThaiTone) => {
    if (guidedStep === 'resolved') return;

    if (selectedTone === currentWord.tone) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      setCorrectCount((prev) => prev + 1);
      setGuidedStep('resolved');
      handlePlayAudio(currentWord.thai);
    } else {
      setStreak(0);
      setWrongCount((prev) => prev + 1);
      if (!mistakes.some((m) => m.id === currentWord.id)) {
        setMistakes((prev) => [...prev, currentWord]);
      }
      setStepFeedback({
        status: 'wrong',
        message: `Falscher Ton. Die richtige Regel ergibt: ${THAI_TONES[currentWord.tone].germanName}-Ton!`,
      });
      setGuidedStep('resolved');
      handlePlayAudio(currentWord.thai);
    }
  };

  // Handle Speed Quiz Mode Choice
  const handleSelectSpeedTone = (selectedTone: ThaiTone) => {
    if (speedAnswerStatus !== 'idle') return;

    setSelectedToneSpeed(selectedTone);
    handlePlayAudio(currentWord.thai);

    if (selectedTone === currentWord.tone) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      setCorrectCount((prev) => prev + 1);
      setSpeedAnswerStatus('correct');
    } else {
      setStreak(0);
      setWrongCount((prev) => prev + 1);
      setSpeedAnswerStatus('wrong');
      if (!mistakes.some((m) => m.id === currentWord.id)) {
        setMistakes((prev) => [...prev, currentWord]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#18181A] rounded-3xl border border-[#2C2C2E] shadow-2xl flex flex-col max-h-[94vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-4 border-b border-[#2C2C2E] flex items-center justify-between gap-3 bg-[#1C1C1E]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#FF7A00]/15 border border-[#FF7A00]/40 flex items-center justify-center text-[#FF7A00]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-white tracking-tight">Ton-Detektiv</h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FF7A00] text-black">
                  Trainer
                </span>
              </div>
              <p className="text-[11px] text-[#8E8E93]">Die 15 thailändischen Tonregeln meistern</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Peeking at Rules Cheatsheet */}
            <button
              onClick={() => setShowCheatsheetPeek(true)}
              className="p-2 rounded-xl bg-[#242426] border border-[#323236] text-[#8E8E93] hover:text-white transition-colors"
              title="Tonregeln-Übersicht spicken"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#242426] border border-[#323236] text-[#8E8E93] hover:text-white transition-colors"
              title="Trainer schließen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Level & Mode Selector Bar */}
        <div className="px-4 py-3 bg-[#1C1C1E]/80 border-b border-[#2C2C2E] flex items-center justify-between gap-2 text-xs">
          {/* Level Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowLevelDropdown(!showLevelDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#242426] border border-[#323236] text-white font-medium hover:border-[#FF7A00]/50 transition-colors"
            >
              <span className="text-[#FF7A00] font-bold">
                {selectedLevelId === 'deck'
                  ? 'Eigene Vokabeln'
                  : `Level ${selectedLevelId}`}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8E8E93]" />
            </button>

            {/* Level Dropdown Menu */}
            {showLevelDropdown && (
              <div className="absolute left-0 top-full mt-1.5 w-64 bg-[#242426] border border-[#3A3A3D] rounded-2xl p-1.5 shadow-2xl z-30 space-y-1">
                {CURATED_TONE_LEVELS.map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => {
                      setShowLevelDropdown(false);
                      startNewSession(lvl.id);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      selectedLevelId === lvl.id
                        ? 'bg-[#FF7A00] text-black font-bold'
                        : 'text-[#D1D1D6] hover:bg-[#2C2C2E]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{lvl.title}</div>
                      <div
                        className={`text-[10px] ${
                          selectedLevelId === lvl.id ? 'text-black/80' : 'text-[#8E8E93]'
                        }`}
                      >
                        {lvl.words.length} Wörter • {lvl.badge}
                      </div>
                    </div>
                  </button>
                ))}

                {/* Deck Vocabs Option */}
                {deckVocabs.length > 0 && (
                  <button
                    onClick={() => {
                      setShowLevelDropdown(false);
                      startNewSession('deck');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between border-t border-[#323236] transition-colors ${
                      selectedLevelId === 'deck'
                        ? 'bg-[#FF7A00] text-black font-bold'
                        : 'text-[#D1D1D6] hover:bg-[#2C2C2E]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">📚 Eigene Vokabeln</div>
                      <div
                        className={`text-[10px] ${
                          selectedLevelId === 'deck' ? 'text-black/80' : 'text-[#8E8E93]'
                        }`}
                      >
                        {deckVocabs.length} Wörter aus deinem Deck
                      </div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1 bg-[#242426] p-0.5 rounded-xl border border-[#323236]">
            <button
              onClick={() => {
                if (mode !== 'guided') startNewSession(selectedLevelId, 'guided');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                mode === 'guided'
                  ? 'bg-[#FF7A00] text-black shadow-sm'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              Geführt
            </button>
            <button
              onClick={() => {
                if (mode !== 'speed') startNewSession(selectedLevelId, 'speed');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
                mode === 'speed'
                  ? 'bg-[#FF7A00] text-black shadow-sm'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Speed-Quiz</span>
            </button>
          </div>

          {/* Streak Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            <span>{streak}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#242426] h-1.5">
          <div
            className="bg-[#FF7A00] h-1.5 transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / Math.max(wordPool.length, 1)) * 100}%`,
            }}
          />
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto">
          {!isCompleted ? (
            <div className="space-y-4">
              {/* Question Progress Meta */}
              <div className="flex items-center justify-between text-xs text-[#8E8E93]">
                <span>
                  Wort <strong className="text-white">{currentIndex + 1}</strong> von {wordPool.length}
                </span>
                <span className="text-[11px]">
                  {correctCount} richtig • {wrongCount} Fehler
                </span>
              </div>

              {/* Main Thai Word Stage */}
              <div className="relative p-6 rounded-3xl bg-gradient-to-b from-[#242426] to-[#1C1C1E] border border-[#323236] text-center shadow-lg group isolate">
                {/* Audio Speaker Button */}
                <button
                  type="button"
                  onClick={() => handlePlayAudio(currentWord.thai)}
                  className="absolute top-3 right-3 p-2.5 rounded-2xl bg-[#1C1C1E] border border-[#3A3A3D] text-[#FF7A00] hover:text-white hover:bg-[#FF7A00]/20 transition-all active:scale-95 shadow-sm"
                  title="Wort anhören"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                {/* Romanization visibility toggle */}
                <button
                  type="button"
                  onClick={() => setShowRomanization(!showRomanization)}
                  className="absolute top-3 left-3 p-2.5 rounded-2xl bg-[#1C1C1E] border border-[#3A3A3D] text-[#8E8E93] hover:text-white transition-colors"
                  title="Lautschrift ein/ausblenden"
                >
                  {showRomanization ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>

                {/* Multi-Syllable Chips if word has > 1 syllable */}
                {currentWord.syllables && currentWord.syllables.length > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mb-2.5 flex-wrap">
                    {currentWord.syllables.map((s, idx) => {
                      const isCurrent = idx === 0;
                      return (
                        <span
                          key={idx}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all ${
                            isCurrent
                              ? 'bg-[#FF7A00]/20 border-[#FF7A00]/50 text-[#FF7A00] ring-1 ring-[#FF7A00]/30 shadow-sm'
                              : 'bg-[#1C1C1E] border-[#2C2C2E] text-[#8E8E93]'
                          }`}
                        >
                          <span className="font-thai font-bold text-white mr-1">{s.syllable}</span>
                          <span className="text-[10px] opacity-80">({s.romanization})</span>
                          {isCurrent && (
                            <span className="ml-1 text-[9px] uppercase px-1 py-0.5 rounded bg-[#FF7A00] text-black font-bold">
                              Fokus
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Thai Word */}
                <div className="my-2">
                  <span className="text-5xl sm:text-6xl font-bold font-thai text-white tracking-wide drop-shadow-md select-none inline-block">
                    {currentWord.thai}
                  </span>
                </div>

                {/* Romanization & Meaning */}
                <div className="mt-2 space-y-1">
                  <div className="h-5">
                    {showRomanization || guidedStep === 'resolved' || speedAnswerStatus !== 'idle' ? (
                      <span className="text-sm font-semibold text-[#FF7A00] tracking-wide animate-in fade-in">
                        {currentWord.romanization}
                      </span>
                    ) : (
                      <span className="text-xs text-[#636366] italic">
                        Lautschrift verdeckt (tippe 👁 zum Spicken)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#8E8E93] font-medium">{currentWord.meaning}</div>
                </div>
              </div>

              {/* MODE 1: GEFÜHRTE ANALYSE (Step by Step) */}
              {mode === 'guided' && (
                <div className="space-y-4 animate-in fade-in">
                  {/* Step Indicators */}
                  <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-semibold">
                    <div
                      className={`py-1 rounded-lg border ${
                        guidedStep === 'initial_class'
                          ? 'border-[#FF7A00] text-[#FF7A00] bg-[#FF7A00]/10'
                          : 'border-[#2C2C2E] text-[#8E8E93] bg-[#1C1C1E]'
                      }`}
                    >
                      1. Klasse
                    </div>
                    <div
                      className={`py-1 rounded-lg border ${
                        guidedStep === 'tone_mark'
                          ? 'border-[#FF7A00] text-[#FF7A00] bg-[#FF7A00]/10'
                          : 'border-[#2C2C2E] text-[#8E8E93] bg-[#1C1C1E]'
                      }`}
                    >
                      2. Zeichen
                    </div>
                    <div
                      className={`py-1 rounded-lg border ${
                        guidedStep === 'syllable_type'
                          ? 'border-[#FF7A00] text-[#FF7A00] bg-[#FF7A00]/10'
                          : 'border-[#2C2C2E] text-[#8E8E93] bg-[#1C1C1E]'
                      }`}
                    >
                      3. Silbenart
                    </div>
                    <div
                      className={`py-1 rounded-lg border ${
                        guidedStep === 'result_tone' || guidedStep === 'resolved'
                          ? 'border-[#FF7A00] text-[#FF7A00] bg-[#FF7A00]/10'
                          : 'border-[#2C2C2E] text-[#8E8E93] bg-[#1C1C1E]'
                      }`}
                    >
                      4. Ton
                    </div>
                  </div>

                  {/* Feedback Message */}
                  {stepFeedback && (
                    <div
                      className={`p-3 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in ${
                        stepFeedback.status === 'correct'
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                      }`}
                    >
                      {stepFeedback.status === 'correct' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      )}
                      <span>{stepFeedback.message}</span>
                    </div>
                  )}

                  {/* STEP 1: Consonant Class */}
                  {guidedStep === 'initial_class' && (
                    <div className="space-y-2.5">
                      <div className="text-xs text-white font-medium text-center">
                        Schritt 1: Zu welcher Klasse gehört der Anfangsbuchstabe{' '}
                        <span className="text-base font-bold font-thai text-[#FF7A00]">
                          {currentWord.initialLetter}
                        </span>
                        {currentWord.syllables && currentWord.syllables.length > 1 && (
                          <span className="text-[11px] text-[#A1A1A6] ml-1">
                            (Silbe 1: {currentWord.targetSyllableText || currentWord.syllables[0].syllable})
                          </span>
                        )}
                        ?
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleSelectInitialClass('mid')}
                          className="py-3.5 px-2 rounded-2xl bg-[#242426] border border-amber-400/30 text-amber-400 hover:bg-amber-400/15 font-semibold text-xs flex flex-col items-center gap-1 transition-all active:scale-95 shadow-sm min-h-[48px]"
                        >
                          <span className="text-sm font-bold">Mittel</span>
                          <span className="text-[10px] text-amber-400/70">กลาง (9)</span>
                        </button>
                        <button
                          onClick={() => handleSelectInitialClass('high')}
                          className="py-3.5 px-2 rounded-2xl bg-[#242426] border border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/15 font-semibold text-xs flex flex-col items-center gap-1 transition-all active:scale-95 shadow-sm min-h-[48px]"
                        >
                          <span className="text-sm font-bold">Hoch</span>
                          <span className="text-[10px] text-emerald-400/70">สูง (11)</span>
                        </button>
                        <button
                          onClick={() => handleSelectInitialClass('low')}
                          className="py-3.5 px-2 rounded-2xl bg-[#242426] border border-sky-400/30 text-sky-400 hover:bg-sky-400/15 font-semibold text-xs flex flex-col items-center gap-1 transition-all active:scale-95 shadow-sm min-h-[48px]"
                        >
                          <span className="text-sm font-bold">Tief</span>
                          <span className="text-[10px] text-sky-400/70">ต่ำ (24)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Tone Mark */}
                  {guidedStep === 'tone_mark' && (
                    <div className="space-y-2.5">
                      <div className="text-xs text-white font-medium text-center">
                        Schritt 2: Welches Tonzeichen hat{' '}
                        {currentWord.syllables && currentWord.syllables.length > 1 ? (
                          <>die Silbe <span className="font-thai font-bold text-[#FF7A00]">{currentWord.targetSyllableText || currentWord.syllables[0].syllable}</span>?</>
                        ) : (
                          'das Wort?'
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <button
                          onClick={() => handleSelectToneMark('none')}
                          className="py-3 px-2 rounded-2xl bg-[#242426] border border-[#3A3A3D] text-white hover:border-[#FF7A00]/50 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 min-h-[48px]"
                        >
                          <span>—</span>
                          <span>Kein Zeichen</span>
                        </button>
                        <button
                          onClick={() => handleSelectToneMark('mai_ek')}
                          className="py-3 px-2 rounded-2xl bg-[#242426] border border-[#3A3A3D] text-white hover:border-[#FF7A00]/50 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 min-h-[48px]"
                        >
                          <span className="text-lg font-thai font-bold text-[#FF7A00]">่</span>
                          <span>Mai Ek</span>
                        </button>
                        <button
                          onClick={() => handleSelectToneMark('mai_tho')}
                          className="py-3 px-2 rounded-2xl bg-[#242426] border border-[#3A3A3D] text-white hover:border-[#FF7A00]/50 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 min-h-[48px]"
                        >
                          <span className="text-lg font-thai font-bold text-[#FF7A00]">้</span>
                          <span>Mai Tho</span>
                        </button>
                        <button
                          onClick={() => handleSelectToneMark('mai_tri')}
                          className="py-3 px-2 rounded-2xl bg-[#242426] border border-[#3A3A3D] text-white hover:border-[#FF7A00]/50 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 min-h-[48px]"
                        >
                          <span className="text-lg font-thai font-bold text-[#FF7A00]">๊</span>
                          <span>Mai Tri</span>
                        </button>
                        <button
                          onClick={() => handleSelectToneMark('mai_chattawa')}
                          className="py-3 px-2 rounded-2xl bg-[#242426] border border-[#3A3A3D] text-white hover:border-[#FF7A00]/50 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 min-h-[48px] col-span-2 sm:col-span-1"
                        >
                          <span className="text-lg font-thai font-bold text-[#FF7A00]">๋</span>
                          <span>Mai Chattawa</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Syllable Type (Live vs Dead) */}
                  {guidedStep === 'syllable_type' && (
                    <div className="space-y-2.5">
                      <div className="text-xs text-white font-medium text-center">
                        Schritt 3: Ist{' '}
                        {currentWord.syllables && currentWord.syllables.length > 1 ? (
                          <>Silbe 1 (<span className="font-thai font-bold text-[#FF7A00]">{currentWord.targetSyllableText || currentWord.syllables[0].syllable}</span>)</>
                        ) : (
                          'die Silbe'
                        )}{' '}
                        lebend oder tot?
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          onClick={() => handleSelectSyllableType('live')}
                          className="p-3.5 rounded-2xl bg-[#242426] border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/15 font-semibold text-xs flex flex-col items-center gap-1.5 transition-all active:scale-95 min-h-[48px]"
                        >
                          <span className="text-lg">🕊️</span>
                          <span className="font-bold">Lebend (คำเป็น)</span>
                          <span className="text-[10px] text-emerald-300/80 text-center">
                            Langer Vokal ODER Sonorant (-m, -n, -ng, -y, -w)
                          </span>
                        </button>
                        <button
                          onClick={() => handleSelectSyllableType('dead')}
                          className="p-3.5 rounded-2xl bg-[#242426] border border-rose-500/30 text-rose-400 hover:bg-rose-500/15 font-semibold text-xs flex flex-col items-center gap-1.5 transition-all active:scale-95 min-h-[48px]"
                        >
                          <span className="text-lg">🛑</span>
                          <span className="font-bold">Tot (คำตาย)</span>
                          <span className="text-[10px] text-rose-300/80 text-center">
                            Kurzer Vokal ODER Plosiv-Stopp (-k, -p, -t)
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Pick Resulting Tone */}
                  {guidedStep === 'result_tone' && (
                    <div className="space-y-2.5">
                      <div className="text-xs text-white font-medium text-center">
                        Schritt 4: Welcher Ton ergibt sich{' '}
                        {currentWord.syllables && currentWord.syllables.length > 1 ? (
                          <>für Silbe 1 (<span className="font-thai font-bold text-[#FF7A00]">{currentWord.targetSyllableText || currentWord.syllables[0].syllable}</span>)</>
                        ) : (
                          'aus den Regeln'
                        )}?
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {(['mid', 'low', 'falling', 'high', 'rising'] as ThaiTone[]).map((toneKey) => {
                          const info = THAI_TONES[toneKey];
                          return (
                            <button
                              key={toneKey}
                              onClick={() => handleSelectResultTone(toneKey)}
                              className={`py-3 px-1 rounded-2xl border ${info.bgClass} ${info.borderClass} ${info.colorClass} hover:opacity-100 font-semibold text-xs flex flex-col items-center gap-1 transition-all active:scale-95 min-h-[48px]`}
                            >
                              <span className="text-sm font-bold">{info.symbol}</span>
                              <span className="text-[11px] font-bold">{info.germanName}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* STEP 5: Resolved Card */}
                  {guidedStep === 'resolved' && (
                    <div className="p-4 rounded-3xl bg-[#242426] border border-[#3A3A3D] space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span className="text-sm font-bold text-white">Auflösung & Tonregel</span>
                        </div>
                        <ToneVisualizer
                          thai={currentWord.thai}
                          romanization={currentWord.romanization}
                          compact
                        />
                      </div>

                      {/* Formula Card */}
                      <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-[#2C2C2E] text-xs space-y-2">
                        <div className="flex items-center justify-between text-[#8E8E93] text-[10px] font-medium uppercase tracking-wider">
                          <span>Herleitung</span>
                          {currentWord.syllables && currentWord.syllables.length > 1 && (
                            <span className="text-[#FF7A00] font-semibold">{currentWord.syllables.length} Silben</span>
                          )}
                        </div>

                        {currentWord.syllables && currentWord.syllables.length > 1 ? (
                          <div className="space-y-2 pt-1 max-h-60 overflow-y-auto pr-1">
                            {currentWord.syllables.map((s, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded-xl bg-[#242426] border border-[#323236] space-y-1 text-left"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 font-bold">
                                    <span className="text-white font-thai text-base">{s.syllable}</span>
                                    <span className="text-[#FF7A00] text-xs">({s.romanization})</span>
                                  </div>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${THAI_TONES[s.tone].bgClass} ${THAI_TONES[s.tone].borderClass} ${THAI_TONES[s.tone].colorClass}`}>
                                    {THAI_TONES[s.tone].germanName}-Ton {THAI_TONES[s.tone].symbol}
                                  </span>
                                </div>
                                <div className="text-[11px] font-medium text-[#E5E5EA]">
                                  {s.ruleFormula}
                                </div>
                                <div className="text-[10px] text-[#8E8E93] leading-relaxed">
                                  {s.ruleTip}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <>
                            <div className="font-semibold text-[#FF7A00]">{currentWord.ruleFormula}</div>
                            <div className="text-[11px] text-[#A1A1A6] mt-1.5 leading-relaxed">{currentWord.ruleTip}</div>
                          </>
                        )}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={goToNextWord}
                        className="w-full py-3.5 rounded-full bg-[#FF7A00] text-black font-semibold text-sm hover:bg-[#FF881A] transition-colors shadow-md flex items-center justify-center gap-2 active:scale-[0.98]"
                      >
                        <span>Nächstes Wort</span>
                        <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* MODE 2: SPEED-QUIZ (Direkte Ton-Auswahl) */}
              {mode === 'speed' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="text-xs text-white font-medium text-center">
                    {currentWord.syllables && currentWord.syllables.length > 1 ? (
                      <>Welchen Ton hat Silbe 1 (<span className="font-thai font-bold text-[#FF7A00]">{currentWord.targetSyllableText || currentWord.syllables[0].syllable}</span>) dieses Wortes?</>
                    ) : (
                      'Welchen Ton hat dieses Wort?'
                    )}
                  </div>

                  {/* Direct 5 Tone Buttons */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {(['mid', 'low', 'falling', 'high', 'rising'] as ThaiTone[]).map((toneKey) => {
                      const info = THAI_TONES[toneKey];
                      const isSelected = selectedToneSpeed === toneKey;
                      const isTarget = currentWord.tone === toneKey;

                      let buttonStateClass = `${info.bgClass} ${info.borderClass} ${info.colorClass}`;
                      if (speedAnswerStatus !== 'idle') {
                        if (isTarget) {
                          buttonStateClass =
                            'bg-emerald-500/25 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400';
                        } else if (isSelected && !isTarget) {
                          buttonStateClass =
                            'bg-rose-500/25 border-rose-400 text-rose-300 line-through opacity-60';
                        } else {
                          buttonStateClass = 'opacity-40 border-[#2C2C2E] text-[#8E8E93]';
                        }
                      }

                      return (
                        <button
                          key={toneKey}
                          disabled={speedAnswerStatus !== 'idle'}
                          onClick={() => handleSelectSpeedTone(toneKey)}
                          className={`py-3.5 px-1 rounded-2xl border font-semibold text-xs flex flex-col items-center gap-1 transition-all active:scale-95 min-h-[48px] ${buttonStateClass}`}
                        >
                          <span className="text-sm font-bold">{info.symbol}</span>
                          <span className="text-[11px] font-bold">{info.germanName}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Speed Feedback & Immediate Educational Breakdown */}
                  {speedAnswerStatus !== 'idle' && (
                    <div className="p-4 rounded-3xl bg-[#242426] border border-[#3A3A3D] space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {speedAnswerStatus === 'correct' ? (
                            <>
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              <span className="text-sm font-bold text-emerald-400">
                                Richtig! (+1 Serie)
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-5 h-5 text-rose-400" />
                              <span className="text-sm font-bold text-rose-400">
                                Falsch – Richtiger Ton: {THAI_TONES[currentWord.tone].germanName}
                              </span>
                            </>
                          )}
                        </div>
                        <ToneVisualizer
                          thai={currentWord.thai}
                          romanization={currentWord.romanization}
                          compact
                        />
                      </div>

                      {/* Formula & Rule Tip */}
                      <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-[#2C2C2E] text-xs space-y-2">
                        <div className="flex items-center justify-between text-[#8E8E93] text-[10px] font-medium uppercase tracking-wider">
                          <span>Regel-Herleitung</span>
                          {currentWord.syllables && currentWord.syllables.length > 1 && (
                            <span className="text-[#FF7A00] font-semibold">{currentWord.syllables.length} Silben</span>
                          )}
                        </div>

                        {currentWord.syllables && currentWord.syllables.length > 1 ? (
                          <div className="space-y-2 pt-1 max-h-60 overflow-y-auto pr-1">
                            {currentWord.syllables.map((s, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded-xl bg-[#242426] border border-[#323236] space-y-1 text-left"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 font-bold">
                                    <span className="text-white font-thai text-base">{s.syllable}</span>
                                    <span className="text-[#FF7A00] text-xs">({s.romanization})</span>
                                  </div>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${THAI_TONES[s.tone].bgClass} ${THAI_TONES[s.tone].borderClass} ${THAI_TONES[s.tone].colorClass}`}>
                                    {THAI_TONES[s.tone].germanName}-Ton {THAI_TONES[s.tone].symbol}
                                  </span>
                                </div>
                                <div className="text-[11px] font-medium text-[#E5E5EA]">
                                  {s.ruleFormula}
                                </div>
                                <div className="text-[10px] text-[#8E8E93] leading-relaxed">
                                  {s.ruleTip}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <>
                            <div className="font-semibold text-[#FF7A00]">{currentWord.ruleFormula}</div>
                            <div className="text-[11px] text-[#A1A1A6] mt-1.5 leading-relaxed">{currentWord.ruleTip}</div>
                          </>
                        )}
                      </div>

                      {/* Continue Button */}
                      <button
                        onClick={goToNextWord}
                        className="w-full py-3.5 rounded-full bg-[#FF7A00] text-black font-semibold text-sm hover:bg-[#FF881A] transition-colors shadow-md flex items-center justify-center gap-2 active:scale-[0.98]"
                      >
                        <span>Weiter</span>
                        <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* COMPLETION SCREEN */
            <div className="py-6 px-2 text-center space-y-6 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-[#FF7A00]/20 border-2 border-[#FF7A00] flex items-center justify-center mx-auto text-[#FF7A00] shadow-xl">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">Runde abgeschlossen!</h3>
                <p className="text-xs text-[#8E8E93] mt-1">
                  Du hast alle Wörter dieses Levels durchgearbeitet.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3.5 rounded-2xl bg-[#242426] border border-[#323236]">
                  <div className="text-[10px] text-[#8E8E93] uppercase font-semibold">Quote</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">
                    {Math.round((correctCount / Math.max(wordPool.length, 1)) * 100)}%
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#242426] border border-[#323236]">
                  <div className="text-[10px] text-[#8E8E93] uppercase font-semibold">Max Serie</div>
                  <div className="text-lg font-bold text-amber-400 mt-0.5 flex items-center justify-center gap-1">
                    <Flame className="w-4 h-4 fill-amber-400" />
                    <span>{maxStreak}</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#242426] border border-[#323236]">
                  <div className="text-[10px] text-[#8E8E93] uppercase font-semibold">Fehler</div>
                  <div className="text-lg font-bold text-rose-400 mt-0.5">{wrongCount}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {mistakes.length > 0 && (
                  <button
                    onClick={startRevengeSession}
                    className="w-full py-3.5 rounded-full bg-[#242426] border border-rose-500/40 text-rose-300 font-semibold text-xs hover:bg-[#2C2C2E] transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4 text-rose-400" />
                    <span>Die {mistakes.length} falschen Wörter wiederholen</span>
                  </button>
                )}

                {typeof selectedLevelId === 'number' && selectedLevelId < 5 && (
                  <button
                    onClick={() => startNewSession(selectedLevelId + 1)}
                    className="w-full py-3.5 rounded-full bg-[#FF7A00] text-black font-semibold text-sm hover:bg-[#FF881A] transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Nächstes Level starten (Level {selectedLevelId + 1})</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                )}

                <button
                  onClick={() => startNewSession(selectedLevelId)}
                  className="w-full py-3 rounded-full text-xs text-[#8E8E93] hover:text-white transition-colors"
                >
                  Dieses Level nochmal üben
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CHEATSHEET QUICK PEEK MODAL OVERLAY */}
        {showCheatsheetPeek && (
          <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex flex-col p-3 overflow-hidden animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#2C2C2E]">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#FF7A00]" />
                <span className="text-xs font-bold text-white">Tonregeln Spickzettel</span>
              </div>
              <button
                onClick={() => setShowCheatsheetPeek(false)}
                className="p-1.5 rounded-xl bg-[#242426] text-[#8E8E93] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pt-2">
              <ToneRulesCheatsheet isModal onClose={() => setShowCheatsheetPeek(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
