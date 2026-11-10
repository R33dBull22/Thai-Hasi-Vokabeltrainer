import React, { useState, useMemo } from 'react';
import {
  Calendar,
  X,
  Volume2,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  Play,
  RotateCcw,
} from 'lucide-react';
import { Vocabulary, UserProgress, QueryDirection } from '../types/vocab';
import { StudyCardItem } from './StudySession';
import {
  calculateReviewForecast,
  DayForecast,
  PHASES,
  shuffleStudyCards,
} from '../utils/leitner';
import { speakThai } from '../utils/thaiAudio';
import { ToneVisualizer } from './ToneVisualizer';
import { getEffectiveRomanization } from '../utils/thaiTones';

interface ReviewForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
  vocabularies: Vocabulary[];
  progressMap: Record<string, UserProgress>;
  initialDayOffset?: number;
  initialDirection?: 'both' | 'de_to_th' | 'th_to_de';
  onStartSession?: (cards: StudyCardItem[], direction: QueryDirection) => void;
}

export const ReviewForecastModal: React.FC<ReviewForecastModalProps> = ({
  isOpen,
  onClose,
  vocabularies,
  progressMap,
  initialDayOffset = 0,
  initialDirection = 'both',
  onStartSession,
}) => {
  const [selectedDirection, setSelectedDirection] = useState<'both' | 'de_to_th' | 'th_to_de'>(initialDirection);
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(initialDayOffset);
  const [dayRange, setDayRange] = useState<5 | 7>(5);

  const forecast = useMemo(() => {
    return calculateReviewForecast(vocabularies, progressMap, selectedDirection, dayRange);
  }, [vocabularies, progressMap, selectedDirection, dayRange]);

  // Ensure active day is within range
  const activeDay: DayForecast =
    forecast.days.find((d) => d.dayOffset === selectedDayOffset) || forecast.days[0] || {
      dayOffset: 0,
      date: new Date(),
      dateStr: '',
      formattedDate: '',
      weekdayName: 'Heute',
      shortWeekday: 'Heute',
      isToday: true,
      count: 0,
      uniqueVocabsCount: 0,
      items: [],
    };

  if (!isOpen) return null;

  const handlePlayAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    speakThai(text);
  };

  const handleStartPracticeDay = (day: DayForecast) => {
    if (!onStartSession || day.items.length === 0) return;
    const studyCards: StudyCardItem[] = day.items.map((item) => ({
      vocab: item.vocab,
      progress: item.progress,
      direction: item.direction,
    }));
    const chosenDirection: QueryDirection =
      selectedDirection === 'de_to_th'
        ? 'de_to_th'
        : selectedDirection === 'th_to_de'
        ? 'th_to_de'
        : 'de_to_th'; // default fallback for both
    onStartSession(shuffleStudyCards(studyCards), chosenDirection);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 pt-safe animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#1C1C1E] border border-[#2C2C2E] rounded-t-3xl sm:rounded-3xl p-5 pb-safe sm:pb-5 text-white max-h-[92vh] overflow-y-auto overscroll-contain touch-scroll shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#2C2C2E]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#FF7A00] to-amber-500 text-black flex items-center justify-center font-bold shadow-md">
                <Calendar className="w-5 h-5 text-black" />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>Wiederholungs-Vorschau</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] font-bold border border-[#FF7A00]/40">
                    {dayRange} Tage
                  </span>
                </h2>
                <p className="text-xs text-[#8E8E93]">
                  Wie viele Vokabeln stehen an den nächsten Tagen an?
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#242426] flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Controls: Range (5 Tage / 7 Tage) & Query Direction */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            {/* Direction Selector */}
            <div className="flex items-center p-1 bg-[#242426] rounded-xl border border-[#323236] text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setSelectedDirection('both')}
                className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedDirection === 'both'
                    ? 'bg-[#FF7A00] text-black font-bold shadow-sm'
                    : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                Beide Richtungen
              </button>
              <button
                type="button"
                onClick={() => setSelectedDirection('de_to_th')}
                className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedDirection === 'de_to_th'
                    ? 'bg-[#FF7A00] text-black font-bold shadow-sm'
                    : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                DE ➔ TH
              </button>
              <button
                type="button"
                onClick={() => setSelectedDirection('th_to_de')}
                className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedDirection === 'th_to_de'
                    ? 'bg-[#FF7A00] text-black font-bold shadow-sm'
                    : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                TH ➔ DE
              </button>
            </div>

            {/* Days toggle */}
            <div className="flex items-center self-end sm:self-auto p-1 bg-[#242426] rounded-xl border border-[#323236] text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setDayRange(5)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  dayRange === 5 ? 'bg-[#3A3A3E] text-white font-bold' : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                5 Tage
              </button>
              <button
                type="button"
                onClick={() => setDayRange(7)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  dayRange === 7 ? 'bg-[#3A3A3E] text-white font-bold' : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                7 Tage
              </button>
            </div>
          </div>

          {/* Interactive Day Cards (Bar Chart & Selector) */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {forecast.days.slice(0, dayRange).map((day) => {
              const isSelected = day.dayOffset === activeDay.dayOffset;
              const barHeightPct = Math.max(12, Math.round((day.count / forecast.maxDayCount) * 100));

              return (
                <button
                  key={day.dayOffset}
                  type="button"
                  onClick={() => setSelectedDayOffset(day.dayOffset)}
                  className={`p-2 rounded-2xl flex flex-col items-center justify-between text-center transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#FF7A00]/25 to-[#242426] border-[#FF7A00] shadow-lg scale-[1.02]'
                      : 'bg-[#242426] border-[#323236] hover:border-[#444448]'
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold block truncate w-full ${
                      isSelected
                        ? 'text-[#FF7A00]'
                        : day.isToday
                        ? 'text-amber-400 font-extrabold'
                        : 'text-[#8E8E93]'
                    }`}
                  >
                    {day.shortWeekday}
                  </span>
                  <span className="text-[9px] text-[#A1A1A6] block mb-1">
                    {day.formattedDate}
                  </span>

                  {/* Relative workload bar */}
                  <div className="w-3.5 h-10 bg-[#1C1C1E] rounded-full p-0.5 flex flex-col justify-end my-1 overflow-hidden">
                    <div
                      style={{ height: `${day.count > 0 ? barHeightPct : 0}%` }}
                      className={`w-full rounded-full transition-all duration-300 ${
                        day.count > 0
                          ? isSelected
                            ? 'bg-[#FF7A00]'
                            : day.isToday
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                          : 'bg-transparent'
                      }`}
                    />
                  </div>

                  {/* Count Pill */}
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded-lg mt-0.5 min-w-[24px] ${
                      day.count > 0
                        ? isSelected
                          ? 'bg-[#FF7A00] text-black'
                          : day.isToday
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                          : 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/30'
                        : 'text-[#636366]'
                    }`}
                  >
                    {day.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Day Detail Card */}
          <div className="bg-[#242426] rounded-2xl p-4 border border-[#323236] space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{activeDay.weekdayName}</span>
                  <span className="text-xs text-[#8E8E93]">({activeDay.formattedDate})</span>
                </h3>
                <p className="text-[11px] text-[#8E8E93] mt-0.5">
                  {activeDay.count === 0
                    ? 'Keine Abfragen an diesem Tag geplant'
                    : `${activeDay.count} Abfrage${activeDay.count === 1 ? '' : 'n'} (${activeDay.uniqueVocabsCount} verschiedene Vokabel${
                        activeDay.uniqueVocabsCount === 1 ? '' : 'n'
                      })`}
                </p>
              </div>

              {activeDay.count > 0 && onStartSession && (
                <button
                  type="button"
                  onClick={() => handleStartPracticeDay(activeDay)}
                  className="px-3 py-1.5 rounded-xl bg-[#FF7A00] text-black text-xs font-bold hover:bg-[#FF881A] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>{activeDay.isToday ? 'Jetzt üben' : 'Vorab üben'}</span>
                </button>
              )}
            </div>

            {/* List of Scheduled Words for this Day */}
            {activeDay.count === 0 ? (
              <div className="py-6 text-center text-[#8E8E93] space-y-1 bg-[#1C1C1E] rounded-xl border border-[#2C2C2E]">
                <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto mb-1 opacity-90" />
                <p className="text-xs font-medium text-[#D1D1D6]">
                  Keine fälligen Vokabeln an diesem Tag!
                </p>
                <p className="text-[11px] text-[#8E8E93]">
                  Gute Zeit zum Entspannen oder um neue Vokabeln hinzuzufügen.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[36vh] overflow-y-auto overscroll-contain touch-scroll pr-1">
                {activeDay.items.map((item, idx) => {
                  const phaseConfig = PHASES[item.phase] || PHASES[1];
                  const effRom = getEffectiveRomanization(item.vocab.thai, item.vocab.romanization);

                  return (
                    <div
                      key={`${item.vocab.id}-${item.direction}-${idx}`}
                      className="p-3 bg-[#1C1C1E] rounded-xl border border-[#2C2C2E] flex items-center justify-between gap-3 hover:border-[#3E3E42] transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-base font-bold text-white font-thai tracking-wide">
                            {item.vocab.thai}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handlePlayAudio(e, item.vocab.thai)}
                            className="p-1 rounded-md text-[#8E8E93] hover:text-[#FF7A00] hover:bg-[#2C2C2E] transition-colors"
                            title="Aussprache anhören"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${phaseConfig.badgeBg} ${phaseConfig.badgeText}`}
                          >
                            Phase {item.phase}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#2C2C2E] text-[#A1A1A6] font-semibold border border-[#3A3A3D]">
                            {item.direction === 'de_to_th' ? 'DE ➔ TH' : 'TH ➔ DE'}
                          </span>
                        </div>

                        {effRom && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-amber-300 font-mono">
                              {effRom}
                            </span>
                            <ToneVisualizer
                              thai={item.vocab.thai}
                              romanization={effRom}
                              compact={true}
                            />
                          </div>
                        )}

                        <p className="text-xs text-[#D1D1D6] truncate">
                          {item.vocab.german}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5-Day Total Overview Footer Banner */}
          <div className="bg-[#242426]/70 rounded-2xl p-3 border border-[#2C2C2E] flex items-center justify-between text-xs text-[#8E8E93]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF7A00]" />
              <span>
                Gesamt in den nächsten <strong className="text-white">{dayRange} Tagen</strong>:
              </span>
            </div>
            <span className="font-bold text-[#FF7A00] text-sm">
              {forecast.totalForecastReviews} Abfragen
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
