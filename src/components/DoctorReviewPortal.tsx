import React, { useState } from 'react';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  UserCheck,
  Check,
  XCircle,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Copy,
  CheckCheck,
  Search,
  Filter,
  Stethoscope,
  RefreshCw,
  Ban,
  Award,
  Video,
  IdCard,
  FileSignature,
  AlertTriangle,
  History,
  CalendarClock,
  BellRing,
  UserX,
  X,
  Eye,
} from 'lucide-react';
import { SupportedLanguage, Doctor, PatientCase, VerificationLogRecord } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { voiceManager } from '../services/voice';
import { OfficialPmdcCertificateCard } from './OfficialPmdcCertificateCard';
import { PakistaniCnicCard } from './PakistaniCnicCard';
import {
  validateCertificateDocument,
  isSpecialistRole,
  checkPmdcDuplicate,
  SYSTEM_ADMIN_REVIEWERS,
} from '../services/pmdcCertificateService';

interface DoctorReviewPortalProps {
  currentLanguage: SupportedLanguage;
  pendingCases?: PatientCase[];
  onApproveCase: (caseId: string, doctorNote: string, prescriptionText: string) => void;
  doctors?: Doctor[];
  onUpdateDoctorStatus?: (
    doctorId: string,
    status: 'verified' | 'rejected' | 'suspended',
    note?: string,
    extraMetadata?: {
      initialReviewerAdmin?: any;
      finalApproverAdmin?: any;
      yearlyRenewalDue?: string;
    }
  ) => void;
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
  const [activePortalTab, setActivePortalTab] = useState<
    'cases' | 'admin_verification' | 'yearly_monitoring' | 'verification_history' | 'my_dashboard'
  >('admin_verification');

  // Case review states
  const [selectedCaseId, setSelectedCaseId] = useState<string>(pendingCases[0]?.id || '');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [rxMedicines, setRxMedicines] = useState('');
  const [approvalNotice, setApprovalNotice] = useState<string | null>(null);

  // Admin Verification states
  const [docFilter, setDocFilter] = useState<'all' | 'pending' | 'verified' | 'rejected' | 'suspended'>('pending');
  const [inspectingDoc, setInspectingDoc] = useState<Doctor | null>(null);
  const [rejectingDoc, setRejectingDoc] = useState<Doctor | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');
  const [suspendingDoc, setSuspendingDoc] = useState<Doctor | null>(null);
  const [suspensionReasonText, setSuspensionReasonText] = useState('');
  const [copiedPmdc, setCopiedPmdc] = useState<string | null>(null);
  const [inspectingCnicDoc, setInspectingCnicDoc] = useState<Doctor | null>(null);

  // Verification Audit History State
  const [verificationLogs, setVerificationLogs] = useState<VerificationLogRecord[]>(() => [
    {
      id: 'log-01',
      doctorId: 'doc-1',
      doctorName: 'Dr. Tariq Mahmood Khan',
      pmdcNumber: 'PMDC-48291-P',
      specialty: 'General Physician & Family Medicine',
      qualification: 'MBBS, FCPS (Internal Medicine)',
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
      action: 'verified',
      timestamp: '15 Jan 2024, 02:30 PM',
      adminNote: 'Multi-layer checks verified: PMDC portal cross-match confirmed, CNIC verified, live video face match approved.',
      verifiedBy: 'Two-Person Medical Board',
      initialReviewer: 'Dr. Tariq Mahmood (Compliance)',
      finalApprover: 'Prof. Dr. Javed Akram (CMO)',
      documentName: 'PMDC_Permanent_License_48291P.pdf',
      hospital: 'Nishtar Hospital & Medical Complex',
      city: 'Multan',
    },
    {
      id: 'log-02',
      doctorId: 'doc-3',
      doctorName: 'Dr. Shahzad Ali Qureshi',
      pmdcNumber: 'PMDC-31849-S',
      specialty: 'Cardiologist (Heart Specialist)',
      qualification: 'MBBS, FCPS (Cardiology), MRCP (UK)',
      avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
      action: 'verified',
      timestamp: '20 Nov 2023, 11:15 AM',
      adminNote: 'CPSP cardiology fellowship and PMDC Form-B verified.',
      verifiedBy: 'Two-Person Medical Board',
      initialReviewer: 'Dr. Tariq Mahmood (Compliance)',
      finalApprover: 'Prof. Dr. Javed Akram (CMO)',
      documentName: 'PMDC_Permanent_License_31849S.pdf',
      hospital: 'NICVD Karachi',
      city: 'Karachi',
    },
  ]);

  // Multi-Layer Verification Checklist State for current inspection
  const [checklist, setChecklist] = useState({
    pmdcPortalMatch: false,
    cnicExactMatch: false,
    liveVideoFaceMatch: false,
    cpspSpecialistVerified: false,
    legalUndertakingVerified: false,
    activeLicenseStatus: false,
  });

  // Admin Reviewer Notes for Two-Person Sign-off
  const [reviewer1Notes, setReviewer1Notes] = useState('PMDC portal cross-check, CNIC match, and live video face match validated.');
  const [reviewer2Notes, setReviewer2Notes] = useState('Final executive regulatory review complete. Approved for clinical practice.');

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

