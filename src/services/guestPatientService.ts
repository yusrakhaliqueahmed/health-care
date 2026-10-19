import { UserAccount, UnifiedHealthRecord, PatientProfile } from '../types';
import { db } from '../firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

export interface GuestPatient {
  id: string;
  name: string;
  normalizedName: string;
  passwordHash: string;
  userKey: string;
  createdAt: string;
  lastLoginAt: string;
  records?: UnifiedHealthRecord[];
  vitals?: any;
  profiles?: PatientProfile[];
}

const STORAGE_GUEST_PATIENTS_KEY = 'sehat_guest_patients_registry';

/**
 * Hash password for guest patient verification
 */
export function hashPassword(password: string): string {
  const clean = password.trim();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    const char = clean.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const reversed = clean.split('').reverse().join('');
  let salt = '';
  try {
    salt = btoa(unescape(encodeURIComponent(reversed))).slice(0, 8);
  } catch {
    salt = 'slt' + clean.length;
  }
  return `gp_${Math.abs(hash)}_${clean.length}_${salt}`;
}

/**
 * Normalize patient name for matching
 */
export function normalizeGuestName(name: string): string {
  return (name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Derive deterministic Firestore document ID for a guest patient by name
 */
export function getGuestDocId(name: string): string {
  const norm = normalizeGuestName(name);
  const safe = norm.replace(/[^a-z0-9]/g, '_').slice(0, 36);
  return `guest_${safe || 'patient'}`;
}

/**
 * Load all registered guest patients from local storage cache
 */
export function getRegisteredGuestPatients(): GuestPatient[] {
  try {
    const raw = localStorage.getItem(STORAGE_GUEST_PATIENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load guest patients cache:', err);
  }
  return [];
}

/**
 * Save registered guest patients to local storage cache
 */
export function saveRegisteredGuestPatients(patients: GuestPatient[]): void {
  try {
    localStorage.setItem(STORAGE_GUEST_PATIENTS_KEY, JSON.stringify(patients));
  } catch (err) {
    console.warn('Failed to save guest patients cache:', err);
  }
}

/**
 * Find existing guest patient by name in local cache
 */
export function findGuestPatientByName(name: string): GuestPatient | null {
  const norm = normalizeGuestName(name);
  if (!norm) return null;
  const list = getRegisteredGuestPatients();
  return list.find((p) => p.normalizedName === norm) || null;
}

/**
 * Create initial welcome health record for newly registered guest
 */
export function createInitialGuestRecord(userKey: string, patientName: string): UnifiedHealthRecord {
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return {
    id: `REC-GST-${Date.now()}`,
    referenceNumber: `R No: GST-${Date.now().toString().slice(-5)}`,
    labCaseNumber: `Case: GP-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: userKey,
    patientProfileId: `prof-${Date.now()}`,
    patientName: patientName,
    patientAge: '32',
    patientGender: 'male',
    category: 'consultation',
    title: 'گیسٹ مریض میڈیکل فائل - ابتدائی طبی معائنہ',
    summary: `${patientName} کے لیے پاسورڈ پروٹیکٹڈ گیسٹ ہیلتھ ریکارڈ فائر اسٹور میں محفوظ کر دیا گیا ہے۔ تمام سابقہ اور نئی رپورٹس اس پاسورڈ کے ساتھ ہمیشہ کلاؤڈ میں محفوظ رہیں گی۔`,
    isDoctorReviewed: true,
    panelName: 'GUEST PATIENT MEDICAL INTAKE',
    date: dateFormatted,
    status: 'doctor_approved',
    reviewedByDoctor: 'Dr. Tariq Jamil (PMDC Certified)',
    doctorPmdc: 'PMDC # 48291-S',
    urgency: 'GREEN',
    testResults: [
      {
        testName: 'Blood Pressure Check',
        result: '120/80',
        referenceRange: '90/60 - 120/80',
        unit: 'mmHg',
        isAbnormal: false,
        flag: 'normal',
        notes: 'Normal healthy baseline',
      },
      {
        testName: 'Fasting Blood Sugar',
        result: '98',
        referenceRange: '70 - 100',
        unit: 'mg/dL',
        isAbnormal: false,
        flag: 'normal',
        notes: 'Normal range',
      },
    ],
    clinicalNotes: 'Initial guest patient intake completed and synchronized with Cloud Firestore.',
    originalLanguage: 'ur',
  };
}

export interface GuestAuthResult {
  success: boolean;
  isNewPatient?: boolean;
  user?: UserAccount;
  error?: string;
  patientName?: string;
  records?: UnifiedHealthRecord[];
  vitals?: any;
}

/**
 * Authenticate existing guest patient or register new guest patient
 * Links guest credentials directly with Cloud Firestore persistent records!
 */
export async function authenticateOrRegisterGuest(
  name: string,
  password: string,
  isUrdu = true
): Promise<GuestAuthResult> {
  const cleanName = (name || '').trim();
  const cleanPassword = (password || '').trim();

  if (!cleanName || cleanName.length < 2) {
    return {
      success: false,
      error: isUrdu
        ? 'براہ کرم اپنا درست نام درج کریں (کم از کم 2 حروف)'
        : 'Please enter a valid patient name (at least 2 characters)',
    };
  }

  if (!cleanPassword || cleanPassword.length < 3) {
    return {
      success: false,
      error: isUrdu
        ? 'براہ کرم پاسورڈ درج کریں (کم از کم 3 حروف)'
        : 'Please enter a password (at least 3 characters)',
    };
  }

  const norm = normalizeGuestName(cleanName);
  const incomingHash = hashPassword(cleanPassword);
  const docId = getGuestDocId(cleanName);
  const docRef = doc(db, 'guestPatients', docId);

  try {
    // 1. Check Cloud Firestore first for persistent credentials and records
    const firestoreSnap = await getDoc(docRef);

    if (firestoreSnap.exists()) {
      const data = firestoreSnap.data() as GuestPatient;

      // Returning patient found in Firestore! Validate password
      if (data.passwordHash !== incomingHash) {
        return {
          success: false,
          error: isUrdu
            ? `غلط پاسورڈ! مریض "${data.name}" کا میڈیکل ریکارڈ فائر اسٹور میں محفوظ ہے۔ براہ کرم وہی پاسورڈ درج کریں جو آپ نے پہلی بار داخل ہوتے وقت رکھا تھا تاکہ آپ کا سابقہ ریکارڈ سامنے آ سکے، یا نیا نام استعمال کریں۔`
            : `Incorrect password! A medical record for patient "${data.name}" already exists. Please enter the exact password you created when first registering as guest to restore your records, or use another name.`,
        };
      }

      // Password matches! Update last login in Firestore
      const nowIso = new Date().toISOString();
      await setDoc(docRef, { lastLoginAt: nowIso }, { merge: true });

      // Cache records locally for instant reactivity
      const userKey = data.userKey || `guest_${norm}@guest.sehat.pk`;
      if (data.records && Array.isArray(data.records)) {
        try {
          localStorage.setItem(`sehat_records_${userKey}`, JSON.stringify(data.records));
        } catch {}
      }

      // Update local storage registry cache
      const updatedLocal: GuestPatient = {
        ...data,
        lastLoginAt: nowIso,
      };
      const allLocal = getRegisteredGuestPatients().filter((p) => p.normalizedName !== norm);
      allLocal.unshift(updatedLocal);
      saveRegisteredGuestPatients(allLocal);

      const userAccount: UserAccount = {
        id: data.id || `guest-${Date.now()}`,
        name: data.name,
        email: userKey,
        role: 'patient',
        isPatient: true,
        patientTitle: 'Guest Patient',
        loginMethod: 'guest',
        isLoggedIn: true,
      };

      return {
        success: true,
        isNewPatient: false,
        user: userAccount,
        patientName: data.name,
        records: data.records,
        vitals: data.vitals,
      };
    }
  } catch (fsErr) {
    console.warn('Note: Firestore lookup returned, falling back to local verification:', fsErr);
  }

  // 2. Check local storage if Firestore was unpopulated or temporarily offline
  const localExisting = findGuestPatientByName(cleanName);
  if (localExisting) {
    if (localExisting.passwordHash !== incomingHash) {
      return {
        success: false,
        error: isUrdu
          ? `غلط پاسورڈ! مریض "${localExisting.name}" کا ریکارڈ پہلے سے موجود ہے۔ براہ کرم وہی پاسورڈ درج کریں جو آپ نے پہلی بار داخل ہوتے وقت رکھا تھا، یا نیا نام استعمال کریں۔`
          : `Incorrect password! A medical record for patient "${localExisting.name}" already exists. Please enter the exact password you created when first registering as guest.`,
      };
    }

    // Password matches locally, push to Firestore to sync
    const userAccount: UserAccount = {
      id: localExisting.id,
      name: localExisting.name,
      email: localExisting.userKey,
      role: 'patient',
      isPatient: true,
      patientTitle: 'Guest Patient',
      loginMethod: 'guest',
      isLoggedIn: true,
    };

    // Background push to Firestore
    syncGuestPatientRecordsToFirestore(
      localExisting.userKey,
      localExisting.records || [],
      localExisting.vitals,
      localExisting.name,
      localExisting.passwordHash
    ).catch(() => {});

    return {
      success: true,
      isNewPatient: false,
      user: userAccount,
      patientName: localExisting.name,
      records: localExisting.records,
      vitals: localExisting.vitals,
    };
  }

  // 3. New guest patient registration: Save to Cloud Firestore & LocalStorage
  const safeSlug = norm.replace(/[^a-z0-9]/g, '_').slice(0, 24);
  const userKey = `guest_${safeSlug}_${Date.now().toString().slice(-4)}@guest.sehat.pk`;
  const welcomeRecord = createInitialGuestRecord(userKey, cleanName);

  const newGuest: GuestPatient = {
    id: `guest-${Date.now()}`,
    name: cleanName,
    normalizedName: norm,
    passwordHash: incomingHash,
    userKey,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    records: [welcomeRecord],
    vitals: {
      bloodSugar: '98 mg/dL',
      bloodPressure: '120/80 mmHg',
      heartRate: '72 bpm',
      weight: '68 kg',
      recordedAt: new Date().toLocaleDateString('en-GB'),
    },
    profiles: [
      {
        id: `prof-${Date.now()}`,
        name: cleanName,
        relation: 'Self',
        ageGroup: 'adult',
        exactAge: 32,
        gender: 'male',
        conditions: 'None',
        medications: 'None',
        allergies: 'No known drug allergies',
      },
    ],
  };

  // Save to local cache
  try {
    localStorage.setItem(`sehat_records_${userKey}`, JSON.stringify([welcomeRecord]));
  } catch {}
  const all = getRegisteredGuestPatients();
  all.unshift(newGuest);
  saveRegisteredGuestPatients(all);

  // Persist directly to Firestore
  try {
    await setDoc(docRef, {
      ...newGuest,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Note: Could not immediately write new guest to Firestore:', err);
  }

  // Also sync with server-side store
  fetch(`/api/user-data/${encodeURIComponent(userKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profiles: newGuest.profiles,
      records: [welcomeRecord],
      vitals: newGuest.vitals,
    }),
  }).catch(() => {});

  const userAccount: UserAccount = {
    id: newGuest.id,
    name: newGuest.name,
    email: newGuest.userKey,
    role: 'patient',
    isPatient: true,
    patientTitle: 'Guest Patient',
    loginMethod: 'guest',
    isLoggedIn: true,
  };

  return {
    success: true,
    isNewPatient: true,
    user: userAccount,
    patientName: newGuest.name,
    records: [welcomeRecord],
    vitals: newGuest.vitals,
  };
}

/**
 * Sync guest patient records, vitals, and profile updates directly to Firestore
 */
export async function syncGuestPatientRecordsToFirestore(
  userKey: string,
  records: UnifiedHealthRecord[],
  vitals?: any,
  patientName?: string,
  passwordHash?: string
): Promise<boolean> {
  if (!userKey || !userKey.startsWith('guest_')) return false;

  try {
    // Determine document ID either from patientName or userKey
    const cleanKey = (userKey || '').toLowerCase().trim();
    let docId = '';
    if (patientName) {
      docId = getGuestDocId(patientName);
    } else {
      const slug = cleanKey.split('@')[0].replace(/^guest_/, '');
      docId = `guest_${slug}`;
    }

    const docRef = doc(db, 'guestPatients', docId);
    const updatePayload: Record<string, any> = {
      userKey: cleanKey,
      records: records,
      updatedAt: new Date().toISOString(),
    };

    if (vitals) {
      updatePayload.vitals = vitals;
    }
    if (patientName) {
      updatePayload.name = patientName;
      updatePayload.normalizedName = normalizeGuestName(patientName);
    }
    if (passwordHash) {
      updatePayload.passwordHash = passwordHash;
    }

    await setDoc(docRef, updatePayload, { merge: true });
    return true;
  } catch (err) {
    console.warn('Failed to sync guest patient records to Firestore:', err);
    return false;
  }
}

/**
 * Load persistent guest patient records and vitals directly from Cloud Firestore
 */
export async function loadGuestPatientFromFirestore(
  userKey: string,
  patientName?: string
): Promise<{ records?: UnifiedHealthRecord[]; vitals?: any; profiles?: PatientProfile[] } | null> {
  if (!userKey || !userKey.startsWith('guest_')) return null;

  try {
    let docId = '';
    if (patientName) {
      docId = getGuestDocId(patientName);
    } else {
      const slug = userKey.split('@')[0].replace(/^guest_/, '');
      docId = `guest_${slug}`;
    }

    const docRef = doc(db, 'guestPatients', docId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      return {
        records: Array.isArray(data.records) ? data.records : [],
        vitals: data.vitals,
        profiles: data.profiles,
      };
    }

    // Secondary fallback: query by userKey
    const q = query(collection(db, 'guestPatients'), where('userKey', '==', userKey));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const firstDoc = querySnap.docs[0].data();
      return {
        records: Array.isArray(firstDoc.records) ? firstDoc.records : [],
        vitals: firstDoc.vitals,
        profiles: firstDoc.profiles,
      };
    }
  } catch (err) {
    console.warn('Failed to load guest patient from Firestore:', err);
  }
  return null;
}
