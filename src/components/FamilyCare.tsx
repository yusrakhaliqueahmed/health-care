import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Baby,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Plus,
  Lock,
  Heart,
  ChevronRight,
  Syringe,
  Info,
  Check,
  Clock,
} from 'lucide-react';
import { SupportedLanguage, PatientProfile, UserAccount, ChildVaccineItem } from '../types';

interface FamilyCareProps {
  currentLanguage: SupportedLanguage;
  patientProfiles: PatientProfile[];
  onAddProfile: (profile: PatientProfile) => void;
  currentUser?: UserAccount;
}

const EPI_PAKISTAN_SCHEDULE: ChildVaccineItem[] = [
  {
    id: 'vac-birth-bcg',
    vaccineName: 'BCG + OPV-0 (Polio Drops)',
    diseaseTarget: 'Tuberculosis & Poliovirus',
    recommendedAge: 'At Birth (پیدائش پر)',
    recommendedMonths: 0,
    status: 'completed',
    administeredDate: 'At birth',
  },
  {
    id: 'vac-6wk-penta1',
    vaccineName: 'Pentavalent-1 + PCV-1 + Rota-1 + OPV-1',
    diseaseTarget: 'Diphtheria, Tetanus, Pertussis, Hep B, Hib, Pneumonia, Rotavirus',
    recommendedAge: '6 Weeks (چھٹے ہفتے)',
    recommendedMonths: 1.5,
    status: 'completed',
    administeredDate: '6 weeks',
  },
  {
    id: 'vac-10wk-penta2',
    vaccineName: 'Pentavalent-2 + PCV-2 + Rota-2 + OPV-2',
    diseaseTarget: 'Diphtheria, Tetanus, Pertussis, Hep B, Hib, Pneumonia, Rotavirus',
    recommendedAge: '10 Weeks (دسویں ہفتے)',
    recommendedMonths: 2.5,
    status: 'completed',
  },
  {
    id: 'vac-14wk-penta3',
    vaccineName: 'Pentavalent-3 + PCV-3 + IPV + OPV-3',
    diseaseTarget: 'Diphtheria, Tetanus, Pertussis, Hep B, Hib, Pneumonia, Polio Injection',
    recommendedAge: '14 Weeks (چودھویں ہفتے)',
    recommendedMonths: 3.5,
    status: 'due',
  },
  {
    id: 'vac-9mo-measles1',
    vaccineName: 'Measles-1 (خسرہ)',
    diseaseTarget: 'Measles & Rubella',
    recommendedAge: '9 Months (نویں ماہ)',
    recommendedMonths: 9,
    status: 'due',
  },
  {
    id: 'vac-15mo-measles2',
    vaccineName: 'Measles-2 + Typhoid (TCV)',
    diseaseTarget: 'Measles, Rubella & Typhoid Conjugate',
    recommendedAge: '15 Months (پندرہویں ماہ)',
    recommendedMonths: 15,
    status: 'due',
  },
];

