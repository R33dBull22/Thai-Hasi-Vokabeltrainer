import { ThaiTone, THAI_TONES, parseThaiSyllable, autocorrectThaiTypingOrder, computeTone } from '../utils/thaiTones';
import { ConsonantClass, CONSONANT_CLASS_CONFIG } from './thaiAlphabet';

export type SyllableTrainerFilter =
  | 'all'
  | 'with_tone_marks'
  | 'without_tone_marks'
  | 'low_class'
  | 'high_class'
  | 'mid_class';

export interface RandomSyllableItem {
  id: string;
  syllable: string;
  tone: ThaiTone;
  initialChar: string;
  initialClass: ConsonantClass;
  initialClassName: string;
  toneMark: 'none' | 'mai_ek' | 'mai_tho' | 'mai_tri' | 'mai_chattawa';
  toneMarkName: string;
  syllableType: 'live' | 'dead';
  syllableTypeName: string;
  vowelLength: 'short' | 'long';
  vowelLengthName: string;
  romanization: string;
  ruleFormula: string;
  ruleExplanation: string;
  meaningGerman?: string;
  hasToneMark: boolean;
}

// 1. Curated authentic real-world Thai monosyllabic words & syllables
export const CURATED_THAI_SYLLABLES: {
  syllable: string;
  meaningGerman?: string;
}[] = [
  // MID CLASS - No mark (Live: Mid, Dead Short: Low, Dead Long: Low)
  { syllable: 'กา', meaningGerman: 'Krähe / Teekessel' },
  { syllable: 'ตา', meaningGerman: 'Auge / Großvater' },
  { syllable: 'ปลา', meaningGerman: 'Fisch' },
  { syllable: 'ไป', meaningGerman: 'gehen' },
  { syllable: 'กิน', meaningGerman: 'essen' },
  { syllable: 'บิน', meaningGerman: 'fliegen' },
  { syllable: 'ดู', meaningGerman: 'schauen' },
  { syllable: 'ดี', meaningGerman: 'gut' },
  { syllable: 'เดิน', meaningGerman: 'gehen / laufen' },
  { syllable: 'แดง', meaningGerman: 'rot' },
  { syllable: 'ดวง', meaningGerman: 'Scheibe / Kreis' },
  { syllable: 'ปาก', meaningGerman: 'Mund' },
  { syllable: 'ปีก', meaningGerman: 'Flügel' },
  { syllable: 'ปิด', meaningGerman: 'schließen' },
  { syllable: 'เป็ด', meaningGerman: 'Ente' },
  { syllable: 'กบ', meaningGerman: 'Frosch' },
  { syllable: 'ตก', meaningGerman: 'fallen / regnen' },
  { syllable: 'เจ็บ', meaningGerman: 'schmerzen / wehtun' },
  { syllable: 'ดับ', meaningGerman: 'löschen / erlöschen' },
  { syllable: 'อก', meaningGerman: 'Brust' },
  { syllable: 'อด', meaningGerman: 'hungern / ertragen' },
  { syllable: 'จาน', meaningGerman: 'Teller' },
  { syllable: 'แกง', meaningGerman: 'Curry' },
  { syllable: 'เตา', meaningGerman: 'Ofen' },
  { syllable: 'ใจ', meaningGerman: 'Herz / Geist' },

  // MID CLASS - With Tone Marks (Mai Ek: Low, Mai Tho: Falling, Mai Tri: High, Mai Chattawa: Rising)
  { syllable: 'ไก่', meaningGerman: 'Huhn' },
  { syllable: 'เก่า', meaningGerman: 'alt' },
  { syllable: 'ด่าง', meaningGerman: 'fleckig' },
  { syllable: 'อิ่ม', meaningGerman: 'satt' },
  { syllable: 'ป่า', meaningGerman: 'Wald' },
  { syllable: 'ตื่น', meaningGerman: 'aufwachen' },
  { syllable: 'ต่อ', meaningGerman: 'fortsetzen / gegen' },
  { syllable: 'บ่าย', meaningGerman: 'Nachmittag' },
  { syllable: 'เก่ง', meaningGerman: 'geschickt / schlau' },
  { syllable: 'บ้าน', meaningGerman: 'Haus' },
  { syllable: 'เก้า', meaningGerman: 'neun' },
  { syllable: 'ใกล้', meaningGerman: 'nah' },
  { syllable: 'ต้น', meaningGerman: 'Baum / Beginn' },
  { syllable: 'ปั้น', meaningGerman: 'formen / kneten' },
  { syllable: 'ต้อง', meaningGerman: 'müssen' },
  { syllable: 'ใต้', meaningGerman: 'unter / Süden' },
  { syllable: 'อ้วน', meaningGerman: 'dick / korpulent' },
  { syllable: 'ป้า', meaningGerman: 'Tante' },
  { syllable: 'โต๊ะ', meaningGerman: 'Tisch (Lehnwort)' },
  { syllable: 'กุ๊ก', meaningGerman: 'Koch' },
  { syllable: 'ตั๋ว', meaningGerman: 'Ticket / Fahrkarte' },
  { syllable: 'เก๋', meaningGerman: 'schick / elegant' },
  { syllable: 'ตี๋', meaningGerman: 'junger Chinese (Kosename)' },
  { syllable: 'จิ๋ว', meaningGerman: 'winzig' },

  // HIGH CLASS - No mark (Live: Rising, Dead Short: Low, Dead Long: Low)
  { syllable: 'ขา', meaningGerman: 'Bein' },
  { syllable: 'หมา', meaningGerman: 'Hund' },
  { syllable: 'หมู', meaningGerman: 'Schwein' },
  { syllable: 'หนู', meaningGerman: 'Maus / ich (weibl./jung)' },
  { syllable: 'สาม', meaningGerman: 'drei' },
  { syllable: 'สอง', meaningGerman: 'zwei' },
  { syllable: 'สาย', meaningGerman: 'spät / Linie' },
  { syllable: 'สวย', meaningGerman: 'schön' },
  { syllable: 'เขียว', meaningGerman: 'grün' },
  { syllable: 'ขาว', meaningGerman: 'weiß' },
  { syllable: 'หาม', meaningGerman: 'tragen' },
  { syllable: 'ผอม', meaningGerman: 'schlank / dünn' },
  { syllable: 'หู', meaningGerman: 'Ohr' },
  { syllable: 'หิว', meaningGerman: 'hungrig' },
  { syllable: 'หัว', meaningGerman: 'Kopf' },
  { syllable: 'หาง', meaningGerman: 'Schwanz' },
  { syllable: 'ฝน', meaningGerman: 'Regen' },
  { syllable: 'สอน', meaningGerman: 'unterrichten' },
  { syllable: 'ผัก', meaningGerman: 'Gemüse' },
  { syllable: 'หก', meaningGerman: 'sechs' },
  { syllable: 'สิบ', meaningGerman: 'zehn' },
  { syllable: 'ขวด', meaningGerman: 'Flasche' },
  { syllable: 'สุข', meaningGerman: 'Glück' },
  { syllable: 'ถูก', meaningGerman: 'günstig / korrekt' },
  { syllable: 'ฉบับ', meaningGerman: 'Exemplar' },
  { syllable: 'ฝาก', meaningGerman: 'deponieren / hinterlegen' },
  { syllable: 'ฉีด', meaningGerman: 'spritzen' },
  { syllable: 'ผิด', meaningGerman: 'falsch' },

  // HIGH CLASS - With Tone Marks (Mai Ek: Low, Mai Tho: Falling)
  { syllable: 'ไข่', meaningGerman: 'Ei' },
  { syllable: 'เข่า', meaningGerman: 'Knie' },
  { syllable: 'ใหม่', meaningGerman: 'neu' },
  { syllable: 'ใส่', meaningGerman: 'hineintun / anziehen' },
  { syllable: 'สี่', meaningGerman: 'vier' },
  { syllable: 'ส่ง', meaningGerman: 'senden / schicken' },
  { syllable: 'สั่ง', meaningGerman: 'bestellen' },
  { syllable: 'ผ่อน', meaningGerman: 'ratenweise zahlen / entspannen' },
  { syllable: 'ผ่าน', meaningGerman: 'passieren / bestehen' },
  { syllable: 'สั่น', meaningGerman: 'zittern' },
  { syllable: 'ข่า', meaningGerman: 'Galgant' },
  { syllable: 'ห่าง', meaningGerman: 'entfernt' },
  { syllable: 'ข้าว', meaningGerman: 'Reis / Essen' },
  { syllable: 'เข้า', meaningGerman: 'hineingehen' },
  { syllable: 'ผ้า', meaningGerman: 'Tuch / Stoff' },
  { syllable: 'ห้อง', meaningGerman: 'Zimmer / Raum' },
  { syllable: 'ห้า', meaningGerman: 'fünf' },
  { syllable: 'ให้', meaningGerman: 'geben / für' },
  { syllable: 'หน้า', meaningGerman: 'Gesicht / vorne' },
  { syllable: 'เสื้อ', meaningGerman: 'Hemd / Oberteil' },
  { syllable: 'ข้าม', meaningGerman: 'überqueren' },
  { syllable: 'สู้', meaningGerman: 'kämpfen' },
  { syllable: 'ผู้', meaningGerman: 'Person / Mensch' },
  { syllable: 'ข้าง', meaningGerman: 'neben / Seite' },
  { syllable: 'หิ้ว', meaningGerman: 'in der Hand tragen' },
  { syllable: 'แห้ง', meaningGerman: 'trocken' },

  // LOW CLASS - No mark Live (Mid Tone)
  { syllable: 'คน', meaningGerman: 'Mensch / Person' },
  { syllable: 'งาน', meaningGerman: 'Arbeit / Fest' },
  { syllable: 'เงิน', meaningGerman: 'Geld / Silber' },
  { syllable: 'ทอง', meaningGerman: 'Gold' },
  { syllable: 'เพลง', meaningGerman: 'Lied / Musik' },
  { syllable: 'เมือง', meaningGerman: 'Stadt / Land' },
  { syllable: 'เรือ', meaningGerman: 'Boot / Schiff' },
  { syllable: 'มา', meaningGerman: 'kommen' },
  { syllable: 'มี', meaningGerman: 'haben' },
  { syllable: 'มือ', meaningGerman: 'Hand' },
  { syllable: 'มอง', meaningGerman: 'schauen' },
  { syllable: 'ฟัง', meaningGerman: 'zuhören' },
  { syllable: 'เรียน', meaningGerman: 'lernen' },
  { syllable: 'นอน', meaningGerman: 'schlafen' },
  { syllable: 'ลอย', meaningGerman: 'schweben / treiben' },
  { syllable: 'วัน', meaningGerman: 'Tag' },
  { syllable: 'แฟน', meaningGerman: 'Partner / Fan' },
  { syllable: 'ชา', meaningGerman: 'Tee' },
  { syllable: 'รอ', meaningGerman: 'warten' },
  { syllable: 'เรา', meaningGerman: 'wir' },
  { syllable: 'ใคร', meaningGerman: 'wer' },
  { syllable: 'ไฟ', meaningGerman: 'Feuer / Licht' },
  { syllable: 'ฟัน', meaningGerman: 'Zahn' },
  { syllable: 'ลิง', meaningGerman: 'Affe' },
  { syllable: 'ยา', meaningGerman: 'Medizin' },

  // LOW CLASS - No mark Dead Short (High Tone)
  { syllable: 'รัก', meaningGerman: 'lieben' },
  { syllable: 'พัก', meaningGerman: 'rasten / wohnen' },
  { syllable: 'ชัด', meaningGerman: 'deutlich / klar' },
  { syllable: 'นัด', meaningGerman: 'verabreden' },
  { syllable: 'นับ', meaningGerman: 'zählen' },
  { syllable: 'รับ', meaningGerman: 'empfangen / nehmen' },
  { syllable: 'ซัก', meaningGerman: 'waschen' },
  { syllable: 'ทัพ', meaningGerman: 'Armee' },
  { syllable: 'มด', meaningGerman: 'Ameise' },
  { syllable: 'นก', meaningGerman: 'Vogel' },
  { syllable: 'รถ', meaningGerman: 'Auto / Fahrzeug' },
  { syllable: 'ลด', meaningGerman: 'reduzieren' },
  { syllable: 'ลัก', meaningGerman: 'stehlen' },
  { syllable: 'มัก', meaningGerman: 'pflegen zu' },
  { syllable: 'ทัก', meaningGerman: 'grüßen' },

  // LOW CLASS - No mark Dead Long (Falling Tone)
  { syllable: 'มาก', meaningGerman: 'sehr / viel' },
  { syllable: 'ยาก', meaningGerman: 'schwierig' },
  { syllable: 'พูด', meaningGerman: 'sprechen' },
  { syllable: 'มีด', meaningGerman: 'Messer' },
  { syllable: 'ลูก', meaningGerman: 'Kind / Stück' },
  { syllable: 'ชอบ', meaningGerman: 'mögen / gefallen' },
  { syllable: 'รอบ', meaningGerman: 'Runde / Zyklus' },
  { syllable: 'ภาพ', meaningGerman: 'Bild / Foto' },
  { syllable: 'รีบ', meaningGerman: 'sich beeilen' },
  { syllable: 'เชือด', meaningGerman: 'schneiden' },
  { syllable: 'เลือก', meaningGerman: 'auswählen' },
  { syllable: 'เช็ด', meaningGerman: 'abwischen' },
  { syllable: 'โรค', meaningGerman: 'Krankheit' },
  { syllable: 'โชค', meaningGerman: 'Glück / Schicksal' },

  // LOW CLASS - With Mai Ek (Falling Tone)
  { syllable: 'ค่า', meaningGerman: 'Wert / Gebühr' },
  { syllable: 'ง่าย', meaningGerman: 'einfach / leicht' },
  { syllable: 'นั่ง', meaningGerman: 'sitzen' },
  { syllable: 'นิ่ม', meaningGerman: 'weich' },
  { syllable: 'พี่', meaningGerman: 'älterer Bruder/Schwester' },
  { syllable: 'พ่อ', meaningGerman: 'Vater' },
  { syllable: 'แม่', meaningGerman: 'Mutter' },
  { syllable: 'ช่วย', meaningGerman: 'helfen' },
  { syllable: 'วิ่ง', meaningGerman: 'rennen / laufen' },
  { syllable: 'เล่น', meaningGerman: 'spielen' },
  { syllable: 'ร่ม', meaningGerman: 'Schirm / Schatten' },
  { syllable: 'ร่วม', meaningGerman: 'teilnehmen' },
  { syllable: 'เรื่อง', meaningGerman: 'Thema / Geschichte' },
  { syllable: 'เยี่ยม', meaningGerman: 'besuchen / hervorragend' },
  { syllable: 'ว่าง', meaningGerman: 'frei / unbesetzt' },
  { syllable: 'ใช่', meaningGerman: 'ja / richtig' },
  { syllable: 'เล่า', meaningGerman: 'erzählen' },
  { syllable: 'ว่า', meaningGerman: 'dass / sagen' },
  { syllable: 'จ่าย', meaningGerman: 'bezahlen' },
  { syllable: 'ย่าง', meaningGerman: 'grillen' },

  // LOW CLASS - With Mai Tho (High Tone)
  { syllable: 'ม้า', meaningGerman: 'Pferd' },
  { syllable: 'น้ำ', meaningGerman: 'Wasser' },
  { syllable: 'ช้าง', meaningGerman: 'Elefant' },
  { syllable: 'ไม้', meaningGerman: 'Holz / Baum' },
  { syllable: 'มั้ย', meaningGerman: 'Fragepartikel (umgangssprachlich)' },
  { syllable: 'น้อง', meaningGerman: 'jüngere(r) Bruder/Schwester' },
  { syllable: 'ร้อน', meaningGerman: 'heiß' },
  { syllable: 'รู้', meaningGerman: 'wissen' },
  { syllable: 'ร้าน', meaningGerman: 'Laden / Geschäft' },
  { syllable: 'แล้ว', meaningGerman: 'bereits / schon' },
  { syllable: 'ฟ้า', meaningGerman: 'Himmel' },
  { syllable: 'ซื้อ', meaningGerman: 'kaufen' },
  { syllable: 'ช้า', meaningGerman: 'langsam' },
  { syllable: 'เท้า', meaningGerman: 'Fuß' },
  { syllable: 'ยิ้ม', meaningGerman: 'lächeln' },
  { syllable: 'ล้าน', meaningGerman: 'Million' },
  { syllable: 'ร้อง', meaningGerman: 'rufen / weinen' },
  { syllable: 'ค้า', meaningGerman: 'Handel treiben' },
  { syllable: 'ซ้าย', meaningGerman: 'links' },
  { syllable: 'เช้า', meaningGerman: 'Morgen / früh' },
  { syllable: 'ล้าง', meaningGerman: 'abwaschen / spülen' },
];

