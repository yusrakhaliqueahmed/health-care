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

export type RecordCategory =
  | 'symptom'
  | 'medicine'
  | 'lab_report'
  | 'prescription'
  | 'consultation'
  | 'discharge_summary'
  | 'imaging_report'
  | 'vaccination'
  | 'womens_health'
  | 'family_health'
  | 'search_history'
  | 'vitals'
  | 'telemetry_vitals'
  | 'other';

export interface DiagnosticTestItem {
  testName: string;
  result: string;
  referenceRange: string;
  unit?: string;
  isAbnormal?: boolean;
  flag?: 'normal' | 'low' | 'high' | 'critical' | 'borderline';
  notes?: string;
}

export interface UnifiedHealthRecord {
  id: string; // e.g. "SS-2026-89421"
  referenceNumber?: string; // "R No: SS-2026-89421"
  labCaseNumber?: string; // "Lab No: LB-77491"
  userId: string; // user email or account ID
  patientProfileId: string;
  patientName: string;
  patientAge: string;
  patientGender: 'male' | 'female' | 'other';
  category: RecordCategory;
  title: string;
  summary?: string;
  isDoctorReviewed?: boolean;
  panelName: string; // e.g. "SYMPTOM SUMMARY", "MEDICINE CHECK RESULT", "COMPLETE BLOOD COUNT (CBC)"
  date: string;
  status: 'ai_preliminary' | 'doctor_approved' | 'escalated';
  reviewedByDoctor?: string;
  doctorPmdc?: string;
  urgency: 'GREEN' | 'YELLOW' | 'RED';
  testResults: DiagnosticTestItem[];
  clinicalNotes: string;
  doctorComments?: string;
  photoUrl?: string;
  originalLanguage?: SupportedLanguage;
  fullMarkdownContent?: string;
  searchQuery?: string;
  searchType?: 'medicine' | 'lab_report' | 'symptom' | 'general';
  prescriptionData?: {
    diagnosis: string;
    medicines: { name: string; dosage: string; duration: string; instructions: string; frequency?: string }[];
    notes?: string;
  };
}

export type AgeGroup = 'infant' | 'child' | 'teen' | 'adult' | 'elderly';

export interface UserAccount {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  mobileNumber?: string;
  avatarUrl?: string;
  role?: 'patient' | 'doctor';
  isDoctor?: boolean;
  pmdcLicense?: string;
  city?: string;
  isLoggedIn: boolean;
  biometricEnrolled?: boolean;
  biometricUnlocked?: boolean;
  cnic?: string;
  cnicPictureUrl?: string;
  cnicPictureDataUrl?: string;
  cnicPictureFileName?: string;
  isPatient?: boolean;
  patientTitle?: string;
  loginMethod?: 'google' | 'cnic' | 'email' | 'phone' | 'biometric' | 'guest';
  registeredMobiles?: string[];
  isNadraVerified?: boolean;
  nadraCitizenDetails?: {
    fatherOrHusbandName?: string;
    province?: string;
    district?: string;
    gender?: 'Male' | 'Female';
  };
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
  isDemoPlaceholder?: boolean;
  isVerified?: boolean;
  verificationStatus?: 'pending' | 'verified' | 'rejected' | 'suspended';
  rejectionReason?: string;
  degreeDocumentUrl?: string;
  pmdcCertificateUrl?: string;
  verificationDocumentName?: string;
  verificationDocumentDataUrl?: string;
  registeredAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  adminApprovalNote?: string;
  email?: string;
  clinicAffiliation?: string;
  cnicNumber?: string;
  cnicDocumentUrl?: string;
  cnicDocumentDataUrl?: string;
  videoVerificationUrl?: string;
  videoVerificationDataUrl?: string;
  videoVerificationCompleted?: boolean;
  videoVerificationTimestamp?: string;
  cpspCertificateUrl?: string;
  cpspCertificateDataUrl?: string;
  cpspSpecialtyVerified?: boolean;
  undertakingSigned?: boolean;
  undertakingSignedAt?: string;
  undertakingSignatureText?: string;
  initialReviewerAdmin?: { name: string; email: string; signedAt: string; comments?: string };
  finalApproverAdmin?: { name: string; email: string; signedAt: string; comments?: string };
  isDuplicateFlagged?: boolean;
  duplicateFlagReason?: string;
  isSuspended?: boolean;
  suspendedAt?: string;
  suspendedBy?: string;
  suspensionReason?: string;
  yearlyRenewalDue?: string;
  yearlyRenewalStatus?: 'active' | 'renewal_due' | 'expired';
}