export const FamilyCare: React.FC<FamilyCareProps> = ({
  currentLanguage,
  patientProfiles,
  onAddProfile,
  currentUser,
}) => {
  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';

  const [activeProfileTab, setActiveProfileTab] = useState<string>(
    patientProfiles[0]?.id || 'prof-self'
  );
  const [vaccines, setVaccines] = useState<ChildVaccineItem[]>(EPI_PAKISTAN_SCHEDULE);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // New family member form state
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState<'Child' | 'Parent' | 'Spouse' | 'Other'>('Child');
  const [newAge, setNewAge] = useState<number>(3);
  const [newGender, setNewGender] = useState<'male' | 'female' | 'other'>('male');
  const [consentAcknowledged, setConsentAcknowledged] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const activeProfile =
    patientProfiles.find((p) => p.id === activeProfileTab) || patientProfiles[0];

  const handleToggleVaccine = (vacId: string) => {
    setVaccines((prev) =>
      prev.map((v) => {
        if (v.id !== vacId) return v;
        const newStatus = v.status === 'completed' ? 'due' : 'completed';
        return {
          ...v,
          status: newStatus,
          administeredDate: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
        };
      })
    );
  };

  const handleCreateFamilyMember = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newName.trim()) {
      setFormError('Please enter family member name');
      return;
    }

    if (!consentAcknowledged) {
      setFormError(
        isUrdu
          ? 'برائے مہربانی رازداری اور رضامندی کا خانہ چیک کریں۔'
          : 'Please acknowledge consent for managing this family member profile.'
      );
      return;
    }

    const created: PatientProfile = {
      id: `prof-${Date.now()}`,
      name: newName.trim(),
      relation: newRelation,
      exactAge: newAge,
      ageGroup: newAge < 2 ? 'infant' : newAge < 12 ? 'child' : newAge < 19 ? 'teen' : newAge > 60 ? 'elderly' : 'adult',
      gender: newGender,
      conditions: '',
      medications: '',
      allergies: '',
    };

    onAddProfile(created);
    setActiveProfileTab(created.id);
    setShowAddMemberModal(false);
    setNewName('');
    setConsentAcknowledged(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-teal-900 via-teal-950 to-slate-900 text-white shadow-xl border border-teal-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shadow-inner">
              <Users className="w-7 h-7 text-teal-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-400/20 text-teal-300 text-[11px] font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3 h-3 text-teal-300" />
                <span>Authorized Family Care</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                {isUrdu ? 'خاندانی نگہداشت اور بچوں کی حفاظتی ویکسینیشن' : 'Family Care & Child Immunization'}
              </h2>
              <p className="text-xs text-teal-200/80 mt-1 max-w-xl">
                {isUrdu
                  ? 'خاندان کے ہر فرد کی الگ نجی فائل، قومی حفاظتی ٹیکہ جات کا شیڈول (EPI پاکستان) اور بچوں کی نشوونما۔'
                  : 'Manage separate health files for parents & children, with Pakistan National EPI vaccination schedules.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddMemberModal(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer self-end sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{isUrdu ? 'نیا فیملی ممبر شامل کریں' : 'Add Family Member'}</span>
          </button>
        </div>
      </div>

      {/* Strict Access Controls & Consent Notice */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-start gap-2.5">
        <Lock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
            {isUrdu ? 'سخت رازداری اور جداگانہ ریکارڈز:' : 'Strict Record Isolation & Consent:'}
          </span>
          {isUrdu
            ? 'خاندان کے ہر فرد کی میڈیکل فائل مکمل طور پر الگ رکھی جاتی ہے۔ کسی بالغ فرد کا ریکارڈ دوسرے فرد کو بغیر واضح اجازت کے ظاہر نہیں کیا جاتا۔'
            : 'Each family member profile maintains isolated medical files. Adults maintain autonomous privacy; dependents require parental/guardian authorization.'}
        </div>
      </div>

      {/* Family Member Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {patientProfiles.map((prof) => (
          <button
            key={prof.id}
            type="button"
            onClick={() => setActiveProfileTab(prof.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeProfileTab === prof.id
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{prof.name} ({prof.relation})</span>
          </button>
        ))}
      </div>

      {/* Active Member Details Card */}
      {activeProfile && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left rtl:text-right">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-black text-lg flex items-center justify-center">
              {activeProfile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {activeProfile.name}
              </h3>
              <div className="text-xs text-slate-400 font-semibold mt-0.5">
                {activeProfile.relation} • {activeProfile.exactAge ? `${activeProfile.exactAge} Yrs` : activeProfile.ageGroup} • {activeProfile.gender}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            {isUrdu ? 'میڈیکل فائل: فعال' : 'Medical File: Active & Isolated'}
          </div>
        </div>
      )}

      {/* Child Vaccination Schedule (National EPI Pakistan) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-left rtl:text-right">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Syringe className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
              {isUrdu ? 'بچوں کے حفاظتی ٹیکہ جات کا قومی شیڈول (EPI پاکستان)' : 'Pakistan National EPI Immunization Schedule'}
            </h3>
          </div>
          <span className="text-xs text-emerald-600 font-bold">
            {vaccines.filter((v) => v.status === 'completed').length} / {vaccines.length} Done
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          {isUrdu
            ? 'وفاقی وزارتِ صحت پاکستان کے زیرِ انتظام حفاظتی ٹیکوں کا سرکاری چارٹ۔ ٹیکہ لگوانے کے بعد کلک کر کے مکمل مارک کریں۔'
            : 'Official schedule approved by the Federal Ministry of National Health Services Pakistan. Click to check off doses administered.'}
        </p>

        <div className="space-y-3">
          {vaccines.map((v) => {
            const isCompleted = v.status === 'completed';
            return (
              <div
                key={v.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isCompleted
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {v.vaccineName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      {v.recommendedAge}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Target: {v.diseaseTarget}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleVaccine(v.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-teal-500'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isCompleted ? (isUrdu ? 'لگ چکا ہے' : 'Administered') : (isUrdu ? 'مارک کریں' : 'Mark Done')}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Family Member Modal */}
      <AnimatePresence>
        {showAddMemberModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 text-left rtl:text-right space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {isUrdu ? 'نیا فیملی ممبر شامل کریں' : 'Add Family Profile'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  &times;
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateFamilyMember} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isUrdu ? 'نام (Full Name)' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Ibrahim, Fatima"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isUrdu ? 'رشتہ (Relationship)' : 'Relationship'} *
                    </label>
                    <select
                      value={newRelation}
                      onChange={(e) => setNewRelation(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-hidden cursor-pointer"
                    >
                      <option value="Child">Child (بیٹا / بیٹی)</option>
                      <option value="Parent">Parent (والد / والدہ)</option>
                      <option value="Spouse">Spouse (شوہر / اہلیہ)</option>
                      <option value="Other">Other Family Member</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isUrdu ? 'عمر (Age in Years)' : 'Age (Years)'} *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={newAge}
                      onChange={(e) => setNewAge(parseInt(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isUrdu ? 'جنس (Gender)' : 'Gender'}
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-hidden cursor-pointer"
                  >
                    <option value="male">Male (مرد / لڑکا)</option>
                    <option value="female">Female (خاتون / لڑکی)</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="consent-box"
                    checked={consentAcknowledged}
                    onChange={(e) => setConsentAcknowledged(e.target.checked)}
                    className="mt-0.5"
                  />
                  <label htmlFor="consent-box" className="cursor-pointer">
                    {isUrdu
                      ? 'میں تصدیق کرتا/کرتی ہوں کہ میں اس فرد کا قانونی سرپرست ہوں یا ان کی واضح اجازت سے پروفائل بنا رہا/رہی ہوں۔'
                      : 'I certify that I am the legal guardian or authorized representative for this family profile.'}
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMemberModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    {isUrdu ? 'پروفائل محفوظ کریں' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
