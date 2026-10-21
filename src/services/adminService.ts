import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Vocabulary, UserProgress } from '../types/vocab';
import { generateRomanizationFromThai } from '../utils/thaiTones';

export interface AdminInviteCode {
  id: string;
  code: string;
  label: string;
  active: boolean;
  createdAt: string;
  usesCount: number;
}

export interface AdminLearner {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  learnedCount: number;
  role?: string;
}

export interface AdminAnnouncement {
  active: boolean;
  message: string;
  type: 'info' | 'warning' | 'success';
  updatedAt: string;
}

export interface AdminRegistrationSettings {
  locked: boolean;
  lockReason: string;
  allowVipCodeBypass: boolean;
  updatedAt: string;
  updatedBy?: string;
}

export const DEFAULT_REGISTRATION_SETTINGS: AdminRegistrationSettings = {
  locked: false,
  lockReason: 'Neue Registrierungen sind derzeit durch den Administrator vorübergehend pausiert.',
  allowVipCodeBypass: true,
  updatedAt: '2026-01-01T00:00:00Z',
};

const LOCAL_ADMIN_CODES_KEY = 'thai_hasis_admin_codes_v1';
const LOCAL_ANNOUNCEMENT_KEY = 'thai_hasis_announcement_v1';
const LOCAL_ACCOUNTS_KEY = 'thai_hasis_accounts_v1';
const LOCAL_REG_SETTINGS_KEY = 'thai_hasis_registration_settings_v1';

// --- REGISTRATION LOCKDOWN CONTROLS ---

export async function fetchRegistrationSettings(): Promise<AdminRegistrationSettings> {
  let settings: AdminRegistrationSettings = { ...DEFAULT_REGISTRATION_SETTINGS };

  // 1. Check Firestore
  try {
    const snap = await getDoc(doc(db, 'admin_settings', 'registration'));
    if (snap.exists()) {
      const data = snap.data();
      settings = {
        locked: Boolean(data.locked),
        lockReason: data.lockReason || DEFAULT_REGISTRATION_SETTINGS.lockReason,
        allowVipCodeBypass: data.allowVipCodeBypass !== false,
        updatedAt: data.updatedAt || new Date().toISOString(),
        updatedBy: data.updatedBy || '',
      };
      try {
        localStorage.setItem(LOCAL_REG_SETTINGS_KEY, JSON.stringify(settings));
      } catch {}
      return settings;
    }
  } catch (err) {
    console.warn('Could not fetch registration settings from Firestore:', err);
  }

  // 2. Check localStorage
  try {
    const local = localStorage.getItem(LOCAL_REG_SETTINGS_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      return {
        ...DEFAULT_REGISTRATION_SETTINGS,
        ...parsed,
      };
    }
  } catch {}

  return settings;
}

export async function saveRegistrationSettings(settings: AdminRegistrationSettings): Promise<void> {
  const payload: AdminRegistrationSettings = {
    locked: Boolean(settings.locked),
    lockReason: settings.lockReason?.trim() || DEFAULT_REGISTRATION_SETTINGS.lockReason,
    allowVipCodeBypass: settings.allowVipCodeBypass !== false,
    updatedAt: new Date().toISOString(),
    updatedBy: settings.updatedBy || 'admin',
  };

  try {
    await setDoc(doc(db, 'admin_settings', 'registration'), payload);
  } catch (err) {
    console.warn('Failed saving registration settings to Firestore:', err);
  }

  try {
    localStorage.setItem(LOCAL_REG_SETTINGS_KEY, JSON.stringify(payload));
  } catch {}

  // Notify active components in the current window
  try {
    window.dispatchEvent(
      new CustomEvent('thai_hasis_registration_settings_changed', { detail: payload })
    );
  } catch {}
}

