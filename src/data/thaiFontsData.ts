// Data and definitions for Thai Font Trainer (Classic Looped vs Modern Loopless)
import { THAI_CONSONANTS, ConsonantClass } from './thaiAlphabet';

export type FontCategoryId = 'classic' | 'modern';
export type ThaiFontId = 'sarabun' | 'noto_serif' | 'kanit' | 'prompt' | 'mitr';

export interface ThaiFontInfo {
  id: ThaiFontId;
  name: string;
  category: FontCategoryId;
  thaiLabel: string;
  description: string;
  fontClass: string;
  popularUsage: string;
}

export const THAI_FONTS: Record<ThaiFontId, ThaiFontInfo> = {
  sarabun: {
    id: 'sarabun',
    name: 'Sarabun',
    thaiLabel: 'สารบรรณ',
    category: 'classic',
    description: 'Offizieller thailändischer Regierungs- & Schriftstandard mit deutlichen Kringelköpfen (มีหัว).',
    fontClass: 'font-thai-classic',
    popularUsage: 'Behörden, Zeitungen, Verträge, Lehrbücher',
  },
  noto_serif: {
    id: 'noto_serif',
    name: 'Noto Serif Thai',
    thaiLabel: 'โนโตะ เซอริฟ',
    category: 'classic',
    description: 'Traditioneller thailändischer Buch- und Druckstil mit Kringelköpfen und dezenten Serifen.',
    fontClass: 'font-thai-serif',
    popularUsage: 'Literatur, historische Werke, formelle Einladungen',
  },
  kanit: {
    id: 'kanit',
    name: 'Kanit',
    thaiLabel: 'คณิต',
    category: 'modern',
    description: 'Der bekannteste moderne loopless Font Thailands (ไม่มีหัว). Kraftvoll, klar und urban.',
    fontClass: 'font-thai-kanit',
    popularUsage: 'BTS Skytrain, MRT, Werbetafeln, Markenlogos, Einkaufszentren',
  },
  prompt: {
    id: 'prompt',
    name: 'Prompt',
    thaiLabel: 'พร้อม',
    category: 'modern',
    description: 'Geometrische, ultra-saubere serifenlose Schrift ohne Kringel. Elegant und digital.',
    fontClass: 'font-thai-prompt',
    popularUsage: 'Apps, Start-ups, Lifestyle-Magazine, moderne Websites',
  },
  mitr: {
    id: 'mitr',
    name: 'Mitr',
    thaiLabel: 'มิตร',
    category: 'modern',
    description: 'Sanft abgerundete, freundliche serifenlose Schrift („Mitr“ bedeutet Freund).',
    fontClass: 'font-thai-mitr',
    popularUsage: 'Cafés, Bäckereien, Restaurantmenüs, Social Media',
  },
};

export interface TrickyPair {
  id: string;
  title: string;
  letterA: string;
  nameA: string;
  soundA: string;
  letterB: string;
  nameB: string;
  soundB: string;
  whyConfusing: string;
  clueA: string;
  clueB: string;
  latinLookalikeA?: string;
  latinLookalikeB?: string;
  examplesA: { thai: string; rom: string; de: string }[];
  examplesB: { thai: string; rom: string; de: string }[];
}

