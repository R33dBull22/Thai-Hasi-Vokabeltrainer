import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Volume2,
  Headphones,
  Check,
  X,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Trophy,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Vocabulary } from '../types/vocab';
import { speakThai, stopThaiSpeech } from '../utils/thaiAudio';
import { ToneVisualizer } from './ToneVisualizer';

interface ListeningSessionProps {
  cards: Vocabulary[];
  poolVocabularies: Vocabulary[];
  onFinish: () => void;
}

interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

export const ListeningSession: React.FC<ListeningSessionProps> = ({
  cards,
  poolVocabularies,
  onFinish,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<{ vocab: Vocabulary; chosen: string }[]>([]);

  const currentCard = cards[currentIndex];

  // Generate 4 Multiple-Choice Options (1 correct + 3 distractors)
  const currentOptions: QuestionOption[] = useMemo(() => {
    if (!currentCard) return [];

    const correctText = currentCard.german;

    // 1. First priority: distractors from same lesson
    const sameLessonDistractors = poolVocabularies
      .filter((v) => v.id !== currentCard.id && v.german !== correctText && v.lesson === currentCard.lesson)
      .map((v) => v.german);

    // 2. Second priority: distractors from any lesson in pool
    const otherDistractors = poolVocabularies
      .filter((v) => v.id !== currentCard.id && v.german !== correctText && v.lesson !== currentCard.lesson)
      .map((v) => v.german);

    // Unique set of distractors
    const chosenDistractors: string[] = [];
    const usedTexts = new Set<string>([correctText]);

    // Shuffle same lesson
    const shuffledSame = [...sameLessonDistractors].sort(() => Math.random() - 0.5);
    for (const text of shuffledSame) {
      if (!usedTexts.has(text)) {
        usedTexts.add(text);
        chosenDistractors.push(text);
        if (chosenDistractors.length === 3) break;
      }
    }

    // Fill up with others if needed
    if (chosenDistractors.length < 3) {
      const shuffledOthers = [...otherDistractors].sort(() => Math.random() - 0.5);
      for (const text of shuffledOthers) {
        if (!usedTexts.has(text)) {
          usedTexts.add(text);
          chosenDistractors.push(text);
          if (chosenDistractors.length === 3) break;
        }
      }
    }

    // Assemble options
    const allList: QuestionOption[] = [
      { text: correctText, isCorrect: true },
      ...chosenDistractors.map((text) => ({ text, isCorrect: false })),
    ];

    // Shuffle options
    return allList.sort(() => Math.random() - 0.5);
  }, [currentCard, poolVocabularies]);

  // Stop any audio on unmount
  useEffect(() => {
    return () => {
      stopThaiSpeech();
    };
  }, []);

  // Play audio for current card
  const handlePlayAudio = useCallback(() => {
    if (!currentCard) return;
    setIsPlayingAudio(true);
    speakThai(currentCard.thai, () => {
      setIsPlayingAudio(false);
    });
    // Safety fallback timer
    setTimeout(() => setIsPlayingAudio(false), 2000);
  }, [currentCard]);

  // Autoplay audio on new card
  useEffect(() => {
    if (currentCard && !isCompleted) {
      setSelectedOptionIndex(null);
      setIsAnswered(false);
      // Small delay for smooth mounting transition
      const timer = setTimeout(() => {
        handlePlayAudio();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentCard, isCompleted, handlePlayAudio]);

  // Handle option selection
  const handleSelectOption = (index: number) => {
    if (isAnswered) return;

    const chosen = currentOptions[index];
    setSelectedOptionIndex(index);
    setIsAnswered(true);

    if (chosen.isCorrect) {
      setScore((prev) => prev + 1);
      // Confetti burst for correct guess
      try {
        confetti({
          particleCount: 25,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#FF7A00', '#10B981', '#3B82F6'],
        });
      } catch {}
    } else {
      setWrongAnswers((prev) => [
        ...prev,
        { vocab: currentCard, chosen: chosen.text },
      ]);
    }
  };

  // Next card handler
  const handleNext = () => {
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  // Keyboard shortcuts (1, 2, 3, 4, Space, Enter, R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input/textarea
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (!isAnswered) {
        if (e.key === '1' && currentOptions.length > 0) handleSelectOption(0);
        else if (e.key === '2' && currentOptions.length > 1) handleSelectOption(1);
        else if (e.key === '3' && currentOptions.length > 2) handleSelectOption(2);
        else if (e.key === '4' && currentOptions.length > 3) handleSelectOption(3);
        else if (e.key.toLowerCase() === 'r' || e.key === ' ') {
          e.preventDefault();
          handlePlayAudio();
        }
      } else {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNext();
        } else if (e.key.toLowerCase() === 'r') {
          e.preventDefault();
          handlePlayAudio();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, currentOptions, handlePlayAudio, handleNext]);

  // Restart session
  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswered(false);
    setScore(0);
    setIsCompleted(false);
    setWrongAnswers([]);
  };

  // Completion View
  if (isCompleted) {
    const percentage = Math.round((score / cards.length) * 100);

    return (
      <div className="fixed inset-0 z-50 bg-[#121214] text-white flex flex-col justify-between p-4 overflow-y-auto animate-in fade-in">
        <div className="max-w-md w-full mx-auto my-auto py-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FF7A00]/25 to-[#FF7A00]/5 border-2 border-[#FF7A00] flex items-center justify-center mx-auto text-4xl shadow-xl">
            {percentage >= 80 ? '🏆' : percentage >= 50 ? '🎧' : '💪'}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Hörverstehen abgeschlossen!
            </h1>
            <p className="text-xs text-[#8E8E93] mt-1">
              Gehörtraining mit Multiple-Choice-Antworten
            </p>
          </div>

          {/* Score card */}
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl p-6 shadow-lg space-y-3">
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-extrabold text-[#FF7A00]">
                {score}
              </span>
              <span className="text-2xl font-semibold text-[#8E8E93]">
                / {cards.length}
              </span>
            </div>

            <div className="w-full bg-[#2C2C2E] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#FF7A00] h-full transition-all duration-500 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <p className="text-sm font-semibold text-white">
              {percentage}% richtige Antworten
            </p>

            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              {percentage >= 80
                ? 'Hervorragendes Gehör! Du erkennst die thailändischen Wörter und Töne bereits sehr sicher.'
                : percentage >= 50
                ? 'Gute Leistung! Je öfter du thailändische Wörter hörst, desto vertrauter wird die Klangmelodie.'
                : 'Schöner Einstieg! Thailändisch gesprochen zu verstehen braucht Zeit und Übung. Weiter so!'}
            </p>
          </div>

          {/* Info note */}
          <div className="p-3 bg-sky-500/10 border border-sky-500/25 rounded-2xl text-[11px] text-sky-200 text-center">
            ℹ️ Deine Leitner-Phasen im Vokabeldeck wurden bei diesem freien Hörtraining wie gewünscht nicht verändert.
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleRestart}
              className="w-full py-4 rounded-full bg-[#FF7A00] text-black font-semibold text-base hover:bg-[#FF881A] transition-colors shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5 text-black stroke-[2.5]" />
              <span>Gleiche Vokabeln nochmal hören</span>
            </button>

            <button
              type="button"
              onClick={onFinish}
              className="w-full py-3.5 rounded-full bg-[#1C1C1E] border border-[#3A3A3D] text-white font-medium text-sm hover:bg-[#242426] transition-colors cursor-pointer"
            >
              Zurück zur Übersicht
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-[#121214] text-white flex flex-col justify-between p-4 overflow-y-auto">
      {/* Top Header */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between pb-3 pt-1 border-b border-[#2C2C2E]">
        <button
          type="button"
          onClick={onFinish}
          className="p-2 rounded-full bg-[#1C1C1E] text-[#8E8E93] hover:text-white transition-colors cursor-pointer"
          title="Hör-Sitzung beenden"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-[#FF7A00]" />
          <span className="text-xs font-semibold text-white">Hörverstehen</span>
          <span className="text-xs text-[#8E8E93]">
            ({currentIndex + 1} / {cards.length})
          </span>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-400">
          {score} richtig
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md mx-auto h-1.5 bg-[#2C2C2E] rounded-full overflow-hidden my-2">
        <div
          className="h-full bg-[#FF7A00] transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Card Content Area */}
      <div className="flex-1 w-full max-w-md mx-auto flex flex-col justify-center py-2 space-y-4">
        {/* Central Audio Card */}
        <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl p-6 text-center shadow-xl relative overflow-hidden">
          {/* Subtle audio waves decoration */}
          <div className="relative inline-block mb-3">
            <button
              type="button"
              onClick={handlePlayAudio}
              className={`w-24 h-24 rounded-full bg-gradient-to-br from-[#2A201A] to-[#1C1C1E] border-2 border-[#FF7A00] flex flex-col items-center justify-center text-[#FF7A00] shadow-lg active:scale-95 transition-all cursor-pointer relative group ${
                isPlayingAudio ? 'ring-8 ring-[#FF7A00]/20 scale-105' : 'hover:scale-105'
              }`}
            >
              <Volume2
                className={`w-10 h-10 transition-transform ${
                  isPlayingAudio ? 'scale-115 text-[#FFA040]' : 'group-hover:scale-110'
                }`}
              />
              <span className="text-[10px] font-semibold text-[#FF7A00] mt-1">
                {isPlayingAudio ? 'Spielt...' : 'Anhören'}
              </span>
            </button>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Höre genau hin
            </h2>
            <p className="text-xs text-[#8E8E93] mt-1">
              Tippe auf den Button oder drücke <kbd className="px-1.5 py-0.5 rounded bg-[#2C2C2E] border border-[#3A3A3D] text-[10px] text-white font-mono">R</kbd> zum Wiederholen
            </p>
          </div>

          {/* Revealed Word Details (Shown AFTER an answer has been chosen) */}
          {isAnswered && (
            <div className="mt-4 pt-4 border-t border-[#2C2C2E] animate-in fade-in duration-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-wider block">
                Aufgelöstes thailändisches Wort:
              </span>
              <h3 className="text-3xl font-thai font-semibold text-white tracking-normal">
                {currentCard.thai}
              </h3>
              {currentCard.romanization && (
                <p className="text-sm font-medium text-[#FF7A00]">
                  {currentCard.romanization}
                </p>
              )}

              {/* Tone Visualizer */}
              <div className="flex justify-center pt-1">
                <ToneVisualizer
                  romanization={currentCard.romanization}
                  thai={currentCard.thai}
                  showHelpIcon
                />
              </div>

              {currentCard.exampleThai && (
                <div className="pt-2 text-xs text-[#A1A1AA] bg-[#242426] rounded-xl p-2.5 border border-[#323236]">
                  <p className="font-thai text-white">{currentCard.exampleThai}</p>
                  {currentCard.exampleGerman && (
                    <p className="text-[11px] text-[#8E8E93] mt-0.5">{currentCard.exampleGerman}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Multiple Choice Options (4 Choices) */}
        <div className="space-y-2.5">
          <span className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider block px-1">
            Bedeutung auf Deutsch wählen:
          </span>

          <div className="grid grid-cols-1 gap-2">
            {currentOptions.map((opt, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              const isSelected = selectedOptionIndex === idx;

              let btnStyle = 'bg-[#242426] border-[#323236] text-white hover:bg-[#2C2C2E]';

              if (isAnswered) {
                if (opt.isCorrect) {
                  // Correct answer: always green
                  btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30';
                } else if (isSelected && !opt.isCorrect) {
                  // Wrong selection: red
                  btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-200 ring-2 ring-rose-500/30';
                } else {
                  // Neutral unchosen wrong: dimmed
                  btnStyle = 'bg-[#1C1C1E] border-[#2C2C2E] text-[#71717A] opacity-60';
                }
              }

              return (
                <button
                  key={`${opt.text}-${idx}`}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-3.5 rounded-2xl border text-left font-medium text-sm transition-all flex items-center justify-between cursor-pointer active:scale-[0.99] shadow-sm ${btnStyle}`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        isAnswered && opt.isCorrect
                          ? 'bg-emerald-500 text-black'
                          : isAnswered && isSelected && !opt.isCorrect
                          ? 'bg-rose-500 text-white'
                          : 'bg-[#1C1C1E] text-[#8E8E93] border border-[#3A3A3D]'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="truncate">{opt.text}</span>
                  </div>

                  {isAnswered && opt.isCorrect && (
                    <Check className="w-5 h-5 text-emerald-400 stroke-[3] shrink-0" />
                  )}
                  {isAnswered && isSelected && !opt.isCorrect && (
                    <X className="w-5 h-5 text-rose-400 stroke-[3] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="w-full max-w-md mx-auto pt-2 pb-1">
        {isAnswered ? (
          <button
            type="button"
            onClick={handleNext}
            className="w-full py-4 rounded-full bg-[#FF7A00] text-black font-semibold text-base hover:bg-[#FF881A] transition-colors shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer animate-in fade-in"
          >
            <span>{currentIndex + 1 < cards.length ? 'Nächste Vokabel' : 'Ergebnis ansehen'}</span>
            <ArrowRight className="w-5 h-5 text-black stroke-[2.5]" />
          </button>
        ) : (
          <div className="text-center py-2 text-xs text-[#8E8E93]">
            Tipp: Nutze die Tasten <kbd className="px-1.5 py-0.5 rounded bg-[#1C1C1E] border border-[#323236] text-[10px] text-white font-mono">1</kbd> - <kbd className="px-1.5 py-0.5 rounded bg-[#1C1C1E] border border-[#323236] text-[10px] text-white font-mono">4</kbd> auf der Tastatur
          </div>
        )}
      </div>
    </div>
  );
};
