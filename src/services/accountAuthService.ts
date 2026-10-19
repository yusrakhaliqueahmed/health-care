import { UserAccount, SupportedLanguage } from '../types';
import { getProvinceFromCnic } from './cnicLookupService';

export interface RegisteredPatientAccount {
  id: string;
  cnic: string; // e.g. "41304-1234567-1" or "0300-1234567" for mobile-only
  normalizedCnic: string; // digits only e.g. "4130412345671"
  mobileNumber: string; // primary mobile number e.g. "0300-1234567"
  normalizedMobile: string; // digits only
  registeredMobiles: string[]; // up to 5 registered mobile numbers
  name: string;
  registeredAt: string;
  cnicPictureName?: string;
  cnicPictureDataUrl?: string;
  city?: string;
  district?: string;
  province?: string;
  isPhoneOnly?: boolean;
  isNadraVerified: boolean;
}

const STORAGE_ACCOUNTS_KEY = 'sehat_registered_patient_accounts';
const STORAGE_CURRENT_USER_KEY = 'sehat_saathi_current_user';
const STORAGE_DISCLAIMER_KEY = 'sehat_disclaimer_acknowledged';

/**
 * Normalize any identifier (CNIC or Mobile) to digits only
 */
export function normalizeIdentifier(input: string): string {
  return (input || '').replace(/\D/g, '');
}

/**
 * Mask mobile number: e.g. 0300-1234567 -> 0300-XXXXX67 or 03XX-XXXXX67
 */
export function maskMobile(mobile: string): string {
  const clean = normalizeIdentifier(mobile);
  if (clean.length < 7) return mobile;
  const prefix = clean.substring(0, 4);
  const suffix = clean.substring(clean.length - 2);
  return `${prefix}-XXXXX${suffix}`;
}

/**
 * Mask CNIC number: e.g. 41304-1234567-1 -> 41304-XXXXXXX-1
 */
export function maskCnic(cnic: string): string {
  const clean = normalizeIdentifier(cnic);
  if (clean.length !== 13) return cnic;
  return `${clean.substring(0, 5)}-XXXXXXX-${clean.substring(12)}`;
}

/**
 * Load all registered accounts from local storage (mirrored client cache)
 */
export function getRegisteredAccounts(): RegisteredPatientAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load registered patient accounts:', err);
  }
  return [];
}

/**
 * Save registered accounts to local storage
 */
export function saveRegisteredAccounts(accounts: RegisteredPatientAccount[]): void {
  try {
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.warn('Failed to save registered patient accounts:', err);
  }
}

/**
 * Find an account by CNIC or Mobile number
 */
export function findRegisteredAccount(identifier: string): RegisteredPatientAccount | null {
  const norm = normalizeIdentifier(identifier);
  if (!norm) return null;

  const accounts = getRegisteredAccounts();
  return (
    accounts.find((acc) => {
      return (
        acc.normalizedCnic === norm ||
        acc.cnic.replace(/\D/g, '') === norm ||
        acc.normalizedMobile === norm ||
        (acc.registeredMobiles && acc.registeredMobiles.some((m) => normalizeIdentifier(m) === norm))
      );
    }) || null
  );
}

/**
 * Register or update patient account in client cache
 */
export function registerPatientAccount(account: RegisteredPatientAccount): void {
  const accounts = getRegisteredAccounts();
  const filtered = accounts.filter(
    (a) => a.normalizedCnic !== account.normalizedCnic
  );
  filtered.unshift(account);
  saveRegisteredAccounts(filtered);
}

/**
 * Convert a RegisteredPatientAccount into active UserAccount session object
 */