export const TRICKY_PAIRS: TrickyPair[] = [
  {
    id: 'do_dek_vs_kho_khwai',
    title: 'ด (Do Dek) vs ค (Kho Khwai)',
    letterA: 'ด',
    nameA: 'ด เด็ก (dɔɔ dèk)',
    soundA: 'd (Initial) / t (Final)',
    letterB: 'ค',
    nameB: 'ค ควาย (khɔɔ khwaai)',
    soundB: 'kh (Initial) / k (Final)',
    whyConfusing: 'Im Klassischen verrät der Kringelkopf die Richtung (ด = Kringel innen links, ค = außen links). Im modernen Design entfallen die Kringel vollständig!',
    clueA: 'Modernes ด: Hat oft einen Knick oder eine Einbuchtung nach innen. Erinnert stark an ein lateinisches Kleinbuchstaben-„d“ oder „n“ mit Einzug.',
    clueB: 'Modernes ค: Öffnet sich bogenförmig nach außen/unten wie ein lateinisches „c“ oder umgedrehtes „u“ ohne Innenknick.',
    latinLookalikeA: 'd / n',
    latinLookalikeB: 'c / u (umgekehrt)',
    examplesA: [
      { thai: 'เดิน', rom: 'doen', de: 'gehen / laufen' },
      { thai: 'เด็ก', rom: 'dek', de: 'Kind' },
      { thai: 'ดี', rom: 'dee', de: 'gut' },
    ],
    examplesB: [
      { thai: 'คน', rom: 'khon', de: 'Mensch / Person' },
      { thai: 'คิด', rom: 'khit', de: 'denken' },
      { thai: 'ความรัก', rom: 'khwam-rak', de: 'Liebe' },
    ],
  },
  {
    id: 'no_nu_vs_mo_ma',
    title: 'น (No Nu) vs ม (Mo Ma)',
    letterA: 'น',
    nameA: 'น หนู (nɔɔ nǔu)',
    soundA: 'n (Initial) / n (Final)',
    letterB: 'ม',
    nameB: 'ม ม้า (mɔɔ máa)',
    soundB: 'm (Initial) / m (Final)',
    whyConfusing: 'Beide Buchstaben verlieren im Modernen die typische kleine Kringelschlaufe. Der feine Unterschied liegt rein in der Position der Ecke!',
    clueA: 'Modernes น: Die Schleife wird zu einer scharfen Kante/Ecke RECHTS unten.',
    clueB: 'Modernes ม: Die Schlaufe sitzt LINKS unten. Wirkt oft wie ein schmales lateinisches „u“ mit linker Ausbuchtung.',
    latinLookalikeA: 'u mit Ecke rechts',
    latinLookalikeB: 'u mit Sporn links',
    examplesA: [
      { thai: 'น้ำ', rom: 'naam', de: 'Wasser' },
      { thai: 'นี่', rom: 'nee', de: 'hier / dies' },
      { thai: 'นอน', rom: 'nawn', de: 'schlafen' },
    ],
    examplesB: [
      { thai: 'มา', rom: 'maa', de: 'kommen' },
      { thai: 'มี', rom: 'mee', de: 'haben' },
      { thai: 'มาก', rom: 'maak', de: 'sehr / viel' },
    ],
  },
  {
    id: 'bo_baimai_vs_po_pla',
    title: 'บ (Bo Baimai) vs ป (Po Pla)',
    letterA: 'บ',
    nameA: 'บ ใบไม้ (bɔɔ bai-mái)',
    soundA: 'b (Initial) / p (Final)',
    letterB: 'ป',
    nameB: 'ป ปลา (bpɔɔ bplaa)',
    soundB: 'bp (Initial) / p (Final)',
    whyConfusing: 'Modernes บ sieht für westliche Augen fast 1:1 wie ein lateinisches „u“ aus! ป ist das gleiche Zeichen, aber mit langem Schwanz nach oben.',
    clueA: 'Modernes บ: Schlichtes, symmetrisches „u“ – beide senkrechten Schenkel enden auf exakt gleicher Höhe.',
    clueB: 'Modernes ป: Der rechte Schenkel ragt deutlich über die Oberkante der Zeile hinaus.',
    latinLookalikeA: 'u',
    latinLookalikeB: 'u mit Hochstrich',
    examplesA: [
      { thai: 'บ้าน', rom: 'baan', de: 'Haus' },
      { thai: 'บอก', rom: 'bawk', de: 'sagen / mitteilen' },
      { thai: 'บาท', rom: 'baat', de: 'Baht (Währung)' },
    ],
    examplesB: [
      { thai: 'ไป', rom: 'bpai', de: 'gehen' },
      { thai: 'เปิด', rom: 'bpoet', de: 'öffnen / offen' },
      { thai: 'ปลา', rom: 'bplaa', de: 'Fisch' },
    ],
  },
  {
    id: 'ro_ruea_vs_wo_waen',
    title: 'ร (Ro Ruea) vs ว (Wo Waen)',
    letterA: 'ร',
    nameA: 'ร เรือ (rɔɔ rʉa)',
    soundA: 'r (Initial) / n (Final)',
    letterB: 'ว',
    nameB: 'ว แหวน (wɔɔ wɛ̌ɛn)',
    soundB: 'w (Initial) / w (Final)',
    whyConfusing: 'Der absolute Schock für viele Thailand-Reisende: Modernes ร sieht fast genauso aus wie ein lateinisches „s“!',
    clueA: 'Modernes ร: Schwungvoller S-förmiger Bogen (wie lateinisches „s“ oder kleines Schreibschrift-„r“).',
    clueB: 'Modernes ว: Ähnelt einem lateinischen „o“ oder einem seitlich offenen „c“ ohne oberen Gegenschwung.',
    latinLookalikeA: 's / r',
    latinLookalikeB: 'o / c',
    examplesA: [
      { thai: 'รถ', rom: 'rot', de: 'Auto / Fahrzeug' },
      { thai: 'เร็ว', rom: 'reo', de: 'schnell' },
      { thai: 'รัก', rom: 'rak', de: 'lieben' },
    ],
    examplesB: [
      { thai: 'วัน', rom: 'wan', de: 'Tag' },
      { thai: 'ว่า', rom: 'waa', de: 'dass / sagen' },
      { thai: 'หวาน', rom: 'waan', de: 'süß' },
    ],
  },
  {
    id: 'pho_phueng_vs_pho_phan',
    title: 'ผ/ฝ (Kurzzacke) vs พ/ฟ (Langzacke)',
    letterA: 'ผ / ฝ',
    nameA: 'ผ ผึ้ง (ph) & ฝ ฝา (f)',
    soundA: 'Hohe Klasse (ผ = ph, ฝ = f)',
    letterB: 'พ / ฟ',
    nameB: 'พ พาน (ph) & ฟ ฟัน (f)',
    soundB: 'Tiefe Klasse (พ = ph, ฟ = f)',
    whyConfusing: 'Im Klassischen unterscheidet der Kringelkopf (Innenkopf = ผ/ฝ vs Außenkopf = พ/ฟ). Im Modernen entscheidet NUR die Höhe der Mittelzacke!',
    clueA: 'Modernes ผ / ฝ: Die mittlere Zacke reicht nur bis zur HALBEN Höhe des Buchstabens.',
    clueB: 'Modernes พ / ฟ: Die mittlere Zacke geht ganz nach OBEN bis auf die volle Zeilenhöhe (wie ein echtes lateinisches „W“).',
    latinLookalikeA: 'W mit flacher Mitte',
    latinLookalikeB: 'W mit voller Spitze',
    examplesA: [
      { thai: 'เผ็ด', rom: 'phet', de: 'scharf' },
      { thai: 'ฝน', rom: 'fon', de: 'Regen' },
      { thai: 'ผู้ชาย', rom: 'phu-chai', de: 'Mann' },
    ],
    examplesB: [
      { thai: 'พูด', rom: 'phuut', de: 'sprechen' },
      { thai: 'พี่', rom: 'phee', de: 'ältere(r) Bruder/Schwester' },
      { thai: 'ฟ้า', rom: 'faa', de: 'Himmel / blau' },
    ],
  },
  {
    id: 'kho_khai_vs_cho_chang',
    title: 'ข (Kho Khai) vs ช (Cho Chang)',
    letterA: 'ข',
    nameA: 'ข ไข่ (khɔ̌ɔ khài)',
    soundA: 'kh (Hohe Klasse)',
    letterB: 'ช',
    nameB: 'ช ช้าง (chɔɔ cháang)',
    soundB: 'ch (Tiefe Klasse)',
    whyConfusing: 'Beide wirken modern wie schmale U-Bögen. Schau auf die obere Kante!',
    clueA: 'Modernes ข: Glatter, geschwungener Bogen ohne Fortsatz oben.',
    clueB: 'Modernes ช: Besitzt an der oberen rechten Biegung einen markanten, schrägen Zacken/Sporn („Schwänzchen“).',
    latinLookalikeA: 'u / c',
    latinLookalikeB: 'u mit Sporn oben',
    examplesA: [
      { thai: 'ขอบคุณ', rom: 'khop-khun', de: 'Danke' },
      { thai: 'ข้าว', rom: 'khao', de: 'Reis / Essen' },
      { thai: 'ขอ', rom: 'khaw', de: 'bitten / möchten' },
    ],
    examplesB: [
      { thai: 'ชอบ', rom: 'chawp', de: 'mögen / gefallen' },
      { thai: 'ชานชาลา', rom: 'chan-cha-la', de: 'Bahnsteig' },
      { thai: 'ช่วย', rom: 'chuai', de: 'helfen' },
    ],
  },
  {
    id: 'tho_thung_vs_pho_samphao_vs_ko_kai',
    title: 'ถ (Tho Thung) vs ภ (Pho Samphao) vs ก (Ko Kai)',
    letterA: 'ถ',
    nameA: 'ถ ถุง (thɔ̌ɔ thǔng)',
    soundA: 'th (Hohe Klasse)',
    letterB: 'ภ',
    nameB: 'ภ สำเภา (phɔɔ sǎm-phao)',
    soundB: 'ph (Tiefe Klasse)',
    whyConfusing: 'ก hat von Natur aus keinen Kringel. Wenn ถ und ภ modernisiert werden, sehen alle drei auf den ersten Blick wie ein Hühnerschnabel aus!',
    clueA: 'Modernes ถ: Die obere Linie knickt nach INNEN in den Buchstaben hinein.',
    clueB: 'Modernes ภ: Der obere Bogen wölbt sich nach AUSSEN (wie eine kleine Haube oder Dach).',
    latinLookalikeA: 'n mit Innenbucht',
    latinLookalikeB: 'n mit Außenwölbung',
    examplesA: [
      { thai: 'ถูก', rom: 'thuuk', de: 'billig / korrekt' },
      { thai: 'ถนน', rom: 'tha-non', de: 'Straße' },
    ],
    examplesB: [
      { thai: 'ภาพ', rom: 'phaap', de: 'Bild / Foto' },
      { thai: 'ภาษา', rom: 'phaa-saa', de: 'Sprache' },
    ],
  },
  {
    id: 'tho_thahan_vs_ho_hip',
    title: 'ท (Tho Thahan) vs ห (Ho Hip)',
    letterA: 'ท',
    nameA: 'ท ทหาร (thɔɔ tha-hǎan)',
    soundA: 'th (Tiefe Klasse)',
    letterB: 'ห',
    nameB: 'ห หีบ (hɔ̌ɔ hìip)',
    soundB: 'h (Hohe Klasse)',
    whyConfusing: 'ท sieht im modernen Design oft wie ein lateinisches Kleinbuchstaben-„n“ oder „h“ aus.',
    clueA: 'Modernes ท: Beginnt mit geradem Abstrich links, geht in einen simplen Rundbogen nach rechts über.',
    clueB: 'Modernes ห: Sieht aus wie zwei Striche mit einer Diagonale oder Schlaufe im oberen rechten Bereich.',
    latinLookalikeA: 'n / h',
    latinLookalikeB: 'H mit Kreuzung',
    examplesA: [
      { thai: 'ที่', rom: 'thee', de: 'bei / an / wo' },
      { thai: 'ทำ', rom: 'tham', de: 'machen / tun' },
      { thai: 'ทางออก', rom: 'thang-ok', de: 'Ausgang' },
    ],
    examplesB: [
      { thai: 'ห้องน้ำ', rom: 'hong-nam', de: 'Toilette' },
      { thai: 'เห็น', rom: 'hen', de: 'sehen' },
      { thai: 'ห้าม', rom: 'haam', de: 'verboten' },
    ],
  },
  {
    id: 'yo_yak_vs_o_ang',
    title: 'ย (Yo Yak) vs อ (O Ang)',
    letterA: 'ย',
    nameA: 'ย ยักษ์ (yɔɔ yák)',
    soundA: 'y (Initial) / y (Final)',
    letterB: 'อ',
    nameB: 'อ อ่าง (ɔɔ àang)',
    soundB: 'Stummer Träger / ɔɔ (Vokal)',
    whyConfusing: 'ย verliert sein ikonisches gezacktes Riesen-Gesicht und wird zu einer schlichten gerundeten Form.',
    clueA: 'Modernes ย: Behält auf der linken Seite eine kleine Stufe oder Einkerbung vor der Grundlinie.',
    clueB: 'Modernes อ: Reines, glattes Hufeisen bzw. oben offenes Oval wie ein lateinisches „c“ oder offenes „o“.',
    latinLookalikeA: 'u mit Stufe links',
    latinLookalikeB: 'c / u / offenes o',
    examplesA: [
      { thai: 'ยา', rom: 'yaa', de: 'Medizin' },
      { thai: 'อยาก', rom: 'yaak', de: 'wollen / möchten' },
      { thai: 'เย็น', rom: 'yen', de: 'kalt / kühl' },
    ],
    examplesB: [
      { thai: 'อร่อย', rom: 'a-roi', de: 'lecker' },
      { thai: 'อาหาร', rom: 'aa-haan', de: 'Essen' },
      { thai: 'อยาก', rom: 'yaak', de: 'wollen' },
    ],
  },
  {
    id: 'so_so_vs_so_sala',
    title: 'ซ (So So) vs ศ (So Sala)',
    letterA: 'ซ',
    nameA: 'ซ โซ่ (sɔɔ sôo)',
    soundA: 's (Tiefe Klasse)',
    letterB: 'ศ',
    nameB: 'ศ ศาลา (sɔ̌ɔ sǎa-laa)',
    soundB: 's (Hohe Klasse)',
    whyConfusing: 'Beide sind S-Laute, aber gehören verschiedenen Konsonantenklassen an. Im modernen Stil basiert ซ auf ช (mit Schwänzchen) und ศ auf ค (mit Fahne).',
    clueA: 'Modernes ซ: Basiert auf ช mit einem doppelten Knick am Kopf.',
    clueB: 'Modernes ศ: Basiert auf ค mit einem nach schräg oben ragenden Sporn/Strich.',
    latinLookalikeA: 'geschwungenes Zeichen',
    latinLookalikeB: 'u mit Antenne',
    examplesA: [
      { thai: 'ซื้อ', rom: 'sʉ́ʉ', de: 'kaufen' },
    ],
    examplesB: [
      { thai: 'ศูนย์', rom: 'sǔun', de: 'Zentrum / Null' },
      { thai: 'ศึกษา', rom: 'sʉ̀k-sǎa', de: 'studieren / lernen' },
    ],
  },
];

