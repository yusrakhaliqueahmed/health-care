import React, { useState, useEffect, useRef } from 'react';
import {
  SupportedLanguage,
  PatientProfile,
  UrgencyLevel,
  ChatMessage,
  AgeGroup,
  UserAccount,
  SymptomFormData,
} from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { voiceManager, createSpeechRecognizer } from '../services/voice';
import { AudioPlayerControls } from './AudioPlayerControls';
import { SymptomIntakeForm } from './SymptomIntakeForm';
import { ClinicalOutputCard } from './ClinicalOutputCard';
import {
  Mic,
  MicOff,
  Send,
  Camera,
  Image as ImageIcon,
  X,
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  Clock,
  PhoneCall,
  User,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Volume2,
  ClipboardList,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Edit3,
  Activity,
  FileText,
} from 'lucide-react';

interface SymptomCheckerProps {
  currentLanguage: SupportedLanguage;
  patientProfiles: PatientProfile[];
  currentUser?: UserAccount;
  onAddCaseForDoctorReview: (caseData: any) => void;
  onEmergencyCall: () => void;
}

const SYMPTOM_GUIDANCE_PROMPTS = [
  {
    id: 'fever',
    labels: {
      en: 'Fever and body aches',
      roman: 'Tez bukhar aur jism mein dard',
      ur: 'تیز بخار اور جسم میں درد',
    },
  },
  {
    id: 'cough',
    labels: {
      en: 'Dry cough and sore throat',
      roman: 'Khushk khansi aur gale mein dard',
      ur: 'خشک کھانسی اور گلے میں درد',
    },
  },
  {
    id: 'headache',
    labels: {
      en: 'Severe headache and fatigue',
      roman: 'Shadeed sar dard aur susti ya thakawat',
      ur: 'شدید سر درد اور سستی و تھکاوٹ',
    },
  },
  {
    id: 'stomach',
    labels: {
      en: 'Stomach pain and nausea',
      roman: 'Pait mein dard aur matli',
      ur: 'پیٹ میں درد اور متلی',
    },
  },
  {
    id: 'chest',
    labels: {
      en: 'Chest tightness and shortness of breath',
      roman: 'Seenay mein dabao aur saans mein takleef',
      ur: 'سینے میں دباؤ اور سانس لینے میں تنگی',
    },
  },
];

