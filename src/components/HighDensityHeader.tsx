import React from 'react';
import { motion } from 'motion/react';
import { SupportedLanguage, PatientProfile, NavigationTab, UserAccount } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { voiceManager } from '../services/voice';
import { LanguageSelector } from './LanguageSelector';
import { ClinicalHeartIcon } from './ClinicalHeartIcon';
import {
  Menu,
  PhoneCall,
  Activity,
  Bell,
  Volume2,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  UserCheck,
} from 'lucide-react';

interface HighDensityHeaderProps {
  currentLanguage: SupportedLanguage;
  activeTab?: NavigationTab;
  activeProfile?: PatientProfile;
  currentUser?: UserAccount;
  onOpenMobileMenu: () => void;
  onOpenDisclaimer: () => void;
  onNavigate: (tab: NavigationTab) => void;
  voiceAutoPlay: boolean;
  onToggleVoiceAutoPlay: () => void;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  onOpenEmergencyCall?: () => void;
  onOpenQuickMessage?: () => void;
  onOpenDoctorOnboarding?: () => void;
  pendingDoctorReviewsCount?: number;
}

export const HighDensityHeader: React.FC<HighDensityHeaderProps> = ({
  currentLanguage,
  activeTab = 'home',
  activeProfile,
  currentUser,
  onOpenMobileMenu,
  onOpenDisclaimer,
  onNavigate,
  voiceAutoPlay,
  onToggleVoiceAutoPlay,
  onSelectLanguage,
  onOpenLogin,
  onOpenEmergencyCall,
  onOpenQuickMessage,
  onOpenDoctorOnboarding,
  pendingDoctorReviewsCount = 0,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';

  const displayName =
    currentUser?.name?.trim() ||
    activeProfile?.name?.trim() ||
    (isUrdu ? 'معزز صارف' : isRoman ? 'Moazziz Sarif' : 'Guest Patient');

  const getTabLabel = (tab?: string) => {
    switch (tab) {
      case 'home':
        return t.navHome || 'Home';
      case 'symptoms':
        return t.navSymptoms || 'Symptoms';
      case 'medicine':
        return t.navMedicine || 'Medicine';
      case 'reports':
        return t.navReports || 'Reports';
      case 'vitals':
        return isUrdu
          ? 'وائٹلز (شوگر، بی پی)'
          : isRoman
          ? 'Vitals (Sugar, BP)'
          : (t.navVitals || 'Vitals Tracker');
      case 'care':
        return t.navNearby || 'Doctor Finder';
      case 'emergency':
        return t.navEmergency || 'Emergency 1122';
      case 'records':
        return t.navRecords || 'Health Records';
      case 'doctor_portal':
        return isUrdu ? 'ڈاکٹر پورٹل' : isRoman ? 'Dr Portal' : 'Dr Portal';
      default:
        return t.navHome || 'Home';
    }
  };

  const handleSpeakGreeting = () => {
    const greeting = isUrdu
      ? `السلام علیکم، ${displayName}!`
      : isRoman
      ? `Assalam-o-Alaikum, ${displayName}!`
      : `Welcome, ${displayName}!`;
    const question = isUrdu
      ? 'آپ کی صحت اور طبی رہنمائی کے لیے صحت ساتھی حاضر ہے۔'
      : isRoman
      ? 'Aapki sehat ke liye SehatSaathi hazir hai.'
      : 'Your digital healthcare companion is ready to assist you.';
    voiceManager.speak(`${greeting} ${question}`, currentLanguage);
  };

  return (
    <header
      className={`w-full max-w-full sticky top-0 z-30 mb-3 sm:mb-5 transition-all box-border ${
        isUrdu ? 'rtl font-urdu' : 'ltr'
      }`}
      dir={isUrdu ? 'rtl' : 'ltr'}
    >
      {/* ========================================================================= */}
      {/* 1. MOBILE & SMALL TABLET VIEW (< lg screens, 320px - 1023px) */}
      {/* Guaranteed 100% responsive, zero horizontal overflow, neatly contained */}
      {/* ========================================================================= */}
      <div className="lg:hidden flex flex-col gap-2 p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-xs w-full max-w-full box-border relative">
        {/* Tier 1: Brand / Menu on Left & Priority Controls on Right */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 min-w-0 w-full">
          {/* Brand & Menu Trigger */}
          <div className="flex items-center gap-1.5 shrink-0 min-w-0">
            <motion.button
              type="button"
              onClick={onOpenMobileMenu}
              whileTap={{ scale: 0.94 }}
              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-200 shrink-0 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>

            <div
              className="flex items-center gap-1.5 cursor-pointer select-none"
              onClick={() => onNavigate('home')}
            >
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <ClinicalHeartIcon className="w-4 h-4 text-white" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900" />
              </div>
              <span className="hidden xxs:inline font-extrabold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white truncate max-w-[90px] xs:max-w-none">
                SehatSaathi
              </span>
            </div>
          </div>

          {/* Right Mobile Actions: Compact, Adaptive & Flex-safe */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink min-w-0 justify-end">
            {/* Language Selector (Compact) */}
            <div className="shrink-0">
              <LanguageSelector
                currentLanguage={currentLanguage}
                onLanguageChange={onSelectLanguage}
                compact
              />
            </div>

            {/* Emergency 1122 Call Button */}
            <button
              type="button"
              id="header-mobile-call-btn"
              onClick={onOpenEmergencyCall || (() => { window.location.href = 'tel:1122'; })}
              className="flex items-center gap-1 bg-red-600 hover:bg-red-700 active:scale-95 text-white px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold shadow-2xs min-h-[32px] cursor-pointer shrink-0"
              title="Emergency 1122 Ambulance"
            >
              <PhoneCall className="w-3.5 h-3.5 shrink-0 animate-pulse" />
              <span className="text-[11px] font-bold">1122</span>
            </button>

            {/* PMDC Doctor Portal Button (Icon with Badge) */}
            <button
              type="button"
              id="header-mobile-doctor-portal-btn"
              onClick={() => onNavigate('doctor_portal')}
              className={`w-8 h-8 rounded-xl relative flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
                activeTab === 'doctor_portal'
                  ? 'bg-teal-700 text-white border-teal-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
              title={isUrdu ? 'ڈاکٹر ریویو پورٹل' : 'Doctor Portal'}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              {pendingDoctorReviewsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                  {pendingDoctorReviewsCount}
                </span>
              )}
            </button>

            {/* User Profile Avatar */}
            {onOpenLogin && (
              <button
                type="button"
                onClick={onOpenLogin}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-bold shrink-0 border border-slate-200/80 dark:border-slate-700 cursor-pointer"
                title={`User: ${displayName}`}
              >
                <span className="text-teal-700 dark:text-teal-300 font-bold text-xs">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Tier 2 (Mobile & Tablet): Tab Context, Date, Greeting & Quick Audio */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 min-w-0 w-full">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200/60 dark:border-teal-800/60 truncate max-w-[150px] sm:max-w-none">
                {getTabLabel(activeTab)}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {new Date().toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
              {isUrdu
                ? `السلام علیکم، ${displayName}!`
                : isRoman
                ? `Assalam-o-Alaikum, ${displayName}!`
                : `Welcome, ${displayName}!`}
            </h2>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Quick Voice Audio Readout */}
            <button
              type="button"
              id="guidance-voice-btn-mobile"
              onClick={handleSpeakGreeting}
              className="p-1 px-2 rounded-xl bg-teal-50 dark:bg-slate-800 border border-teal-200 dark:border-slate-700 text-teal-800 dark:text-teal-300 text-xs font-semibold shadow-2xs cursor-pointer flex items-center gap-1 min-h-[30px]"
              title={t.audioPlay}
            >
              <Volume2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-bold hidden xs:inline">{t.audioPlay}</span>
            </button>

            {/* Notification / Disclaimer Bell */}
            <button
              type="button"
              onClick={onOpenDisclaimer}
              className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 shrink-0 cursor-pointer min-h-[30px] min-w-[30px] flex items-center justify-center"
              title="PMDC Clinical Guidelines & Safety"
            >
              <Bell className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. LAPTOP & DESKTOP EXECUTIVE COMMAND BAR (>= lg screens, 1024px+) */}
      {/* Adaptive flex-wrap layout: NEVER overflows horizontally on laptops or PCs */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-xs w-full max-w-full box-border relative">
        {/* Left Column: Tab Label, Date & High-Impact Greeting */}
        <div className="min-w-0 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-lg border border-teal-200/60 dark:border-teal-800/60">
              {getTabLabel(activeTab)}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {new Date().toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          </div>

          <h1 className="text-lg xl:text-xl 2xl:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 truncate">
            {isUrdu
              ? `السلام علیکم، ${displayName}!`
              : isRoman
              ? `Assalam-o-Alaikum, ${displayName}!`
              : `Welcome, ${displayName}!`}
          </h1>
        </div>

        {/* Right Column: Multi-tool Interactive Controls with Flex-Wrap & Zero Overflow */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 justify-start 2xl:justify-end min-w-0 max-w-full">
          {/* Telehealth Status Badge (visible on wide screens) */}
          <div className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 text-xs font-semibold text-teal-800 dark:text-teal-300 shadow-2xs shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
            </span>
            <span>{isUrdu ? 'آن لائن طبی کنسلٹیشن فعال ہے' : 'Telehealth Active'}</span>
          </div>

          {/* Voice Guidance Readout Button */}
          <button
            type="button"
            id="guidance-voice-btn"
            onClick={handleSpeakGreeting}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer min-h-[36px] shrink-0"
            title={t.audioPlay}
          >
            <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>{t.audioPlay}</span>
          </button>

          {/* PMDC Doctor Review Portal Button (Desktop) */}
          <button
            type="button"
            id="header-btn-doctor-portal-desktop"
            onClick={() => onNavigate('doctor_portal')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border text-xs font-bold transition-all min-h-[36px] cursor-pointer shadow-2xs shrink-0 ${
              activeTab === 'doctor_portal'
                ? 'bg-teal-700 text-white border-teal-600 ring-2 ring-teal-400/40 shadow-xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-400 text-slate-800 dark:text-slate-200'
            }`}
            title={isUrdu ? 'ڈاکٹر ریویو و ایڈمن پورٹل' : 'PMDC Doctor & Admin Review Portal'}
          >
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
            <span>{isUrdu ? 'ڈاکٹر پورٹل' : 'Doctor Portal'}</span>
            {pendingDoctorReviewsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                {pendingDoctorReviewsCount}
              </span>
            )}
          </button>

          {/* Emergency 1122 SOS Call Button */}
          <button
            type="button"
            id="header-btn-emergency-call"
            onClick={onOpenEmergencyCall || (() => { window.location.href = 'tel:1122'; })}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all min-h-[36px] cursor-pointer shrink-0"
            title="Immediate Rescue 1122 Ambulance dispatch"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-pulse shrink-0" />
            <span>1122 SOS</span>
          </button>

          {/* Quick Medical Message Button */}
          {onOpenQuickMessage && (
            <button
              type="button"
              id="header-btn-medical-message"
              onClick={onOpenQuickMessage}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all min-h-[36px] cursor-pointer shrink-0"
              title="Quick Medical Message / Triage"
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span>{isUrdu ? 'پیغام' : 'Message'}</span>
            </button>
          )}

          {/* Language Switcher */}
          <div className="shrink-0">
            <LanguageSelector
              currentLanguage={currentLanguage}
              onLanguageChange={onSelectLanguage}
            />
          </div>

          {/* User Account Profile Pill */}
          {onOpenLogin && (
            <button
              type="button"
              id="header-user-badge-btn"
              onClick={onOpenLogin}
              className="flex items-center gap-2 p-1 px-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-400 text-slate-800 dark:text-slate-100 shadow-2xs transition-all cursor-pointer min-h-[36px] shrink-0"
              title={currentUser?.isLoggedIn ? `Account: ${displayName}` : 'Click to Sign In'}
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden xl:block">
                <span className="text-[9px] text-teal-600 dark:text-teal-400 uppercase font-bold block leading-none">
                  {currentUser?.isLoggedIn ? 'Verified' : 'Guest'}
                </span>
                <span className="text-xs font-bold truncate max-w-[90px] block leading-tight">
                  {displayName.split(' ')[0]}
                </span>
              </div>
            </button>
          )}

          {/* Clinical Disclaimer & Notification Bell */}
          <button
            type="button"
            onClick={onOpenDisclaimer}
            className="w-8 h-8 sm:w-9 sm:h-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-2xs hover:border-teal-400 transition-colors cursor-pointer shrink-0"
            title="Safety Disclaimer & PMDC Guidelines"
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>
    </header>
  );
};
