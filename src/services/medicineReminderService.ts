import {
  MedicineReminder,
  MedicineAdherenceLog,
  MedicineFrequency,
  AdherenceStatus,
  SupportedLanguage,
} from '../types';

export const DEFAULT_DOSING_SCHEDULES: Record<
  MedicineFrequency,
  { defaultTimes: string[]; labelEn: string; labelUr: string; labelRoman: string }
> = {
  once_daily: {
    defaultTimes: ['08:00'],
    labelEn: 'Once Daily (1x)',
    labelUr: 'روزانہ ایک بار',
    labelRoman: 'Rozana 1 Baar',
  },
  twice_daily: {
    defaultTimes: ['08:00', '20:00'],
    labelEn: 'Twice Daily (2x - Morning & Evening)',
    labelUr: 'روزانہ دو بار (صبح و شام)',
    labelRoman: 'Rozana 2 Baar (Subah o Shaam)',
  },
  three_times_daily: {
    defaultTimes: ['08:00', '14:00', '20:00'],
    labelEn: 'Three Times Daily (3x)',
    labelUr: 'روزانہ تین بار (صبح، دوپہر، شام)',
    labelRoman: 'Rozana 3 Baar (Subah, Dopehar, Shaam)',
  },
  four_times_daily: {
    defaultTimes: ['06:00', '12:00', '18:00', '23:00'],
    labelEn: 'Four Times Daily (4x)',
    labelUr: 'روزانہ چار بار',
    labelRoman: 'Rozana 4 Baar',
  },
  as_needed: {
    defaultTimes: ['12:00'],
    labelEn: 'As Needed (SOS / Pain)',
    labelUr: 'ضرورت کے وقت',
    labelRoman: 'Zaroorat Ke Waqt',
  },
  custom: {
    defaultTimes: ['09:00'],
    labelEn: 'Custom Time',
    labelUr: 'مخصوص اوقات',
    labelRoman: 'Makhsoos Auqat',
  },
};

/**
 * Common Pakistani medicine presets with default dosage & timings
 */
export const POPULAR_MEDICINE_PRESETS: Array<{
  name: string;
  dosage: string;
  frequency: MedicineFrequency;
  times: string[];
  mealTiming: 'before_meal' | 'after_meal' | 'with_meal' | 'anytime';
  category: string;
}> = [
  {
    name: 'Glucophage (Metformin)',
    dosage: '500mg',
    frequency: 'twice_daily',
    times: ['08:30', '20:30'],
    mealTiming: 'with_meal',
    category: 'Diabetes / شوگر',
  },
  {
    name: 'Panadol (Paracetamol)',
    dosage: '500mg (1-2 Tablets)',
    frequency: 'three_times_daily',
    times: ['08:00', '14:00', '20:00'],
    mealTiming: 'after_meal',
    category: 'Fever & Pain / بخار و درد',
  },
  {
    name: 'Loprin (Aspirin)',
    dosage: '75mg',
    frequency: 'once_daily',
    times: ['13:00'],
    mealTiming: 'after_meal',
    category: 'Cardiac & Blood / دل و خون',
  },
  {
    name: 'Risek (Omeprazole)',
    dosage: '20mg',
    frequency: 'once_daily',
    times: ['07:30'],
    mealTiming: 'before_meal',
    category: 'Stomach & Acid / معدہ و تیزابیت',
  },
  {
    name: 'Augmentin (Amoxicillin/Clavulanate)',
    dosage: '625mg',
    frequency: 'twice_daily',
    times: ['09:00', '21:00'],
    mealTiming: 'with_meal',
    category: 'Antibiotic / اینٹی بائیوٹک',
  },
];

/**
 * Load reminders from local storage for a specific patient profile
 */
