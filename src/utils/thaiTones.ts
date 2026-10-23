// Comprehensive Thai Tone Analysis & Romanization Engine

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
  'รถแท็กซี่': 'rót-tháaek-sêe',
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
  'ห้อง': 'hông',
  'เลี้ยวซ้าย': 'líao-sáai',
  'เลี้ยวขวา': 'líao-khwăa',
  'เลี้ยว': 'líao',
  'ตรงไป': 'dtrong-bpai',
  'หยุด': 'yùt',
  'ใกล้': 'glâi',
  'ไกล': 'glai',
  'วัดอยู่ใกล้': 'wát-yòo-glâi',
  'วัดอยู่ไกล': 'wát-yòo-glai',
  'วัดพระแก้ว': 'wát-phrá-gâaew',
  'วัดอรุณ': 'wát-à-run',
  'วัดโพธิ์': 'wát-phoo',
  'วัด': 'wát',
  'ห้องน้ำอยู่ที่ไหน': 'hông-nám yòo thêe-năi',
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
  'น้ำเปล่า': 'nám-bplào',
  'น้ำแข็ง': 'nám-khăeng',
  'น้ำ': 'nám',
  'เช็คบิลด้วยครับ': 'chék-bin dûai kráp',
  'เช็คบิล': 'chék-bin',
  'เก็บเงินด้วย': 'gèp-ngoen dûai',
  'หิวน้ำ': 'hĭo nám',
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

  // Personen, Familie & Pronomen (inkl. ภรรยา / สามี)
  'คน': 'khon',
  'เพื่อน': 'phûean',
  'แฟน': 'faaen',
  'ครอบครัว': 'khrôop-khrua',
  'สามี': 'săa-mee',
  'ภรรยา': 'phan-rá-yaa',
  'ภริยา': 'phá-rí-yaa',
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

  // Wörter mit Ro Han (ร หัน / รร) & klassische Begriffe
  'กรรไกร': 'gan-grai',
  'กรรโชก': 'gan-chôok',
  'กรรเชียง': 'gan-chiiang',
  'กรรม': 'gam',
  'ธรรม': 'tham',
  'ธรรมชาติ': 'tham-má-châat',
  'ธรรมดา': 'tham-má-daa',
  'กิจกรรม': 'gìt-jà-gam',
  'พรรษา': 'phan-săa',
  'พรรค': 'phák',
  'วรรค': 'wák',
  'สรรพ': 'sàp',
  'สรรหา': 'săn-hăa',
  'จัดสรร': 'jàt-săn',
  'บรรยาย': 'ban-yaai',
  'บรรดา': 'ban-daa',
  'บรรทัด': 'ban-thát',
  'บรรจุ': 'ban-jù',
  'บรรทุก': 'ban-thúk',
  'บรรลุ': 'ban-lú',
  'สวรรค์': 'sà-wăn',
  'อุปสรรค': 'òop-bpà-sàk',
  'มรรยาท': 'man-yâat',
  'มารยาท': 'maa-rá-yâat',

  // Sanskrit/Pali-Ausnahmen (stumme End-Vokale & stumme Konsonanten wie -ติ, -ตุ, -ตร, -ชร, -กร, -คร)
  'ชาติ': 'châat',
  'ญาติ': 'yâat',
  'รสชาติ': 'rót-châat',
  'ประวัติ': 'bprà-wàt',
  'ประวัติศาสตร์': 'bprà-wàt-dtì-sàat',
  'สมบัติ': 'sŏm-bàt',
  'ปฏิบัติ': 'bprà-dtì-bàt',
  'อนุมัติ': 'à-nú-mát',
  'อัตโนมัติ': 'àt-dtà-noo-mát',
  'เหตุ': 'hèet',
  'สาเหตุ': 'săa-hèet',
  'อุบัติเหตุ': 'òo-bàt-dtì-hèet',
  'ธาตุ': 'thâat',
  'สามารถ': 'săa-mâat',
  'บัตร': 'bàt',
  'บัตรเครดิต': 'bàt-khree-dìt',
  'สูตร': 'sòot',
  'มิตร': 'mít',
  'มิตรภาพ': 'mít-dtrà-phâap',
  'เมตร': 'mêet',
  'กิโลเมตร': 'gì-loo-mêet',
  'เซนติเมตร': 'sen-dtì-mêet',
  'ลิตร': 'lít',
  'บุตร': 'bùt',
  'เพชร': 'phét',
  'จักร': 'jàk',
  'สมัคร': 'sà-màk',
  'สมัครงาน': 'sà-màk ngaan',
  'เกษตร': 'gà-sèet',

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
  'อิตาลี': 'ì-dtaa-lêe',
  'สเปน': 'sà-bpeen',
  'สวิตเซอร์แลนด์': 'sà-wít-sooe-laaen',
  'ออสเตรีย': 'óot-dtria',
  'ออสเตรเลีย': 'óot-dtrea-lia',

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
  'วันนี้': 'wan-née',
  'พรุ่งนี้': 'phrûng-née',
  'เมื่อวาน': 'mûea-waan',
  'วันจันทร์': 'wan-jan',
  'วันอังคาร': 'wan ang-khaan',
  'วันพุธ': 'wan-phút',
  'วันศุกร์': 'wan-sùk',
  'วันเสาร์': 'wan-săo',
  'วันอาทิตย์': 'wan aa-thít',
  'อาทิตย์': 'aa-thít',
  'สัปดาห์': 'sàp-daa',
  'ขนม': 'khà-nŏm',
  'ถนน': 'thà-nŏn',
  'ระบบ': 'rá-bòp',
  'สงบ': 'sà-ngòp',
  'สมุด': 'sà-mùt',
  'ฉลาม': 'chà-lăam',
  'ตลก': 'dtà-lòk',
  'ก็': 'gô̜',
  'เคย': 'khooei',
  'ไม่เคย': 'mâi khooei',
  'เลย': 'looei',
  'ไม่เป็นไรเลย': 'mâi pen rai looei',
  'ผู้หญิง': 'phôo-yĭng',
  'ผู้ชาย': 'phôo-chaai',
  'จังหวัด': 'jang-wàt',
  'กรุงเทพ': 'grung-thêep',
  'กรุงเทพฯ': 'grung-thêep',
  'ผล': 'phŏn',
  'ผลิต': 'phà-lìt',
  'นคร': 'ná-khɔɔn',
  'ละคร': 'lá-khɔɔn',
  'พร': 'phɔɔn',
  'อักษร': 'àk-sɔ̌ɔn',
  'จริง': 'jing',
  'สร้าง': 'sâang',
  'ศรี': 'sĕe',
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
  'บล': { roman: 'bl', class: 'mid' },
  'บร': { roman: 'br', class: 'mid' },
  'ดร': { roman: 'dr', class: 'mid' },
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
  'ศร': { roman: 's', class: 'high' },
  'สร': { roman: 's', class: 'high' },
  'จร': { roman: 'j', class: 'mid' },
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

  // Low: Grave accent (\u0300) or precomposed à, è, ì, ò, ù
  if (/[àèìòùỳ]/.test(syllable) || norm.includes('\u0300')) {
    return 'low';
  }

  // Falling: Circumflex (\u0302) or precomposed â, ê, î, ô, û
  if (/[âêîôûŷ]/.test(syllable) || norm.includes('\u0302')) {
    return 'falling';
  }

  // High: Acute accent (\u0301) or precomposed á, é, í, ó, ú
  if (/[áéíóúý]/.test(syllable) || norm.includes('\u0301')) {
    return 'high';
  }

  // Rising: Caron/Hatschek (\u030C), Breve (\u0306), or precomposed ă, ĕ, ĭ, ŏ, ŭ
  if (/[ăĕĭŏŭǎěǐǒǔ]/.test(syllable) || norm.includes('\u030C') || norm.includes('\u0306')) {
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
    const cleanSyllable = token.replace(/^[^a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]+|[^a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]+$/g, '');
    if (!cleanSyllable) continue;

    const tone = detectToneFromSyllable(cleanSyllable);
    const info = THAI_TONES[tone];

    result.push({
      syllable: cleanSyllable,
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

export function computeTone(
  initialClass: 'high' | 'mid' | 'low',
  toneMark: 'mai_ek' | 'mai_tho' | 'mai_tri' | 'mai_chattawa' | null | 'none',
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

export const CLUSTER_PAIRS = new Set([
  'กร', 'กล', 'กว', 'ขร', 'ขล', 'ขว', 'คร', 'คล', 'คว', 'ตร', 'ปร', 'ปล', 'ผล', 'พร', 'พล', 'ฟร', 'บล', 'บร', 'ดร', 'ฝร',
  'กฤ', 'พฤ', 'หม', 'หน', 'หว', 'หล', 'หย', 'หง', 'หร', 'หญ', 'อย', 'ทร', 'ศร', 'สร', 'จร',
]);

/**
 * Normalizes Thai script characters and keystroke order:
 * - Decomposed characters (Sara Am, Sara Ue)
 * - Double Sara E (เเ) -> Sara Ae (แ)
 * - Inverted vowels and tone marks (above, below, right-hand vowels, compound vowels)
 * - Known consonant clusters and Aksorn Nam tone marks
 * - Deduplicates consecutive identical combining marks
 */
export function canonicalizeThaiScript(str: string, keepSpaces = true): string {
  if (!str) return '';
  let s = str
    // 0. Remove zero-width spaces, directional marks, formatting, BOM, soft hyphens
    .replace(/[\u200B-\u200D\uFEFF\u00A0\u202A-\u202E\u00AD\u2060\u2000-\u200A\u202F\u205F\u3000]/g, '')
    .normalize('NFC');

  if (!keepSpaces) {
    // Strip parenthetical clarifications and brackets (including fullwidth Asian parentheses)
    s = s.replace(/[\(\[\{（【][^\)\]\}）】]*[\)\]\}）】]/g, ' ');
    // Strip punctuation, hyphens, quotes, fullwidth symbols
    s = s.replace(/[\s\-_.,;!?/\\()\[\]{}'"`~^«»“”‘’、。・！？（）【】《》…|:]+/g, '');
  }

  // 1. Double Sara E (เเ \u0E40\u0E40) -> Sara Ae (แ \u0E41)
  s = s.replace(/\u0E40\u0E40/g, '\u0E41');

  // 2. Deduplicate consecutive identical combining marks (accidental double taps on mobile keyboard)
  s = s.replace(/([\u0E31\u0E34-\u0E3A\u0E47-\u0E4E])\1+/g, '$1');

  // 3. Decomposed Sara Ue: Sara I (\u0E34) + Nikhahit (\u0E4D) -> Sara Ue (\u0E36)
  s = s.replace(/\u0E34([\u0E48-\u0E4B])?\u0E4D/g, (_m, tone) => '\u0E36' + (tone || ''));
  s = s.replace(/\u0E34\u0E4D/g, '\u0E36');

  // 4. Decomposed Sara Am with tone mark in any position -> Tone Mark + Sara Am
  s = s.replace(/([\u0E48-\u0E4B])\u0E4D\u0E32/g, '$1\u0E33');
  s = s.replace(/\u0E4D([\u0E48-\u0E4B])\u0E32/g, '$1\u0E33');
  s = s.replace(/\u0E4D\u0E32([\u0E48-\u0E4B])/g, '$1\u0E33');
  s = s.replace(/\u0E4D\u0E32/g, '\u0E33');
  s = s.replace(/\u0E33([\u0E48-\u0E4B])/g, '$1\u0E33');

  // 5. Tone mark typed after right-hand vowels: า (\u0E32), ะ (\u0E30), ๅ (\u0E45)
  // In Thai orthography, tone marks always sit on the preceding consonant/cluster!
  // e.g. ปา่ -> ป่า, มา้ -> ม้า, เกา้ -> เก้า, เขา้ -> เข้า, กะ่ -> ก่ะ, โตะ๊ -> โต๊ะ
  s = s.replace(/([ก-ฮ])([\u0E30\u0E32\u0E45])([\u0E48-\u0E4B])/g, '$1$3$2');

  // 6. Tone mark typed after compound vowel endings:
  // - Sara Ua: ั + ว + Tone -> ั + Tone + ว (e.g. ตัว๋ -> ตั๋ว, รัว้ -> รั้ว)
  s = s.replace(/\u0E31\u0E27([\u0E48-\u0E4B])/g, '\u0E31$1\u0E27');
  // - Sara Ia: ี + ย + Tone -> ี + Tone + ย (e.g. เบีย้ -> เบี้ย, เตีย้ -> เตี้ย)
  s = s.replace(/\u0E35\u0E22([\u0E48-\u0E4B])/g, '\u0E35$1\u0E22');
  // - Sara Uea: ื + อ + Tone -> ื + Tone + อ (e.g. เสือ้ -> เสื้อ, เพือ่ -> เพื่อ)
  s = s.replace(/\u0E37\u0E2D([\u0E48-\u0E4B])/g, '\u0E37$1\u0E2D');

  // 7. Trailing tone mark on closed syllables (typed mistakenly after the final consonant):
  // NOTE: Must ensure the tone mark is not followed by a vowel diacritic (e.g. ค่ะ has ะ after ่),
  // which indicates the consonant is an onset of the subsequent syllable!
  // - Sara Uea with coda: ื + อ + Coda + Tone -> ื + Tone + อ + Coda (e.g. เรือง่ -> เรื่อง, เพือน่ -> เพื่อน)
  s = s.replace(/\u0E37\u0E2D([ก-ฮ])([\u0E48-\u0E4B])(?![ะาๅำ\u0E30-\u0E3A\u0E45])/g, '\u0E37$2\u0E2D$1');
  // - Sara Ia with coda: ี + ย + Coda + Tone -> ี + Tone + ย + Coda (e.g. เทียว่ -> เที่ยว)
  s = s.replace(/\u0E35\u0E22([ก-ฮ])([\u0E48-\u0E4B])(?![ะาๅำ\u0E30-\u0E3A\u0E45])/g, '\u0E35$2\u0E22$1');
  // - Sara Ua with coda: ั + ว + Coda + Tone -> ั + Tone + ว + Coda
  s = s.replace(/\u0E31\u0E27([ก-ฮ])([\u0E48-\u0E4B])(?![ะาๅำ\u0E30-\u0E3A\u0E45])/g, '\u0E31$2\u0E27$1');
  // - Sara Ua without Mai Han-Akat (e.g. ชวย่ -> ช่วย, ดวย้ -> ด้วย)
  s = s.replace(/([ก-ฮ])\u0E27([ก-ฮ])([\u0E48-\u0E4B])(?![ะาๅำ\u0E30-\u0E3A\u0E45])/g, '$1$3\u0E27$2');
  // - Above vowel + Coda + Tone -> Above vowel + Tone + Coda (e.g. ปิง้ -> ปิ้ง, วิง่ -> วิ่ง, ดืม่ -> ดื่ม)
  s = s.replace(/([\u0E31\u0E34-\u0E37\u0E47])([ก-ฮ])([\u0E48-\u0E4B])(?![ะาๅำ\u0E30-\u0E3A\u0E45])/g, '$1$3$2');
  // - Below vowel + Coda + Tone -> Below vowel + Tone + Coda (e.g. กุง้ -> กุ้ง)
  s = s.replace(/([\u0E38\u0E39])([ก-ฮ])([\u0E48-\u0E4B])(?![ะาๅำ\u0E30-\u0E3A\u0E45])/g, '$1$3$2');
  // - Sara Aa + Coda + Tone -> Tone + Sara Aa + Coda (e.g. บาน้ -> บ้าน, ขาว้ -> ข้าว, ชาง้ -> ช้าง, หอง้ -> ห้อง)
  s = s.replace(/([ก-ฮ])\u0E32([ก-ฮ])([\u0E48-\u0E4B])(?![ะาๅำ\u0E30-\u0E3A\u0E45])/g, '$1$3\u0E32$2');
  // - Sara O (อ) + Coda + Tone -> Tone + Sara O + Coda (e.g. หอง้ -> ห้อง, รอน้ -> ร้อน, นอย้ -> น้อย, ตอง้ -> ต้อง)
  s = s.replace(/([ก-ฮ])\u0E2D([ก-ฮ])([\u0E48-\u0E4B])(?![ะาๅำ\u0E30-\u0E3A\u0E45])/g, '$1$3\u0E2D$2');
  // - Leading vowel (เ, แ, โ) + Initial + Coda + Tone -> Leading vowel + Initial + Tone + Coda (e.g. เลน่ -> เล่น, เชน่ -> เช่น)
  s = s.replace(/([\u0E40\u0E41\u0E42])([ก-ฮ])([ก-ฮ])([\u0E48-\u0E4B])(?![ะาๅำ\u0E30-\u0E3A\u0E45])/g, '$1$2$4$3');

  // 8. Reorder tone mark between consonants in known consonant cluster / Aksorn Nam
  // e.g. ก + ้ + ล + ว + ย -> ก + ล + ้ + ว + ย (กล้วย)
  // e.g. ใ + ห + ่ + ม -> ใ + ห + ม + ่ (ใหม่)
  s = s.replace(/([ก-ฮ])([\u0E48-\u0E4B])([ก-ฮ])/g, (match, c1, tone, c2) => {
    if (CLUSTER_PAIRS.has(c1 + c2)) {
      return c1 + c2 + tone;
    }
    return match;
  });

  // 9. Tone mark before upper/lower vowels: Tone Mark + Vowel -> Vowel + Tone Mark
  // e.g. ผู้ -> ผู้, ป้ี -> ปี้, ปุ่ม -> ปุ่ม
  s = s.replace(/([\u0E48-\u0E4B])([\u0E31\u0E34-\u0E3A\u0E47])/g, '$2$1');

  // 10. Karan (\u0E4C) after upper/lower vowels: Karan + Vowel -> Vowel + Karan
  // e.g. ธิ์ vs ธ์ิ, ธุ์ vs ธ์ุ
  s = s.replace(/\u0E4C([\u0E31\u0E34-\u0E3A])/g, '$1\u0E4C');

  // 11. Reorder Tone Mark and Karan: Karan + Tone Mark -> Tone Mark + Karan
  s = s.replace(/\u0E4C([\u0E48-\u0E4B])/g, '$1\u0E4C');

  return s.trim();
}

/**
 * Canonicalizes Thai text for robust equality comparison.
 * Strips whitespace, hyphens, punctuation, and applies full Thai keystroke canonicalization.
 */
export function canonicalizeThaiString(str: string): string {
  if (!str) return '';
  return canonicalizeThaiScript(str, false);
}

/**
 * Splits arbitrary Thai text into phonetic syllable chunks
 */
export function splitThaiIntoSyllables(text: string): string[] {
  const syllables: string[] = [];
  const normalizedText = canonicalizeThaiScript(text, true);
  const chars = Array.from(normalizedText);
  let i = 0;

  const isLeadingVowel = (c: string) => /[เแโใไ]/.test(c);
  const isConsonant = (c: string) => /[ก-ฮฤฦ]/.test(c);
  const isVowelOrTone = (c: string) => /[ิีึืุูั็่้๊๋ะาำๅ]/.test(c);

  while (i < chars.length) {
    if (chars[i] === ' ') {
      i++;
      continue;
    }

    // Handle Thai repetition sign (ไม้ยมก ๆ) by repeating the previous syllable
    if (chars[i] === 'ๆ') {
      if (syllables.length > 0) {
        syllables.push(syllables[syllables.length - 1]);
      }
      i++;
      continue;
    }

    // Handle Thai abbreviation sign (ไปยาลน้อย ฯ)
    if (chars[i] === 'ฯ') {
      i++;
      continue;
    }

    const start = i;
    let end = i;

    // 1. Initial onset
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

    // 1.5 Handle Thai special vowel: Ro Han (ร หัน / รร) attached directly to initial consonant
    // e.g. ภรรยา (phan-rá-yaa), กรรไกร (gan-grai), กรรม (gam), ธรรม (tham), พรรค (phák)
    const hasLeadingVowelForInitial = isLeadingVowel(chars[start]);
    if (
      !hasLeadingVowelForInitial &&
      end + 1 < chars.length &&
      chars[end] === 'ร' &&
      chars[end + 1] === 'ร'
    ) {
      end += 2; // consume 'รร'

      // Check if an optional coda consonant belongs to this Ro Han syllable:
      if (end < chars.length && isConsonant(chars[end])) {
        const codaChar = chars[end];
        const afterCoda = end + 1 < chars.length ? chars[end + 1] : '';
        const codaHasVowel = isVowelOrTone(afterCoda) || isLeadingVowel(codaChar) || afterCoda === 'อ';
        if (!codaHasVowel) {
          end++; // consume coda consonant (e.g. ม in กรรม, ค in พรรค, ษ in ศตวรรษ)
        }
      }

      // Check for trailing silent letters with karan (e.g. ค์ in สวรรค์, ษณ์ in พรรณ)
      const remainingText = chars.slice(end).join('');
      const silentMatch = remainingText.match(/^(?:ทร์|ตร์|ศร์|ดร์|ษณ์|[ก-ฮ][ิุี]?์)/);
      if (silentMatch) {
        end += Array.from(silentMatch[0]).length;
      }

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

    while (end < chars.length) {
      const c = chars[end];
      if (c === 'ี') hasUpperI = true;
      if (c === 'ื') hasUpperUe = true;
      if (c === 'า') hasSaraAa = true;

      if (isVowelOrTone(c) || c === '์') {
        end++;
      } else if (
        (c === 'ย' && hasLeadingE && hasUpperI) || // sara ia (เ-ีย)
        (c === 'อ' && hasLeadingE && hasUpperUe) || // sara uea (เ-ือ)
        (c === 'ว' && !hasSaraAa && end + 1 < chars.length && isConsonant(chars[end + 1])) // sara ua (e.g. ร่วง)
      ) {
        end++;
      } else {
        break;
      }
    }

    // In Thai, syllables with open vowels (ะ, เ-ะ, แ-ะ, โ-ะ, เ-าะ, ไ-, ใ-, -ำ, เ-า) CANNOT have a coda!
    // Exception: Thai words like "ไทย" (thai) where final 'ย' is written after 'ไ'.
    const hasSaraAi = chars.slice(start, end).some((c) => c === 'ไ');
    if (hasSaraAi && end < chars.length && chars[end] === 'ย') {
      end++; // consume 'ย' as part of syllable "ไทย"
    }

    const cannotHaveCoda =
      chars.slice(start, end).some((c) => /[ใำะ]/.test(c)) ||
      (chars.slice(start, end).some((c) => c === 'ไ') && (!chars[end] || chars[end] !== 'ย')) ||
      (hasLeadingE && chars.slice(start, end).some((c) => c === 'า'));

    if (cannotHaveCoda) {
      const chunk = chars.slice(start, end).join('').trim();
      if (chunk) syllables.push(chunk);
      i = end;
      continue;
    }

    // Handle vowel Sara Aw (สระออ - อ) after initial consonant with or without tone mark:
    // e.g. ขอบ, ชอบ, บอก, สอน, นอน, ต้อน, ห้อง, น้อง, ร้อน
    const hasVowelSignSoFar = chars.slice(start, end).some((c) => isVowelOrTone(c) && !/^[่้๊๋]$/.test(c));
    if (!hasLeadingE && !hasVowelSignSoFar && end < chars.length && chars[end] === 'อ') {
      if (end + 1 < chars.length && isConsonant(chars[end + 1])) {
        const afterO = chars[end + 1];
        const afterAfterO = end + 2 < chars.length ? chars[end + 2] : '';
        const afterOHasVowel = isVowelOrTone(afterAfterO) || isLeadingVowel(afterO);
        const afterOIsCluster = CLUSTER_PAIRS.has(afterO + afterAfterO);
        if (!afterOHasVowel && !afterOIsCluster) {
          end++; // consume 'อ' as vowel
        }
      }
    }

    // Check if an explicit vowel sign is attached to this initial
    const hasExplicitVowel =
      isLeadingVowel(chars[start]) ||
      chars.slice(start, end).some((c) => isVowelOrTone(c) || c === 'อ' || c === 'ว');

    // 3. Optional: Final consonant (coda) or classical Sanskrit/Pali coda
    if (end < chars.length && isConsonant(chars[end])) {
      const remainingCodaSlice = chars.slice(end).join('');
      const isClassicalSanskritCoda = hasExplicitVowel && /^(?:ตร|ทร|ชร|กร|คร)(?![เแโใไาิีึืุูะั็่้๊๋])/.test(remainingCodaSlice);
      const isSilentVowelStopCoda = hasExplicitVowel && /^(?:ติ|ตุ|ธิ)(?![เแโใไาิีึืุูะั็่้๊๋])/.test(remainingCodaSlice);

      if (isClassicalSanskritCoda || isSilentVowelStopCoda) {
        end += 2;
        const chunk = chars.slice(start, end).join('').trim();
        if (chunk) syllables.push(chunk);
        i = end;
        continue;
      }

      const nextChar = chars[end];
      const afterNext = end + 1 < chars.length ? chars[end + 1] : '';

      // In Thai orthography, syllables with Mai Han-Akat (ั) or Maitaikhu (็) CANNOT be open!
      // They strictly require a final coda consonant. Therefore nextChar MUST be their coda!
      const hasMandatoryCoda = chars.slice(start, end).some((c) => c === 'ั' || c === '็');

      // A syllable can only be Sara Aw (สระออ - C1 + อ + C2, e.g. ชอบ, นอน, ตอบ, ของ) if:
      // 1. Current syllable does NOT strictly require a coda (ั or ็ MUST have a coda)
      // 2. afterNext is 'อ'
      // 3. chars[end + 2] is a consonant (C2)
      // 4. 'อ' + C2 does NOT form an onset cluster like 'อย' (in อยู่, อย่า, อย่าง, อยาก)
      // 5. C2 does not have an attached vowel or tone mark (e.g. ู in อยู่)
      // 6. C2 is a recognized Thai final consonant
      const thirdChar = end + 2 < chars.length ? chars[end + 2] : '';
      const fourthChar = end + 3 < chars.length ? chars[end + 3] : '';
      const thirdCharHasVowelOrTone = isVowelOrTone(fourthChar) || fourthChar === '์';
      const afterNextIsSaraAw =
        !hasMandatoryCoda &&
        afterNext === 'อ' &&
        end + 2 < chars.length &&
        isConsonant(thirdChar) &&
        !CLUSTER_PAIRS.has(afterNext + thirdChar) &&
        !thirdCharHasVowelOrTone &&
        Boolean(FINAL_CONSONANTS[thirdChar]);

      const nextHasVowel = isVowelOrTone(afterNext) || isLeadingVowel(nextChar) || afterNextIsSaraAw;

      // If nextChar + afterNext forms an onset cluster (e.g. คร in ครับ, ปร in โปรด), nextChar cannot be coda!
      const nextIsCluster = !hasMandatoryCoda && CLUSTER_PAIRS.has(nextChar + afterNext);

      const afterIsSilentTail = /^(?:ทร์|ตร์|ศร์|ดร์|ษณ์|[ก-ฮ][ิุี]?์)/.test(chars.slice(end + 1).join(''));

      // Does afterNext have its own attached vowel, leading vowel, or form an onset cluster starting a new syllable?
      const afterNextHasItsOwnVowel = (() => {
        if (end + 1 >= chars.length) return false;
        if (isLeadingVowel(afterNext)) return true;
        const nextOfAfter = end + 2 < chars.length ? chars[end + 2] : '';
        return isVowelOrTone(nextOfAfter) || nextOfAfter === 'อ' || CLUSTER_PAIRS.has(afterNext + nextOfAfter);
      })();

      // If current syllable has NO explicit vowel sign, and nextChar is followed by another consonant (e.g. ขนม, ถนน, ระบบ, สงบ, ตลก),
      // and afterNext does NOT have its own vowel, then nextChar is the ONSET of the next syllable (e.g. ข + นม), NOT the coda!
      const isNextOnsetOfConsonantPair =
        !hasExplicitVowel &&
        isConsonant(afterNext) &&
        !CLUSTER_PAIRS.has(chars[start] + nextChar) &&
        !afterIsSilentTail &&
        !afterNextHasItsOwnVowel;

      // If nextChar and afterNext form a standalone closed 2-consonant syllable (e.g. รถ in สถานีรถไฟ, ชม in สีชมพู, ขน in สถานีขนส่ง):
      const isNextTwoConsonantsAClosedSyllable = (() => {
        if (hasMandatoryCoda) return false;
        if (!isConsonant(nextChar) || !isConsonant(afterNext)) return false;
        if (!FINAL_CONSONANTS[afterNext]) return false;
        if (CLUSTER_PAIRS.has(nextChar + afterNext)) return false;
        // In native Thai 2C inherent /o/ words, codas must be from standard stops/nasals [งนมดบกยวลร]
        if (!/^[งนมดบกยวลร]$/.test(afterNext)) return false;
        // Initial consonant 'ง' is never followed by another stop without written vowel
        if (nextChar === 'ง') return false;
        if (end + 2 >= chars.length) return true;
        const thirdChar = chars[end + 2];
        if (CLUSTER_PAIRS.has(afterNext + thirdChar)) return false;
        if (isLeadingVowel(thirdChar)) return true;
        if (isConsonant(thirdChar)) {
          const fourthChar = end + 3 < chars.length ? chars[end + 3] : '';
          if (isVowelOrTone(fourthChar) || fourthChar === 'อ') return true;
          if (CLUSTER_PAIRS.has(thirdChar + fourthChar)) return true;
        }
        return false;
      })();

      if (
        hasMandatoryCoda ||
        (!nextHasVowel && !isNextOnsetOfConsonantPair && !nextIsCluster && !isNextTwoConsonantsAClosedSyllable)
      ) {
        end++;
        // consume trailing tone/karan if any
        while (end < chars.length && (isVowelOrTone(chars[end]) || chars[end] === '์')) {
          end++;
        }
      }
    }

    // Check for trailing silent letters with karan (e.g. จันทร์ -> ทร์, ศาสตร์ -> ตร์, ศักดิ์ -> ดิ์, พันธุ์ -> ธุ์, ภาพยนตร์ -> ตร์)
    const remainingText = chars.slice(end).join('');
    const silentMatch = remainingText.match(/^(?:ทร์|ตร์|ศร์|ดร์|ษณ์|[ก-ฮ][ิุี]?์)/);
    if (silentMatch) {
      end += Array.from(silentMatch[0]).length;
    }

    const chunk = chars.slice(start, end).join('').trim();
    if (chunk) syllables.push(chunk);
    i = end;
  }

  return syllables;
}

export interface ParsedThaiSyllable {
  roman: string;
  tone: ThaiTone;
  initial: string;
  initialChar: string;
  initialClass: 'high' | 'mid' | 'low';
  toneMark: 'mai_ek' | 'mai_tho' | 'mai_tri' | 'mai_chattawa' | null;
  isDead: boolean;
  isLong: boolean;
  vowel: string;
  finalCons: string;
}

/**
 * Parses an individual Thai syllable based on phonetic rules
 */
export function parseThaiSyllable(raw: string): ParsedThaiSyllable {
  const emptyResult: ParsedThaiSyllable = {
    roman: '',
    tone: 'mid',
    initial: '',
    initialChar: '',
    initialClass: 'mid',
    toneMark: null,
    isDead: false,
    isLong: true,
    vowel: '',
    finalCons: '',
  };

  // If no Thai character exists, return empty
  if (!/[ก-๙]/.test(raw)) {
    return emptyResult;
  }

  // Strip silent consonant + karan (e.g. ร์, ท์, ส์, ล์, or double silent consonants like ทร์, ตร์, ศร์, ษณ์)
  let s = raw
    .replace(/(?:ทร์|ตร์|ศร์|ดร์|ษณ์|[ก-ฮ][ิุี]?์)/g, '')
    .replace(/์/g, '')
    .trim();
  if (!s) return emptyResult;

  // Classical Sanskrit/Pali rules:
  // 1. Silent trailing 'ร' without karan: -ตร, -ทร, -ชร, -กร, -คร (e.g. บัตร -> บัต, สูตร -> สูต, เพชร -> เพช, จักร -> จัก, เนตร -> เนต)
  if (s.length >= 3 && /(?<=[เแโ][ก-ฮ]|[ก-ฮ][าีืูัิุ])([ตชกคท])ร$/.test(s)) {
    s = s.replace(/(?<=[เแโ][ก-ฮ]|[ก-ฮ][าีืูัิุ])([ตชกคท])ร$/, '$1');
  }
  // 2. Silent trailing vowel marks on final stops: -ติ, -ตุ, -ธิ (e.g. ชาติ -> ชาต, ญาติ -> ญาต, เหตุ -> เหต, ธาตุ -> ธาต)
  if (s.length >= 3 && /(?<=[เแโ][ก-ฮ]|[ก-ฮ][าีืูั])[ตทธ][ิุ]$/.test(s)) {
    s = s.replace(/(?<=[เแโ][ก-ฮ]|[ก-ฮ][าีืูั])([ตทธ])[ิุ]$/, '$1');
  }

  // Explicit handling for Thai numerals (๐-๙)
  if (/^[๐-๙]$/.test(s)) {
    const digitMap: Record<string, ParsedThaiSyllable> = {
      '๐': { roman: 'sŭun', tone: 'rising', initial: 's', initialChar: 'ส', initialClass: 'high', toneMark: null, isDead: false, isLong: true, vowel: 'oo', finalCons: 'n' },
      '๑': { roman: 'nùeng', tone: 'low', initial: 'n', initialChar: 'หน', initialClass: 'high', toneMark: 'mai_ek', isDead: false, isLong: false, vowel: 'ue', finalCons: 'ng' },
      '๒': { roman: 'săawng', tone: 'rising', initial: 's', initialChar: 'ส', initialClass: 'high', toneMark: null, isDead: false, isLong: true, vowel: 'or', finalCons: 'ng' },
      '๓': { roman: 'săam', tone: 'rising', initial: 's', initialChar: 'ส', initialClass: 'high', toneMark: null, isDead: false, isLong: true, vowel: 'aa', finalCons: 'm' },
      '๔': { roman: 'sèe', tone: 'low', initial: 's', initialChar: 'ส', initialClass: 'high', toneMark: 'mai_ek', isDead: false, isLong: true, vowel: 'ee', finalCons: '' },
      '๕': { roman: 'hâa', tone: 'falling', initial: 'h', initialChar: 'ห', initialClass: 'high', toneMark: 'mai_tho', isDead: false, isLong: true, vowel: 'aa', finalCons: '' },
      '๖': { roman: 'hòk', tone: 'low', initial: 'h', initialChar: 'ห', initialClass: 'high', toneMark: null, isDead: true, isLong: false, vowel: 'o', finalCons: 'k' },
      '๗': { roman: 'jèt', tone: 'low', initial: 'j', initialChar: 'จ', initialClass: 'mid', toneMark: null, isDead: true, isLong: false, vowel: 'e', finalCons: 't' },
      '๘': { roman: 'bpàaet', tone: 'low', initial: 'bp', initialChar: 'ป', initialClass: 'mid', toneMark: null, isDead: true, isLong: true, vowel: 'aae', finalCons: 't' },
      '๙': { roman: 'gâao', tone: 'falling', initial: 'g', initialChar: 'ก', initialClass: 'mid', toneMark: 'mai_tho', isDead: false, isLong: true, vowel: 'ao', finalCons: '' },
    };
    return digitMap[s] || emptyResult;
  }

  // Explicit handling for high-frequency irregular particle/conjunction ก็ (gô̜)
  if (s === 'ก็') {
    return {
      roman: 'gô̜',
      tone: 'falling',
      initial: 'g',
      initialChar: 'ก',
      initialClass: 'mid',
      toneMark: null,
      isDead: true,
      isLong: false,
      vowel: 'aw',
      finalCons: '',
    };
  }

  // Explicit handling for isolated double Ro (รร)
  if (s === 'รร') {
    return {
      roman: 'ran',
      tone: 'mid',
      initial: 'r',
      initialChar: 'ร',
      initialClass: 'low',
      toneMark: null,
      isDead: false,
      isLong: false,
      vowel: 'a',
      finalCons: 'n',
    };
  }

  // Explicit handling for vocalic ฤ (ru / rue) and ฦ (lu)
  if (s.startsWith('ฤๅ') || s.startsWith('ฦๅ')) {
    const isRu = s.startsWith('ฤ');
    return {
      roman: isRu ? 'rue' : 'lue',
      tone: 'mid',
      initial: isRu ? 'r' : 'l',
      initialChar: isRu ? 'ฤ' : 'ฦ',
      initialClass: 'low',
      toneMark: null,
      isDead: false,
      isLong: true,
      vowel: 'ue',
      finalCons: '',
    };
  }
  if (s === 'ฤ' || s === 'ฦ') {
    const isRu = s === 'ฤ';
    const base = isRu ? 'rue' : 'lue';
    return {
      roman: applyToneToSyllable(base, 'high'),
      tone: 'high',
      initial: isRu ? 'r' : 'l',
      initialChar: isRu ? 'ฤ' : 'ฦ',
      initialClass: 'low',
      toneMark: null,
      isDead: true,
      isLong: false,
      vowel: 'ue',
      finalCons: '',
    };
  }
  if (s.startsWith('ฤ')) {
    if (s.includes('ก')) {
      return {
        roman: applyToneToSyllable('roek', 'falling'),
        tone: 'falling',
        initial: 'r',
        initialChar: 'ฤ',
        initialClass: 'low',
        toneMark: null,
        isDead: true,
        isLong: true,
        vowel: 'oe',
        finalCons: 'k',
      };
    }
    if (s.includes('ท') || s.includes('ต') || s.includes('ษ')) {
      return {
        roman: applyToneToSyllable('rit', 'high'),
        tone: 'high',
        initial: 'r',
        initialChar: 'ฤ',
        initialClass: 'low',
        toneMark: null,
        isDead: true,
        isLong: false,
        vowel: 'i',
        finalCons: 't',
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
  let initialChar = '';
  let initialClass: 'high' | 'mid' | 'low' = 'mid';

  // Check cluster first
  const twoChar = s.substring(0, 2);
  const remainingAfterTwo = s.substring(2);
  const isClusterWithW = twoChar === 'กว' || twoChar === 'ขว' || twoChar === 'คว';
  // If twoChar is กว/ขว/คว, it is only a cluster if preceded by a leading vowel or followed by an explicit vowel sign (e.g. กวาง, ขวาน, ความ, ควัน, แขวน, เกวียน).
  // If followed directly by a final consonant with no vowel sign (e.g. ขวด, กวน, ควร), 'ว' is the vowel Sara Ua!
  const isWFollowedByVowel = leadingVowel !== '' || /[าัิีึืุูะ็]/.test(remainingAfterTwo);

  // If syllable is exactly 2 consonants without any vowel signs (e.g. ผล, พร, ศร, คน, รถ, ผม), the 2nd consonant is a CODA, NOT a cluster!
  const isTwoLetterWordWithoutVowel = s.length === 2 && leadingVowel === '';

  if (
    !isTwoLetterWordWithoutVowel &&
    s.length >= 2 &&
    !/[ิีึืั็ุู]/.test(s[0]) &&
    CLUSTERS[twoChar] &&
    (!isClusterWithW || isWFollowedByVowel)
  ) {
    const cl = CLUSTERS[twoChar];
    initial = cl.roman;
    initialClass = cl.class;
    initialChar = twoChar;
    s = s.substring(2);
  } else if (s.length >= 1 && INITIAL_CONSONANTS[s[0]] !== undefined) {
    const c = s[0];
    initial = INITIAL_CONSONANTS[c];
    initialChar = c;
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
  if (s.startsWith('รร')) {
    const afterRoHan = s.substring(2);
    if (afterRoHan.length === 0) {
      // Ro Han without coda: represents sound -an (อัน), live syllable ending in sonorant /n/
      vowel = 'a';
      finalCons = 'n';
      isDead = false;
      isLong = false;
      s = '';
    } else {
      // Ro Han with coda: short vowel -a- followed by that coda consonant (e.g. กรรม, ธรรม, พรรค, วรรค)
      vowel = 'a';
      isLong = false;
      s = afterRoHan;
      // remaining characters in s will be parsed by final consonant logic below
    }
  } else if (leadingVowel === 'เ' && s.includes('ื') && (s.includes('อ') || s.includes('ะ'))) {
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
  } else if (leadingVowel === 'เ' && (s === 'ย' || (s.endsWith('ย') && !s.includes('ี') && !s.includes('ื') && !s.includes('ะ') && !s.includes('า')))) {
    // สระเออ ลดรูปเมื่อสะกดด้วย ย (เคย, เลย, เนย, เตย, เฉย, เผย, เชย, เงย, เกย)
    vowel = 'oe';
    isLong = true;
    isDead = false;
  } else if (leadingVowel === 'เ' && (s.includes('ะ') || s.includes('็'))) {
    vowel = 'e';
    isLong = false;
    isDead = s.includes('ะ');
    s = s.replace(/[ะ็]/g, '');
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
    // In Thai words like "ไทย" (thai) or "ไชย" (chai), final 'ย' is silent:
    if (s.endsWith('ย')) {
      s = s.slice(0, -1);
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
    // Inherent short /o/ between two consonants (คน, รถ, ผม) or /or/ with final ร (พร, ศร, กร)
    if (s === 'ร') {
      vowel = 'or';
      isLong = true;
    } else {
      vowel = 'o';
      isLong = false;
    }
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
    initial,
    initialChar: initialChar || initial,
    initialClass,
    toneMark,
    isDead,
    isLong,
    vowel,
    finalCons,
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

      // Handle Thai repetition sign (ไม้ยมก ๆ)
      if (clean[i] === 'ๆ') {
        if (words.length > 0) {
          words.push(words[words.length - 1]);
        }
        i++;
        continue;
      }

      // Handle Thai abbreviation sign (ไปยาลน้อย ฯ)
      if (clean[i] === 'ฯ') {
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
  const clean = thaiText.trim();
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

/**
 * Resolves the cleanest, canonical romanization for a word:
 * - Fixes previously stored bugged artifacts (e.g. 'phá-rorn-yaa' -> 'phan-rá-yaa')
 * - Prefers curated dictionary mappings
 * - Falls back to dynamic generation from Thai script
 */
export function getEffectiveRomanization(thai?: string, romanization?: string): string {
  const cleanThai = thai ? canonicalizeThaiScript(thai.trim(), true) : '';
  const cleanRom = romanization?.trim() || '';

  // Auto-correct previously generated corrupted romanizations:
  // 1. Ro Han artifact: 'phá-rorn-yaa' -> 'phan-rá-yaa' or any 'rorn'
  // 2. วัด / coda split artifact before อยู่: 'wá-dà-yòo-glâi' or 'wá-dà-'
  if (
    cleanRom.includes('rorn') ||
    cleanRom === 'phá-rorn-yaa' ||
    cleanRom.includes('wá-dà-') ||
    cleanRom === 'wá-dà-yòo-glâi'
  ) {
    if (cleanThai && THAI_DICTIONARY[cleanThai]) {
      return THAI_DICTIONARY[cleanThai];
    }
    if (cleanThai) {
      return generateRomanizationFromThai(cleanThai).romanization;
    }
    return cleanRom
      .replace(/phá-rorn-yaa/g, 'phan-rá-yaa')
      .replace(/rorn/g, 'ran')
      .replace(/wá-dà-/g, 'wát-');
  }

  if (cleanThai && THAI_DICTIONARY[cleanThai]) {
    // If dictionary has exact match and stored romanization was empty or matches legacy generation
    if (!cleanRom || cleanRom === 'phá-rorn-yaa' || cleanRom.includes('wá-dà-')) {
      return THAI_DICTIONARY[cleanThai];
    }
  }

  if (cleanRom) return cleanRom;
  if (cleanThai) return generateRomanizationFromThai(cleanThai).romanization;
  return '';
}
