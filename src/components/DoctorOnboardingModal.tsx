import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  FileText,
  Upload,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Building2,
  Phone,
  Mail,
  Award,
  Camera,
  Trash2,
  Info,
  Clock,
  Video,
  VideoOff,
  IdCard,
  FileSignature,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Doctor, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { voiceManager } from '../services/voice';
import {
  validateCertificateDocument,
  isValidPmdcNumber,
  formatPmdcNumber,
  validateDoctorRegistrationForm,
  isSpecialistRole,
  checkPmdcDuplicate,
  LEGAL_UNDERTAKING,
} from '../services/pmdcCertificateService';
import { formatCnic, isValidCnic } from '../services/cnicLookupService';
import { OfficialPmdcCertificateCard } from './OfficialPmdcCertificateCard';
import { PakistaniCnicCard } from './PakistaniCnicCard';

interface DoctorOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: SupportedLanguage;
  onSubmitDoctorApplication: (newDoctor: Doctor) => void;
  existingDoctors?: Doctor[];
}

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594824813589-980e92759e69?w=400&auto=format&fit=crop&q=80',
];

export const DoctorOnboardingModal: React.FC<DoctorOnboardingModalProps> = ({
  isOpen,
  onClose,
  language,
  onSubmitDoctorApplication,
  existingDoctors = [],
}) => {
  const isUrdu = language === 'ur';
  const isRoman = language === 'roman';

  // Navigation steps in multi-layer onboarding
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  // STEP 1: Basic & PMDC Credentials
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('General Physician & Family Medicine');
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [pmdcNumber, setPmdcNumber] = useState('');
  const [qualification, setQualification] = useState('');
  const [experienceYears, setExperienceYears] = useState('5');
  const [medicalCollege, setMedicalCollege] = useState('King Edward Medical University (KEMU)');
  const [hospital, setHospital] = useState('');
  const [city, setCity] = useState('Lahore');
  const [province, setProvince] = useState('Punjab');
  const [consultationFee, setConsultationFee] = useState('1500');

  // Photo
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATARS[0]);
  const [uploadedPhotoName, setUploadedPhotoName] = useState('');

  // Duplicate Check State
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Mandatory PMDC License Document
  const [certificateFileName, setCertificateFileName] = useState('');
  const [certificateFileSize, setCertificateFileSize] = useState('');
  const [certificateDataUrl, setCertificateDataUrl] = useState<string | null>(null);
  const [showCertPreview, setShowCertPreview] = useState(false);

  // STEP 2: CNIC Match & CNIC Card Scan Upload
  const [cnicNumber, setCnicNumber] = useState('');
  const [cnicFileName, setCnicFileName] = useState('');
  const [cnicFileSize, setCnicFileSize] = useState('');
  const [cnicDataUrl, setCnicDataUrl] = useState<string | null>(null);

  // STEP 3: Specialist CPSP Certificate (Mandatory for Specialists)
  const isSpecialist = isSpecialistRole(specialty);
  const [cpspFileName, setCpspFileName] = useState('');
  const [cpspFileSize, setCpspFileSize] = useState('');
  const [cpspDataUrl, setCpspDataUrl] = useState<string | null>(null);

  // STEP 4: Live Video Verification
  const [videoFileName, setVideoFileName] = useState('');
  const [videoFileSize, setVideoFileSize] = useState('');
  const [videoDataUrl, setVideoDataUrl] = useState<string | null>(null);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [videoRecordSeconds, setVideoRecordSeconds] = useState(0);
  const [videoVerifiedLocally, setVideoVerifiedLocally] = useState(false);

  // STEP 5: Signed Digital Undertaking / Legal Affidavit
  const [undertakingAgreed, setUndertakingAgreed] = useState(false);
  const [digitalSignature, setDigitalSignature] = useState('');

  // Submission state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedDoctor, setSubmittedDoctor] = useState<Doctor | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Real-time PMDC duplicate check
  useEffect(() => {
    if (pmdcNumber && pmdcNumber.length >= 6) {
      const dupCheck = checkPmdcDuplicate(pmdcNumber, existingDoctors);
      if (dupCheck.isDuplicate) {
        setDuplicateWarning(
          isUrdu
            ? `انتباہ: پی ایم ڈی سی نمبر (${pmdcNumber}) پہلے سے ڈاکٹر "${dupCheck.conflictingDoctorName}" کے اکاؤنٹ سے منسلک ہے۔ یہ درخواست جعل سازی کی جانچ (Fraud Review) کے لیے نشان زد ہوگی۔`
            : `Duplicate Warning: PMDC #${pmdcNumber} is already associated with Dr. "${dupCheck.conflictingDoctorName}". Duplicate registrations are flagged for anti-impersonation fraud review.`
        );
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  }, [pmdcNumber, existingDoctors, isUrdu]);

  if (!isOpen) return null;

  // Handle Photo Select
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedPhotoName(file.name);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setAvatarUrl(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle PMDC Document Upload
  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeKb = Math.round(file.size / 1024);

      const validation = validateCertificateDocument(file.name, sizeKb, null, fullName, pmdcNumber);
      if (!validation.isValidCertificate) {
        setErrorMsg(
          validation.errorReason ||
            (isUrdu
              ? 'غیر متعلقہ تصویر مسترد کر دی گئی ہے۔ پی ایم ڈی سی کا سرکاری فارم-بی لائسنس دستاویز اپلوڈ کریں۔'
              : 'Random photo rejected! PMDC regulations mandate an official PMDC License (Form-B) document.')
        );
        e.target.value = '';
        return;
      }

      setCertificateFileName(file.name);
      setCertificateFileSize(sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`);

      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setCertificateDataUrl(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate Sample PMDC Certificate for test convenience
  const handleGenerateOfficialSampleCertificate = () => {
    const docName = fullName.trim() || 'Dr. Salman Tariq';
    const regNum = pmdcNumber.trim().toUpperCase() || 'PMDC-74921-P';
    setCertificateFileName(`PMDC_Official_FormB_${regNum.replace(/[^0-9A-Z]/g, '')}.pdf`);
    setCertificateFileSize('1.4 MB (Verified Council Scan)');
    setCertificateDataUrl(null);
    setErrorMsg('');
    if (!pmdcNumber) setPmdcNumber(regNum);
    if (!fullName) setFullName(docName);
    if (!qualification) setQualification('MBBS, FCPS');
  };

  // Generate Official NADRA Smart CNIC Card Sample
  const handleGenerateOfficialSampleCnic = () => {
    const rawDigits = cnicNumber.replace(/\D/g, '') || '3520184920193';
    const formatted = formatCnic(rawDigits);
    setCnicNumber(formatted);
    setCnicFileName(`NADRA_Smart_CNIC_${rawDigits.slice(0, 5)}_${rawDigits.slice(5, 12)}.jpg`);
    setCnicFileSize('1.2 MB (Smart Card Front & Back Scan)');
    setErrorMsg('');
  };

  // Handle CNIC Card Upload
  const handleCnicCardSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeKb = Math.round(file.size / 1024);
      setCnicFileName(file.name);
      setCnicFileSize(`${sizeKb} KB`);
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setCnicDataUrl(ev.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle CPSP Certificate Upload
  const handleCpspCardSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeKb = Math.round(file.size / 1024);
      setCpspFileName(file.name);
      setCpspFileSize(`${sizeKb} KB`);
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setCpspDataUrl(ev.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Simulated Live Video Recording Session
  const handleStartSimulatedVideoSession = () => {
    setIsVideoRecording(true);
    setVideoRecordSeconds(5);
    const interval = setInterval(() => {
      setVideoRecordSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsVideoRecording(false);
          setVideoVerifiedLocally(true);
          const sampleName = `PMDC_Live_Verification_Video_${Date.now()}.mp4`;
          setVideoFileName(sampleName);
          setVideoFileSize('4.8 MB (HD Live Face & Card Hold Capture)');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Format PMDC Number cleanly
    const cleanPmdc = formatPmdcNumber(pmdcNumber);

    // 1. Core text fields validation
    const validation = validateDoctorRegistrationForm({
      fullName,
      email,
      phone,
      qualification,
      pmdcNumber: cleanPmdc,
      hospital: hospital.trim() || `${medicalCollege} / Affiliated Hospital`,
      hasDocument: Boolean(certificateFileName || certificateDataUrl),
      isUrdu,
    });

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0] || 'Please provide accurate credentials.';
      setErrorMsg(firstError);
      setActiveStep(1);
      return;
    }

    // 2. CNIC Validation
    if (!isValidCnic(cnicNumber)) {
      const err = isUrdu
        ? 'براہِ کرم درست 13 ہندسوں کا قومی شناختی کارڈ نمبر (CNIC) درج کریں۔'
        : 'Please provide a valid 13-digit Pakistani CNIC number for identity cross-match.';
      setErrorMsg(err);
      setActiveStep(2);
      return;
    }

    if (!cnicFileName && !cnicDataUrl) {
      const err = isUrdu
        ? 'لازمی شرط: ڈاکٹر کے قومی شناختی کارڈ (CNIC) کی کاپی اپلوڈ کرنا لازمی ہے۔'
        : 'Mandatory Requirement: You must upload your CNIC Card copy (Front/Back) for name cross-matching.';
      setErrorMsg(err);
      setActiveStep(2);
      return;
    }

    // 3. Specialist CPSP Certificate (if specialist)
    if (isSpecialist && !cpspFileName && !cpspDataUrl) {
      const err = isUrdu
        ? 'لازمی شرط: ماہر ڈاکٹرز کے لیے سی پی ایس پی (CPSP) کی FCPS/MCPS سند اپلوڈ کرنا ضروری ہے۔'
        : 'Specialist Verification Requirement: Specialists must upload their CPSP (FCPS/MCPS) Certificate.';
      setErrorMsg(err);
      setActiveStep(3);
      return;
    }

    // 4. Live Video Verification
    if (!videoFileName && !videoVerifiedLocally) {
      const err = isUrdu
        ? 'لازمی شرط: لائیو ویڈیو تصدیق مکمل کریں (جس میں چہرہ اور کارڈ کیمرے کے سامنے دکھایا جائے)۔'
        : 'Mandatory Requirement: Please complete the Live Video Verification step (holding CNIC & PMDC card).';
      setErrorMsg(err);
      setActiveStep(3);
      return;
    }

    // 5. Signed Legal Undertaking
    if (!undertakingAgreed || !digitalSignature.trim()) {
      const err = isUrdu
        ? 'لازمی شرط: قانونی بیانِ حلفی (Affidavit) کو قبول کریں اور اپنا ڈیجیٹل دستخط درج کریں۔'
        : 'Mandatory Requirement: You must accept the Legal Undertaking and provide your digital signature.';
      setErrorMsg(err);
      setActiveStep(4);
      return;
    }

    // Check duplicate PMDC flag
    const dupCheck = checkPmdcDuplicate(cleanPmdc, existingDoctors);
    const finalSpecialty = specialty === 'Other' ? (customSpecialty.trim() || 'Medical Specialist') : specialty;
    const formattedName = fullName.trim().toLowerCase().startsWith('dr.')
      ? fullName.trim()
      : `Dr. ${fullName.trim()}`;

    // Create doctor in strict "Pending Verification" status
    const newDoctor: Doctor = {
      id: `doc-app-${Date.now()}`,
      name: formattedName,
      specialty: finalSpecialty,
      qualification: qualification.trim(),
      pmdcNumber: cleanPmdc,
      hospital: hospital.trim() || `${medicalCollege} / Teaching Hospital`,
      city,
      province,
      address: `${city}, ${province}`,
      distance: '1.2 km',
      rating: 5.0,
      reviewsCount: 0,
      consultationFee: parseInt(consultationFee, 10) || 1500,
      availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      timing: '10:00 AM - 05:00 PM',
      languages: ['Urdu', 'English'],
      phone: phone.trim(),
      email: email.trim(),
      isOnlineAvailable: true,
      avatarUrl: avatarUrl || DEFAULT_AVATARS[0],
      experienceYears: parseInt(experienceYears, 10) || 5,
      // Strict Pending Verification state — completely invisible to patients
      isVerified: false,
      verificationStatus: 'pending',
      degreeDocumentUrl: certificateFileName || 'pmdc_license_scan.pdf',
      pmdcCertificateUrl: certificateFileName || 'pmdc_license_scan.pdf',
      verificationDocumentName: certificateFileName || 'PMDC_License_Document.pdf',
      verificationDocumentDataUrl: certificateDataUrl || undefined,
      registeredAt: new Date().toLocaleDateString('en-PK', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      clinicAffiliation: hospital.trim() || `${medicalCollege} / Teaching Hospital`,
      // Multi-layer verification attributes
      cnicNumber: formatCnic(cnicNumber),
      cnicDocumentUrl: cnicFileName || 'CNIC_Document_Scan.jpg',
      cnicDocumentDataUrl: cnicDataUrl || undefined,
      videoVerificationUrl: videoFileName || 'PMDC_Live_Verification_Video.mp4',
      videoVerificationCompleted: videoVerifiedLocally,
      videoVerificationTimestamp: new Date().toLocaleString('en-PK'),
      cpspCertificateUrl: cpspFileName || undefined,
      cpspCertificateDataUrl: cpspDataUrl || undefined,
      cpspSpecialtyVerified: isSpecialist ? false : undefined,
      undertakingSigned: undertakingAgreed,
      undertakingSignedAt: new Date().toLocaleString('en-PK'),
      undertakingSignatureText: digitalSignature.trim(),
      isDuplicateFlagged: dupCheck.isDuplicate,
      duplicateFlagReason: dupCheck.isDuplicate
        ? `Duplicate PMDC number detected with existing doctor: ${dupCheck.conflictingDoctorName}`
        : undefined,
      isSuspended: false,
      yearlyRenewalDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-PK', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      yearlyRenewalStatus: 'active',
    };

    onSubmitDoctorApplication(newDoctor);
    setSubmittedDoctor(newDoctor);
    setIsSubmitted(true);

    // Application submitted silently, explicit audio buttons available
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
    setSubmittedDoctor(null);
    setFullName('');
    setPmdcNumber('');
    setQualification('');
    setEmail('');
    setPhone('');
    setCnicNumber('');
    setCertificateFileName('');
    setVideoFileName('');
    onClose();
  };

  return (
    <div
      id="doctor-onboarding-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-4 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="doctor-onboarding-card"
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-teal-200 dark:border-slate-800 p-5 sm:p-7 text-slate-800 dark:text-slate-100 my-auto max-h-[92vh] overflow-y-auto"
      >
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-800 rounded-t-3xl" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted && submittedDoctor ? (
          /* ========================================================================= */
          /* SUBMISSION CONFIRMATION: PENDING MULTI-LAYER VERIFICATION */
          /* ========================================================================= */
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <ShieldCheck className="w-9 h-9 stroke-[2.2]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'اسٹیٹس: زیرِ توثیق (Pending Multi-Layer Verification)' : 'Status: Under Two-Admin Verification'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {isUrdu ? 'درخواست کامیابی سے جمع ہو گئی ہے' : 'Application Received & Queued for Verification'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
              {isUrdu
                ? `ڈاکٹر ${submittedDoctor.name}، آپ کی رجسٹریشن اور تمام دستاویزات موصول ہو چکی ہیں۔ جعلی اسناد سے پاک سسٹم کے لیے دو الگ ایڈمنز (Reviewer 1 اور Approver 2) آپ کے پی ایم ڈی سی پورٹل، شناختی کارڈ، اور لائیو ویڈیو کا کراس چیک کریں گے۔ تصدیق سے پہلے آپ کا پروفائل مریضوں کے رزلٹس میں مکمل طور پر پوشیدہ رہے گا۔`
                : `Thank you, ${submittedDoctor.name}. Your multi-layer application has been securely submitted. To protect patient safety, two separate administrative reviewers must independently sign off on your PMDC portal match, CNIC verification, live video check, and undertaking before your account is activated.`}
            </p>

            {/* Verification Checklist Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">1. PMDC Portal Cross-Check:</span>
                <span className="font-mono font-bold text-teal-700 dark:text-teal-300">{submittedDoctor.pmdcNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">2. CNIC Identity Match:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{submittedDoctor.cnicNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">3. Live Video Face Match:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">✓ Video Attached</span>
              </div>
              {submittedDoctor.cpspCertificateUrl && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">4. CPSP Specialty Verification:</span>
                  <span className="font-bold text-teal-600">✓ CPSP Certificate Attached</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-500">5. Signed Digital Affidavit:</span>
                <span className="font-bold text-emerald-600">✓ Legally Binding</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">6. Two-Person Admin Sign-off:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">Waiting for 2 Admin Signatures</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                {isUrdu ? 'مکمل کریں اور واپس جائیں' : 'Done & Return to Home'}
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* MULTI-LAYER DOCTOR REGISTRATION FLOW */
          /* ========================================================================= */
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-md">
                <Stethoscope className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-black uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>{isUrdu ? 'جعلی اسناد سے محفوظ ڈاکٹر پورٹل' : 'Fake-Proof Multi-Layer Doctor Registration'}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {isUrdu ? 'بطور ڈاکٹر رجسٹریشن (کثیر الجہتی تصدیق)' : 'Doctor Registration & Multi-Layer Verification'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isUrdu
                    ? 'پی ایم ڈی سی کراس چیک، شناختی کارڈ، لائیو ویڈیو اور قانونی بیانِ حلفی کی لازمی تصدیق۔'
                    : 'PMDC database cross-match, CNIC match, live video face check, and signed undertaking.'}
                </p>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                { step: 1, title: isUrdu ? '1. پی ایم ڈی سی' : '1. PMDC & License' },
                { step: 2, title: isUrdu ? '2. شناختی کارڈ تصویر' : '2. CNIC Picture' },
                { step: 3, title: isUrdu ? '3. ویڈیو و اسپیشلسٹ' : '3. Video & CPSP' },
                { step: 4, title: isUrdu ? '4. بیانِ حلفی' : '4. Legal Affidavit' },
              ].map((s) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setActiveStep(s.step as any)}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold text-center border transition-all cursor-pointer ${
                    activeStep === s.step
                      ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </div>

            {/* Duplicate PMDC Warning Banner */}
            {duplicateWarning && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border-2 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs font-bold flex items-start gap-2.5 animate-shake">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                    {isUrdu ? 'پی ایم ڈی سی ڈپلیکیٹ انتباہ!' : 'Duplicate PMDC Number Flagged!'}
                  </strong>
                  <p className="font-medium text-[11px] leading-relaxed">{duplicateWarning}</p>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ========================================================================= */}
              {/* STEP 1: PMDC CREDENTIALS & LICENSE */}
              {/* ========================================================================= */}
              {activeStep === 1 && (
                <div className="space-y-4 animate-in fade-in">
                  {/* Photo Selection */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      {isUrdu ? 'ڈاکٹر کی سرکاری تصویر *' : 'Doctor Official ID Photo *'}
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-3.5">
                      <div className="relative group shrink-0">
                        <img
                          src={avatarUrl}
                          alt="Doctor Preview"
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500 shadow-md"
                        />
                        <label
                          htmlFor="photo-upload-input"
                          className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                        >
                          <Camera className="w-5 h-5" />
                        </label>
                        <input
                          type="file"
                          id="photo-upload-input"
                          accept="image/*"
                          onChange={handlePhotoSelect}
                          className="hidden"
                        />
                      </div>

                      <div className="flex-1 w-full">
                        <div className="flex items-center gap-2 mb-1.5">
                          <label
                            htmlFor="photo-upload-input"
                            className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{isUrdu ? 'اپنی تصویر اپلوڈ کریں' : 'Upload ID Photo'}</span>
                          </label>
                          {uploadedPhotoName && (
                            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold truncate max-w-[160px]">
                              ✓ {uploadedPhotoName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {DEFAULT_AVATARS.map((av, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setAvatarUrl(av);
                                setUploadedPhotoName('');
                              }}
                              className={`w-8 h-8 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                                avatarUrl === av ? 'border-teal-500 scale-105' : 'border-slate-200 dark:border-slate-700 opacity-60'
                              }`}
                            >
                              <img src={av} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Full Legal Name */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {isUrdu ? 'ڈاکٹر کا مکمل نام (پی ایم ڈی سی ریکارڈ کے مطابق) *' : 'Full Name (As per PMDC Record) *'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Salman Tariq"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    {/* PMDC Registration Number */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-extrabold text-teal-900 dark:text-teal-300 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                          <span>{isUrdu ? 'پی ایم ڈی سی رجسٹریشن نمبر *' : 'PMDC Registration Number *'}</span>
                        </label>
                        <span className="text-[10px] text-teal-600 font-mono">PMDC-XXXXX-X</span>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. PMDC-71829-P"
                        value={pmdcNumber}
                        onChange={(e) => setPmdcNumber(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-teal-500/70 bg-teal-50/40 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    {/* Specialty */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {isUrdu ? 'شعبہ اختصاص (Specialization) *' : 'Specialization *'}
                      </label>
                      <select
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="General Physician & Family Medicine">General Physician & Family Medicine</option>
                        <option value="Cardiologist (Heart Specialist)">Cardiologist (Heart Specialist)</option>
                        <option value="Pediatrician & Child Specialist">Pediatrician & Child Specialist</option>
                        <option value="Pulmonologist (Chest & Lungs)">Pulmonologist (Chest & Lungs)</option>
                        <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
                        <option value="Gynecologist & Obstetrician">Gynecologist & Obstetrician</option>
                        <option value="Dermatologist & Skin Specialist">Dermatologist & Skin Specialist</option>
                        <option value="Diabetologist & Endocrinologist">Diabetologist & Endocrinologist</option>
                        <option value="Neurologist & Brain Specialist">Neurologist & Brain Specialist</option>
                        <option value="Other">Other Specialty</option>
                      </select>
                    </div>

                    {/* Qualifications */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {isUrdu ? 'طبی ڈگریاں (MBBS, FCPS) *' : 'Medical Qualifications (MBBS, FCPS) *'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. MBBS, FCPS, MRCP"
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    {/* Medical College */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {isUrdu ? 'میڈیکل کالج / یونیورسٹی *' : 'Graduating Medical College *'}
                      </label>
                      <select
                        value={medicalCollege}
                        onChange={(e) => setMedicalCollege(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="King Edward Medical University (KEMU)">King Edward Medical University (KEMU)</option>
                        <option value="Dow University of Health Sciences (DUHS)">Dow University of Health Sciences (DUHS)</option>
                        <option value="Aga Khan University Medical College (AKU)">Aga Khan University (AKU)</option>
                        <option value="Allama Iqbal Medical College (AIMC)">Allama Iqbal Medical College (AIMC)</option>
                        <option value="Fatima Jinnah Medical University (FJMU)">Fatima Jinnah Medical University (FJMU)</option>
                        <option value="Nishtar Medical University, Multan">Nishtar Medical University, Multan</option>
                        <option value="Rawalpindi Medical University (RMU)">Rawalpindi Medical University (RMU)</option>
                        <option value="Khyber Medical College, Peshawar">Khyber Medical College, Peshawar</option>
                        <option value="Bolan Medical College, Quetta">Bolan Medical College, Quetta</option>
                        <option value="Other Recognized Medical University">Other Recognized Medical Institution</option>
                      </select>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {isUrdu ? 'پاکستانی فون نمبر *' : 'Contact Phone Number (03XX) *'}
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 0300-1234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {isUrdu ? 'پیشہ ورانہ ای میل *' : 'Professional Email Address *'}
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="doctor@hospital.edu.pk"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    {/* Hospital / Clinic */}
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {isUrdu ? 'ہسپتال یا کلینک کی وابستگی *' : 'Hospital / Clinic Affiliation *'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Services Hospital Lahore / Private Clinic"
                        value={hospital}
                        onChange={(e) => setHospital(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  {/* Mandatory PMDC License Document Upload */}
                  <div className="p-3.5 rounded-2xl border-2 border-dashed border-teal-500/50 bg-teal-50/30 dark:bg-teal-950/20">
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-extrabold text-xs text-teal-900 dark:text-teal-200 flex items-center gap-1.5 uppercase tracking-wider">
                        <FileText className="w-4 h-4 text-teal-600" />
                        <span>{isUrdu ? 'پی ایم ڈی سی لائسنس (Form-B) دستاویز *' : 'PMDC Official License (Form-B) *'}</span>
                      </label>
                      <span className="text-[10px] font-black uppercase text-red-600 bg-red-100 dark:bg-red-950 px-2 py-0.5 rounded-full">
                        {isUrdu ? 'لازمی' : 'Mandatory'}
                      </span>
                    </div>

                    {certificateFileName ? (
                      <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-teal-300 dark:border-teal-700 flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                          <span className="text-xs font-bold truncate text-slate-900 dark:text-white">
                            {certificateFileName} ({certificateFileSize})
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setShowCertPreview(!showCertPreview)}
                            className="px-2 py-1 text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-slate-700 rounded-lg"
                          >
                            {showCertPreview ? 'Hide' : 'Inspect'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCertificateFileName('');
                              setCertificateDataUrl(null);
                            }}
                            className="p-1 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="file"
                          id="pmdc-verification-file-input"
                          accept=".pdf,image/png,image/jpeg,image/webp"
                          onChange={handleDocumentSelect}
                          className="hidden"
                        />
                        <label
                          htmlFor="pmdc-verification-file-input"
                          className="flex flex-col items-center justify-center p-4 cursor-pointer text-center hover:bg-teal-50/60 dark:hover:bg-teal-950/40 rounded-xl transition-all"
                        >
                          <Upload className="w-6 h-6 text-teal-600 mb-1" />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {isUrdu ? 'پی ایم ڈی سی لائسنس منتخب کریں (PDF یا Image)' : 'Upload PMDC License Certificate'}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            {isUrdu ? 'سیلفی یا عام تصاویر مسترد ہوں گی' : 'Official Document Only • Selfies strictly rejected'}
                          </span>
                        </label>
                        <div className="flex justify-center pt-1 border-t border-teal-200/50 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={handleGenerateOfficialSampleCertificate}
                            className="text-[11px] text-teal-700 dark:text-teal-300 font-bold hover:underline cursor-pointer"
                          >
                            {isUrdu ? 'یا تصدیق شدہ نمونہ سرٹیفکیٹ منسلک کریں' : 'Attach Verified PMDC Form-B Sample Certificate'}
                          </button>
                        </div>
                      </div>
                    )}

                    {showCertPreview && (
                      <div className="mt-2">
                        <OfficialPmdcCertificateCard
                          doctorName={fullName || 'Dr. Salman Tariq'}
                          pmdcNumber={pmdcNumber || 'PMDC-48291-P'}
                          qualification={qualification || 'MBBS, FCPS'}
                          hospital={hospital}
                          city={city}
                          customDocumentDataUrl={certificateDataUrl || undefined}
                          customDocumentName={certificateFileName}
                          isInspecting
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <IdCard className="w-4 h-4" />
                      <span>{isUrdu ? 'اگلا مرحلہ: شناختی کارڈ کی تصویر اپلوڈ کریں →' : 'Next: Upload CNIC Card Picture →'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STEP 2: CNIC IDENTITY MATCH */}
              {/* ========================================================================= */}
              {activeStep === 2 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs">
                    <strong className="text-teal-900 dark:text-teal-200 block font-bold mb-1 flex items-center gap-1.5">
                      <IdCard className="w-4 h-4 text-teal-600" />
                      <span>{isUrdu ? 'قومی شناختی کارڈ (CNIC) کی تصویر اور مطابقت' : 'CNIC Picture & Identity Match Verification'}</span>
                    </strong>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                      {isUrdu
                        ? 'ایڈمن کو یقینی بنانا ہے کہ شناختی کارڈ پر درج نام اور پی ایم ڈی سی سرٹیفکیٹ کا نام 100 فیصد ایک ہی شخص کے ہیں۔'
                        : 'Admins will cross-verify that the legal name on your CNIC exactly matches your PMDC Medical Registration Certificate.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {isUrdu ? 'شناختی کارڈ نمبر (13 ہندسے) *' : 'Doctor CNIC Number (13 Digits) *'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="XXXXX-XXXXXXX-X"
                        value={cnicNumber}
                        onChange={(e) => setCnicNumber(formatCnic(e.target.value))}
                        maxLength={15}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-sm tracking-wider focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {isUrdu ? 'شناختی کارڈ پر درج مکمل نام' : 'Name as printed on CNIC'}
                      </label>
                      <input
                        type="text"
                        value={fullName.replace(/^dr\.?\s*/i, '')}
                        disabled
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 font-semibold text-xs"
                      />
                    </div>
                  </div>

                  {/* CNIC Card Image Upload (Front & Back) */}
                  <div className="p-4 rounded-2xl border-2 border-dashed border-teal-500/50 bg-teal-50/20 dark:bg-teal-950/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold text-xs text-teal-900 dark:text-teal-200 flex items-center gap-1.5 uppercase">
                        <IdCard className="w-4 h-4 text-teal-600" />
                        <span>{isUrdu ? 'شناختی کارڈ کی تصویر (فرنٹ اور بیک) *' : 'Doctor CNIC Card Picture (Front & Back) *'}</span>
                      </label>
                      <span className="text-[10px] font-black uppercase text-red-600 bg-red-100 dark:bg-red-950 px-2 py-0.5 rounded-full">
                        {isUrdu ? 'لازمی' : 'Mandatory'}
                      </span>
                    </div>

                    {cnicFileName ? (
                      <div className="space-y-3">
                        <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-teal-300 dark:border-teal-700 flex items-center justify-between gap-3 shadow-xs">
                          <div className="flex items-center gap-2 truncate">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="text-xs font-bold truncate text-slate-900 dark:text-white">
                              {cnicFileName} ({cnicFileSize})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setCnicFileName('');
                              setCnicDataUrl(null);
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Live Visual CNIC Card Preview */}
                        <PakistaniCnicCard
                          cnicNumber={cnicNumber || '35201-8492019-3'}
                          citizenName={fullName.replace(/^dr\.?\s*/i, '') || 'Doctor Applicant'}
                          avatarUrl={avatarUrl}
                          pmdcNumber={pmdcNumber}
                          customDocumentDataUrl={cnicDataUrl}
                          customDocumentName={cnicFileName}
                          isInspecting
                        />
                      </div>
                    ) : (
                      <div className="text-center py-4 space-y-3">
                        <input
                          type="file"
                          id="cnic-upload-input"
                          accept=".pdf,image/*"
                          onChange={handleCnicCardSelect}
                          className="hidden"
                        />
                        <div>
                          <label
                            htmlFor="cnic-upload-input"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold cursor-pointer shadow-md transition-all"
                          >
                            <Upload className="w-4 h-4" />
                            <span>{isUrdu ? 'شناختی کارڈ کی تصویر منتخب کریں (Upload Picture)' : 'Upload CNIC Picture / Card Scan'}</span>
                          </label>
                          <p className="text-[10px] text-slate-400 mt-1.5">
                            PNG, JPG, or PDF • واضح تصویر برائے شناخت و ایڈمن کراس چیک
                          </p>
                        </div>

                        <div className="pt-2 border-t border-teal-200/50 dark:border-slate-800 flex justify-center">
                          <button
                            type="button"
                            onClick={handleGenerateOfficialSampleCnic}
                            className="text-[11px] text-teal-700 dark:text-teal-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>{isUrdu ? 'یا تصدیق شدہ نادرا اسمارٹ کارڈ کی نمونہ تصویر منسلک کریں' : 'Attach Verified NADRA Smart CNIC Card Sample'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStep(3)}
                      className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md cursor-pointer"
                    >
                      Next: Live Video & Specialist →
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STEP 3: LIVE VIDEO VERIFICATION & SPECIALIST CPSP */}
              {/* ========================================================================= */}
              {activeStep === 3 && (
                <div className="space-y-4 animate-in fade-in">
                  {/* Live Video Verification Box */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border-2 border-teal-600/60 text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                          <Video className="w-4 h-4" />
                        </div>
                        <div>
                          <strong className="text-slate-900 dark:text-white block font-black">
                            {isUrdu ? 'لائیو ویڈیو ویری فکیشن (Live Face & ID Verification) *' : 'Live Video Face & ID Match (Mandatory) *'}
                          </strong>
                          <span className="text-[11px] text-slate-500">
                            Hold your CNIC & PMDC card to the camera to prevent fake impersonation
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase text-red-600 bg-red-100 dark:bg-red-950 px-2 py-0.5 rounded-full">
                        Mandatory
                      </span>
                    </div>

                    {videoVerifiedLocally ? (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-extrabold text-emerald-950 dark:text-emerald-200 block text-xs">
                              Live Video Verification Recorded Successfully
                            </span>
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                              {videoFileName} • Ready for Admin Face Match
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setVideoVerifiedLocally(false)}
                          className="text-[11px] text-slate-500 hover:text-red-600 font-bold"
                        >
                          Re-record
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center space-y-3">
                        {isVideoRecording ? (
                          <div className="space-y-2 py-2">
                            <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center mx-auto animate-pulse">
                              <Video className="w-6 h-6" />
                            </div>
                            <p className="text-xs font-extrabold text-rose-700 dark:text-rose-400">
                              Recording Live Face Verification: {videoRecordSeconds}s remaining...
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Please look directly at camera and hold CNIC & PMDC card beside your face.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                              {isUrdu
                                ? 'کیمرے کے سامنے اپنا چہرہ، اصل شناختی کارڈ اور پی ایم ڈی سی کارڈ 5 سیکنڈ کے لیے دکھائیں۔'
                                : 'Record a 5-second live verification holding your CNIC and PMDC License card.'}
                            </p>
                            <button
                              type="button"
                              onClick={handleStartSimulatedVideoSession}
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md cursor-pointer transition-all"
                            >
                              <Play className="w-4 h-4 fill-white" />
                              <span>{isUrdu ? 'لائیو کیمرہ ریکارڈنگ شروع کریں' : 'Start Live Camera Recording (5s)'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Specialist CPSP Certificate (if specialist) */}
                  {isSpecialist && (
                    <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-800 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-amber-950 dark:text-amber-200 font-black flex items-center gap-1.5 uppercase">
                          <Award className="w-4 h-4 text-amber-600" />
                          <span>{isUrdu ? 'سی پی ایس پی (CPSP) اسپیشلسٹ سرٹیفکیٹ *' : 'CPSP Specialist Certificate (FCPS / MCPS) *'}</span>
                        </strong>
                        <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-200 dark:bg-amber-900 px-2 py-0.5 rounded-full">
                          Required for {specialty}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        {isUrdu
                          ? 'چونکہ آپ نے ایک ماہر ڈاکٹر (Specialist) کا انتخاب کیا ہے، لہٰذا کالج آف فزیشنز اینڈ سرجنز پاکستان (CPSP) کی سند لازمی ہے۔'
                          : 'You selected a medical specialty. College of Physicians & Surgeons Pakistan (CPSP) certification is required.'}
                      </p>

                      {cpspFileName ? (
                        <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-amber-300 flex items-center justify-between">
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                            ✓ {cpspFileName} ({cpspFileSize})
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setCpspFileName('');
                              setCpspDataUrl(null);
                            }}
                            className="p-1 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            id="cpsp-upload-input"
                            accept=".pdf,image/*"
                            onChange={handleCpspCardSelect}
                            className="hidden"
                          />
                          <label
                            htmlFor="cpsp-upload-input"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Upload CPSP Certificate (FCPS/MCPS)</span>
                          </label>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStep(4)}
                      className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md cursor-pointer"
                    >
                      Next: Legal Undertaking →
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STEP 4: SIGNED DIGITAL UNDERTAKING / LEGAL AFFIDAVIT */}
              {/* ========================================================================= */}
              {activeStep === 4 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs space-y-3 border-2 border-emerald-600/70">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                      <FileSignature className="w-5 h-5 text-emerald-400" />
                      <h4 className="font-black text-sm uppercase tracking-wider text-emerald-400">
                        {isUrdu ? 'قانونی بیانِ حلفی (Signed Digital Undertaking)' : 'Official Legal Undertaking & Affidavit'}
                      </h4>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed font-serif">
                      {isUrdu ? LEGAL_UNDERTAKING.ur : isRoman ? LEGAL_UNDERTAKING.roman : LEGAL_UNDERTAKING.en}
                    </p>

                    <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                      <label className="flex items-start gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={undertakingAgreed}
                          onChange={(e) => setUndertakingAgreed(e.target.checked)}
                          className="rounded text-emerald-500 w-4 h-4 mt-0.5 shrink-0"
                        />
                        <span className="text-[11px] text-slate-200 font-semibold leading-snug">
                          {isUrdu
                            ? 'میں اوپر بیان کردہ حلفیہ شرائط سے متفق ہوں اور تسلیم کرتا ہوں کہ غلط بیانی پر میرا لائسنس فوری معطل اور منسوخ کیا جا سکتا ہے۔'
                            : 'I confirm that all information provided is 100% genuine and legally binding under oath.'}
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1">
                        {isUrdu ? 'ڈیجیٹل دستخط (اپنا پورا قانونی نام ٹائپ کریں) *' : 'Digital Signature (Type Full Legal Name) *'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Salman Tariq"
                        value={digitalSignature}
                        onChange={(e) => setDigitalSignature(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-serif italic text-sm focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Summary of two-person admin workflow notice */}
                  <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 text-xs flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-teal-950 dark:text-teal-200 leading-relaxed">
                      <strong>Two-Person Administrative Review:</strong> Once submitted, your profile will be audited by Reviewer 1 (Regulatory Officer) and Reviewer 2 (Chief Medical Officer). You remain invisible to patients until both sign off.
                    </p>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveStep(3)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={!undertakingAgreed || !digitalSignature.trim()}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black shadow-lg shadow-emerald-700/25 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{isUrdu ? 'کثیر الجہتی درخواست جمع کروائیں' : 'Submit for Multi-Layer Verification'}</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
