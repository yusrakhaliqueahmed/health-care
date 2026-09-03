import React, { useState } from 'react';
import { SupportedLanguage, NavigationTab, PatientProfile, UserAccount } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import {
  Heart,
  LayoutDashboard,
  Stethoscope,
  Pill,
  FileText,
  MapPin,
  AlertTriangle,
  History,
  ShieldCheck,
  ChevronDown,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  X,
  PhoneCall,
  Info,
  Check,
  LogIn,
} from 'lucide-react';

interface SidebarProps {
  currentLanguage: SupportedLanguage;
  activeTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  pendingDoctorReviewsCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  voiceAutoPlay: boolean;
  onToggleVoiceAutoPlay: () => void;
  activeProfile?: PatientProfile;
  currentUser?: UserAccount;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onOpenDisclaimer: () => void;
  onOpenLogin?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentLanguage,
  activeTab,
  onNavigate,
  pendingDoctorReviewsCount,
  isDarkMode,
  onToggleDarkMode,
  voiceAutoPlay,
  onToggleVoiceAutoPlay,
  activeProfile,
  currentUser,
  onSelectLanguage,
  onOpenDisclaimer,
  onOpenLogin,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const isRTL = t.direction === 'rtl';
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const navItems = [
    {
      id: 'home' as NavigationTab,
      label: currentLanguage === 'ur' ? 'ڈیش بورڈ' : 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'symptoms' as NavigationTab,
      label: currentLanguage === 'ur' ? 'علامات کی جانچ' : 'Symptom Checker',
      icon: Stethoscope,
      badge: 'AI',
    },
    {
      id: 'medicine' as NavigationTab,
      label: currentLanguage === 'ur' ? 'دوائی کی معلومات' : 'Medicine Checker',
      icon: Pill,
    },
    {
      id: 'reports' as NavigationTab,
      label: currentLanguage === 'ur' ? 'لیب رپورٹس اور ایکسرے' : 'Lab Reports & X-Ray',
      icon: FileText,
    },
    {
      id: 'care' as NavigationTab,
      label: currentLanguage === 'ur' ? 'ڈاکٹر اور ہسپتال' : 'Doctor Finder',
      icon: MapPin,
    },
    {
      id: 'emergency' as NavigationTab,
      label: currentLanguage === 'ur' ? 'ایمرجنسی 1122' : 'Emergency 1122',
      icon: AlertTriangle,
      badge: '1122',
      isEmergency: true,
    },
    {
      id: 'records' as NavigationTab,
      label: currentLanguage === 'ur' ? 'طبی ریکارڈ' : 'Health Records',
      icon: History,
    },
    {
      id: 'doctor_portal' as NavigationTab,
      label: currentLanguage === 'ur' ? 'ڈاکٹر پورٹل' : 'PMDC Doctor Portal',
      icon: ShieldCheck,
      count: pendingDoctorReviewsCount,
    },
  ];

