import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Pill,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Calendar,
  Share2,
  Bell,
  BellOff,
  User,
  Trash2,
  RefreshCw,
  Camera,
  FileText,
  ShieldCheck,
  Check,
  Info,
  Sparkles,
} from 'lucide-react';
import { SupportedLanguage, UserAccount, MedicationScheduleItem } from '../types';
import { TRANSLATIONS } from '../services/i18n';

interface MedicineManagementProps {
  currentLanguage: SupportedLanguage;
  currentUser?: UserAccount;
  onNavigateToCare?: () => void;
}

export const MedicineManagement: React.FC<MedicineManagementProps> = ({
  currentLanguage,
  currentUser,
  onNavigateToCare,
}) => {
  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';
  const userKey = (currentUser?.email || currentUser?.id || 'default').toLowerCase().trim();

  const [medications, setMedications] = useState<MedicationScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // New medication form
  const [newMedName, setNewMedName] = useState('');
  const [newGenericName, setNewGenericName] = useState('');
  const [newDosage, setNewDosage] = useState('500mg');
  const [newSchedule, setNewSchedule] = useState<'once_daily' | 'twice_daily' | 'thrice_daily' | 'as_needed'>('twice_daily');
  const [newDoctor, setNewDoctor] = useState('Dr. Ayesha Malik (PMDC #48291-P)');
  const [newInstructions, setNewInstructions] = useState('Take with clean water after meal');
  const [newDurationDays, setNewDurationDays] = useState(7);
  const [formError, setFormError] = useState<string | null>(null);

  // Load medications on mount
  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/medications/${encodeURIComponent(userKey)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.medications) && data.medications.length > 0) {
          setMedications(data.medications);
        } else {
          // Initialize sample real clinical medications for Pakistan
          const initialMeds: MedicationScheduleItem[] = [
            {
              id: 'med-panadol',
              userId: userKey,
              patientProfileId: 'prof-self',
              patientName: currentUser?.name || 'Patient',
              medicineName: 'Panadol (Paracetamol)',
              genericName: 'Paracetamol',
              dosage: '500 mg',
              schedule: 'thrice_daily',
              timeSlots: ['08:00', '14:00', '20:00'],
              durationDays: 5,
              prescribingDoctor: 'Dr. Ayesha Malik (PMDC #48291-P)',
              instructions: 'Take 1 tablet after meals for fever/body ache',
              startDate: new Date().toISOString().split('T')[0],
              status: 'active',
              logs: [],
            },
            {
              id: 'med-augmentin',
              userId: userKey,
              patientProfileId: 'prof-self',
              patientName: currentUser?.name || 'Patient',
              medicineName: 'Augmentin 625mg',
              genericName: 'Amoxicillin + Clavulanate',
              dosage: '625 mg',
              schedule: 'twice_daily',
              timeSlots: ['08:00', '20:00'],
              durationDays: 7,
              prescribingDoctor: 'Dr. Farhan Ali (PMDC #33102-P)',
              instructions: 'Complete full 7-day course. Do not stop midway.',
              startDate: new Date().toISOString().split('T')[0],
              status: 'active',
              logs: [],
            },
          ];
          setMedications(initialMeds);
        }
      })
      .catch((err) => {
        console.warn('Failed to load medications:', err);
      })
      .finally(() => setIsLoading(false));

    // Check notification permission
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, [userKey]);

  // Request browser notifications
  const handleToggleNotifications = async () => {
    if (!('Notification' in window)) {
      setNotificationMessage(isUrdu ? 'آپ کا براؤزر نوٹیفکیشن سپورٹ نہیں کرتا۔' : 'Notifications are not supported in this browser.');
      setTimeout(() => setNotificationMessage(null), 4000);
      return;
    }

    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      try {
        new Notification('SehatSaathi Pro', {
          body: isUrdu ? 'دواؤں کے اسمارٹ الرٹس فعال ہو چکے ہیں!' : 'Medicine smart reminders enabled!',
          icon: '/favicon.ico',
        });
      } catch {}
      setNotificationMessage(isUrdu ? 'دواؤں کے اسمارٹ الرٹس فعال ہیں!' : 'Medicine smart reminders enabled!');
      setTimeout(() => setNotificationMessage(null), 3000);
    } else {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          try {
            new Notification('SehatSaathi Pro', {
              body: isUrdu ? 'دواؤں کے اسمارٹ الرٹس فعال ہو چکے ہیں!' : 'Medicine smart reminders enabled!',
              icon: '/favicon.ico',
            });
          } catch {}
          setNotificationMessage(isUrdu ? 'دواؤں کے اسمارٹ الرٹس فعال ہو چکے ہیں!' : 'Medicine smart reminders enabled!');
          setTimeout(() => setNotificationMessage(null), 3000);
        } else {
          setNotificationsEnabled(false);
          setNotificationMessage(isUrdu ? 'نوٹیفکیشن کی اجازت نہیں ملی۔' : 'Notification permission was denied.');
          setTimeout(() => setNotificationMessage(null), 3000);
        }
      } catch {
        setNotificationsEnabled(false);
      }
    }
  };

  // Add new medicine
  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newMedName.trim()) {
      setFormError('Please enter a medicine name');
      return;
    }

    // Check for duplicate entry
    const isDuplicate = medications.some(
      (m) => m.medicineName.toLowerCase() === newMedName.trim().toLowerCase()
    );
    if (isDuplicate) {
      setFormError(
        isUrdu
          ? 'یہ دوا پہلے سے آپ کی لسٹ میں موجود ہے۔ دوبارہ شامل کرنے کی ضرورت نہیں۔'
          : 'This medicine already exists in your schedule to prevent double dosing.'
      );
      return;
    }

    // Check for potential drug conflict (e.g. 2 NSAIDs or multiple paracetamol products)
    const hasParacetamolAlready = medications.some(
      (m) => m.medicineName.toLowerCase().includes('panadol') || m.medicineName.toLowerCase().includes('paracetamol') || m.medicineName.toLowerCase().includes('calpol')
    );
    if (hasParacetamolAlready && (newMedName.toLowerCase().includes('paracetamol') || newMedName.toLowerCase().includes('calpol') || newMedName.toLowerCase().includes('panadol'))) {
      const proceed = confirm(
        isUrdu
          ? 'توجہ فرمائیں! آپ کی لسٹ میں پہلے سے پیراسیٹامول موجود ہے۔ دو ایک جیسی دوائیں ایک ساتھ کھانے سے اوورڈوز کا خطرہ ہوتا ہے۔ کیا آپ پھر بھی شامل کرنا چاہتے ہیں؟'
          : 'Warning: You already take a Paracetamol product. Taking multiple brands risks liver toxicity from overdose. Are you sure you wish to continue?'
      );
      if (!proceed) return;
    }

    let timeSlots: string[] = ['08:00'];
    if (newSchedule === 'twice_daily') timeSlots = ['08:00', '20:00'];
    if (newSchedule === 'thrice_daily') timeSlots = ['08:00', '14:00', '20:00'];

    const newMed: MedicationScheduleItem = {
      id: `med-${Date.now()}`,
      userId: userKey,
      patientProfileId: 'prof-self',
      patientName: currentUser?.name || 'Patient',
      medicineName: newMedName.trim(),
      genericName: newGenericName.trim() || undefined,
      dosage: newDosage.trim(),
      schedule: newSchedule,
      timeSlots,
      durationDays: newDurationDays,
      prescribingDoctor: newDoctor.trim() || undefined,
      instructions: newInstructions.trim() || undefined,
      startDate: new Date().toISOString().split('T')[0],
      status: 'active',
      logs: [],
    };

    const updated = [newMed, ...medications];
    setMedications(updated);
    setShowAddModal(false);

    // Reset form
    setNewMedName('');
    setNewGenericName('');
    setNewDosage('500mg');

    // Save to server
    fetch('/api/medications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userKey, medication: newMed }),
    }).catch((e) => console.warn('Failed to save medication:', e));
  };

  // Mark dose status
  const handleLogDose = (medId: string, timeSlot: string, status: 'taken' | 'skipped' | 'missed') => {
    const today = new Date().toISOString().split('T')[0];
    const logEntry = {
      id: `log-${Date.now()}`,
      date: today,
      timeSlot,
      status,
      loggedAt: new Date().toISOString(),
    };

    setMedications((prev) =>
      prev.map((m) => {
        if (m.id !== medId) return m;
        const filteredLogs = m.logs.filter(
          (l) => !(l.date === today && l.timeSlot === timeSlot)
        );
        return {
          ...m,
          logs: [logEntry, ...filteredLogs],
        };
      })
    );

    // Sync to backend
    fetch(`/api/medications/${encodeURIComponent(userKey)}/${medId}/log`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logEntry }),
    }).catch((e) => console.warn('Failed to log dose:', e));
  };

  // Delete medication
  const handleDeleteMedication = (medId: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== medId));
    fetch(`/api/medications/${encodeURIComponent(userKey)}/${medId}`, {
      method: 'DELETE',
    }).catch(() => {});
  };

  // Calculate adherence rate
  const allLogs = medications.flatMap((m) => m.logs);
  const takenCount = allLogs.filter((l) => l.status === 'taken').length;
  const adherenceRate = allLogs.length > 0 ? Math.round((takenCount / allLogs.length) * 100) : 95;

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-teal-900 via-teal-950 to-slate-900 text-white shadow-xl border border-teal-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shadow-inner">
              <Pill className="w-7 h-7 text-teal-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-400/20 text-teal-300 text-[11px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-teal-300" />
                <span>Smart Pill Schedule</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                {isUrdu ? 'ادویات کا انتظام اور اسمارٹ ریمائنڈرز' : 'Medicine Management & Smart Reminders'}
              </h2>
              <p className="text-xs text-teal-200/80 mt-1 max-w-xl">
                {isUrdu
                  ? 'اپنے تمام نسخے ایک جگہ رکھیں، روزانہ خوراک کو مارک کریں اور ممکنہ ڈبل ڈوز یا خطرات سے محفوظ رہیں۔'
                  : 'Track prescriptions, mark daily doses taken/skipped, and get conflict warnings.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleToggleNotifications}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                notificationsEnabled
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                  : 'bg-white/10 hover:bg-white/15 border-white/20 text-white'
              }`}
            >
              {notificationsEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
              <span>{notificationsEnabled ? (isUrdu ? 'الرٹس آن ہیں' : 'Alerts On') : (isUrdu ? 'الرٹ آن کریں' : 'Enable Alerts')}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isUrdu ? 'نئی دوا شامل کریں' : 'Add Medication'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification status feedback banner */}
      {notificationMessage && (
        <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-700/60 text-xs font-semibold text-teal-900 dark:text-teal-200 flex items-center justify-between shadow-xs">
          <span>{notificationMessage}</span>
          <button
            type="button"
            onClick={() => setNotificationMessage(null)}
            className="text-teal-700 dark:text-teal-400 hover:opacity-80 px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold mb-1">
            {isUrdu ? 'فعال دوائیں' : 'Active Medicines'}
          </div>
          <div className="text-2xl font-black text-teal-700 dark:text-teal-400">
            {medications.filter((m) => m.status === 'active').length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold mb-1">
            {isUrdu ? 'پابندی کا اسکور' : 'Adherence Rate'}
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {adherenceRate}%
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold mb-1">
            {isUrdu ? 'آج کی خوراکیں' : "Today's Doses"}
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-white">
            {medications.reduce((acc, m) => acc + m.timeSlots.length, 0)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-semibold mb-1">
              {isUrdu ? 'ڈاکٹر کو شیئر' : 'Share for Doctor'}
            </div>
            <button
              type="button"
              onClick={() => {
                const list = medications
                  .map((m) => `${m.medicineName} (${m.dosage}) - ${m.schedule}`)
                  .join('\n');
                navigator.clipboard.writeText(`Patient Medication List:\n${list}`);
                setCopiedShareLink(true);
                setTimeout(() => setCopiedShareLink(false), 2500);
              }}
              className="text-xs font-bold text-teal-600 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedShareLink ? (isUrdu ? 'کاپی ہو گیا!' : 'Copied!') : (isUrdu ? 'لسٹ کاپی کریں' : 'Copy List')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Today's Schedule Timeline */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {isUrdu ? 'آج کا ٹائم ٹیبل (خوراک لیں اور مارک کریں)' : "Today's Schedule & Dose Tracking"}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        </div>

        {medications.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            {isUrdu ? 'کوئی دوا شامل نہیں ہے۔ اوپر دیے گئے بٹن سے نئی دوا شامل کریں۔' : 'No medicines added yet. Click Add Medication to start.'}
          </div>
        ) : (
          <div className="space-y-3">
            {medications.map((med) => (
              <div
                key={med.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {med.medicineName}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      <span className="font-semibold text-teal-700 dark:text-teal-400 mr-2">{med.dosage}</span>
                      <span>{med.instructions || med.schedule}</span>
                    </div>
                    {med.prescribingDoctor && (
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Rx: {med.prescribingDoctor}
                      </div>
                    )}
                  </div>
                </div>

                {/* Dose Actions per slot */}
                <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                  {med.timeSlots.map((slot) => {
                    const todayLog = med.logs.find(
                      (l) => l.date === todayStr && l.timeSlot === slot
                    );
                    const isTaken = todayLog?.status === 'taken';
                    const isSkipped = todayLog?.status === 'skipped';

                    return (
                      <div
                        key={slot}
                        className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 shadow-2xs"
                      >
                        <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 px-1.5">
                          {slot}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleLogDose(med.id, slot, 'taken')}
                          className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                            isTaken
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                          }`}
                          title="Mark Taken"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isUrdu ? 'کھا لی' : 'Taken'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleLogDose(med.id, slot, 'skipped')}
                          className={`px-1.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                            isSkipped
                              ? 'bg-amber-600 text-white'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                          title="Skip Dose"
                        >
                          {isUrdu ? 'چھوڑی' : 'Skip'}
                        </button>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => handleDeleteMedication(med.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Remove Medicine"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clinical Safety Disclosure */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-500 leading-relaxed flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
            {isUrdu ? 'طبی احتیاطی انتباہ:' : 'Clinical Safety Notice:'}
          </span>
          {isUrdu
            ? 'کسی بھی دوا کا شیڈول، مقدار یا ڈوز اپنے مستند معالج کے مشورے کے بغیر تبدیل نہ کریں۔ اگر آپ کو کوئی الرجی یا منفی اثرات محسوس ہوں تو فوری ڈاکٹر سے رابطہ کریں۔'
            : 'Never independently alter, start, or discontinue prescription medicines without consulting your prescribing PMDC doctor. In case of adverse reactions, seek emergency medical care.'}
        </div>
      </div>

      {/* Add Medication Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 text-left rtl:text-right"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {isUrdu ? 'نئی دوا درج کریں' : 'Add New Prescription'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleAddMedicine} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isUrdu ? 'دوا کا نام (Brand / Commercial Name)' : 'Medicine Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    placeholder="e.g. Panadol, Augmentin, Glucophage"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:border-teal-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isUrdu ? 'مقدار / ڈوز (Dosage)' : 'Dosage'}
                    </label>
                    <input
                      type="text"
                      value={newDosage}
                      onChange={(e) => setNewDosage(e.target.value)}
                      placeholder="e.g. 500mg, 10ml, 1 tab"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isUrdu ? 'شیڈول (Schedule)' : 'Frequency'}
                    </label>
                    <select
                      value={newSchedule}
                      onChange={(e) => setNewSchedule(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:border-teal-600 cursor-pointer"
                    >
                      <option value="once_daily">Once Daily (ایک بار)</option>
                      <option value="twice_daily">Twice Daily (صبح و شام)</option>
                      <option value="thrice_daily">3 Times Daily (صبح، دوپہر، رات)</option>
                      <option value="as_needed">As Needed / ضرورت پر</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isUrdu ? 'تجویز کردہ ڈاکٹر (Prescribing Clinician)' : 'Prescribing Doctor'}
                  </label>
                  <input
                    type="text"
                    value={newDoctor}
                    onChange={(e) => setNewDoctor(e.target.value)}
                    placeholder="Doctor Name & PMDC #"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isUrdu ? 'ہدایات (Instructions)' : 'Instructions'}
                  </label>
                  <input
                    type="text"
                    value={newInstructions}
                    onChange={(e) => setNewInstructions(e.target.value)}
                    placeholder="e.g. After meals with plenty of water"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:border-teal-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                  >
                    {isUrdu ? 'منسوخ' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    {isUrdu ? 'دوا محفوظ کریں' : 'Save Medicine'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
