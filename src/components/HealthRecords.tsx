import React, { useState } from 'react';
import { SupportedLanguage, PatientProfile, Prescription, MedicalReportRecord } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import {
  History,
  User,
  Plus,
  QrCode,
  FileText,
  Calendar,
  ShieldCheck,
  Download,
  HeartPulse,
  Activity,
  Printer,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface HealthRecordsProps {
  currentLanguage: SupportedLanguage;
  patientProfiles: PatientProfile[];
  prescriptions: Prescription[];
  reports: MedicalReportRecord[];
  onAddProfile: (profile: PatientProfile) => void;
}

export const HealthRecords: React.FC<HealthRecordsProps> = ({
  currentLanguage,
  patientProfiles,
  prescriptions,
  reports,
  onAddProfile,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const [activeProfileId, setActiveProfileId] = useState<string>(
    patientProfiles[0]?.id || 'prof-1'
  );
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'reports' | 'vitals'>('prescriptions');
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);

  // New profile state
  const [newProfName, setNewProfName] = useState('');
  const [newProfRelation, setNewProfRelation] = useState('Child');
  const [newProfAge, setNewProfAge] = useState('8');
  const [newProfGender, setNewProfGender] = useState<'male' | 'female'>('male');

  const activeProfile =
    patientProfiles.find((p) => p.id === activeProfileId) || patientProfiles[0];

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfName) return;

    const newP: PatientProfile = {
      id: `prof-${Date.now()}`,
      name: newProfName,
      relation: newProfRelation,
      ageGroup: Number(newProfAge) < 2 ? 'infant' : Number(newProfAge) < 12 ? 'child' : Number(newProfAge) < 18 ? 'teen' : Number(newProfAge) > 60 ? 'elderly' : 'adult',
      exactAge: Number(newProfAge) || 25,
      gender: newProfGender,
      conditions: 'None recorded',
      medications: 'None recorded',
      allergies: 'None recorded',
    };

    onAddProfile(newP);
    setActiveProfileId(newP.id);
    setShowAddProfileModal(false);
    setNewProfName('');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner with EMR Tablet Visual */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/80 border border-teal-600 text-teal-200 text-xs font-bold mb-2">
              <History className="w-4 h-4" />
              <span>Digital Health Records & EHR</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t.patientEhr}
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 mt-1 max-w-xl">
              Paperless prescriptions signed by PMDC certified physicians, lab histories, and family health folders.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs shadow-md shrink-0 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Patient Card</span>
          </button>
        </div>
      </div>

      {/* Family Profiles Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
            {t.familyProfiles}:
          </span>
          {patientProfiles.map((prof) => (
            <button
              key={prof.id}
              type="button"
              onClick={() => setActiveProfileId(prof.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all min-h-[40px] ${
                activeProfileId === prof.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>
                {prof.name} ({prof.relation})
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowAddProfileModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 hover:bg-teal-100 border border-teal-200 dark:border-teal-800 text-xs font-bold transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Family Member</span>
        </button>
      </div>

      {/* Active Profile Info Card */}
      {activeProfile && (
        <div className="p-5 rounded-3xl bg-teal-50/60 dark:bg-slate-800/60 border border-teal-200/80 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {activeProfile.name}
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[11px] font-bold">
                {activeProfile.relation}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Age: {activeProfile.exactAge} yrs • Gender: {activeProfile.gender} • Blood Group: {activeProfile.bloodGroup || 'O+'}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
            <div>
              <span className="font-bold text-slate-400 block text-[10px] uppercase">Allergies</span>
              <span className="text-red-600 dark:text-red-400 font-semibold">
                {activeProfile.allergies}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-400 block text-[10px] uppercase">Active Meds</span>
              <span>{activeProfile.medications}</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveTab('prescriptions')}
          className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'prescriptions'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Doctor Prescriptions ({prescriptions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'reports'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Medical Reports ({reports.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('vitals')}
          className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'vitals'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Vitals & Blood Sugar</span>
        </button>
      </div>

      {/* Tab 1: Prescriptions with QR Code */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              {/* Prescriber Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {rx.doctorName}
                    </h4>
                    <span className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-mono font-bold">
                      {rx.doctorPmdc}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Prescription ID: #{rx.id} • Issued: {rx.date}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verified PMDC Signature</span>
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Clinical Diagnosis
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {rx.diagnosis}
                </p>
              </div>

              {/* Medicines Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Prescribed Medicines
                </span>
                <div className="space-y-2">
                  {rx.medicines.map((med, mIdx) => (
                    <div
                      key={mIdx}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {med.name}
                        </span>
                        <p className="text-slate-500">{med.instructions}</p>
                      </div>
                      <div className="flex items-center gap-3 font-semibold text-slate-700 dark:text-slate-300">
                        <span>{med.dosage}</span>
                        <span className="text-teal-600 font-bold">({med.duration})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* QR Code Verification Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-mono font-bold text-[10px] p-1 text-center">
                    <QrCode className="w-8 h-8 text-slate-800 dark:text-slate-200" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      Scan QR at any Pakistani Pharmacy
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Security Hash: {rx.qrCodeData.slice(0, 24)}...
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs"
                >
                  Download / Print PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Medical Reports */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 rounded-2xl overflow-hidden mb-3 bg-black/10">
                  <img
                    src={rep.photoUrl}
                    alt={rep.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                    Doctor Approved
                  </div>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  {rep.title}
                </h4>
                <p className="text-xs text-slate-400 mb-2">
                  Date: {rep.date} • Patient: {rep.patientName}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                  {rep.findings}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">
                  {rep.reviewedByDoctor || 'PMDC Verified'}
                </span>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="p-2 text-slate-600 hover:text-teal-600"
                  title="Print Report"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Vitals Tracker */}
      {activeTab === 'vitals' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Recent Health Metrics Tracking
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800">
              <span className="text-xs font-bold text-teal-700 dark:text-teal-300 uppercase">
                Fasting Blood Sugar
              </span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                108 <span className="text-xs font-normal text-slate-500">mg/dL</span>
              </p>
              <span className="text-[10px] text-emerald-600 font-bold">Normal Range (70-110)</span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase">
                Blood Pressure
              </span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                124/82 <span className="text-xs font-normal text-slate-500">mmHg</span>
              </p>
              <span className="text-[10px] text-blue-600 font-bold">Pre-hypertension control</span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase">
                Pulse / Heart Rate
              </span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                74 <span className="text-xs font-normal text-slate-500">BPM</span>
              </p>
              <span className="text-[10px] text-purple-600 font-bold">Resting normal</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Family Profile */}
      {showAddProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Add Family Member Profile
            </h3>

            <form onSubmit={handleCreateProfile} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newProfName}
                  onChange={(e) => setNewProfName(e.target.value)}
                  placeholder="e.g. Fatima Farooq"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Relation
                </label>
                <select
                  value={newProfRelation}
                  onChange={(e) => setNewProfRelation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option>Child</option>
                  <option>Mother</option>
                  <option>Father</option>
                  <option>Spouse</option>
                  <option>Sibling</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    value={newProfAge}
                    onChange={(e) => setNewProfAge(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Gender
                  </label>
                  <select
                    value={newProfGender}
                    onChange={(e) => setNewProfGender(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddProfileModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 text-white font-bold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
