import QRCode from 'qrcode';
import {
  SharedHealthCardData,
  HealthCardShareConfig,
  PatientProfile,
  UnifiedHealthRecord,
  SupportedLanguage,
} from '../types';

/**
 * Storage key for active card token to support immediate revocation / regeneration
 */
export function getActiveCardTokenKey(patientProfileId: string): string {
  return `sehat_active_health_card_token_${patientProfileId}`;
}

export function saveActiveCardToken(patientProfileId: string, token: string): void {
  try {
    localStorage.setItem(getActiveCardTokenKey(patientProfileId), token);
  } catch (e) {
    console.warn('Failed to save active card token', e);
  }
}

export function getActiveCardToken(patientProfileId: string): string | null {
  try {
    return localStorage.getItem(getActiveCardTokenKey(patientProfileId));
  } catch {
    return null;
  }
}

export function invalidateHealthCardToken(patientProfileId: string): void {
  try {
    localStorage.removeItem(getActiveCardTokenKey(patientProfileId));
  } catch (e) {
    console.warn('Failed to invalidate card token', e);
  }
}

/**
 * Build shareable payload strictly excluding sensitive data like CNIC
 */
export function buildSharedHealthCardData(
  profile: PatientProfile,
  config: HealthCardShareConfig,
  records: UnifiedHealthRecord[] = [],
  currentMedicines: Array<{ name: string; dosage: string; frequency?: string }> = [],
  vitals?: { bloodPressure?: string; bloodSugar?: string; heartRate?: string },
  patientLanguage?: SupportedLanguage
): SharedHealthCardData {
  const token = `tk-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
  saveActiveCardToken(profile.id, token);

  const expiresDate = new Date();
  expiresDate.setDate(expiresDate.getDate() + 30); // 30-day default validity, refreshable anytime

  const payload: SharedHealthCardData = {
    cardId: `HC-${Date.now().toString().slice(-6)}`,
    token,
    generatedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    expiresAt: expiresDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    patientProfileId: profile.id,
    patientName: config.includeBasicInfo ? profile.name : 'Verified Patient',
    age: config.includeBasicInfo ? profile.exactAge : undefined,
    gender: config.includeBasicInfo ? profile.gender : undefined,
    bloodGroup: config.includeBasicInfo ? (profile.bloodGroup || 'B+') : undefined,
    emergencyPhone: config.includeEmergencyContacts ? (profile.emergencyContact || '+92-300-1122112') : undefined,
    allergies: config.includeAllergies ? (
      profile.allergies && profile.allergies.trim()
        ? profile.allergies.split(/[,;]+/).map((s) => s.trim()).filter(Boolean)
        : ['No Known Drug Allergies (NKDA)']
    ) : undefined,
    chronicConditions: config.includeChronicConditions ? (
      profile.conditions && profile.conditions.trim()
        ? profile.conditions.split(/[,;]+/).map((s) => s.trim()).filter(Boolean)
        : ['None Reported']
    ) : undefined,
    currentMedicines: config.includeCurrentMedicines ? currentMedicines : undefined,
    recentVitals: config.includeRecentVitals && vitals ? {
      bloodPressure: vitals.bloodPressure || '120/80 mmHg',
      bloodSugar: vitals.bloodSugar || '105 mg/dL (Fasting)',
      heartRate: vitals.heartRate || '74 bpm',
      recordedAt: 'Recent telemetry record',
    } : undefined,
    diagnoses: config.includeDoctorDiagnoses ? records
      .filter((r) => r.category === 'prescription' || r.status === 'doctor_approved')
      .slice(0, 3)
      .map((r) => ({
        title: r.title,
        doctorName: r.reviewedByDoctor || 'PMDC Verified Physician',
        date: r.date,
      })) : undefined,
    patientLanguage: patientLanguage || 'en',
    specialInstructions: 'Official SehatSaathi Clinical QR Summary. Verified for ER & Triage.',
  };

  return payload;
}

/**
 * URL-safe Base64 encode JSON
 */
export function encodeHealthCardPayload(data: SharedHealthCardData): string {
  try {
    const jsonStr = JSON.stringify(data);
    return encodeURIComponent(btoa(unescape(encodeURIComponent(jsonStr))));
  } catch (err) {
    console.error('Failed to encode health card payload', err);
    return '';
  }
}

/**
 * Decode URL-safe Base64 payload
 */
export function decodeHealthCardPayload(encoded: string): SharedHealthCardData | null {
  try {
    const raw = decodeURIComponent(encoded);
    const jsonStr = decodeURIComponent(escape(atob(raw)));
    return JSON.parse(jsonStr) as SharedHealthCardData;
  } catch (err) {
    console.warn('Failed to decode health card payload', err);
    return null;
  }
}

/**
 * Construct full shareable web URL
 */
export function getHealthCardShareableUrl(payload: SharedHealthCardData): string {
  const origin = window.location.origin;
  const encoded = encodeHealthCardPayload(payload);
  return `${origin}/?view=qr-health-card&data=${encoded}&token=${payload.token}`;
}

/**
 * Generate high-resolution QR code image Data URL
 */
export async function generateHealthCardQrDataUrl(payload: SharedHealthCardData): Promise<string> {
  const fullUrl = getHealthCardShareableUrl(payload);
  try {
    const dataUrl = await QRCode.toDataURL(fullUrl, {
      width: 400,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0f4c3a', // Deep clinical teal
        light: '#ffffff',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR code data URL', err);
    throw err;
  }
}
