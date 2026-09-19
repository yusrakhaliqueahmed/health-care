import React, { useState } from 'react';
import {
  Bell,
  BellRing,
  BellOff,
  Clock,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  AlertCircle,
  Activity,
  Flame,
  Heart,
  Volume2,
  VolumeX,
  Play,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  VitalsReminder,
  VitalsReminderMetric,
  SugarTestTiming,
  SupportedLanguage,
  PatientProfile,
} from '../types';
import {
  DEFAULT_PRESET_REMINDERS,
  playReminderChime,
  requestPushNotificationPermission,
  triggerBrowserPushNotification,
  getReminderNudgeMessage,
} from '../services/vitalsReminderService';
import { voiceManager } from '../services/voice';

interface VitalsReminderManagerProps {
  language: SupportedLanguage;
  activeProfile: PatientProfile;
  reminders: VitalsReminder[];
  onUpdateReminders: (reminders: VitalsReminder[]) => void;
  onTriggerNudgeNow: (reminder: VitalsReminder) => void;
}

export const VitalsReminderManager: React.FC<VitalsReminderManagerProps> = ({
  language,
  activeProfile,
  reminders,
  onUpdateReminders,
  onTriggerNudgeNow,
}) => {
  const isUrdu = language === 'ur';
  const isRoman = language === 'roman';

  // Browser notification permission state
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });

  // Modal / Form state for adding a custom reminder
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMetric, setNewMetric] = useState<VitalsReminderMetric>('sugar');
  const [newTime, setNewTime] = useState('08:00');
  const [newTitle, setNewTitle] = useState('');
  const [newSugarTiming, setNewSugarTiming] = useState<SugarTestTiming>('fasting');
  const [newSoundEnabled, setNewSoundEnabled] = useState(true);

  // Success / info feedback banner
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleRequestPermission = async () => {
    const perm = await requestPushNotificationPermission();
    setPermission(perm);
    if (perm === 'granted') {
      setActionNotice(
        isUrdu
          ? 'پش نوٹیفیکیشنز فعال ہو گئی ہیں! آپ کو وقت پر اطلاع ملے گی۔'
          : isRoman
          ? 'Push Notifications on ho gayi hain! Waqt par alert milega.'
          : 'Push notifications successfully enabled! You will be nudged at scheduled times.'
      );
      // Send a welcoming test notification
      triggerBrowserPushNotification(
        isUrdu ? 'صحت ساتھی وائٹلز الرٹ' : 'SehatSaathi Vitals Reminders',
        {
          body: isUrdu
            ? 'آپ کی روزانہ کی یاد دہانیاں فعال کر دی گئی ہیں۔'
            : isRoman
            ? 'Aapke daily vitals reminders active ho gaye hain.'
            : 'Your daily vitals reminders are now active.',
        }
      );
    } else if (perm === 'denied') {
      setActionNotice(
        isUrdu
          ? 'براؤزر نے نوٹیفیکیشن کی اجازت مسترد کر دی۔ ایپ کے اندر الرٹ کام کرتے رہیں گے۔'
          : isRoman
          ? 'Browser ne notification block kar di. In-app alerts kaam karte rahenge.'
          : 'Browser notifications blocked. In-app reminders will continue to alert you.'
      );
    }
  };

  const handleToggleReminder = (id: string) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    onUpdateReminders(updated);
  };

  const handleToggleSound = (id: string) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, soundEnabled: !r.soundEnabled } : r));
    onUpdateReminders(updated);
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    onUpdateReminders(updated);
  };

  const handleAddPreset = (preset: typeof DEFAULT_PRESET_REMINDERS[0]) => {
    const exists = reminders.some(
      (r) => r.time === preset.time && r.metric === preset.metric
    );
    if (exists) {
      setActionNotice(
        isUrdu
          ? 'یہ یاد دہانی پہلے سے آپ کی لسٹ میں موجود ہے۔'
          : isRoman
          ? 'Yeh reminder pehle se list mein mojood hai.'
          : 'This reminder time is already configured in your schedule.'
      );
      return;
    }

    const newRem: VitalsReminder = {
      ...preset,
      id: `rem-${activeProfile?.id || 'self'}-${Date.now()}`,
      patientProfileId: activeProfile?.id || 'prof-self',
      enabled: true,
    };
    onUpdateReminders([...reminders, newRem]);
    setActionNotice(
      isUrdu
        ? `نئی یاد دہانی شامل کر دی گئی: ${preset.time}`
        : isRoman
        ? `Naya reminder add ho gaya: ${preset.time}`
        : `Added scheduled reminder for ${preset.time}`
    );
  };

  const handleCreateCustomReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const defaultTitle =
      newMetric === 'sugar'
        ? newSugarTiming === 'fasting'
          ? 'Fasting Blood Sugar'
          : 'Post-Meal Sugar'
        : newMetric === 'bp'
        ? 'Blood Pressure Check'
        : newMetric === 'heart'
        ? 'Pulse & Heart Rate Check'
        : 'All Vitals Complete Check';

    const customRem: VitalsReminder = {
      id: `rem-${activeProfile?.id || 'self'}-${Date.now()}`,
      patientProfileId: activeProfile?.id || 'prof-self',
      metric: newMetric,
      title: newTitle.trim() || defaultTitle,
      titleUrdu:
        newMetric === 'sugar'
          ? 'شوگر چیک کرنے کا وقت'
          : newMetric === 'bp'
          ? 'بلڈ پریشر کی جانچ'
          : 'نبض اور دل کی دھڑکن',
      titleRoman:
        newMetric === 'sugar'
          ? 'Sugar Check Ka Waqt'
          : newMetric === 'bp'
          ? 'Blood Pressure Check'
          : 'Heart Rate Check',
      time: newTime,
      days: ['everyday'],
      enabled: true,
      sugarTiming: newMetric === 'sugar' ? newSugarTiming : undefined,
      soundEnabled: newSoundEnabled,
    };

    onUpdateReminders([...reminders, customRem]);
    setShowAddForm(false);
    setNewTitle('');
    setActionNotice(
      isUrdu
        ? `روزانہ کی یاد دہانی کامیابی سے محفوظ ہو گئی (${newTime})`
        : isRoman
        ? `Daily reminder save ho gaya (${newTime})`
        : `Daily reminder scheduled for ${newTime}`
    );
  };

  const handleSimulateTest = (reminder: VitalsReminder) => {
    // 1. Play audio chime if enabled
    if (reminder.soundEnabled) {
      playReminderChime();
    }
    // 2. Play voice prompt
    const nudgeMsg = getReminderNudgeMessage(reminder, language);
    voiceManager.speak(nudgeMsg.spokenText, language);

    // 3. Browser Push Notification
    triggerBrowserPushNotification(nudgeMsg.title, {
      body: nudgeMsg.body,
    });

    // 4. Trigger In-App Nudge Banner
    onTriggerNudgeNow(reminder);
  };

  const activeCount = reminders.filter((r) => r.enabled).length;

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      {actionNotice && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-4 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 dark:text-emerald-200 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="font-semibold">{actionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-xs text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
          >
            {isUrdu ? 'بند کریں' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Notification Permission Card */}
      <div className="bg-gradient-to-br from-amber-500/10 via-slate-900/40 to-slate-900/80 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
              <BellRing className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {isUrdu
                    ? 'وقت پر وائٹلز چیک کرنے کی روزانہ یاد دہانی'
                    : isRoman
                    ? 'Waqt Par Vitals Check Karne Ki Daily Reminder'
                    : 'Daily Scheduled Vitals Nudges & Push Alerts'}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    permission === 'granted'
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : permission === 'denied'
                      ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {permission === 'granted'
                    ? isUrdu
                      ? 'براؤزر نوٹیفیکیشن: آن ہے'
                      : isRoman
                      ? 'Browser Alert: Active'
                      : 'Browser Push: Enabled'
                    : permission === 'denied'
                    ? isUrdu
                      ? 'براؤزر نوٹیفیکیشن: بلاک ہے'
                      : 'Browser Push: Blocked'
                    : isUrdu
                    ? 'براؤزر نوٹیفیکیشن: اجازت درکار ہے'
                    : 'Browser Push: Permission Needed'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {isUrdu
                  ? 'شوگر (نہار منہ یا کھانے کے بعد) اور بلڈ پریشر کو مقررہ اوقات پر ناپنے سے ڈاکٹر کو درست رپورٹ ملتی ہے۔ ایپ کھلا رہنے پر ان-ایپ نَج اور موبائل پر پش الرٹ موصول کریں۔'
                  : isRoman
                  ? 'Sugar (nihari ya khane ke baad) aur Blood Pressure waqt par check karne se accurate health record banta hai. Scheduled times par in-app aur browser notification payein.'
                  : 'Get gentle daily nudges at your preferred measurement times. Consistent timing provides your physician with accurate clinical data.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-center">
            {permission !== 'granted' && permission !== 'unsupported' && (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span>
                  {isUrdu
                    ? 'نوٹیفیکیشن فعال کریں'
                    : isRoman
                    ? 'Allow Notifications'
                    : 'Enable Push Notifications'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const first = reminders[0] || {
                  id: 'test',
                  patientProfileId: activeProfile?.id || 'prof-self',
                  metric: 'sugar',
                  title: 'Morning Fasting Sugar',
                  titleUrdu: 'صبح نہار منہ شوگر',
                  titleRoman: 'Subah Nihari Sugar',
                  time: '08:00',
                  days: ['everyday'],
                  enabled: true,
                  sugarTiming: 'fasting',
                  soundEnabled: true,
                };
                handleSimulateTest(first);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Test how reminders look, sound and nudge"
            >
              <Play className="w-3.5 h-3.5 text-amber-500" />
              <span>{isUrdu ? 'ٹیسٹ الرٹ چلا کر دیکھیں' : isRoman ? 'Test Nudge Now' : 'Test Reminder Now'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Reminders List & Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {isUrdu
                  ? 'مقررہ یاد دہانیاں (Scheduled Reminders)'
                  : isRoman
                  ? 'Schedule Ki Gayi Reminders'
                  : 'Configured Daily Reminder Schedule'}
              </h4>
              <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold font-mono">
                {activeCount} {isUrdu ? 'آن' : 'Active'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isUrdu
                ? `مریض: ${activeProfile?.name || 'مریض'} کے لیے مقررہ اوقات`
                : `Patient: ${activeProfile?.name || 'Patient'} schedule`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isUrdu ? 'نئی یاد دہانی جوڑیں' : isRoman ? 'Naya Time Add Karein' : 'Add Custom Reminder'}</span>
          </button>
        </div>

        {/* Custom Add Form Drawer */}
        {showAddForm && (
          <form
            onSubmit={handleCreateCustomReminder}
            className="bg-slate-50 dark:bg-slate-800/60 border border-amber-500/30 rounded-2xl p-4 sm:p-5 mb-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                {isUrdu ? 'نئے وقت کی تشکیل' : 'Create Custom Schedule'}
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                {isUrdu ? 'منسوخ' : 'Cancel'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Metric Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isUrdu ? 'کس چیز کی یاد دہانی؟' : 'Vital Sign Metric'}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setNewMetric('sugar')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border cursor-pointer ${
                      newMetric === 'sugar'
                        ? 'bg-teal-600 text-white border-teal-500'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'شوگر' : 'Sugar'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMetric('bp')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border cursor-pointer ${
                      newMetric === 'bp'
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'بلڈ پریشر' : 'BP'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMetric('heart')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border cursor-pointer ${
                      newMetric === 'heart'
                        ? 'bg-red-600 text-white border-red-500'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'نبض' : 'Pulse'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMetric('all')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border cursor-pointer ${
                      newMetric === 'all'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'تمام وائٹلز' : 'All Vitals'}</span>
                  </button>
                </div>
              </div>

              {/* Time Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isUrdu ? 'روزانہ کا وقت (24 گھنٹے)' : 'Daily Time (24h)'}
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                {newMetric === 'sugar' && (
                  <div className="mt-2">
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      {isUrdu ? 'ٹیسٹ کی قسم:' : 'Timing Context:'}
                    </label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setNewSugarTiming('fasting')}
                        className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold border ${
                          newSugarTiming === 'fasting'
                            ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500'
                            : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isUrdu ? 'نہار منہ' : 'Fasting'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewSugarTiming('post_meal')}
                        className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold border ${
                          newSugarTiming === 'post_meal'
                            ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500'
                            : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isUrdu ? 'کھانے کے بعد' : 'Post-Meal'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Title & Submit */}
              <div className="flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isUrdu ? 'نام یا لیبل (اختیاری)' : 'Reminder Label (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      isUrdu
                        ? 'مثلاً ناشتے سے پہلے، رات کا بی پی'
                        : 'e.g. Before breakfast, Evening BP'
                    }
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSoundEnabled}
                      onChange={(e) => setNewSoundEnabled(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-400"
                    />
                    <span>{isUrdu ? 'آواز کے ساتھ الرٹ' : 'Play Chime'}</span>
                  </label>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'محفوظ کریں' : 'Save Reminder'}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Reminders Grid */}
        {reminders.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p>{isUrdu ? 'ابھی کوئی یاد دہانی مقرر نہیں ہے۔' : 'No reminders scheduled yet.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {reminders.map((rem) => {
              const metricColor =
                rem.metric === 'sugar'
                  ? 'text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/30'
                  : rem.metric === 'bp'
                  ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30'
                  : rem.metric === 'heart'
                  ? 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30'
                  : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

              const MetricIcon =
                rem.metric === 'sugar'
                  ? Flame
                  : rem.metric === 'bp'
                  ? Activity
                  : rem.metric === 'heart'
                  ? Heart
                  : Calendar;

              const displayTitle = isUrdu
                ? rem.titleUrdu || rem.title
                : isRoman
                ? rem.titleRoman || rem.title
                : rem.title;

              return (
                <div
                  key={rem.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    rem.enabled
                      ? 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 shadow-sm'
                      : 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${metricColor}`}
                    >
                      <MetricIcon className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-mono font-extrabold text-slate-900 dark:text-white">
                          {rem.time}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            rem.metric === 'sugar'
                              ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300'
                              : rem.metric === 'bp'
                              ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                              : rem.metric === 'heart'
                              ? 'bg-red-500/20 text-red-700 dark:text-red-300'
                              : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {rem.metric === 'sugar'
                            ? rem.sugarTiming === 'fasting'
                              ? isUrdu
                                ? 'شوگر نہار منہ'
                                : 'Sugar (Fasting)'
                              : isUrdu
                              ? 'شوگر بعد از غذا'
                              : 'Sugar (Post-Meal)'
                            : rem.metric === 'bp'
                            ? isUrdu
                              ? 'بلڈ پریشر'
                              : 'BP'
                            : rem.metric === 'heart'
                            ? isUrdu
                              ? 'نبض'
                              : 'Pulse'
                            : isUrdu
                            ? 'تمام وائٹلز'
                            : 'All Vitals'}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {displayTitle}
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{isUrdu ? 'روزانہ' : 'Every day'}</span>
                        {rem.soundEnabled && (
                          <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                            <Volume2 className="w-3 h-3" />
                            <span>{isUrdu ? 'آواز' : 'Chime'}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Test button */}
                    <button
                      type="button"
                      onClick={() => handleSimulateTest(rem)}
                      className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700/60 hover:bg-amber-500/20 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-all cursor-pointer"
                      title={isUrdu ? 'ٹیسٹ الرٹ سنیں اور دیکھیں' : 'Test this reminder'}
                    >
                      <Play className="w-4 h-4" />
                    </button>

                    {/* Sound toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleSound(rem.id)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        rem.soundEnabled
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                      }`}
                      title={rem.soundEnabled ? 'Chime Enabled' : 'Muted'}
                    >
                      {rem.soundEnabled ? (
                        <Volume2 className="w-4 h-4" />
                      ) : (
                        <VolumeX className="w-4 h-4" />
                      )}
                    </button>

                    {/* Active Switch Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleReminder(rem.id)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                        rem.enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      aria-label="Toggle reminder"
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                          rem.enabled ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteReminder(rem.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                      title={isUrdu ? 'ڈیلیٹ کریں' : 'Delete reminder'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Clinically Suggested Fast Presets */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {isUrdu
                ? 'ڈاکٹروں کے تجویز کردہ معیاری اوقات (Quick Clinical Presets)'
                : isRoman
                ? 'Doctor Ke Tajweez Karda Standard Times'
                : 'Recommended Standard Measurement Presets'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {DEFAULT_PRESET_REMINDERS.map((preset, idx) => {
              const isAlreadyAdded = reminders.some(
                (r) => r.time === preset.time && r.metric === preset.metric
              );

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddPreset(preset)}
                  disabled={isAlreadyAdded}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                    isAlreadyAdded
                      ? 'bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-60 cursor-default'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-900">
                      {preset.time}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {isUrdu ? preset.titleUrdu : isRoman ? preset.titleRoman : preset.title}
                      </div>
                      <div className="text-[10px] text-slate-400 capitalize">
                        {preset.metric === 'sugar'
                          ? `Blood Sugar (${preset.sugarTiming})`
                          : preset.metric === 'bp'
                          ? 'Blood Pressure'
                          : 'Pulse Rate'}
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {isAlreadyAdded ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>{isUrdu ? 'موجود ہے' : 'Active'}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'جوڑیں' : 'Add'}</span>
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Clinical Guidance Box */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold mb-2">
          <Info className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>
            {isUrdu
              ? 'صحیح وقت پر ٹیسٹ کرنے کے طبی اصول (AHA & ADA Guidelines)'
              : 'Best Clinical Practices for Timing Your Vitals'}
          </span>
        </div>
        <ul className="space-y-1.5 list-disc list-inside">
          <li>
            <strong className="text-slate-700 dark:text-slate-300">
              {isUrdu ? 'نہار منہ شوگر (Fasting Sugar):' : 'Fasting Blood Sugar:'}
            </strong>{' '}
            {isUrdu
              ? 'صبح بیدار ہونے کے بعد، کچھ کھائے پئے بغیر (8 سے 10 گھنٹے بعد) چیک کریں۔'
              : 'Measure first thing in the morning before breakfast, following 8 to 10 hours of overnight fasting.'}
          </li>
          <li>
            <strong className="text-slate-700 dark:text-slate-300">
              {isUrdu ? 'کھانے کے بعد کی شوگر (Post-Meal Sugar):' : 'Post-Prandial Glucose:'}
            </strong>{' '}
            {isUrdu
              ? 'کھانے کے پہلے نوالے کے ٹھیک 2 گھنٹے بعد چیک کریں۔'
              : 'Measure precisely 2 hours after your first bite of meal to measure pancreatic insulin response.'}
          </li>
          <li>
            <strong className="text-slate-700 dark:text-slate-300">
              {isUrdu ? 'بلڈ پریشر (Blood Pressure):' : 'Blood Pressure Timing:'}
            </strong>{' '}
            {isUrdu
              ? 'چائے یا سگریٹ سے پرہیز کریں، پیشاب کر کے 5 منٹ خاموشی سے بیٹھنے کے بعد چیک کریں۔'
              : 'Avoid caffeine/smoking 30 min prior; sit quietly for 5 minutes with uncrossed feet before taking cuff readings.'}
          </li>
        </ul>
      </div>
    </div>
  );
};
