import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
  Volume2,
  FolderPlus,
  BookOpen,
  Filter,
  Pencil,
  Trash2,
  FolderInput,
  FolderEdit,
  X,
  AlertTriangle,
  RotateCcw,
  ArrowDownCircle,
  Sparkles,
  RefreshCw,
  GraduationCap,
} from 'lucide-react';
import { Vocabulary, UserProgress } from '../types/vocab';
import { speakThai } from '../utils/thaiAudio';
import { PHASES, formatDueDate, isCardDue, getDirectionProgress, isAnyDirectionDue } from '../utils/leitner';
import { EditVocabModal } from './EditVocabModal';
import { ToneVisualizer } from './ToneVisualizer';
import { generateRomanizationFromThai } from '../utils/thaiTones';
import { ThaiColorWord } from './ThaiColorWord';

interface PoolViewProps {
  vocabularies: Vocabulary[];
  progressMap: Record<string, UserProgress>;
  onSelectForStudy: (selectedVocabs: { vocab: Vocabulary; progress?: UserProgress }[]) => void;
  onAddBatchToDeck: (vocabIds: string[]) => Promise<void>;
  onNavigateCreate: () => void;
  onNavigateReference?: () => void;
  onUpdateVocab?: (id: string, updatedData: Partial<Omit<Vocabulary, 'id' | 'createdAt'>>) => Promise<void>;
  onDeleteVocab?: (id: string) => Promise<void>;
  onBatchDeleteVocabs?: (vocabIds: string[]) => Promise<number>;
  onRenameLesson?: (oldName: string, newName: string) => Promise<void>;
  onDeleteLesson?: (lessonName: string, deleteVocabs: boolean, moveToLesson?: string) => Promise<void>;
  onMoveVocabs?: (vocabIds: string[], targetLesson: string) => Promise<void>;
  onStepBackLesson?: (lessonName: string) => Promise<number>;
  onResetVocabsPhase?: (vocabIds: string[]) => Promise<number>;
  onUpdateSinglePhase?: (vocabId: string, newPhase: number, targetDirection?: 'de_to_th' | 'th_to_de' | 'both') => Promise<void>;
  onBatchUpdateRomanization?: (updates: { id: string; romanization: string }[]) => Promise<number>;
  existingLessons?: string[];
  colorCodingEnabled?: boolean;
}

