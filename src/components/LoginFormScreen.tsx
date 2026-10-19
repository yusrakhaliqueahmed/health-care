import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LogIn,
  Eye,
  EyeOff,
  User,
  UserPlus,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  X,
  Volume2,
  VolumeX,
  Mail,
  Lock,
  Sparkles,
  AlertTriangle,
  KeyRound,
  Check,
} from 'lucide-react';
import { SupportedLanguage, UserAccount } from '../types';
import { LanguageSelector } from './LanguageSelector';
import { voiceManager } from '../services/voice';
import {
  saveActiveSession,
  loadReturningUserProfile,
} from '../services/accountAuthService';
import { signInWithGoogle, sendPasswordResetEmail, auth } from '../firebase';

interface LoginFormScreenProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onLoginSuccess: (user: UserAccount) => void;
  initialUserName?: string;
  initialEmail?: string;
  onOpenDoctorRegistration?: () => void;
}

interface GoogleAccountItem {
  id: string;
  name: string;
  email: string;
  avatarLetter: string;
  avatarColor: string;
}

export const LoginFormScreen: React.FC<LoginFormScreenProps> = ({
  currentLanguage,
  onLanguageChange,
  onLoginSuccess,
  initialUserName = '',
  initialEmail = '',
  onOpenDoctorRegistration,
}) => {
  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';

  // Load returning profile if exists on this specific device
  const returningUser = loadReturningUserProfile();

  // Navigation mode between login screens:
  // 'welcome_back': Welcome back, Log in to your account, Continue with Google, OR, Email, Password, Log In
  // 'google_chooser': Shows accounts if previously logged in, or allows using device Google picker
  // 'google_add_account': Allows signing in with any other Google account
  // 'forgot_password': Secure email verification & account recovery flow
  const [viewMode, setViewMode] = useState<'welcome_back' | 'google_chooser' | 'google_add_account' | 'forgot_password'>('welcome_back');

  // Form inputs start completely empty for privacy & account isolation across devices
  const [email, setEmail] = useState<string>(initialEmail || '');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>(initialUserName || '');

  // Google Accounts list starts empty - users choose their own device accounts via Firebase Google popup
  const [googleAccounts, setGoogleAccounts] = useState<GoogleAccountItem[]>([]);

  // "Use another account" Form inputs
  const [newEmail, setNewEmail] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [accountFormError, setAccountFormError] = useState<string>('');

  // Forgot Password / Account Recovery Flow States
  type ResetStep = 'enter_email' | 'verify_code' | 'new_password' | 'success';
  const [resetStep, setResetStep] = useState<ResetStep>('enter_email');
  const [resetEmail, setResetEmail] = useState<string>('');
  const [resetCode, setResetCode] = useState<string>('');
  const [resetToken, setResetToken] = useState<string>('');
  const [newResetPassword, setNewResetPassword] = useState<string>('');
  const [confirmResetPassword, setConfirmResetPassword] = useState<string>('');
  const [showResetPassword, setShowResetPassword] = useState<boolean>(false);
  const [showConfirmResetPassword, setShowConfirmResetPassword] = useState<boolean>(false);
  const [resetError, setResetError] = useState<string>('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [maskedResetEmail, setMaskedResetEmail] = useState<string>('');
  const [demoCodeHint, setDemoCodeHint] = useState<string>('');

  // Resend cooldown timer
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVoicePlaying, setIsVoicePlaying] = useState<boolean>(false);

  // Voice guidance
  const handlePlayVoice = () => {
    let text = '';
    if (viewMode === 'welcome_back') {
      text = isUrdu
        ? 'خوش آمدید! اپنے اکاؤنٹ میں لاگ ان کرنے کے لیے گوگل اکاؤنٹ یا ای میل اور پاسورڈ استعمال کریں۔'
        : isRoman
        ? 'Khush amdeed! Apne account mein login karne ke liye Google account ya email aur password use karein.'
        : 'Welcome back! Log in to your account using Google or your email and password.';
    } else if (viewMode === 'google_chooser') {
      text = isUrdu
        ? 'اپنا گوگل اکاؤنٹ منتخب کریں، یا نیا اکاؤنٹ استعمال کرنے کے لیے یوز اینادر اکاؤنٹ پر کلک کریں۔'
        : isRoman
        ? 'Apna Google account select karein, ya naya account use karne ke liye Use another account par click karein.'
        : 'Choose your Google account, or click Use another account to sign in with a different account.';
    } else {
      text = isUrdu
        ? 'اپنا دوسرا گوگل ای میل اور پاسورڈ درج کر کے سائن ان کریں۔'
        : isRoman
        ? 'Apna doosra Google email aur password darj kar ke sign in karein.'
        : 'Enter your other Google email address and password to sign in.';
    }

    setIsVoicePlaying(true);
    voiceManager.speak(text, currentLanguage);
    setTimeout(() => setIsVoicePlaying(false), 4200);
  };

  // Execute login and persist session
  const completeLogin = (userToLogin: UserAccount) => {
    setIsLoading(true);
    saveActiveSession(userToLogin);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(userToLogin);
    }, 350);
  };

  // Helper to derive friendly name from email address
  const deriveNameFromEmail = (emailStr: string): string => {
    if (!emailStr) return 'Google User';
    const clean = emailStr.split('@')[0].replace(/[0-9._-]+/g, ' ').trim();
    if (!clean) return 'Google User';
    return clean
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  // 1. Handle Welcome back form submit (Direct "Log In" button)
  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setAccountFormError(
        isUrdu
          ? 'براہِ کرم اپنا ای میل درج کریں۔'
          : isRoman
          ? 'Bara-e-meharbani apna email darj karein.'
          : 'Please enter your email address.'
      );
      return;
    }
    const derivedName = userName.trim() || deriveNameFromEmail(cleanEmail) || 'Patient';
    const user: UserAccount = {
      id: `usr-login-${Date.now()}`,
      name: derivedName,
      email: cleanEmail,
      role: 'patient',
      isPatient: true,
      patientTitle: 'Patient',
      loginMethod: 'email',
      isLoggedIn: true,
    };
    completeLogin(user);
  };

  // 2. Handle Google account select from Chooser list
  const handleSelectGoogleAccount = (selectedName: string, selectedEmail: string) => {
    const user: UserAccount = {
      id: `usr-google-${Date.now()}`,
      name: selectedName,
      email: selectedEmail,
      role: 'patient',
      isPatient: true,
      patientTitle: 'Patient',
      loginMethod: 'google',
      isLoggedIn: true,
    };
    completeLogin(user);
  };

  // 3. Handle Firebase Google OAuth Sign In (prompts user with all accounts on device)
  const handleFirebaseGoogleSignIn = async () => {
    setIsLoading(true);
    setAccountFormError('');
    try {
      const credential = await signInWithGoogle();
      const cleanName = credential.displayName || 'Google User';
      const cleanEmail = credential.email || '';

      const user: UserAccount = {
        id: credential.uid,
        name: cleanName,
        email: cleanEmail,
        avatarUrl: credential.photoURL || undefined,
        role: 'patient',
        isPatient: true,
        patientTitle: 'Patient',
        loginMethod: 'google',
        isLoggedIn: true,
      };

      setGoogleAccounts((prev) => [
        ...prev.filter((a) => a.email.toLowerCase() !== cleanEmail.toLowerCase()),
        {
          id: `acc-${credential.uid}`,
          name: cleanName,
          email: cleanEmail,
          avatarLetter: cleanName.charAt(0).toUpperCase(),
          avatarColor: 'from-blue-600 to-indigo-600',
        },
      ]);

      completeLogin(user);
    } catch (err: any) {
      setIsLoading(false);
      console.warn('Firebase login flow notice:', err);
      const errCode = err?.code || '';
      if (errCode === 'auth/popup-closed-by-user' || errCode === 'auth/cancelled-popup-request') {
        // User closed or cancelled popup, no intrusive error
        return;
      }
      setAccountFormError(
        isUrdu
          ? 'گوگل لاگ ان ونڈو بند ہو گئی یا اجازت نہیں ملی۔ آپ نیچے اپنا ای میل بھی درج کر سکتے ہیں۔'
          : isRoman
          ? 'Google login window band ho gayi ya permission nahi mili. Aap neechay email likh kar bhi login kar sakte hain.'
          : 'Google sign-in was closed or unavailable. You can also sign in with your email below.'
      );
    }
  };

  // 4. Handle "Use another account" Form submit
  const handleAddAndLoginNewAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setAccountFormError('');

    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAccountFormError(
        isUrdu
          ? 'براہِ کرم درست گوگل ای میل ایڈریس درج کریں۔'
          : isRoman
          ? 'Bara-e-meharbani valid Google email darj karein.'
          : 'Please enter a valid Google email address.'
      );
      return;
    }

    const cleanName = (newName.trim() || deriveNameFromEmail(cleanEmail)).trim();
    const newAccountItem: GoogleAccountItem = {
      id: `acc-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      avatarLetter: cleanName.charAt(0).toUpperCase(),
      avatarColor: 'from-emerald-500 to-teal-600',
    };

    // Add to accounts list so it stays available
    setGoogleAccounts((prev) => [
      ...prev.filter((a) => a.email.toLowerCase() !== cleanEmail),
      newAccountItem,
    ]);

    // Complete login as this new account
    const user: UserAccount = {
      id: `usr-google-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role: 'patient',
      isPatient: true,
      patientTitle: 'Patient',
      loginMethod: 'google',
      isLoggedIn: true,
    };

    completeLogin(user);
  };

  // 5. Forgot Password / Account Recovery Handlers
  const handleSendRecoveryCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = resetEmail.trim().toLowerCase();
    setResetError('');
    setResetSuccessMsg('');

    if (!cleanEmail || !cleanEmail.includes('@') || cleanEmail.length < 5) {
      setResetError(
        isUrdu
          ? 'براہِ کرم درست ای میل ایڈریس درج کریں۔'
          : isRoman
          ? 'Bara-e-meharbani valid email address darj karein.'
          : 'Please enter a valid email address.'
      );
      return;
    }

    setIsLoading(true);
    try {
      // Trigger optional native Firebase password reset email concurrently
      sendPasswordResetEmail(auth, cleanEmail).catch(() => {});

      const res = await fetch('/api/auth/forgot-password/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch verification code');
      }

      setMaskedResetEmail(data.maskedEmail || cleanEmail);
      if (data.demoOtpCode) {
        setDemoCodeHint(data.demoOtpCode);
      }
      setResendCooldown(data.cooldownSeconds || 30);
      setResetSuccessMsg(
        isUrdu
          ? `تصدیقی کوڈ ${data.maskedEmail || cleanEmail} پر بھیج دیا گیا ہے۔`
          : `Verification code sent to ${data.maskedEmail || cleanEmail}.`
      );
      setResetStep('verify_code');
    } catch (err: any) {
      setResetError(err?.message || 'Could not send verification code. Please check your connection and retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = resetEmail.trim().toLowerCase();
    const cleanCode = resetCode.trim();
    setResetError('');

    if (!cleanCode || cleanCode.length < 6) {
      setResetError(
        isUrdu
          ? 'براہِ کرم 6 ہندسوں کا درست تصدیقی کوڈ درج کریں۔'
          : 'Please enter the 6-digit verification code.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code: cleanCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Incorrect or expired verification code');
      }

      setResetToken(data.resetToken);
      setResetStep('new_password');
    } catch (err: any) {
      setResetError(err?.message || 'Verification failed. Please check the code and retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = resetEmail.trim().toLowerCase();
    setResetError('');

    if (newResetPassword.length < 6) {
      setResetError(
        isUrdu
          ? 'پاسورڈ کم از کم 6 حروف پر مشتمل ہونا چاہیے۔'
          : 'Password must be at least 6 characters long.'
      );
      return;
    }

    if (newResetPassword !== confirmResetPassword) {
      setResetError(
        isUrdu
          ? 'پاسورڈ اور تصدیقی پاسورڈ آپس میں مماثل نہیں ہیں۔'
          : 'Passwords do not match. Please verify.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          resetToken,
          newPassword: newResetPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update password');
      }

      // Pre-fill login screen email with recovered email
      setEmail(cleanEmail);
      setPassword('');
      setResetStep('success');
    } catch (err: any) {
      setResetError(err?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="login-form-screen"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#f4f7f6] dark:bg-[#071a16] flex flex-col justify-between p-4 sm:p-6 select-none transition-colors duration-200"
    >
      {/* Top Header Bar */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between z-10 pt-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            SehatSaathi Care
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handlePlayVoice}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              isVoicePlaying
                ? 'bg-rose-50 text-rose-600 border border-rose-300 animate-pulse'
                : 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80 hover:bg-teal-100'
            }`}
            title="Listen to voice instructions"
          >
            {isVoicePlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="hidden xs:inline">
              {isUrdu ? 'آواز سنیں' : isRoman ? 'Awaaz Sunein' : 'Listen'}
            </span>
          </button>

          <LanguageSelector
            currentLanguage={currentLanguage}
            onLanguageChange={onLanguageChange}
          />
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center py-6">
        <AnimatePresence mode="wait">
          {/* ========================================================================= */}
          {/* SCREEN 1: "Welcome back" CARD (Matching Frame 00:08 - 00:14 in video)     */}
          {/* ========================================================================= */}
          {viewMode === 'welcome_back' && (
            <motion.div
              key="welcome-back-card"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-9 text-center"
            >
              {/* Top Login Squircle Icon (Exact teal badge with entry arrow from video) */}
              <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800/80 flex items-center justify-center text-teal-600 dark:text-teal-400 mx-auto mb-3 shadow-xs">
                <LogIn className="w-7 h-7 stroke-[2.2]" />
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
                {isUrdu ? 'خوش آمدید' : isRoman ? 'Welcome Back' : 'Welcome back'}
              </h2>

              {/* Subtitle */}
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-normal">
                {isUrdu ? 'اپنے اکاؤنٹ میں لاگ ان کریں' : isRoman ? 'Apne account mein log in karein' : 'Log in to your account'}
              </p>

              {/* Status or Auth Error Alert */}
              {accountFormError && (
                <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/70 text-xs font-medium text-amber-900 dark:text-amber-200 text-left rtl:text-right">
                  {accountFormError}
                </div>
              )}

              {/* Google Button: "Continue with Google" with High-Contrast Non-Fading Hover Styling */}
              <button
                type="button"
                id="google-login-btn"
                onClick={handleFirebaseGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100/90 dark:hover:bg-slate-700/90 active:bg-slate-200 dark:active:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
              >
                {/* Official Google 4-Color 'G' SVG */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                <span className="font-bold text-sm sm:text-base tracking-tight text-slate-800 dark:text-slate-100 transition-colors select-none">
                  {isLoading
                    ? (isUrdu ? 'گوگل سے تصدیق ہو رہی ہے...' : 'Connecting to Google...')
                    : (isUrdu ? 'گوگل سے لاگ ان کریں' : 'Continue with Google')}
                </span>
              </button>

              {/* OR Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-bold uppercase tracking-wider">
                    OR
                  </span>
                </div>
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleManualLogin} className="space-y-4 text-left rtl:text-right">
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isUrdu ? 'ای میل' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isUrdu ? 'apna.email@example.com' : 'name@example.com'}
                    required
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden transition-all shadow-2xs font-medium"
                  />
                </div>

                {/* Password Field with Forgot Password Link */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <label>{isUrdu ? 'پاسورڈ' : 'Password'}</label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(email.trim());
                        setResetStep('enter_email');
                        setResetError('');
                        setResetSuccessMsg('');
                        setViewMode('forgot_password');
                      }}
                      className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline cursor-pointer"
                    >
                      {isUrdu ? 'پاسورڈ بھول گئے؟' : isRoman ? 'Password bhool gaye?' : 'Forgot Password?'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-3.5 pr-10 rtl:pr-3.5 rtl:pl-10 py-2.5 sm:py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden transition-all shadow-2xs font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-3 rtl:pl-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Log In Button (Solid Teal Button Matching Video) */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-xl sm:rounded-2xl bg-[#0f766e] hover:bg-[#0d6d66] active:scale-[0.99] text-white font-semibold text-base shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
                >
                  {isLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <span>{isUrdu ? 'لاگ ان کریں' : isRoman ? 'Log In' : 'Log In'}</span>
                  )}
                </button>
              </form>

              {/* Doctor Registration Portal Link */}
              {onOpenDoctorRegistration && (
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                  <button
                    type="button"
                    onClick={onOpenDoctorRegistration}
                    className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    {isUrdu
                      ? 'ڈاکٹرز کے لیے پی ایم ڈی سی پورٹل'
                      : 'For Doctors: PMDC Registration Portal'}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN 2: GOOGLE "CHOOSE AN ACCOUNT" (Matching Frame 00:15 in video)      */}
          {/* ========================================================================= */}
          {viewMode === 'google_chooser' && (
            <motion.div
              key="google-account-chooser"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-9 text-slate-800 dark:text-slate-100 overflow-hidden"
            >
              {/* Close Button back to Welcome Back */}
              <button
                type="button"
                onClick={() => setViewMode('welcome_back')}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Top Google Header: Google Logo + "Sign in with Google" */}
              <div className="flex items-center gap-2.5 mb-5 text-left rtl:text-right">
                <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
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
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Sign in with Google
                </span>
              </div>

              {/* Heading matching video: "Choose an account" */}
              <div className="text-left rtl:text-right mb-5">
                <h2 className="text-2xl sm:text-3xl font-normal text-slate-800 dark:text-white tracking-tight">
                  Choose an account
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  to continue to <span className="font-semibold text-teal-600 dark:text-teal-400">SehatSaathi</span>
                </p>
              </div>

              {/* Accounts List */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border-y border-slate-100 dark:border-slate-800 mb-5">
                {googleAccounts.length === 0 && (
                  <div className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                    {isUrdu
                      ? 'اس ڈیوائس پر فی الحال کوئی محفوظ اکاؤنٹ موجود نہیں۔ نیچے دیے گئے بٹن سے اپنا گوگل اکاؤنٹ منتخب کریں۔'
                      : 'No saved accounts on this device yet. Use the option below to sign in with your Google account.'}
                  </div>
                )}
                {googleAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleSelectGoogleAccount(acc.name, acc.email)}
                    disabled={isLoading}
                    className="w-full py-3.5 px-3 flex items-center justify-between gap-3 text-left rtl:text-right hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors rounded-xl cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Circle avatar with Initial in gradient */}
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${acc.avatarColor} text-white font-semibold text-base flex items-center justify-center shrink-0 shadow-xs`}>
                        {acc.avatarLetter}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm sm:text-base text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {acc.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                          {acc.email}
                        </div>
                      </div>
                    </div>
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all rtl:rotate-180 shrink-0" />
                    )}
                  </button>
                ))}

                {/* 2. Account item: "Use another account" (Firebase Device Accounts + Manual Form) */}
                <div className="py-1 space-y-1">
                  <button
                    type="button"
                    id="use-another-account-firebase-btn"
                    onClick={handleFirebaseGoogleSignIn}
                    disabled={isLoading}
                    className="w-full py-3.5 px-3 flex items-center justify-between text-left rtl:text-right hover:bg-blue-50/70 dark:hover:bg-slate-800 transition-colors rounded-xl cursor-pointer group border border-transparent hover:border-blue-200"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                        {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-blue-700 dark:text-blue-300 group-hover:underline">
                          {isUrdu ? 'اس ڈیوائس کا دوسرا گوگل اکاؤنٹ منتخب کریں' : 'Use another account (Device Google Picker)'}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {isUrdu ? 'موبائل یا لیپ ٹاپ پر لاگ ان شدہ تمام گوگل اکاؤنٹس' : 'Shows accounts logged into this mobile or laptop'}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 transition-all rtl:rotate-180" />
                  </button>

                  <button
                    type="button"
                    id="use-another-account-manual-btn"
                    onClick={() => {
                      setAccountFormError('');
                      setViewMode('google_add_account');
                    }}
                    className="w-full py-2 px-3 flex items-center justify-between text-left rtl:text-right hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors rounded-lg cursor-pointer text-slate-500 dark:text-slate-400 text-xs"
                  >
                    <span>{isUrdu ? 'یا نیا ای میل دستی درج کریں' : 'Or type another email manually'}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
              </div>

              {/* Privacy Notice matching video */}
              <div className="text-left rtl:text-right text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
                Before using this app, you can review SehatSaathi's{' '}
                <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                  Privacy Policy
                </span>{' '}
                and{' '}
                <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                  Terms of Service
                </span>
                .
              </div>

              {/* Bottom links */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span>English (United States)</span>
                <div className="flex items-center gap-4">
                  <span className="hover:underline cursor-pointer">Help</span>
                  <span className="hover:underline cursor-pointer">Privacy</span>
                  <span className="hover:underline cursor-pointer">Terms</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN 3: GOOGLE "USE ANOTHER ACCOUNT" (Fully interactive in-app sign in) */}
          {/* ========================================================================= */}
          {viewMode === 'google_add_account' && (
            <motion.div
              key="google-add-account-screen"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-9 text-slate-800 dark:text-slate-100 overflow-hidden"
            >
              {/* Top Back & Close buttons */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setViewMode('google_chooser')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                  <span>{isUrdu ? 'اکاؤنٹس پر واپس جائیں' : 'Back to accounts'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('welcome_back')}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Google Brand Header */}
              <div className="flex items-center gap-2.5 mb-2 text-left rtl:text-right">
                <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
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
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Google
                </span>
              </div>

              {/* Title */}
              <div className="text-left rtl:text-right mb-5">
                <h2 className="text-2xl font-normal text-slate-800 dark:text-white tracking-tight">
                  Sign in
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  to continue to <span className="font-semibold text-teal-600 dark:text-teal-400">SehatSaathi</span>
                </p>
              </div>

              {/* Feedback Error */}
              {accountFormError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{accountFormError}</span>
                </div>
              )}

              {/* Quick Preset Accounts (for super fast testing) */}
              <div className="mb-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-left rtl:text-right">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                  {isUrdu ? 'فوری آزمائش کے لیے اکاؤنٹ منتخب کریں:' : 'Quick Select or type custom:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setNewEmail('dr.tariq@gmail.com');
                      setNewName('Dr. Tariq Jamil');
                      setNewPassword('DoctorPass123!');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-[11px] font-semibold text-teal-700 dark:text-teal-300 hover:border-teal-500 transition-colors cursor-pointer"
                  >
                    Dr. Tariq Jamil (Doctor)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewEmail('hamza.ali@gmail.com');
                      setNewName('Hamza Ali');
                      setNewPassword('HamzaPass123!');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-[11px] font-semibold text-blue-700 dark:text-blue-300 hover:border-blue-500 transition-colors cursor-pointer"
                  >
                    Hamza Ali (Patient)
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleAddAndLoginNewAccount} className="space-y-4 text-left rtl:text-right">
                {/* Email or Phone Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isUrdu ? 'ای میل یا فون' : 'Email or phone'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => {
                        setNewEmail(e.target.value);
                        if (!newName && e.target.value) {
                          setNewName(deriveNameFromEmail(e.target.value));
                        }
                      }}
                      placeholder="e.g. dr.tariq@gmail.com"
                      required
                      autoFocus
                      className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-hidden transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Profile Name (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isUrdu ? 'آپ کا نام (پروفائل کے لیے)' : 'Your Name (for profile)'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Dr. Tariq Jamil"
                      className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-hidden transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isUrdu ? 'گوگل پاسورڈ' : 'Enter your password'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 rtl:pl-10 rtl:pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-hidden transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-3.5 rtl:pl-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Buttons: Back and Next (Authentic Google Blue) */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setViewMode('google_chooser')}
                    className="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {isUrdu ? 'منسوخ کریں' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-7 py-2.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#174ea6] text-white text-sm font-semibold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>{isUrdu ? 'آگے بڑھیں' : isRoman ? 'Aage Barhein' : 'Next'}</span>
                        <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Google Security Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-400">
                Google Identity Services &bull; SSL Encrypted
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN 4: FORGOT PASSWORD / ACCOUNT RECOVERY FLOW                          */}
          {/* ========================================================================= */}
          {viewMode === 'forgot_password' && (
            <motion.div
              key="forgot-password-card"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-9 text-slate-800 dark:text-slate-100 text-center"
            >
              {/* Back / Close button */}
              <button
                type="button"
                onClick={() => {
                  setViewMode('welcome_back');
                  setResetError('');
                  setResetSuccessMsg('');
                }}
                className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={isUrdu ? 'واپس جائیں' : 'Back to Login'}
              >
                <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
              </button>

              {/* Top Key Icon */}
              <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800/80 flex items-center justify-center text-teal-600 dark:text-teal-400 mx-auto mb-3 shadow-xs">
                <KeyRound className="w-7 h-7 stroke-[2.2]" />
              </div>

              {/* STEP 1: ENTER EMAIL */}
              {resetStep === 'enter_email' && (
                <>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
                    {isUrdu ? 'پاسورڈ ریکوری' : isRoman ? 'Password Recovery' : 'Forgot Password'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-5 font-normal leading-relaxed">
                    {isUrdu
                      ? 'اپنا رجسٹرڈ ای میل درج کریں تاکہ آپ کو 6 ہندسوں کا سیکیورٹی کوڈ بھیجا جا سکے۔'
                      : isRoman
                      ? 'Apna registered email darj karein taake aap ko 6-digit security code bheja ja sake.'
                      : 'Enter your registered email address to receive a secure 6-digit verification code.'}
                  </p>

                  {resetError && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2 text-left rtl:text-right">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{resetError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSendRecoveryCode} className="space-y-4 text-left rtl:text-right">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        {isUrdu ? 'ای میل ایڈریس' : 'Email Address'}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="name@example.com"
                          required
                          autoFocus
                          className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden transition-all font-medium"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-6 rounded-xl sm:rounded-2xl bg-[#0f766e] hover:bg-[#0d6d66] active:scale-[0.99] text-white font-semibold text-base shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <span>{isUrdu ? 'تصدیقی کوڈ حاصل کریں' : isRoman ? 'Code Bheinjein' : 'Send Verification Code'}</span>
                          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                        </>
                      )}
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setViewMode('welcome_back')}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer hover:underline"
                      >
                        {isUrdu ? 'لاگ ان صفحہ پر واپس جائیں' : 'Back to Log In'}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* STEP 2: VERIFY CODE */}
              {resetStep === 'verify_code' && (
                <>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
                    {isUrdu ? 'تصدیقی کوڈ درج کریں' : isRoman ? 'Code Darj Karein' : 'Enter Verification Code'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-3 font-normal leading-relaxed">
                    {isUrdu ? 'ہم نے تصدیقی کوڈ بھیجا ہے:' : 'We sent a 6-digit code to:'}{' '}
                    <span className="font-semibold text-teal-700 dark:text-teal-300 font-mono">
                      {maskedResetEmail || resetEmail}
                    </span>
                  </p>

                  {resetSuccessMsg && (
                    <div className="mb-3 p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/80 text-teal-800 dark:text-teal-200 text-xs font-medium flex items-center gap-2 text-left rtl:text-right">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600" />
                      <span>{resetSuccessMsg}</span>
                    </div>
                  )}

                  {demoCodeHint && (
                    <div className="mb-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-mono flex items-center justify-between">
                      <span>{isUrdu ? 'آزمائشی کوڈ:' : 'Verification OTP:'} <strong>{demoCodeHint}</strong></span>
                      <button
                        type="button"
                        onClick={() => setResetCode(demoCodeHint)}
                        className="px-2 py-0.5 rounded bg-amber-200/70 hover:bg-amber-300 text-[11px] font-sans font-bold cursor-pointer"
                      >
                        {isUrdu ? 'درج کریں' : 'Fill'}
                      </button>
                    </div>
                  )}

                  {resetError && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2 text-left rtl:text-right">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{resetError}</span>
                    </div>
                  )}

                  <form onSubmit={handleVerifyRecoveryCode} className="space-y-4 text-left rtl:text-right">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 text-center">
                        {isUrdu ? '6 ہندسوں کا سیکیورٹی کوڈ' : '6-Digit Verification Code'}
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="••••••"
                        required
                        autoFocus
                        className="w-full text-center tracking-[0.4em] font-mono text-2xl font-bold py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden transition-all"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <button
                        type="button"
                        onClick={() => {
                          setResetStep('enter_email');
                          setResetError('');
                        }}
                        className="hover:underline text-teal-600 dark:text-teal-400 font-semibold cursor-pointer"
                      >
                        {isUrdu ? 'ای میل تبدیل کریں' : 'Change email'}
                      </button>

                      {resendCooldown > 0 ? (
                        <span className="text-slate-400 font-mono">
                          {isUrdu ? `دوبارہ (${resendCooldown}s)` : `Resend in ${resendCooldown}s`}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendRecoveryCode()}
                          disabled={isLoading}
                          className="hover:underline text-teal-600 dark:text-teal-400 font-semibold cursor-pointer"
                        >
                          {isUrdu ? 'دوبارہ کوڈ بھیجیں' : 'Resend code'}
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || resetCode.length < 6}
                      className="w-full py-3.5 px-6 rounded-xl sm:rounded-2xl bg-[#0f766e] hover:bg-[#0d6d66] active:scale-[0.99] text-white font-semibold text-base shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <span>{isUrdu ? 'کوڈ کی تصدیق کریں' : 'Verify & Continue'}</span>
                          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}

              {/* STEP 3: SET NEW PASSWORD */}
              {resetStep === 'new_password' && (
                <>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
                    {isUrdu ? 'نیا پاسورڈ مقرر کریں' : isRoman ? 'Naya Password Rakhein' : 'Set New Password'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-5 font-normal leading-relaxed">
                    {isUrdu
                      ? 'اپنے اکاؤنٹ کے لیے نیا اور محفوظ پاسورڈ درج کریں۔'
                      : isRoman
                      ? 'Apne account ke liye naya aur mehfooz password darj karein.'
                      : 'Choose a strong new password for your SehatSaathi account.'}
                  </p>

                  {resetError && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2 text-left rtl:text-right">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{resetError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSetNewPassword} className="space-y-4 text-left rtl:text-right">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        {isUrdu ? 'نیا پاسورڈ' : 'New Password'}
                      </label>
                      <div className="relative">
                        <input
                          type={showResetPassword ? 'text' : 'password'}
                          value={newResetPassword}
                          onChange={(e) => setNewResetPassword(e.target.value)}
                          placeholder="••••••••••••"
                          required
                          autoFocus
                          minLength={6}
                          className="w-full px-3.5 pr-10 rtl:pr-3.5 rtl:pl-10 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden transition-all font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowResetPassword(!showResetPassword)}
                          className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-3.5 rtl:pl-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        {isUrdu ? 'پاسورڈ کی تصدیق کریں' : 'Confirm New Password'}
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmResetPassword ? 'text' : 'password'}
                          value={confirmResetPassword}
                          onChange={(e) => setConfirmResetPassword(e.target.value)}
                          placeholder="••••••••••••"
                          required
                          minLength={6}
                          className="w-full px-3.5 pr-10 rtl:pr-3.5 rtl:pl-10 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden transition-all font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmResetPassword(!showConfirmResetPassword)}
                          className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-3.5 rtl:pl-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {showConfirmResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || newResetPassword.length < 6 || newResetPassword !== confirmResetPassword}
                      className="w-full py-3.5 px-6 rounded-xl sm:rounded-2xl bg-[#0f766e] hover:bg-[#0d6d66] active:scale-[0.99] text-white font-semibold text-base shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{isUrdu ? 'پاسورڈ تبدیل کریں' : 'Update Password & Return'}</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}

              {/* STEP 4: SUCCESS */}
              {resetStep === 'success' && (
                <div className="py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-4">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                    {isUrdu ? 'پاسورڈ کامیابی سے تبدیل ہو گیا!' : 'Password Updated!'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                    {isUrdu
                      ? 'آپ کا پاسورڈ کامیابی سے اپ ڈیٹ ہو چکا ہے۔ اب آپ اپنے نئے پاسورڈ سے باآسانی لاگ ان کر سکتے ہیں۔'
                      : 'Your password has been securely reset. You can now log in using your newly created password.'}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('welcome_back');
                      setResetStep('enter_email');
                      setResetError('');
                      setResetSuccessMsg('');
                    }}
                    className="w-full py-3.5 px-6 rounded-xl sm:rounded-2xl bg-[#0f766e] hover:bg-[#0d6d66] active:scale-[0.99] text-white font-semibold text-base shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{isUrdu ? 'لاگ ان کے لیے آگے بڑھیں' : 'Proceed to Log In'}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 pb-2">
        Pakistan Digital Health Network • PMDC Licensed Supervision
      </div>
    </div>
  );
};
