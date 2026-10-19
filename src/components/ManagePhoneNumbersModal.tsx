import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Phone,
  Plus,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Send,
  RefreshCw,
  LogOut,
  Bell,
  Lock,
} from 'lucide-react';
import { UserAccount, SupportedLanguage } from '../types';
import {
  maskMobile,
  maskCnic,
  sendServerOtp,
  verifyServerOtp,
  addMobileToServer,
  removeMobileFromServer,
  blockMobileOnServer,
} from '../services/accountAuthService';
import { voiceManager } from '../services/voice';

interface ManagePhoneNumbersModalProps {
  isOpen: boolean;
  currentUser: UserAccount;
  currentLanguage: SupportedLanguage;
  onClose: () => void;
  onRequestSignOut: () => void;
  onUpdateUser: (updated: UserAccount) => void;
}

export const ManagePhoneNumbersModal: React.FC<ManagePhoneNumbersModalProps> = ({
  isOpen,
  currentUser,
  currentLanguage,
  onClose,
  onRequestSignOut,
  onUpdateUser,
}) => {
  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';

  const [registeredList, setRegisteredList] = useState<string[]>(() => {
    return currentUser.registeredMobiles || (currentUser.phone ? [currentUser.phone] : []);
  });

  const [alerts, setAlerts] = useState<any[]>([]);

  // Add number workflow state
  const [isAddingNumber, setIsAddingNumber] = useState(false);
  const [newNumberInput, setNewNumberInput] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Remove number workflow state
  const [removingNumber, setRemovingNumber] = useState<string | null>(null);
  const [approvalTargetPhone, setApprovalTargetPhone] = useState<string>('');
  const [removalOtpSent, setRemovalOtpSent] = useState(false);
  const [removalOtpInput, setRemovalOtpInput] = useState('');
  const [removalDemoCode, setRemovalDemoCode] = useState<string | null>(null);

  // Sync with server on open
  useEffect(() => {
    if (!isOpen) return;
    if (currentUser.cnic) {
      const cleanDigits = currentUser.cnic.replace(/\D/g, '');
      fetch(`/api/auth/account/${cleanDigits}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.maskedMobiles)) {
            setRegisteredList(data.maskedMobiles);
            setAlerts(data.alerts || []);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, currentUser.cnic]);

  if (!isOpen) return null;

  const handleSendAddOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (registeredList.length >= 5) {
      setErrorMessage(
        isUrdu
          ? 'اس شناختی کارڈ پر پہلے سے 5 نمبرز رجسٹرڈ ہیں۔ نیا نمبر شامل کرنے کے لیے پہلے ایک نمبر حذف کریں۔'
          : isRoman
          ? 'Is CNIC par pehle se 5 numbers registered hain. Naya number add karne ke liye pehle ek purana number hatayein.'
          : 'Already 5 mobile numbers registered on this CNIC. Remove one to add a new number.'
      );
      return;
    }

    const clean = newNumberInput.replace(/\D/g, '');
    if (clean.length < 10) {
      setErrorMessage(
        isUrdu
          ? 'درست پاکستانی موبائل نمبر درج کریں (مثلاً 03001234567)'
          : 'Please enter a valid Pakistani mobile number (03XX-XXXXXXX)'
      );
      return;
    }

    setIsLoading(true);
    const res = await sendServerOtp(clean, 'backup_number', currentUser.cnic);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to send OTP');
      return;
    }

    setIsOtpSent(true);
    if (res.demoOtpCode) setDemoCode(res.demoOtpCode);
    setSuccessMessage(
      isUrdu
        ? 'تصدیقی کوڈ نئے موبائل نمبر پر بھیج دیا گیا ہے۔'
        : 'Verification code sent to the new mobile number.'
    );
  };

  const handleVerifyAddOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const clean = newNumberInput.replace(/\D/g, '');
    const verifyRes = await verifyServerOtp(clean, otpInput);
    if (!verifyRes.success) {
      setIsLoading(false);
      setErrorMessage(verifyRes.error || 'Incorrect OTP code.');
      return;
    }

    if (currentUser.cnic) {
      const addRes = await addMobileToServer(currentUser.cnic, clean);
      setIsLoading(false);
      if (!addRes.success) {
        setErrorMessage(addRes.error || 'Failed to save number on server.');
        return;
      }
      if (addRes.registeredMobiles) {
        setRegisteredList(addRes.registeredMobiles);
        onUpdateUser({
          ...currentUser,
          registeredMobiles: addRes.registeredMobiles,
        });
      }
    } else {
      setIsLoading(false);
      const updated = [...registeredList, maskMobile(clean)];
      setRegisteredList(updated);
      onUpdateUser({
        ...currentUser,
        registeredMobiles: updated,
      });
    }

    setIsAddingNumber(false);
    setIsOtpSent(false);
    setOtpInput('');
    setNewNumberInput('');
    setDemoCode(null);
    setSuccessMessage(
      isUrdu
        ? 'نیا نمبر کامیابی سے رجسٹر ہو گیا ہے اور باقی نمبرز کو اطلاع بھیج دی گئی ہے۔'
        : 'New number successfully added. Security notification sent to your other numbers.'
    );
  };

  const handleStartRemove = async (phoneToDel: string) => {
    if (registeredList.length <= 1) {
      setErrorMessage(
        isUrdu
          ? 'اکاؤنٹ میں کم از کم ایک موبائل نمبر ہونا لازمی ہے۔'
          : 'At least one mobile number must remain registered.'
      );
      return;
    }

    setRemovingNumber(phoneToDel);
    // Find another phone to send approval OTP
    const remaining = registeredList.filter((p) => p !== phoneToDel);
    const target = remaining[0] || '';
    setApprovalTargetPhone(target);

    setIsLoading(true);
    const res = await sendServerOtp(target, 'remove_number', currentUser.cnic);
    setIsLoading(false);

    if (res.success) {
      setRemovalOtpSent(true);
      if (res.demoOtpCode) setRemovalDemoCode(res.demoOtpCode);
    } else {
      setErrorMessage(res.error || 'Failed to send removal approval OTP.');
    }
  };

  const handleConfirmRemove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!removingNumber || !currentUser.cnic) return;

    setIsLoading(true);
    const verifyRes = await verifyServerOtp(approvalTargetPhone, removalOtpInput);
    if (!verifyRes.success) {
      setIsLoading(false);
      setErrorMessage(verifyRes.error || 'Incorrect approval OTP.');
      return;
    }

    const res = await removeMobileFromServer(currentUser.cnic, removingNumber);
    setIsLoading(false);

    if (res.success && res.registeredMobiles) {
      setRegisteredList(res.registeredMobiles);
      onUpdateUser({
        ...currentUser,
        registeredMobiles: res.registeredMobiles,
      });
      setRemovingNumber(null);
      setRemovalOtpSent(false);
      setRemovalOtpInput('');
      setRemovalDemoCode(null);
      setSuccessMessage(
        isUrdu ? 'نمبر کامیابی سے حذف کر دیا گیا ہے۔' : 'Number removed successfully.'
      );
    } else {
      setErrorMessage(res.error || 'Failed to remove number.');
    }
  };

  const handleBlockNumber = async (numToBlock: string) => {
    if (!currentUser.cnic) return;
    setIsLoading(true);
    const res = await blockMobileOnServer(currentUser.cnic, numToBlock);
    setIsLoading(false);
    if (res.success && res.registeredMobiles) {
      setRegisteredList(res.registeredMobiles);
      onUpdateUser({
        ...currentUser,
        registeredMobiles: res.registeredMobiles,
      });
      setAlerts((prev) => prev.filter((a) => a.addedNumber !== numToBlock));
      setSuccessMessage(
        isUrdu
          ? 'مشکوک نمبر بلاک کر دیا گیا ہے اور اس کا سیشن ختم کر دیا گیا ہے۔'
          : 'Suspicious number blocked and its session terminated.'
      );
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className={`bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto ${
            isUrdu ? 'font-urdu' : ''
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg">
                  {isUrdu ? 'اکاؤنٹ اور موبائل نمبرز' : 'Account & Registered Numbers'}
                </h3>
                <p className="text-xs text-slate-500">
                  {currentUser.cnic
                    ? `CNIC: ${maskCnic(currentUser.cnic)} • Max 5 SIMs`
                    : 'Phone-Verified Account'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Alerts Section (if new numbers were added) */}
          {alerts.length > 0 && (
            <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold">
                <Bell className="w-4 h-4 text-amber-600 animate-bounce" />
                <span>{isUrdu ? 'سیکیورٹی الرٹ' : 'Security Alert'}</span>
              </div>
              {alerts.map((al) => (
                <div key={al.id} className="text-xs flex items-center justify-between gap-2 pt-1 border-t border-amber-200/60">
                  <div>
                    <p className="font-semibold">{al.message}</p>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400">
                      Added: {al.addedNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleBlockNumber(al.addedNumber)}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shrink-0 cursor-pointer shadow-xs"
                  >
                    {isUrdu ? 'یہ میں نہیں ہوں / بلاک کریں' : 'Block Number'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Gentle Reminder to add backup number if only 1 registered */}
          {registeredList.length === 1 && !isAddingNumber && (
            <div className="mt-4 p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-sm mb-1">
                  {isUrdu
                    ? 'بیک اپ نمبر شامل کرنے کی تجویز'
                    : isRoman
                    ? 'Backup Number Add Karne Ki Tajweez'
                    : 'Recommended: Add a Backup Number'}
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  {isUrdu
                    ? 'آپ نے صرف ایک نمبر رجسٹر کیا ہے۔ دوسرا نمبر شامل کریں تاکہ پہلا سم بند ہونے کی صورت میں بھی آپ کا اکاؤنٹ آسانی سے کھل سکے۔'
                    : isRoman
                    ? 'Aap ne sirf ek number register kiya hai. Doosra number add karein taake account hamesha khula rahe.'
                    : 'You have only one registered number. Add a second number so you can always recover your health records if your primary SIM is lost.'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddingNumber(true)}
                  className="mt-2.5 px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'ابھی دوسرا نمبر شامل کریں' : 'Add Backup Number'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Feedback Toasts */}
          {errorMessage && (
            <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Registered Numbers List */}
          <div className="mt-5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{isUrdu ? 'رجسٹرڈ موبائل نمبرز' : 'Registered Numbers'} ({registeredList.length}/5)</span>
              {registeredList.length < 5 && !isAddingNumber && (
                <button
                  type="button"
                  onClick={() => setIsAddingNumber(true)}
                  className="text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer font-extrabold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'نیا نمبر شامل کریں' : 'Add Number'}</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {registeredList.map((num, idx) => (
                <div
                  key={num}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                        {num}
                      </span>
                      {idx === 0 && (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 text-[10px] font-bold">
                          {isUrdu ? 'بنیادی نمبر' : 'Primary'}
                        </span>
                      )}
                    </div>
                  </div>

                  {registeredList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleStartRemove(num)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Remove number (requires approval OTP)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form: Add Number */}
          {isAddingNumber && (
            <div className="mt-4 p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-300 dark:border-teal-700 space-y-3">
              <h4 className="text-xs font-extrabold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-teal-600" />
                <span>{isUrdu ? 'نیا موبائل نمبر شامل کریں' : 'Add New Mobile Number'}</span>
              </h4>

              {!isOtpSent ? (
                <form onSubmit={handleSendAddOtp} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isUrdu ? 'نیا موبائل نمبر درج کریں *' : 'Enter New Mobile Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={newNumberInput}
                      onChange={(e) => setNewNumberInput(e.target.value)}
                      placeholder="0300-1234567"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 font-mono text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>{isUrdu ? 'او ٹی پی (OTP) بھیجیں' : 'Send Verification OTP'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNumber(false);
                        setNewNumberInput('');
                      }}
                      className="py-2.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyAddOtp} className="space-y-3">
                  {demoCode && (
                    <div className="p-2.5 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-900 dark:text-teal-100 text-[11px] font-mono flex items-center justify-between">
                      <span>SMS Demo Code: <strong>{demoCode}</strong></span>
                      <button
                        type="button"
                        onClick={() => setOtpInput(demoCode)}
                        className="underline font-bold"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isUrdu ? 'نئے نمبر پر موصول 6 ہندسوں کا کوڈ درج کریں *' : 'Enter 6-digit Code sent to new number *'}
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="XXXXXX"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-teal-500 font-mono text-center text-lg font-bold tracking-widest"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isLoading || otpInput.length < 6}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>{isUrdu ? 'تصدیق کریں اور محفوظ کریں' : 'Verify & Add to Account'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOtpSent(false)}
                      className="py-2.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold"
                    >
                      Back
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Form: Removal Approval OTP */}
          {removingNumber && (
            <div className="mt-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700 space-y-3">
              <h4 className="text-xs font-extrabold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>{isUrdu ? 'نمبر حذف کرنے کی منظوری' : 'Removal Approval OTP Required'}</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {isUrdu
                  ? `حفاظت کے پیش نظر، منظوری کا کوڈ آپ کے دوسرے نمبر (${approvalTargetPhone}) پر بھیجا گیا ہے۔`
                  : `For security, an approval code was sent to your other registered number (${approvalTargetPhone}).`}
              </p>

              {removalDemoCode && (
                <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-900 dark:text-rose-100 text-[11px] font-mono flex items-center justify-between">
                  <span>Approval Code: <strong>{removalDemoCode}</strong></span>
                  <button
                    type="button"
                    onClick={() => setRemovalOtpInput(removalDemoCode)}
                    className="underline font-bold"
                  >
                    Auto-fill
                  </button>
                </div>
              )}

              <form onSubmit={handleConfirmRemove} className="space-y-3">
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={removalOtpInput}
                  onChange={(e) => setRemovalOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="XXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-rose-500 font-mono text-center text-lg font-bold tracking-widest"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isLoading || removalOtpInput.length < 6}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    <span>{isUrdu ? 'حذف کرنے کی تصدیق کریں' : 'Confirm Removal'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemovingNumber(null)}
                    className="py-2.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Footer: Prominent Sign Out Button */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {isUrdu ? 'محفوظ کلاؤڈ سیشن' : 'Encrypted Session Active'}
            </span>

            <button
              type="button"
              onClick={() => {
                onClose();
                onRequestSignOut();
              }}
              className="py-2.5 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 font-extrabold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
              <span>{isUrdu ? 'اکاؤنٹ سے سائن آؤٹ کریں' : isRoman ? 'Account Se Sign Out Karein' : 'Sign Out of Account'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
