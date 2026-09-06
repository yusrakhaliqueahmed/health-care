import React, { useState } from 'react';
import { SupportedLanguage, Doctor, PatientCase } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import {
  ShieldCheck,
  CheckCircle,
  FileText,
  Clock,
  User,
  AlertTriangle,
  Send,
  Stethoscope,
  PenTool,
  QrCode,
} from 'lucide-react';

interface DoctorReviewPortalProps {
  currentLanguage: SupportedLanguage;
  pendingCases: PatientCase[];
  onApproveCase: (caseId: string, doctorNote: string, prescriptionText: string) => void;
}

export const DoctorReviewPortal: React.FC<DoctorReviewPortalProps> = ({
  currentLanguage,
  pendingCases,
  onApproveCase,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(pendingCases[0]?.id || '');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [rxMedicines, setRxMedicines] = useState('');
  const [signedName, setSignedName] = useState('Medical Officer on Duty (PMDC Licensed)');
  const [approvalNotice, setApprovalNotice] = useState<string | null>(null);

  const selectedCase = pendingCases.find((c) => c.id === selectedCaseId) || pendingCases[0];

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    onApproveCase(
      selectedCase.id,
      doctorNotes || 'Approved with symptomatic care instructions.',
      rxMedicines || 'Paracetamol 500mg (1 tablet after meals) for 3 days'
    );
    setDoctorNotes('');
    setRxMedicines('');
    setApprovalNotice(`Case #${selectedCase.id} approved and signed.`);
    setTimeout(() => setApprovalNotice(null), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/80 border border-teal-600 text-teal-200 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>PMDC Licensed Medical Officer Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Clinical Triage Review & Prescription Signing
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-1 max-w-xl">
            Human-in-the-loop review. Licensed physicians evaluate AI pre-screened patient files and issue authenticated digital prescriptions.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-teal-800/60 border border-teal-700 text-xs font-bold shrink-0">
          Queue: {pendingCases.length} Cases Pending
        </div>
      </div>

      {approvalNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>{approvalNotice}</span>
        </div>
      )}

      {pendingCases.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            All Triage Cases Approved
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No pending patient files awaiting clinical review. New symptom checker cases will automatically appear here for PMDC verification.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Case List Sidebar */}
          <div className="md:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-2">
              Pending Case Files
            </span>
            <div className="space-y-2">
              {pendingCases.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`w-full p-3.5 rounded-2xl text-left border transition-all ${
                    selectedCaseId === c.id
                      ? 'bg-teal-50 dark:bg-teal-950 border-teal-500 shadow-xs'
                      : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {c.patientName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.urgency === 'RED'
                          ? 'bg-red-100 text-red-700'
                          : c.urgency === 'YELLOW'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {c.urgency}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {c.symptoms}
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-1">{c.date}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Review Details & Sign Form */}
          {selectedCase && (
            <div className="md:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">
                    Patient Case ID: #{selectedCase.id}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {selectedCase.patientName} ({selectedCase.exactAge || 30} yrs, {selectedCase.ageGroup})
                  </h3>
                </div>

                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 rounded-xl text-xs font-bold">
                  Awaiting Review
                </span>
              </div>

              {/* Symptoms & AI Pre-analysis */}
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-500 uppercase block mb-1">
                    Reported Patient Symptoms
                  </span>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {selectedCase.symptoms}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-slate-800/80 border border-teal-200 dark:border-teal-800">
                  <span className="font-bold text-teal-800 dark:text-teal-300 uppercase block mb-1">
                    AI Pre-Triage Differential Summary
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedCase.aiSummary || 'Triage completed. Minor upper respiratory symptoms suggested.'}
                  </p>
                </div>
              </div>

              {/* Doctor Formal Clinical Input */}
              <form onSubmit={handleApprove} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Attending Physician Notes & Diagnosis
                  </label>
                  <textarea
                    rows={3}
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder="Enter formal medical remarks or diagnosis confirmed..."
                    className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Prescribed Medicines & Dosage Instructions (e-Prescription)
                  </label>
                  <textarea
                    rows={2}
                    value={rxMedicines}
                    onChange={(e) => setRxMedicines(e.target.value)}
                    placeholder="e.g. Paracetamol 500mg TDS x 3 days, ORS sachets prn"
                    className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-teal-600" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Signing as: {signedName}
                    </span>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Officially Approve & Issue Signed PMDC Prescription</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
