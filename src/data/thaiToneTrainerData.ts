// Thai Tone Rules Trainer Data & Dynamic Syllable Analyzer

import { ConsonantClass, CONSONANT_CLASS_CONFIG, THAI_CONSONANTS } from './thaiAlphabet';
import { ThaiTone, THAI_TONES, parseThaiSyllable, splitThaiIntoSyllables, computeTone, applyToneToSyllable } from '../utils/thaiTones';

export interface ToneTrainerSyllableDetail {
  syllableIndex: number;
  totalSyllables: number;
  syllable: string;
  romanization: string;
  initialLetter: string;
  initialClass: ConsonantClass;
  initialClassName: string;
  toneMark: 'none' | 'mai_ek' | 'mai_tho' | 'mai_tri' | 'mai_chattawa';
  toneMarkName: string;
  syllableType: 'live' | 'dead';
  syllableTypeName: string;
  vowelLength: 'short' | 'long';
  vowelLengthName: string;
  tone: ThaiTone;
  ruleFormula: string;
  ruleTip: string;
}

export interface ToneTrainerWord {
  id: string;
  thai: string;
  meaning: string;
  romanization: string;
  initialLetter: string;
  initialClass: ConsonantClass;
  initialClassName: string;
  toneMark: 'none' | 'mai_ek' | 'mai_tho' | 'mai_tri' | 'mai_chattawa';
  toneMarkName: string;
  syllableType: 'live' | 'dead';
  syllableTypeName: string;
  vowelLength: 'short' | 'long';
  vowelLengthName: string;
  tone: ThaiTone;
  ruleFormula: string;
  ruleTip: string;
  level: number;
  syllables?: ToneTrainerSyllableDetail[];
  targetSyllableText?: string;
  targetSyllableRoman?: string;
}

export interface ToneTrainerLevel {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  focusRule: string;
  words: ToneTrainerWord[];
}

export const TONE_MARK_INFO: Record<
  'none' | 'mai_ek' | 'mai_tho' | 'mai_tri' | 'mai_chattawa',
  { symbol: string; thaiName: string; germanName: string; shortcut: string }
> = {
  none: {
    symbol: '—',
    thaiName: 'ไม่มีวรรณยุกต์',
    germanName: 'Kein Zeichen',
    shortcut: 'Kein Tonzeichen',
  },
  mai_ek: {
    symbol: '่',
    thaiName: 'ไม้เอก',
    germanName: 'Mai Ek',
    shortcut: 'Strich oben ( -่ )',
  },
  mai_tho: {
    symbol: '้',
    thaiName: 'ไม้โท',
    germanName: 'Mai Tho',
    shortcut: 'Zwei-Form oben ( -้ )',
  },
  mai_tri: {
    symbol: '๊',
    thaiName: 'ไม้ตรี',
    germanName: 'Mai Tri',
    shortcut: 'Sieben-Form oben ( -๊ )',
  },
  mai_chattawa: {
    symbol: '๋',
    thaiName: 'ไม้จัตวา',
    germanName: 'Mai Chattawa',
    shortcut: 'Plus-Form oben ( -๋ )',
  },
};

export const SYLLABLE_TYPE_INFO = {
  live: {
    thaiName: 'คำเป็น (Kham Pen)',
    germanName: 'Lebende Silbe',
    description: 'Klingt sonor und weich aus: Langer Vokal ODER Endkonsonant m, n, ng, y, w (NOM-YUANG).',
    icon: '🕊️',
  },
  dead: {
    thaiName: 'คำตาย (Kham Tai)',
    germanName: 'Tote Silbe',
    description: 'Bricht abrupt ab: Kurzer Vokal ODER Plosiv-Endlaut k, p, t (KOBAT).',
    icon: '🛑',
  },
};

