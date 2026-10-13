import {
  Award,
  AwardCategory,
  AwardTier,
  DailyPracticeData,
  PhaseDistributionData,
  StudySessionRecord,
  WeeklyLearnedData,
} from '../types/stats';
import { UserProgress, Vocabulary } from '../types/vocab';
import { getDirectionProgress } from '../utils/leitner';

const SESSIONS_STORAGE_KEY = 'thai_hasis_study_sessions_v1';

/**
 * Get all stored study sessions for the user from localStorage.
 * Only returns real sessions (filters out any old synthetic test data).
 */
export function getStudySessions(
  userId?: string
): StudySessionRecord[] {
  try {
    const key = userId ? `${SESSIONS_STORAGE_KEY}_${userId}` : SESSIONS_STORAGE_KEY;
    const raw = localStorage.getItem(key) || localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (raw) {
      const parsed: StudySessionRecord[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter out any legacy synthetic sessions
        const realSessions = parsed.filter(
          (s) => s && s.id && !s.id.startsWith('synth_') && (s.durationSeconds ?? 0) >= 0
        );
        return realSessions.sort(
          (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );
      }
    }
  } catch (err) {
    console.warn('Failed to load study sessions from storage:', err);
  }

  return [];
}

/**
 * Saves a new completed study session and dispatches event.
 */
export function saveStudySession(
  sessionData: Omit<StudySessionRecord, 'id'>,
  userId?: string
): StudySessionRecord {
  const newSession: StudySessionRecord = {
    ...sessionData,
    id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId,
  };

  try {
    const key = userId ? `${SESSIONS_STORAGE_KEY}_${userId}` : SESSIONS_STORAGE_KEY;
    const existing = getStudySessions(userId);
    const updated = [newSession, ...existing];
    localStorage.setItem(key, JSON.stringify(updated.slice(0, 500))); // Keep last 500 sessions
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated.slice(0, 500)));

    // Notify listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('thai-hasis-session-saved', { detail: newSession }));
    }
  } catch (err) {
    console.warn('Failed to save study session to storage:', err);
  }

  return newSession;
}

/**
 * Calculates daily practice time and accuracy for the last N days.
 * Strictly uses real recorded study sessions.
 */
export function calculateDailyPractice(
  sessions: StudySessionRecord[],
  daysCount: number = 7
): DailyPracticeData[] {
  const result: DailyPracticeData[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const monthNames = [
    'Jan',
    'Feb',
    'Mär',
    'Apr',
    'Mai',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Okt',
    'Nov',
    'Dez',
  ];

  for (let i = daysCount - 1; i >= 0; i--) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - i);

    // Format local date YYYY-MM-DD
    const y = targetDate.getFullYear();
    const m = String(targetDate.getMonth() + 1).padStart(2, '0');
    const d = String(targetDate.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    const dayName = dayNames[targetDate.getDay()];
    const displayDate = `${targetDate.getDate()}. ${monthNames[targetDate.getMonth()]}`;

    const matchingSessions = sessions.filter((s) => {
      if (!s.completedAt) return false;
      const sDate = s.completedAt.split('T')[0];
      return sDate === dateStr;
    });

    let totalSeconds = 0;
    let totalCards = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;

    matchingSessions.forEach((s) => {
      totalSeconds += s.durationSeconds || 0;
      totalCards += s.cardsStudied || 0;
      totalCorrect += s.correctCount || 0;
      totalIncorrect += s.incorrectCount || 0;
    });

    const totalReviews = totalCorrect + totalIncorrect;
    const accuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;
    const minutes = Math.round((totalSeconds / 60) * 10) / 10;

    result.push({
      date: dateStr,
      dayLabel: dayName,
      displayDate,
      minutes,
      seconds: totalSeconds,
      cards: totalCards,
      correct: totalCorrect,
      incorrect: totalIncorrect,
      accuracy: totalCards > 0 && accuracy === 0 ? 100 : accuracy,
    });
  }

  return result;
}

/**
 * Helper to get ISO week number.
 */
function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return weekNo;
}

/**
 * Calculates weekly learned vocabulary and reviews over the last N weeks.
 */
