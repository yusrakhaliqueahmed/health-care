import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Download,
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Save,
  Copy,
  Check,
  ShieldCheck,
  QrCode,
  Languages,
  Activity,
  User,
  Calendar,
  FileText
} from 'lucide-react';
import { UnifiedHealthRecord, SupportedLanguage, DiagnosticTestItem } from '../types';
import { LANGUAGES } from '../services/i18n';
import { voiceManager } from '../services/voice';

interface DiagnosticLabReportModalProps {
  record: UnifiedHealthRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateRecord?: (updatedRecord: UnifiedHealthRecord) => void;
  currentLanguage: SupportedLanguage;
}

export const DiagnosticLabReportModal: React.FC<DiagnosticLabReportModalProps> = ({
  record,
  isOpen,
  onClose,
  onUpdateRecord,
  currentLanguage,
}) => {
  if (!isOpen || !record) return null;

  // Editable local state
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecord, setEditedRecord] = useState<UnifiedHealthRecord>(record);
  const [copied, setCopied] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Audio / Read Aloud state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPausedAudio, setIsPausedAudio] = useState(false);
  const [ttsSpeed, setTtsSpeed] = useState(1.0);
  const [readLanguage, setReadLanguage] = useState<SupportedLanguage>(currentLanguage || 'en');

  // Keep edited record in sync when record prop changes
  useEffect(() => {
    setEditedRecord(record);
    setIsEditing(false);
  }, [record]);

  // Voice subscription
  useEffect(() => {
    const unsubscribe = voiceManager.subscribe((state) => {
      setIsPlayingAudio(state.isPlaying);
      setIsPausedAudio(state.isPaused);
      setTtsSpeed(state.speed);
    });
    return () => {
      unsubscribe();
      voiceManager.stop();
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const lines = [
      `================================================`,
      `SEHATSAATHI PRO - OFFICIAL DIAGNOSTIC REPORT`,
      `AI-Assisted Healthcare • Doctor Verified`,
      `================================================`,
      `Report Title: ${editedRecord.panelName || editedRecord.title}`,
      `R No: ${editedRecord.referenceNumber || editedRecord.id} | Lab No: ${editedRecord.labCaseNumber || 'LB-77491'}`,
      `Patient Name: ${editedRecord.patientName} | Age/Gender: ${editedRecord.patientAge} / ${editedRecord.patientGender.toUpperCase()}`,
      `Date: ${editedRecord.date} | Status: ${editedRecord.status === 'doctor_approved' ? 'Doctor Approved' : 'AI Preliminary'}`,
      `------------------------------------------------`,
      `TEST(S) | RESULT(S) | REFERENCE RANGE(S)`,
      `------------------------------------------------`,
      ...(editedRecord.testResults || []).map(
        (t) => `${t.testName}: ${t.result} [Ref: ${t.referenceRange || 'N/A'}] ${t.isAbnormal ? '(ABNORMAL)' : ''}`
      ),
      `------------------------------------------------`,
      `Clinical Notes:`,
      editedRecord.clinicalNotes || 'None',
      `\nDoctor / AI Interpretation:`,
      editedRecord.doctorComments || 'Electronically verified on SehatSaathi Pro Clinical Network.',
      `================================================`,
      `Helpline: 1122 | Support: support@sehatsaathi.pk`,
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveEdits = () => {
    setIsEditing(false);
    if (onUpdateRecord) {
      onUpdateRecord(editedRecord);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    }
  };

  // Construct text for Speech Synthesis
  const getSpeechSummary = (): string => {
    const testsSummary = (editedRecord.testResults || [])
      .slice(0, 6)
      .map((t) => `${t.testName}: ${t.result}`)
      .join('. ');

    if (readLanguage === 'roman') {
      return `SehatSaathi Pro Diagnostic Report. Mareez ka naam: ${editedRecord.patientName}. Report: ${editedRecord.panelName || editedRecord.title}. Tareekh: ${editedRecord.date}. Results: ${testsSummary}. Tibbi wazahat: ${editedRecord.clinicalNotes || 'Tamam alamaat normal hain'}. Mashwara: Kisi bhi dawai se pehle certified PMDC doctor se tasdeeq karwayen.`;
    }

    if (readLanguage === 'ur') {
      return `صحت ساتھی پرو تشخیصی رپورٹ۔ مریض کا نام: ${editedRecord.patientName}۔ عنوان: ${editedRecord.panelName || editedRecord.title}۔ نتائج: ${testsSummary}۔ طبی رائے: ${editedRecord.clinicalNotes || 'تمام ٹیسٹ محفوظ حدود میں ہیں'}۔`;
    }

    return `SehatSaathi Pro Diagnostic Report for ${editedRecord.patientName}. Panel: ${editedRecord.panelName || editedRecord.title}. Date: ${editedRecord.date}. Key Findings: ${testsSummary}. Clinical Notes: ${editedRecord.clinicalNotes || 'Within expected parameters'}. Notice: This is preliminary AI-assisted clinical triage, confirmed with licensed PMDC doctors.`;
  };

  const toggleAudio = () => {
    if (isPlayingAudio && !isPausedAudio) {
      voiceManager.pause();
    } else if (isPausedAudio) {
      voiceManager.resume();
    } else {
      const speech = getSpeechSummary();
      voiceManager.speak(speech, readLanguage);
    }
  };

  const handleStopAudio = () => {
    voiceManager.stop();
  };

  const cycleSpeed = () => {
    const speeds = [0.8, 1.0, 1.25];
    const nextIdx = (speeds.indexOf(ttsSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setTtsSpeed(nextSpeed);
    voiceManager.setSpeed(nextSpeed);
  };

  const handleTestFieldChange = (index: number, field: keyof DiagnosticTestItem, value: any) => {
    const updated = [...(editedRecord.testResults || [])];
    updated[index] = { ...updated[index], [field]: value };
    setEditedRecord({ ...editedRecord, testResults: updated });
  };

  const addTestRow = () => {
    const newTest: DiagnosticTestItem = {
      testName: 'New Parameter',
      result: 'Normal',
      referenceRange: 'Standard',
      isAbnormal: false,
    };
    setEditedRecord({
      ...editedRecord,
      testResults: [...(editedRecord.testResults || []), newTest],
    });
  };

  const removeTestRow = (index: number) => {
    const updated = (editedRecord.testResults || []).filter((_, i) => i !== index);
    setEditedRecord({ ...editedRecord, testResults: updated });
  };

  return (
    <div
      id="diagnostic-lab-report-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static"
    >
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[96vh] print:max-h-none print:shadow-none print:rounded-none print:w-full">
        {/* Top Header Bar (Matching reference dark strip) */}
        <div className="bg-slate-900 text-slate-100 px-4 py-2.5 flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
            <span className="font-mono text-xs sm:text-sm font-semibold tracking-wide text-slate-200">
              SehatSaathi-Report-{editedRecord.referenceNumber || editedRecord.id}
            </span>
            <span className="text-[10px] bg-teal-900/60 text-teal-300 border border-teal-700/50 px-2 py-0.5 rounded-full font-medium ml-2">
              Official Diagnostic Format
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="report-close-btn-top"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              title="Close Report"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Controls Bar (Read aloud, print, edit, download) */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs print:hidden">
          {/* Audio Controls */}
          <div className="flex items-center space-x-2">
            <button
              id="report-tts-toggle-btn"
              onClick={toggleAudio}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                isPlayingAudio && !isPausedAudio
                  ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
              }`}
              title="Read Report Aloud"
            >
              {isPlayingAudio && !isPausedAudio ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Reading</span>
                </>
              ) : isPausedAudio ? (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume Reading</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>🔊 Read Aloud</span>
                </>
              )}
            </button>

            {isPlayingAudio && (
              <button
                id="report-tts-stop-btn"
                onClick={handleStopAudio}
                className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md transition-colors"
                title="Stop Audio"
              >
                <VolumeX className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Reading Speed Control */}
            <button
              id="report-tts-speed-btn"
              onClick={cycleSpeed}
              className="px-2 py-1 bg-white border border-slate-300 hover:border-slate-400 rounded-md text-slate-700 font-mono font-medium text-[11px]"
              title="Change voice speed"
            >
              {ttsSpeed}x Speed
            </button>

            {/* Language Selection for TTS */}
            <div className="flex items-center space-x-1 bg-white border border-slate-300 rounded-md px-2 py-1">
              <Languages className="w-3 h-3 text-slate-500" />
              <select
                id="report-read-lang-select"
                value={readLanguage}
                onChange={(e) => {
                  setReadLanguage(e.target.value as SupportedLanguage);
                  if (isPlayingAudio) {
                    voiceManager.stop();
                  }
                }}
                className="text-[11px] bg-transparent font-medium text-slate-700 focus:outline-hidden cursor-pointer"
              >
                {Object.entries(LANGUAGES).map(([code, meta]) => (
                  <option key={code} value={code}>
                    {meta.name} ({meta.nativeName})
                  </option>
                ))}
              </select>
            </div>

            {/* Animated Waveform indicator when playing */}
            {isPlayingAudio && !isPausedAudio && (
              <div className="flex items-center space-x-0.5 ml-2">
                <span className="w-1 h-3 bg-teal-500 rounded-full animate-bounce"></span>
                <span className="w-1 h-5 bg-teal-600 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-1 h-4 bg-teal-500 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                <span className="w-1 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:0.45s]"></span>
              </div>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              id="report-toggle-edit-btn"
              onClick={() => {
                if (isEditing) {
                  handleSaveEdits();
                } else {
                  setIsEditing(true);
                }
              }}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md font-medium transition-colors ${
                isEditing
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-white border border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
            >
              {isEditing ? (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </>
              )}
            </button>

            <button
              id="report-copy-btn"
              onClick={handleCopyText}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-md font-medium transition-colors"
              title="Copy formatted report text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>

            <button
              id="report-print-btn"
              onClick={handlePrint}
              className="flex items-center space-x-1 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-md font-medium shadow-xs transition-colors"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Save confirmation toast */}
        {saveToast && (
          <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 px-4 py-1.5 text-xs flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Report modifications saved successfully to patient record.</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PRINTABLE LAB REPORT BODY (Strict diagnostic lab report style) */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-8 overflow-y-auto bg-white text-slate-900 font-sans print:p-6 print:overflow-visible">
          {/* 1. Header & Branding Section (Center Logo, Tagline, Badges) */}
          <div className="relative flex flex-col sm:flex-row items-center justify-between pb-4 border-b-2 border-teal-700 gap-4">
            {/* Left: Circular SehatSaathi Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 rounded-full bg-teal-50 border-2 border-teal-600 flex items-center justify-center text-teal-600 shadow-xs">
                <Activity className="w-8 h-8 stroke-[2.2]" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-bold uppercase tracking-widest text-teal-800">
                  Clinical Diagnostic Network
                </div>
                <div className="text-xs text-slate-500 font-mono">Reg # PK-SS-2026</div>
              </div>
            </div>

            {/* Center: Bold Brand Name & Tagline */}
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-teal-700 uppercase font-serif">
                SehatSaathi Pro
              </h1>
              <p className="text-xs sm:text-sm font-semibold tracking-wide text-slate-700 mt-0.5">
                AI-Assisted Healthcare • Doctor Verified
              </p>
              <p className="text-[10px] text-slate-500 tracking-wider uppercase font-medium">
                National Tele-Triage & Diagnostic Lab Verification System
              </p>
            </div>

            {/* Right: Certification / Verification Badge */}
            <div className="text-right flex flex-col items-end">
              <div className="flex items-center space-x-1.5 bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold px-2.5 py-1 rounded-md">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>PMDC VERIFIED</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">DRAP Standard Compliant</div>
              <div className="text-[10px] text-slate-500 font-mono">ISO 15189 Standardized</div>
            </div>
          </div>

          {/* 2. Patient & Reference Info Block (2-column key-value layout exactly like reference) */}
          <div className="my-4 py-3 px-4 border border-slate-300 rounded-lg bg-slate-50/50 text-xs sm:text-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Left Column (5 cols) */}
            <div className="md:col-span-5 space-y-1.5 text-left">
              <div className="flex items-center">
                <span className="font-bold text-slate-700 w-24 shrink-0">R No:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedRecord.referenceNumber || editedRecord.id}
                    onChange={(e) => setEditedRecord({ ...editedRecord, referenceNumber: e.target.value })}
                    className="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-full bg-white"
                  />
                ) : (
                  <span className="font-mono font-semibold text-slate-900">
                    {editedRecord.referenceNumber || editedRecord.id}
                  </span>
                )}
              </div>

              <div className="flex items-center">
                <span className="font-bold text-slate-700 w-24 shrink-0">Lab No:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedRecord.labCaseNumber || 'LB-77491'}
                    onChange={(e) => setEditedRecord({ ...editedRecord, labCaseNumber: e.target.value })}
                    className="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-full bg-white font-mono"
                  />
                ) : (
                  <span className="font-mono font-semibold text-slate-900">
                    {editedRecord.labCaseNumber || 'LB-77491'}
                  </span>
                )}
              </div>

              <div className="flex items-center">
                <span className="font-bold text-slate-700 w-24 shrink-0">Name:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedRecord.patientName}
                    onChange={(e) => setEditedRecord({ ...editedRecord, patientName: e.target.value })}
                    className="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-full bg-white font-semibold"
                  />
                ) : (
                  <span className="font-bold text-slate-900 uppercase">{editedRecord.patientName}</span>
                )}
              </div>
            </div>

            {/* Right Column (5 cols) */}
            <div className="md:col-span-5 space-y-1.5 text-left">
              <div className="flex items-center">
                <span className="font-bold text-slate-700 w-28 shrink-0">Age / Gender:</span>
                {isEditing ? (
                  <div className="flex space-x-1 w-full">
                    <input
                      type="text"
                      value={editedRecord.patientAge}
                      onChange={(e) => setEditedRecord({ ...editedRecord, patientAge: e.target.value })}
                      className="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-1/2 bg-white"
                      placeholder="Age"
                    />
                    <select
                      value={editedRecord.patientGender}
                      onChange={(e) => setEditedRecord({ ...editedRecord, patientGender: e.target.value as any })}
                      className="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-1/2 bg-white"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                ) : (
                  <span className="font-semibold text-slate-900">
                    {editedRecord.patientAge} / {editedRecord.patientGender.toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex items-center">
                <span className="font-bold text-slate-700 w-28 shrink-0">Referred By:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedRecord.reviewedByDoctor || 'Dr. Ayesha Malik (PMDC #48291-P)'}
                    onChange={(e) => setEditedRecord({ ...editedRecord, reviewedByDoctor: e.target.value })}
                    className="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-full bg-white"
                  />
                ) : (
                  <span className="font-medium text-slate-900">
                    {editedRecord.reviewedByDoctor || 'Dr. Ayesha Malik (PMDC #48291-P)'}
                  </span>
                )}
              </div>

              <div className="flex items-center">
                <span className="font-bold text-slate-700 w-28 shrink-0">Date / Time:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedRecord.date}
                    onChange={(e) => setEditedRecord({ ...editedRecord, date: e.target.value })}
                    className="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-full bg-white font-mono"
                  />
                ) : (
                  <span className="font-mono font-medium text-slate-900">{editedRecord.date}</span>
                )}
              </div>
            </div>

            {/* Far Right: QR Code & Verification Tag (2 cols) */}
            <div className="md:col-span-2 flex flex-col items-center justify-center p-2 border-t md:border-t-0 md:border-l border-slate-200">
              <div className="p-1 bg-white border border-slate-300 rounded-sm shadow-2xs">
                <QrCode className="w-12 h-12 text-slate-800" />
              </div>
              <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase text-center font-bold">
                Scan to Verify
              </span>
            </div>
          </div>

          {/* 3. Centered Underlined Report Title */}
          <div className="my-6 text-center">
            {isEditing ? (
              <input
                type="text"
                value={editedRecord.panelName || editedRecord.title}
                onChange={(e) =>
                  setEditedRecord({ ...editedRecord, panelName: e.target.value, title: e.target.value })
                }
                className="text-center font-bold text-lg sm:text-xl text-slate-900 border-b-2 border-slate-800 w-full max-w-md uppercase tracking-wide py-1 focus:outline-hidden"
              />
            ) : (
              <h2 className="text-base sm:text-lg font-black tracking-wider text-slate-900 uppercase font-mono inline-block border-b-2 border-slate-900 pb-0.5">
                {editedRecord.panelName || editedRecord.title}
              </h2>
            )}
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mt-1">
              Method: Automated Clinical Assay & Certified AI-Doctor Verification
            </div>
          </div>

          {/* 4. Results Table (Exact 3-Column Diagnostic Lab Layout) */}
          <div className="my-4 border-t-2 border-b-2 border-slate-800">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-400 bg-slate-100 text-slate-900 font-bold uppercase tracking-wider text-[11px] sm:text-xs">
                  <th className="py-2.5 px-3 w-5/12">TEST(s)</th>
                  <th className="py-2.5 px-3 w-3/12 text-center">RESULT(s)</th>
                  <th className="py-2.5 px-3 w-4/12 text-right">REFERENCE RANGE(s)</th>
                  {isEditing && <th className="py-2 px-1 text-center w-8 print:hidden">DEL</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(editedRecord.testResults || []).map((row, idx) => (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      row.isAbnormal ? 'bg-amber-50/70 font-semibold' : idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                    }`}
                  >
                    {/* Column 1: Test Name */}
                    <td className="py-2 px-3 text-slate-900">
                      {isEditing ? (
                        <input
                          type="text"
                          value={row.testName}
                          onChange={(e) => handleTestFieldChange(idx, 'testName', e.target.value)}
                          className="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-full bg-white"
                        />
                      ) : (
                        <div className="flex items-center space-x-1.5">
                          <span>{row.testName}</span>
                          {row.isAbnormal && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-red-100 text-red-700 font-bold rounded-xs uppercase">
                              Abnormal
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Column 2: Result (Abnormal highlighted in bold/red) */}
                    <td className="py-2 px-3 text-center font-mono">
                      {isEditing ? (
                        <div className="flex items-center space-x-1 justify-center">
                          <input
                            type="text"
                            value={row.result}
                            onChange={(e) => handleTestFieldChange(idx, 'result', e.target.value)}
                            className="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-24 text-center bg-white"
                          />
                          <label className="text-[10px] flex items-center space-x-0.5 text-slate-500">
                            <input
                              type="checkbox"
                              checked={row.isAbnormal || false}
                              onChange={(e) => handleTestFieldChange(idx, 'isAbnormal', e.target.checked)}
                            />
                            <span>Flag</span>
                          </label>
                        </div>
                      ) : (
                        <span
                          className={`${
                            row.isAbnormal
                              ? 'font-black text-red-700 text-sm sm:text-base'
                              : 'font-semibold text-slate-900'
                          }`}
                        >
                          {row.result}
                        </span>
                      )}
                    </td>

                    {/* Column 3: Reference Range & Unit */}
                    <td className="py-2 px-3 text-right font-mono text-slate-700 text-xs">
                      {isEditing ? (
                        <input
                          type="text"
                          value={row.referenceRange || ''}
                          onChange={(e) => handleTestFieldChange(idx, 'referenceRange', e.target.value)}
                          className="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-full text-right bg-white"
                          placeholder="e.g. 13.5 - 17.5 g/dL"
                        />
                      ) : (
                        <span>{row.referenceRange || 'Standard normal'}</span>
                      )}
                    </td>

                    {isEditing && (
                      <td className="py-2 px-1 text-center print:hidden">
                        <button
                          onClick={() => removeTestRow(idx)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove Row"
                        >
                          ×
                        </button>
                      </td>
                    )}
                  </tr>
                ))}

                {/* If prescription record, also render the prescribed items cleanly in report table */}
                {editedRecord.prescriptionData?.medicines && editedRecord.prescriptionData.medicines.length > 0 && (
                  <>
                    <tr className="bg-teal-50/80 font-bold text-teal-900 border-t border-b border-teal-200">
                      <td colSpan={isEditing ? 4 : 3} className="py-2 px-3 text-xs uppercase tracking-wider">
                        Prescribed Medications & Dispensing Instructions
                      </td>
                    </tr>
                    {editedRecord.prescriptionData.medicines.map((med, mIdx) => (
                      <tr key={`med-${mIdx}`} className="border-b border-slate-100 text-xs">
                        <td className="py-2 px-3 font-semibold text-slate-900">{med.name}</td>
                        <td className="py-2 px-3 text-center font-mono text-teal-800 font-semibold">
                          {med.dosage} • {med.frequency}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-600">
                          {med.duration} ({med.instructions})
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>

            {isEditing && (
              <div className="py-2 px-3 bg-slate-50 border-t border-slate-200 print:hidden flex justify-start">
                <button
                  type="button"
                  onClick={addTestRow}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center space-x-1"
                >
                  <span>+ Add Test Parameter Row</span>
                </button>
              </div>
            )}
          </div>

          {/* 5. Doctor / AI Comments & Clinical Notes Section */}
          <div className="my-5 p-4 rounded-lg bg-slate-50 border border-slate-200 text-left space-y-3">
            <div>
              <div className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-teal-700" />
                <span>Clinical Interpretation & Diagnostic Summary:</span>
              </div>
              {isEditing ? (
                <textarea
                  value={editedRecord.clinicalNotes || ''}
                  onChange={(e) => setEditedRecord({ ...editedRecord, clinicalNotes: e.target.value })}
                  rows={3}
                  className="w-full border border-slate-300 rounded p-2 text-xs text-slate-800 bg-white mt-1 focus:ring-1 focus:ring-teal-500"
                />
              ) : (
                <p className="text-xs sm:text-sm text-slate-800 mt-1 leading-relaxed">
                  {editedRecord.clinicalNotes ||
                    'Clinical findings reviewed against standardized PMDC parameters. All values within expected diagnostic deviations.'}
                </p>
              )}
            </div>

            {editedRecord.doctorComments && (
              <div className="pt-2 border-t border-slate-200">
                <div className="font-bold text-slate-800 text-xs flex items-center space-x-1">
                  <span>Attending Physician Notes:</span>
                </div>
                {isEditing ? (
                  <textarea
                    value={editedRecord.doctorComments || ''}
                    onChange={(e) => setEditedRecord({ ...editedRecord, doctorComments: e.target.value })}
                    rows={2}
                    className="w-full border border-slate-300 rounded p-2 text-xs text-slate-800 bg-white mt-1"
                  />
                ) : (
                  <p className="text-xs text-slate-700 mt-0.5 italic">{editedRecord.doctorComments}</p>
                )}
              </div>
            )}

            {/* Disclaimer in smaller print */}
            <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-200">
              <strong>Statutory Tele-Triage Disclaimer:</strong> This electronic diagnostic report is generated via
              SehatSaathi Pro's AI-assisted triage system and validated in collaboration with licensed PMDC doctors. It is
              for clinical guidance and patient record keeping. For surgical decisions or critical life-threatening
              symptoms, please visit an accredited hospital emergency room or contact Rescue 1122 immediately.
            </div>
          </div>

          {/* 6. Verification & Sign-Off Section */}
          <div className="mt-8 pt-4 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-4">
            <div className="text-left space-y-1">
              <div className="font-mono text-[11px]">
                Report Ref: <span className="font-bold text-slate-900">{editedRecord.referenceNumber || editedRecord.id}</span>
              </div>
              <div className="text-[11px]">
                Status:{' '}
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                    editedRecord.status === 'doctor_approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {editedRecord.status === 'doctor_approved' ? 'Doctor Verified' : 'AI Preliminary'}
                </span>
              </div>
            </div>

            {/* Electronic Signature Stamp */}
            <div className="text-center sm:text-right border-2 border-dashed border-teal-700/60 p-2.5 rounded-lg bg-teal-50/40">
              <div className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                Electronically Verified & Signed
              </div>
              <div className="font-serif font-bold text-slate-900 text-sm">
                {editedRecord.reviewedByDoctor || 'Dr. Ayesha Malik'}
              </div>
              <div className="text-[10px] font-mono text-slate-600">
                {editedRecord.doctorPmdc || 'PMDC Registration #48291-P'}
              </div>
              <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                Auth Token: {editedRecord.id.slice(0, 12)}...
              </div>
            </div>
          </div>

          {/* 7. Report Footer (Matching reference footer style) */}
          <div className="mt-8 pt-3 border-t-2 border-teal-800 text-[10px] text-slate-500 space-y-1">
            <div className="flex flex-col sm:flex-row items-center justify-between font-mono">
              <span>Generated By: SehatSaathi Pro Clinical Triage & Lab Engine</span>
              <span>Report Authenticity: SECURE SHA-256</span>
              <span>Page 1 of 1</span>
            </div>
            <div className="text-center font-sans text-[10px] text-slate-600 pt-1">
              <strong>SehatSaathi Pro Diagnostic System</strong> • 24/7 Helpline: 1122 • Support: support@sehatsaathi.pk •
              Karachi, Lahore, Islamabad, Pakistan • Web: www.sehatsaathi.pk
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="bg-slate-100 border-t border-slate-200 px-4 py-3 flex items-center justify-between print:hidden">
          <div className="text-xs text-slate-500 font-medium">
            Saved in patient health record • Accessible anytime across devices
          </div>
          <div className="flex items-center space-x-2">
            <button
              id="report-modal-bottom-close"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg text-xs transition-colors"
            >
              Close
            </button>
            <button
              id="report-modal-bottom-print"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-lg text-xs flex items-center space-x-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Lab Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
