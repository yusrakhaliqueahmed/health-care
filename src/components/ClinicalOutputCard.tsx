import React, { useState } from 'react';
import {
  SupportedLanguage,
  UrgencyLevel,
} from '../types';
import {
  Stethoscope,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  ShieldCheck,
  HelpCircle,
  Activity,
  HeartPulse,
  Pill,
  Copy,
  Check,
  PhoneCall,
  FileCheck,
  Info,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { AudioPlayerControls } from './AudioPlayerControls';

interface ClinicalOutputCardProps {
  content: string;
  urgency?: UrgencyLevel;
  safetyStatus?: 'SAFE' | 'CAUTION' | 'DANGER';
  feature?: 'symptom' | 'medicine' | 'report';
  currentLanguage: SupportedLanguage;
  patientName?: string;
  patientAgeGroup?: string;
  medicineName?: string;
  onEmergencyCall?: () => void;
  onNavigateToCare?: (type: 'doctor' | 'pharmacy') => void;
  timestamp?: string;
  compact?: boolean;
}

interface ParsedClinicalSections {
  raw: string;
  overview: string;
  differentials: string[];
  redFlags: string[];
  carePlan: string[];
  homeCare: string[];
  doctorQuestions: string[];
  drugProfile: { label: string; value: string }[];
  ageSafety: string;
  indications: string[];
  contraindications: string[];
  sideEffects: { common: string[]; severe: string[] };
  safeUsage: string[];
}

/**
 * CleanClinicalText
 * Strips raw markdown asterisks, underscores, and hash marks.
 * Formats "Title: Description" patterns into clean bold titles and crisp descriptions.
 */
export const CleanClinicalText: React.FC<{ text: string; className?: string }> = ({
  text,
  className = '',
}) => {
  if (!text) return null;

  // Clean raw input from any stray backticks or hashes
  const sanitized = text.replace(/^[#\s*•\-]+/, '').trim();

  // Check if string is in "Title: Description" or "**Title**: Description" format
  const colonIndex = sanitized.indexOf(':');
  if (colonIndex > 0 && colonIndex < 60) {
    const rawTitle = sanitized.slice(0, colonIndex);
    const rawBody = sanitized.slice(colonIndex + 1);

    const cleanTitle = rawTitle.replace(/[*_#`~]/g, '').trim();
    const cleanBody = rawBody.replace(/[*_#`~]/g, '').trim();

    return (
      <span className={className}>
        <strong className="font-bold text-slate-900 dark:text-white mr-1.5">{cleanTitle}:</strong>
        <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{cleanBody}</span>
      </span>
    );
  }

  // Handle general inline bold patterns **bold** while completely purging any stray asterisks
  const parts = sanitized.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const cleanBold = part.slice(2, -2).replace(/[*_#`~]/g, '').trim();
          return (
            <strong key={i} className="font-bold text-slate-900 dark:text-white mr-1">
              {cleanBold}
            </strong>
          );
        }
        // Scrub any stray asterisks, backticks, or markdown artifacts from regular text
        const cleanRegular = part.replace(/[*_#`~]/g, '');
        return <React.Fragment key={i}>{cleanRegular}</React.Fragment>;
      })}
    </span>
  );
};

/**
 * EditorialArticleView
 * Renders raw clinical text as an elegant, clean editorial layout with NO markdown artifacts.
 */
const EditorialArticleView: React.FC<{
  content: string;
}> = ({ content }) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];

  const flushList = (key: string) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={key} className="space-y-2 my-2.5 pl-1">
          {currentList.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200"
            >
              <span className="w-2 h-2 rounded-full bg-teal-600 mt-1.5 shrink-0" />
              <CleanClinicalText text={item} />
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList(`list-before-${idx}`);
      return;
    }

    // Check if line is a header (### or ## or #)
    if (trimmed.startsWith('#')) {
      flushList(`list-h-${idx}`);
      const cleanHeader = trimmed.replace(/^[#\s*]+/, '').replace(/[*#]/g, '').trim();
      elements.push(
        <div
          key={`h-${idx}`}
          className="pt-4 pb-1.5 border-b border-slate-200/70 dark:border-slate-800/80 first:pt-0"
        >
          <h4 className="text-sm sm:text-base font-extrabold text-teal-800 dark:text-teal-300 tracking-wide flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
            {cleanHeader}
          </h4>
        </div>
      );
      return;
    }

    // Check if line is bullet item (- or * or • or number.)
    const bulletMatch = trimmed.match(/^[-*•\d.]+\s+(.+)$/);
    if (bulletMatch) {
      currentList.push(bulletMatch[1]);
      return;
    }

    // Regular paragraph
    flushList(`list-p-${idx}`);
    elements.push(
      <p
        key={`p-${idx}`}
        className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300"
      >
        <CleanClinicalText text={trimmed} />
      </p>
    );
  });

  flushList('list-end');

  return <div className="space-y-3 p-5 sm:p-7">{elements}</div>;
};

function parseClinicalContent(rawContent: string, isMedicine: boolean): ParsedClinicalSections {
  const result: ParsedClinicalSections = {
    raw: rawContent,
    overview: '',
    differentials: [],
    redFlags: [],
    carePlan: [],
    homeCare: [],
    doctorQuestions: [],
    drugProfile: [],
    ageSafety: '',
    indications: [],
    contraindications: [],
    sideEffects: { common: [], severe: [] },
    safeUsage: [],
  };

  if (!rawContent) return result;

  const lines = rawContent.split('\n');
  let currentSection = 'overview';
  const sectionBuffers: Record<string, string[]> = {
    overview: [],
    differentials: [],
    redFlags: [],
    carePlan: [],
    homeCare: [],
    doctorQuestions: [],
    drugProfile: [],
    ageSafety: [],
    indications: [],
    contraindications: [],
    sideEffects: [],
    safeUsage: [],
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const lower = line.toLowerCase();

    // Check if line is a section header
    let matchedNewSection: string | null = null;

    if (
      lower.includes('clinical overview') ||
      lower.includes('طبی خلاصہ') ||
      lower.includes('tibbi khulasa') ||
      lower.includes('summary') ||
      lower.includes('assessment')
    ) {
      matchedNewSection = 'overview';
    } else if (
      lower.includes('differential') ||
      lower.includes('possible cause') ||
      lower.includes('mumkin wajoo') ||
      lower.includes('mumkin wajah') ||
      lower.includes('ممکنہ وجوہات') ||
      lower.includes('causes & considerations')
    ) {
      matchedNewSection = 'differentials';
    } else if (
      lower.includes('red flag') ||
      lower.includes('danger') ||
      lower.includes('khatray ki nishan') ||
      lower.includes('khatarnak') ||
      lower.includes('خطرے کی علامات') ||
      lower.includes('فوری الرٹ') ||
      lower.includes('urgent sign') ||
      lower.includes('emergency alert') ||
      lower.includes('critical alert') ||
      lower.includes('seek immediate')
    ) {
      matchedNewSection = 'redFlags';
    } else if (
      lower.includes('action plan') ||
      lower.includes('care plan') ||
      lower.includes('recommended') ||
      lower.includes('next clinical step') ||
      lower.includes('tajweez kardah') ||
      lower.includes('تجویز کردہ طبی لائحہ عمل') ||
      lower.includes('aglay iqdaam')
    ) {
      matchedNewSection = 'carePlan';
    } else if (
      lower.includes('home care') ||
      lower.includes('supportive') ||
      lower.includes('gharelu') ||
      lower.includes('محفوظ گھریلو') ||
      lower.includes('lifestyle') ||
      lower.includes('self-care')
    ) {
      matchedNewSection = 'homeCare';
    } else if (
      lower.includes('question') ||
      lower.includes('ask your doctor') ||
      lower.includes('doctor se poochne') ||
      lower.includes('ڈاکٹر سے پوچھنے والے') ||
      lower.includes('inquire')
    ) {
      matchedNewSection = 'doctorQuestions';
    } else if (isMedicine) {
      if (
        lower.includes('drug profile') ||
        lower.includes('active ingredient') ||
        lower.includes('classification') ||
        lower.includes('dawa ki shanakht') ||
        lower.includes('دوا کی شناخت')
      ) {
        matchedNewSection = 'drugProfile';
      } else if (
        lower.includes('age-calibrated') ||
        lower.includes('age safety') ||
        lower.includes('umar ke mutabiq') ||
        lower.includes('عمر کے مطابق')
      ) {
        matchedNewSection = 'ageSafety';
      } else if (
        lower.includes('contraindication') ||
        lower.includes('warnings') ||
        lower.includes('mumanat') ||
        lower.includes('ممانعت')
      ) {
        matchedNewSection = 'contraindications';
      } else if (
        lower.includes('side effect') ||
        lower.includes('adverse') ||
        lower.includes('manfi asraat') ||
        lower.includes('منفی اثرات')
      ) {
        matchedNewSection = 'sideEffects';
      } else if (
        lower.includes('dosage') ||
        lower.includes('safe usage') ||
        lower.includes('administration') ||
        lower.includes('tareeqa-e-istemal') ||
        lower.includes('طریقہ استعمال')
      ) {
        matchedNewSection = 'safeUsage';
      }
    }

    if (matchedNewSection) {
      currentSection = matchedNewSection;
      continue;
    }

    sectionBuffers[currentSection].push(line);
  }

  // Helper clean item: strip leading bullets, numbers, dashes, and asterisks
  const cleanList = (arr: string[]): string[] => {
    return arr
      .map((l) => l.replace(/^[-*•\d.]+\s*/, '').replace(/[*_#`~]/g, '').trim())
      .filter((l) => l.length > 0 && !l.startsWith('#'));
  };

  result.overview = sectionBuffers.overview.join(' ').replace(/^#{1,4}\s*/, '').replace(/[*_#`~]/g, '').trim();
  result.differentials = cleanList(sectionBuffers.differentials);
  result.redFlags = cleanList(sectionBuffers.redFlags);
  result.carePlan = cleanList(sectionBuffers.carePlan);
  result.homeCare = cleanList(sectionBuffers.homeCare);
  result.doctorQuestions = cleanList(sectionBuffers.doctorQuestions);

  result.ageSafety = sectionBuffers.ageSafety.join(' ').replace(/[*_#`~]/g, '').trim();
  result.indications = cleanList(sectionBuffers.indications);
  result.contraindications = cleanList(sectionBuffers.contraindications);
  result.safeUsage = cleanList(sectionBuffers.safeUsage);

  // Parse Drug profile key-values
  sectionBuffers.drugProfile.forEach((l) => {
    const parts = l.replace(/^[-*•]\s*/, '').split(/[:\-–—]\s*/);
    if (parts.length >= 2) {
      result.drugProfile.push({
        label: parts[0].replace(/[*_#`~]/g, '').trim(),
        value: parts.slice(1).join(': ').replace(/[*_#`~]/g, '').trim(),
      });
    } else if (l.trim()) {
      result.drugProfile.push({
        label: 'Info',
        value: l.replace(/[*_#`~]/g, '').trim(),
      });
    }
  });

  // Parse side effects
  const rawSideEffects = cleanList(sectionBuffers.sideEffects);
  rawSideEffects.forEach((se) => {
    const lower = se.toLowerCase();
    if (
      lower.includes('severe') ||
      lower.includes('stop immediately') ||
      lower.includes('allergic') ||
      lower.includes('emergency') ||
      lower.includes('shadeed') ||
      lower.includes('شدید')
    ) {
      result.sideEffects.severe.push(se);
    } else {
      result.sideEffects.common.push(se);
    }
  });

  // Fallback if overview was not extracted
  if (!result.overview && sectionBuffers.overview.length === 0) {
    const firstPara = rawContent.split(/\n\s*\n/)[0] || rawContent.slice(0, 250);
    result.overview = firstPara.replace(/[*_#`~]/g, '').trim();
  }

  return result;
}

export const ClinicalOutputCard: React.FC<ClinicalOutputCardProps> = ({
  content,
  urgency = 'GREEN',
  safetyStatus,
  feature = 'symptom',
  currentLanguage,
  patientName = 'Patient',
  patientAgeGroup,
  onNavigateToCare,
  timestamp,
}) => {
  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';
  const isMedicine = feature === 'medicine';

  const [viewMode, setViewMode] = useState<'structured' | 'editorial'>('structured');
  const [copied, setCopied] = useState(false);
  const [checkedQuestions, setCheckedQuestions] = useState<Record<number, boolean>>({});

  const parsed = parseClinicalContent(content, isMedicine);

  const handleCopySummary = () => {
    // Copy clean text without asterisks
    const cleanText = content.replace(/[*_`~]/g, '');
    navigator.clipboard.writeText(cleanText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleQuestionCheck = (idx: number) => {
    setCheckedQuestions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const isEmergency = urgency === 'RED' || safetyStatus === 'DANGER';
  const isCaution = urgency === 'YELLOW' || safetyStatus === 'CAUTION';

  const statusTheme = isEmergency
    ? {
        border: 'border-red-300 dark:border-red-800',
        badgeBg: 'bg-red-600 text-white',
        cardBg: 'bg-red-50/70 dark:bg-red-950/30',
        headerText: 'text-red-900 dark:text-red-200',
        icon: AlertOctagon,
        label: isUrdu
          ? 'ایمرجنسی الرٹ (RED)'
          : isRoman
          ? 'Emergency Khatra (RED)'
          : 'High Urgency (RED Emergency)',
      }
    : isCaution
    ? {
        border: 'border-amber-300 dark:border-amber-700',
        badgeBg: 'bg-amber-500 text-slate-950',
        cardBg: 'bg-amber-50/70 dark:bg-amber-950/30',
        headerText: 'text-amber-900 dark:text-amber-200',
        icon: Clock,
        label: isUrdu
          ? 'طبی توجہ درکار (YELLOW)'
          : isRoman
          ? 'Doctor Mashwara Zaroori (YELLOW)'
          : 'Moderate (Doctor Consultation Within 24-48h)',
      }
    : {
        border: 'border-emerald-300 dark:border-emerald-800',
        badgeBg: 'bg-emerald-600 text-white',
        cardBg: 'bg-emerald-50/60 dark:bg-emerald-950/30',
        headerText: 'text-emerald-900 dark:text-emerald-200',
        icon: CheckCircle2,
        label: isUrdu
          ? 'معمولی علامات (GREEN)'
          : isRoman
          ? 'Gharelu Ehtiyaat (GREEN)'
          : 'Mild / Stable (GREEN - Home Care & Observation)',
      };

  const StatusIcon = statusTheme.icon;

  return (
    <div
      className={`w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden text-slate-900 dark:text-slate-100 transition-all ${
        isUrdu ? 'rtl text-right font-urdu' : 'ltr text-left'
      }`}
      dir={isUrdu ? 'rtl' : 'ltr'}
    >
      {/* Top Clinical Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-850 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-600/10 dark:bg-teal-400/10 text-teal-700 dark:text-teal-300">
            {isMedicine ? <Pill className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {isMedicine
                  ? isUrdu
                    ? 'فارماکولوجی سیفٹی رپورٹ'
                    : isRoman
                    ? 'Dawai Ki Hifazati Report'
                    : 'Pharmacology Safety Assessment'
                  : isUrdu
                  ? 'طبی تشخیص اور رہنمائی'
                  : isRoman
                  ? 'Tibbi Tashkhees aur Rehnumai'
                  : 'Clinical Triage Evaluation'}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800">
                <ShieldCheck className="w-3 h-3" />
                <span>
                  {isUrdu
                    ? 'پی ایم ڈی سی اور ڈریپ رہنما اصول'
                    : isRoman
                    ? 'PMDC aur DRAP Qawaneen'
                    : 'PMDC & DRAP Guidelines'}
                </span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {patientName} {patientAgeGroup ? `• ${patientAgeGroup}` : ''} •{' '}
              {timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Action Controls: View Switcher & Copy */}
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setViewMode('structured')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'structured'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {isUrdu ? 'منظم کارڈز' : isRoman ? 'Munazzam Cards' : 'Structured View'}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('editorial')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'editorial'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {isUrdu ? 'مکمل تحریر' : isRoman ? 'Mukammal Tehzeer' : 'Article View'}
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopySummary}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            title="Copy clinical text"
            aria-label="Copy clinical text"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline text-[11px]">
              {copied
                ? isUrdu
                  ? 'کاپی ہوگیا'
                  : isRoman
                  ? 'Copy Ho Gaya'
                  : 'Copied'
                : isUrdu
                ? 'کاپی'
                : isRoman
                ? 'Copy'
                : 'Copy'}
            </span>
          </button>
        </div>
      </div>

      {/* Clinical Urgency & Safety Status Banner */}
      <div
        className={`p-4 sm:p-5 border-b ${statusTheme.border} ${statusTheme.cardBg} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-2xl ${statusTheme.badgeBg} shrink-0 shadow-xs mt-0.5`}>
            <StatusIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-black uppercase tracking-wider ${statusTheme.headerText}`}>
                {isMedicine
                  ? isUrdu
                    ? 'فارماکولوجیکل سیفٹی'
                    : isRoman
                    ? 'Dawai Ki Hifazat'
                    : 'Pharmacological Safety'
                  : isUrdu
                  ? 'ٹریاج اسٹیٹس'
                  : isRoman
                  ? 'Triage Status'
                  : 'Triage Status'}
              </span>
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md ${statusTheme.badgeBg}`}>
                {statusTheme.label}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold mt-1 text-slate-800 dark:text-slate-100">
              {isEmergency
                ? isUrdu
                  ? 'یہ سنگین یا ایمرجنسی علامات ہیں۔ فوری ہسپتال یا ریسکیو 1122 سے رابطہ ضروری ہے۔'
                  : isRoman
                  ? 'Yeh shadeed emergency alamaat hain. Foran hospital ya 1122 se rabta karein.'
                  : 'Acute or emergency indicators detected. Seek immediate emergency physician care.'
                : isCaution
                ? isUrdu
                  ? 'ڈاکٹر سے 24 سے 48 گھنٹوں میں معائنہ کروائیں۔ علامات میں اضافہ ہو تو دیر نہ کریں۔'
                  : isRoman
                  ? 'Doctor se 24-48 ghanton mein jaanch karwayein. Alamaat barhein toh dair na karein.'
                  : 'Moderate severity. Schedule an evaluation with a certified doctor within 24–48 hours.'
                : isUrdu
                ? 'معمولی علامات۔ پرسکون رہیں، آرام کریں اور درج ذیل گھریلو تدابیر اختیار کریں۔'
                : isRoman
                ? 'Mamooli alamaat. Pur-sukoon rahein, aaram karein aur darj zail gharelu tadabeer ikhtiyar karein.'
                : 'Condition appears stable and manageable at home with hydration, rest, and observation.'}
            </p>
          </div>
        </div>

        {/* Emergency Call Button if Red */}
        {isEmergency && (
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="tel:1122"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm shadow-md transition-transform active:scale-95 animate-pulse cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>
                {isUrdu ? 'ریسکیو 1122 ملائیں' : isRoman ? 'Rescue 1122 Milayein' : 'Dial Rescue 1122'}
              </span>
            </a>
          </div>
        )}
      </div>

      {/* Structured Clinical Layout */}
      {viewMode === 'structured' ? (
        <div className="p-4 sm:p-6 space-y-5">
          {/* 1. Clinical Overview / Assessment */}
          {parsed.overview && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-extrabold text-xs uppercase tracking-wider">
                <Info className="w-4 h-4" />
                <span>
                  {isUrdu
                    ? 'جامع طبی خلاصہ اور جائزہ'
                    : isRoman
                    ? 'Mukammal Tibbi Khulasa aur Jaiza'
                    : 'Clinical Summary & Presentation Assessment'}
                </span>
              </div>
              <p className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
                <CleanClinicalText text={parsed.overview} />
              </p>
            </div>
          )}

          {/* MEDICINE SPECIFIC: Drug Profile & Classification */}
          {isMedicine && parsed.drugProfile.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/80 space-y-3">
              <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-extrabold text-xs uppercase tracking-wider">
                <Pill className="w-4 h-4" />
                <span>
                  {isUrdu
                    ? 'دوا کی شناخت اور درجہ بندی'
                    : isRoman
                    ? 'Dawai Ki Shanakht aur Components'
                    : 'Drug Profile & Active Ingredients'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {parsed.drugProfile.map((dp, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900/60 shadow-2xs"
                  >
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 block">
                      {dp.label}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {dp.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MEDICINE SPECIFIC: Age-Specific Evaluation */}
          {isMedicine && parsed.ageSafety && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-extrabold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>
                  {isUrdu
                    ? 'مریض کی عمر کے مطابق جانچ'
                    : isRoman
                    ? 'Umar Ke Mutabiq Hifazati Jaiza'
                    : 'Age-Calibrated Safety Analysis'}
                </span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                <CleanClinicalText text={parsed.ageSafety} />
              </p>
            </div>
          )}

          {/* 2. Differential Considerations & Potential Causes */}
          {parsed.differentials.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-extrabold text-xs uppercase tracking-wider">
                <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>
                  {isUrdu
                    ? 'ممکنہ طبی وجوہات (ڈاکٹر سے تصدیق طلب)'
                    : isRoman
                    ? 'Mumkin Wajoohaat (Doctor se tasdeeq talab)'
                    : 'Potential Causes & Differentials for Doctor Review'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {parsed.differentials.map((diff, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-start gap-2.5"
                  >
                    <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                    <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-snug">
                      <CleanClinicalText text={diff} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. High Priority Alert / Red Flags Card */}
          {parsed.redFlags.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-800 space-y-3">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-extrabold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 animate-pulse" />
                <span>
                  {isUrdu
                    ? 'خطرناک انتباہی علامات (Red Flags)'
                    : isRoman
                    ? 'Khatray Ki Nishaniyan (Red Flags)'
                    : 'Warning Signs & Critical Red Flags (Seek Urgent Care)'}
                </span>
              </div>
              <ul className="space-y-2">
                {parsed.redFlags.map((rf, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-red-900 dark:text-red-200"
                  >
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <CleanClinicalText text={rf} />
                    </div>
                  </li>
                ))}
              </ul>
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-red-200 dark:border-red-900/60 text-xs">
                <span className="text-red-800 dark:text-red-300 font-medium">
                  {isUrdu
                    ? 'اگر یہ علامات ہوں تو تاخیر مت کریں'
                    : isRoman
                    ? 'Agar yeh alamaat hon toh dair mat karein'
                    : 'Do not wait if these symptoms occur'}
                </span>
                <a
                  href="tel:1122"
                  className="font-bold text-red-700 dark:text-red-400 hover:underline flex items-center gap-1"
                >
                  <span>Rescue 1122</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* MEDICINE SPECIFIC: Contraindications & Warnings */}
          {isMedicine && parsed.contraindications.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold text-xs uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>
                  {isUrdu
                    ? 'ممانعت اور مضر اثرات کا انتباہ'
                    : isRoman
                    ? 'Mumanat aur Ehtiyati Warnings'
                    : 'Contraindications & Critical Safety Warnings'}
                </span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
                {parsed.contraindications.map((ci, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <div>
                      <CleanClinicalText text={ci} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* MEDICINE SPECIFIC: Side Effects Matrix */}
          {isMedicine && (parsed.sideEffects.common.length > 0 || parsed.sideEffects.severe.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {parsed.sideEffects.common.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {isUrdu
                      ? 'عام متوقع منفی اثرات'
                      : isRoman
                      ? 'Aam Mutawaqqa Side Effects'
                      : 'Common / Mild Side Effects'}
                  </span>
                  <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                    {parsed.sideEffects.common.map((se, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span>•</span>
                        <CleanClinicalText text={se} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {parsed.sideEffects.severe.length > 0 && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 space-y-2">
                  <span className="text-xs font-bold text-red-800 dark:text-red-300 block">
                    {isUrdu
                      ? 'شدید ردعمل (فوری دوا روکیں)'
                      : isRoman
                      ? 'Shadeed Reaction (Foran Band Karein)'
                      : 'Severe Reactions (Stop Immediately)'}
                  </span>
                  <ul className="text-xs space-y-1 text-red-700 dark:text-red-300">
                    {parsed.sideEffects.severe.map((se, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span>⚠️</span>
                        <CleanClinicalText text={se} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 4. Actionable Clinical Next Steps */}
          {parsed.carePlan.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/40 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/70 space-y-3">
              <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-extrabold text-xs uppercase tracking-wider">
                <FileCheck className="w-4 h-4 text-teal-600" />
                <span>
                  {isUrdu
                    ? 'تجویز کردہ طبی لائحہ عمل'
                    : isRoman
                    ? 'Tajweez Kardah Aglay Iqdaamaat'
                    : 'Recommended Next Clinical Steps'}
                </span>
              </div>
              <div className="space-y-2.5">
                {parsed.carePlan.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900/40 shadow-2xs"
                  >
                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-snug">
                      <CleanClinicalText text={step} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Supportive Home Measures */}
          {parsed.homeCare.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-extrabold text-xs uppercase tracking-wider">
                <HeartPulse className="w-4 h-4 text-teal-600" />
                <span>
                  {isUrdu
                    ? 'محفوظ گھریلو احتیاطی تدابیر'
                    : isRoman
                    ? 'Ghar Par Mehfooz Dekhbhal'
                    : 'Safe Supportive Measures at Home'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                {parsed.homeCare.map((care, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div className="text-slate-700 dark:text-slate-300">
                      <CleanClinicalText text={care} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Questions for Your Doctor (Interactive Checklist) */}
          {parsed.doctorQuestions.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-extrabold text-xs uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  <span>
                    {isUrdu
                      ? 'ڈاکٹر کے پاس جانے سے پہلے ضروری سوالات'
                      : isRoman
                      ? 'Doctor Se Poochne Walay Zaroori Sawalaat'
                      : 'Questions to Ask Your Doctor at Your Visit'}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 rounded-md">
                  {isUrdu
                    ? 'کلینک ساتھ لے جائیں'
                    : isRoman
                    ? 'Clinic Saath Le Jayein'
                    : 'Take to Clinic'}
                </span>
              </div>

              <div className="space-y-2">
                {parsed.doctorQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleQuestionCheck(idx)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all text-left cursor-pointer ${
                      checkedQuestions[idx]
                        ? 'bg-indigo-100/70 dark:bg-indigo-900/40 border-indigo-400 text-indigo-950 dark:text-indigo-200 line-through opacity-80'
                        : 'bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-900/40 text-slate-800 dark:text-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                        checkedQuestions[idx]
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {checkedQuestions[idx] && <Check className="w-3 h-3" />}
                    </div>
                    <div className="leading-snug">
                      <CleanClinicalText text={q} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Editorial Clean View (Formatted Text & Prose with ZERO asterisks) */
        <EditorialArticleView content={content} />
      )}

      {/* Audio Playback Controls Footer (Manual User Trigger Only) */}
      <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-slate-100/90 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-auto">
          <AudioPlayerControls
            currentLanguage={currentLanguage}
            textToSpeak={content.replace(/[*_#`~]/g, '')}
            compact
          />
        </div>

        {/* Quick Navigation Shortcuts */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          {onNavigateToCare && (
            <>
              <button
                type="button"
                onClick={() => onNavigateToCare('doctor')}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                {isUrdu ? 'ڈاکٹر سے مشورہ' : isRoman ? 'Doctor Dhundein' : 'Find Doctor'}
              </button>
              {isMedicine && (
                <button
                  type="button"
                  onClick={() => onNavigateToCare('pharmacy')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
                >
                  {isUrdu ? 'مستند فارمیسی' : isRoman ? 'Pharmacy Dhundein' : 'Verified Pharmacy'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Official Clinical Regulatory Footnote */}
      <div className="px-4 py-2 sm:px-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-teal-600" />
          <span>
            {isUrdu
              ? 'ابتدائی اے آئی ٹریاج • پی ایم ڈی سی طبی معائنے کا متبادل نہیں'
              : isRoman
              ? 'Ibtedai AI Triage • PMDC tibbi muainay ka mutabadil nahi'
              : 'Preliminary AI Clinical Triage • Not a substitute for licensed PMDC clinical exam'}
          </span>
        </span>
        <span className="hidden sm:inline">WHO / DRAP Pharmacopeia Standard</span>
      </div>
    </div>
  );
};
