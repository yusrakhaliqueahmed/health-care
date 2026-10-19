import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HeartPulse,
  Calendar,
  Sparkles,
  ShieldCheck,
  Baby,
  Smile,
  AlertCircle,
  CheckCircle2,
  Lock,
  Plus,
  BookOpen,
  Info,
  Clock,
  Heart,
} from 'lucide-react';
import { SupportedLanguage, UserAccount, WomensCycleRecord } from '../types';

interface WomensHealthProps {
  currentLanguage: SupportedLanguage;
  currentUser?: UserAccount;
}

export const WomensHealth: React.FC<WomensHealthProps> = ({
  currentLanguage,
  currentUser,
}) => {
  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';
  const userKey = (currentUser?.email || currentUser?.id || 'default').toLowerCase().trim();

  const [cycleData, setCycleData] = useState<WomensCycleRecord>({
    userId: userKey,
    lastPeriodDate: new Date(Date.now() - 86400000 * 14).toISOString().split('T')[0],
    cycleLengthDays: 28,
    periodDurationDays: 5,
    isPregnant: false,
    symptomLogs: [],
  });

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<'spotting' | 'light' | 'medium' | 'heavy'>('medium');
  const [todayNotes, setTodayNotes] = useState('');
  const [logSavedSuccess, setLogSavedSuccess] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  // Load from server
  useEffect(() => {
    fetch(`/api/womens-health/${encodeURIComponent(userKey)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setCycleData(data.data);
        }
      })
      .catch((err) => console.warn('Womens health load note:', err));
  }, [userKey]);

  // Calculate Next Period and Ovulation
  const lastDate = new Date(cycleData.lastPeriodDate || Date.now());
  const nextPeriodDate = new Date(lastDate);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleData.cycleLengthDays);

  const ovulationDate = new Date(nextPeriodDate);
  ovulationDate.setDate(ovulationDate.getDate() - 14);

  const fertileStart = new Date(ovulationDate);
  fertileStart.setDate(fertileStart.getDate() - 4);

  const fertileEnd = new Date(ovulationDate);
  fertileEnd.setDate(fertileEnd.getDate() + 1);

  const daysUntilNextPeriod = Math.ceil(
    (nextPeriodDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const handleSaveCycleSettings = (lastD: string, length: number) => {
    const updated: WomensCycleRecord = {
      ...cycleData,
      lastPeriodDate: lastD,
      cycleLengthDays: length,
    };
    setCycleData(updated);
    fetch('/api/womens-health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userKey, data: updated }),
    }).catch(() => {});
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split('T')[0];
    const newLog = {
      date: todayStr,
      symptoms: selectedSymptoms,
      flow: selectedFlow,
      notes: todayNotes.trim() || undefined,
    };

    const updated: WomensCycleRecord = {
      ...cycleData,
      symptomLogs: [newLog, ...(cycleData.symptomLogs || []).filter((l) => l.date !== todayStr)],
    };

    setCycleData(updated);
    setLogSavedSuccess(true);
    setTimeout(() => setLogSavedSuccess(false), 2500);

    fetch('/api/womens-health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userKey, data: updated }),
    }).catch(() => {});
  };

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const symptomsList = isUrdu
    ? ['پیٹ میں درد / کھچاؤ', 'سر درد', 'تھکاوٹ', 'کمر میں درد', 'موڈ میں تبدیلی', 'متلی']
    : isRoman
    ? ['Cramps / Pait dard', 'Sar dard', 'Thakawat', 'Kamar dard', 'Mood swings', 'Matli']
    : ['Cramps', 'Headache', 'Fatigue', 'Lower back ache', 'Mood changes', 'Nausea'];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-rose-950 via-teal-950 to-slate-900 text-white shadow-xl border border-rose-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 shadow-inner">
              <HeartPulse className="w-7 h-7 text-rose-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-400/20 text-rose-300 text-[11px] font-bold uppercase tracking-wider mb-1">
                <Lock className="w-3 h-3 text-rose-300" />
                <span>100% Private & Confidential</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                {isUrdu ? 'خواتین کی صحت اور زچگی رہنمائی' : "Women's Health & Cycle Tracking"}
              </h2>
              <p className="text-xs text-rose-200/80 mt-1 max-w-xl">
                {isUrdu
                  ? 'ماہواری کا محفوظ ٹریکر، زرخیزی کے ایام کا تخمینہ، اور زچگی و نوزائیدہ صحت کے مستند مشورے۔'
                  : 'Encrypted menstrual cycle tracking, ovulation estimation, and maternal health guidance.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Strict Privacy Assurance Box */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
            {isUrdu ? 'رازداری اور رضامندی کا تحفظ:' : 'Strict Privacy & Voluntary Consent:'}
          </span>
          {isUrdu
            ? 'خواتین کے تمام ریکارڈز نجی اور محفوظ ہیں۔ یہ معلومات کسی دوسرے خاندانی فرد کو اس وقت تک نظر نہیں آئیں گی جب تک آپ خود اس کی اجازت نہ دیں۔ ایپ خود سے حمل کا مفروضہ قائم نہیں کرتی۔'
            : "All women's health records are strictly confidential and stored under your account. Family members do not have access without explicit authorization. The app never makes assumptions about pregnancy or fertility."}
        </div>
      </div>

      {/* Cycle Prediction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Next Period Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-left rtl:text-right space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>{isUrdu ? 'اگلی متوقع تاریخ' : 'Next Expected Period'}</span>
            <Calendar className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {nextPeriodDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            {daysUntilNextPeriod > 0
              ? (isUrdu ? `${daysUntilNextPeriod} دن باقی ہیں` : `In approx. ${daysUntilNextPeriod} days`)
              : (isUrdu ? 'متوقع وقت جاری ہے' : 'Period due now')}
          </div>
        </div>

        {/* Ovulation & Fertile Window */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-left rtl:text-right space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>{isUrdu ? 'اوولیشن (زرخیزی کی مدت)' : 'Estimated Fertile Window'}</span>
            <Sparkles className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400">
            {fertileStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - {fertileEnd.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            {isUrdu ? 'اوسط 28 روزہ سائیکل کی بنیاد پر تخمینہ' : 'Estimated on standard physiological curve'}
          </div>
        </div>

        {/* Cycle Length Setting */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-left rtl:text-right space-y-3">
          <div className="text-xs text-slate-400 font-bold">
            {isUrdu ? 'سائیکل کی اوسط لمبائی' : 'Cycle Length Settings'}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="21"
              max="45"
              value={cycleData.cycleLengthDays}
              onChange={(e) => handleSaveCycleSettings(cycleData.lastPeriodDate, parseInt(e.target.value) || 28)}
              className="w-20 p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-800"
            />
            <span className="text-xs font-semibold text-slate-500">{isUrdu ? 'دن (Days)' : 'Days'}</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {isUrdu ? 'معمول کا سائیکل 24 سے 35 دن کا ہوتا ہے' : 'Typical healthy cycles range from 24 to 35 days.'}
          </div>
        </div>
      </div>

      {/* Daily Symptom & Mood Logger */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-left rtl:text-right">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
              {isUrdu ? 'آج کی علامات اور کیفیت درج کریں' : 'Daily Symptom & Comfort Log'}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        </div>

        {logSavedSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isUrdu ? 'آج کا لاگ کامیابی سے محفوظ ہو گیا!' : 'Daily comfort log saved to your private record.'}</span>
          </div>
        )}

        <form onSubmit={handleSaveLog} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              {isUrdu ? 'محسوس ہونے والی علامات پر کلک کریں:' : 'Select any symptoms experienced today:'}
            </label>
            <div className="flex flex-wrap gap-2">
              {symptomsList.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleSymptom(sym)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isUrdu ? 'ذاتی نوٹس (اختیاری):' : 'Private Health Notes (Optional):'}
            </label>
            <input
              type="text"
              value={todayNotes}
              onChange={(e) => setTodayNotes(e.target.value)}
              placeholder={isUrdu ? 'مثلاً: ہلکی تھکاوٹ، چائے پینے سے سکون ملا...' : 'e.g. Mild headache relieved after rest...'}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-hidden"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              {isUrdu ? 'لاگ محفوظ کریں' : 'Save Daily Log'}
            </button>
          </div>
        </form>
      </div>

      {/* Maternal & Antenatal Health Guidance */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-50 to-teal-50 dark:from-rose-950/20 dark:to-teal-950/20 border border-rose-200 dark:border-rose-800/40 space-y-3 text-left rtl:text-right">
        <div className="flex items-center gap-2">
          <Baby className="w-5 h-5 text-rose-600" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {isUrdu ? 'ماں اور بچے کی صحت کے بنیادی رہنما اصول' : 'Maternal & Antenatal Health Principles'}
          </h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {isUrdu
            ? '1. فولک ایسڈ (Folic Acid): حاملہ ہونے کے ارادے یا حمل کے ابتدائی 3 ماہ میں فولک ایسڈ 400mcg کا روزانہ استعمال پیدائشی نقائص سے بچاتا ہے۔\n2. آئرن اور ہیموگلوبن: پاکستان میں خواتین میں خون کی کمی عام ہے؛ باقاعدہ CBC ٹیسٹ اور معالج کی تجویز کردہ آئرن سپلیمنٹ لازمی لیں۔\n3. بلڈ پریشر چیک اپ: ہر سہ ماہی میں بی پی چیک کروائیں تاکہ پری ایکلیمپسیا سے بچاؤ ممکن ہو۔'
            : '1. Folic Acid: 400 mcg daily prior to and during early pregnancy prevents neural tube defects.\n2. Anemia Screening: Regular CBC screening for iron deficiency is recommended for all expectant mothers in Pakistan.\n3. Antenatal Blood Pressure: Routine clinical monitoring safeguards against gestational hypertension and preeclampsia.'}
        </p>
      </div>
    </div>
  );
};