export interface RealWorldSign {
  id: string;
  thai: string;
  romanization: string;
  meaningGerman: string;
  category: 'BTS & Verkehr' | 'Schilder & Regeln' | 'Essen & Einkaufen' | 'Öffentliche Orte' | 'Alltag & Orte';
  signStyle: 'bts_blue' | 'exit_green' | 'warning_yellow' | 'prohibition_red' | 'cafe_warm' | 'shop_dark';
  clueModernFont: string;
  notes: string;
}

export const REAL_WORLD_SIGNS: RealWorldSign[] = [
  {
    id: 'thang_ok',
    thai: 'ทางออก',
    romanization: 'thang-ok',
    meaningGerman: 'Ausgang (Exit)',
    category: 'BTS & Verkehr',
    signStyle: 'exit_green',
    clueModernFont: 'Achte auf das erste Zeichen ท: sieht im modernen Kanit aus wie ein lateinisches „n“! Das อ ist ein schlichtes Hufeisen.',
    notes: 'Auf jedem BTS-Skytrain-, MRT-Bahnhof und am Flughafen Suvarnabhumi omnipräsent.',
  },
  {
    id: 'thang_khao',
    thai: 'ทางเข้า',
    romanization: 'thang-khao',
    meaningGerman: 'Eingang (Entrance)',
    category: 'BTS & Verkehr',
    signStyle: 'bts_blue',
    clueModernFont: 'ข sieht aus wie ein schmales lateinisches „u“. Der Vokal เ steht ganz links.',
    notes: 'Häufig an Malls, Bahnhöfen und Gebäudeeingängen in Bangkok.',
  },
  {
    id: 'hong_nam',
    thai: 'ห้องน้ำ',
    romanization: 'hɔ̂ng-náam',
    meaningGerman: 'Toilette / WC',
    category: 'Öffentliche Orte',
    signStyle: 'bts_blue',
    clueModernFont: 'ห sieht wie ein modernes H mit Kreuzung aus. Das น bei น้ำ hat nur eine winzige Kante rechts unten!',
    notes: 'Das wichtigste Schild im Thailand-Urlaub – fast ausnahmslos in moderner Schrift!',
  },
  {
    id: 'poet',
    thai: 'เปิด',
    romanization: 'bpoet',
    meaningGerman: 'Geöffnet (Open)',
    category: 'Essen & Einkaufen',
    signStyle: 'shop_dark',
    clueModernFont: 'ป sieht aus wie ein lateinisches „u“ mit langem Hochstrich. ด am Ende hat einen leichten Knick nach innen.',
    notes: 'An Glastüren von 7-Eleven, Cafés und Geschäften.',
  },
  {
    id: 'pit',
    thai: 'ปิด',
    romanization: 'bpit',
    meaningGerman: 'Geschlossen (Closed)',
    category: 'Essen & Einkaufen',
    signStyle: 'shop_dark',
    clueModernFont: 'Kompakte Form: ป mit kurzem Vokal ิ oben und ด (Knick innen) am Ende.',
    notes: 'Gegenstück zu เปิด.',
  },
  {
    id: 'ra_wang',
    thai: 'ระวัง',
    romanization: 'ra-wang',
    meaningGerman: 'Vorsicht! / Achtung',
    category: 'Schilder & Regeln',
    signStyle: 'warning_yellow',
    clueModernFont: 'Modernes ร sieht fast 1:1 wie ein lateinisches „s“ aus! ว sieht aus wie ein lateinisches „o“ oder „c“.',
    notes: 'An BTS-Bahnsteigkanten (z. B. „ระวังช่องว่างระหว่างขบวนรถ“ – Mind the gap).',
  },
  {
    id: 'ham_sup_buri',
    thai: 'ห้ามสูบบุหรี่',
    romanization: 'hâam sùup bu-rìi',
    meaningGerman: 'Rauchen verboten',
    category: 'Schilder & Regeln',
    signStyle: 'prohibition_red',
    clueModernFont: 'Achte auf die Buchstaben บ: sie sehen exakt wie lateinische „u“ aus!',
    notes: 'In allen öffentlichen Verkehrsmitteln, Hotels und Restaurants Pflicht.',
  },
  {
    id: 'yin_dee_ton_rap',
    thai: 'ยินดีต้อนรับ',
    romanization: 'yin-dee dtɔ̂ɔn-ráp',
    meaningGerman: 'Herzlich willkommen',
    category: 'Öffentliche Orte',
    signStyle: 'bts_blue',
    clueModernFont: 'ย hat links eine kleine Stufe. ต hat oben einen markanten doppelten Knick.',
    notes: 'Am Eingang von Hotels, Flughäfen und Einkaufszentren.',
  },
  {
    id: 'rot_fai_fa',
    thai: 'รถไฟฟ้า',
    romanization: 'rót-fai-fáa',
    meaningGerman: 'Skytrain / Elektro-Zug (BTS)',
    category: 'BTS & Verkehr',
    signStyle: 'bts_blue',
    clueModernFont: 'ร sieht wie ein „s“ aus, ถ hat eine Einbuchtung nach innen, ฟ hat einen extra langen Aufstrich.',
    notes: 'Offizielle Bezeichnung für den BTS Skytrain in Bangkok.',
  },
  {
    id: 'ran_ahan',
    thai: 'ร้านอาหาร',
    romanization: 'ráan aa-hǎan',
    meaningGerman: 'Restaurant / Speiselokal',
    category: 'Essen & Einkaufen',
    signStyle: 'cafe_warm',
    clueModernFont: 'ร am Anfang wie ein „s“, อ in der Mitte als schlichtes offenes Oval, ห am Ende.',
    notes: 'Leuchtreklamen in ganz Thailand.',
  },
  {
    id: 'kafae_sot',
    thai: 'กาแฟสด',
    romanization: 'gaa-fae sòt',
    meaningGerman: 'Frischer Kaffee',
    category: 'Essen & Einkaufen',
    signStyle: 'cafe_warm',
    clueModernFont: 'ก hat die klassische Hühnerkopf-Silhouette, ฟ hat eine volle Mittelzacke und langen Strich.',
    notes: 'An Straßenständen und Specialty-Coffee-Bars überall in Thailand.',
  },
  {
    id: 'chan_chala',
    thai: 'ชานชาลา',
    romanization: 'chaan-chaa-laa',
    meaningGerman: 'Bahnsteig / Platform',
    category: 'BTS & Verkehr',
    signStyle: 'bts_blue',
    clueModernFont: 'ช hat oben rechts einen kleinen Sporn. ล sieht aus wie ein offenes Bogenzeichen.',
    notes: 'An jedem BTS-, MRT- und Fernbahnhof mit Plattformnummer (z. B. ชานชาลา 1).',
  },
  {
    id: 'krung_thep',
    thai: 'กรุงเทพฯ',
    romanization: 'grung-thêep',
    meaningGerman: 'Bangkok (Stadt der Engel)',
    category: 'Öffentliche Orte',
    signStyle: 'bts_blue',
    clueModernFont: 'ก am Anfang, modernisiertes ท in der Mitte, พ mit hoher Mittelzacke, Paiyannoi (ฯ) am Ende.',
    notes: 'Offizieller thailändischer Name der Hauptstadt Bangkok.',
  },
  {
    id: 'rong_phayaban',
    thai: 'โรงพยาบาล',
    romanization: 'roong-pha-yaa-baan',
    meaningGerman: 'Krankenhaus / Hospital',
    category: 'Öffentliche Orte',
    signStyle: 'bts_blue',
    clueModernFont: 'Langvokal โ links, ร wie „s“, พ mit hoher Zacke, ย mit Stufe, บ wie „u“.',
    notes: 'Wichtiges Notfall-Schild auf Autobahnen und Straßenschildern.',
  },
  {
    id: 'thanakhan',
    thai: 'ธนาคาร',
    romanization: 'tha-naa-khaan',
    meaningGerman: 'Bank (Geldinstitut)',
    category: 'Öffentliche Orte',
    signStyle: 'shop_dark',
    clueModernFont: 'ธ ähnelt einem modifizierten „u“ mit geschlossener Wölbung. ค ist offen nach unten.',
    notes: 'An allen Filialen von Kasikornbank, SCB, Bangkok Bank.',
  },
  {
    id: 'lot_rakha',
    thai: 'ลดราคา',
    romanization: 'lót raa-khaa',
    meaningGerman: 'Reduziert / Sale',
    category: 'Essen & Einkaufen',
    signStyle: 'prohibition_red',
    clueModernFont: 'ด hat einen Knick nach innen, ร sieht wie ein „s“ aus, ค wie ein umgedrehtes „u“.',
    notes: 'In Einkaufszentren wie Siam Paragon, CentralWorld und MBK.',
  },
  {
    id: 'khop_khun',
    thai: 'ขอบคุณ',
    romanization: 'khɔ̀ɔp-khun',
    meaningGerman: 'Danke / Dankeschön',
    category: 'Alltag & Orte',
    signStyle: 'bts_blue',
    clueModernFont: 'ข sieht aus wie ein schmales „u“, บ daneben ebenfalls wie ein „u“. Zweimal U-Form hintereinander!',
    notes: 'Am Kassenbon, auf Schildern beim Verlassen von Geschäften.',
  },
  {
    id: 'sa_wat_dee',
    thai: 'สวัสดี',
    romanization: 'sà-wàt-dee',
    meaningGerman: 'Guten Tag / Hallo',
    category: 'Alltag & Orte',
    signStyle: 'bts_blue',
    clueModernFont: 'ส beginnt ohne Kringel mit oberem Zacken, ว wie „o“, ส nochmals, gefolgt von ด.',
    notes: 'Die Begrüßung Nummer 1 in ganz Thailand.',
  },
];