export function subscribeToRegistrationSettings(
  callback: (settings: AdminRegistrationSettings) => void
): () => void {
  const handleLocalChange = (e: any) => {
    if (e.detail) {
      callback(e.detail);
    }
  };
  window.addEventListener('thai_hasis_registration_settings_changed', handleLocalChange);

  let unsubFirestore: (() => void) | null = null;
  try {
    unsubFirestore = onSnapshot(
      doc(db, 'admin_settings', 'registration'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const s: AdminRegistrationSettings = {
            locked: Boolean(data.locked),
            lockReason: data.lockReason || DEFAULT_REGISTRATION_SETTINGS.lockReason,
            allowVipCodeBypass: data.allowVipCodeBypass !== false,
            updatedAt: data.updatedAt || new Date().toISOString(),
            updatedBy: data.updatedBy || '',
          };
          try {
            localStorage.setItem(LOCAL_REG_SETTINGS_KEY, JSON.stringify(s));
          } catch {}
          callback(s);
        }
      },
      (error) => {
        console.warn('Registration settings snapshot listener warning:', error);
      }
    );
  } catch (err) {
    console.warn('Failed setting up Firestore registration settings snapshot:', err);
  }

  return () => {
    window.removeEventListener('thai_hasis_registration_settings_changed', handleLocalChange);
    if (unsubFirestore) {
      unsubFirestore();
    }
  };
}

// --- 1. REGISTRATION & INVITE CODES ---

export async function fetchAdminCodes(): Promise<AdminInviteCode[]> {
  const codes: AdminInviteCode[] = [];
  const seenIds = new Set<string>();

  // 1. Try fetching from Firestore
  try {
    const snap = await getDocs(collection(db, 'admin_codes'));
    snap.forEach((d) => {
      const data = d.data();
      const codeItem: AdminInviteCode = {
        id: d.id,
        code: data.code || d.id,
        label: data.label || 'Standard Einladung',
        active: data.active !== false,
        createdAt: data.createdAt || new Date().toISOString(),
        usesCount: data.usesCount || 0,
      };
      codes.push(codeItem);
      seenIds.add(codeItem.id.toUpperCase());
    });
  } catch (err) {
    console.warn('Could not fetch admin codes from Firestore:', err);
  }

  // 2. Combine with local storage cache
  try {
    const localRaw = localStorage.getItem(LOCAL_ADMIN_CODES_KEY);
    if (localRaw) {
      const localList = JSON.parse(localRaw);
      if (Array.isArray(localList)) {
        localList.forEach((c) => {
          if (!seenIds.has(c.id.toUpperCase())) {
            codes.push(c);
            seenIds.add(c.id.toUpperCase());
          }
        });
      }
    }
  } catch {}

  // 3. Ensure default VIP code exists
  if (!seenIds.has('PHASE6')) {
    codes.unshift({
      id: 'PHASE6',
      code: 'PHASE6',
      label: 'Standard Master-Registrierungscode',
      active: true,
      createdAt: '2026-01-01T00:00:00Z',
      usesCount: 1,
    });
  }

  return codes;
}

export async function createAdminCode(code: string, label: string): Promise<AdminInviteCode> {
  const cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  if (!cleanCode) throw new Error('Ungültiger Code. Bitte nur Buchstaben, Zahlen und Bindestriche verwenden.');

  const newCode: AdminInviteCode = {
    id: cleanCode,
    code: cleanCode,
    label: label.trim() || 'Persönliche Einladung',
    active: true,
    createdAt: new Date().toISOString(),
    usesCount: 0,
  };

  // Save to Firestore
  try {
    await setDoc(doc(db, 'admin_codes', cleanCode), newCode);
  } catch (err) {
    console.warn('Failed saving code to Firestore, saving locally:', err);
  }

  // Save to localStorage
  try {
    const existing = await fetchAdminCodes();
    const updated = [newCode, ...existing.filter((c) => c.id !== cleanCode)];
    localStorage.setItem(LOCAL_ADMIN_CODES_KEY, JSON.stringify(updated));
  } catch {}

  return newCode;
}

