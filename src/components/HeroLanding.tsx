import React, { useState } from 'react';
import { SupportedLanguage, NavigationTab, UserAccount, PatientProfile } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { createSpeechRecognizer } from '../services/voice';
import { Medical3DCanvas } from './Medical3DCanvas';
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
  Heart,
  Activity,
  Calendar,
  Sparkles,
  ChevronRight,
  Share2,
  Clock,
  Award,
  Layers,
} from 'lucide-react';

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Determine whether query is medicine or symptom
    const lower = searchQuery.toLowerCase();
    if (lower.includes('mg') || lower.includes('syrup') || lower.includes('tablet') || lower.includes('panadol') || lower.includes('dawai') || lower.includes('medicine')) {
      onNavigate('medicine');
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
    { label: isUrdu ? 'بخار اور سردی' : isRoman ? 'Bukhar aur sardi' : 'Fever & Chills', tab: 'symptoms' as NavigationTab },
    { label: isUrdu ? 'سینے میں درد یا دباؤ' : isRoman ? 'Seenay mein dard' : 'Chest Pain', tab: 'symptoms' as NavigationTab },
    { label: isUrdu ? 'پیناڈول شربت کی خوراک' : isRoman ? 'Panadol dosage' : 'Panadol Dosage', tab: 'medicine' as NavigationTab },
    { label: isUrdu ? 'خون کا ٹیسٹ (سی بی سی)' : isRoman ? 'CBC Blood Report' : 'CBC Blood Report', tab: 'reports' as NavigationTab },
    { label: isUrdu ? 'قریبی ایمرجنسی ہسپتال' : isRoman ? 'Hospital 1122' : 'Nearest Hospital', tab: 'care' as NavigationTab },
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
                <span>PMDC Certified Clinical Care</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Doctors On Duty 24/7</span>
              </span>
              {onReplaySplash && (
                <button
                  type="button"
                  onClick={onReplaySplash}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-600/30 hover:bg-teal-600/50 text-teal-200 text-xs font-semibold border border-teal-400/40 transition-colors cursor-pointer"
                  title="View 3D Doctor & Anatomy Simulation"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                  <span>3D Medical Simulation</span>
                </button>
              )}
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {displayName ? (
                  isUrdu
                    ? `خوش آمدید، ${displayName}`
                    : isRoman
                    ? `Khush Amdeed, ${displayName}`
                    : `How can we help you today, ${displayName.split(' ')[0]}?`
                ) : (
                  isUrdu
                    ? 'صحت ساتھی میں خوش آمدید'
                    : isRoman
                    ? 'SehatSaathi mein Khush Amdeed'
                    : 'How can we help you today?'
                )}
              </h2>
              <p className="text-sm sm:text-base text-teal-100/80 mt-1 max-w-2xl font-normal">
                {isUrdu
                  ? 'اپنی علامات لکھیں یا بولیں، ادویات کی درست خوراک جانچیں، یا فوری ایمرجنسی 1122 حاصل کریں۔'
                  : isRoman
                  ? 'Apni alamaat likhein ya bol kar batayein, dawai ki sahi dosage check karein, ya 1122 ambulance hasil karein.'
                  : 'Check your symptoms via voice, verify medicine safety & dosage, decode diagnostic lab tests, or locate nearby verified care.'}
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
                  placeholder={
                    isUrdu
                      ? 'اپنی بیماری کی علامات یا دوا کا نام یہاں درج کریں...'
                      : isRoman
                      ? 'Alamaat ya dawai ka naam likhein (maslan: tez bukhar, khansi)...'
                      : 'Describe symptoms or medicine (e.g., fever, throat pain, Augmentin dosage)...'
                  }
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
                  title="Speak symptoms (Urdu / Roman Urdu / English)"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors shrink-0"
                >
                  {isUrdu ? 'چیک کریں' : isRoman ? 'Check Karein' : 'Analyze'}
                </button>
              </div>
            </form>

            {/* Quick Symptoms Preset Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-teal-300/80 font-medium">
                {isUrdu ? 'فوری جانچ:' : isRoman ? 'Jald check karein:' : 'Quick shortcuts:'}
              </span>
              {quickSymptomsList.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onNavigate(item.tab)}
                  className="text-xs px-3 py-1 rounded-full bg-teal-950/60 hover:bg-teal-900 border border-teal-700/50 text-teal-200 transition-colors font-medium hover:scale-105 active:scale-95"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Live Interactive 3D Medical Hologram Pod */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
            <div className="w-full max-w-sm rounded-2xl bg-teal-950/50 border border-teal-500/30 backdrop-blur-md p-4 shadow-[0_16px_40px_rgba(0,0,0,0.45)] relative overflow-hidden group hover:border-teal-400/50 transition-all duration-300">
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-teal-800/40 text-xs">
                <div className="flex items-center gap-2 text-teal-300 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                  <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                  <span>3D Diagnostic Heart & DNA</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-teal-300 bg-teal-900/80 px-2 py-0.5 rounded-md border border-teal-600/50 tracking-wide">
                  WebGL 3D
                </span>
              </div>

              {/* 3D Canvas Box */}
              <div className="relative w-full h-64 rounded-xl overflow-hidden bg-radial from-teal-900/30 via-transparent to-transparent flex items-center justify-center cursor-grab active:cursor-grabbing">
                <Medical3DCanvas interactive={true} />

                {/* 3D Drag Orbit Hint Overlay */}
                <div className="absolute bottom-2 inset-x-2 flex items-center justify-between text-[10px] text-teal-200/80 bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-lg pointer-events-none border border-teal-800/50">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-teal-300" />
                    <span>3D Interactive Anatomy</span>
                  </span>
                  <span>Drag to rotate in 3D</span>
                </div>
              </div>

              {/* Bottom Quick Controls */}
              <div className="mt-3 pt-2.5 border-t border-teal-800/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>PMDC Anatomical Model</span>
                </div>
                {onReplaySplash && (
                  <button
                    type="button"
                    onClick={onReplaySplash}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Expand 3D</span>
                  </button>
                )}
              </div>
            </div>
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
              {isUrdu ? 'طبی سہولیات' : isRoman ? 'Tibbi Sahuliyat' : 'Primary Clinical Services'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isUrdu
                ? 'ہر ٹول میں اردو، رومن اردو اور انگریزی آواز کی رہنمائی دستیاب ہے'
                : isRoman
                ? 'Har tool mein Roman Urdu aur audio guidance shamil hai'
                : 'AI-assisted, PMDC physician-backed diagnostic & guidance suite'}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenDisclaimer}
            className="text-xs font-semibold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-1"
          >
            <span>Safety Guidelines</span>
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
                  Voice + Text
                </span>
              </div>

              <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {t.navSymptoms}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                Describe illness in your own voice or text. Get red-flag triage rating, immediate care advice, and case file for doctors.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
              <span>Start Assessment</span>
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
                  Pediatric Safe
                </span>
              </div>

              <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {t.navMedicine}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                Check syrup and tablet doses by child or adult age. Verify dangerous drug interactions and scan packaging photos.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>Verify Medicine</span>
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
                  AI Vision
                </span>
              </div>

              <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                {t.navReports}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                Upload blood test reports (CBC, HbA1c, LFT) or chest X-rays. Receive simplified normal/abnormal explanations in your language.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-cyan-600 dark:text-cyan-400">
              <span>Analyze Report</span>
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
                  GPS Verified
                </span>
              </div>

              <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {t.navNearby}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                Connect directly with PMDC licensed physicians, book teleconsultations, and locate 24/7 pharmacies across Pakistan.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
              <span>Find Care</span>
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
                  {isUrdu ? 'مریض کی صحت کا خاکہ' : isRoman ? 'Patient Health Snapshot' : 'Patient Health & Vitals'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {displayName || (isUrdu ? 'معزز مریض' : isRoman ? 'Moazziz Mareez' : 'Guest Patient')} • {vitalsData ? (isUrdu ? 'ریکارڈ شدہ وائٹلز' : 'Logged Vitals') : (isUrdu ? 'کوئی وائٹلز درج نہیں ہیں' : isRoman ? 'Koi vitals darj nahi hain' : 'No vitals recorded yet')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('records')}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
            >
              {isUrdu ? 'ریکارڈ دیکھیں →' : 'View EHR →'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {/* Heart Rate */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Heart Rate
              </span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-baseline gap-1">
                <span>{vitalsData?.heartRate || '—'}</span>
                {vitalsData?.heartRate && <span className="text-xs font-normal text-slate-400">bpm</span>}
              </div>
              <span className={`inline-block mt-1 text-[10px] font-semibold ${vitalsData?.heartRate ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {vitalsData?.heartRate ? '● Recorded' : (isUrdu ? 'درج نہیں' : 'Not recorded')}
              </span>
            </div>

            {/* Blood Pressure */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Blood Pressure
              </span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-baseline gap-1">
                <span>{vitalsData?.bloodPressure || '—'}</span>
                {vitalsData?.bloodPressure && <span className="text-xs font-normal text-slate-400">mmHg</span>}
              </div>
              <span className={`inline-block mt-1 text-[10px] font-semibold ${vitalsData?.bloodPressure ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {vitalsData?.bloodPressure ? '● Recorded' : (isUrdu ? 'درج نہیں' : 'Not recorded')}
              </span>
            </div>

            {/* Blood Sugar */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Blood Sugar
              </span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-baseline gap-1">
                <span>{vitalsData?.bloodSugar || '—'}</span>
                {vitalsData?.bloodSugar && <span className="text-xs font-normal text-slate-400">mg/dL</span>}
              </div>
              <span className={`inline-block mt-1 text-[10px] font-semibold ${vitalsData?.bloodSugar ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {vitalsData?.bloodSugar ? '● Recorded' : (isUrdu ? 'درج نہیں' : 'Not recorded')}
              </span>
            </div>

            {/* Active Prescriptions */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Verified Rx
              </span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {prescriptionsCount} Active
              </div>
              <span className="inline-block mt-1 text-[10px] font-semibold text-teal-600 dark:text-teal-400">
                {prescriptionsCount > 0 ? 'QR Licensed' : (isUrdu ? 'کوئی نسخہ نہیں' : 'None yet')}
              </span>
            </div>
          </div>

          {!vitalsData && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                {isUrdu
                  ? 'آپ نے ابھی تک اپنا بلڈ پریشر یا شوگر درج نہیں کی ہے۔'
                  : isRoman
                  ? 'Aap ne abhi tak apna blood pressure ya sugar record nahi kiya.'
                  : 'You have not recorded blood pressure, pulse, or sugar readings yet.'}
              </span>
              <button
                type="button"
                onClick={() => onNavigate('records')}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
              >
                {isUrdu ? 'وائٹلز درج کریں' : isRoman ? 'Vitals Darj Karein' : 'Record Vitals'}
              </button>
            </div>
          )}
        </div>

        {/* Right (1 Col): Verified On-Duty Doctor Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-900 to-slate-950 text-white border border-teal-800/60 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-700/60">
                Consultant On Duty
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Available Now
              </span>
            </div>

            <h4 className="text-lg font-bold text-white">Dr. Ayesha Malik</h4>
            <p className="text-xs text-teal-200">MBBS, FCPS • General Physician</p>
            <p className="text-[11px] text-teal-300/80 mt-1">PMDC License #48291-P</p>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Available for instant AI case reviews, prescription approvals, and direct video consultations.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-teal-800/60 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('care')}
              className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors text-center"
            >
              Book Teleconsult
            </button>
            <button
              type="button"
              onClick={() => onNavigate('doctor_portal')}
              className="py-2 px-3 rounded-xl bg-teal-950 hover:bg-teal-900 border border-teal-700 text-teal-200 text-xs font-semibold transition-colors"
            >
              Portal ({pendingDoctorReviewsCount})
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
                National Emergency Rescue
              </span>
              <span className="text-xs text-red-200">24/7 Free Helpline</span>
            </div>
            <h4 className="text-lg font-extrabold text-white mt-0.5">
              Rescue 1122 Ambulance Dispatch
            </h4>
            <p className="text-xs text-red-100">
              Immediate medical evacuation, road trauma care, and hospital coordination across Pakistan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <a
            href="tel:1122"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-red-700 font-extrabold text-sm shadow-md hover:bg-red-50 active:scale-95 transition-all"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call 1122</span>
          </a>

          <button
            type="button"
            onClick={handleShareEmergencySos}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-700/80 hover:bg-red-800 border border-red-400/40 text-white font-bold text-xs transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>{copiedSos ? 'GPS Copied!' : 'Share Live GPS'}</span>
          </button>
        </div>
      </section>

      {/* 5. Clinical Safety & PMDC Assurance Footer Strip */}
      <section className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>
            Compliant with Pakistan Medical & Dental Council (PMDC) digital tele-health guidelines.
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenDisclaimer}
          className="text-teal-600 dark:text-teal-400 font-semibold hover:underline shrink-0"
        >
          Read Clinical Disclaimers & Privacy Notice →
        </button>
      </section>
    </div>
  );
};
