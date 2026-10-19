import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Camera,
  Upload,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Download,
  BookmarkPlus,
  RefreshCw,
  Eye,
  CheckCircle2,
  Sliders,
  Sparkles,
  Edit2,
  Trash2,
  ArrowRight,
  TrendingUp,
  HelpCircle,
  Printer,
  Calendar,
  Layers,
  ZoomIn,
  AlertCircle,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  SupportedLanguage,
  MedicalReportRecord,
  UrgencyLevel,
  UnifiedHealthRecord,
  StructuredReportAnalysis,
  StructuredBiomarkerItem,
} from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { voiceManager } from '../services/voice';
import { AudioPlayerControls } from './AudioPlayerControls';
import { VoiceControlGroup } from './VoiceControlGroup';
import { InvalidUploadAlert } from './InvalidUploadAlert';
import { MedicalMediaUploader, CapturedMediaItem } from './MedicalMediaUploader';

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
  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  // Active Tab: 'analyze' (current intake) or 'compare' (historical comparison)
  const [activeTab, setActiveTab] = useState<'analyze' | 'compare'>('analyze');

  const [reportType, setReportType] = useState<'lab' | 'xray' | 'prescription' | 'other'>('lab');
  const [uploadedPages, setUploadedPages] = useState<string[]>([]);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [activePagePreviewIdx, setActivePagePreviewIdx] = useState<number>(0);
  const [patientNotes, setPatientNotes] = useState('');
  const [patientAgeGroup, setPatientAgeGroup] = useState('Adult (18-60 yrs)');
  const [isLoading, setIsLoading] = useState(false);

  // Preprocessing state
  const [isPreprocessedView, setIsPreprocessedView] = useState(false);
  const [preprocessedDataUrl, setPreprocessedDataUrl] = useState<string | null>(null);

  // Advanced Structured Results
  const [structuredData, setStructuredData] = useState<StructuredReportAnalysis | null>(null);
  const [rawMarkdownText, setRawMarkdownText] = useState<string | null>(null);
  const [urgency, setUrgency] = useState<UrgencyLevel>('YELLOW');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [editingBiomarker, setEditingBiomarker] = useState<StructuredBiomarkerItem | null>(null);

  // Historical Reports for Comparison
  const [historicalReports, setHistoricalReports] = useState<UnifiedHealthRecord[]>([]);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);

  // Invalid Upload alert
  const [invalidUploadError, setInvalidUploadError] = useState<{
    reason: 'not_medical' | 'not_medicine' | 'unclear_blurry';
    text: string;
    spokenAlert: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load user's historical lab reports from localStorage for instant comparison
  useEffect(() => {
    try {
      const userKey = (userName || 'default').toLowerCase().trim();
      const storageKey = `sehat_records_${userKey}`;
      const savedStr = localStorage.getItem(storageKey);
      if (savedStr) {
        const parsed: UnifiedHealthRecord[] = JSON.parse(savedStr);
        const labOnly = parsed.filter((r) => r.category === 'lab_report' || r.category === 'imaging_report');
        setHistoricalReports(labOnly);
        if (labOnly.length >= 2) {
          setSelectedCompareIds([labOnly[0].id, labOnly[1].id]);
        }
      }
    } catch {}
  }, [userName]);

  // Client-Side Canvas Preprocessing (Stage 2)
  // Contrast boost, luminance stretch, noise reduction for faded print
  const applyImagePreprocessing = (base64Img: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Contrast factor (1.35x stretch)
      const contrast = 35;
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

      for (let i = 0; i < data.length; i += 4) {
        // Red, Green, Blue
        data[i] = factor * (data[i] - 128) + 128;
        data[i + 1] = factor * (data[i + 1] - 128) + 128;
        data[i + 2] = factor * (data[i + 2] - 128) + 128;
      }

      ctx.putImageData(imageData, 0, 0);
      setPreprocessedDataUrl(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.src = base64Img;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPages: string[] = [];
    let count = 0;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        newPages.push(reader.result as string);
        count++;
        if (count === files.length) {
          setUploadedPages((prev) => [...prev, ...newPages]);
          applyImagePreprocessing(newPages[0]);
          setStructuredData(null);
          setRawMarkdownText(null);
          setInvalidUploadError(null);
          setSavedSuccess(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleMediaCaptured = (item: CapturedMediaItem) => {
    setUploadedPages((prev) => [...prev, item.dataUrl]);
    if (item.videoUrl) {
      setUploadedVideoUrl(item.videoUrl);
    }
    applyImagePreprocessing(item.dataUrl);
    setStructuredData(null);
    setRawMarkdownText(null);
    setInvalidUploadError(null);
    setSavedSuccess(false);
  };

  const handleSampleReport = (type: 'lab' | 'xray') => {
    setReportType(type);
    const sample =
      type === 'lab'
        ? 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=700&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=700&auto=format&fit=crop&q=80';
    setUploadedPages([sample]);
    applyImagePreprocessing(sample);
    setStructuredData(null);
    setRawMarkdownText(null);
    setInvalidUploadError(null);
    setSavedSuccess(false);
  };

  const handleAnalyzeAdvanced = async () => {
    if (uploadedPages.length === 0) return;

    setIsLoading(true);
    setInvalidUploadError(null);
    voiceManager.stop();

    try {
      // 1. Call advanced multi-stage pipeline
      const res = await fetch('/api/report-analyze-advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pages: uploadedPages,
          reportType,
          language: currentLanguage,
          patientAge: patientAgeGroup,
          notes: patientNotes,
          isEnhanced: isPreprocessedView,
        }),
      });

      const json = await res.json();

      if (!json.success || !json.data) {
        throw new Error(json.message || 'Analysis failed');
      }

      if (json.data.isRelevant === false) {
        const notMedMsg = isUrdu
          ? 'آپ نے جو تصویر یا ویڈیو اپلوڈ کی ہے وہ کسی میڈیکل لیب رپورٹ یا ایکسرے کی نہیں ہے (جیسے کارٹون، کھلونا، بھالو یا غیر متعلقہ تصویر)۔ برائے مہربانی صرف اصل میڈیکل رپورٹ یا ایکسرے کی درست تصویر یا ویڈیو اپلوڈ کریں۔'
          : isRoman
          ? 'Aap ny jo file upload ki hai wo kisi lab report ya X-ray ki nahi hai (jesy cartoon, bhaloo ya wrong picture). Baraye meherbani sahi medical report ya X-ray upload karein.'
          : 'The uploaded file does not appear to be a medical report or X-ray scan (e.g. cartoon, teddy bear, toy, or non-medical picture). Please upload a genuine medical document or X-ray.';

        setInvalidUploadError({
          reason: 'not_medical',
          text: notMedMsg,
          spokenAlert: notMedMsg,
        });
        voiceManager.stop();
        voiceManager.speak(notMedMsg, currentLanguage);
        setIsLoading(false);
        return;
      }

      const data: StructuredReportAnalysis = json.data;
      setStructuredData(data);
      setUrgency(data.urgency);
      setRawMarkdownText(data.clinicalSummary);

      // Auto save to Medical Record Vault
      const reportTitle =
        data.reportTitle ||
        (isUrdu
          ? `طبی لیب رپورٹ: ${data.laboratoryName || 'پیتھالوجی'}`
          : `Diagnostic Report: ${data.laboratoryName || 'Laboratory'}`);

      const unifiedRec: UnifiedHealthRecord = {
        id: `rep-${Date.now()}`,
        referenceNumber: `SS-LB-${Date.now().toString().slice(-6)}`,
        labCaseNumber: `LB-${Math.floor(10000 + Math.random() * 90000)}`,
        userId: (userName || 'default').toLowerCase().trim(),
        patientProfileId: 'prof-self',
        patientName: data.patientName || userName || 'Patient',
        patientAge: data.patientAge || '35 Y',
        patientGender: 'male',
        category: reportType === 'xray' ? 'imaging_report' : 'lab_report',
        title: reportTitle,
        panelName: data.reportTitle,
        date: data.reportDate || new Date().toISOString().split('T')[0],
        status: 'ai_preliminary',
        urgency: data.urgency,
        testResults: data.tests.map((t) => ({
          testName: t.testName,
          result: t.result,
          referenceRange: t.referenceRange,
          unit: t.unit,
          isAbnormal: t.flag !== 'normal',
          flag: t.flag,
          notes: t.explanation,
        })),
        clinicalNotes: data.clinicalSummary,
        doctorComments: `Processed via Multi-Stage Clinical OCR Engine. Quality: ${data.overallQuality}.`,
        photoUrl: uploadedPages[0],
      };

      if (onSaveUnifiedRecord) {
        onSaveUnifiedRecord(unifiedRec);
      }

      const legacyRec: MedicalReportRecord = {
        id: unifiedRec.id,
        title: unifiedRec.title,
        type: reportType === 'xray' ? 'xray' : 'lab',
        patientName: unifiedRec.patientName,
        patientAge: unifiedRec.patientAge,
        date: unifiedRec.date,
        photoUrl: uploadedPages[0],
        findings: data.clinicalSummary,
        urgency: data.urgency,
        status: 'preliminary_ai',
      };
      onSaveToRecords(legacyRec);
      setSavedSuccess(true);
    } catch (err: any) {
      console.warn('Advanced analysis error, falling back to legacy endpoint:', err);
      // Fallback to legacy endpoint if advanced encounters unexpected timeout
      try {
        const legacyRes = await fetch('/api/report-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reportType,
            photoBase64: uploadedPages[0],
            notes: patientNotes,
            language: currentLanguage,
            patientAge: patientAgeGroup,
          }),
        });
        const legacyData = await legacyRes.json();
        setRawMarkdownText(legacyData.text || 'Report processed.');
        setUrgency(legacyData.urgency || 'YELLOW');
      } catch (legacyErr) {
        setInvalidUploadError({
          isInvalid: true,
          relevanceReason: 'extraction_failed',
          text: currentLanguage === 'ur'
            ? 'رپورٹ کا ڈیٹا مکمل طور پر حاصل نہیں ہو سکا۔ برائے مہربانی انٹرنیٹ کنکشن چیک کریں اور صاف تصویر دوبارہ اپلوڈ کریں۔'
            : currentLanguage === 'roman'
            ? 'Report ka data mukammal nahi nikal saka. Baraye meherbani internet connection check karein ya saaf picture dalein.'
            : 'Could not complete document extraction. Please check internet connection or upload a clearer document photo.',
          spokenAlert: '',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualBiomarkerUpdate = (updatedItem: StructuredBiomarkerItem) => {
    if (!structuredData) return;
    const updatedTests = structuredData.tests.map((t) =>
      t.testName === updatedItem.testName ? { ...updatedItem, isUncertain: false, needsReview: false } : t
    );
    setStructuredData({
      ...structuredData,
      tests: updatedTests,
    });
    setEditingBiomarker(null);
  };

  // Build comparison data across selected reports
  const compareReports = historicalReports.filter((r) => selectedCompareIds.includes(r.id));
  const biomarkerNames = Array.from(
    new Set(compareReports.flatMap((r) => r.testResults.map((t) => t.testName)))
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-teal-900 via-teal-950 to-slate-900 text-white shadow-xl border border-teal-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shadow-inner">
              <FileText className="w-7 h-7 text-teal-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-400/20 text-teal-300 text-[11px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-teal-300" />
                <span>Multi-Stage OCR & Vision Engine</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                {isUrdu ? 'اے آئی میڈیکل رپورٹ و ایکسرے تجزیہ کار' : 'AI Medical Report Analyzer'}
              </h2>
              <p className="text-xs text-teal-200/80 mt-1 max-w-xl">
                {isUrdu
                  ? 'پرانی، دھندلی، مڑی ہوئی اور کم ریزولیوشن رپورٹس سے ٹیسٹ رزلٹس نکالیں، تصدیق کریں اور سابقہ رپورٹس سے موازنہ کریں۔'
                  : 'Multi-stage processing pipeline for clear, faded, folded, and low-res reports with historical trend comparison.'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 bg-white/10 p-1 rounded-2xl border border-white/15">
            <button
              type="button"
              onClick={() => setActiveTab('analyze')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'analyze'
                  ? 'bg-teal-500 text-slate-950 shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {isUrdu ? 'رپورٹ اسکین کریں' : 'Scan & Extract'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('compare')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'compare'
                  ? 'bg-teal-500 text-slate-950 shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'سابقہ موازنہ' : 'Compare Reports'}</span>
            </button>
          </div>
        </div>
      </div>

      {invalidUploadError && (
        <InvalidUploadAlert
          reason={invalidUploadError.reason}
          text={invalidUploadError.text}
          spokenAlert={invalidUploadError.spokenAlert}
          currentLanguage={currentLanguage}
          onRetry={() => {
            setInvalidUploadError(null);
            fileInputRef.current?.click();
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 1: SCAN & EXTRACT PIPELINE */}
      {/* ========================================================================= */}
      {activeTab === 'analyze' && (
        <div className="space-y-6">
          {/* Stage 1: Document Upload Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-left rtl:text-right">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  {isUrdu ? 'مرحلہ 1: دستاویز اپلوڈ اور نوعیت کا انتخاب' : 'Stage 1: Document Intake & Multi-Page Support'}
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                PDF, JPG, PNG Supported
              </span>
            </div>

            {/* Report Type Selector */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'lab', label: isUrdu ? 'خون کی لیب رپورٹ (CBC, LFT, Sugar)' : 'Laboratory Blood Test' },
                { id: 'xray', label: isUrdu ? 'ایکسرے / ریڈیالوجی اسکین' : 'Radiology Imaging (X-Ray)' },
                { id: 'prescription', label: isUrdu ? 'ڈاکٹر کا نسخہ (Prescription Slip)' : 'Doctor Prescription Slip' },
              ].map((tItem) => (
                <button
                  key={tItem.id}
                  type="button"
                  onClick={() => setReportType(tItem.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    reportType === tItem.id
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {tItem.label}
                </button>
              ))}
            </div>

            {/* Hidden File Inputs */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,.pdf"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Upload Action Area with all 4 simultaneous options (Photo, Live Video, Saved Image/PDF, Video File) */}
            {uploadedPages.length === 0 ? (
              <div className="space-y-4">
                <MedicalMediaUploader
                  currentLanguage={currentLanguage}
                  mediaType={reportType === 'xray' ? 'xray' : 'report'}
                  onMediaCaptured={handleMediaCaptured}
                />

                {/* Samples */}
                <div className="pt-2 text-xs text-slate-400 flex items-center justify-center gap-2">
                  <span>{isUrdu ? 'یا نمونہ رپورٹ دیکھیں:' : 'Or try sample report:'}</span>
                  <button
                    type="button"
                    onClick={() => handleSampleReport('lab')}
                    className="text-teal-600 font-bold hover:underline cursor-pointer"
                  >
                    Sample Blood Lab (CBC)
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => handleSampleReport('xray')}
                    className="text-teal-600 font-bold hover:underline cursor-pointer"
                  >
                    Sample Chest X-Ray
                  </button>
                </div>
              </div>
            ) : (
              /* Uploaded Pages Gallery & Stage 2 Preprocessing Toggle */
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-200">
                      {isUrdu ? `کل صفحات / فریمز: ${uploadedPages.length}` : `Pages / Frames: ${uploadedPages.length}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-teal-600 font-bold hover:underline cursor-pointer ml-2 flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUrdu ? '+ مزید فائل شامل کریں' : '+ Add File'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="text-xs text-teal-600 font-bold hover:underline cursor-pointer ml-2 flex items-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isUrdu ? '+ کیمرے سے تصویر لیں' : '+ Take Photo'}</span>
                    </button>
                  </div>

                  {/* Stage 2 Preprocessing Toggle */}
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-700 p-1 rounded-xl border border-slate-200 dark:border-slate-600">
                    <button
                      type="button"
                      onClick={() => setIsPreprocessedView(false)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        !isPreprocessedView
                          ? 'bg-teal-700 text-white'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Original Document
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPreprocessedView(true)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        isPreprocessedView
                          ? 'bg-teal-700 text-white'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Enhanced (Contrast Boost)</span>
                    </button>
                  </div>
                </div>

                {/* Document Preview Box */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black/90 max-h-96 flex flex-col items-center justify-center p-2">
                  {uploadedVideoUrl ? (
                    <div className="w-full flex flex-col items-center">
                      <video
                        src={uploadedVideoUrl}
                        controls
                        playsInline
                        className="max-h-72 object-contain mx-auto rounded-lg shadow-lg"
                      />
                      <div className="mt-2 flex items-center gap-2 text-xs text-teal-300 font-semibold bg-teal-950/80 px-3 py-1 rounded-full border border-teal-700/50">
                        <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                        <span>{isUrdu ? 'ویڈیو سے تشخیصی فریم حاصل کر لیا گیا ہے' : 'Diagnostic X-Ray Frame Extracted from Video for AI Analysis'}</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <img
                        src={isPreprocessedView && preprocessedDataUrl ? preprocessedDataUrl : uploadedPages[activePagePreviewIdx]}
                        alt="Medical document preview"
                        className="max-h-80 object-contain mx-auto rounded-lg"
                      />
                      {isPreprocessedView && (
                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-teal-600 text-white text-[11px] font-bold shadow-md">
                          Stage 2: Faded Print Contrast Enhanced
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Process Button */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedPages([]);
                      setUploadedVideoUrl(null);
                      setStructuredData(null);
                      setRawMarkdownText(null);
                    }}
                    className="text-xs font-bold text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    Clear All
                  </button>

                  <button
                    type="button"
                    onClick={handleAnalyzeAdvanced}
                    disabled={isLoading}
                    className="px-6 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{isUrdu ? 'رپورٹ کا کثیر مرحلہ تجزیہ ہو رہا ہے...' : 'Executing Multi-Stage OCR Pipeline...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{isUrdu ? 'تجزیہ شروع کریں اور ڈیٹا نکالیں' : 'Run Intelligent OCR Extraction'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* EXTRACTION RESULTS DISPLAY                                                */}
          {/* ========================================================================= */}
          {structuredData && (
            <div className="space-y-6">
              {/* Quality & Urgency Audit Bar */}
              <div
                className={`p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  urgency === 'RED'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                    : urgency === 'YELLOW'
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg">
                      {structuredData.reportTitle}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-white/60 dark:bg-black/40">
                      {urgency === 'RED' ? 'Emergency Attention' : urgency === 'YELLOW' ? 'Doctor Review Needed' : 'Normal Limits'}
                    </span>
                  </div>
                  <div className="text-xs opacity-85">
                    Lab: {structuredData.laboratoryName} • Date: {structuredData.reportDate} • Document Quality: {structuredData.overallQuality}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / Export PDF</span>
                  </button>
                </div>
              </div>

              {/* Unreadable / Damaged Region Warning (if report was faded or torn) */}
              {structuredData.unreadableRegions && structuredData.unreadableRegions.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">
                      {isUrdu ? 'دھندلا یا پھٹا ہوا حصہ انتباہ:' : 'Damaged / Faded Regions Identified:'}
                    </span>
                    {structuredData.unreadableRegions.join('; ')}
                    <span className="block mt-1 font-semibold text-slate-500">
                      You can click "Edit" on any value below to manually verify with your original paper report.
                    </span>
                  </div>
                </div>
              )}

              {/* Stage 5A: Dedicated Radiology & Imaging Examination Findings (for X-Rays, Scans) */}
              {(reportType === 'xray' || structuredData.radiologyFindings) && (
                <div className="p-6 rounded-3xl bg-slate-900 text-white border border-teal-500/30 shadow-md space-y-4 text-left rtl:text-right">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base sm:text-lg text-white">
                          {isUrdu ? 'ایکسرے و ریڈیالوجی تشخیصی معائنہ' : 'Radiology & X-Ray Imaging Examination'}
                        </h3>
                        <p className="text-xs text-teal-300">
                          {structuredData.radiologyFindings?.anatomicalRegion || (isUrdu ? 'عضو: سینہ / ہڈی' : 'Region: Thorax / Skeletal')} • {structuredData.radiologyFindings?.view || 'Standard Diagnostic View'}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-950 text-teal-300 border border-teal-800">
                      {isUrdu ? 'ریڈیالوجیکل معائنہ' : 'Radiological Scan'}
                    </span>
                  </div>

                  {/* Visual Observations */}
                  {structuredData.radiologyFindings?.observations && structuredData.radiologyFindings.observations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {isUrdu ? 'طبی مشاہدات (Key Visual Observations):' : 'Key Visual Observations:'}
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-200">
                        {structuredData.radiologyFindings.observations.map((obs, oIdx) => (
                          <li key={oIdx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                            <span>{obs}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Impression & Fracture Screening */}
                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2 text-xs">
                    <div>
                      <strong className="text-teal-300 block mb-0.5 font-bold">
                        {isUrdu ? 'تشخیصی نتیجہ (Impression):' : 'Diagnostic Impression:'}
                      </strong>
                      <p className="text-slate-200 leading-relaxed">
                        {structuredData.radiologyFindings?.impression || structuredData.clinicalSummary}
                      </p>
                    </div>
                    {structuredData.radiologyFindings?.fractureOrPathology && (
                      <div className="pt-2 border-t border-slate-700/60">
                        <strong className="text-amber-300 block mb-0.5 font-bold">
                          {isUrdu ? 'فریکچر یا نقص کی جانچ:' : 'Fracture / Acute Pathology Screening:'}
                        </strong>
                        <p className="text-slate-200">
                          {structuredData.radiologyFindings.fractureOrPathology}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stage 5B: Structured Biomarkers Table (if lab tests extracted) */}
              {structuredData.tests && structuredData.tests.length > 0 && (
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-left rtl:text-right">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                      {isUrdu ? 'مرحلہ 5: اخذ شدہ ٹیسٹ رزلٹس اور حوالہ جاتی حدود' : 'Stage 5: Extracted Biomarkers & Reference Ranges'}
                    </h3>
                    <span className="text-xs text-slate-400 font-semibold">
                      {structuredData.tests.length} Parameters Extracted
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left rtl:text-right border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold text-[11px] uppercase">
                          <th className="py-2.5 px-3">Test Parameter</th>
                          <th className="py-2.5 px-3">Measured Result</th>
                          <th className="py-2.5 px-3">Unit</th>
                          <th className="py-2.5 px-3">Printed Ref Range</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">OCR Certainty</th>
                          <th className="py-2.5 px-3 text-right rtl:text-left">Verify / Edit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {structuredData.tests.map((test, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-3 px-3 font-bold text-slate-800 dark:text-white">
                              {test.testName}
                              {test.explanation && (
                                <span className="block font-normal text-[11px] text-slate-400 mt-0.5">
                                  {test.explanation}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-sm text-slate-900 dark:text-white">
                              {test.result}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-500">
                              {test.unit || '-'}
                            </td>
                            <td className="py-3 px-3 text-slate-500 font-mono">
                              {test.referenceRange || 'Standard Normal'}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                  test.flag === 'normal'
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                    : test.flag === 'critical'
                                    ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                                }`}
                              >
                                {test.flag}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-400">
                              {test.confidence}% {test.confidence > 85 ? '✓' : '?'}
                            </td>
                            <td className="py-3 px-3 text-right rtl:text-left">
                              <button
                                type="button"
                                onClick={() => setEditingBiomarker(test)}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950 cursor-pointer transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5 inline mr-1" />
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Comprehensive Voice Player & Simple-Language Clinical Summary */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-left rtl:text-right">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal-600" />
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                        {isUrdu ? 'طبی خلاصہ، تحریر اور مکمل صوتی رہنمائی' : 'Written Clinical Explanation & Full Voice Readout'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isUrdu ? 'آپ رپورٹ تحریری طور پر پڑھ بھی سکتے ہیں اور آواز سے سن بھی سکتے ہیں' : 'Read the complete clinical analysis or listen via voice player'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Voice Control Bar */}
                <div className="p-3.5 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80">
                  <div className="text-xs font-bold text-teal-900 dark:text-teal-200 mb-2 flex items-center justify-between">
                    <span>{isUrdu ? 'مکمل رپورٹ آواز سے سنیں:' : 'Listen to Report with Voice (Audio):'}</span>
                    <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300">
                      {isUrdu ? 'اردو صوتی آواز' : currentLanguage === 'roman' ? 'Roman Urdu Voice' : 'English Voice'}
                    </span>
                  </div>
                  <VoiceControlGroup
                    currentLanguage={currentLanguage}
                    textToSpeak={structuredData.spokenSummary || structuredData.clinicalSummary}
                    variant="bar"
                    size="md"
                  />
                </div>

                {/* Written Clinical Summary */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-sm text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line border border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                    {isUrdu ? 'تحریری تشریح (Written Findings):' : 'Written Clinical Findings:'}
                  </h4>
                  {structuredData.clinicalSummary}
                </div>
              </div>

              {/* Questions for the Doctor */}
              {structuredData.questionsForDoctor && structuredData.questionsForDoctor.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3 text-left rtl:text-right">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-teal-600" />
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {isUrdu ? 'ڈاکٹر سے پوچھنے کے لیے اہم سوالات' : 'Questions to Ask Your Doctor'}
                    </h3>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {structuredData.questionsForDoctor.map((q, qIdx) => (
                      <li key={qIdx} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {qIdx + 1}
                        </span>
                        <span className="mt-0.5 leading-relaxed">{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: OLD VS NEW REPORT COMPARISON                                       */}
      {/* ========================================================================= */}
      {activeTab === 'compare' && (
        <div className="space-y-6 text-left rtl:text-right">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  {isUrdu ? 'سابقہ رپورٹس کا موازنہ' : 'Old vs New Report Comparison'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select two or more historical lab reports to track biomarker changes over time.
                </p>
              </div>
            </div>

            {/* Reports selection checkboxes */}
            {historicalReports.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                {isUrdu
                  ? 'آپ کی کوئی سابقہ رپورٹ ریکارڈ میں نہیں ہے۔ نئی رپورٹ اسکین کرنے پر وہ یہاں شامل ہو جائے گی۔'
                  : 'No previous reports found in your record vault. Scanned reports automatically become comparable here.'}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {historicalReports.map((r) => {
                    const isSelected = selectedCompareIds.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setSelectedCompareIds((prev) =>
                            prev.includes(r.id) ? prev.filter((id) => id !== r.id) : [...prev, r.id]
                          );
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{r.title} ({r.date})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Comparison Table */}
                {compareReports.length >= 2 && (
                  <div className="pt-4 overflow-x-auto">
                    <table className="w-full text-xs text-left rtl:text-right border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[11px]">
                          <th className="py-2.5 px-3">Biomarker / Test Name</th>
                          {compareReports.map((r) => (
                            <th key={r.id} className="py-2.5 px-3">
                              {r.date} ({r.title.slice(0, 18)}...)
                            </th>
                          ))}
                          <th className="py-2.5 px-3">Measured Trend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {biomarkerNames.map((bioName) => {
                          const values = compareReports.map((r) => {
                            const found = r.testResults.find((t) => t.testName === bioName);
                            return found ? `${found.result} ${found.unit || ''}` : '-';
                          });

                          return (
                            <tr key={bioName} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="py-3 px-3 font-bold text-slate-800 dark:text-white">
                                {bioName}
                              </td>
                              {values.map((v, vIdx) => (
                                <td key={vIdx} className="py-3 px-3 font-mono font-semibold text-slate-700 dark:text-slate-200">
                                  {v}
                                </td>
                              ))}
                              <td className="py-3 px-3 text-slate-400 font-medium">
                                Tracked Across Dates
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Biomarker Correction Modal */}
      <AnimatePresence>
        {editingBiomarker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-left rtl:text-right space-y-4"
            >
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Verify / Correct Extracted Test Value
              </h3>
              <p className="text-xs text-slate-400">
                You can manually adjust this value to ensure 100% fidelity with your original paper report.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Test Name
                  </label>
                  <input
                    type="text"
                    value={editingBiomarker.testName}
                    onChange={(e) =>
                      setEditingBiomarker({ ...editingBiomarker, testName: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Result
                    </label>
                    <input
                      type="text"
                      value={editingBiomarker.result}
                      onChange={(e) =>
                        setEditingBiomarker({ ...editingBiomarker, result: e.target.value })
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={editingBiomarker.unit}
                      onChange={(e) =>
                        setEditingBiomarker({ ...editingBiomarker, unit: e.target.value })
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Reference Range
                  </label>
                  <input
                    type="text"
                    value={editingBiomarker.referenceRange}
                    onChange={(e) =>
                      setEditingBiomarker({ ...editingBiomarker, referenceRange: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBiomarker(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleManualBiomarkerUpdate(editingBiomarker)}
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Save Correction
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
