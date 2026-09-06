import React, { useState, useRef } from 'react';
import { SupportedLanguage, PatientProfile, MedicineCheckResult } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { voiceManager, createSpeechRecognizer } from '../services/voice';
import { AudioPlayerControls } from './AudioPlayerControls';
import { ClinicalOutputCard } from './ClinicalOutputCard';
import {
  Pill,
  Camera,
  Search,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  ShieldCheck,
  Mic,
  MicOff,
  ShoppingBag,
  UserCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface MedicineCheckerProps {
  currentLanguage: SupportedLanguage;
  patientProfiles: PatientProfile[];
  onNavigateToCare: (filter: 'pharmacy' | 'doctor') => void;
}

export const MedicineChecker: React.FC<MedicineCheckerProps> = ({
  currentLanguage,
  patientProfiles,
  onNavigateToCare,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const [mode, setMode] = useState<'check' | 'reverse' | 'photo'>('check');
  const [medicineName, setMedicineName] = useState('');
  const [condition, setCondition] = useState('');
  const [ageGroup, setAgeGroup] = useState<string>('Adult (18-60 yrs)');
  const [exactAge, setExactAge] = useState<string>('35');
  const [allergies, setAllergies] = useState<string>('None');

  // Photo state
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Result state
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MedicineCheckResult | null>(null);

  // Speech Recognition
  const [isRecording, setIsRecording] = useState(false);
  const [recordingField, setRecordingField] = useState<'name' | 'condition' | null>(null);
  const speechRecognizer = useRef(createSpeechRecognizer());

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startVoiceInput = (field: 'name' | 'condition') => {
    if (isRecording) {
      speechRecognizer.current.stop();
      setIsRecording(false);
      setRecordingField(null);
      return;
    }

    setRecordingField(field);
    setIsRecording(true);
    speechRecognizer.current.start(
      currentLanguage,
      (text) => {
        if (field === 'name') setMedicineName(text);
        else setCondition(text);
      },
      () => {
        setIsRecording(false);
        setRecordingField(null);
      },
      () => {
        setIsRecording(false);
        setRecordingField(null);
      }
    );
  };

  const handleVerifyMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineName && !condition && !photoBase64) return;

    setIsLoading(true);
    voiceManager.stop();

    try {
      const res = await fetch('/api/medicine-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineName,
          condition,
          mode,
          ageGroup,
          exactAge,
          patientAllergies: allergies,
          language: currentLanguage, // Strict regional language mandate!
          photoBase64,
        }),
      });

      const data = await res.json();
      const explanationText =
        data.text || data.fallbackText || 'Please consult a pharmacist or PMDC doctor.';

      const checkResult: MedicineCheckResult = {
        id: `med-${Date.now()}`,
        medicineName: medicineName || 'Image Scanned Medicine',
        mode,
        condition,
        ageGroup,
        safetyStatus: data.safetyStatus || 'CAUTION',
        explanation: explanationText,
        timestamp: new Date().toLocaleDateString(),
        photoUrl: photoBase64 || undefined,
      };

      setResult(checkResult);
    } catch (err) {
      console.error(err);
      setResult({
        id: `med-err-${Date.now()}`,
        medicineName: medicineName || 'Medicine',
        mode,
        ageGroup,
        safetyStatus: 'CAUTION',
        explanation:
          'Could not complete online verification. Please take this medicine to a licensed pharmacy or doctor for advice.',
        timestamp: new Date().toLocaleDateString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/80 border border-teal-600 text-teal-200 text-xs font-bold mb-2">
              <Pill className="w-4 h-4" />
              <span>Age-Calibrated Medicine Safety</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Medicine Verification & Reverse Lookup
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 mt-1 max-w-xl">
              Prevent pediatric poisoning, check elderly fall risks, or scan medicine boxes by camera. Fully voice-enabled in 7 Pakistani languages.
            </p>
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setMode('check')}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] flex items-center justify-center gap-1.5 ${
            mode === 'check'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Search className="w-4 h-4" />
          <span className="truncate">{t.checkMedicine}</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('reverse')}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] flex items-center justify-center gap-1.5 ${
            mode === 'reverse'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span className="truncate">{t.reverseLookup}</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('photo')}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] flex items-center justify-center gap-1.5 ${
            mode === 'photo'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span className="truncate">{t.photoMedicine}</span>
        </button>
      </div>

      {/* Verification Form Card */}
      <form
        onSubmit={handleVerifyMedicine}
        className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5"
      >
        {/* Mode 1: Check a specific medicine */}
        {mode === 'check' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Medicine Name (e.g. Panadol, Augmentin, Brufen, Flagyl, Disprin)
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  placeholder="Type or speak medicine brand or generic..."
                  className="w-full px-4 py-3 pr-12 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 min-h-[48px]"
                />
                <button
                  type="button"
                  onClick={() => startVoiceInput('name')}
                  className={`absolute right-2 p-2.5 rounded-xl transition-colors ${
                    isRecording && recordingField === 'name'
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'text-slate-400 hover:text-teal-600'
                  }`}
                  title="Speak medicine name"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Condition or reason taking it (e.g. Headache, Fever, Cough, Stomach ache)
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  placeholder="Why are you planning to take this?"
                  className="w-full px-4 py-3 pr-12 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 min-h-[48px]"
                />
                <button
                  type="button"
                  onClick={() => startVoiceInput('condition')}
                  className={`absolute right-2 p-2.5 rounded-xl transition-colors ${
                    isRecording && recordingField === 'condition'
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'text-slate-400 hover:text-teal-600'
                  }`}
                  title="Speak condition"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mode 2: Reverse lookup */}
        {mode === 'reverse' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Describe Illness / Symptoms (e.g., severe acidity with chest burn, throat infection with pus)
              </label>
              <div className="relative flex items-center">
                <textarea
                  rows={3}
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  placeholder="Explain the symptom to see standard medical classes and precautions..."
                  className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => startVoiceInput('condition')}
                  className={`absolute bottom-3 right-3 p-2.5 rounded-xl transition-colors ${
                    isRecording
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'text-slate-400 hover:text-teal-600 bg-white dark:bg-slate-700 shadow-xs'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mode 3: Photo of medicine strip/box */}
        {mode === 'photo' && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-teal-300 dark:border-teal-800 rounded-3xl p-6 sm:p-8 text-center cursor-pointer hover:bg-teal-50/50 dark:hover:bg-slate-800 transition-colors"
            >
              {photoBase64 ? (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={photoBase64}
                    alt="Medicine Scan"
                    className="w-40 h-40 object-cover rounded-2xl shadow-md border border-teal-500"
                  />
                  <p className="text-xs font-bold text-teal-700 dark:text-teal-300">
                    Photo uploaded. Tap to change photo.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Camera className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Scan Medicine Strip, Bottle, or Box
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Take a clear photo showing the medicine title, dosage (mg/ml), or packaging.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Age & Profile Safety Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Age Group Calibration
            </label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100"
            >
              <option value="Infant (0-2 yrs)">Infant (0-2 yrs) — High Danger Alert</option>
              <option value="Child (2-12 yrs)">Child (2-12 yrs) — Pediatric Dosing</option>
              <option value="Teenager (13-18 yrs)">Teenager (13-18 yrs)</option>
              <option value="Adult (18-60 yrs)">Adult (18-60 yrs)</option>
              <option value="Elderly (60+ yrs)">Elderly (60+ yrs) — Kidney/Fall Risk</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Exact Age (Years)
            </label>
            <input
              type="number"
              value={exactAge}
              onChange={(e) => setExactAge(e.target.value)}
              placeholder="e.g. 5"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Known Drug Allergies
            </label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g. Penicillin, Sulfa, Aspirin"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Submit Verification Button */}
        <button
          type="submit"
          disabled={isLoading || (!medicineName && !condition && !photoBase64)}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-base shadow-md shadow-teal-600/20 transition-all min-h-[48px]"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>Checking Pharmacology Safety Database...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              <span>Verify Medicine Safety & Dosage</span>
            </>
          )}
        </button>
      </form>

      {/* Result Card */}
      {result && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <ClinicalOutputCard
            content={result.explanation}
            safetyStatus={result.safetyStatus}
            feature="medicine"
            medicineName={result.medicineName}
            patientAgeGroup={result.ageGroup}
            currentLanguage={currentLanguage}
            onNavigateToCare={onNavigateToCare}
          />

          {/* Quick Actions: Find Pharmacy & Find Doctor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigateToCare('pharmacy')}
              className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900 font-bold text-xs sm:text-sm transition-all shadow-xs"
            >
              <ShoppingBag className="w-4 h-4 text-teal-600" />
              <span>Where to Buy (Verified 24/7 Pharmacies)</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToCare('doctor')}
              className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs sm:text-sm transition-all shadow-xs"
            >
              <UserCheck className="w-4 h-4 text-teal-600" />
              <span>Which Doctor Prescribes This?</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
