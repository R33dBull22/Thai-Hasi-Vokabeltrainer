import React, { useState, useMemo } from 'react';
import {
  Volume2,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  Zap,
  Table,
  Compass,
  Search,
  BookOpen,
  Info,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { speakThai } from '../utils/thaiAudio';
import { THAI_TONES, ThaiTone, parseThaiSyllable, splitThaiIntoSyllables } from '../utils/thaiTones';
import { CONSONANT_CLASS_CONFIG, ConsonantClass, THAI_CONSONANTS } from '../data/thaiAlphabet';

interface ToneRulesCheatsheetProps {
  onClose?: () => void;
  isModal?: boolean;
}

interface MatrixCellData {
  tone: ThaiTone;
  example: string;
  rom: string;
  meaning: string;
  note?: string;
}

export const ToneRulesCheatsheet: React.FC<ToneRulesCheatsheetProps> = ({
  onClose,
  isModal = false,
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'shortcuts' | 'flowchart' | 'decoder'>('matrix');
  const [selectedCell, setSelectedCell] = useState<{
    consonantClass: ConsonantClass;
    conditionKey: string;
    conditionTitle: string;
    cell: MatrixCellData;
  } | null>(null);

  // Live Decoder State
  const [customWord, setCustomWord] = useState('ขอบคุณ');

  // Matrix definition
  const matrixData: Record<
    ConsonantClass,
    {
      title: string;
      thaiClass: string;
      colorClass: string;
      bgClass: string;
      borderClass: string;
      consonantsSummary: string;
      columns: Record<string, MatrixCellData>;
    }
  > = {
    mid: {
      title: 'Mittlere Konsonanten',
      thaiClass: 'อักษรกลาง (9)',
      colorClass: 'text-amber-400',
      bgClass: 'bg-amber-400/15',
      borderClass: 'border-amber-400/30',
      consonantsSummary: 'ก จ ด ต บ ป อ ฎ ฏ',
      columns: {
        live: { tone: 'mid', example: 'กา', rom: 'gaa', meaning: 'Krähe / Teekessel' },
        dead_short: { tone: 'low', example: 'กะ', rom: 'gà', meaning: 'schätzen / mit' },
        dead_long: { tone: 'low', example: 'กาก', rom: 'gàak', meaning: 'Überrest / Schrott' },
        mai_ek: { tone: 'low', example: 'ก่า', rom: 'gàa', meaning: 'Ton-Demonstration' },
        mai_tho: { tone: 'falling', example: 'ก้า', rom: 'gâa', meaning: 'krähen / mutig' },
        mai_tri: { tone: 'high', example: 'ก๊า', rom: 'gáa', meaning: 'Krächzlaut' },
        mai_chattawa: { tone: 'rising', example: 'ก๋า', rom: 'găa', meaning: 'keck / auffällig' },
      },
    },
    high: {
      title: 'Hohe Konsonanten',
      thaiClass: 'อักษรสูง (11)',
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-400/15',
      borderClass: 'border-emerald-400/30',
      consonantsSummary: 'ข ฉ ฐ ถ ผ ฝ ศ ษ ส ห ฃ',
      columns: {
        live: { tone: 'rising', example: 'ขา', rom: 'kăa', meaning: 'Bein' },
        dead_short: { tone: 'low', example: 'ขะ', rom: 'kà', meaning: 'Präfix / rasch' },
        dead_long: { tone: 'low', example: 'ขาก', rom: 'kàak', meaning: 'ausspucken' },
        mai_ek: { tone: 'low', example: 'ข่า', rom: 'kàa', meaning: 'Galgant (Ingwer)' },
        mai_tho: { tone: 'falling', example: 'ข้าว', rom: 'kâao', meaning: 'Reis / Essen' },
        mai_tri: { tone: 'high', example: '—', rom: '—', meaning: 'Kommt in Thai nicht vor', note: 'Grammatikalisch nicht belegt' },
        mai_chattawa: { tone: 'rising', example: '—', rom: '—', meaning: 'Kommt in Thai nicht vor', note: 'Standardton ohne Zeichen ist bereits steigend' },
      },
    },
    low: {
      title: 'Tiefe Konsonanten',
      thaiClass: 'อักษรต่ำ (24)',
      colorClass: 'text-sky-400',
      bgClass: 'bg-sky-400/15',
      borderClass: 'border-sky-400/30',
      consonantsSummary: 'ค ง ช ซ ท น พ ฟ ม ย ร ล ว ...',
      columns: {
        live: { tone: 'mid', example: 'มา', rom: 'maa', meaning: 'kommen' },
        dead_short: { tone: 'high', example: 'รัก', rom: 'rák', meaning: 'lieben' },
        dead_long: { tone: 'falling', example: 'มาก', rom: 'mâak', meaning: 'sehr / viel' },
        mai_ek: { tone: 'falling', example: 'ไม่', rom: 'mâi', meaning: 'nicht / nein' },
        mai_tho: { tone: 'high', example: 'น้ำ', rom: 'nám', meaning: 'Wasser' },
        mai_tri: { tone: 'high', example: '—', rom: '—', meaning: 'Kommt in Thai nicht vor', note: 'Mai Tri gibt es nur bei mittleren Konsonanten' },
        mai_chattawa: { tone: 'rising', example: '—', rom: '—', meaning: 'Kommt in Thai nicht vor', note: 'Mai Chattawa gibt es nur bei mittleren Konsonanten' },
      },
    },
  };

  const columnsHeader = [
    { key: 'live', title: 'Lebend', sub: 'NOM-YUANG / lang' },
    { key: 'dead_short', title: 'Tot (kurz)', sub: 'KOBAT / kurz' },
    { key: 'dead_long', title: 'Tot (lang)', sub: 'KOBAT / lang' },
    { key: 'mai_ek', title: 'Mai Ek', mark: '่', sub: 'Tonzeichen 1' },
    { key: 'mai_tho', title: 'Mai Tho', mark: '้', sub: 'Tonzeichen 2' },
    { key: 'mai_tri', title: 'Mai Tri', mark: '๊', sub: 'Tonzeichen 3' },
    { key: 'mai_chattawa', title: 'Chattawa', mark: '๋', sub: 'Tonzeichen 4' },
  ];

  // Syllables analysis of customWord
  const analyzedWordSyllables = useMemo(() => {
    const trimmed = customWord.trim();
    if (!trimmed) return [];
    const syllables = splitThaiIntoSyllables(trimmed);
    return syllables.map((syl) => {
      const parsed = parseThaiSyllable(syl);
      const toneData = THAI_TONES[parsed.tone];

      // Detect leading consonant class
      let cClass: ConsonantClass = 'mid';
      let foundConsonant = '';
      for (const ch of syl) {
        const c = THAI_CONSONANTS.find((tc) => tc.letter === ch);
        if (c) {
          foundConsonant = c.letter;
          cClass = c.class;
          break;
        }
      }

      // Detect tone mark
      let toneMarkName = 'Keines';
      if (syl.includes('่')) toneMarkName = 'Mai Ek (่)';
      else if (syl.includes('้')) toneMarkName = 'Mai Tho (้)';
      else if (syl.includes('๊')) toneMarkName = 'Mai Tri (๊)';
      else if (syl.includes('๋')) toneMarkName = 'Mai Chattawa (๋)';

      // Detect dead or live
      let endingType = 'Lebend (คำเป็น)';
      if (/[กขคฆดตถทธจชซศษสบปพฟภ]/.test(syl.slice(-1)) || /ะ|ั|ิ|ึ|ุ/.test(syl)) {
        endingType = 'Tot (คำตาย / K-P-T oder kurz)';
      }

      return {
        syllable: syl,
        roman: parsed.roman,
        tone: parsed.tone,
        toneData,
        cClass,
        foundConsonant,
        toneMarkName,
        endingType,
      };
    });
  }, [customWord]);

  return (
    <div className="w-full text-white space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-[#242426] to-sky-500/15 p-4 rounded-3xl border border-[#3A3A3D] flex items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#FF7A00]/20 border border-[#FF7A00]/40 flex items-center justify-center text-[#FF7A00] shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>Tonregeln-Cheatsheet</span>
              <span className="text-[10px] uppercase font-bold bg-[#FF7A00] text-black px-1.5 py-0.5 rounded-full">
                Pro
              </span>
            </h2>
            <p className="text-xs text-[#8E8E93]">
              Die 5 Töne in 3 Sekunden bestimmen & Meister-Tabelle
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-[#2C2C2E] text-xs text-[#8E8E93] hover:text-white transition cursor-pointer"
          >
            Schließen
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#1C1C1E] p-1 rounded-2xl border border-[#2C2C2E] overflow-x-auto no-scrollbar touch-scroll overscroll-contain text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          className={`flex-1 py-2 px-3 rounded-xl whitespace-nowrap font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'matrix'
              ? 'bg-[#FF7A00] text-black font-bold shadow-sm'
              : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Meister-Tabelle</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shortcuts')}
          className={`flex-1 py-2 px-3 rounded-xl whitespace-nowrap font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'shortcuts'
              ? 'bg-[#FF7A00] text-black font-bold shadow-sm'
              : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>3 Abkürzungen</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('flowchart')}
          className={`flex-1 py-2 px-3 rounded-xl whitespace-nowrap font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'flowchart'
              ? 'bg-[#FF7A00] text-black font-bold shadow-sm'
              : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Entscheidungsbaum</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('decoder')}
          className={`flex-1 py-2 px-3 rounded-xl whitespace-nowrap font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'decoder'
              ? 'bg-[#FF7A00] text-black font-bold shadow-sm'
              : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Wort-Dekoder</span>
        </button>
      </div>

      {/* TAB 1: MEISTER-TABELLE */}
      {activeTab === 'matrix' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] text-[#8E8E93] px-1">
            <span>Tippe auf eine Zelle für Aussprache & Erklärung:</span>
            <span className="flex items-center gap-1 text-[#FF7A00]">
              <Volume2 className="w-3 h-3" /> Audio inkl.
            </span>
          </div>

          {/* Responsive Scrollable Matrix */}
          <div className="overflow-x-auto touch-scroll overscroll-contain rounded-2xl border border-[#2C2C2E] bg-[#18181A]">
            <table className="w-full text-xs text-left border-collapse min-w-[560px]">
              <thead>
                <tr className="border-b border-[#2C2C2E] bg-[#1F1F22] text-[#8E8E93]">
                  <th className="p-2.5 font-semibold sticky left-0 bg-[#1F1F22] z-10 w-28">Klasse</th>
                  {columnsHeader.map((col) => (
                    <th key={col.key} className="p-2 text-center font-medium border-l border-[#2C2C2E]/60 min-w-[80px]">
                      <div className="font-bold text-white text-[11px]">
                        {col.mark && <span className="font-thai text-amber-400 font-bold mr-1">{col.mark}</span>}
                        {col.title}
                      </div>
                      <div className="text-[9px] text-[#8E8E93] font-normal leading-tight">{col.sub}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C2C2E]/60">
                {(['mid', 'high', 'low'] as ConsonantClass[]).map((cClass) => {
                  const conf = matrixData[cClass];
                  return (
                    <tr key={cClass} className="hover:bg-white/[0.02] transition">
                      {/* Left Header Cell */}
                      <td className="p-2.5 sticky left-0 bg-[#18181A] z-10 border-r border-[#2C2C2E]">
                        <div className={`font-bold ${conf.colorClass} text-xs flex items-center gap-1`}>
                          <span>{conf.title.split(' ')[0]}</span>
                        </div>
                        <div className="text-[10px] text-[#8E8E93] font-thai">{conf.thaiClass}</div>
                        <div className="text-[9px] text-[#636366] mt-0.5 truncate max-w-[100px]" title={conf.consonantsSummary}>
                          {conf.consonantsSummary}
                        </div>
                      </td>

                      {/* Columns */}
                      {columnsHeader.map((col) => {
                        const cell = conf.columns[col.key];
                        if (!cell || cell.example === '—') {
                          return (
                            <td key={col.key} className="p-1.5 text-center border-l border-[#2C2C2E]/40 text-[#48484A] bg-black/20">
                              <span className="text-xs">—</span>
                            </td>
                          );
                        }

                        const tInfo = THAI_TONES[cell.tone];
                        const isSelected =
                          selectedCell?.consonantClass === cClass && selectedCell?.conditionKey === col.key;

                        return (
                          <td
                            key={col.key}
                            onClick={() => {
                              setSelectedCell({
                                consonantClass: cClass,
                                conditionKey: col.key,
                                conditionTitle: col.title,
                                cell,
                              });
                              speakThai(cell.example);
                            }}
                            className={`p-1.5 text-center border-l border-[#2C2C2E]/40 cursor-pointer transition select-none ${
                              isSelected
                                ? 'bg-amber-400/20 ring-1 ring-amber-400'
                                : 'hover:bg-white/5'
                            }`}
                          >
                            <div className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-bold text-[10px] border ${tInfo.bgClass} ${tInfo.colorClass} ${tInfo.borderClass}`}>
                              <span>{tInfo.symbol}</span>
                              <span>{tInfo.germanName}</span>
                            </div>
                            <div className="mt-1 font-thai font-semibold text-white text-xs flex items-center justify-center gap-1">
                              <span>{cell.example}</span>
                              <Volume2 className="w-2.5 h-2.5 text-[#8E8E93]" />
                            </div>
                            <div className="text-[10px] text-[#A1A1AA] font-mono leading-tight">{cell.rom}</div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Selected Cell Detail Box */}
          {selectedCell && (
            <div className="p-3.5 bg-[#242426] border border-[#3A3A3D] rounded-2xl flex items-center justify-between gap-3 animate-in fade-in">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">
                    {matrixData[selectedCell.consonantClass].title} + {selectedCell.conditionTitle}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      THAI_TONES[selectedCell.cell.tone].bgClass
                    } ${THAI_TONES[selectedCell.cell.tone].colorClass} ${
                      THAI_TONES[selectedCell.cell.tone].borderClass
                    }`}
                  >
                    {THAI_TONES[selectedCell.cell.tone].symbol} {THAI_TONES[selectedCell.cell.tone].germanName} ({THAI_TONES[selectedCell.cell.tone].name.split(' ')[0]})
                  </span>
                </div>
                <p className="text-[11px] text-[#A1A1AA]">
                  Beispielwort: <span className="text-white font-thai font-bold">{selectedCell.cell.example}</span> (
                  <span className="font-mono text-amber-300">{selectedCell.cell.rom}</span>) = {selectedCell.cell.meaning}
                </p>
                {selectedCell.cell.note && (
                  <p className="text-[10px] text-[#FF7A00] italic">{selectedCell.cell.note}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => speakThai(selectedCell.cell.example)}
                className="w-9 h-9 rounded-full bg-[#FF7A00] text-black flex items-center justify-center shrink-0 hover:bg-[#FF881A] transition cursor-pointer shadow-md"
                title="Aussprache abspielen"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Color legend */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[10px]">
            {(['mid', 'low', 'falling', 'high', 'rising'] as ThaiTone[]).map((t) => {
              const inf = THAI_TONES[t];
              return (
                <div
                  key={t}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${inf.bgClass} ${inf.colorClass} ${inf.borderClass}`}
                >
                  <span className="font-bold">{inf.symbol}</span>
                  <span>{inf.germanName}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: 3 GOLDENE ABKÜRZUNGEN */}
      {activeTab === 'shortcuts' && (
        <div className="space-y-3 text-xs">
          {/* Shortcut 1: Mai Ek */}
          <div className="bg-[#242426] p-4 rounded-2xl border border-sky-400/30 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-sky-400/20 text-sky-400 flex items-center justify-center font-bold text-xs">1</span>
                <span>Mai Ek ( -่ ) ist fast immer TIEF!</span>
              </h3>
              <span className="text-sky-400 font-bold px-2 py-0.5 rounded-md bg-sky-400/10 text-[10px] border border-sky-400/20">
                ↘ Tiefer Ton
              </span>
            </div>
            <p className="text-[#D1D1D6] leading-relaxed">
              Siehst du das kleine senkrechte Strichlein <span className="font-thai font-bold text-amber-300 text-sm">`-่`</span>, wird die Silbe zu 90% mit <span className="text-sky-300 font-bold">tiefem Ton</span> gesprochen:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2.5 rounded-xl bg-[#1C1C1E] border border-[#2E2E32]">
                <span className="text-amber-400 font-semibold block">Mittel + `-่` = TIEF</span>
                <p className="text-[#8E8E93] mt-0.5">z. B. <span className="text-white font-thai font-bold">ไก่</span> (gài = Huhn)</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#1C1C1E] border border-[#2E2E32]">
                <span className="text-emerald-400 font-semibold block">Hoch + `-่` = TIEF</span>
                <p className="text-[#8E8E93] mt-0.5">z. B. <span className="text-white font-thai font-bold">ไข่</span> (kài = Ei)</p>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] flex items-start gap-2">
              <span className="font-bold">⚡ Ausnahme:</span>
              <p>Nur bei <span className="font-bold text-white">tiefen Konsonanten</span> wird Mai Ek zu <span className="text-rose-400 font-bold">FALLEND</span> (z. B. <span className="font-thai text-white font-bold">ไม่</span> mâi = nicht, <span className="font-thai text-white font-bold">พ่อ</span> pâaw = Vater).</p>
            </div>
          </div>

          {/* Shortcut 2: Mai Tho */}
          <div className="bg-[#242426] p-4 rounded-2xl border border-rose-400/30 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-rose-400/20 text-rose-400 flex items-center justify-center font-bold text-xs">2</span>
                <span>Mai Tho ( -้ ) ist FALLEND – außer bei Tiefen!</span>
              </h3>
              <span className="text-rose-400 font-bold px-2 py-0.5 rounded-md bg-rose-400/10 text-[10px] border border-rose-400/20">
                ᴧ Fallender Ton
              </span>
            </div>
            <p className="text-[#D1D1D6] leading-relaxed">
              Siehst du das Zeichen <span className="font-thai font-bold text-amber-300 text-sm">`-้`</span> (sieht aus wie eine kleine hochgestellte 2), ist der Ton fast immer <span className="text-rose-400 font-bold">fallend</span>:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2.5 rounded-xl bg-[#1C1C1E] border border-[#2E2E32]">
                <span className="text-amber-400 font-semibold block">Mittel + `-้` = FALLEND</span>
                <p className="text-[#8E8E93] mt-0.5">z. B. <span className="text-white font-thai font-bold">เก้า</span> (gâao = 9)</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#1C1C1E] border border-[#2E2E32]">
                <span className="text-emerald-400 font-semibold block">Hoch + `-้` = FALLEND</span>
                <p className="text-[#8E8E93] mt-0.5">z. B. <span className="text-white font-thai font-bold">ข้าว</span> (kâao = Reis)</p>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-start gap-2">
              <span className="font-bold">⚡ Ausnahme:</span>
              <p>Nur bei <span className="font-bold text-white">tiefen Konsonanten</span> wird Mai Tho zu <span className="text-emerald-400 font-bold">HOCH</span> (z. B. <span className="font-thai text-white font-bold">น้ำ</span> nám = Wasser, <span className="font-thai text-white font-bold">ม้า</span> máa = Pferd).</p>
            </div>
          </div>

          {/* Shortcut 3: Mai Tri & Chattawa */}
          <div className="bg-[#242426] p-4 rounded-2xl border border-amber-400/30 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-xs">3</span>
                <span>Mai Tri ( -๊ ) & Chattawa ( -๋ ) nur bei Mittel</span>
              </h3>
              <span className="text-amber-400 font-bold px-2 py-0.5 rounded-md bg-amber-400/10 text-[10px] border border-amber-400/20">
                Nur 9 Buchstaben
              </span>
            </div>
            <p className="text-[#D1D1D6] leading-relaxed">
              Die Zeichen <span className="font-thai font-bold text-amber-300 text-sm">`-๊`</span> (hoch) und <span className="font-thai font-bold text-amber-300 text-sm">`-๋`</span> (steigend) existieren in echten Thai-Wörtern <span className="underline">ausschließlich</span> bei den 9 mittleren Konsonanten:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2.5 rounded-xl bg-[#1C1C1E] border border-[#2E2E32]">
                <span className="text-emerald-400 font-semibold block">Mittel + `-๊` = HOCH</span>
                <p className="text-[#8E8E93] mt-0.5">z. B. <span className="text-white font-thai font-bold">โต๊ะ</span> (dtó = Tisch)</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#1C1C1E] border border-[#2E2E32]">
                <span className="text-violet-400 font-semibold block">Mittel + `-๋` = STEIGEND</span>
                <p className="text-[#8E8E93] mt-0.5">z. B. <span className="text-white font-thai font-bold">ตั๋ว</span> (dtŭa = Ticket)</p>
              </div>
            </div>
          </div>

          {/* Shortcut 4: Stummes H (ห นำ) */}
          <div className="bg-[#242426] p-4 rounded-2xl border border-emerald-500/30 space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <span>🪄</span>
              <span>Stummes ห (ห นำ): Der Klassen-Verwandler</span>
            </h3>
            <p className="text-[#D1D1D6] leading-relaxed">
              Steht das Zeichen <span className="font-thai font-bold text-emerald-400 text-base">ห</span> vor einem tiefen Konsonanten (ม, น, ล, ว, ย, ง), wird es nicht gesprochen, verwandelt die Silbe aber komplett in einen <span className="text-emerald-400 font-bold">hohen Konsonanten</span>!
            </p>
            <div className="p-2.5 rounded-xl bg-[#1C1C1E] border border-[#2E2E32] text-[11px] space-y-1">
              <p>• <span className="text-white font-thai font-bold">หมอ</span> = mò̜o (Arzt) ➔ tiefer Ton statt fallend!</p>
              <p>• <span className="text-white font-thai font-bold">หนึ่ง</span> = nùeng (eins) ➔ tiefer Ton!</p>
              <p>• <span className="text-white font-thai font-bold">ไหม</span> = măi (Fragepartikel) ➔ steigender Ton!</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ENTSCHEIDUNGSBAUM */}
      {activeTab === 'flowchart' && (
        <div className="space-y-3 text-xs">
          <div className="bg-[#1C1C1E] p-3.5 rounded-2xl border border-[#2C2C2E] text-center">
            <p className="text-[#8E8E93] text-xs">
              Folge diesen 3 Schritten, um bei jedem thailändischen Wort in 3 Sekunden den Ton zu ermitteln:
            </p>
          </div>

          {/* Step 1 */}
          <div className="bg-[#242426] p-4 rounded-2xl border border-[#323236] relative overflow-hidden">
            <div className="flex items-center gap-2 font-bold text-white text-sm mb-2">
              <span className="w-6 h-6 rounded-full bg-[#FF7A00] text-black flex items-center justify-center font-bold text-xs shrink-0">
                1
              </span>
              <h4>Gibt es ein Tonzeichen ( ่ , ้ , ๊ , ๋ )?</h4>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <span className="font-bold text-emerald-400 block">JA! (90% aller Fälle)</span>
                <p className="text-[#D1D1D6]">
                  Wende die 3 Abkürzungen an:
                </p>
                <p className="text-[#A1A1AA] text-[10px]">
                  • `-่` ➔ Tief (bei Tief: Fallend)<br />
                  • `-้` ➔ Fallend (bei Tief: Hoch)<br />
                  • `-๊` ➔ Hoch | `-๋` ➔ Steigend
                </p>
                <span className="inline-block mt-1 text-[10px] font-bold text-emerald-300">➔ FERTIG!</span>
              </div>

              <div className="p-3 rounded-xl bg-[#1C1C1E] border border-[#3A3A3D] space-y-1">
                <span className="font-bold text-amber-400 block">NEIN (Kein Zeichen)</span>
                <p className="text-[#D1D1D6]">
                  Gehe weiter zu Schritt 2: Konsonanten-Klasse bestimmen.
                </p>
                <span className="inline-block mt-1 text-[10px] font-bold text-amber-300">➔ Weiter zu Schritt 2</span>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#242426] p-4 rounded-2xl border border-[#323236]">
            <div className="flex items-center gap-2 font-bold text-white text-sm mb-2">
              <span className="w-6 h-6 rounded-full bg-[#FF7A00] text-black flex items-center justify-center font-bold text-xs shrink-0">
                2
              </span>
              <h4>Welche Klasse hat der Anfangskonsonant?</h4>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-[10px] pt-1">
              <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-center">
                <span className="font-bold text-amber-400 block">🟡 MITTEL</span>
                <p className="text-[#8E8E93] text-[9px]">9 Konsonanten</p>
                <span className="text-white font-mono mt-1 block">ก จ ด ต บ ป อ...</span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-center">
                <span className="font-bold text-emerald-400 block">🟢 HOCH</span>
                <p className="text-[#8E8E93] text-[9px]">11 Konsonanten</p>
                <span className="text-white font-mono mt-1 block">ข ฉ ถ ผ ฝ ส ห...</span>
              </div>

              <div className="p-2.5 rounded-xl bg-sky-400/10 border border-sky-400/20 text-center">
                <span className="font-bold text-sky-400 block">🔵 TIEF</span>
                <p className="text-[#8E8E93] text-[9px]">24 Konsonanten</p>
                <span className="text-white font-mono mt-1 block">ค ช ท น พ ม ร...</span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#242426] p-4 rounded-2xl border border-[#323236]">
            <div className="flex items-center gap-2 font-bold text-white text-sm mb-2">
              <span className="w-6 h-6 rounded-full bg-[#FF7A00] text-black flex items-center justify-center font-bold text-xs shrink-0">
                3
              </span>
              <h4>Ist die Silbe lebend oder tot?</h4>
            </div>

            <div className="space-y-2 text-[11px] pt-1">
              <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start justify-between gap-2">
                <div>
                  <span className="font-bold text-emerald-400 block">Lebend (NOM-YUANG / langer Vokal)</span>
                  <p className="text-[#A1A1AA] text-[10px]">Endet auf n, m, ng, y, w oder langer offener Vokal</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-amber-300 font-bold">Mittel ➔ Mitte (—)</p>
                  <p className="text-sky-300 font-bold">Tief ➔ Mitte (—)</p>
                  <p className="text-violet-300 font-bold">Hoch ➔ Steigend (v)</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-start justify-between gap-2">
                <div>
                  <span className="font-bold text-rose-400 block">Tot (KOBAT / kurzer Vokal)</span>
                  <p className="text-[#A1A1AA] text-[10px]">Endet auf k, p, t oder kurzer Vokal ohne Endlaut</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sky-300 font-bold">Mittel & Hoch ➔ Tief (↘)</p>
                  <p className="text-emerald-300 font-bold">Tief (kurz) ➔ Hoch (↗)</p>
                  <p className="text-rose-300 font-bold">Tief (lang) ➔ Fallend (ᴧ)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WORT-DEKODER */}
      {activeTab === 'decoder' && (
        <div className="space-y-4 text-xs">
          {/* Input Box */}
          <div className="bg-[#242426] p-4 rounded-2xl border border-[#3A3A3D] space-y-3">
            <label className="text-xs font-bold text-white block">
              Tippe ein beliebiges Thai-Wort oder wähle ein Beispiel:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customWord}
                onChange={(e) => setCustomWord(e.target.value)}
                placeholder="z. B. ขอบคุณ, น้ำ, ข้าว..."
                className="flex-1 px-3.5 py-2.5 bg-[#1C1C1E] border border-[#3A3A3D] rounded-xl text-base font-thai text-white focus:outline-none focus:border-[#FF7A00]"
              />
              <button
                type="button"
                onClick={() => speakThai(customWord)}
                className="px-4 py-2.5 rounded-xl bg-[#FF7A00] text-black font-semibold hover:bg-[#FF881A] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Volume2 className="w-4 h-4" />
                <span>Hören</span>
              </button>
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                'ขอบคุณ',
                'สวัสดี',
                'รถเมล์',
                'ข้าว',
                'น้ำ',
                'กิน',
                'ไม่',
                'ครับ',
                'ค่ะ',
                'หนึ่ง',
                'โต๊ะ',
                'ตั๋ว',
                'หมอ',
                'รัก',
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setCustomWord(chip)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-thai transition cursor-pointer ${
                    customWord === chip
                      ? 'bg-[#FF7A00] text-black font-bold'
                      : 'bg-[#1C1C1E] text-[#D1D1D6] border border-[#323236] hover:border-[#FF7A00]'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Syllables Analysis Display */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">
              Silben-Analyse ({analyzedWordSyllables.length} Silbe{analyzedWordSyllables.length === 1 ? '' : 'n'}):
            </h4>

            {analyzedWordSyllables.map((item, index) => {
              const conf = CONSONANT_CLASS_CONFIG[item.cClass];
              return (
                <div
                  key={index}
                  className="bg-[#242426] p-4 rounded-2xl border border-[#323236] space-y-3"
                >
                  {/* Syllable Header */}
                  <div className="flex items-center justify-between border-b border-[#2C2C2E] pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl font-bold font-thai text-white">{item.syllable}</span>
                      <span className="text-sm font-mono text-amber-300">[{item.roman}]</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${item.toneData.bgClass} ${item.toneData.colorClass} ${item.toneData.borderClass}`}
                    >
                      <span className="text-sm">{item.toneData.symbol}</span>
                      <span>{item.toneData.germanName}</span>
                    </div>
                  </div>

                  {/* 3 Step Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-[#1C1C1E] border border-[#2E2E32]">
                      <span className="text-[#8E8E93] block text-[10px]">1. Anfangskonsonant:</span>
                      <span className={`font-bold font-thai text-sm ${conf.colorClass}`}>
                        {item.foundConsonant || '—'}
                      </span>
                      <span className={`block text-[10px] ${conf.colorClass}`}>
                        ({conf.labelGerman.split(' ')[0]})
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#1C1C1E] border border-[#2E2E32]">
                      <span className="text-[#8E8E93] block text-[10px]">2. Tonzeichen:</span>
                      <span className="font-bold text-white text-xs">{item.toneMarkName}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#1C1C1E] border border-[#2E2E32]">
                      <span className="text-[#8E8E93] block text-[10px]">3. Endung / Vokal:</span>
                      <span className="font-bold text-white text-xs truncate block" title={item.endingType}>
                        {item.endingType.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Play audio button */}
                  <button
                    type="button"
                    onClick={() => speakThai(item.syllable)}
                    className="w-full py-2 rounded-xl bg-[#1C1C1E] hover:bg-[#2C2C2E] text-xs text-[#D1D1D6] hover:text-white transition flex items-center justify-center gap-2 border border-[#323236] cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#FF7A00]" />
                    <span>Nur Silbe „{item.syllable}“ abspielen</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
