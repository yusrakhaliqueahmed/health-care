import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SupportedLanguage, PatientProfile, NavigationTab, UserAccount } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { voiceManager } from '../services/voice';
import { LanguageSelector } from './LanguageSelector';
import { ClinicalHeartIcon } from './ClinicalHeartIcon';
import {
  Menu,
  PhoneCall,
  Share2,
  Activity,
  Bell,
  HelpCircle,
  Volume2,
  VolumeX,
  User,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  MessageSquare,
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
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const displayName =
    currentUser?.name?.trim() ||
    activeProfile?.name?.trim() ||
    (currentLanguage === 'ur' ? 'معزز صارف' : currentLanguage === 'roman' ? 'Moazziz Sarif' : 'Guest');

  const getTabLabel = (tab?: string) => {
    switch (tab) {
      case 'home':
        return t.navHome;
      case 'symptoms':
        return t.navSymptoms;
      case 'medicine':
        return t.navMedicine;
      case 'reports':
        return t.navReports;
      case 'vitals':
        return currentLanguage === 'ur'
          ? 'وائٹلز (شوگر، بلڈ پریشر، نبض)'
          : currentLanguage === 'roman'
          ? 'Vitals (Sugar, BP, Pulse)'
          : (t.navVitals || 'Vitals & Health Tracker');
      case 'care':
        return t.navNearby;
      case 'emergency':
        return t.navEmergency;
      case 'records':
        return t.navRecords;
      case 'doctor_portal':
        return t.navDoctorPortal;
      default:
        return t.navHome;
    }
  };

  return (
    <div className="w-full mb-6 space-y-3">
      {/* Top Mobile Bar for screens < lg */}
      <div className="lg:hidden flex items-center justify-between p-2.5 sm:p-3 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-2xl shadow-xs gap-2 border border-slate-200/90 dark:border-slate-800 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <motion.button
            type="button"
            onClick={onOpenMobileMenu}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-200 transition-colors shrink-0 cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </motion.button>
          <div className="flex items-center gap-2 cursor-pointer min-w-0" onClick={() => onNavigate('home')}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-2xs"
            >
              <ClinicalHeartIcon className="w-4 h-4 text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900" />
            </motion.div>
            <span className="font-bold text-sm tracking-tight truncate text-slate-900 dark:text-white">SehatSaathi</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Top Language Switcher */}
          <LanguageSelector
            currentLanguage={currentLanguage}
            onLanguageChange={onSelectLanguage}
            compact
          />

          {/* Emergency 1122 Call (Mobile) */}
          <button
            type="button"
            id="header-mobile-call-btn"
            onClick={onOpenEmergencyCall || (() => { window.location.href = 'tel:1122'; })}
            className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-2xs min-h-[38px] cursor-pointer transition-transform shrink-0"
            title="Call Rescue 1122 Ambulance"
          >
            <PhoneCall className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] font-bold">1122</span>
          </button>

          {/* Mobile User Avatar Button */}
          <button
            type="button"
            onClick={onOpenLogin}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-bold shrink-0 border border-slate-200/80 dark:border-slate-700 cursor-pointer"
            title={`Logged in as ${displayName}. Click to switch user`}
          >
            <span className="text-teal-700 dark:text-teal-300 font-bold text-xs">{displayName.charAt(0).toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* Main Executive Medical Application Bar */}
      <header className="flex items-center justify-between gap-3 py-1 sm:py-2 px-1">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200/60 dark:border-teal-800/60 shrink-0">
              {getTabLabel(activeTab)}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {new Date().toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          </div>

          <h1 className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-white tracking-tight mt-1 truncate">
            {currentLanguage === 'ur'
              ? `السلام علیکم، ${displayName}!`
              : currentLanguage === 'roman'
              ? `Assalam-o-Alaikum, ${displayName}!`
              : `Welcome, ${displayName}!`}
          </h1>
        </div>

        {/* Mobile & Tablet Quick Controls (< lg) */}
        <div className="flex lg:hidden items-center gap-1.5 shrink-0">
          <button
            type="button"
            id="guidance-voice-btn-mobile"
            onClick={() => {
              const greeting =
                currentLanguage === 'ur'
                  ? `السلام علیکم، ${displayName}!`
                  : currentLanguage === 'roman'
                  ? `Assalam-o-Alaikum, ${displayName}!`
                  : `Welcome, ${displayName}!`;
              const question =
                currentLanguage === 'ur'
                  ? 'آپ کی صحت کے لیے صحت ساتھی حاضر ہے۔'
                  : currentLanguage === 'roman'
                  ? 'Aapki sehat ke liye SehatSaathi hazir hai.'
                  : 'Your digital health companion is ready to assist you.';
              voiceManager.speak(`${greeting} ${question}`, currentLanguage);
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs cursor-pointer flex items-center gap-1 min-h-[38px]"
            title={t.audioPlay}
          >
            <Volume2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="hidden sm:inline text-xs">{t.audioPlay}</span>
          </button>

          <button
            type="button"
            onClick={onOpenDisclaimer}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-2xs hover:border-teal-400 transition-colors cursor-pointer shrink-0"
            title="Safety Disclaimer & PMDC Guidelines"
          >
            <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        {/* Desktop-Only Full Controls (>= lg) */}
        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
          {/* Teleconsultation Duty Status Badge */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 text-xs font-semibold text-teal-800 dark:text-teal-300 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
            </span>
            <span>{currentLanguage === 'ur' ? 'آن لائن طبی کنسلٹیشن فعال ہے' : 'Telehealth Consultation Active'}</span>
          </div>

          {/* Voice Guidance Readout Button */}
          <button
            type="button"
            id="guidance-voice-btn"
            onClick={() => {
              const greeting =
                currentLanguage === 'ur'
                  ? `السلام علیکم، ${displayName}!`
                  : currentLanguage === 'roman'
                  ? `Assalam-o-Alaikum, ${displayName}!`
                  : `Welcome, ${displayName}!`;
              const question =
                currentLanguage === 'ur'
                  ? 'آپ کی صحت کے لیے صحت ساتھی حاضر ہے۔'
                  : currentLanguage === 'roman'
                  ? 'Aapki sehat ke liye SehatSaathi hazir hai.'
                  : 'Your digital health companion is ready to assist you.';
              voiceManager.speak(`${greeting} ${question}`, currentLanguage);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer min-h-[40px]"
            title={t.audioPlay}
          >
            <Volume2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="hidden sm:inline">{t.audioPlay}</span>
          </button>

          {/* Dual Action: Emergency Call & Quick Message (Desktop) */}
          <div className="flex items-center gap-1.5">
            {/* Emergency 1122 Quick SOS Call Button */}
            <button
              type="button"
              id="header-btn-emergency-call"
              onClick={onOpenEmergencyCall || (() => { window.location.href = 'tel:1122'; })}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all min-h-[40px] cursor-pointer"
              title="Immediate Rescue 1122 Ambulance dispatch"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
              <span>1122 SOS</span>
            </button>

            {/* Quick Medical Message Button */}
            <button
              type="button"
              id="header-btn-medical-message"
              onClick={onOpenQuickMessage}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all min-h-[40px] cursor-pointer"
              title="Quick Medical Message / WhatsApp & SMS Triage"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{currentLanguage === 'ur' ? 'پیغام' : currentLanguage === 'roman' ? 'Message' : 'Message'}</span>
            </button>
          </div>

          {/* Accessible Top-Corner Language Switcher */}
          <div className="hidden lg:block">
            <LanguageSelector
              currentLanguage={currentLanguage}
              onLanguageChange={onSelectLanguage}
            />
          </div>

          {/* Dynamic User Profile Account Button */}
          <button
            type="button"
            id="header-user-badge-btn"
            onClick={onOpenLogin}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 text-slate-800 dark:text-slate-100 shadow-2xs transition-all cursor-pointer min-h-[40px]"
            title={currentUser?.isLoggedIn ? `Account: ${displayName}` : 'Click to Sign In'}
          >
            <div className="w-7 h-7 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden md:block">
              <span className="text-[10px] text-teal-600 dark:text-teal-400 uppercase font-bold block leading-none">
                {currentUser?.isLoggedIn ? 'Verified' : 'Guest'}
              </span>
              <span className="text-xs font-bold truncate max-w-[110px] block leading-tight">
                {displayName.split(' ')[0]}
              </span>
            </div>
          </button>

          {/* Clinical Disclaimer & Notification Bell */}
          <button
            type="button"
            onClick={onOpenDisclaimer}
            className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-2xs hover:border-teal-400 transition-colors cursor-pointer"
            title="Safety Disclaimer & PMDC Guidelines"
          >
            <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </header>
    </div>
  );
};
