import React, { useState } from 'react';
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
} from 'lucide-react';
import { Doctor, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { voiceManager } from '../services/voice';

interface DoctorOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: SupportedLanguage;
  onSubmitDoctorApplication: (newDoctor: Doctor) => void;
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
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isUrdu = language === 'ur';
  const isRoman = language === 'roman';

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('General Physician & Family Medicine');
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [pmdcNumber, setPmdcNumber] = useState('');
  const [qualification, setQualification] = useState('');
  const [experienceYears, setExperienceYears] = useState('5');
  const [hospital, setHospital] = useState('');
  const [city, setCity] = useState('Lahore');
  const [province, setProvince] = useState('Punjab');
  const [consultationFee, setConsultationFee] = useState('1500');

  // Photo state
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATARS[0]);
  const [uploadedPhotoName, setUploadedPhotoName] = useState('');

  // Mandatory Verification Document state
  const [certificateFileName, setCertificateFileName] = useState('');
  const [certificateFileSize, setCertificateFileSize] = useState('');
  const [certificateDataUrl, setCertificateDataUrl] = useState<string | null>(null);

  // Submission state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedDoctor, setSubmittedDoctor] = useState<Doctor | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Handle Photo Upload
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

  // Handle Mandatory Document Upload
  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCertificateFileName(file.name);
      const sizeKb = Math.round(file.size / 1024);
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

  const handleRemoveDocument = () => {
    setCertificateFileName('');
    setCertificateFileSize('');
    setCertificateDataUrl(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validation 1: Required text fields
    if (!fullName.trim() || !pmdcNumber.trim() || !qualification.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg(
        isUrdu
          ? 'براہِ کرم تمام ضروری خانے (نام، پی ایم ڈی سی نمبر، ڈگری، فون نمبر اور ای میل) مکمل پُر فرمائیں۔'
          : 'Please complete all required fields (Name, PMDC Number, Qualification, Contact Number, and Email).'
      );
      return;
    }

    // Validation 2: MANDATORY Verification Document (Must not be empty)
    if (!certificateFileName && !certificateDataUrl) {
      setErrorMsg(
        isUrdu
          ? 'لازمی شرط: براہِ کرم پی ایم ڈی سی سرٹیفکیٹ یا لائسنس دستاویز کی نقل ضرور اپلوڈ کریں۔ اس کے بغیر رجسٹریشن ممکن نہیں ہے۔'
          : 'Mandatory Requirement: You must upload your PMDC Certificate or license proof. Applications cannot be processed without this document.'
      );
      return;
    }

    // Format PMDC Number cleanly
    let cleanPmdc = pmdcNumber.trim().toUpperCase();
    if (!cleanPmdc.startsWith('PMDC-') && !cleanPmdc.startsWith('PMDC#')) {
      cleanPmdc = `PMDC-${cleanPmdc}`;
    }

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
      hospital: hospital.trim() || 'Private Practice / Telehealth Clinic',
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
      clinicAffiliation: hospital.trim(),
    };

    onSubmitDoctorApplication(newDoctor);
    setSubmittedDoctor(newDoctor);
    setIsSubmitted(true);

    const voiceMsg = isUrdu
      ? 'آپ کی درخواست موصول ہو گئی ہے اور زیرِ جائزہ ہے۔ تصدیق کے بعد آپ کو مطلع کر دیا جائے گا۔'
      : isRoman
      ? 'Aap ki application mosool ho chuki hai aur review mein hai. Tasdeeq ke baad aapko aagah kiya jaye ga.'
      : 'Your application has been received and is under review. You will be notified once verified.';
    voiceManager.speak(voiceMsg, language);
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
    setSubmittedDoctor(null);
    setFullName('');
    setPmdcNumber('');
    setQualification('');
    setEmail('');
    setPhone('');
    setHospital('');
    setCertificateFileName('');
    setCertificateFileSize('');
    setCertificateDataUrl(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto ${
          isUrdu ? 'rtl font-urdu' : 'ltr'
        }`}
        dir={isUrdu ? 'rtl' : 'ltr'}
      >
        {/* Close button */}
        <button
          onClick={handleResetForm}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted && submittedDoctor ? (
          /* ========================================================================= */
          /* 2. PENDING VERIFICATION CONFIRMATION SCREEN */
          /* ========================================================================= */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border-2 border-amber-500 text-amber-500 flex items-center justify-center mx-auto shadow-md">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider mb-2 border border-amber-500/40">
                <Clock className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'حیثیت: زیرِ تصدیق' : isRoman ? 'Status: Pending Verification' : 'Status: Pending Verification'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {isUrdu
                  ? 'آپ کی درخواست موصول ہو گئی ہے اور زیرِ جائزہ ہے'
                  : isRoman
                  ? 'Aap ki darkhwast mosool ho chuki hai aur jaiza mein hai'
                  : 'Your application has been received and is under review.'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed font-medium">
                {isUrdu
                  ? 'آپ کی تصدیق ہوتے ہی آپ کو مطلع کر دیا جائے گا۔'
                  : isRoman
                  ? 'Aap ki tasdeeq mukammal hotay hi aapko inform kar diya jaye ga.'
                  : 'You will be notified once verified.'}
              </p>
            </div>

            {/* Crucial Governance Guardrail Callout */}
            <div className="p-4 rounded-2xl bg-teal-50/80 dark:bg-slate-800/80 border border-teal-200 dark:border-teal-800 text-xs text-left rtl:text-right text-slate-700 dark:text-slate-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-teal-800 dark:text-teal-300">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>{isUrdu ? 'مریضوں کی حفاظت اور پی ایم ڈی سی پروٹوکول' : 'Patient Safety & PMDC Protocol'}</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-95">
                {isUrdu
                  ? 'حکومتی قواعد و ضوابط کے تحت، جب تک میڈیکل ایڈمن بورڈ آپ کے پی ایم ڈی سی رجسٹریشن نمبر اور لائسنس دستاویز کی باقاعدہ جانچ مکمل نہیں کر لیتا، آپ کا پروفائل مریضوں کے سرچ رزلٹس یا فائنڈ کیئر لسٹنگ میں ظاہر نہیں ہوگا۔'
                  : 'In compliance with clinical governance standards, your profile remains completely hidden from patient-facing search results, Doctor Finder listings, and case approval queues until manually reviewed and verified by an administrator.'}
              </p>
            </div>

            {/* Submitted Application Summary Card */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2 text-left rtl:text-right">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <img src={submittedDoctor.avatarUrl} alt="" className="w-7 h-7 rounded-lg object-cover" />
                  <span>{submittedDoctor.name}</span>
                </span>
                <span className="font-mono bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-extrabold px-2 py-0.5 rounded text-[11px]">
                  {submittedDoctor.pmdcNumber}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                <div>• <strong>{isUrdu ? 'شعبہ:' : 'Specialization:'}</strong> {submittedDoctor.specialty}</div>
                <div>• <strong>{isUrdu ? 'اسناد:' : 'Qualification:'}</strong> {submittedDoctor.qualification}</div>
                <div>• <strong>{isUrdu ? 'لائسنس فائل:' : 'License Document:'}</strong> {submittedDoctor.verificationDocumentName}</div>
                <div>• <strong>{isUrdu ? 'رابطہ:' : 'Contact:'}</strong> {submittedDoctor.phone}</div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetForm}
                className="w-full sm:w-auto px-8 py-3 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                {isUrdu ? 'سمجھ آگیا، پورٹل پر جائیں' : 'Understood & Continue'}
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* 1. DOCTOR REGISTRATION FORM (DISTINCT FLOW) */
          /* ========================================================================= */
          <div className="space-y-4">
            <div className="flex items-start gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Stethoscope className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>{isUrdu ? 'ڈاکٹر آن بورڈنگ پورٹل' : 'PMDC Licensed Physician Registration'}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {isUrdu ? 'بطور ڈاکٹر رجسٹریشن کروائیں' : 'Register as a Doctor'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isUrdu
                    ? 'پاکستان میڈیکل اینڈ ڈینٹل کونسل (پی ایم ڈی سی) کے تحت تصدیق کے بعد آپ کا اکاؤنٹ فعال ہوگا۔'
                    : 'Submit your credentials & PMDC license for mandatory admin verification before joining patient care.'}
                </p>
              </div>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Profile Photo Selection & Upload */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  {isUrdu ? 'پروفائل تصویر (Profile Photo) *' : 'Doctor Profile Photo *'}
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative group shrink-0">
                    <img
                      src={avatarUrl}
                      alt="Doctor Preview"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500 shadow-md"
                    />
                    <label
                      htmlFor="photo-upload-input"
                      className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                      title="Upload custom photo"
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
                        className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'اپنی تصویر اپلوڈ کریں' : 'Upload Photo'}</span>
                      </label>
                      {uploadedPhotoName && (
                        <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold truncate max-w-[160px]">
                          ✓ {uploadedPhotoName}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1.5">
                      {isUrdu ? 'یا پہلے سے موجود تصویر منتخب کریں:' : 'Or choose a verified physician avatar:'}
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {DEFAULT_AVATARS.map((av, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setAvatarUrl(av);
                            setUploadedPhotoName('');
                          }}
                          className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                            avatarUrl === av ? 'border-teal-500 scale-105 shadow-xs' : 'border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={av} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Core Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {/* Full Name */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isUrdu ? 'ڈاکٹر کا مکمل نام *' : 'Doctor Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Salman Tariq"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* PMDC Registration Number (CRUCIAL) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-extrabold text-teal-800 dark:text-teal-300 flex items-center gap-1">
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
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-teal-500/60 bg-teal-50/40 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Specialization */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isUrdu ? 'شعبہ اختصاص (Specialization) *' : 'Specialization *'}
                  </label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500"
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
                    <option value="Gastroenterologist">Gastroenterologist</option>
                    <option value="Other">Other Specialty</option>
                  </select>
                  {specialty === 'Other' && (
                    <input
                      type="text"
                      placeholder="Specify your specialty"
                      value={customSpecialty}
                      onChange={(e) => setCustomSpecialty(e.target.value)}
                      className="w-full mt-2 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                    />
                  )}
                </div>

                {/* Qualifications / Degrees */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isUrdu ? 'طبی اسناد / ڈگریاں *' : 'Degrees & Qualifications *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MBBS, FCPS (Medicine), MRCP"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isUrdu ? 'رابطہ نمبر *' : 'Contact Phone Number *'}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +92 300 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Official Email */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isUrdu ? 'ای میل ایڈریس *' : 'Official Email Address *'}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="doctor@hospital.edu.pk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Experience Years */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isUrdu ? 'تجربہ (سال)' : 'Years of Clinical Experience'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isUrdu ? 'شہر' : 'City & Province'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="px-2.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                    >
                      {['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Quetta', 'Multan', 'Faisalabad', 'Sukkur', 'Hyderabad'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="px-2.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                    >
                      {['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory'].map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Hospital / Clinic Affiliation (Optional) */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isUrdu ? 'ہسپتال یا کلینک سے وابستگی (اختیاری)' : 'Clinic or Hospital Affiliation (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Services Hospital Lahore / Shifa International / Private Telehealth"
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* MANDATORY: UPLOAD VERIFICATION DOCUMENT (PMDC LICENSE) */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-teal-500/50 bg-teal-50/30 dark:bg-teal-950/20">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-extrabold text-xs text-teal-900 dark:text-teal-200 flex items-center gap-1.5 uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span>
                      {isUrdu
                        ? 'پی ایم ڈی سی لائسنس / تصدیقی دستاویز لازمی اپلوڈ کریں *'
                        : 'PMDC Verification Document / Proof of License (MANDATORY) *'}
                    </span>
                  </label>
                  <span className="text-[10px] font-black uppercase text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950 px-2 py-0.5 rounded-full">
                    {isUrdu ? 'لازمی شرط' : 'Mandatory'}
                  </span>
                </div>

                {certificateFileName ? (
                  /* Uploaded File Pill */
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-teal-300 dark:border-teal-700 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {certificateFileName}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {certificateFileSize || 'Ready for admin verification'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveDocument}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Remove & Replace Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  /* Upload Dropzone */
                  <div>
                    <input
                      type="file"
                      id="pmdc-verification-file-input"
                      accept=".pdf,image/png,image/jpeg,image/webp"
                      onChange={handleDocumentSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="pmdc-verification-file-input"
                      className="flex flex-col items-center justify-center p-5 cursor-pointer text-center hover:bg-teal-50/60 dark:hover:bg-teal-950/40 rounded-xl transition-all"
                    >
                      <Upload className="w-7 h-7 text-teal-600 dark:text-teal-400 mb-1.5 animate-bounce" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {isUrdu
                          ? 'پی ایم ڈی سی سرٹیفکیٹ یا لائسنس منتخب کریں (PDF یا Image)'
                          : 'Click to select PMDC Certificate or license proof (PDF or Image)'}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        {isUrdu ? 'زیادہ سے زیادہ سائز 15 ایم بی • پی ڈی ایف، پی این جی یا جے پی جی' : 'PDF, PNG, JPG accepted • Max 15MB • Strictly mandatory'}
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Status Notice Explaining "Pending Verification" */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  {isUrdu
                    ? 'اہم اطلاع: فارم جمع کراتے ہی آپ کا اسٹیٹس "زیرِ تصدیق" ہوگا اور ایڈمن کے کراس چیک تک آپ کسی مریض کے نتائج میں نظر نہیں آئیں گے۔'
                    : 'Notice: Upon submission, your account will enter "Pending Verification" status. You will not appear anywhere in patient search results until verified by an admin.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {isUrdu ? 'منسوخ کریں' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-teal-600/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isUrdu ? 'درخواست جمع کروائیں' : 'Submit for PMDC Verification'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