export function loadMedicineReminders(patientProfileId: string = 'prof-self'): MedicineReminder[] {
  const key = `sehat_medicine_reminders_${patientProfileId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load medicine reminders:', err);
  }
  return [];
}

/**
 * Save reminders to local storage
 */
export function saveMedicineReminders(
  patientProfileId: string = 'prof-self',
  reminders: MedicineReminder[]
): void {
  const key = `sehat_medicine_reminders_${patientProfileId}`;
  try {
    localStorage.setItem(key, JSON.stringify(reminders));
  } catch (err) {
    console.warn('Failed to save medicine reminders:', err);
  }
}

/**
 * Add a new medicine reminder
 */
export function addMedicineReminder(
  patientProfileId: string,
  patientName: string,
  data: Omit<MedicineReminder, 'id' | 'patientProfileId' | 'patientName'>
): MedicineReminder {
  const current = loadMedicineReminders(patientProfileId);
  const newReminder: MedicineReminder = {
    ...data,
    id: `med-rem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    patientProfileId,
    patientName,
  };
  const updated = [newReminder, ...current];
  saveMedicineReminders(patientProfileId, updated);
  return newReminder;
}

/**
 * Update an existing reminder
 */
export function updateMedicineReminder(
  patientProfileId: string,
  updatedReminder: MedicineReminder
): void {
  const current = loadMedicineReminders(patientProfileId);
  const updated = current.map((r) => (r.id === updatedReminder.id ? updatedReminder : r));
  saveMedicineReminders(patientProfileId, updated);
}

/**
 * Delete a reminder
 */
export function deleteMedicineReminder(patientProfileId: string, reminderId: string): void {
  const current = loadMedicineReminders(patientProfileId);
  const updated = current.filter((r) => r.id !== reminderId);
  saveMedicineReminders(patientProfileId, updated);
}

/**
 * Toggle enable/disable
 */
export function toggleMedicineReminder(
  patientProfileId: string,
  reminderId: string,
  enabled: boolean
): void {
  const current = loadMedicineReminders(patientProfileId);
  const updated = current.map((r) => (r.id === reminderId ? { ...r, enabled } : r));
  saveMedicineReminders(patientProfileId, updated);
}

// ==========================================
// ADHERENCE LOGS
// ==========================================

export function loadAdherenceLogs(patientProfileId: string = 'prof-self'): MedicineAdherenceLog[] {
  const key = `sehat_medicine_adherence_logs_${patientProfileId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load adherence logs:', err);
  }
  return [];
}

export function saveAdherenceLogs(
  patientProfileId: string = 'prof-self',
  logs: MedicineAdherenceLog[]
): void {
  const key = `sehat_medicine_adherence_logs_${patientProfileId}`;
  try {
    localStorage.setItem(key, JSON.stringify(logs));
  } catch (err) {
    console.warn('Failed to save adherence logs:', err);
  }
}

/**
 * Record a response (Taken / Snoozed / Skipped)
 */
export function recordAdherence(
  reminder: MedicineReminder,
  status: AdherenceStatus,
  scheduledTime: string,
  notes?: string
): MedicineAdherenceLog {
  const today = new Date().toISOString().split('T')[0];
  const newLog: MedicineAdherenceLog = {
    id: `adh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    reminderId: reminder.id,
    patientProfileId: reminder.patientProfileId,
    patientName: reminder.patientName,
    medicineName: reminder.medicineName,
    dosage: reminder.dosage,
    scheduledTime,
    scheduledDate: today,
    respondedAt: new Date().toISOString(),
    status,
    notes,
  };

  const current = loadAdherenceLogs(reminder.patientProfileId);
  const updated = [newLog, ...current];
  saveAdherenceLogs(reminder.patientProfileId, updated);
  return newLog;
}

/**
 * Calculate statistical adherence summary
 */
