import React from 'react';
import { SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { ShieldAlert, Stethoscope, CheckCircle2, PhoneCall } from 'lucide-react';
import { AudioPlayerControls } from './AudioPlayerControls';

interface DisclaimerModalProps {
  isOpen: boolean;
  currentLanguage: SupportedLanguage;
  onClose: () => void;
  onEmergencyClick?: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({
  isOpen,
  currentLanguage,
  onClose,
  onEmergencyClick,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  return (
    <div
      id="disclaimer-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="disclaimer-modal-card"
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-teal-100 dark:border-slate-800 p-6 sm:p-8 text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-200 overflow-hidden"
      >
        {/* Subtle top decoration band */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600" />

        {/* Doctor Icon & Emergency Badge */}
        <div className="flex items-center justify-between gap-3 mb-5 mt-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-xs">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-teal-700 dark:text-teal-300">
                PMDC Compliance Safety Notice
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {t.disclaimerTitle}
              </h3>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* Big Readable Disclaimer Text */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 mb-5">
          <p className="text-base sm:text-lg text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
            {t.disclaimerText}
          </p>
        </div>

        {/* Audio Player for Low-Literacy Users */}
        <div className="mb-6">
          <AudioPlayerControls
            currentLanguage={currentLanguage}
            textToSpeak={t.disclaimerText}
          />
        </div>

        {/* Emergency Fast Call Option */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-600 text-white shadow-xs">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-red-900 dark:text-red-200">
                Critical Life-Threatening Emergency?
              </p>
              <p className="text-xs text-red-700 dark:text-red-300">
                Rescue 1122 Ambulance is free across Pakistan.
              </p>
            </div>
          </div>
          <a
            href="tel:1122"
            onClick={onEmergencyClick}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
          >
            Call 1122
          </a>
        </div>

        {/* Agreement Button */}
        <button
          id="disclaimer-agree-button"
          type="button"
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-bold text-base shadow-md shadow-teal-600/20 transition-all min-h-[48px]"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{t.disclaimerAgree}</span>
        </button>
      </div>
    </div>
  );
};
