import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldAlert,
  Stethoscope,
  CheckCircle2,
  PhoneCall,
  ArrowRight,
  Globe,
  AlertTriangle,
  HeartPulse,
} from 'lucide-react';
import { SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { AudioPlayerControls } from './AudioPlayerControls';
import { LanguageSelector } from './LanguageSelector';
import { GlobalFooter } from './GlobalFooter';

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
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const disclaimerHeadline =
    currentLanguage === 'ur'
      ? 'براہ کرم اس ایپ کو استعمال کرنے سے پہلے ڈاکٹر سے مشورہ کریں۔'
      : currentLanguage === 'sd'
      ? 'مهرباني ڪري هن ايپ کي استعمال ڪرڻ کان اڳ ڊاڪٽر سان صلاح ڪريو.'
      : currentLanguage === 'ps'
      ? 'مهرباني وکړئ د دې اېپ کارولو دمخه له ډاکټر سره مشوره وکړئ.'
      : currentLanguage === 'bal'
      ? 'مہربانی کں ایں ایپ ئِ کارمرز کنگا پیش ڈاکٹر ءَ چہ سوج بکن اِت۔'
      : currentLanguage === 'pa'
      ? 'مہربانی کر کے ایس ایپ نوں ورتن توں پہلاں ڈاکٹر نال مشورہ کرو۔'
      : currentLanguage === 'skr'
      ? 'مہربانی کر کے ایں ایپ کوں استعمال کرنڑ توں پہلے ڈاکٹر نال صلاح کرو۔'
      : 'Please consult a doctor before using this app.';

  const detailedNotice =
    currentLanguage === 'ur'
      ? 'صحت ساتھی ایک مصنوعی ذہانت (AI) پر مبنی معلوماتی اور رہنمائی کا پلیٹ فارم ہے۔ یہ کسی باقاعدہ پی ایم ڈی سی (PMDC) لائسنس یافتہ ڈاکٹر، کلینیکل تشخیص یا ہنگامی علاج کا متبادل نہیں ہے۔ کسی بھی بیماری یا دوا کے استعمال سے پہلے مستند ڈاکٹر سے رجوع کریں۔ ہنگامی صورتحال میں فوری طور پر 1122 کال کریں۔'
      : 'SehatSaathi Pro provides automated AI-assisted health triage, medicine safety checks, and clinical guidance for informational purposes only. It is NOT a substitute for formal diagnosis, emergency care, or in-person consultation with a qualified PMDC-licensed physician. In life-threatening emergencies, dial Rescue 1122 immediately.';

  return (
    <div
      id="initial-pre-launch-disclaimer"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6"
    >
      <div className="flex-1 flex items-center justify-center py-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-teal-200/80 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100"
        >
          {/* Top Accent Gradient Header */}
          <div className="h-3 bg-gradient-to-r from-amber-500 via-rose-500 to-teal-600" />

          <div className="p-6 sm:p-8 space-y-6">
            {/* Top Bar: Brand, Badge & Language Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                    SehatSaathi <span className="text-teal-600 dark:text-teal-400">Pro</span>
                  </span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Pakistan Digital Health Network
                  </span>
                </div>
              </div>

              {/* Language Selector for the Disclaimer */}
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-600 dark:text-teal-400 hidden sm:block" />
                <LanguageSelector
                  currentLanguage={currentLanguage}
                  onLanguageChange={onLanguageChange}
                />
              </div>
            </div>

            {/* Primary Disclaimer Banner Box */}
            <div className="p-5 sm:p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/60 flex items-start gap-4">
              <div className="p-3 bg-amber-500 text-white rounded-2xl shrink-0 shadow-sm mt-0.5">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 text-xs font-bold uppercase tracking-wider">
                  Mandatory Medical Advisory • Step 1
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-amber-950 dark:text-amber-100 leading-snug">
                  {disclaimerHeadline}
                </h2>
              </div>
            </div>

            {/* Core Descriptive Text */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed">
                {detailedNotice}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>Always verify preliminary AI assessments with a PMDC registered doctor.</span>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>Do not disregard emergency symptoms or delay treatment.</span>
                </div>
              </div>
            </div>

            {/* Audio Accessibility Player */}
            <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60">
              <AudioPlayerControls
                currentLanguage={currentLanguage}
                textToSpeak={`${disclaimerHeadline}. ${detailedNotice}`}
              />
            </div>

            {/* Emergency Fast Access */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-600 text-white shadow-xs shrink-0">
                  <PhoneCall className="w-4 h-4 animate-pulse" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-rose-950 dark:text-rose-200 block">
                    Critical Emergency?
                  </span>
                  <span className="text-rose-800 dark:text-rose-300">
                    Rescue 1122 Ambulance is free across Pakistan.
                  </span>
                </div>
              </div>
              <a
                href="tel:1122"
                className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs text-center transition-colors shrink-0"
              >
                Call 1122
              </a>
            </div>

            {/* User Acknowledgment Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                id="disclaimer-terms-checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded-sm text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-600 cursor-pointer"
              />
              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-normal">
                {currentLanguage === 'ur'
                  ? 'میں تسلیم کرتا ہوں کہ یہ ایپ صرف معلوماتی رہنمائی کے لیے ہے اور میں علاج سے پہلے ڈاکٹر سے مشورہ کروں گا۔'
                  : 'I understand that this app is an assistive guide and I agree to consult a doctor before taking any medical action.'}
              </span>
            </label>

            {/* Proceed / Continue Button */}
            <button
              type="button"
              id="initial-disclaimer-proceed-btn"
              disabled={!agreedToTerms}
              onClick={onAcknowledge}
              className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-base shadow-lg shadow-teal-600/25 transition-all cursor-pointer min-h-[50px]"
            >
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>
                {currentLanguage === 'ur'
                  ? 'میں سمجھ گیا / جاری رکھیں'
                  : 'I Understand — Continue'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Global Shared Footer */}
      <GlobalFooter className="bg-transparent border-t-0 py-2 text-slate-400" />
    </div>
  );
};
