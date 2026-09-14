import React, { useState, useEffect } from 'react';
import { Activity, Loader2, ShieldCheck, Sparkles, ArrowRight, Heart, CheckCircle2 } from 'lucide-react';
import { SupportedLanguage } from '../types';
import trustedDoctorsImg from '../assets/images/trusted_doctors_1789283228204.jpg';

interface SplashScreenProps {
  currentLanguage: SupportedLanguage;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  currentLanguage,
  onFinish,
}) => {
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);

  const stages = [
    {
      en: 'Initializing Medical Core & Diagnostics...',
      ur: 'طبی نظام اور تشخیص کا آغاز ہو رہا ہے...',
      roman: 'Medical Engine tayar ho raha hai...',
    },
    {
      en: 'Loading PMDC Certified Clinical Guidelines...',
      ur: 'پی ایم ڈی سی تصدیق شدہ طبی رہنما اصول لوڈ ہو رہے ہیں...',
      roman: 'PMDC guidelines aur dawaon ka data load ho raha hai...',
    },
    {
      en: 'Synchronizing 24/7 Verified Doctor Network...',
      ur: 'ڈاکٹرز نیٹ ورک اور 1122 ایمرجنسی سروس منسلک ہو رہی ہے...',
      roman: 'Doctor network aur 1122 emergency link ho rahi hai...',
    },
    {
      en: 'Ready. Welcoming you to SehatSaathi Pro...',
      ur: 'صحت ساتھی تیار ہے...',
      roman: 'SehatSaathi tayar hai...',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 300);
          return 100;
        }
        const next = prev + 3.5;
        if (next < 30) setStageIndex(0);
        else if (next < 65) setStageIndex(1);
        else if (next < 90) setStageIndex(2);
        else setStageIndex(3);
        return next;
      });
    }, 90);

    return () => clearInterval(interval);
  }, [onFinish]);

  const currentStage = stages[stageIndex] || stages[0];

  return (
    <div
      id="app-splash-screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-6 bg-[#0c2f28] text-white select-none transition-opacity duration-300 overflow-hidden"
    >
      {/* Ambient background lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between z-20 pt-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-950/80 border border-teal-500/30 text-xs font-semibold text-teal-300 tracking-wide shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>
            {currentLanguage === 'ur'
              ? 'پی ایم ڈی سی تصدیق شدہ طبی نظام'
              : currentLanguage === 'roman'
              ? 'PMDC TASDEEQ SHUDA MEDICAL SYSTEM'
              : 'PMDC VERIFIED MEDICAL SYSTEM'}
          </span>
        </div>

        <button
          type="button"
          onClick={onFinish}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-900/60 hover:bg-teal-800 border border-teal-600/40 text-xs font-medium text-teal-200 transition-colors cursor-pointer"
        >
          <span>
            {currentLanguage === 'ur'
              ? 'آگے بڑھیں'
              : currentLanguage === 'roman'
              ? 'Aage Barhein'
              : 'Skip Intro'}
          </span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Centerpiece: Clean video-identical branding */}
      <div className="flex-1 flex flex-col items-center justify-center text-center z-20 px-4">
        {/* Pulse Heartbeat Box with Red Heart Indicator */}
        <div className="relative mb-5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#07241e] border border-teal-500/40 flex items-center justify-center shadow-xl shadow-teal-950/80">
            <Activity className="w-10 h-10 sm:w-12 sm:h-12 text-teal-300 stroke-[2.2] animate-pulse" />
          </div>
          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-500 border-2 border-[#0c2f28] flex items-center justify-center shadow-md">
            <Heart className="w-3.5 h-3.5 text-white fill-white" />
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-1.5">
          SehatSaathi
        </h1>

        {/* Tagline */}
        <p className="text-sm sm:text-base text-teal-200 font-medium tracking-wide mb-3">
          Aapka Digital Health Companion
        </p>

        {/* Verification Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/90 border border-teal-500/40 text-[11px] font-semibold text-teal-300 tracking-wider uppercase mb-8 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>AI + DOCTOR VERIFIED • AVAILABLE 24/7</span>
        </div>

        {/* Preparing indicator matching video: "🔄 Preparing your health companion..." */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-teal-300/90 font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
          <span>
            {currentLanguage === 'ur'
              ? 'صحت ساتھی تیار ہو رہا ہے...'
              : currentLanguage === 'roman'
              ? 'Health companion tayar ho raha hai...'
              : 'Preparing your health companion...'}
          </span>
        </div>

        {/* Subtle progress bar */}
        <div className="w-64 max-w-xs mt-4 bg-teal-950/80 border border-teal-800/60 h-1.5 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-400 rounded-full transition-all duration-150 shadow-[0_0_8px_#2dd4bf]"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Footer text */}
      <div className="w-full text-center text-[11px] text-teal-400/60 pb-2 z-10">
        PMDC Verified Medical Standards • 24/7 Accessible Care
      </div>
    </div>
  );
};
