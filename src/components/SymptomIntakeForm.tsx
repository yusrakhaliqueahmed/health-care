import React, { useState, useRef } from 'react';
import {
  Activity,
  AlertTriangle,
  Camera,
  Check,
  CheckCircle,
  Clock,
  FileText,
  Heart,
  HelpCircle,
  Info,
  Mic,
  MicOff,
  PhoneCall,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Thermometer,
  User,
  Volume2,
  X,
  Zap,
} from 'lucide-react';
import {
  AgeGroup,
  PatientProfile,
  SupportedLanguage,
  SymptomFormData,
  UrgencyLevel,
} from '../types';
import { createSpeechRecognizer, voiceManager } from '../services/voice';

interface SymptomIntakeFormProps {
  currentLanguage: SupportedLanguage;
  patientProfiles: PatientProfile[];
  selectedProfileId: string;
  onSelectProfileId: (id: string) => void;
  ageGroup: AgeGroup;
  onChangeAgeGroup: (age: AgeGroup) => void;
  exactAge: number | '';
  onChangeExactAge: (age: number | '') => void;
  patientGender: 'male' | 'female' | 'other';
  onChangeGender: (gender: 'male' | 'female' | 'other') => void;
  patientName: string;
  onChangePatientName: (name: string) => void;
  onSubmitForm: (formData: SymptomFormData) => void;
  onEmergencyCall: () => void;
  isSubmitting?: boolean;
}

interface SymptomCategoryOption {
  id: string;
  icon: string;
  labels: Record<SupportedLanguage, string>;
  examples: Record<SupportedLanguage, string>;
}

const SYMPTOM_CATEGORIES: SymptomCategoryOption[] = [
  {
    id: 'fever',
    icon: '🌡️',
    labels: {
      en: 'Fever & Chills',
      roman: 'Bukhar aur Kapkapi',
      ur: 'بخار اور کپکپی',
    },
    examples: {
      en: 'High temp, shivering, body heat',
      roman: 'Tez bukhar, thand lagna, tapna',
      ur: 'تیز بخار، ٹھنڈ لگنا، تپش',
    },
  },
  {
    id: 'respiratory',
    icon: '🫁',
    labels: {
      en: 'Cough & Breathing',
      roman: 'Khansi aur Saans ki Takleef',
      ur: 'کھانسی اور سانس کی تکلیف',
    },
    examples: {
      en: 'Dry or phlegm cough, wheezing',
      roman: 'Khushk ya balghami khansi, saans phoolna',
      ur: 'خشک یا بلغم والی کھانسی، سانس پھولنا',
    },
  },
  {
    id: 'stomach',
    icon: '🫄',
    labels: {
      en: 'Stomach & Digestion',
      roman: 'Pait Dard aur Badhazmi',
      ur: 'پیٹ درد اور بدہضمی',
    },
    examples: {
      en: 'Cramps, acidity, gas, loose motion',
      roman: 'Pait mein maror, tezabiyat, dast',
      ur: 'پیٹ میں مروڑ، تیزابیت، دست، پیچش',
    },
  },
  {
    id: 'headache',
    icon: '🤕',
    labels: {
      en: 'Headache & Dizziness',
      roman: 'Sar Dard aur Chakkar',
      ur: 'سر درد اور چکر آنا',
    },
    examples: {
      en: 'Throbbing migraine, heaviness',
      roman: 'Aadha ya poora sar dard, bhaari pan',
      ur: 'آدھے یا پورے سر کا درد، سر میں بھاری پن',
    },
  },
  {
    id: 'vomiting',
    icon: '🤢',
    labels: {
      en: 'Nausea & Vomiting',
      roman: 'Matli aur Ulti',
      ur: 'متلی اور الٹی',
    },
    examples: {
      en: 'Food rejection, continuous puking',
      roman: 'Khana hazam na hona, baar baar ulti',
      ur: 'کھانا ہضم نہ ہونا، قے یا الٹی آنا',
    },
  },
  {
    id: 'chest',
    icon: '🫀',
    labels: {
      en: 'Chest Pain / Palpitation',
      roman: 'Seenay mein Dard / Dharkan',
      ur: 'سینے میں درد یا دھڑکن',
    },
    examples: {
      en: 'Chest heaviness, racing heartbeat',
      roman: 'Seenay par bojh, tez dharkan',
      ur: 'سینے پر بوجھ یا کھنچاؤ، دل کی تیز دھڑکن',
    },
  },
  {
    id: 'joint_body',
    icon: '🦵',
    labels: {
      en: 'Joint & Body Pain',
      roman: 'Joron aur Jism ka Dard',
      ur: 'جوڑوں اور پٹھوں کا درد',
    },
    examples: {
      en: 'Backache, knees, muscle fatigue',
      roman: 'Kamar dard, ghutne, thakawat',
      ur: 'کمر درد، گھٹنوں کا درد، جسمانی تھکن',
    },
  },
  {
    id: 'skin',
    icon: '🩹',
    labels: {
      en: 'Skin Rash & Allergy',
      roman: 'Jild ki Kharish aur Daane',
      ur: 'جلد کی خارش اور دانے',
    },
    examples: {
      en: 'Red spots, itching, swelling, boils',
      roman: 'Surkh nishan, khujli, sojan',
      ur: 'سرخ نشانات، کھجلی، سوجن یا پھوڑے',
    },
  },
  {
    id: 'other',
    icon: '📋',
    labels: {
      en: 'Other Specific Concern',
      roman: 'Koi Doosri Khaas Takleef',
      ur: 'کوئی دوسری خاص تکلیف',
    },
    examples: {
      en: 'Ear, eye, urinary, or other',
      roman: 'Kaan, aankh, peshab ya digar masla',
      ur: 'کان، آنکھ، پیشاب یا دیگر مسئلہ',
    },
  },
];