// 2. Procedural Combinatorial Generator Components
const INITIAL_CONSONANTS: { char: string; class: ConsonantClass; isCluster?: boolean }[] = [
  // Mid
  { char: 'ก', class: 'mid' },
  { char: 'จ', class: 'mid' },
  { char: 'ด', class: 'mid' },
  { char: 'ต', class: 'mid' },
  { char: 'บ', class: 'mid' },
  { char: 'ป', class: 'mid' },
  { char: 'อ', class: 'mid' },
  { char: 'กร', class: 'mid', isCluster: true },
  { char: 'กล', class: 'mid', isCluster: true },
  { char: 'ปล', class: 'mid', isCluster: true },

  // High
  { char: 'ข', class: 'high' },
  { char: 'ฉ', class: 'high' },
  { char: 'ถ', class: 'high' },
  { char: 'ผ', class: 'high' },
  { char: 'ฝ', class: 'high' },
  { char: 'ส', class: 'high' },
  { char: 'ห', class: 'high' },
  { char: 'หม', class: 'high', isCluster: true },
  { char: 'หน', class: 'high', isCluster: true },
  { char: 'หว', class: 'high', isCluster: true },
  { char: 'หล', class: 'high', isCluster: true },
  { char: 'หง', class: 'high', isCluster: true },

  // Low
  { char: 'ค', class: 'low' },
  { char: 'ง', class: 'low' },
  { char: 'ช', class: 'low' },
  { char: 'ซ', class: 'low' },
  { char: 'ท', class: 'low' },
  { char: 'น', class: 'low' },
  { char: 'พ', class: 'low' },
  { char: 'ฟ', class: 'low' },
  { char: 'ม', class: 'low' },
  { char: 'ย', class: 'low' },
  { char: 'ร', class: 'low' },
  { char: 'ล', class: 'low' },
  { char: 'ว', class: 'low' },
  { char: 'ฮ', class: 'low' },
  { char: 'คร', class: 'low', isCluster: true },
  { char: 'คล', class: 'low', isCluster: true },
  { char: 'คว', class: 'low', isCluster: true },
  { char: 'พร', class: 'low', isCluster: true },
  { char: 'พล', class: 'low', isCluster: true },
];

