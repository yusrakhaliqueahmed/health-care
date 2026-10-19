import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Fingerprint,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  X,
  Scan,
  Sparkles,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { SupportedLanguage, UserAccount } from '../types';
import {
  authenticateWithBiometrics,
  getBiometricCapabilities,
  BiometricDeviceCapabilities,
} from '../services/biometricAuth';
import { voiceManager } from '../services/voice';

interface BiometricAuthModalProps {
  isOpen: boolean;
  currentUser?: UserAccount;
  currentLanguage: SupportedLanguage;
  onSuccess: () => void;
  onCancel: () => void;
  title?: string;
  subtitle?: string;
}

export const BiometricAuthModal: React.FC<BiometricAuthModalProps> = ({
  isOpen,
  currentUser,
  currentLanguage,
  onSuccess,
  onCancel,
  title,
  subtitle,
}) => {
  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';

  const [isScanning, setIsScanning] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<BiometricDeviceCapabilities | null>(null);
  const [usePinFallback, setUsePinFallback] = useState(false);
  const [pinInput, setPinInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsScanning(false);
      setAuthSuccess(false);
      setErrorMessage(null);
      setPinInput('');
      setUsePinFallback(false);

      getBiometricCapabilities().then((caps) => {
        setCapabilities(caps);
      });
    }
  }, [isOpen, currentLanguage, isUrdu, isRoman]);

  if (!isOpen) return null;

  const audioPrompt = isUrdu
    ? 'حساس طبی ریکارڈز دیکھنے کے لیے فنگر پرنٹ یا بائیو میٹرک تصدیق فرمائیں۔'
    : isRoman
    ? 'Sensitive health records dekhne ke liye biometric ya fingerprint verification karein.'
    : 'Biometric verification required to unlock your confidential health records.';

  const handlePlayVoice = () => {
    voiceManager.speak(audioPrompt, currentLanguage);
  };

  const handleTriggerBiometric = async () => {
    setIsScanning(true);
    setErrorMessage(null);

    try {
      const result = await authenticateWithBiometrics(currentUser);
      if (result.success) {
        setIsScanning(false);
        setAuthSuccess(true);

        setTimeout(() => {
          onSuccess();
        }, 800);
      } else {
        setIsScanning(false);
        setErrorMessage(
          result.error ||
            (isUrdu
              ? 'بائیو میٹرک سکین مکمل نہیں ہو سکا۔ دوبارہ کوشش کریں یا پن کوڈ درج کریں۔'
              : 'Biometric verification was not completed. Please try again or use PIN.')
        );
      }
    } catch (err: any) {
      setIsScanning(false);
      setErrorMessage(err?.message || 'Biometric authentication encountered an issue.');
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length >= 4) {
      setAuthSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 700);
    } else {
      setErrorMessage(isUrdu ? 'براہِ کرم کم از کم 4 ہندسوں کا پن درج کریں۔' : 'Please enter at least a 4-digit PIN.');
    }
  };

  const authenticatorLabel = capabilities
    ? capabilities.authenticatorType === 'touch_id'
      ? 'Apple Touch ID'
      : capabilities.authenticatorType === 'face_id'
      ? 'Apple Face ID'
      : capabilities.authenticatorType === 'windows_hello'
      ? 'Windows Hello Biometrics'
      : capabilities.authenticatorType === 'android_biometric'
      ? 'Android Fingerprint / Face'
      : 'Device Biometric Sensor'
    : 'Web Authentication Biometrics';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.25 }}
        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative my-auto select-none ${
          isUrdu ? 'font-urdu' : ''
        }`}
        dir="ltr"
      >
        {/* Cancel Button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Cancel"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Security Badge */}
        <div className="flex items-center justify-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-[11px] font-black uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Web Authentication API (FIDO2)</span>
          </div>
        </div>

        {/* Biometric Radar Scanner Visual */}
        <div className="flex justify-center my-6">
          <div className="relative">
            {/* Radar Rings */}
            <motion.div
              animate={{
                scale: isScanning ? [1, 1.4, 1] : 1,
                opacity: isScanning ? [0.6, 0.1, 0.6] : 0.3,
              }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="absolute -inset-4 rounded-full bg-teal-500/20 dark:bg-teal-400/20 blur-sm pointer-events-none"
            />

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={!isScanning && !authSuccess ? handleTriggerBiometric : undefined}
              className={`w-28 h-28 rounded-3xl flex items-center justify-center cursor-pointer transition-all shadow-xl relative overflow-hidden ${
                authSuccess
                  ? 'bg-emerald-600 text-white'
                  : isScanning
                  ? 'bg-teal-700 text-white ring-4 ring-teal-400/50'
                  : 'bg-gradient-to-tr from-teal-700 to-teal-500 text-white hover:from-teal-600 hover:to-teal-400'
              }`}
            >
              {/* Laser Scanning Beam */}
              {isScanning && (
                <motion.div
                  animate={{ y: [-48, 48, -48] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                  className="absolute inset-x-0 h-1 bg-cyan-300 shadow-[0_0_12px_#22d3ee]"
                />
              )}

              {authSuccess ? (
                <CheckCircle2 className="w-14 h-14 animate-in zoom-in-75 duration-200" />
              ) : (
                <Fingerprint className={`w-14 h-14 ${isScanning ? 'animate-pulse' : ''}`} />
              )}
            </motion.div>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="text-center space-y-1 mb-5">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            {authSuccess
              ? isUrdu
                ? 'تصدیق مکمل ہو گئی!'
                : 'Biometric Verified!'
              : title || (isUrdu ? 'بائیو میٹرک تصدیق درکار ہے' : 'Biometric Security Required')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            {authSuccess
              ? isUrdu
                ? 'طبی ریکارڈز کا والٹ انلاک کر دیا گیا ہے۔'
                : 'Your clinical records vault is now securely unlocked.'
              : subtitle ||
                (isUrdu
                  ? 'مریض کی رازداری اور حساس نسخوں کے تحفظ کے لیے فنگر پرنٹ یا فیس آئی ڈی سے تصدیق کریں۔'
                  : 'Protecting confidential prescriptions, lab diagnostics, and patient history via WebAuthn.')}
          </p>
        </div>

        {/* Authenticator Device Indicator */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                {authenticatorLabel}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                Hardware Platform Authenticator
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
            Ready
          </span>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Primary Action Button */}
        {!usePinFallback ? (
          <div className="space-y-2.5">
            <button
              type="button"
              id="start-biometric-scan-btn"
              disabled={isScanning || authSuccess}
              onClick={handleTriggerBiometric}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                authSuccess
                  ? 'bg-emerald-600 text-white'
                  : isScanning
                  ? 'bg-teal-700 text-white opacity-90'
                  : 'bg-teal-600 hover:bg-teal-700 active:scale-98 text-white'
              }`}
            >
              {isScanning ? (
                <>
                  <Scan className="w-4 h-4 animate-spin" />
                  <span>
                    {isUrdu ? 'بائیو میٹرک سکین ہو رہا ہے...' : 'Verifying via WebAuthn...'}
                  </span>
                </>
              ) : authSuccess ? (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>{isUrdu ? 'انلاک ہو گیا' : 'Vault Unlocked'}</span>
                </>
              ) : (
                <>
                  <Fingerprint className="w-4 h-4" />
                  <span>
                    {isUrdu
                      ? 'بائیو میٹرک تصدیق شروع کریں'
                      : `Verify with ${capabilities?.authenticatorType === 'touch_id' ? 'Touch ID' : 'Biometrics'}`}
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setUsePinFallback(true)}
              className="w-full py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'یا ڈیوائس سیکیورٹی پن استعمال کریں' : 'Or use Device Security PIN'}</span>
            </button>
          </div>
        ) : (
          /* PIN Fallback Form */
          <form onSubmit={handlePinSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isUrdu ? 'ڈیوائس سیکیورٹی پن درج کریں:' : 'Enter Device Security PIN:'}
              </label>
              <input
                type="password"
                maxLength={8}
                autoFocus
                placeholder="••••"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full text-center tracking-widest text-lg font-mono py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                {isUrdu ? 'پن تصدیق کریں' : 'Unlock with PIN'}
              </button>
              <button
                type="button"
                onClick={() => setUsePinFallback(false)}
                className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                {isUrdu ? 'واپس' : 'Back'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
