import React, { useState, useEffect } from 'react';
import {
  Pill,
  Clock,
  CheckCircle2,
  XCircle,
  Timer,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  AlertCircle,
  ShieldCheck,
  User,
} from 'lucide-react';
import { MedicineReminder, SupportedLanguage, AdherenceStatus } from '../types';
import { voiceManager, createSpeechRecognizer } from '../services/voice';
import { recordAdherence } from '../services/medicineReminderService';

interface ActiveMedicineAlertModalProps {
  reminder: MedicineReminder;
  scheduledTime: string;
  currentLanguage: SupportedLanguage;
  onDismiss: () => void;
  onActionComplete: (status: AdherenceStatus) => void;
}

export const ActiveMedicineAlertModal: React.FC<ActiveMedicineAlertModalProps> = ({
  reminder,
  scheduledTime,
  currentLanguage,
  onDismiss,
  onActionComplete,
}) => {
  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';

  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [isPlayingSpoken, setIsPlayingSpoken] = useState(false);

  // Spoken reminder text
  const spokenText = isUrdu
    ? `آپ کی ${reminder.medicineName} کی دوائی کا وقت ہو گیا ہے۔ خوراک: ${reminder.dosage}۔ برائے مہربانی دوائی لیں۔`
    : isRoman
    ? `Aapki ${reminder.medicineName} ki dawai ka waqt ho gaya hai. Dosage: ${reminder.dosage}.`
    : `It is time for your scheduled medicine: ${reminder.medicineName}. Dosage: ${reminder.dosage}.`;

  // Auto-play voice alert on mount
  useEffect(() => {
    setIsPlayingSpoken(true);
    voiceManager.speak(spokenText, currentLanguage);

    const timer = setTimeout(() => {
      setIsPlayingSpoken(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [reminder, currentLanguage]);

  // Voice listener for elderly / hands-free patients ("Taken", "Snooze", "Skip")
  useEffect(() => {
    let recognizer: any = null;
    try {
      recognizer = createSpeechRecognizer();
      setIsVoiceActive(true);
      recognizer.start(
        currentLanguage,
        (transcript: string) => {
          const lower = transcript.toLowerCase();
          if (lower.includes('taken') || lower.includes('le li') || lower.includes('لی') || lower.includes('yes') || lower.includes('done')) {
            handleAction('taken');
          } else if (lower.includes('snooze') || lower.includes('baad') || lower.includes('بعد') || lower.includes('later')) {
            handleAction('snooze');
          } else if (lower.includes('skip') || lower.includes('chhod') || lower.includes('چھوڑ') || lower.includes('no')) {
            handleAction('skip');
          }
        },
        () => setIsVoiceActive(false),
        () => setIsVoiceActive(false)
      );
    } catch {
      // Voice recognition not available
    }

    return () => {
      if (recognizer) {
        recognizer.stop();
      }
    };
  }, [currentLanguage]);

  const handleAction = (status: 'taken' | 'snooze' | 'skip') => {
    voiceManager.stop();

    if (status === 'taken') {
      recordAdherence(reminder, 'taken', scheduledTime);
      const ack = isUrdu
        ? 'ماشاءاللہ! دوائی لے لی گئی ہے۔ ریکارڈ محفوظ کر لیا گیا۔'
        : isRoman
        ? 'Shukriya! Dawai taken record ho gayi hai.'
        : 'Medicine logged as Taken. Good job!';
      voiceManager.speak(ack, currentLanguage);
      onActionComplete('taken');
    } else if (status === 'snooze') {
      recordAdherence(reminder, 'snoozed', scheduledTime, 'Snoozed 15 mins');
      const ack = isUrdu
        ? 'ریمائنڈر پندرہ منٹ بعد دوبارہ دیا جائے گا۔'
        : isRoman
        ? 'Reminder 15 minute baad dobara aayega.'
        : 'Reminder snoozed for 15 minutes.';
      voiceManager.speak(ack, currentLanguage);
      onActionComplete('snoozed');
    } else {
      recordAdherence(reminder, 'skipped', scheduledTime, 'Marked Skipped');
      const ack = isUrdu
        ? 'دوائی اس وقت چھوڑ دی گئی ہے۔ ریکارڈ میں درج ہو گیا۔'
        : isRoman
        ? 'Dawai skip record ho gayi hai.'
        : 'Dose marked as Skipped.';
      voiceManager.speak(ack, currentLanguage);
      onActionComplete('skipped');
    }
  };

  const handleRepeatVoice = () => {
    setIsPlayingSpoken(true);
    voiceManager.speak(spokenText, currentLanguage);
    setTimeout(() => setIsPlayingSpoken(false), 5000);
  };

  return (
    <div
      id="active-medicine-alert-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div
        id="active-medicine-alert-card"
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-teal-500 p-5 sm:p-7 text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-200 overflow-hidden"
      >
        {/* Glow Header Accent */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600 animate-pulse" />

        {/* Top Tag & Audio Button */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-400">
              {isUrdu ? 'روزانہ دوا کی یاد دہانی' : isRoman ? 'Daily Dawai Reminder' : 'Daily Medicine Reminder'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleRepeatVoice}
              title="Repeat Spoken Reminder"
              className={`p-2 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                isPlayingSpoken
                  ? 'bg-teal-600 text-white border-teal-500 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              {isPlayingSpoken ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Main Alert Body */}
        <div className="text-center py-4 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center mx-auto shadow-lg shadow-teal-600/30">
            <Pill className="w-8 h-8 animate-bounce" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-[11px] font-bold text-teal-800 dark:text-teal-300 mb-1">
              <User className="w-3 h-3" />
              <span>{reminder.patientName || 'Patient'}</span>
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {reminder.medicineName}
            </h2>
            <p className="text-base font-extrabold text-teal-700 dark:text-teal-400 mt-0.5 font-mono">
              {reminder.dosage}
            </p>
          </div>

          {/* Time & Meal instruction badge */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-semibold">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-600" />
              <span className="font-mono font-bold">{scheduledTime}</span>
            </div>
            {reminder.mealTiming && (
              <span className="border-l border-slate-300 dark:border-slate-600 pl-3">
                {reminder.mealTiming === 'before_meal'
                  ? (isUrdu ? 'کھانے سے پہلے' : 'Before Meal')
                  : reminder.mealTiming === 'after_meal'
                  ? (isUrdu ? 'کھانے کے بعد' : 'After Meal')
                  : (isUrdu ? 'کھانے کے ساتھ' : 'With Meal')}
              </span>
            )}
          </div>
        </div>

        {/* Voice Command Hint */}
        <div className="p-2.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-center text-xs text-teal-900 dark:text-teal-200 flex items-center justify-center gap-2 mb-4">
          <Mic className={`w-3.5 h-3.5 ${isVoiceActive ? 'text-red-500 animate-pulse' : 'text-teal-600'}`} />
          <span>
            {isUrdu
              ? 'آواز سے بولیں: "لے لی" یا "بعد میں" یا نیچے بٹن دبائیں'
              : isRoman
              ? 'Aawaz se kahein: "Le li" ya "Snooze" ya button dabayein'
              : 'Say "Taken" or "Snooze" aloud, or tap below'}
          </span>
        </div>

        {/* 3 Large Accessible Buttons (minimum 44x44px for elderly users) */}
        <div className="space-y-2.5">
          {/* 1. TAKEN BUTTON */}
          <button
            type="button"
            id="reminder-btn-taken"
            onClick={() => handleAction('taken')}
            className="w-full min-h-[50px] py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-base shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 cursor-pointer transition-transform"
          >
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <span>{isUrdu ? 'لے لی (Taken)' : isRoman ? 'Le Li (Taken)' : 'Taken ✅'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            {/* 2. SNOOZE 15 MIN */}
            <button
              type="button"
              id="reminder-btn-snooze"
              onClick={() => handleAction('snooze')}
              className="min-h-[46px] py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-transform"
            >
              <Timer className="w-4 h-4 shrink-0" />
              <span>{isUrdu ? '15 منٹ بعد' : isRoman ? '15 Min Baad' : 'Snooze 15m ⏰'}</span>
            </button>

            {/* 3. SKIPPED BUTTON */}
            <button
              type="button"
              id="reminder-btn-skip"
              onClick={() => handleAction('skip')}
              className="min-h-[46px] py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/60 text-slate-700 hover:text-rose-600 dark:text-slate-300 font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{isUrdu ? 'چھوڑ دی' : isRoman ? 'Chhod Di' : 'Skipped ❌'}</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            type="button"
            onClick={onDismiss}
            className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            {isUrdu ? 'بند کریں' : 'Dismiss'}
          </button>
        </div>
      </div>
    </div>
  );
};