interface SyllableTemplate {
  render: (init: string) => string;
  isDead: boolean;
  isLong: boolean;
  allowsToneMark: boolean;
}

const SYLLABLE_TEMPLATES: SyllableTemplate[] = [
  // Open Long Live
  { render: (c) => c + 'า', isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => c + 'ี', isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => c + 'ือ', isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => c + 'ู', isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => 'เ' + c, isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => 'แ' + c, isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => 'โ' + c, isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => 'ไ' + c, isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => 'เ' + c + 'า', isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => c + 'ำ', isDead: false, isLong: false, allowsToneMark: true },

  // Open Short Dead
  { render: (c) => c + 'ะ', isDead: true, isLong: false, allowsToneMark: false },
  { render: (c) => c + 'ิ', isDead: true, isLong: false, allowsToneMark: false },
  { render: (c) => c + 'ุ', isDead: true, isLong: false, allowsToneMark: false },
  { render: (c) => 'เ' + c + 'ะ', isDead: true, isLong: false, allowsToneMark: false },
  { render: (c) => 'โ' + c + 'ะ', isDead: true, isLong: false, allowsToneMark: true }, // e.g. โต๊ะ

  // Live Coda (Sonorants: -ง, -น, -ม, -ย, -ว)
  { render: (c) => c + 'ัง', isDead: false, isLong: false, allowsToneMark: true },
  { render: (c) => c + 'ัน', isDead: false, isLong: false, allowsToneMark: true },
  { render: (c) => c + 'ัม', isDead: false, isLong: false, allowsToneMark: true },
  { render: (c) => c + 'าง', isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => c + 'าน', isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => c + 'าม', isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => c + 'าย', isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => c + 'าว', isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => c + 'ิง', isDead: false, isLong: false, allowsToneMark: true },
  { render: (c) => c + 'ิน', isDead: false, isLong: false, allowsToneMark: true },
  { render: (c) => c + 'ิม', isDead: false, isLong: false, allowsToneMark: true },
  { render: (c) => c + 'ิว', isDead: false, isLong: false, allowsToneMark: true },
  { render: (c) => c + 'ุง', isDead: false, isLong: false, allowsToneMark: true },
  { render: (c) => c + 'ุน', isDead: false, isLong: false, allowsToneMark: true },
  { render: (c) => c + 'ุม', isDead: false, isLong: false, allowsToneMark: true },
  { render: (c) => c + 'ุย', isDead: false, isLong: false, allowsToneMark: true },
  { render: (c) => 'เ' + c + 'ง', isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => 'เ' + c + 'น', isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => 'เ' + c + 'ม', isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => 'เ' + c + 'ว', isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => 'แ' + c + 'ง', isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => 'แ' + c + 'น', isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => 'แ' + c + 'ม', isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => 'โ' + c + 'ง', isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => 'โ' + c + 'น', isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => c + 'อง', isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => c + 'อน', isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => c + 'อม', isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => c + 'อย', isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => 'เ' + c + 'ียน', isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => 'เ' + c + 'ือง', isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => c + 'วน', isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => c + 'วม', isDead: false, isLong: true, allowsToneMark: true },
  { render: (c) => c + 'วย', isDead: false, isLong: true, allowsToneMark: true },

  // Dead Coda (Stops: -ก, -ด, -บ)
  { render: (c) => c + 'ัก', isDead: true, isLong: false, allowsToneMark: false },
  { render: (c) => c + 'ัด', isDead: true, isLong: false, allowsToneMark: false },
  { render: (c) => c + 'ับ', isDead: true, isLong: false, allowsToneMark: false },
  { render: (c) => c + 'าก', isDead: true, isLong: true, allowsToneMark: false },
  { render: (c) => c + 'าด', isDead: true, isLong: true, allowsToneMark: false },
  { render: (c) => c + 'าบ', isDead: true, isLong: true, allowsToneMark: false },
  { render: (c) => c + 'ิก', isDead: true, isLong: false, allowsToneMark: false },
  { render: (c) => c + 'ิด', isDead: true, isLong: false, allowsToneMark: false },
  { render: (c) => c + 'ิบ', isDead: true, isLong: false, allowsToneMark: false },
  { render: (c) => c + 'ึก', isDead: true, isLong: false, allowsToneMark: false },
  { render: (c) => c + 'ุด', isDead: true, isLong: false, allowsToneMark: false },
  { render: (c) => c + 'ุบ', isDead: true, isLong: false, allowsToneMark: false },
  { render: (c) => c + 'ูก', isDead: true, isLong: true, allowsToneMark: false },
  { render: (c) => c + 'ูด', isDead: true, isLong: true, allowsToneMark: false },
  { render: (c) => 'เ' + c + 'ก', isDead: true, isLong: true, allowsToneMark: false },
  { render: (c) => 'เ' + c + 'ด', isDead: true, isLong: true, allowsToneMark: false },
  { render: (c) => 'เ' + c + 'บ', isDead: true, isLong: true, allowsToneMark: false },
  { render: (c) => 'แ' + c + 'ก', isDead: true, isLong: true, allowsToneMark: false },
  { render: (c) => 'แ' + c + 'ด', isDead: true, isLong: true, allowsToneMark: false },
  { render: (c) => 'แ' + c + 'บ', isDead: true, isLong: true, allowsToneMark: false },
  { render: (c) => 'โ' + c + 'ก', isDead: true, isLong: true, allowsToneMark: false },
  { render: (c) => 'โ' + c + 'ด', isDead: true, isLong: true, allowsToneMark: false },
  { render: (c) => c + 'อก', isDead: true, isLong: true, allowsToneMark: false },
  { render: (c) => c + 'อด', isDead: true, isLong: true, allowsToneMark: false },
  { render: (c) => c + 'อบ', isDead: true, isLong: true, allowsToneMark: false },
  { render: (c) => 'เ' + c + 'ือก', isDead: true, isLong: true, allowsToneMark: false },
  { render: (c) => 'เ' + c + 'ือด', isDead: true, isLong: true, allowsToneMark: false },
  { render: (c) => c + 'วก', isDead: true, isLong: true, allowsToneMark: false },
  { render: (c) => c + 'วด', isDead: true, isLong: true, allowsToneMark: false },
];