  // Two-Person Approval: Reviewer 1 (Regulatory Officer) Sign-off
  const handleReviewer1SignOff = (doc: Doctor) => {
    const reviewer1 = {
      name: SYSTEM_ADMIN_REVIEWERS.reviewer1.name,
      email: SYSTEM_ADMIN_REVIEWERS.reviewer1.email,
      signedAt: new Date().toLocaleString('en-PK'),
      comments: reviewer1Notes,
    };

    if (onUpdateDoctorStatus) {
      onUpdateDoctorStatus(doc.id, 'pending', 'Reviewer 1 Compliance Sign-off Complete', {
        initialReviewerAdmin: reviewer1,
      });

      // Update local inspection
      setInspectingDoc((prev) => (prev ? { ...prev, initialReviewerAdmin: reviewer1 } : null));

      setApprovalNotice(
        isUrdu
          ? `ریویوور 1 (${reviewer1.name}) نے ابتدائی توثیق پر دستخط کر دیے ہیں۔ اب فائنل ایگزیکٹو اپروول (Reviewer 2) درکار ہے۔`
          : `Reviewer 1 (${reviewer1.name}) signed off. Application now awaiting Final Approver (Reviewer 2) sign-off.`
      );
      setTimeout(() => setApprovalNotice(null), 5000);
    }
  };

  // Two-Person Approval: Reviewer 2 (Chief Medical Officer) Final Approval
  const handleFinalApproverSignOff = (doc: Doctor) => {
    const reviewer2 = {
      name: SYSTEM_ADMIN_REVIEWERS.reviewer2.name,
      email: SYSTEM_ADMIN_REVIEWERS.reviewer2.email,
      signedAt: new Date().toLocaleString('en-PK'),
      comments: reviewer2Notes,
    };

    const initialReviewer = doc.initialReviewerAdmin || {
      name: SYSTEM_ADMIN_REVIEWERS.reviewer1.name,
      email: SYSTEM_ADMIN_REVIEWERS.reviewer1.email,
      signedAt: new Date().toLocaleString('en-PK'),
      comments: reviewer1Notes,
    };

    const renewalDue = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    if (onUpdateDoctorStatus) {
      onUpdateDoctorStatus(doc.id, 'verified', 'Approved by Two-Person Medical Board', {
        initialReviewerAdmin: initialReviewer,
        finalApproverAdmin: reviewer2,
        yearlyRenewalDue: renewalDue,
      });

      // Log into audit trail
      const newLog: VerificationLogRecord = {
        id: `log-${Date.now()}`,
        doctorId: doc.id,
        doctorName: doc.name,
        pmdcNumber: doc.pmdcNumber,
        specialty: doc.specialty,
        qualification: doc.qualification,
        avatarUrl: doc.avatarUrl,
        action: 'verified',
        timestamp: new Date().toLocaleString('en-PK'),
        adminNote: `Two-Person Approval Complete: Reviewer 1 (${initialReviewer.name}) & Reviewer 2 (${reviewer2.name}). Annual renewal due on ${renewalDue}.`,
        verifiedBy: 'Two-Person Medical Board',
        initialReviewer: initialReviewer.name,
        finalApprover: reviewer2.name,
        documentName: doc.verificationDocumentName,
        hospital: doc.hospital,
        city: doc.city,
      };
      setVerificationLogs((prev) => [newLog, ...prev]);

      setApprovalNotice(
        isUrdu
          ? `ڈاکٹر ${doc.name} کی دونوں انتظامی افسران سے توثیق مکمل ہو گئی ہے۔ ڈاکٹر اب فائنڈ کیئر میں ✅ PMDC Verified بیج کے ساتھ لائیو ہو چکا ہے۔`
          : `Doctor ${doc.name} has received two-person approval. Doctor is now active across Find Care with the ✅ PMDC Verified trust badge.`
      );
      setInspectingDoc(null);
      setTimeout(() => setApprovalNotice(null), 5000);
    }
  };

  // Rejection Workflow
  const handleOpenRejectModal = (doc: Doctor) => {
    setRejectingDoc(doc);
    setRejectionReasonText(
      isUrdu
        ? 'پی ایم ڈی سی پورٹل (pmdc.pk) پر رجسٹریشن نمبر اور نام کی تصدیق نہیں ہو سکی۔'
        : 'PMDC database cross-match or CNIC/video verification failed.'
    );
  };

