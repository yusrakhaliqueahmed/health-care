import React, { useState } from 'react';
import { SupportedLanguage, NavigationTab, UserAccount, PatientProfile, UnifiedHealthRecord } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { createSpeechRecognizer } from '../services/voice';
import { MedicalPulseHeart } from './MedicalPulseHeart';
import { Diagnostic3DHeartCard } from './Diagnostic3DHeartCard';
import { motion } from 'motion/react';
import {
  Stethoscope,
  Pill,
  FileText,
  MapPin,
  AlertTriangle,
  History,
  ShieldCheck,
  PhoneCall,
  Mic,
  MicOff,
  Search,
  ArrowRight,
  CheckCircle2,
  Activity,
  Calendar,
  Sparkles,
  ChevronRight,
  Share2,
  Clock,
  Award,
  Layers,
} from 'lucide-react';
import { ClinicalHeartIcon } from './ClinicalHeartIcon';

interface HeroLandingProps {
  currentLanguage: SupportedLanguage;
  pendingDoctorReviewsCount?: number;
  currentUser?: UserAccount;
  patientProfiles?: PatientProfile[];
  prescriptionsCount?: number;
  onNavigate: (tab: NavigationTab) => void;
  onEmergencyCall?: () => void;
  onOpenDisclaimer?: () => void;
  onReplaySplash?: () => void;
  onSaveSearchRecord?: (record: UnifiedHealthRecord) => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({
  currentLanguage,
  pendingDoctorReviewsCount = 0,
  currentUser,
  patientProfiles = [],
  prescriptionsCount = 0,
  onNavigate,
  onEmergencyCall,
  onOpenDisclaimer,
  onReplaySplash,
  onSaveSearchRecord,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';
  const displayName = currentUser?.name || patientProfiles[0]?.name || '';

  // Load genuine user-recorded vitals
  const [vitalsData] = useState<{
    heartRate?: string;
    bloodPressure?: string;
    bloodSugar?: string;
    weight?: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('sehat_saathi_vitals');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [copiedSos, setCopiedSos] = useState(false);

  // Voice speech recognizer for triage search
  const handleToggleVoiceSearch = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    const recognizer = createSpeechRecognizer();
    if (!recognizer.isSupported) {
      setSearchQuery('Speech mic not supported in this browser. Please type symptoms.');
      return;
    }
    setIsListening(true);
    recognizer.start(
      currentLanguage,
      (text) => {
        setSearchQuery(text);
        setIsListening(false);
        // Automatically route to symptoms if symptoms detected
        onNavigate('symptoms');
      },
      () => setIsListening(false),
      () => setIsListening(false)
    );
  };

  const logSearchToRecords = (queryText: string, targetCategory: 'medicine' | 'lab_report' | 'symptom') => {
    if (!onSaveSearchRecord || !queryText.trim()) return;
    const isMed = targetCategory === 'medicine';
    const isLab = targetCategory === 'lab_report';

    const recordTitle =
      isMed
        ? isUrdu
          ? `آپ نے یہ دوا تلاش کی ہے: ${queryText}`
          : isRoman
          ? `Aap ny ye medicine search ki hai: ${queryText}`
          : `Medicine Searched: ${queryText}`
        : isLab
        ? isUrdu
          ? `آپ نے یہ رپورٹ کا پوچھا ہے: ${queryText}`
          : isRoman
          ? `Aap ny is report ka pocha hai: ${queryText}`
          : `Diagnostic Report Inquired: ${queryText}`
        : isUrdu
        ? `آپ نے یہ تلاش کیا ہے: ${queryText}`
        : isRoman
        ? `Aap ny ye search kiya hai: ${queryText}`
        : `Medical Inquiry Logged: ${queryText}`;

    const searchRecord: UnifiedHealthRecord = {
      id: `rec-srch-${Date.now()}`,
      referenceNumber: `SS-SR-${Date.now().toString().slice(-6)}`,
      labCaseNumber: `SR-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: (currentUser?.email || currentUser?.id || 'default').toLowerCase().trim(),
      patientProfileId: 'prof-self',
      patientName: displayName || 'Patient',
      patientAge: '32 Y',
      patientGender: 'male',
      category: 'search_history',
      searchQuery: queryText,
      searchType: isMed ? 'medicine' : isLab ? 'lab_report' : 'symptom',
      title: recordTitle,
      panelName: isMed ? 'PHARMACOLOGICAL SAFETY SEARCH RECORD' : isLab ? 'LABORATORY REPORT INQUIRY RECORD' : 'PATIENT CLINICAL INQUIRY & TRIAGE LOG',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'ai_preliminary',
      urgency: 'GREEN',
      testResults: [
        {
          testName: isUrdu ? 'سرچ شدہ الفاظ' : isRoman ? 'Search Query' : 'Searched Term',
          result: queryText,
          referenceRange: 'Clinical Inquiry',
          isAbnormal: false,
        },
        {
          testName: isUrdu ? 'متعلقہ شعبہ' : isRoman ? 'Category' : 'Clinical Domain',
          result: isMed ? 'Pharmacology' : isLab ? 'Pathology / Diagnostics' : 'Clinical Triage',
          referenceRange: 'General Medicine',
          isAbnormal: false,
        },
      ],
      clinicalNotes: isUrdu
        ? `صارف نے صحت ساتھی پر تلاش کیا: "${queryText}"۔ یہ سرچ صارف کے میڈیکل ریکارڈ میں مستقل طور پر محفوظ کر دی گئی ہے۔`
        : isRoman
        ? `User ny SehatSaathi par search kiya: "${queryText}". Yeh query health record me save ho chuki hai.`
        : `User inquired: "${queryText}". Logged to permanent patient health history.`,
      doctorComments: 'Recorded to patient clinical inquiry history.',
      reviewedByDoctor: 'SehatSaathi Clinical Diagnostics AI',
    };

    onSaveSearchRecord(searchRecord);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const lower = searchQuery.toLowerCase();
    const isMed = lower.includes('mg') || lower.includes('syrup') || lower.includes('tablet') || lower.includes('panadol') || lower.includes('dawai') || lower.includes('medicine') || lower.includes('goli');
    const isLab = lower.includes('report') || lower.includes('test') || lower.includes('cbc') || lower.includes('xray') || lower.includes('blood') || lower.includes('sugar') || lower.includes('urine');

    const category: 'medicine' | 'lab_report' | 'symptom' = isMed ? 'medicine' : isLab ? 'lab_report' : 'symptom';
    logSearchToRecords(searchQuery, category);

    if (isMed) {
      onNavigate('medicine');
    } else if (isLab) {
      onNavigate('reports');
    } else {
      onNavigate('symptoms');
    }
  };

  const handleShareEmergencySos = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(5);
          const lng = pos.coords.longitude.toFixed(5);
          const msg = `🚨 EMERGENCY MEDICAL SOS - SehatSaathi: Urgent medical assistance needed. Patient: ${displayName || 'Emergency Patient'}. Live GPS Pin: https://maps.google.com/?q=${lat},${lng} (${lat}, ${lng}). Please dispatch Rescue 1122 or head to the nearest emergency trauma center immediately!`;
          navigator.clipboard?.writeText(msg);
          setCopiedSos(true);
          setTimeout(() => setCopiedSos(false), 3000);
        },
        () => {
          const msg = `🚨 EMERGENCY MEDICAL SOS - SehatSaathi: Urgent assistance required for patient: ${displayName || 'Emergency Patient'}. Please call Rescue 1122 or dispatch immediate emergency medical help!`;
          navigator.clipboard?.writeText(msg);
          setCopiedSos(true);
          setTimeout(() => setCopiedSos(false), 3000);
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else if (onEmergencyCall) {
      onEmergencyCall();
    }
  };

  const quickSymptomsList = [
    {
      label: isUrdu
        ? 'بخار اور سردی'
        : isRoman
        ? 'Bukhar aur sardi'
        : 'Fever & Chills',
      tab: 'symptoms' as NavigationTab,
    },
    {
      label: isUrdu
        ? 'سینے میں درد یا دباؤ'
        : isRoman
        ? 'Seenay mein dard'
        : 'Chest Pain',
      tab: 'symptoms' as NavigationTab,
    },
    {
      label: isUrdu
        ? 'پیناڈول شربت کی خوراک'
        : isRoman
        ? 'Panadol dosage'
        : 'Panadol Dosage',
      tab: 'medicine' as NavigationTab,
    },
    {
      label: isUrdu
        ? 'خون کا ٹیسٹ (سی بی سی)'
        : isRoman
        ? 'CBC Blood Report'
        : 'CBC Blood Report',
      tab: 'reports' as NavigationTab,
    },
    {
      label: isUrdu
        ? 'قریبی ایمرجنسی ہسپتال'
        : isRoman
        ? 'Hospital 1122'
        : 'Nearest Hospital',
      tab: 'care' as NavigationTab,
    },
  ];

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 1. Executive Triage Search & Welcome Banner with Interactive 3D Anatomy Pod */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c2f28] via-[#092620] to-[#041411] text-white p-6 sm:p-8 lg:p-9 shadow-xl border border-teal-900/50 perspective-1000"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-400/30">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
                <span>{t.pmdcCertifiedCare}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t.doctorsOnDuty}</span>
              </span>
              {onReplaySplash && (
                <button
                  type="button"
                  onClick={onReplaySplash}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-600/30 hover:bg-teal-600/50 text-teal-200 text-xs font-semibold border border-teal-400/40 transition-colors cursor-pointer"
                  title={t.medicalOverview}
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                  <span>{t.medicalOverview}</span>
                </button>
              )}
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {displayName ? `${t.welcomeGreeting}, ${displayName}` : t.appName}
              </h2>
              <p className="text-sm sm:text-base text-teal-100/80 mt-1 max-w-2xl font-normal">
                {t.tagline}
              </p>
            </div>

            {/* Clinical Query & Voice Triage Search Bar */}
            <form onSubmit={handleSearchSubmit} className="pt-2">
              <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-teal-200/50 dark:border-teal-800/60 p-1.5 focus-within:ring-2 focus-within:ring-teal-400 transition-all">
                <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full px-3 py-2.5 text-sm sm:text-base text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-transparent focus:outline-hidden"
                />

                {/* Voice Mic Input */}
                <button
                  type="button"
                  onClick={handleToggleVoiceSearch}
                  className={`p-2.5 rounded-xl transition-all mr-1 shrink-0 ${
                    isListening
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900'
                  }`}
                  title={`${t.audioPlay} (${currentLanguage})`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors shrink-0"
                >
                  {t.searchButton}
                </button>
              </div>
            </form>

            {/* Quick Symptoms Preset Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-teal-300/80 font-medium">
                {t.quickShortcuts}
              </span>
              {quickSymptomsList.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    logSearchToRecords(item.label, 'symptom');
                    onNavigate(item.tab);
                  }}
                  className="text-xs px-3 py-1 rounded-full bg-teal-950/60 hover:bg-teal-900 border border-teal-700/50 text-teal-200 transition-colors font-medium hover:scale-105 active:scale-95"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: 3D Diagnostic Heart & Anatomy (Video Model) - Doctor picture removed */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
            <Diagnostic3DHeartCard
              currentLanguage={currentLanguage}
              size={185}
              interactive={true}
              showExpandButton={true}
            />
          </div>
        </div>

        {/* Subtle decorative medical pulse wave in background */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-6">
          <Activity className="w-72 h-72 text-teal-400" />
        </div>
      </motion.section>

      {/* 2. Core Clinical Bento Grid (The 4 Primary Tools) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {t.primaryClinicalServices}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.primaryServicesSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenDisclaimer}
            className="text-xs font-semibold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-1"
          >
            <span>{t.safetyGuidelines}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: AI Symptom Assessment */}
          <div
            onClick={() => onNavigate('symptoms')}
            className="group relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center text-teal-700 dark:text-teal-300 group-hover:scale-105 transition-transform">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  {isUrdu ? 'آواز اور تحریر' : isRoman ? 'Awaaz + Tehreer' : 'Voice + Text'}
                </span>
              </div>

              <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {t.navSymptoms}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                {t.symptomsCardDesc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
              <span>{t.startAssessment}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Medicine & Dosage Safety */}
          <div
            onClick={() => onNavigate('medicine')}
            className="group relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 group-hover:scale-105 transition-transform">
                  <Pill className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {isUrdu ? 'بچوں کے لیے محفوظ' : isRoman ? 'Bachon ke liye Mehfooz' : 'Pediatric Safe'}
                </span>
              </div>

              <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {t.navMedicine}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                {t.medicineCardDesc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>{t.verifyMedicine}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Lab Reports & Radiology Vision */}
          <div
            onClick={() => onNavigate('reports')}
            className="group relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-600 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200/60 dark:border-cyan-800/60 flex items-center justify-center text-cyan-700 dark:text-cyan-300 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                  {isUrdu ? 'تصویری تجزیہ' : isRoman ? 'Tasveeri Tajziya' : 'AI Vision'}
                </span>
              </div>

              <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                {t.navReports}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                {t.reportsCardDesc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-cyan-600 dark:text-cyan-400">
              <span>{t.analyzeReport}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Verified Doctor & Care Finder */}
          <div
            onClick={() => onNavigate('care')}
            className="group relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center text-teal-700 dark:text-teal-300 group-hover:scale-105 transition-transform">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  {isUrdu ? 'جی پی ایس تصدیق شدہ' : isRoman ? 'GPS Tasdeeq Shuda' : 'GPS Verified'}
                </span>
              </div>

              <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {t.navNearby}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                {t.nearbyCardDesc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
              <span>{t.findCareBtn}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Patient Vitals Hub & Verified Doctor Banner Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left (2 Cols): Patient Vitals Matrix */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  {t.patientHealthVitals}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {displayName || t.navRecords} • {vitalsData ? t.recorded : t.notRecorded}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('records')}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
            >
              {t.viewEhr}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {/* Heart Rate */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <ClinicalHeartIcon className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                <span>{t.heartRate}</span>
              </span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-baseline gap-1">
                <span>{vitalsData?.heartRate || '—'}</span>
                {vitalsData?.heartRate && <span className="text-xs font-normal text-slate-400">bpm</span>}
              </div>
              <span className={`inline-block mt-1 text-[10px] font-semibold ${vitalsData?.heartRate ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {vitalsData?.heartRate ? `● ${t.recorded}` : t.notRecorded}
              </span>
            </div>

            {/* Blood Pressure */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {t.bloodPressure}
              </span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-baseline gap-1">
                <span>{vitalsData?.bloodPressure || '—'}</span>
                {vitalsData?.bloodPressure && <span className="text-xs font-normal text-slate-400">mmHg</span>}
              </div>
              <span className={`inline-block mt-1 text-[10px] font-semibold ${vitalsData?.bloodPressure ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {vitalsData?.bloodPressure ? `● ${t.recorded}` : t.notRecorded}
              </span>
            </div>

            {/* Blood Sugar */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {t.bloodSugar}
              </span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-baseline gap-1">
                <span>{vitalsData?.bloodSugar || '—'}</span>
                {vitalsData?.bloodSugar && <span className="text-xs font-normal text-slate-400">mg/dL</span>}
              </div>
              <span className={`inline-block mt-1 text-[10px] font-semibold ${vitalsData?.bloodSugar ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {vitalsData?.bloodSugar ? `● ${t.recorded}` : t.notRecorded}
              </span>
            </div>

            {/* Active Prescriptions */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {t.verifiedRx}
              </span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {prescriptionsCount} {t.active}
              </div>
              <span className="inline-block mt-1 text-[10px] font-semibold text-teal-600 dark:text-teal-400">
                {prescriptionsCount > 0 ? (isUrdu ? 'کیو آر لائسنس یافتہ' : isRoman ? 'QR Licensed' : 'QR Licensed') : t.notRecorded}
              </span>
            </div>
          </div>

          {!vitalsData && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                {t.noVitalsRecorded}
              </span>
              <button
                type="button"
                onClick={() => onNavigate('records')}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
              >
                {t.recordVitals}
              </button>
            </div>
          )}
        </div>

        {/* Right (1 Col): Verified On-Duty Doctor Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-900 to-slate-950 text-white border border-teal-800/60 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-700/60">
                {t.consultantOnDuty}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {t.availableNow}
              </span>
            </div>

            <h4 className="text-lg font-bold text-white">Dr. Ayesha Malik</h4>
            <p className="text-xs text-teal-200">{t.doctorSpecialty}</p>
            <p className="text-[11px] text-teal-300/80 mt-1">{t.doctorLicense}</p>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              {t.doctorDesc}
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-teal-800/60 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('care')}
              className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors text-center"
            >
              {t.bookTeleconsult}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('doctor_portal')}
              className="py-2 px-3 rounded-xl bg-teal-950 hover:bg-teal-900 border border-teal-700 text-teal-200 text-xs font-semibold transition-colors"
            >
              {t.portal} ({pendingDoctorReviewsCount})
            </button>
          </div>
        </div>
      </section>

      {/* 4. Rapid Emergency 1122 SOS Banner */}
      <section className="p-5 rounded-2xl bg-red-600 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <PhoneCall className="w-6 h-6 text-white animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest bg-red-800/80 px-2 py-0.5 rounded text-red-100">
                {t.nationalEmergencyRescue}
              </span>
              <span className="text-xs text-red-200">{t.freeHelpline24_7}</span>
            </div>
            <h4 className="text-lg font-extrabold text-white mt-0.5">
              {t.rescue1122Title}
            </h4>
            <p className="text-xs text-red-100">
              {t.rescue1122Desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <a
            href="tel:1122"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-red-700 font-extrabold text-sm shadow-md hover:bg-red-50 active:scale-95 transition-all"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{t.navEmergency}</span>
          </a>

          <button
            type="button"
            onClick={handleShareEmergencySos}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-700/80 hover:bg-red-800 border border-red-400/40 text-white font-bold text-xs transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>{copiedSos ? t.gpsCopied : t.shareLiveGps}</span>
          </button>
        </div>
      </section>

      {/* 5. Clinical Safety & PMDC Assurance Footer Strip */}
      <section className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>
            {t.complianceNote}
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenDisclaimer}
          className="text-teal-600 dark:text-teal-400 font-semibold hover:underline shrink-0"
        >
          {t.readDisclaimers}
        </button>
      </section>
    </div>
  );
};