// Helper: inject tone mark correctly on base syllable
function attachToneMark(base: string, markChar: string, isCluster: boolean): string {
  if (!markChar) return base;
  const chars = Array.from(base);
  let targetIdx = 0;
  if (/^[เแโไใ]/.test(chars[0])) {
    targetIdx = isCluster ? 2 : 1;
  } else {
    targetIdx = isCluster ? 1 : 0;
  }

  // Ensure index is valid
  if (targetIdx >= chars.length) targetIdx = chars.length - 1;

  // If next char is upper vowel (ิ, ี, ึ, ื, ั, ็), place mark after upper vowel
  if (targetIdx + 1 < chars.length && /[ิีึืั็]/.test(chars[targetIdx + 1])) {
    chars.splice(targetIdx + 2, 0, markChar);
  } else {
    chars.splice(targetIdx + 1, 0, markChar);
  }
  return autocorrectThaiTypingOrder(chars.join(''));
}

// Map parsed syllable to comprehensive RandomSyllableItem
export function buildSyllableItem(rawSyllable: string, meaningGerman?: string): RandomSyllableItem {
  const clean = autocorrectThaiTypingOrder(rawSyllable.trim());
  const parsed = parseThaiSyllable(clean);

  const initialClass: ConsonantClass = parsed.initialClass || 'mid';
  const initialChar = parsed.initialChar || clean.charAt(0);
  const toneMarkKey: 'none' | 'mai_ek' | 'mai_tho' | 'mai_tri' | 'mai_chattawa' =
    parsed.toneMark || 'none';
  const syllableType: 'live' | 'dead' = parsed.isDead ? 'dead' : 'live';
  const vowelLength: 'short' | 'long' = parsed.isLong ? 'long' : 'short';
  const tone: ThaiTone = parsed.tone;

  const classConfig = CONSONANT_CLASS_CONFIG[initialClass];
  const initialClassName =
    initialClass === 'mid'
      ? 'Mittelklasse'
      : initialClass === 'high'
      ? 'Hochklasse'
      : 'Tiefklasse';

  const toneMarkNames: Record<string, string> = {
    none: 'Kein Tonzeichen',
    mai_ek: 'Mai Ek ( ่ )',
    mai_tho: 'Mai Tho ( ้ )',
    mai_tri: 'Mai Tri ( ๊ )',
    mai_chattawa: 'Mai Chattawa ( ๋ )',
  };
  const toneMarkName = toneMarkNames[toneMarkKey] || 'Kein Tonzeichen';
  const syllableTypeName = syllableType === 'live' ? 'Lebende Silbe (คำเป็น)' : 'Tote Silbe (คำตาย)';
  const vowelLengthName = vowelLength === 'long' ? 'Langer Vokal' : 'Kurzer Vokal';
  const germanToneLabel = THAI_TONES[tone].germanName;

  let ruleFormula = '';
  let ruleExplanation = '';

  if (toneMarkKey !== 'none') {
    ruleFormula = `${initialClassName} (${initialChar}) + ${toneMarkName} ➔ ${germanToneLabel}-Ton`;
    if (initialClass === 'mid') {
      ruleFormula += ' (Regel: 1-zu-1 Entsprechung)';
      ruleExplanation = `Bei der Mittelklasse bestimmt das Zeichen direkt die Tonlage: ${toneMarkName} ergibt exakt ${germanToneLabel}.`;
    } else if (initialClass === 'high') {
      ruleExplanation = `Hohe Konsonanten bilden mit ${toneMarkName} den ${germanToneLabel}-Ton (Mai Ek = Tief, Mai Tho = Fallend).`;
    } else {
      ruleExplanation = `Tiefe Konsonanten verschieben Tonzeichen um eine Stufe nach oben: ${toneMarkName} erzeugt hier ${germanToneLabel}-Ton!`;
    }
  } else {
    ruleFormula = `${initialClassName} (${initialChar}) + ${syllableTypeName} (${vowelLengthName}) ➔ ${germanToneLabel}-Ton`;
    if (initialClass === 'mid') {
      ruleExplanation =
        syllableType === 'live'
          ? 'Mittelklasse ohne Zeichen und lebende Silbe = immer normaler Mittelton (Mid).'
          : 'Mittelklasse und tote Silbe = fällt automatisch in den Tief-Ton (Low).';
    } else if (initialClass === 'high') {
      ruleExplanation =
        syllableType === 'live'
          ? 'Hohe Konsonanten beginnen von Natur aus mit einem Steigton (Rising Tone) bei lebenden Silben.'
          : 'Hohe Konsonanten bei toten Silben (egal ob kurzer Vokal oder Stopplaut) erzeugen immer einen Tief-Ton (Low).';
    } else {
      if (syllableType === 'live') {
        ruleExplanation = 'Tiefklasse ohne Zeichen und lebende Silbe = unmarkierter Mittelton (Mid).';
      } else if (vowelLength === 'short') {
        ruleExplanation = 'Tiefklasse bei toter Silbe mit kurzem Vokal springt energetisch in den Hoch-Ton (High).';
      } else {
        ruleExplanation = 'Tiefklasse bei toter Silbe mit langem Vokal fällt in den Fallenden Ton (Falling).';
      }
    }
  }

  return {
    id: `syl-${clean}-${Date.now().toString(36)}`,
    syllable: clean,
    tone,
    initialChar,
    initialClass,
    initialClassName,
    toneMark: toneMarkKey,
    toneMarkName,
    syllableType,
    syllableTypeName,
    vowelLength,
    vowelLengthName,
    romanization: parsed.roman,
    ruleFormula,
    ruleExplanation,
    meaningGerman,
    hasToneMark: toneMarkKey !== 'none',
  };
}