export function calculateWeeklyLearned(
  progressMap: Record<string, UserProgress>,
  sessions: StudySessionRecord[],
  weeksCount: number = 8
): WeeklyLearnedData[] {
  const result: WeeklyLearnedData[] = [];
  const now = new Date();

  for (let i = weeksCount - 1; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - i * 7 - ((now.getDay() + 6) % 7)); // Monday start
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekNo = getWeekNumber(weekStart);
    const fullLabel = `${weekStart.getDate()}.${weekStart.getMonth() + 1}. - ${weekEnd.getDate()}.${weekEnd.getMonth() + 1}.`;

    // Filter real sessions belonging to this week
    const weekSessions = sessions.filter((s) => {
      const time = new Date(s.completedAt).getTime();
      return time >= weekStart.getTime() && time <= weekEnd.getTime();
    });

    let reviewCount = 0;
    let practiceMinutes = 0;
    let phase6Promotions = 0;

    weekSessions.forEach((s) => {
      reviewCount += s.cardsStudied || 0;
      practiceMinutes += Math.round((s.durationSeconds || 0) / 60);
      phase6Promotions += s.promotedToPhase6Count || 0;
    });

    // Count learned cards in this week (cards reviewed in this week that are in Phase >= 2)
    let learnedCount = 0;
    Object.values(progressMap).forEach((p) => {
      const reviewDate = p.lastReviewedAt || p.deToTh?.lastReviewedAt || p.thToDe?.lastReviewedAt;
      if (reviewDate) {
        const time = new Date(reviewDate).getTime();
        if (time >= weekStart.getTime() && time <= weekEnd.getTime()) {
          const maxPh = Math.max(
            p.phase || 1,
            p.deToTh?.phase || 1,
            p.thToDe?.phase || 1
          );
          if (maxPh >= 2) {
            learnedCount += 1;
          }
        }
      }
    });

    result.push({
      weekKey: `${weekStart.getFullYear()}-W${weekNo}`,
      weekLabel: `KW ${weekNo}`,
      fullLabel,
      learnedCount,
      reviewCount,
      practiceMinutes,
      phase6Promotions,
    });
  }

  return result;
}

/**
 * Calculates distribution of vocabularies across the 6 Leitner phases.
 */
export function calculatePhaseDistribution(
  progressMap: Record<string, UserProgress>
): PhaseDistributionData[] {
  const phaseColors: Record<number, string> = {
    1: '#EF4444', // Red
    2: '#F97316', // Orange
    3: '#FBBF24', // Amber
    4: '#10B981', // Green
    5: '#06B6D4', // Cyan
    6: '#8B5CF6', // Purple (Long-term)
  };

  const phaseNames: Record<number, string> = {
    1: 'Phase 1 (Täglich)',
    2: 'Phase 2 (Alle 3 Tage)',
    3: 'Phase 3 (Wöchentlich)',
    4: 'Phase 4 (Alle 2 Wochen)',
    5: 'Phase 5 (Monatlich)',
    6: 'Phase 6 (Langzeit)',
  };

  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const allProgress = Object.values(progressMap);
  const total = allProgress.length;

  allProgress.forEach((p) => {
    // If directional progress exists, compute the representative phase
    let currentPh = 1;
    if (p.deToTh && p.thToDe) {
      currentPh = Math.max(p.deToTh.phase, p.thToDe.phase);
    } else if (p.deToTh) {
      currentPh = p.deToTh.phase;
    } else if (p.thToDe) {
      currentPh = p.thToDe.phase;
    } else if (typeof p.phase === 'number') {
      currentPh = p.phase;
    }
    const clamped = Math.max(1, Math.min(6, currentPh));
    counts[clamped] = (counts[clamped] || 0) + 1;
  });

  return [1, 2, 3, 4, 5, 6].map((ph) => {
    const count = counts[ph] || 0;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return {
      phase: ph,
      name: phaseNames[ph],
      count,
      color: phaseColors[ph],
      percentage,
    };
  });
}

/**
 * Calculates streak metrics accurately based on real review events.
 * Only reviews (lastReviewedAt or completedAt of sessions) count as learning days,
 * NEVER updatedAt (which triggers on creation, editing, etc.).
 */
