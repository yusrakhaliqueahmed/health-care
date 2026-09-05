import React, { useState, useEffect } from 'react';
import {
  SupportedLanguage,
  NavigationTab,
  PatientProfile,
  PatientCase,
  Prescription,
  MedicalReportRecord,
  Doctor,
  UserAccount,
} from './types';
import { TRANSLATIONS } from './services/i18n';
import { INITIAL_PROFILES, INITIAL_CASES, INITIAL_PRESCRIPTIONS, INITIAL_REPORTS } from './services/data';
import { voiceManager } from './services/voice';
import { Sidebar } from './components/Sidebar';
import { HighDensityHeader } from './components/HighDensityHeader';
import { HeroLanding } from './components/HeroLanding';
import { SymptomChecker } from './components/SymptomChecker';
import { MedicineChecker } from './components/MedicineChecker';
import { ReportAnalyzer } from './components/ReportAnalyzer';
import { NearbyCare } from './components/NearbyCare';
import { EmergencyCare } from './components/EmergencyCare';
import { HealthRecords } from './components/HealthRecords';
import { DoctorReviewPortal } from './components/DoctorReviewPortal';
import { TeleconsultBookingModal } from './components/TeleconsultBookingModal';
import { DisclaimerModal } from './components/DisclaimerModal';
import { SplashScreen } from './components/SplashScreen';
import { InitialDisclaimerScreen } from './components/InitialDisclaimerScreen';
import { LoginFormScreen } from './components/LoginFormScreen';
import { LoginModal } from './components/LoginModal';
import {
  PhoneCall,
  ShieldCheck,
  Heart,
  Volume2,
  VolumeX,
  Stethoscope,
  Info,
  Linkedin,
  Globe,
} from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [hasAcknowledgedDisclaimer, setHasAcknowledgedDisclaimer] = useState<boolean>(false);
  const [hasLoggedIn, setHasLoggedIn] = useState<boolean>(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Dynamic user account management (defaulted to Yusra Khalique Shaikh from video)
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const saved = localStorage.getItem('sehat_saathi_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      id: 'usr-1',
      name: 'Yusra Khalique Shaikh',
      email: 'yusrakhalique193@gmail.com',
      phone: '+92 300 1234567',
      isLoggedIn: true,
    };
  });

  // App State collections - initialized with dynamic user name
  const [patientProfiles, setPatientProfiles] = useState<PatientProfile[]>(() => {
    const profiles = [...INITIAL_PROFILES];
    if (profiles[0]) {
      const saved = localStorage.getItem('sehat_saathi_current_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed?.name) profiles[0] = { ...profiles[0], name: parsed.name };
        } catch {
          // ignore
        }
      } else {
        profiles[0] = { ...profiles[0], name: 'Farooq' };
      }
    }
    return profiles;
  });
  const [pendingCases, setPendingCases] = useState<PatientCase[]>(INITIAL_CASES);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(INITIAL_PRESCRIPTIONS);
  const [reports, setReports] = useState<MedicalReportRecord[]>(INITIAL_REPORTS);

  // Modal states
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);

  // Audio Auto-play global toggle
  const [voiceAutoPlay, setVoiceAutoPlay] = useState(true);

  // Handle dynamic login
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('sehat_saathi_current_user', JSON.stringify(user));
    } catch {
      // ignore
    }
    setPatientProfiles((prev) => {
      const updated = [...prev];
      if (updated[0]) {
        updated[0] = { ...updated[0], name: user.name };
      }
      return updated;
    });
  };

  const handleLogout = () => {
    const guestUser: UserAccount = {
      id: 'usr-guest',
      name: 'Guest',
      isLoggedIn: false,
    };
    setCurrentUser(guestUser);
    setHasLoggedIn(false);
    try {
      localStorage.setItem('sehat_saathi_current_user', JSON.stringify(guestUser));
    } catch {
      // ignore
    }
  };

  // RTL/LTR alignment handling
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const isRTL = t.direction === 'rtl';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage, isRTL]);

  // Dark mode class on html
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleVoiceAutoPlay = () => {
    const nextVal = !voiceAutoPlay;
    setVoiceAutoPlay(nextVal);
    voiceManager.setAutoPlay(nextVal);
    if (!nextVal) {
      voiceManager.stop();
    }
  };

  // Add Case from Symptom Checker to Doctor Queue
  const handleAddCaseForDoctorReview = (caseData: any) => {
    setPendingCases((prev) => [caseData, ...prev]);
  };

  // Doctor approves case and issues prescription
  const handleApproveDoctorCase = (
    caseId: string,
    doctorNote: string,
    prescriptionText: string
  ) => {
    const matched = pendingCases.find((c) => c.id === caseId);
    if (!matched) return;

    // Create verified digital prescription
    const newRx: Prescription = {
      id: `rx-${Date.now().toString().slice(-4)}`,
      caseId,
      patientName: matched.patientName,
      doctorName: 'Dr. Ayesha Malik, MBBS, FCPS',
      doctorPmdc: 'PMDC #48291-P',
      date: new Date().toISOString().split('T')[0],
      diagnosis: doctorNote,
      medicines: [
        {
          name: prescriptionText.split('(')[0] || 'Paracetamol 500mg',
          dosage: '1 tablet 3 times a day',
          frequency: 'After meals',
          duration: '3 to 5 days',
          instructions: 'Drink plenty of clean fluids and rest well.',
        },
      ],
      qrCodeData: `SEHAT-SAATHI-VERIFIED-RX-${caseId}-HASH-9382104-PMDC-LICENSED`,
      status: 'active',
    };

    setPrescriptions((prev) => [newRx, ...prev]);
    setPendingCases((prev) => prev.filter((c) => c.id !== caseId));
  };

  // Add new family profile
  const handleAddProfile = (newProfile: PatientProfile) => {
    setPatientProfiles((prev) => [...prev, newProfile]);
  };

  // Add saved medical report
  const handleSaveReport = (newRecord: MedicalReportRecord) => {
    setReports((prev) => [newRecord, ...prev]);
  };

  return (
    <div
      className={`min-h-screen flex font-sans transition-colors duration-200 ${
        isRTL ? 'font-urdu' : ''
      } ${
        isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#F8FAFC] text-[#0F172A]'
      }`}
    >
      {/* 1. Splash Screen: Appears first on launch */}
      {showSplash && (
        <SplashScreen
          currentLanguage={currentLanguage}
          onFinish={() => setShowSplash(false)}
        />
      )}

      {/* 2. Doctor Verification Required / Important Message Screen */}
      {!showSplash && !hasAcknowledgedDisclaimer && (
        <InitialDisclaimerScreen
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          onAcknowledge={() => setHasAcknowledgedDisclaimer(true)}
        />
      )}

      {/* 3. Welcome Back / Login Screen */}
      {!showSplash && hasAcknowledgedDisclaimer && !hasLoggedIn && (
        <LoginFormScreen
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          initialUserName={currentUser.name}
          initialEmail={currentUser.email}
          onLoginSuccess={(user) => {
            handleLogin(user);
            setHasLoggedIn(true);
          }}
        />
      )}

      {/* On-demand Clinical Disclaimer Modal */}
      <DisclaimerModal
        isOpen={showDisclaimer}
        currentLanguage={currentLanguage}
        onClose={() => setShowDisclaimer(false)}
      />

      {/* Dynamic Login / Switch User Modal */}
      <LoginModal
        isOpen={showLoginModal}
        currentUser={currentUser}
        currentLanguage={currentLanguage}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* Teleconsult Booking Modal */}
      {bookingDoctor && (
        <TeleconsultBookingModal
          doctor={bookingDoctor}
          currentLanguage={currentLanguage}
          onClose={() => setBookingDoctor(null)}
          onConfirm={(details) => {
            console.log('Teleconsult booked:', details);
          }}
        />
      )}

      {/* High Density Pine Teal Sidebar */}
      <Sidebar
        currentLanguage={currentLanguage}
        activeTab={activeTab}
        onNavigate={setActiveTab}
        pendingDoctorReviewsCount={pendingCases.length}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        voiceAutoPlay={voiceAutoPlay}
        onToggleVoiceAutoPlay={toggleVoiceAutoPlay}
        activeProfile={patientProfiles[0]}
        currentUser={currentUser}
        onSelectLanguage={setCurrentLanguage}
        onOpenDisclaimer={() => setShowDisclaimer(true)}
        onOpenLogin={() => setShowLoginModal(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* High Density Main Content Container */}
      <main className="flex-1 flex flex-col min-h-screen p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
        <HighDensityHeader
          currentLanguage={currentLanguage}
          activeTab={activeTab}
          activeProfile={patientProfiles[0]}
          currentUser={currentUser}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenDisclaimer={() => setShowDisclaimer(true)}
          onOpenLogin={() => setShowLoginModal(true)}
          onNavigate={setActiveTab}
          voiceAutoPlay={voiceAutoPlay}
          onToggleVoiceAutoPlay={toggleVoiceAutoPlay}
          onSelectLanguage={setCurrentLanguage}
        />

        <div className="flex-1 min-h-0">
          {activeTab === 'home' && (
            <HeroLanding
              currentLanguage={currentLanguage}
              pendingDoctorReviewsCount={pendingCases.length}
              currentUser={currentUser}
              patientProfiles={patientProfiles}
              onNavigate={setActiveTab}
              onEmergencyCall={() => setActiveTab('emergency')}
              onOpenDisclaimer={() => setShowDisclaimer(true)}
              onReplaySplash={() => setShowSplash(true)}
            />
          )}

          {activeTab === 'symptoms' && (
            <SymptomChecker
              currentLanguage={currentLanguage}
              patientProfiles={patientProfiles}
              currentUser={currentUser}
              onAddCaseForDoctorReview={handleAddCaseForDoctorReview}
              onEmergencyCall={() => setActiveTab('emergency')}
            />
          )}

          {activeTab === 'medicine' && (
            <MedicineChecker
              currentLanguage={currentLanguage}
              patientProfiles={patientProfiles}
              onNavigateToCare={(filter) => {
                setActiveTab('care');
              }}
            />
          )}

          {activeTab === 'reports' && (
            <ReportAnalyzer
              currentLanguage={currentLanguage}
              onSaveToRecords={handleSaveReport}
            />
          )}

          {activeTab === 'care' && (
            <NearbyCare
              currentLanguage={currentLanguage}
              onBookDoctor={(doc) => setBookingDoctor(doc)}
            />
          )}

          {activeTab === 'emergency' && (
            <EmergencyCare currentLanguage={currentLanguage} />
          )}

          {activeTab === 'records' && (
            <HealthRecords
              currentLanguage={currentLanguage}
              patientProfiles={patientProfiles}
              prescriptions={prescriptions}
              reports={reports}
              onAddProfile={handleAddProfile}
            />
          )}

          {activeTab === 'doctor_portal' && (
            <DoctorReviewPortal
              currentLanguage={currentLanguage}
              pendingCases={pendingCases}
              onApproveCase={handleApproveDoctorCase}
            />
          )}
        </div>

        {/* Pinned Bottom Footer Container */}
        <div id="app-bottom-footer-container" className="mt-auto pt-10 shrink-0">
          {/* High Density Footer */}
          <footer className="py-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold gap-3">
            <div className="flex flex-wrap gap-4 sm:gap-6 justify-center sm:justify-start">
              <button
                type="button"
                onClick={() => setActiveTab('doctor_portal')}
                className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
              >
                PMDC Verified: 2,400+ Doctors ({pendingCases.length} in Queue)
              </button>
              <span>•</span>
              <span>Privacy: HIPAA Encrypted</span>
              <span>•</span>
              <span>7 Languages: Urdu • English • Sindhi • Pashto • Balochi • Punjabi • Saraiki</span>
            </div>

            <div className="flex items-center gap-2 text-rose-500 font-semibold">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping shrink-0" />
              <span>Note: AI is assistive, always verify with a doctor</span>
            </div>
          </footer>

          {/* Minimal Bottom Footer Line */}
          <div
            id="designer-attribution-footer"
            className="mt-3 mb-2 pt-3 pb-2 flex flex-col items-center justify-center border-t border-slate-200/60 dark:border-slate-800/60 text-center select-none group"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full backdrop-blur-md backdrop-saturate-150 bg-gradient-to-r from-white/70 via-teal-50/40 to-white/70 dark:from-slate-900/60 dark:via-teal-950/30 dark:to-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.2)] transition-all duration-300 ease-out group-hover:scale-[1.03] group-hover:brightness-105 group-hover:border-teal-500/50 dark:group-hover:border-teal-400/50 group-hover:shadow-[0_0_18px_rgba(20,184,166,0.25)] dark:group-hover:shadow-[0_0_20px_rgba(45,212,191,0.22)]">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 group-hover:bg-teal-400 transition-colors shrink-0" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-100 tracking-wide transition-colors whitespace-nowrap">
                Design by <span className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">Yusra Khalique Ahmed</span>
              </p>

              {/* Minimalist interactive profile icons appearing on hover */}
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-300/60 dark:border-slate-700/60 opacity-0 group-hover:opacity-100 max-w-0 group-hover:max-w-[70px] overflow-hidden transition-all duration-300 ease-out">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-md text-slate-400 hover:text-teal-600 dark:hover:text-teal-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                  title="LinkedIn Profile"
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-md text-slate-400 hover:text-teal-600 dark:hover:text-teal-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                  title="Design Portfolio"
                  aria-label="Design Portfolio"
                >
                  <Globe className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Buttons: Two separate buttons with fixed flexbox layout & at least 20px gap */}
      <div
        id="floating-actions-dock"
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 flex items-center gap-5 pointer-events-auto"
      >
        {/* Button 1: Instant AI Symptom Assessment (Hidden when already on symptoms screen to avoid bottom-right corner overlap) */}
        {activeTab !== 'symptoms' && (
          <button
            type="button"
            id="fab-symptom-assistant"
            onClick={() => setActiveTab('symptoms')}
            className="w-14 h-14 sm:w-16 sm:h-16 bg-teal-600 hover:bg-teal-500 rounded-full shadow-2xl flex items-center justify-center text-white border-4 border-white dark:border-slate-800 active:scale-95 transition-transform cursor-pointer shrink-0"
            title={currentLanguage === 'en' ? 'Instant AI Symptom Assessment' : 'فوری علامات کی تشخیص'}
            aria-label="Instant AI Symptom Assessment"
          >
            <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
          </button>
        )}

        {/* Button 2: Rescue 1122 Emergency Ambulance Helpline */}
        <a
          id="fab-emergency-helpline"
          href="tel:1122"
          className="w-14 h-14 sm:w-16 sm:h-16 bg-red-600 hover:bg-red-500 rounded-full shadow-2xl flex items-center justify-center text-white border-4 border-white dark:border-slate-800 active:scale-95 transition-transform cursor-pointer shrink-0"
          title={currentLanguage === 'en' ? 'Call Rescue 1122 Emergency Ambulance' : 'ریسکیو 1122 ایمرجنسی کال'}
          aria-label="Call Rescue 1122"
        >
          <PhoneCall className="w-6 h-6 sm:w-7 sm:h-7 text-white animate-pulse" />
        </a>
      </div>
    </div>
  );
}