export interface ConsonantFontClue {
  letter: string;
  nameThai: string;
  nameRom: string;
  class: ConsonantClass;
  modernTip: string;
  latinLookalike: string;
}

export const CONSONANTS_FONT_GUIDE: ConsonantFontClue[] = [
  { letter: 'ก', nameThai: 'ก ไก่', nameRom: 'Ko Kai', class: 'mid', modernTip: 'Hat schon klassisch keinen Kringel; bleibt auch modern sehr stabil.', latinLookalike: 'Hühnerschnabel' },
  { letter: 'ข', nameThai: 'ข ไข่', nameRom: 'Kho Khai', class: 'high', modernTip: 'Verliert den oberen Kringel und wird zu einem schmalen U-Bogen.', latinLookalike: 'u / c' },
  { letter: 'ฃ', nameThai: 'ฃ ขวด', nameRom: 'Kho Khuat', class: 'high', modernTip: 'Obsolet. Ähnelt ข mit gezackter Kante.', latinLookalike: 'u mit Zacke' },
  { letter: 'ค', nameThai: 'ค ควาย', nameRom: 'Kho Khwai', class: 'low', modernTip: 'Öffnet sich nach außen/unten wie ein umgedrehtes „u“ ohne Innenknick.', latinLookalike: 'n / u umgedreht' },
  { letter: 'ฅ', nameThai: 'ฅ คน', nameRom: 'Kho Khon', class: 'low', modernTip: 'Obsolet. Wie ค mit Kerbe oben.', latinLookalike: 'm mit Kerbe' },
  { letter: 'ฆ', nameThai: 'ฆ ระฆัง', nameRom: 'Kho Rakhang', class: 'low', modernTip: 'Sieht modern oft wie ein doppeltes U mit Wellenlinie aus.', latinLookalike: 'Welle' },
  { letter: 'ง', nameThai: 'ง งู', nameRom: 'Ngo Ngu', class: 'low', modernTip: 'Der Kringel oben wird zu einer einfachen diagonalen Kante.', latinLookalike: 'J verkehrt herum' },
  { letter: 'จ', nameThai: 'จ จาน', nameRom: 'Cho Chan', class: 'mid', modernTip: 'Kompakte Schleife; verliert den Kringel und wird zu einer engen Sichel.', latinLookalike: 'D / C spitz' },
  { letter: 'ฉ', nameThai: 'ฉ ฉิ่ง', nameRom: 'Cho Ching', class: 'high', modernTip: 'Zweifache Schlaufe, modern zu zwei Kanten reduziert.', latinLookalike: 'Bogen' },
  { letter: 'ช', nameThai: 'ช ช้าง', nameRom: 'Cho Chang', class: 'low', modernTip: 'Wie ข, hat aber oben rechts einen markanten kleinen Zacken/Sporn.', latinLookalike: 'u mit Sporn oben' },
  { letter: 'ซ', nameThai: 'ซ โซ่', nameRom: 'So So', class: 'low', modernTip: 'Wie ช, aber mit doppelter Einkerbung am oberen Bogen.', latinLookalike: 'u mit Doppelzacke' },
  { letter: 'ฌ', nameThai: 'ฌ เฌอ', nameRom: 'Cho Choe', class: 'low', modernTip: 'Kombiniert Schalen- und Bogenform ohne Kringel.', latinLookalike: 'H-artig' },
  { letter: 'ญ', nameThai: 'ญ หญิง', nameRom: 'Yo Ying', class: 'low', modernTip: 'Unterteil verliert die Schlaufe, oberer Bogen wird glatt.', latinLookalike: 'U mit Unterschale' },
  { letter: 'ฎ', nameThai: 'ฎ ชฎา', nameRom: 'Do Chada', class: 'mid', modernTip: 'Unterer Schweif hat nur EINE Welle (im Ggs. zu ฏ mit zwei).', latinLookalike: 'Hahn mit Schweif' },
  { letter: 'ฏ', nameThai: 'ฏ ปฏัก', nameRom: 'To Patak', class: 'mid', modernTip: 'Unterer Schweif hat ZWEI Zacken/Wellen.', latinLookalike: 'Doppelwelle' },
  { letter: 'ฐ', nameThai: 'ฐ ฐาน', nameRom: 'Tho Than', class: 'high', modernTip: 'Breiter Unterbau verliert Kringel und wird zu einem Wellenpodest.', latinLookalike: 'Podest' },
  { letter: 'ฑ', nameThai: 'ฑ มณโฑ', nameRom: 'Tho Montho', class: 'low', modernTip: 'Wie ท mit einer Einkerbung am Scheitel.', latinLookalike: 'n mit Zacke' },
  { letter: 'ฒ', nameThai: 'ฒ ผู้เฒ่า', nameRom: 'Tho Phuthao', class: 'low', modernTip: 'Zusammengesetzt aus ท und innerer Schleife.', latinLookalike: 'Hakenform' },
  { letter: 'ณ', nameThai: 'ณ เณร', nameRom: 'No Nen', class: 'low', modernTip: 'Breite Form mit Ecke rechts unten wie bei น.', latinLookalike: 'Doppel-U' },
  { letter: 'ด', nameThai: 'ด เด็ก', nameRom: 'Do Dek', class: 'mid', modernTip: 'Sehr wichtig: Der Bogen knickt nach INNEN ein (wie lateinisches d/n).', latinLookalike: 'd / n mit Knick' },
  { letter: 'ต', nameThai: 'ต เต่า', nameRom: 'To Tao', class: 'mid', modernTip: 'Wie ด, aber der obere Bogen hat eine gezackte Einkerbung (Schildkröte).', latinLookalike: 'm mit Knick' },
  { letter: 'ถ', nameThai: 'ถ ถุง', nameRom: 'Tho Thung', class: 'high', modernTip: 'Der Schnabel knickt nach INNEN ein.', latinLookalike: 'n mit Innenbucht' },
  { letter: 'ท', nameThai: 'ท ทหาร', nameRom: 'Tho Thahan', class: 'low', modernTip: 'Ganz typisch: Sieht fast wie ein lateinisches Kleinbuchstaben-„n“ aus!', latinLookalike: 'n' },
  { letter: 'ธ', nameThai: 'ธ ธง', nameRom: 'Tho Thong', class: 'low', modernTip: 'Oben offener Kasten mit Wölbung, sehr eckig im modernen Stil.', latinLookalike: 'Eckiges U' },
  { letter: 'น', nameThai: 'น หนู', nameRom: 'No Nu', class: 'low', modernTip: 'Verliert den Kringel; hat nur eine kleine spitze Ecke RECHTS unten.', latinLookalike: 'u mit Ecke rechts' },
  { letter: 'บ', nameThai: 'บ ใบไม้', nameRom: 'Bo Baimai', class: 'mid', modernTip: 'Sieht im modernen Kanit/Prompt fast 1:1 aus wie ein lateinisches „u“!', latinLookalike: 'u' },
  { letter: 'ป', nameThai: 'ป ปลา', nameRom: 'Po Pla', class: 'mid', modernTip: 'Wie บ, aber der rechte Strich ragt lang nach oben heraus.', latinLookalike: 'u mit Langstrich' },
  { letter: 'ผ', nameThai: 'ผ ผึ้ง', nameRom: 'Pho Phueng', class: 'high', modernTip: 'Mittelzacke geht nur bis zur HALBEN Höhe.', latinLookalike: 'W flache Mitte' },
  { letter: 'ฝ', nameThai: 'ฝ ฝา', nameRom: 'Fo Fa', class: 'high', modernTip: 'Wie ผ mit flacher Mittelzacke, aber der rechte Strich ist lang.', latinLookalike: 'W lang rechts' },
  { letter: 'พ', nameThai: 'พ พาน', nameRom: 'Pho Phan', class: 'low', modernTip: 'Mittelzacke geht ganz nach OBEN bis auf volle Höhe (wie echtes W).', latinLookalike: 'W' },
  { letter: 'ฟ', nameThai: 'ฟ ฟัน', nameRom: 'Fo Fan', class: 'low', modernTip: 'Wie พ mit voller Mittelzacke, aber rechter Strich ragt hoch.', latinLookalike: 'W mit Überstand' },
  { letter: 'ภ', nameThai: 'ภ สำเภา', nameRom: 'Pho Samphao', class: 'low', modernTip: 'Der Schnabel wölbt sich nach AUSSEN (wie eine kleine Haube).', latinLookalike: 'n mit Haube' },
  { letter: 'ม', nameThai: 'ม ม้า', nameRom: 'Mo Ma', class: 'low', modernTip: 'Die Schleife sitzt LINKS unten (wie ein Sporn oder Mini-M).', latinLookalike: 'u mit Sporn links' },
  { letter: 'ย', nameThai: 'ย ยักษ์', nameRom: 'Yo Yak', class: 'low', modernTip: 'Verliert die Zickzack-Fratze; wird zu sanfter Kurve mit Kerbe links.', latinLookalike: 'u mit Stufe' },
  { letter: 'ร', nameThai: 'ร เรือ', nameRom: 'Ro Ruea', class: 'low', modernTip: 'Größte Verwechslungsfalle! Sieht modern oft wie ein lateinisches „s“ aus!', latinLookalike: 's / r' },
  { letter: 'ล', nameThai: 'ล ลิง', nameRom: 'Lo Ling', class: 'low', modernTip: 'Reine Bogenform nach rechts oben offen.', latinLookalike: 'Bogen' },
  { letter: 'ว', nameThai: 'ว แหวน', nameRom: 'Wo Waen', class: 'low', modernTip: 'Sieht modern wie ein lateinisches „o“ oder seitlich offenes „c“ aus.', latinLookalike: 'o / c' },
  { letter: 'ศ', nameThai: 'ศ ศาลา', nameRom: 'So Sala', class: 'high', modernTip: 'Basiert auf ค mit einem langen schrägen Strich nach oben rechts.', latinLookalike: 'u mit Antenne' },
  { letter: 'ษ', nameThai: 'ษ ฤๅษี', nameRom: 'So Rusi', class: 'high', modernTip: 'Basiert auf บ mit einer Querlinie im Bauch.', latinLookalike: 'u mit Querstrich' },
  { letter: 'ส', nameThai: 'ส เสือ', nameRom: 'So Suea', class: 'high', modernTip: 'Basiert auf ล mit einem Schwänzchen oben rechts.', latinLookalike: 'Bogen mit Sporn' },
  { letter: 'ห', nameThai: 'ห หีบ', nameRom: 'Ho Hip', class: 'high', modernTip: 'Sieht modern oft aus wie ein H mit einer Überkreuzung oben rechts.', latinLookalike: 'H mit Kreuz' },
  { letter: 'ฬ', nameThai: 'ฬ จุฬา', nameRom: 'Lo Chula', class: 'low', modernTip: 'Wie พ mit einem geschwungenen Haken oben rechts.', latinLookalike: 'W mit Schleife' },
  { letter: 'อ', nameThai: 'อ อ่าง', nameRom: 'O Ang', class: 'mid', modernTip: 'Glattes Hufeisen ohne Kringel (wie ein offenes „o“).', latinLookalike: 'c / offenes o' },
  { letter: 'ฮ', nameThai: 'ฮ นกฮูก', nameRom: 'Ho Nok-huk', class: 'low', modernTip: 'Wie อ, hat aber oben rechts eine kleine geschlossene Schleife.', latinLookalike: 'o mit Schlaufe' },
];
