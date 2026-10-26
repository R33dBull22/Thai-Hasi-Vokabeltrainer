import React, { useState, useMemo } from 'react';
import {
  X,
  Headphones,
  Check,
  RotateCcw,
  BookOpen,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { Vocabulary, UserProgress } from '../types/vocab';
import { isAnyDirectionDue } from '../utils/leitner';

interface ListeningSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  vocabularies: Vocabulary[];
  progressMap: Record<string, UserProgress>;
  onStart: (cards: Vocabulary[]) => void;
}

type ScopeType = 'due' | 'deck' | 'lesson' | 'all';

export const ListeningSetupModal: React.FC<ListeningSetupModalProps> = ({
  isOpen,
  onClose,
  vocabularies,
  progressMap,
  onStart,
}) => {
  const [scope, setScope] = useState<ScopeType>('due');
  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const [sessionLimit, setSessionLimit] = useState<number | 'all'>(15);

  // Group lessons
  const lessonsList = useMemo(() => {
    const map: Record<string, number> = {};
    vocabularies.forEach((v) => {
      const l = v.lesson || 'Allgemein';
      map[l] = (map[l] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [vocabularies]);

  // Deck cards
  const deckCards = useMemo(() => {
    return vocabularies.filter((v) => Boolean(progressMap[v.id]));
  }, [vocabularies, progressMap]);

  // Due cards
  const dueCards = useMemo(() => {
    return vocabularies.filter((v) => {
      const prog = progressMap[v.id];
      return prog && isAnyDirectionDue(prog);
    });
  }, [vocabularies, progressMap]);

  // Set default selected lesson
  React.useEffect(() => {
    if (!selectedLesson && lessonsList.length > 0) {
      setSelectedLesson(lessonsList[0].name);
    }
  }, [lessonsList, selectedLesson]);

  // Set default scope if no due cards
  React.useEffect(() => {
    if (dueCards.length === 0 && deckCards.length > 0) {
      setScope('deck');
    } else if (deckCards.length === 0 && vocabularies.length > 0) {
      setScope('all');
    }
  }, [dueCards.length, deckCards.length, vocabularies.length]);

  // Filter cards based on selected scope
  const targetCards = useMemo(() => {
    let pool: Vocabulary[] = [];
    if (scope === 'due') {
      pool = dueCards.length > 0 ? dueCards : deckCards;
    } else if (scope === 'deck') {
      pool = deckCards.length > 0 ? deckCards : vocabularies;
    } else if (scope === 'lesson') {
      pool = vocabularies.filter((v) => (v.lesson || 'Allgemein') === selectedLesson);
    } else {
      pool = vocabularies;
    }

    // Shuffle pool to ensure random listening practice
    const shuffled = [...pool].sort(() => Math.random() - 0.5);

    if (sessionLimit === 'all' || shuffled.length <= sessionLimit) {
      return shuffled;
    }
    return shuffled.slice(0, sessionLimit);
  }, [scope, dueCards, deckCards, vocabularies, selectedLesson, sessionLimit]);

  if (!isOpen) return null;

  const handleStartSession = () => {
    if (targetCards.length === 0) return;
    onStart(targetCards);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-safe pb-safe bg-black/80 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl w-full max-w-md max-h-[88vh] overflow-y-auto overscroll-contain touch-scroll text-white shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#1C1C1E]/95 backdrop-blur-md px-5 py-4 border-b border-[#2C2C2E] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#FF7A00]/25 to-[#FF7A00]/10 border border-[#FF7A00]/30 flex items-center justify-center text-[#FF7A00] shadow-sm">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>Hörverstehen trainieren</span>
              </h2>
              <p className="text-[11px] text-[#8E8E93]">
                Audio-Abfrage mit Multiple-Choice
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#242426] flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Info Banner: No impact on Leitner phases */}
          <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/25 flex items-start gap-2.5 text-xs text-sky-200">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Kein Einfluss auf Phasen:</strong> Diese Audio-Sitzung ist ein freies Training zur Gehörbildung und verändert deine Leitner-Phasen nicht.
            </p>
          </div>

          {/* Scope Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">
              Welche Vokabeln möchtest du hören?
            </label>

            <div className="grid grid-cols-1 gap-2">
              {/* Option 1: Due Cards */}
              <button
                type="button"
                onClick={() => setScope('due')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  scope === 'due'
                    ? 'bg-[#FF7A00]/15 border-[#FF7A00] text-white'
                    : 'bg-[#242426] border-[#323236] text-[#A1A1AA] hover:bg-[#2A2A2E]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      scope === 'due'
                        ? 'bg-[#FF7A00] text-black font-bold'
                        : 'bg-[#1C1C1E] text-[#8E8E93]'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Heute fällige Vokabeln
                    </p>
                    <p className="text-xs text-[#8E8E93]">
                      {dueCards.length > 0
                        ? `${dueCards.length} Vokabeln stehen heute an`
                        : 'Alle erledigt (nutzt Vokabeldeck)'}
                    </p>
                  </div>
                </div>
                {scope === 'due' && (
                  <Check className="w-4 h-4 text-[#FF7A00] stroke-[3]" />
                )}
              </button>

              {/* Option 2: All Deck Cards */}
              <button
                type="button"
                onClick={() => setScope('deck')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  scope === 'deck'
                    ? 'bg-[#FF7A00]/15 border-[#FF7A00] text-white'
                    : 'bg-[#242426] border-[#323236] text-[#A1A1AA] hover:bg-[#2A2A2E]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      scope === 'deck'
                        ? 'bg-[#FF7A00] text-black font-bold'
                        : 'bg-[#1C1C1E] text-[#8E8E93]'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Ganzes Vokabeldeck
                    </p>
                    <p className="text-xs text-[#8E8E93]">
                      {deckCards.length} Vokabeln im Lernprozess
                    </p>
                  </div>
                </div>
                {scope === 'deck' && (
                  <Check className="w-4 h-4 text-[#FF7A00] stroke-[3]" />
                )}
              </button>

              {/* Option 3: Specific Lesson */}
              <button
                type="button"
                onClick={() => setScope('lesson')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  scope === 'lesson'
                    ? 'bg-[#FF7A00]/15 border-[#FF7A00] text-white'
                    : 'bg-[#242426] border-[#323236] text-[#A1A1AA] hover:bg-[#2A2A2E]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      scope === 'lesson'
                        ? 'bg-[#FF7A00] text-black font-bold'
                        : 'bg-[#1C1C1E] text-[#8E8E93]'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Gezielt nach Lektion
                    </p>
                    <p className="text-xs text-[#8E8E93]">
                      Wähle eine bestimmte Lektion aus
                    </p>
                  </div>
                </div>
                {scope === 'lesson' && (
                  <Check className="w-4 h-4 text-[#FF7A00] stroke-[3]" />
                )}
              </button>
            </div>

            {/* Lesson Dropdown if scope === 'lesson' */}
            {scope === 'lesson' && (
              <div className="pt-1 animate-in fade-in">
                <select
                  value={selectedLesson}
                  onChange={(e) => setSelectedLesson(e.target.value)}
                  className="w-full bg-[#1C1C1E] border border-[#FF7A00]/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF7A00]"
                >
                  {lessonsList.map((l) => (
                    <option key={l.name} value={l.name}>
                      {l.name} ({l.count} Vokabeln)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Session Limit (How many cards) */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-2">
              Umfang der Sitzung:
            </label>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {[10, 15, 25, 'all'].map((limit) => (
                <button
                  key={limit}
                  type="button"
                  onClick={() => setSessionLimit(limit as number | 'all')}
                  className={`py-2 px-2 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                    sessionLimit === limit
                      ? 'bg-[#FF7A00] text-black border-[#FF7A00]'
                      : 'bg-[#242426] text-[#A1A1AA] border-[#323236] hover:bg-[#2A2A2E]'
                  }`}
                >
                  {limit === 'all' ? 'Alle' : `${limit} Wörter`}
                </button>
              ))}
            </div>
          </div>

          {/* Start Action */}
          <div className="pt-3">
            <button
              type="button"
              disabled={targetCards.length === 0}
              onClick={handleStartSession}
              className="w-full py-4 rounded-full bg-[#FF7A00] text-black font-semibold text-base hover:bg-[#FF881A] transition-colors shadow-lg active:scale-[0.99] flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
            >
              <Headphones className="w-5 h-5 text-black stroke-[2.5]" />
              <span>
                Hör-Sitzung starten ({targetCards.length} Vokabeln)
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
