import React from 'react';
import { SupportedLanguage, UserAccount } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { LanguageSelector } from './LanguageSelector';
import {
  HeartPulse,
  PhoneCall,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  ShieldCheck,
  User as UserIcon,
  Stethoscope,
  FileText,
  Pill,
  MapPin,
  AlertTriangle,
  History,
  Menu,
  X,
  HelpCircle,
} from 'lucide-react';

interface NavbarProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isAutoSpeak: boolean;
  onToggleAutoSpeak: () => void;
  user: UserAccount | null;
  onOpenAuth: () => void;
  onOpenDisclaimer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage,
  onLanguageChange,
  activeTab,
  onSelectTab,
  isDarkMode,
  onToggleDarkMode,
  isAutoSpeak,
  onToggleAutoSpeak,
  user,
  onOpenAuth,
  onOpenDisclaimer,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const navItems = [
    { id: 'home', label: t.navHome, icon: HeartPulse },
    { id: 'symptoms', label: t.navSymptoms, icon: Stethoscope },
    { id: 'medicine', label: t.navMedicine, icon: Pill },
    { id: 'reports', label: t.navReports, icon: FileText },
    { id: 'nearby', label: t.navNearby, icon: MapPin },
    { id: 'emergency', label: t.navEmergency, icon: AlertTriangle, isAlert: true },
    { id: 'records', label: t.navRecords, icon: History },
    { id: 'doctor_mode', label: t.navDoctorMode, icon: ShieldCheck, isSpecial: true },
  ];

  const handleTabClick = (tabId: string) => {
    onSelectTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top micro banner for PMDC compliance */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-teal-100 text-[11px] py-1 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="truncate">
          🇵🇰 Pakistan Doctor-in-the-Loop AI • PMDC Certified Medical Network • Emergency Rescue 1122 Connected
        </span>
        <button
          type="button"
          onClick={onOpenDisclaimer}
          className="underline hover:text-white ml-1 inline-flex items-center gap-0.5 text-[11px] shrink-0"
        >
          <HelpCircle className="w-3 h-3" />
          <span>Safety Notice</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
          {/* Logo Section */}
          <button
            type="button"
            onClick={() => handleTabClick('home')}
            className="flex items-center gap-2.5 sm:gap-3 group text-left focus:outline-hidden"
          >
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-5 h-5 sm:w-6 sm:h-6" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                  SehatSaathi
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden xs:block">
                AI + Doctor Healthcare
              </p>
            </div>
          </button>

          {/* Desktop Nav Items */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  type="button"
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all min-h-[40px] ${
                    isActive
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 shadow-xs'
                      : item.isAlert
                      ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
                      : item.isSpecial
                      ? 'text-teal-700 dark:text-teal-300 bg-teal-50/50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-900/40 border border-teal-200 dark:border-teal-800/60'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Language Selector */}
            <LanguageSelector
              currentLanguage={currentLanguage}
              onLanguageChange={onLanguageChange}
            />

            {/* Auto-Voice Speak Toggle */}
            <button
              id="voice-auto-speak-toggle"
              type="button"
              onClick={onToggleAutoSpeak}
              className={`p-2 rounded-xl border transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                isAutoSpeak
                  ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
              }`}
              title={isAutoSpeak ? 'Voice Auto-Play Enabled' : 'Voice Auto-Play Disabled'}
            >
              {isAutoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Dark Mode / Light Mode Switch (Strict Knob Enclosure) */}
            <button
              id="theme-toggle-button"
              type="button"
              onClick={onToggleDarkMode}
              className="relative inline-flex items-center h-8 w-14 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors p-1 focus:outline-hidden focus:ring-2 focus:ring-teal-500 shrink-0"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark mode"
            >
              <span
                className={`inline-block w-6 h-6 transform rounded-full bg-white dark:bg-slate-900 shadow-md transition-transform duration-200 flex items-center justify-center ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              >
                {isDarkMode ? (
                  <Moon className="w-3.5 h-3.5 text-teal-400" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                )}
              </span>
            </button>

            {/* Emergency Call 1122 Button */}
            <a
              id="header-call-1122"
              href="tel:1122"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all min-h-[44px]"
              title="Immediate Rescue 1122 Ambulance"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
              <span>1122</span>
            </a>

            {/* User Profile / Auth Button */}
            {user ? (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors min-h-[44px]"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-teal-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[90px] truncate hidden md:inline">
                  {user.name}
                </span>
              </button>
            ) : (
              <button
                id="header-login-button"
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all min-h-[44px]"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>{t.login}</span>
              </button>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              id="mobile-menu-toggle"
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl text-xs font-semibold text-left transition-all min-h-[44px] ${
                    isActive
                      ? 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                      : item.isAlert
                      ? 'text-red-600 dark:text-red-400 bg-red-50/60 dark:bg-red-950/30'
                      : 'text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <a
              href="tel:1122"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow-xs w-full justify-center"
            >
              <PhoneCall className="w-4 h-4 animate-pulse" />
              <span>Call Rescue 1122 (Ambulance)</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
