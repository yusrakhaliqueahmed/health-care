import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Timer,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Download,
  Copy,
  Volume2,
  VolumeX,
  Pill,
  Clock,
  Sparkles,
  Share2,
  RefreshCw,
  Flame,
} from 'lucide-react';
import {
  MedicineAdherenceLog,
  MedicineReminder,
  SupportedLanguage,
  PatientProfile,
} from '../types';
import { voiceManager } from '../services/voice';
import {
  loadAdherenceLogs,
  loadMedicineReminders,
  calculateAdherenceStats,
} from '../services/medicineReminderService';

interface MedicineAdherenceSectionProps {
  currentLanguage: SupportedLanguage;
  selectedProfile: PatientProfile;
  onOpenReminderSchedule: () => void;
}

export const MedicineAdherenceSection: React.FC<MedicineAdherenceSectionProps> = ({
  currentLanguage,
  selectedProfile,
  onOpenReminderSchedule,
}) => {
  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';

  const [logs, setLogs] = useState<MedicineAdherenceLog[]>([]);
  const [reminders, setReminders] = useState<MedicineReminder[]>([]);
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [isPlayingSummary, setIsPlayingSummary] = useState(false);
  const [viewRange, setViewRange] = useState<'7days' | '30days'>('7days');

  useEffect(() => {
    const loadedLogs = loadAdherenceLogs(selectedProfile.id);
    const loadedRem = loadMedicineReminders(selectedProfile.id);
    setLogs(loadedLogs);
    setReminders(loadedRem);
  }, [selectedProfile.id]);

  const stats = calculateAdherenceStats(logs, viewRange === '7days' ? 7 : 30);

  // Read Aloud adherence summary
  const handleReadAloud = () => {
    if (isPlayingSummary) {
      voiceManager.stop();
      setIsPlayingSummary(false);
      return;
    }

    const text = isUrdu
      ? `${selectedProfile.name} کا پچھلے ${viewRange === '7days' ? 'سات دنوں' : 'تیس دنوں'} میں دوا لینے کا تناسب ${stats.adherencePercentage} فیصد رہا ہے۔ کل خوراکیں: ${stats.totalDoses}، بروقت لی گئیں: ${stats.takenCount}، اور چھوڑی گئیں: ${stats.skippedCount}۔`
      : isRoman
      ? `${selectedProfile.name} ka pichle dino mein dawai lene ka score ${stats.adherencePercentage}% hai. Total doses: ${stats.totalDoses}, Li gayi: ${stats.takenCount}, Chhodi gayi: ${stats.skippedCount}.`
      : `${selectedProfile.name}'s medicine adherence rate over the past ${viewRange === '7days' ? '7 days' : '30 days'} is ${stats.adherencePercentage} percent. Total doses: ${stats.totalDoses}, taken: ${stats.takenCount}, skipped: ${stats.skippedCount}.`;

    setIsPlayingSummary(true);
    voiceManager.speak(text, currentLanguage);
    setTimeout(() => setIsPlayingSummary(false), 7000);
  };

  // Copy Summary text
  const handleCopySummary = () => {
    const summary = `📊 SehatSaathi Medicine Adherence Report
Patient: ${selectedProfile.name} (${selectedProfile.relation || 'Self'})
Period: Past ${viewRange === '7days' ? '7 Days' : '30 Days'}
Adherence Score: ${stats.adherencePercentage}%
Consecutive Streak: ${stats.consecutiveStreakDays} Days
Total Scheduled Doses: ${stats.totalDoses}
Taken: ${stats.takenCount} | Snoozed: ${stats.snoozedCount} | Skipped: ${stats.skippedCount}
Generated via SehatSaathi Clinical Portal.`;

    navigator.clipboard?.writeText(summary);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 3000);
  };

  // Generate recent 7 days checklist
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Controls & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-gradient-to-br from-teal-900 via-slate-900 to-teal-950 text-white shadow-md border border-teal-800/50">
        <div>
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base sm:text-lg font-black">
              {isUrdu ? 'دوائیوں کی پابندی و ریکارڈ (Medicine Adherence)' : 'Medicine Adherence & Compliance'}
            </h3>
          </div>
          <p className="text-xs text-teal-200/80 mt-0.5">
            {isUrdu
              ? `${selectedProfile.name} کی روزانہ دواؤں کے ریکارڈ اور چھوڑے گئے اوقات کا جائزہ`
              : `Tracking consistency, streaks, and missed dose alerts for ${selectedProfile.name}`}
          </p>
        </div>

        {/* Action Buttons: Read Aloud, Copy, Schedule */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleReadAloud}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              isPlayingSummary
                ? 'bg-emerald-600 text-white border-emerald-500 animate-pulse'
                : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
            }`}
          >
            {isPlayingSummary ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isUrdu ? 'آواز میں سنیں' : 'Read Aloud'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            <span>{copiedNotice ? (isUrdu ? 'کاپی ہو گیا!' : 'Copied!') : (isUrdu ? 'کاپی' : 'Copy')}</span>
          </button>

          <button
            type="button"
            onClick={onOpenReminderSchedule}
            className="px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>{isUrdu ? 'ریمائنڈر تبدیل کریں' : 'Manage Reminders'}</span>
          </button>
        </div>
      </div>

      {/* Gentle Repeated Missed Doses Alert (3+ Skips in a week) */}
      {stats.repeatedSkips.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-400 dark:border-amber-700 text-amber-900 dark:text-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200 dark:bg-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-900 dark:text-amber-200" />
            </div>
            <div>
              <h4 className="font-black text-sm">
                {isUrdu
                  ? 'لگتا ہے آپ اپنی دوائی بھول رہے ہیں (Repeated Missed Doses)'
                  : isRoman
                  ? 'Lagta hai aap apni dawai bhool rahe hain'
                  : 'Pattern of Missed Doses Detected'}
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-200 mt-0.5">
                {isUrdu
                  ? `${stats.repeatedSkips.map((s) => s.medicineName).join(', ')} پچھلے 7 دنوں میں ${stats.repeatedSkips[0].skipCount} بار چھوٹ گئی ہے۔ کیا ہم یاد دہانی کا وقت تبدیل کر دیں؟`
                  : `You missed ${stats.repeatedSkips.map((s) => s.medicineName).join(', ')} ${stats.repeatedSkips[0].skipCount} times this week. Would you like to adjust the reminder time to a better hour?`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenReminderSchedule}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
          >
            {isUrdu ? 'وقت تبدیل کریں (Change Time)' : 'Adjust Schedule'}
          </button>
        </div>
      )}

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Adherence Score */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold">{isUrdu ? 'پابندی کی شرح' : 'Adherence Rate'}</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400">
              {stats.adherencePercentage}%
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-bold">
              {stats.adherencePercentage >= 80 ? 'Excellent' : 'Needs Care'}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                stats.adherencePercentage >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${stats.adherencePercentage}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Streak Days */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold">{isUrdu ? 'مسلسل پابندی (اسٹریک)' : 'Current Streak'}</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {stats.consecutiveStreakDays}
            </span>
            <span className="text-xs text-slate-500 font-bold">{isUrdu ? 'دن' : 'Days'}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            {isUrdu ? 'مسلسل بروقت دوائی کا ریکارڈ' : 'Consecutive days without missing'}
          </p>
        </div>

        {/* Metric 3: Taken Doses */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold">{isUrdu ? 'لی گئی خوراکیں' : 'Doses Taken'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {stats.takenCount}
            </span>
            <span className="text-xs text-slate-400">/ {stats.totalDoses || '0'} total</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            {isUrdu ? 'کامیابی سے درج شدہ خوراکیں' : 'Logged as Taken'}
          </p>
        </div>

        {/* Metric 4: Missed Doses */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold">{isUrdu ? 'چھوڑی گئی خوراکیں' : 'Missed Doses'}</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-600">
              {stats.skippedCount}
            </span>
            <span className="text-xs text-slate-400">
              {stats.snoozedCount > 0 ? `(${stats.snoozedCount} snoozed)` : ''}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            {isUrdu ? 'چھوڑی گئی یا فراموش شدہ خوراکیں' : 'Skipped doses requiring attention'}
          </p>
        </div>
      </div>

      {/* 7-Day Visual Consistency Checklist Grid */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              {isUrdu ? 'پچھلے 7 دنوں کا روزانہ جائزہ (Daily Checklist)' : 'Past 7 Days Consistency Checklist'}
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {last7Days[0]} — {last7Days[6]}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-2 text-center">
          {last7Days.map((dStr) => {
            const dayLogs = logs.filter((l) => l.scheduledDate === dStr);
            const dateObj = new Date(dStr);
            const dayName = dateObj.toLocaleDateString('en-GB', { weekday: 'short' });
            const dayNum = dateObj.getDate();

            const hasTaken = dayLogs.some((l) => l.status === 'taken');
            const hasSkipped = dayLogs.some((l) => l.status === 'skipped');

            let badgeBg = 'bg-slate-100 dark:bg-slate-700 text-slate-400';
            let icon = '—';
            if (hasTaken && !hasSkipped) {
              badgeBg = 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-400 text-emerald-800 dark:text-emerald-300';
              icon = '✓';
            } else if (hasSkipped) {
              badgeBg = 'bg-rose-100 dark:bg-rose-950/80 border-rose-400 text-rose-800 dark:text-rose-300';
              icon = '✕';
            }

            return (
              <div key={dStr} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">{dayName}</span>
                <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">{dayNum}</span>
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center font-black text-sm transition-all shadow-xs ${badgeBg}`}
                >
                  {icon}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Detailed Adherence Activity Feed */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3">
        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
          {isUrdu ? 'حالیہ لاگ ہسٹری (Recent Dose Logs)' : 'Recent Dose Response Logs'}
        </h4>

        {logs.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            {isUrdu
              ? 'ابھی تک کوئی لاگ درج نہیں ہوا۔ جب ریمائنڈر بجے گا اور آپ "Taken" یا "Skip" دبائیں گے تو یہاں ظاہر ہوگا۔'
              : 'No dose responses logged yet. Responses will appear here when reminders trigger.'}
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60 max-h-60 overflow-y-auto">
            {logs.slice(0, 10).map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      log.status === 'taken'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : log.status === 'snoozed'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {log.status === 'taken' ? '✓' : log.status === 'snoozed' ? '⏰' : '✕'}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {log.medicineName} ({log.dosage})
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {log.scheduledDate} • {log.scheduledTime}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    log.status === 'taken'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                      : log.status === 'snoozed'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                  }`}
                >
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
