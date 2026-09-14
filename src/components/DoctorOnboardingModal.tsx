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

export const DoctorOnboardingModal: React.FC<DoctorOnboardingModalProps> = ({
  isOpen,
  onClose,
  language,
  onSubmitDoctorApplication,
}) => {
  const t = TRANSLATIONS[language];
  const isUrdu = language === 'ur';

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('General Physician & Family Medicine');
  const [pmdcNumber, setPmdcNumber] = useState('');
  const [qualification, setQualification] = useState('');
  const [experienceYears, setExperienceYears] = useState('5');
  const [hospital, setHospital] = useState('');
  const [city, setCity] = useState('Lahore');
  const [province, setProvince] = useState('Punjab');
  const [consultationFee, setConsultationFee] = useState('1500');
  const [certificateFileName, setCertificateFileName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCertificateFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !pmdcNumber.trim() || !qualification.trim() || !email.trim()) {
      setErrorMsg(
        isUrdu
          ? 'براہِ کرم تمام لازمی خانے (نام، پی ایم ڈی سی نمبر، ڈگری اور ای میل) پُر فرمائیں۔'
          : 'Please complete all required fields (Name, PMDC Number, Qualification, and Email).'
      );
      return;
    }

    // Format PMDC Number if needed
    const cleanPmdc = pmdcNumber.toUpperCase().startsWith('PMDC-')
      ? pmdcNumber.toUpperCase()
      : `PMDC-${pmdcNumber.toUpperCase()}`;

    const newDoctor: Doctor = {
      id: `doc-app-${Date.now()}`,
      name: fullName.startsWith('Dr.') ? fullName : `Dr. ${fullName}`,
      specialty,
      qualification,
      pmdcNumber: cleanPmdc,
      hospital: hospital.trim() || 'Private Clinic / Telehealth',
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
      phone: phone.trim() || '+92-300-0000000',
      isOnlineAvailable: true,
      avatarUrl:
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
      experienceYears: parseInt(experienceYears, 10) || 5,
      // Pending state flags
      isDemoPlaceholder: false,
      isVerified: false,
      verificationStatus: 'pending',
      degreeDocumentUrl: certificateFileName || 'pmdc_certificate_scan.pdf',
      pmdcCertificateUrl: certificateFileName || 'pmdc_certificate_scan.pdf',
      registeredAt: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      email,
      clinicAffiliation: hospital,
    };

    onSubmitDoctorApplication(newDoctor);
    setIsSubmitted(true);

    const voiceMsg =
      isUrdu
        ? 'آپ کی درخواست جمع ہو گئی ہے۔ آپ کا اکاؤنٹ توثیق کے مرحلے میں ہے اور ایڈمن کی منظوری کے بعد مریضوں کو نظر آئے گا۔'
        : language === 'roman'
        ? 'Aap ki application jama ho gayi hai. Account pending verification mein hai aur admin approval ke baad active hoga.'
        : 'Your doctor application has been submitted. It is in pending verification status and will be activated upon admin credential check.';
    voiceManager.speak(voiceMsg, language);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div
        className={`bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 ${
          isUrdu ? 'rtl' : 'ltr'
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          /* Confirmation state */
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {isUrdu ? 'درخواست کامیابی سے جمع ہو گئی ہے' : 'Application Submitted Successfully'}
            </h3>
            <div className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-amber-500/30">
              {isUrdu ? 'حیثیت: زیرِ تصدیق (Pending Verification)' : 'Status: Pending Verification'}
            </div>
            <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed mb-6">
              {isUrdu
                ? 'شکریہ ڈاکٹر صاحب! آپ کی پی ایم ڈی سی رجسٹریشن اور اسناد ہمارے میڈیکل ایڈمن بورڈ کو موصول ہو چکی ہیں۔ جانچ کے بعد آپ کا تصدیق شدہ بیج فعال کر دیا جائے گا اور آپ مریضوں کی تلاش میں نظر آئیں گے۔'
                : 'Thank you, Doctor! Your credentials and PMDC license number have been queued for admin verification. Once verified, your profile will be marked with a "PMDC Verified" badge and made live to patients.'}
            </p>

            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 max-w-md mx-auto mb-6 text-left space-y-1">
              <p>• <strong>Doctor:</strong> {fullName}</p>
              <p>• <strong>PMDC:</strong> {pmdcNumber}</p>
              <p>• <strong>Specialty:</strong> {specialty}</p>
              <p>• <strong>License Doc:</strong> {certificateFileName || 'Uploaded'}</p>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all"
            >
              {isUrdu ? 'ٹھیک ہے، بند کریں' : 'Done & Close'}
            </button>
          </div>
        ) : (
          /* Sign-up form */
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {t.doctorOnboardingTitle}
                </h2>
                <p className="text-xs text-slate-400">
                  {t.doctorOnboardingSubtitle}
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="my-4 bg-red-950/60 border border-red-500/60 p-3 rounded-xl flex items-center gap-2 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isUrdu ? 'ڈاکٹر کا مکمل نام *' : 'Doctor Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Salman Tariq"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* PMDC Registration Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isUrdu ? 'پی ایم ڈی سی رجسٹریشن نمبر *' : 'PMDC Registration Number *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PMDC-71829-P"
                    value={pmdcNumber}
                    onChange={(e) => setPmdcNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isUrdu ? 'ای میل ایڈریس *' : 'Official Email *'}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="doctor@hospital.edu.pk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isUrdu ? 'رابطہ نمبر *' : 'Phone Number *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+92-300-1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Specialization */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isUrdu ? 'شعبہ اختصاص (Specialty) *' : 'Specialization *'}
                  </label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="General Physician & Family Medicine">General Physician & Family Medicine</option>
                    <option value="Cardiologist (Heart Specialist)">Cardiologist (Heart Specialist)</option>
                    <option value="Pediatrician & Child Specialist">Pediatrician & Child Specialist</option>
                    <option value="Pulmonologist (Chest & Lungs)">Pulmonologist (Chest & Lungs)</option>
                    <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
                    <option value="Gynecologist & Obstetrician">Gynecologist & Obstetrician</option>
                    <option value="Diabetologist & Endocrinologist">Diabetologist & Endocrinologist</option>
                  </select>
                </div>

                {/* Qualifications */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isUrdu ? 'طبی اسناد / ڈگریاں *' : 'Degrees & Qualifications *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MBBS, FCPS, MRCP"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Experience Years */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isUrdu ? 'تجربہ (سال)' : 'Years of Experience'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Consultation Fee */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isUrdu ? 'مشاورتی فیس (PKR)' : 'Consultation Fee (PKR)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Hospital Affiliation */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isUrdu ? 'ہسپتال یا کلینک کا نام' : 'Hospital or Clinic Affiliation'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Services Hospital Lahore / Private Practice"
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* City & Province */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isUrdu ? 'شہر' : 'City'}
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Quetta', 'Multan', 'Faisalabad'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isUrdu ? 'صوبہ' : 'Province'}
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory'].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Upload PMDC Certificate */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isUrdu
                    ? 'پی ایم ڈی سی سرٹیفکیٹ یا لائسنس کی نقل اپلوڈ کریں *'
                    : 'Upload PMDC Certificate / Proof of License *'}
                </label>
                <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-xl p-4 text-center cursor-pointer bg-slate-950/60 transition-all">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="pmdc-file-input"
                  />
                  <label htmlFor="pmdc-file-input" className="cursor-pointer">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                    <span className="text-xs text-slate-200 block font-medium">
                      {certificateFileName ? (
                        <span className="text-emerald-400 font-bold">✓ {certificateFileName}</span>
                      ) : (
                        isUrdu
                          ? 'فائل منتخب کرنے کے لیے یہاں کلک کریں (PDF یا تصویر)'
                          : 'Click to select PMDC license file (PDF or Image)'
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {isUrdu ? 'زیادہ سے زیادہ 10 ایم بی' : 'Maximum 10MB file size'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Trust Notice */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                {isUrdu
                  ? 'نوٹ: درخواست جمع کرانے کے فوری بعد آپ کا اکاؤنٹ "زیرِ تصدیق" ہوگا اور چیف میڈیکل آفیسر کی جانچ تک مریضوں کے نتائج میں ظاہر نہیں ہوگا۔'
                  : 'Notice: Upon submission, your account will enter "Pending Verification" status and will not be visible to patients until manually reviewed by an admin.'}
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl"
                >
                  {isUrdu ? 'منسوخ کریں' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{t.registerDoctorBtn}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