export function calculateAdherenceStats(
  logs: MedicineAdherenceLog[],
  daysLookback: number = 7
): {
  totalDoses: number;
  takenCount: number;
  snoozedCount: number;
  skippedCount: number;
  adherencePercentage: number;
  consecutiveStreakDays: number;
  repeatedSkips: Array<{ medicineName: string; skipCount: number }>;
} {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysLookback);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];

  const recentLogs = logs.filter((l) => l.scheduledDate >= cutoffStr);
  const totalDoses = recentLogs.length;
  const takenCount = recentLogs.filter((l) => l.status === 'taken').length;
  const snoozedCount = recentLogs.filter((l) => l.status === 'snoozed').length;
  const skippedCount = recentLogs.filter((l) => l.status === 'skipped').length;

  const adherencePercentage =
    totalDoses > 0 ? Math.round((takenCount / totalDoses) * 100) : 100;

  // Track skipped counts per medicine to detect patterns (3+ skips)
  const skipMap: Record<string, number> = {};
  recentLogs.forEach((l) => {
    if (l.status === 'skipped') {
      skipMap[l.medicineName] = (skipMap[l.medicineName] || 0) + 1;
    }
  });

  const repeatedSkips = Object.entries(skipMap)
    .filter(([_, count]) => count >= 3)
    .map(([medicineName, skipCount]) => ({ medicineName, skipCount }));

  // Calculate consecutive days streak
  let consecutiveStreakDays = 0;
  const dateMap: Record<string, boolean> = {};
  logs.forEach((l) => {
    if (l.status === 'taken') {
      dateMap[l.scheduledDate] = true;
    }
  });

  const checkDate = new Date();
  for (let i = 0; i < 30; i++) {
    const dStr = checkDate.toISOString().split('T')[0];
    if (dateMap[dStr]) {
      consecutiveStreakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    totalDoses,
    takenCount,
    snoozedCount,
    skippedCount,
    adherencePercentage,
    consecutiveStreakDays,
    repeatedSkips,
  };
}

// ==========================================
// NATURAL VOICE PARSER FOR REMINDERS
// ==========================================

/**
 * Parses conversational Urdu, Roman Urdu, or English voice input
 * Examples:
 * - "Mujhe subah 8 baje aur shaam 8 baje sugar ki dawai yaad dilana"
 * - "صبح 8 بجے اور شام 8 بجے شوگر کی دوائی کا ریمائنڈر لگائیں"
 * - "Remind me at 8 AM and 8 PM for blood pressure medicine"
 */
