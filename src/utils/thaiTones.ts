// Comprehensive Thai Tone Analysis & Romanization Engine
import { normalizeThaiText } from './thaiAudio';
export { normalizeThaiText };

export type ThaiTone = 'mid' | 'low' | 'falling' | 'high' | 'rising';

export interface SyllableTone {
  syllable: string;
  tone: ThaiTone;
  toneName: string;
  toneSymbol: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

export interface ToneInfo {
  name: string;
  germanName: string;
  symbol: string;
  description: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

export const THAI_TONES: Record<ThaiTone, ToneInfo> = {
  mid: {
    name: 'Mid Tone (สามัญ)',
    germanName: 'Mitte',
    symbol: '—',
    description: 'Gleichbleibend auf normaler Tonhöhe',
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-400/15',
    borderClass: 'border-amber-400/30',
  },
  low: {
    name: 'Low Tone (เอก)',
    germanName: 'Tief',
    symbol: '↘',
    description: 'Tiefe, ruhige Stimmlage',
    colorClass: 'text-sky-400',
    bgClass: 'bg-sky-400/15',
    borderClass: 'border-sky-400/30',
  },
  falling: {
    name: 'Falling Tone (โท)',
    germanName: 'Fallend',
    symbol: 'ᴧ',
    description: 'Hoch ansetzen und deutlich abfallen',
    colorClass: 'text-rose-400',
    bgClass: 'bg-rose-400/15',
    borderClass: 'border-rose-400/30',
  },
  high: {
    name: 'High Tone (ตรี)',
    germanName: 'Hoch',
    symbol: '↗',
    description: 'Hohe, gespannte Tonlage',
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-400/15',
    borderClass: 'border-emerald-400/30',
  },
  rising: {
    name: 'Rising Tone (จัตวา)',
    germanName: 'Steigend',
    symbol: 'v',
    description: 'Tief ansetzen und wie eine Frage ansteigen',
    colorClass: 'text-violet-400',
    bgClass: 'bg-violet-400/15',
    borderClass: 'border-violet-400/30',
  },
};

// Rich dictionary of Thai words, compound nouns, verbs, and phrases
const THAI_DICTIONARY: Record<string, string> = {
  // Reisen, Transport & Flugzeug (inklusive เครื่องบิน)
  'เครื่องบิน': 'khrûeang-bin',
  'เครื่อง': 'khrûeang',
  'บิน': 'bin',
  'เครื่องดื่ม': 'khrûeang-dùem',
  'เครื่องซักผ้า': 'khrûeang-sák-phâa',
  'สนามบิน': 'sà-năam-bin',
  'สนาม': 'sà-năam',
  'กระเป๋าเดินทาง': 'grà-bpăo doen-thaang',
  'กระเป๋า': 'grà-bpăo',
  'เดินทาง': 'doen-thaang',
  'เดิน': 'doen',
  'ทาง': 'thaang',
  'ตั๋วเครื่องบิน': 'dtŭa khrûeang-bin',
  'ตั๋ว': 'dtŭa',
  'พาสปอร์ต': 'pháat-sà-bpò̜ot',
  'หนังสือเดินทาง': 'năng-sŭe doen-thaang',
  'หนังสือ': 'năng-sŭe',
  'รถแท็กซี่': 'rót-tháaek-sée',
  'ป้ายรถเมล์อยู่ที่ไหนครับ': 'bpâai-rót-mee yòo thêe-năi kráp',
  'ป้ายรถเมล์อยู่ที่ไหนค่ะ': 'bpâai-rót-mee yòo thêe-năi khâ',
  'ป้ายรถเมล์อยู่ที่ไหน': 'bpâai-rót-mee yòo thêe-năi',
  'ป้ายรถประจำทาง': 'bpâai rót bprà-jam thaang',
  'ป้ายรถเมล์': 'bpâai-rót-mee',
  'ป้าย': 'bpâai',
  'รถเมล์': 'rót-mee',
  'เมล์': 'mee',
  'รถไฟฟ้า': 'rót-fai-fáa',
  'รถไฟ': 'rót-fai',
  'รถยนต์': 'rót-yon',
  'รถมอเตอร์ไซค์': 'rót-moo-dtooe-sai',
  'รถ': 'rót',
  'สถานีรถไฟ': 'sà-thăa-nee rót-fai',
  'สถานีรถประจำทาง': 'sà-thăa-nee rót bprà-jam thaang',
  'สถานีขนส่ง': 'sà-thăa-nee khŏn-sòng',
  'สถานี': 'sà-thăa-nee',
  'โรงแรม': 'roong-raaem',
  'โรงพยาบาล': 'roong-phá-yaa-baan',
  'โรงเรียน': 'roong-rian',
  'ตลาด': 'dtà-làat',
  'ห้างสรรพสินค้า': 'hâang-sàp-phá-sĭn-kháa',
  'ห้าง': 'hâang',
  'ห้องน้ำ': 'hông-nám',
  'ห้องนำ้': 'hông-nám',
  'ห้อง': 'hông',
  'เลี้ยวซ้าย': 'líao-sáai',
  'เลี้ยวขวา': 'líao-khwăa',
  'เลี้ยว': 'líao',
  'ตรงไป': 'dtrong-bpai',
  'หยุด': 'yùt',
  'ใกล้': 'glâi',
  'ไกล': 'glai',
  'ห้องน้ำอยู่ที่ไหน': 'hông-nám yòo thêe-năi',
  'ห้องนำ้อยู่ที่ไหน': 'hông-nám yòo thêe-năi',
  'อยู่ที่ไหน': 'yòo thêe-năi',
  'ที่ไหน': 'thêe-năi',
  'อยู่': 'yòo',
  'ไปไหน': 'bpai năi',
  'ไป': 'bpai',
  'มา': 'maa',
  'กลับ': 'glàp',

  // Begrüßung & Höflichkeit
  'สวัสดีครับ': 'sà-wàt-dee kráp',
  'สวัสดีค่ะ': 'sà-wàt-dee khâ',
  'สวัสดี': 'sà-wàt-dee',
  'สบายดีไหม': 'sà-baai-dee măi',
  'สบายดี': 'sà-baai-dee',
  'สบาย': 'sà-baai',
  'ขอบคุณมาก': 'kò̜ːp-kun mâak',
  'ขอบคุณครับ': 'kò̜ːp-kun kráp',
  'ขอบคุณค่ะ': 'kò̜ːp-kun khâ',
  'ขอบคุณ': 'kò̜ːp-kun',
  'ไม่เป็นไร': 'mâi pen rai',
  'ยินดีที่ได้รู้จัก': 'yin-dee thêe dâai róo-jàk',
  'ยินดี': 'yin-dee',
  'ขอโทษ': 'khăaw-thôot',
  'ขอโทษครับ': 'khăaw-thôot kráp',
  'ขอโทษค่ะ': 'khăaw-thôot khâ',
  'ลาก่อน': 'laa-gò̜on',
  'เจอกันใหม่': 'jooe-gan mài',

  // Essen & Trinken & Restaurant
  'อร่อยมาก': 'à-rò̜i mâak',
  'อร่อย': 'à-rò̜i',
  'ข้าวผัด': 'khâao-pàt',
  'ข้าวผัดไก่': 'khâao-pàt gài',
  'ข้าวผัดหมู': 'khâao-pàt mŏo',
  'ข้าว': 'khâao',
  'ผัด': 'pàt',
  'เผ็ดนิดหน่อย': 'phèt nít-nò̜i',
  'ไม่เผ็ด': 'mâi phèt',
  'เผ็ด': 'phèt',
  'น้ำ': 'nám',
  'นำ้': 'nám',
  'น้ำเปล่า': 'nám-bplào',
  'นำ้เปล่า': 'nám-bplào',
  'น้ำแข็ง': 'nám-khăeng',
  'นำ้แข็ง': 'nám-khăeng',
  'น้ำส้ม': 'nám-sôm',
  'นำ้ส้ม': 'nám-sôm',
  'น้ำชา': 'nám-chaa',
  'นำ้ชา': 'nám-chaa',
  'น้ำผลไม้': 'nám-phŏn-lá-mái',
  'นำ้ผลไม้': 'nám-phŏn-lá-mái',
  'ดื่มน้ำ': 'dùem nám',
  'ดื่มนำ้': 'dùem nám',
  'แก้วน้ำ': 'gâaew-nám',
  'แก้วนำ้': 'gâaew-nám',
  'แม่น้ำ': 'mâae-nám',
  'แม่นำ้': 'mâae-nám',
  'น้ำตก': 'nám-dtòk',
  'นำ้ตก': 'nám-dtòk',
  'น้ำปลา': 'nám-bplaa',
  'นำ้ปลา': 'nám-bplaa',
  'น้ำมัน': 'nám-man',
  'นำ้มัน': 'nám-man',
  'น้ำผึ้ง': 'nám-phûeng',
  'นำ้ผึ้ง': 'nám-phûeng',
  'เช็คบิลด้วยครับ': 'chék-bin dûai kráp',
  'เช็คบิล': 'chék-bin',
  'เก็บเงินด้วย': 'gèp-ngoen dûai',
  'หิวน้ำ': 'hĭo nám',
  'หิวนำ้': 'hĭo nám',
  'หิวข้าว': 'hĭo khâao',
  'หิว': 'hĭo',
  'อิ่มแล้ว': 'ìm láaeo',
  'อิ่ม': 'ìm',
  'กินข้าว': 'gin khâao',
  'กิน': 'gin',
  'ดื่ม': 'dùem',
  'เบียร์': 'bia',
  'ไวน์': 'wai',
  'ชาเย็น': 'chaa-yen',
  'กาแฟ': 'gaa-faae',
  'ต้มยำกุ้ง': 'dtôm-yam-gûng',
  'ผัดไทย': 'pàt-thai',
  'แก้ว': 'gâaew',
  'ขวด': 'khùat',
  'จาน': 'jaan',
  'ช้อน': 'chóon',
  'ส้อม': 'sôom',
  'หมู': 'mŏo',
  'ไก่': 'gài',
  'เนื้อ': 'núea',
  'ปลา': 'bplaa',
  'กุ้ง': 'gûng',
  'ไข่': 'khài',
  'ผัก': 'phàk',
  'ผลไม้': 'phŏn-lá-mái',

  // Einkaufen, Zahlen & Preise
  'อันนี้เท่าไหร่': 'an-née thâo-rài',
  'เท่าไหร่': 'thâo-rài',
  'ลดหน่อยได้ไหม': 'lót nò̜i dâai măi',
  'ลดได้ไหม': 'lót dâai măi',
  'ราคา': 'raa-khaa',
  'แพงมาก': 'phaaeng mâak',
  'แพง': 'phaaeng',
  'ถูก': 'thòok',
  'หนึ่งร้อยบาท': 'nùeng ró̜i bàat',
  'หนึ่ง': 'nùeng',
  'สอง': 'săawng',
  'สาม': 'săam',
  'สี่': 'sèe',
  'ห้า': 'hâa',
  'หก': 'hòk',
  'เจ็ด': 'jèt',
  'แปด': 'bpàaet',
  'เก้า': 'gâao',
  'สิบ': 'sìp',
  'ยี่สิบ': 'yêe-sìp',
  'ร้อย': 'ró̜i',
  'พัน': 'phan',
  'บาท': 'bàat',
  '๐': 'sŭun',
  '๑': 'nùeng',
  '๒': 'săawng',
  '๓': 'săam',
  '๔': 'sèe',
  '๕': 'hâa',
  '๖': 'hòk',
  '๗': 'jèt',
  '๘': 'bpàaet',
  '๙': 'gâao',
  'ซื้อ': 'súe',
  'ขาย': 'khăai',
  'เงิน': 'ngoen',

  // Gegenstände & Technik
  'โทรศัพท์': 'thoo-rá-sàp',
  'โทรทัศน์': 'thoo-rá-thát',
  'คอมพิวเตอร์': 'khaam-phiw-dtôoe',
  'พัดลม': 'phát-lom',
  'โต๊ะ': 'dtó',
  'เก้าอี้': 'gâao-êe',
  'ตู้เย็น': 'dtôo-yen',
  'เตียง': 'dtiiang',

  // Personen & Pronomen
  'คน': 'khon',
  'เพื่อน': 'phûean',
  'แฟน': 'faaen',
  'ครอบครัว': 'khrôop-khrua',
  'พ่อ': 'phôo',
  'แม่': 'mâae',
  'พี่': 'phêe',
  'น้อง': 'nóong',
  'ผม': 'phŏm',
  'ฉัน': 'chăn',
  'คุณ': 'khun',
  'เขา': 'khăo',
  'พวกเรา': 'phûak-rao',
  'ครับ': 'kráp',
  'ค่ะ': 'khâ',
  'คะ': 'khá',
  'นะ': 'ná',
  'ด้วย': 'dûai',

  // Fragen & Partikel
  'ไหม': 'măi',
  'มั้ย': 'mái',
  'หรือ': 'rŭe',
  'และ': 'láae',
  'กับ': 'gàp',
  'แต่': 'dtàae',
  'เพราะ': 'phró̜',
  'ทำไม': 'tham-mai',
  'อะไร': 'à-rai',
  'เมื่อไหร่': 'mûea-rài',
  'อย่างไร': 'yàang-rai',
  'ใคร': 'khrai',
  'ไหน': 'năi',
  'ที่นี่': 'thêe-nêe',
  'ที่นั่น': 'thêe-nân',
  'อันนี้': 'an-née',
  'อันนั้น': 'an-nán',

  // Eigenschaften & Gefühle
  'สวย': 'sŭai',
  'หล่อ': 'lò̜ː',
  'น่ารัก': 'nâa-rák',
  'ดี': 'dee',
  'ไม่ดี': 'mâi dee',
  'ชอบ': 'chô̜ːp',
  'ไม่ชอบ': 'mâi chô̜ːp',
  'รัก': 'rák',
  'สนุก': 'sà-nùk',
  'เหนื่อย': 'nùeai',
  'ร้อน': 'ró̜ːn',
  'หนาว': 'năao',
  'เย็น': 'yen',
  'เร็ว': 'reo',
  'ช้า': 'cháa',
  'มาก': 'mâak',
  'น้อย': 'nó̜i',
  'ใหญ่': 'yài',
  'เล็ก': 'lék',
  'สูง': 'sŭung',
  'มีความสุข': 'mee khwaam-sùk',
  'เข้าใจ': 'khâo-jai',
  'ไม่เข้าใจ': 'mâi khâo-jai',
  'ใช่': 'châi',
  'ไม่ใช่': 'mâi châi',
  'ช่วย': 'chûai',
  'ช่วยด้วย': 'chûai dûai',

  // Länder, Geographie & Nationalitäten
  'เยอรมนี': 'yoe-rá-má-nee',
  'เยอรมัน': 'yoe-rá-man',
  'ประเทศเยอรมนี': 'bprà-thêet yoe-rá-má-nee',
  'อเมริกา': 'à-mee-rí-gaa',
  'ประเทศอเมริกา': 'bprà-thêet à-mee-rí-gaa',
  'ประเทศ': 'bprà-thêet',
  'สหรัฐ': 'sà-hà-rát',
  'สหรัฐอเมริกา': 'sà-hà-rát à-mee-rí-gaa',
  'ประเทศไทย': 'bprà-thêet thai',

  // Jahreszeiten & Wetter (inkl. ฤดู)
  'ฤดู': 'rúe-doo',
  'ฤดูใบไม้ร่วง': 'rúe-doo-bai-mái-rûang',
  'ฤดูใบไม้ผลิ': 'rúe-doo-bai-mái-phlì',
  'ฤดูร้อน': 'rúe-doo-róon',
  'ฤดูหนาว': 'rúe-doo-năao',
  'ฤดูฝน': 'rúe-doo-fŏn',
  'ใบไม้': 'bai-mái',
  'ใบไม้ร่วง': 'bai-mái-rûang',
  'ใบไม้ผลิ': 'bai-mái-phlì',
  'ใบ': 'bai',
  'ไม้': 'mái',
  'ร่วง': 'rûang',
  'ผลิ': 'phlì',
  'ฝน': 'fŏn',
  'ฝนตก': 'fŏn-dtòk',
  'ตก': 'dtòk',
  'พฤหัสบดี': 'phróe-hàt-sà-boh-dee',
  'วันพฤหัสบดี': 'wan phróe-hàt-sà-boh-dee',
  'วันพฤหัส': 'wan phróe-hàt',
  'ไทย': 'thai',
  'อังกฤษ': 'ang-grìt',
  'ประเทศอังกฤษ': 'bprà-thêet ang-grìt',
  'ญี่ปุ่น': 'yêe-bpùn',
  'จีน': 'jeen',
  'ฝรั่งเศส': 'fà-ràng-sèet',
  'ฝรั่ง': 'fà-ràng',
  'อิตาลี': 'ì-dtaa-lee',
  'สเปน': 'sà-bpeen',
  'สวิตเซอร์แลนด์': 'sà-wít-sooe-laaen',
  'ออสเตรีย': 'óot-dtria',
  'ออสเตรเลีย': 'óot-dtrea-lia',
  'ถนน': 'thà-nŏn',
  'ขนม': 'khà-nŏm',
  'สมุด': 'sà-mùt',
  'บอก': 'bò̜ok',
  'สอน': 'săawn',
  'นอน': 'naan',
  'ตอบ': 'dtò̜op',
  'กอด': 'gò̜ot',
  'จอด': 'jò̜ot',
  'รอ': 'raaw',
  'ขอ': 'khăaw',
  'หมอ': 'măaw',
  'เคย': 'khooei',
  'เลย': 'looei',
  'เฉย': 'chŏoei',
  'เนย': 'nooei',
  'ธรรม': 'tham',
  'ธรรมชาติ': 'tham-má-châat',
  'สวรรค์': 'sà-wăn',
  'จันทร์': 'jan',
  'วันจันทร์': 'wan-jan',
  'วันอังคาร': 'wan ang-khaan',
  'วันพุธ': 'wan phút',
  'วันศุกร์': 'wan sùk',
  'วันเสาร์': 'wan săao',
  'วันอาทิตย์': 'wan aa-thít',
  'สัปดาห์': 'sàp-daa',
  'อาทิตย์': 'aa-thít',
  'คิดถึง': 'khít-thŭeng',
  'คิด': 'khít',
  'ถึง': 'thŭeng',

  // Farben, Aussehen & Haare (inklusive ผมสีดำ, อายุ)
  'อายุ': 'aa-yú',
  'ผมสีดำ': 'phŏm sĕe dam',
  'สีดำ': 'sĕe-dam',
  'สีขาว': 'sĕe-khăao',
  'สีแดง': 'sĕe-daaeng',
  'สีเขียว': 'sĕe-khĭao',
  'สีฟ้า': 'sĕe-fáa',
  'สีน้ำเงิน': 'sĕe-nám-ngoen',
  'สีเหลือง': 'sĕe-lŭeang',
  'สีส้ม': 'sĕe-sôm',
  'สีน้ำตาล': 'sĕe-nám-dtaan',
  'สีชมพู': 'sĕe-chom-phoo',
  'สีม่วง': 'sĕe-mûang',
  'สีเทา': 'sĕe-thao',
  'สี': 'sĕe',
  'ดำ': 'dam',
  'ขาว': 'khăao',
  'แดง': 'daaeng',
  'เขียว': 'khĭao',
  'เหลือง': 'lŭeang',
  'ฟ้า': 'fáa',
  'ส้ม': 'sôm',
  'น้ำตาล': 'nám-dtaan',
  'ม่วง': 'mûang',
  'ชมพู': 'chom-phoo',
  'เทา': 'thao',
  'ตา': 'dtaa',
  'ตาสีดำ': 'dtaa sĕe dam',
  'ตาสีฟ้า': 'dtaa sĕe fáa',
  'ตาสีน้ำตาล': 'dtaa sĕe nám-dtaan',
  'หน้า': 'nâa',
  'ตัว': 'dtua',
  'หัว': 'hŭa',
  'ใจ': 'jai',
  'มือ': 'mue',
  'เท้า': 'tháo',
  'ปี': 'bpee',
  'เดือน': 'duean',
  'วัน': 'wan',
};

// Thai consonant classes
const HIGH_CONSONANTS = new Set(['ข', 'ฃ', 'ฉ', 'ฐ', 'ถ', 'ผ', 'ฝ', 'ศ', 'ษ', 'ส', 'ห']);
const MID_CONSONANTS = new Set(['ก', 'จ', 'ฎ', 'ฏ', 'ด', 'ต', 'บ', 'ป', 'อ']);
const LOW_CONSONANTS = new Set([
  'ค', 'ฅ', 'ฆ', 'ง', 'ช', 'ซ', 'ฌ', 'ญ', 'ฑ', 'ฒ', 'ณ', 'ท', 'ธ', 'น',
  'พ', 'ฟ', 'ภ', 'ม', 'ย', 'ร', 'ล', 'ว', 'ฬ', 'ฮ', 'ฤ', 'ฦ',
]);

const INITIAL_CONSONANTS: Record<string, string> = {
  'ก': 'g', 'ข': 'kh', 'ฃ': 'kh', 'ค': 'kh', 'ฅ': 'kh', 'ฆ': 'kh',
  'ง': 'ng', 'จ': 'j', 'ฉ': 'ch', 'ช': 'ch', 'ซ': 's', 'ฌ': 'ch',
  'ญ': 'y', 'ฎ': 'd', 'ฏ': 'dt', 'ฐ': 'th', 'ฑ': 'th', 'ฒ': 'th',
  'ณ': 'n', 'ด': 'd', 'ต': 'dt', 'ถ': 'th', 'ท': 'th', 'ธ': 'th',
  'น': 'n', 'บ': 'b', 'ป': 'bp', 'ผ': 'ph', 'ฝ': 'f', 'พ': 'ph',
  'ฟ': 'f', 'ภ': 'ph', 'ม': 'm', 'ย': 'y', 'ร': 'r', 'ล': 'l',
  'ว': 'w', 'ศ': 's', 'ษ': 's', 'ส': 's', 'ห': 'h', 'ฬ': 'l',
  'ฮ': 'h', 'อ': '', 'ฤ': 'r', 'ฦ': 'l',
};

const CLUSTERS: Record<string, { roman: string; class: 'high' | 'mid' | 'low' }> = {
  'กร': { roman: 'gr', class: 'mid' },
  'กล': { roman: 'gl', class: 'mid' },
  'กว': { roman: 'gw', class: 'mid' },
  'ขร': { roman: 'khr', class: 'high' },
  'ขล': { roman: 'khl', class: 'high' },
  'ขว': { roman: 'khw', class: 'high' },
  'คร': { roman: 'khr', class: 'low' },
  'คล': { roman: 'khl', class: 'low' },
  'คว': { roman: 'khw', class: 'low' },
  'ตร': { roman: 'dtr', class: 'mid' },
  'ปร': { roman: 'bpr', class: 'mid' },
  'ปล': { roman: 'bpl', class: 'mid' },
  'ผล': { roman: 'phl', class: 'high' },
  'พร': { roman: 'phr', class: 'low' },
  'พล': { roman: 'phl', class: 'low' },
  'หม': { roman: 'm', class: 'high' },
  'หน': { roman: 'n', class: 'high' },
  'หว': { roman: 'w', class: 'high' },
  'หล': { roman: 'l', class: 'high' },
  'หย': { roman: 'y', class: 'high' },
  'หง': { roman: 'ng', class: 'high' },
  'หร': { roman: 'r', class: 'high' },
  'หญ': { roman: 'y', class: 'high' },
  'อย': { roman: 'y', class: 'mid' },
  'ทร': { roman: 's', class: 'low' },
  'ฝร': { roman: 'fr', class: 'high' },
  'ฟร': { roman: 'fr', class: 'low' },
  'กฤ': { roman: 'gr', class: 'mid' },
  'พฤ': { roman: 'phr', class: 'low' },
};

const FINAL_CONSONANTS: Record<string, { roman: string; isDead: boolean }> = {
  'ก': { roman: 'k', isDead: true },
  'ข': { roman: 'k', isDead: true },
  'ค': { roman: 'k', isDead: true },
  'ฆ': { roman: 'k', isDead: true },
  'ง': { roman: 'ng', isDead: false },
  'จ': { roman: 't', isDead: true },
  'ฉ': { roman: 't', isDead: true },
  'ช': { roman: 't', isDead: true },
  'ซ': { roman: 't', isDead: true },
  'ฌ': { roman: 't', isDead: true },
  'ฎ': { roman: 't', isDead: true },
  'ฏ': { roman: 't', isDead: true },
  'ฐ': { roman: 't', isDead: true },
  'ฑ': { roman: 't', isDead: true },
  'ฒ': { roman: 't', isDead: true },
  'ด': { roman: 't', isDead: true },
  'ต': { roman: 't', isDead: true },
  'ถ': { roman: 't', isDead: true },
  'ท': { roman: 't', isDead: true },
  'ธ': { roman: 't', isDead: true },
  'ศ': { roman: 't', isDead: true },
  'ษ': { roman: 't', isDead: true },
  'ส': { roman: 't', isDead: true },
  'ญ': { roman: 'n', isDead: false },
  'ณ': { roman: 'n', isDead: false },
  'น': { roman: 'n', isDead: false },
  'ร': { roman: 'n', isDead: false },
  'ล': { roman: 'n', isDead: false },
  'ฬ': { roman: 'n', isDead: false },
  'บ': { roman: 'p', isDead: true },
  'ป': { roman: 'p', isDead: true },
  'ผ': { roman: 'p', isDead: true },
  'พ': { roman: 'p', isDead: true },
  'ฟ': { roman: 'p', isDead: true },
  'ภ': { roman: 'p', isDead: true },
  'ม': { roman: 'm', isDead: false },
  'ย': { roman: 'y', isDead: false },
  'ว': { roman: 'w', isDead: false },
};

const DIACRITIC_MAP: Record<ThaiTone, Record<string, string>> = {
  mid: { a: 'a', e: 'e', i: 'i', o: 'o', u: 'u', y: 'y' },
  low: { a: 'à', e: 'è', i: 'ì', o: 'ò', u: 'ù', y: 'ỳ' },
  falling: { a: 'â', e: 'ê', i: 'î', o: 'ô', u: 'û', y: 'ŷ' },
  high: { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú', y: 'ý' },
  rising: { a: 'ă', e: 'ĕ', i: 'ĭ', o: 'ŏ', u: 'ŭ', y: 'y̌' },
};

/**
 * Applies a tone diacritic to the main vowel of a romanized syllable
 */
export function applyToneToSyllable(syllable: string, tone: ThaiTone): string {
  if (tone === 'mid') return syllable;

  const primaryVowels = ['a', 'e', 'i', 'o', 'u'];
  let charIdx = -1;
  for (let i = 0; i < syllable.length; i++) {
    const ch = syllable[i].toLowerCase();
    if (primaryVowels.includes(ch)) {
      charIdx = i;
      break;
    }
  }

  // Fallback to 'y' only if no primary vowel exists
  if (charIdx === -1) {
    for (let i = 0; i < syllable.length; i++) {
      if (syllable[i].toLowerCase() === 'y') {
        charIdx = i;
        break;
      }
    }
  }

  if (charIdx === -1) return syllable;

  const char = syllable[charIdx];
  const isUpper = char === char.toUpperCase();
  const lowerChar = char.toLowerCase();
  const accented = DIACRITIC_MAP[tone]?.[lowerChar] || lowerChar;
  const finalChar = isUpper ? accented.toUpperCase() : accented;

  return syllable.substring(0, charIdx) + finalChar + syllable.substring(charIdx + 1);
}

/**
 * Extracts tone from a single romanized syllable based on diacritics or tone numbers
 */
export function detectToneFromSyllable(syllable: string): ThaiTone {
  const norm = syllable.normalize('NFD');

  // Low: Grave accent (\u0300), modifier grave (\u02CB), or precomposed à, è, ì, ò, ù
  if (/[àèìòùỳ]/.test(syllable) || norm.includes('\u0300') || syllable.includes('\u02CB')) {
    return 'low';
  }

  // Falling: Circumflex (\u0302), modifier circumflex (\u02C6), caret (^), or precomposed â, ê, î, ô, û
  if (/[âêîôûŷ]/.test(syllable) || norm.includes('\u0302') || syllable.includes('\u02C6') || syllable.includes('^')) {
    return 'falling';
  }

  // High: Acute accent (\u0301), modifier acute (\u02CA), or precomposed á, é, í, ó, ú
  if (/[áéíóúý]/.test(syllable) || norm.includes('\u0301') || syllable.includes('\u02CA')) {
    return 'high';
  }

  // Rising: Caron/Hatschek (\u030C), Breve (\u0306), modifier caron (\u02C7), or precomposed ă, ĕ, ĭ, ŏ, ŭ, ǎ, ě, ǐ, ǒ, ǔ
  if (/[ăĕĭŏŭǎěǐǒǔ]/.test(syllable) || norm.includes('\u030C') || norm.includes('\u0306') || syllable.includes('\u02C7')) {
    return 'rising';
  }

  // Check numerical tone markers at end of syllable (e.g., dee1, mai4)
  if (/[1]$/.test(syllable)) return 'mid';
  if (/[2]$/.test(syllable)) return 'low';
  if (/[3]$/.test(syllable)) return 'falling';
  if (/[4]$/.test(syllable)) return 'high';
  if (/[5]$/.test(syllable)) return 'rising';

  return 'mid';
}

/**
 * Analyzes a romanized text and returns each syllable with its detected tone
 */
export function extractTonesFromRomanization(romanization: string): SyllableTone[] {
  if (!romanization || !romanization.trim()) return [];

  const tokens = romanization
    .trim()
    .split(/[\s-]+/)
    .filter(Boolean);

  const result: SyllableTone[] = [];
  for (const token of tokens) {
    // Preserve digits 1-5 for numeric tone notation (e.g. dee1, mai4)
    const cleanSyllable = token.replace(/^[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]+|[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]+$/g, '');
    if (!cleanSyllable) continue;

    const tone = detectToneFromSyllable(cleanSyllable);
    const info = THAI_TONES[tone];
    // Strip numeric suffix from display label
    const displaySyllable = cleanSyllable.replace(/[1-5]$/, '');

    result.push({
      syllable: displaySyllable || cleanSyllable,
      tone,
      toneName: info.germanName,
      toneSymbol: info.symbol,
      colorClass: info.colorClass,
      bgClass: info.bgClass,
      borderClass: info.borderClass,
    });
  }

  return result;
}

function computeTone(
  initialClass: 'high' | 'mid' | 'low',
  toneMark: 'mai_ek' | 'mai_tho' | 'mai_tri' | 'mai_chattawa' | null,
  isDead: boolean,
  isLongVowel: boolean
): ThaiTone {
  if (toneMark === 'mai_ek') return initialClass === 'low' ? 'falling' : 'low';
  if (toneMark === 'mai_tho') return initialClass === 'low' ? 'high' : 'falling';
  if (toneMark === 'mai_tri') return 'high';
  if (toneMark === 'mai_chattawa') return 'rising';
  if (isDead) {
    if (initialClass === 'high' || initialClass === 'mid') return 'low';
    return isLongVowel ? 'falling' : 'high';
  }
  return initialClass === 'high' ? 'rising' : 'mid';
}

const CLUSTER_PAIRS = new Set([
  'กร', 'กล', 'กว', 'ขร', 'ขล', 'ขว', 'คร', 'คล', 'คว', 'ตร', 'ปร', 'ปล', 'ผล', 'พร', 'พล', 'ฟร', 'บล',
  'หม', 'หน', 'หว', 'หล', 'หย', 'หง', 'หร', 'หญ', 'อย', 'ทร', 'ฝร', 'กฤ', 'พฤ',
]);

/**
 * Splits arbitrary Thai text into phonetic syllable chunks
 */
export function splitThaiIntoSyllables(text: string): string[] {
  const normalized = normalizeThaiText(text);
  const syllables: string[] = [];
  const chars = Array.from(normalized);
  let i = 0;

  const isLeadingVowel = (c: string) => /[เแโใไ]/.test(c);
  const isConsonant = (c: string) => /[ก-ฮฤฦ]/.test(c);
  const isVowelOrTone = (c: string) => /[ิีึืุูั็่้๊๋ะาำๅ]/.test(c);

  while (i < chars.length) {
    if (chars[i] === ' ') {
      i++;
      continue;
    }

    // Handle standalone Thai repetition mark (ๆ) if any remains
    if (chars[i] === 'ๆ') {
      if (syllables.length > 0) {
        syllables.push(syllables[syllables.length - 1]);
      }
      i++;
      continue;
    }

    const start = i;
    let end = i;

    // 1. Initial onset (including true clusters, leading Ho Hip, and leading O Ang)
    if (isLeadingVowel(chars[end])) {
      end++; // leading vowel
      if (end < chars.length && isConsonant(chars[end])) {
        if (end + 1 < chars.length && isConsonant(chars[end + 1]) && CLUSTER_PAIRS.has(chars[end] + chars[end + 1])) {
          end += 2;
        } else {
          end++;
        }
      }
    } else if (isConsonant(chars[end])) {
      if (end + 1 < chars.length && isConsonant(chars[end + 1]) && CLUSTER_PAIRS.has(chars[end] + chars[end + 1])) {
        end += 2;
      } else {
        end++;
      }
    } else {
      end++;
      const chunk = chars.slice(start, end).join('').trim();
      if (chunk) syllables.push(chunk);
      i = end;
      continue;
    }

    // 2. Consume vowel signs and diphthong glides attached to initial
    const hasLeadingE = chars.slice(start, end).some((c) => c === 'เ' || c === 'แ');
    let hasUpperI = false;
    let hasUpperUe = false;
    let hasSaraAa = false;
    let hasMaiHanAkat = false;
    let hasSaraUaOpen = false; // flag for -ัว (never takes a coda consonant)

    while (end < chars.length) {
      const c = chars[end];
      if (c === 'ี' || c === 'ิ') hasUpperI = true;
      if (c === 'ื' || c === 'ึ') hasUpperUe = true;
      if (c === 'า') hasSaraAa = true;
      if (c === 'ั') hasMaiHanAkat = true;

      if (isVowelOrTone(c) || c === '์') {
        end++;
      } else if (
        // Sara Ua open with mai han-akat (-ัว, e.g. ตัว, หัว, กลัว, บัว, วัว)
        (c === 'ว' && hasMaiHanAkat)
      ) {
        end++;
        hasSaraUaOpen = true; // Complete open vowel - cannot take coda
      } else if (
        // Sara Ua closed without mai han-akat (-ว- + coda, e.g. สวย, ขวด, ร่วง, พวก, ช่วย, ด้วย)
        (c === 'ว' && !hasSaraAa && !hasLeadingE && end + 1 < chars.length && isConsonant(chars[end + 1]))
      ) {
        end++;
      } else if (
        // Sara Ia (เ-ีย, เ-ียะ, e.g. เรียน, เตียง, เสีย, เลี้ยว)
        (c === 'ย' && hasLeadingE && hasUpperI) ||
        // Sara Uea (เ-ือ, เ-ือะ, e.g. เครื่อง, เมือง, เรื่อง)
        (c === 'อ' && hasLeadingE && hasUpperUe) ||
        // Sara Oe (เ-อ, e.g. เธอ, เจอ, เหม่อ) when not followed by another consonant
        (c === 'อ' && hasLeadingE && (end + 1 >= chars.length || !isConsonant(chars[end + 1]) || chars[end + 1] === ' '))
      ) {
        end++;
      } else if (
        // Ror Han (รร, e.g. ธรรม, พรรค, สวรรค์, กรรไกร)
        (c === 'ร' && end + 1 < chars.length && chars[end + 1] === 'ร')
      ) {
        end += 2;
      } else if (
        // Medial or final Sara Or (-อ-, e.g. บอก, ชอบ, นอน, สอน, กอด, ออก, ตอบ, ตอน, ร้อย, หมอน, ขอ, พ่อ)
        (c === 'อ' && !hasLeadingE && !hasUpperI && !hasUpperUe && !hasSaraAa && !hasMaiHanAkat &&
         (end + 1 >= chars.length || chars[end + 1] === ' ' || (isConsonant(chars[end + 1]) && (end + 2 >= chars.length || !isVowelOrTone(chars[end + 2])))))
      ) {
        end++;
      } else {
        break;
      }
    }

    // 3. Optional: AT MOST ONE final consonant (coda)
    // If the syllable is open sara ua (-ัว), it never takes a coda
    if (!hasSaraUaOpen && end < chars.length && isConsonant(chars[end])) {
      const nextChar = chars[end];
      const afterNext = end + 1 < chars.length ? chars[end + 1] : '';

      // If nextChar is followed by an attached vowel or tone mark, it belongs to the next syllable
      const nextHasVowel = isVowelOrTone(afterNext);

      // Check if current syllable has NO vowel marker (single initial consonant, e.g. ถ in ถนน, ข in ขนม, น in นคร)
      // and is followed by two consonants forming a closed inherent-o syllable
      const currentHadVowel = chars.slice(start, end).some((ch) => isVowelOrTone(ch) || isLeadingVowel(ch) || ch === 'อ');
      const isConsonantTrio = !currentHadVowel && end + 1 < chars.length && isConsonant(chars[end + 1]) && (end + 2 >= chars.length || isLeadingVowel(chars[end + 2]) || chars[end + 2] === ' ' || !isVowelOrTone(chars[end + 2]));

      if (!nextHasVowel && !isConsonantTrio) {
        end++;
        // consume trailing tone/karan if any
        while (end < chars.length && (isVowelOrTone(chars[end]) || chars[end] === '์')) {
          end++;
        }
        // Handle double silent consonants with karan (e.g. จันทร์, ศาสตร์, ทร์, ตร์, สตร์, นต์, พธ์)
        if (end + 1 < chars.length && chars[end + 1] === '์') {
          end += 2;
        } else if (end + 2 < chars.length && chars[end + 2] === '์') {
          end += 3;
        }
      }
    }

    const chunk = chars.slice(start, end).join('').trim();
    if (chunk) syllables.push(chunk);
    i = end;
  }

  return syllables;
}

/**
 * Parses an individual Thai syllable based on phonetic rules
 */
export function parseThaiSyllable(raw: string): { roman: string; tone: ThaiTone } {
  const normRaw = normalizeThaiText(raw);
  // If no Thai character exists, return empty
  if (!/[ก-๙]/.test(normRaw)) {
    return { roman: '', tone: 'mid' };
  }

  // Strip silent consonant + karan (e.g. ร์, ท์, ส์, or double silent consonants like ทร์, ตร์, คร์, พร์, นต์, ลทิ์)
  let s = normRaw
    .replace(/(?:[ก-ฮ][รลว][ิุ]?์|[ก-ฮ][ิุ]?์)/g, '')
    .replace(/์/g, '')
    .trim();
  if (!s) return { roman: '', tone: 'mid' };

  // Explicit handling for Thai numerals (๐-๙)
  if (/^[๐-๙]$/.test(s)) {
    const digitMap: Record<string, { roman: string; tone: ThaiTone }> = {
      '๐': { roman: 'sŭun', tone: 'rising' },
      '๑': { roman: 'nùeng', tone: 'low' },
      '๒': { roman: 'săawng', tone: 'rising' },
      '๓': { roman: 'săam', tone: 'rising' },
      '๔': { roman: 'sèe', tone: 'low' },
      '๕': { roman: 'hâa', tone: 'falling' },
      '๖': { roman: 'hòk', tone: 'low' },
      '๗': { roman: 'jèt', tone: 'low' },
      '๘': { roman: 'bpàaet', tone: 'low' },
      '๙': { roman: 'gâao', tone: 'falling' },
    };
    return digitMap[s] || { roman: '', tone: 'mid' };
  }

  // Explicit handling for vocalic ฤ (ru / rue) and ฦ (lu)
  if (s.startsWith('ฤๅ') || s.startsWith('ฦๅ')) {
    const isRu = s.startsWith('ฤ');
    return {
      roman: isRu ? 'rue' : 'lue',
      tone: 'mid',
    };
  }
  if (s === 'ฤ' || s === 'ฦ') {
    const isRu = s === 'ฤ';
    const base = isRu ? 'rue' : 'lue';
    return {
      roman: applyToneToSyllable(base, 'high'),
      tone: 'high',
    };
  }
  if (s.startsWith('ฤ')) {
    if (s.includes('ก')) {
      return {
        roman: applyToneToSyllable('roek', 'falling'),
        tone: 'falling',
      };
    }
    if (s.includes('ท') || s.includes('ต') || s.includes('ษ')) {
      return {
        roman: applyToneToSyllable('rit', 'high'),
        tone: 'high',
      };
    }
  }

  let leadingVowel = '';
  if (/^[เแโใไ]/.test(s)) {
    leadingVowel = s[0];
    s = s.substring(1);
  }

  // Extract tone mark
  let toneMark: 'mai_ek' | 'mai_tho' | 'mai_tri' | 'mai_chattawa' | null = null;
  if (s.includes('่')) toneMark = 'mai_ek';
  else if (s.includes('้')) toneMark = 'mai_tho';
  else if (s.includes('๊')) toneMark = 'mai_tri';
  else if (s.includes('๋')) toneMark = 'mai_chattawa';
  s = s.replace(/[่้๊๋]/g, '');

  let initial = '';
  let initialClass: 'high' | 'mid' | 'low' = 'mid';

  // Check cluster first
  if (s.length >= 2 && !/[ิีึืั็ุู]/.test(s[0]) && CLUSTERS[s.substring(0, 2)]) {
    const cl = CLUSTERS[s.substring(0, 2)];
    initial = cl.roman;
    initialClass = cl.class;
    s = s.substring(2);
  } else if (s.length >= 1 && INITIAL_CONSONANTS[s[0]] !== undefined) {
    const c = s[0];
    initial = INITIAL_CONSONANTS[c];
    if (HIGH_CONSONANTS.has(c)) initialClass = 'high';
    else if (MID_CONSONANTS.has(c)) initialClass = 'mid';
    else initialClass = 'low';
    s = s.substring(1);
  }

  let vowel = 'a';
  let isLong = false;
  let finalCons = '';
  let isDead = false;

  // Diphthongs & Special Vowels
  if (leadingVowel === 'เ' && s.includes('ื') && (s.includes('อ') || s.includes('ะ'))) {
    vowel = 'uea';
    isLong = !s.includes('ะ');
    s = s.replace(/[ื]/g, '').replace(/[อะ]/g, '');
  } else if (leadingVowel === 'เ' && s.includes('ีย')) {
    vowel = 'ia';
    isLong = !s.includes('ะ');
    s = s.replace(/ีย[ะ]?/g, '');
  } else if (leadingVowel === 'เ' && s.includes('าะ')) {
    vowel = 'aw';
    isLong = false;
    isDead = true;
    s = s.replace('าะ', '');
  } else if (leadingVowel === 'เ' && s.includes('า')) {
    vowel = 'ao';
    isLong = true;
    isDead = false;
    s = s.replace('า', '');
  } else if (leadingVowel === 'เ' && (s.includes('ิ') || s === 'อ' || s.startsWith('อ') || s.includes('อะ'))) {
    vowel = 'oe';
    isLong = !s.includes('ะ');
    isDead = s.includes('ะ');
    s = s.replace('ิ', '').replace('อะ', '').replace(/^อ/, '');
  } else if (leadingVowel === 'เ' && (s.includes('ะ') || s.includes('็'))) {
    vowel = 'e';
    isLong = false;
    isDead = s.includes('ะ');
    s = s.replace(/[ะ็]/g, '');
  } else if (leadingVowel === 'เ' && (s === 'ย' || (s.length === 1 && s.endsWith('ย')))) {
    // Sara Oe with Y coda (เ-ย, e.g. เคย, เลย, เฉย, เนย, เผย)
    vowel = 'ooe';
    isLong = true;
    finalCons = 'y';
    isDead = false;
    s = '';
  } else if (leadingVowel === 'เ') {
    vowel = 'ee';
    isLong = true;
  } else if (leadingVowel === 'แ' && (s.includes('ะ') || s.includes('็'))) {
    vowel = 'ae';
    isLong = false;
    isDead = s.includes('ะ');
    s = s.replace(/[ะ็]/g, '');
  } else if (leadingVowel === 'แ') {
    vowel = 'aae';
    isLong = true;
  } else if (leadingVowel === 'โ' && s.includes('ะ')) {
    vowel = 'o';
    isLong = false;
    isDead = true;
    s = s.replace('ะ', '');
  } else if (leadingVowel === 'โ') {
    vowel = 'oo';
    isLong = true;
  } else if (leadingVowel === 'ใ' || leadingVowel === 'ไ') {
    vowel = 'ai';
    isLong = true;
    isDead = false;
  } else if (s.includes('รร')) {
    // Ror Han (รร, e.g. ธรรม, พรรค, สวรรค์, กรร)
    vowel = 'a';
    isLong = false;
    if (s === 'รร') {
      finalCons = 'n';
      isDead = false;
      s = '';
    } else {
      s = s.replace('รร', '');
    }
  } else if (s.includes('ัว')) {
    vowel = 'ua';
    isLong = true;
    s = s.replace('ัว', '');
  } else if (s.startsWith('ว') && s.length > 1 && FINAL_CONSONANTS[s[s.length - 1]]) {
    vowel = 'ua';
    isLong = true;
    s = s.substring(1);
  } else if (s.includes('ำ')) {
    vowel = 'am';
    isLong = false;
    isDead = false;
    s = s.replace('ำ', '');
  } else if (s.includes('ี')) {
    vowel = 'ee';
    isLong = true;
    s = s.replace('ี', '');
  } else if (s.includes('ิ')) {
    vowel = 'i';
    isLong = false;
    s = s.replace('ิ', '');
  } else if (s.includes('ื')) {
    vowel = 'uee';
    isLong = true;
    s = s.replace('ื', '');
  } else if (s.includes('ึ')) {
    vowel = 'ue';
    isLong = false;
    s = s.replace('ึ', '');
  } else if (s.includes('ู')) {
    vowel = 'oo';
    isLong = true;
    s = s.replace('ู', '');
  } else if (s.includes('ุ')) {
    vowel = 'u';
    isLong = false;
    s = s.replace('ุ', '');
  } else if (s.includes('ั')) {
    vowel = 'a';
    isLong = false;
    s = s.replace('ั', '');
  } else if (s.includes('า')) {
    vowel = 'aa';
    isLong = true;
    s = s.replace('า', '');
  } else if (s.includes('ะ')) {
    vowel = 'a';
    isLong = false;
    isDead = true;
    s = s.replace('ะ', '');
  } else if (s.startsWith('อ') && s.length > 1 && FINAL_CONSONANTS[s[s.length - 1]]) {
    vowel = 'or';
    isLong = true;
    s = s.substring(1);
  } else if (s === 'อ') {
    vowel = 'or';
    isLong = true;
    s = '';
  } else if (s.length === 1 && FINAL_CONSONANTS[s]) {
    // Inherent short /o/ between two consonants (คน, รถ, ผม)
    vowel = 'o';
    isLong = false;
  } else if (s.length === 0) {
    // Single open consonant with inherent short /a/ (e.g. อ -> à, ระ -> rá, มะ -> má, กะ -> gà)
    vowel = 'a';
    isLong = false;
    isDead = true;
  }

  // Any remaining trailing consonant is the final consonant
  if (s.length > 0 && FINAL_CONSONANTS[s[s.length - 1]]) {
    const finChar = s[s.length - 1];
    const fin = FINAL_CONSONANTS[finChar];
    finalCons = fin.roman;
    isDead = fin.isDead;
  } else if (finalCons === '' && !isLong && vowel !== 'am' && vowel !== 'ai' && vowel !== 'ao') {
    // Open syllable with short vowel is always dead (คำตาย)!
    isDead = true;
  }

  const tone = computeTone(initialClass, toneMark, isDead, isLong);
  const rawRom = `${initial}${vowel}${finalCons}`;
  return {
    roman: applyToneToSyllable(rawRom, tone),
    tone,
  };
}

function romanizeThaiSegment(clean: string): string {
  if (!clean) return '';
  if (THAI_DICTIONARY[clean]) {
    return THAI_DICTIONARY[clean];
  }

  const words: string[] = [];
  let i = 0;

  while (i < clean.length) {
    let matched = false;
    // Check dictionary prefixes from longest to shortest
    for (let len = Math.min(clean.length - i, 50); len >= 2; len--) {
      const sub = clean.substring(i, i + len);
      if (THAI_DICTIONARY[sub]) {
        words.push(THAI_DICTIONARY[sub]);
        i += len;
        matched = true;
        break;
      }
    }

    if (!matched) {
      if (clean[i] === ' ') {
        i++;
        continue;
      }

      // Find next chunk using splitThaiIntoSyllables
      const remaining = clean.substring(i);
      const splitChunks = splitThaiIntoSyllables(remaining);
      const nextChunk = splitChunks[0] || clean[i];

      const parsed = parseThaiSyllable(nextChunk);
      if (parsed.roman) {
        words.push(parsed.roman);
      }
      i += nextChunk.length;
    }
  }

  return words.join('-').replace(/--+/g, '-');
}

/**
 * Automatically generates phonetic romanization with tone marks from Thai text
 */
export function generateRomanizationFromThai(thaiText: string): {
  romanization: string;
  syllables: SyllableTone[];
} {
  const clean = normalizeThaiText(thaiText);
  if (!clean) return { romanization: '', syllables: [] };

  // Handle delimiter segments cleanly (e.g. "อเมริกา / ประเทศอเมริกา", "คำ1, คำ2")
  if (/[\/\,\(\)\[\];+&]/.test(clean)) {
    const parts = clean.split(/(\s*[\/\,\(\)\[\];+&]\s*)/);
    const romParts: string[] = [];
    for (const part of parts) {
      if (/[\/\,\(\)\[\];+&]/.test(part)) {
        romParts.push(part.trim());
      } else if (part.trim()) {
        const segRom = romanizeThaiSegment(part.trim());
        if (segRom) romParts.push(segRom);
      }
    }
    const finalRom = romParts.join(' ').replace(/\s+([\/,\)\]])/g, ' $1').replace(/([\/,\(\[])\s+/g, '$1 ');
    return {
      romanization: finalRom,
      syllables: extractTonesFromRomanization(finalRom),
    };
  }

  const resultRom = romanizeThaiSegment(clean);
  return {
    romanization: resultRom,
    syllables: extractTonesFromRomanization(resultRom),
  };
}
