import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { SupportedLanguage, UserAccount } from '../types';
import { LanguageSelector } from './LanguageSelector';

interface LoginFormScreenProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onLoginSuccess: (user: UserAccount) => void;
  initialUserName?: string;
  initialEmail?: string;
}

export const LoginFormScreen: React.FC<LoginFormScreenProps> = ({
  currentLanguage,
  onLanguageChange,
  onLoginSuccess,
  initialUserName = 'Yusra Khalique Shaikh',
  initialEmail = 'yusrakhalique193@gmail.com',
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      const user: UserAccount = {
        id: 'usr-google-yusra',
        name: 'Yusra Khalique Shaikh',
        email: 'yusrakhalique193@gmail.com',
        phone: '+92 300 1234567',
        isLoggedIn: true,
      };
      onLoginSuccess(user);
    }, 450);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim() || 'yusrakhalique193@gmail.com';
    const computedName = cleanEmail.includes('@')
      ? cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : initialUserName;

    const user: UserAccount = {
      id: `usr-${Date.now()}`,
      name: computedName || initialUserName,
      email: cleanEmail,
      phone: '+92 300 1234567',
      isLoggedIn: true,
    };
    onLoginSuccess(user);
  };

  return (
    <div
      id="login-screen-wrapper"
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

      {/* Centered Login Card */}
      <div className="flex-1 flex items-center justify-center py-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.32, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 text-slate-900 dark:text-slate-100"
        >
          {/* Top Login Icon */}
          <div className="w-14 h-14 bg-[#0f766e] text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-teal-700/25">
            <LogIn className="w-7 h-7 stroke-[2]" />
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl font-bold text-center tracking-tight text-slate-900 dark:text-white mb-1">
            {currentLanguage === 'ur'
              ? 'خوش آمدید'
              : currentLanguage === 'roman'
              ? 'Khushamdeed'
              : 'Welcome back'}
          </h2>

          {/* Subtitle */}
          <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6">
            {currentLanguage === 'ur'
              ? 'اپنے اکاؤنٹ میں لاگ ان کریں'
              : currentLanguage === 'roman'
              ? 'Apne account mein log in karein'
              : 'Log in to your account'}
          </p>

          {/* Continue with Google Button */}
          <button
            type="button"
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/70 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 text-sm font-semibold flex items-center justify-center gap-3 transition-colors shadow-2xs cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.98 0 12c0 2.02.46 3.84 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>
              {isGoogleLoading
                ? 'Connecting...'
                : currentLanguage === 'ur'
                ? 'گوگل کے ساتھ جاری رکھیں'
                : 'Continue with Google'}
            </span>
          </button>

          {/* OR Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-semibold tracking-wider">
                OR
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {currentLanguage === 'ur' ? 'ای میل' : 'Email'}
              </label>
              <input
                type="email"
                id="login-email-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {currentLanguage === 'ur' ? 'پاس ورڈ' : 'Password'}
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(
                      currentLanguage === 'ur'
                        ? 'پاس ورڈ دوبارہ ترتیب دینے کی تفصیلات آپ کی ای میل پر بھیجی گئی ہیں۔'
                        : 'Password reset link has been dispatched to your email.'
                    );
                  }}
                  className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium"
                >
                  {currentLanguage === 'ur' ? 'پاس ورڈ بھول گئے؟' : 'Forgot password?'}
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="Toggle password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="login-submit-btn"
              className="w-full py-3 px-4 rounded-xl bg-[#0f766e] hover:bg-[#0d6d66] active:scale-[0.99] text-white font-semibold text-sm sm:text-base shadow-md shadow-teal-700/20 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <span>
                {currentLanguage === 'ur'
                  ? 'لاگ ان کریں'
                  : currentLanguage === 'roman'
                  ? 'Log In'
                  : 'Log in'}
              </span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </form>
        </motion.div>
      </div>

      {/* Footer info */}
      <div className="text-center text-xs text-slate-400 pb-2">
        Protected Medical Portal • PMDC Verified Physician Network
      </div>
    </div>
  );
};
