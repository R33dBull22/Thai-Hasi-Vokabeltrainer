export type AwardTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export type AwardCategory = 'streak' | 'time' | 'mastery' | 'quantity' | 'special';

export interface Award {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: AwardCategory;
  tier: AwardTier;
  icon: string;
  maxProgress: number;
  currentProgress: number;
  unitLabel?: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface StudySessionRecord {
  id: string;
  userId?: string;
  startedAt: string;     // ISO timestamp
  completedAt: string;   // ISO timestamp
  durationSeconds: number;
  cardsStudied: number;
  correctCount: number;
  incorrectCount: number;
  promotedToPhase6Count: number;
  direction: 'de_to_th' | 'th_to_de' | 'both';
  inputMethod: 'typing' | 'flashcard';
}

export interface DailyPracticeData {
  date: string;         // YYYY-MM-DD
  dayLabel: string;     // Mo, Di, Mi, ...
  displayDate: string;  // 12. Okt
  minutes: number;      // Minuten (Dezimal z. B. 12.5)
  seconds: number;      // Exakte Sekunden
  cards: number;        // Anzahl geübter Karten
  correct: number;
  incorrect: number;
  accuracy: number;     // Prozent 0-100
}

export interface WeeklyLearnedData {
  weekKey: string;      // YYYY-Wxx
  weekLabel: string;    // KW 41
  fullLabel: string;    // 06. - 12. Okt
  learnedCount: number; // In Phase 2+ aufgestiegen oder P6
  reviewCount: number;  // Insgesamt absolvierte Reviews
  practiceMinutes: number;
  phase6Promotions: number;
}

export interface PhaseDistributionData {
  phase: number;
  name: string;
  count: number;
  color: string;
  percentage: number;
}
