import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { LanguageSelector } from './LanguageSelector';
import { voiceManager } from '../services/voice';
import { Realistic3DHeart } from './Realistic3DHeart';

interface InitialDisclaimerScreenProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onAcknowledge: () => void;
}

export const InitialDisclaimerScreen: React.FC<InitialDisclaimerScreenProps> = ({
  currentLanguage,
  onLanguageChange,
  onAcknowledge,
}) => {
  const headline =
    currentLanguage === 'ur'
      ? 'اہم پیغام'
      : currentLanguage === 'roman'
      ? 'Ahem Paigham'
      : 'Important Message';

  const badgeText =
    currentLanguage === 'ur'
      ? 'ڈاکٹر کی تصدیق لازمی ہے'
      : currentLanguage === 'roman'
      ? 'DOCTOR VERIFICATION REQUIRED'
      : 'DOCTOR VERIFICATION REQUIRED';

  const message =
    currentLanguage === 'ur'
      ? 'یہ ایپ آپ کی رہنمائی کے لیے ہے، لیکن یہ کسی اصل ڈاکٹر کا متبادل نہیں ہے۔ کوئی بھی دوا لینے یا علاج شروع کرنے سے پہلے ہمیشہ مستند ڈاکٹر سے مشورہ کریں۔'
      : currentLanguage === 'roman'
      ? 'Yeh app aapki rehnumai ke liye hai, lekin yeh kisi asli doctor ka mutabadil nahi hai. Koi bhi dawa lene ya ilaaj shuru karne se pehle hamesha licensed doctor se mashwara karein.'
      : 'This app is here to help guide you, but it does not replace a real doctor. Always consult a licensed doctor before taking any medicine or starting any treatment.';

  const buttonText =
    currentLanguage === 'ur'
      ? 'میں سمجھ گیا، جاری رکھیں'
      : currentLanguage === 'roman'
      ? 'Main Samajh Gaya, Aage Barhein'
      : 'I Understand, Continue';

  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const unsubscribe = voiceManager.subscribe((state) => {
      setIsPlaying(state.isPlaying);
    });
    return () => {
      unsubscribe();
      voiceManager.stop();
    };
  }, []);

  const handleToggleSpeak = () => {
    if (isPlaying) {
      voiceManager.stop();
    } else {
      voiceManager.speak(message, currentLanguage);
    }
  };

  const handleContinue = () => {
    voiceManager.stop();
    onAcknowledge();
  };

  return (
    <div
      id="initial-disclaimer-screen"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#f4f7f6] dark:bg-[#071a16] flex flex-col justify-between p-4 sm:p-6 select-none"
    >
      {/* Top Bar with Language Selector */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between z-10 pt-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            SehatSaathi Care
          </span>
        </div>
        <LanguageSelector
          currentLanguage={currentLanguage}
          onLanguageChange={onLanguageChange}
        />
      </div>

      {/* Center Card */}
      <div className="flex-1 flex items-center justify-center py-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 text-center flex flex-col items-center"
        >
          {/* Top 3D Animated Pumping Heart Converted From Medical Photo */}
          <div className="relative mb-3 flex items-center justify-center">
            <Realistic3DHeart size={110} interactive={false} />
          </div>

          {/* Badge Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/80 border border-teal-200/70 dark:border-teal-800/80 text-[11px] font-bold text-teal-700 dark:text-teal-300 tracking-wider uppercase mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{badgeText}</span>
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
            {headline}
          </h2>

          {/* Message Text */}
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-md mb-6">
            {message}
          </p>

          {/* Audio Listen Option with active playing state */}
          <button
            type="button"
            onClick={handleToggleSpeak}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 transition-all cursor-pointer ${
              isPlaying
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800 animate-pulse'
                : 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80 hover:bg-teal-100 dark:hover:bg-teal-900/60'
            }`}
          >
            {isPlaying ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-500" />
                <span>
                  {currentLanguage === 'ur'
                    ? 'آواز بند کریں'
                    : currentLanguage === 'roman'
                    ? 'Awaaz band karein'
                    : 'Stop Audio'}
                </span>
                <span className="flex items-center gap-0.5 ml-1">
                  <span className="w-1 h-3 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-4 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>
                  {currentLanguage === 'ur'
                    ? 'آواز میں سنیں (Urdu Voice)'
                    : currentLanguage === 'roman'
                    ? 'Awaaz mein sunein'
                    : 'Listen to message'}
                </span>
              </>
            )}
          </button>

          {/* Primary Action Button */}
          <button
            type="button"
            id="disclaimer-continue-btn"
            onClick={handleContinue}
            className="w-full py-3.5 px-6 rounded-xl sm:rounded-2xl bg-[#0f766e] hover:bg-[#0d6d66] active:scale-[0.99] text-white font-semibold text-base shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>{buttonText}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </motion.div>
      </div>

      {/* Footer info */}
      <div className="text-center text-xs text-slate-400 pb-2">
        Pakistan Digital Health Network • PMDC Licensed Supervision
      </div>
    </div>
  );
};