export const PoolView: React.FC<PoolViewProps> = ({
  vocabularies,
  progressMap,
  onSelectForStudy,
  onAddBatchToDeck,
  onNavigateCreate,
  onNavigateReference,
  onUpdateVocab,
  onDeleteVocab,
  onBatchDeleteVocabs,
  onRenameLesson,
  onDeleteLesson,
  onMoveVocabs,
  onStepBackLesson,
  onResetVocabsPhase,
  onUpdateSinglePhase,
  onBatchUpdateRomanization,
  existingLessons = [],
  colorCodingEnabled = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});
  const [filterMode, setFilterMode] = useState<'all' | 'in_deck' | 'not_in_deck' | 'due'>('all');
  const [isAddingToDeck, setIsAddingToDeck] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editingVocab, setEditingVocab] = useState<Vocabulary | null>(null);

  // Due vocabs count (cards due in at least one direction)
  const dueVocabsCount = useMemo(() => {
    const seenIds = new Set<string>();
    return vocabularies.filter((v) => {
      if (seenIds.has(v.id)) return false;
      seenIds.add(v.id);
      const prog = progressMap[v.id];
      return prog && isAnyDirectionDue(prog);
    }).length;
  }, [vocabularies, progressMap]);

  // In deck count based on actual pool vocabularies
  const inDeckCount = useMemo(() => {
    const seenIds = new Set<string>();
    return vocabularies.filter((v) => {
      if (seenIds.has(v.id)) return false;
      seenIds.add(v.id);
      return Boolean(progressMap[v.id]);
    }).length;
  }, [vocabularies, progressMap]);

  // Phase manipulation states
  const [stepBackConfirmLesson, setStepBackConfirmLesson] = useState<string | null>(null);
  const [isSteppingBack, setIsSteppingBack] = useState(false);
  const [showResetSelectedConfirm, setShowResetSelectedConfirm] = useState(false);
  const [isResettingSelected, setIsResettingSelected] = useState(false);

  // Lesson rename state
  const [renamingLesson, setRenamingLesson] = useState<string | null>(null);
  const [newLessonNameInput, setNewLessonNameInput] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  // Lesson delete state
  const [deletingLesson, setDeletingLesson] = useState<string | null>(null);
  const [deleteOption, setDeleteOption] = useState<'delete_cards' | 'move_to_general'>('delete_cards');
  const [isDeletingLesson, setIsDeletingLesson] = useState(false);

  // Move vocabularies state
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [targetMoveLesson, setTargetMoveLesson] = useState('');
  const [customTargetMoveLesson, setCustomTargetMoveLesson] = useState('');
  const [isMovingVocabs, setIsMovingVocabs] = useState(false);

  // Group by lessons
  const groupedByLesson = useMemo(() => {
    const map: Record<string, Vocabulary[]> = {};
    const seenIds = new Set<string>();
    vocabularies.forEach((v) => {
      if (seenIds.has(v.id)) return;
      seenIds.add(v.id);
      // Apply search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchGerman = v.german.toLowerCase().includes(q);
        const matchThai = v.thai.toLowerCase().includes(q);
        const matchRom = (v.romanization || '').toLowerCase().includes(q);
        const matchLesson = v.lesson.toLowerCase().includes(q);
        if (!matchGerman && !matchThai && !matchRom && !matchLesson) {
          return;
        }
      }

      // Apply deck filter
      const inDeck = Boolean(progressMap[v.id]);
      if (filterMode === 'in_deck' && !inDeck) return;
      if (filterMode === 'not_in_deck' && inDeck) return;
      if (filterMode === 'due' && (!inDeck || !isAnyDirectionDue(progressMap[v.id]))) return;

      const lessonName = v.lesson || 'Allgemein';
      if (!map[lessonName]) map[lessonName] = [];
      map[lessonName].push(v);
    });
    return map;
  }, [vocabularies, searchQuery, filterMode, progressMap]);

  const allLessonsList = useMemo(() => {
    const set = new Set<string>();
    vocabularies.forEach((v) => {
      if (v.lesson) set.add(v.lesson);
    });
    return Array.from(set);
  }, [vocabularies]);

  const allFilteredVocabs = useMemo(() => {
    return Object.values(groupedByLesson).flat();
  }, [groupedByLesson]);

  const allFilteredSelected = useMemo(() => {
    if (allFilteredVocabs.length === 0) return false;
    return allFilteredVocabs.every((v) => selectedIds.has(v.id));
  }, [allFilteredVocabs, selectedIds]);

  const toggleSelectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        allFilteredVocabs.forEach((v) => next.delete(v.id));
      } else {
        allFilteredVocabs.forEach((v) => next.add(v.id));
      }
      return next;
    });
  };

  const toggleSelectCard = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectLesson = (lessonVocabs: Vocabulary[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = lessonVocabs.every((v) => next.has(v.id));
      if (allSelected) {
        lessonVocabs.forEach((v) => next.delete(v.id));
      } else {
        lessonVocabs.forEach((v) => next.add(v.id));
      }
      return next;
    });
  };

  const toggleExpand = (lesson: string) => {
    setExpandedLessons((prev) => ({
      ...prev,
      [lesson]: !isLessonExpanded(lesson),
    }));
  };

  const isLessonExpanded = (lesson: string) => {
    if (searchQuery.trim()) {
      return expandedLessons[lesson] !== false; // auto-expand during active search
    }
    return Boolean(expandedLessons[lesson]); // collapsed by default upon initial load
  };

  const areAllExpanded = useMemo(() => {
    const lessonKeys = Object.keys(groupedByLesson);
    if (lessonKeys.length === 0) return false;
    return lessonKeys.every((l) => isLessonExpanded(l));
  }, [groupedByLesson, expandedLessons, searchQuery]);

  const toggleAllLessons = () => {
    const lessonKeys = Object.keys(groupedByLesson);
    const targetState = !areAllExpanded;
    const next: Record<string, boolean> = {};
    lessonKeys.forEach((l) => {
      next[l] = targetState;
    });
    setExpandedLessons(next);
  };

  // Handle start study with selected cards
  const handleStartStudySelected = () => {
    const list = vocabularies
      .filter((v) => selectedIds.has(v.id))
      .map((v) => ({ vocab: v, progress: progressMap[v.id] }));
    if (list.length > 0) {
      onSelectForStudy(list);
    }
  };

  // Handle batch adding to personal deck
  const handleAddSelectedToDeck = async () => {
    const idsToAdd = Array.from(selectedIds).filter((id) => !progressMap[id]);
    if (!idsToAdd.length) return;
    setIsAddingToDeck(true);
    try {
      await onAddBatchToDeck(idsToAdd);
      // Keep selectedIds intact so the user can immediately proceed to study or manage the selection!
      setToastMessage(
        `✓ ${idsToAdd.length} ${
          idsToAdd.length === 1 ? 'Vokabel' : 'Vokabeln'
        } erfolgreich zur Abfrage hinzugefügt! Die Karten sind jetzt in Phase 1 gespeichert.`
      );
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setIsAddingToDeck(false);
    }
  };

  // Handle Rename Lesson
  const handleConfirmRenameLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingLesson || !newLessonNameInput.trim()) return;
    if (!onRenameLesson) return;

    setIsRenaming(true);
    try {
      await onRenameLesson(renamingLesson, newLessonNameInput.trim());
      setToastMessage(`✓ Lektion „${renamingLesson}“ umbenannt in „${newLessonNameInput.trim()}“!`);
      setRenamingLesson(null);
      setNewLessonNameInput('');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      setToastMessage(`Fehler beim Umbenennen: ${err.message || 'Unbekannt'}`);
    } finally {
      setIsRenaming(false);
    }
  };

  // Handle Delete Lesson
  const handleConfirmDeleteLesson = async () => {
    if (!deletingLesson) return;
    if (!onDeleteLesson) return;

    setIsDeletingLesson(true);
    try {
      await onDeleteLesson(
        deletingLesson,
        deleteOption === 'delete_cards',
        deleteOption === 'move_to_general' ? 'Allgemein' : undefined
      );
      if (deleteOption === 'delete_cards') {
        const deletedVocabIds = (groupedByLesson[deletingLesson] || []).map((v) => v.id);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          deletedVocabIds.forEach((id) => next.delete(id));
          return next;
        });
      }
      setToastMessage(`✓ Lektion „${deletingLesson}“ erfolgreich gelöscht!`);
      setDeletingLesson(null);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      setToastMessage(`Fehler beim Löschen: ${err.message || 'Unbekannt'}`);
    } finally {
      setIsDeletingLesson(false);
    }
  };

  // Handle Move Vocabularies
  const handleConfirmMoveVocabs = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTarget =
      targetMoveLesson === '__new__' ? customTargetMoveLesson.trim() : targetMoveLesson.trim();

    if (!finalTarget) return;
    if (!onMoveVocabs) return;

    const ids = Array.from(selectedIds);
    if (!ids.length) return;

    setIsMovingVocabs(true);
    try {
      await onMoveVocabs(ids, finalTarget);
      setToastMessage(`✓ ${ids.length} Vokabeln nach „${finalTarget}“ verschoben!`);
      setSelectedIds(new Set());
      setMoveModalOpen(false);
      setTargetMoveLesson('');
      setCustomTargetMoveLesson('');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      setToastMessage(`Fehler beim Verschieben: ${err.message || 'Unbekannt'}`);
    } finally {
      setIsMovingVocabs(false);
    }
  };

  // Handle Step Back All Cards in Lesson
  const handleConfirmStepBackLesson = async () => {
    if (!stepBackConfirmLesson || !onStepBackLesson) return;
    setIsSteppingBack(true);
    try {
      const count = await onStepBackLesson(stepBackConfirmLesson);
      setToastMessage(
        `✓ ${count} Vokabeln der Lektion „${stepBackConfirmLesson}“ um eine Phase zurückgestellt!`
      );
      setStepBackConfirmLesson(null);
      setTimeout(() => setToastMessage(null), 4500);
    } catch (err: any) {
      setToastMessage(`Fehler: ${err.message || 'Konnte Phase nicht zurückstellen'}`);
    } finally {
      setIsSteppingBack(false);
    }
  };

  // Handle Reset Selected Cards to Phase 1 (von Anfang an lernen)
  const handleConfirmResetSelected = async () => {
    if (!selectedIds.size || !onResetVocabsPhase) return;
    setIsResettingSelected(true);
    try {
      const ids = Array.from(selectedIds);
      const count = await onResetVocabsPhase(ids);
      setToastMessage(
        `✓ ${count} ausgewählte Vokabeln werden jetzt von Anfang an gelernt (in Phase 1 zurückgesetzt)!`
      );
      setSelectedIds(new Set());
      setShowResetSelectedConfirm(false);
      setTimeout(() => setToastMessage(null), 4500);
    } catch (err: any) {
      setToastMessage(`Fehler: ${err.message || 'Konnte Vokabeln nicht zurücksetzen'}`);
    } finally {
      setIsResettingSelected(false);
    }
  };

  // Handle Batch Delete Selected Cards
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);

  const handleConfirmBatchDelete = async () => {
    if (!selectedIds.size) return;
    setIsBatchDeleting(true);
    try {
      const idsToDelete = Array.from(selectedIds);
      if (onBatchDeleteVocabs) {
        await onBatchDeleteVocabs(idsToDelete);
      } else if (onDeleteVocab) {
        for (const id of idsToDelete) {
          await onDeleteVocab(id);
        }
      }
      setSelectedIds(new Set());
      setShowBatchDeleteConfirm(false);
      setToastMessage(
        `✓ ${idsToDelete.length} Vokabelkarte(n) gelöscht (im Papierkorb unter Einstellungen wiederherstellbar)`
      );
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      setToastMessage(`Fehler: ${err?.message || 'Konnte Vokabeln nicht löschen'}`);
    } finally {
      setIsBatchDeleting(false);
    }
  };

  // Sync / Recalculate romanization modal state
  const [showSyncRomanizationModal, setShowSyncRomanizationModal] = useState(false);
  const [syncScope, setSyncScope] = useState<'selected' | 'all'>('selected');
  const [syncOnlyDiffs, setSyncOnlyDiffs] = useState<boolean>(true);
  const [isSyncingRomanization, setIsSyncingRomanization] = useState(false);
  const [showDiffPreviewList, setShowDiffPreviewList] = useState(false);

  const targetSyncVocabs = useMemo(() => {
    if (syncScope === 'selected' && selectedIds.size > 0) {
      return vocabularies.filter((v) => selectedIds.has(v.id));
    }
    return vocabularies;
  }, [syncScope, selectedIds, vocabularies]);

  const syncDiffs = useMemo(() => {
    return targetSyncVocabs.map((v) => {
      const generated = generateRomanizationFromThai(v.thai).romanization;
      const isDifferent = Boolean(
        generated && generated.trim().toLowerCase() !== (v.romanization || '').trim().toLowerCase()
      );
      return {
        vocab: v,
        current: v.romanization || '',
        generated: generated || '',
        isDifferent,
      };
    });
  }, [targetSyncVocabs]);

  const changedDiffs = useMemo(() => {
    return syncDiffs.filter((d) => d.isDifferent && d.generated);
  }, [syncDiffs]);

  const finalUpdatesToApply = useMemo(() => {
    if (syncOnlyDiffs) {
      return changedDiffs.map((d) => ({ id: d.vocab.id, romanization: d.generated }));
    }
    return syncDiffs
      .filter((d) => d.generated)
      .map((d) => ({ id: d.vocab.id, romanization: d.generated }));
  }, [syncOnlyDiffs, changedDiffs, syncDiffs]);

  const handleConfirmSyncRomanization = async () => {
    if (!onBatchUpdateRomanization || !finalUpdatesToApply.length) return;
    setIsSyncingRomanization(true);
    try {
      const count = await onBatchUpdateRomanization(finalUpdatesToApply);
      setToastMessage(
        `✓ Lautschrift & Töne für ${count} ${
          count === 1 ? 'Vokabel' : 'Vokabeln'
        } erfolgreich nachgezogen & aktualisiert!`
      );
      setShowSyncRomanizationModal(false);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err: any) {
      setToastMessage(`Fehler beim Nachziehen: ${err.message || 'Unbekannt'}`);
    } finally {
      setIsSyncingRomanization(false);
    }
  };

  const selectedCount = selectedIds.size;
  const selectedNotInDeck = Array.from(selectedIds).filter((id) => !progressMap[id]).length;

  return (
    <div className="max-w-md mx-auto px-4 pt-3 pb-40 text-white">
      {/* Top Header matching IMG_6341.png with Lautschrift nachziehen button */}
      <div className="flex items-center justify-between py-2 mb-3 gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Kärtchen auswählen
          </h1>
          <p className="text-[11px] text-[#8E8E93]">
            {vocabularies.length} Vokabeln im Pool
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {onNavigateReference && (
            <button
              type="button"
              onClick={onNavigateReference}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#242426] border border-[#3A3A3D] hover:border-amber-400/60 text-xs text-[#D1D1D6] hover:text-white transition-colors cursor-pointer shadow-sm active:scale-95"
              title="Thai-Tafel & Spickzettel öffnen"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>Tafel</span>
            </button>
          )}
          {onBatchUpdateRomanization && (
            <button
              type="button"
              onClick={() => {
                setSyncScope(selectedIds.size > 0 ? 'selected' : 'all');
                setShowDiffPreviewList(false);
                setShowSyncRomanizationModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#242426] border border-[#3A3A3D] hover:border-emerald-500/60 text-xs text-[#D1D1D6] hover:text-white transition-colors cursor-pointer shadow-sm active:scale-95"
              title="Lautschrift & Töne im Pool nachziehen"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Lautschrift</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Confirmation Toast */}
      {toastMessage && (
        <div className="mb-4 p-3 bg-[#242426] border border-emerald-500/50 rounded-2xl text-xs text-emerald-300 flex items-center justify-between gap-2 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#8E8E93] hover:text-white text-xs px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Pill Search Bar matching IMG_6341.png */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E8E93]">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Suche Vokabeln (Deutsch, Thai, Lautschrift)..."
          className="w-full pl-10 pr-4 py-3 bg-[#242426] rounded-full text-sm text-white placeholder-[#8E8E93] border border-[#323236] focus:outline-none focus:border-[#FF7A00] transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-[#8E8E93] hover:text-white cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Quick Filter chips */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilterMode('all')}
          className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
            filterMode === 'all'
              ? 'bg-[#FF7A00] text-black font-semibold'
              : 'bg-[#242426] text-[#8E8E93] border border-[#323236]'
          }`}
        >
          Alle ({vocabularies.length})
        </button>
        <button
          onClick={() => setFilterMode('in_deck')}
          className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
            filterMode === 'in_deck'
              ? 'bg-[#FF7A00] text-black font-semibold'
              : 'bg-[#242426] text-[#8E8E93] border border-[#323236]'
          }`}
        >
          In meinem Deck ({inDeckCount})
        </button>
        <button
          onClick={() => setFilterMode('not_in_deck')}
          className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
            filterMode === 'not_in_deck'
              ? 'bg-[#FF7A00] text-black font-semibold'
              : 'bg-[#242426] text-[#8E8E93] border border-[#323236]'
          }`}
        >
          Noch nicht gelernt ({Math.max(0, vocabularies.length - inDeckCount)})
        </button>
        <button
          onClick={() => setFilterMode('due')}
          className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
            filterMode === 'due'
              ? 'bg-amber-500 text-black font-semibold'
              : 'bg-[#242426] text-amber-400 border border-amber-500/30'
          }`}
        >
          <span>⚡ Fällig zur Abfrage</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            filterMode === 'due' ? 'bg-black text-amber-400' : 'bg-amber-500/20 text-amber-300'
          }`}>
            {dueVocabsCount}
          </span>
        </button>
      </div>

      {/* Course Header Banner */}
      <div className="bg-[#242426] rounded-2xl p-3 flex items-center justify-between border border-[#323236] mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-[#444448] flex items-center justify-center text-lg shrink-0">
            🇹🇭
          </div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-white tracking-tight truncate block">Thai Grund- & Aufbauwortschatz</span>
            <p className="text-[11px] text-[#8E8E93] truncate">Gemeinsamer Wortschatz • Lektionen bearbeiten & verschieben</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {allFilteredVocabs.length > 0 && (
            <button
              type="button"
              onClick={toggleSelectAllFiltered}
              className={`text-[11px] whitespace-nowrap px-2.5 py-1 rounded-lg border transition-colors cursor-pointer font-medium ${
                allFilteredSelected
                  ? 'bg-[#FF7A00] text-black border-[#FF7A00]'
                  : 'text-[#D1D1D6] hover:text-white bg-[#1C1C1E] border-[#3A3A3D]'
              }`}
              title="Alle aktuell sichtbaren Vokabeln markieren oder abwählen"
            >
              {allFilteredSelected ? 'Auswahl aufheben' : `Alle markieren (${allFilteredVocabs.length})`}
            </button>
          )}

          {Object.keys(groupedByLesson).length > 1 && (
            <button
              type="button"
              onClick={toggleAllLessons}
              className="text-[11px] text-[#FF7A00] hover:text-[#FFA040] whitespace-nowrap px-2.5 py-1 rounded-lg bg-[#FF7A00]/10 border border-[#FF7A00]/20 transition-colors cursor-pointer font-medium"
            >
              {areAllExpanded ? 'Zuklappen' : 'Aufklappen'}
            </button>
          )}
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {Object.keys(groupedByLesson).length === 0 ? (
          <div className="text-center py-12 bg-[#1C1C1E] rounded-3xl border border-[#2C2C2E] p-6">
            <BookOpen className="w-10 h-10 text-[#71717A] mx-auto mb-3" />
            <p className="text-sm font-medium text-white">Keine Vokabeln gefunden</p>
            <p className="text-xs text-[#8E8E93] mt-1 mb-4">
              Passe deine Suche an oder erstelle neue Vokabelkarten.
            </p>
            <button
              onClick={onNavigateCreate}
              className="px-4 py-2 bg-[#FF7A00] text-black rounded-full font-semibold text-xs hover:bg-[#FF881A] cursor-pointer"
            >
              + Neue Vokabel anlegen
            </button>
          </div>
        ) : (
          Object.entries(groupedByLesson).map(([lesson, items]) => {
            const isExpanded = isLessonExpanded(lesson);
            const selectedInLesson = items.filter((v) => selectedIds.has(v.id)).length;
            const allInLessonSelected = items.length > 0 && selectedInLesson === items.length;

            return (
              <div
                key={lesson}
                className="bg-[#242426] rounded-2xl border border-[#323236] overflow-hidden transition-all"
              >
                {/* Accordion Header */}
                <div className={`p-3.5 flex items-center justify-between ${isExpanded ? 'border-b border-[#323236]/60' : ''}`}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Checkbox for entire lesson */}
                    <button
                      type="button"
                      onClick={() => toggleSelectLesson(items)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                        allInLessonSelected
                          ? 'bg-[#FF7A00] border-[#FF7A00]'
                          : selectedInLesson > 0
                          ? 'bg-[#FF7A00]/20 border-[#FF7A00]'
                          : 'border-[#52525B] bg-[#1C1C1E]'
                      }`}
                    >
                      {allInLessonSelected && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                      {!allInLessonSelected && selectedInLesson > 0 && (
                        <div className="w-2 h-2 rounded-xs bg-[#FF7A00]" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleExpand(lesson)}
                      className="flex items-center justify-between flex-1 text-left min-w-0 pr-1 cursor-pointer"
                    >
                      <span className="text-sm font-semibold text-white truncate">
                        {lesson}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {/* Step Back Phase button for lesson */}
                    {onStepBackLesson && (
                      <button
                        type="button"
                        onClick={() => setStepBackConfirmLesson(lesson)}
                        className="p-1 rounded-md text-[#8E8E93] hover:text-amber-400 hover:bg-[#1C1C1E] transition-colors cursor-pointer"
                        title="Alle Vokabeln dieser Lektion um eine Phase zurückschieben"
                      >
                        <ArrowDownCircle className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Rename Lesson button */}
                    {onRenameLesson && (
                      <button
                        type="button"
                        onClick={() => {
                          setRenamingLesson(lesson);
                          setNewLessonNameInput(lesson);
                        }}
                        className="p-1 rounded-md text-[#8E8E93] hover:text-[#FF7A00] hover:bg-[#1C1C1E] transition-colors cursor-pointer"
                        title="Lektion umbenennen"
                      >
                        <FolderEdit className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Delete Lesson button */}
                    {onDeleteLesson && (
                      <button
                        type="button"
                        onClick={() => {
                          setDeletingLesson(lesson);
                          setDeleteOption('delete_cards');
                        }}
                        className="p-1 rounded-md text-[#8E8E93] hover:text-rose-400 hover:bg-[#1C1C1E] transition-colors cursor-pointer"
                        title="Lektion löschen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <span className="text-xs font-semibold text-[#FF7A00] px-1">
                      {selectedInLesson} / {items.length}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleExpand(lesson)}
                      className="p-1 text-[#8E8E93] hover:text-white cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#8E8E93]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#8E8E93]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Items in Lesson */}
                {isExpanded && (
                  <div className="divide-y divide-[#323236]/50">
                    {items.map((vocab) => {
                      const isSelected = selectedIds.has(vocab.id);
                      const prog = progressMap[vocab.id];
                      const inDeck = Boolean(prog);

                      return (
                        <div
                          key={vocab.id}
                          className={`p-3.5 flex items-center gap-3.5 hover:bg-[#2C2C2E] transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#2A2A2E]' : ''
                          }`}
                          onClick={() => toggleSelectCard(vocab.id)}
                        >
                          {/* Square rounded checkbox matching IMG_6341.png */}
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-[#FF7A00] border-[#FF7A00]'
                                : 'border-[#52525B] bg-[#1C1C1E]'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                          </div>

                          {/* 2-Line Text Content matching IMG_6341.png */}
                          <div className="flex-1 min-w-0">
                            {/* Line 1: German / Meaning */}
                            <p className="text-sm font-medium text-white truncate">
                              {vocab.german}
                            </p>

                            {/* Line 2: Thai + Romanization + Tone Badges */}
                            <div className="text-xs text-[#A1A1AA] mt-0.5 flex items-center gap-1.5 flex-wrap">
                              <ThaiColorWord
                                text={vocab.thai}
                                enabled={colorCodingEnabled}
                                className="text-[#E4E4E7] font-thai font-medium"
                              />
                              {vocab.romanization && (
                                <span className="text-[#FF7A00] font-sans">
                                  {vocab.romanization}
                                </span>
                              )}
                              <ToneVisualizer
                                romanization={vocab.romanization}
                                thai={vocab.thai}
                                compact
                              />
                            </div>
                          </div>

                          {/* Right Status / Actions */}
                          <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                            {/* Edit button */}
                            <button
                              type="button"
                              onClick={() => setEditingVocab(vocab)}
                              className="p-1 rounded-full text-[#71717A] hover:text-[#FF7A00] transition-colors cursor-pointer"
                              title="Vokabel bearbeiten / Lektion ändern"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* Audio pronunciation icon */}
                            <button
                              type="button"
                              onClick={() => speakThai(vocab.thai)}
                              className="p-1 rounded-full text-[#71717A] hover:text-white transition-colors cursor-pointer"
                              title="Aussprache anhören"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Phase pills if in deck (independent for both directions) */}
                            {inDeck ? (
                              <div className="flex flex-col items-end">
                                {(() => {
                                  const deProg = getDirectionProgress(prog, 'de_to_th');
                                  const thProg = getDirectionProgress(prog, 'th_to_de');
                                  const deDue = formatDueDate(deProg.nextReviewDate);
                                  const thDue = formatDueDate(thProg.nextReviewDate);
                                  const isAnyDue = deDue.isDue || thDue.isDue;

                                  return (
                                    <>
                                      <div className="flex items-center gap-1">
                                        <span
                                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold text-white ${
                                            PHASES[deProg.phase]?.badgeBg || 'bg-gray-600'
                                          }`}
                                          title={`Deutsch ➔ Thai: Phase ${deProg.phase} (${deDue.label})`}
                                        >
                                          🇩🇪→🇹🇭 P{deProg.phase}
                                        </span>
                                        <span
                                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold text-white ${
                                            PHASES[thProg.phase]?.badgeBg || 'bg-gray-600'
                                          }`}
                                          title={`Thai ➔ Deutsch: Phase ${thProg.phase} (${thDue.label})`}
                                        >
                                          🇹🇭→🇩🇪 P{thProg.phase}
                                        </span>
                                      </div>

                                      <span
                                        className={`text-[9px] mt-0.5 font-medium whitespace-nowrap ${
                                          isAnyDue
                                            ? 'text-amber-400 font-semibold'
                                            : 'text-[#8E8E93]'
                                        }`}
                                        title={`Nächste Abfrage: DE➔TH (${deDue.label}), TH➔DE (${thDue.label})`}
                                      >
                                        {isAnyDue ? 'Fällig' : deDue.daysDiff <= thDue.daysDiff ? deDue.label : thDue.label}
                                      </span>
                                    </>
                                  );
                                })()}
                              </div>
                            ) : (
                              <span className="text-[10px] bg-[#323236] text-[#8E8E93] px-1.5 py-0.5 rounded">
                                Neu
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Rename Lesson Modal */}
      {renamingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl w-full max-w-sm p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2C2C2E] mb-4">
              <div className="flex items-center gap-2">
                <FolderEdit className="w-5 h-5 text-[#FF7A00]" />
                <h3 className="text-base font-bold text-white">Lektion umbenennen</h3>
              </div>
              <button
                onClick={() => setRenamingLesson(null)}
                className="w-7 h-7 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#8E8E93] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmRenameLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#8E8E93] mb-1">
                  Neuer Name für „{renamingLesson}“
                </label>
                <input
                  type="text"
                  value={newLessonNameInput}
                  onChange={(e) => setNewLessonNameInput(e.target.value)}
                  placeholder="z.B. Familie & Freunde"
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 bg-[#242426] border border-[#3A3A3D] rounded-xl text-sm text-white focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRenamingLesson(null)}
                  className="flex-1 py-2.5 rounded-full bg-[#2C2C2E] text-white text-xs font-semibold hover:bg-[#3A3A3D] cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isRenaming || !newLessonNameInput.trim()}
                  className="flex-1 py-2.5 rounded-full bg-[#FF7A00] text-black text-xs font-semibold hover:bg-[#FF881A] cursor-pointer disabled:opacity-50"
                >
                  {isRenaming ? 'Wird gespeichert...' : 'Umbenennen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Lesson Modal */}
      {deletingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1C1C1E] border border-rose-500/30 rounded-3xl w-full max-w-sm p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2C2C2E] mb-4">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="text-base font-bold text-white">Lektion löschen</h3>
              </div>
              <button
                onClick={() => setDeletingLesson(null)}
                className="w-7 h-7 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#8E8E93] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#D1D1D6] mb-4 leading-relaxed">
              Möchtest du die Lektion <span className="text-white font-bold">„{deletingLesson}“</span> wirklich entfernen?
            </p>

            <div className="space-y-2 mb-5 text-xs">
              <label
                onClick={() => setDeleteOption('delete_cards')}
                className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                  deleteOption === 'delete_cards'
                    ? 'border-rose-500/60 bg-rose-500/10 text-white'
                    : 'border-[#323236] bg-[#242426] text-[#8E8E93]'
                }`}
              >
                <input
                  type="radio"
                  name="delOption"
                  checked={deleteOption === 'delete_cards'}
                  onChange={() => setDeleteOption('delete_cards')}
                  className="mt-0.5 text-rose-500"
                />
                <div>
                  <p className="font-semibold text-rose-300">Alle Vokabeln dieser Lektion löschen</p>
                  <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                    Die Karten werden komplett aus der App entfernt.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setDeleteOption('move_to_general')}
                className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                  deleteOption === 'move_to_general'
                    ? 'border-[#FF7A00]/60 bg-[#FF7A00]/10 text-white'
                    : 'border-[#323236] bg-[#242426] text-[#8E8E93]'
                }`}
              >
                <input
                  type="radio"
                  name="delOption"
                  checked={deleteOption === 'move_to_general'}
                  onChange={() => setDeleteOption('move_to_general')}
                  className="mt-0.5 text-[#FF7A00]"
                />
                <div>
                  <p className="font-semibold text-[#FF7A00]">Vokabeln in „Allgemein“ verschieben</p>
                  <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                    Nur die Lektion wird gelöscht, die Vokabeln bleiben erhalten.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeletingLesson(null)}
                className="flex-1 py-2.5 rounded-full bg-[#2C2C2E] text-white text-xs font-semibold hover:bg-[#3A3A3D] cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteLesson}
                disabled={isDeletingLesson}
                className="flex-1 py-2.5 rounded-full bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 cursor-pointer disabled:opacity-50"
              >
                {isDeletingLesson ? 'Löschen...' : 'Löschen bestätigen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Selected Vocabs Modal */}
      {moveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl w-full max-w-sm p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2C2C2E] mb-4">
              <div className="flex items-center gap-2">
                <FolderInput className="w-5 h-5 text-[#FF7A00]" />
                <h3 className="text-base font-bold text-white">Vokabeln verschieben</h3>
              </div>
              <button
                onClick={() => setMoveModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#8E8E93] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmMoveVocabs} className="space-y-4">
              <p className="text-xs text-[#8E8E93]">
                Verschiebe die <span className="text-[#FF7A00] font-semibold">{selectedIds.size}</span> ausgewählten Vokabeln in eine Lektion:
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#8E8E93] mb-1">
                  Ziel-Lektion auswählen
                </label>
                <select
                  value={targetMoveLesson}
                  onChange={(e) => setTargetMoveLesson(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#242426] border border-[#3A3A3D] rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7A00]"
                >
                  <option value="">-- Lektion wählen --</option>
                  {allLessonsList.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                  <option value="__new__">+ Neue Lektion anlegen...</option>
                </select>
              </div>

              {targetMoveLesson === '__new__' && (
                <div>
                  <label className="block text-xs font-medium text-[#8E8E93] mb-1">
                    Name der neuen Lektion
                  </label>
                  <input
                    type="text"
                    value={customTargetMoveLesson}
                    onChange={(e) => setCustomTargetMoveLesson(e.target.value)}
                    placeholder="z.B. Restaurant & Bestellen"
                    required
                    autoFocus
                    className="w-full px-3.5 py-2.5 bg-[#242426] border border-[#3A3A3D] rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7A00]"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMoveModalOpen(false)}
                  className="flex-1 py-2.5 rounded-full bg-[#2C2C2E] text-white text-xs font-semibold hover:bg-[#3A3A3D] cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={
                    isMovingVocabs ||
                    !targetMoveLesson ||
                    (targetMoveLesson === '__new__' && !customTargetMoveLesson.trim())
                  }
                  className="flex-1 py-2.5 rounded-full bg-[#FF7A00] text-black text-xs font-semibold hover:bg-[#FF881A] cursor-pointer disabled:opacity-50"
                >
                  {isMovingVocabs ? 'Verschieben...' : 'Verschieben'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vocab Modal */}
      {editingVocab && (
        <EditVocabModal
          vocab={editingVocab}
          currentPhase={progressMap[editingVocab.id]?.phase || 1}
          currentDePhase={getDirectionProgress(progressMap[editingVocab.id], 'de_to_th').phase}
          currentThPhase={getDirectionProgress(progressMap[editingVocab.id], 'th_to_de').phase}
          isOpen={Boolean(editingVocab)}
          onClose={() => setEditingVocab(null)}
          onSave={async (id, data) => {
            if (onUpdateVocab) {
              await onUpdateVocab(id, data);
              setToastMessage('✓ Vokabel erfolgreich aktualisiert!');
              setTimeout(() => setToastMessage(null), 3500);
            }
          }}
          onDelete={
            onDeleteVocab
              ? async (id) => {
                  await onDeleteVocab(id);
                  setSelectedIds((prev) => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                  });
                  setToastMessage('✓ Vokabel gelöscht.');
                  setTimeout(() => setToastMessage(null), 3500);
                }
              : undefined
          }
          onUpdatePhase={onUpdateSinglePhase}
          existingLessons={
            existingLessons.length > 0
              ? existingLessons
              : Object.keys(groupedByLesson)
          }
        />
      )}

      {/* Modal: Lektion um eine Phase zurückstellen */}
      {stepBackConfirmLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1C1C1E] border border-amber-500/40 rounded-3xl w-full max-w-sm p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2C2C2E] mb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <ArrowDownCircle className="w-5 h-5 shrink-0" />
                <h3 className="text-base font-bold text-white">Lektion zurückstellen</h3>
              </div>
              <button
                onClick={() => setStepBackConfirmLesson(null)}
                className="w-7 h-7 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#8E8E93] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#D1D1D6] mb-3 leading-relaxed">
              Möchtest du alle Vokabeln der Lektion <strong className="text-white">„{stepBackConfirmLesson}“</strong> um eine Phase zurückschieben?
            </p>

            <div className="bg-[#242426] p-3 rounded-xl border border-[#323236] text-[11px] text-[#A1A1AA] mb-4 space-y-1">
              <p>• Vokabeln in Phase 2–6 fallen jeweils um eine Stufe zurück (z. B. Phase 3 &rarr; 2).</p>
              <p>• Vokabeln in Phase 1 bleiben in Phase 1 und sind sofort wieder fällig.</p>
              <p>• Noch nicht gelernte Karten werden in Phase 1 aufgenommen.</p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStepBackConfirmLesson(null)}
                className="flex-1 py-2.5 rounded-full bg-[#2C2C2E] text-white text-xs font-semibold hover:bg-[#3A3A3D] cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleConfirmStepBackLesson}
                disabled={isSteppingBack}
                className="flex-1 py-2.5 rounded-full bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 cursor-pointer disabled:opacity-50"
              >
                {isSteppingBack ? 'Zurückstellen...' : '1 Phase zurück'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ausgewählte Vokabeln von Anfang an lernen (Phase 1) */}
      {showResetSelectedConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1C1C1E] border border-[#FF7A00]/40 rounded-3xl w-full max-w-sm p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2C2C2E] mb-3">
              <div className="flex items-center gap-2 text-[#FF7A00]">
                <RotateCcw className="w-5 h-5 shrink-0" />
                <h3 className="text-base font-bold text-white">Von Anfang an lernen</h3>
              </div>
              <button
                onClick={() => setShowResetSelectedConfirm(false)}
                className="w-7 h-7 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#8E8E93] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#D1D1D6] mb-3 leading-relaxed">
              Möchtest du die <strong className="text-[#FF7A00]">{selectedCount}</strong> ausgewählten {selectedCount === 1 ? 'Vokabel' : 'Vokabeln'} komplett von vorne lernen?
            </p>

            <div className="bg-[#242426] p-3 rounded-xl border border-[#323236] text-[11px] text-[#A1A1AA] mb-4 space-y-1">
              <p>• Alle markierten Vokabeln werden auf <strong className="text-white">Phase 1</strong> gesetzt.</p>
              <p>• Die Karten stehen ab sofort direkt zur Wiederholung bereit.</p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowResetSelectedConfirm(false)}
                className="flex-1 py-2.5 rounded-full bg-[#2C2C2E] text-white text-xs font-semibold hover:bg-[#3A3A3D] cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleConfirmResetSelected}
                disabled={isResettingSelected}
                className="flex-1 py-2.5 rounded-full bg-[#FF7A00] text-black text-xs font-bold hover:bg-[#FF881A] cursor-pointer disabled:opacity-50"
              >
                {isResettingSelected ? 'Zurücksetzen...' : 'Auf Phase 1 setzen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ausgewählte Vokabeln löschen */}
      {showBatchDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1C1C1E] border border-rose-500/40 rounded-3xl w-full max-w-sm p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2C2C2E] mb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="text-base font-bold text-white">Vokabeln löschen</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBatchDeleteConfirm(false)}
                className="w-7 h-7 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#8E8E93] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#D1D1D6] mb-3 leading-relaxed">
              Möchtest du die <strong className="text-rose-400">{selectedIds.size}</strong> ausgewählten {selectedIds.size === 1 ? 'Vokabelkarte' : 'Vokabelkarten'} wirklich löschen?
            </p>

            <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-[11px] text-[#D1D1D6] mb-4 leading-relaxed">
              Die Vokabeln werden in den Papierkorb verschoben und können in den <strong className="text-white">Einstellungen</strong> jederzeit wiederhergestellt werden.
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowBatchDeleteConfirm(false)}
                disabled={isBatchDeleting}
                className="flex-1 py-2.5 rounded-full bg-[#2C2C2E] text-white text-xs font-semibold hover:bg-[#3A3A3D] cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleConfirmBatchDelete}
                disabled={isBatchDeleting}
                className="flex-1 py-2.5 rounded-full bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isBatchDeleting ? 'Löschen...' : `Löschen (${selectedIds.size})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Lautschrift & Töne nachziehen (Auto-Korrektur / Wörterbuch-Sync) */}
      {showSyncRomanizationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-[#1C1C1E] border border-emerald-500/40 rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col text-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#2C2C2E] flex items-center justify-between shrink-0 bg-[#1C1C1E]">
              <div className="flex items-center gap-2 text-emerald-400">
                <Sparkles className="w-5 h-5 shrink-0" />
                <h3 className="text-base font-bold text-white">Lautschrift & Töne nachziehen</h3>
              </div>
              <button
                onClick={() => setShowSyncRomanizationModal(false)}
                className="w-7 h-7 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#8E8E93] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <p className="text-[#D1D1D6] leading-relaxed">
                Aktualisiert die Lautschrift (inklusive Tonhöhen-Akzenten) auf Basis der neuesten phonetischen Grammatikregeln und des erweiterten Thai-Wörterbuchs.
              </p>

              {/* Scope Selection */}
              <div>
                <label className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-2">
                  Umfang auswählen:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={selectedIds.size === 0}
                    onClick={() => setSyncScope('selected')}
                    className={`p-3 rounded-2xl border text-left transition-colors cursor-pointer ${
                      syncScope === 'selected'
                        ? 'border-emerald-500 bg-emerald-500/10 text-white font-medium'
                        : 'border-[#323236] bg-[#242426] text-[#A1A1AA] hover:border-[#444448]'
                    } ${selectedIds.size === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-white">Markierte Vokabeln</span>
                      {syncScope === 'selected' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <span className="text-[11px] text-[#8E8E93]">
                      {selectedIds.size} ausgewählt
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSyncScope('all')}
                    className={`p-3 rounded-2xl border text-left transition-colors cursor-pointer ${
                      syncScope === 'all'
                        ? 'border-emerald-500 bg-emerald-500/10 text-white font-medium'
                        : 'border-[#323236] bg-[#242426] text-[#A1A1AA] hover:border-[#444448]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-white">Alle Vokabeln</span>
                      {syncScope === 'all' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <span className="text-[11px] text-[#8E8E93]">
                      {vocabularies.length} im gesamten Pool
                    </span>
                  </button>
                </div>
              </div>

              {/* Status summary banner */}
              <div
                className={`p-3.5 rounded-2xl border flex items-start gap-2.5 ${
                  changedDiffs.length > 0
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : 'bg-[#242426] border-[#323236] text-[#A1A1AA]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-semibold text-xs text-white">
                    {changedDiffs.length > 0
                      ? `${changedDiffs.length} von ${targetSyncVocabs.length} Vokabeln haben Optimierungen verfügbar`
                      : `Alle ${targetSyncVocabs.length} Vokabeln entsprechen bereits dem aktuellen Stand!`}
                  </p>
                  <p className="text-[11px] mt-0.5 opacity-80 leading-relaxed">
                    {changedDiffs.length > 0
                      ? 'Abweichungen wurden erkannt (z. B. ฤ, Schrägstriche, erweiterte Wörterbucheinträge oder Ton-Markierungen).'
                      : 'Es wurden keine Diskrepanzen zwischen der gespeicherten und der neu berechneten Lautschrift gefunden.'}
                  </p>
                </div>
              </div>

              {/* Options Checkbox */}
              <div className="bg-[#242426] p-3 rounded-2xl border border-[#323236] space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={syncOnlyDiffs}
                    onChange={(e) => setSyncOnlyDiffs(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-0 focus:outline-none accent-emerald-500"
                  />
                  <span className="text-xs text-[#E4E4E7]">
                    Nur abweichende / optimierte Lautschriften aktualisieren ({changedDiffs.length})
                  </span>
                </label>
                {!syncOnlyDiffs && (
                  <p className="text-[11px] text-amber-400/90 pl-6.5">
                    Hinweis: Wenn deaktiviert, werden alle {targetSyncVocabs.length} Lautschriften neu generiert und gespeichert.
                  </p>
                )}
              </div>

              {/* Preview collapsible list */}
              {changedDiffs.length > 0 && (
                <div className="border border-[#2C2C2E] rounded-2xl p-3 bg-[#171719]">
                  <button
                    type="button"
                    onClick={() => setShowDiffPreviewList((prev) => !prev)}
                    className="w-full flex items-center justify-between text-xs text-[#8E8E93] hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="font-medium text-white">Vorschau der Änderungen ({changedDiffs.length})</span>
                    {showDiffPreviewList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showDiffPreviewList && (
                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1 mt-3">
                      {changedDiffs.map((d) => (
                        <div
                          key={d.vocab.id}
                          className="p-2.5 bg-[#202024] border border-[#323236] rounded-xl text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-sm">{d.vocab.thai}</span>
                            <span className="text-[10px] text-[#8E8E93] truncate max-w-[140px]">
                              {d.vocab.german}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="text-red-400 line-through opacity-70 truncate font-mono">
                              {d.current || '(leer)'}
                            </span>
                            <span className="text-[#8E8E93]">➔</span>
                            <span className="text-emerald-400 font-semibold font-mono truncate">
                              {d.generated}
                            </span>
                          </div>
                          <ToneVisualizer romanization={d.generated} compact={true} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-[#2C2C2E] flex gap-2 shrink-0 bg-[#1C1C1E]">
              <button
                type="button"
                onClick={() => setShowSyncRomanizationModal(false)}
                className="flex-1 py-2.5 rounded-full bg-[#2C2C2E] text-white text-xs font-semibold hover:bg-[#3A3A3D] cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleConfirmSyncRomanization}
                disabled={isSyncingRomanization || finalUpdatesToApply.length === 0}
                className="flex-1 py-2.5 rounded-full bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-lg"
              >
                {isSyncingRomanization ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Aktualisiere...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>
                      {finalUpdatesToApply.length === 0
                        ? 'Alles aktuell'
                        : `${finalUpdatesToApply.length} Vokabeln nachziehen`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-16 left-0 right-0 z-30 bg-[#121214]/95 backdrop-blur-md border-t border-[#2C2C2E] p-3 px-4">
        <div className="max-w-md mx-auto space-y-2">
          {/* Outlined button: + Vokabeln eingeben */}
          <button
            onClick={onNavigateCreate}
            className="w-full py-2.5 rounded-full bg-[#1C1C1E] border border-[#3A3A3D] text-white font-semibold text-xs hover:bg-[#242426] transition-colors flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#FF7A00]" />
            <span>+ Vokabeln eingeben</span>
          </button>

          {/* Action Row for Selected Vocabs: Move + Von Anfang an lernen + Lautschrift nachziehen + Löschen */}
          {selectedCount > 0 && (
            <div className="grid grid-cols-4 gap-1.5">
              {/* Von Anfang an lernen Button */}
              {onResetVocabsPhase && (
                <button
                  type="button"
                  onClick={() => setShowResetSelectedConfirm(true)}
                  className="py-2.5 px-1.5 rounded-full bg-[#242426] border border-amber-500/50 text-amber-300 font-semibold text-xs hover:bg-[#2C2C2E] transition-colors active:scale-[0.99] flex items-center justify-center gap-1 cursor-pointer shadow"
                  title="Ausgewählte Vokabeln auf Phase 1 zurücksetzen"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Phase 1</span>
                </button>
              )}

              {/* Move to another lesson Button */}
              {onMoveVocabs && (
                <button
                  type="button"
                  onClick={() => {
                    setTargetMoveLesson('');
                    setCustomTargetMoveLesson('');
                    setMoveModalOpen(true);
                  }}
                  className="py-2.5 px-1.5 rounded-full bg-[#242426] border border-[#FF7A00]/50 text-[#FF7A00] font-semibold text-xs hover:bg-[#2C2C2E] transition-colors active:scale-[0.99] flex items-center justify-center gap-1 cursor-pointer shadow"
                  title="Vokabeln in andere Lektion verschieben"
                >
                  <FolderInput className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Verschieben</span>
                </button>
              )}

              {/* Lautschrift nachziehen Button */}
              {onBatchUpdateRomanization && (
                <button
                  type="button"
                  onClick={() => {
                    setSyncScope('selected');
                    setShowDiffPreviewList(false);
                    setShowSyncRomanizationModal(true);
                  }}
                  className="py-2.5 px-1.5 rounded-full bg-[#242426] border border-emerald-500/50 text-emerald-300 font-semibold text-xs hover:bg-[#2C2C2E] transition-colors active:scale-[0.99] flex items-center justify-center gap-1 cursor-pointer shadow"
                  title="Lautschrift & Töne für markierte Vokabeln nachziehen"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">Lautschrift</span>
                </button>
              )}

              {/* Ausgewählte löschen Button */}
              {(onBatchDeleteVocabs || onDeleteVocab) && (
                <button
                  type="button"
                  onClick={() => setShowBatchDeleteConfirm(true)}
                  className="py-2.5 px-1.5 rounded-full bg-[#242426] border border-rose-500/50 text-rose-300 font-semibold text-xs hover:bg-[#2C2C2E] transition-colors active:scale-[0.99] flex items-center justify-center gap-1 cursor-pointer shadow"
                  title="Ausgewählte Vokabeln löschen"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">Löschen</span>
                </button>
              )}
            </div>
          )}

          {/* If cards not in deck are selected, show add option, or directly study */}
          {selectedNotInDeck > 0 ? (
            <button
              onClick={handleAddSelectedToDeck}
              disabled={isAddingToDeck}
              className="w-full py-3.5 rounded-full bg-[#FF7A00] text-black font-semibold text-sm hover:bg-[#FF881A] transition-colors shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4 text-black" />
              <span>{selectedNotInDeck} zur Abfrage hinzufügen</span>
            </button>
          ) : (
            <button
              onClick={handleStartStudySelected}
              disabled={selectedCount === 0}
              className="w-full py-3.5 rounded-full bg-[#FF7A00] text-black font-semibold text-sm hover:bg-[#FF881A] transition-colors shadow-lg active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Ausgewählte abfragen ({selectedCount})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
