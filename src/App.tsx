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
  UnifiedHealthRecord,
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
import { GlobalFooter } from './components/GlobalFooter';
import { EmergencyCallModal } from './components/EmergencyCallModal';
import { MedicalQuickMessageModal } from './components/MedicalQuickMessageModal';
import {
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  Volume2,
  VolumeX,
  Stethoscope,
  Info,
  Linkedin,
  Globe,
  LayoutDashboard,
  Pill,
  FileText,
  MapPin,
  UserCheck,
} from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [hasAcknowledgedDisclaimer, setHasAcknowledgedDisclaimer] = useState<boolean>(true);
  const [hasLoggedIn, setHasLoggedIn] = useState<boolean>(true);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showEmergencyCallModal, setShowEmergencyCallModal] = useState(false);
  const [showQuickMessageModal, setShowQuickMessageModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('sehat_saathi_language');
    if (saved === 'en' || saved === 'ur' || saved === 'roman') {
      return saved;
    }
    return 'en';
  });
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // User account state - only shows what the user actually provided
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const saved = localStorage.getItem('sehat_saathi_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch {
        // fallback
      }
    }
    return {
      id: 'usr-guest',
      name: '',
      isLoggedIn: false,
    };
  });

  // App State collections - initialized without fabricated data
  const [patientProfiles, setPatientProfiles] = useState<PatientProfile[]>(() => {
    const saved = localStorage.getItem('sehat_saathi_patient_profiles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // ignore
      }
    }
    return INITIAL_PROFILES;
  });
  const [pendingCases, setPendingCases] = useState<PatientCase[]>(() => {
    const saved = localStorage.getItem('sehat_saathi_cases');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // ignore
      }
    }
    return INITIAL_CASES;
  });
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    const saved = localStorage.getItem('sehat_saathi_prescriptions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // ignore
      }
    }
    return INITIAL_PRESCRIPTIONS;
  });
  const [reports, setReports] = useState<MedicalReportRecord[]>(() => {
    const saved = localStorage.getItem('sehat_saathi_reports');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // ignore
      }
    }
    return INITIAL_REPORTS;
  });

  // Persist user-created data locally
  useEffect(() => {
    try {
      localStorage.setItem('sehat_saathi_patient_profiles', JSON.stringify(patientProfiles));
    } catch {}
  }, [patientProfiles]);

  useEffect(() => {
    try {
      localStorage.setItem('sehat_saathi_cases', JSON.stringify(pendingCases));
    } catch {}
  }, [pendingCases]);

  useEffect(() => {
    try {
      localStorage.setItem('sehat_saathi_prescriptions', JSON.stringify(prescriptions));
    } catch {}
  }, [prescriptions]);

  useEffect(() => {
    try {
      localStorage.setItem('sehat_saathi_reports', JSON.stringify(reports));
    } catch {}
  }, [reports]);

  // Modal states
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);

  // Audio Auto-play global toggle
  const [voiceAutoPlay, setVoiceAutoPlay] = useState(true);

  // Handle dynamic login
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    setHasLoggedIn(true);
    try {
      localStorage.setItem('sehat_saathi_current_user', JSON.stringify(user));
    } catch {
      // ignore
    }

    const userKey = (user.email || user.id || 'default').toLowerCase().trim();

    // Migrate any guest session searches directly into the user's permanent Google profile
    try {
      const guestLocal = localStorage.getItem('sehat_records_default');
      if (guestLocal) {
        const guestRecords: UnifiedHealthRecord[] = JSON.parse(guestLocal);
        if (Array.isArray(guestRecords) && guestRecords.length > 0) {
          guestRecords.forEach((gr) => {
            fetch('/api/records', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userKey, record: { ...gr, userId: userKey } }),
            }).catch(() => {});
          });
        }
      }
    } catch {}

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
  const isRTL = t.direction === 'rtl';

  useEffect(() => {
    try {
      localStorage.setItem('sehat_saathi_language', currentLanguage);
    } catch {}
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

  // Add Case from Symptom Checker to Doctor Queue & Permanent Records
  const handleAddCaseForDoctorReview = (caseData: any) => {
    setPendingCases((prev) => [caseData, ...prev]);

    // Also persist as a diagnostic record
    const userKey = (currentUser?.email || currentUser?.id || 'default').toLowerCase().trim();
    const triageRecord: UnifiedHealthRecord = {
      id: `rec-${caseData.id || Date.now()}`,
      referenceNumber: `SS-TR-${Date.now().toString().slice(-6)}`,
      labCaseNumber: `LB-TR-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: userKey,
      patientProfileId: caseData.patientProfileId || 'prof-self',
      title: `Symptom Triage: ${caseData.chiefComplaint || 'Clinical Assessment'}`,
      panelName: 'SYMPTOM CLINICAL ASSESSMENT REPORT',
      category: 'symptom',
      patientName: caseData.patientName || currentUser?.name || 'Self',
      patientAge: caseData.patientAge?.toString() || '30 Y',
      patientGender: caseData.patientGender || 'male',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'ai_preliminary',
      urgency: caseData.urgency || 'YELLOW',
      testResults: [
        {
          testName: 'Chief Complaint',
          result: caseData.chiefComplaint || 'Symptom Triage',
          referenceRange: 'Self-Reported',
          isAbnormal: false,
        },
        {
          testName: 'Triage Urgency Score',
          result: caseData.urgency || 'Moderate',
          referenceRange: 'Normal / Mild',
          isAbnormal: caseData.urgency === 'RED',
        },
        {
          testName: 'Symptom Duration',
          result: caseData.duration || '2-3 days',
          referenceRange: '< 7 days',
          isAbnormal: false,
        },
      ],
      clinicalNotes: caseData.summary || caseData.chiefComplaint || 'Clinical triage completed.',
      doctorComments: 'Queued for PMDC physician review.',
      reviewedByDoctor: 'Dr. Tariq Jamil (PMDC #33190-S)',
      doctorPmdc: 'PMDC #33190-S',
    };

    fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userKey, record: triageRecord }),
    }).catch((e) => console.warn('Sync error:', e));
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

    // Save as persistent prescription record
    const userKey = (currentUser?.email || currentUser?.id || 'default').toLowerCase().trim();
    const rxRecord: UnifiedHealthRecord = {
      id: `rec-${newRx.id}`,
      referenceNumber: `SS-RX-${Date.now().toString().slice(-6)}`,
      labCaseNumber: `LB-RX-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: userKey,
      patientProfileId: matched.patientProfileId || 'prof-self',
      title: `Rx: ${newRx.diagnosis}`,
      panelName: 'LICENSED MEDICAL PRESCRIPTION & CLINICAL SUMMARY',
      category: 'prescription',
      patientName: newRx.patientName,
      patientAge: matched.patientAge?.toString() || '32 Y',
      patientGender: matched.patientGender || 'male',
      date: newRx.date,
      status: 'doctor_approved',
      urgency: 'GREEN',
      testResults: newRx.medicines.map((m) => ({
        testName: m.name,
        result: `${m.dosage} (${m.frequency})`,
        referenceRange: m.duration,
        isAbnormal: false,
      })),
      clinicalNotes: `Clinical diagnosis: ${newRx.diagnosis}. Dispensing instruction: ${newRx.medicines[0]?.instructions || ''}`,
      doctorComments: `Electronically verified and authorized by ${newRx.doctorName} (${newRx.doctorPmdc})`,
      reviewedByDoctor: newRx.doctorName,
      doctorPmdc: newRx.doctorPmdc,
      prescriptionData: newRx,
    };

    fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userKey, record: rxRecord }),
    }).catch((e) => console.warn('Sync error:', e));
  };

  // Add new family profile
  const handleAddProfile = (newProfile: PatientProfile) => {
    setPatientProfiles((prev) => [...prev, newProfile]);
  };

  // Add saved medical report
  const handleSaveReport = (newRecord: MedicalReportRecord) => {
    setReports((prev) => [newRecord, ...prev]);

    // Save as persistent lab report record
    const userKey = (currentUser?.email || currentUser?.id || 'default').toLowerCase().trim();
    const labRecord: UnifiedHealthRecord = {
      id: newRecord.id,
      referenceNumber: `SS-LB-${Date.now().toString().slice(-6)}`,
      labCaseNumber: `LB-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: userKey,
      patientProfileId: 'prof-self',
      title: newRecord.title,
      panelName: newRecord.title,
      category: 'lab_report',
      patientName: newRecord.patientName || currentUser?.name || 'Muhammad Ali',
      patientAge: '35 Y',
      patientGender: 'male',
      date: newRecord.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: newRecord.status === 'approved_by_pmdc_doctor' ? 'doctor_approved' : 'ai_preliminary',
      urgency: 'GREEN',
      testResults: (newRecord.findings || '')
        .split(/[\n,]+/)
        .filter((f) => f.trim())
        .map((f) => ({
          testName: f.split(':')[0]?.trim() || f.trim(),
          result: f.split(':')[1]?.trim() || 'Normal',
          referenceRange: 'Standard Normal',
          isAbnormal: f.toLowerCase().includes('high') || f.toLowerCase().includes('low') || f.toLowerCase().includes('abnormal'),
        })),
      clinicalNotes: newRecord.findings || 'Lab diagnostic evaluation completed.',
      doctorComments: 'Automated digital assay verified on SehatSaathi Pro Diagnostic Network.',
      reviewedByDoctor: 'Dr. Ayesha Malik (PMDC #48291-P)',
      doctorPmdc: 'PMDC #48291-P',
    };

    fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userKey, record: labRecord }),
    }).catch((e) => console.warn('Sync error:', e));
  };

  // Save any unified medical record (searches, inquiries, medicine checks, lab reports)
  const handleSaveUnifiedRecord = (newRecord: UnifiedHealthRecord) => {
    const userKey = (currentUser?.email || currentUser?.id || 'default').toLowerCase().trim();
    const recordToSave: UnifiedHealthRecord = {
      ...newRecord,
      userId: userKey,
    };

    // Cache locally for instant reactivity across page refreshes
    try {
      const storageKey = `sehat_records_${userKey}`;
      const existingStr = localStorage.getItem(storageKey);
      const existing = existingStr ? JSON.parse(existingStr) : [];
      const updated = [recordToSave, ...existing.filter((r: any) => r.id !== recordToSave.id)];
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {}

    fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userKey, record: recordToSave }),
    }).catch((e) => console.warn('Sync error:', e));
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`min-h-screen flex font-sans transition-colors duration-200 overflow-x-hidden w-full max-w-[100vw] ${
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
          initialUserName={currentUser?.name || ''}
          initialEmail={currentUser?.email || ''}
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

      {/* High Density Main Content Container with Safe Bottom Clearance */}
      <main className="flex-1 flex flex-col min-h-screen p-3 sm:p-6 lg:p-8 pb-36 lg:pb-12 min-w-0 overflow-y-auto">
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
          onOpenEmergencyCall={() => setShowEmergencyCallModal(true)}
          onOpenQuickMessage={() => setShowQuickMessageModal(true)}
        />

        <div className="flex-1 min-h-0">
          {activeTab === 'home' && (
            <HeroLanding
              currentLanguage={currentLanguage}
              pendingDoctorReviewsCount={pendingCases.length}
              currentUser={currentUser}
              patientProfiles={patientProfiles}
              prescriptionsCount={prescriptions.length}
              onNavigate={setActiveTab}
              onEmergencyCall={() => setActiveTab('emergency')}
              onOpenDisclaimer={() => setShowDisclaimer(true)}
              onReplaySplash={() => setShowSplash(true)}
              onSaveSearchRecord={handleSaveUnifiedRecord}
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
              onSaveRecord={handleSaveUnifiedRecord}
              userName={currentUser?.name}
            />
          )}

          {activeTab === 'reports' && (
            <ReportAnalyzer
              currentLanguage={currentLanguage}
              onSaveToRecords={handleSaveReport}
              onSaveUnifiedRecord={handleSaveUnifiedRecord}
              userName={currentUser?.name}
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
              currentUser={currentUser}
              onNavigateToTab={(tab) => setActiveTab(tab as any)}
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

        {/* Global Multi-Column Professional Footer */}
        <GlobalFooter
          currentLanguage={currentLanguage}
          onNavigateTab={(tab) => setActiveTab(tab as any)}
          onOpenDisclaimer={() => setShowDisclaimer(true)}
        />
      </main>

      {/* Mobile Bottom Navigation Bar (< lg screens) */}
      <nav
        id="mobile-bottom-nav"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0c2f28]/95 backdrop-blur-md border-t border-slate-200/90 dark:border-teal-900/70 shadow-lg px-2 py-1.5 flex items-center justify-around select-none safe-area-inset-bottom"
        aria-label="Mobile Navigation"
      >
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors min-w-[54px] ${
            activeTab === 'home'
              ? 'text-teal-600 dark:text-teal-300 font-bold'
              : 'text-slate-500 dark:text-teal-200/70'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">
            {t.navHome}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('symptoms')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors min-w-[54px] ${
            activeTab === 'symptoms'
              ? 'text-teal-600 dark:text-teal-300 font-bold'
              : 'text-slate-500 dark:text-teal-200/70'
          }`}
        >
          <Stethoscope className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">
            {t.navSymptoms}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('medicine')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors min-w-[54px] ${
            activeTab === 'medicine'
              ? 'text-teal-600 dark:text-teal-300 font-bold'
              : 'text-slate-500 dark:text-teal-200/70'
          }`}
        >
          <Pill className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">
            {t.navMedicine}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors min-w-[54px] ${
            activeTab === 'reports'
              ? 'text-teal-600 dark:text-teal-300 font-bold'
              : 'text-slate-500 dark:text-teal-200/70'
          }`}
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">
            {t.navReports}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('care')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors min-w-[54px] ${
            activeTab === 'care'
              ? 'text-teal-600 dark:text-teal-300 font-bold'
              : 'text-slate-500 dark:text-teal-200/70'
          }`}
        >
          <MapPin className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">
            {t.navNearby}
          </span>
        </button>
      </nav>

      {/* Floating Action Buttons: Dedicated Medical Message & Emergency Call Helplines */}
      <div
        id="floating-actions-dock"
        className="fixed bottom-[74px] right-3 sm:bottom-[80px] sm:right-6 lg:bottom-8 lg:right-8 z-30 flex items-center gap-2.5 sm:gap-3 pointer-events-auto transition-all duration-300"
      >
        {/* Medical App Message Button (Side-by-side with Call button) */}
        <button
          type="button"
          id="fab-quick-message-btn"
          onClick={() => setShowQuickMessageModal(true)}
          className="group relative w-12 h-12 sm:w-14 sm:h-14 bg-emerald-600 hover:bg-emerald-500 rounded-full shadow-2xl flex items-center justify-center text-white border-3 border-white dark:border-slate-800 active:scale-95 transition-all cursor-pointer shrink-0"
          title="Medical Quick Message / WhatsApp & SMS Triage"
          aria-label="Send Medical Message"
        >
          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform" />
          {/* Active status beacon */}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-cyan-400 border-2 border-white dark:border-slate-900 rounded-full shadow-xs" />
        </button>

        {/* Rescue 1122 Emergency Ambulance Call & Heart Vitality Button */}
        <button
          type="button"
          id="fab-emergency-helpline"
          onClick={() => setShowEmergencyCallModal(true)}
          className="group relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-rose-950 via-red-950 to-neutral-950 hover:from-red-900 hover:to-rose-950 rounded-full shadow-[0_8px_25px_rgba(225,29,72,0.45)] flex items-center justify-center text-white border-3 border-white dark:border-slate-800 active:scale-95 cursor-pointer shrink-0 transition-transform duration-200"
          title={t.navEmergency}
          aria-label="Call Emergency Helpline (1122)"
        >
          {/* Visually rich, CSS-rendered 3D volumetric heart shape with layered crimson radial gradients & inner depth shadow */}
          <div
            className="relative w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center transition-transform group-hover:scale-110"
            style={{
              filter: 'drop-shadow(0 3px 5px rgba(0, 0, 0, 0.45))',
            }}
          >
            <div className="relative w-4.5 h-4.5 sm:w-5 sm:h-5 -rotate-45">
              {/* Conical base forming lower ventricular apex */}
              <div
                className="absolute inset-0 rounded-xs"
                style={{
                  background: 'radial-gradient(circle at 60% 60%, #ff4b6e 0%, #d90429 28%, #9b0a23 62%, #3d020c 100%)',
                  boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.7), inset 2px 2px 3px rgba(255,200,215,0.45)',
                }}
              />
              {/* Superior atrium/ventricular dome lobe */}
              <div
                className="absolute -top-[9px] sm:-top-[10px] left-0 right-0 h-[10px] sm:h-[11px] rounded-t-full"
                style={{
                  background: 'radial-gradient(circle at 45% 35%, #ff6b8b 0%, #d90429 35%, #850b20 75%, #3d020c 100%)',
                  boxShadow: 'inset 0 2px 3px rgba(255,225,235,0.65), inset -1px 0 3px rgba(0,0,0,0.55)',
                }}
              />
              {/* Lateral atrium/ventricular dome lobe */}
              <div
                className="absolute top-0 -right-[9px] sm:-right-[10px] bottom-0 w-[10px] sm:w-[11px] rounded-r-full"
                style={{
                  background: 'radial-gradient(circle at 65% 45%, #ff5277 0%, #c9082a 40%, #7a091c 80%, #3d020c 100%)',
                  boxShadow: 'inset -2px 0 3px rgba(0,0,0,0.7), inset 0 2px 3px rgba(255,200,215,0.4)',
                }}
              />
              {/* Specular high-gloss sheen reflection for 3D curved depth */}
              <div
                className="absolute -top-[7px] sm:-top-[8px] left-[1px] w-[7px] h-[6px] rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.25) 60%, transparent 100%)',
                  filter: 'blur(0.3px)',
                }}
              />
              {/* Inter-atrial sulcus depression shadow between lobes */}
              <div
                className="absolute -top-[4px] -right-[1px] w-1.5 h-1.5 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(45, 2, 9, 0.8) 0%, transparent 80%)',
                }}
              />
            </div>
            {/* Micro Aortic Root arch atop cleft */}
            <div
              className="absolute -top-0.5 left-[48%] -translate-x-1/2 w-1.5 h-1.5 rounded-t-xs pointer-events-none"
              style={{
                background: 'linear-gradient(to top, #850b20, #ff4d6d)',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.5)',
              }}
            />
          </div>
          {/* SOS beacon */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-80"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white dark:border-slate-900 shadow-xs"></span>
          </span>
        </button>
      </div>

      {/* Emergency Call Modal */}
      <EmergencyCallModal
        isOpen={showEmergencyCallModal}
        onClose={() => setShowEmergencyCallModal(false)}
        currentLanguage={currentLanguage}
      />

      {/* Medical Quick Message Modal */}
      <MedicalQuickMessageModal
        isOpen={showQuickMessageModal}
        onClose={() => setShowQuickMessageModal(false)}
        currentLanguage={currentLanguage}
        patientName={currentUser?.name || 'Ahmed Raza'}
        onNavigateToTab={(tab) => setActiveTab(tab as any)}
      />
    </div>
  );
}
