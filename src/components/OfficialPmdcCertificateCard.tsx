import React from 'react';
import { ShieldCheck, CheckCircle2, QrCode, Award, ExternalLink, FileCheck, Building2 } from 'lucide-react';
import { getOfficialPmdcCertificateData } from '../services/pmdcCertificateService';

interface OfficialPmdcCertificateCardProps {
  doctorName: string;
  pmdcNumber: string;
  qualification: string;
  specialty?: string;
  hospital?: string;
  city?: string;
  province?: string;
  registeredAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  customDocumentDataUrl?: string;
  customDocumentName?: string;
  isInspecting?: boolean;
}

export const OfficialPmdcCertificateCard: React.FC<OfficialPmdcCertificateCardProps> = ({
  doctorName,
  pmdcNumber,
  qualification,
  specialty,
  hospital,
  city,
  province,
  registeredAt,
  verifiedAt,
  verifiedBy,
  customDocumentDataUrl,
  customDocumentName,
  isInspecting = false,
}) => {
  const cert = getOfficialPmdcCertificateData(doctorName, pmdcNumber, qualification, registeredAt);

  return (
    <div className="relative rounded-2xl sm:rounded-3xl border-4 border-emerald-700/80 bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white p-4 sm:p-6 shadow-2xl overflow-hidden select-none">
      {/* Background Watermark Crest */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <ShieldCheck className="w-96 h-96 text-emerald-400" />
      </div>

      {/* Official Header */}
      <div className="text-center border-b-2 border-emerald-500/40 pb-4 relative z-10">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">
            Islamic Republic of Pakistan
          </span>
        </div>
        <h2 className="text-base sm:text-xl font-extrabold text-white tracking-wide uppercase">
          Pakistan Medical & Dental Council
        </h2>
        <p className="text-[10px] sm:text-xs text-emerald-200/80 font-medium">
          Mauve Area, G-10/4, Islamabad • Established under PMDC Act
        </p>

        <div className="mt-3 inline-block px-4 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 font-bold text-xs uppercase tracking-wider">
          Certificate of Permanent Medical Registration (Form-B)
        </div>
      </div>

      {/* Main Certificate Body */}
      <div className="py-5 space-y-4 text-xs sm:text-sm relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Doctor Name */}
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">
              Registered Practitioner Name
            </span>
            <span className="text-base font-extrabold text-white block">
              {cert.doctorName}
            </span>
            {specialty && (
              <span className="text-xs text-slate-300 block">{specialty}</span>
            )}
          </div>

          {/* PMDC Registration Number */}
          <div className="bg-emerald-950/60 p-3 rounded-xl border-2 border-emerald-500/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">
                Official PMDC License Number
              </span>
              <span className="font-mono text-lg font-black text-emerald-300 tracking-wider block">
                {cert.pmdcNumber}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500 text-slate-950 font-black text-[10px] uppercase shrink-0">
              Verified
            </div>
          </div>
        </div>

        {/* Qualification & Affiliation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
              Recognized Qualifications
            </span>
            <span className="font-bold text-slate-100">{cert.qualification}</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
              Institution / Affiliation
            </span>
            <span className="font-bold text-slate-100">
              {hospital || cert.graduatingInstitution} {city ? `(${city})` : ''}
            </span>
          </div>
        </div>

        {/* Dates & Validity */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs bg-slate-900/90 p-3 rounded-xl border border-emerald-800/40">
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">Registration Date:</span>
            <span className="font-bold text-emerald-300">{cert.registrationDate}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">Valid Until:</span>
            <span className="font-bold text-emerald-300">{cert.validUntil}</span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 block font-bold">Registration Type:</span>
            <span className="font-bold text-slate-200 truncate block">Form-B Permanent</span>
          </div>
        </div>

        {/* Uploaded Scan Preview (if available) */}
        {customDocumentDataUrl && (
          <div className="mt-3 p-3 bg-slate-950/80 rounded-xl border border-slate-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Original Uploaded License File: {customDocumentName || 'pmdc_scan.pdf'}</span>
            </span>
            <img
              src={customDocumentDataUrl}
              alt="Uploaded Certificate Scan"
              className="max-h-48 w-full object-contain rounded-lg border border-slate-800 bg-white"
            />
          </div>
        )}
      </div>

      {/* Official Council Seal, Registrar Stamp & Verification QR */}
      <div className="pt-4 border-t-2 border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs relative z-10">
        <div className="flex items-center gap-2.5">
          {/* Green & Gold Official Council Seal */}
          <div className="w-12 h-12 rounded-full border-2 border-amber-400 bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center shadow-lg shrink-0">
            <ShieldCheck className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
              Official Council Seal Verified
            </span>
            <span className="text-[11px] text-slate-300 block">
              Registrar, Pakistan Medical & Dental Council
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-mono text-emerald-400 block">
              {cert.certificateNumber}
            </span>
            <span className="text-[10px] text-slate-400 block">
              Security Hologram: {cert.securityHologramCode}
            </span>
          </div>

          <a
            href={cert.qrVerificationUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-slate-950 font-bold text-xs transition-all shadow-md shrink-0 cursor-pointer"
            title="Cross-check on PMDC National Database"
          >
            <QrCode className="w-4 h-4" />
            <span>Verify Online</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
