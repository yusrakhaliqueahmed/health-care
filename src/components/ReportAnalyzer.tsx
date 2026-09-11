import React, { useState, useRef } from 'react';
import { SupportedLanguage, MedicalReportRecord, UrgencyLevel, UnifiedHealthRecord } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { voiceManager } from '../services/voice';
import { AudioPlayerControls } from './AudioPlayerControls';
import { ClinicalOutputCard } from './ClinicalOutputCard';
import {
  FileText,
  Camera,
  Upload,
  Video,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Download,
  BookmarkPlus,
  RefreshCw,
  Eye,
  CheckCircle2,
} from 'lucide-react';

interface ReportAnalyzerProps {
  currentLanguage: SupportedLanguage;
  onSaveToRecords: (record: MedicalReportRecord) => void;
  onSaveUnifiedRecord?: (record: UnifiedHealthRecord) => void;
  userName?: string;
}

export const ReportAnalyzer: React.FC<ReportAnalyzerProps> = ({
  currentLanguage,
  onSaveToRecords,
  onSaveUnifiedRecord,
  userName,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const [reportType, setReportType] = useState<'lab' | 'xray' | 'prescription' | 'video_scan'>('lab');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [patientNotes, setPatientNotes] = useState('');
  const [patientAgeGroup, setPatientAgeGroup] = useState('Adult (18-60 yrs)');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    text: string;
    urgency: UrgencyLevel;
    timestamp: string;
  } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // File input refs
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoBase64(reader.result as string);
        setAnalysisResult(null);
        setSavedSuccess(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSampleReport = (type: 'lab' | 'xray') => {
    setReportType(type);
    if (type === 'lab') {
      setPhotoBase64('https://images.unsplash.com/photo-1579154204601-01588f351e67?w=700&auto=format&fit=crop&q=80');
    } else {
      setPhotoBase64('https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=700&auto=format&fit=crop&q=80');
    }
    setAnalysisResult(null);
    setSavedSuccess(false);
  };

  const handleAnalyze = async () => {
    if (!photoBase64) return;

    setIsLoading(true);
    voiceManager.stop();

    try {
      const res = await fetch('/api/report-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          photoBase64,
          notes: patientNotes,
          language: currentLanguage,
          patientAge: patientAgeGroup,
        }),
      });

      const data = await res.json();
      const text = data.text || data.fallbackText || 'Report analyzed.';
      const urgency = (data.urgency as UrgencyLevel) || 'YELLOW';

      const resObj = {
        text,
        urgency,
        timestamp: new Date().toLocaleDateString(),
      };
      setAnalysisResult(resObj);

      // Automatically persist to Medical Health Records as requested by user
      const reportTitle =
        currentLanguage === 'ur'
          ? `آپ نے یہ رپورٹ چیک کروائی: ${reportType === 'lab' ? 'خون کی لیب رپورٹ' : reportType === 'xray' ? 'ایکسرے / ریڈیالوجی' : 'میڈیکل رپورٹ'}`
          : currentLanguage === 'roman'
          ? `Aap ny ye report ka pocha hai: ${reportType === 'lab' ? 'Lab Blood Report' : reportType === 'xray' ? 'X-Ray Report' : 'Medical Report'}`
          : `Report Analyzed: ${reportType === 'lab' ? 'Laboratory Blood Test' : reportType === 'xray' ? 'Radiology Imaging (X-Ray)' : 'Medical Diagnostic Report'}`;

      const legacyReport: MedicalReportRecord = {
        id: `rep-${Date.now()}`,
        title: reportTitle,
        type: reportType,
        patientName: userName || 'Patient',
        patientAge: patientAgeGroup,
        date: new Date().toISOString().split('T')[0],
        photoUrl: photoBase64 || undefined,
        findings: text,
        urgency: urgency,
        status: 'preliminary_ai',
        reviewedByDoctor: 'Pending Review by PMDC Medical Officer',
      };
      onSaveToRecords(legacyReport);

      if (onSaveUnifiedRecord) {
        const unifiedRec: UnifiedHealthRecord = {
          id: `rec-rep-${Date.now()}`,
          referenceNumber: `SS-LB-${Date.now().toString().slice(-6)}`,
          labCaseNumber: `LB-${Math.floor(10000 + Math.random() * 90000)}`,
          userId: 'default',
          patientProfileId: 'prof-self',
          patientName: userName || 'Patient',
          patientAge: patientAgeGroup || '30 Y',
          patientGender: 'male',
          category: 'lab_report',
          searchQuery: reportTitle,
          searchType: 'lab_report',
          title: reportTitle,
          panelName: reportType === 'lab' ? 'LABORATORY BLOOD INVESTIGATION' : 'DIAGNOSTIC RADIOLOGY REPORT',
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'ai_preliminary',
          urgency: urgency,
          photoUrl: photoBase64 || undefined,
          testResults: [
            {
              testName: currentLanguage === 'ur' ? 'رپورٹ کی قسم' : currentLanguage === 'roman' ? 'Report Type' : 'Report Type',
              result: reportType.toUpperCase(),
              referenceRange: 'Clinical Scan',
              isAbnormal: urgency === 'RED',
            },
            {
              testName: currentLanguage === 'ur' ? 'اہم تشخیصی نتائج' : currentLanguage === 'roman' ? 'Findings' : 'Key Findings',
              result: text.slice(0, 100) + (text.length > 100 ? '...' : ''),
              referenceRange: 'Normal Limits',
              isAbnormal: urgency !== 'GREEN',
            },
          ],
          clinicalNotes:
            currentLanguage === 'ur'
              ? `آپ نے اس میڈیکل رپورٹ کا پوچھا ہے۔ تفصیلی رپورٹ خلاصہ: ${text}`
              : currentLanguage === 'roman'
              ? `Aap ny is report ka pocha hai. Report findings: ${text}`
              : `You inquired about this report. Findings: ${text}`,
          doctorComments: 'Auto-saved to patient medical records upon diagnostic analysis.',
          reviewedByDoctor: 'SehatSaathi Clinical Diagnostics AI',
        };
        onSaveUnifiedRecord(unifiedRec);
      }
      setSavedSuccess(true);
    } catch (err) {
      console.error(err);
      setAnalysisResult({
        text: 'Could not connect to medical analysis server. Please consult your physician directly.',
        urgency: 'YELLOW',
        timestamp: new Date().toLocaleDateString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToEHR = () => {
    if (!analysisResult || !photoBase64) return;

    const newRecord: MedicalReportRecord = {
      id: `rep-${Date.now()}`,
      title: reportType === 'lab' ? 'Laboratory Blood Investigation' : 'Radiology Imaging (X-Ray)',
      type: reportType,
      patientName: 'Current User',
      patientAge: patientAgeGroup,
      date: new Date().toISOString().split('T')[0],
      photoUrl: photoBase64,
      findings: analysisResult.text,
      urgency: analysisResult.urgency,
      status: 'preliminary_ai',
      reviewedByDoctor: 'Pending Review by PMDC Medical Officer',
    };

    onSaveToRecords(newRecord);
    setSavedSuccess(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/80 border border-teal-600 text-teal-200 text-xs font-bold mb-2">
              <FileText className="w-4 h-4" />
              <span>Multimodal Vision & OCR AI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Medical Report & X-Ray Decoder
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 mt-1 max-w-xl">
              Understand test numbers, blood counts, and bone/chest X-rays in plain regional language with clear normal vs. abnormal labels.
            </p>
          </div>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 3 Upload Pathways */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 shadow-xs flex flex-col items-center text-center gap-2 transition-all min-h-[110px]"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Camera className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white">{t.takePhoto}</span>
          <span className="text-[11px] text-slate-500">Camera with frame guide</span>
        </button>

        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 shadow-xs flex flex-col items-center text-center gap-2 transition-all min-h-[110px]"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white">{t.uploadGallery}</span>
          <span className="text-[11px] text-slate-500">Images or PDF scans</span>
        </button>

        <button
          type="button"
          onClick={() => videoInputRef.current?.click()}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 shadow-xs flex flex-col items-center text-center gap-2 transition-all min-h-[110px]"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Video className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white">{t.recordVideo}</span>
          <span className="text-[11px] text-slate-500">Multi-page panning scan</span>
        </button>
      </div>

      {/* Quick Sample Selector */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-semibold">Or try sample report:</span>
        <button
          type="button"
          onClick={() => handleSampleReport('lab')}
          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium"
        >
          Sample Blood Lab (CBC)
        </button>
        <button
          type="button"
          onClick={() => handleSampleReport('xray')}
          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium"
        >
          Sample Chest X-Ray
        </button>
      </div>

      {/* Preview and Parameters */}
      {photoBase64 && (
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Image Preview */}
            <div className="md:col-span-5 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-black/5 max-h-72">
              <img
                src={photoBase64}
                alt="Uploaded Medical Document"
                className="w-full h-auto object-contain max-h-72"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Parameters */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Report Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'lab', label: 'Lab Test' },
                    { id: 'xray', label: 'X-Ray / Scan' },
                    { id: 'prescription', label: 'Doctor Slip' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setReportType(cat.id as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        reportType === cat.id
                          ? 'bg-teal-50 dark:bg-teal-950 border-teal-500 text-teal-800 dark:text-teal-200'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Patient Age Reference
                </label>
                <select
                  value={patientAgeGroup}
                  onChange={(e) => setPatientAgeGroup(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100"
                >
                  <option>Adult (18-60 yrs)</option>
                  <option>Elderly (60+ yrs)</option>
                  <option>Child (2-12 yrs)</option>
                  <option>Infant (0-2 yrs)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Doctor / Symptoms Notes (Optional)
                </label>
                <input
                  type="text"
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  placeholder="e.g. Prescribed for ongoing cough & weight loss"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full py-3 px-5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 min-h-[44px]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting Text & Clinical Findings...</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Decode Report in {currentLanguage.toUpperCase()}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Permanent Record Confirmation Alert */}
          <div className="flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div className="text-xs sm:text-sm font-semibold">
              {currentLanguage === 'ur' ? (
                <span>
                  آپ نے یہ رپورٹ چیک کروائی ہے — یہ رپورٹ اور تفصیلی تجاویز آپ کے میڈیکل ریکارڈ میں محفوظ ہو چکی ہیں!
                </span>
              ) : currentLanguage === 'roman' ? (
                <span>
                  Aap ny ye report ka pocha hai — Yeh report findings aap ke health record me save ho chuki hain!
                </span>
              ) : (
                <span>
                  You inquired about this lab report — All diagnostic findings have been logged to your Health Records!
                </span>
              )}
            </div>
          </div>

          <ClinicalOutputCard
            content={analysisResult.text}
            urgency={analysisResult.urgency}
            feature="report"
            patientAgeGroup={patientAgeGroup}
            currentLanguage={currentLanguage}
            timestamp={analysisResult.timestamp}
          />

          {/* Save to Records & Consult Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <button
              type="button"
              onClick={handleSaveToEHR}
              disabled={savedSuccess}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
              }`}
            >
              {savedSuccess ? <CheckCircle className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
              <span>{savedSuccess ? 'Saved to My Health Records' : 'Save to My Health Records'}</span>
            </button>

            <span className="text-xs text-slate-500 text-center sm:text-right">
              {t.doctorReviewTag}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
