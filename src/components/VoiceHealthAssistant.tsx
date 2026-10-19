import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  RefreshCw,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Stethoscope,
  Info,
  Clock,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { SupportedLanguage, UserAccount, PatientProfile, UrgencyLevel } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { voiceManager } from '../services/voice';
import { VoiceControlGroup } from './VoiceControlGroup';

interface VoiceMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  urgency?: UrgencyLevel;
  audioPlaying?: boolean;
}

interface VoiceHealthAssistantProps {
  currentLanguage: SupportedLanguage;
  currentUser?: UserAccount;
  activeProfile?: PatientProfile;
  onNavigateToEmergency?: () => void;
  onNavigateToCare?: () => void;
  onSaveRecord?: (record: any) => void;
}

export const VoiceHealthAssistant: React.FC<VoiceHealthAssistantProps> = ({
  currentLanguage,
  currentUser,
  activeProfile,
  onNavigateToEmergency,
  onNavigateToCare,
  onSaveRecord,
}) => {
  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);
  const [activeAudioMessageId, setActiveAudioMessageId] = useState<string | null>(null);

  const initialGreetingText = isUrdu
    ? `السلام علیکم ${currentUser?.name || 'محترم مریض'}! میں آپ کا بااعتماد طبی وائس اسسٹنٹ ہوں۔ نیچے مائیک کے بٹن پر ٹیپ کریں اور اپنی بیماری یا علامات بول کر بتائیں۔`
    : isRoman
    ? `Assalam-o-Alaikum ${currentUser?.name || 'Patient'}! Main aap ka Voice Health Assistant hoon. Neechay mic par tap karein aur apni alamaat bol kar batayein.`
    : `Hello ${currentUser?.name || 'Patient'}! I am your Voice AI Health Assistant. Tap the microphone below and speak your health questions or symptoms.`;

  const [messages, setMessages] = useState<VoiceMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: initialGreetingText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      urgency: 'GREEN',
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Sync active audio playback state
  useEffect(() => {
    return voiceManager.subscribe((state) => {
      if (!state.isPlaying) {
        setActiveAudioMessageId(null);
      }
    });
  }, []);

  // Speech Recognition setup (Web Speech API with graceful fallback)
  const startRecording = () => {
    setMicPermissionError(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicPermissionError(
        isUrdu
          ? 'آپ کے براؤزر میں براہِ راست اسپیچ ریکگنیشن سپورٹ نہیں ہے۔ آپ نیچے کی بورڈ سے ٹائپ کر کے بھی سوال پوچھ سکتے ہیں۔'
          : 'Live browser speech recognition is not supported in this browser. You can type your health question below.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      // Select BCP-47 language tag
      if (isUrdu) {
        recognition.lang = 'ur-PK';
      } else if (isRoman) {
        recognition.lang = 'en-US'; // Roman Urdu uses latin phonetics
      } else {
        recognition.lang = 'en-US';
      }

      recognition.onstart = () => {
        setIsRecording(true);
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicPermissionError(
            isUrdu
              ? 'مائیکروفون کی اجازت نہیں ملی۔ براؤزر کی سیٹنگز میں مائیک الاؤ (Allow) کریں۔'
              : 'Microphone permission denied. Please allow microphone access in your browser settings.'
          );
        } else if (event.error === 'no-speech') {
          // User stayed silent
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Failed to start speech recognition:', err);
      setIsRecording(false);
      setMicPermissionError(err?.message || 'Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
  };

  const handleSendMessage = async (textToSend: string) => {
    const cleanText = textToSend.trim();
    if (!cleanText) return;

    const userMsgId = `user-${Date.now()}`;
    const newMessages: VoiceMessage[] = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        text: cleanText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];

    setMessages(newMessages);
    setTranscript('');
    setIsEditingTranscript(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanText,
          language: currentLanguage,
          patientProfile: activeProfile || {
            name: currentUser?.name || 'Patient',
            ageGroup: 'adult',
            gender: 'unspecified',
          },
        }),
      });

      const data = await response.json();
      const replyText = data.text || 'Thank you. Please consult a licensed doctor.';
      const urgency: UrgencyLevel = data.urgency || 'GREEN';

      const assistantMsgId = `ai-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          sender: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          urgency,
        },
      ]);

      // Auto play spoken response
      handlePlayVoice(replyText, assistantMsgId);
    } catch (err: any) {
      console.warn('AI Voice assistant chat error:', err);
      const fallbackMsgId = `ai-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: fallbackMsgId,
          sender: 'assistant',
          text: isUrdu
            ? 'آپ کی بات نوٹ کر لی گئی ہے۔ مستند رہنمائی کے لیے کسی قریبی ڈاکٹر سے رجوع کریں۔'
            : 'Your query has been recorded. Please consult an in-person medical officer.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          urgency: 'YELLOW',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayVoice = (text: string, msgId: string) => {
    if (activeAudioMessageId === msgId) {
      voiceManager.stop();
      setActiveAudioMessageId(null);
      return;
    }
    setActiveAudioMessageId(msgId);
    voiceManager.speak(text, currentLanguage);
  };

  const quickPrompts = isUrdu
    ? [
        'مجھے سر میں شدید درد ہے، کیا کروں؟',
        'بلڈ پریشر اور شوگر کنٹرول کرنے کی احتیاط',
        'پیٹ میں مروڑ اور بدہضمی کا ابتدائی حل',
        'بخار اور گلے میں خراش کی علامات',
      ]
    : isRoman
    ? [
        'Mujhe sar dard aur bukhar hai, kya karun?',
        'Blood pressure aur sugar control karne ke nuskhe',
        'Pait mein dard aur gas ka aasan hal',
        'Gale mein kharash aur nazla zukaam',
      ]
    : [
        'I have a persistent headache and fever',
        'Tips for managing high blood pressure and diabetes',
        'What to do for acute stomach ache and nausea',
        'Sore throat and seasonal flu guidance',
      ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Top Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-teal-900 via-teal-950 to-slate-950 text-white shadow-xl border border-teal-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shadow-inner">
              <Mic className="w-7 h-7 animate-pulse text-teal-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-300 text-[11px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-teal-300" />
                <span>Trilingual Voice AI</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {isUrdu ? 'وائس ہیلتھ اسسٹنٹ (بول کر پوچھیں)' : 'Voice-Based AI Health Assistant'}
              </h2>
              <p className="text-xs text-teal-200/80 mt-0.5">
                {isUrdu
                  ? 'اردو، رومن اردو اور انگریزی میں بولیں۔ آواز سے سنیں اور جواب حاصل کریں۔'
                  : 'Speak hands-free in Urdu, Roman Urdu, or English. Listen to spoken responses.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              ● Voice Ready
            </span>
          </div>
        </div>
      </div>

      {/* Mic Permission Warning */}
      {micPermissionError && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
          <div className="flex-1 leading-relaxed">{micPermissionError}</div>
        </div>
      )}

      {/* Conversation History Box */}
      <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm min-h-[380px] max-h-[500px] overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-teal-700 text-white rounded-br-none shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200/80 dark:border-slate-700/80 shadow-xs'
              }`}
            >
              {/* Sender & Timestamp */}
              <div className="flex items-center justify-between gap-4 text-[10px] mb-1.5 opacity-75 font-semibold">
                <span>{msg.sender === 'user' ? (isUrdu ? 'آپ' : 'You') : 'SehatSaathi AI'}</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message Content */}
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Urgency Badge & Voice Playback for AI responses */}
              {msg.sender === 'assistant' && (
                <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {msg.urgency === 'RED' ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-black border border-rose-500/30">
                        EMERGENCY 1122
                      </span>
                    ) : msg.urgency === 'YELLOW' ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black border border-amber-500/30">
                        ROUTINE CARE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                        STABLE
                      </span>
                    )}
                  </div>

                  {/* Complete Voice Controls: Start, Pause, Stop + 1x, 1.25x, 1.75x, 2x */}
                  <div className="pt-2">
                    <VoiceControlGroup
                      currentLanguage={currentLanguage}
                      textToSpeak={msg.text}
                      variant="compact"
                      showSpeed={true}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-teal-600 dark:text-teal-400 font-semibold p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 w-fit">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>
              {isUrdu ? 'طبی تجزیہ اور جواب تیار ہو رہا ہے...' : 'Analyzing symptoms & preparing clinical response...'}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Medical Prompts */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-[11px] font-bold text-slate-400 mr-1">
          {isUrdu ? 'فوری موضوعات:' : 'Quick Prompts:'}
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-700 dark:hover:text-teal-300 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Voice Recording / Input Control Center */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
        {/* Live Audio Visualizer Banner during active speech */}
        {isRecording && (
          <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-700 flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2 text-teal-800 dark:text-teal-200 font-bold text-xs">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <span>{isUrdu ? 'بولیں، ریکارڈنگ جاری ہے...' : 'Listening... Speak clearly now'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1 h-4 bg-teal-500 rounded-full animate-bounce" />
              <span className="w-1 h-6 bg-teal-600 rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-1 h-3 bg-teal-400 rounded-full animate-bounce [animation-delay:0.3s]" />
              <span className="w-1 h-5 bg-teal-500 rounded-full animate-bounce [animation-delay:0.45s]" />
            </div>
          </div>
        )}

        {/* Live Transcript Preview and Click-to-Edit before Send */}
        {transcript && (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-1">
                <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                <span>{isUrdu ? 'آپ کا بولا ہوا جملہ (ترمیم کر سکتے ہیں):' : 'Captured Transcript (Edit before sending):'}</span>
              </span>
              <button
                type="button"
                onClick={() => setTranscript('')}
                className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={2}
              className="w-full text-sm font-medium p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-hidden focus:border-teal-500"
            />
          </div>
        )}

        {/* Input Bar with Big Mic & Text Box */}
        <div className="flex items-center gap-2">
          {/* Main Big Voice Toggle Button */}
          <button
            type="button"
            id="voice-assistant-record-btn"
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-lg ${
              isRecording
                ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-500/30 animate-pulse'
                : 'bg-teal-700 hover:bg-teal-800 text-white shadow-teal-700/25 active:scale-95'
            }`}
            title={isRecording ? 'Stop Recording' : 'Start Voice Input'}
          >
            {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
          </button>

          {/* Text Input / Transcript Editor */}
          <input
            type="text"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && transcript.trim()) {
                handleSendMessage(transcript);
              }
            }}
            placeholder={
              isUrdu
                ? 'یہاں بولیں یا اپنا سوال ٹائپ کریں...'
                : isRoman
                ? 'Yahan bolein ya sawal type karein...'
                : 'Speak with mic or type your medical question...'
            }
            className="flex-1 py-3 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-hidden font-medium"
          />

          {/* Send Button */}
          <button
            type="button"
            id="voice-assistant-send-btn"
            onClick={() => handleSendMessage(transcript)}
            disabled={!transcript.trim() || isLoading}
            className="h-14 px-5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 shrink-0"
          >
            <Send className="w-4 h-4 rtl:rotate-180" />
            <span className="hidden sm:inline">{isUrdu ? 'بھیجیں' : 'Send'}</span>
          </button>
        </div>

        {/* Safety Note */}
        <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>
            {isUrdu
              ? 'یہ آوازی اسسٹنٹ رہنمائی کے لیے ہے؛ ہنگامی حالت میں فوری 1122 ملائیں۔'
              : 'Voice AI is assistive for triage. In acute chest pain or emergency, call 1122.'}
          </span>
        </div>
      </div>
    </div>
  );
};
