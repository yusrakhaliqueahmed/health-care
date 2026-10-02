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
  const [docFilter, setDocFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [rejectionReasonInput, setRejectionReasonInput] = useState<{ [docId: string]: string }>({});
  const [showRejectBox, setShowRejectBox] = useState<string | null>(null);

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
          ? 'ڈاکٹر کے کوائف اور پی ایم ڈی سی نمبر کی تصدیق ہو گئی ہے۔ پروفائل اب پبلک ہو چکی ہے۔'
          : 'Doctor credentials & PMDC registration verified. Doctor is now visible in Find Care.'
      );
      setTimeout(() => setApprovalNotice(null), 4000);
    }
  };

  const handleRejectDoctor = (doctorId: string) => {
    const reason = rejectionReasonInput[doctorId] || (isUrdu ? 'پی ایم ڈی سی رجسٹری سے کوائف کی تصدیق نہیں ہو سکی۔' : 'Credentials could not be verified with PMDC registry.');
    if (onUpdateDoctorStatus) {
      onUpdateDoctorStatus(doctorId, 'rejected', reason);
      setShowRejectBox(null);
      setApprovalNotice(
        isUrdu
          ? 'درخواست مسترد کر دی گئی ہے اور ڈاکٹر کو نوٹس ارسال کر دیا گیا ہے۔'
          : 'Doctor application rejected and reason recorded.'
      );
      setTimeout(() => setApprovalNotice(null), 4000);
    }
  };

  const handleSuspendDoctor = (doctorId: string) => {
    if (onUpdateDoctorStatus) {
      onUpdateDoctorStatus(doctorId, 'suspended', isUrdu ? 'انتظامی جانچ تک اکاؤنٹ معطل کیا گیا ہے۔' : 'Account suspended pending administrative investigation.');
      setApprovalNotice(
        isUrdu
          ? 'ڈاکٹر کا اکاؤنٹ معطل کر دیا گیا ہے۔'
          : 'Doctor account suspended and removed from patient search.'
      );
      setTimeout(() => setApprovalNotice(null), 4000);
    }
  };

  // Filtered doctors for admin queue (safe from undefined)
  const safeDoctorsList = doctors || [];
  const filteredDoctors = safeDoctorsList.filter((d) => {
    if (docFilter === 'all') return true;
    if (docFilter === 'pending') return d.verificationStatus === 'pending';
    if (docFilter === 'verified') return d.verificationStatus === 'verified' && d.isVerified;
    if (docFilter === 'rejected') return d.verificationStatus === 'rejected';
    return true;
  });

  const pendingCount = safeDoctorsList.filter((d) => d.verificationStatus === 'pending').length;

  return (
    <div className={`max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 ${isUrdu ? 'rtl font-urdu' : 'ltr'}`} dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-teal-800/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/80 border border-teal-600 text-teal-200 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {isUrdu
                ? 'پی ایم ڈی سی تصدیق شدہ فزیشن و ایڈمن کونسول'
                : 'PMDC Licensed Physician & Admin Console'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.doctorReviewPortalTitle || (isUrdu ? 'ڈاکٹر ریویو و ایڈمن پورٹل' : 'Doctor Review & Clinical Governance Portal')}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-1 max-w-xl">
            {isUrdu
              ? 'مستند اور تصدیق شدہ ڈاکٹر مریضوں کے ٹریاج کیسز کا معائنہ کرتے ہیں، ڈیجیٹل نسخوں پر دستخط کرتے ہیں، اور ادویات کی منظوری دیتے ہیں۔'
              : 'Human-in-the-loop clinical governance. Authenticated doctors review patient triage, sign digital prescriptions, and administer credentials.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onOpenDoctorOnboarding && (
            <button
              onClick={onOpenDoctorOnboarding}
              className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>{t.joinAsDoctor}</span>
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
          <span>{t.adminVerificationQueue || (isUrdu ? 'ایڈمن توثیق کی فہرست' : 'Doctor Credentials Queue')}</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
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
          <span>{isUrdu ? 'ڈاکٹر ڈیش بورڈ و کارکردگی' : 'Doctor Dashboard & Metrics'}</span>
        </button>
      </div>

      {approvalNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>{approvalNotice}</span>
        </div>
      )}

      {/* VIEW 1: Patient Triage Cases */}
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
                  : 'No pending patient files awaiting clinical review. New symptom checker cases and vitals alerts will automatically appear here.'}
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
                      className={`w-full p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
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

      {/* VIEW 2: Doctor Credential Verification & Onboarding Admin Queue */}
      {activePortalTab === 'admin_verification' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isUrdu ? 'ڈاکٹرز کی درجہ بندی:' : 'Filter Applicants:'}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'pending', label: isUrdu ? `زیر التواء توثیق (${pendingCount})` : `Pending Review (${pendingCount})` },
                  { id: 'verified', label: isUrdu ? 'تصدیق شدہ ڈاکٹرز' : 'Verified & Active' },
                  { id: 'rejected', label: isUrdu ? 'مسترد شدہ' : 'Rejected' },
                  { id: 'all', label: isUrdu ? `تمام (${safeDoctorsList.length})` : `All (${safeDoctorsList.length})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setDocFilter(f.id as any)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      docFilter === f.id
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs text-slate-400">
              {isUrdu ? `${filteredDoctors.length} ڈاکٹرز ظاہر ہیں` : `${filteredDoctors.length} doctors shown`}
            </span>
          </div>

          {/* List of Applications */}
          {filteredDoctors.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <UserCheck className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                {isUrdu ? 'اس فلٹر میں کوئی ڈاکٹر درخواست موجود نہیں' : 'No Doctor Applications in this Filter'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {isUrdu
                  ? 'ڈاکٹر کے طور پر شمولیت اختیار کرنے والے معالجین کی درخواستیں پی ایم ڈی سی توثیق کے لیے یہاں ظاہر ہوں گی۔'
                  : 'Applications submitted via "Join as a Doctor" will populate here for PMDC license cross-checking and verification.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredDoctors.map((doc) => {
                const isPending = doc.verificationStatus === 'pending';
                const isVerified = doc.verificationStatus === 'verified' && doc.isVerified;
                const isRejected = doc.verificationStatus === 'rejected';

                return (
                  <div
                    key={doc.id}
                    className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={doc.avatarUrl}
                        alt={doc.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                            {doc.name}
                          </h3>
                          {/* Status Badge */}
                          {isVerified ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span>{isUrdu ? 'پی ایم ڈی سی تصدیق شدہ' : 'PMDC Verified'}</span>
                            </span>
                          ) : isPending ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1 animate-pulse">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>{isUrdu ? 'زیر التواء توثیق' : 'Pending Admin Review'}</span>
                            </span>
                          ) : isRejected ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold border border-rose-500/30 flex items-center gap-1">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>{isUrdu ? 'درخواست مسترد' : 'Application Rejected'}</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">
                              {doc.isDemoPlaceholder ? (isUrdu ? 'ڈیمو ڈاکٹر' : 'Demo Placeholder') : (isUrdu ? 'غیر فعال' : 'Inactive')}
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-0.5">
                          {doc.specialty} • {doc.qualification}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-800 dark:text-slate-200 font-bold">
                            {isUrdu ? `پی ایم ڈی سی نمبر: ${doc.pmdcNumber}` : `PMDC Reg: ${doc.pmdcNumber}`}
                          </span>
                          <span>{isUrdu ? `تجربہ: ${doc.experienceYears} سال` : `Experience: ${doc.experienceYears} yrs`}</span>
                          <span>{isUrdu ? `ہسپتال: ${doc.hospital}` : `Hospital: ${doc.hospital}`}</span>
                          <span>{isUrdu ? `شہر: ${doc.city}` : `City: ${doc.city}`}</span>
                          {doc.pmdcCertificateUrl && (
                            <span className="text-teal-600 dark:text-teal-400 underline cursor-pointer flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              <span>{isUrdu ? `سند: ${doc.pmdcCertificateUrl}` : `Doc: ${doc.pmdcCertificateUrl}`}</span>
                            </span>
                          )}
                        </div>

                        {/* Rejection Note if existing */}
                        {doc.rejectionReason && (
                          <p className="text-xs text-rose-500 dark:text-rose-400 mt-2 italic bg-rose-50 dark:bg-rose-950/40 p-2 rounded-xl border border-rose-200 dark:border-rose-900">
                            {isUrdu ? `مسترد کرنے کی وجہ: ${doc.rejectionReason}` : `Rejection note: ${doc.rejectionReason}`}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Admin Actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 self-end md:self-center w-full md:w-auto">
                      {isPending && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApproveDoctor(doc.id)}
                            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                          >
                            <Check className="w-4 h-4" />
                            <span>{t.approveDoctorBtn}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowRejectBox(showRejectBox === doc.id ? null : doc.id)}
                            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-500/30 flex items-center justify-center gap-1.5 transition-all"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>{t.rejectDoctorBtn}</span>
                          </button>
                        </>
                      )}

                      {isVerified && (
                        <button
                          type="button"
                          onClick={() => handleSuspendDoctor(doc.id)}
                          className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-rose-900/40 hover:text-rose-300 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>{isUrdu ? 'معطل کریں' : 'Suspend'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: Doctor Personal Dashboard & Reviewed Cases Stats */}
      {activePortalTab === 'my_dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-400 uppercase font-bold">
                {isUrdu ? 'کل طبی معائنے و ریویوز' : 'Total Clinical Reviews'}
              </span>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">42</p>
              <span className="text-xs text-emerald-500 font-medium">
                {isUrdu ? '100% ڈاکٹر تصدیق شدہ' : '100% human signed'}
              </span>
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-400 uppercase font-bold">
                {isUrdu ? 'پی ایم ڈی سی لائسنس کی حیثیت' : 'PMDC License Status'}
              </span>
              <p className="text-xl font-extrabold text-emerald-500 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5" />
                <span>{isUrdu ? 'فعال و رجسٹرڈ' : 'Active & Compliant'}</span>
              </p>
              <span className="text-xs text-slate-400">
                {isUrdu ? 'سالانہ آڈٹ رپورٹ: پاس شدہ' : 'Annual audit status: Passed'}
              </span>
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-400 uppercase font-bold">
                {isUrdu ? 'مریضوں کا اطمینان اور ریٹنگ' : 'Average Patient Satisfaction'}
              </span>
              <p className="text-3xl font-extrabold text-amber-400 mt-1">4.9 / 5.0</p>
              <span className="text-xs text-slate-400">
                {isUrdu ? 'مصدقہ ٹیلی کنسلٹیشنز کی بنیاد پر' : 'Based on verified teleconsults'}
              </span>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
              {isUrdu ? 'طبی معیار اور ٹیلی میڈیسن پروٹوکول' : 'Clinical Quality Standard & Medical Protocol'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">
              {isUrdu
                ? 'پی ایم ڈی سی اور پاکستان ٹیلی میڈیسن ایکٹ کے رہنما اصولوں کے تحت تمام مریضوں کے ٹریاج اور نسخہ جات کا جائزہ رجسٹرڈ میڈیکل پریکٹشنر لیتے ہیں۔ مصنوعی ذہانت صرف ابتدائی معلومات جمع کرنے میں مدد دیتی ہے، حتمی تشخیص اور نسخے کی قانونی ذمہ داری معالج پر عائد ہوتی ہے۔'
                : 'In accordance with PMDC regulations and Pakistan Telemedicine Standards, all clinical reviews must be conducted by registered medical practitioners. Artificial intelligence operates solely as an initial triage pre-screen; final medical responsibility and prescription issuance remains with the signing physician.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