export interface VerificationLogRecord {
  id: string;
  doctorId: string;
  doctorName: string;
  pmdcNumber: string;
  specialty: string;
  qualification: string;
  avatarUrl: string;
  action: 'verified' | 'rejected' | 'suspended' | 'reinstated' | 'fraud_flagged';
  timestamp: string;
  adminNote: string;
  verifiedBy: string;
  initialReviewer?: string;
  finalApprover?: string;
  documentName?: string;
  hospital?: string;
  city?: string;
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
  | 'vitals'
  | 'records'
  | 'voice_assistant'
  | 'womens_health'
  | 'family_care'
  | 'care'
  | 'emergency'
  | 'doctor_portal';

export type VitalSignType = 'sugar' | 'bp' | 'heart_rate';
export type SugarTestTiming = 'fasting' | 'random' | 'post_meal' | 'hba1c';
export type SugarUnit = 'mg/dL' | 'mmol/L';
export type VitalsReminderMetric = 'sugar' | 'bp' | 'heart' | 'all';

export interface VitalsReminder {
  id: string;
  patientProfileId: string;
  metric: VitalsReminderMetric;
  title: string;
  titleUrdu: string;
  titleRoman: string;
  time: string; // 24h "HH:MM" e.g. "08:00"
  days: string[]; // e.g. ['everyday'] or ['Saturday', 'Sunday', etc.]
  enabled: boolean;
  sugarTiming?: SugarTestTiming;
  soundEnabled: boolean;
  lastTriggeredDate?: string; // "YYYY-MM-DD"
}

export interface VitalsReading {
  id: string;
  patientProfileId: string;
  patientName: string;
  patientAge?: string;
  date: string;
  timestamp: number;
  dayOfWeek?: string;
  dayNameUrdu?: string;
  dayNameRoman?: string;
  timeOfDay?: string;
  vitalType: 'sugar' | 'bp' | 'heart_rate' | 'all';
  // Sugar
  sugarValue?: number;
  sugarUnit?: SugarUnit;
  sugarTiming?: SugarTestTiming;
  // Blood Pressure
  systolic?: number;
  diastolic?: number;
  // Heart Rate
  heartRateBpm?: number;
  heartRateSource?: 'manual' | 'camera_sensor';
  // Detailed Per-Vital Statuses
  sugarStatus?: {
    category: string;
    categoryUrdu: string;
    categoryRoman: string;
    urgency: 'GREEN' | 'YELLOW' | 'RED';
    suggestion: string;
    suggestionUrdu: string;
    suggestionRoman: string;
  };
  bpStatus?: {
    category: string;
    categoryUrdu: string;
    categoryRoman: string;
    urgency: 'GREEN' | 'YELLOW' | 'RED';
    suggestion: string;
    suggestionUrdu: string;
    suggestionRoman: string;
  };
  heartRateStatus?: {
    category: string;
    categoryUrdu: string;
    categoryRoman: string;
    urgency: 'GREEN' | 'YELLOW' | 'RED';
    suggestion: string;
    suggestionUrdu: string;
    suggestionRoman: string;
  };
  dailyDoctorSummary?: {
    en: string;
    ur: string;
    roman: string;
  };
  // Clinical Interpretation
  urgency: 'GREEN' | 'YELLOW' | 'RED';
  categoryTitle: string;
  referenceRangeText: string;
  interpretationText: {
    en: string;
    ur: string;
    roman: string;
  };
  guidanceText: {
    en: string;
    ur: string;
    roman: string;
  };
  lifestyleTips: string[];
  isDoctorReviewed: boolean;
  reviewedByDoctor?: string;
  doctorPmdc?: string;
}

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

export interface SymptomFormData {
  chiefComplaint: string;
  chiefComplaintCategory: string;
  detailedNotes: string;
  duration: string;
  severity: number;
  progression: 'worsening' | 'constant' | 'improving' | 'fluctuating';
  associatedSymptoms: string[];
  triggersOrRelief: string;
  medicationsTaken: string;
  redFlags: {
    chestPain: boolean;
    breathingDifficulty: boolean;
    faintingOrConfusion: boolean;
    unableToKeepFluids: boolean;
    highFeverInfant: boolean;
  };
  photoBase64?: string | null;
}

// ==========================================
// DAILY MEDICINE REMINDER & ADHERENCE TYPES
// ==========================================

export type MedicineFrequency =
  | 'once_daily'
  | 'twice_daily'
  | 'three_times_daily'
  | 'four_times_daily'
  | 'as_needed'
  | 'custom';

export interface MedicineReminder {
  id: string;
  patientProfileId: string;
  patientName: string;
  medicineName: string;
  dosage: string; // e.g. "500mg" or "1 tablet"
  frequency: MedicineFrequency;
  times: string[]; // e.g. ["08:00", "20:00"]
  mealTiming?: 'before_meal' | 'after_meal' | 'with_meal' | 'anytime';
  notes?: string;
  enabled: boolean;
  startDate: string;
  source?: 'manual' | 'medicine_checker' | 'doctor_prescription' | 'voice';
}

export type AdherenceStatus = 'taken' | 'snoozed' | 'skipped';

export interface MedicineAdherenceLog {
  id: string;
  reminderId: string;
  patientProfileId: string;
  patientName: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string; // HH:MM
  scheduledDate: string; // YYYY-MM-DD
  respondedAt: string; // ISO string
  status: AdherenceStatus;
  notes?: string;
}

// ==========================================
// QR CODE HEALTH CARD SHARING TYPES
// ==========================================

export interface HealthCardShareConfig {
  includeBasicInfo: boolean; // Name, age, gender, blood group
  includeEmergencyContacts: boolean;
  includeAllergies: boolean;
  includeCurrentMedicines: boolean;
  includeChronicConditions: boolean;
  includeRecentVitals: boolean;
  includeDoctorDiagnoses: boolean;
}

export interface SharedHealthCardData {
  cardId: string;
  token: string;
  generatedAt: string;
  expiresAt: string;
  patientProfileId: string;
  patientName: string;
  age?: number | string;
  gender?: string;
  bloodGroup?: string;
  emergencyPhone?: string;
  allergies?: string[];
  chronicConditions?: string[];
  currentMedicines?: {
    name: string;
    dosage: string;
    frequency?: string;
    timing?: string;
  }[];
  recentVitals?: {
    bloodPressure?: string;
    bloodSugar?: string;
    sugarTiming?: string;
    heartRate?: string;
    recordedAt?: string;
  };
  diagnoses?: {
    title: string;
    doctorName?: string;
    date?: string;
  }[];
  patientLanguage?: SupportedLanguage;
  specialInstructions?: string;
}

// Module 5: Appointments and Healthcare Visit Management
export interface AppointmentRecord {
  id: string;
  userId: string;
  patientProfileId: string;
  patientName: string;
  doctorOrFacility: string;
  specialty?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  visitPurpose: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  attachedReportIds?: string[];
  attachedReportTitles?: string[];
  notes?: string;
  contactPhone?: string;
  location?: string;
  reminderMinutesBefore?: number;
  reminderSet?: boolean;
  createdAt: string;
}

// Module 2: Medicine Management and Smart Reminders
export interface MedicationScheduleItem {
  id: string;
  userId: string;
  patientProfileId: string;
  patientName: string;
  medicineName: string;
  genericName?: string;
  dosage: string;
  schedule: 'once_daily' | 'twice_daily' | 'thrice_daily' | 'four_times_daily' | 'as_needed';
  timeSlots: string[]; // e.g. ["08:00", "20:00"]
  durationDays?: number;
  prescribingDoctor?: string;
  instructions?: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'paused';
  stockCount?: number;
  logs: {
    id: string;
    date: string; // YYYY-MM-DD
    timeSlot: string; // "08:00"
    status: 'taken' | 'skipped' | 'missed';
    loggedAt: string;
  }[];
}

// Module 7: Personalized Health Goals and Progress
export type HealthGoalCategory = 'hydration' | 'exercise' | 'sleep' | 'blood_sugar' | 'blood_pressure';

export interface HealthGoalItem {
  id: string;
  userId: string;
  category: HealthGoalCategory;
  title: string;
  titleUrdu: string;
  titleRoman: string;
  targetValue: number;
  unit: string;
  currentValue: number;
  reminderTime?: string;
  history: {
    date: string; // YYYY-MM-DD
    value: number;
    completed: boolean;
  }[];
}

// Section 6: Women's Health & Maternal Care
export interface WomensCycleRecord {
  userId: string;
  lastPeriodDate: string; // YYYY-MM-DD
  cycleLengthDays: number; // default 28
  periodDurationDays: number; // default 5
  isPregnant?: boolean;
  pregnancyDueDate?: string;
  pregnancyWeek?: number;
  symptomLogs: {
    date: string;
    symptoms: string[];
    flow?: 'spotting' | 'light' | 'medium' | 'heavy';
    mood?: string;
    notes?: string;
  }[];
  antenatalReminders?: {
    id: string;
    title: string;
    dueDate: string;
    completed: boolean;
  }[];
}

// Child Vaccination Item for Family Care
export interface ChildVaccineItem {
  id: string;
  vaccineName: string;
  diseaseTarget: string;
  recommendedAge: string;
  recommendedMonths: number;
  status: 'due' | 'completed' | 'overdue';
  administeredDate?: string;
  batchNumber?: string;
  clinic?: string;
}

// Advanced Report Analyzer Structured Result
export interface StructuredBiomarkerItem {
  testName: string;
  result: string;
  numericValue?: number;
  unit: string;
  referenceRange: string;
  flag: 'normal' | 'low' | 'high' | 'critical' | 'borderline';
  confidence: number; // 0 to 100
  isUncertain?: boolean;
  needsReview?: boolean;
  explanation?: string;
  pageNumber?: number;
}

export interface StructuredReportAnalysis {
  isRelevant?: boolean;
  relevanceReason?: 'valid_medical' | 'not_medical' | 'unclear_blurry';
  reportType?: 'lab' | 'xray' | 'prescription' | 'other';
  reportTitle: string;
  reportDate?: string;
  laboratoryName?: string;
  patientName?: string;
  patientAge?: string;
  overallQuality: 'clear' | 'fair' | 'faded_damaged' | 'poor';
  qualityNotes?: string;
  urgency: UrgencyLevel;
  tests: StructuredBiomarkerItem[];
  radiologyFindings?: {
    anatomicalRegion?: string;
    view?: string;
    observations?: string[];
    impression?: string;
    fractureOrPathology?: string;
  };
  unreadableRegions: string[];
  clinicalSummary: string;
  spokenSummary?: string;
  questionsForDoctor: string[];
  originalLanguage?: string;
  preprocessedImageUrl?: string;
}