// Generator: Generates a completely fresh, unique, grammatically verified Thai syllable
export function generateRandomSyllable(
  filter: SyllableTrainerFilter = 'all',
  recentHistory: string[] = []
): RandomSyllableItem {
  const maxAttempts = 60;
  const recentSet = new Set(recentHistory);

  // Strategy A: 60% of the time, try to pick from authentic curated library if matching filter
  const matchingCurated = CURATED_THAI_SYLLABLES.filter((item) => {
    if (recentSet.has(item.syllable)) return false;
    const parsed = parseThaiSyllable(item.syllable);
    const hasMark = parsed.toneMark !== null;
    if (filter === 'with_tone_marks' && !hasMark) return false;
    if (filter === 'without_tone_marks' && hasMark) return false;
    if (filter === 'mid_class' && parsed.initialClass !== 'mid') return false;
    if (filter === 'high_class' && parsed.initialClass !== 'high') return false;
    if (filter === 'low_class' && parsed.initialClass !== 'low') return false;
    return true;
  });

  if (matchingCurated.length > 0 && Math.random() < 0.55) {
    const picked = matchingCurated[Math.floor(Math.random() * matchingCurated.length)];
    return buildSyllableItem(picked.syllable, picked.meaningGerman);
  }

  // Strategy B: Procedural Synthesizer
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // 1. Pick initial consonant
    let validInitials = INITIAL_CONSONANTS;
    if (filter === 'mid_class') {
      validInitials = INITIAL_CONSONANTS.filter((c) => c.class === 'mid');
    } else if (filter === 'high_class') {
      validInitials = INITIAL_CONSONANTS.filter((c) => c.class === 'high');
    } else if (filter === 'low_class') {
      validInitials = INITIAL_CONSONANTS.filter((c) => c.class === 'low');
    }
    const init = validInitials[Math.floor(Math.random() * validInitials.length)];

    // 2. Pick template
    const tmpl = SYLLABLE_TEMPLATES[Math.floor(Math.random() * SYLLABLE_TEMPLATES.length)];
    const base = tmpl.render(init.char);

    // 3. Determine tone mark application
    let markChar = '';
    const shouldAddMark =
      filter === 'with_tone_marks'
        ? true
        : filter === 'without_tone_marks'
        ? false
        : tmpl.allowsToneMark && Math.random() < 0.45;

    if (shouldAddMark && tmpl.allowsToneMark) {
      if (init.class === 'mid') {
        const marks = ['่', '้', '๊', '๋'];
        markChar = marks[Math.floor(Math.random() * marks.length)];
      } else if (init.class === 'high') {
        const marks = ['่', '้'];
        markChar = marks[Math.floor(Math.random() * marks.length)];
      } else {
        const marks = ['่', '้'];
        markChar = marks[Math.floor(Math.random() * marks.length)];
      }
    }

    const constructed = attachToneMark(base, markChar, Boolean(init.isCluster));
    if (recentSet.has(constructed)) continue;

    const parsed = parseThaiSyllable(constructed);
    if (!parsed.roman || !parsed.initialClass) continue;

    // Filter validation
    const hasMark = parsed.toneMark !== null;
    if (filter === 'with_tone_marks' && !hasMark) continue;
    if (filter === 'without_tone_marks' && hasMark) continue;
    if (filter === 'mid_class' && parsed.initialClass !== 'mid') continue;
    if (filter === 'high_class' && parsed.initialClass !== 'high') continue;
    if (filter === 'low_class' && parsed.initialClass !== 'low') continue;

    return buildSyllableItem(constructed);
  }

  // Fallback if loop finishes: pick any non-recent curated item or first valid
  const fallback = CURATED_THAI_SYLLABLES.find((c) => !recentSet.has(c.syllable)) || CURATED_THAI_SYLLABLES[0];
  return buildSyllableItem(fallback.syllable, fallback.meaningGerman);
}
