export type SupportedLanguage = 'en' | 'roman' | 'ur';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  bcp47: string;
  isRtl: boolean;
  scriptFont?: string;
  greeting: string;
}

export type AgeGroup = 'infant' | 'child' | 'teen' | 'adult' | 'elderly';

export interface UserAccount {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  role?: 'patient' | 'doctor';
  isDoctor?: boolean;
  pmdcLicense?: string;
  city?: string;
  isLoggedIn: boolean;
}

export interface PatientProfile {
  id: string;
  name: string;
  relation: string; // 'Self' | 'Child' | 'Parent' | 'Spouse' | 'Other'
  ageGroup: AgeGroup;
  exactAge?: number;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  conditions: string;
  medications: string;
  allergies: string;
  emergencyContact?: string;
}

export type UrgencyLevel = 'GREEN' | 'YELLOW' | 'RED';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  urgency?: UrgencyLevel;
  photoUrl?: string;
  isAudioPlaying?: boolean;
}

export interface MedicineCheckResult {
  id: string;
  medicineName: string;
  mode: 'check' | 'reverse' | 'photo';
  condition?: string;
  ageGroup: string;
  safetyStatus: 'SAFE' | 'CAUTION' | 'DANGER';
  explanation: string;
  timestamp: string;
  photoUrl?: string;
  dosageForm?: string;
  activeIngredient?: string;
}

export interface MedicalReportRecord {
  id: string;
  title: string;
  type: 'lab' | 'xray' | 'mri' | 'prescription' | 'video_scan';
  patientName: string;
  patientAge: string;
  date: string;
  photoUrl: string;
  findings: string;
  urgency: UrgencyLevel;
  status: 'preliminary_ai' | 'approved_by_pmdc_doctor';
  reviewedByDoctor?: string;
  doctorComments?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  pmdcNumber: string;
  hospital: string;
  city: string;
  province: string;
  address: string;
  distance: string;
  rating: number;
  reviewsCount: number;
  consultationFee: number; // PKR
  availableDays: string[];
  timing: string;
  languages: string[];
  phone: string;
  isOnlineAvailable: boolean;
  avatarUrl: string;
  experienceYears: number;
}

export interface Hospital {
  id: string;
  name: string;
  type: 'Government Teaching Hospital' | 'Private Medical Complex' | 'Trust Hospital' | 'Emergency Trauma Center';
  city: string;
  province: string;
  address: string;
  distance: string;
  phone: string;
  ambulanceContact: string;
  hasEmergency24_7: boolean;
  hasIcu: boolean;
  rating: number;
  photoUrl: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  chain?: string;
  city: string;
  province: string;
  address: string;
  distance: string;
  phone: string;
  isOpen24_7: boolean;
  hasDelivery: boolean;
  deliveryTime: string;
  commonMedsInStock: string[];
  photoUrl: string;
}

export type NavigationTab =
  | 'home'
  | 'symptoms'
  | 'medicine'
  | 'reports'
  | 'care'
  | 'emergency'
  | 'records'
  | 'doctor_portal';

export interface Prescription {
  id: string;
  caseId?: string;
  patientId?: string;
  patientName: string;
  patientAge?: string;
  doctorName: string;
  doctorPmdc: string;
  date: string;
  diagnosis: string;
  medicines: {
    name: string;
    dosage: string;
    duration: string;
    instructions: string;
    frequency?: string;
  }[];
  notes?: string;
  status: 'pending' | 'signed_verified' | 'active';
  qrCodeData: string;
}

export interface PatientCase {
  id: string;
  patientName: string;
  ageGroup: AgeGroup | string;
  exactAge?: number;
  urgency: UrgencyLevel;
  date: string;
  symptoms: string;
  aiSummary: string;
  status: 'pending_review' | 'approved' | 'escalated';
}
