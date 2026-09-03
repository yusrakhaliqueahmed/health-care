import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  HeartPulse,
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  Globe,
} from 'lucide-react';
import { SupportedLanguage, UserAccount } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { LanguageSelector } from './LanguageSelector';
import { GlobalFooter } from './GlobalFooter';

interface LoginFormScreenProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onLoginSuccess: (user: UserAccount) => void;
  initialUserName?: string;
}

const PRESET_ACCOUNTS = [
  { name: 'Yusra Khalique', email: 'yusra@sehatsaathi.pk', role: 'Patient / Health Advocate', avatarInitial: 'Y' },
  { name: 'Farooq', email: 'farooq@sehatsaathi.pk', role: 'Patient (Self)', avatarInitial: 'F' },
  { name: 'Dr. Ayesha Malik', email: 'ayesha.pmdc@hospital.gov.pk', role: 'PMDC Physician', avatarInitial: 'A' },
  { name: 'Ahmed Khan', email: 'ahmed@family.pk', role: 'Family Member', avatarInitial: 'A' },
];

export const LoginFormScreen: React.FC<LoginFormScreenProps> = ({
  currentLanguage,
  onLanguageChange,
  onLoginSuccess,
  initialUserName = '',
}) => {
  const [userName, setUserName] = useState(initialUserName || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const isRTL = currentLanguage !== 'en';

  const handleSelectPreset = (preset: typeof PRESET_ACCOUNTS[0]) => {
    setUserName(preset.name);
    setEmail(preset.email);
    setPassword('sehat2026');
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setErrorMsg(
        currentLanguage === 'ur'
          ? 'براہ کرم اپنا نام درج کریں۔'
          : 'Please enter your name to continue.'
      );
      return;
    }

    const cleanName = userName.trim();
    const cleanEmail = email.trim() || `${cleanName.toLowerCase().replace(/\s+/g, '.')}@sehatsaathi.pk`;

    const user: UserAccount = {
      id: `usr-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      phone: '+92 300 1234567',
      isLoggedIn: true,
    };

    onLoginSuccess(user);
  };

  return (
    <div
      id="login-flow-screen"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6"
    >
      <div className="flex-1 flex items-center justify-center py-6">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-teal-200/70 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100"
        >
          {/* Top Emerald/Teal Accent Bar */}
          <div className="h-2.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500" />

          <div className="p-6 sm:p-8 space-y-6">
            {/* Header with Brand & Language Selector */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/25">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                      SehatSaathi
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-[10px] font-extrabold uppercase">
                      Pro
                    </span>
                  </div>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    {currentLanguage === 'ur'
                      ? 'ڈیجیٹل ہیلتھ کیئر لاگ ان'
                      : 'Healthcare Account Access'}
                  </span>
                </div>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-teal-600 dark:text-teal-400 hidden sm:block" />
                <LanguageSelector
                  currentLanguage={currentLanguage}
                  onLanguageChange={onLanguageChange}
                />
              </div>
            </div>

            {/* Welcome & Step Indicator */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>
                  {currentLanguage === 'ur'
                    ? 'مرحلہ 2: محفوظ لاگ ان'
                    : 'Step 2 of 2: Secure Access'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {currentLanguage === 'ur'
                  ? 'اپنے اکاؤنٹ میں لاگ ان کریں'
                  : 'Sign in to your Healthcare Portal'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {currentLanguage === 'ur'
                  ? 'اپنا نام درج کریں تاکہ آپ کی علامات اور طبی فائل آپ کے نام کے ساتھ محفوظ ہوں۔'
                  : 'Enter your name to personalize your clinical symptom triage and doctor case file.'}
              </p>
            </div>

            {/* Quick One-Click Demo Profiles */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {currentLanguage === 'ur'
                  ? 'فوری ڈیمو نام منتخب کریں یا اپنا نام لکھیں:'
                  : 'Quick Select Profile or Type Below:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_ACCOUNTS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all text-xs cursor-pointer ${
                      userName === preset.name
                        ? 'bg-teal-50 dark:bg-teal-950/70 border-teal-500 text-teal-900 dark:text-teal-200 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {preset.avatarInitial}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold truncate text-slate-900 dark:text-white">
                        {preset.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {preset.role}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {currentLanguage === 'ur' ? 'آپ کا مکمل نام' : 'Your Full Name / Username'}
                  <span className="text-rose-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    id="login-username-input"
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder={
                      currentLanguage === 'ur'
                        ? 'مثال: یسریٰ خلیق، فاروق، ڈاکٹر عائشہ...'
                        : 'e.g. Yusra Khalique, Farooq, Dr. Ayesha...'
                    }
                    className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition-all"
                  />
                </div>
              </div>

              {/* Email / Phone Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {currentLanguage === 'ur' ? 'ای میل یا موبائل نمبر' : 'Email Address or Mobile'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="login-email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@sehatsaathi.pk or 0300-1234567"
                    className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {currentLanguage === 'ur' ? 'پاس ورڈ' : 'Password'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 rtl:pl-3 rtl:pr-10 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-3 rtl:pr-0 rtl:pl-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                id="login-submit-btn"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-teal-600/25 transition-all cursor-pointer min-h-[48px]"
              >
                <span>
                  {currentLanguage === 'ur'
                    ? 'لاگ ان کریں (Login)'
                    : currentLanguage === 'sd'
                    ? 'لاگ ان ڪريو (Login)'
                    : currentLanguage === 'ps'
                    ? 'ننوتل (Login)'
                    : currentLanguage === 'bal'
                    ? 'لاگ ان ببیت (Login)'
                    : currentLanguage === 'pa'
                    ? 'لاگ ان کرو (Login)'
                    : currentLanguage === 'skr'
                    ? 'لاگ ان کرو (Login)'
                    : 'Login'}
                </span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </form>

            <div className="text-center text-[11px] text-slate-400 dark:text-slate-500">
              {currentLanguage === 'ur'
                ? 'محفوظ میڈیکل پورٹل • پی ایم ڈی سی توثیق شدہ ڈاکٹر نیٹ ورک'
                : 'Protected Medical Portal • PMDC Verified Physician Network'}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Global Shared Footer */}
      <GlobalFooter className="bg-transparent border-t-0 py-2 text-slate-400" />
    </div>
  );
};