export function calculateStreak(
  sessions: StudySessionRecord[],
  progressMap: Record<string, UserProgress>
): { currentStreak: number; bestStreak: number; practicedToday: boolean } {
  const activeDates = new Set<string>();

  // Dates from completed study sessions
  sessions.forEach((s) => {
    if (s.completedAt && (s.cardsStudied > 0 || (s.durationSeconds || 0) > 10)) {
      activeDates.add(s.completedAt.split('T')[0]);
    }
  });

  // Dates from actual vocabulary reviews (cards with at least 1 review recorded)
  Object.values(progressMap).forEach((p) => {
    const hasReviews = (p.correctCount || 0) + (p.incorrectCount || 0) > 0;
    if (p.lastReviewedAt && hasReviews) {
      activeDates.add(p.lastReviewedAt.split('T')[0]);
    }
    if (p.deToTh?.lastReviewedAt && (p.deToTh.correctCount || 0) + (p.deToTh.incorrectCount || 0) > 0) {
      activeDates.add(p.deToTh.lastReviewedAt.split('T')[0]);
    }
    if (p.thToDe?.lastReviewedAt && (p.thToDe.correctCount || 0) + (p.thToDe.incorrectCount || 0) > 0) {
      activeDates.add(p.thToDe.lastReviewedAt.split('T')[0]);
    }
  });

  if (activeDates.size === 0) {
    return { currentStreak: 0, bestStreak: 0, practicedToday: false };
  }

  const sortedDates = Array.from(activeDates).sort().reverse();

  // Local date today & yesterday
  const now = new Date();
  const formatLocalDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatLocalDate(now);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterday);

  const practicedToday = activeDates.has(todayStr);
  const practicedYesterday = activeDates.has(yesterdayStr);

  let currentStreak = 0;

  if (practicedToday) {
    currentStreak = 1;
    let checkDate = new Date(now);
    while (true) {
      checkDate.setDate(checkDate.getDate() - 1);
      const str = formatLocalDate(checkDate);
      if (activeDates.has(str)) {
        currentStreak += 1;
      } else {
        break;
      }
    }
  } else if (practicedYesterday) {
    // If not practiced today, but practiced yesterday, the streak is alive from yesterday
    currentStreak = 1;
    let checkDate = new Date(yesterday);
    while (true) {
      checkDate.setDate(checkDate.getDate() - 1);
      const str = formatLocalDate(checkDate);
      if (activeDates.has(str)) {
        currentStreak += 1;
      } else {
        break;
      }
    }
  } else {
    currentStreak = 0;
  }

  const calculatedBest = calculateMaxStreak(sortedDates);
  const bestStreak = Math.max(currentStreak, calculatedBest);

  return {
    currentStreak,
    bestStreak,
    practicedToday,
  };
}

function calculateMaxStreak(sortedDatesDesc: string[]): number {
  if (sortedDatesDesc.length === 0) return 0;
  let max = 1;
  let current = 1;

  for (let i = 0; i < sortedDatesDesc.length - 1; i++) {
    const d1 = new Date(sortedDatesDesc[i] + 'T00:00:00Z');
    const d2 = new Date(sortedDatesDesc[i + 1] + 'T00:00:00Z');
    const diffDays = Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      current += 1;
      if (current > max) max = current;
    } else if (diffDays > 1) {
      current = 1;
    }
  }
  return max;
}

/**
 * Complete list of Awards with accurate progress evaluation.
 */
