import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  ShieldCheck,
  Download,
  Printer,
  Copy,
  RefreshCw,
  Eye,
  Check,
  AlertTriangle,
  Volume2,
  VolumeX,
  ExternalLink,
  User,
  Heart,
  Pill,
  Activity,
  FileText,
  Lock,
} from 'lucide-react';
import {
  PatientProfile,
  SupportedLanguage,
  HealthCardShareConfig,
  SharedHealthCardData,
  UnifiedHealthRecord,
} from '../types';
import { voiceManager } from '../services/voice';
import {
  buildSharedHealthCardData,
  generateHealthCardQrDataUrl,
  getHealthCardShareableUrl,
  invalidateHealthCardToken,
} from '../services/healthCardService';

interface HealthQrCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: SupportedLanguage;
  selectedProfile: PatientProfile;
  records?: UnifiedHealthRecord[];
  currentMedicines?: Array<{ name: string; dosage: string; frequency?: string }>;
  vitals?: { bloodPressure?: string; bloodSugar?: string; heartRate?: string };
  onPreviewViewer?: (data: SharedHealthCardData) => void;
}

export const HealthQrCardModal: React.FC<HealthQrCardModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  selectedProfile,
  records = [],
  currentMedicines = [],
  vitals,
  onPreviewViewer,
}) => {
  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';

  // Config toggles
  const [config, setConfig] = useState<HealthCardShareConfig>({
    includeBasicInfo: true,
    includeEmergencyContacts: true,
    includeAllergies: true,
    includeCurrentMedicines: true,
    includeChronicConditions: true,
    includeRecentVitals: true,
    includeDoctorDiagnoses: true,
  });

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [cardPayload, setCardPayload] = useState<SharedHealthCardData | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPlayingPrivacyAudio, setIsPlayingPrivacyAudio] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Spoken privacy warning
  const privacyWarningSpeech = isUrdu
    ? 'یہ کیو آر کوڈ آپ کی دوائیاں، الرجی، اور حالیہ وائٹلز دکھائے گا۔ اسے صرف ڈاکٹر یا ہسپتال کے طبی عملے کو دکھائیں۔ اس میں شناختی کارڈ نمبر شامل نہیں ہے۔'
    : isRoman
    ? 'Yeh QR code aapki dawaiyan, allergies, aur recent vitals dikhayega. Ise sirf doctor ya hospital ko dikhayein.'
    : 'This QR code securely displays your active medicines, allergies, and recent vitals. Show it only to doctors or emergency hospital staff. No CNIC is shared.';

  // Regenerate QR payload and data URL whenever config changes
  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;
    setIsGenerating(true);

    async function generate() {
      try {
        const payload = buildSharedHealthCardData(
          selectedProfile,
          config,
          records,
          currentMedicines,
          vitals,
          currentLanguage
        );
        const url = await generateHealthCardQrDataUrl(payload);
        if (!isCancelled) {
          setCardPayload(payload);
          setQrDataUrl(url);
          setIsGenerating(false);
        }
      } catch (e) {
        console.error('Failed to generate health card QR', e);
        if (!isCancelled) setIsGenerating(false);
      }
    }

    generate();
    return () => {
      isCancelled = true;
    };
  }, [isOpen, selectedProfile, config, records, currentMedicines, vitals]);

  // Audio warning trigger
  const handlePlayPrivacyWarning = () => {
    if (isPlayingPrivacyAudio) {
      voiceManager.stop();
      setIsPlayingPrivacyAudio(false);
      return;
    }
    setIsPlayingPrivacyAudio(true);
    voiceManager.speak(privacyWarningSpeech, currentLanguage);
    setTimeout(() => setIsPlayingPrivacyAudio(false), 7000);
  };

  // Invalidate old token and regenerate fresh one
  const handleRegenerateToken = async () => {
    invalidateHealthCardToken(selectedProfile.id);
    setIsGenerating(true);
    const newPayload = buildSharedHealthCardData(
      selectedProfile,
      config,
      records,
      currentMedicines,
      vitals
    );
    const newUrl = await generateHealthCardQrDataUrl(newPayload);
    setCardPayload(newPayload);
    setQrDataUrl(newUrl);
    setIsGenerating(false);

    const msg = isUrdu
      ? 'پرانا کیو آر کوڈ منسوخ کر کے نیا محفوظ کوڈ جاری کر دیا گیا۔'
      : isRoman
      ? 'Purana QR code invalidate ho gaya hai, naya QR card generate ho gaya.'
      : 'Previous QR code invalidated. Fresh secure card generated.';

    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  // Copy shareable link
  const handleCopyLink = () => {
    if (!cardPayload) return;
    const url = getHealthCardShareableUrl(cardPayload);
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Download QR Code Image as PNG
  const handleDownloadQrImage = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `HealthCard_QR_${selectedProfile.name.replace(/\s+/g, '_')}.png`;
    link.click();
  };

  // Print Wallet-Sized Card
  const handlePrintWalletCard = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div
      id="health-qr-card-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="health-qr-card-modal"
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-teal-200 dark:border-teal-900 p-5 sm:p-7 text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[94vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {isUrdu ? 'میرا ہیلتھ کیو آر کارڈ' : isRoman ? 'Mera Health QR Card' : 'My Health QR Card'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                  Doctor Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isUrdu
                  ? 'ڈاکٹر یا ہسپتال کو بغیر ایپ لاگ ان کے فوری طبی ریکارڈ شیئر کریں'
                  : 'Share full medical record with any real-life doctor or hospital just by scanning'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice toast */}
        {notice && (
          <div className="mt-2.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs text-center font-bold animate-in fade-in">
            {notice}
          </div>
        )}

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 min-h-0 space-y-4 pr-1 mt-3">
          {/* Main Display: 2 Columns (Left: QR Card, Right: Privacy & Toggles) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* Left (5 cols): The Physical QR Code Card */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="w-full rounded-2xl bg-gradient-to-b from-teal-900 via-slate-900 to-teal-950 text-white p-4 shadow-xl border-2 border-teal-500/60 text-center relative overflow-hidden">
                {/* Islamic Crescent & Emergency Star Emblem */}
                <div className="flex items-center justify-between border-b border-teal-700/60 pb-2 mb-3">
                  <div className="text-left">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                      Emergency Health Card
                    </span>
                    <h3 className="font-extrabold text-xs text-white truncate max-w-[130px]">
                      {selectedProfile.name}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold bg-teal-800/80 px-2 py-0.5 rounded-md text-teal-200">
                    {selectedProfile.bloodGroup || 'B+'}
                  </span>
                </div>

                {/* QR Code Container */}
                <div className="p-3 bg-white rounded-xl shadow-inner inline-block my-1 border border-slate-200">
                  {isGenerating ? (
                    <div className="w-44 h-44 flex items-center justify-center text-teal-700">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    </div>
                  ) : qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Health Card QR Code"
                      className="w-44 h-44 object-contain mx-auto"
                    />
                  ) : (
                    <div className="w-44 h-44 flex items-center justify-center text-rose-500 text-xs">
                      Failed to render QR
                    </div>
                  )}
                </div>

                <div className="mt-2 space-y-0.5">
                  <p className="text-[11px] font-bold text-teal-200">
                    {isUrdu ? 'کیمرے سے اسکین کریں' : 'Scan with Any Phone Camera'}
                  </p>
                  <p className="text-[9px] text-teal-300/70">
                    No login or app required on doctor's device
                  </p>
                </div>

                {/* Security Tag */}
                <div className="mt-3 pt-2 border-t border-teal-800/60 flex items-center justify-between text-[10px] text-teal-300/80">
                  <span>Token: {cardPayload?.token.slice(0, 10)}...</span>
                  <span className="font-bold text-emerald-400">✓ No CNIC</span>
                </div>
              </div>

              {/* Action Buttons Below Card */}
              <div className="w-full grid grid-cols-2 gap-2 mt-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={handleDownloadQrImage}
                  className="py-2.5 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>{isUrdu ? 'تصویر ڈاؤنلوڈ' : 'Save Image'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintWalletCard}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isUrdu ? 'پرنٹ کارڈ' : 'Print Wallet'}</span>
                </button>
              </div>
            </div>

            {/* Right (7 cols): Privacy Explanation & Customization Toggles */}
            <div className="md:col-span-7 space-y-3.5">
              {/* Spoken & Written Privacy Banner */}
              <div className="p-3.5 rounded-2xl bg-teal-50/80 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200 font-black text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{isUrdu ? 'پرائیویسی اور سیکیورٹی کی یقین دہانی' : 'Privacy & Security Guarantee'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handlePlayPrivacyWarning}
                    className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                      isPlayingPrivacyAudio
                        ? 'bg-teal-600 text-white border-teal-500 animate-pulse'
                        : 'bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 border-teal-200'
                    }`}
                    title="Listen to privacy explanation"
                  >
                    {isPlayingPrivacyAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <p className="text-[11px] text-teal-950 dark:text-teal-100 leading-snug">
                  {privacyWarningSpeech}
                </p>

                <div className="flex items-center gap-2 pt-1 text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'صرف پڑھنے کی اجازت (Read-Only) • کوئی ڈیٹا تبدیل نہیں ہو سکتا' : 'Read-only access for medical staff • Cannot be edited'}</span>
                </div>
              </div>

              {/* Patient Control: What to Include / Exclude Checkboxes */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-black text-slate-900 dark:text-white block">
                  {isUrdu ? 'آپ کے کنٹرول میں ہے کہ کیا دکھانا ہے:' : 'Customize Shared Medical Details:'}
                </span>

                <div className="space-y-1.5 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeBasicInfo}
                      onChange={(e) => setConfig({ ...config, includeBasicInfo: e.target.checked })}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>{isUrdu ? 'بنیادی معلومات (نام، عمر، بلڈ گروپ)' : 'Basic Info (Name, Age, Blood Group)'}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeAllergies}
                      onChange={(e) => setConfig({ ...config, includeAllergies: e.target.checked })}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-rose-600 dark:text-rose-400 font-bold">
                      {isUrdu ? 'الرجیز اور وارننگز (Allergies & Drug Reactions)' : 'Known Drug Allergies & Warnings'}
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeCurrentMedicines}
                      onChange={(e) => setConfig({ ...config, includeCurrentMedicines: e.target.checked })}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>{isUrdu ? 'موجودہ ادویات (Current Prescriptions)' : 'Current Medications & Dosing'}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeRecentVitals}
                      onChange={(e) => setConfig({ ...config, includeRecentVitals: e.target.checked })}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>{isUrdu ? 'حالیہ وائٹلز (شوگر، بی پی، نبض)' : 'Recent Vitals (Sugar, BP, Pulse)'}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeChronicConditions}
                      onChange={(e) => setConfig({ ...config, includeChronicConditions: e.target.checked })}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>{isUrdu ? 'دائمی امراض (ذیابیطس، بلڈ پریشر وغیرہ)' : 'Chronic Conditions (Diabetes, etc.)'}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeDoctorDiagnoses}
                      onChange={(e) => setConfig({ ...config, includeDoctorDiagnoses: e.target.checked })}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>{isUrdu ? 'ڈاکٹر کے تصدیق شدہ نسخہ جات' : 'Doctor-Approved Prescriptions & Notes'}</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons: Preview Doctor View, Copy Link, Invalidate Token */}
              <div className="space-y-2 pt-1">
                {onPreviewViewer && cardPayload && (
                  <button
                    type="button"
                    onClick={() => onPreviewViewer(cardPayload)}
                    className="w-full py-2.5 px-3 rounded-xl bg-teal-50 dark:bg-teal-950/80 hover:bg-teal-100 text-teal-900 dark:text-teal-200 border border-teal-300 dark:border-teal-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Eye className="w-4 h-4 text-teal-600" />
                    <span>{isUrdu ? 'دیکھیں ڈاکٹر کو کیا نظر آئے گا (Preview Doctor View)' : 'Preview What Doctor Sees (Read-Only Page)'}</span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedLink ? (isUrdu ? 'لنک کاپی ہو گیا!' : 'Link Copied!') : (isUrdu ? 'لنک کاپی کریں' : 'Copy Direct Link')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRegenerateToken}
                    className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Revokes previous QR and issues a new one"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'پرانا کیو آر منسوخ کریں' : 'Revoke & Invalidate'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
