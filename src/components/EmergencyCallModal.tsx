import React from 'react';
import {
  X,
  PhoneCall,
  ShieldAlert,
  Ambulance,
  HeartPulse,
  PhoneForwarded,
  MapPin,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { SupportedLanguage } from '../types';

interface EmergencyCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: SupportedLanguage;
}

export const EmergencyCallModal: React.FC<EmergencyCallModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
}) => {
  if (!isOpen) return null;

  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';

  const emergencyNumbers = [
    {
      id: 'rescue1122',
      nameEn: 'Rescue 1122 (Ambulance & Fire)',
      nameUr: 'ریسکیو 1122 (ایمبولینس اور فائر)',
      nameRoman: 'Rescue 1122 (Ambulance & Fire)',
      number: '1122',
      badge: 'Primary Dispatch',
      badgeColor: 'bg-red-600 text-white',
      descEn: 'Govt. emergency paramedic response & triage across Punjab, KPK, Balochistan & Sindh.',
      descUr: 'سرکاری ایمبولینس اور پیرامیڈک ایمرجنسی رسپانس۔',
      descRoman: 'Sarkari ambulance aur emergency medical team.',
      recommended: true,
    },
    {
      id: 'edhi115',
      nameEn: 'Edhi Ambulance Service',
      nameUr: 'ایدھی ایمبولینس سروس',
      nameRoman: 'Edhi Ambulance Service',
      number: '115',
      badge: 'Nationwide Network',
      badgeColor: 'bg-emerald-700 text-white',
      descEn: 'Largest emergency ambulance fleet across all cities & rural regions of Pakistan.',
      descUr: 'ملک بھر میں سب سے بڑا ایمبولینس نیٹ ورک۔',
      descRoman: 'Pooray Pakistan mein Edhi ambulance fleet.',
      recommended: false,
    },
    {
      id: 'chhipa1020',
      nameEn: 'Chhipa Emergency Service',
      nameUr: 'چھیپا ایمرجنسی سروس',
      nameRoman: 'Chhipa Emergency Service',
      number: '1020',
      badge: 'Urban Emergency',
      badgeColor: 'bg-amber-600 text-white',
      descEn: 'Rapid trauma and emergency hospital transfer service.',
      descUr: 'فوری ہسپتال منتقلی اور ٹراما ریسکیو سروس۔',
      descRoman: 'Karachi aur digar shehron mein fori hospital shift service.',
      recommended: false,
    },
  ];

  return (
    <div
      id="emergency-call-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-4 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="emergency-call-modal"
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-red-200 dark:border-red-900/60 p-5 sm:p-6 text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[min(94vh,620px)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Warning Stripe */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center justify-center shadow-xs">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-md border border-red-200/60 dark:border-red-900/60">
                {isUrdu ? 'براہِ راست ایمرجنسی کال' : isRoman ? 'Direct Emergency Call' : 'Immediate Emergency Dispatch'}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {isUrdu ? 'ایمرجنسی ہیلپ لائنز (پاکستان)' : isRoman ? 'Emergency Helplines (Pakistan)' : 'Emergency Helplines (Pakistan)'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 min-h-0 space-y-3.5 pr-0.5 mt-4">
          {/* Priority 1122 Instant Action Card */}
          <div className="p-4 rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/25 relative overflow-hidden">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                  Toll-Free 24/7 Dispatch
                </span>
                <h3 className="text-xl font-black mt-1">Rescue 1122 Ambulance</h3>
                <p className="text-xs text-red-100 mt-0.5">
                  {isUrdu ? 'فوری طبی عملہ اور ایمبولینس روانگی' : 'Instant paramedic assistance and GPS ambulance dispatch.'}
                </p>
              </div>
              <a
                href="tel:1122"
                className="px-4 py-3 rounded-xl bg-white text-red-600 hover:bg-red-50 active:scale-95 text-sm font-black shadow-md flex items-center gap-2 cursor-pointer shrink-0 transition-transform"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call 1122</span>
              </a>
            </div>
          </div>

          {/* Alternate Emergency Numbers */}
          <div className="space-y-2">
            {emergencyNumbers.filter(n => n.id !== 'rescue1122').map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-2.5 hover:border-teal-400 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {isUrdu ? item.nameUr : isRoman ? item.nameRoman : item.nameEn}
                    </h4>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {isUrdu ? item.descUr : isRoman ? item.descRoman : item.descEn}
                  </p>
                </div>

                <a
                  href={`tel:${item.number}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-teal-600 dark:hover:bg-teal-600 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Call {item.number}</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info (Fixed at bottom) */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-teal-500" />
            <span>24 Hours Emergency Lines</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