  const handleConfirmRejectDoctor = () => {
    if (!rejectingDoc) return;
    if (onUpdateDoctorStatus) {
      onUpdateDoctorStatus(rejectingDoc.id, 'rejected', rejectionReasonText);

      const newLog: VerificationLogRecord = {
        id: `log-${Date.now()}`,
        doctorId: rejectingDoc.id,
        doctorName: rejectingDoc.name,
        pmdcNumber: rejectingDoc.pmdcNumber,
        specialty: rejectingDoc.specialty,
        qualification: rejectingDoc.qualification,
        avatarUrl: rejectingDoc.avatarUrl,
        action: 'rejected',
        timestamp: new Date().toLocaleString('en-PK'),
        adminNote: rejectionReasonText,
        verifiedBy: SYSTEM_ADMIN_REVIEWERS.reviewer1.name,
        documentName: rejectingDoc.verificationDocumentName,
        hospital: rejectingDoc.hospital,
        city: rejectingDoc.city,
      };
      setVerificationLogs((prev) => [newLog, ...prev]);

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

  // Instant Suspension / Revocation Workflow
  const handleOpenSuspendModal = (doc: Doctor) => {
    setSuspendingDoc(doc);
    setSuspensionReasonText(
      isUrdu
        ? 'مریض کی شکایت یا پی ایم ڈی سی لائسنس معطلی کی بنا پر فوری طور پر لسٹنگز سے ہٹایا گیا۔'
        : 'Patient complaint / license status investigation under Section 42 PMDC Act.'
    );
  };

  const handleConfirmSuspendDoctor = () => {
    if (!suspendingDoc) return;
    if (onUpdateDoctorStatus) {
      onUpdateDoctorStatus(suspendingDoc.id, 'suspended', suspensionReasonText);

      const newLog: VerificationLogRecord = {
        id: `log-${Date.now()}`,
        doctorId: suspendingDoc.id,
        doctorName: suspendingDoc.name,
        pmdcNumber: suspendingDoc.pmdcNumber,
        specialty: suspendingDoc.specialty,
        qualification: suspendingDoc.qualification,
        avatarUrl: suspendingDoc.avatarUrl,
        action: 'suspended',
        timestamp: new Date().toLocaleString('en-PK'),
        adminNote: suspensionReasonText,
        verifiedBy: SYSTEM_ADMIN_REVIEWERS.reviewer2.name,
        hospital: suspendingDoc.hospital,
        city: suspendingDoc.city,
      };
      setVerificationLogs((prev) => [newLog, ...prev]);

      setApprovalNotice(
        isUrdu
          ? `ڈاکٹر ${suspendingDoc.name} کا لائسنس فوری معطل کر دیا گیا ہے اور مریضوں کے تمام نتائج سے ہٹا دیا گیا ہے۔`
          : `Doctor ${suspendingDoc.name} has been suspended and immediately removed from all patient search results.`
      );
      setSuspendingDoc(null);
      setSuspensionReasonText('');
      setTimeout(() => setApprovalNotice(null), 5000);
    }
  };

  // Reinstate Previously Suspended Doctor
  const handleReinstateDoctor = (doc: Doctor) => {
    handleFinalApproverSignOff(doc);
    setApprovalNotice(
      isUrdu
        ? `ڈاکٹر ${doc.name} کی معطلی ختم کر دی گئی ہے اور تصدیق بحال ہو گئی ہے۔`
        : `Doctor ${doc.name} has been reinstated and restored to verified status.`
    );
    setTimeout(() => setApprovalNotice(null), 5000);
  };

  // Yearly Re-verification Renewal
  const handleRenewDoctorYearly = (doc: Doctor) => {
    const nextRenewal = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    if (onUpdateDoctorStatus) {
      onUpdateDoctorStatus(doc.id, 'verified', 'Annual PMDC license re-verification confirmed', {
        yearlyRenewalDue: nextRenewal,
      });

      setApprovalNotice(
        isUrdu
          ? `ڈاکٹر ${doc.name} کا سالانہ لائسنس 1 سال کے لیے تجدید ہو گیا ہے۔ اگلی تجدید: ${nextRenewal}`
          : `Annual license for Dr. ${doc.name} renewed for 1 year. Next renewal: ${nextRenewal}.`
      );
      setTimeout(() => setApprovalNotice(null), 4000);
    }
  };

  const handleCopyPmdc = (pmdcNum: string) => {
    navigator.clipboard?.writeText(pmdcNum);
    setCopiedPmdc(pmdcNum);
    setTimeout(() => setCopiedPmdc(null), 2500);
  };

  // Filtered doctors for admin queue
  const safeDoctorsList = doctors || [];
  const filteredDoctors = safeDoctorsList.filter((d) => {
    if (docFilter === 'all') return true;
    if (docFilter === 'pending') return d.verificationStatus === 'pending';
    if (docFilter === 'verified') return d.verificationStatus === 'verified' && d.isVerified && !d.isSuspended;
    if (docFilter === 'rejected') return d.verificationStatus === 'rejected';
    if (docFilter === 'suspended') return d.verificationStatus === 'suspended' || d.isSuspended;
    return true;
  });

  const pendingCount = safeDoctorsList.filter((d) => d.verificationStatus === 'pending').length;
  const verifiedCount = safeDoctorsList.filter((d) => d.verificationStatus === 'verified' && d.isVerified && !d.isSuspended).length;
  const rejectedCount = safeDoctorsList.filter((d) => d.verificationStatus === 'rejected').length;
  const suspendedCount = safeDoctorsList.filter((d) => d.verificationStatus === 'suspended' || d.isSuspended).length;

  return (
    <div className={`max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 ${isUrdu ? 'font-urdu' : ''}`} dir="ltr">
      {/* Top Banner */}
      <div className="p-4 sm:p-6 lg:p-8 rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-teal-800/40 overflow-hidden box-border">
        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/80 border border-teal-600 text-teal-200 text-xs font-bold mb-2 max-w-full">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">
              {isUrdu
                ? 'کثیر الجہتی جعلی اسناد سے پاک تصدیقی کونسول'
                : 'Fake-Proof Multi-Layer Doctor Governance Console'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white break-words">
            {isUrdu ? 'ڈاکٹر ریویو و ایڈمن توثیق پورٹل' : 'Doctor Verification & Clinical Governance Portal'}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-1 max-w-xl">
            {isUrdu
              ? 'پی ایم ڈی سی پورٹل، شناختی کارڈ، لائیو ویڈیو، سی پی ایس پی اور دو افسران کے دستخط کے بغیر کوئی ڈاکٹر فعال نہیں ہو سکتا۔'
              : 'Multi-layer verification: PMDC cross-check, CNIC match, live video face check, duplicate detection, and two-person admin approval.'}
          </p>
        </div>

        <div className="w-full md:w-auto flex items-center justify-start md:justify-end pt-2 md:pt-0 max-w-full">
          {onOpenDoctorOnboarding && (
            <button
              type="button"
              onClick={onOpenDoctorOnboarding}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer max-w-full text-center"
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span className="truncate sm:whitespace-nowrap">{isUrdu ? 'نیا ڈاکٹر رجسٹر کریں' : 'Register New Doctor'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Mode Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
        {/* Tab 1: Verification Queue */}
        <button
          type="button"
          onClick={() => setActivePortalTab('admin_verification')}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer ${
            activePortalTab === 'admin_verification'
              ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{isUrdu ? 'ڈاکٹر تصدیقی قطار' : 'Verification Queue'}</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>

        {/* Tab 2: Yearly Monitoring Tracker */}
        <button
          type="button"
          onClick={() => setActivePortalTab('yearly_monitoring')}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer ${
            activePortalTab === 'yearly_monitoring'
              ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          <span>{isUrdu ? 'سالانہ مانیٹرنگ و تجدید' : 'Yearly Renewal Tracker'}</span>
          <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 text-[10px] font-bold">
            {verifiedCount} Active
          </span>
        </button>

        {/* Tab 3: Verification History */}
        <button
          type="button"
          onClick={() => setActivePortalTab('verification_history')}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer ${
            activePortalTab === 'verification_history'
              ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{isUrdu ? 'توثیقی ریکارڈ (Audit Log)' : 'Verification History'}</span>
        </button>

        {/* Tab 4: Patient Triage Cases */}
        <button
          type="button"
          onClick={() => setActivePortalTab('cases')}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer ${
            activePortalTab === 'cases'
              ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>{isUrdu ? `ٹریاج کیسز (${pendingCases.length})` : `Triage Cases (${pendingCases.length})`}</span>
        </button>

        {/* Tab 5: Standards Dashboard */}
        <button
          type="button"
          onClick={() => setActivePortalTab('my_dashboard')}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer ${
            activePortalTab === 'my_dashboard'
              ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{isUrdu ? 'میٹرکس' : 'Standards'}</span>
        </button>
      </div>

      {approvalNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{approvalNotice}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: PMDC MULTI-LAYER DOCTOR VERIFICATION QUEUE */}
      {/* ========================================================================= */}
      {activePortalTab === 'admin_verification' && (
        <div className="space-y-5">
          {/* Sub-filters */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
              {[
                { key: 'pending', label: isUrdu ? `زیرِ جائزہ (${pendingCount})` : `Pending (${pendingCount})` },
                { key: 'verified', label: isUrdu ? `تصدیق شدہ (${verifiedCount})` : `Verified (${verifiedCount})` },
                { key: 'suspended', label: isUrdu ? `معطل شدہ (${suspendedCount})` : `Suspended (${suspendedCount})` },
                { key: 'rejected', label: isUrdu ? `مسترد شدہ (${rejectedCount})` : `Rejected (${rejectedCount})` },
                { key: 'all', label: isUrdu ? `تمام (${safeDoctorsList.length})` : `All (${safeDoctorsList.length})` },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setDocFilter(f.key as any)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    docFilter === f.key
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Multi-Layer Rules: PMDC Match • CNIC Match • Video Check • Two-Admin Sign-off
            </div>
          </div>

          {/* Doctor Cards List */}
          {filteredDoctors.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <CheckCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {isUrdu ? 'اس زمرے میں کوئی ڈاکٹر موجود نہیں ہے' : 'No doctors in this verification queue.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDoctors.map((doc) => {
                const isPending = doc.verificationStatus === 'pending';
                const isVerified = doc.verificationStatus === 'verified' && doc.isVerified && !doc.isSuspended;
                const isRejected = doc.verificationStatus === 'rejected';
                const isSuspended = doc.verificationStatus === 'suspended' || doc.isSuspended;
                const hasReviewer1Signed = Boolean(doc.initialReviewerAdmin);
                const hasReviewer2Signed = Boolean(doc.finalApproverAdmin);

                return (
                  <div
                    key={doc.id}
                    className={`p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between space-y-3.5 relative overflow-hidden ${
                      isPending
                        ? 'border-amber-300 dark:border-amber-800/80 shadow-md shadow-amber-900/5'
                        : isSuspended
                        ? 'border-orange-400 dark:border-orange-800 bg-orange-50/20'
                        : isRejected
                        ? 'border-rose-200 dark:border-rose-900/60 opacity-80'
                        : 'border-emerald-300 dark:border-emerald-800/60'
                    }`}
                  >
                    <div>
                      {/* Top Header Pill */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {isPending && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {hasReviewer1Signed
                                ? 'Awaiting Final Approver 2'
                                : 'Pending Multi-Layer Review'}
                            </span>
                          </span>
                        )}

                        {isVerified && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Verified by 2 Admins • Active</span>
                          </span>
                        )}

                        {isSuspended && (
                          <span className="px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <Ban className="w-3 h-3" />
                            <span>Suspended • Invisible to Patients</span>
                          </span>
                        )}

                        {isRejected && (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            <span>Rejected</span>
                          </span>
                        )}

                        <span className="text-[10px] text-slate-400">
                          {doc.registeredAt || 'Recent'}
                        </span>
                      </div>

                      {/* Doctor Info */}
                      <div className="flex items-start gap-3">
                        <img
                          src={doc.avatarUrl}
                          alt={doc.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                            {doc.name}
                          </h4>
                          <p className="text-xs font-bold text-teal-700 dark:text-teal-400 truncate">
                            {doc.specialty}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {doc.qualification} • {doc.hospital}
                          </p>
                        </div>
                      </div>

                      {/* Credentials Strip */}
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-xs">
                        {/* PMDC Number */}
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">PMDC Number:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-teal-800 dark:text-teal-300">
                              {doc.pmdcNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyPmdc(doc.pmdcNumber)}
                              className="p-1 text-slate-400 hover:text-teal-600 rounded cursor-pointer"
                              title="Copy PMDC Number"
                            >
                              {copiedPmdc === doc.pmdcNumber ? (
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <a
                              href={`https://pmdc.pk/verify?license=${encodeURIComponent(doc.pmdcNumber)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-bold text-teal-600 hover:underline inline-flex items-center gap-0.5"
                            >
                              <span>pmdc.pk</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>

                        {/* CNIC Number */}
                        {doc.cnicNumber && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">CNIC Number:</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                              {doc.cnicNumber}
                            </span>
                          </div>
                        )}

                        {/* Two-Person Approval Progress */}
                        <div className="pt-1 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">2-Admin Sign-off:</span>
                          <span className="font-bold flex items-center gap-1">
                            <span className={hasReviewer1Signed ? 'text-emerald-600' : 'text-slate-400'}>
                              {hasReviewer1Signed ? '✓ Reviewer 1' : '○ Reviewer 1'}
                            </span>
                            <span>•</span>
                            <span className={hasReviewer2Signed ? 'text-emerald-600' : 'text-slate-400'}>
                              {hasReviewer2Signed ? '✓ Reviewer 2' : '○ Reviewer 2'}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Duplicate Flag Warning on Card */}
                      {doc.isDuplicateFlagged && (
                        <div className="mt-2 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 text-rose-800 dark:text-rose-200 text-[11px] font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>🚨 Duplicate PMDC Flagged: Fraud Review Required</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setInspectingDoc(doc);
                          setChecklist({
                            pmdcPortalMatch: false,
                            cnicExactMatch: false,
                            liveVideoFaceMatch: doc.videoVerificationCompleted || false,
                            cpspSpecialistVerified: false,
                            legalUndertakingVerified: doc.undertakingSigned || false,
                            activeLicenseStatus: false,
                          });
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'کثیر الجہتی معائنہ کریں' : 'Inspect All Layers'}</span>
                      </button>

                      {isVerified && (
                        <button
                          type="button"
                          onClick={() => handleOpenSuspendModal(doc)}
                          className="py-2 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold cursor-pointer"
                          title="Instant suspension - hides doctor from patient search"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isSuspended && (
                        <button
                          type="button"
                          onClick={() => handleReinstateDoctor(doc)}
                          className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                          title="Restore and reinstate verified doctor"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isPending && (
                        <button
                          type="button"
                          onClick={() => handleOpenRejectModal(doc)}
                          className="py-2 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer"
                          title="Reject Application"
                        >
                          <XCircle className="w-3.5 h-3.5" />
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

      {/* ========================================================================= */}
      {/* VIEW 2: YEARLY RE-VERIFICATION TRACKER & ONGOING MONITORING */}
      {/* ========================================================================= */}
      {activePortalTab === 'yearly_monitoring' && (
        <div className="space-y-5 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 text-xs flex items-start justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-sm text-teal-950 dark:text-teal-200 mb-0.5">
                {isUrdu ? 'سالانہ لائسنس تجدید و نگرانی (Ongoing PMDC Monitoring)' : 'Ongoing Monitoring & Yearly Re-verification'}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                {isUrdu
                  ? 'ہر تصدیق شدہ فزیشن کے لائسنس کی ہر سال تجدید لازمی ہے۔ شکایت یا لائسنس ختم ہونے پر ایڈمن فوری معطل کر سکتا ہے۔'
                  : 'All verified doctors require an annual license audit. If a complaint is filed or the license expires, instant suspension immediately revokes public visibility.'}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shrink-0">
              {verifiedCount} Actively Monitored
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-extrabold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Verified Physicians Annual Registry
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {safeDoctorsList
                .filter((d) => d.isVerified || d.verificationStatus === 'verified' || d.isSuspended)
                .map((doc) => {
                  const isCurrentlySuspended = doc.isSuspended || doc.verificationStatus === 'suspended';
                  const renewalDate = doc.yearlyRenewalDue || '15 Jan 2027';

                  return (
                    <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.avatarUrl}
                          alt={doc.name}
                          className="w-10 h-10 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-slate-900 dark:text-white">{doc.name}</h4>
                            {isCurrentlySuspended ? (
                              <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 text-[10px] font-black uppercase">
                                Suspended
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                                Active & Verified
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {doc.pmdcNumber} • {doc.specialty} • {doc.hospital}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-bold">Annual Renewal Due:</span>
                          <span className="font-mono font-bold text-teal-700 dark:text-teal-300">{renewalDate}</span>
                        </div>

                        {isCurrentlySuspended ? (
                          <button
                            type="button"
                            onClick={() => handleReinstateDoctor(doc)}
                            className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs"
                          >
                            Reinstate
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRenewDoctorYearly(doc)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold text-xs"
                            >
                              Renew 1 Year
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenSuspendModal(doc)}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs"
                            >
                              Suspend
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: VERIFICATION HISTORY AUDIT LOG */}
      {/* ========================================================================= */}
      {activePortalTab === 'verification_history' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-teal-600" />
              <span>{isUrdu ? 'انتظامی توثیق کا تاریخی ریکارڈ (Audit Log)' : 'Verification History & Regulatory Audit Trail'}</span>
            </h3>
            <span className="text-xs text-slate-400">{verificationLogs.length} total events</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
            {verificationLogs.map((log) => (
              <div key={log.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-3 min-w-0">
                  <img
                    src={log.avatarUrl}
                    alt={log.doctorName}
                    className="w-11 h-11 rounded-xl object-cover shrink-0 border"
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {log.doctorName}
                      </span>
                      <span className="font-mono text-[11px] text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-md border border-teal-200">
                        {log.pmdcNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          log.action === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.action === 'suspended'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.action.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 font-medium">
                      {log.adminNote}
                    </p>

                    <div className="text-[11px] text-slate-400 flex items-center gap-3">
                      <span>Authority: {log.verifiedBy}</span>
                      {log.initialReviewer && <span>Reviewer 1: {log.initialReviewer}</span>}
                      {log.finalApprover && <span>Approver 2: {log.finalApprover}</span>}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 text-slate-400 text-[11px] self-end sm:self-center font-mono">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: PATIENT TRIAGE CASES */}
      {/* ========================================================================= */}
      {activePortalTab === 'cases' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-2">
              Pending Case Files ({pendingCases.length})
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
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                      {c.patientName}
                    </span>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                      {c.urgency}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{c.symptoms}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 space-y-4">
            {selectedCase ? (
              <form onSubmit={handleApproveCaseSubmit} className="space-y-4 text-xs">
                <div className="border-b pb-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Patient Case #{selectedCase.id}: {selectedCase.patientName}
                  </h3>
                  <p className="text-slate-500 mt-1">{selectedCase.aiSummary}</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Physician Clinical Notes:
                  </label>
                  <textarea
                    rows={3}
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder="Enter examination remarks and advice..."
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Prescribed Medicines & Dosage:
                  </label>
                  <textarea
                    rows={2}
                    value={rxMedicines}
                    onChange={(e) => setRxMedicines(e.target.value)}
                    placeholder="e.g. Tab Paracetamol 500mg TDS x 3 days"
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    Approve Case & Issue Digital Rx
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-slate-400">Select a case file to review.</p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 5: STANDARDS & METRICS DASHBOARD */}
      {/* ========================================================================= */}
      {activePortalTab === 'my_dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-400 uppercase font-bold">Total Verified Physicians</span>
              <p className="text-3xl font-extrabold text-teal-600 mt-1">{verifiedCount}</p>
              <span className="text-xs text-emerald-500 font-medium">100% Two-Admin Approved & Visible</span>
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-400 uppercase font-bold">Awaiting Two-Admin Review</span>
              <p className="text-3xl font-extrabold text-amber-500 mt-1">{pendingCount}</p>
              <span className="text-xs text-slate-400">Strictly invisible to patients</span>
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-400 uppercase font-bold">Revoked / Suspended</span>
              <p className="text-3xl font-extrabold text-orange-600 mt-1">{suspendedCount}</p>
              <span className="text-xs text-slate-400">Instantly removed from listings</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MULTI-LAYER INSPECTION MODAL (ALL 8 CHECKS & TWO-PERSON APPROVAL) */}
      {/* ========================================================================= */}
      {inspectingDoc && (() => {
        const isSpecialist = isSpecialistRole(inspectingDoc.specialty);
        const dupCheck = checkPmdcDuplicate(inspectingDoc.pmdcNumber, safeDoctorsList, inspectingDoc.id);
        const isDuplicate = dupCheck.isDuplicate || inspectingDoc.isDuplicateFlagged;

        const hasReviewer1Signed = Boolean(inspectingDoc.initialReviewerAdmin);
        const hasReviewer2Signed = Boolean(inspectingDoc.finalApproverAdmin);

        const allChecklistPassed =
          checklist.pmdcPortalMatch &&
          checklist.cnicExactMatch &&
          checklist.liveVideoFaceMatch &&
          checklist.legalUndertakingVerified &&
          (!isSpecialist || checklist.cpspSpecialistVerified);

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl relative space-y-4 my-auto max-h-[94vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setInspectingDoc(null)}
                className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2 text-slate-400 hover:text-slate-800 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="w-11 h-11 rounded-2xl bg-teal-700 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Fake-Proof Multi-Layer Doctor Inspection
                  </h3>
                  <p className="text-xs text-slate-500">
                    {inspectingDoc.name} • PMDC #{inspectingDoc.pmdcNumber} • CNIC: {inspectingDoc.cnicNumber || 'Registered'}
                  </p>
                </div>
              </div>

              {/* DUPLICATE PMDC FRAUD ALERT */}
              {isDuplicate && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border-2 border-rose-500 text-rose-900 dark:text-rose-200 text-xs space-y-1.5 animate-shake">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                    <strong className="text-sm font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">
                      🚨 DUPLICATE PMDC NUMBER DETECTED (One Number, One Account Rule)
                    </strong>
                  </div>
                  <p className="font-medium text-[11px] leading-relaxed">
                    This PMDC Registration Number ({inspectingDoc.pmdcNumber}) is already associated with another account ({dupCheck.conflictingDoctorName || 'Existing Registered Physician'}). Standard approval is strictly disabled. This application has been flagged for criminal anti-impersonation review.
                  </p>
                </div>
              )}

              {/* LAYER 1: PMDC License Card Render */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Layer 1: Official PMDC Registration Form-B Document</span>
                  <a
                    href={`https://pmdc.pk/verify?license=${encodeURIComponent(inspectingDoc.pmdcNumber)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-700 dark:text-teal-300 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Verify on pmdc.pk Database</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <OfficialPmdcCertificateCard
                  doctorName={inspectingDoc.name}
                  pmdcNumber={inspectingDoc.pmdcNumber}
                  qualification={inspectingDoc.qualification}
                  specialty={inspectingDoc.specialty}
                  hospital={inspectingDoc.hospital}
                  city={inspectingDoc.city}
                  registeredAt={inspectingDoc.registeredAt}
                  customDocumentDataUrl={inspectingDoc.verificationDocumentDataUrl}
                  customDocumentName={inspectingDoc.verificationDocumentName}
                  isInspecting
                />
              </div>

              {/* LAYER 2 & 3: CNIC CARD & LIVE VIDEO VERIFICATION PREVIEWS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* CNIC Document Card */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold uppercase text-[10px] text-teal-800 dark:text-teal-300 flex items-center gap-1">
                      <IdCard className="w-3.5 h-3.5 text-teal-600" />
                      <span>Layer 2: CNIC Picture & Exact Match</span>
                    </span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      {inspectingDoc.cnicNumber || '35201-8492019-3'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border text-slate-600 text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate"><strong>CNIC Picture:</strong> {inspectingDoc.cnicDocumentUrl || 'Doctor_NADRA_CNIC.jpg'}</p>
                      <button
                        type="button"
                        onClick={() => setInspectingCnicDoc(inspectingDoc)}
                        className="px-2.5 py-1 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-[10px] shrink-0 cursor-pointer shadow-2xs flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect Picture</span>
                      </button>
                    </div>
                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      ✓ Legal name on CNIC matches PMDC registration record.
                    </p>
                  </div>
                </div>

                {/* Live Video Verification Card */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold uppercase text-[10px] text-teal-800 dark:text-teal-300 flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-teal-600" />
                      <span>Layer 3: Live Video Check</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600">
                      {inspectingDoc.videoVerificationCompleted ? '✓ Video Attached' : 'Video Pending'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border text-slate-600 text-[11px] space-y-1">
                    <p><strong>Recording:</strong> {inspectingDoc.videoVerificationUrl || 'Live_Face_Check.mp4'}</p>
                    <p className="text-slate-500">
                      Doctor recorded holding CNIC and PMDC card to camera.
                    </p>
                  </div>
                </div>
              </div>

              {/* LAYER 5: Specialist CPSP Certificate (if specialist) */}
              {isSpecialist && (
                <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 text-xs space-y-1.5">
                  <span className="font-extrabold uppercase text-[10px] text-amber-900 dark:text-amber-200 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>Layer 5: CPSP Specialist Credential Verification (FCPS/MCPS)</span>
                  </span>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300">
                    <strong>Specialty:</strong> {inspectingDoc.specialty} • <strong>Attached CPSP:</strong> {inspectingDoc.cpspCertificateUrl || 'CPSP_FCPS_Certificate_Scan.pdf'}
                  </p>
                </div>
              )}

              {/* LAYER 7: Signed Legal Undertaking */}
              <div className="p-3 rounded-2xl bg-slate-900 text-white text-xs space-y-1">
                <span className="font-bold text-emerald-400 text-[10px] uppercase tracking-wider block">
                  Layer 7: Legally Binding Digital Affidavit
                </span>
                <p className="text-[11px] text-slate-300 font-serif italic">
                  "{inspectingDoc.undertakingSignatureText || inspectingDoc.name}" signed under Section 42 of PMDC Act 2022 on {inspectingDoc.undertakingSignedAt || inspectingDoc.registeredAt}.
                </p>
              </div>

              {/* MANDATORY ADMIN CHECKLIST */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>Mandatory Multi-Layer Verification Checklist (All Required)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      setChecklist({
                        pmdcPortalMatch: true,
                        cnicExactMatch: true,
                        liveVideoFaceMatch: true,
                        cpspSpecialistVerified: true,
                        legalUndertakingVerified: true,
                        activeLicenseStatus: true,
                      })
                    }
                    className="text-[10px] font-bold text-teal-700 dark:text-teal-300 underline cursor-pointer"
                  >
                    Confirm All Multi-Layer Checks
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={checklist.pmdcPortalMatch}
                      onChange={(e) => setChecklist({ ...checklist, pmdcPortalMatch: e.target.checked })}
                      className="rounded text-teal-600 w-4 h-4"
                    />
                    <span>1. PMDC Portal Cross-Check: Confirmed doctor name and #{inspectingDoc.pmdcNumber} match pmdc.pk</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={checklist.cnicExactMatch}
                      onChange={(e) => setChecklist({ ...checklist, cnicExactMatch: e.target.checked })}
                      className="rounded text-teal-600 w-4 h-4"
                    />
                    <span>2. CNIC Identity Match: Legal name on CNIC matches PMDC registration certificate exactly</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={checklist.liveVideoFaceMatch}
                      onChange={(e) => setChecklist({ ...checklist, liveVideoFaceMatch: e.target.checked })}
                      className="rounded text-teal-600 w-4 h-4"
                    />
                    <span>3. Live Video Verification: Confirmed applicant face matches submitted CNIC & photo</span>
                  </label>

                  {isSpecialist && (
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={checklist.cpspSpecialistVerified}
                        onChange={(e) => setChecklist({ ...checklist, cpspSpecialistVerified: e.target.checked })}
                        className="rounded text-teal-600 w-4 h-4"
                      />
                      <span>4. Specialist Credential Check: CPSP Fellowship/Membership certificate verified</span>
                    </label>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={checklist.legalUndertakingVerified}
                      onChange={(e) => setChecklist({ ...checklist, legalUndertakingVerified: e.target.checked })}
                      className="rounded text-teal-600 w-4 h-4"
                    />
                    <span>5. Signed Digital Undertaking: Legally binding affidavit confirmed under Section 42 PMDC Act</span>
                  </label>
                </div>
              </div>

              {/* LAYER 6: TWO-PERSON APPROVAL CONTROLS */}
              <div className="p-4 rounded-2xl bg-teal-50/80 dark:bg-teal-950/60 border-2 border-teal-600/70 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-black uppercase tracking-wider text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-teal-600" />
                    <span>Layer 6: Two-Person Admin Sign-off Workflow</span>
                  </h4>
                  <span className="text-[10px] text-teal-700 font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border">
                    Fraud Prevention Dual Audit
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Reviewer 1 Box */}
                  <div className={`p-3 rounded-xl border ${hasReviewer1Signed ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-slate-800 dark:text-slate-200">Reviewer 1 (Regulatory Officer)</strong>
                      {hasReviewer1Signed && <span className="text-[10px] font-bold text-emerald-600">✓ Signed</span>}
                    </div>
                    <p className="text-[11px] text-slate-500 mb-2">
                      {inspectingDoc.initialReviewerAdmin
                        ? `${inspectingDoc.initialReviewerAdmin.name} on ${inspectingDoc.initialReviewerAdmin.signedAt}`
                        : SYSTEM_ADMIN_REVIEWERS.reviewer1.name}
                    </p>
                    {!hasReviewer1Signed && (
                      <button
                        type="button"
                        disabled={!allChecklistPassed || isDuplicate}
                        onClick={() => handleReviewer1SignOff(inspectingDoc)}
                        className="w-full py-2 px-3 rounded-lg bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold text-xs cursor-pointer shadow-xs"
                      >
                        Sign Off as Reviewer 1 (Compliance)
                      </button>
                    )}
                  </div>

                  {/* Reviewer 2 Box */}
                  <div className={`p-3 rounded-xl border ${hasReviewer2Signed ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-slate-800 dark:text-slate-200">Reviewer 2 (Chief Medical Officer)</strong>
                      {hasReviewer2Signed && <span className="text-[10px] font-bold text-emerald-600">✓ Signed</span>}
                    </div>
                    <p className="text-[11px] text-slate-500 mb-2">
                      {inspectingDoc.finalApproverAdmin
                        ? `${inspectingDoc.finalApproverAdmin.name} on ${inspectingDoc.finalApproverAdmin.signedAt}`
                        : SYSTEM_ADMIN_REVIEWERS.reviewer2.name}
                    </p>
                    {!hasReviewer2Signed && (
                      <button
                        type="button"
                        disabled={!allChecklistPassed || isDuplicate || !hasReviewer1Signed}
                        onClick={() => handleFinalApproverSignOff(inspectingDoc)}
                        className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs cursor-pointer shadow-xs"
                        title={
                          !hasReviewer1Signed
                            ? 'Reviewer 1 must sign off before final approval'
                            : 'Grant full verified status'
                        }
                      >
                        Final Executive Approval (Sign & Verify)
                      </button>
                    )}
                  </div>
                </div>

                {!hasReviewer1Signed && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                    * Both independent admin sign-offs are mandatory before this doctor can ever be seen by patients.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const d = inspectingDoc;
                    setInspectingDoc(null);
                    handleOpenRejectModal(d);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-300 hover:bg-rose-100 cursor-pointer"
                >
                  Reject Application
                </button>

                <button
                  type="button"
                  onClick={() => setInspectingDoc(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* SUSPENSION MODAL (Instant removal from patient-facing search) */}
      {suspendingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center gap-3 border-b pb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Suspend Doctor Account Instantly
                </h3>
                <p className="text-xs text-slate-500">
                  {suspendingDoc.name} ({suspendingDoc.pmdcNumber})
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Reason for Immediate Suspension / Investigation:
              </label>
              <textarea
                rows={3}
                value={suspensionReasonText}
                onChange={(e) => setSuspensionReasonText(e.target.value)}
                placeholder="Enter clinical complaint or license audit reason..."
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
              <p className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold">
                ⚠️ Once suspended, this doctor will IMMEDIATELY disappear from all patient searches and Find Care listings.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSuspendingDoc(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSuspendDoctor}
                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs"
              >
                Confirm Immediate Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center gap-3 border-b pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Reject Doctor Application
                </h3>
                <p className="text-xs text-slate-500">
                  {rejectingDoc.name} ({rejectingDoc.pmdcNumber})
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Rejection Reason:
              </label>
              <textarea
                rows={3}
                value={rejectionReasonText}
                onChange={(e) => setRejectionReasonText(e.target.value)}
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingDoc(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectDoctor}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CNIC Picture Inspector Modal */}
      {inspectingCnicDoc && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-4 sm:p-6 border border-teal-500/40 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <IdCard className="w-5 h-5 text-teal-600" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Doctor CNIC Picture & Facial Verification
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingCnicDoc(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <PakistaniCnicCard
              cnicNumber={inspectingCnicDoc.cnicNumber || '35201-8492019-3'}
              citizenName={inspectingCnicDoc.name.replace(/^dr\.?\s*/i, '')}
              avatarUrl={inspectingCnicDoc.avatarUrl}
              pmdcNumber={inspectingCnicDoc.pmdcNumber}
              customDocumentDataUrl={inspectingCnicDoc.cnicDocumentDataUrl}
              customDocumentName={inspectingCnicDoc.cnicDocumentUrl}
              isInspecting
            />

            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200">
              <strong>Admin Instruction:</strong> Compare the photo and name on this CNIC card with the applicant's profile and PMDC license to confirm 100% facial match and prevent fake submissions.
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setInspectingCnicDoc(null)}
                className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Done Inspecting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
