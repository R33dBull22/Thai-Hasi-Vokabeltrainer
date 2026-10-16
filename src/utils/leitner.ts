import { PhaseConfig, UserProgress, DirectionProgress, QueryDirection } from '../types/vocab';

export const PHASES: Record<number, PhaseConfig> = {
  1: {
    phase: 1,
    name: 'Phase 1',
    intervalDays: 1,
    intervalLabel: 'Täglich / Sofort',
    badgeBg: 'bg-rose-500',
    badgeText: 'text-white',
    borderColor: 'border-rose-300',
    bgLight: 'bg-rose-50',
    description: 'Neu im Deck, tägliche Wiederholung',
  },
  2: {
    phase: 2,
    name: 'Phase 2',
    intervalDays: 3,
    intervalLabel: '3 Tage',
    badgeBg: 'bg-amber-500',
    badgeText: 'text-white',
    borderColor: 'border-amber-300',
    bgLight: 'bg-amber-50',
    description: 'Erste Festigung, Wiederholung nach 3 Tagen',
  },
  3: {
    phase: 3,
    name: 'Phase 3',
    intervalDays: 7,
    intervalLabel: '7 Tage',
    badgeBg: 'bg-emerald-500',
    badgeText: 'text-white',
    borderColor: 'border-emerald-300',
    bgLight: 'bg-emerald-50',
    description: 'Mittelfristig gefestigt, 1 Woche Pause',
  },
  4: {
    phase: 4,
    name: 'Phase 4',
    intervalDays: 15,
    intervalLabel: '15 Tage',
    badgeBg: 'bg-sky-500',
    badgeText: 'text-white',
    borderColor: 'border-sky-300',
    bgLight: 'bg-sky-50',
    description: 'Sichere Kenntnis, Wiederholung nach 2 Wochen',
  },
  5: {
    phase: 5,
    name: 'Phase 5',
    intervalDays: 30,
    intervalLabel: '30 Tage',
    badgeBg: 'bg-indigo-600',
    badgeText: 'text-white',
    borderColor: 'border-indigo-300',
    bgLight: 'bg-indigo-50',
    description: 'Starkes Gedächtnis, Wiederholung nach 1 Monat',
  },
  6: {
    phase: 6,
    name: 'Phase 6',
    intervalDays: 90,
    intervalLabel: '90 Tage',
    badgeBg: 'bg-purple-600',
    badgeText: 'text-white',
    borderColor: 'border-purple-300',
    bgLight: 'bg-purple-50',
    description: 'Langzeitgedächtnis gemeistert!',
  },
};

/**
 * Calculates next review ISO date string based on current phase after answering correctly
 */
export function calculateNextReviewDate(nextPhase: number): string {
  const config = PHASES[nextPhase] || PHASES[1];
  const now = new Date();
  now.setDate(now.getDate() + config.intervalDays);
  return now.toISOString();
}

/**
 * When answering incorrectly, review is due immediately today
 */
export function calculateResetReviewDate(): string {
  // Immediately due (1 second in past ensures <= Date.now() is always true)
  return new Date(Date.now() - 1000).toISOString();
}

/**
 * Check if a card is currently due for review.
 * In Leitner spaced repetition, any card whose scheduled review date is today
 * or in the past (calendar day / midnight comparison) is due today.
 * We do not block cards based on the exact minute or second they were reviewed yesterday.
 */
export function isCardDue(nextReviewDateStr: string): boolean {
  if (!nextReviewDateStr) return true;
  const target = new Date(nextReviewDateStr);
  if (isNaN(target.getTime())) return true;

  const now = new Date();
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return targetMidnight <= nowMidnight;
}

/**
 * Format relative due time and calendar date (e.g., "Heute fällig", "Morgen fällig (13.10.)", "In 3 Tagen (15.10.)", "Überfällig (seit 2 Tagen)")
 */
export function formatDueDate(dateStr?: string): {
  label: string;
  isDue: boolean;
  dateFormatted: string;
  daysDiff: number;
} {
  if (!dateStr) {
    return {
      label: 'Jetzt fällig',
      isDue: true,
      dateFormatted: 'Heute',
      daysDiff: 0,
    };
  }

  const target = new Date(dateStr);
  const now = new Date();
  const dateFormatted = target.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: target.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });

  // Calculate midnight diff to avoid timezone shift inconsistencies
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffDays = Math.round((targetMidnight - nowMidnight) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      label: overdueDays === 1 ? 'Gestern fällig' : `Überfällig (${overdueDays} T.)`,
      isDue: true,
      dateFormatted,
      daysDiff: diffDays,
    };
  }

  if (diffDays === 0) {
    return {
      label: 'Heute fällig',
      isDue: true,
      dateFormatted,
      daysDiff: 0,
    };
  }

  if (diffDays === 1) {
    return {
      label: `Morgen (${dateFormatted})`,
      isDue: false,
      dateFormatted,
      daysDiff: 1,
    };
  }

  return {
    label: `In ${diffDays} Tagen (${dateFormatted})`,
    isDue: false,
    dateFormatted,
    daysDiff: diffDays,
  };
}

/**
 * Returns the DirectionProgress for a specific query direction ('de_to_th' or 'th_to_de').
 * Gracefully falls back to overall legacy progress if directional progress is not yet set.
 */
