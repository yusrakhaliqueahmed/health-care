import React, { useState, useEffect, useMemo } from 'react';
import {
  UnifiedHealthRecord,
  SupportedLanguage,
  PatientProfile,
  RecordCategory,
  Prescription,
  MedicalReportRecord,
  UserAccount,
} from '../types';
import { TRANSLATIONS, LANGUAGES } from '../services/i18n';
import { voiceManager } from '../services/voice';
import { DiagnosticLabReportModal } from './DiagnosticLabReportModal';
import {
  FileText,
  Activity,
  Pill,
  Stethoscope,
  FileCheck,
  Video,
  User,
  Users,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Printer,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Copy,
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  LayoutGrid,
  List,
  HeartPulse,
  ChevronRight,
  Sparkles,
  QrCode,
  Check,
  X,
  TrendingUp,
} from 'lucide-react';

interface HealthRecordsProps {
  currentLanguage: SupportedLanguage;
  patientProfiles: PatientProfile[];
  prescriptions?: Prescription[];
  reports?: MedicalReportRecord[];
  onAddProfile: (profile: PatientProfile) => void;
  currentUser?: UserAccount;
  onNavigateToTab?: (tab: string) => void;
}

export const HealthRecords: React.FC<HealthRecordsProps> = ({
  currentLanguage,
  patientProfiles,
  onAddProfile,
  currentUser,
  onNavigateToTab,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';
  const userKey = (currentUser?.email || currentUser?.id || 'default').toLowerCase().trim();

  // Local state for records and persistence
  const [records, setRecords] = useState<UnifiedHealthRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecordForModal, setSelectedRecordForModal] = useState<UnifiedHealthRecord | null>(null);

  // Filter & Search states
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('all');
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'urgency' | 'status'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Add Family Member Modal
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState('Child');
  const [newMemberAge, setNewMemberAge] = useState<number>(10);
  const [newMemberGender, setNewMemberGender] = useState<'male' | 'female' | 'other'>('male');
  const [newMemberBloodGroup, setNewMemberBloodGroup] = useState('B+');

  // Copy toast & delete confirm toast
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Audio / Read Aloud state
  const [activeReadingRecordId, setActiveReadingRecordId] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPausedAudio, setIsPausedAudio] = useState(false);
  const [ttsSpeed, setTtsSpeed] = useState(1.0);

  // Vitals State
  const [vitals, setVitals] = useState({
    bloodSugar: '105 mg/dL',
    bloodPressure: '120/80 mmHg',
    heartRate: '72 bpm',
    weight: '68 kg',
    recordedAt: 'Today',
  });
  const [isEditingVitals, setIsEditingVitals] = useState(false);
  const [tempVitals, setTempVitals] = useState(vitals);

  // 1. Fetch persistent user data from backend on mount or userKey change
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    async function loadUserData() {
      try {
        const res = await fetch(`/api/user-data/${encodeURIComponent(userKey)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (Array.isArray(data.records) && data.records.length > 0) {
              setRecords(data.records);
            }
            if (data.vitals) {
              setVitals(data.vitals);
              setTempVitals(data.vitals);
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch server-side user data, checking local storage:', err);
        try {
          const local = localStorage.getItem(`sehat_records_${userKey}`);
          if (local && isMounted) {
            setRecords(JSON.parse(local));
          }
        } catch {}
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [userKey]);

  // Voice subscription
  useEffect(() => {
    const unsubscribe = voiceManager.subscribe((state) => {
      setIsPlayingAudio(state.isPlaying);
      setIsPausedAudio(state.isPaused);
      setTtsSpeed(state.speed);
      if (!state.isPlaying) {
        setActiveReadingRecordId(null);
      }
    });
    return () => {
      unsubscribe();
      voiceManager.stop();
    };
  }, []);

  // Save changes to backend and localStorage
  const persistRecords = async (updatedRecords: UnifiedHealthRecord[]) => {
    setRecords(updatedRecords);
    try {
      localStorage.setItem(`sehat_records_${userKey}`, JSON.stringify(updatedRecords));
      await fetch(`/api/user-data/${encodeURIComponent(userKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: updatedRecords, vitals }),
      });
    } catch (e) {
      console.error('Persistence error:', e);
    }
  };

  const handleUpdateRecord = async (updated: UnifiedHealthRecord) => {
    const nextRecords = records.map((r) => (r.id === updated.id ? updated : r));
    await persistRecords(nextRecords);
    setSelectedRecordForModal(updated);
    showNotice('Record updated and saved to database.');
  };

  const handleDeleteRecord = async (recordId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this diagnostic record?')) {
      return;
    }
    const nextRecords = records.filter((r) => r.id !== recordId);
    await persistRecords(nextRecords);
    try {
      await fetch(`/api/records/${encodeURIComponent(userKey)}/${recordId}`, {
        method: 'DELETE',
      });
    } catch {}
    if (activeReadingRecordId === recordId) {
      voiceManager.stop();
    }
    showNotice('Record deleted from permanent records.');
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Read Aloud a single card
  const handleReadCardAloud = (rec: UnifiedHealthRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (activeReadingRecordId === rec.id && isPlayingAudio && !isPausedAudio) {
      voiceManager.pause();
      return;
    }

    if (activeReadingRecordId === rec.id && isPausedAudio) {
      voiceManager.resume();
      return;
    }

    setActiveReadingRecordId(rec.id);
    const keyFindings = (rec.testResults || [])
      .slice(0, 4)
      .map((t) => `${t.testName}: ${t.result}`)
      .join(', ');

    let speechText = '';
    if (currentLanguage === 'roman') {
      speechText = `SehatSaathi Pro Record: ${rec.title}. Tareekh: ${rec.date}. Mareez: ${rec.patientName}. Haalat: ${
        rec.status === 'doctor_approved' ? 'Doctor se tasdeeq shuda' : 'AI preliminary review'
      }. Khas nateeja: ${keyFindings}. Tibbi wazahat: ${rec.clinicalNotes || 'Sab theek hai'}.`;
    } else if (currentLanguage === 'ur') {
      speechText = `صحت ساتھی پرو میڈیکل ریکارڈ: ${rec.title}۔ تاریخ: ${rec.date}۔ مریض: ${rec.patientName}۔ نتائج: ${keyFindings}۔ طبی رائے: ${
        rec.clinicalNotes || 'تمام ٹیسٹ محفوظ حدود میں ہیں'
      }۔`;
    } else {
      speechText = `SehatSaathi Pro Record: ${rec.title}. Date: ${rec.date}. Patient: ${rec.patientName}. Status: ${
        rec.status === 'doctor_approved' ? 'Doctor Verified' : 'AI Preliminary'
      }. Key Findings: ${keyFindings}. Clinical Summary: ${rec.clinicalNotes || 'Normal parameters'}.`;
    }

    voiceManager.speak(speechText, currentLanguage);
  };

  const handleCopyCard = (rec: UnifiedHealthRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const text = `SehatSaathi Pro Record: ${rec.title}\nRef No: ${rec.referenceNumber || rec.id}\nPatient: ${
      rec.patientName
    } (${rec.patientAge})\nDate: ${rec.date}\nStatus: ${rec.status}\nFindings:\n${(rec.testResults || [])
      .map((t) => ` - ${t.testName}: ${t.result} [Ref: ${t.referenceRange || 'N/A'}]`)
      .join('\n')}\nNotes: ${rec.clinicalNotes || 'N/A'}`;
    navigator.clipboard.writeText(text);
    showNotice('Clinical record copied to clipboard.');
  };

  // Add Family Member
  const handleSaveFamilyMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const newProfile: PatientProfile = {
      id: `prof-fam-${Date.now()}`,
      name: newMemberName.trim(),
      relation: newMemberRelation,
      ageGroup: newMemberAge < 13 ? 'child' : newMemberAge > 60 ? 'elderly' : 'adult',
      exactAge: newMemberAge,
      gender: newMemberGender,
      bloodGroup: newMemberBloodGroup,
      conditions: '',
      medications: '',
      allergies: '',
    };

    onAddProfile(newProfile);
    setShowAddMemberModal(false);
    setNewMemberName('');
    showNotice(`Added ${newProfile.name} to family members.`);
  };

  // Save Vitals
  const handleSaveVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...tempVitals,
      recordedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    setVitals(updated);
    setIsEditingVitals(false);
    try {
      await fetch(`/api/user-data/${encodeURIComponent(userKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records, vitals: updated }),
      });
    } catch {}
    showNotice('Health vitals saved.');
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: records.length,
      search_history: 0,
      symptom: 0,
      medicine: 0,
      lab_report: 0,
      prescription: 0,
      consultation: 0,
    };
    records.forEach((r) => {
      const isSearch =
        r.category === 'search_history' ||
        r.id.startsWith('rec-srch-') ||
        (r.title && r.title.toLowerCase().includes('inquiry')) ||
        (r.title && r.title.toLowerCase().includes('search')) ||
        (r.title && r.title.toLowerCase().includes('تلاش'));

      if (isSearch) {
        counts.search_history++;
      }

      const cat = (r.category as string) === 'symptom_triage' ? 'symptom' : r.category;
      if (counts[cat] !== undefined) {
        counts[cat]++;
      }
    });
    return counts;
  }, [records]);

  // Filter and sort records
  const filteredRecords = useMemo(() => {
    let list = [...records];

    // Category filter
    if (activeCategoryTab !== 'all') {
      list = list.filter((r) => {
        if (activeCategoryTab === 'search_history') {
          return (
            r.category === 'search_history' ||
            r.id.startsWith('rec-srch-') ||
            (r.title && r.title.toLowerCase().includes('inquiry')) ||
            (r.title && r.title.toLowerCase().includes('search')) ||
            (r.title && r.title.toLowerCase().includes('تلاش'))
          );
        }
        if (activeCategoryTab === 'symptom') {
          return r.category === 'symptom' || (r.category as string) === 'symptom_triage';
        }
        return r.category === activeCategoryTab;
      });
    }

    // Family member filter
    if (selectedFamilyMemberId !== 'all') {
      list = list.filter((r) => r.patientProfileId === selectedFamilyMemberId || r.patientName.includes(selectedFamilyMemberId));
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) => {
        const titleMatch = r.title.toLowerCase().includes(q);
        const refMatch = (r.referenceNumber || r.id).toLowerCase().includes(q);
        const nameMatch = r.patientName.toLowerCase().includes(q);
        const notesMatch = (r.clinicalNotes || '').toLowerCase().includes(q);
        const testMatch = (r.testResults || []).some(
          (t) => t.testName.toLowerCase().includes(q) || t.result.toLowerCase().includes(q)
        );
        return titleMatch || refMatch || nameMatch || notesMatch || testMatch;
      });
    }

    // Sorting
    list.sort((a, b) => {
      if (sortOption === 'newest') return b.id.localeCompare(a.id);
      if (sortOption === 'oldest') return a.id.localeCompare(b.id);
      if (sortOption === 'urgency') {
        const urgencyWeight = { RED: 3, YELLOW: 2, GREEN: 1 };
        return (urgencyWeight[b.urgency || 'GREEN'] || 0) - (urgencyWeight[a.urgency || 'GREEN'] || 0);
      }
      if (sortOption === 'status') {
        return (b.status === 'doctor_approved' ? 1 : 0) - (a.status === 'doctor_approved' ? 1 : 0);
      }
      return 0;
    });

    return list;
  }, [records, activeCategoryTab, selectedFamilyMemberId, searchQuery, sortOption]);

  const getCategoryIcon = (category: RecordCategory) => {
    switch (category) {
      case 'search_history':
        return <Search className="w-5 h-5 text-indigo-600" />;
      case 'medicine':
        return <Pill className="w-5 h-5 text-emerald-600" />;
      case 'symptom':
        return <Stethoscope className="w-5 h-5 text-blue-600" />;
      case 'prescription':
        return <FileCheck className="w-5 h-5 text-purple-600" />;
      case 'consultation':
        return <Video className="w-5 h-5 text-amber-600" />;
      case 'lab_report':
      default:
        return <Activity className="w-5 h-5 text-teal-600" />;
    }
  };

  const getCategoryBadgeClass = (category: RecordCategory) => {
    switch (category) {
      case 'search_history':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'medicine':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'symptom':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'prescription':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'consultation':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'lab_report':
      default:
        return 'bg-teal-50 text-teal-700 border-teal-200';
    }
  };

  return (
    <div id="health-records-container" className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center space-x-2 animate-fade-in border border-teal-500/40">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Top Header Card with User & Sync Status */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {t.navRecords || 'My Health Records & Lab Reports'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Standard Diagnostic Lab Format • Permanently Persisted & Doctor Verified
              </p>
            </div>
          </div>
        </div>

        {/* Sync & Account Status */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-medium">
              Google ID: <strong className="text-slate-900 font-mono">{currentUser?.email || currentUser?.name || 'Local Session'}</strong>
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
              {currentUser?.email ? 'Synced Across Logout / Login' : 'Persistent Storage Active'}
            </span>
          </div>

          <button
            id="add-family-member-header-btn"
            onClick={() => setShowAddMemberModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Family Member</span>
          </button>
        </div>
      </div>

      {/* Quick Vitals Summary Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-teal-800/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <HeartPulse className="w-4 h-4 text-teal-400" />
            <h3 className="font-bold text-sm tracking-wide text-teal-100">
              {t.patientHealthVitals || 'Patient Health Vitals Tracker'}
            </h3>
            <span className="text-[10px] bg-teal-800/80 text-teal-200 px-2 py-0.5 rounded-full font-mono">
              Last updated: {vitals.recordedAt || 'Recent'}
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Track resting heart rate, blood pressure, and capillary glucose.
          </p>
        </div>

        {/* 4 Stat Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-auto">
          <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl px-3 py-2 text-center">
            <div className="text-[10px] text-teal-200 uppercase font-semibold">Blood Pressure</div>
            <div className="text-sm sm:text-base font-bold text-white font-mono">{vitals.bloodPressure || '120/80'}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl px-3 py-2 text-center">
            <div className="text-[10px] text-teal-200 uppercase font-semibold">Heart Rate</div>
            <div className="text-sm sm:text-base font-bold text-white font-mono">{vitals.heartRate || '72 bpm'}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl px-3 py-2 text-center">
            <div className="text-[10px] text-teal-200 uppercase font-semibold">Blood Sugar</div>
            <div className="text-sm sm:text-base font-bold text-white font-mono">{vitals.bloodSugar || '105 mg/dL'}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl px-3 py-2 text-center">
            <div className="text-[10px] text-teal-200 uppercase font-semibold">Body Weight</div>
            <div className="text-sm sm:text-base font-bold text-white font-mono">{vitals.weight || '68 kg'}</div>
          </div>
        </div>

        <button
          onClick={() => setIsEditingVitals(!isEditingVitals)}
          className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-900 rounded-xl text-xs font-bold transition-colors shrink-0"
        >
          {isEditingVitals ? 'Done' : 'Update Vitals'}
        </button>
      </div>

      {/* Inline Vitals Edit Form */}
      {isEditingVitals && (
        <form
          onSubmit={handleSaveVitals}
          className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs"
        >
          <div>
            <label className="block font-bold text-slate-700 mb-1">Blood Pressure (mmHg)</label>
            <input
              type="text"
              value={tempVitals.bloodPressure}
              onChange={(e) => setTempVitals({ ...tempVitals, bloodPressure: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-mono"
              placeholder="e.g. 120/80"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Heart Rate (bpm)</label>
            <input
              type="text"
              value={tempVitals.heartRate}
              onChange={(e) => setTempVitals({ ...tempVitals, heartRate: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-mono"
              placeholder="e.g. 72 bpm"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Blood Sugar (mg/dL)</label>
            <input
              type="text"
              value={tempVitals.bloodSugar}
              onChange={(e) => setTempVitals({ ...tempVitals, bloodSugar: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-mono"
              placeholder="e.g. 110 mg/dL"
            />
          </div>
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <label className="block font-bold text-slate-700 mb-1">Weight (kg)</label>
              <input
                type="text"
                value={tempVitals.weight}
                onChange={(e) => setTempVitals({ ...tempVitals, weight: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-mono"
                placeholder="e.g. 70 kg"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      )}

      {/* Categorized Tabs Bar */}
      <div className="flex items-center space-x-1 sm:space-x-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs sm:text-sm">
        {[
          { id: 'all', label: isUrdu ? 'تمام ریکارڈز' : isRoman ? 'Tamam Records' : 'All Records', count: categoryCounts.all },
          { id: 'search_history', label: isUrdu ? 'تلاش و استفسار ہسٹری' : isRoman ? 'Searches & Inquiries' : 'Searches & Inquiries', count: categoryCounts.search_history },
          { id: 'symptom', label: isUrdu ? 'علامات کی جانچ' : isRoman ? 'Symptom Checks' : 'Symptom Checks', count: categoryCounts.symptom },
          { id: 'medicine', label: isUrdu ? 'دواؤں کی تصدیق' : isRoman ? 'Medicine Checks' : 'Medicine Checks', count: categoryCounts.medicine },
          { id: 'lab_report', label: isUrdu ? 'لیب رپورٹس اور ایکسرے' : isRoman ? 'Lab Reports' : 'Lab Reports & X-Rays', count: categoryCounts.lab_report },
          { id: 'prescription', label: isUrdu ? 'ڈاکٹر نسخہ جات' : isRoman ? 'Prescriptions' : 'Prescriptions', count: categoryCounts.prescription },
          { id: 'consultation', label: isUrdu ? 'طبی مشورے' : isRoman ? 'Consultations' : 'Consultations', count: categoryCounts.consultation },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategoryTab(tab.id)}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2.5 rounded-t-xl font-bold whitespace-nowrap transition-all border-b-2 ${
              activeCategoryTab === tab.id
                ? 'border-teal-600 text-teal-700 bg-teal-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[11px] px-2 py-0.2 rounded-full font-mono font-semibold ${
                activeCategoryTab === tab.id ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter, Search & View Controls Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Family Member Filter Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-bold whitespace-nowrap">Family Member:</span>
          <select
            id="records-family-member-select"
            value={selectedFamilyMemberId}
            onChange={(e) => setSelectedFamilyMemberId(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Family Members ({patientProfiles.length})</option>
            {patientProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.relation || 'Member'} • {p.exactAge || 30}y)
              </option>
            ))}
          </select>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records by test, medicine, symptom, doctor, or ID..."
            className="w-full pl-9 pr-8 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort & View Switcher */}
        <div className="flex items-center space-x-2 justify-between md:justify-end">
          <div className="flex items-center space-x-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="border border-slate-300 rounded-lg px-2 py-1.5 font-medium text-slate-700 bg-slate-50 focus:outline-hidden"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="urgency">Highest Urgency</option>
              <option value="status">Doctor Verified First</option>
            </select>
          </div>

          <div className="flex items-center border border-slate-300 rounded-lg p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-2xs text-teal-700' : 'text-slate-400'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-2xs text-teal-700' : 'text-slate-400'}`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RECORDS LISTING / EMPTY STATE */}
      {/* ========================================================================= */}
      {filteredRecords.length === 0 ? (
        /* Clean Friendly Empty State */
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4 border border-teal-200">
            <FileText className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Medical Records Found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
            {searchQuery
              ? `No records matching "${searchQuery}". Try clearing your search or switching categories.`
              : 'You have not saved any diagnostic checks in this category yet. Run a check to generate an official laboratory-style report.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Clear Search Filter
              </button>
            )}
            {onNavigateToTab && (
              <>
                <button
                  onClick={() => onNavigateToTab('symptoms')}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  + Run Symptom Triage
                </button>
                <button
                  onClick={() => onNavigateToTab('medicine')}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  + Check Medicine Safety
                </button>
                <button
                  onClick={() => onNavigateToTab('reports')}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  + Analyze Lab Report / X-Ray
                </button>
              </>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View of Record Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredRecords.map((rec) => {
            const isReadingThis = activeReadingRecordId === rec.id && isPlayingAudio;
            return (
              <div
                key={rec.id}
                onClick={() => setSelectedRecordForModal(rec)}
                className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-teal-500 shadow-2xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between text-left cursor-pointer overflow-hidden"
              >
                {/* Card Top Strip */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 group-hover:scale-105 transition-transform">
                        {getCategoryIcon(rec.category)}
                      </div>
                      <div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wide ${getCategoryBadgeClass(
                            rec.category
                          )}`}
                        >
                          {rec.category.replace('_', ' ')}
                        </span>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                          {rec.referenceNumber || rec.id}
                        </div>
                      </div>
                    </div>

                    {/* Status & Urgency Badges */}
                    <div className="flex flex-col items-end space-y-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center space-x-1 ${
                          rec.status === 'doctor_approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rec.status === 'doctor_approved' ? (
                          <>
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Doctor Verified</span>
                          </>
                        ) : (
                          <span>AI Triage</span>
                        )}
                      </span>

                      {rec.urgency && rec.urgency !== 'GREEN' && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-xs uppercase ${
                            rec.urgency === 'RED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          Urgency: {rec.urgency}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Patient info */}
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-teal-700 transition-colors line-clamp-1 mb-1">
                    {rec.title}
                  </h3>

                  <div className="flex items-center space-x-3 text-xs text-slate-500 mb-3 font-medium">
                    <span className="flex items-center space-x-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{rec.patientName}</span>
                      <span className="text-[10px] text-slate-400">({rec.patientAge})</span>
                    </span>
                    <span className="flex items-center space-x-1 font-mono text-[11px]">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{rec.date}</span>
                    </span>
                  </div>

                  {/* Key Parameter Preview (Mini 2-row table) */}
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 mb-4 space-y-1 text-xs">
                    {(rec.testResults || []).slice(0, 3).map((tItem, tIdx) => (
                      <div key={tIdx} className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-600 truncate max-w-[140px]">{tItem.testName}</span>
                        <span
                          className={`font-mono font-semibold ${
                            tItem.isAbnormal ? 'text-red-600 font-bold' : 'text-slate-900'
                          }`}
                        >
                          {tItem.result}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Clinical snippet */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {rec.clinicalNotes || 'No specific clinical notes attached.'}
                  </p>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-700 group-hover:underline flex items-center space-x-1">
                    <span>View Official Report</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>

                  <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                    {/* Read Aloud Button */}
                    <button
                      onClick={(e) => handleReadCardAloud(rec, e)}
                      className={`p-1.5 rounded-lg text-xs transition-colors flex items-center space-x-1 ${
                        isReadingThis
                          ? 'bg-amber-500 text-white animate-pulse'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                      title="Read Record Aloud"
                    >
                      {isReadingThis && !isPausedAudio ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Copy Button */}
                    <button
                      onClick={(e) => handleCopyCard(rec, e)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Copy Summary"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDeleteRecord(rec.id, e)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View of Records */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Ref / Category</th>
                <th className="py-3 px-4">Title & Patient</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((rec) => (
                <tr
                  key={rec.id}
                  onClick={() => setSelectedRecordForModal(rec)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-slate-900">{rec.referenceNumber || rec.id}</div>
                    <span
                      className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${getCategoryBadgeClass(
                        rec.category
                      )}`}
                    >
                      {rec.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 hover:text-teal-700">{rec.title}</div>
                    <div className="text-xs text-slate-500">
                      {rec.patientName} • {rec.patientAge}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600">{rec.date}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        rec.status === 'doctor_approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rec.status === 'doctor_approved' ? 'Doctor Verified' : 'AI Triage'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center space-x-1.5 justify-end">
                      <button
                        onClick={() => setSelectedRecordForModal(rec)}
                        className="px-2.5 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-md font-medium text-xs flex items-center space-x-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Report</span>
                      </button>
                      <button
                        onClick={(e) => handleReadCardAloud(rec, e)}
                        className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
                        title="Read Aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteRecord(rec.id, e)}
                        className="p-1 rounded-md bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DIAGNOSTIC LAB REPORT MODAL (Exact Standard Lab Style) */}
      {/* ========================================================================= */}
      {selectedRecordForModal && (
        <DiagnosticLabReportModal
          record={selectedRecordForModal}
          isOpen={!!selectedRecordForModal}
          onClose={() => setSelectedRecordForModal(null)}
          onUpdateRecord={handleUpdateRecord}
          currentLanguage={currentLanguage}
        />
      )}

      {/* ========================================================================= */}
      {/* ADD FAMILY MEMBER MODAL */}
      {/* ========================================================================= */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <Users className="w-5 h-5 text-teal-600" />
                <span>Add Family Member</span>
              </h3>
              <button onClick={() => setShowAddMemberModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFamilyMember} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Zainab (Daughter) or Father"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Relationship</label>
                  <select
                    value={newMemberRelation}
                    onChange={(e) => setNewMemberRelation(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="Child">Child (Son/Daughter)</option>
                    <option value="Parent">Parent (Mother/Father)</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="110"
                    value={newMemberAge}
                    onChange={(e) => setNewMemberAge(parseInt(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newMemberGender}
                    onChange={(e) => setNewMemberGender(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={newMemberBloodGroup}
                    onChange={(e) => setNewMemberBloodGroup(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white font-mono"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold transition-colors shadow-xs"
                >
                  Add Family Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
