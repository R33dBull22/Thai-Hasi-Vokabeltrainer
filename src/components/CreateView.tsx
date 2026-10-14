import React, { useState } from 'react';
import {
  Plus,
  Sparkles,
  Volume2,
  Check,
  BookOpen,
  Eye,
  EyeOff,
  HelpCircle,
} from 'lucide-react';
import { Vocabulary } from '../types/vocab';
import { speakThai } from '../utils/thaiAudio';
import { generateRomanizationFromThai, normalizeThai } from '../utils/thaiTones';
import { ToneVisualizer } from './ToneVisualizer';

interface CreateViewProps {
  existingLessons: string[];
  onAddVocab: (vocab: Omit<Vocabulary, 'id' | 'createdAt'>) => Promise<void>;
  onSuccessNavigate: () => void;
}

export const CreateView: React.FC<CreateViewProps> = ({
  existingLessons,
  onAddVocab,
  onSuccessNavigate,
}) => {
  const [german, setGerman] = useState('');
  const [thai, setThai] = useState('');
  const [romanization, setRomanization] = useState('');
  const [lesson, setLesson] = useState(existingLessons[0] || 'Lektion 1: Begrüßung');
  const [customLesson, setCustomLesson] = useState('');
  const [exampleThai, setExampleThai] = useState('');
  const [exampleGerman, setExampleGerman] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const finalLesson = lesson === '__new__' ? customLesson.trim() : lesson;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage(null);

    if (!german.trim()) {
      setErrorMessage('Bitte gib die deutsche Bedeutung ein.');
      return;
    }
    if (!thai.trim()) {
      setErrorMessage('Bitte gib die thailändischen Schriftzeichen ein.');
      return;
    }
    if (!finalLesson) {
      setErrorMessage('Bitte wähle oder erstelle eine Lektion.');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalRom =
        romanization.trim() ||
        generateRomanizationFromThai(thai.trim()).romanization ||
        undefined;

      await onAddVocab({
        german: german.trim(),
        thai: normalizeThai(thai.trim()),
        romanization: finalRom,
        lesson: finalLesson,
        exampleThai: exampleThai.trim() ? normalizeThai(exampleThai.trim()) : undefined,
        exampleGerman: exampleGerman.trim() || undefined,
        creatorId: 'local_user',
      });

      setSuccessMessage('Vokabelkarte erfolgreich im Deck angelegt!');
      setGerman('');
      setThai('');
      setRomanization('');
      setExampleThai('');
      setExampleGerman('');

      setTimeout(() => {
        setSuccessMessage(null);
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Fehler beim Speichern der Vokabel.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestAudio = () => {
    if (thai.trim()) {
      speakThai(thai.trim());
    }
  };

  const handleAutoGenerateRomanization = () => {
    if (!thai.trim()) return;
    const generated = generateRomanizationFromThai(thai.trim());
    if (generated.romanization) {
      setRomanization(generated.romanization);
    }
  };

  const handleThaiBlur = () => {
    if (thai.trim() && !romanization.trim()) {
      const generated = generateRomanizationFromThai(thai.trim());
      if (generated.romanization) {
        setRomanization(generated.romanization);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-3 pb-32 text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2 mb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Vokabeln eingeben
          </h1>
          <p className="text-xs text-[#8E8E93]">
            Wird im Community-Pool gespeichert & in dein Deck gelegt
          </p>
        </div>
        <span className="text-2xl">🇹🇭</span>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center gap-2 text-emerald-300 text-xs animate-in fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-300 text-xs animate-in fade-in">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Lektion Auswahl */}
        <div className="bg-[#242426] rounded-2xl p-4 border border-[#323236]">
          <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-2">
            Lektion / Kategorie *
          </label>
          <select
            value={lesson}
            onChange={(e) => setLesson(e.target.value)}
            className="w-full bg-[#1C1C1E] border border-[#3A3A3D] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF7A00]"
          >
            {existingLessons.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
            <option value="__new__">+ Neue Lektion erstellen...</option>
          </select>

          {lesson === '__new__' && (
            <input
              type="text"
              value={customLesson}
              onChange={(e) => setCustomLesson(e.target.value)}
              placeholder="Name der neuen Lektion (z. B. Im Restaurant)"
              className="mt-2.5 w-full bg-[#1C1C1E] border border-[#3A3A3D] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF7A00]"
            />
          )}
        </div>

        {/* 1. Bedeutung / Deutsch */}
        <div className="bg-[#242426] rounded-2xl p-4 border border-[#323236]">
          <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-2">
            Bedeutung / Deutsch (Vorderseite) *
          </label>
          <input
            type="text"
            value={german}
            onChange={(e) => setGerman(e.target.value)}
            placeholder="z. B. Guten Tag / Hallo"
            className="w-full bg-[#1C1C1E] border border-[#3A3A3D] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF7A00]"
          />
        </div>

        {/* 2. Thai Schriftzeichen */}
        <div className="bg-[#242426] rounded-2xl p-4 border border-[#323236]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">
              Thai-Schriftzeichen (Rückseite) *
            </label>
            {thai.trim() && (
              <button
                type="button"
                onClick={handleTestAudio}
                className="flex items-center gap-1 text-[11px] text-[#FF7A00] hover:underline"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Audio testen</span>
              </button>
            )}
          </div>
          <input
            type="text"
            value={thai}
            onChange={(e) => setThai(e.target.value)}
            onBlur={handleThaiBlur}
            placeholder="z. B. สวัสดีครับ"
            className="w-full bg-[#1C1C1E] border border-[#3A3A3D] rounded-xl px-3 py-3 text-lg font-thai text-white focus:outline-none focus:border-[#FF7A00]"
          />
        </div>

        {/* 3. Romanisierung / Lautschrift */}
        <div className="bg-[#242426] rounded-2xl p-4 border border-[#323236]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">
              Lautschrift / Romanisierung (Optional)
            </label>
            {thai.trim() && (
              <button
                type="button"
                onClick={handleAutoGenerateRomanization}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#FF7A00] hover:text-[#FFA040] transition-colors cursor-pointer bg-[#FF7A00]/10 px-2.5 py-1 rounded-full border border-[#FF7A00]/30 shadow-xs"
                title="Lautschrift mit Ton-Akzenten automatisch aus der Thai-Schrift berechnen"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />
                <span>Aus Thai generieren</span>
              </button>
            )}
          </div>
          <input
            type="text"
            value={romanization}
            onChange={(e) => setRomanization(e.target.value)}
            placeholder="z. B. sà-wàt-dee kráp"
            className="w-full bg-[#1C1C1E] border border-[#3A3A3D] rounded-xl px-3 py-2.5 text-sm text-[#FF7A00] focus:outline-none focus:border-[#FF7A00]"
          />

          {/* Tone Visualizer Live Preview */}
          {(romanization.trim() || thai.trim()) && (
            <div className="mt-3 pt-2.5 border-t border-[#323236]/60">
              <ToneVisualizer
                romanization={romanization}
                thai={thai}
                showHelpIcon
              />
            </div>
          )}

          <p className="text-[11px] text-[#8E8E93] mt-2">
            Tipp: Wird beim Verlassen des Thai-Feldes automatisch mit den korrekten Ton-Akzenten vorgeschlagen.
          </p>
        </div>

        {/* 4. Beispielsatz Kontext (Optional) */}
        <div className="bg-[#242426] rounded-2xl p-4 border border-[#323236] space-y-3">
          <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">
            Beispielsatz & Kontext (Optional)
          </label>
          <input
            type="text"
            value={exampleThai}
            onChange={(e) => setExampleThai(e.target.value)}
            placeholder="Satz auf Thai (z. B. ยินดีที่ได้รู้จักครับ)"
            className="w-full bg-[#1C1C1E] border border-[#3A3A3D] rounded-xl px-3 py-2 text-sm font-thai text-white focus:outline-none focus:border-[#FF7A00]"
          />
          <input
            type="text"
            value={exampleGerman}
            onChange={(e) => setExampleGerman(e.target.value)}
            placeholder="Übersetzung auf Deutsch (z. B. Schön, Sie kennenzulernen)"
            className="w-full bg-[#1C1C1E] border border-[#3A3A3D] rounded-xl px-3 py-2 text-sm text-[#D1D1D6] focus:outline-none focus:border-[#FF7A00]"
          />
        </div>

        {/* Live Preview Card */}
        {(german || thai) && (
          <div className="mt-4 p-4 bg-[#1C1C1E] rounded-3xl border border-[#323236]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8E8E93] block mb-2">
              Vorschau der Lernkarte
            </span>
            <div className="bg-[#2C2C2E] rounded-2xl p-4 text-center border border-[#3A3A3D]">
              <span className="text-xs text-[#8E8E93] block mb-1">
                {finalLesson || 'Lektion'}
              </span>
              <p className="text-base font-bold text-white mb-2">
                {german || '— Deutsch —'}
              </p>
              <div className="pt-2 border-t border-[#3A3A3D]">
                <p className="text-2xl font-semibold font-thai text-white">
                  {thai || '— ภาษาไทย —'}
                </p>
                {romanization && (
                  <p className="text-xs text-[#FF7A00] font-medium mt-1">
                    {romanization}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-full bg-[#FF7A00] text-black font-semibold text-base hover:bg-[#FF881A] transition-colors shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5 text-black stroke-[3]" />
            <span>Vokabel speichern & lernen</span>
          </button>
        </div>
      </form>
    </div>
  );
};