export function getDirectionProgress(
  prog: UserProgress | undefined,
  direction: QueryDirection
): DirectionProgress {
  const dirKey = direction === 'de_to_th' ? 'deToTh' : 'thToDe';
  const existingDir = prog ? prog[dirKey] : undefined;

  if (existingDir && typeof existingDir.phase === 'number') {
    return {
      phase: Math.max(1, Math.min(6, existingDir.phase)),
      nextReviewDate: existingDir.nextReviewDate || prog?.nextReviewDate || new Date().toISOString(),
      lastReviewedAt: existingDir.lastReviewedAt || prog?.lastReviewedAt,
      streak: existingDir.streak ?? 0,
      correctCount: existingDir.correctCount ?? 0,
      incorrectCount: existingDir.incorrectCount ?? 0,
    };
  }

  // Fallback to legacy progress fields or default Phase 1
  const fallbackPhase = prog?.phase && prog.phase >= 1 && prog.phase <= 6 ? prog.phase : 1;
  return {
    phase: fallbackPhase,
    nextReviewDate: prog?.nextReviewDate || new Date().toISOString(),
    lastReviewedAt: prog?.lastReviewedAt,
    streak: prog?.streak ?? 0,
    correctCount: prog?.correctCount ?? 0,
    incorrectCount: prog?.incorrectCount ?? 0,
  };
}

/**
 * Checks whether a vocabulary item is due in a specific direction
 */
export function isDirectionDue(
  prog: UserProgress | undefined,
  direction: QueryDirection
): boolean {
  if (!prog) return false;
  const dirProg = getDirectionProgress(prog, direction);
  return isCardDue(dirProg.nextReviewDate);
}

/**
 * Checks whether a vocabulary item is due in either direction
 */
export function isAnyDirectionDue(prog: UserProgress | undefined): boolean {
  if (!prog) return false;
  return isDirectionDue(prog, 'de_to_th') || isDirectionDue(prog, 'th_to_de');
}

/**
 * Fisher-Yates array shuffle helper
 */
function fisherYatesShuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Intelligently shuffles study cards so that:
 * 1. The order of cards is thoroughly randomized.
 * 2. Opposing query directions (DE -> TH and TH -> DE) of the SAME vocabulary
 *    NEVER appear consecutively, and are spaced apart across the session as far as possible.
 * 3. Direction priority per vocabulary is randomized (either DE->TH or TH->DE comes first).
 */
export function shuffleStudyCards<T extends { vocab: { id: string }; direction?: QueryDirection }>(
  cards: T[]
): T[] {
  if (!cards || cards.length <= 1) return cards ? [...cards] : [];

  // Group cards by vocabulary ID
  const groups = new Map<string, T[]>();
  cards.forEach((card) => {
    const list = groups.get(card.vocab.id) || [];
    list.push(card);
    groups.set(card.vocab.id, list);
  });

  const firstHalf: T[] = [];
  const secondHalf: T[] = [];

  // Get all unique vocab groups in randomized order
  const uniqueVocabGroups = fisherYatesShuffle(Array.from(groups.values()));

  uniqueVocabGroups.forEach((group) => {
    if (group.length === 1) {
      // Single card: alternate or balance between first and second half
      if (firstHalf.length <= secondHalf.length) {
        firstHalf.push(group[0]);
      } else {
        secondHalf.push(group[0]);
      }
    } else {
      // Multiple cards for same vocabulary (e.g. DE->TH and TH->DE):
      // Randomize which direction goes into the first half vs second half
      const shuffledGroup = fisherYatesShuffle(group);
      firstHalf.push(shuffledGroup[0]);
      secondHalf.push(shuffledGroup[1]);
      // If there are more than 2, distribute remainder evenly
      for (let i = 2; i < shuffledGroup.length; i++) {
        if (i % 2 === 0) firstHalf.push(shuffledGroup[i]);
        else secondHalf.push(shuffledGroup[i]);
      }
    }
  });

  // Independently shuffle both halves to thoroughly mix up the order of different words
  const shuffledFirst = fisherYatesShuffle(firstHalf);
  const shuffledSecond = fisherYatesShuffle(secondHalf);

  const result: T[] = [...shuffledFirst, ...shuffledSecond];

  // Post-processing safety: ensure no adjacent cards share the same vocabulary ID
  for (let i = 1; i < result.length; i++) {
    if (result[i].vocab.id === result[i - 1].vocab.id) {
      // Find a suitable candidate ahead to swap with
      let swapIdx = -1;
      for (let j = i + 1; j < result.length; j++) {
        if (
          result[j].vocab.id !== result[i - 1].vocab.id &&
          (j + 1 >= result.length || result[j + 1].vocab.id !== result[i].vocab.id)
        ) {
          swapIdx = j;
          break;
        }
      }

      if (swapIdx !== -1) {
        const temp = result[i];
        result[i] = result[swapIdx];
        result[swapIdx] = temp;
      } else {
        // If no candidate ahead, look backwards before i-1
        for (let j = 0; j < i - 1; j++) {
          if (
            result[j].vocab.id !== result[i].vocab.id &&
            result[j].vocab.id !== result[i - 1].vocab.id &&
            (j === 0 || result[j - 1].vocab.id !== result[i].vocab.id) &&
            result[j + 1].vocab.id !== result[i].vocab.id &&
            (i + 1 >= result.length || result[j].vocab.id !== result[i + 1].vocab.id)
          ) {
            const temp = result[i];
            result[i] = result[j];
            result[j] = temp;
            break;
          }
        }
      }
    }
  }

  return result;
}

