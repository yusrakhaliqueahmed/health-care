import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, HeartPulse, ChevronRight } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { LANGUAGES } from '../services/i18n';

interface SplashScreenProps {
  currentLanguage: SupportedLanguage;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  currentLanguage,
  onFinish,
}) => {
  const [progress, setProgress] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    'Initializing multilingual clinical AI engine...',
    'Connecting PMDC doctor validation network...',
    'Syncing 24/7 emergency hospitals & pharmacies...',
    'Optimizing audio & voice synthesis for Pakistan...',
    'Ready / تیار ہے',
  ];

  useEffect(() => {
    // Show skip button after 1 second
    const skipTimer = setTimeout(() => {
      setShowSkip(true);
    }, 1000);

    // Progress bar animation over ~2 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 300);
          return 100;
        }
        const next = prev + 5;
        if (next >= 75) setStepIndex(3);
        else if (next >= 50) setStepIndex(2);
        else if (next >= 25) setStepIndex(1);
        return next;
      });
    }, 90);

    return () => {
      clearTimeout(skipTimer);
      clearInterval(interval);
    };
  }, [onFinish]);

  const activeLangInfo = LANGUAGES[currentLanguage] || LANGUAGES.en;

  return (
    <div
      id="app-splash-screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-10 bg-gradient-to-br from-teal-950 via-slate-950 to-teal-900 text-white select-none transition-opacity duration-500 overflow-hidden"
    >
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top bar with language & skip */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs text-teal-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{activeLangInfo.nativeName} ({activeLangInfo.name})</span>
        </div>

        {showSkip && (
          <button
            id="splash-skip-button"
            type="button"
            onClick={onFinish}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-xs text-slate-200 font-medium transition-all"
          >
            <span>Skip Intro</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Center Content */}
      <div className="flex flex-col items-center text-center max-w-md my-auto z-10">
        {/* Animated glowing logo box */}
        <div className="relative mb-6">
          <div className="absolute -inset-2 bg-gradient-to-r from-teal-500 to-emerald-400 rounded-3xl blur-md opacity-60 animate-pulse" />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-teal-800 to-teal-600 border border-teal-300/40 shadow-2xl flex items-center justify-center p-4">
            <HeartPulse className="w-12 h-12 sm:w-14 sm:h-14 text-white drop-shadow-md animate-bounce" />
          </div>
          <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-emerald-500 text-white shadow-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
          SehatSaathi <span className="text-teal-400">Pro</span>
        </h1>

        <p className="text-sm sm:text-base text-teal-100 font-medium mb-1">
          Aapka Digital Health Companion
        </p>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-900/60 border border-teal-500/30 text-[11px] font-semibold uppercase tracking-wider text-teal-300 mb-8">
          <Activity className="w-3.5 h-3.5 text-teal-400" />
          <span>AI + PMDC DOCTOR VERIFIED • AVAILABLE 24/7</span>
        </div>

        {/* Loading Progress Bar */}
        <div className="w-64 sm:w-80 h-2 bg-white/10 rounded-full overflow-hidden p-0.5 mb-3">
          <div
            className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all duration-150 shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs text-teal-200/80 font-mono transition-opacity duration-300">
          {steps[stepIndex]}
        </p>
      </div>

      {/* Footer Credentials */}
      <div className="text-center text-xs text-teal-300/60 z-10 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <span>🇵🇰 Pakistan Health Network</span>
        <span className="hidden sm:inline">•</span>
        <span>Rescue 1122 Integrated</span>
        <span className="hidden sm:inline">•</span>
        <span>7 Regional Languages</span>
      </div>
    </div>
  );
};
