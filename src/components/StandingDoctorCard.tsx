import React from 'react';
import { ShieldCheck, Stethoscope, Award, CheckCircle2 } from 'lucide-react';
import doctorImg from '../assets/images/standing_doctor_1788941800353.jpg';

interface StandingDoctorCardProps {
  className?: string;
  badgePosition?: 'left' | 'right';
  compact?: boolean;
}

/**
 * Standing Medical Doctor Picture Component
 * - Shows photorealistic doctor standing in white clinical lab coat with stethoscope
 * - PMDC certification badge, verified status, and clinical specialty
 */
export const StandingDoctorCard: React.FC<StandingDoctorCardProps> = ({
  className = '',
  compact = false,
}) => {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-teal-500/40 bg-teal-950/70 backdrop-blur-md shadow-2xl flex flex-col group hover:border-teal-400/60 transition-all duration-300 ${className}`}
    >
      {/* Top Clinical Status Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-teal-900/60 border-b border-teal-800/50 text-[11px]">
        <div className="flex items-center gap-1.5 text-teal-300 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
          <span>PMDC Verified Doctor</span>
        </div>
        <span className="text-[10px] text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-600/40">
          24/7 On-Duty
        </span>
      </div>

      {/* Picture Frame: Standing Doctor */}
      <div className={`relative w-full overflow-hidden ${compact ? 'h-44 sm:h-52' : 'h-56 sm:h-64'} bg-gradient-to-t from-black via-slate-900 to-teal-950 flex items-center justify-center`}>
        <img
          src={doctorImg}
          alt="PMDC Certified Medical Doctor Standing on Duty"
          className="w-full h-full object-cover object-top filter brightness-[1.02] contrast-[1.03] group-hover:scale-105 transition-transform duration-500"
          loading="eager"
        />

        {/* Bottom Gradient Fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-teal-950 via-transparent to-transparent pointer-events-none" />

        {/* Floating Verified Badge */}
        <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-teal-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="text-white font-bold leading-tight text-[11px]">
                Dr. Ayesha Malik, MBBS
              </p>
              <p className="text-[10px] text-teal-300/90 leading-none">
                Chief Medical Officer • PMDC #48291-P
              </p>
            </div>
          </div>
          <Stethoscope className="w-4 h-4 text-teal-300 shrink-0" />
        </div>
      </div>
    </div>
  );
};