// Curated Trainer Levels with high pedagogical value
export const CURATED_TONE_LEVELS: ToneTrainerLevel[] = [
  {
    id: 1,
    title: 'Level 1: Mittlere Konsonanten',
    subtitle: 'Die 9 flexiblen Buchstaben (ก จ ด ต บ ป อ ฎ ฏ)',
    badge: 'Basis',
    badgeColor: 'border-amber-400/40 text-amber-400 bg-amber-400/10',
    focusRule: 'Mittlere Konsonanten können alle 5 Töne annehmen. Ohne Zeichen = Mitte (lebend) oder Tief (tot).',
    words: [
      {
        id: 'c1-1',
        thai: 'กา',
        meaning: 'Krähe / Teekessel',
        romanization: 'gaa',
        initialLetter: 'ก',
        initialClass: 'mid',
        initialClassName: 'Mittelklasse',
        toneMark: 'none',
        toneMarkName: 'Kein Zeichen',
        syllableType: 'live',
        syllableTypeName: 'Lebende Silbe',
        vowelLength: 'long',
        vowelLengthName: 'Langer Vokal (aa)',
        tone: 'mid',
        ruleFormula: 'Mittelklasse (ก) + Lebend (กา) ➔ Mittlerer Ton',
        ruleTip: 'Mittelklasse ohne Tonzeichen und mit langem Vokal ergibt immer den natürlichen mittleren Ton.',
        level: 1,
      },
      {
        id: 'c1-2',
        thai: 'ไป',
        meaning: 'gehen',
        romanization: 'bpai',
        initialLetter: 'ป',
        initialClass: 'mid',
        initialClassName: 'Mittelklasse',
        toneMark: 'none',
        toneMarkName: 'Kein Zeichen',
        syllableType: 'live',
        syllableTypeName: 'Lebende Silbe',
        vowelLength: 'long',
        vowelLengthName: 'Diphthong (ai = lebend)',
        tone: 'mid',
        ruleFormula: 'Mittelklasse (ป) + Diphthong (ai) ➔ Mittlerer Ton',
        ruleTip: 'Der Vokal "ai" (ใ / ไ) zählt wie ein lebender Halbvokal (-y) und erzeugt einen mittleren Ton.',
        level: 1,
      },
      {
        id: 'c1-3',
        thai: 'กะ',
        meaning: 'schätzen / mit',
        romanization: 'gà',
        initialLetter: 'ก',
        initialClass: 'mid',
        initialClassName: 'Mittelklasse',
        toneMark: 'none',
        toneMarkName: 'Kein Zeichen',
        syllableType: 'dead',
        syllableTypeName: 'Tote Silbe',
        vowelLength: 'short',
        vowelLengthName: 'Kurzer Vokal (a)',
        tone: 'low',
        ruleFormula: 'Mittelklasse (ก) + Tot (kurzes a) ➔ Tiefton',
        ruleTip: 'Ein kurzer Vokal ohne Endkonsonant bricht abrupt mit einem Kehlkopfverschluss ab (= tote Silbe = Tiefton).',
        level: 1,
      },
      {
        id: 'c1-4',
        thai: 'กาก',
        meaning: 'Abfall / Überrest',
        romanization: 'gàak',
        initialLetter: 'ก',
        initialClass: 'mid',
        initialClassName: 'Mittelklasse',
        toneMark: 'none',
        toneMarkName: 'Kein Zeichen',
        syllableType: 'dead',
        syllableTypeName: 'Tote Silbe',
        vowelLength: 'long',
        vowelLengthName: 'Langer Vokal (aa) + k-Endlaut',
        tone: 'low',
        ruleFormula: 'Mittelklasse (ก) + Tot (k-Stop) ➔ Tiefton',
        ruleTip: 'Bei mittleren Konsonanten ergeben sowohl kurze als auch lange tote Silben immer einen Tiefton.',
        level: 1,
      },
      {
        id: 'c1-5',
        thai: 'ไก่',
        meaning: 'Huhn / Hähnchen',
        romanization: 'gài',
        initialLetter: 'ก',
        initialClass: 'mid',
        initialClassName: 'Mittelklasse',
        toneMark: 'mai_ek',
        toneMarkName: 'Mai Ek ( -่ )',
        syllableType: 'live',
        syllableTypeName: 'Lebende Silbe',
        vowelLength: 'long',
        vowelLengthName: 'Diphthong (ai)',
        tone: 'low',
        ruleFormula: 'Mittelklasse (ก) + Mai Ek ( -่ ) ➔ Tiefton',
        ruleTip: 'Bei mittleren Konsonanten entspricht das Zeichen genau dem Ton: Mai Ek (1. Zeichen) = Tiefton.',
        level: 1,
      },
      {
        id: 'c1-6',
        thai: 'ได้',
        meaning: 'können / bekommen',
        romanization: 'dâai',
        initialLetter: 'ด',
        initialClass: 'mid',
        initialClassName: 'Mittelklasse',
        toneMark: 'mai_tho',
        toneMarkName: 'Mai Tho ( -้ )',
        syllableType: 'live',
        syllableTypeName: 'Lebende Silbe',
        vowelLength: 'long',
        vowelLengthName: 'Diphthong (ai)',
        tone: 'falling',
        ruleFormula: 'Mittelklasse (ด) + Mai Tho ( -้ ) ➔ Fallender Ton',
        ruleTip: 'Mai Tho auf mittleren Konsonanten erzeugt immer einen energischen fallenden Ton.',
        level: 1,
      },
      {
        id: 'c1-7',
        thai: 'โต๊ะ',
        meaning: 'Tisch',
        romanization: 'dtó',
        initialLetter: 'ต',
        initialClass: 'mid',
        initialClassName: 'Mittelklasse',
        toneMark: 'mai_tri',
        toneMarkName: 'Mai Tri ( -๊ )',
        syllableType: 'dead',
        syllableTypeName: 'Tote Silbe',
        vowelLength: 'short',
        vowelLengthName: 'Kurzer Vokal (o)',
        tone: 'high',
        ruleFormula: 'Mittelklasse (ต) + Mai Tri ( -๊ ) ➔ Hochton',
        ruleTip: 'Mai Tri ( -๊ ) kommt fast ausschließlich auf mittleren Konsonanten vor und erzeugt immer einen Hochton.',
        level: 1,
      },
      {
        id: 'c1-8',
        thai: 'ตั๋ว',
        meaning: 'Fahrkarte / Ticket',
        romanization: 'dtŭa',
        initialLetter: 'ต',
        initialClass: 'mid',
        initialClassName: 'Mittelklasse',
        toneMark: 'mai_chattawa',
        toneMarkName: 'Mai Chattawa ( -๋ )',
        syllableType: 'live',
        syllableTypeName: 'Lebende Silbe',
        vowelLength: 'long',
        vowelLengthName: 'Diphthong (ua)',
        tone: 'rising',
        ruleFormula: 'Mittelklasse (ต) + Mai Chattawa ( -๋ ) ➔ Steigender Ton',
        ruleTip: 'Mai Chattawa (das Pluszeichen) gibt es nur bei mittleren Konsonanten und erzeugt immer einen steigenden Ton.',
        level: 1,
      },
    ],
  },
  {
    id: 2,
    title: 'Level 2: Hohe Konsonanten',
    subtitle: 'Die 11 ansteigenden Buchstaben (ข ฉ ฐ ถ ผ ฝ ศ ษ ส ห ฃ)',
    badge: 'Mittel',
    badgeColor: 'border-emerald-400/40 text-emerald-400 bg-emerald-400/10',
    focusRule: 'Hohe Konsonanten haben einen natürlichen Steigton. Tote Silben erzeugen immer Tieftöne.',
    words: [
      {
        id: 'c2-1',
        thai: 'ขา',
        meaning: 'Bein',
        romanization: 'kăa',
        initialLetter: 'ข',
        initialClass: 'high',
        initialClassName: 'Hochklasse',
        toneMark: 'none',
        toneMarkName: 'Kein Zeichen',
        syllableType: 'live',
        syllableTypeName: 'Lebende Silbe',
        vowelLength: 'long',
        vowelLengthName: 'Langer Vokal (aa)',
        tone: 'rising',
        ruleFormula: 'Hochklasse (ข) + Lebend (ขา) ➔ Steigender Ton',
        ruleTip: 'Wichtige Grundregel: Hohe Konsonanten ohne Tonzeichen klingen von Natur aus fragend steigend!',
        level: 2,
      },
      {
        id: 'c2-2',
        thai: 'หมา',
        meaning: 'Hund',
        romanization: 'măa',
        initialLetter: 'ห',
        initialClass: 'high',
        initialClassName: 'Hochklasse (Führendes Ho-Hip ห)',
        toneMark: 'none',
        toneMarkName: 'Kein Zeichen',
        syllableType: 'live',
        syllableTypeName: 'Lebende Silbe',
        vowelLength: 'long',
        vowelLengthName: 'Langer Vokal (aa)',
        tone: 'rising',
        ruleFormula: 'Führendes ห (Hochklasse) + ม (Lebend) ➔ Steigender Ton',
        ruleTip: 'Das stumme ห macht den folgenden tiefen Konsonanten (ม) zu einem hohen Konsonanten mit Steigton!',
        level: 2,
      },
      {
        id: 'c2-3',
        thai: 'ข่า',
        meaning: 'Galgant (Thai-Ingwer)',
        romanization: 'kàa',
        initialLetter: 'ข',
        initialClass: 'high',
        initialClassName: 'Hochklasse',
        toneMark: 'mai_ek',
        toneMarkName: 'Mai Ek ( -่ )',
        syllableType: 'live',
        syllableTypeName: 'Lebende Silbe',
        vowelLength: 'long',
        vowelLengthName: 'Langer Vokal (aa)',
        tone: 'low',
        ruleFormula: 'Hochklasse (ข) + Mai Ek ( -่ ) ➔ Tiefton',
        ruleTip: 'Mai Ek drückt die Stimme nach unten: Hochklasse + Mai Ek ergibt Tiefton.',
        level: 2,
      },
      {
        id: 'c2-4',
        thai: 'ข้าว',
        meaning: 'Reis / Mahlzeit',
        romanization: 'kâao',
        initialLetter: 'ข',
        initialClass: 'high',
        initialClassName: 'Hochklasse',
        toneMark: 'mai_tho',
        toneMarkName: 'Mai Tho ( -้ )',
        syllableType: 'live',
        syllableTypeName: 'Lebende Silbe',
        vowelLength: 'long',
        vowelLengthName: 'Halbvokal w / ao',
        tone: 'falling',
        ruleFormula: 'Hochklasse (ข) + Mai Tho ( -้ ) ➔ Fallender Ton',
        ruleTip: 'Eines der häufigsten Wörter Thailands: ข้าว hat Hochklasse ข mit Mai Tho ➔ Fallend!',
        level: 2,
      },
      {
        id: 'c2-5',
        thai: 'ผัด',
        meaning: 'braten / rührbraten (wie Pad Thai)',
        romanization: 'phàt',
        initialLetter: 'ผ',
        initialClass: 'high',
        initialClassName: 'Hochklasse',
        toneMark: 'none',
        toneMarkName: 'Kein Zeichen',
        syllableType: 'dead',
        syllableTypeName: 'Tote Silbe',
        vowelLength: 'short',
        vowelLengthName: 'Kurzer Vokal (a) + d-Stop',
        tone: 'low',
        ruleFormula: 'Hochklasse (ผ) + Tot (ผัด) ➔ Tiefton',
        ruleTip: 'Tote Silben bei hohen Konsonanten (egal ob kurz oder lang) fallen immer tief aus.',
        level: 2,
      },
      {
        id: 'c2-6',
        thai: 'สอง',
        meaning: 'zwei (2)',
        romanization: 'săawng',
        initialLetter: 'ส',
        initialClass: 'high',
        initialClassName: 'Hochklasse',
        toneMark: 'none',
        toneMarkName: 'Kein Zeichen',
        syllableType: 'live',
        syllableTypeName: 'Lebende Silbe',
        vowelLength: 'long',
        vowelLengthName: 'Endlaut ng (weich)',
        tone: 'rising',
        ruleFormula: 'Hochklasse (ส) + Lebend (ง) ➔ Steigender Ton',
        ruleTip: 'Endlaut -ง ist lebend. Da ส zur Hochklasse gehört, ist die Zahl 2 immer steigend.',
        level: 2,
      },
    ],
  },
  {
    id: 3,
    title: 'Level 3: Tiefe Konsonanten mit Tonzeichen',
    subtitle: 'Der berühmte Ton-Verschiebe-Effekt (อักษรต่ำ + วรรณยุกต์)',
    badge: 'Fokus',
    badgeColor: 'border-rose-400/40 text-rose-400 bg-rose-400/10',
    focusRule: 'ACHTUNG: Bei tiefen Konsonanten schiebt das Zeichen den Ton um 1 Stufe nach oben! Mai Ek = Fallend, Mai Tho = Hoch.',
    words: [
      {
        id: 'c3-1',
        thai: 'ไม่',
        meaning: 'nicht / nein',
        romanization: 'mâi',
        initialLetter: 'ม',
        initialClass: 'low',
        initialClassName: 'Tiefklasse',
        toneMark: 'mai_ek',
        toneMarkName: 'Mai Ek ( -่ )',
        syllableType: 'live',
        syllableTypeName: 'Lebende Silbe',
        vowelLength: 'long',
        vowelLengthName: 'Diphthong (ai)',
        tone: 'falling',
        ruleFormula: 'Tiefklasse (ม) + Mai Ek ( -่ ) ➔ Fallender Ton',
        ruleTip: 'Größte Falle für Anfänger: Mai Ek auf Tiefklasse erzeugt KEINEN Tiefton, sondern einen FALLENDEN Ton!',
        level: 3,
      },
      {
        id: 'c3-2',
        thai: 'พี่',
        meaning: 'älterer Bruder / ältere Schwester',
        romanization: 'phêe',
        initialLetter: 'พ',
        initialClass: 'low',
        initialClassName: 'Tiefklasse',
        toneMark: 'mai_ek',
        toneMarkName: 'Mai Ek ( -่ )',
        syllableType: 'live',
        syllableTypeName: 'Lebende Silbe',
        vowelLength: 'long',
        vowelLengthName: 'Langer Vokal (ee)',
        tone: 'falling',
        ruleFormula: 'Tiefklasse (พ) + Mai Ek ( -่ ) ➔ Fallender Ton',
        ruleTip: 'Tiefklasse พ mit Mai Ek ➔ Der Ton springt von tief auf fallend.',
        level: 3,
      },
      {
        id: 'c3-3',
        thai: 'น้ำ',
        meaning: 'Wasser',
        romanization: 'nám',
        initialLetter: 'น',
        initialClass: 'low',
        initialClassName: 'Tiefklasse',
        toneMark: 'mai_tho',
        toneMarkName: 'Mai Tho ( -้ )',
        syllableType: 'live',
        syllableTypeName: 'Lebende Silbe',
        vowelLength: 'short',
        vowelLengthName: 'Vokal am (ำ)',
        tone: 'high',
        ruleFormula: 'Tiefklasse (น) + Mai Tho ( -้ ) ➔ Hochton',
        ruleTip: 'Mai Tho auf Tiefklasse erzeugt immer einen HOCHTON (keinen fallenden Ton wie bei Mittel- oder Hochklasse)!',
        level: 3,
      },
      {
        id: 'c3-4',
        thai: 'ม้า',
        meaning: 'Pferd',
        romanization: 'máa',
        initialLetter: 'ม',
        initialClass: 'low',
        initialClassName: 'Tiefklasse',
        toneMark: 'mai_tho',
        toneMarkName: 'Mai Tho ( -้ )',
        syllableType: 'live',
        syllableTypeName: 'Lebende Silbe',
        vowelLength: 'long',
        vowelLengthName: 'Langer Vokal (aa)',
        tone: 'high',
        ruleFormula: 'Tiefklasse (ม) + Mai Tho ( -้ ) ➔ Hochton',
        ruleTip: 'Merksatz: มา = Mitte, ม่า = Fallend, ม้า = Hoch. Tiefklasse schiebt alles nach oben.',
        level: 3,
      },
      {
        id: 'c3-5',
        thai: 'ช้า',
        meaning: 'langsam',
        romanization: 'cháa',
        initialLetter: 'ช',
        initialClass: 'low',
        initialClassName: 'Tiefklasse',
        toneMark: 'mai_tho',
        toneMarkName: 'Mai Tho ( -้ )',
        syllableType: 'live',
        syllableTypeName: 'Lebende Silbe',
        vowelLength: 'long',
        vowelLengthName: 'Langer Vokal (aa)',
        tone: 'high',
        ruleFormula: 'Tiefklasse (ช) + Mai Tho ( -้ ) ➔ Hochton',
        ruleTip: 'ช ist Tiefklasse. Mit Mai Tho wird das Wort mit einem hohen, gespannten Ton ausgesprochen.',
        level: 3,
      },
      {
        id: 'c3-6',
        thai: 'แม่',
        meaning: 'Mutter',
        romanization: 'mâae',
        initialLetter: 'ม',
        initialClass: 'low',
        initialClassName: 'Tiefklasse',
        toneMark: 'mai_ek',
        toneMarkName: 'Mai Ek ( -่ )',
        syllableType: 'live',
        syllableTypeName: 'Lebende Silbe',
        vowelLength: 'long',
        vowelLengthName: 'Langer Vokal (aae)',
        tone: 'falling',
        ruleFormula: 'Tiefklasse (ม) + Mai Ek ( -่ ) ➔ Fallender Ton',
        ruleTip: 'แม่ (Mama) hat Mai Ek auf Tiefklasse ม ➔ klarer fallender Ton.',
        level: 3,
      },
    ],
  },
  {
    id: 4,
    title: 'Level 4: Tiefe Konsonanten ohne Zeichen',
    subtitle: 'Lebend vs. Tot (Kurz = Hoch, Lang = Fallend)',
    badge: 'Fortgeschritten',
    badgeColor: 'border-sky-400/40 text-sky-400 bg-sky-400/10',
    focusRule: 'Ohne Tonzeichen: Lebend = Mitte. Tot mit kurzem Vokal = Hoch. Tot mit langem Vokal = Fallend.',
    words: [
      {
        id: 'c4-1',
        thai: 'มา',
        meaning: 'kommen',
        romanization: 'maa',
        initialLetter: 'ม',
        initialClass: 'low',
        initialClassName: 'Tiefklasse',
        toneMark: 'none',
        toneMarkName: 'Kein Zeichen',
        syllableType: 'live',
        syllableTypeName: 'Lebende Silbe',
        vowelLength: 'long',
        vowelLengthName: 'Langer Vokal (aa)',
        tone: 'mid',
        ruleFormula: 'Tiefklasse (ม) + Lebend (มา) ➔ Mittlerer Ton',
        ruleTip: 'Tiefklasse lebend hat genau wie Mittelklasse einen entspannten mittleren Ton.',
        level: 4,
      },
      {
        id: 'c4-2',
        thai: 'รัก',
        meaning: 'lieben',
        romanization: 'rák',
        initialLetter: 'ร',
        initialClass: 'low',
        initialClassName: 'Tiefklasse',
        toneMark: 'none',
        toneMarkName: 'Kein Zeichen',
        syllableType: 'dead',
        syllableTypeName: 'Tote Silbe',
        vowelLength: 'short',
        vowelLengthName: 'Kurzer Vokal (a) + k-Stop',
        tone: 'high',
        ruleFormula: 'Tiefklasse (ร) + Tot kurz (รัก) ➔ Hochton',
        ruleTip: 'Kurze tote Silbe bei Tiefklasse erzeugt einen schnellen, hohen Ton (wie in รัก / rák).',
        level: 4,
      },
      {
        id: 'c4-3',
        thai: 'มาก',
        meaning: 'sehr / viel',
        romanization: 'mâak',
        initialLetter: 'ม',
        initialClass: 'low',
        initialClassName: 'Tiefklasse',
        toneMark: 'none',
        toneMarkName: 'Kein Zeichen',
        syllableType: 'dead',
        syllableTypeName: 'Tote Silbe',
        vowelLength: 'long',
        vowelLengthName: 'Langer Vokal (aa) + k-Stop',
        tone: 'falling',
        ruleFormula: 'Tiefklasse (ม) + Tot lang (มาก) ➔ Fallender Ton',
        ruleTip: 'Lange tote Silbe bei Tiefklasse erzeugt einen fallenden Ton (im Gegensatz zur kurzen, die hoch ist)!',
        level: 4,
      },
      {
        id: 'c4-4',
        thai: 'คน',
        meaning: 'Mensch / Person',
        romanization: 'khon',
        initialLetter: 'ค',
        initialClass: 'low',
        initialClassName: 'Tiefklasse',
        toneMark: 'none',
        toneMarkName: 'Kein Zeichen',
        syllableType: 'live',
        syllableTypeName: 'Lebende Silbe',
        vowelLength: 'short',
        vowelLengthName: 'Endlaut n (Sonorant)',
        tone: 'mid',
        ruleFormula: 'Tiefklasse (ค) + Lebend (-น) ➔ Mittlerer Ton',
        ruleTip: 'Der n-Endlaut ist ein weicher Sonorant (NOM-YUANG), daher ist die Silbe lebend = Mittelton.',
        level: 4,
      },
      {
        id: 'c4-5',
        thai: 'พัก',
        meaning: 'ausruhen / Pause machen',
        romanization: 'phák',
        initialLetter: 'พ',
        initialClass: 'low',
        initialClassName: 'Tiefklasse',
        toneMark: 'none',
        toneMarkName: 'Kein Zeichen',
        syllableType: 'dead',
        syllableTypeName: 'Tote Silbe',
        vowelLength: 'short',
        vowelLengthName: 'Kurzer Vokal (a) + k-Stop',
        tone: 'high',
        ruleFormula: 'Tiefklasse (พ) + Tot kurz (พัก) ➔ Hochton',
        ruleTip: 'Kurzer Vokal mit k-Laut ist tot ➔ bei Tiefklasse entsteht der Hochton phák.',
        level: 4,
      },
      {
        id: 'c4-6',
        thai: 'พูด',
        meaning: 'sprechen / reden',
        romanization: 'phôot',
        initialLetter: 'พ',
        initialClass: 'low',
        initialClassName: 'Tiefklasse',
        toneMark: 'none',
        toneMarkName: 'Kein Zeichen',
        syllableType: 'dead',
        syllableTypeName: 'Tote Silbe',
        vowelLength: 'long',
        vowelLengthName: 'Langer Vokal (oo) + t-Stop',
        tone: 'falling',
        ruleFormula: 'Tiefklasse (พ) + Tot lang (พูด) ➔ Fallender Ton',
        ruleTip: 'Langer Vokal (oo) mit t-Stop ist tot und lang ➔ Tiefklasse erzeugt den Fallton phôot.',
        level: 4,
      },
    ],
  },
  {
    id: 5,
    title: 'Level 5: Meister-Mix & Alltagswörter',
    subtitle: 'Der Härtetest mit echten Thai-Wörtern aller Klassen',
    badge: 'Meister',
    badgeColor: 'border-violet-400/40 text-violet-400 bg-violet-400/10',
    focusRule: 'Kombiniere alle 15 Regeln: Identifiziere zuerst Buchstabe, dann Zeichen, dann Endlaut.',
    words: [
      {
        id: 'c5-1',
        thai: 'สวัสดี',
        meaning: 'Hallo / Auf Wiedersehen',
        romanization: 'sà-wàt-dee',
        initialLetter: 'ด',
        initialClass: 'mid',
        initialClassName: 'Mittelklasse (Betonte Endsilbe ดี)',
        toneMark: 'none',
        toneMarkName: 'Kein Zeichen',
        syllableType: 'live',
        syllableTypeName: 'Lebende Silbe',
        vowelLength: 'long',
        vowelLengthName: 'Langer Vokal (ee)',
        tone: 'mid',
        ruleFormula: 'Hauptsilbe ดี: Mittelklasse (ด) + Lebend (ee) ➔ Mittlerer Ton',
        ruleTip: 'In der Grußformel สวัสดี endet das Wort auf ดี: Mittelklasse ด ohne Zeichen mit langem Vokal = Mitte.',
        level: 5,
      },
      {
        id: 'c5-2',
        thai: 'ขอบคุณ',
        meaning: 'Danke',
        romanization: 'khò̜op-khun',
        initialLetter: 'ข',
        initialClass: 'high',
        initialClassName: 'Hochklasse (ขอบ)',
        toneMark: 'none',
        toneMarkName: 'Kein Zeichen',
        syllableType: 'dead',
        syllableTypeName: 'Tote Silbe',
        vowelLength: 'long',
        vowelLengthName: 'Langer Vokal (or) + b-Stop',
        tone: 'low',
        ruleFormula: 'Erste Silbe ขอบ: Hochklasse (ข) + Tot (บ) ➔ Tiefton',
        ruleTip: 'Das Wort ขอบคุณ beginnt mit ขอบ: Hochklasse ข mit b-Stopplaut (tot) erzeugt den typischen Tiefton khò̜op.',
        level: 5,
      },
      {
        id: 'c5-3',
        thai: 'ห้อง',
        meaning: 'Zimmer / Raum',
        romanization: 'hông',
        initialLetter: 'ห',
        initialClass: 'high',
        initialClassName: 'Hochklasse',
        toneMark: 'mai_tho',
        toneMarkName: 'Mai Tho ( -้ )',
        syllableType: 'live',
        syllableTypeName: 'Lebende Silbe',
        vowelLength: 'long',
        vowelLengthName: 'Langer Vokal (or) + ng',
        tone: 'falling',
        ruleFormula: 'Hochklasse (ห) + Mai Tho ( -้ ) ➔ Fallender Ton',
        ruleTip: 'Wie in ห้องน้ำ (Toilette): Hoher Buchstabe ห mit Mai Tho ergibt den satten Fallton hông.',
        level: 5,
      },
      {
        id: 'c5-4',
        thai: 'เครื่อง',
        meaning: 'Maschine / Gerät (z. B. Flugzeug เครื่องบิน)',
        romanization: 'khrûeang',
        initialLetter: 'ค',
        initialClass: 'low',
        initialClassName: 'Tiefklasse (Cluster คร)',
        toneMark: 'mai_ek',
        toneMarkName: 'Mai Ek ( -่ )',
        syllableType: 'live',
        syllableTypeName: 'Lebende Silbe',
        vowelLength: 'long',
        vowelLengthName: 'Diphthong (uea) + ng',
        tone: 'falling',
        ruleFormula: 'Tiefklasse (ค) + Mai Ek ( -่ ) ➔ Fallender Ton',
        ruleTip: 'Bei เครื่อง bestimmt der führende Konsonant ค (Tiefklasse) die Regel. Mit Mai Ek = Fallend!',
        level: 5,
      },
      {
        id: 'c5-5',
        thai: 'บิน',
        meaning: 'fliegen',
        romanization: 'bin',
        initialLetter: 'บ',
        initialClass: 'mid',
        initialClassName: 'Mittelklasse',
        toneMark: 'none',
        toneMarkName: 'Kein Zeichen',
        syllableType: 'live',
        syllableTypeName: 'Lebende Silbe',
        vowelLength: 'short',
        vowelLengthName: 'Endlaut n (Sonorant)',
        tone: 'mid',
        ruleFormula: 'Mittelklasse (บ) + Lebend (-น) ➔ Mittlerer Ton',
        ruleTip: 'บ ist Mittelklasse. Durch das abschließende -น ist die Silbe lebend, also Mittelton.',
        level: 5,
      },
      {
        id: 'c5-6',
        thai: 'เด็ก',
        meaning: 'Kind',
        romanization: 'dèk',
        initialLetter: 'ด',
        initialClass: 'mid',
        initialClassName: 'Mittelklasse',
        toneMark: 'none',
        toneMarkName: 'Kein Zeichen',
        syllableType: 'dead',
        syllableTypeName: 'Tote Silbe',
        vowelLength: 'short',
        vowelLengthName: 'Kurzer Vokal (e) + k-Stop',
        tone: 'low',
        ruleFormula: 'Mittelklasse (ด) + Tot kurz (เด็ก) ➔ Tiefton',
        ruleTip: 'ด ist Mittelklasse. Mit kurzem e und k-Stop ist es eine tote Silbe = Tiefton dèk.',
        level: 5,
      },
    ],
  },
];