export const SymptomChecker: React.FC<SymptomCheckerProps> = ({
  currentLanguage,
  patientProfiles,
  currentUser,
  onAddCaseForDoctorReview,
  onEmergencyCall,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  // Selected patient profile or new quick profile
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    patientProfiles[0]?.id || 'custom'
  );
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('adult');
  const [exactAge, setExactAge] = useState<number | ''>(35);
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>('male');
  const [patientName, setPatientName] = useState<string>(
    currentUser?.name || patientProfiles[0]?.name || 'Patient'
  );

  // Mode toggle: 'form' (Structured Intake Form) or 'chat' (Conversational AI)
  const [activeMode, setActiveMode] = useState<'form' | 'chat'>('form');
  const [submittedFormData, setSubmittedFormData] = useState<SymptomFormData | null>(null);
  const [isFormDossierExpanded, setIsFormDossierExpanded] = useState(false);

  // Chat conversation
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUrgency, setCurrentUrgency] = useState<UrgencyLevel>('GREEN');

  // Photo attachment for visible symptoms
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Speech Recognition state
  const [isRecording, setIsRecording] = useState(false);
  const [caseSavedNotification, setCaseSavedNotification] = useState<string | null>(null);
  const speechRecognizer = useRef(createSpeechRecognizer());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message
  useEffect(() => {
    const welcomeByLang: Record<SupportedLanguage, string> = {
      en: "Hello, I am SehatSaathi Pro. I am here to help you evaluate your symptoms and prepare a clinical file for your doctor. Who is this consultation for, and what symptoms are you experiencing?",
      roman: "Assalam-o-Alaikum, main SehatSaathi Pro hoon. Main aapki alamaat ko samajhnay aur doctor ke liye case file tayar karnay mein madad karoon ga. Yeh mashwara kis ke liye hai aur aapko kya takleef ya alamaat hain?",
      ur: "السلام علیکم، میں صحت ساتھی پرو ہوں۔ میں آپ کی علامات کو سمجھنے اور ڈاکٹر کے لیے رپورٹ تیار کرنے میں مدد کروں گا۔ آپ کو کیا تکلیف یا علامات ہیں؟",
    };

    const initialMsg: ChatMessage = {
      id: 'init-msg',
      role: 'assistant',
      content: welcomeByLang[currentLanguage] || welcomeByLang.en,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      urgency: 'GREEN',
    };
    setMessages([initialMsg]);
  }, [currentLanguage]);

  // Sync selected profile details
  useEffect(() => {
    const found = patientProfiles.find((p) => p.id === selectedProfileId);
    if (found) {
      setAgeGroup(found.ageGroup);
      setExactAge(found.exactAge || 30);
      setPatientGender(found.gender);
      setPatientName(found.name);
    }
  }, [selectedProfileId, patientProfiles]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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

  const toggleRecording = () => {
    if (isRecording) {
      speechRecognizer.current.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      speechRecognizer.current.start(
        currentLanguage,
        (transcript) => {
          setInputText(transcript);
        },
        (err) => {
          console.warn('Speech err:', err);
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
        }
      );
    }
  };

  const handleSendMessage = async (
    e?: React.FormEvent,
    customText?: string,
    explicitPhoto?: string | null
  ) => {
    if (e) e.preventDefault();
    const textToSend = (customText !== undefined ? customText : inputText).trim();
    const currentPhoto = explicitPhoto !== undefined ? explicitPhoto : photoBase64;
    if (!textToSend && !currentPhoto) return;

    if (isRecording) {
      speechRecognizer.current.stop();
      setIsRecording(false);
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend || 'Examining attached symptom image.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      photoUrl: currentPhoto || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setPhotoBase64(null);
    setIsLoading(true);

    const abortController = new AbortController();
    const safetyTimeout = setTimeout(() => {
      abortController.abort();
    }, 12000);

    try {
      const activeProf = patientProfiles.find((p) => p.id === selectedProfileId);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          message: textToSend,
          history: messages,
          language: currentLanguage,
          patientProfile: {
            name: patientName,
            ageGroup,
            exactAge,
            gender: patientGender,
            conditions: activeProf?.conditions || '',
            medications: activeProf?.medications || '',
          },
          photoBase64: currentPhoto,
        }),
      });

      clearTimeout(safetyTimeout);

      let replyText = '';
      let urgency: UrgencyLevel = 'GREEN';

      if (res.ok) {
        const data = await res.json();
        replyText = data.text || data.fallbackText || 'Your symptoms have been recorded.';
        urgency = (data.urgency as UrgencyLevel) || 'GREEN';
      } else {
        replyText =
          currentLanguage === 'ur'
            ? 'سرور سے رابطہ عارضی طور پر سست ہے۔ اگر آپ کو سینے میں درد یا سانس کی تکلیف ہے تو فوری طور پر 1122 پر کال کریں۔'
            : currentLanguage === 'roman'
            ? 'Server se rabta arzi tor par sust hai. Agar seenay mein shadeed dard ya saans mein takleef hai to foran 1122 par call karein.'
            : 'Temporary connectivity delay. If you are experiencing severe chest pain, shortness of breath, or emergency symptoms, call Rescue 1122 immediately.';
        urgency = 'RED';
      }

      setCurrentUrgency(urgency);

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        urgency,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.warn('Chat request completed with fallback:', err);
      clearTimeout(safetyTimeout);

      // Intelligent symptom fallback supporting all Pakistani regional languages
      let fallbackText = `Your symptoms have been noted: "${textToSend}".
1. Rest in a comfortable, quiet room and stay well-hydrated with water or electrolytes.
2. For mild tension or feverish discomfort, Paracetamol is commonly recommended (check age and allergies).
3. Critical Red Flags: If you have sudden severe chest pain, trouble breathing, or confusion, call Rescue 1122 immediately.`;

      if (currentLanguage === 'ur') {
        fallbackText = `آپ کی علامات نوٹ کر لی گئی ہیں: "${textToSend}"۔
1. پرسکون ماحول میں آرام کریں اور وافر مقدار میں پانی یا او آر ایس استعمال کریں۔
2. اگر سر درد یا عام بخار ہے تو پیراسیٹامول مددگار ہو سکتی ہے۔
3. ایمرجنسی انتباہ: اگر سینے میں درد یا سانس لینے میں شدید دشواری ہو تو فوراً 1122 پر کال کریں۔`;
      } else if (currentLanguage === 'roman') {
        fallbackText = `Aapki alamaat note kar li gayi hain: "${textToSend}".
1. Pur-sukoon mahol mein aaram karein aur paani ya ORS ka istemaal karein.
2. Mamooli dard ya bukhar ke liye Paracetamol mufeed ho sakti hai (umar aur allergies check karein).
3. Emergency Alert: Agar seenay mein shadeed dard ya saans mein takleef ho to foran 1122 par call karein.`;
      }

      const errorMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        urgency: 'YELLOW',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      clearTimeout(safetyTimeout);
      setIsLoading(false);
    }
  };

  const handleSendToDoctorReview = () => {
    const caseData = {
      id: `case-${Date.now()}`,
      patientName,
      ageGroup,
      exactAge,
      urgency: currentUrgency,
      date: new Date().toISOString(),
      symptoms: messages.filter((m) => m.role === 'user').map((m) => m.content).join('; '),
      aiSummary: messages.filter((m) => m.role === 'assistant').slice(-1)[0]?.content || '',
      status: 'pending_review',
    };
    onAddCaseForDoctorReview(caseData);
    setCaseSavedNotification('Case file successfully prepared and forwarded to PMDC Doctor Review Queue!');
    setTimeout(() => setCaseSavedNotification(null), 5000);
  };

  const handleSubmitForm = async (formData: SymptomFormData) => {
    setSubmittedFormData(formData);
    setIsFormDossierExpanded(false);

    // Build multilingual structured narrative
    let narrative = '';
    if (currentLanguage === 'ur') {
      const redFlagStatus =
        formData.redFlags.chestPain ||
        formData.redFlags.breathingDifficulty ||
        formData.redFlags.faintingOrConfusion ||
        formData.redFlags.unableToKeepFluids ||
        formData.redFlags.highFeverInfant
          ? '⚠️ ایمرجنسی علامات موجود ہیں (Danger Flags Detected)'
          : 'کوئی ایمرجنسی علامت نہیں بتائی گئی';

      narrative = [
        `[مریض کا منظم طبی انٹیک فارم - SehatSaathi Clinical Dossier]`,
        `• بنیادی علامت (Chief Complaint): ${formData.chiefComplaint}`,
        formData.detailedNotes ? `• مریض کے اپنے الفاظ میں وضاحت: "${formData.detailedNotes}"` : '',
        `• کتنے عرصے سے ہے (Duration): ${formData.duration}`,
        `• تکلیف کی شدت (Severity): ${formData.severity}/10`,
        `• بیماری کا رخ (Progression): ${formData.progression}`,
        formData.associatedSymptoms.length > 0 ? `• ساتھ دیگر علامات (Associated Symptoms): ${formData.associatedSymptoms.join(', ')}` : '',
        formData.triggersOrRelief ? `• کس سے فرق پڑتا ہے / محرکات: ${formData.triggersOrRelief}` : '',
        formData.medicationsTaken ? `• اب تک لی گئی ادویات: ${formData.medicationsTaken}` : '',
        `• ایمرجنسی خطرے کی جانچ (Red Flag Screening): ${redFlagStatus}`,
      ].filter(Boolean).join('\n');
    } else if (currentLanguage === 'roman') {
      const redFlagStatus =
        formData.redFlags.chestPain ||
        formData.redFlags.breathingDifficulty ||
        formData.redFlags.faintingOrConfusion ||
        formData.redFlags.unableToKeepFluids ||
        formData.redFlags.highFeverInfant
          ? '⚠️ Khatarnak Emergency Nishaniyan Noted'
          : 'Koi acute emergency red flags report nahi huay';

      narrative = [
        `[Mareez Ka Munazzam Intake Form - SehatSaathi Clinical Dossier]`,
        `• Bunyaadi Alamat (Chief Complaint): ${formData.chiefComplaint}`,
        formData.detailedNotes ? `• Mareez ki wazahat: "${formData.detailedNotes}"` : '',
        `• Muddat (Duration): ${formData.duration}`,
        `• Takleef ki Shiddat (Severity): ${formData.severity}/10`,
        `• Bemari ka Rukh (Progression): ${formData.progression}`,
        formData.associatedSymptoms.length > 0 ? `• Saath doosri alamaat: ${formData.associatedSymptoms.join(', ')}` : '',
        formData.triggersOrRelief ? `• Kis cheez se asar parta hai: ${formData.triggersOrRelief}` : '',
        formData.medicationsTaken ? `• Pehle se li gayi dawaiyan: ${formData.medicationsTaken}` : '',
        `• Emergency Red Flag Screening: ${redFlagStatus}`,
      ].filter(Boolean).join('\n');
    } else {
      const redFlagStatus =
        formData.redFlags.chestPain ||
        formData.redFlags.breathingDifficulty ||
        formData.redFlags.faintingOrConfusion ||
        formData.redFlags.unableToKeepFluids ||
        formData.redFlags.highFeverInfant
          ? '⚠️ ACUTE RED FLAGS PRESENT'
          : 'No acute emergency red flags reported';

      narrative = [
        `[STRUCTURED CLINICAL INTAKE DOSSIER]`,
        `• Chief Complaint: ${formData.chiefComplaint} (${formData.chiefComplaintCategory})`,
        formData.detailedNotes ? `• Patient's Description: "${formData.detailedNotes}"` : '',
        `• Duration: ${formData.duration}`,
        `• Severity: ${formData.severity} / 10`,
        `• Progression: ${formData.progression}`,
        formData.associatedSymptoms.length > 0 ? `• Associated Symptoms: ${formData.associatedSymptoms.join(', ')}` : '',
        formData.triggersOrRelief ? `• Triggers / Relieving Factors: ${formData.triggersOrRelief}` : '',
        formData.medicationsTaken ? `• Prior Medications Taken: ${formData.medicationsTaken}` : '',
        `• Red Flag Screening: ${redFlagStatus}`,
      ].filter(Boolean).join('\n');
    }

    setActiveMode('chat');
    await handleSendMessage(undefined, narrative, formData.photoBase64);
  };

  const handleResetChat = () => {
    voiceManager.stop();
    setMessages([]);
    setInputText('');
    setPhotoBase64(null);
    setSubmittedFormData(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Case Saved Notification Banner */}
      {caseSavedNotification && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-3 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{caseSavedNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setCaseSavedNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/80 border border-teal-600 text-teal-200 text-xs font-bold mb-2">
              <Stethoscope className="w-4 h-4" />
              <span>Voice & Text Symptom Triage</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Symptom Assessment Assistant
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 mt-1 max-w-xl">
              Age-aware triage calibrated for Pakistani families. Speak in your native language or type freely.
            </p>
          </div>

          {/* Quick Call 1122 */}
          <a
            href="tel:1122"
            onClick={onEmergencyCall}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/30 transition-all shrink-0"
          >
            <PhoneCall className="w-4 h-4 animate-bounce" />
            <span>Rescue 1122</span>
          </a>
        </div>
      </div>

      {/* Mode Switcher Tabs: Form vs Chat */}
      <div className="flex items-center p-1.5 bg-slate-200/80 dark:bg-slate-800 rounded-2xl border border-slate-300/80 dark:border-slate-700 max-w-xl mx-auto shadow-inner">
        <button
          id="mode-tab-form"
          type="button"
          onClick={() => setActiveMode('form')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeMode === 'form'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>
            {currentLanguage === 'ur'
              ? 'منظم میڈیکل فارم'
              : currentLanguage === 'roman'
              ? 'Munazzam Form'
              : 'Structured Intake Form'}
          </span>
          <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-extrabold uppercase">
            Recommended
          </span>
        </button>

        <button
          id="mode-tab-chat"
          type="button"
          onClick={() => setActiveMode('chat')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeMode === 'chat'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>
            {currentLanguage === 'ur'
              ? 'چیٹ و آواز موڈ'
              : currentLanguage === 'roman'
              ? 'AI Chat & Voice'
              : 'AI Chat & Voice'}
          </span>
          {messages.length > 1 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold">
              {messages.length}
            </span>
          )}
        </button>
      </div>

      {activeMode === 'form' ? (
        <SymptomIntakeForm
          currentLanguage={currentLanguage}
          patientProfiles={patientProfiles}
          selectedProfileId={selectedProfileId}
          onSelectProfileId={setSelectedProfileId}
          ageGroup={ageGroup}
          onChangeAgeGroup={setAgeGroup}
          exactAge={exactAge}
          onChangeExactAge={setExactAge}
          patientGender={patientGender}
          onChangeGender={setPatientGender}
          patientName={patientName}
          onChangePatientName={setPatientName}
          onSubmitForm={handleSubmitForm}
          onEmergencyCall={onEmergencyCall}
          isSubmitting={isLoading}
        />
      ) : (
        <>
          {/* Submitted Intake Dossier Summary (if filled) */}
          {submittedFormData && (
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {currentLanguage === 'ur'
                        ? 'مریض کا جمع کردہ منظم طبی ریکارڈ'
                        : currentLanguage === 'roman'
                        ? 'Mareez Ka Jama Shuda Intake Form (Dossier)'
                        : 'Submitted Patient Clinical Intake Form'}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {submittedFormData.chiefComplaint} • {submittedFormData.duration} • {submittedFormData.severity}/10 Pain Scale
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveMode('form')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700 hover:bg-teal-50 text-xs font-semibold cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{currentLanguage === 'ur' ? 'فارم ایڈٹ کریں' : 'Edit Form'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFormDossierExpanded(!isFormDossierExpanded)}
                    className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                    aria-label="Toggle details"
                  >
                    {isFormDossierExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isFormDossierExpanded && (
                <div className="pt-3 border-t border-teal-200/70 dark:border-teal-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">Chief Complaint</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{submittedFormData.chiefComplaint}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">Duration & Severity</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {submittedFormData.duration} • {submittedFormData.severity}/10 ({submittedFormData.progression})
                    </span>
                  </div>
                  {submittedFormData.associatedSymptoms.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 sm:col-span-2">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Associated Symptoms</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{submittedFormData.associatedSymptoms.join(', ')}</span>
                    </div>
                  )}
                  {submittedFormData.detailedNotes && (
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 sm:col-span-2">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Patient's Detailed Notes</span>
                      <p className="font-medium text-slate-800 dark:text-slate-200 italic">"{submittedFormData.detailedNotes}"</p>
                    </div>
                  )}
                  {(submittedFormData.triggersOrRelief || submittedFormData.medicationsTaken) && (
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 sm:col-span-2 text-slate-700 dark:text-slate-300">
                      {submittedFormData.triggersOrRelief && <div><strong>Triggers / Relief:</strong> {submittedFormData.triggersOrRelief}</div>}
                      {submittedFormData.medicationsTaken && <div><strong>Medications Taken:</strong> {submittedFormData.medicationsTaken}</div>}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Patient Profile Selection & Age Calibration Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-teal-600" />
            <span>{t.whoIsThisFor}</span>
          </label>

          <div className="flex items-center gap-2">
            <select
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
            >
              {patientProfiles.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.name} ({prof.relation}) - {prof.exactAge} yrs
                </option>
              ))}
              <option value="custom">Other / Quick Guest</option>
            </select>

            <button
              type="button"
              onClick={handleResetChat}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-xs"
              title="Reset Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Age Groups Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { id: 'infant', label: t.forInfant, sub: '0-2 yrs' },
            { id: 'child', label: t.forChild, sub: '2-12 yrs' },
            { id: 'teen', label: t.forTeen, sub: '13-18 yrs' },
            { id: 'adult', label: t.forSelf, sub: '18-60 yrs' },
            { id: 'elderly', label: t.forElderly, sub: '60+ yrs' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setAgeGroup(item.id as AgeGroup)}
              className={`p-2.5 rounded-xl text-left border transition-all text-xs font-semibold ${
                ageGroup === item.id
                  ? 'bg-teal-50 dark:bg-teal-950/70 border-teal-500 text-teal-900 dark:text-teal-200 shadow-2xs'
                  : 'bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <div className="font-bold text-slate-900 dark:text-white">{item.label}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">{item.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Urgency Status Pill */}
      {currentUrgency && (
        <div
          className={`flex items-center justify-between px-4 py-3 rounded-2xl border text-xs font-bold ${
            currentUrgency === 'RED'
              ? 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
              : currentUrgency === 'YELLOW'
              ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {currentUrgency === 'RED' ? (
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 animate-pulse" />
            ) : currentUrgency === 'YELLOW' ? (
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            )}
            <span>
              Urgency Level:{' '}
              {currentUrgency === 'RED'
                ? t.redUrgency
                : currentUrgency === 'YELLOW'
                ? t.yellowUrgency
                : t.greenUrgency}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentUrgency === 'RED' && (
              <a
                href="tel:1122"
                className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold"
              >
                Call 1122
              </a>
            )}
            <button
              type="button"
              onClick={handleSendToDoctorReview}
              className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              {t.sendToDoctor}
            </button>
          </div>
        </div>
      )}

      {/* Multilingual Symptom Guidance & Prompts with Voice Bar */}
      <div className="bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-teal-200/70 dark:border-teal-900/60 p-3 sm:p-4 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
              {currentLanguage === 'ur'
                ? 'عام علامات اور فوری رہنمائی (آواز اور تحریر):'
                : currentLanguage === 'roman'
                ? 'Aam Alamaat aur Fori Rehnumai (Voice & Text):'
                : 'Common Symptom Inquiries (Voice & Written Text):'}
            </span>
          </div>
          <span className="text-[11px] text-teal-700 dark:text-teal-300 font-semibold bg-teal-100/80 dark:bg-teal-950/80 px-2.5 py-0.5 rounded-full">
            Multilingual Voice & Guidance
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {SYMPTOM_GUIDANCE_PROMPTS.map((prompt) => {
            const label = prompt.labels[currentLanguage] || prompt.labels.en;
            return (
              <div
                key={prompt.id}
                className="inline-flex items-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs overflow-hidden transition-all hover:border-teal-400"
              >
                <button
                  type="button"
                  onClick={() => {
                    handleSendMessage(undefined, label);
                  }}
                  className="px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors text-left"
                >
                  {label}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    voiceManager.speak(label, currentLanguage);
                  }}
                  className="px-2 py-1.5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-700 transition-colors border-l border-slate-100 dark:border-slate-700"
                  title="Listen in selected language"
                  aria-label={`Listen prompt: ${label}`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 min-h-[380px] max-h-[550px] overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {isUser ? patientName : 'SehatSaathi AI'}
                </span>
                <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
              </div>

              {!isUser ? (
                <div className="w-full max-w-3xl">
                  <ClinicalOutputCard
                    content={msg.content}
                    urgency={currentUrgency}
                    feature="symptom"
                    currentLanguage={currentLanguage}
                    patientName={patientName}
                    patientAgeGroup={ageGroup}
                    onEmergencyCall={onEmergencyCall}
                    timestamp={msg.timestamp}
                  />
                </div>
              ) : (
                <div className="max-w-[88%] sm:max-w-[78%] rounded-2xl p-4 text-sm leading-relaxed shadow-xs bg-teal-600 text-white rounded-tr-xs">
                  {msg.photoUrl && (
                    <div className="mb-3 rounded-xl overflow-hidden border border-white/20 max-w-xs">
                      <img
                        src={msg.photoUrl}
                        alt="Uploaded Symptom"
                        className="w-full h-auto object-cover max-h-48"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  <div className="whitespace-pre-wrap font-sans text-sm sm:text-base">
                    {msg.content}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl max-w-sm">
            <div className="w-3 h-3 rounded-full bg-teal-600 animate-ping" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Evaluating symptoms & consulting clinical protocols...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Photo Preview Thumbnail */}
      {photoBase64 && (
        <div className="flex items-center gap-3 p-3 bg-teal-50 dark:bg-slate-800 rounded-2xl border border-teal-200 dark:border-teal-800">
          <img
            src={photoBase64}
            alt="Preview"
            className="w-14 h-14 object-cover rounded-xl border border-teal-300"
          />
          <div className="flex-1 text-xs">
            <p className="font-bold text-slate-900 dark:text-white">Symptom Photo Attached</p>
            <p className="text-slate-500">Will be analyzed alongside your voice/text description</p>
          </div>
          <button
            type="button"
            onClick={() => setPhotoBase64(null)}
            className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Input Action Bar */}
      <form
        onSubmit={handleSendMessage}
        className="w-full p-2 sm:p-2.5 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md flex items-center gap-1.5 sm:gap-2 mb-20 sm:mb-24 box-border relative z-10"
      >
        {/* Hidden File Input for Camera/Gallery */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
        />

        {/* Photo Upload Button */}
        <button
          id="symptom-photo-btn"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-10 h-10 sm:w-11 sm:h-11 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex items-center justify-center shrink-0 cursor-pointer"
          title={currentLanguage === 'en' ? 'Upload photo of rash or symptom' : 'علامت یا زخم کی تصویر اپلوڈ کریں'}
          aria-label="Upload photo"
        >
          <Camera className="w-5 h-5" />
        </button>

        {/* Big Speech-To-Text Microphone Button */}
        <button
          id="symptom-mic-btn"
          type="button"
          onClick={toggleRecording}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all flex items-center justify-center shrink-0 cursor-pointer ${
            isRecording
              ? 'bg-red-600 text-white animate-pulse shadow-md shadow-red-500/40'
              : 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100'
          }`}
          title={isRecording ? t.stopVoice : t.voiceInput}
          aria-label={isRecording ? 'Stop voice recording' : 'Start voice input'}
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Text Input */}
        <input
          id="symptom-text-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isRecording ? t.listening : (currentLanguage === 'en' ? 'Describe your symptoms (e.g., headache, fever)...' : t.typeOrSpeak)}
          dir={currentLanguage === 'en' ? 'ltr' : 'auto'}
          className="flex-1 min-w-0 bg-transparent px-2.5 sm:px-3 py-2 text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden min-h-[44px]"
        />

        {/* Green Circular Send Button: Fully visible, properly aligned beside the input field */}
        <button
          id="symptom-send-btn"
          type="submit"
          disabled={isLoading || (!inputText.trim() && !photoBase64)}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95 cursor-pointer"
          title={currentLanguage === 'en' ? 'Send message' : 'پیغام بھیجیں'}
          aria-label="Send message"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </form>
        </>
      )}
    </div>
  );
};
