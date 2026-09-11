import React, { useState } from 'react';
import {
  Sparkles,
  Maximize2,
  CheckCircle2,
  Heart,
  ShieldCheck,
  X,
  Activity,
  PhoneCall,
  MessageSquare,
  Info,
} from 'lucide-react';
import { SupportedLanguage } from '../types';
import { Realistic3DHeart } from './Realistic3DHeart';
import { EmergencyCallModal } from './EmergencyCallModal';
import { MedicalQuickMessageModal } from './MedicalQuickMessageModal';

interface Diagnostic3DHeartCardProps {
  currentLanguage?: SupportedLanguage;
  size?: number;
  interactive?: boolean;
  showExpandButton?: boolean;
  className?: string;
  onOpenCall?: () => void;
  onOpenMessage?: () => void;
}

export const Diagnostic3DHeartCard: React.FC<Diagnostic3DHeartCardProps> = ({
  currentLanguage = 'en',
  size = 210,
  interactive = true,
  showExpandButton = true,
  className = '',
  onOpenCall,
  onOpenMessage,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [bpm, setBpm] = useState(72);
  const [activeChamber, setActiveChamber] = useState<string | null>('lv');
  const [showInternalCallModal, setShowInternalCallModal] = useState(false);
  const [showInternalMsgModal, setShowInternalMsgModal] = useState(false);

  const handleCallClick = () => {
    if (onOpenCall) {
      onOpenCall();
    } else {
      setShowInternalCallModal(true);
    }
  };

  const handleMessageClick = () => {
    if (onOpenMessage) {
      onOpenMessage();
    } else {
      setShowInternalMsgModal(true);
    }
  };

  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';

  // Clinical telemetry titles matching professional medical standard
  const titles = {
    header: isUrdu
      ? '3D تشخیصی دل اور اناٹومی'
      : isRoman
      ? '3D Diagnostic Dil aur Anatomy'
      : '3D Diagnostic Heart & Anatomy',
    webgl: '3D WEBGL',
    modelBadge: isUrdu ? 'PMDC مستند اناٹومیکل ماڈل' : isRoman ? 'PMDC Verified Model' : 'PMDC Anatomical Model',
    expandBtn: isUrdu ? 'بڑا کریں' : isRoman ? 'Bara Karein' : 'Expand 3D',
    rhythm: isUrdu ? 'نارمل سائنَس رِدم' : isRoman ? 'Normal Sinus Rhythm' : 'Normal Sinus Rhythm',
  };

  const chambers = [
    {
      id: 'lv',
      nameEn: 'Left Ventricle (LV)',
      nameUr: 'بایاں بطن (Left Ventricle)',
      nameRoman: 'Bayan Batan (Left Ventricle)',
      pressure: '120 mmHg',
      type: 'Oxygenated Blood',
      descEn: 'Primary thick muscular pumping chamber generating systemic arterial systolic blood pressure (~120 mmHg) to nourish all body tissues.',
      descUr: 'دل کا سب سے طاقتور عضلاتی حصہ جو خون کو زیادہ دباؤ (120 mmHg) کے ساتھ پورے جسم میں پہنچاتا ہے۔',
      descRoman: 'Dil ka sab se muscular hissa jo khoon ko pore jism mein 120 mmHg pressure par bhejta hai.',
    },
    {
      id: 'rv',
      nameEn: 'Right Ventricle (RV)',
      nameUr: 'دایاں بطن (Right Ventricle)',
      nameRoman: 'Dayan Batan (Right Ventricle)',
      pressure: '25 mmHg',
      type: 'Deoxygenated Blood',
      descEn: 'Pumps deoxygenated venous blood into the pulmonary artery and lungs for gas exchange and re-oxygenation.',
      descUr: 'آکسیجن سے محروم خون کو پھیپھڑوں کی طرف بھیجتا ہے تاکہ وہاں سے تازہ آکسیجن حاصل ہو سکے۔',
      descRoman: 'Deoxygenated khoon ko phephron (lungs) ki taraf bhejta hai oxygen lene ke liye.',
    },
    {
      id: 'aorta',
      nameEn: 'Aorta & Great Vessels',
      nameUr: 'شہ رگ (Aorta) اور بڑی شریانیں',
      nameRoman: 'Aorta aur Great Vessels',
      pressure: '120/80 mmHg',
      type: 'Systemic Conduit',
      descEn: 'The body’s largest high-pressure arterial conduit, arching over the pulmonary trunk with 3 cephalic branches.',
      descUr: 'انسانی جسم کی سب سے بڑی خون کی نالی جو آکسیجن والا خون دماغ اور باقی اعضاء تک لے جاتی ہے۔',
      descRoman: 'Jism ki sab se bari arterial nali jo dimagh aur pore jism tak oxygen wala khoon le kar jati hai.',
    },
    {
      id: 'coronary',
      nameEn: 'Coronary Arteries (LAD/RCA)',
      nameUr: 'کورونری شریانیں (LAD/RCA)',
      nameRoman: 'Coronary Arteries (LAD/RCA)',
      pressure: 'Myocardial Perfusion',
      type: 'Nutrient Supply',
      descEn: 'Crucial vascular network providing oxygenated blood directly to the myocardium. LAD supplies 50% of heart muscle.',
      descUr: 'دل کے اپنے پٹھوں کو خون پہنچانے والی باریک شریانیں۔ ان میں رکاوٹ دل کے دورے (Heart Attack) کا سبب بنتی ہے۔',
      descRoman: 'Dil ke apne muscles ko khoon supply karti hain. In me blockage se heart attack hota hai.',
    },
  ];

  return (
    <>
      {/* Primary 3D Diagnostic Heart Card */}
      <div
        id="card-3d-diagnostic-heart"
        className={`w-full max-w-sm rounded-2xl bg-gradient-to-b from-[#062420] via-[#051c19] to-[#031513] border border-teal-500/40 backdrop-blur-md p-4 sm:p-5 shadow-[0_16px_40px_rgba(0,0,0,0.65)] relative overflow-hidden transition-all duration-300 hover:border-teal-400/60 ${className}`}
      >
        {/* Ambient background glow inside card */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-rose-500/12 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header matching video: [Sparkle] "3D Diagnostic Heart & Anatomy"  "3D WEBGL" */}
        <div className="flex items-center justify-between gap-2 mb-2 pb-2.5 border-b border-teal-800/60 text-xs z-10 relative">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-900/80 text-teal-300 border border-teal-600/40 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            </span>
            <div>
              <span className="font-bold text-white text-xs sm:text-[13px] tracking-tight block">
                {titles.header}
              </span>
              <span className="text-[10px] text-teal-300/80 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                {titles.rhythm}
              </span>
            </div>
          </div>
          <span className="font-mono text-[10px] uppercase font-bold text-cyan-300 bg-teal-900/90 px-2.5 py-1 rounded-full border border-cyan-500/40 tracking-wider shadow-2xs">
            {titles.webgl}
          </span>
        </div>

        {/* Center: 3D Anatomical Heart Stage */}
        <div className="relative w-full min-h-[220px] rounded-xl overflow-hidden bg-radial from-teal-900/40 via-teal-950/25 to-transparent flex flex-col items-center justify-center py-2 select-none border border-teal-800/40">
          {/* Subtle soft-focus depth glow behind the 3D model */}
          <div
            className="absolute w-44 h-44 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(225, 29, 72, 0.32) 0%, rgba(13, 148, 136, 0.18) 50%, transparent 75%)',
              filter: 'blur(30px)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />

          <Realistic3DHeart
            size={size}
            interactive={interactive}
            showSoundToggle={true}
            showTelemetry={true}
            bpm={bpm}
            showViewControls={false}
          />
        </div>

        {/* Live Cardiac Telemetry Quick Bar */}
        <div className="mt-2.5 py-1.5 px-3 rounded-lg bg-teal-950/70 border border-teal-800/50 flex items-center justify-between text-[11px] font-mono z-10 relative">
          <div className="flex items-center gap-1.5 text-teal-300">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-pulse" />
            <span className="font-bold text-cyan-300">{bpm} BPM</span>
          </div>
          <div className="flex items-center gap-2 text-teal-200/90 text-[10px]">
            <span>SV: ~70 mL</span>
            <span className="text-teal-700">|</span>
            <span>CO: ~5.0 L/m</span>
          </div>
        </div>

        {/* Dual Quick Action Hub: Call & App Message Buttons (Side by Side) */}
        <div className="mt-3 pt-2.5 border-t border-teal-800/60 grid grid-cols-2 gap-2 z-10 relative">
          {/* Emergency Call Button */}
          <button
            type="button"
            id="card-action-call-btn"
            onClick={handleCallClick}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-red-950/50 border border-red-400/40 transition-all cursor-pointer"
            title="Emergency Call Helpline (1122)"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
            <span className="truncate">{isUrdu ? 'کال 1122' : 'Call 1122'}</span>
          </button>

          {/* App Message Button */}
          <button
            type="button"
            id="card-action-msg-btn"
            onClick={handleMessageClick}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-950/50 border border-emerald-400/40 transition-all cursor-pointer"
            title="Quick Medical Message / WhatsApp & SMS Triage"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="truncate">{isUrdu ? 'طبی میسج' : 'App Message'}</span>
          </button>
        </div>

        {/* Bottom Bar matching video: [Check] "PMDC Anatomical Model"  [Expand] "Expand 3D" */}
        <div className="mt-2.5 flex items-center justify-between text-xs z-10 relative">
          <div className="flex items-center gap-1.5 text-teal-200 text-[11px] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{titles.modelBadge}</span>
          </div>

          {showExpandButton && (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-800/80 hover:bg-teal-700 border border-teal-500/50 text-cyan-200 hover:text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Maximize2 className="w-3 h-3 text-cyan-300" />
              <span>{titles.expandBtn}</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Interactive 3D Anatomy Modal */}
      {isExpanded && (
        <div
          id="expanded-3d-heart-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-gradient-to-b from-[#072822] via-[#051e19] to-[#041613] border border-teal-500/50 text-white shadow-2xl p-4 sm:p-6 relative flex flex-col items-center max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-rose-500/12 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-teal-800/70 z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-900/90 border border-teal-600/50 shadow-md">
                  <Activity className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                    {titles.header}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-teal-300/90 flex items-center gap-1.5 mt-0.5">
                    <span>{titles.modelBadge}</span>
                    <span>•</span>
                    <span className="font-mono text-cyan-300 font-bold">{titles.webgl}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-2 rounded-xl bg-teal-900/80 hover:bg-teal-800 border border-teal-700/60 text-teal-200 hover:text-white transition-colors cursor-pointer shadow-xs"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Large 3D Interactive Heart Stage with Synchronized ECG Monitor */}
            <div className="w-full flex flex-col items-center justify-center py-3 relative z-10">
              <div
                className="absolute w-60 h-60 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(225, 29, 72, 0.35) 0%, rgba(13, 148, 136, 0.20) 50%, transparent 75%)',
                  filter: 'blur(40px)',
                  animation: 'pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              />
              <Realistic3DHeart
                size={270}
                interactive={true}
                showTelemetry={false}
                showSoundToggle={true}
                bpm={bpm}
                showViewControls={true}
                showEcgMonitor={true}
                activeChamberId={activeChamber}
              />
            </div>

            {/* Cardiac Telemetry & BPM Speed Simulator */}
            <div className="w-full bg-teal-950/80 rounded-xl p-3.5 border border-teal-800/70 mt-2 z-10 space-y-2.5 shadow-md">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-teal-200 font-semibold">
                  <Heart className="w-4 h-4 text-rose-400 fill-rose-400 animate-pulse" />
                  <span>
                    {isUrdu ? 'دھڑکن کی رفتار (Cardiac Rhythm)' : 'Cardiac Rhythm & Heart Rate'}
                  </span>
                </div>
                <span className="font-mono font-bold text-cyan-300 text-sm bg-teal-900/90 px-2.5 py-0.5 rounded-full border border-teal-700/60">
                  {bpm} BPM
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBpm(58)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                    bpm === 58
                      ? 'bg-teal-600 border-cyan-400 text-white shadow-sm'
                      : 'bg-teal-900/50 border-teal-700/40 text-teal-200 hover:bg-teal-800/70'
                  }`}
                >
                  {isUrdu ? 'سست (58) Bradycardia' : 'Bradycardia (58)'}
                </button>
                <button
                  type="button"
                  onClick={() => setBpm(72)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                    bpm === 72
                      ? 'bg-teal-600 border-cyan-400 text-white shadow-sm'
                      : 'bg-teal-900/50 border-teal-700/40 text-teal-200 hover:bg-teal-800/70'
                  }`}
                >
                  {isUrdu ? 'معمول (72) Normal' : 'Normal Sinus (72)'}
                </button>
                <button
                  type="button"
                  onClick={() => setBpm(110)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                    bpm === 110
                      ? 'bg-rose-600 border-rose-400 text-white shadow-sm'
                      : 'bg-teal-900/50 border-teal-700/40 text-teal-200 hover:bg-teal-800/70'
                  }`}
                >
                  {isUrdu ? 'تیز (110) Tachycardia' : 'Tachycardia (110)'}
                </button>
              </div>
            </div>

            {/* Anatomical Chambers & Vascular Inspection Tabs */}
            <div className="w-full mt-3 z-10">
              <div className="flex items-center justify-between text-xs font-semibold text-teal-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-300" />
                  {isUrdu ? 'دل کے اناٹومیکل حصے (Anatomical Chambers)' : 'Anatomical Structure & Chambers'}
                </span>
                <span className="text-[10px] text-teal-400/80 font-normal">Click to Inspect</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {chambers.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveChamber(activeChamber === c.id ? null : c.id)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      activeChamber === c.id
                        ? 'bg-teal-700/90 border-cyan-300 text-white shadow-sm'
                        : 'bg-teal-950/70 border-teal-800/70 text-teal-200 hover:bg-teal-900/70'
                    }`}
                  >
                    <div className="font-bold text-[11px] truncate">
                      {isUrdu ? c.nameUr : isRoman ? c.nameRoman : c.nameEn}
                    </div>
                    <div className="text-[9px] font-mono text-cyan-300 mt-0.5">
                      {c.pressure}
                    </div>
                  </button>
                ))}
              </div>

              {activeChamber && (
                <div className="mt-2.5 p-3 rounded-xl bg-teal-900/80 border border-teal-700/70 text-xs text-teal-100 animate-fade-in shadow-inner">
                  {(() => {
                    const sel = chambers.find((c) => c.id === activeChamber);
                    if (!sel) return null;
                    return (
                      <div>
                        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-teal-700/50">
                          <span className="font-bold text-white text-xs">
                            {isUrdu ? sel.nameUr : isRoman ? sel.nameRoman : sel.nameEn}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950/80 text-cyan-300 border border-teal-700/50">
                            {sel.type} • {sel.pressure}
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs leading-relaxed text-teal-200">
                          {isUrdu ? sel.descUr : isRoman ? sel.descRoman : sel.descEn}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Dual Action Buttons in Modal (Side by Side) */}
            <div className="w-full mt-3.5 grid grid-cols-2 gap-2.5 z-10">
              <button
                type="button"
                onClick={handleCallClick}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-red-950/50 border border-red-400/40 transition-all cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 animate-pulse" />
                <span>{isUrdu ? 'ایمرجنسی کال 1122' : 'Call Emergency 1122'}</span>
              </button>

              <button
                type="button"
                onClick={handleMessageClick}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-950/50 border border-emerald-400/40 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{isUrdu ? 'طبی میسج کریں' : 'Medical App Message'}</span>
              </button>
            </div>

            {/* Modal Bottom Bar */}
            <div className="w-full mt-3.5 pt-3 border-t border-teal-800/60 flex items-center justify-between text-xs z-10">
              <div className="flex items-center gap-1.5 text-teal-300 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{titles.modelBadge}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="px-4 py-1.5 rounded-xl bg-teal-700/80 hover:bg-teal-600 text-white text-xs font-bold border border-teal-500/40 transition-colors cursor-pointer"
              >
                {isUrdu ? 'بند کریں' : isRoman ? 'Band Karein' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Internal Emergency Call Modal */}
      <EmergencyCallModal
        isOpen={showInternalCallModal}
        onClose={() => setShowInternalCallModal(false)}
        currentLanguage={currentLanguage}
      />

      {/* Internal Medical Quick Message Modal */}
      <MedicalQuickMessageModal
        isOpen={showInternalMsgModal}
        onClose={() => setShowInternalMsgModal(false)}
        currentLanguage={currentLanguage}
      />
    </>
  );
};