const HIGH_LETTERS = new Set(['ข', 'ฃ', 'ฉ', 'ฐ', 'ถ', 'ผ', 'ฝ', 'ศ', 'ษ', 'ส', 'ห']);
const MID_LETTERS = new Set(['ก', 'จ', 'ด', 'ต', 'บ', 'ป', 'อ', 'ฎ', 'ฏ']);
const SINGLE_LOW_CONSONANTS = new Set(['ง', 'ญ', 'น', 'ย', 'ณ', 'ร', 'ว', 'ม', 'ฬ', 'ล']);

/**
 * Analyzes an individual Thai syllable into its exact grammatical tone rule components.
 */
export function analyzeSingleThaiSyllable(
  targetSyllable: string,
  syllableIndex: number = 0,
  totalSyllables: number = 1,
  prevInitialClass?: ConsonantClass,
  prevHasNoCoda?: boolean,
  prevSyllableText?: string
): ToneTrainerSyllableDetail {
  const parsed = parseThaiSyllable(targetSyllable);

  if (targetSyllable === 'ก็') {
    return {
      syllableIndex,
      totalSyllables,
      syllable: 'ก็',
      romanization: 'gô̜',
      initialLetter: 'ก',
      initialClass: 'mid',
      initialClassName: 'Mittelklasse',
      toneMark: 'none',
      toneMarkName: 'ไม้ไต่คู้ (็)',
      syllableType: 'dead',
      syllableTypeName: 'Tote Silbe',
      vowelLength: 'short',
      vowelLengthName: 'Kurzer Vokal',
      tone: 'falling',
      ruleFormula: 'Unregelmäßiges Partikel: ก็ ➔ Fallender Ton (gô̜)',
      ruleTip: 'ก็ ist ein häufiges unregelmäßiges Wort im Thailändischen. Es wird trotz Mittelklasse immer mit fallendem Ton (gô̜) gesprochen.',
    };
  }

  let initialLetter = parsed.initialChar || (parsed.initial ? parsed.initial : 'ก');
  let initialClass: ConsonantClass = parsed.initialClass;
  let isLeadingHoHip = false;
  let isAksornNamPrefix = false;

  const withoutLeadingVowel = targetSyllable.replace(/^[เแโใไ]/, '');
  if (
    withoutLeadingVowel.startsWith('หม') ||
    withoutLeadingVowel.startsWith('หน') ||
    withoutLeadingVowel.startsWith('หว') ||
    withoutLeadingVowel.startsWith('หล') ||
    withoutLeadingVowel.startsWith('หย') ||
    withoutLeadingVowel.startsWith('หง') ||
    withoutLeadingVowel.startsWith('หร') ||
    withoutLeadingVowel.startsWith('หญ')
  ) {
    initialClass = 'high';
    isLeadingHoHip = true;
    initialLetter = withoutLeadingVowel.substring(0, 2);
  } else if (
    syllableIndex > 0 &&
    (prevInitialClass === 'high' || prevInitialClass === 'mid') &&
    initialClass === 'low' &&
    prevHasNoCoda &&
    prevSyllableText &&
    prevSyllableText.length === 1 &&
    !/[าีืูิึุโเแใไ]/.test(prevSyllableText) &&
    SINGLE_LOW_CONSONANTS.has(initialLetter[0])
  ) {
    // Leading consonant (อักษรนำ) influence from preceding open half-sound high or mid consonant:
    // e.g. ส-วัส-ดี (wàt), ส-นุก (nùk), ถ-นน (nŏn), ต-ลาด (làat), ต-ลก (lòk), อ-ร่อย (rò̜i)
    initialClass = prevInitialClass;
    isAksornNamPrefix = true;
  }

  // Tone Mark
  const toneMark: 'none' | 'mai_ek' | 'mai_tho' | 'mai_tri' | 'mai_chattawa' =
    parsed.toneMark || 'none';

  // Syllable type & vowel length directly from phonetic parse:
  const syllableType: 'live' | 'dead' = parsed.isDead ? 'dead' : 'live';
  const vowelLength: 'short' | 'long' = parsed.isLong ? 'long' : 'short';

  // Strictly compute tone using standard Thai grammatical rules
  const tone: ThaiTone = computeTone(
    initialClass,
    toneMark === 'none' ? null : toneMark,
    syllableType === 'dead',
    vowelLength === 'long'
  );

  let romanization = parsed.roman;
  if (tone !== parsed.tone) {
    const rawSyl = parsed.roman.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    romanization = applyToneToSyllable(rawSyl, tone);
  }

  const initialClassName =
    initialClass === 'mid'
      ? isAksornNamPrefix
        ? 'Mittelklasse (Prefix-Einfluss อักษรนำ)'
        : 'Mittelklasse'
      : initialClass === 'high'
      ? isLeadingHoHip
        ? 'Hochklasse (Führendes ห)'
        : isAksornNamPrefix
        ? 'Hochklasse (Prefix-Einfluss อักษรนำ)'
        : 'Hochklasse'
      : 'Tiefklasse';

  const toneMarkName = TONE_MARK_INFO[toneMark].germanName;
  const syllableTypeName = syllableType === 'live' ? 'Lebende Silbe' : 'Tote Silbe';
  const vowelLengthName =
    targetSyllable.length === 1 && !/[าีืูะัิึุ]/.test(targetSyllable)
      ? 'Inhärentes kurzes a'
      : vowelLength === 'long'
      ? 'Langer Vokal'
      : 'Kurzer Vokal';

  const toneData = THAI_TONES[tone];
  const germanToneLabel =
    tone === 'mid'
      ? 'Mittlerer Ton'
      : tone === 'low'
      ? 'Tief-Ton'
      : tone === 'falling'
      ? 'Fallender Ton'
      : tone === 'high'
      ? 'Hoch-Ton'
      : 'Steigender Ton';
  let ruleFormula = '';
  if (toneMark !== 'none') {
    ruleFormula = `${initialClassName} (${initialLetter}) + ${toneMarkName} ➔ ${germanToneLabel}`;
  } else {
    ruleFormula = `${initialClassName} (${initialLetter}) + ${syllableTypeName} (${vowelLengthName}) ➔ ${germanToneLabel}`;
  }

  let ruleTip = '';
  if (initialClass === 'mid') {
    if (isAksornNamPrefix) {
      if (toneMark === 'none') {
        ruleTip = `${initialLetter} ist eigentlich Tiefklasse, übernimmt aber durch das vorangestellte Mittelklasse-Prefix (อักษรนำ) die Mittelklasse-Regel für ${syllableTypeName.toLowerCase()} ➔ regelkonform ${toneData.germanName}-Ton (${romanization}).`;
      } else {
        ruleTip = `${initialLetter} übernimmt durch das vorangestellte Mittelklasse-Prefix (อักษรนำ) die Mittelklasse-Regel für ${toneMarkName} ➔ regelkonform ${toneData.germanName}-Ton (${romanization}).`;
      }
    } else if (toneMark === 'none') {
      ruleTip =
        syllableType === 'live'
          ? 'Mittelklasse ohne Zeichen und lebend = immer Mittelton.'
          : 'Mittelklasse und tote Silbe = immer Tiefton.';
    } else {
      ruleTip = `Bei Mittelklasse entspricht das Zeichen dem Ton: ${toneMarkName} ergibt ${toneData.germanName}-Ton.`;
    }
  } else if (initialClass === 'high') {
    if (toneMark === 'none') {
      if (syllableType === 'live') {
        ruleTip = isAksornNamPrefix
          ? `${initialLetter} übernimmt durch den vorangestellten Hochklasse-Konsonanten (อักษรนำ) die Hochklasse-Regel für lebende Silben ➔ Steigton (${romanization}).`
          : 'Hohe Konsonanten ohne Zeichen und lebend steigen nach oben (= Steigton).';
      } else {
        if (isAksornNamPrefix) {
          ruleTip = `${initialLetter} ist eigentlich Tiefklasse, übernimmt aber durch das vorangestellte Hochklasse-Prefix (อักษรนำ) die Hochklasse-Regel für tote Silben ➔ regelkonform Tief-Ton (${romanization}).`;
        } else if (targetSyllable.length === 1 && !/[าีืูะัิึุ]/.test(targetSyllable)) {
          ruleTip = `${initialLetter} ist Hochklasse mit inhärentem kurzem 'a'. Kurzer Vokal ohne Endkonsonant = tote Silbe (คำตาย) ➔ regelkonform Tief-Ton (${romanization}).`;
        } else {
          ruleTip = 'Tote Silben bei Hochklasse (ob kurzes a oder Stopplaut) erzeugen immer einen tiefen Ton.';
        }
      }
    } else {
      ruleTip = `Hochklasse mit ${toneMarkName} wird als ${toneData.germanName}-Ton gesprochen.`;
    }
  } else {
    // Low class
    if (toneMark === 'mai_ek') {
      ruleTip =
        'Wichtige Tiefklassen-Regel: Mai Ek erzeugt keinen Tiefton, sondern schiebt den Ton auf Fallend!';
    } else if (toneMark === 'mai_tho') {
      ruleTip =
        'Wichtige Tiefklassen-Regel: Mai Tho auf Tiefklasse erzeugt immer einen energischen Hochton!';
    } else {
      if (syllableType === 'live') {
        ruleTip = 'Tiefklasse lebend ohne Zeichen klingt neutral und entspannt auf mittlerer Höhe.';
      } else if (vowelLength === 'short') {
        ruleTip = 'Tote Silbe mit kurzem Vokal bei Tiefklasse schnellt nach oben auf einen Hochton.';
      } else {
        ruleTip = 'Tote Silbe mit langem Vokal bei Tiefklasse fällt nach unten ab (= Fallender Ton).';
      }
    }
  }

  return {
    syllableIndex,
    totalSyllables,
    syllable: targetSyllable,
    romanization,
    initialLetter,
    initialClass,
    initialClassName,
    toneMark,
    toneMarkName,
    syllableType,
    syllableTypeName,
    vowelLength,
    vowelLengthName,
    tone,
    ruleFormula,
    ruleTip,
  };
}

