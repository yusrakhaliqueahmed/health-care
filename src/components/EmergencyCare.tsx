import React, { useState } from 'react';
import { SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { AudioPlayerControls } from './AudioPlayerControls';
import {
  AlertTriangle,
  PhoneCall,
  MapPin,
  Flame,
  HeartPulse,
  Wind,
  Droplets,
  Share2,
  CheckCircle,
  Copy,
} from 'lucide-react';

interface EmergencyCareProps {
  currentLanguage: SupportedLanguage;
}

export const EmergencyCare: React.FC<EmergencyCareProps> = ({ currentLanguage }) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';

  const [copiedSos, setCopiedSos] = useState(false);
  const [userLocation, setUserLocation] = useState<string>('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setUserLocation(
        isUrdu
          ? 'اس ڈیوائس پر جی پی ایس دستیاب نہیں ہے۔ برائے مہربانی اپنا شہر اور پتہ درج کریں۔'
          : 'GPS not supported on this device. Please state your exact city and address.'
      );
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setGpsCoordinates({ lat, lng });
        setUserLocation(
          `Live GPS: https://maps.google.com/?q=${lat.toFixed(5)},${lng.toFixed(5)} (${lat.toFixed(4)}, ${lng.toFixed(4)})`
        );
        setIsDetectingLocation(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setUserLocation(
          isUrdu
            ? 'جی پی ایس کی اجازت نہیں مل سکی۔ برائے مہربانی اپنا قریبی علاقہ بتائیں۔'
            : 'GPS permission denied or unavailable. Please specify your city or landmark.'
        );
        setIsDetectingLocation(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const redFlags = [
    {
      title: isUrdu ? 'سینے میں شدید درد یا گھٹن' : isRoman ? 'Seenay mein shadeed dard' : 'Chest Pain or Crushing Pressure',
      desc: isUrdu
        ? 'درد بائیں بازو، گردن یا جبڑے کی طرف پھیل رہا ہو اور پسینہ آ رہا ہو۔ دل کا دورہ (Heart Attack) ہو سکتا ہے۔'
        : isRoman
        ? 'Dard baen baazu, gardan ya jabray tak phel raha ho aur paseena aa raha ho. Dil ka daura ho sakta hai.'
        : 'Radiating to left arm, neck, or jaw with sweating. Possible myocardial infarction (Heart Attack).',
      icon: HeartPulse,
    },
    {
      title: isUrdu ? 'شدید سانس پھولنا یا دم گھٹنا' : isRoman ? 'Shadeed saans phoolna' : 'Severe Shortness of Breath (Stridor)',
      desc: isUrdu
        ? 'مکمل جملہ بولنے سے قاصر ہونا، نیلے ہونٹ یا پوریں۔ فوری طور پر آکسیجن اور طبی امداد کی ضرورت ہے۔'
        : isRoman
        ? 'Mukammal jumla bolne se qasir, neelay hont. Fori oxygen aur tibbi imdad ki zaroorat.'
        : 'Unable to speak full sentences, blue lips or fingertips. Urgent oxygenation required.',
      icon: Wind,
    },
    {
      title: isUrdu ? 'چہرے یا بازو کا اچانک فالج / بولنے میں دشواری' : isRoman ? 'Chehray ya baazu ka faalij' : 'Sudden Weakness or Slurred Speech (FAST)',
      desc: isUrdu
        ? 'چہرہ لٹک جانا، ہاتھ یا بازو کا سن ہونا، زبان لڑکھڑانا۔ فالج (Stroke) کی ہنگامی علامت ہے۔'
        : isRoman
        ? 'Chehra latak jana, haath sun hona, zuban larkharana. Faalij (Stroke) ki emergency alamat.'
        : 'Face drooping, Arm weakness, Speech difficulty. Time is brain (Stroke window 3-4.5 hours).',
      icon: AlertTriangle,
    },
    {
      title: isUrdu ? 'بہتا ہوا خون جو رک نہ رہا ہو' : isRoman ? 'Behta hua khoon' : 'Uncontrolled Bleeding or Deep Wound',
      desc: isUrdu
        ? 'حادثے یا گہرے زخم سے مسلسل خون بہنا۔ زخم پر فوری طور پر صاف کپڑے سے مضبوط دباؤ ڈالیں۔'
        : isRoman
        ? 'Haadsay ya gehre zakham se musalsal khoon behna. Zakham par saaf kapray se fori dabao dalein.'
        : 'Pulsing or pooling blood from accident or trauma. Apply firm direct pressure immediately.',
      icon: Droplets,
    },
    {
      title: isUrdu ? 'شیر خوار بچے کا دورہ یا بے ہوشی' : isRoman ? 'Bachay ka daura ya behoshi' : 'Infant Convulsions or High Fever (>103°F)',
      desc: isUrdu
        ? 'تیز بخار کے ساتھ جھٹکے لگنا، انتہائی سستی، دودھ پینے سے انکار یا مسلسل رونا۔'
        : isRoman
        ? 'Tez bukhar ke sath jhatkay, intehayi susti, doodh peene se inkar ya musalsal rona.'
        : 'Febrile seizure, extreme lethargy, refusal to feed, continuous high pitched crying.',
      icon: Flame,
    },
  ];

  const nationalHelplines = [
    {
      name: isUrdu ? 'ریسکیو 1122 (ایمبولینس و فائر)' : 'Rescue 1122 (Ambulance & Fire)',
      number: '1122',
      desc: isUrdu
        ? 'تمام صوبوں میں حکومت کی مفت ہنگامی ریسکیو اور ایمبولینس سروس'
        : isRoman
        ? 'Tamam subon mein hakumat ki muft emergency rescue aur ambulance'
        : 'Free government emergency rescue & ambulance in all provinces',
      badge: isUrdu ? 'مفت ۲۴/۷' : 'Toll-Free 24/7',
    },
    {
      name: isUrdu ? 'ایدھی ایمبولینس سروس' : 'Edhi Ambulance Service',
      number: '115',
      desc: isUrdu
        ? 'ملک گیر ہنگامی ایمبولینس اور فرسٹ ایڈ نیٹ ورک'
        : isRoman
        ? 'Mulk-geer emergency ambulance aur first aid network'
        : 'Nationwide emergency ambulance network',
      badge: isUrdu ? 'ملک گیر ۲۴/۷' : 'Nationwide 24/7',
    },
    {
      name: isUrdu ? 'چھیپا ایمرجنسی ایمبولینس' : 'Chhipa Emergency Ambulance',
      number: '1020',
      desc: isUrdu
        ? 'فوری حادثات اور ٹراما ریسپانس ایمبولینس'
        : isRoman
        ? 'Fori haadsaat aur trauma response ambulance'
        : 'Rapid trauma and emergency response services',
      badge: isUrdu ? 'ہاٹ لائن ۲۴/۷' : '24/7 Hotline',
    },
    {
      name: isUrdu ? 'نیشنل پوائزن کنٹرول سینٹر (جے پی ایم سی)' : 'National Poison Control Centre (JPMC)',
      number: '021-99205058',
      desc: isUrdu
        ? 'زہر خوانی یا مضر اثرات کے علاج کے لیے کلینیکل ٹاکسی کولوجی ہاٹ لائن'
        : isRoman
        ? 'Zahar khurani ya reaction ke ilaaj ke liye clinical hotline'
        : 'Jinnah Post Graduate Medical Centre clinical toxicology hotline',
      badge: isUrdu ? 'پوائزن کنٹرول' : 'Specialist Toxicology',
    },
    {
      name: isUrdu ? 'ذہنی صحت ہیلپ لائن (امنگ)' : 'Mental Health Crisis Helpline (Umang)',
      number: '0311-7786264',
      desc: isUrdu
        ? 'فوری نفسیاتی ہنگامی امداد اور خفیہ رہنمائی'
        : isRoman
        ? 'Fori nafsiyati emergency imdad aur confidential counseling'
        : 'Immediate psychological emergency and crisis counseling',
      badge: isUrdu ? 'خفیہ رہنمائی' : 'Confidential Support',
    },
    {
      name: isUrdu ? 'پولیس ایمرجنسی امداد' : 'Police Emergency Assistance',
      number: '15',
      desc: isUrdu
        ? 'سیکیورٹی، حادثے کی جگہ حفاظت، اور ہائی وے ریسکیو'
        : isRoman
        ? 'Security, haadsay ki hifazat aur highway rescue'
        : 'Security, trauma scene protection, and highway rescue',
      badge: isUrdu ? 'پولیس 15' : 'Emergency 15',
    },
  ];

  const sosMessage = isUrdu
    ? `🚨 فوری طبی ہنگامی الرٹ (صحت ساتھی کے ذریعے):
مریض کو فوری ہنگامی طبی امداد کی ضرورت ہے۔
${userLocation ? `مقام: ${userLocation}` : 'مقام: مریض کی لوکیشن لوڈ ہو رہی ہے'}
ریسکیو 1122 اور ایمرجنسی رابطوں کو مطلع کیا جا رہا ہے۔ برائے مہربانی فوری مدد بھیجیں!`
    : `🚨 MEDICAL EMERGENCY ALERT (Via SehatSaathi):
Patient requires immediate urgent medical assistance.
${userLocation ? `Location: ${userLocation}` : 'Location: Live patient location pending detection'}
Rescue 1122 and emergency contacts dispatched. Please send immediate help!`;

  const handleCopySos = () => {
    navigator.clipboard.writeText(sosMessage);
    setCopiedSos(true);
    setTimeout(() => setCopiedSos(false), 2000);
  };

  const audioNotice = isUrdu
    ? 'اگر آپ کو یا آپ کے قریب کسی شخص کو سینے میں شدید درد، سانس لینے میں دشواری، فالج کی علامات یا تیز خون بہنے کی شکایت ہو تو فوراً ریسکیو 1122 پر کال کریں۔ تاخیر ہرگز نہ کریں۔'
    : isRoman
    ? 'Agar aap ko ya kisi ko seenay mein shadeed dard, saans lene mein dushwari ya khoon behne ki shikayat ho to foran 1122 call karein.'
    : 'If you or someone around you has severe chest pain, sudden difficulty breathing, stroke symptoms, or heavy bleeding, call Rescue 1122 immediately. Do not delay.';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Red Alert Header */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-900 via-red-800 to-rose-950 text-white shadow-2xl border border-red-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-700/80 border border-red-500 text-white text-xs font-bold mb-2 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              <span>
                {isUrdu
                  ? 'قومی ایمرجنسی پروٹوکول • ریسکیو 1122'
                  : 'National Emergency Protocol • Rescue 1122'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              {isUrdu
                ? 'ہنگامی طبی امداد اور ریسکیو 1122'
                : isRoman
                ? 'Emergency Imdad & Rescue 1122'
                : 'Emergency Care & Rapid 1122'}
            </h1>
            <p className="text-xs sm:text-sm text-red-100 mt-1 max-w-xl">
              {isUrdu
                ? 'پنجاب، سندھ، خیبر پختونخوا اور بلوچستان کے تمام اضلاع میں حکومت پاکستان کی مفت ایمبولینس سروس'
                : 'Toll-Free Government Ambulance Service active in all districts of Punjab, Sindh, KP, and Balochistan.'}
            </p>
          </div>

          <a
            href="tel:1122"
            className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-white text-red-700 hover:bg-red-50 font-extrabold text-base sm:text-lg shadow-xl hover:scale-105 active:scale-95 transition-all shrink-0 min-h-[56px]"
          >
            <PhoneCall className="w-6 h-6 animate-bounce" />
            <span>{isUrdu ? 'ابھی 1122 ملائیں' : 'CALL 1122 NOW'}</span>
          </a>
        </div>
      </div>

      {/* Audio Emergency Notice */}
      <AudioPlayerControls
        currentLanguage={currentLanguage}
        textToSpeak={audioNotice}
      />

      {/* Red Flag Symptoms Grid */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span>
            {isUrdu
              ? 'اگر یہ علامات ہوں تو فوراً ہسپتال پہنچیں:'
              : isRoman
              ? 'Agar yeh alamaat hon to foran hospital jayein:'
              : 'Go to Hospital Immediately If You Have:'}
          </span>
        </h2>

        <div className="grid grid-cols-1 gap-3.5 pt-2">
          {redFlags.map((flag, idx) => {
            const Icon = flag.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-xl bg-red-600 text-white shrink-0 mt-0.5 shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-red-950 dark:text-red-200">
                    {flag.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {flag.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* National Verified Emergency Helplines Directory */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>
              {isUrdu
                ? 'قومی تصدیق شدہ ایمرجنسی ہیلپ لائنز'
                : isRoman
                ? 'Qaumi Emergency Helplines'
                : 'National Verified Emergency Helplines'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isUrdu
              ? 'پاکستان بھر میں ۲۴/۷ طبی امداد، ایمبولینس اور پوائزن کنٹرول سینٹرز کے سرکاری نمبرز'
              : 'Official 24/7 medical rescue, ambulance, and poison control hotlines across Pakistan.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {nationalHelplines.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                    {item.badge}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                    {item.number}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {item.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <a
                href={`tel:${item.number.replace(/-/g, '')}`}
                className="mt-4 flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{isUrdu ? `${item.number} پر کال کریں` : `Call ${item.number}`}</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency SOS Share Box with Dynamic GPS Location Detection */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isUrdu
                ? 'اہلِ خانہ اور قریبی رابطوں کے لیے ایمرجنسی ایس او ایس (SOS)'
                : isRoman
                ? 'Emergency SOS Message'
                : 'Emergency SOS Message to Family & Contacts'}
            </h3>
            <p className="text-xs text-slate-500">
              {isUrdu
                ? 'واٹس ایپ، ایس ایم ایس یا کلپ بورڈ کے ذریعے اپنی لوکیشن فوری شیئر کریں'
                : 'Dispatches your actual GPS coordinates or landmark via WhatsApp, SMS, or clipboard'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopySos}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            {copiedSos ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>
              {copiedSos
                ? (isUrdu ? 'کاپی ہو گیا!' : 'Copied!')
                : (isUrdu ? 'میسج کاپی کریں' : 'Copy SOS')}
            </span>
          </button>
        </div>

        {/* Live GPS Detector Bar */}
        <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-600 text-white shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-teal-950 dark:text-teal-200 block">
                {gpsCoordinates
                  ? (isUrdu ? 'جی پی ایس لوکیشن محفوظ ہو گئی' : 'Live Coordinates Locked')
                  : (isUrdu ? 'درست لوکیشن کا تعین' : 'Accurate Location Tagging')}
              </span>
              <span className="text-teal-700 dark:text-teal-300">
                {userLocation ||
                  (isUrdu
                    ? 'اپنی لائیو جی پی ایس پن منسلک کریں تاکہ ایمبولینس بغیر تاخیر پہنچ سکے۔'
                    : 'Attach your live GPS pin so rescue responders reach you without delay.')}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={detectLocation}
            disabled={isDetectingLocation}
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {isDetectingLocation
              ? (isUrdu ? 'جی پی ایس تلاش ہو رہا ہے...' : 'Detecting GPS...')
              : gpsCoordinates
              ? (isUrdu ? 'ریفریش جی پی ایس' : 'Refresh GPS')
              : (isUrdu ? 'میری لائیو لوکیشن معلوم کریں' : 'Detect My Live GPS')}
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-pre-line">
          {sosMessage}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(sosMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all min-h-[44px]"
          >
            <Share2 className="w-4 h-4" />
            <span>
              {isUrdu ? 'واٹس ایپ پر ایس او ایس بھیجیں' : 'Send SOS via WhatsApp'}
            </span>
          </a>

          <a
            href={`sms:?body=${encodeURIComponent(sosMessage)}`}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition-all min-h-[44px]"
          >
            <span>
              {isUrdu ? 'ایس ایم ایس (SMS) بھیجیں' : 'Send SOS via SMS'}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};
