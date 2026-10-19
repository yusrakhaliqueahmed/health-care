import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, ShieldCheck, Volume2, X } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { voiceManager } from '../services/voice';

interface SignOutConfirmModalProps {
  isOpen: boolean;
  currentLanguage: SupportedLanguage;
  onConfirm: () => void;
  onCancel: () => void;
}

export const SignOutConfirmModal: React.FC<SignOutConfirmModalProps> = ({
  isOpen,
  currentLanguage,
  onConfirm,
  onCancel,
}) => {
  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';

  const confirmSpeech = isUrdu
    ? 'کیا آپ سائن آؤٹ کرنا چاہتے ہیں؟ آپ کا سارا ریکارڈ محفوظ رہے گا۔'
    : isRoman
    ? 'Kya aap sign out karna chahte hain? Aapka sara record mehfooz rahega.'
    : 'Are you sure you want to sign out? All your health records will remain safely saved.';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className={`bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white ${
            isUrdu ? 'font-urdu text-right' : 'text-left'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg">
                  {isUrdu ? 'سائن آؤٹ کی تصدیق' : isRoman ? 'Sign Out Confirmation' : 'Sign Out Confirmation'}
                </h3>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>{isUrdu ? 'کلاؤڈ پر ریکارڈز محفوظ رہیں گے' : 'Records remain secure on server'}</span>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="py-5 space-y-3">
            <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
              {confirmSpeech}
            </p>

            <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/60 flex items-start gap-2.5 text-xs text-teal-900 dark:text-teal-200">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <p>
                {isUrdu
                  ? 'سائن آؤٹ کرنے سے صرف اس موبائل پر سیشن ختم ہوگا۔ دوبارہ لاگ ان کرنے پر آپ کے تمام نسخے، رپورٹس اور وائٹلز خودکار بحال ہو جائیں گے۔'
                  : isRoman
                  ? 'Sign out karne se sirf is phone par session khatam hoga. Dobara login karne par aapke tamam records wapas mil jayenge.'
                  : 'Signing out only ends your session on this phone. Your medical records, vitals, and prescriptions remain safe and will restore on next login.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => voiceManager.speak(confirmSpeech, currentLanguage)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isUrdu ? 'دوبارہ سنیں' : isRoman ? 'Dobara Sunein' : 'Listen again'}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-sm transition-colors cursor-pointer text-center"
            >
              {isUrdu ? 'نہیں، رہنے دیں' : isRoman ? 'Nahi, Rehne Dein' : 'No, Keep Logged In'}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>{isUrdu ? 'ہاں، سائن آؤٹ کریں' : isRoman ? 'Haan, Sign Out Karein' : 'Yes, Sign Out'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
