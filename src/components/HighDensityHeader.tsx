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
  MapPin,
  HelpCircle,
  Volume2,
  VolumeX,
  User,
  LogOut,
} from 'lucide-react';

interface HighDensityHeaderProps {
  currentLanguage: SupportedLanguage;
  activeProfile?: PatientProfile;
  currentUser?: UserAccount;
  onOpenMobileMenu: () => void;
  onOpenDisclaimer: () => void;
  onNavigate: (tab: NavigationTab) => void;
  voiceAutoPlay: boolean;
  onToggleVoiceAutoPlay: () => void;
  currentLocationName?: string;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onOpenLogin?: () => void;
  onLogout?: () => void;
}

export const HighDensityHeader: React.FC<HighDensityHeaderProps> = ({
  currentLanguage,
  activeProfile,
  currentUser,
  onOpenMobileMenu,
  onOpenDisclaimer,
  onNavigate,
  voiceAutoPlay,
  onToggleVoiceAutoPlay,
  currentLocationName = 'Multan, Pakistan',
  onSelectLanguage,
  onOpenLogin,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const displayName = currentUser?.name || activeProfile?.name || 'User';
  const [copiedSos, setCopiedSos] = useState(false);

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(5);
          const lng = pos.coords.longitude.toFixed(5);
          const sosMessage = `🚨 EMERGENCY MEDICAL SOS - SehatSaathi Pro: I need urgent medical assistance at GPS: ${lat}, ${lng} (Near ${currentLocationName}). Call 1122.`;
          navigator.clipboard?.writeText(sosMessage);
          setCopiedSos(true);
          setTimeout(() => setCopiedSos(false), 3000);
          alert(`Emergency SOS message with GPS coordinates (${lat}, ${lng}) copied to clipboard for WhatsApp/SMS!`);
        },
        () => {
          const defaultMsg = `🚨 EMERGENCY MEDICAL SOS - SehatSaathi Pro: Urgent assistance required at ${currentLocationName}. Please dispatch Rescue 1122.`;
          navigator.clipboard?.writeText(defaultMsg);
          setCopiedSos(true);
          setTimeout(() => setCopiedSos(false), 3000);
          alert('Emergency SOS message copied to clipboard!');
        }
      );
    } else {
      onNavigate('emergency');
    }
  };

  return (
    <div className="w-full mb-6 sm:mb-8 space-y-4 sm:space-y-6">
      {/* Top Mobile Bar for screens < lg */}
      <div className="lg:hidden flex items-center justify-between p-3 bg-[#134E4A] text-white rounded-2xl shadow-md gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="p-2 bg-teal-800/80 hover:bg-teal-800 rounded-xl text-white transition-colors shrink-0"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 cursor-pointer truncate" onClick={() => onNavigate('home')}>
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-sm sm:text-base tracking-tight truncate">SehatSaathi</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile Top User Button */}
          <button
            type="button"
            onClick={onOpenLogin}
            className="flex items-center gap-1.5 bg-teal-800/80 hover:bg-teal-800 text-white px-2.5 py-2 rounded-xl text-xs font-bold min-h-[40px] shrink-0"
            title={`Logged in as ${displayName}. Click to switch user`}
          >
            <User className="w-3.5 h-3.5" />
            <span className="max-w-[70px] truncate">{displayName}</span>
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

      {/* Main High Density Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
            {currentLanguage === 'ur'
              ? `السلام علیکم، ${displayName}!`
              : currentLanguage === 'sd'
              ? `ڀلي ڪري آيا، ${displayName}!`
              : currentLanguage === 'ps'
              ? `ښه راغلاست، ${displayName}!`
              : currentLanguage === 'bal'
              ? `وش آتکیں، ${displayName}!`
              : currentLanguage === 'pa'
              ? `جی آیاں نوں، ${displayName}!`
              : currentLanguage === 'skr'
              ? `خوش آمدید، ${displayName}!`
              : `Welcome, ${displayName}!`}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {currentLanguage === 'ur'
                ? 'آج آپ کیسی طبیعت محسوس کر رہے ہیں؟'
                : currentLanguage === 'sd'
                ? 'اڄ توهان جي طبيعت ڪيئن آهي؟'
                : currentLanguage === 'ps'
                ? 'نن تاسو خپله روغتیا څنګه احساسوئ؟'
                : currentLanguage === 'bal'
                ? 'مرچی شمارا وتی نادراھی چوں اِنت؟'
                : currentLanguage === 'pa'
                ? 'اج تہاڈی طبیعت کیسی اے؟'
                : currentLanguage === 'skr'
                ? 'اج تہاڈی طبیعت کیویں ہے؟'
                : 'How are you feeling today?'}
            </p>
            {/* Audio Voice Output for Guidance */}
            <button
              type="button"
              id="guidance-voice-btn"
              onClick={() => {
                const greeting =
                  currentLanguage === 'ur'
                    ? `السلام علیکم، ${displayName}!`
                    : currentLanguage === 'sd'
                    ? `ڀلي ڪري آيا، ${displayName}!`
                    : currentLanguage === 'ps'
                    ? `ښه راغلاست، ${displayName}!`
                    : currentLanguage === 'bal'
                    ? `وش آتکیں، ${displayName}!`
                    : currentLanguage === 'pa'
                    ? `جی آیاں نوں، ${displayName}!`
                    : currentLanguage === 'skr'
                    ? `خوش آمدید، ${displayName}!`
                    : `Welcome, ${displayName}!`;

                const question =
                  currentLanguage === 'ur'
                    ? 'آج آپ کیسی طبیعت محسوس کر رہے ہیں؟'
                    : currentLanguage === 'sd'
                    ? 'اڄ توهان جي طبيعت ڪيئن آهي؟'
                    : currentLanguage === 'ps'
                    ? 'نن تاسو خپله روغتیا څنګه احساسوئ؟'
                    : currentLanguage === 'bal'
                    ? 'مرچی شمارا وتی نادراھی چوں اِنت؟'
                    : currentLanguage === 'pa'
                    ? 'اج تہاڈی طبیعت کیسی اے؟'
                    : currentLanguage === 'skr'
                    ? 'اج تہاڈی طبیعت کیویں ہے؟'
                    : 'How are you feeling today?';

                voiceManager.speak(`${greeting} ${question}`, currentLanguage);
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-200 dark:border-teal-800 text-[11px] font-bold text-teal-700 dark:text-teal-300 transition-colors cursor-pointer"
              title={currentLanguage === 'en' ? 'Listen to guidance (voice)' : 'آواز سنیں'}
              aria-label="Listen to guidance"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{t.audioPlay}</span>
            </button>
          </div>
        </div>

        {/* Top-Right Controls: User Badge, Language Selector, Location, and Safety Bell */}
        <div className="flex items-center gap-3 self-end sm:self-auto flex-wrap sm:flex-nowrap">
          {/* Dynamic User Profile Switcher Button */}
          <button
            type="button"
            id="header-user-badge-btn"
            onClick={onOpenLogin}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 text-slate-800 dark:text-slate-100 shadow-xs transition-all cursor-pointer"
            title={`Logged in as ${displayName}. Click to switch user`}
          >
            <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-[10px] text-teal-600 dark:text-teal-400 uppercase font-bold block leading-none">
                Logged In User
              </span>
              <span className="text-xs font-bold truncate max-w-[120px] block">
                {displayName}
              </span>
            </div>
          </button>

          {/* Accessible Top-Corner Language Switcher */}
          <div className="hidden lg:block">
            <LanguageSelector
              currentLanguage={currentLanguage}
              onLanguageChange={onSelectLanguage}
            />
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              {currentLanguage === 'ur' ? 'مقام' : 'Location'}
            </span>
            <div className="flex items-center gap-1 text-sm font-semibold text-teal-600 dark:text-teal-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>{currentLocationName}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenDisclaimer}
            className="w-11 h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-xs hover:border-teal-400 transition-colors"
            title="Safety Disclaimer & PMDC Notice"
          >
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </header>

      {/* High Density Metric Cards & Emergency Mode Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wellness Score Card */}
        <div
          onClick={() => onNavigate('records')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 hover:border-teal-200 dark:hover:border-teal-900 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
              {currentLanguage === 'ur' ? 'تندرستی' : 'Wellness'}
            </span>
            <span className="text-teal-600 bg-teal-50 dark:bg-teal-950/60 dark:text-teal-300 px-2 py-0.5 rounded text-[10px] font-bold">
              +2%
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-white">87%</div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-teal-500 h-full w-[87%] rounded-full shadow-[0_0_8px_rgba(20,184,166,0.5)] transition-all duration-500" />
          </div>
        </div>

        {/* Heart Rate / Vitals Card */}
        <div
          onClick={() => onNavigate('records')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 hover:border-teal-200 dark:hover:border-teal-900 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
              {currentLanguage === 'ur' ? 'دل کی دھڑکن' : 'Heart Rate'}
            </span>
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20" />
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-white">
            72 <span className="text-sm text-slate-400 font-normal">bpm</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{currentLanguage === 'ur' ? 'مستحکم • آج چیک کیا گیا' : 'Stable • Checked 2h ago'}</span>
          </div>
        </div>

        {/* Emergency Mode Banner (col-span-2) */}
        <div className="bg-teal-600 p-5 rounded-2xl shadow-lg shadow-teal-600/20 text-white col-span-1 sm:col-span-2 relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <div className="text-xs font-bold uppercase tracking-wider opacity-85 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              <span>{currentLanguage === 'ur' ? 'ایمرجنسی موڈ' : 'Emergency Mode'}</span>
            </div>
            <div className="text-lg sm:text-xl font-bold mb-4 italic">
              {currentLanguage === 'ur'
                ? 'فوری مدد کے لیے علامات بولیں یا 1122 کال کریں'
                : 'Speak symptoms for immediate help'}
            </div>
            <div className="flex flex-wrap gap-2.5">
              <a
                href="tel:1122"
                className="bg-white text-teal-800 hover:bg-teal-50 px-5 py-2 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-1.5 active:scale-95"
              >
                <PhoneCall className="w-4 h-4 text-red-600 animate-bounce" />
                <span>Call Rescue 1122</span>
              </a>

              <button
                type="button"
                onClick={handleShareLocation}
                className="bg-teal-500 hover:bg-teal-400 text-white px-5 py-2 rounded-xl font-bold text-sm border border-teal-400 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>{copiedSos ? 'SOS Copied!' : 'Share Location'}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('symptoms')}
                className="bg-teal-700/80 hover:bg-teal-700 text-teal-100 px-4 py-2 rounded-xl text-xs font-semibold border border-teal-500/50 transition-colors"
              >
                AI Triage →
              </button>
            </div>
          </div>

          {/* Subtle background pulse icon */}
          <div className="absolute -right-4 -bottom-4 w-32 h-32 text-teal-500 opacity-20 pointer-events-none">
            <Activity className="w-full h-full" />
          </div>
        </div>
      </section>
    </div>
  );
};