export function convertToUserAccount(account: RegisteredPatientAccount): UserAccount {
  const isPhoneOnly = Boolean(account.isPhoneOnly);
  const cleanCnicDigits = normalizeIdentifier(account.cnic);
  const userKey = isPhoneOnly
    ? `phone_${normalizeIdentifier(account.mobileNumber)}`
    : `cnic_${cleanCnicDigits}`;

  const { provinceEn, provinceUr } = getProvinceFromCnic(cleanCnicDigits);
  const regionPrefix = cleanCnicDigits.slice(0, 5);

  return {
    id: account.id || `usr-${Date.now()}`,
    name: account.name || (isPhoneOnly ? 'Phone Patient' : `Patient (${maskCnic(account.cnic)})`),
    email: isPhoneOnly ? `${account.mobileNumber}@phone.sehat.pk` : `${cleanCnicDigits}@patient.nadra.pk`,
    phone: account.mobileNumber,
    cnic: isPhoneOnly ? undefined : account.cnic,
    cnicPictureUrl: account.cnicPictureName,
    cnicPictureDataUrl: account.cnicPictureDataUrl,
    cnicPictureFileName: account.cnicPictureName,
    role: 'patient',
    isPatient: true,
    patientTitle: 'Patient',
    loginMethod: isPhoneOnly ? 'phone' : 'cnic',
    isLoggedIn: true,
    isNadraVerified: !isPhoneOnly,
    city: account.city || provinceEn,
    registeredMobiles: account.registeredMobiles || [account.mobileNumber],
    nadraCitizenDetails: !isPhoneOnly
      ? {
          province: account.province || provinceEn,
          district: account.district || `District / Region ${regionPrefix}`,
        }
      : undefined,
  };
}

/**
 * Save active session to persistent device storage
 */
export function saveActiveSession(user: UserAccount): void {
  try {
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
    // Persist returning user profile for seamless biometric re-authentication
    if (user && user.id) {
      localStorage.setItem('sehat_returning_user_profile', JSON.stringify({
        id: user.id,
        name: user.name || 'Patient',
        email: user.email || '',
        role: user.role || 'patient',
        isPatient: true,
        patientTitle: user.patientTitle || 'Patient',
        loginMethod: user.loginMethod || 'google',
        cnic: user.cnic,
        mobileNumber: user.mobileNumber || user.phone,
      }));
    }
  } catch (err) {
    console.warn('Failed to save active user session:', err);
  }
}

/**
 * Load returning user profile for Biometric quick-access
 */
export function loadReturningUserProfile(): Partial<UserAccount> {
  try {
    const raw = localStorage.getItem('sehat_returning_user_profile');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.email) return parsed;
    }
  } catch {}
  return {};
}

/**
 * Load active session - keeps user logged in across tab refresh, app restart, browser reboot
 */
export function loadActiveSession(): UserAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.isLoggedIn && parsed.id) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load active user session:', err);
  }
  return null;
}

/**
 * Clear active session on device upon Sign Out (clears local personal cache)
 */
export function clearActiveSession(): void {
  try {
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    // Clear locally cached personal search & record drafts
    localStorage.removeItem('sehat_records_default');
    localStorage.removeItem('sehat_last_login_identifier');
  } catch (err) {
    console.warn('Failed to clear active user session:', err);
  }
}

// =========================================================================
// REAL SERVER-SIDE API CLIENTS FOR OCR, OTP & ACCOUNT REGISTRY
// =========================================================================

/**
 * Send real 6-digit server OTP to mobile number
 */
export async function sendServerOtp(
  mobileNumber: string,
  purpose: 'login' | 'signup' | 'backup_number' | 'approval' | 'remove_number' = 'login',
  cnic?: string
): Promise<{
  success: boolean;
  maskedMobile?: string;
  demoOtpCode?: string;
  error?: string;
  locked?: boolean;
  cooldownRemaining?: number;
}> {
  try {
    const res = await fetch('/api/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber, purpose, cnic }),
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || 'Failed to dispatch OTP code.',
        locked: data.locked,
        cooldownRemaining: data.cooldownRemaining,
      };
    }
    return {
      success: true,
      maskedMobile: data.maskedMobile,
      demoOtpCode: data.demoOtpCode,
    };
  } catch (err: any) {
    console.warn('sendServerOtp error:', err);
    return { success: false, error: 'Network error communicating with verification server.' };
  }
}

/**
 * Verify real single-use 6-digit server OTP
 */
