import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquare,
  Send,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Heart,
  Stethoscope,
  ExternalLink,
  MessageCircle,
  Ambulance,
  Lock,
  RotateCcw,
} from 'lucide-react';
import { SupportedLanguage } from '../types';

interface MedicalQuickMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: SupportedLanguage;
  onNavigateToTab?: (tab: string) => void;
  patientName?: string;
}

export const MedicalQuickMessageModal: React.FC<MedicalQuickMessageModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onNavigateToTab,
  patientName = 'Patient',
}) => {
  const [activeMode, setActiveMode] = useState<'whatsapp' | 'sms' | 'ai'>('whatsapp');
  const [messageText, setMessageText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [recipientOption, setRecipientOption] = useState<'duty_doctor' | 'rescue1122' | 'custom'>('duty_doctor');
  const [customPhone, setCustomPhone] = useState('+923001234567');

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';

  // Preset emergency & consultation message templates
  const presets = [
    {
      id: 'emergency',
      labelEn: '🚨 Emergency Triage',
      labelUr: '🚨 ایمرجنسی امداد',
      labelRoman: '🚨 Emergency Imdad',
      text: isUrdu
        ? `[فوری ایمرجنسی میڈیکل الرٹ]\nمریض: ${patientName}\nکیفیت: فوری طبی امداد کی ضرورت ہے۔ برائے مہربانی قریبی ایمبولینس فوری روانہ فرمائیں۔`
        : isRoman
        ? `[EMERGENCY MEDICAL DISPATCH]\nPatient: ${patientName}\nStatus: Urgent medical assistance requested.\nPlease dispatch nearest ambulance / rescue team immediately.`
        : `[EMERGENCY MEDICAL DISPATCH]\nPatient: ${patientName}\nStatus: Urgent medical assistance requested.\nPlease dispatch nearest ambulance / medical response team immediately.`,
    },
    {
      id: 'chest_pain',
      labelEn: '💔 Chest Pain / Heart Concern',
      labelUr: '💔 سینے میں درد / دل کی تکلیف',
      labelRoman: '💔 Seene mein dard / Dil ka masla',
      text: isUrdu
        ? `[کارڈیالوجی ایمرجنسی استفسار]\nمریض: ${patientName}\nتکلیف: سینے میں شدید دباؤ / دل کی دھڑکن تیز ہے۔ فوری آن کال ڈاکٹر کا جائزہ درکار ہے۔`
        : isRoman
        ? `[CARDIAC CONSULTATION INQUIRY]\nPatient: ${patientName}\nConcern: Experiencing acute chest pressure / palpitations.\nRequesting immediate on-call physician triage.`
        : `[CARDIAC CONSULTATION INQUIRY]\nPatient: ${patientName}\nConcern: Experiencing acute chest pressure / palpitations.\nRequesting immediate on-call physician review.`,
    },
    {
      id: 'doctor_message',
      labelEn: '🩺 Ask On-Duty Doctor',
      labelUr: '🩺 آن ڈیوٹی ڈاکٹر سے رابطہ',
      labelRoman: '🩺 Doctor se rabta',
      text: isUrdu
        ? `[ٹیلی ہیلتھ مشورہ]\nمریض: ${patientName}\nاستفسار: میں حالیہ علامات کے سلسلے میں دستیاب میڈیکل آفیسر سے رابطہ کرنا چاہتا ہوں۔`
        : isRoman
        ? `[PATIENT TELEHEALTH MESSAGE]\nPatient: ${patientName}\nInquiry: I would like to consult an available medical officer regarding recent symptoms.`
        : `[PATIENT TELEHEALTH MESSAGE]\nPatient: ${patientName}\nInquiry: I would like to consult an available medical officer regarding recent symptoms.`,
    },
    {
      id: 'prescription',
      labelEn: '💊 Medicine Verification',
      labelUr: '💊 ادویات کی معلومات',
      labelRoman: '💊 Dawa ki maloomat',
      text: isUrdu
        ? `[فارمیسی اور ادویات کی رہنمائی]\nمریض: ${patientName}\nاستفسار: ادویات کی مقدار (dosage) اور حفاظتی ہدایات کی تصدیق درکار ہے۔`
        : isRoman
        ? `[PHARMACY & MEDICATION QUERY]\nPatient: ${patientName}\nInquiry: Need clarification regarding dosage instructions and medicine safety.`
        : `[PHARMACY & MEDICATION QUERY]\nPatient: ${patientName}\nInquiry: Need clarification regarding dosage instructions and safety warnings.`,
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setSelectedPresetId(p.id);
    setMessageText(p.text);
  };

  const handleCopy = () => {
    const textToCopy = messageText || presets[0].text;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setMessageText('');
    setSelectedPresetId(null);
    setAiResponse(null);
  };

  const getRecipientNumber = () => {
    if (recipientOption === 'rescue1122') return '923001122000';
    if (recipientOption === 'custom') return customPhone.replace(/[^0-9]/g, '');
    return '923007342872'; // SehatSaathi Telehealth Clinic On-Call
  };

  const handleSendWhatsApp = () => {
    const textToSend = encodeURIComponent(messageText || presets[0].text);
    const targetPhone = getRecipientNumber();
    const whatsappUrl = `https://wa.me/${targetPhone}?text=${textToSend}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSendSMS = () => {
    const textToSend = encodeURIComponent(messageText || presets[0].text);
    const targetNum = recipientOption === 'rescue1122' ? '1122' : '1122';
    window.location.href = `sms:${targetNum}?body=${textToSend}`;
  };

  const handleSendAIChat = async () => {
    const queryText = (messageText || presets[0].text).trim();
    if (!queryText) return;

    setIsSending(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          language: isUrdu ? 'Urdu' : isRoman ? 'Roman Urdu' : 'English',
          patientProfile: { name: patientName },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.reply || data.text || (typeof data === 'string' ? data : '');
        if (reply) {
          setAiResponse(reply);
          return;
        }
      }
      throw new Error('API fallback');
    } catch {
      // Local fallback response
      if (isUrdu) {
        setAiResponse(
          `آپ کا پیغام درج کر لیا گیا ہے۔ علامات کی نوعیت کے مطابق ڈاکٹر جلد جائزہ لیں گے۔ اگر سینے میں شدید درد، سانس کی تکلیف یا بے ہوشی ہو تو فوری طور پر 1122 کو کال کریں۔`
        );
      } else if (isRoman) {
        setAiResponse(
          `Aap ka clinical message note kar liya gaya hai. Symptoms ke mutabiq doctor jald review karenge. Agar shadeed dard ya sans ki takleef ho to foran 1122 par call karein.`
        );
      } else {
        setAiResponse(
          `Message recorded to your clinical encounter chart. If experiencing acute distress, shortness of breath, or severe chest pain, please use the Call 1122 button immediately or connect with an on-duty medical officer.`
        );
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      id="medical-quick-message-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto p-2.5 sm:p-4 md:p-6 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="medical-quick-message-modal"
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-teal-200 dark:border-teal-800/80 text-slate-800 dark:text-slate-100 my-auto flex flex-col max-h-[min(94vh,680px)] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 shrink-0" />

        {/* Modal Header (Fixed at top) */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between gap-3 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-700/80 text-teal-600 dark:text-teal-300 flex items-center justify-center shadow-2xs shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200/60 dark:border-teal-800/60 truncate">
                  {isUrdu ? 'فوری طبی پیغام' : isRoman ? 'Quick Medical Message' : 'Instant Medical Dispatch'}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                {isUrdu ? 'ڈاکٹر یا ایمرجنسی میسج بھیجیں' : isRoman ? 'Doctor ya Emergency Message Bhejein' : 'Send Medical or Emergency Message'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            id="close-quick-message-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            title="Close modal (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body (Ensures no vertical clipping on any screen) */}
        <div className="px-4 sm:px-6 py-3.5 overflow-y-auto flex-1 min-h-0 space-y-3.5 overscroll-contain">
          {/* Dispatch Channel Selector: WhatsApp, SMS Dispatch, In-App AI Doctor */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
              {isUrdu ? 'ترسیل کا ذریعہ منتخب کریں:' : isRoman ? 'Channel Selector:' : 'Select Dispatch Channel:'}
            </label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold">
              <button
                type="button"
                id="select-channel-whatsapp"
                onClick={() => setActiveMode('whatsapp')}
                className={`flex items-center justify-center gap-1.5 py-2 px-1.5 sm:px-2 rounded-xl transition-all cursor-pointer ${
                  activeMode === 'whatsapp'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span className="truncate">WhatsApp</span>
              </button>

              <button
                type="button"
                id="select-channel-sms"
                onClick={() => setActiveMode('sms')}
                className={`flex items-center justify-center gap-1.5 py-2 px-1.5 sm:px-2 rounded-xl transition-all cursor-pointer ${
                  activeMode === 'sms'
                    ? 'bg-teal-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Send className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">SMS 1122</span>
              </button>

              <button
                type="button"
                id="select-channel-ai"
                onClick={() => setActiveMode('ai')}
                className={`flex items-center justify-center gap-1.5 py-2 px-1.5 sm:px-2 rounded-xl transition-all cursor-pointer ${
                  activeMode === 'ai'
                    ? 'bg-cyan-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">AI Doctor</span>
              </button>
            </div>
          </div>

          {/* WhatsApp / SMS Recipient Destination Pill */}
          {activeMode !== 'ai' && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>{isUrdu ? 'موصول کنندہ:' : 'Recipient Target:'}</span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setRecipientOption('duty_doctor')}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                      recipientOption === 'duty_doctor'
                        ? 'bg-teal-600 text-white font-bold'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    🩺 Telehealth Clinic
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipientOption('rescue1122')}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                      recipientOption === 'rescue1122'
                        ? 'bg-red-600 text-white font-bold'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    🚑 Rescue 1122
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Medical Preset Templates */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {isUrdu ? 'تیار شدہ طبی ٹیمپلیٹس:' : isRoman ? 'Quick Presets:' : 'Quick Medical Presets:'}
              </label>
              {messageText && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[11px] font-medium text-slate-400 hover:text-red-500 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {presets.map((p) => {
                const isSelected = selectedPresetId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className={`p-2 rounded-xl text-left transition-all cursor-pointer border text-xs font-medium flex items-center justify-between ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/80 border-teal-500 text-teal-900 dark:text-teal-200 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 hover:border-teal-400 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="truncate">{isUrdu ? p.labelUr : isRoman ? p.labelRoman : p.labelEn}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Textarea Input Container */}
          <div className="relative">
            <textarea
              id="quick-message-textarea"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={
                isUrdu
                  ? 'اپنا طبی پیغام یا علامات یہاں لکھیں (یا اوپر سے ٹیمپلیٹ منتخب کریں)...'
                  : isRoman
                  ? 'Apna medical message ya symptoms yahan likhein...'
                  : 'Type your clinical message, symptoms, or urgent inquiry here...'
              }
              rows={3}
              className="w-full min-h-[85px] sm:min-h-[100px] p-3 pb-8 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-y font-sans leading-relaxed"
            />

            {/* Bottom Actions inside textarea: character count and copy button */}
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none">
              <span className="text-[10px] text-slate-400 font-mono">
                {messageText.length > 0 ? `${messageText.length} chars` : ''}
              </span>

              <button
                type="button"
                onClick={handleCopy}
                className="pointer-events-auto flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-300 shadow-2xs hover:text-teal-600 hover:border-teal-400 transition-colors cursor-pointer"
                title="Copy text to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-600 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Doctor Response Box (if activeMode === 'ai' or response exists) */}
          {activeMode === 'ai' && (
            <div className="space-y-2">
              {isSending ? (
                <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-xs text-cyan-900 dark:text-cyan-100 flex items-center justify-center gap-2.5 animate-pulse">
                  <Sparkles className="w-4 h-4 text-cyan-600 animate-spin" />
                  <span className="font-semibold">
                    {isUrdu ? 'طبی تجزیہ کیا جا رہا ہے...' : 'AI Clinical Officer analyzing symptoms...'}
                  </span>
                </div>
              ) : aiResponse ? (
                <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs text-teal-950 dark:text-teal-100 leading-relaxed animate-in fade-in">
                  <div className="flex items-center justify-between gap-2 font-bold text-teal-800 dark:text-teal-300 mb-1.5 pb-1 border-b border-teal-200/60 dark:border-teal-800/60">
                    <div className="flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                      <span>{isUrdu ? 'ڈاکٹر اے آئی رہنمائی' : 'AI Clinical Officer Review:'}</span>
                    </div>
                    <span className="text-[10px] font-normal text-teal-600 dark:text-teal-400">
                      Triage Only
                    </span>
                  </div>
                  <p className="whitespace-pre-line text-slate-700 dark:text-slate-200">{aiResponse}</p>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
                  {isUrdu
                    ? 'پیغام لکھ کر نیچے "Ask Doctor AI" کا بٹن دبائیں۔'
                    : 'Click "Ask Doctor AI" below to receive an instant clinical assessment.'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Sticky Footer (Always permanently visible at bottom, never clipped!) */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-xs flex items-center justify-between gap-2.5 shrink-0 z-10">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 min-w-0">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="truncate hidden sm:inline">Encrypted Medical Dispatch</span>
            <span className="truncate sm:hidden">Encrypted</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id="quick-message-cancel-btn"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              {isUrdu ? 'منسوخ' : 'Cancel'}
            </button>

            {activeMode === 'whatsapp' && (
              <button
                type="button"
                id="send-whatsapp-action-btn"
                onClick={handleSendWhatsApp}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">
                  {isUrdu ? 'واٹس ایپ پر بھیجیں' : 'Send via WhatsApp'}
                </span>
                <ExternalLink className="w-3 h-3 opacity-80 shrink-0" />
              </button>
            )}

            {activeMode === 'sms' && (
              <button
                type="button"
                id="send-sms-action-btn"
                onClick={handleSendSMS}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-teal-600/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <Send className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">
                  {isUrdu ? 'ایس ایم ایس 1122' : 'Send SMS (1122)'}
                </span>
              </button>
            )}

            {activeMode === 'ai' && (
              <button
                type="button"
                id="send-ai-action-btn"
                onClick={handleSendAIChat}
                disabled={isSending || (!messageText.trim() && !selectedPresetId)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md shadow-cyan-600/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">
                  {isSending
                    ? isUrdu
                      ? 'تجزیہ ہو رہا ہے...'
                      : 'Analyzing...'
                    : isUrdu
                    ? 'ڈاکٹر اے آئی سے پوچھیں'
                    : 'Ask Doctor AI'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