const DURATION_OPTIONS = [
  {
    id: 'today',
    labels: {
      en: 'Just started today (< 24 hrs)',
      roman: 'Aaj hi shuru hua (24 ghante se kam)',
      ur: 'آج ہی شروع ہوا (24 گھنٹے سے کم)',
    },
  },
  {
    id: '2-3_days',
    labels: {
      en: '2 to 3 days',
      roman: '2 se 3 din se',
      ur: '2 سے 3 دن سے',
    },
  },
  {
    id: '4-7_days',
    labels: {
      en: '4 to 7 days (Around a week)',
      roman: '4 se 7 din (Qareeban ek hafta)',
      ur: '4 سے 7 دن (تقریباً ایک ہفتہ)',
    },
  },
  {
    id: '1-2_weeks',
    labels: {
      en: '1 to 2 weeks',
      roman: '1 se 2 hafte se',
      ur: '1 سے 2 ہفتے سے',
    },
  },
  {
    id: 'chronic',
    labels: {
      en: 'More than a month / Chronic',
      roman: 'Ek maah se zyada / Purani takleef',
      ur: 'ایک ماہ سے زیادہ / پرانی تکلیف',
    },
  },
];

const ASSOCIATED_SYMPTOMS_LIST = [
  { id: 'fever_chills', icon: '❄️', en: 'Shivering / Chills', roman: 'Kapkapi / Thand lagna', ur: 'کپکپی یا ٹھنڈ لگنا' },
  { id: 'sweating', icon: '💦', en: 'Profuse Sweating', roman: 'Bohat zyada paseena', ur: 'بہت زیادہ پسینہ آنا' },
  { id: 'nausea_vomiting', icon: '🤢', en: 'Nausea or Vomiting', roman: 'Matli ya Ulti', ur: 'متلی یا الٹی آنا' },
  { id: 'shortness_of_breath', icon: '😮‍💨', en: 'Shortness of Breath', roman: 'Saans phoolna ya tangi', ur: 'سانس پھولنا یا تنگی' },
  { id: 'loss_of_appetite', icon: '🍽️', en: 'Loss of Appetite', roman: 'Bhook bilkul na lagna', ur: 'بھوک بالکل نہ لگنا' },
  { id: 'dizziness', icon: '😵', en: 'Dizziness / Lightheadedness', roman: 'Chakkar aana / Ghumari', ur: 'چکر آنا یا بے ہوشی محسوس ہونا' },
  { id: 'sore_throat', icon: '🗣️', en: 'Sore Throat / Pain Swallowing', roman: 'Gala kharab / Nigalne mein dard', ur: 'گلا خراب یا نگلنے میں درد' },
  { id: 'cough_phlegm', icon: '🫁', en: 'Cough with Phlegm', roman: 'Balgham wali khansi', ur: 'بلغم والی کھانسی' },
  { id: 'diarrhea', icon: '🚽', en: 'Diarrhea / Loose Stools', roman: 'Patlay dast / Dast aana', ur: 'پتلے دست یا مروڑ' },
  { id: 'headache_pressure', icon: '🤕', en: 'Headache or Eyestrain', roman: 'Sar dard ya aankhon par bojh', ur: 'سر درد یا آنکھوں پر بوجھ' },
  { id: 'joint_aches', icon: '🦴', en: 'Joint or Muscle Aches', roman: 'Joron aur pathon ka dard', ur: 'جوڑوں اور پٹھوں کا درد' },
  { id: 'chest_tightness', icon: '🫀', en: 'Chest Tightness', roman: 'Seenay mein dabao ya khinchaao', ur: 'سینے میں دباؤ یا کھنچاؤ' },
];