export async function verifyServerOtp(
  mobileNumber: string,
  code: string
): Promise<{
  success: boolean;
  error?: string;
  locked?: boolean;
  attemptsRemaining?: number;
}> {
  try {
    const res = await fetch('/api/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber, code }),
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || 'Invalid verification code.',
        locked: data.locked,
        attemptsRemaining: data.attemptsRemaining,
      };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('verifyServerOtp error:', err);
    return { success: false, error: 'Network error verifying code.' };
  }
}

/**
 * Run strict Gemini OCR on physical CNIC card photo
 */
export async function runCnicOcr(
  photoBase64: string,
  photoMimeType: string = 'image/jpeg',
  typedCnic: string = ''
): Promise<{
  success: boolean;
  isValidCnic: boolean;
  matchesTyped: boolean;
  extractedCnic: string;
  extractedDigits: string;
  extractedName: string;
  errorReason: string;
}> {
  try {
    const res = await fetch('/api/ocr-cnic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoBase64, photoMimeType, typedCnic }),
    });
    const data = await res.json();
    return {
      success: true,
      isValidCnic: Boolean(data.isValidCnic),
      matchesTyped: Boolean(data.matchesTyped),
      extractedCnic: data.extractedCnic || '',
      extractedDigits: data.extractedDigits || '',
      extractedName: data.extractedName || '',
      errorReason: data.errorReason || '',
    };
  } catch (err) {
    console.warn('runCnicOcr error:', err);
    return {
      success: false,
      isValidCnic: false,
      matchesTyped: false,
      extractedCnic: '',
      extractedDigits: '',
      extractedName: '',
      errorReason: 'CNIC saaf nazar nahi aa raha ya yeh CNIC nahi lagta. Dobara saaf tasveer lein.',
    };
  }
}

/**
 * Check if CNIC is registered on the server and get registered masked numbers
 */
export async function checkCnicOnServer(cnic: string): Promise<{
  exists: boolean;
  count: number;
  maskedMobiles: string[];
  primaryMobileMasked?: string;
  name?: string;
}> {
  try {
    const res = await fetch('/api/auth/cnic-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cnic }),
    });
    if (!res.ok) return { exists: false, count: 0, maskedMobiles: [] };
    return await res.json();
  } catch {
    return { exists: false, count: 0, maskedMobiles: [] };
  }
}

/**
 * Register brand new CNIC account on server
 */
export async function registerCnicOnServer(
  cnic: string,
  mobileNumber: string,
  name?: string,
  backupMobileNumber?: string
): Promise<{ success: boolean; account?: any; error?: string }> {
  try {
    const res = await fetch('/api/auth/register-cnic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cnic, mobileNumber, name, backupMobileNumber }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, account: data.account };
  } catch {
    return { success: false, error: 'Failed to create CNIC account.' };
  }
}

/**
 * Add an additional mobile number to an existing CNIC (up to 5)
 */
export async function addMobileToServer(
  cnic: string,
  newMobileNumber: string
): Promise<{ success: boolean; registeredMobiles?: string[]; error?: string }> {
  try {
    const res = await fetch('/api/auth/add-mobile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cnic, newMobileNumber }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, registeredMobiles: data.registeredMobiles };
  } catch {
    return { success: false, error: 'Failed to add mobile number.' };
  }
}

/**
 * Remove a registered mobile number
 */
export async function removeMobileFromServer(
  cnic: string,
  mobileToRemove: string
): Promise<{ success: boolean; registeredMobiles?: string[]; error?: string }> {
  try {
    const res = await fetch('/api/auth/remove-mobile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cnic, mobileToRemove }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, registeredMobiles: data.registeredMobiles };
  } catch {
    return { success: false, error: 'Failed to remove mobile number.' };
  }
}

/**
 * Block a newly added mobile number
 */
export async function blockMobileOnServer(
  cnic: string,
  mobileToBlock: string
): Promise<{ success: boolean; message?: string; registeredMobiles?: string[]; error?: string }> {
  try {
    const res = await fetch('/api/auth/block-mobile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cnic, mobileToBlock }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, message: data.message, registeredMobiles: data.registeredMobiles };
  } catch {
    return { success: false, error: 'Failed to block mobile number.' };
  }
}