export function parseVoiceReminderCommand(
  transcript: string,
  currentLanguage: SupportedLanguage
): {
  success: boolean;
  medicineName?: string;
  dosage?: string;
  times?: string[];
  frequency?: MedicineFrequency;
  mealTiming?: 'before_meal' | 'after_meal' | 'with_meal' | 'anytime';
  parsedSummaryEn?: string;
  parsedSummaryUr?: string;
  parsedSummaryRoman?: string;
  confirmationSpeech?: string;
} {
  const text = transcript.toLowerCase().trim();
  if (!text) {
    return { success: false };
  }

  // 1. Detect medicine name
  let medName = '';
  let dosage = '1 Dose';
  let mealTiming: 'before_meal' | 'after_meal' | 'with_meal' | 'anytime' = 'after_meal';

  if (text.includes('sugar') || text.includes('شوگر') || text.includes('glucophage') || text.includes('metformin')) {
    medName = 'Glucophage (Sugar)';
    dosage = '500mg';
    mealTiming = 'with_meal';
  } else if (text.includes('bp') || text.includes('blood pressure') || text.includes('بلڈ پریشر') || text.includes('loprin') || text.includes('aspirin')) {
    medName = 'BP Medicine (Loprin)';
    dosage = '75mg';
  } else if (text.includes('panadol') || text.includes('pain') || text.includes('بخار') || text.includes('درد') || text.includes('paracetamol')) {
    medName = 'Panadol (Paracetamol)';
    dosage = '500mg';
  } else if (text.includes('risek') || text.includes('acid') || text.includes('معدہ') || text.includes('omeprazole')) {
    medName = 'Risek (Omeprazole)';
    dosage = '20mg';
    mealTiming = 'before_meal';
  } else if (text.includes('antibiotic') || text.includes('augmentin')) {
    medName = 'Augmentin';
    dosage = '625mg';
    mealTiming = 'with_meal';
  } else {
    // Try extracting any word before "ki dawai" or "medicine"
    const dawaiMatch = transcript.match(/([A-Za-z0-9\u0600-\u06FF\s]+?)\s*(?:ki\s*dawai|dawa|medicine|tablet|syrup)/i);
    if (dawaiMatch && dawaiMatch[1]?.trim().length > 2) {
      medName = dawaiMatch[1].trim();
    } else {
      medName = currentLanguage === 'ur' ? 'تجویز کردہ دوا' : 'Prescribed Medicine';
    }
  }

  // 2. Detect Times from voice
  const times: string[] = [];

  // Morning / Subah
  if (text.includes('subah') || text.includes('صبح') || text.includes('morning') || text.includes('am')) {
    const morningHour = text.match(/(?:subah|صبح|morning)\s*(\d{1,2})/i) || text.match(/(\d{1,2})\s*(?:baje|am)/i);
    if (morningHour && morningHour[1]) {
      const h = parseInt(morningHour[1], 10);
      times.push(`${h.toString().padStart(2, '0')}:00`);
    } else {
      times.push('08:00');
    }
  }

  // Evening / Shaam / Night / Raat
  if (text.includes('shaam') || text.includes('شام') || text.includes('raat') || text.includes('رات') || text.includes('evening') || text.includes('night') || text.includes('pm')) {
    const eveningHour = text.match(/(?:shaam|شام|raat|رات|evening|night)\s*(\d{1,2})/i);
    if (eveningHour && eveningHour[1]) {
      let h = parseInt(eveningHour[1], 10);
      if (h < 12) h += 12; // 8 baje shaam -> 20:00
      times.push(`${h.toString().padStart(2, '0')}:00`);
    } else {
      times.push('20:00');
    }
  }

  // Afternoon / Dopehar
  if (text.includes('dopehar') || text.includes('دوپہر') || text.includes('afternoon')) {
    times.push('14:00');
  }

  // Deduplicate and sort times
  const uniqueTimes = Array.from(new Set(times)).sort();
  if (uniqueTimes.length === 0) {
    uniqueTimes.push('08:00', '20:00');
  }

  // 3. Determine Frequency
  let frequency: MedicineFrequency = 'twice_daily';
  if (uniqueTimes.length === 1) frequency = 'once_daily';
  else if (uniqueTimes.length === 2) frequency = 'twice_daily';
  else if (uniqueTimes.length === 3) frequency = 'three_times_daily';
  else if (uniqueTimes.length >= 4) frequency = 'four_times_daily';

  // Summaries
  const timeFormatted = uniqueTimes.join(' & ');
  const parsedSummaryEn = `${medName} (${dosage}) - ${uniqueTimes.length}x daily at ${timeFormatted}`;
  const parsedSummaryUr = `${medName} (${dosage}) - روزانہ ${uniqueTimes.length} بار اوقات: ${timeFormatted}`;
  const parsedSummaryRoman = `${medName} (${dosage}) - Rozana ${uniqueTimes.length} baar: ${timeFormatted}`;

  const confirmationSpeech =
    currentLanguage === 'ur'
      ? `جی ہاں! آپ کی ${medName} کا ریمائنڈر ${timeFormatted} کے لیے محفوظ کر لیا گیا ہے۔`
      : currentLanguage === 'roman'
      ? `Aapki ${medName} ka daily reminder ${timeFormatted} par set ho gaya hai.`
      : `Your daily reminder for ${medName} has been successfully scheduled for ${timeFormatted}.`;

  return {
    success: true,
    medicineName: medName,
    dosage,
    times: uniqueTimes,
    frequency,
    mealTiming,
    parsedSummaryEn,
    parsedSummaryUr,
    parsedSummaryRoman,
    confirmationSpeech,
  };
}