export const SymptomIntakeForm: React.FC<SymptomIntakeFormProps> = ({
  currentLanguage,
  patientProfiles,
  selectedProfileId,
  onSelectProfileId,
  ageGroup,
  onChangeAgeGroup,
  exactAge,
  onChangeExactAge,
  patientGender,
  onChangeGender,
  patientName,
  onChangePatientName,
  onSubmitForm,
  onEmergencyCall,
  isSubmitting = false,
}) => {
  // Form State
  const [category, setCategory] = useState<string>('fever');
  const [detailedNotes, setDetailedNotes] = useState<string>('');
  const [duration, setDuration] = useState<string>('2-3_days');
  const [severity, setSeverity] = useState<number>(5);
  const [progression, setProgression] = useState<'worsening' | 'constant' | 'improving' | 'fluctuating'>('worsening');
  const [selectedAssociated, setSelectedAssociated] = useState<string[]>(['fever_chills']);
  const [triggersOrRelief, setTriggersOrRelief] = useState<string>('');
  const [medicationsTaken, setMedicationsTaken] = useState<string>('');

  // Red Flags
  const [redFlags, setRedFlags] = useState({
    chestPain: false,
    breathingDifficulty: false,
    faintingOrConfusion: false,
    unableToKeepFluids: false,
    highFeverInfant: false,
  });

  // Photo
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice recording for detailed notes
  const [isRecording, setIsRecording] = useState(false);
  const speechRecognizer = useRef(createSpeechRecognizer());

  const hasRedFlag =
    redFlags.chestPain ||
    redFlags.breathingDifficulty ||
    redFlags.faintingOrConfusion ||
    redFlags.unableToKeepFluids ||
    (redFlags.highFeverInfant && ageGroup === 'infant');

  const toggleAssociated = (id: string) => {
    setSelectedAssociated((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      speechRecognizer.current.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      speechRecognizer.current.start(
        currentLanguage,
        (transcript) => {
          setDetailedNotes((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        (err) => {
          console.warn('Voice recording error:', err);
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
        }
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeCategory = SYMPTOM_CATEGORIES.find((c) => c.id === category);
    const chiefComplaint = activeCategory
      ? activeCategory.labels[currentLanguage] || activeCategory.labels.en
      : category;

    const data: SymptomFormData = {
      chiefComplaint,
      chiefComplaintCategory: category,
      detailedNotes: detailedNotes.trim(),
      duration,
      severity,
      progression,
      associatedSymptoms: selectedAssociated,
      triggersOrRelief: triggersOrRelief.trim(),
      medicationsTaken: medicationsTaken.trim(),
      redFlags,
      photoBase64,
    };

    onSubmitForm(data);
  };

  const getSeverityBadge = (val: number) => {
    if (val <= 3) {
      return {
        label: currentLanguage === 'ur' ? 'ہلکا درد / تکلیف' : currentLanguage === 'roman' ? 'Halka Dard (Mild)' : 'Mild Discomfort (1-3)',
        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      };
    }
    if (val <= 6) {
      return {
        label: currentLanguage === 'ur' ? 'درمیانی تکلیف' : currentLanguage === 'roman' ? 'Darmiyani Takleef (Moderate)' : 'Moderate Severity (4-6)',
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      };
    }
    if (val <= 8) {
      return {
        label: currentLanguage === 'ur' ? 'شدید درد / تکلیف' : currentLanguage === 'roman' ? 'Shadeed Takleef (Severe)' : 'Severe Pain (7-8)',
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-300 dark:border-orange-800',
      };
    }
    return {
      label: currentLanguage === 'ur' ? 'ناقابل برداشت / ایمرجنسی' : currentLanguage === 'roman' ? 'Bohot Shadeed / Emergency' : 'Unbearable / Critical (9-10)',
      color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300 dark:border-red-800 animate-pulse',
    };
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informational Guidance Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-950 dark:text-teal-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm leading-relaxed">
          <p className="font-bold">
            {currentLanguage === 'ur'
              ? 'مریض کی مکمل معلومات کا منظم فارم (Structured Clinical Intake)'
              : currentLanguage === 'roman'
              ? 'Mareez ki Mukammal Alamaat ka Munazzam Form (Structured Clinical Intake)'
              : 'Complete Patient Symptom Intake Form (Clinical Protocol)'}
          </p>
          <p className="text-teal-800 dark:text-teal-300 text-xs mt-1">
            {currentLanguage === 'ur'
              ? 'ڈاکٹر اور اے آئی کی درست رہنمائی کے لیے ان تمام سوالات کا جواب ضروری ہے۔ اس سے آپ کا وقت بچے گا اور کوئی اہم علامت نظر انداز نہیں ہوگی۔'
              : currentLanguage === 'roman'
              ? 'Doctor aur AI ki behtar aur mehfooz tashkhees ke liye yeh maloomat zaroori hain takay koi aham alamat choot na jaye.'
              : 'This structured intake collects the exact clinical parameters doctors need: chief complaint, onset timeline, pain intensity, secondary symptoms, and danger signs.'}
          </p>
        </div>
      </div>

      {/* SECTION 1: Patient Selection & Demographic Calibration */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-extrabold text-xs flex items-center justify-center">
              1
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {currentLanguage === 'ur' ? 'مریض کی تفصیل اور عمر' : currentLanguage === 'roman' ? 'Mareez ki Tafseel aur Umar' : 'Patient Identity & Age Calibration'}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {currentLanguage === 'ur' ? 'لازمی حصہ' : 'Required'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Profile Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {currentLanguage === 'ur' ? 'کس مریض کے لیے؟' : currentLanguage === 'roman' ? 'Kis Mareez ke Liye?' : 'Select Patient Profile'}
            </label>
            <select
              value={selectedProfileId}
              onChange={(e) => onSelectProfileId(e.target.value)}
              className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {patientProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.relation}) - {p.exactAge} yrs
                </option>
              ))}
              <option value="custom">Other / New Guest</option>
            </select>
          </div>

          {/* Exact Age */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {currentLanguage === 'ur' ? 'درست عمر (سال)' : currentLanguage === 'roman' ? 'Durust Umar (Years)' : 'Exact Age (Years)'}
            </label>
            <input
              type="number"
              min="0"
              max="120"
              value={exactAge}
              onChange={(e) => onChangeExactAge(e.target.value ? Number(e.target.value) : '')}
              className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              placeholder="e.g. 35"
              required
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {currentLanguage === 'ur' ? 'جنس' : currentLanguage === 'roman' ? 'Jins' : 'Gender'}
            </label>
            <select
              value={patientGender}
              onChange={(e) => onChangeGender(e.target.value as any)}
              className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="male">{currentLanguage === 'ur' ? 'مرد' : currentLanguage === 'roman' ? 'Mard (Male)' : 'Male'}</option>
              <option value="female">{currentLanguage === 'ur' ? 'عورت' : currentLanguage === 'roman' ? 'Khaatoon (Female)' : 'Female'}</option>
              <option value="other">{currentLanguage === 'ur' ? 'دیگر' : 'Other'}</option>
            </select>
          </div>
        </div>

        {/* Age Group Buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            {currentLanguage === 'ur' ? 'عمر کا درجہ (Age Bracket)' : 'Clinical Age Group'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'infant', label: 'Infant', ur: 'شیر خوار', roman: 'Sheer-Khwar', sub: '0-2 yrs' },
              { id: 'child', label: 'Child', ur: 'بچہ', roman: 'Bacha', sub: '2-12 yrs' },
              { id: 'teen', label: 'Teenager', ur: 'نو عمر', roman: 'No-umar', sub: '13-18 yrs' },
              { id: 'adult', label: 'Adult', ur: 'بالغ', roman: 'Baligh', sub: '18-60 yrs' },
              { id: 'elderly', label: 'Elderly', ur: 'بزرگ', roman: 'Buzurg', sub: '60+ yrs' },
            ].map((ag) => (
              <button
                key={ag.id}
                type="button"
                onClick={() => onChangeAgeGroup(ag.id as AgeGroup)}
                className={`p-2.5 rounded-xl text-left border transition-all text-xs cursor-pointer ${
                  ageGroup === ag.id
                    ? 'bg-teal-50 dark:bg-teal-950/80 border-teal-500 text-teal-950 dark:text-teal-200 font-bold shadow-2xs ring-1 ring-teal-500'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-slate-900 dark:text-white">
                  {currentLanguage === 'ur' ? ag.ur : currentLanguage === 'roman' ? ag.roman : ag.label}
                </div>
                <div className="text-[10px] text-slate-500">{ag.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: Chief Complaint (بنیادی علامت) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-extrabold text-xs flex items-center justify-center">
              2
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {currentLanguage === 'ur' ? 'بنیادی علامت یا سب سے بڑی تکلیف' : currentLanguage === 'roman' ? 'Bunyaadi Alamat (Chief Complaint)' : 'Primary Health Complaint (Chief Symptom)'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {currentLanguage === 'ur' ? 'آپ کو سب سے زیادہ کون سا مسئلہ پریشان کر رہا ہے؟' : 'What is the main problem bringing the patient in today?'}
              </p>
            </div>
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {SYMPTOM_CATEGORIES.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-teal-50 dark:bg-teal-950/80 border-teal-500 text-teal-950 dark:text-teal-200 ring-2 ring-teal-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xl">{cat.icon}</span>
                  {isSelected && <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
                </div>
                <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  {cat.labels[currentLanguage] || cat.labels.en}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {cat.examples[currentLanguage] || cat.examples.en}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Notes with Voice Support */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>{currentLanguage === 'ur' ? 'اپنی زبان میں تفصیل لکھیں یا بولیں:' : currentLanguage === 'roman' ? 'Apni zuban mein tafseel likhein ya bolein:' : 'Describe the symptoms in your own words:'}</span>
            </label>
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100'
              }`}
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isRecording ? 'Listening... (Stop)' : 'Speak / بولیں'}</span>
            </button>
          </div>

          <textarea
            rows={3}
            value={detailedNotes}
            onChange={(e) => setDetailedNotes(e.target.value)}
            placeholder={
              currentLanguage === 'ur'
                ? 'مثلاً: کل رات سے تیز بخار ہے، سر میں شدید بھاری پن ہے اور کچھ بھی کھانے پر متلی ہو رہی ہے...'
                : currentLanguage === 'roman'
                ? 'Maslan: Kal raat se tez bukhar hai, sar mein dard aur ulti ka ehsaas ho raha hai...'
                : 'e.g., High fever started last night, intense throbbing headache, feeling weak and nauseous after eating...'
            }
            dir={currentLanguage === 'ur' ? 'rtl' : 'ltr'}
            className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* SECTION 3: Duration & Progression (کب سے ہے اور کیا رخ ہے) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-extrabold text-xs flex items-center justify-center">
              3
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {currentLanguage === 'ur' ? 'تکلیف کی مدت اور کیفیت' : currentLanguage === 'roman' ? 'Takleef ki Muddat aur Kaifiyat' : 'Duration & Progression (Timeline)'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {currentLanguage === 'ur' ? 'یہ جاننا ضروری ہے کہ بیماری کتنی پرانی ہے اور بڑھ رہی ہے یا نہیں۔' : 'Crucial for clinical differentials between acute infection vs chronic condition.'}
              </p>
            </div>
          </div>
        </div>

        {/* Duration selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            <Clock className="w-3.5 h-3.5 inline mr-1 text-teal-600" />
            {currentLanguage === 'ur' ? 'کتنے عرصے سے یہ تکلیف ہے؟' : currentLanguage === 'roman' ? 'Kitne arsay se yeh takleef hai?' : 'How long has this symptom been present?'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {DURATION_OPTIONS.map((dur) => (
              <button
                key={dur.id}
                type="button"
                onClick={() => setDuration(dur.id)}
                className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                  duration === dur.id
                    ? 'bg-teal-50 dark:bg-teal-950 border-teal-500 text-teal-900 dark:text-teal-200 font-bold ring-1 ring-teal-500'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {dur.labels[currentLanguage] || dur.labels.en}
              </button>
            ))}
          </div>
        </div>

        {/* Progression / Trend */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            <Activity className="w-3.5 h-3.5 inline mr-1 text-teal-600" />
            {currentLanguage === 'ur' ? 'بیماری کا رخ کیسا ہے؟' : currentLanguage === 'roman' ? 'Takleef ka rukh kaisa hai?' : 'How has it changed over time?'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'worsening', label: 'Worsening', ur: 'وقت کے ساتھ بڑھ رہا ہے', roman: 'Barh raha hai', color: 'text-red-600' },
              { id: 'constant', label: 'Constant / Same', ur: 'ایک جیسا برقرار ہے', roman: 'Waisa hi hai', color: 'text-amber-600' },
              { id: 'fluctuating', label: 'Comes & Goes', ur: 'آتا جاتا رہتا ہے', roman: 'Aata jaata rehta hai', color: 'text-blue-600' },
              { id: 'improving', label: 'Improving', ur: 'پہلے سے بہتر ہو رہا ہے', roman: 'Behtar ho raha hai', color: 'text-emerald-600' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProgression(p.id as any)}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  progression === p.id
                    ? 'bg-teal-50 dark:bg-teal-950 border-teal-500 text-teal-950 dark:text-teal-200 font-bold ring-1 ring-teal-500'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold">
                  {currentLanguage === 'ur' ? p.ur : currentLanguage === 'roman' ? p.roman : p.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: Pain & Severity Scale (شدت کا اسکیل 1 se 10) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-extrabold text-xs flex items-center justify-center">
              4
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {currentLanguage === 'ur' ? 'شدت اور درد کا پیمانہ (1 سے 10)' : currentLanguage === 'roman' ? 'Shiddat aur Dard ka Paimana (1-10)' : 'Severity & Pain Intensity Scale'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {currentLanguage === 'ur' ? '1 کا مطلب معمولی تکلیف ہے اور 10 کا مطلب ناقابل برداشت درد۔' : '1 is mild irritation, 10 is unbearable agony requiring emergency intervention.'}
              </p>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${getSeverityBadge(severity).color}`}>
            {getSeverityBadge(severity).label}
          </span>
        </div>

        {/* 1 to 10 Numbers Button Bar */}
        <div className="grid grid-cols-10 gap-1 sm:gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
            const isSelected = severity === num;
            let btnColor = 'hover:bg-slate-100 dark:hover:bg-slate-800';
            if (num <= 3) btnColor = isSelected ? 'bg-emerald-600 text-white font-extrabold ring-2 ring-emerald-400' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300';
            else if (num <= 6) btnColor = isSelected ? 'bg-amber-600 text-white font-extrabold ring-2 ring-amber-400' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300';
            else if (num <= 8) btnColor = isSelected ? 'bg-orange-600 text-white font-extrabold ring-2 ring-orange-400' : 'bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300';
            else btnColor = isSelected ? 'bg-red-600 text-white font-extrabold ring-2 ring-red-400 animate-pulse' : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300';

            return (
              <button
                key={num}
                type="button"
                onClick={() => setSeverity(num)}
                className={`py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${btnColor}`}
              >
                <span>{num}</span>
              </button>
            );
          })}
        </div>

        {/* Slider Alternative */}
        <input
          type="range"
          min="1"
          max="10"
          value={severity}
          onChange={(e) => setSeverity(Number(e.target.value))}
          className="w-full accent-teal-600 cursor-pointer"
        />
      </div>

      {/* SECTION 5: Associated Symptoms Checklist (ساتھ ہونے والی دوسری علامات) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-extrabold text-xs flex items-center justify-center">
              5
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {currentLanguage === 'ur' ? 'ساتھ ہونے والی دیگر علامات (چیک لسٹ)' : currentLanguage === 'roman' ? 'Saath doosri alamaat (Checklist)' : 'Associated Symptoms (Select All That Apply)'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {currentLanguage === 'ur' ? 'ان تمام علامات پر کلک کریں جو مریض محسوس کر رہا ہے۔' : 'Select any additional symptoms present to help confirm diagnosis.'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2.5 py-1 rounded-lg">
            {selectedAssociated.length} {currentLanguage === 'ur' ? 'منتخب' : 'Selected'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {ASSOCIATED_SYMPTOMS_LIST.map((item) => {
            const isChecked = selectedAssociated.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleAssociated(item.id)}
                className={`p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer flex items-start gap-2 ${
                  isChecked
                    ? 'bg-teal-50 dark:bg-teal-950/80 border-teal-500 text-teal-950 dark:text-teal-200 font-bold ring-1 ring-teal-500'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <span className="text-base shrink-0">{item.icon}</span>
                <div className="flex-1">
                  <div>
                    {currentLanguage === 'ur' ? item.ur : currentLanguage === 'roman' ? item.roman : item.en}
                  </div>
                </div>
                {isChecked && <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 6: Medications Taken & Triggers (پہلے سے لی گئی ادویات) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-extrabold text-xs flex items-center justify-center">
              6
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {currentLanguage === 'ur' ? 'لی گئی دوائیں اور فرق پڑنے والی چیزیں' : currentLanguage === 'roman' ? 'Li gayi dawaiyan aur asraat' : 'Prior Medications & Modifying Triggers'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {currentLanguage === 'ur' ? 'کیا پہلے سے کوئی گولی یا شربت لیا ہے؟ اور کس چیز سے تکلیف بڑھتی ہے؟' : 'Helps prevent drug interactions and identifies allergic or physiological triggers.'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {currentLanguage === 'ur' ? 'اب تک کون سی دوا یا گھریلو ٹوٹکا استعمال کیا؟' : currentLanguage === 'roman' ? 'Ab tak konsi dawai li hai?' : 'Medicines / Remedies Taken So Far'}
            </label>
            <input
              type="text"
              value={medicationsTaken}
              onChange={(e) => setMedicationsTaken(e.target.value)}
              placeholder={
                currentLanguage === 'ur'
                  ? 'مثلاً: پیناڈول 2 گولیاں، بروفین شربت، یا کچھ نہیں'
                  : currentLanguage === 'roman'
                  ? 'Maslan: Panadol 2 tablets, Brufen syrup, ya koi nahi'
                  : 'e.g. Panadol 2 tablets, Augmentin, cough syrup, none'
              }
              className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {currentLanguage === 'ur' ? 'کس چیز سے تکلیف بڑھتی یا کم ہوتی ہے؟' : currentLanguage === 'roman' ? 'Kis cheez se farq parta hai?' : 'What makes symptoms better or worse?'}
            </label>
            <input
              type="text"
              value={triggersOrRelief}
              onChange={(e) => setTriggersOrRelief(e.target.value)}
              placeholder={
                currentLanguage === 'ur'
                  ? 'مثلاً: کھانا کھانے کے بعد درد بڑھتا ہے، لیٹنے سے سانس رکتی ہے'
                  : currentLanguage === 'roman'
                  ? 'Maslan: Khane ke baad dard barhta hai, chalne se saans phoolti hai'
                  : 'e.g. Worse after eating oily food, worse when lying flat, better with rest'
              }
              className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* SECTION 7: Critical Red Flag Danger Signs (خطرناک علامات کی اسکریننگ) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-red-50/70 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-red-200 dark:border-red-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-red-600 text-white font-extrabold text-xs flex items-center justify-center">
              7
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-red-900 dark:text-red-200 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>
                  {currentLanguage === 'ur' ? 'ایمرجنسی و خطرناک علامات کی فوری جانچ (Red Flags)' : currentLanguage === 'roman' ? 'Khatarnak Alamaat ki Jaanchna (Red Flags)' : 'Critical Emergency Red Flags Screener'}
                </span>
              </h3>
              <p className="text-[11px] text-red-700 dark:text-red-300">
                {currentLanguage === 'ur' ? 'اگر ان میں سے کوئی بھی علامت موجود ہے تو فوراً 1122 یا قریبی ہسپتال جائیں۔' : 'If any of these critical signs are present, immediate hospital emergency care is mandatory.'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {[
            {
              key: 'chestPain',
              label: {
                en: 'Severe crushing chest pain, pressure, or tightness radiating to left arm or jaw',
                roman: 'Seenay mein shadeed dabao ya dard jo baazu ya jabray ki taraf jaye',
                ur: 'سینے میں شدید دباؤ یا درد جو بائیں بازو یا جبڑے کی طرف جائے',
              },
            },
            {
              key: 'breathingDifficulty',
              label: {
                en: 'Extreme shortness of breath, gasping for air, or bluish lips / fingernails',
                roman: 'Saans lene mein intehai mushkil ya honton ka neela parna',
                ur: 'سانس لینے میں شدید دشواری یا ہونٹوں کا نیلا پڑنا',
              },
            },
            {
              key: 'faintingOrConfusion',
              label: {
                en: 'Sudden fainting, confusion, slurred speech, or loss of face/arm movement',
                roman: 'Be-hoshi, achanak chakkar, zaban ladkharana ya jism sunn hona',
                ur: 'بے ہوشی، اچانک بولنے میں لڑکھڑاہٹ یا چہرے اور بازو کا بے جان ہونا',
              },
            },
            {
              key: 'unableToKeepFluids',
              label: {
                en: 'Continuous vomiting, unable to hold down even water/ORS for over 12 hours',
                roman: 'Musal-sal ulti, 12 ghante se paani ya ORS bhi na thehar raha ho',
                ur: 'مسلسل الٹیاں، 12 گھنٹے سے پانی یا او آر ایس بھی پیٹ میں نہ ٹھہر رہا ہو',
              },
            },
            {
              key: 'highFeverInfant',
              label: {
                en: 'High fever in baby under 3 months, or child experiencing febrile seizures',
                roman: '3 maah se chotay bachay ko tez bukhar ya jhatkay lagna',
                ur: '3 ماہ سے چھوٹے بچے کو تیز بخار یا جھٹکے لگنا',
              },
            },
          ].map((flag) => {
            const isChecked = (redFlags as any)[flag.key];
            return (
              <label
                key={flag.key}
                className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-red-100 dark:bg-red-900/60 border-red-500 text-red-950 dark:text-red-100 font-bold'
                    : 'bg-white dark:bg-slate-900/80 border-red-200 dark:border-red-900/50 text-slate-800 dark:text-slate-200 hover:bg-red-50/50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) =>
                    setRedFlags((prev) => ({ ...prev, [flag.key]: e.target.checked }))
                  }
                  className="mt-1 w-4 h-4 text-red-600 rounded-md focus:ring-red-500 accent-red-600"
                />
                <span className="text-xs sm:text-sm leading-relaxed flex-1">
                  {flag.label[currentLanguage] || flag.label.en}
                </span>
              </label>
            );
          })}
        </div>

        {/* Emergency Alert Box if flagged */}
        {hasRedFlag && (
          <div className="p-4 rounded-2xl bg-red-600 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-red-600/30 animate-pulse">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-white shrink-0" />
              <div className="text-xs sm:text-sm font-bold">
                {currentLanguage === 'ur'
                  ? 'انتباہ: ایمرجنسی علامت منتخب کی گئی ہے! فوری طور پر 1122 یا قریبی ایمرجنسی وارڈ جائیں۔'
                  : currentLanguage === 'roman'
                  ? 'Khatra: Emergency alamat detect hui hai! Foran 1122 par call karein ya hospital jayein.'
                  : 'CRITICAL ALERT: Emergency Red Flag detected. Dispatch Rescue 1122 immediately.'}
              </div>
            </div>
            <a
              href="tel:1122"
              onClick={onEmergencyCall}
              className="px-4 py-2 rounded-xl bg-white text-red-700 font-extrabold text-xs shrink-0 hover:bg-red-50 shadow-sm"
            >
              Call 1122
            </a>
          </div>
        )}
      </div>

      {/* SECTION 8: Photo Attachment (اختیاری تصویر) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-extrabold text-xs flex items-center justify-center">
              8
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {currentLanguage === 'ur' ? 'علامت، زخم یا دوا کی تصویر (اختیاری)' : currentLanguage === 'roman' ? 'Alamat ya Dawai ki Tasveer (Optional)' : 'Attach Photo of Rash, Throat, or Medicine (Optional)'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {currentLanguage === 'ur' ? 'اگر جلد پر خارش، گلے میں سرخی یا سوجن ہے تو تصویر منسلک کریں۔' : 'Attach a photo for multi-modal AI visual triage.'}
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-teal-600" />
            <span>{photoBase64 ? 'Change Photo' : 'Upload Photo'}</span>
          </button>
        </div>

        {photoBase64 && (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
            <img
              src={photoBase64}
              alt="Symptom preview"
              className="w-14 h-14 object-cover rounded-xl border border-teal-300"
            />
            <div className="flex-1 text-xs">
              <span className="font-bold text-teal-950 dark:text-teal-200 block">Photo Attached</span>
              <span className="text-teal-700 dark:text-teal-400">Will be analyzed alongside your clinical details</span>
            </div>
            <button
              type="button"
              onClick={() => setPhotoBase64(null)}
              className="p-1 text-slate-400 hover:text-red-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* SUBMIT BUTTON */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-teal-900 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="text-center sm:text-left">
          <h4 className="text-base font-bold text-white flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-5 h-5 text-teal-300" />
            <span>
              {currentLanguage === 'ur'
                ? 'مکمل علامات کا معائنہ اور رپورٹ حاصل کریں'
                : currentLanguage === 'roman'
                ? 'Mukammal Alamaat ka Muaina aur Report Hasil Karein'
                : 'Generate Complete Clinical Triage & Doctor Dossier'}
            </span>
          </h4>
          <p className="text-xs text-teal-200 mt-1">
            {currentLanguage === 'ur'
              ? 'اے آئی فوری جانچ کرے گا اور آپ کا کیس پی ایم ڈی سی ڈاکٹر کے لیے محفوظ ہو جائے گا۔'
              : currentLanguage === 'roman'
              ? 'AI foran triage karega aur case file PMDC doctor ke review ke liye tayar ho jaye gi.'
              : 'Evaluates severity (Green/Yellow/Red), generates care instructions, and files case with PMDC medical officer.'}
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-extrabold text-sm shadow-lg shadow-teal-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Symptoms...</span>
            </>
          ) : (
            <>
              <span>
                {currentLanguage === 'ur'
                  ? 'فارم جمع کروائیں اور جائزہ لیں'
                  : currentLanguage === 'roman'
                  ? 'Form Jama Karwayen aur Check Karein'
                  : 'Submit Form & Analyze Symptoms'}
              </span>
              <Zap className="w-4 h-4 text-slate-950" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
