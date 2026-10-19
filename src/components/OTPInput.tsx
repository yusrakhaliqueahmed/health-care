import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  Zap,
  Volume2,
  VolumeX,
  RotateCw,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { SupportedLanguage } from '../types';
import { convertUrduArabicDigits } from '../services/cnicLookupService';

export interface SimulatedSmsInfo {
  sender?: string;
  code: string;
  phoneNumber?: string;
  deliveryMessage?: string;
}

export interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  hasError?: boolean;
  id?: string;
  language?: SupportedLanguage;
  simulatedSms?: SimulatedSmsInfo | null;
  onResend?: () => void;
  resendCooldown?: number;
  onPlayVoiceNote?: () => void;
  isVoicePlaying?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  autoFocus = true,
  hasError = false,
  id = 'otp-input',
  language = 'ur',
  simulatedSms = null,
  onResend,
  resendCooldown = 0,
  onPlayVoiceNote,
  isVoicePlaying = false,
}) => {
  const isUrdu = language === 'ur';
  const isRoman = language === 'roman';
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [copied, setCopied] = useState(false);

  // Normalize raw digits from value
  const cleanDigits = convertUrduArabicDigits(value || '').replace(/\D/g, '').slice(0, length);
  const digits = cleanDigits.split('');

  // Auto-focus first input on mount if requested
  useEffect(() => {
    if (autoFocus && inputsRef.current[0] && !disabled) {
      inputsRef.current[0]?.focus();
    }
  }, [autoFocus, disabled]);

  // Handle single digit change
  const handleDigitChange = (index: number, rawInput: string) => {
    if (disabled) return;

    // Convert any Arabic or Urdu numeral to standard digit
    const converted = convertUrduArabicDigits(rawInput);
    const sanitized = converted.replace(/\D/g, '');

    if (!sanitized) {
      // User cleared the box
      const newDigits = [...digits];
      newDigits[index] = '';
      const newCode = newDigits.join('');
      onChange(newCode);
      return;
    }

    // If user pasted or entered multiple digits in this single box
    if (sanitized.length > 1) {
      handlePaste(sanitized);
      return;
    }

    const digit = sanitized.charAt(sanitized.length - 1);
    const newDigits = [];
    for (let i = 0; i < length; i++) {
      if (i === index) {
        newDigits.push(digit);
      } else {
        newDigits.push(digits[i] || '');
      }
    }

    const newCode = newDigits.join('').slice(0, length);
    onChange(newCode);

    // Auto-advance to next input
    if (index < length - 1 && digit) {
      inputsRef.current[index + 1]?.focus();
    }

    // Check completion
    if (newCode.length === length && onComplete) {
      onComplete(newCode);
    }
  };

  // Handle Key Down (Backspace, Arrow Navigation)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move backward and clear previous box
        e.preventDefault();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  // Handle Paste
  const handlePaste = (pastedText: string) => {
    if (disabled) return;
    const clean = convertUrduArabicDigits(pastedText).replace(/\D/g, '').slice(0, length);
    if (!clean) return;

    onChange(clean);

    // Focus last filled index or next empty
    const targetIdx = Math.min(clean.length, length - 1);
    inputsRef.current[targetIdx]?.focus();

    if (clean.length === length && onComplete) {
      onComplete(clean);
    }
  };

  // Handle one-tap auto fill from simulated SMS
  const handleAutoFill = () => {
    if (!simulatedSms?.code) return;
    handlePaste(simulatedSms.code);
  };

  const handleCopyCode = () => {
    if (!simulatedSms?.code) return;
    navigator.clipboard?.writeText(simulatedSms.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id={id} className="space-y-4">
      {/* ========================================================================= */}
      {/* SIMULATED SMS NOTIFICATION PUSH BANNER (Real WhatsApp / Telecom SMS Feel) */}
      {/* ========================================================================= */}
      {simulatedSms && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl p-4 bg-gradient-to-r from-cyan-950/80 via-slate-900/90 to-violet-950/80 dark:bg-[rgba(12,18,48,0.85)] border border-cyan-400/40 dark:border-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.25)] relative overflow-hidden backdrop-blur-md"
        >
          {/* Neon top accent glow */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-violet-400" />

          {/* Header of Simulated SMS */}
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-cyan-500/20 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-300" />
              </div>
              <span className="font-extrabold text-cyan-200 tracking-wide">
                {simulatedSms.sender || 'Pakistan SMS Gateway (8484)'}
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                SMS
              </span>
            </div>
            <span className="text-[11px] text-cyan-300/70 font-mono">
              {isUrdu ? 'ابھی موصول ہوا' : 'Just now'}
            </span>
          </div>

          {/* SMS Content Body */}
          <div className="space-y-2">
            <p className="text-xs text-slate-200 dark:text-cyan-100/90 leading-relaxed">
              {simulatedSms.deliveryMessage || (
                <>
                  {isUrdu
                    ? `اے آئی ہیلتھ کیئر تصدیقی کوڈ ہے: `
                    : `AI Health Care verification code for ${simulatedSms.phoneNumber || 'your mobile'}: `}
                  <strong className="font-mono text-cyan-300 text-sm tracking-widest px-1.5 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-400/30">
                    {simulatedSms.code}
                  </strong>
                  . {isUrdu ? 'یہ کوڈ کسی کے ساتھ شیئر نہ کریں۔' : 'Do not share this code with anyone.'}
                </>
              )}
            </p>

            {/* Actions: One-Tap Auto-fill & Copy */}
            <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleAutoFill}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 text-xs font-black hover:brightness-110 active:scale-95 shadow-[0_0_12px_rgba(34,211,238,0.4)] transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{isUrdu ? 'کوڈ خودکار درج کریں (Auto-fill)' : 'Auto-fill SMS Code'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-cyan-200 text-xs font-semibold border border-cyan-400/30 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isUrdu ? 'کاپی ہو گیا' : 'Copied!') : (isUrdu ? 'کاپی کریں' : 'Copy Code')}</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* 6-DIGIT OTP INPUT BOXES                                                   */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-black text-slate-700 dark:text-cyan-200 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>
              {isUrdu
                ? 'موبائل پر موصول 6 ہندسوں کا کوڈ درج کریں *'
                : isRoman
                ? 'Mobile par mosool 6 digits ka code darj karein *'
                : 'Enter 6-Digit SMS Verification Code *'}
            </span>
          </label>

          {/* Voice note instruction button - strictly explicit user button */}
          {onPlayVoiceNote && (
            <button
              type="button"
              onClick={onPlayVoiceNote}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isVoicePlaying
                  ? 'bg-cyan-400 text-slate-950 shadow-[0_0_10px_rgba(34,211,238,0.5)] animate-pulse'
                  : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-400/30'
              }`}
              title="Listen Audio Note"
            >
              {isVoicePlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isUrdu ? 'آواز میں سنیں' : isRoman ? 'Awaaz Sunein' : 'Audio Guide'}</span>
            </button>
          )}
        </div>

        {/* The 6 distinct input boxes */}
        <div
          className={`grid grid-cols-6 gap-2 sm:gap-3 ${
            hasError ? 'animate-shake' : ''
          }`}
          onPaste={(e) => {
            e.preventDefault();
            handlePaste(e.clipboardData.getData('text'));
          }}
        >
          {Array.from({ length }).map((_, index) => {
            const digit = digits[index] || '';
            const isFilled = Boolean(digit);
            const isNextToFill = index === digits.length;

            return (
              <input
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                disabled={disabled}
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={(e) => e.target.select()}
                className={`w-full aspect-square text-center font-mono text-2xl sm:text-3xl font-black rounded-2xl transition-all outline-hidden cursor-text
                  ${
                    // Dark Mode Glass + Glow vs Light Mode Crisp White
                    hasError
                      ? 'border-2 border-rose-500 bg-rose-50/20 dark:bg-rose-950/30 text-rose-600 dark:text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                      : isFilled
                      ? 'border-2 border-cyan-400 dark:border-cyan-400 bg-cyan-50/30 dark:bg-[rgba(12,18,48,0.8)] text-slate-900 dark:text-cyan-200 shadow-[0_0_14px_rgba(34,211,238,0.25)]'
                      : isNextToFill
                      ? 'border-2 border-cyan-400/70 dark:border-cyan-400/70 bg-white dark:bg-[rgba(12,18,48,0.6)] text-slate-900 dark:text-white shadow-[0_0_10px_rgba(34,211,238,0.15)] ring-2 ring-cyan-400/30'
                      : 'border-2 border-slate-300 dark:border-cyan-500/30 bg-white dark:bg-[rgba(12,18,48,0.5)] text-slate-900 dark:text-slate-300'
                  }
                  focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 focus:shadow-[0_0_16px_rgba(34,211,238,0.35)]
                `}
                placeholder="•"
                aria-label={`Digit ${index + 1}`}
              />
            );
          })}
        </div>

        {/* Helper bottom row: character counter & resend */}
        <div className="flex items-center justify-between text-xs pt-2 text-slate-500 dark:text-cyan-300/80">
          <span className="flex items-center gap-1 font-mono text-[11px]">
            {cleanDigits.length === length ? (
              <span className="text-emerald-500 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isUrdu ? 'کوڈ مکمل ہے' : 'Code Complete'}
              </span>
            ) : (
              <span>
                {cleanDigits.length} / {length} {isUrdu ? 'ہندسے' : 'digits'}
              </span>
            )}
          </span>

          {onResend && (
            <button
              type="button"
              disabled={resendCooldown > 0 || disabled}
              onClick={onResend}
              className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold disabled:opacity-40 disabled:no-underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCw className={`w-3 h-3 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
              <span>
                {resendCooldown > 0
                  ? isUrdu
                    ? `دوبارہ بھیجیں (${resendCooldown}s)`
                    : `Resend Code in ${resendCooldown}s`
                  : isUrdu
                  ? 'کوڈ دوبارہ بھیجیں'
                  : 'Resend Code'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
