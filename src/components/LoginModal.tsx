import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  RefreshCw,
  AlertCircle,
  Laptop,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { UserAccount, SupportedLanguage } from '../types';
import { ManagePhoneNumbersModal } from './ManagePhoneNumbersModal';
import {
  loadReturningUserProfile,
  saveActiveSession,
} from '../services/accountAuthService';
import { signInWithGoogle } from '../firebase';

interface LoginModalProps {
  isOpen: boolean;
  currentUser: UserAccount;
  currentLanguage: SupportedLanguage;
  onClose: () => void;
  onLogin: (user: UserAccount) => void;
  onLogout: () => void;
  onRequestSignOut?: () => void;
  onOpenDoctorRegistration?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  currentUser,
  currentLanguage,
  onClose,
  onLogin,
  onLogout,
  onRequestSignOut,
  onOpenDoctorRegistration,
}) => {
  const isUrdu = currentLanguage === 'ur';

  // Returning user profile for fast reference
  const [returningUser] = useState<Partial<UserAccount>>(() => {
    return loadReturningUserProfile();
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);

  // If user is already logged in, delegate to the Account & Numbers Manager
  if (currentUser.isLoggedIn) {
    return (
      <ManagePhoneNumbersModal
        isOpen={isOpen}
        currentUser={currentUser}
        currentLanguage={currentLanguage}
        onClose={onClose}
        onRequestSignOut={onRequestSignOut ? onRequestSignOut : onLogout}
        onUpdateUser={onLogin}
      />
    );
  }

  if (!isOpen) return null;

  // Handle Firebase Google Sign-In with device account chooser
  const handleFirebaseGoogleSignIn = async () => {
    setAuthError(null);
    setAuthSuccessMessage(null);
    setIsLoading(true);

    try {
      const fbUser = await signInWithGoogle();
      if (!fbUser) {
        setIsLoading(false);
        return;
      }

      const authenticatedAccount: UserAccount = {
        id: fbUser.uid || `usr-g-${Date.now()}`,
        name: fbUser.displayName || 'Google User',
        email: fbUser.email || '',
        avatarUrl: fbUser.photoURL || undefined,
        role: 'patient',
        isPatient: true,
        patientTitle: 'Patient',
        loginMethod: 'google',
        isLoggedIn: true,
      };

      saveActiveSession(authenticatedAccount);
      setAuthSuccessMessage(
        isUrdu
          ? `خوش آمدید ${authenticatedAccount.name}! آپ کامیابی سے لاگ ان ہو چکے ہیں۔`
          : `Welcome ${authenticatedAccount.name}! Successfully signed in with Google.`
      );

      setTimeout(() => {
        setIsLoading(false);
        onLogin(authenticatedAccount);
        onClose();
      }, 700);
    } catch (error: any) {
      setIsLoading(false);
      console.warn('Google Sign-In prompt result:', error);

      if (
        error?.code === 'auth/popup-closed-by-user' ||
        error?.message?.includes('closed-by-user')
      ) {
        setAuthError(
          isUrdu
            ? 'گوگل اکاؤنٹ کا ونڈو بند کر دیا گیا تھا۔ براہ کرم دوبارہ کوشش کریں۔'
            : 'Google Sign-In window closed. Please try again.'
        );
      } else if (
        error?.code === 'auth/popup-blocked' ||
        error?.code === 'auth/cancelled-popup-request'
      ) {
        handleDirectFallbackSignIn();
      } else {
        setAuthError(
          isUrdu
            ? `گوگل سائن ان میں مسئلہ آیا: ${error?.message || 'دوبارہ کوشش کریں'}`
            : `Google Sign-In note: ${error?.message || 'Please retry'}`
        );
      }
    }
  };

  const handleDirectFallbackSignIn = () => {
    if (!returningUser?.name || !returningUser?.email) return;
    const fallbackUser: UserAccount = {
      id: returningUser.id || `usr-google-${Date.now()}`,
      name: returningUser.name,
      email: returningUser.email,
      role: 'patient',
      isPatient: true,
      patientTitle: 'Patient',
      loginMethod: 'google',
      isLoggedIn: true,
    };
    saveActiveSession(fallbackUser);
    onLogin(fallbackUser);
    onClose();
  };

  return (
    <div
      id="login-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center bg-slate-950/75 backdrop-blur-md select-none"
    >
      <motion.div
        id="login-modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md bg-white dark:bg-[rgba(12,18,48,0.92)] rounded-3xl shadow-[0_0_40px_rgba(34,211,238,0.25)] border-2 border-cyan-400/30 dark:border-cyan-400/40 p-6 sm:p-7 text-slate-800 dark:text-slate-100 my-auto overflow-hidden backdrop-blur-md"
      >
        {/* Neon top accent glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 shadow-[0_0_12px_rgba(34,211,238,0.6)]" />

        {/* Top Controls: Badge & Close Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-400/40 text-cyan-700 dark:text-cyan-300 text-[11px] font-black uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
            <span>Firebase Google Auth</span>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* App Title & Subtitle */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isUrdu ? 'صحت ساتھی میں خوش آمدید' : 'Welcome to SehatSaathi'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-cyan-200/70 mt-1 max-w-xs mx-auto leading-relaxed">
            {isUrdu
              ? 'اپنے محفوظ میڈیکل ریکارڈز تک رسائی کے لیے اپنے گوگل اکاؤنٹ سے لاگ ان کریں'
              : 'Sign in with your Google account to access your encrypted health records'}
          </p>
        </div>

        {/* Live Device Account Chooser Info Banner */}
        <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 border border-blue-200 dark:border-cyan-500/30 text-left rtl:text-right">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 dark:bg-cyan-500/20 text-blue-600 dark:text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
              <Laptop className="w-4 h-4 hidden sm:block" />
              <Smartphone className="w-4 h-4 sm:hidden" />
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-200 leading-snug">
              <span className="font-bold block text-blue-800 dark:text-cyan-300 mb-0.5">
                {isUrdu ? 'موبائل اور لیپ ٹاپ کے اکاؤنٹس' : 'Device Google Accounts'}
              </span>
              <span>
                {isUrdu
                  ? 'جب آپ نیچے بٹن پر کلک کریں گے تو آپ کے موبائل یا لیپ ٹاپ میں موجود تمام گوگل اکاؤنٹس سامنے آ جائیں گے۔'
                  : 'Click below to choose from all Google accounts logged into this mobile or computer.'}
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Messages */}
        <AnimatePresence>
          {authError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
              <div className="flex-1 text-left rtl:text-right">{authError}</div>
            </motion.div>
          )}

          {authSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{authSuccessMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Option 1: Official Firebase Google Sign-In with device account chooser */}
          <button
            type="button"
            id="google-signin-modal-btn"
            onClick={handleFirebaseGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-between gap-3 cursor-pointer disabled:opacity-60 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-xs">
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
              </div>
              <div className="text-left rtl:text-right">
                <div className="leading-tight">
                  {isLoading
                    ? isUrdu
                      ? 'گوگل اکاؤنٹ سے رابطہ ہو رہا ہے...'
                      : 'Connecting with Google...'
                    : isUrdu
                    ? 'گوگل اکاؤنٹ منتخب کریں'
                    : 'Sign in with Google'}
                </div>
                <div className="text-[10px] text-blue-100 font-normal">
                  {isUrdu ? 'موبائل/لیپ ٹاپ کے اکاؤنٹس منتخب کریں' : 'Choose any account on this device'}
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 rtl:rotate-180 shrink-0 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Option 2: "Use another account" button */}
          <button
            type="button"
            id="use-another-account-modal-btn"
            onClick={handleFirebaseGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-between gap-2 transition-all cursor-pointer disabled:opacity-60"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>
                {isUrdu
                  ? 'Use another account (دوسرا اکاؤنٹ استعمال کریں)'
                  : 'Use another account'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              {isUrdu ? 'نیا گوگل اکاؤنٹ' : 'Add or switch account'}
            </span>
          </button>

          {/* Quick Continue for Returning Account on this specific device */}
          {returningUser?.name && returningUser?.email && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleDirectFallbackSignIn}
                disabled={isLoading}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                    {returningUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate">
                    {isUrdu
                      ? `${returningUser.name} کے بطور فوری لاگ ان`
                      : `Quick 1-tap: ${returningUser.name}`}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                  1-Tap
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Doctor onboarding link */}
        {onOpenDoctorRegistration && (
          <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-cyan-500/20 text-center">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDoctorRegistration();
              }}
              className="text-xs font-bold text-cyan-700 dark:text-cyan-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-cyan-500" />
              <span>{isUrdu ? 'ڈاکٹرز کے لیے پی ایم ڈی سی رجسٹریشن پورٹل' : 'For Doctors: PMDC Registration Portal'}</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
