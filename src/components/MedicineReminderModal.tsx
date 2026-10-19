import React, { useState, useEffect } from 'react';
import {
  X,
  Pill,
  Clock,
  Plus,
  Trash2,
  Bell,
  CheckCircle2,
  Volume2,
  Mic,
  MicOff,
  User,
  Sparkles,
  Calendar,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import {
  MedicineReminder,
  MedicineFrequency,
  SupportedLanguage,
  PatientProfile,
} from '../types';
import { voiceManager, createSpeechRecognizer } from '../services/voice';
import {
  loadMedicineReminders,
  addMedicineReminder,
  deleteMedicineReminder,
  toggleMedicineReminder,
  parseVoiceReminderCommand,
  DEFAULT_DOSING_SCHEDULES,
  POPULAR_MEDICINE_PRESETS,
} from '../services/medicineReminderService';

interface MedicineReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: SupportedLanguage;
  patientProfiles: PatientProfile[];
  initialMedicineName?: string;
  initialDosage?: string;
  initialProfileId?: string;
  onReminderAdded?: (reminder: MedicineReminder) => void;
}

export const MedicineReminderModal: React.FC<MedicineReminderModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  patientProfiles,
  initialMedicineName = '',
  initialDosage = '',
  initialProfileId,
  onReminderAdded,
}) => {
  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';

  // Mode: 'add' | 'list' | 'voice'
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'voice'>(
    initialMedicineName ? 'add' : 'list'
  );

  // Selected Profile
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    initialProfileId || patientProfiles[0]?.id || 'prof-self'
  );

  // Reminders list
  const [reminders, setReminders] = useState<MedicineReminder[]>([]);

  // Form State
  const [medicineName, setMedicineName] = useState(initialMedicineName);
  const [dosage, setDosage] = useState(initialDosage || '1 Tablet');
  const [frequency, setFrequency] = useState<MedicineFrequency>('twice_daily');
  const [times, setTimes] = useState<string[]>(['08:00', '20:00']);
  const [mealTiming, setMealTiming] = useState<'before_meal' | 'after_meal' | 'with_meal' | 'anytime'>('after_meal');
  const [notes, setNotes] = useState('');

  // Voice State
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceParsedFeedback, setVoiceParsedFeedback] = useState<string | null>(null);

  // Notice
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Load reminders when profile changes or modal opens
  useEffect(() => {
    if (!isOpen) return;
    const loaded = loadMedicineReminders(selectedProfileId);
    setReminders(loaded);
  }, [isOpen, selectedProfileId]);

  // Sync initial props
  useEffect(() => {
    if (initialMedicineName) {
      setMedicineName(initialMedicineName);
      if (initialDosage) setDosage(initialDosage);
      setActiveTab('add');
    }
    if (initialProfileId) {
      setSelectedProfileId(initialProfileId);
    }
  }, [initialMedicineName, initialDosage, initialProfileId]);

  // Adjust times when frequency changes
  const handleFrequencyChange = (newFreq: MedicineFrequency) => {
    setFrequency(newFreq);
    const preset = DEFAULT_DOSING_SCHEDULES[newFreq];
    if (preset) {
      setTimes([...preset.defaultTimes]);
    }
  };

  const handleTimeChange = (index: number, val: string) => {
    const updated = [...times];
    updated[index] = val;
    setTimes(updated);
  };

  const handleAddTimeSlot = () => {
    setTimes([...times, '12:00']);
  };

  const handleRemoveTimeSlot = (index: number) => {
    if (times.length <= 1) return;
    setTimes(times.filter((_, i) => i !== index));
  };

  // Add Reminder Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineName.trim()) return;

    const targetProfile = patientProfiles.find((p) => p.id === selectedProfileId);
    const targetName = targetProfile?.name || 'Self';

    const newRem = addMedicineReminder(selectedProfileId, targetName, {
      medicineName: medicineName.trim(),
      dosage: dosage.trim() || '1 Dose',
      frequency,
      times,
      mealTiming,
      notes: notes.trim(),
      enabled: true,
      startDate: new Date().toISOString().split('T')[0],
      source: 'manual',
    });

    const updatedList = loadMedicineReminders(selectedProfileId);
    setReminders(updatedList);

    const speech = isUrdu
      ? `${medicineName} کا روزانہ ریمائنڈر کامیابی سے محفوظ ہو گیا ہے۔`
      : isRoman
      ? `${medicineName} ka daily reminder schedule ho gaya hai.`
      : `Daily reminder for ${medicineName} has been scheduled successfully.`;

    voiceManager.speak(speech, currentLanguage);
    setStatusNotice(speech);
    setTimeout(() => setStatusNotice(null), 3000);

    if (onReminderAdded) {
      onReminderAdded(newRem);
    }

    // Reset fields and go to list
    setMedicineName('');
    setDosage('1 Tablet');
    setActiveTab('list');
  };

  // Voice Dictation Handler
  const handleStartVoice = () => {
    voiceManager.stop();
    setVoiceTranscript('');
    setVoiceParsedFeedback(null);

    const prompt = isUrdu
      ? 'بولیں: مثلاً "مجھے صبح آٹھ بجے اور شام آٹھ بجے شوگر کی دوائی یاد دلانا"'
      : isRoman
      ? 'Bolein: maslan "Mujhe subah 8 baje aur shaam 8 baje sugar ki dawai yaad dilana"'
      : 'Speak: e.g. "Remind me at 8 AM and 8 PM for blood pressure medicine"';

    setStatusNotice(prompt);

    try {
      const recognizer = createSpeechRecognizer();
      setIsVoiceListening(true);
      recognizer.start(
        currentLanguage,
        (transcript: string) => {
          setVoiceTranscript(transcript);
          const parsed = parseVoiceReminderCommand(transcript, currentLanguage);

          if (parsed.success && parsed.medicineName) {
            setMedicineName(parsed.medicineName);
            if (parsed.dosage) setDosage(parsed.dosage);
            if (parsed.frequency) setFrequency(parsed.frequency);
            if (parsed.times && parsed.times.length > 0) setTimes(parsed.times);
            if (parsed.mealTiming) setMealTiming(parsed.mealTiming);

            const feedback = isUrdu
              ? parsed.parsedSummaryUr
              : isRoman
              ? parsed.parsedSummaryRoman
              : parsed.parsedSummaryEn;
            setVoiceParsedFeedback(feedback || 'Reminder details recognized');

            if (parsed.confirmationSpeech) {
              voiceManager.speak(parsed.confirmationSpeech, currentLanguage);
            }
          }
        },
        () => {
          setIsVoiceListening(false);
          setStatusNotice(null);
        },
        () => {
          setIsVoiceListening(false);
          setStatusNotice(null);
        }
      );
    } catch {
      setIsVoiceListening(false);
      setStatusNotice('Microphone permission required for voice dictation.');
    }
  };

  const handleApplyPopularPreset = (preset: typeof POPULAR_MEDICINE_PRESETS[0]) => {
    setMedicineName(preset.name);
    setDosage(preset.dosage);
    setFrequency(preset.frequency);
    setTimes([...preset.times]);
    setMealTiming(preset.mealTiming);
    setActiveTab('add');
  };

  const handleDelete = (id: string) => {
    deleteMedicineReminder(selectedProfileId, id);
    setReminders(loadMedicineReminders(selectedProfileId));
  };

  const handleToggle = (id: string, currentVal: boolean) => {
    toggleMedicineReminder(selectedProfileId, id, !currentVal);
    setReminders(loadMedicineReminders(selectedProfileId));
  };

  if (!isOpen) return null;

  const currentProfileObj = patientProfiles.find((p) => p.id === selectedProfileId);

  return (
    <div
      id="medicine-reminder-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="medicine-reminder-modal"
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-teal-200 dark:border-teal-900/60 p-5 sm:p-7 text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 flex items-center justify-center shadow-xs">
              <Bell className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {isUrdu ? 'روزانہ دوا کی یاد دہانی (ریمائنڈر)' : isRoman ? 'Daily Medicine Reminder' : 'Daily Medicine Reminder'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isUrdu ? 'آواز یا تحریر کے ذریعے بروقت دوائی یاد دہانی' : 'Voice & scheduled notifications so you never miss a dose'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Selector Banner */}
        <div className="mt-3 p-2.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/80 flex items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600" />
            <span className="font-bold text-teal-950 dark:text-teal-200">
              {isUrdu ? 'کس مریض کے لیے؟' : 'Reminder For:'}
            </span>
          </div>

          <select
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-800 font-bold text-xs text-teal-900 dark:text-teal-200 focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            {patientProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.relation || 'Self'})
              </option>
            ))}
          </select>
        </div>

        {/* Status Notice */}
        {statusNotice && (
          <div className="mt-2.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs text-center font-bold animate-in fade-in">
            {statusNotice}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-2 mt-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'list'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isUrdu ? `فہرست (${reminders.length})` : `Active (${reminders.length})`}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'add'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'نیا ریمائنڈر' : 'Add New'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('voice');
              handleStartVoice();
            }}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'voice'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-red-500" />
            <span>{isUrdu ? 'آواز سے بولیں' : 'Voice Setup'}</span>
          </button>
        </div>

        {/* Scrollable Tab Content */}
        <div className="overflow-y-auto flex-1 min-h-0 space-y-4 pr-1 mt-3">
          {/* TAB 1: ACTIVE REMINDERS LIST */}
          {activeTab === 'list' && (
            <div className="space-y-3">
              {reminders.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Pill className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                      {isUrdu ? 'کوئی فعال ریمائنڈر موجود نہیں' : 'No active reminders yet'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {isUrdu
                        ? 'دوائی کا ریمائنڈر لگائیں تاکہ وقت پر آواز اور نوٹیفکیشن مل سکے۔'
                        : `Set up a reminder for ${currentProfileObj?.name || 'this patient'} so they never miss a dose.`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('add')}
                    className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    + {isUrdu ? 'پہلا ریمائنڈر لگائیں' : 'Create First Reminder'}
                  </button>
                </div>
              ) : (
                reminders.map((r) => (
                  <div
                    key={r.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      r.enabled
                        ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                        : 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Pill className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                              {r.medicineName}
                            </h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold">
                              {r.dosage}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                            <div className="flex items-center gap-1 font-mono font-bold text-teal-700 dark:text-teal-400">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{r.times.join(' • ')}</span>
                            </div>
                            <span>•</span>
                            <span>{DEFAULT_DOSING_SCHEDULES[r.frequency]?.labelEn || r.frequency}</span>
                            {r.mealTiming && (
                              <>
                                <span>•</span>
                                <span className="text-slate-500">
                                  {r.mealTiming === 'before_meal' ? 'Before meal' : r.mealTiming === 'after_meal' ? 'After meal' : 'With meal'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Switch & Delete */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggle(r.id, r.enabled)}
                          className="text-teal-600 hover:text-teal-700 cursor-pointer p-1"
                          title={r.enabled ? 'Disable' : 'Enable'}
                        >
                          {r.enabled ? (
                            <ToggleRight className="w-6 h-6 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-slate-400" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(r.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: MANUAL FORM */}
          {activeTab === 'add' && (
            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              {/* Popular Pakistani Presets Pill Bar */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  {isUrdu ? 'تیز رفتار انتخاب (Popular Medicines):' : 'Quick Presets:'}
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {POPULAR_MEDICINE_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleApplyPopularPreset(p)}
                      className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-slate-800 hover:bg-teal-100 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-slate-700 font-bold whitespace-nowrap cursor-pointer transition-colors"
                    >
                      {p.name.split(' ')[0]} ({p.dosage})
                    </button>
                  ))}
                </div>
              </div>

              {/* Medicine Name */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isUrdu ? 'دوا کا نام (Medicine Name) *' : 'Medicine Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  placeholder="e.g. Glucophage, Panadol, Loprin, Augmentin"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Dosage & Food Relation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isUrdu ? 'خوراک (Dosage)' : 'Dosage'}
                  </label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 500mg, 1 tablet, 10ml"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isUrdu ? 'کھانے کے ساتھ تعلق' : 'Meal Instruction'}
                  </label>
                  <select
                    value={mealTiming}
                    onChange={(e) => setMealTiming(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="after_meal">{isUrdu ? 'کھانے کے بعد' : 'After Meal'}</option>
                    <option value="before_meal">{isUrdu ? 'کھانے سے پہلے (نہار منہ)' : 'Before Meal (Fasting)'}</option>
                    <option value="with_meal">{isUrdu ? 'کھانے کے دوران' : 'With Meal'}</option>
                    <option value="anytime">{isUrdu ? 'کسی بھی وقت' : 'Anytime'}</option>
                  </select>
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isUrdu ? 'روزانہ کی تعداد (Frequency)' : 'Daily Frequency'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(DEFAULT_DOSING_SCHEDULES).map(([key, sched]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleFrequencyChange(key as MedicineFrequency)}
                      className={`p-2 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                        frequency === key
                          ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block truncate">
                        {isUrdu ? sched.labelUr : sched.labelEn}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Specific Timings */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {isUrdu ? 'یاد دہانی کے اوقات (Scheduled Times)' : 'Scheduled Times'}
                  </label>
                  <button
                    type="button"
                    onClick={handleAddTimeSlot}
                    className="text-[11px] text-teal-700 dark:text-teal-400 font-bold hover:underline cursor-pointer"
                  >
                    + {isUrdu ? 'مزید وقت جوڑیں' : 'Add Time'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {times.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <input
                        type="time"
                        value={t}
                        onChange={(e) => handleTimeChange(idx, e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm"
                      />
                      {times.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTimeSlot(idx)}
                          className="p-1 text-slate-400 hover:text-red-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{isUrdu ? 'ریمائنڈر محفوظ کریں' : 'Save Daily Reminder'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: VOICE SETUP */}
          {activeTab === 'voice' && (
            <div className="py-4 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-950/80 border-2 border-red-300 dark:border-red-700 flex items-center justify-center mx-auto shadow-md shadow-red-500/20">
                <Mic className={`w-9 h-9 text-red-600 ${isVoiceListening ? 'animate-bounce' : ''}`} />
              </div>

              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  {isVoiceListening
                    ? (isUrdu ? 'سن رہے ہیں... بولیں' : 'Listening... Speak now')
                    : (isUrdu ? 'مائیک بٹن دبا کر بولیں' : 'Tap to Speak Your Reminder')}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {isUrdu
                    ? 'مثال: "مجھے صبح 8 بجے اور شام 8 بجے شوگر کی دوائی گلوکوفیج یاد دلانا"'
                    : 'Example: "Mujhe subah 8 baje aur shaam 8 baje sugar ki dawai yaad dilana"'}
                </p>
              </div>

              {/* Transcript Display */}
              {voiceTranscript && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Recognized Speech:</span>
                  <p className="font-bold text-slate-800 dark:text-white">"{voiceTranscript}"</p>
                </div>
              )}

              {/* Parsed Result Display */}
              {voiceParsedFeedback && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-xs text-left space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-black">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isUrdu ? 'ریمائنڈر خودکار تیار ہے:' : 'Reminder Auto-Configured:'}</span>
                  </div>
                  <p className="font-bold text-emerald-950 dark:text-emerald-100 text-sm">
                    {voiceParsedFeedback}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('add')}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs"
                  >
                    {isUrdu ? 'جائزہ لیں اور محفوظ کریں' : 'Review & Confirm in Form'}
                  </button>
                </div>
              )}

              {/* Microphone Toggle Button */}
              <button
                type="button"
                onClick={handleStartVoice}
                className={`px-6 py-3 rounded-full text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer ${
                  isVoiceListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-teal-700 hover:bg-teal-800 text-white'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>
                  {isVoiceListening
                    ? (isUrdu ? 'دوبارہ بولیں' : 'Stop / Re-listen')
                    : (isUrdu ? 'بولنا شروع کریں' : 'Start Voice Dictation')}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