  const languagesList: { id: SupportedLanguage; name: string; native: string; flag: string }[] = [
    { id: 'ur', name: 'Urdu', native: 'اردو', flag: '🇵🇰' },
    { id: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
    { id: 'sd', name: 'Sindhi', native: 'سنڌي', flag: '🇵🇰' },
    { id: 'ps', name: 'Pashto', native: 'پښتو', flag: '🇵🇰' },
    { id: 'bal', name: 'Balochi', native: 'بلوچی', flag: '🇵🇰' },
    { id: 'pa', name: 'Punjabi', native: 'پنجابی', flag: '🇵🇰' },
    { id: 'skr', name: 'Saraiki', native: 'سرائیکی', flag: '🇵🇰' },
  ];

  const currentLangObj = languagesList.find((l) => l.id === currentLanguage) || languagesList[0];

  const handleItemClick = (tabId: NavigationTab) => {
    onNavigate(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="flex items-center justify-between gap-3 mb-8">
        <div
          onClick={() => handleItemClick('home')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-900/50 group-hover:scale-105 transition-transform shrink-0">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-white block leading-tight">
              SehatSaathi Pro
            </span>
            <span className="text-[10px] uppercase font-bold text-teal-300 tracking-wider">
              PMDC Certified AI
            </span>
          </div>
        </div>

        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-teal-200 hover:text-white rounded-lg hover:bg-teal-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1 select-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              type="button"
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-colors text-sm font-medium ${
                isActive
                  ? 'bg-teal-800/60 text-white border-l-4 rtl:border-l-0 rtl:border-r-4 border-teal-400 font-semibold shadow-xs'
                  : item.isEmergency
                  ? 'text-red-300 hover:bg-red-950/40 hover:text-white'
                  : 'text-teal-100/80 hover:text-white hover:bg-teal-800/30'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive
                      ? 'text-teal-300 opacity-100'
                      : item.isEmergency
                      ? 'text-red-400'
                      : 'opacity-70'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.count !== undefined && item.count > 0 && (
                <span className="bg-amber-400 text-slate-900 font-bold text-[10px] px-2 py-0.5 rounded-full shrink-0">
                  {item.count}
                </span>
              )}

              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    item.isEmergency
                      ? 'bg-red-500 text-white'
                      : 'bg-teal-700/60 text-teal-200 border border-teal-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Profile & Settings */}
      <div className="mt-auto pt-5 border-t border-teal-800/70 space-y-3">
        {/* User Profile Info Card */}
        <div className="p-2.5 bg-teal-800/25 hover:bg-teal-800/40 rounded-xl transition-colors border border-teal-800/50 flex flex-col gap-2">
          <div
            onClick={() => handleItemClick('records')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full border-2 border-teal-400 bg-teal-700 text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-xs">
              {(currentUser?.name || activeProfile?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {currentUser?.name || activeProfile?.name || 'User'}
              </p>
              <p className="text-[10px] text-teal-200/70 uppercase tracking-widest truncate">
                {currentUser?.isLoggedIn ? 'Logged In • Active' : 'Primary User'}
              </p>
            </div>
          </div>

          {/* Quick Switch User Button */}
          {onOpenLogin && (
            <button
              type="button"
              onClick={onOpenLogin}
              className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-teal-800/60 hover:bg-teal-700 text-[11px] text-teal-200 hover:text-white font-medium transition-colors border border-teal-700/50 cursor-pointer"
            >
              <LogIn className="w-3 h-3" />
              <span>Switch / Log In User</span>
            </button>
          )}
        </div>

        {/* High Density Language Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowLangDropdown((prev) => !prev)}
            className="w-full flex items-center justify-between p-2.5 bg-teal-900 border border-teal-700 rounded-lg text-sm text-teal-100 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2 truncate">
              <span>🌐</span>
              <span className="font-medium">{currentLangObj.name} ({currentLangObj.native})</span>
            </span>
            <ChevronDown className="w-4 h-4 text-teal-300 shrink-0" />
          </button>

          {showLangDropdown && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-teal-950 border border-teal-700 rounded-xl shadow-2xl p-1.5 z-50 space-y-0.5">
              {languagesList.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => {
                    onSelectLanguage(lang.id);
                    setShowLangDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    currentLanguage === lang.id
                      ? 'bg-teal-700 text-white font-bold'
                      : 'text-teal-200 hover:bg-teal-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name} • {lang.native}</span>
                  </span>
                  {currentLanguage === lang.id && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Utility Toggles (Voice auto-play, Theme, Safety Notice) */}
        <div className="flex items-center justify-between gap-2 pt-1 text-xs text-teal-200/80">
          <button
            type="button"
            onClick={onToggleVoiceAutoPlay}
            className={`p-2 rounded-lg border transition-colors flex items-center justify-center ${
              voiceAutoPlay
                ? 'bg-teal-800 border-teal-600 text-teal-200'
                : 'bg-teal-950 border-teal-800 text-teal-500'
            }`}
            title={voiceAutoPlay ? 'Voice Speech Active' : 'Voice Speech Muted'}
          >
            {voiceAutoPlay ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-2 bg-teal-900 border border-teal-700 hover:bg-teal-800 rounded-lg text-teal-200 transition-colors flex items-center justify-center"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Moon className="w-4 h-4 text-teal-300" /> : <Sun className="w-4 h-4 text-amber-300" />}
          </button>

          <button
            type="button"
            onClick={onOpenDisclaimer}
            className="flex-1 py-2 px-2.5 bg-teal-900 border border-teal-700 hover:bg-teal-800 rounded-lg text-[11px] font-semibold text-teal-200 hover:text-white transition-colors flex items-center justify-center gap-1.5"
          >
            <Info className="w-3.5 h-3.5 text-teal-400" />
            <span className="truncate">Safety Notice</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 xl:w-72 bg-[#134E4A] flex-col p-6 text-white shrink-0 sticky top-0 h-screen z-30 shadow-xl overflow-hidden">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="fixed inset-y-0 left-0 rtl:left-auto rtl:right-0 w-72 bg-[#134E4A] p-6 text-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left rtl:slide-in-from-right duration-200">
            {content}
          </aside>
        </div>
      )}
    </>
  );
};
