import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Flame,
  Clock,
  BookOpen,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
  ArrowRight,
  Filter,
  Info,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { UserProgress, Vocabulary } from '../types/vocab';
import { Award, AwardTier, AwardCategory } from '../types/stats';
import {
  getStudySessions,
  calculateDailyPractice,
  calculateWeeklyLearned,
  calculatePhaseDistribution,
  calculateStreak,
  evaluateAwards,
} from '../services/statsService';
import { useAuth } from '../context/AuthContext';

interface StatsDashboardProps {
  vocabularies: Vocabulary[];
  progressMap: Record<string, UserProgress>;
  onNavigateLearn: () => void;
  onNavigatePool: () => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  vocabularies,
  progressMap,
  onNavigateLearn,
  onNavigatePool,
}) => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'charts' | 'awards' | 'phases'>('charts');
  const [dailyRange, setDailyRange] = useState<7 | 14>(7);
  const [weeklyRange, setWeeklyRange] = useState<4 | 8>(8);
  const [awardFilter, setAwardFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [awardCategory, setAwardCategory] = useState<string>('all');
  const [selectedAward, setSelectedAward] = useState<Award | null>(null);

  // Load real study sessions (no synthetic data)
  const sessions = useMemo(() => {
    return getStudySessions(user?.uid);
  }, [user?.uid]);

  const isInitialState = sessions.length === 0;

  // Derived metrics
  const streakInfo = useMemo(() => {
    return calculateStreak(sessions, progressMap);
  }, [sessions, progressMap]);

  const dailyData = useMemo(() => {
    return calculateDailyPractice(sessions, dailyRange);
  }, [sessions, dailyRange]);

  const weeklyData = useMemo(() => {
    return calculateWeeklyLearned(progressMap, sessions, weeklyRange);
  }, [progressMap, sessions, weeklyRange]);

  const phaseData = useMemo(() => {
    return calculatePhaseDistribution(progressMap);
  }, [progressMap]);

  const awards = useMemo(() => {
    return evaluateAwards(progressMap, vocabularies, sessions);
  }, [progressMap, vocabularies, sessions]);

  // Overall totals
  const totalDeckCount = Object.keys(progressMap).length;
  const phase6Count = useMemo(() => {
    return Object.values(progressMap).filter((p) => {
      const ph = Math.max(
        p.phase || 1,
        p.deToTh?.phase || 1,
        p.thToDe?.phase || 1
      );
      return ph === 6;
    }).length;
  }, [progressMap]);

  const totalPracticeSeconds = useMemo(() => {
    return sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
  }, [sessions]);

  const totalHours = Math.floor(totalPracticeSeconds / 3600);
  const totalMinutesRemaining = Math.floor((totalPracticeSeconds % 3600) / 60);

  const unlockedAwardsCount = useMemo(() => {
    return awards.filter((a) => a.isUnlocked).length;
  }, [awards]);

  const averageAccuracy = useMemo(() => {
    const validSessions = sessions.filter((s) => s.cardsStudied > 0);
    if (validSessions.length > 0) {
      const totalCorrect = validSessions.reduce((a, s) => a + (s.correctCount || 0), 0);
      const totalDone = validSessions.reduce((a, s) => a + (s.cardsStudied || 0), 0);
      return totalDone > 0 ? Math.round((totalCorrect / totalDone) * 100) : null;
    }
    // Fallback to progressMap answers if user reviewed cards before session tracking
    const progressList = Object.values(progressMap);
    const totalCorrect = progressList.reduce((a, p) => a + (p.correctCount || 0), 0);
    const totalIncorrect = progressList.reduce((a, p) => a + (p.incorrectCount || 0), 0);
    const total = totalCorrect + totalIncorrect;
    if (total > 0) {
      return Math.round((totalCorrect / total) * 100);
    }
    return null;
  }, [sessions, progressMap]);

  // Filtered awards
  const filteredAwards = useMemo(() => {
    return awards.filter((award) => {
      if (awardFilter === 'unlocked' && !award.isUnlocked) return false;
      if (awardFilter === 'locked' && award.isUnlocked) return false;
      if (awardCategory !== 'all' && award.category !== awardCategory) return false;
      return true;
    });
  }, [awards, awardFilter, awardCategory]);

  const triggerConfetti = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.5 },
    });
  };

  const getTierBadge = (tier: AwardTier) => {
    switch (tier) {
      case 'diamond':
        return {
          label: 'Diamant',
          bg: 'bg-sky-500/15 text-sky-300 border-sky-400/40',
          glow: 'shadow-[0_0_15px_rgba(56,189,248,0.25)]',
        };
      case 'gold':
        return {
          label: 'Gold',
          bg: 'bg-amber-500/15 text-amber-300 border-amber-400/40',
          glow: 'shadow-[0_0_15px_rgba(251,191,36,0.25)]',
        };
      case 'silver':
        return {
          label: 'Silber',
          bg: 'bg-slate-300/15 text-slate-200 border-slate-300/30',
          glow: '',
        };
      case 'bronze':
      default:
        return {
          label: 'Bronze',
          bg: 'bg-amber-900/30 text-amber-500 border-amber-700/40',
          glow: '',
        };
    }
  };

  return (
    <div className="pb-24 max-w-2xl mx-auto px-2 sm:px-4 pt-3 sm:pt-5 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Statistiken & Awards</span>
            <span className="text-xl">🏆</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#8E8E93] mt-0.5">
            Echter Lernfortschritt, minutengenaue Übungszeit und freigeschaltete Trophäen
          </p>
        </div>
      </div>

      {/* Initial state notice banner */}
      {isInitialState && (
        <div className="mb-4 bg-gradient-to-r from-amber-500/10 via-[#FF7A00]/5 to-transparent border border-amber-500/25 rounded-2xl p-3.5 flex items-start gap-3">
          <span className="text-xl shrink-0 mt-0.5">🌱</span>
          <div className="text-xs">
            <p className="font-semibold text-amber-300">Initialer Zustand: Bereit zum Lernen!</p>
            <p className="text-[#A1A1A6] mt-0.5 leading-relaxed">
              Es wurden noch keine Abfragen in dieser Sitzung abgeschlossen. Sobald du im Lern-Tab deine erste Abfrage beendest, werden deine genaue Übungszeit, Wiederholungen und Trefferquote hier live visualisiert!
            </p>
          </div>
        </div>
      )}

      {/* KPI Highlight Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
        {/* 1. Streak */}
        <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-3.5 relative overflow-hidden group hover:border-[#FF7A00]/40 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8E8E93]">
              Lern-Streak
            </span>
            <Flame
              className={`w-4 h-4 ${
                streakInfo.currentStreak > 0
                  ? 'text-amber-500 animate-pulse'
                  : 'text-[#8E8E93]'
              }`}
            />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {streakInfo.currentStreak}
            </span>
            <span className="text-xs font-medium text-[#FF7A00]">
              {streakInfo.currentStreak === 1 ? 'Tag' : 'Tage'}
            </span>
          </div>
          <p className="text-[10px] text-[#8E8E93] mt-0.5">
            {streakInfo.currentStreak > 0
              ? `Rekord: ${streakInfo.bestStreak} Tage`
              : 'Starte heute Tag 1!'}
          </p>
        </div>

        {/* 2. Practice Time */}
        <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-3.5 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8E8E93]">
              Übungszeit
            </span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {totalHours > 0 ? `${totalHours}h ` : ''}
              {totalMinutesRemaining}m
            </span>
          </div>
          <p className="text-[10px] text-[#8E8E93] mt-0.5">
            {totalPracticeSeconds > 0 ? 'Gesamtzeit geübt' : 'Abfrage noch offen'}
          </p>
        </div>

        {/* 3. Langzeit (Phase 6) */}
        <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-3.5 relative overflow-hidden group hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8E8E93]">
              Langzeit (P6)
            </span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {phase6Count}
            </span>
            <span className="text-xs text-[#8E8E93]">/ {totalDeckCount}</span>
          </div>
          <p className="text-[10px] text-[#8E8E93] mt-0.5">
            {totalDeckCount > 0 ? Math.round((phase6Count / totalDeckCount) * 100) : 0}% dauerhaft
          </p>
        </div>

        {/* 4. Awards Unlocked */}
        <div
          onClick={() => {
            setActiveSubTab('awards');
            triggerConfetti();
          }}
          className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-3.5 relative overflow-hidden cursor-pointer hover:border-amber-400/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8E8E93]">
              Awards
            </span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight">
              {unlockedAwardsCount}
            </span>
            <span className="text-xs text-[#8E8E93]">/ {awards.length}</span>
          </div>
          <p className="text-[10px] text-[#8E8E93] mt-0.5 flex items-center gap-1">
            <span>Freigeschaltet</span>
            <ChevronRight className="w-3 h-3 text-[#FF7A00]" />
          </p>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="bg-[#1C1C1E] p-1 rounded-xl border border-[#2C2C2E] flex items-center mb-5">
        <button
          onClick={() => setActiveSubTab('charts')}
          className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === 'charts'
              ? 'bg-[#FF7A00] text-black shadow-md'
              : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Lernverlauf</span>
        </button>

        <button
          onClick={() => setActiveSubTab('awards')}
          className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all relative ${
            activeSubTab === 'awards'
              ? 'bg-[#FF7A00] text-black shadow-md'
              : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Awards ({unlockedAwardsCount})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('phases')}
          className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === 'phases'
              ? 'bg-[#FF7A00] text-black shadow-md'
              : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Phasen (P1-P6)</span>
        </button>
      </div>

      {/* SUB-TAB 1: RECHARTS CHARTS */}
      {activeSubTab === 'charts' && (
        <div className="space-y-5">
          {/* Chart 1: Daily Practice Duration */}
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Tägliche Übungsdauer
                  </h3>
                  <span className="text-xs bg-amber-500/10 text-[#FF7A00] px-2 py-0.5 rounded-full font-medium">
                    in Minuten
                  </span>
                </div>
                <p className="text-xs text-[#8E8E93] mt-0.5">
                  Zeit, die du mit Wiederholungen und Schreibabfragen verbracht hast
                </p>
              </div>

              {/* Range Toggle: 7 vs 14 days */}
              <div className="flex items-center gap-1 bg-[#242426] p-1 rounded-lg border border-[#323236] self-start sm:self-auto">
                <button
                  onClick={() => setDailyRange(7)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                    dailyRange === 7
                      ? 'bg-[#3A3A3D] text-white font-semibold'
                      : 'text-[#8E8E93] hover:text-white'
                  }`}
                >
                  7 Tage
                </button>
                <button
                  onClick={() => setDailyRange(14)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                    dailyRange === 14
                      ? 'bg-[#3A3A3D] text-white font-semibold'
                      : 'text-[#8E8E93] hover:text-white'
                  }`}
                >
                  14 Tage
                </button>
              </div>
            </div>

            {/* Recharts BarChart */}
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="practiceBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF7A00" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#FF9500" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
                  <XAxis
                    dataKey="dayLabel"
                    stroke="#8E8E93"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#2C2C2E' }}
                  />
                  <YAxis
                    stroke="#8E8E93"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#2C2C2E' }}
                    tickFormatter={(val) => `${val}m`}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255, 122, 0, 0.08)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#242426] border border-[#3A3A3D] p-3 rounded-xl shadow-xl text-xs">
                            <p className="font-bold text-white mb-1">
                              {data.displayDate} ({data.dayLabel})
                            </p>
                            <div className="space-y-1 text-[#D1D1D6]">
                              <p className="flex items-center justify-between gap-3">
                                <span>Übungszeit:</span>
                                <span className="font-bold text-[#FF7A00]">
                                  {data.minutes} Min. ({data.seconds}s)
                                </span>
                              </p>
                              <p className="flex items-center justify-between gap-3">
                                <span>Karten geübt:</span>
                                <span className="font-semibold text-white">{data.cards}</span>
                              </p>
                              {data.cards > 0 && (
                                <p className="flex items-center justify-between gap-3 text-emerald-400">
                                  <span>Trefferquote:</span>
                                  <span className="font-semibold">{data.accuracy}%</span>
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="minutes"
                    name="Übungsdauer"
                    fill="url(#practiceBarGradient)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {isInitialState && (
              <p className="text-[11px] text-[#8E8E93] text-center mt-3">
                💡 Tipp: Starte im Tab „Lernen“ eine Abfrage, um deine erste Balkensäule zu füllen!
              </p>
            )}
          </div>

          {/* Chart 2: Weekly Learned Vocabulary (Area Chart) */}
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Wöchentlicher Lernfortschritt
                </h3>
                <p className="text-xs text-[#8E8E93] mt-0.5">
                  Anzahl gelernter Vokabeln (Phase 2+) und Wiederholungen pro Kalenderwoche
                </p>
              </div>

              {/* Range Toggle: 4 vs 8 weeks */}
              <div className="flex items-center gap-1 bg-[#242426] p-1 rounded-lg border border-[#323236] self-start sm:self-auto">
                <button
                  onClick={() => setWeeklyRange(4)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                    weeklyRange === 4
                      ? 'bg-[#3A3A3D] text-white font-semibold'
                      : 'text-[#8E8E93] hover:text-white'
                  }`}
                >
                  4 Wochen
                </button>
                <button
                  onClick={() => setWeeklyRange(8)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                    weeklyRange === 8
                      ? 'bg-[#3A3A3D] text-white font-semibold'
                      : 'text-[#8E8E93] hover:text-white'
                  }`}
                >
                  8 Wochen
                </button>
              </div>
            </div>

            {/* Recharts AreaChart */}
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={weeklyData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="learnedAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="reviewAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF7A00" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#FF7A00" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
                  <XAxis
                    dataKey="weekLabel"
                    stroke="#8E8E93"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#2C2C2E' }}
                  />
                  <YAxis
                    stroke="#8E8E93"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#2C2C2E' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#242426] border border-[#3A3A3D] p-3 rounded-xl shadow-xl text-xs">
                            <p className="font-bold text-white mb-1">
                              {data.weekLabel} ({data.fullLabel})
                            </p>
                            <div className="space-y-1">
                              <p className="flex items-center justify-between gap-3 text-emerald-400">
                                <span>Gelernte Vokabeln (P2+):</span>
                                <span className="font-bold">{data.learnedCount}</span>
                              </p>
                              <p className="flex items-center justify-between gap-3 text-[#FF7A00]">
                                <span>Wiederholungen:</span>
                                <span className="font-bold">{data.reviewCount}</span>
                              </p>
                              <p className="flex items-center justify-between gap-3 text-purple-400">
                                <span>Neu in Phase 6:</span>
                                <span className="font-bold">{data.phase6Promotions}</span>
                              </p>
                              <p className="flex items-center justify-between gap-3 text-[#8E8E93]">
                                <span>Übungszeit:</span>
                                <span>{data.practiceMinutes} Min.</span>
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="learnedCount"
                    name="Gelernte Vokabeln"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fill="url(#learnedAreaGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="reviewCount"
                    name="Wiederholungen"
                    stroke="#FF7A00"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fill="url(#reviewAreaGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 mt-3 text-xs text-[#8E8E93]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="text-white">Gelernte Vokabeln</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-[#FF7A00] inline-block border-t border-dashed border-[#FF7A00]" />
                <span className="text-white">Wiederholungen</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AWARDS & TROPHIES */}
      {activeSubTab === 'awards' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Header & Status Banner */}
          <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                Deine Medaillen & Trophäen
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{unlockedAwardsCount} von {awards.length} freigeschaltet</span>
              </h2>
              <p className="text-xs text-[#A1A1A6] mt-1 max-w-md">
                Lerne täglich, baue dein Deck aus und befördere Vokabeln in Phase 6, um alle Auszeichnungen zu sammeln!
              </p>
            </div>
            <button
              onClick={triggerConfetti}
              className="p-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 rounded-2xl text-2xl transition-transform active:scale-95 shrink-0"
              title="Konfetti werfen!"
            >
              🎉
            </button>
          </div>

          {/* Award Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-[#1C1C1E] p-1 rounded-xl border border-[#2C2C2E]">
              <button
                onClick={() => setAwardFilter('all')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  awardFilter === 'all'
                    ? 'bg-[#FF7A00] text-black shadow-sm'
                    : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                Alle ({awards.length})
              </button>
              <button
                onClick={() => setAwardFilter('unlocked')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  awardFilter === 'unlocked'
                    ? 'bg-[#FF7A00] text-black shadow-sm'
                    : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                Erreicht ({unlockedAwardsCount})
              </button>
              <button
                onClick={() => setAwardFilter('locked')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  awardFilter === 'locked'
                    ? 'bg-[#FF7A00] text-black shadow-sm'
                    : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                Offen ({awards.length - unlockedAwardsCount})
              </button>
            </div>

            {/* Category filter */}
            <select
              value={awardCategory}
              onChange={(e) => setAwardCategory(e.target.value)}
              className="bg-[#1C1C1E] border border-[#2C2C2E] text-xs font-medium text-[#D1D1D6] rounded-xl px-3 py-2 outline-none focus:border-[#FF7A00]"
            >
              <option value="all">Alle Kategorien</option>
              <option value="quantity">Wortschatz & Deck</option>
              <option value="streak">Lern-Streak</option>
              <option value="mastery">Langzeitgedächtnis (P6)</option>
              <option value="time">Übungsdauer</option>
              <option value="special">Spezial-Erfolge</option>
            </select>
          </div>

          {/* Awards Grid - bulletproof layout preventing any badge overflow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredAwards.map((award) => {
              const tierInfo = getTierBadge(award.tier);
              const progressPercent = Math.min(
                100,
                Math.round((award.currentProgress / (award.maxProgress || 1)) * 100)
              );

              return (
                <div
                  key={award.id}
                  onClick={() => {
                    setSelectedAward(award);
                    if (award.isUnlocked) triggerConfetti();
                  }}
                  className={`rounded-2xl p-4 border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    award.isUnlocked
                      ? 'bg-[#242426] border-[#3E3E42] hover:border-amber-400/50 hover:bg-[#28282B]'
                      : 'bg-[#18181A]/80 border-[#262628] opacity-80 hover:opacity-100'
                  } ${award.isUnlocked ? tierInfo.glow : ''}`}
                >
                  {/* Tier Badge - firmly anchored inside the top-right corner of the tile */}
                  <div className="absolute top-3.5 right-3.5 z-10 pointer-events-none">
                    <span
                      className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 whitespace-nowrap inline-flex items-center shadow-xs ${tierInfo.bg}`}
                    >
                      {tierInfo.label}
                    </span>
                  </div>

                  {/* Top content area with right-padding so title/subtitle never overlap or push the badge */}
                  <div>
                    <div className="flex items-start gap-3 mb-2.5 pr-20">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl border shrink-0 ${
                          award.isUnlocked
                            ? 'bg-[#2D2D30] border-amber-400/40 shadow-sm'
                            : 'bg-[#1C1C1E] border-[#2C2C2E] text-gray-500 grayscale'
                        }`}
                      >
                        {award.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4
                          className={`text-sm font-bold tracking-tight truncate ${
                            award.isUnlocked ? 'text-white' : 'text-[#8E8E93]'
                          }`}
                        >
                          {award.title}
                        </h4>
                        <p className="text-[11px] text-[#A1A1A6] leading-snug line-clamp-1">
                          {award.subtitle}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-[#8E8E93] mb-3 leading-relaxed line-clamp-2">
                      {award.description}
                    </p>
                  </div>

                  {/* Progress bar / Unlocked badge */}
                  <div className="pt-2 border-t border-[#2C2C2E]/60 mt-auto">
                    {award.isUnlocked ? (
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Freigeschaltet</span>
                        </span>
                        <span className="text-[11px] text-[#8E8E93]">
                          {award.maxProgress} {award.unitLabel}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-[#8E8E93] flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>Fortschritt</span>
                          </span>
                          <span className="font-semibold text-[#D1D1D6]">
                            {award.currentProgress} / {award.maxProgress} {award.unitLabel}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#2C2C2E] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-[#FF7A00] rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAwards.length === 0 && (
            <div className="text-center py-12 bg-[#1C1C1E] rounded-2xl border border-[#2C2C2E]">
              <Trophy className="w-10 h-10 text-[#8E8E93] mx-auto mb-2 opacity-50" />
              <p className="text-sm text-[#8E8E93]">Keine Awards für diesen Filter gefunden.</p>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: PHASES DISTRIBUTION & ANALYSIS */}
      {activeSubTab === 'phases' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-4 sm:p-5">
            <h3 className="text-base font-bold text-white tracking-tight mb-1">
              Leitner Phasen-Verteilung (P1 bis P6)
            </h3>
            <p className="text-xs text-[#8E8E93] mb-4">
              Vokabeln wandern bei jeder richtigen Antwort in eine höhere Phase, bis sie in Phase 6 dauerhaft im Langzeitgedächtnis sitzen.
            </p>

            {/* Recharts PieChart (Donut) */}
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={phaseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {phaseData.map((entry) => (
                      <Cell key={`cell-${entry.phase}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#242426] border border-[#3A3A3D] p-3 rounded-xl shadow-xl text-xs">
                            <p className="font-bold text-white mb-0.5">{data.name}</p>
                            <p className="text-[#FF7A00] font-semibold">
                              {data.count} Vokabeln ({data.percentage}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Phase Breakdown List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
              {phaseData.map((p) => (
                <div
                  key={p.phase}
                  className="bg-[#242426] border border-[#323236] rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <div>
                      <span className="text-xs font-semibold text-white block">
                        Phase {p.phase}
                      </span>
                      <span className="text-[10px] text-[#8E8E93]">
                        {p.phase === 1 && 'Täglich'}
                        {p.phase === 2 && 'Alle 3 Tage'}
                        {p.phase === 3 && 'Wöchentlich'}
                        {p.phase === 4 && 'Alle 2 Wochen'}
                        {p.phase === 5 && 'Monatlich'}
                        {p.phase === 6 && 'Langzeitgedächtnis'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-white">{p.count}</span>
                    <span className="text-[10px] text-[#8E8E93] ml-1.5 font-mono">
                      {p.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onNavigateLearn}
          className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#FF7A00] text-black font-semibold text-sm hover:bg-[#FF881A] transition-colors shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Flame className="w-4 h-4 fill-current" />
          <span>Jetzt Abfrage starten</span>
        </button>

        <button
          onClick={onNavigatePool}
          className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#242426] text-white border border-[#3A3A3D] font-semibold text-sm hover:bg-[#2C2C2E] transition-colors active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>Vokabelpool öffnen</span>
        </button>
      </div>

      {/* Award Detail Modal */}
      {selectedAward && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedAward(null)}
        >
          <div
            className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl p-6 max-w-sm w-full relative shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedAward(null)}
              className="absolute top-4 right-4 p-2 text-[#8E8E93] hover:text-white transition-colors rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pt-2">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-[#28282B] border border-[#3E3E42] flex items-center justify-center text-4xl mb-4 shadow-inner">
                {selectedAward.icon}
              </div>

              <div className="inline-block mb-2">
                {(() => {
                  const tier = getTierBadge(selectedAward.tier);
                  return (
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${tier.bg}`}
                    >
                      {tier.label}
                    </span>
                  );
                })()}
              </div>

              <h3 className="text-xl font-extrabold text-white mb-1">
                {selectedAward.title}
              </h3>
              <p className="text-xs text-[#FF7A00] font-semibold mb-3">
                {selectedAward.subtitle}
              </p>

              <p className="text-xs text-[#A1A1A6] mb-5 leading-relaxed bg-[#121214] p-3 rounded-2xl border border-[#262628]">
                {selectedAward.description}
              </p>

              {/* Progress */}
              <div className="bg-[#242426] p-4 rounded-2xl border border-[#323236] mb-5 text-left">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#8E8E93] font-medium">Status</span>
                  {selectedAward.isUnlocked ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Freigeschaltet
                    </span>
                  ) : (
                    <span className="text-[#FF7A00] font-bold flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Noch offen
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs font-mono font-bold text-white mb-2">
                  <span>Fortschritt</span>
                  <span>
                    {selectedAward.currentProgress} / {selectedAward.maxProgress} {selectedAward.unitLabel}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#1C1C1E] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-[#FF7A00] rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          (selectedAward.currentProgress / (selectedAward.maxProgress || 1)) * 100
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedAward(null);
                  if (!selectedAward.isUnlocked) {
                    onNavigateLearn();
                  }
                }}
                className="w-full py-3 rounded-full bg-[#FF7A00] text-black font-bold text-xs hover:bg-[#FF881A] transition-colors cursor-pointer"
              >
                {selectedAward.isUnlocked ? 'Großartig!' : 'Jetzt dafür üben'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
