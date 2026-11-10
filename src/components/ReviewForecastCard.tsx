import React, { useMemo } from 'react';
import { Calendar, ChevronRight, TrendingUp } from 'lucide-react';
import { Vocabulary, UserProgress, QueryDirection } from '../types/vocab';
import { calculateReviewForecast } from '../utils/leitner';

interface ReviewForecastCardProps {
  vocabularies: Vocabulary[];
  progressMap: Record<string, UserProgress>;
  studyDirection?: 'both' | 'de_to_th' | 'th_to_de';
  onOpenForecastModal: (initialDayOffset?: number) => void;
}

export const ReviewForecastCard: React.FC<ReviewForecastCardProps> = ({
  vocabularies,
  progressMap,
  studyDirection = 'both',
  onOpenForecastModal,
}) => {
  const forecast = useMemo(() => {
    return calculateReviewForecast(vocabularies, progressMap, studyDirection, 5);
  }, [vocabularies, progressMap, studyDirection]);

  const totalInDeck = Object.keys(progressMap).length;

  return (
    <div className="bg-[#1C1C1E] rounded-3xl p-4 border border-[#2C2C2E] shadow-lg mb-5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#FF7A00]/20 flex items-center justify-center text-[#FF7A00]">
            <Calendar className="w-4 h-4 text-[#FF7A00]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>5-Tage-Abfrageplan</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#FF7A00]/15 text-[#FF7A00] font-bold border border-[#FF7A00]/30">
                {forecast.totalForecastReviews} fällig
              </span>
            </h3>
            <p className="text-[10px] text-[#8E8E93]">
              Geplante Wiederholungen der nächsten 5 Tage
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenForecastModal(0)}
          className="text-[11px] font-semibold text-[#FF7A00] hover:text-[#FFA040] flex items-center gap-0.5 transition-colors cursor-pointer"
        >
          <span>Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5-Day Visual Grid */}
      <div className="grid grid-cols-5 gap-1.5 pt-1">
        {forecast.days.map((day) => {
          const barHeightPct = Math.max(10, Math.round((day.count / forecast.maxDayCount) * 100));

          return (
            <button
              key={day.dayOffset}
              type="button"
              onClick={() => onOpenForecastModal(day.dayOffset)}
              className={`p-2 rounded-2xl flex flex-col items-center justify-between text-center transition-all cursor-pointer border group active:scale-[0.98] ${
                day.isToday
                  ? 'bg-gradient-to-b from-[#FF7A00]/15 to-[#242426] border-[#FF7A00]/50 hover:border-[#FF7A00]'
                  : 'bg-[#242426] border-[#323236] hover:border-[#4A4A50]'
              }`}
            >
              {/* Day title */}
              <span
                className={`text-[10px] font-bold block truncate w-full ${
                  day.isToday ? 'text-[#FF7A00]' : 'text-[#8E8E93] group-hover:text-white'
                }`}
              >
                {day.shortWeekday}
              </span>
              <span className="text-[9px] text-[#636366] block mb-1">
                {day.formattedDate}
              </span>

              {/* Bar indicator */}
              <div className="w-2.5 h-8 bg-[#1C1C1E] rounded-full p-0.5 flex flex-col justify-end my-1 overflow-hidden">
                <div
                  style={{ height: `${day.count > 0 ? barHeightPct : 0}%` }}
                  className={`w-full rounded-full transition-all duration-300 ${
                    day.count > 0
                      ? day.isToday
                        ? 'bg-[#FF7A00]'
                        : 'bg-emerald-400'
                      : 'bg-transparent'
                  }`}
                />
              </div>

              {/* Count badge */}
              <span
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] transition-colors ${
                  day.count > 0
                    ? day.isToday
                      ? 'bg-[#FF7A00] text-black'
                      : 'bg-[#3A3A3E] text-white group-hover:bg-emerald-500 group-hover:text-black'
                    : 'text-[#636366]'
                }`}
              >
                {day.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