export function evaluateAwards(
  progressMap: Record<string, UserProgress>,
  vocabularies: Vocabulary[],
  sessions: StudySessionRecord[]
): Award[] {
  const allProgress = Object.values(progressMap);
  const deckSize = allProgress.length;

  // Real review counts from sessions or progressMap
  const sessionReviews = sessions.reduce((acc, s) => acc + (s.cardsStudied || 0), 0);
  const progressReviews = allProgress.reduce(
    (acc, p) => acc + (p.correctCount || 0) + (p.incorrectCount || 0),
    0
  );
  const totalReviews = Math.max(sessionReviews, progressReviews);

  const totalSeconds = sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
  const totalMinutes = Math.round(totalSeconds / 60);

  const phase6Count = allProgress.filter(
    (p) => p.phase === 6 || p.deToTh?.phase === 6 || p.thToDe?.phase === 6
  ).length;

  const streakInfo = calculateStreak(sessions, progressMap);
  const bestStreak = streakInfo.bestStreak;

  // Accuracy in single session with >= 10 cards
  const hasSniperSession = sessions.some(
    (s) => s.cardsStudied >= 10 && s.correctCount / (s.cardsStudied || 1) >= 0.9
  );

  // Two-way mastery: cards with both directions in phase 3 or higher
  const twoWayMasteryCount = allProgress.filter((p) => {
    const de = getDirectionProgress(p, 'de_to_th');
    const th = getDirectionProgress(p, 'th_to_de');
    return de.phase >= 3 && th.phase >= 3;
  }).length;

  // Typing count from sessions
  const typingCorrectCount = sessions
    .filter((s) => s.inputMethod === 'typing')
    .reduce((acc, s) => acc + (s.correctCount || 0), 0);

  // Time-of-day achievements (Night Owl / Early Bird)
  const hasNightOwl = sessions.some((s) => {
    if (!s.completedAt) return false;
    const hours = new Date(s.completedAt).getHours();
    return hours >= 22 || hours < 4;
  });

  const hasEarlyBird = sessions.some((s) => {
    if (!s.completedAt) return false;
    const hours = new Date(s.completedAt).getHours();
    return hours >= 5 && hours < 8;
  });

  // Base list of awards
  const rawAwards: Award[] = [
    // 1. Starter
    {
      id: 'first_session',
      title: 'Erste Abfrage 🎓',
      subtitle: 'Erste Einheit gemeistert',
      description: 'Schließe deine allererste Abfrage erfolgreich ab.',
      category: 'special',
      tier: 'bronze',
      icon: '🎓',
      maxProgress: 1,
      currentProgress: sessions.length >= 1 ? 1 : 0,
      unitLabel: 'Session',
      isUnlocked: sessions.length >= 1,
    },
    {
      id: 'sawasdee_cup',
      title: 'Sawasdee Cup! 🙏',
      subtitle: 'Erster Schritt nach Thailand',
      description: 'Nimm deine allererste Vokabel ins Lern-Deck auf.',
      category: 'quantity',
      tier: 'bronze',
      icon: '🇹🇭',
      maxProgress: 1,
      currentProgress: Math.min(1, deckSize),
      unitLabel: 'Vokabel',
      isUnlocked: deckSize >= 1,
    },

    // 2. Quantity
    {
      id: 'deck_25',
      title: 'Tempel-Schüler 🪷',
      subtitle: 'Ein solider Grundwortschatz',
      description: 'Nimm mindestens 25 Vokabeln in dein Lern-Deck auf.',
      category: 'quantity',
      tier: 'bronze',
      icon: '🪷',
      maxProgress: 25,
      currentProgress: Math.min(25, deckSize),
      unitLabel: 'Vokabeln',
      isUnlocked: deckSize >= 25,
    },
    {
      id: 'deck_50',
      title: 'Fleißiges Hasi 🐰',
      subtitle: '50 Vokabeln im Deck',
      description: 'Erweitere deinen Wortschatz auf 50 Vokabeln.',
      category: 'quantity',
      tier: 'silver',
      icon: '🐰',
      maxProgress: 50,
      currentProgress: Math.min(50, deckSize),
      unitLabel: 'Vokabeln',
      isUnlocked: deckSize >= 50,
    },
    {
      id: 'deck_100',
      title: 'Wortschatz-Meister 📚',
      subtitle: '100 Vokabeln gemeistert',
      description: 'Baue dein Deck auf 100 aktive Thai-Vokabeln aus.',
      category: 'quantity',
      tier: 'gold',
      icon: '📚',
      maxProgress: 100,
      currentProgress: Math.min(100, deckSize),
      unitLabel: 'Vokabeln',
      isUnlocked: deckSize >= 100,
    },
    {
      id: 'deck_250',
      title: 'Bangkok-Gelehrter 🏛️',
      subtitle: '250 Vokabeln im Deck',
      description: 'Meistere ein ganzes Arsenal von 250 Thai-Vokabeln.',
      category: 'quantity',
      tier: 'diamond',
      icon: '🏛️',
      maxProgress: 250,
      currentProgress: Math.min(250, deckSize),
      unitLabel: 'Vokabeln',
      isUnlocked: deckSize >= 250,
    },

    // 3. Streak
    {
      id: 'streak_3',
      title: 'Feuer-Entfachung 🔥',
      subtitle: '3 Tage am Stück gelernt',
      description: 'Lerne an 3 aufeinanderfolgenden Tagen.',
      category: 'streak',
      tier: 'bronze',
      icon: '🔥',
      maxProgress: 3,
      currentProgress: Math.min(3, bestStreak),
      unitLabel: 'Tage',
      isUnlocked: bestStreak >= 3,
    },
    {
      id: 'streak_7',
      title: 'Wochenheld ⚡',
      subtitle: '7 Tage ununterbrochen',
      description: 'Halte deinen Lern-Streak eine ganze Woche lang aufrecht.',
      category: 'streak',
      tier: 'silver',
      icon: '⚡',
      maxProgress: 7,
      currentProgress: Math.min(7, bestStreak),
      unitLabel: 'Tage',
      isUnlocked: bestStreak >= 7,
    },
    {
      id: 'streak_14',
      title: 'Disziplin-Legende 🌟',
      subtitle: '2 Wochen eiserner Wille',
      description: 'Erreiche einen ununterbrochenen 14-Tage-Streak.',
      category: 'streak',
      tier: 'gold',
      icon: '🌟',
      maxProgress: 14,
      currentProgress: Math.min(14, bestStreak),
      unitLabel: 'Tage',
      isUnlocked: bestStreak >= 14,
    },
    {
      id: 'streak_30',
      title: 'Thai-Mönch 🧘',
      subtitle: '30 Tage Kontinuität',
      description: 'Lerne einen vollen Monat lang jeden einzelnen Tag.',
      category: 'streak',
      tier: 'diamond',
      icon: '🧘',
      maxProgress: 30,
      currentProgress: Math.min(30, bestStreak),
      unitLabel: 'Tage',
      isUnlocked: bestStreak >= 30,
    },

    // 4. Langzeitgedächtnis (Phase 6)
    {
      id: 'phase6_1',
      title: 'Langzeit-Anker ⚓',
      subtitle: '1 Vokabel in Phase 6',
      description: 'Befördere deine allererste Vokabel ins dauerhafte Langzeitgedächtnis.',
      category: 'mastery',
      tier: 'bronze',
      icon: '⚓',
      maxProgress: 1,
      currentProgress: Math.min(1, phase6Count),
      unitLabel: 'Vokabel',
      isUnlocked: phase6Count >= 1,
    },
    {
      id: 'phase6_10',
      title: 'Elefanten-Geist 🐘',
      subtitle: '10 Vokabeln in Phase 6',
      description: '10 Vokabeln fest im Langzeitgedächtnis verankert.',
      category: 'mastery',
      tier: 'silver',
      icon: '🐘',
      maxProgress: 10,
      currentProgress: Math.min(10, phase6Count),
      unitLabel: 'Vokabeln',
      isUnlocked: phase6Count >= 10,
    },
    {
      id: 'phase6_25',
      title: 'Goldener Buddha 👑',
      subtitle: '25 Vokabeln in Phase 6',
      description: 'Befördere 25 Vokabeln erfolgreich in Phase 6.',
      category: 'mastery',
      tier: 'gold',
      icon: '👑',
      maxProgress: 25,
      currentProgress: Math.min(25, phase6Count),
      unitLabel: 'Vokabeln',
      isUnlocked: phase6Count >= 25,
    },
    {
      id: 'phase6_50',
      title: 'Palast-Meister 🏰',
      subtitle: '50 Vokabeln in Phase 6',
      description: 'Erreiche 50 Vokabeln im Langzeitgedächtnis – echte Thai-Souveränität.',
      category: 'mastery',
      tier: 'diamond',
      icon: '🏰',
      maxProgress: 50,
      currentProgress: Math.min(50, phase6Count),
      unitLabel: 'Vokabeln',
      isUnlocked: phase6Count >= 50,
    },

    // 5. Übungszeit & Ausdauer
    {
      id: 'time_15m',
      title: 'Aufgewärmt ⏱️',
      subtitle: '15 Minuten Lernzeit',
      description: 'Sammle insgesamt 15 Minuten echte Übungszeit.',
      category: 'time',
      tier: 'bronze',
      icon: '⏱️',
      maxProgress: 15,
      currentProgress: Math.min(15, totalMinutes),
      unitLabel: 'Minuten',
      isUnlocked: totalMinutes >= 15,
    },
    {
      id: 'time_60m',
      title: 'Ausdauer-Hasi ⏳',
      subtitle: '1 Stunde Gesamtlernzeit',
      description: 'Widme der thailändischen Sprache mindestens eine volle Stunde.',
      category: 'time',
      tier: 'silver',
      icon: '⏳',
      maxProgress: 60,
      currentProgress: Math.min(60, totalMinutes),
      unitLabel: 'Minuten',
      isUnlocked: totalMinutes >= 60,
    },
    {
      id: 'time_300m',
      title: 'Tempel-Marathon 🧘‍♂️',
      subtitle: '5 Stunden Lernzeit',
      description: 'Erreiche 300 Minuten (5 Stunden) intensive Übungszeit.',
      category: 'time',
      tier: 'gold',
      icon: '🧘‍♂️',
      maxProgress: 300,
      currentProgress: Math.min(300, totalMinutes),
      unitLabel: 'Minuten',
      isUnlocked: totalMinutes >= 300,
    },

    // 6. Präzision & Spezial-Awards
    {
      id: 'reviews_50',
      title: 'Wiederholungs-Hero 🔁',
      subtitle: '50 Abfragen beantwortet',
      description: 'Beantworte insgesamt 50 Vokabel-Abfragen in deinen Lernsessions.',
      category: 'special',
      tier: 'bronze',
      icon: '🔁',
      maxProgress: 50,
      currentProgress: Math.min(50, totalReviews),
      unitLabel: 'Abfragen',
      isUnlocked: totalReviews >= 50,
    },
    {
      id: 'sniper_session',
      title: 'Scharfschütze 🎯',
      subtitle: '90%+ Trefferquote',
      description: 'Absolviere eine Übungseinheit mit mindestens 10 Karten und über 90% Trefferquote.',
      category: 'special',
      tier: 'gold',
      icon: '🎯',
      maxProgress: 1,
      currentProgress: hasSniperSession ? 1 : 0,
      unitLabel: 'Session',
      isUnlocked: hasSniperSession,
    },
    {
      id: 'two_way_master',
      title: 'Zwei-Wege-Experte 🔄',
      subtitle: '🇩🇪➔🇹🇭 und 🇹🇭➔🇩🇪',
      description: 'Bringe mindestens 10 Vokabeln in beiden Richtungen auf Phase 3 oder höher.',
      category: 'mastery',
      tier: 'silver',
      icon: '🔄',
      maxProgress: 10,
      currentProgress: Math.min(10, twoWayMasteryCount),
      unitLabel: 'Vokabeln',
      isUnlocked: twoWayMasteryCount >= 10,
    },
    {
      id: 'typing_champion',
      title: 'Tastatur-König ⌨️',
      subtitle: '25 richtige Schreibabfragen',
      description: 'Tippe 25 thailändische Vokabeln im Schreibmodus fehlerfrei ein.',
      category: 'special',
      tier: 'silver',
      icon: '⌨️',
      maxProgress: 25,
      currentProgress: Math.min(25, typingCorrectCount),
      unitLabel: 'Vokabeln',
      isUnlocked: typingCorrectCount >= 25,
    },
    {
      id: 'night_owl',
      title: 'Nachteule 🌙',
      subtitle: 'Lernen nach 22:00 Uhr',
      description: 'Schließe eine Lerneinheit spätabends ab.',
      category: 'special',
      tier: 'bronze',
      icon: '🌙',
      maxProgress: 1,
      currentProgress: hasNightOwl ? 1 : 0,
      unitLabel: 'Session',
      isUnlocked: hasNightOwl,
    },
    {
      id: 'early_bird',
      title: 'Morgenstund 🌅',
      subtitle: 'Lernen vor 08:00 Uhr',
      description: 'Schließe eine Lerneinheit früh am Morgen ab.',
      category: 'special',
      tier: 'bronze',
      icon: '🌅',
      maxProgress: 1,
      currentProgress: hasEarlyBird ? 1 : 0,
      unitLabel: 'Session',
      isUnlocked: hasEarlyBird,
    },
  ];

  return rawAwards;
}
