import React, { useState, useEffect } from 'react';
import { Activity, Loader2, ShieldCheck, Sparkles, ArrowRight, Heart } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { Medical3DCanvas } from './Medical3DCanvas';

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
      en: 'Initializing 3D Medical Core & Diagnostics...',
      ur: 'طبی ماڈل اور تشخیص کا آغاز ہو رہا ہے...',
      roman: '3D Medical Engine tayar ho raha hai...',
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
    // 3.2s total smooth duration for rich 3D visualization
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
          <span>PMDC VERIFIED MEDICAL SYSTEM</span>
        </div>

        <button
          type="button"
          onClick={onFinish}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-900/60 hover:bg-teal-800 border border-teal-600/40 text-xs font-medium text-teal-200 transition-colors cursor-pointer"
        >
          <span>{currentLanguage === 'ur' ? 'جاری رکھیں' : 'Skip Intro'}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Centerpiece: Advanced 3D Healthcare & Doctor Model */}
      <div className="relative w-full max-w-md h-[340px] sm:h-[380px] z-10 flex flex-col items-center justify-center my-auto">
        {/* Holographic Diagnostic HUD Frame */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[280px] sm:w-[320px] h-[280px] sm:h-[320px] rounded-full border border-teal-500/20 border-dashed animate-[spin_40s_linear_infinite]" />
          <div className="w-[340px] sm:w-[380px] h-[340px] sm:h-[380px] rounded-full border border-teal-400/15 animate-[spin_60s_linear_infinite_reverse]" />
        </div>

        {/* 3D WebGL Canvas */}
        <Medical3DCanvas interactive={true} />

        {/* Interactive Pointer Hint */}
        <div className="absolute bottom-1 px-3 py-1 rounded-full bg-teal-950/70 border border-teal-700/40 text-[10px] text-teal-300/80 tracking-wider flex items-center gap-1.5 backdrop-blur-xs pointer-events-none">
          <Sparkles className="w-3 h-3 text-teal-400 animate-pulse" />
          <span>Move cursor or touch to explore 3D stethoscope & cardiac anatomy</span>
        </div>
      </div>

      {/* Bottom Branding & Loading Status */}
      <div className="w-full max-w-sm flex flex-col items-center text-center z-20 space-y-3 pb-4">
        {/* Pulse Heartbeat Badge with Red Dot (Video signature) */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-lg bg-[#07221d] border border-teal-500/40 flex items-center justify-center shadow-md">
            <Heart className="w-4 h-4 text-teal-300 fill-teal-300/30" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse" />
          </div>
          <div className="text-left">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-none">
              SehatSaathi
            </h1>
            <p className="text-[11px] text-teal-300/90 font-medium tracking-wide">
              Aapka Digital Health Companion
            </p>
          </div>
        </div>

        {/* Dynamic Progress Bar with Medical Glow */}
        <div className="w-full space-y-1.5 pt-1">
          <div className="w-full bg-teal-950/90 border border-teal-800/60 h-2 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-400 rounded-full transition-all duration-200 shadow-[0_0_10px_#2dd4bf]"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-teal-200/80">
            <span className="flex items-center gap-1.5 truncate">
              <Loader2 className="w-3 h-3 animate-spin text-teal-400 shrink-0" />
              <span className="truncate">
                {currentLanguage === 'ur'
                  ? currentStage.ur
                  : currentLanguage === 'roman'
                  ? currentStage.roman
                  : currentStage.en}
              </span>
            </span>
            <span className="font-mono font-bold text-teal-300 shrink-0 ml-2">
              {Math.min(Math.round(progress), 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
