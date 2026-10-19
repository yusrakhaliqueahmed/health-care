import React from 'react';
import {
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import trustedDoctorsImg from '../assets/images/trusted_doctors_1789283228204.jpg';
import { SupportedLanguage } from '../types';

interface TrustedDoctorsCardProps {
  currentLanguage?: SupportedLanguage;
  className?: string;
  onBookAppointment?: () => void;
  onOpenCall?: () => void;
  onOpenMessage?: () => void;
}

export const TrustedDoctorsCard: React.FC<TrustedDoctorsCardProps> = ({
  currentLanguage = 'en',
  className = '',
  onBookAppointment,
  onOpenCall,
}) => {
  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';

  return (
    <div
      id="card-trusted-doctors-hero"
      className={`relative w-full max-w-md lg:max-w-none rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl flex flex-col group transition-all duration-300 ${className}`}
    >
      {/* Clean Main Image Container without overlays */}
      <div className="relative w-full h-72 sm:h-80 md:h-96 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-950 overflow-hidden flex items-center justify-center">
        <img
          src={trustedDoctorsImg}
          alt="Certified Doctors smiling in white coats with stethoscopes"
          className="w-full h-full object-cover object-center filter brightness-[1.01] contrast-[1.02] group-hover:scale-[1.02] transition-transform duration-700"
          loading="eager"
        />

        {/* Soft Vignette Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Card Info Footer */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
              {isUrdu
                ? 'ماہر میڈیکل کنسلٹنٹس پینل'
                : isRoman
                ? 'Certified Medical Specialists Panel'
                : 'Certified Medical Specialists Panel'}
            </h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {isUrdu
              ? 'چیف میڈیکل کنسلٹنٹس • ایم بی بی ایس، ایف سی پی ایس'
              : isRoman
              ? 'Senior Medical Consultants • MBBS, FCPS'
              : 'Licensed Medical Consultants • MBBS, FCPS'}
          </p>
        </div>

        <button
          type="button"
          onClick={onBookAppointment || onOpenCall}
          className="px-3.5 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/70 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs font-bold transition-colors border border-teal-200 dark:border-teal-800 shrink-0 cursor-pointer flex items-center gap-1.5"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{isUrdu ? 'بک کریں' : isRoman ? 'Book Karein' : 'Book'}</span>
        </button>
      </div>
    </div>
  );
};
