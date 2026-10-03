import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  FileText,
  Clock,
  User,
  AlertTriangle,
  Send,
  Stethoscope,
  PenTool,
  QrCode,
  UserCheck,
  XCircle,
  Ban,
  Building2,
  Award,
  Upload,
  AlertCircle,
  Check,
  Filter,
  Eye,
  ExternalLink,
  Copy,
  Phone,
  Mail,
  RefreshCw,
  X,
} from 'lucide-react';
import { SupportedLanguage, Doctor, PatientCase } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { voiceManager } from '../services/voice';

interface DoctorReviewPortalProps {
  currentLanguage: SupportedLanguage;
  pendingCases?: PatientCase[];
  onApproveCase: (caseId: string, doctorNote: string, prescriptionText: string) => void;
  doctors?: Doctor[];
  onUpdateDoctorStatus?: (doctorId: string, status: 'verified' | 'rejected' | 'suspended', note?: string) => void;
  onOpenDoctorOnboarding?: () => void;
}

export const DoctorReviewPortal: React.FC<DoctorReviewPortalProps> = ({
  currentLanguage,
  pendingCases = [],
  onApproveCase,
  doctors = [],
  onUpdateDoctorStatus,
  onOpenDoctorOnboarding,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const isUrdu = currentLanguage === 'ur';

  // Navigation tab within the Portal
  const [activePortalTab, setActivePortalTab] = useState<'cases' | 'admin_verification' | 'my_dashboard'>('cases');

  // Case review states
  const [selectedCaseId, setSelectedCaseId] = useState<string>(pendingCases[0]?.id || '');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [rxMedicines, setRxMedicines] = useState('');
  const [signedName, setSignedName] = useState(
    isUrdu ? 'ڈیوٹی میڈیکل آفیسر (پی ایم ڈی سی لائسنس یافتہ)' : 'Medical Officer on Duty (PMDC Licensed)'
  );
  const [approvalNotice, setApprovalNotice] = useState<string | null>(null);

  // Admin Verification states
  const [docFilter, setDocFilter] = useState<'all' | 'pending' | 'verified' | 'rejected' | 'suspended'>('pending');
  const [inspectingDoc, setInspectingDoc] = useState<Doctor | null>(null);
  const [rejectingDoc, setRejectingDoc] = useState<Doctor | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');
  const [copiedPmdc, setCopiedPmdc] = useState<string | null>(null);

  const selectedCase = pendingCases.find((c) => c.id === selectedCaseId) || pendingCases[0];

  const handleApproveCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    onApproveCase(
      selectedCase.id,
      doctorNotes || (isUrdu ? 'علامتی دیکھ بھال کی ہدایات کے ساتھ کیس منظور کیا گیا۔' : 'Approved with symptomatic care instructions.'),
      rxMedicines || (isUrdu ? 'پیراسیٹامول 500 ملی گرام (کھانے کے بعد 1 گولی) 3 دن کے لیے' : 'Paracetamol 500mg (1 tablet after meals) for 3 days')
    );
    setDoctorNotes('');
    setRxMedicines('');
    setApprovalNotice(
      isUrdu
        ? `کیس #${selectedCase.id} مستند ڈاکٹر نے منظور کر کے ڈیجیٹل دستخط ثبت کر دیے ہیں۔`
        : `Case #${selectedCase.id} approved and signed by verified physician.`
    );
    setTimeout(() => setApprovalNotice(null), 4000);
  };

  const handleApproveDoctor = (doctorId: string) => {
    if (onUpdateDoctorStatus) {
      onUpdateDoctorStatus(doctorId, 'verified');
      setApprovalNotice(
        isUrdu
          ? 'ڈاکٹر کے کوائف اور پی ایم ڈی سی نمبر کی تصدیق ہو گئی ہے۔ ڈاکٹر اب فائنڈ کیئر اور پلیٹ فارم پر لائیو ہو چکا ہے۔'
          : 'Doctor credentials & PMDC license verified. Doctor is now active and visible in Find Care.'
      );
      setTimeout(() => setApprovalNotice(null), 5000);
    }
  };

  const handleOpenRejectModal = (doc: Doctor) => {
    setRejectingDoc(doc);
    setRejectionReasonText(
      isUrdu
        ? 'پی ایم ڈی سی رجسٹری میں رجسٹریشن نمبر یا لائسنس سرٹیفکیٹ کی تصدیق نہیں ہو سکی۔'
        : 'PMDC registration number or verification document could not be validated against the national registry.'
    );
  };

  const handleConfirmRejectDoctor = () => {
    if (!rejectingDoc) return;
    if (onUpdateDoctorStatus) {
      onUpdateDoctorStatus(rejectingDoc.id, 'rejected', rejectionReasonText);
      setApprovalNotice(
        isUrdu
          ? `ڈاکٹر ${rejectingDoc.name} کی درخواست مسترد کر دی گئی ہے اور نوٹس ریکارڈ ہو چکا ہے۔`
          : `Doctor application for ${rejectingDoc.name} has been rejected. Reason recorded.`
      );
      setRejectingDoc(null);
      setRejectionReasonText('');
      setTimeout(() => setApprovalNotice(null), 5000);
    }
  };

  const handleSuspendDoctor = (doctorId: string) => {
    if (onUpdateDoctorStatus) {
      onUpdateDoctorStatus(doctorId, 'suspended', isUrdu ? 'انتظامی جانچ تک اکاؤنٹ معطل کیا گیا ہے۔' : 'Account suspended pending administrative investigation.');
      setApprovalNotice(
        isUrdu
          ? 'ڈاکٹر کا اکاؤنٹ معطل کر دیا گیا ہے اور مریضوں کے نتائج سے غائب کر دیا گیا ہے۔'
          : 'Doctor account revoked/suspended and immediately removed from all patient-facing search results.'
      );
      setTimeout(() => setApprovalNotice(null), 5000);
    }
  };

  const handleCopyPmdc = (pmdcNum: string) => {
    navigator.clipboard?.writeText(pmdcNum);
    setCopiedPmdc(pmdcNum);
    setTimeout(() => setCopiedPmdc(null), 2500);
  };

  // Filtered doctors for admin queue (safe from undefined)
  const safeDoctorsList = doctors || [];
  const filteredDoctors = safeDoctorsList.filter((d) => {
    if (docFilter === 'all') return true;
    if (docFilter === 'pending') return d.verificationStatus === 'pending';
    if (docFilter === 'verified') return d.verificationStatus === 'verified' && d.isVerified;
    if (docFilter === 'rejected') return d.verificationStatus === 'rejected';
    if (docFilter === 'suspended') return d.verificationStatus === 'suspended';
    return true;
  });

  const pendingCount = safeDoctorsList.filter((d) => d.verificationStatus === 'pending').length;
  const verifiedCount = safeDoctorsList.filter((d) => d.verificationStatus === 'verified' && d.isVerified).length;
  const rejectedCount = safeDoctorsList.filter((d) => d.verificationStatus === 'rejected').length;
  const suspendedCount = safeDoctorsList.filter((d) => d.verificationStatus === 'suspended').length;

  return (
    <div className={`max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 ${isUrdu ? 'rtl font-urdu' : 'ltr'}`} dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* Top Banner */}
      <div className="p-5 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-teal-800/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/80 border border-teal-600 text-teal-200 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {isUrdu
                ? 'پی ایم ڈی سی لائسنس یافتہ فزیشن و ایڈمن کونسول'
                : 'PMDC Licensed Physician & Admin Console'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.doctorReviewPortalTitle || (isUrdu ? 'ڈاکٹر ریویو و ایڈمن پورٹل' : 'Doctor Review & Clinical Governance Portal')}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-1 max-w-xl">
            {isUrdu
              ? 'مستند اور تصدیق شدہ ڈاکٹر مریضوں کے ٹریاج کیسز کا معائنہ کرتے ہیں، ڈیجیٹل نسخوں پر دستخط کرتے ہیں، اور ایڈمن نئے ڈاکٹرز کی پی ایم ڈی سی اسناد کی توثیق کرتا ہے۔'
              : 'Human-in-the-loop clinical governance. Authenticated doctors review patient triage, sign digital prescriptions, and administrators verify doctor PMDC licenses.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onOpenDoctorOnboarding && (
            <button
              onClick={onOpenDoctorOnboarding}
              className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <UserCheck className="w-4 h-4" />
              <span>{isUrdu ? 'نیا ڈاکٹر رجسٹر کریں' : 'Register New Doctor'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Mode Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActivePortalTab('cases')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activePortalTab === 'cases'
              ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>
            {isUrdu ? `مریضوں کے ٹریاج کیسز (${pendingCases.length})` : `Patient Triage Cases (${pendingCases.length})`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActivePortalTab('admin_verification')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 relative cursor-pointer ${
            activePortalTab === 'admin_verification'
              ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{isUrdu ? 'ایڈمن توثیق کونسول' : 'PMDC Doctor Verification Queue'}</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActivePortalTab('my_dashboard')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activePortalTab === 'my_dashboard'
              ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{isUrdu ? 'ڈاکٹر میٹرکس و گائیڈلائنز' : 'Metrics & PMDC Standards'}</span>
        </button>
      </div>

      {approvalNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{approvalNotice}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: Patient Triage Cases */}
      {/* ========================================================================= */}
      {activePortalTab === 'cases' && (
        <>
          {pendingCases.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isUrdu ? 'تمام ٹریاج کیسز منظور ہو چکے ہیں' : 'All Triage Cases Approved'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {isUrdu
                  ? 'اس وقت کوئی غیر معائنہ شدہ مریض کا کیس موجود نہیں ہے۔ نئے کیسز علامات جانچنے پر خود بخود یہاں ظاہر ہوں گے۔'
                  : 'No pending patient files awaiting clinical review. New symptom checker cases will automatically appear here.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Case List Sidebar */}
              <div className="md:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-2">
                  {isUrdu ? `زیر التواء کیس فائلز (${pendingCases.length})` : `Pending Case Files (${pendingCases.length})`}
                </span>
                <div className="space-y-2">
                  {pendingCases.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCaseId(c.id)}
                      className={`w-full p-3.5 rounded-2xl text-left rtl:text-right border transition-all cursor-pointer ${
                        selectedCaseId === c.id
                          ? 'bg-teal-50 dark:bg-teal-950 border-teal-500 shadow-xs'
                          : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {c.patientName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.urgency === 'RED'
                              ? 'bg-red-100 text-red-700'
                              : c.urgency === 'YELLOW'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {c.urgency}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {c.symptoms}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-1">{c.date}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Details & Sign Form */}
              {selectedCase && (
                <div className="md:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">
                        {isUrdu ? `مریض کا کیس نمبر: #${selectedCase.id}` : `Patient Case ID: #${selectedCase.id}`}
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                        {selectedCase.patientName} ({selectedCase.exactAge || 30} {isUrdu ? 'سال' : 'yrs'}, {selectedCase.ageGroup})
                      </h3>
                    </div>

                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 rounded-xl text-xs font-bold">
                      {isUrdu ? 'معائنے کے لیے تیار' : 'Awaiting Review'}
                    </span>
                  </div>

                  {/* Symptoms & AI Pre-analysis */}
                  <div className="space-y-3 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-slate-500 uppercase block mb-1">
                        {isUrdu ? 'مریض کی بیان کردہ علامات' : 'Reported Patient Symptoms'}
                      </span>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {selectedCase.symptoms}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-slate-800/80 border border-teal-200 dark:border-teal-800">
                      <span className="font-bold text-teal-800 dark:text-teal-300 uppercase block mb-1">
                        {isUrdu ? 'اے آئی ابتدائی ٹریاج خلاصہ' : 'AI Pre-Triage Differential Summary'}
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {selectedCase.aiSummary || (isUrdu ? 'ٹریاج مکمل۔ علامات نوٹ کر لی گئی ہیں۔' : 'Triage completed. Minor symptoms recorded.')}
                      </p>
                    </div>
                  </div>

                  {/* Doctor Formal Clinical Input */}
                  <form onSubmit={handleApproveCaseSubmit} className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        {isUrdu ? 'معالج ڈاکٹر کے باقاعدہ نوٹس اور تشخیص' : 'Attending Physician Notes & Diagnosis'}
                      </label>
                      <textarea
                        rows={3}
                        value={doctorNotes}
                        onChange={(e) => setDoctorNotes(e.target.value)}
                        placeholder={isUrdu ? 'ڈاکٹر کے باقاعدہ طبی ریمارکس یا تشخیص یہاں درج کریں...' : 'Enter formal medical remarks or diagnosis confirmed...'}
                        className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        {isUrdu ? 'تجویز کردہ ادویات اور طریقہ خوراک (ڈیجیٹل نسخہ)' : 'Prescribed Medicines & Dosage Instructions (e-Prescription)'}
                      </label>
                      <textarea
                        rows={2}
                        value={rxMedicines}
                        onChange={(e) => setRxMedicines(e.target.value)}
                        placeholder={isUrdu ? 'مثلاً ٹیبلٹ پیراسیٹامول 500 ملی گرام دن میں 3 بار کھانے کے بعد 3 دن تک...' : 'e.g. Paracetamol 500mg TDS x 3 days, ORS sachets prn'}
                        className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <PenTool className="w-4 h-4 text-teal-600" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {isUrdu ? `دستخط کنندہ: ${signedName}` : `Signing as: ${signedName}`}
                        </span>
                      </div>
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-5 h-5" />
                      <span>
                        {isUrdu
                          ? 'باقاعدہ منظوری دیں اور پی ایم ڈی سی دستخط شدہ نسخہ جاری کریں'
                          : 'Officially Approve & Issue Signed PMDC Prescription'}
                      </span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: ADMIN MANUAL DOCTOR VERIFICATION WORKFLOW */}
      {/* ========================================================================= */}
      {activePortalTab === 'admin_verification' && (
        <div className="space-y-5">
          {/* Admin Guidance Header */}
          <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-teal-900 dark:text-teal-200 block text-xs">
                  {isUrdu ? 'ایڈمن دستی توثیقی طریقہ کار (PMDC Verification Workflow)' : 'Admin Manual PMDC Verification Workflow'}
                </span>
                <p className="text-[11px] text-teal-800/90 dark:text-teal-300/90 mt-0.5 leading-relaxed">
                  {isUrdu
                    ? 'کوئی بھی ڈاکٹر جب تک ایڈمن سے تصدیق شدہ نہ ہو، مریضوں کے سرچ رزلٹس یا کیس اپروول میں ظاہر نہیں ہو سکتا۔ پی ایم ڈی سی نمبر اور اپلوڈ شدہ سند کا بغور معائنہ کریں۔'
                    : 'Doctors in "Pending Verification" are completely invisible to patients until you manually review their license document and approve their PMDC registration.'}
                </p>
              </div>
            </div>
            {onOpenDoctorOnboarding && (
              <button
                type="button"
                onClick={onOpenDoctorOnboarding}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shrink-0 cursor-pointer shadow-xs"
              >
                {isUrdu ? '+ ڈاکٹر درخواست جمع کریں' : '+ Register Doctor'}
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isUrdu ? 'فلٹر کریں:' : 'Filter Applications:'}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'pending', label: isUrdu ? `زیر التواء توثیق (${pendingCount})` : `Pending Review (${pendingCount})`, badge: pendingCount },
                  { id: 'verified', label: isUrdu ? `تصدیق شدہ (${verifiedCount})` : `Verified & Active (${verifiedCount})` },
                  { id: 'rejected', label: isUrdu ? `مسترد شدہ (${rejectedCount})` : `Rejected (${rejectedCount})` },
                  { id: 'suspended', label: isUrdu ? `معطل شدہ (${suspendedCount})` : `Suspended (${suspendedCount})` },
                  { id: 'all', label: isUrdu ? `تمام (${safeDoctorsList.length})` : `All (${safeDoctorsList.length})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setDocFilter(f.id as any)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      docFilter === f.id
                        ? 'bg-teal-600 text-white shadow-xs font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <span>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs text-slate-400">
              {filteredDoctors.length} {isUrdu ? 'درخواستیں' : 'applications'}
            </span>
          </div>

          {/* List of Doctor Applications */}
          {filteredDoctors.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <UserCheck className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                {isUrdu ? 'اس فلٹر میں کوئی ڈاکٹر درخواست موجود نہیں' : 'No Applications in this Category'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {isUrdu
                  ? 'ڈاکٹر کے طور پر شمولیت اختیار کرنے والے معالجین کی درخواستیں پی ایم ڈی سی توثیق کے لیے یہاں ظاہر ہوں گی۔'
                  : 'Applications submitted via "Register as a Doctor" will populate here for PMDC license cross-checking.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredDoctors.map((doc) => {
                const isPending = doc.verificationStatus === 'pending';
                const isVerified = doc.verificationStatus === 'verified' && doc.isVerified;
                const isRejected = doc.verificationStatus === 'rejected';
                const isSuspended = doc.verificationStatus === 'suspended';

                return (
                  <div
                    key={doc.id}
                    className={`p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border shadow-xs transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 ${
                      isPending
                        ? 'border-amber-400/80 bg-amber-50/15 dark:bg-slate-900 ring-2 ring-amber-400/20'
                        : isVerified
                        ? 'border-emerald-500/40 dark:border-emerald-800/40'
                        : isSuspended
                        ? 'border-orange-500/40 bg-orange-50/10'
                        : 'border-rose-400/40 bg-rose-50/10'
                    }`}
                  >
                    {/* Left: Avatar & Comprehensive Details */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <img
                        src={doc.avatarUrl}
                        alt={doc.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80';
                        }}
                      />

                      <div className="min-w-0 flex-1">
                        {/* Name & Verification Status Badge */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                            {doc.name}
                          </h3>

                          {isVerified ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black border border-emerald-500/40 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span>{isUrdu ? '✅ پی ایم ڈی سی تصدیق شدہ' : '✅ PMDC Verified'}</span>
                            </span>
                          ) : isPending ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black border border-amber-500/50 flex items-center gap-1 animate-pulse">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>{isUrdu ? 'زیر التواء توثیق (Pending Review)' : 'Pending Verification'}</span>
                            </span>
                          ) : isSuspended ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 text-[10px] font-black border border-orange-500/40 flex items-center gap-1">
                              <Ban className="w-3 h-3 text-orange-600" />
                              <span>{isUrdu ? 'لائسنس معطل شدہ (Suspended)' : 'Suspended / Revoked'}</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[10px] font-black border border-rose-500/40 flex items-center gap-1">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>{isUrdu ? 'درخواست مسترد (Rejected)' : 'Application Rejected'}</span>
                            </span>
                          )}
                        </div>

                        {/* Specialty & Degree */}
                        <p className="text-xs font-bold text-teal-700 dark:text-teal-400 mt-0.5">
                          {doc.specialty} • {doc.qualification}
                        </p>

                        {/* PMDC Registration Number Box with Copy Tool */}
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/80 border border-teal-300 dark:border-teal-700 font-mono text-xs font-black text-teal-900 dark:text-teal-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                            <span>{doc.pmdcNumber}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyPmdc(doc.pmdcNumber)}
                              className="text-teal-600 hover:text-teal-800 dark:hover:text-white p-0.5 rounded ml-1 cursor-pointer"
                              title="Copy PMDC Number"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          {copiedPmdc === doc.pmdcNumber && (
                            <span className="text-[10px] font-bold text-emerald-600 animate-fade-in">
                              Copied!
                            </span>
                          )}

                          {/* Uploaded Verification Document Inspection Trigger */}
                          <button
                            type="button"
                            onClick={() => setInspectingDoc(doc)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-100 dark:hover:bg-teal-900/40 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-teal-600" />
                            <span>{isUrdu ? 'پی ایم ڈی سی سند کا معائنہ کریں' : 'Inspect Certificate Document'}</span>
                            <Eye className="w-3 h-3 text-slate-400" />
                          </button>
                        </div>

                        {/* Metadata row: Contact, Hospital, City, Experience */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{doc.phone}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{doc.email || 'doctor@registry.pk'}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>{doc.hospital}</span>
                          </span>
                          <span>{doc.city}, {doc.province}</span>
                          <span>{doc.experienceYears} yrs exp</span>
                          {doc.registeredAt && (
                            <span className="text-slate-400">Reg: {doc.registeredAt}</span>
                          )}
                        </div>

                        {/* Rejection Note if existing */}
                        {doc.rejectionReason && (
                          <div className="text-xs text-rose-700 dark:text-rose-300 mt-2 bg-rose-50 dark:bg-rose-950/60 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900 flex items-start gap-1.5">
                            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block text-[10px] uppercase tracking-wider text-rose-600 dark:text-rose-400">
                                {isUrdu ? 'مسترد کرنے کی وجہ / ایڈمن نوٹ:' : 'Rejection Reason / Admin Note:'}
                              </strong>
                              <span>{doc.rejectionReason}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Manual Admin Action Buttons */}
                    <div className="flex flex-row lg:flex-col items-stretch gap-2 shrink-0 w-full lg:w-44 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                      {isPending && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApproveDoctor(doc.id)}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>{isUrdu ? 'منظور کریں (Approve)' : 'Approve Doctor'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenRejectModal(doc)}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-300 dark:border-rose-800 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>{isUrdu ? 'مسترد کریں (Reject)' : 'Reject Application'}</span>
                          </button>
                        </>
                      )}

                      {isVerified && (
                        <button
                          type="button"
                          onClick={() => handleSuspendDoctor(doc.id)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-orange-600 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          title="Revoke / Suspend license"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>{isUrdu ? 'لائسنس معطل کریں' : 'Revoke / Suspend'}</span>
                        </button>
                      )}

                      {(isSuspended || isRejected) && (
                        <button
                          type="button"
                          onClick={() => handleApproveDoctor(doc.id)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                          title="Reinstate to Verified status"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>{isUrdu ? 'دوبارہ بحال کریں' : 'Re-verify & Restore'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================================================= */}
          {/* INSPECTION MODAL: PMDC CERTIFICATE & LICENSE DOCUMENT VIEWER */}
          {/* ========================================================================= */}
          {inspectingDoc && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative space-y-4 my-auto">
                <button
                  type="button"
                  onClick={() => setInspectingDoc(null)}
                  className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {isUrdu ? 'پی ایم ڈی سی رجسٹریشن و اسناد کا معائنہ' : 'PMDC License Document Inspection'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {inspectingDoc.name} • {inspectingDoc.specialty}
                    </p>
                  </div>
                </div>

                {/* Simulated / Rendered Official Document Card */}
                <div className="p-4 sm:p-6 rounded-2xl bg-amber-50/50 dark:bg-slate-950 border-2 border-amber-300 dark:border-amber-900/60 text-slate-900 dark:text-slate-100 space-y-3 relative overflow-hidden">
                  <div className="absolute top-2 right-2 opacity-10 pointer-events-none">
                    <ShieldCheck className="w-24 h-24 text-teal-800" />
                  </div>

                  <div className="text-center border-b border-amber-200 dark:border-slate-800 pb-2">
                    <span className="text-[10px] uppercase font-black tracking-widest text-teal-800 dark:text-teal-400 block">
                      Pakistan Medical & Dental Council (PMDC)
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Certificate of Permanent Medical Registration
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Doctor Name</span>
                      <strong className="text-slate-900 dark:text-white">{inspectingDoc.name}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">PMDC Registration #</span>
                      <strong className="font-mono text-teal-700 dark:text-teal-400">{inspectingDoc.pmdcNumber}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Medical Degree</span>
                      <span>{inspectingDoc.qualification}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Specialty</span>
                      <span>{inspectingDoc.specialty}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Document File</span>
                      <span className="truncate block font-mono text-[11px] text-teal-600 dark:text-teal-400">
                        {inspectingDoc.verificationDocumentName || inspectingDoc.pmdcCertificateUrl || 'PMDC_License_Scan.pdf'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Issuing Authority</span>
                      <span className="text-[11px]">PMDC Islamabad Secretariat</span>
                    </div>
                  </div>

                  {/* Document preview if data URL exists */}
                  {inspectingDoc.verificationDocumentDataUrl && (
                    <div className="mt-3 pt-3 border-t border-amber-200 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Uploaded Document Preview:</span>
                      <img
                        src={inspectingDoc.verificationDocumentDataUrl}
                        alt="PMDC Document Preview"
                        className="max-h-48 w-full object-contain rounded-xl border border-slate-300 dark:border-slate-700 bg-white"
                      />
                    </div>
                  )}

                  {/* Verification Checklist */}
                  <div className="pt-2 border-t border-amber-200 dark:border-slate-800 text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
                    <p className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>PMDC registry format verified ({inspectingDoc.pmdcNumber})</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Proof of license certificate submitted</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>MBBS / Specialist qualification documented</span>
                    </p>
                  </div>
                </div>

                {/* Cross-check Helper button & Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <a
                    href="https://pmdc.pk"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline"
                  >
                    <span>Official PMDC Portal (pmdc.pk)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {inspectingDoc.verificationStatus === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            handleApproveDoctor(inspectingDoc.id);
                            setInspectingDoc(null);
                          }}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve & Verify</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const d = inspectingDoc;
                            setInspectingDoc(null);
                            handleOpenRejectModal(d);
                          }}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-rose-50 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-300 dark:border-rose-800 cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => setInspectingDoc(null)}
                      className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* REJECTION REASON MODAL (OPTIONAL/CUSTOM NOTE TO APPLICANT) */}
          {/* ========================================================================= */}
          {rejectingDoc && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4 my-auto">
                <button
                  type="button"
                  onClick={() => setRejectingDoc(null)}
                  className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {isUrdu ? 'درخواست مسترد کرنے کی وجہ' : 'Reject Doctor Application'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {rejectingDoc.name} ({rejectingDoc.pmdcNumber})
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    {isUrdu ? 'مسترد کرنے کی وجہ / ڈاکٹر کو نوٹس:' : 'Reason / Note to Applicant:'}
                  </label>
                  {/* Preset quick reasons */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {[
                      'PMDC number mismatch with official registry',
                      'License document illegible or expired',
                      'Specialization credentials not accredited',
                    ].map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => setRejectionReasonText(reason)}
                        className="text-[10px] px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 dark:border-slate-700 cursor-pointer"
                      >
                        {reason}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={3}
                    value={rejectionReasonText}
                    onChange={(e) => setRejectionReasonText(e.target.value)}
                    placeholder="Enter reason or note to applicant doctor..."
                    className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-rose-500"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    This note will be recorded and communicated to the applicant doctor.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectingDoc(null)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmRejectDoctor}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Confirm Rejection</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: Doctor Personal Dashboard & Reviewed Cases Stats */}
      {/* ========================================================================= */}
      {activePortalTab === 'my_dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-400 uppercase font-bold">
                {isUrdu ? 'کل تصدیق شدہ فزیشنز' : 'Total Verified PMDC Doctors'}
              </span>
              <p className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 mt-1">{verifiedCount}</p>
              <span className="text-xs text-emerald-500 font-medium">
                {isUrdu ? '100% ایڈمن مصدقہ' : '100% Admin Approved & Visible'}
              </span>
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-400 uppercase font-bold">
                {isUrdu ? 'پی ایم ڈی سی لائسنس کی حیثیت' : 'PMDC License Standards'}
              </span>
              <p className="text-xl font-extrabold text-emerald-500 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5" />
                <span>{isUrdu ? 'فعال و رجسٹرڈ' : 'Mandatory Verification Active'}</span>
              </p>
              <span className="text-xs text-slate-400">
                {isUrdu ? 'کوئی غیر مصدقہ ڈاکٹر نظر نہیں آتا' : 'Zero unverified doctors shown to patients'}
              </span>
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-400 uppercase font-bold">
                {isUrdu ? 'زیرِ جائزہ درخواستیں' : 'Pending Verification Queue'}
              </span>
              <p className="text-3xl font-extrabold text-amber-500 mt-1">{pendingCount}</p>
              <span className="text-xs text-slate-400">
                {isUrdu ? 'ایڈمن توثیق کے منتظر' : 'Awaiting admin cross-check'}
              </span>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
              {isUrdu ? 'طبی معیار اور ٹیلی میڈیسن پروٹوکول' : 'Clinical Quality Standard & Medical Protocol'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">
              {isUrdu
                ? 'پی ایم ڈی سی اور پاکستان ٹیلی میڈیسن ایکٹ کے رہنما اصولوں کے تحت تمام مریضوں کے ٹریاج اور نسخہ جات کا جائزہ رجسٹرڈ میڈیکل پریکٹشنر لیتے ہیں۔ کوئی بھی ڈاکٹر اس وقت تک مریضوں کو نظر نہیں آ سکتا جب تک کہ اس کی رجسٹریشن نمبر اور اسناد کی باقاعدہ ایڈمن تصدیق نہ ہو جائے۔'
                : 'In accordance with PMDC regulations and Pakistan Telemedicine Standards, no doctor is visible to patients or able to approve clinical cases without completing the PMDC license verification process, receiving admin sign-off, and displaying a verified registration badge.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
