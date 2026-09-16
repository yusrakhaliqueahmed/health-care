import React, { useState, useEffect } from 'react';
import { SupportedLanguage } from '../types';
import { voiceManager } from '../services/voice';
import {
  Flame,
  Activity,
  Heart,
  HelpCircle,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Smartphone,
  Droplets,
  Layers,
  Sparkles,
} from 'lucide-react';

interface VitalsMeasurementGuideProps {
  currentLanguage: SupportedLanguage;
  defaultSection?: 'sugar' | 'bp' | 'heart' | 'app';
  onSelectVitalToTest?: (type: 'sugar' | 'bp' | 'heart' | 'all') => void;
}

export const VitalsMeasurementGuide: React.FC<VitalsMeasurementGuideProps> = ({
  currentLanguage,
  defaultSection = 'sugar',
  onSelectVitalToTest,
}) => {
  const [activeGuideTab, setActiveGuideTab] = useState<'sugar' | 'bp' | 'heart' | 'app'>(defaultSection);
  const [guideLang, setGuideLang] = useState<SupportedLanguage>(currentLanguage);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeAudioKey, setActiveAudioKey] = useState<string | null>(null);

  // Sync guideLang with prop when parent language changes
  useEffect(() => {
    setGuideLang(currentLanguage);
  }, [currentLanguage]);

  // Subscribe to voiceManager state
  useEffect(() => {
    const unsub = voiceManager.subscribe((state) => {
      if (!state.isPlaying) {
        setIsPlayingAudio(false);
        setActiveAudioKey(null);
      }
    });
    return () => {
      unsub();
      voiceManager.stop();
    };
  }, []);

  const isUrdu = guideLang === 'ur';
  const isRoman = guideLang === 'roman';

  // Audio speech content for each section
  const audioScripts = {
    sugar: {
      ur: 'گلوکومیٹر سے شوگر چیک کرنے کا طریقہ: سب سے پہلے صابن اور نیم گرم پانی سے ہاتھ دھو کر اچھی طرح خشک کریں۔ گلوکومیٹر میں نئی ٹیسٹ سٹرپ لگائیں۔ لینسنگ پین میں نئی سوئی لگا کر انگلی کے کنارے پر ہلکا سا پرک کریں۔ خون کا پہلا قطرہ صاف ٹشو سے پونچھ کر دوسرا صاف قطرہ سٹرپ کے سرے پر لگائیں۔ پانچ سیکنڈ میں ریڈنگ اسکرین پر آ جائے گی۔ نہار منہ نارمل شوگر 70 سے 99 ملی گرام ہے، اور کھانے کے دو گھنٹے بعد 140 سے کم ہونی چاہیے۔ اس ایپ میں نہار منہ یا کھانے کے بعد کا انتخاب کریں اور اپنی ریڈنگ لکھ کر رزلٹ دیکھیں۔',
      roman: 'Glucometer se sugar check karne ka asaan tareeqa: Sab se pehle haath saaf dho kar khushk karein. Glucometer mein test strip dalein. Lancing pen se ungli ki side par halka sa puncture karein. Pehla drop tissue se saaf kar ke doosra saaf khoon ka qatra strip par lagayein. 5 second mein meter par reading aa jaye gi. Fasting yani nehar munh normal sugar 70 se 99 mg/dL hai aur khanay ke 2 ghantay baad 140 se kam honi chahiye. Is app mein fasting ya random select karein aur number enter karein.',
      en: 'How to test blood sugar with a glucometer: First, wash and thoroughly dry your hands. Insert a fresh test strip into your glucometer. Using the lancing device, gently prick the side of your fingertip. Wipe away the first small drop with clean tissue, then touch the second drop of blood to the edge of the strip. The reading appears in 5 seconds. Normal fasting sugar is 70 to 99 mg/dL, and post-meal reading should be under 140 mg/dL. Enter your reading in this app to see your instant medical evaluation.',
    },
    bp: {
      ur: 'ڈیجیٹل مانیٹر سے بلڈ پریشر چیک کرنے کا طریقہ: بی پی چیک کرنے سے تیس منٹ پہلے چائے، سگریٹ یا ورزش سے پرہیز کریں۔ پانچ منٹ کرسی پر پرسکون بیٹھیں۔ دونوں پاؤں زمین پر سیدھے رکھیں۔ کف کو ننگے بازو پر کہنی کے موڑ سے ایک انچ اوپر دل کے برابر باندھیں۔ اسٹارٹ کا بٹن دبائیں اور بی پی کے دوران بولنے یا ہلنے سے مکمل پرہیز کریں۔ اوپر والا نمبر سسٹولک اور نیچے والا ڈائیسٹولک ہے۔ نارمل بلڈ پریشر 120 بٹہ 80 سے کم ہوتا ہے۔ اس ایپ میں دونوں نمبرز درج کریں اور ڈاکٹر کی رپورٹ دیکھیں۔',
      roman: 'Digital machine se Blood Pressure check karne ka tareeqa: BP check karne se pehle 5 minute pur-sukoon bethein. Chai, smoking ya bhag dor se pehle parhez karein. Kursi par kamar seedhi rakh kar bethein aur dono paon zameen par hon. Cuff ko kohni se ek inch oopar dil ki barabari par baandhein. Start ka button dabayein aur test ke dauraan bilkul na bolein. Oopar wala number Systolic aur neechay wala Diastolic hota hai. Normal BP 120 by 80 se kam hota hai. Is app mein dono readings enter karein.',
      en: 'How to check blood pressure using a digital monitor: Rest quietly for 5 minutes before measurement. Avoid caffeine, smoking, or heavy exertion 30 minutes prior. Sit upright with back supported and feet flat on the floor. Wrap the cuff on your bare arm 1 inch above your elbow crease, supported at heart level. Press Start and remain completely silent and still. Record the top systolic number and bottom diastolic number. Normal BP is under 120 over 80 mmHg.',
    },
    heart: {
      ur: 'نبض اور دل کی دھڑکن چیک کرنے کا طریقہ: تین سے پانچ منٹ پرسکون بیٹھیں۔ الٹے ہاتھ کی کلائی میں انگوٹھے کی جڑ کے نیچے سیدھے ہاتھ کی دو انگلیاں رکھیں اور ہلکا دباؤ ڈال کر نبض تلاش کریں۔ گھڑی دیکھ کر ساٹھ سیکنڈ میں دل کی دھڑکنیں گن لیں۔ بالغوں میں آرام کے وقت نارمل دھڑکن ساٹھ سے سو فی منٹ ہوتی ہے۔ یا پھر اس ایپ میں کیمرہ پلس سینسر کا بٹن دبائیں اور اپنی انگلی کو موبائل کے پچھلے کیمرے پر رکھیں، ایپ خودکار طور پر آپ کی نبض ماپ لے گی۔',
      roman: 'Pulse aur Dil ki dharkan check karne ka tareeqa: 3 se 5 minute aaram karein. Apni wrist yaani kalai mein angoothay ki jarr ke neechay do ungliyan rakh kar pulse mehsoos karein. 60 second tak dharkan ginein. Normal dil ki dharkan aaram ki halat mein 60 se 100 beats per minute hoti hai. Ya is app mein Live Camera Sensor ka button dabayein aur ungli camera lens par rakhein, app khud dil ki dharkan scan kar le gi.',
      en: 'How to measure heart rate and pulse: Rest quietly for 3 to 5 minutes. Place your index and middle fingers on the inside of your wrist, just below the base of your thumb, feeling for your radial artery. Count the beats for a full 60 seconds. Normal resting heart rate is 60 to 100 beats per minute. Alternatively, click the Live Camera Sensor in this app and place your fingertip gently over the rear camera to measure automatically.',
    },
    app: {
      ur: 'اس ایپ میں وائٹلز چیک اور محفوظ کرنے کا طریقہ: اگر آپ صرف شوگر یا صرف بی پی چیک کرنا چاہتے ہیں تو اوپر والے ٹیب پر کلک کریں۔ اگر آپ شوگر یا بی پی کے پرانے مریض ہیں تو تصدیق کے لیے ہاں منتخب کریں۔ اپنی ریڈنگ لکھیں اور بٹن دبائیں۔ ایپ آپ کو فوری طور پر رزلٹ، نارمل رینج اور اردو میں ڈاکٹر کی تجاویز دے گی۔ ہر روز کا ریکارڈ ہفتہ وار لاگ بک میں خودکار محفوظ ہو جاتا ہے جسے آپ کسی بھی وقت ڈاکٹر کو دکھا سکتے ہیں۔',
      roman: 'Is app mein vitals check aur save karne ka tareeqa: Agar aap sirf sugar ya sirf BP check karna chahte hain toh mutaliqa tab choose karein. Agar aap purane mareez hain toh Diagnosed par Yes select karein taakay calculation sahi ho. Number enter karein aur button dabayein. App foran normal range aur medical guidance bataye gi. Har din ka record day-by-day logbook mein hamesha ke liye mehfooz rehta hai.',
      en: 'How to use this app for vitals tracking: Select single vitals like Sugar Only or BP Only, or track everything together. Confirm if you have a prior clinical diagnosis of diabetes or hypertension so our engine applies the correct threshold. Enter your numbers and view immediate color-coded assessment with PMDC physician guidance. Each reading is automatically archived into your day-by-day weekly logbook.',
    },
  };

  const handlePlayVoice = (sectionKey: 'sugar' | 'bp' | 'heart' | 'app') => {
    if (isPlayingAudio && activeAudioKey === sectionKey) {
      voiceManager.stop();
      setIsPlayingAudio(false);
      setActiveAudioKey(null);
      return;
    }

    const langKey = isUrdu ? 'ur' : isRoman ? 'roman' : 'en';
    const text = audioScripts[sectionKey][langKey];

    voiceManager.stop();
    setIsPlayingAudio(true);
    setActiveAudioKey(sectionKey);

    voiceManager.speak(text, guideLang);
  };

  return (
    <div
      id="vitals-measurement-guide-container"
      className="mt-8 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl p-5 sm:p-7 overflow-hidden relative"
    >
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title and Language Switcher */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center shrink-0 shadow-inner">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-950 text-teal-300 border border-teal-800">
                {isUrdu ? 'مکمل تصویری و آڈیو رہنمائی' : isRoman ? 'Mukammal Audio Rehnumai' : 'Interactive & Voice Guide'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{isUrdu ? 'طبی ہدایات برائے مریض' : 'For Home Patients'}</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {isUrdu
                ? 'شوگر، بلڈ پریشر اور دل کی دھڑکن چیک کرنے کا مکمل طریقہ'
                : isRoman
                ? 'Sugar, BP aur Dil Ki Dharkan Check Karne Ka Sahi Tareeqa'
                : 'How to Test Blood Sugar, Blood Pressure & Heart Rate (Step-by-Step)'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isUrdu
                ? 'جن مریضوں کو ٹیسٹ کرنا نہیں آتا، یا اس ایپ میں چیک کرنا نہیں آ رہا، وہ نیچے دی گئی ہدایات اور آواز کی رہنمائی سنیں۔'
                : isRoman
                ? 'Jin ko test karna nahi aata ya app mein check karna nahi aa raha, wo ye guidance parhein aur awaz sunein.'
                : 'For anyone unsure how to measure vitals at home or how to use this app, follow these steps and listen to audio.'}
            </p>
          </div>
        </div>

        {/* Multi-language Selector for Guide */}
        <div className="flex items-center gap-1.5 self-start md:self-auto bg-slate-800/90 p-1 rounded-2xl border border-slate-700">
          <button
            type="button"
            onClick={() => setGuideLang('ur')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              guideLang === 'ur'
                ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            اردو (Urdu)
          </button>
          <button
            type="button"
            onClick={() => setGuideLang('roman')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              guideLang === 'roman'
                ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            Roman Urdu
          </button>
          <button
            type="button"
            onClick={() => setGuideLang('en')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              guideLang === 'en'
                ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Guide Category Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveGuideTab('sugar')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
            activeGuideTab === 'sugar'
              ? 'bg-teal-500/20 border-teal-500 text-white shadow-lg shadow-teal-500/10'
              : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              activeGuideTab === 'sugar' ? 'bg-teal-500 text-slate-950' : 'bg-slate-700 text-teal-400'
            }`}
          >
            <Flame className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-extrabold truncate">
              {isUrdu ? '1. شوگر ٹیسٹ' : isRoman ? '1. Sugar Test' : '1. Blood Sugar'}
            </span>
            <span className="block text-[10px] text-slate-400 truncate">
              {isUrdu ? 'گلوکومیٹر کا طریقہ' : 'Glucometer guide'}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveGuideTab('bp')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
            activeGuideTab === 'bp'
              ? 'bg-rose-500/20 border-rose-500 text-white shadow-lg shadow-rose-500/10'
              : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              activeGuideTab === 'bp' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-rose-400'
            }`}
          >
            <Activity className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-extrabold truncate">
              {isUrdu ? '2. بلڈ پریشر' : isRoman ? '2. Blood Pressure' : '2. Blood Pressure'}
            </span>
            <span className="block text-[10px] text-slate-400 truncate">
              {isUrdu ? 'کف و مانیٹر کا طریقہ' : 'Digital monitor guide'}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveGuideTab('heart')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
            activeGuideTab === 'heart'
              ? 'bg-red-500/20 border-red-500 text-white shadow-lg shadow-red-500/10'
              : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              activeGuideTab === 'heart' ? 'bg-red-500 text-white' : 'bg-slate-700 text-red-400'
            }`}
          >
            <Heart className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-extrabold truncate">
              {isUrdu ? '3. نبض و دھڑکن' : isRoman ? '3. Heart Rate' : '3. Pulse & Heart'}
            </span>
            <span className="block text-[10px] text-slate-400 truncate">
              {isUrdu ? 'کلائی یا کیمرہ سینسر' : 'Wrist / Camera scan'}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveGuideTab('app')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
            activeGuideTab === 'app'
              ? 'bg-teal-500/20 border-teal-500 text-white shadow-lg shadow-teal-500/10'
              : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              activeGuideTab === 'app' ? 'bg-teal-500 text-slate-950' : 'bg-slate-700 text-teal-400'
            }`}
          >
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-extrabold truncate">
              {isUrdu ? '4. ایپ کا طریقہ' : isRoman ? '4. App Ka Tareeqa' : '4. How App Works'}
            </span>
            <span className="block text-[10px] text-slate-400 truncate">
              {isUrdu ? 'رزلٹ و روزانہ لاگز' : 'Daily logs & Doctor'}
            </span>
          </div>
        </button>
      </div>

      {/* Guide Content Card */}
      <div className="bg-slate-800/70 border border-slate-700/90 rounded-2xl p-5 sm:p-6 space-y-6">
        {/* Top Action Row for Current Tab */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">
              {activeGuideTab === 'sugar' ? '🩸' : activeGuideTab === 'bp' ? '🩺' : activeGuideTab === 'heart' ? '💓' : '📱'}
            </span>
            <div>
              <h3 className="text-base font-bold text-white">
                {activeGuideTab === 'sugar' &&
                  (isUrdu
                    ? 'گلوکومیٹر سے بلڈ شوگر ٹیسٹ کرنے کا مکمل طریقہ'
                    : isRoman
                    ? 'Glucometer Se Blood Sugar Check Karne Ka Step-by-Step Tareeqa'
                    : 'Step-by-Step Guide: Testing Blood Sugar with a Glucometer')}
                {activeGuideTab === 'bp' &&
                  (isUrdu
                    ? 'ڈیجیٹل مانیٹر سے بلڈ پریشر چیک کرنے کا درست طریقہ'
                    : isRoman
                    ? 'Digital Monitor Se Blood Pressure Check Karne Ka Sahi Tareeqa'
                    : 'Step-by-Step Guide: Measuring Blood Pressure with Digital Monitor')}
                {activeGuideTab === 'heart' &&
                  (isUrdu
                    ? 'کلائی کی نبض اور کیمرے سے دل کی دھڑکن ماپنے کا طریقہ'
                    : isRoman
                    ? 'Wrist Pulse Aur Mobile Camera Se Heart Rate Napne Ka Tareeqa'
                    : 'Step-by-Step Guide: Checking Heart Rate via Wrist or App Camera')}
                {activeGuideTab === 'app' &&
                  (isUrdu
                    ? 'اس ایپ میں وائٹلز چیک اور روزانہ کا ریکارڈ محفوظ کرنے کا طریقہ'
                    : isRoman
                    ? 'Is App Mein Vitals Check Aur Day-by-Day Record Save Karne Ka Tareeqa'
                    : 'How to Record, Analyze & Track Vitals in This App')}
              </h3>
              <p className="text-xs text-slate-400">
                {isUrdu
                  ? 'گھر بیٹھے غلطیوں سے بچیں اور بالکل درست پیمائش حاصل کریں'
                  : 'Avoid common measurement errors and ensure clinical accuracy'}
              </p>
            </div>
          </div>

          {/* Voice Listen Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePlayVoice(activeGuideTab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                isPlayingAudio && activeAudioKey === activeGuideTab
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
              }`}
            >
              {isPlayingAudio && activeAudioKey === activeGuideTab ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>{isUrdu ? 'آواز بند کریں' : isRoman ? 'Awaz Band Karein' : 'Stop Voice'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>
                    {isUrdu
                      ? 'واضح آواز میں سنیں (Audio)'
                      : isRoman
                      ? 'Awaz Mein Sunein (Voice)'
                      : 'Listen Clearly (Voice)'}
                  </span>
                </>
              )}
            </button>

            {onSelectVitalToTest && (
              <button
                type="button"
                onClick={() => {
                  if (activeGuideTab === 'sugar') onSelectVitalToTest('sugar');
                  else if (activeGuideTab === 'bp') onSelectVitalToTest('bp');
                  else if (activeGuideTab === 'heart') onSelectVitalToTest('heart');
                  else onSelectVitalToTest('all');
                  window.scrollTo({ top: 380, behavior: 'smooth' });
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 transition-all cursor-pointer"
              >
                {isUrdu ? 'ابھی ٹیسٹ کریں ↑' : isRoman ? 'Abhi Test Karein ↑' : 'Test Now ↑'}
              </button>
            )}
          </div>
        </div>

        {/* ---------------- SECTION 1: SUGAR GUIDE ---------------- */}
        {activeGuideTab === 'sugar' && (
          <div className="space-y-5 text-slate-200 text-xs sm:text-sm leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                <h4 className="text-sm font-extrabold text-teal-400 flex items-center gap-2">
                  <Droplets className="w-4 h-4" />
                  <span>
                    {isUrdu
                      ? '1. ہاتھ دھونا اور پٹی لگانا'
                      : isRoman
                      ? '1. Haath Dhona Aur Strip Lagana'
                      : '1. Hand Washing & Strip Insertion'}
                  </span>
                </h4>
                <p className="text-slate-300">
                  {isUrdu
                    ? 'ٹیسٹ سے پہلے ہاتھ صابن اور نیم گرم پانی سے لازمی دھوئیں اور مکمل خشک کریں۔ اگر ہاتھوں پر پھل یا میٹھے کا ہلکا سا بھی اثر ہو تو گلوکومیٹر 50 سے 100 نمبر زیادہ دکھا سکتا ہے۔ پٹی کو مشین میں سیدھا داخل کریں۔'
                    : isRoman
                    ? 'Test se pehle haath saaf dho kar achi tarah khushk karein. Agar haathon par kisi meethay ya khane ka asar ho toh reading ghalat aayegi. Test strip ko glucometer ke slot mein lagayein.'
                    : 'Wash your hands with warm soapy water and dry thoroughly. Traces of food or fruit sugar on your fingertips can falsely elevate readings by 50-100 mg/dL. Insert the strip into the meter slot.'}
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                <h4 className="text-sm font-extrabold text-teal-400 flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  <span>
                    {isUrdu
                      ? '2. خون کا قطرہ اور انگلی کی جگہ'
                      : isRoman
                      ? '2. Khoon Ka Qatra Aur Lancing'
                      : '2. Lancing & Blood Sample'}
                  </span>
                </h4>
                <p className="text-slate-300">
                  {isUrdu
                    ? 'انگلی کے بالکل درمیان میں سوئی نہ چبھوئیں کیونکہ وہاں اعصاب زیادہ ہوتے ہیں اور درد ہوتا ہے۔ انگلی کی سائڈ (کنارے) پر لینسنگ پین لگائیں۔ پہلے چھوٹے قطرے کو ٹشو سے صاف کر دیں اور دوسرے تازہ قطرے کو سٹرپ پر لگائیں۔'
                    : isRoman
                    ? 'Ungli ke beech mein needle na lagayein, hamesha ungli ke kinare (side) par halka puncture karein taakay dard na ho. Pehla drop tissue se saaf karein aur doosra saaf drop strip ke sire par lagayein.'
                    : 'Prick the side of your fingertip rather than the center pad, which has more nerve endings. Wipe away the first small bead of blood with a tissue, and touch the second fresh drop to the strip tip.'}
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                <h4 className="text-sm font-extrabold text-teal-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {isUrdu
                      ? '3. نہار منہ بمقابلہ کھانے کے بعد (Fasting vs Random)'
                      : isRoman
                      ? '3. Fasting Aur Random Ka Farq'
                      : '3. Fasting vs. Post-Meal Timing'}
                  </span>
                </h4>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  <li>
                    <strong className="text-white">
                      {isUrdu ? 'نہار منہ (Fasting):' : isRoman ? 'Nehar Munh (Fasting):' : 'Fasting:'}
                    </strong>{' '}
                    {isUrdu
                      ? 'رات بھر 8 سے 10 گھنٹے بعد، ناشتے سے پہلے۔ نارمل رینج: 70 تا 99 mg/dL۔'
                      : isRoman
                      ? 'Subah nashtay se pehle 8-10 ghantay bhookay reh kar. Normal: 70-99 mg/dL.'
                      : '8-10 hours overnight fast before breakfast. Normal range: 70-99 mg/dL.'}
                  </li>
                  <li>
                    <strong className="text-white">
                      {isUrdu ? 'کھانے کے بعد (Post-Meal / Random):' : isRoman ? 'Khanay Ke Baad (Random):' : 'Post-Meal:'}
                    </strong>{' '}
                    {isUrdu
                      ? 'کھانا ختم ہونے کے ٹھیک 2 گھنٹے بعد۔ نارمل رینج: 140 mg/dL سے کم۔'
                      : isRoman
                      ? 'Khana khatam hone ke theek 2 ghantay baad. Normal: 140 mg/dL se kam.'
                      : 'Exactly 2 hours after meal completion. Normal: Under 140 mg/dL.'}
                  </li>
                </ul>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                <h4 className="text-sm font-extrabold text-teal-400 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span>
                    {isUrdu
                      ? '4. اس ایپ میں درج کرنے کا طریقہ'
                      : isRoman
                      ? '4. Is App Mein Kaise Enter Karein'
                      : '4. How to Enter in This App'}
                  </span>
                </h4>
                <p className="text-slate-300">
                  {isUrdu
                    ? 'اوپر "صرف شوگر ٹیسٹ" والے ٹیب پر جائیں۔ Fasting یا Random پر کلک کریں۔ اپنا نمبر لکھیں اور اگر آپ کو پہلے سے شوگر ہے تو Diagnosed Diabetic میں "ہاں" چنیں۔ "شوگر رزلٹ دیکھیں" دبائیں، ایپ آپ کو فوری طور پر محفوظ، بارڈر لائن یا خطرے کا الرٹ دے گی۔'
                    : isRoman
                    ? 'Oopar Sugar Test tab par jayein. Fasting ya Random choose karein. Number likhein aur agar pehle se diabetes hai toh Yes par click karein. Result button dabayein taakay AI aur PMDC guidelines ke mutabiq status mil sakay.'
                    : 'Switch to the "Sugar Test Only" tab above. Select Fasting or Random, enter your reading, and indicate if you have pre-diagnosed diabetes. Press Analyze to receive clinical risk stratification.'}
                </p>
              </div>
            </div>

            {/* Critical Warning Box */}
            <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="block text-amber-300 font-bold mb-0.5">
                  {isUrdu ? 'اہم طبی انتباہ:' : isRoman ? 'Ahem Tibbi Alert:' : 'Important Clinical Note:'}
                </strong>
                <span>
                  {isUrdu
                    ? 'اگر شوگر 70 سے کم ہو جائے (Hypoglycemia) تو مریض کو فوراً 3 چمچ چینی، شربت یا شہد پلائیں کیونکہ لو شوگر جان لیوا ہو سکتی ہے۔ اگر شوگر 300 سے زیادہ ہو جائے تو بغیر تاخیر کے ہسپتال جائیں۔'
                    : isRoman
                    ? 'Agar sugar 70 se kam ho (Hypoglycemia), toh mareez ko foran cheeni, meetha sharbat ya juice pilayein kyunke low sugar behoshi ka sabab ban sakti hai. 300 se zyada hone par doctor se rabta karein.'
                    : 'If blood sugar drops below 70 mg/dL (hypoglycemia), promptly administer 15-20g fast-acting sugar (fruit juice, candy, or honey). If sugar exceeds 300 mg/dL, seek urgent physician evaluation.'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- SECTION 2: BLOOD PRESSURE GUIDE ---------------- */}
        {activeGuideTab === 'bp' && (
          <div className="space-y-5 text-slate-200 text-xs sm:text-sm leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                <h4 className="text-sm font-extrabold text-rose-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {isUrdu
                      ? '1. ٹیسٹ سے پہلے 5 منٹ کا آرام'
                      : isRoman
                      ? '1. Test Se Pehle 5 Minute Aaram'
                      : '1. 5-Minute Pre-Test Rest'}
                  </span>
                </h4>
                <p className="text-slate-300">
                  {isUrdu
                    ? 'بی پی چیک کرنے سے 30 منٹ پہلے چائے، کافی، سگریٹ، نسوار یا بھاری کام سے مکمل پرہیز کریں۔ کرسی پر کمر سیدھی رکھ کر ٹیک لگا کر 5 منٹ پرسکون بیٹھیں۔ دونوں پاؤں زمین پر سیدھے رکھیں، ٹانگ پر ٹانگ نہ چڑھائیں۔'
                    : isRoman
                    ? 'BP check karne se aadha ghanta pehle chai, smoking ya dhoop mein chalne se parhez karein. Kursi par 5 minute pur-sukoon bethein. Dono paon zameen par seedhay hon, cross legs na karein.'
                    : 'Avoid caffeine, tobacco, or vigorous movement for 30 minutes before testing. Sit quietly in a chair with back supported and both feet flat on the floor for at least 5 minutes.'}
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                <h4 className="text-sm font-extrabold text-rose-400 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>
                    {isUrdu
                      ? '2. کف باندھنے کی درست پوزیشن'
                      : isRoman
                      ? '2. Cuff Baandhne Ki Sahi Jagah'
                      : '2. Proper Cuff Placement'}
                  </span>
                </h4>
                <p className="text-slate-300">
                  {isUrdu
                    ? 'کف کو ننگے بازو پر باندھیں (موٹے کپڑے کے اوپر کف باندھنے سے ریڈنگ غلط آتی ہے)۔ کہنی کے موڑ سے ایک انچ (دو انگلیاں) اوپر کف دل کے برابر رکھیں۔ کف اتنا کسیں کہ اس کے اندر صرف 2 انگلیاں آسانی سے جا سکیں۔'
                    : isRoman
                    ? 'Cuff ko nange baazu par kohni se ek inch oopar dil ki barabari par baandhein. Kapray ke oopar cuff na lagayein. Itna tight karein ke 2 ungliyan aasaani se andar ja sakein.'
                    : 'Place the cuff directly on bare skin, 1 inch above the bend of your elbow, supported at heart level. Do not wrap over clothing sleeves. The cuff should fit snugly so two fingers can slide underneath.'}
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                <h4 className="text-sm font-extrabold text-rose-400 flex items-center gap-2">
                  <VolumeX className="w-4 h-4" />
                  <span>
                    {isUrdu
                      ? '3. ٹیسٹ کے دوران خاموشی اور دو نمبرز'
                      : isRoman
                      ? '3. Test Ke Waqt Khamoshi'
                      : '3. Silence During Measurement'}
                  </span>
                </h4>
                <p className="text-slate-300">
                  {isUrdu
                    ? 'اسٹارٹ کا بٹن دبانے کے بعد بالکل خاموش رہیں۔ بولنے یا فون پر بات کرنے سے بلڈ پریشر 10 سے 15 درجے بڑھ جاتا ہے۔ مشین دو نمبر دے گی: اوپر والا سسٹولک (نارمل: 120 سے کم) اور نیچے والا ڈائیسٹولک (نارمل: 80 سے کم)۔'
                    : isRoman
                    ? 'Start dabane ke baad hargiz na bolein aur na hilein. Baat karne se BP 10-15 points barh jata hai. Machine do readings degi: Oopar wala Systolic (Normal <120) aur neechay wala Diastolic (Normal <80).'
                    : 'Remain completely still and silent during measurement. Talking increases BP by 10-15 mmHg. Read the two numbers: Top Systolic (Normal <120 mmHg) and bottom Diastolic (Normal <80 mmHg).'}
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                <h4 className="text-sm font-extrabold text-teal-400 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span>
                    {isUrdu
                      ? '4. اس ایپ میں محفوظ کرنے کا طریقہ'
                      : isRoman
                      ? '4. Is App Mein Darj Karne Ka Tareeqa'
                      : '4. How to Record in This App'}
                  </span>
                </h4>
                <p className="text-slate-300">
                  {isUrdu
                    ? 'اوپر "صرف بلڈ پریشر" پر جائیں۔ اوپر والا اور نیچے والا نمبر الگ الگ خانوں میں لکھیں۔ اگر آپ کو ہائی بی پی کی بیماری ہے تو Yes منتخب کریں اور "بی پی رزلٹ دیکھیں" دبائیں۔ ریڈنگ خودکار روزانہ کے ریکارڈ میں محفوظ ہو جائے گی۔'
                    : isRoman
                    ? 'Oopar "Blood Pressure Only" par click karein. Systolic aur Diastolic dono numbers alag boxes mein likhein. Diagnosed Hypertensive par Yes/No select karein aur result check karein.'
                    : 'Select "Blood Pressure Only" mode above. Input systolic and diastolic values into their respective boxes, confirm diagnosed hypertension status, and click Analyze to view guidelines and store in logbook.'}
                </p>
              </div>
            </div>

            {/* Critical BP Warning */}
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="block text-rose-300 font-bold mb-0.5">
                  {isUrdu ? 'ایمرجنسی کرائسس الرٹ:' : isRoman ? 'Emergency Crisis Alert:' : 'Hypertensive Crisis Alert:'}
                </strong>
                <span>
                  {isUrdu
                    ? 'اگر اوپر والا بی پی 180 یا نیچے والا 120 سے بڑھ جائے، اور ساتھ سر چکرائے، قے آئے یا سینے میں دباؤ ہو، تو یہ ایمرجنسی ہے۔ فوراً 1122 پر کال کریں یا ہسپتال جائیں۔'
                    : isRoman
                    ? 'Agar oopar wala BP 180 ya neechay wala 120 se oopar chala jaye aur sar dard ya seenay mein jalan/dard ho, toh foran 1122 call karein ya hospital jayein.'
                    : 'Readings exceeding 180/120 mmHg accompanied by chest discomfort, shortness of breath, or neurological numbness constitute a hypertensive emergency. Contact Rescue 1122 immediately.'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- SECTION 3: HEART RATE / PULSE GUIDE ---------------- */}
        {activeGuideTab === 'heart' && (
          <div className="space-y-5 text-slate-200 text-xs sm:text-sm leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                <h4 className="text-sm font-extrabold text-red-400 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span>
                    {isUrdu
                      ? '1. کلائی کی نبض تلاش کرنے کا طریقہ'
                      : isRoman
                      ? '1. Kalai Ki Pulse Talash Karna'
                      : '1. Locating Radial Pulse'}
                  </span>
                </h4>
                <p className="text-slate-300">
                  {isUrdu
                    ? 'اپنے الٹے ہاتھ کی ہتھیلی چھت کی طرف رکھیں۔ سیدھے ہاتھ کی دو انگلیاں (شہادت اور درمیانی انگلی) الٹے ہاتھ کے انگوٹھے کی جڑ کے بالکل نیچے کلائی کی ہڈی کے ساتھ رکھیں۔ ہلکا سا دبائیں جب تک دھڑکن کی ٹک ٹک محسوس نہ ہو۔'
                    : isRoman
                    ? 'Apne ultay haath ki hatheli oopar rakhein. Seedhay haath ki index aur middle ungliyon ko angoothay ke neechay kalai par rakhein aur halka dabayein jab tak dharkan mehsoos na ho.'
                    : 'Rest your forearm with palm facing upward. Place the pads of your index and middle fingers on the wrist groove below the base of your thumb. Press gently until you feel the rhythmic pulsation of the radial artery.'}
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                <h4 className="text-sm font-extrabold text-red-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {isUrdu
                      ? '2. 60 سیکنڈ گننا اور نارمل رینج'
                      : isRoman
                      ? '2. 60 Second Ginein Aur Normal Range'
                      : '2. 60-Second Count & Normal Range'}
                  </span>
                </h4>
                <p className="text-slate-300">
                  {isUrdu
                    ? 'گھڑی کی سوئی دیکھ کر پورے 60 سیکنڈ تک دھڑکنیں گنیں (یا 30 سیکنڈ گن کر 2 سے ضرب دیں)۔ بالغوں میں عام حالت میں نارمل دل کی دھڑکن 60 سے 100 دھڑکن فی منٹ (BPM) ہوتی ہے۔ اگر آپ آرام کر رہے ہیں اور دھڑکن 100 سے زیادہ ہے تو ڈاکٹر کو دکھائیں۔'
                    : isRoman
                    ? 'Pura 60 second dharkan ginein. Normal adult resting heart rate 60 se 100 BPM hoti hai. Agar baithay hue dil ki dharkan 100 se taiz ho rahi ho toh aaraam karein aur paani piyein.'
                    : 'Count beats for a full 60 seconds (or count 30 seconds and multiply by 2). A healthy resting heart rate for adults ranges from 60 to 100 BPM. Well-trained athletes often possess resting rates between 45-60 BPM.'}
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                <h4 className="text-sm font-extrabold text-teal-400 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span>
                    {isUrdu
                      ? '3. موبائل کیمرہ پلس سینسر (اس ایپ کی خاص سہولت)'
                      : isRoman
                      ? '3. Mobile Camera Pulse Scanner'
                      : '3. In-App Camera Pulse Scanner'}
                  </span>
                </h4>
                <p className="text-slate-300">
                  {isUrdu
                    ? 'اگر آپ کو ہاتھ سے گننا مشکل لگ رہا ہے تو اس ایپ میں "Live Camera Sensor" کا بٹن دبائیں۔ موبائل کے پچھلے کیمرے کے لینس پر اپنی انگلی کا پپوٹا نرمی سے رکھیں۔ ایپ آپ کے خون کے بہاؤ سے دھڑکن خود بخود ماپ لے گی!'
                    : isRoman
                    ? 'Agar haath se ginna mushkil ho toh is app mein Live Camera Pulse Sensor kholiye. Mobile ke back camera lens par apni ungli rakhein, app camera flash se aapki dharkan auto scan kar legi.'
                    : 'If manual counting feels difficult, click "Live Camera Pulse Sensor" above. Place your index fingertip gently over your rear camera lens with flash active. Optical photoplethysmography measures your pulse automatically!'}
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                <h4 className="text-sm font-extrabold text-teal-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isUrdu
                      ? '4. اس ایپ میں محفوظ کرنے کا طریقہ'
                      : isRoman
                      ? '4. Is App Mein Save Karne Ka Tareeqa'
                      : '4. How to Record in This App'}
                  </span>
                </h4>
                <p className="text-slate-300">
                  {isUrdu
                    ? 'اوپر "صرف دل کی دھڑکن" والے ٹیب پر جائیں۔ اپنا BPM نمبر لکھیں اور "ہارٹ ریٹ رزلٹ دیکھیں" دبائیں۔ ایپ بتائے گی کہ دھڑکن نارمل، سست (Bradycardia) یا تیز (Tachycardia) ہے اور اسے لاگ بک میں درج کر دے گی۔'
                    : isRoman
                    ? 'Heart Rate Only tab par jayein. BPM enter karein aur button dabayein. App bataye gi ke pulse normal hai ya abnormal aur history mein store kar degi.'
                    : 'Switch to the "Heart Rate Only" tab above. Input your measured BPM, and click Evaluate to generate telemetry classification and append to your records.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- SECTION 4: HOW APP WORKS ---------------- */}
        {activeGuideTab === 'app' && (
          <div className="space-y-5 text-slate-200 text-xs sm:text-sm leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                <h4 className="text-sm font-extrabold text-teal-400 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>
                    {isUrdu
                      ? '1. الگ الگ ٹیسٹ یا تمام وائٹلز ایک ساتھ'
                      : isRoman
                      ? '1. Alag Alag Test Ya Sub Ek Sath'
                      : '1. Modular or Combined Testing'}
                  </span>
                </h4>
                <p className="text-slate-300">
                  {isUrdu
                    ? 'آپ کو تمام چیزیں ایک ساتھ درج کرنے کی قطعی ضرورت نہیں ہے۔ اگر آپ صرف شوگر چیک کرنا چاہتے ہیں تو "صرف شوگر"، اگر صرف بی پی دیکھنا ہے تو "صرف بی پی"، اور اگر سب دیکھنا ہے تو "تمام وائٹلز ایک ساتھ" چنیں۔'
                    : isRoman
                    ? 'Aap ko sub vitals ek sath bharna zaroori nahi hai. Aap apni marzi se sirf sugar, sirf BP ya pulse alag alag test kar saktay hain.'
                    : 'You do not need to fill all fields together. Choose "Sugar Only", "Blood Pressure Only", or "Heart Rate Only" depending on what device you have available.'}
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                <h4 className="text-sm font-extrabold text-teal-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isUrdu
                      ? '2. شوگر و بی پی مریض کی لازمی تصدیق'
                      : isRoman
                      ? '2. Diagnosed Condition Ki Tasdeeq'
                      : '2. Prior Diagnosis Confirmation'}
                  </span>
                </h4>
                <p className="text-slate-300">
                  {isUrdu
                    ? 'شوگر اور بلڈ پریشر میں "Diagnosed" پر ہاں یا نہیں منتخب کرنا لازمی ہے۔ اس سے ایپ کو پتا چلتا ہے کہ آپ پہلے سے مریض ہیں یا نہیں، تاکہ کلینیکل رہنما خطوط بالکل آپ کی حالت کے مطابق ایڈجسٹ ہوں۔'
                    : isRoman
                    ? 'Sugar aur BP mein Yes/No select karna zaroori hai taakay app ko pata chalay ke aap diabetic ya BP ke mareez hain ya general checkup hai.'
                    : 'Confirming diagnosed diabetes or hypertension ensures the engine applies clinical target goals (e.g. ADA/AHA targets) customized to your personal medical profile.'}
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                <h4 className="text-sm font-extrabold text-teal-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {isUrdu
                      ? '3. روزانہ کا ریکارڈ اور ہفتہ وار لاگ بک'
                      : isRoman
                      ? '3. Rozana Ka Record Aur Logbook'
                      : '3. Day-by-Day Historical Logbook'}
                  </span>
                </h4>
                <p className="text-slate-300">
                  {isUrdu
                    ? 'ہر بار جب آپ رزلٹ دیکھیں گے، وہ خودکار طور پر ہفتے کے دن (ہفتہ، اتوار، سوموار وغیرہ) کے حساب سے محفوظ ہو جائے گا۔ "روزانہ کا مکمل ریکارڈ" کے ٹیب پر کلک کر کے آپ پرانی تاریخوں اور تجاویز کا موازنہ کر سکتے ہیں۔'
                    : isRoman
                    ? 'Har test aap ke din (Monday, Tuesday, Sunday etc.) ke hisab se logbook mein save ho jata hai. "Day-by-Day Logbook" mein ja kar purana record dekhein aur voice sunein.'
                    : 'Every evaluated test is automatically archived by day of the week (Monday, Tuesday, etc.) with date and doctor notes. Review anytime in the "Day-by-Day Logbook" tab.'}
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                <h4 className="text-sm font-extrabold text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isUrdu
                      ? '4. ڈاکٹر کے معائنے کے لیے بھیجنا'
                      : isRoman
                      ? '4. Doctor Review Queue Mein Bhejna'
                      : '4. Transmit to Doctor Queue'}
                  </span>
                </h4>
                <p className="text-slate-300">
                  {isUrdu
                    ? 'اگر کوئی ریڈنگ غیر معمولی یا خطرناک آئے تو رزلٹ کے نیچے "وائٹلز کا خلاصہ ڈاکٹر کے معائنے کے لیے بھیجیں" کا بٹن دیا گیا ہے، جس سے آپ کا ریکارڈ آن-ڈیوٹی پی ایم ڈی سی ڈاکٹر کے پاس فوری معائنے کے لیے چلا جاتا ہے۔'
                    : isRoman
                    ? 'Agar reading khatarnak ho toh "Send to Doctor Review Queue" dabayein taakay duty par mojood licensed doctor tak aapki file pohnch jaye.'
                    : 'In borderline or critical cases, click "Send Vitals Summary to Doctor Review Queue" to alert on-duty PMDC medical officers for priority clinical triage.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Summary Banner at Footer */}
      <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>
            {isUrdu
              ? 'صحت ساتھی وائٹلز گائیڈ برائے عام فہم طبی رہنمائی — پی ایم ڈی سی سند یافتہ پروٹوکولز'
              : 'SehatSaathi Clinical Vitals Guide calibrated to WHO & PMDC healthcare protocols'}
          </span>
        </div>
        <div className="text-[11px] text-slate-500 font-mono">
          Language: {guideLang.toUpperCase()} • Voice Synthesis Active
        </div>
      </div>
    </div>
  );
};
