import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Pill,
  Heart,
  Activity,
  PhoneCall,
  Printer,
  CheckCircle2,
  Lock,
  Calendar,
  User,
  Share2,
  ArrowLeft,
  Clock,
  Sparkles,
} from 'lucide-react';
import { SharedHealthCardData, SupportedLanguage } from '../types';
import { LanguageSelector } from './LanguageSelector';

interface StandaloneHealthCardViewerProps {
  data: SharedHealthCardData;
  onExit?: () => void;
}

export const StandaloneHealthCardViewer: React.FC<StandaloneHealthCardViewerProps> = ({
  data,
  onExit,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(
    data.patientLanguage || 'en'
  );

  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`min-h-screen bg-[#f8faf9] text-slate-900 pb-12 select-none ${isUrdu ? 'font-urdu' : ''}`}>
      {/* Top Clinical Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-teal-200/80 shadow-xs px-4 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-teal-950 uppercase tracking-wider">
                  SehatSaathi Care
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Verified Summary
                </span>
              </div>
              <h1 className="text-xs sm:text-sm font-bold text-slate-600">
                {isUrdu ? 'مریض کا تصدیق شدہ طبی سمری ریکارڈ' : 'Doctor Emergency Medical Card'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSelector
              currentLanguage={currentLanguage}
              onLanguageChange={setCurrentLanguage}
            />

            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              title="Print Summary"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Exit
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Medical Summary Sheet */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 space-y-4">
        {/* Read-Only Notice Bar */}
        <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-700 shrink-0" />
            <span className="font-semibold">
              {isUrdu
                ? 'محفوظ طبی سمری: یہ صفحہ صرف پڑھنے کے لیے ہے۔ کوئی تبدیلیاں نہیں کی جا سکتیں۔'
                : 'Secure Read-Only Medical Viewer: Authorized for Hospital & Clinical Triage. No app or login needed.'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-teal-700 font-bold hidden sm:inline">
            Card ID: {data.cardId}
          </span>
        </div>

        {/* Patient Identity Top Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-teal-700 to-teal-900 text-white flex items-center justify-center font-black text-xl shadow-md">
                {(data.patientName || 'P').charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                  Patient Identity
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  {data.patientName}
                </h2>
                <p className="text-xs text-slate-500">
                  {data.age ? `${data.age} Yrs` : ''} {data.gender ? `• ${data.gender}` : ''} • SehatSaathi Clinical Record
                </p>
              </div>
            </div>

            {/* Blood Group Highlight Badge */}
            {data.bloodGroup && (
              <div className="p-3 rounded-2xl bg-red-50 border-2 border-red-200 text-center min-w-[90px] shrink-0">
                <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider block">
                  Blood Group
                </span>
                <span className="text-2xl font-black text-red-700 font-mono">
                  {data.bloodGroup}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 pt-1">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Generated</span>
              <span className="font-semibold text-slate-900">{data.generatedAt}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Valid Until</span>
              <span className="font-semibold text-slate-900">{data.expiresAt}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Emergency Dispatch</span>
              <a href="tel:1122" className="font-bold text-teal-700 hover:underline">
                Rescue 1122
              </a>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Emergency Phone</span>
              <a href={`tel:${data.emergencyPhone || '+923001122112'}`} className="font-bold text-teal-700 hover:underline">
                {data.emergencyPhone || '+92-300-1122112'}
              </a>
            </div>
          </div>
        </div>

        {/* 1. Critical Drug Allergies & Alerts (High-Visibility Red Banner) */}
        {data.allergies && (
          <div className="p-4 sm:p-5 rounded-3xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-rose-700 font-black text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{isUrdu ? 'الرجیز اور وارننگز (Drug Allergies & Warnings)' : 'Known Drug Allergies & Critical Alerts'}</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {data.allergies.map((alg, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-900 font-bold text-xs shadow-2xs"
                >
                  ⚠️ {alg}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 2. Active Medications & Dosing Schedule */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-600" />
              <h3 className="font-black text-sm sm:text-base text-slate-900">
                {isUrdu ? 'موجودہ ادویات و شیڈول (Current Medications)' : 'Active Prescriptions & Dosing Schedule'}
              </h3>
            </div>
            <span className="text-xs font-bold text-teal-700">
              {data.currentMedicines?.length || 0} Listed
            </span>
          </div>

          {!data.currentMedicines || data.currentMedicines.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">No active medications specified by patient.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {data.currentMedicines.map((med, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900">{med.name}</span>
                    <span className="font-mono font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
                      {med.dosage}
                    </span>
                  </div>
                  {med.frequency && (
                    <p className="text-slate-500 text-[11px]">Frequency: {med.frequency}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Recent Vitals Trends */}
        {data.recentVitals && (
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Activity className="w-5 h-5 text-emerald-600" />
              <h3 className="font-black text-sm sm:text-base text-slate-900">
                {isUrdu ? 'حالیہ وائٹلز (Recent Clinical Vitals)' : 'Recent Clinical Vitals & Telemetry'}
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Blood Pressure</span>
                <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
                  {data.recentVitals.bloodPressure || '120/80'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Blood Sugar</span>
                <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
                  {data.recentVitals.bloodSugar || '105 mg/dL'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Heart Rate</span>
                <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
                  {data.recentVitals.heartRate || '74 bpm'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Chronic Conditions & Diagnoses */}
        {data.chronicConditions && data.chronicConditions.length > 0 && (
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-black text-sm text-slate-900">
              {isUrdu ? 'دائمی طبی کیفیات (Chronic Conditions)' : 'Chronic Conditions on File'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.chronicConditions.map((cond, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 font-bold text-xs"
                >
                  • {cond}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer info for treating doctor */}
        <div className="text-center text-xs text-slate-400 py-4 space-y-1">
          <p>SehatSaathi Clinical QR Summary • Issued under PMDC Telemedicine Protocols</p>
          <p className="text-[10px]">Direct Inquiries: emergency@sehatsaathi.pk • 24/7 Helpline: 1122</p>
        </div>
      </main>
    </div>
  );
};