export async function toggleAdminCodeStatus(id: string, active: boolean): Promise<void> {
  try {
    await updateDoc(doc(db, 'admin_codes', id), { active });
  } catch (err) {
    console.warn('Firestore code update failed:', err);
  }

  try {
    const existing = await fetchAdminCodes();
    const updated = existing.map((c) => (c.id === id ? { ...c, active } : c));
    localStorage.setItem(LOCAL_ADMIN_CODES_KEY, JSON.stringify(updated));
  } catch {}
}

export async function deleteAdminCode(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'admin_codes', id));
  } catch (err) {
    console.warn('Firestore code delete failed:', err);
  }

  try {
    const existing = await fetchAdminCodes();
    const updated = existing.filter((c) => c.id !== id);
    localStorage.setItem(LOCAL_ADMIN_CODES_KEY, JSON.stringify(updated));
  } catch {}
}

// --- 2. USERS & LEARNERS ---

export async function fetchAdminLearners(progressMap: Record<string, UserProgress> = {}): Promise<AdminLearner[]> {
  const learners: AdminLearner[] = [];
  const seenEmails = new Set<string>();

  // Count progress items belonging to each user
  const userProgressCounts: Record<string, number> = {};
  Object.values(progressMap).forEach((p) => {
    if (p.userId) {
      userProgressCounts[p.userId] = (userProgressCounts[p.userId] || 0) + 1;
    }
  });

  // 1. Fetch from Firestore app_users
  try {
    const snap = await getDocs(collection(db, 'app_users'));
    snap.forEach((d) => {
      const data = d.data();
      const email = data.email || '';
      if (email && !seenEmails.has(email.toLowerCase())) {
        learners.push({
          uid: data.uid || d.id,
          email: email,
          displayName: data.displayName || email.split('@')[0],
          createdAt: data.createdAt || 'Unbekannt',
          learnedCount: userProgressCounts[data.uid] || 0,
          role: data.role || (email.toLowerCase() === 'r33dbull33@gmail.com' ? 'admin' : 'learner'),
        });
        seenEmails.add(email.toLowerCase());
      }
    });
  } catch (err) {
    console.warn('Could not fetch users from Firestore:', err);
  }

  // 2. Fetch from local accounts
  try {
    const localRaw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    if (localRaw) {
      const localAccounts = JSON.parse(localRaw);
      Object.values(localAccounts).forEach((acc: any) => {
        if (acc.email && !seenEmails.has(acc.email.toLowerCase())) {
          learners.push({
            uid: acc.uid,
            email: acc.email,
            displayName: acc.displayName || acc.email.split('@')[0],
            createdAt: acc.createdAt || 'Lokal registriert',
            learnedCount: userProgressCounts[acc.uid] || 0,
            role: acc.role || (acc.email.toLowerCase() === 'r33dbull33@gmail.com' ? 'admin' : 'learner'),
          });
          seenEmails.add(acc.email.toLowerCase());
        }
      });
    }
  } catch {}

  // Ensure Admin account is always present
  if (!seenEmails.has('r33dbull33@gmail.com')) {
    learners.unshift({
      uid: 'admin_r33dbull33',
      email: 'R33dBull33@gmail.com',
      displayName: 'Super Admin',
      createdAt: '2026-01-01T00:00:00Z',
      learnedCount: Object.keys(progressMap).length,
      role: 'admin',
    });
  }

  return learners;
}

