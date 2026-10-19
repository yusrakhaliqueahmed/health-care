import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, QrCode, CreditCard, Sparkles, Building2, User, Eye, EyeOff } from 'lucide-react';

interface PakistaniCnicCardProps {
  cnicNumber: string;
  citizenName: string;
  fatherName?: string;
  gender?: string;
  dob?: string;
  customDocumentDataUrl?: string | null;
  customDocumentName?: string;
  avatarUrl?: string;
  isDoctor?: boolean;
  pmdcNumber?: string;
  isInspecting?: boolean;
}

export const PakistaniCnicCard: React.FC<PakistaniCnicCardProps> = ({
  cnicNumber,
  citizenName,
  fatherName,
  gender = 'Male',
  dob = '14.08.1985',
  customDocumentDataUrl,
  customDocumentName,
  avatarUrl = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
  isDoctor = true,
  pmdcNumber,
  isInspecting = false,
}) => {
  const [showBackSide, setShowBackSide] = useState(false);

  // Clean CNIC format
  const digitsOnly = cnicNumber.replace(/\D/g, '');
  const formattedCnic =
    digitsOnly.length === 13
      ? `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5, 12)}-${digitsOnly.slice(12)}`
      : cnicNumber || '';

  // If a real uploaded photo or document was provided, we can show it directly or the official Smart Card format
  return (
    <div className="space-y-2 select-none">
      {/* Front & Back Switcher */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-teal-800 dark:text-teal-300">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>NADRA Smart National Identity Card (SNIC)</span>
        </div>
        <button
          type="button"
          onClick={() => setShowBackSide(!showBackSide)}
          className="px-2.5 py-1 rounded-lg bg-teal-100 hover:bg-teal-200 dark:bg-teal-950 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-300 font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1"
        >
          {showBackSide ? 'View Front Side' : 'View Back Side (QR & Barcode)'}
        </button>
      </div>

      {/* Actual Uploaded Picture Preview Banner if present */}
      {customDocumentDataUrl && !showBackSide && (
        <div className="p-2 rounded-xl bg-slate-900 border border-teal-500/40 text-center">
          <span className="text-[10px] uppercase font-bold text-teal-300 tracking-wider block mb-1">
            Doctor's Uploaded CNIC Document Photo
          </span>
          <img
            src={customDocumentDataUrl}
            alt="Doctor CNIC Card Upload"
            className="max-h-48 mx-auto rounded-lg object-contain shadow-md border border-slate-700"
          />
          <p className="text-[10px] text-slate-400 mt-1 truncate">
            {customDocumentName || 'CNIC_Photo_Scan.jpg'}
          </p>
        </div>
      )}

      {/* Realistic Pakistani Smart National Identity Card (Front) */}
      {!showBackSide ? (
        <div className="relative rounded-2xl border-2 border-emerald-600/80 bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 text-white p-4 shadow-xl overflow-hidden">
          {/* Subtle Microprint Guilloche Background */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

          {/* Header with Islamic Republic of Pakistan & Emblem */}
          <div className="flex items-center justify-between border-b border-emerald-500/40 pb-2 mb-3 relative z-10">
            <div className="flex items-center gap-2">
              {/* Crescent & Star Icon */}
              <div className="w-8 h-8 rounded-full bg-emerald-800/80 border border-emerald-400 flex items-center justify-center text-emerald-200 shrink-0 shadow-inner">
                <span className="text-base font-bold">☪</span>
              </div>
              <div>
                <h4 className="text-xs font-black tracking-wider uppercase text-emerald-200">
                  Islamic Republic of Pakistan
                </h4>
                <p className="text-[10px] text-emerald-300/80 font-urdu">
                  حکومتِ پاکستان • قومی شناختی کارڈ
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/50 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                National Identity Card
              </span>
            </div>
          </div>

          {/* Body: Photo, Smart Chip, and Citizen Details */}
          <div className="flex items-start gap-3 relative z-10">
            {/* Left: Doctor Photo + Golden Chip */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="relative w-20 h-24 rounded-lg overflow-hidden border-2 border-emerald-400 shadow-md bg-slate-800">
                <img
                  src={avatarUrl}
                  alt={citizenName}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 inset-x-0 bg-emerald-950/80 text-[8px] text-center font-bold text-emerald-300 py-0.5 uppercase">
                  Verified
                </span>
              </div>

              {/* Golden Smart Chip Graphic */}
              <div className="w-8 h-6 rounded bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 border border-amber-200 shadow-inner flex items-center justify-center">
                <div className="w-5 h-4 border border-amber-800/40 rounded-xs grid grid-cols-2 gap-0.5 p-0.5 opacity-80">
                  <div className="border-r border-b border-amber-800/40" />
                  <div className="border-b border-amber-800/40" />
                  <div className="border-r border-amber-800/40" />
                  <div />
                </div>
              </div>
            </div>

            {/* Right: Citizen Official Information */}
            <div className="flex-1 min-w-0 space-y-1.5 text-xs">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-emerald-400/90 font-bold block">
                  Name / نام
                </span>
                <span className="font-extrabold text-sm text-white tracking-wide block truncate">
                  {citizenName}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-emerald-400/90 font-bold block">
                    Father Name
                  </span>
                  <span className="font-medium text-slate-200 truncate block">
                    {fatherName}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-emerald-400/90 font-bold block">
                    Gender / جنس
                  </span>
                  <span className="font-medium text-slate-200">
                    {gender}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-emerald-400/90 font-bold block">
                    Country of Stay
                  </span>
                  <span className="font-medium text-slate-200">
                    Pakistan
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-emerald-400/90 font-bold block">
                    Date of Birth
                  </span>
                  <span className="font-mono font-medium text-slate-200">
                    {dob}
                  </span>
                </div>
              </div>

              {/* Identity Number Section (Prominent) */}
              <div className="pt-1.5 border-t border-emerald-500/30">
                <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-black block">
                  Identity Number / شناختی کارڈ نمبر
                </span>
                <span className="text-base font-black font-mono tracking-widest text-emerald-300 text-shadow">
                  {formattedCnic}
                </span>
              </div>
            </div>
          </div>

          {/* Footer watermark & security notice */}
          <div className="mt-3 pt-2 border-t border-emerald-500/30 flex items-center justify-between text-[9px] text-emerald-300/80">
            <span className="flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              NADRA Secured Smart Identity Document
            </span>
            {pmdcNumber && (
              <span className="font-mono text-emerald-300">
                PMDC Match: {pmdcNumber}
              </span>
            )}
          </div>
        </div>
      ) : (
        /* Back Side of CNIC */
        <div className="relative rounded-2xl border-2 border-emerald-600/80 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-950 text-white p-4 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-emerald-500/40 pb-2 mb-3">
            <span className="text-xs font-black uppercase text-emerald-300">
              National Database & Registration Authority (NADRA)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">FORM-B / C</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-[11px] space-y-1">
              <span className="text-[9px] text-emerald-400 uppercase font-bold block">
                Present & Permanent Address / پتہ
              </span>
              <p className="text-slate-300">
                House # 42-B, Sector F-8/2, Islamabad, Pakistan
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 pt-1">
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">
                  Date of Issue
                </span>
                <span className="font-mono text-slate-200">12.01.2022</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">
                  Date of Expiry
                </span>
                <span className="font-mono text-emerald-300 font-bold">12.01.2032</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white text-slate-900">
                <QrCode className="w-8 h-8" />
                <span className="text-[8px] font-mono leading-tight block">
                  NADRA<br />VERIFIED<br />QR
                </span>
              </div>
            </div>

            {/* Simulated Machine Readable Zone (MRZ) */}
            <div className="p-2 rounded bg-black/60 font-mono text-[9px] text-emerald-400 tracking-widest overflow-x-auto select-all">
              <div>I&lt;PAK{digitsOnly.slice(0, 5)}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
              <div>{digitsOnly.slice(5)}9PAK8508144M3201121&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;6</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
