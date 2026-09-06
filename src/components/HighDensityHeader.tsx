import React, { useState } from 'react';
import { SupportedLanguage, PatientProfile, NavigationTab, UserAccount } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { voiceManager } from '../services/voice';
import { LanguageSelector } from './LanguageSelector';
import {
  Menu,
  PhoneCall,
  Share2,
  Heart,
  Activity,
  Bell,
  HelpCircle,
  Volume2,
  VolumeX,
  User,
  ShieldCheck,
  Stethoscope,
  Sparkles,
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
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const displayName =
    currentUser?.name?.trim() ||
    activeProfile?.name?.trim() ||
    (currentLanguage === 'ur' ? 'معزز صارف' : currentLanguage === 'roman' ? 'Moazziz Sarif' : 'Guest');

  const getTabLabel = (tab?: string) => {
    switch (tab) {
      case 'home':
        return currentLanguage === 'ur' ? 'ڈیش بورڈ' : currentLanguage === 'roman' ? 'Dashboard' : 'Patient Dashboard';
      case 'symptoms':
        return currentLanguage === 'ur' ? 'علامات کی جانچ' : currentLanguage === 'roman' ? 'Alamaat Checker' : 'AI Symptom Triage';
      case 'medicine':
        return currentLanguage === 'ur' ? 'ادویات کی جانچ' : currentLanguage === 'roman' ? 'Dawai Checker' : 'Medicine & Dosage Safety';
      case 'reports':
        return currentLanguage === 'ur' ? 'لیب رپورٹس اور ایکسرے' : currentLanguage === 'roman' ? 'Lab Reports & X-Ray' : 'Lab Diagnostics & Vision';
      case 'care':
        return currentLanguage === 'ur' ? 'قریبی ڈاکٹر اور کلینک' : currentLanguage === 'roman' ? 'Doctor & Care Finder' : 'Doctor & Hospital Finder';
      case 'emergency':
        return currentLanguage === 'ur' ? 'ایمرجنسی 1122' : currentLanguage === 'roman' ? 'Emergency 1122' : 'Emergency Rescue 1122';
      case 'records':
        return currentLanguage === 'ur' ? 'صحت کے ریکارڈز' : currentLanguage === 'roman' ? 'Sehat Records' : 'Health Records & EHR';
      case 'doctor_portal':
        return currentLanguage === 'ur' ? 'ڈاکٹر پورٹل' : currentLanguage === 'roman' ? 'Doctor Portal' : 'PMDC Doctor Portal';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="w-full mb-6 space-y-3">
      {/* Top Mobile Bar for screens < lg */}
      <div className="lg:hidden flex items-center justify-between p-3 bg-[#0c2f28] text-white rounded-2xl shadow-md gap-2 border border-teal-900/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="p-2 bg-teal-900/80 hover:bg-teal-800 rounded-xl text-white transition-colors shrink-0"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 cursor-pointer truncate" onClick={() => onNavigate('home')}>
            <div className="relative w-8 h-8 rounded-lg bg-teal-950 border border-teal-500/40 flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4 text-teal-300 fill-teal-300/30" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </div>
            <span className="font-bold text-sm sm:text-base tracking-tight truncate">SehatSaathi</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile Top User Button */}
          <button
            type="button"
            onClick={onOpenLogin}
            className="flex items-center gap-1.5 bg-teal-900/80 hover:bg-teal-800 text-white px-2.5 py-2 rounded-xl text-xs font-bold min-h-[40px] shrink-0 border border-teal-700/40"
            title={`Logged in as ${displayName}. Click to switch user`}
          >
            <User className="w-3.5 h-3.5 text-teal-300" />
            <span className="max-w-[70px] truncate">{displayName.split(' ')[0]}</span>
          </button>

          {/* Mobile Top Language Switcher */}
          <LanguageSelector
            currentLanguage={currentLanguage}
            onLanguageChange={onSelectLanguage}
          />

          <a
            href="tel:1122"
            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-2.5 py-2 rounded-xl text-xs font-bold shadow-xs min-h-[40px] shrink-0"
            title="Call Rescue 1122 Ambulance"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
            <span>1122</span>
          </a>
        </div>
      </div>

      {/* Main Executive Medical Application Bar */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-2 px-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200/60 dark:border-teal-800/60">
              {getTabLabel(activeTab)}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {new Date().toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white tracking-tight mt-1">
            {currentLanguage === 'ur'
              ? `السلام علیکم، ${displayName}!`
              : currentLanguage === 'roman'
              ? `Assalam-o-Alaikum, ${displayName}!`
              : `Welcome, ${displayName}!`}
          </h1>
        </div>

        {/* Top-Right Controls: Doctor Status, Voice, Emergency, Language, User Badge */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap sm:flex-nowrap">
          {/* PMDC Doctor Duty Status Badge */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-semibold text-emerald-800 dark:text-emerald-300 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Dr. Ayesha Malik (FCPS) • On Duty</span>
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
            title={currentLanguage === 'en' ? 'Listen to audio guidance' : currentLanguage === 'roman' ? 'Awaaz sunein' : 'آواز سنیں'}
          >
            <Volume2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="hidden sm:inline">{t.audioPlay}</span>
          </button>

          {/* Emergency 1122 Quick SOS Button */}
          <a
            href="tel:1122"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors min-h-[40px]"
            title="Immediate Rescue 1122 Ambulance dispatch"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
            <span>1122 SOS</span>
          </a>

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
            className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-2xs hover:border-teal-400 transition-colors"
            title="Safety Disclaimer & PMDC Guidelines"
          >
            <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </header>
    </div>
  );
};