export async function adminResetUserPassword(email: string, newPass: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = newPass.trim();
  if (cleanPass.length < 6) throw new Error('Das Passwort muss mindestens 6 Zeichen lang sein.');

  // Hash new password
  const encoder = new TextEncoder();
  const data = encoder.encode(`thai_hasis_salt_2026:${cleanPass}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashHex = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');

  // 1. Update in local storage
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    if (raw) {
      const accounts = JSON.parse(raw);
      if (accounts[cleanEmail]) {
        accounts[cleanEmail].passwordHash = hashHex;
        localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
      }
    }
  } catch {}

  // 2. Update in Firestore
  try {
    const snap = await getDocs(collection(db, 'app_users'));
    for (const d of snap.docs) {
      if (d.data()?.email?.toLowerCase() === cleanEmail) {
        await updateDoc(doc(db, 'app_users', d.id), {
          passwordHash: hashHex,
          updatedAt: new Date().toISOString(),
        });
        break;
      }
    }
  } catch (err) {
    console.warn('Firestore password reset warning:', err);
  }
}

// --- 3. GLOBAL ANNOUNCEMENTS ---

export async function fetchAnnouncement(): Promise<AdminAnnouncement | null> {
  try {
    const snap = await getDoc(doc(db, 'admin_settings', 'announcement'));
    if (snap.exists()) {
      const data = snap.data() as AdminAnnouncement;
      try {
        localStorage.setItem(LOCAL_ANNOUNCEMENT_KEY, JSON.stringify(data));
      } catch {}
      return data;
    }
  } catch (err) {
    console.warn('Could not fetch announcement from Firestore:', err);
  }

  try {
    const local = localStorage.getItem(LOCAL_ANNOUNCEMENT_KEY);
    return local ? JSON.parse(local) : null;
  } catch {
    return null;
  }
}

export async function saveAnnouncement(announcement: AdminAnnouncement): Promise<void> {
  try {
    await setDoc(doc(db, 'admin_settings', 'announcement'), announcement);
  } catch (err) {
    console.warn('Failed saving announcement to Firestore:', err);
  }

  try {
    localStorage.setItem(LOCAL_ANNOUNCEMENT_KEY, JSON.stringify(announcement));
  } catch {}
}

// --- 4. 1-KLICK BACKUP & SNAPSHOT ---

export function createDatabaseSnapshot(
  vocabularies: Vocabulary[],
  progressMap: Record<string, UserProgress>,
  inviteCodes: AdminInviteCode[] = []
): Blob {
  const snapshot = {
    exportDate: new Date().toISOString(),
    appName: 'Thai Hasis Vokabeltrainer',
    version: '2.0.0',
    stats: {
      totalVocabularies: vocabularies.length,
      totalProgressEntries: Object.keys(progressMap).length,
      totalInviteCodes: inviteCodes.length,
    },
    vocabularies,
    userProgress: progressMap,
    inviteCodes,
  };

  const jsonStr = JSON.stringify(snapshot, null, 2);
  return new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
}

// --- 5. POOL QUALITY CHECKER ---

export function analyzePoolQuality(vocabularies: Vocabulary[]): {
  total: number;
  missingRomanization: Vocabulary[];
  missingExamples: Vocabulary[];
  shortWordsCount: number;
  lessons: Record<string, number>;
} {
  const missingRomanization: Vocabulary[] = [];
  const missingExamples: Vocabulary[] = [];
  const lessons: Record<string, number> = {};
  let shortWordsCount = 0;

  vocabularies.forEach((v) => {
    lessons[v.lesson] = (lessons[v.lesson] || 0) + 1;

    if (!v.romanization || !v.romanization.trim()) {
      missingRomanization.push(v);
    }
    if (!v.exampleThai || !v.exampleThai.trim()) {
      missingExamples.push(v);
    }
    if (v.thai.length <= 4) {
      shortWordsCount++;
    }
  });

  return {
    total: vocabularies.length,
    missingRomanization,
    missingExamples,
    shortWordsCount,
    lessons,
  };
}

export function autoFixAllMissingRomanization(
  vocabularies: Vocabulary[]
): { id: string; romanization: string }[] {
  const updates: { id: string; romanization: string }[] = [];

  vocabularies.forEach((v) => {
    if (!v.romanization || !v.romanization.trim()) {
      try {
        const { romanization } = generateRomanizationFromThai(v.thai);
        if (romanization && romanization.trim()) {
          updates.push({ id: v.id, romanization: romanization.trim() });
        }
      } catch {}
    }
  });

  return updates;
}
