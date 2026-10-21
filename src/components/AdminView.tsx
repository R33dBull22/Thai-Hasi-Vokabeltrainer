import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Key,
  Users,
  Database,
  Megaphone,
  Download,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Sparkles,
  Lock,
  Layers,
  ArrowRight,
  AlertTriangle,
  FileText,
  X,
  Eye,
  Calendar,
  Crown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Vocabulary, UserProgress } from '../types/vocab';
import {
  AdminInviteCode,
  AdminLearner,
  AdminAnnouncement,
  fetchAdminCodes,
  createAdminCode,
  toggleAdminCodeStatus,
  deleteAdminCode,
  fetchAdminLearners,
  adminResetUserPassword,
  fetchAnnouncement,
  saveAnnouncement,
  createDatabaseSnapshot,
  analyzePoolQuality,
  autoFixAllMissingRomanization,
} from '../services/adminService';

interface AdminViewProps {
  vocabularies: Vocabulary[];
  progressMap: Record<string, UserProgress>;
  onBatchUpdateRomanization?: (updates: { id: string; romanization: string }[]) => Promise<number>;
  onRenameLesson?: (oldName: string, newName: string) => Promise<void>;
  onBatchPermanentlyDelete?: (vocabIds: string[]) => Promise<number>;
  onNavigateHome: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  vocabularies,
  progressMap,
  onBatchUpdateRomanization,
  onRenameLesson,
  onBatchPermanentlyDelete,
  onNavigateHome,
}) => {
  const { user, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'codes' | 'learners' | 'pool' | 'announcement' | 'backup'>('codes');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Codes state
  const [codes, setCodes] = useState<AdminInviteCode[]>([]);
  const [newCodeInput, setNewCodeInput] = useState('');
  const [newCodeLabel, setNewCodeLabel] = useState('');
  const [isCreatingCode, setIsCreatingCode] = useState(false);

  // Learners state
  const [learners, setLearners] = useState<AdminLearner[]>([]);
  const [searchLearner, setSearchLearner] = useState('');
  const [resetPassLearner, setResetPassLearner] = useState<AdminLearner | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [isResettingPass, setIsResettingPass] = useState(false);

  // Announcement state
  const [announcement, setAnnouncement] = useState<AdminAnnouncement>({
    active: false,
    message: '',
    type: 'info',
    updatedAt: new Date().toISOString(),
  });
  const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);

  // Pool management state
  const [isFixingRomanization, setIsFixingRomanization] = useState(false);
  const [renameOldLesson, setRenameOldLesson] = useState('');
  const [renameNewLesson, setRenameNewLesson] = useState('');
  const [isRenamingLesson, setIsRenamingLesson] = useState(false);

  // Permanent Delete tool state
  const [deleteSearchTerm, setDeleteSearchTerm] = useState('');
  const [selectedDeleteLesson, setSelectedDeleteLesson] = useState<string>('all');
  const [isDeletingPermanently, setIsDeletingPermanently] = useState(false);
  const [selectedDeleteIds, setSelectedDeleteIds] = useState<Set<string>>(new Set());
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    isOpen: boolean;
    ids: string[];
    samples: { german: string; thai: string }[];
  } | null>(null);
  const [confirmDeleteCodeItem, setConfirmDeleteCodeItem] = useState<AdminInviteCode | null>(null);

  // Loading states
  const [isLoadingData, setIsLoadingData] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAllAdminData = async () => {
    setIsLoadingData(true);
    try {
      const [fetchedCodes, fetchedLearners, fetchedAnnouncement] = await Promise.all([
        fetchAdminCodes(),
        fetchAdminLearners(progressMap),
        fetchAnnouncement(),
      ]);
      setCodes(fetchedCodes);
      setLearners(fetchedLearners);
      if (fetchedAnnouncement) {
        setAnnouncement(fetchedAnnouncement);
      }
    } catch (err) {
      console.warn('Error loading admin data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // Filtered learners
  const filteredLearners = useMemo(() => {
    if (!searchLearner.trim()) return learners;
    const q = searchLearner.toLowerCase().trim();
    return learners.filter(
      (l) => l.email.toLowerCase().includes(q) || l.displayName.toLowerCase().includes(q)
    );
  }, [learners, searchLearner]);

  // Pool analysis
  const poolAnalysis = useMemo(() => analyzePoolQuality(vocabularies), [vocabularies]);

  // Handle Add Invite Code
  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodeInput.trim()) return;

    setIsCreatingCode(true);
    try {
      const created = await createAdminCode(newCodeInput, newCodeLabel);
      setCodes((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
      setNewCodeInput('');
      setNewCodeLabel('');
      showToast(`✓ Einladungscode „${created.code}“ erfolgreich erstellt!`);
    } catch (err: any) {
      showToast(`Fehler: ${err.message || 'Code konnte nicht erstellt werden'}`);
    } finally {
      setIsCreatingCode(false);
    }
  };

  // Handle Toggle Code
  const handleToggleCode = async (codeItem: AdminInviteCode) => {
    const nextActive = !codeItem.active;
    try {
      await toggleAdminCodeStatus(codeItem.id, nextActive);
      setCodes((prev) =>
        prev.map((c) => (c.id === codeItem.id ? { ...c, active: nextActive } : c))
      );
      showToast(nextActive ? `✓ Code „${codeItem.code}“ aktiviert` : `Code „${codeItem.code}“ pausiert`);
    } catch (err: any) {
      showToast(`Fehler: ${err.message}`);
    }
  };

  // Handle Delete Code Execution
  const handleExecuteDeleteCode = async () => {
    if (!confirmDeleteCodeItem) return;
    if (confirmDeleteCodeItem.id === 'PHASE6') {
      showToast('Der Standard-Code PHASE6 kann nicht gelöscht werden.');
      setConfirmDeleteCodeItem(null);
      return;
    }

    try {
      await deleteAdminCode(confirmDeleteCodeItem.id);
      setCodes((prev) => prev.filter((c) => c.id !== confirmDeleteCodeItem.id));
      showToast(`✓ Code „${confirmDeleteCodeItem.code}“ gelöscht`);
      setConfirmDeleteCodeItem(null);
    } catch (err: any) {
      showToast(`Fehler: ${err.message}`);
    }
  };

  // Handle Password Reset
  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassLearner) return;
    if (newPasswordInput.trim().length < 6) {
      showToast('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    setIsResettingPass(true);
    try {
      await adminResetUserPassword(resetPassLearner.email, newPasswordInput.trim());
      showToast(`✓ Passwort für ${resetPassLearner.email} erfolgreich geändert!`);
      setResetPassLearner(null);
      setNewPasswordInput('');
    } catch (err: any) {
      showToast(`Fehler beim Zurücksetzen: ${err.message}`);
    } finally {
      setIsResettingPass(false);
    }
  };

  // Handle Announcement Save
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAnnouncement(true);
    try {
      const updated = {
        ...announcement,
        updatedAt: new Date().toISOString(),
      };
      await saveAnnouncement(updated);
      setAnnouncement(updated);
      showToast('✓ Globale Ankündigung erfolgreich gespeichert & veröffentlicht!');
    } catch (err: any) {
      showToast(`Fehler: ${err.message}`);
    } finally {
      setIsSavingAnnouncement(false);
    }
  };

  // Handle 1-Click Database Snapshot Download
  const handleDownloadSnapshot = () => {
    const blob = createDatabaseSnapshot(vocabularies, progressMap, codes);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `thai-hasi-vollbackup-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('✓ Vollständiges Cloud-Backup als .json heruntergeladen!');
  };

  // Handle Auto-fix Romanization
  const handleAutoFixRomanization = async () => {
    if (!onBatchUpdateRomanization) return;
    const updates = autoFixAllMissingRomanization(vocabularies);
    if (updates.length === 0) {
      showToast('Alle Vokabeln im Pool besitzen bereits eine Lautschrift! ✓');
      return;
    }

    setIsFixingRomanization(true);
    try {
      const count = await onBatchUpdateRomanization(updates);
      showToast(`✓ ${count} Vokabeln wurden erfolgreich mit Lautschrift versehen!`);
    } catch (err: any) {
      showToast(`Fehler: ${err.message}`);
    } finally {
      setIsFixingRomanization(false);
    }
  };

  // Handle Global Lesson Rename
  const handleRenameLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameOldLesson || !renameNewLesson.trim() || !onRenameLesson) return;

    setIsRenamingLesson(true);
    try {
      await onRenameLesson(renameOldLesson, renameNewLesson.trim());
      showToast(`✓ Lektion „${renameOldLesson}“ wurde in „${renameNewLesson.trim()}“ umbenannt!`);
      setRenameOldLesson('');
      setRenameNewLesson('');
    } catch (err: any) {
      showToast(`Fehler beim Umbenennen: ${err.message}`);
    } finally {
      setIsRenamingLesson(false);
    }
  };

  // Handle Permanent Delete Modal Trigger
  const handleOpenPermanentDeleteModal = (ids: string[]) => {
    if (!ids.length || !onBatchPermanentlyDelete) return;
    const samples = vocabularies
      .filter((v) => ids.includes(v.id))
      .slice(0, 5)
      .map((v) => ({ german: v.german, thai: v.thai }));

    setConfirmDeleteModal({
      isOpen: true,
      ids,
      samples,
    });
  };

  const handleExecutePermanentDelete = async () => {
    if (!confirmDeleteModal || !confirmDeleteModal.ids.length || !onBatchPermanentlyDelete) return;
    setIsDeletingPermanently(true);
    try {
      const count = await onBatchPermanentlyDelete(confirmDeleteModal.ids);
      setSelectedDeleteIds((prev) => {
        const next = new Set(prev);
        confirmDeleteModal.ids.forEach((id) => next.delete(id));
        return next;
      });
      setConfirmDeleteModal(null);
      showToast(`✓ ${count} Vokabel(n) endgültig vernichtet und aus der Cloud gelöscht!`);
    } catch (err: any) {
      showToast(`Fehler beim endgültigen Löschen: ${err.message}`);
    } finally {
      setIsDeletingPermanently(false);
    }
  };

  const allLessons = useMemo(() => {
    const set = new Set<string>();
    vocabularies.forEach((v) => {
      set.add(v.lesson || 'Allgemein');
    });
    return Array.from(set).sort();
  }, [vocabularies]);

  const filteredVocabsForDeletion = useMemo(() => {
    let list = vocabularies;
    if (selectedDeleteLesson !== 'all') {
      list = list.filter((v) => (v.lesson || 'Allgemein') === selectedDeleteLesson);
    }
    if (deleteSearchTerm.trim()) {
      const q = deleteSearchTerm.trim().toLowerCase();
      list = list.filter(
        (v) =>
          v.german.toLowerCase().includes(q) ||
          v.thai.includes(q) ||
          (v.romanization && v.romanization.toLowerCase().includes(q)) ||
          (v.lesson && v.lesson.toLowerCase().includes(q))
      );
    }
    return list;
  }, [vocabularies, selectedDeleteLesson, deleteSearchTerm]);

  const toggleSelectDeleteId = (id: string) => {
    setSelectedDeleteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAllFiltered = () => {
    const filteredIds = filteredVocabsForDeletion.map((v) => v.id);
    const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedDeleteIds.has(id));
    setSelectedDeleteIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        filteredIds.forEach((id) => next.delete(id));
      } else {
        filteredIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  // Protection Guard: If non-admin somehow reaches this page
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center text-white space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-2xl border border-rose-500/40">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">Zugriff verweigert</h2>
        <p className="text-xs text-[#8E8E93] leading-relaxed">
          Dieser Bereich ist exklusiv für den Administrator der Anwendung reserviert.
        </p>
        <button
          type="button"
          onClick={onNavigateHome}
          className="px-6 py-2.5 rounded-full bg-[#FF7A00] text-black font-semibold text-xs hover:bg-[#FF881A] transition cursor-pointer"
        >
          Zurück zur Startseite
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-3 pb-36 text-white space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2 mb-1">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-[#FF7A00] text-black flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
            <Crown className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>Admin-Zentrale</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                Super Admin
              </span>
            </h1>
            <p className="text-[11px] text-[#8E8E93] truncate max-w-[220px]">
              {user?.email || 'R33dBull33@gmail.com'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadAllAdminData}
          disabled={isLoadingData}
          className="p-2 rounded-xl bg-[#242426] border border-[#3A3A3D] text-[#8E8E93] hover:text-white transition cursor-pointer"
          title="Admin-Daten aktualisieren"
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 bg-[#242426] border border-amber-400/50 rounded-2xl text-xs text-amber-300 flex items-center justify-between gap-2 shadow-xl animate-in fade-in">
          <span>{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage(null)} className="text-[#8E8E93] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-3 rounded-2xl bg-[#1C1C1E] border border-[#2C2C2E]">
          <span className="text-base font-bold text-amber-400 block">{vocabularies.length}</span>
          <span className="text-[10px] text-[#8E8E93] uppercase tracking-wider">Vokabeln</span>
        </div>
        <div className="p-3 rounded-2xl bg-[#1C1C1E] border border-[#2C2C2E]">
          <span className="text-base font-bold text-emerald-400 block">{learners.length}</span>
          <span className="text-[10px] text-[#8E8E93] uppercase tracking-wider">Lerner</span>
        </div>
        <div className="p-3 rounded-2xl bg-[#1C1C1E] border border-[#2C2C2E]">
          <span className="text-base font-bold text-sky-400 block">{codes.filter((c) => c.active).length}</span>
          <span className="text-[10px] text-[#8E8E93] uppercase tracking-wider">Aktive Codes</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#1C1C1E] p-1 rounded-2xl border border-[#2C2C2E] overflow-x-auto text-xs">
        {[
          { id: 'codes', label: 'Codes', icon: Key },
          { id: 'learners', label: 'Lerner', icon: Users },
          { id: 'pool', label: 'Pool & Qualität', icon: Database },
          { id: 'announcement', label: 'Ankündigung', icon: Megaphone },
          { id: 'backup', label: 'Backup', icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-2.5 rounded-xl whitespace-nowrap font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-400 to-[#FF7A00] text-black font-bold shadow-sm'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: REGISTRIERUNGS- & EINLADUNGSCODES */}
      {activeTab === 'codes' && (
        <div className="space-y-4 text-xs">
          {/* Create Code Card */}
          <div className="bg-[#242426] p-4 rounded-2xl border border-[#3A3A3D] space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <span>Neuen Einladungscode generieren</span>
            </h3>
            <p className="text-[11px] text-[#8E8E93]">
              Nutzer benötigen bei der Neuregistrierung einen dieser Codes.
            </p>

            <form onSubmit={handleCreateCode} className="space-y-2.5">
              <div>
                <label className="text-[10px] uppercase font-semibold text-[#8E8E93] block mb-1">
                  Code (z. B. BANGKOK2026, HASI-VIP) *
                </label>
                <input
                  type="text"
                  value={newCodeInput}
                  onChange={(e) => setNewCodeInput(e.target.value.toUpperCase())}
                  placeholder="CODE EINGEBEN"
                  className="w-full px-3.5 py-2.5 bg-[#1C1C1E] border border-[#3A3A3D] rounded-xl font-mono text-sm text-amber-300 uppercase focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-semibold text-[#8E8E93] block mb-1">
                  Verwendungszweck / Empfänger (optional)
                </label>
                <input
                  type="text"
                  value={newCodeLabel}
                  onChange={(e) => setNewCodeLabel(e.target.value)}
                  placeholder="z. B. Einladung für Max Mustermann"
                  className="w-full px-3.5 py-2.5 bg-[#1C1C1E] border border-[#3A3A3D] rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingCode}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-[#FF7A00] text-black font-semibold text-xs hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>{isCreatingCode ? 'Wird erstellt...' : 'Code aktivieren & speichern'}</span>
              </button>
            </form>
          </div>

          {/* List of Codes */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">
              Aktive & Registrierte Codes ({codes.length}):
            </h4>

            {codes.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-2xl bg-[#242426] border border-[#323236] flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-white tracking-wider">
                      {c.code}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        c.active
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      {c.active ? 'Aktiv' : 'Deaktiviert'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A1A1AA] truncate mt-0.5">{c.label}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleCode(c)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition cursor-pointer ${
                      c.active
                        ? 'bg-[#1C1C1E] border-[#3A3A3D] text-[#8E8E93] hover:text-white'
                        : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    }`}
                  >
                    {c.active ? 'Pausieren' : 'Aktivieren'}
                  </button>

                  {c.id !== 'PHASE6' && (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteCodeItem(c)}
                      className="p-1.5 rounded-xl text-[#8E8E93] hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Code löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: BENUTZER & LERNER */}
      {activeTab === 'learners' && (
        <div className="space-y-4 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchLearner}
              onChange={(e) => setSearchLearner(e.target.value)}
              placeholder="Lerner nach Name oder E-Mail suchen..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#1C1C1E] border border-[#3A3A3D] rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* List of Users */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">
              Registrierte Lerner ({filteredLearners.length}):
            </h4>

            {filteredLearners.map((learner) => {
              const isSuperAdmin = learner.role === 'admin' || learner.email.toLowerCase() === 'r33dbull33@gmail.com';

              return (
                <div
                  key={learner.uid}
                  className="p-3.5 rounded-2xl bg-[#242426] border border-[#323236] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs truncate">
                        {learner.displayName}
                      </span>
                      {isSuperAdmin ? (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                          <Crown className="w-2.5 h-2.5" /> Admin
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#1C1C1E] text-[#8E8E93] border border-[#323236]">
                          Lerner
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#8E8E93] truncate">{learner.email}</p>
                    <div className="flex items-center gap-2 text-[10px] text-[#A1A1AA] mt-1">
                      <span>📚 {learner.learnedCount} Karten im Deck</span>
                      <span>•</span>
                      <span>{learner.createdAt.slice(0, 10)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setResetPassLearner(learner);
                      setNewPasswordInput('');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-[#1C1C1E] border border-[#3A3A3D] hover:border-amber-400 text-xs text-[#D1D1D6] hover:text-white transition cursor-pointer shrink-0"
                  >
                    Passwort
                  </button>
                </div>
              );
            })}
          </div>

          {/* Password Reset Modal */}
          {resetPassLearner && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
              onClick={() => setResetPassLearner(null)}
            >
              <div
                className="bg-[#1C1C1E] border border-[#3A3A3D] rounded-3xl p-5 w-full max-w-sm text-white shadow-2xl space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-[#2C2C2E] pb-3">
                  <h3 className="font-bold text-sm">Passwort zurücksetzen</h3>
                  <button
                    type="button"
                    onClick={() => setResetPassLearner(null)}
                    className="w-7 h-7 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#8E8E93] hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-[#8E8E93]">
                  Neues Passwort für <span className="text-white font-semibold">{resetPassLearner.email}</span> festlegen:
                </p>

                <form onSubmit={handleConfirmResetPassword} className="space-y-3">
                  <input
                    type="text"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Mindestens 6 Zeichen"
                    className="w-full px-3.5 py-2.5 bg-[#242426] border border-[#3A3A3D] rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setResetPassLearner(null)}
                      className="flex-1 py-2.5 rounded-xl bg-[#242426] text-xs text-[#8E8E93] hover:text-white transition"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      disabled={isResettingPass}
                      className="flex-1 py-2.5 rounded-xl bg-amber-400 text-black font-semibold text-xs hover:bg-amber-300 transition"
                    >
                      {isResettingPass ? 'Speichern...' : 'Passwort setzen'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: POOL- & QUALITÄTS-MANAGEMENT */}
      {activeTab === 'pool' && (
        <div className="space-y-4 text-xs">
          {/* Quality Dashboard */}
          <div className="bg-[#242426] p-4 rounded-2xl border border-[#3A3A3D] space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Qualitäts-Check des Vokabelpools</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-3 bg-[#1C1C1E] rounded-xl border border-[#2E2E32]">
                <span className="text-[#8E8E93] block">Vokabeln gesamt:</span>
                <span className="text-base font-bold text-white">{poolAnalysis.total}</span>
              </div>
              <div className="p-3 bg-[#1C1C1E] rounded-xl border border-[#2E2E32]">
                <span className="text-[#8E8E93] block">Lektionen:</span>
                <span className="text-base font-bold text-amber-400">{Object.keys(poolAnalysis.lessons).length}</span>
              </div>
            </div>

            <div className="p-3 bg-[#1C1C1E] rounded-xl border border-[#2E2E32] flex items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-white block">Fehlende Lautschrift:</span>
                <span className="text-[11px] text-[#8E8E93]">
                  {poolAnalysis.missingRomanization.length} Vokabel{poolAnalysis.missingRomanization.length === 1 ? '' : 'n'} ohne Umschrift
                </span>
              </div>

              {poolAnalysis.missingRomanization.length > 0 && onBatchUpdateRomanization && (
                <button
                  type="button"
                  onClick={handleAutoFixRomanization}
                  disabled={isFixingRomanization}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold hover:bg-emerald-500/30 transition cursor-pointer"
                >
                  {isFixingRomanization ? 'Repariere...' : '⚡ Jetzt generieren'}
                </button>
              )}
            </div>
          </div>

          {/* Global Lesson Renamer */}
          {onRenameLesson && (
            <div className="bg-[#242426] p-4 rounded-2xl border border-[#3A3A3D] space-y-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Lektion global umbenennen</span>
              </h3>
              <p className="text-[11px] text-[#8E8E93]">
                Benennt eine bestehende Lektion für alle zugehörigen Karten in der Cloud um.
              </p>

              <form onSubmit={handleRenameLesson} className="space-y-2.5">
                <div>
                  <label className="text-[10px] uppercase font-semibold text-[#8E8E93] block mb-1">
                    Bestehende Lektion auswählen
                  </label>
                  <select
                    value={renameOldLesson}
                    onChange={(e) => setRenameOldLesson(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1C1C1E] border border-[#3A3A3D] rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  >
                    <option value="">-- Lektion wählen --</option>
                    {Object.keys(poolAnalysis.lessons).map((l) => (
                      <option key={l} value={l}>
                        {l} ({poolAnalysis.lessons[l]} Vokabeln)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-semibold text-[#8E8E93] block mb-1">
                    Neuer Lektionsname
                  </label>
                  <input
                    type="text"
                    value={renameNewLesson}
                    onChange={(e) => setRenameNewLesson(e.target.value)}
                    placeholder="z. B. Lektion 5: Im Restaurant & Bestellen"
                    className="w-full px-3 py-2 bg-[#1C1C1E] border border-[#3A3A3D] rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isRenamingLesson || !renameOldLesson || !renameNewLesson.trim()}
                  className="w-full py-2.5 rounded-xl bg-[#2C2C2E] hover:bg-sky-500/20 text-white hover:text-sky-300 border border-[#3A3A3D] hover:border-sky-500/40 font-semibold text-xs transition cursor-pointer"
                >
                  {isRenamingLesson ? 'Wird umbenannt...' : 'Lektion global umbenennen'}
                </button>
              </form>
            </div>
          )}

          {/* Permanent Delete Station (Cloud Vaporizer) */}
          {onBatchPermanentlyDelete && (
            <div className="bg-[#242426] p-4 rounded-2xl border border-rose-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Vokabeln endgültig löschen</span>
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold">
                  Unwiderruflich
                </span>
              </div>
              <p className="text-[11px] text-[#8E8E93] leading-relaxed">
                Wähle eine Lektion oder suche gezielt nach Wörtern, um sie endgültig und dauerhaft aus der Cloud-Datenbank und von allen Geräten zu vernichten.
              </p>

              {/* Filter Row: Lesson selector & Search Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <select
                    value={selectedDeleteLesson}
                    onChange={(e) => setSelectedDeleteLesson(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1C1C1E] border border-[#3A3A3D] rounded-xl text-xs text-white focus:outline-none focus:border-rose-400"
                  >
                    <option value="all">Alle Lektionen ({vocabularies.length})</option>
                    {allLessons.map((l) => {
                      const count = vocabularies.filter((v) => (v.lesson || 'Allgemein') === l).length;
                      return (
                        <option key={l} value={l}>
                          {l} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-[#8E8E93] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={deleteSearchTerm}
                    onChange={(e) => setDeleteSearchTerm(e.target.value)}
                    placeholder="Suchen (z. B. Hallo, สวัสดี)..."
                    className="w-full pl-9 pr-3.5 py-2 bg-[#1C1C1E] border border-[#3A3A3D] rounded-xl text-xs text-white focus:outline-none focus:border-rose-400"
                  />
                  {deleteSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setDeleteSearchTerm('')}
                      className="absolute right-2.5 top-2.5 text-[#8E8E93] hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Action Toolbar for Selection */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleToggleSelectAllFiltered}
                  className="text-[11px] text-[#8E8E93] hover:text-white flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <input
                    type="checkbox"
                    checked={
                      filteredVocabsForDeletion.length > 0 &&
                      filteredVocabsForDeletion.every((v) => selectedDeleteIds.has(v.id))
                    }
                    onChange={() => {}}
                    className="rounded accent-rose-500 cursor-pointer"
                  />
                  <span>
                    Alle markieren ({filteredVocabsForDeletion.length})
                  </span>
                </button>

                {selectedDeleteIds.size > 0 && (
                  <button
                    type="button"
                    onClick={() => handleOpenPermanentDeleteModal(Array.from(selectedDeleteIds))}
                    disabled={isDeletingPermanently}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{selectedDeleteIds.size} Ausgewählte löschen</span>
                  </button>
                )}
              </div>

              {/* List of Vocabs */}
              <div className="space-y-1.5 max-h-72 overflow-y-auto divide-y divide-[#2C2C2E] border border-[#3A3A3D]/70 rounded-xl p-2 bg-[#1C1C1E]">
                {filteredVocabsForDeletion.length === 0 ? (
                  <p className="text-center py-6 text-xs text-[#8E8E93]">
                    Keine passenden Vokabeln gefunden.
                  </p>
                ) : (
                  filteredVocabsForDeletion.slice(0, 100).map((v) => {
                    const isSelected = selectedDeleteIds.has(v.id);
                    return (
                      <div
                        key={v.id}
                        className={`pt-2 pb-1 flex items-center justify-between gap-2 transition-colors rounded-lg px-1.5 ${
                          isSelected ? 'bg-rose-500/10' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectDeleteId(v.id)}
                            className="rounded accent-rose-500 cursor-pointer shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-white truncate text-xs">
                                {v.german}
                              </span>
                              <span className="text-[#8E8E93]">→</span>
                              <span className="font-thai text-[#FF7A00] truncate text-xs">
                                {v.thai}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-[#8E8E93]">
                              <span className="truncate max-w-[120px]">{v.lesson || 'Allgemein'}</span>
                              {v.romanization && (
                                <span className="italic truncate text-[#A1A1AA]">
                                  ({v.romanization})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenPermanentDeleteModal([v.id])}
                          disabled={isDeletingPermanently}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 shrink-0"
                          title="Diese Vokabel endgültig vernichten"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Löschen</span>
                        </button>
                      </div>
                    );
                  })
                )}
                {filteredVocabsForDeletion.length > 100 && (
                  <p className="text-center py-2 text-[10px] text-[#8E8E93]">
                    Zeigt die ersten 100 von {filteredVocabsForDeletion.length} Vokabeln. Nutze die Suche für spezifische Wörter.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: GLOBALE ANKÜNDIGUNGEN */}
      {activeTab === 'announcement' && (
        <div className="space-y-4 text-xs">
          <div className="bg-[#242426] p-4 rounded-2xl border border-[#3A3A3D] space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-400" />
              <span>App-Ankündigungsbanner steuern</span>
            </h3>
            <p className="text-[11px] text-[#8E8E93]">
              Wenn aktiviert, erscheint diese Nachricht ganz oben in der App für alle Nutzer.
            </p>

            <form onSubmit={handleSaveAnnouncement} className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#1C1C1E] rounded-xl border border-[#2E2E32]">
                <span className="font-semibold text-white">Banner aktiv schalten</span>
                <button
                  type="button"
                  onClick={() => setAnnouncement((prev) => ({ ...prev, active: !prev.active }))}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    announcement.active ? 'bg-amber-400' : 'bg-[#3A3A3D]'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 bg-black w-4 h-4 rounded-full transition-transform ${
                      announcement.active ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="text-[10px] uppercase font-semibold text-[#8E8E93] block mb-1">
                  Nachrichtentext
                </label>
                <textarea
                  rows={3}
                  value={announcement.message}
                  onChange={(e) => setAnnouncement((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="z. B. 🇹🇭 Neu: Lektion 10 Straßenessen & Märkte online! Viel Spaß beim Lernen!"
                  className="w-full px-3.5 py-2.5 bg-[#1C1C1E] border border-[#3A3A3D] rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                  required
                />
              </div>

              {/* Preview */}
              <div>
                <label className="text-[10px] uppercase font-semibold text-[#8E8E93] block mb-1">
                  Live-Vorschau:
                </label>
                <div className="p-3 bg-amber-400/15 border border-amber-400/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
                  <Megaphone className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{announcement.message || 'Deine Vorschau-Nachricht erscheint hier...'}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingAnnouncement}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-[#FF7A00] text-black font-semibold text-xs hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSavingAnnouncement ? 'Wird gespeichert...' : 'Ankündigung veröffentlichen'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: 1-KLICK BACKUP */}
      {activeTab === 'backup' && (
        <div className="space-y-4 text-xs">
          <div className="bg-[#242426] p-4 rounded-2xl border border-[#3A3A3D] space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Download className="w-4 h-4 text-sky-400" />
              <span>Komplettes System-Backup (1-Klick)</span>
            </h3>
            <p className="text-[11px] text-[#8E8E93] leading-relaxed">
              Erstellt einen vollständigen JSON-Snapshot der gesamten Anwendung inklusive aller Vokabeln, Leitner-Fortschritte und Einladungscodes.
            </p>

            <button
              type="button"
              onClick={handleDownloadSnapshot}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold text-xs hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>Vollständiges Backup jetzt herunterladen (.json)</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal: Confirm Permanent Vocabs Deletion */}
      {confirmDeleteModal && confirmDeleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1C1C1E] border border-rose-500/50 rounded-3xl w-full max-w-sm p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2C2C2E] mb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="text-base font-bold text-white">Endgültig vernichten?</h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDeleteModal(null)}
                className="w-7 h-7 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#8E8E93] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#D1D1D6] mb-3 leading-relaxed">
              Möchtest du <strong className="text-rose-400">{confirmDeleteModal.ids.length}</strong> Vokabelkarte(n) wirklich <strong className="text-white">unwiderruflich</strong> aus der Firebase Cloud-Datenbank und von allen Geräten löschen?
            </p>

            {confirmDeleteModal.samples.length > 0 && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5 mb-3 space-y-1">
                <p className="text-[10px] uppercase font-bold text-rose-300">Betroffene Vokabeln (Auszug):</p>
                {confirmDeleteModal.samples.map((s, idx) => (
                  <div key={idx} className="text-xs text-[#E4E4E7] flex items-center gap-1.5 truncate">
                    <span className="font-semibold">{s.german}</span>
                    <span className="text-[#8E8E93]">→</span>
                    <span className="font-thai text-[#FF7A00]">{s.thai}</span>
                  </div>
                ))}
                {confirmDeleteModal.ids.length > confirmDeleteModal.samples.length && (
                  <p className="text-[10px] text-[#8E8E93] italic">
                    ... und {confirmDeleteModal.ids.length - confirmDeleteModal.samples.length} weitere
                  </p>
                )}
              </div>
            )}

            <div className="text-[11px] text-[#A1A1AA] bg-[#242426] p-2.5 rounded-xl border border-[#3E3E42] mb-4">
              ⚠️ Diese Aktion kann <strong className="text-white">nicht</strong> rückgängig gemacht werden. Die Karten werden dauerhaft vernichtet.
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteModal(null)}
                disabled={isDeletingPermanently}
                className="flex-1 py-2.5 rounded-full bg-[#2C2C2E] text-white text-xs font-semibold hover:bg-[#3A3A3D] cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleExecutePermanentDelete}
                disabled={isDeletingPermanently}
                className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingPermanently ? 'Wird vernichtet...' : 'Unwiderruflich löschen'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete Code */}
      {confirmDeleteCodeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1C1C1E] border border-rose-500/50 rounded-3xl w-full max-w-sm p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2C2C2E] mb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="text-base font-bold text-white">Code löschen?</h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDeleteCodeItem(null)}
                className="w-7 h-7 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#8E8E93] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#D1D1D6] mb-4 leading-relaxed">
              Möchtest du den Registrierungscode <strong className="text-white font-mono bg-[#2C2C2E] px-1.5 py-0.5 rounded">„{confirmDeleteCodeItem.code}“</strong> ({confirmDeleteCodeItem.label}) wirklich löschen?
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteCodeItem(null)}
                className="flex-1 py-2.5 rounded-full bg-[#2C2C2E] text-white text-xs font-semibold hover:bg-[#3A3A3D] cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleExecuteDeleteCode}
                className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Code löschen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
