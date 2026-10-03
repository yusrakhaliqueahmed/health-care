import React, { useState } from 'react';
import { Sparkles, ShieldCheck, RefreshCw, Lightbulb, CheckCircle2, Globe2 } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { getDailyHealthTip, VERIFIED_HEALTH_TIPS } from '../services/healthTips';
import { VoiceControlGroup } from './VoiceControlGroup';

interface DailyHealthInsightProps {
  currentLanguage: SupportedLanguage;
  className?: string;
}

export const DailyHealthInsight: React.FC<DailyHealthInsightProps> = ({
  currentLanguage,
  className = '',
}) => {
  const [tipOffset, setTipOffset] = useState(0);
  const [activeLang, setActiveLang] = useState<'ur' | 'en'>(
    currentLanguage === 'ur' ? 'ur' : 'en'
  );

  const currentTip = getDailyHealthTip(tipOffset);
  const isUrdu = activeLang === 'ur';

  const handleNextTip = () => {
    setTipOffset((prev) => (prev + 1) % VERIFIED_HEALTH_TIPS.length);
  };

  const textToRead = `${currentTip.title[activeLang]}. ${currentTip.content[activeLang]}. ${
    isUrdu ? 'عملی احتیاط:' : 'Actionable Step:'
  } ${currentTip.actionableStep[activeLang]}`;

  return (
    <section
      aria-label="Daily Health Insight"
      className={`relative overflow-hidden rounded-3xl sm:rounded-[28px] bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 text-white p-5 sm:p-7 shadow-lg border border-teal-500/30 transition-all ${
        isUrdu ? 'rtl font-urdu' : 'ltr'
      } ${className}`}
      dir={isUrdu ? 'rtl' : 'ltr'}
    >
      {/* Background glow highlights */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Top Header Row: Category Badge + English/Urdu Switcher + Next Tip */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-teal-300 shrink-0" />
            <span>
              {isUrdu ? 'آج کی مصدقہ طبی ہدایت' : 'Daily Verified Health Insight'}
            </span>
          </div>

          <span className="text-xs text-teal-200/70 font-semibold px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
            {currentTip.category[activeLang]}
          </span>
        </div>

        {/* Controls: Language Toggle & Next Tip Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language Toggle (English <-> Urdu) */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs font-bold shadow-inner">
            <button
              type="button"
              onClick={() => setActiveLang('en')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeLang === 'en'
                  ? 'bg-teal-600 text-white shadow-2xs font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Read in English"
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setActiveLang('ur')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-urdu ${
                activeLang === 'ur'
                  ? 'bg-teal-600 text-white shadow-2xs font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="اردو میں پڑھیں"
            >
              اردو
            </button>
          </div>

          {/* Next Tip Button */}
          <button
            type="button"
            onClick={handleNextTip}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-teal-200 hover:text-white text-xs font-semibold border border-teal-500/30 transition-all cursor-pointer shadow-2xs"
            title={isUrdu ? 'اگلی طبی ہدایت دیکھیں' : 'Next Health Tip'}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">
              {isUrdu ? 'اگلی ہدایت' : 'Next Tip'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="space-y-3 relative z-10">
        <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white tracking-tight leading-snug">
          {currentTip.title[activeLang]}
        </h3>

        <p className="text-xs sm:text-sm md:text-base text-slate-200/95 leading-relaxed font-normal">
          {currentTip.content[activeLang]}
        </p>

        {/* Actionable Clinical Takeaway Card */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-teal-950/60 border border-teal-500/40 text-teal-100 flex items-start gap-3 shadow-inner">
          <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xs sm:text-sm leading-snug">
            <strong className="text-emerald-300 font-bold block mb-0.5">
              {isUrdu ? 'طبی رہنما اصول اور عمل:' : 'Practical Medical Action:'}
            </strong>
            <span className="text-slate-200">
              {currentTip.actionableStep[activeLang]}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Row: Voice Controls & Source Attribution */}
      <div className="mt-5 pt-4 border-t border-teal-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
        {/* Voice Control Group with Play, Pause, Stop & Speed */}
        <div className="w-full sm:w-auto">
          <VoiceControlGroup
            currentLanguage={activeLang}
            textToSpeak={textToRead}
            label={isUrdu ? 'طبی ہدایت سنیں' : 'Listen to Health Insight'}
            variant="compact"
            size="sm"
          />
        </div>

        {/* Source citation */}
        <div className="flex items-center gap-1.5 text-[11px] text-teal-300/80 self-end sm:self-center font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate max-w-[280px] sm:max-w-xs">
            {currentTip.source}
          </span>
        </div>
      </div>
    </section>
  );
};
