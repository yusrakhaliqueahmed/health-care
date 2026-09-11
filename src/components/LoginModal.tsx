import React, { useState } from 'react';
import {
  X,
  LogIn,
  Lock,
  Mail,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { UserAccount, SupportedLanguage } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  currentUser: UserAccount;
  currentLanguage: SupportedLanguage;
  onClose: () => void;
  onLogin: (user: UserAccount) => void;
  onLogout: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  currentUser,
  currentLanguage,
  onClose,
  onLogin,
  onLogout,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const deriveDisplayName = (inputIdentifier: string, inputFullName?: string): string => {
    if (inputFullName && inputFullName.trim()) {
      return inputFullName.trim();
    }
    const clean = inputIdentifier.trim();
    if (!clean) return 'Patient';
    if (clean.includes('@')) {
      const namePart = clean.split('@')[0];
      return namePart
        .replace(/[._+-]+/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ') || 'User';
    }
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (authMode === 'signin') {
      if (!identifier.trim()) {
        setErrorMessage('Please enter your email or username.');
        return;
      }
      if (!password || password.length < 4) {
        setErrorMessage('Please enter your password (minimum 4 characters).');
        return;
      }
    } else {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (!identifier.trim()) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
      if (!password || password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const computedName = deriveDisplayName(identifier, fullName);
      const email = identifier.includes('@')
        ? identifier.trim()
        : `${identifier.trim().toLowerCase().replace(/\s+/g, '.')}@sehatsaathi.pk`;

      const newAccount: UserAccount = {
        id: `usr-${Date.now()}`,
        name: computedName,
        email,
        isLoggedIn: true,
      };

      onLogin(newAccount);
      setSuccessMessage(`Welcome back, ${computedName}!`);

      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 700);
    }, 450);
  };

  const handleSignOutClick = () => {
    onLogout();
    setIdentifier('');
    setPassword('');
    setFullName('');
    setSuccessMessage('You have been signed out.');
    setTimeout(() => {
      setSuccessMessage('');
    }, 1200);
  };

  return (
    <div
      id="login-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-4 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="login-modal-card"
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-teal-100 dark:border-slate-800 p-5 sm:p-7 text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-200 my-auto max-h-[min(94vh,640px)] overflow-y-auto"
      >
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 mt-1">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-teal-700 dark:text-teal-400 block">
              SehatSaathi Security
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {currentUser.isLoggedIn ? 'Account Profile' : authMode === 'signin' ? 'Sign In' : 'Create Account'}
            </h3>
          </div>
        </div>

        {/* If user is already logged in, show their authenticated profile with option to sign out or switch */}
        {currentUser.isLoggedIn ? (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-base shadow-sm shrink-0">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold shrink-0">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {currentUser.email || 'patient@sehatsaathi.pk'}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              You are currently signed in. Your clinical triages, medical history, and prescriptions are personalized to your profile.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleSignOutClick}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-bold transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  setIdentifier('');
                  setPassword('');
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <UserCheck className="w-4 h-4" />
                <span>Sign In with Different Account</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Tab switch between Sign In and Sign Up */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-5">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMessage('');
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMessage('');
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                New Patient Registration
              </button>
            </div>

            {/* Real Login / Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      id="signup-fullname-input"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Yusra Khalique, Farooq Ahmed"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {authMode === 'signin' ? 'Email or Username' : 'Email Address'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type={authMode === 'signin' ? 'text' : 'email'}
                    required
                    id="login-identifier-input"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder={authMode === 'signin' ? 'Enter username or email' : 'name@example.com'}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  {authMode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setErrorMessage('Please contact support or enter your registered account password.')}
                      className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    id="login-password-input"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Remember my session</span>
                </label>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-300">
                  {errorMessage}
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="submit-real-login-btn"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all cursor-pointer disabled:opacity-60"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isSubmitting ? 'Authenticating...' : authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
