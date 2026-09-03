import React, { useState } from 'react';
import { User, X, LogIn, CheckCircle2, UserCheck, Shield, Sparkles } from 'lucide-react';
import { UserAccount, SupportedLanguage } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  currentUser: UserAccount;
  currentLanguage: SupportedLanguage;
  onClose: () => void;
  onLogin: (user: UserAccount) => void;
  onLogout: () => void;
}

const PRESET_USERS: Array<{ name: string; email: string; relation: string; blood: string }> = [
  { name: 'Yusra Khalique', email: 'yusra@sehatsaathi.pk', relation: 'Self', blood: 'O+' },
  { name: 'Farooq', email: 'farooq@sehatsaathi.pk', relation: 'Self', blood: 'B+' },
  { name: 'Dr. Ayesha Malik', email: 'ayesha.pmdc@hospital.gov.pk', relation: 'Physician', blood: 'O+' },
  { name: 'Zainab Bibi', email: 'zainab@family.pk', relation: 'Mother', blood: 'A+' },
  { name: 'Ali Farooq', email: 'ali@family.pk', relation: 'Child', blood: 'B+' },
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  currentUser,
  currentLanguage,
  onClose,
  onLogin,
  onLogout,
}) => {
  const [userName, setUserName] = useState(currentUser?.name || '');
  const [userEmail, setUserEmail] = useState(currentUser?.email || '');
  const [userPhone, setUserPhone] = useState(currentUser?.phone || '+92 300 1234567');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    const loggedInAccount: UserAccount = {
      id: `usr-${Date.now()}`,
      name: userName.trim(),
      email: userEmail.trim() || `${userName.trim().toLowerCase().replace(/\s+/g, '.')}@sehatsaathi.pk`,
      phone: userPhone.trim(),
      isLoggedIn: true,
      avatarUrl: currentUser?.avatarUrl,
    };

    onLogin(loggedInAccount);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      onClose();
    }, 600);
  };

  const handleSelectPreset = (preset: (typeof PRESET_USERS)[0]) => {
    setUserName(preset.name);
    setUserEmail(preset.email);
  };

  return (
    <div
      id="login-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="login-modal-card"
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-teal-100 dark:border-slate-800 p-6 sm:p-7 text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-200 overflow-hidden"
      >
        {/* Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 to-emerald-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 mt-1">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-xs">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-teal-700 dark:text-teal-300">
              User Authentication & Profile
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {currentUser.isLoggedIn ? 'Switch / Manage User' : 'Sign In to SehatSaathi'}
            </h3>
          </div>
        </div>

        {/* Currently Logged In Indicator */}
        <div className="mb-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <span className="text-[11px] text-slate-400 dark:text-slate-400 uppercase tracking-wider block font-semibold">
                Active Logged-In User
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {currentUser.name}
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
            Logged In
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              User Name (Displays dynamically on website) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              id="login-name-input"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Farooq, Ayesha, Ahmed..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Email or Phone Number (Optional)
            </label>
            <input
              type="text"
              id="login-email-input"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="e.g. user@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Preset Quick Chips */}
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Quick Test Profiles
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_USERS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    userName === preset.name
                      ? 'bg-teal-600 text-white border-teal-600 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="submit"
              id="submit-login-btn"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In as {userName || 'User'}</span>
            </button>

            {currentUser.isLoggedIn && (
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  setUserName('');
                  setUserEmail('');
                }}
                className="py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors"
                title="Sign Out"
              >
                Sign Out
              </button>
            )}
          </div>
        </form>

        {showSuccessToast && (
          <div className="mt-3 p-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center text-xs font-bold text-emerald-700 dark:text-emerald-300 animate-in fade-in">
            ✓ Logged in dynamically as {userName}!
          </div>
        )}
      </div>
    </div>
  );
};