/**
 * Dynamically analyzes ANY Thai word or syllable into its exact grammatical tone rule components.
 * Enables using the Tone Detective with both curated levels and the user's custom deck!
 */
export function analyzeThaiWordForToneTrainer(
  rawThai: string,
  meaningHint?: string,
  romHint?: string
): ToneTrainerWord {
  const clean = rawThai.trim();

  // Pedagogical handling for ภรรยา (phan-rá-yaa / พัน-ระ-ยา)
  if (clean === 'ภรรยา') {
    const s1 = analyzeSingleThaiSyllable('ภรร', 0, 3);
    const s2: ToneTrainerSyllableDetail = {
      syllableIndex: 1,
      totalSyllables: 3,
      syllable: '-ระ-',
      romanization: 'rá',
      initialLetter: 'ร',
      initialClass: 'low',
      initialClassName: 'Tiefklasse',
      toneMark: 'none',
      toneMarkName: 'Kein Zeichen',
      syllableType: 'dead',
      syllableTypeName: 'Tote Silbe',
      vowelLength: 'short',
      vowelLengthName: 'Kurzer Vokal',
      tone: 'high',
      ruleFormula: 'Tiefklasse (ร) + Tote Silbe (Kurzer Vokal) ➔ Hoch-Ton',
      ruleTip: 'In ภรรยา erzeugt das zweite ร einen hochtonigen Verbindungslaut (-ระ- ➔ rá).'
    };
    const s3 = analyzeSingleThaiSyllable('ยา', 2, 3);
    return {
      id: `dyn-${clean}`,
      thai: clean,
      meaning: meaningHint || 'Ehefrau',
      romanization: romHint || 'phan-rá-yaa',
      initialLetter: 'ภ',
      initialClass: 'low',
      initialClassName: 'Tiefklasse',
      toneMark: 'none',
      toneMarkName: 'Kein Zeichen',
      syllableType: 'live',
      syllableTypeName: 'Lebende Silbe',
      vowelLength: 'short',
      vowelLengthName: 'Ro Han (-an)',
      tone: 'mid',
      ruleFormula: '3 Silben: 1. ภรร (phan): Mitte • 2. -ระ- (rá): Hoch • 3. ยา (yaa): Mitte',
      ruleTip: 'ภรรยา (phan-rá-yaa): Ausgesprochen พัน-ระ-ยา. ภรร (Mitte), Verbindungs-Laut -ระ- (Hoch), ยา (Mitte).',
      level: 5,
      syllables: [s1, s2, s3],
      targetSyllableText: 'ภรร',
      targetSyllableRoman: 'phan',
    };
  }

  const rawSyllables = splitThaiIntoSyllables(clean);
  const syllablesList = rawSyllables.length > 0 ? rawSyllables : [clean];

  // Analyze every syllable in sequence, tracking prefix consonant influence
  const syllableDetails: ToneTrainerSyllableDetail[] = [];
  let prevClass: ConsonantClass | undefined = undefined;
  let prevHasNoCoda: boolean | undefined = undefined;

  for (let idx = 0; idx < syllablesList.length; idx++) {
    const syl = syllablesList[idx];
    const prevSyl = idx > 0 ? syllablesList[idx - 1] : undefined;
    const detail = analyzeSingleThaiSyllable(syl, idx, syllablesList.length, prevClass, prevHasNoCoda, prevSyl);
    syllableDetails.push(detail);
    prevClass = detail.initialClass;
    prevHasNoCoda = !parseThaiSyllable(syl).finalCons;
  }

  // Primary syllable to quiz
  const primaryDetail = syllableDetails[0] || analyzeSingleThaiSyllable(clean);

  // Multi-syllable summary formula if word has > 1 syllable
  let combinedFormula = primaryDetail.ruleFormula;
  let combinedTip = primaryDetail.ruleTip;

  if (syllableDetails.length > 1) {
    const syllableSummary = syllableDetails
      .map((s, i) => `${i + 1}. ${s.syllable} (${s.romanization}): ${THAI_TONES[s.tone].germanName}`)
      .join(' • ');
    combinedFormula = `${syllableDetails.length} Silben: ${syllableSummary}`;
    combinedTip = `Dieses Wort besteht aus ${syllableDetails.length} Silben. Jede Silbe folgt ihren eigenen Tonregeln:`;
  }

  return {
    id: `dyn-${clean}`,
    thai: clean,
    meaning: meaningHint || 'Vokabel aus deinem Deck',
    romanization: romHint || syllableDetails.map((s) => s.romanization).join('-') || 'phonetisch',
    initialLetter: primaryDetail.initialLetter,
    initialClass: primaryDetail.initialClass,
    initialClassName: primaryDetail.initialClassName,
    toneMark: primaryDetail.toneMark,
    toneMarkName: primaryDetail.toneMarkName,
    syllableType: primaryDetail.syllableType,
    syllableTypeName: primaryDetail.syllableTypeName,
    vowelLength: primaryDetail.vowelLength,
    vowelLengthName: primaryDetail.vowelLengthName,
    tone: primaryDetail.tone,
    ruleFormula: combinedFormula,
    ruleTip: combinedTip,
    level: 5,
    syllables: syllableDetails,
    targetSyllableText: primaryDetail.syllable,
    targetSyllableRoman: primaryDetail.romanization,
  };
}
