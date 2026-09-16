import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SupportedLanguage, NavigationTab, PatientProfile, UserAccount } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { ClinicalHeartIcon } from './ClinicalHeartIcon';
import {
  LayoutDashboard,
  Stethoscope,
  Pill,
  FileText,
  Activity,
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
      label: t.navHome || 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'symptoms' as NavigationTab,
      label: t.navSymptoms || 'Symptom Checker',
      icon: Stethoscope,
      badge: 'AI',
    },
    {
      id: 'medicine' as NavigationTab,
      label: t.navMedicine || 'Medicine Checker',
      icon: Pill,
    },
    {
      id: 'reports' as NavigationTab,
      label: t.navReports || 'Lab Reports & X-Ray',
      icon: FileText,
    },
    {
      id: 'vitals' as NavigationTab,
      label:
        currentLanguage === 'ur'
          ? 'وائٹلز (شوگر، بی پی، نبض)'
          : currentLanguage === 'roman'
          ? 'Vitals (Sugar, BP, Pulse)'
          : (t.navVitals || 'Vitals & Health Tracker'),
      icon: Activity,
      badge: 'LIVE',
    },
    {
      id: 'care' as NavigationTab,
      label: t.navNearby || 'Doctor Finder',
      icon: MapPin,
    },
    {
      id: 'emergency' as NavigationTab,
      label: t.navEmergency || 'Emergency 1122',
      icon: AlertTriangle,
      badge: '1122',
      isEmergency: true,
    },
    {
      id: 'records' as NavigationTab,
      label: t.navRecords || 'Health Records',
      icon: History,
    },
    {
      id: 'doctor_portal' as NavigationTab,
      label: t.navDoctorPortal,
      icon: ShieldCheck,
      count: pendingDoctorReviewsCount,
    },
  ];

  const languagesList: { id: SupportedLanguage; name: string; native: string; flag: string }[] = [
    { id: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
    { id: 'roman', name: 'Roman Urdu', native: 'Roman Urdu', flag: '🇵🇰' },
    { id: 'ur', name: 'Urdu', native: 'اردو', flag: '🇵🇰' },
  ];

  const currentLangObj = languagesList.find((l) => l.id === currentLanguage) || languagesList[0];

  const handleItemClick = (tabId: NavigationTab) => {
    onNavigate(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const navContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.035,
        delayChildren: 0.06,
      },
    },
  };

  const navItemVariants = {
    hidden: { opacity: 0, x: isRTL ? 18 : -18 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 380,
        damping: 26,
      },
    },
  };

  const renderSidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div
          onClick={() => handleItemClick('home')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs group-hover:bg-teal-700 transition-colors shrink-0"
          >
            <ClinicalHeartIcon className="w-5 h-5 text-white" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900" />
          </motion.div>
          <div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white block leading-tight">
              SehatSaathi
            </span>
            <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 tracking-wider">
              Clinical Platform
            </span>
          </div>
        </div>

        {onCloseMobile && (
          <motion.button
            type="button"
            onClick={onCloseMobile}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Navigation Items */}
      <motion.nav
        variants={navContainerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 space-y-1 overflow-y-auto pr-1 select-none"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              variants={navItemVariants}
              type="button"
              onClick={() => handleItemClick(item.id)}
              whileHover={{ x: isRTL ? -3 : 3, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.98 }}
              className={`w-full relative flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-xs font-semibold cursor-pointer ${
                isActive
                  ? 'text-teal-950 dark:text-teal-100 font-bold'
                  : item.isEmergency
                  ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/40 hover:text-rose-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
              }`}
            >
              {/* Fluid Active Sliding Pill */}
              {isActive && (
                <motion.div
                  layoutId={isMobile ? 'mobile-sidebar-active-tab' : 'desktop-sidebar-active-tab'}
                  className="absolute inset-0 bg-teal-50 dark:bg-teal-950/70 border border-teal-200/80 dark:border-teal-800/70 rounded-xl shadow-2xs -z-10"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}

              <div className="flex items-center gap-3 min-w-0 z-10">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive
                      ? 'text-teal-700 dark:text-teal-300 scale-110'
                      : item.isEmergency
                      ? 'text-rose-500'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 z-10">
                {item.count !== undefined && item.count > 0 && (
                  <motion.span
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="bg-amber-400 text-slate-900 font-bold text-[10px] px-2 py-0.5 rounded-full shrink-0 shadow-2xs"
                  >
                    {item.count}
                  </motion.span>
                )}

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      item.isEmergency
                        ? 'bg-rose-600 text-white'
                        : 'bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800/60'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </motion.nav>

      {/* Footer / Profile & Settings */}
      <div className="mt-auto pt-3.5 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
        {/* User Profile Info Card */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 rounded-xl transition-colors border border-slate-200/70 dark:border-slate-800 flex flex-col gap-2">
          <div
            onClick={() => handleItemClick('records')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
              {(currentUser?.name?.trim() || activeProfile?.name?.trim() || 'G').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {currentUser?.name?.trim() || activeProfile?.name?.trim() || (currentLanguage === 'ur' ? 'معزز صارف' : currentLanguage === 'roman' ? 'Moazziz Sarif' : 'Guest Patient')}
              </p>
              <p className="text-[10px] text-teal-600 dark:text-teal-400 uppercase font-semibold tracking-wider truncate">
                {currentUser?.isLoggedIn
                  ? (currentLanguage === 'ur' ? 'تصدیق شدہ مریض' : currentLanguage === 'roman' ? 'Tasdeeq Shuda Mareez' : 'Verified Patient')
                  : (currentLanguage === 'ur' ? 'مہمان صارف' : currentLanguage === 'roman' ? 'Mehmaan' : 'Guest')}
              </p>
            </div>
          </div>

          {/* Account Login Button */}
          {onOpenLogin && (
            <motion.button
              type="button"
              onClick={onOpenLogin}
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.01 }}
              className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 text-[11px] text-slate-700 dark:text-slate-200 font-medium transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs"
            >
              <LogIn className="w-3 h-3 text-slate-500" />
              <span>
                {currentUser?.isLoggedIn
                  ? (currentLanguage === 'ur' ? 'پروفائل کا انتظام' : currentLanguage === 'roman' ? 'Profile Manage Karein' : 'Manage Profile')
                  : (currentLanguage === 'ur' ? 'لاگ ان کریں' : currentLanguage === 'roman' ? 'Sign In Karein' : 'Sign In')}
              </span>
            </motion.button>
          )}
        </div>

        {/* Language Selector Dropdown with AnimatePresence */}
        <div className="relative">
          <motion.button
            type="button"
            onClick={() => setShowLangDropdown((prev) => !prev)}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2 truncate">
              <span>{currentLangObj.flag}</span>
              <span className="font-medium">{currentLangObj.name} ({currentLangObj.native})</span>
            </span>
            <motion.div
              animate={{ rotate: showLangDropdown ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {showLangDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1 z-50 space-y-0.5 overflow-hidden"
              >
                {languagesList.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => {
                      onSelectLanguage(lang.id);
                      setShowLangDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      currentLanguage === lang.id
                        ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-200 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name} • {lang.native}</span>
                    </span>
                    {currentLanguage === lang.id && <Check className="w-3 h-3 text-teal-600" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Utility Toggles (Voice auto-play, Theme, Safety Notice) */}
        <div className="flex items-center justify-between gap-1.5 pt-0.5 text-xs text-slate-500 dark:text-slate-400">
          <motion.button
            type="button"
            onClick={onToggleVoiceAutoPlay}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className={`p-1.5 rounded-lg border transition-colors flex items-center justify-center cursor-pointer ${
              voiceAutoPlay
                ? 'bg-teal-50 dark:bg-teal-950/70 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400'
            }`}
            title={voiceAutoPlay ? 'Voice Speech Active' : 'Voice Speech Muted'}
          >
            {voiceAutoPlay ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </motion.button>

          <motion.button
            type="button"
            onClick={onToggleDarkMode}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className="p-1.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center cursor-pointer"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Moon className="w-3.5 h-3.5 text-teal-300" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
          </motion.button>

          <motion.button
            type="button"
            onClick={onOpenDisclaimer}
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            className="flex-1 py-1.5 px-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <Info className="w-3 h-3 text-slate-400" />
            <span className="truncate">{t.safetyGuidelines}</span>
          </motion.button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <motion.aside
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="hidden lg:flex w-64 xl:w-68 bg-white dark:bg-slate-900 flex-col p-4 text-slate-800 dark:text-slate-100 shrink-0 sticky top-0 h-screen z-30 shadow-xs border-r border-slate-200/90 dark:border-slate-800 overflow-hidden"
      >
        {renderSidebarContent(false)}
      </motion.aside>

      {/* Mobile Drawer Overlay with Fluid Framer Motion */}
      <AnimatePresence>
        {isOpenMobile && (
          <motion.div
            key="mobile-drawer-portal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 lg:hidden pointer-events-auto"
          >
            {/* Backdrop Blur & Fade */}
            <motion.div
              key="mobile-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
              onClick={onCloseMobile}
            />

            {/* Slide-in Drawer with Spring Physics */}
            <motion.aside
              key="mobile-drawer-aside"
              initial={{ x: isRTL ? '100%' : '-100%', boxShadow: '0 0 0 rgba(0,0,0,0)' }}
              animate={{ x: 0, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
              exit={{ x: isRTL ? '100%' : '-100%', boxShadow: '0 0 0 rgba(0,0,0,0)' }}
              transition={{
                type: 'spring',
                damping: 28,
                stiffness: 300,
                mass: 0.8,
              }}
              className="fixed inset-y-0 left-0 rtl:left-auto rtl:right-0 w-76 sm:w-80 bg-white dark:bg-slate-900 p-5 text-slate-800 dark:text-slate-100 shadow-2xl flex flex-col z-50 border-r rtl:border-r-0 rtl:border-l border-slate-200 dark:border-slate-800 overflow-y-auto"
            >
              {renderSidebarContent(true)}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
