import React, { useState } from 'react';
import { SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { voiceManager } from '../services/voice';
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
  ExternalLink,
} from 'lucide-react';

interface EmergencyCareProps {
  currentLanguage: SupportedLanguage;
}

export const EmergencyCare: React.FC<EmergencyCareProps> = ({ currentLanguage }) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const [copiedSos, setCopiedSos] = useState(false);
  const [userLocation, setUserLocation] = useState<string>('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setUserLocation('GPS not supported on this device. Please state your exact city and address.');
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setGpsCoordinates({ lat, lng });
        setUserLocation(`Live GPS: https://maps.google.com/?q=${lat.toFixed(5)},${lng.toFixed(5)} (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        setIsDetectingLocation(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setUserLocation('GPS permission denied or unavailable. Please specify your city or landmark.');
        setIsDetectingLocation(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const redFlags = [
    {
      title: 'Chest Pain or Crushing Pressure',
      native: 'سینے میں شدید درد یا گھٹن',
      desc: 'Radiating to left arm, neck, or jaw with sweating. Possible myocardial infarction (Heart Attack).',
      icon: HeartPulse,
    },
    {
      title: 'Severe Shortness of Breath (Stridor)',
      native: 'شدید سانس پھولنا یا دم گھٹنا',
      desc: 'Unable to speak full sentences, blue lips or fingertips. Urgent oxygenation required.',
      icon: Wind,
    },
    {
      title: 'Sudden Weakness or Slurred Speech (FAST)',
      native: 'چہرے یا بازو کا اچانک فالج / بولنے میں دشواری',
      desc: 'Face drooping, Arm weakness, Speech difficulty. Time is brain (Stroke window 3-4.5 hours).',
      icon: AlertTriangle,
    },
    {
      title: 'Uncontrolled Bleeding or Deep Wound',
      native: 'بہتا ہوا خون جو رک نہ رہا ہو',
      desc: 'Pulsing or pooling blood from accident or trauma. Apply firm direct pressure immediately.',
      icon: Droplets,
    },
    {
      title: 'Infant Convulsions or High Fever (>103°F)',
      native: 'شیر خوار بچے کا دورہ یا بے ہوشی',
      desc: 'Febrile seizure, extreme lethargy, refusal to feed, continuous high pitched crying.',
      icon: Flame,
    },
  ];

  const nationalHelplines = [
    {
      name: 'Rescue 1122 (Ambulance & Fire)',
      number: '1122',
      desc: 'Free government emergency rescue & ambulance in all provinces',
      badge: 'Toll-Free 24/7',
    },
    {
      name: 'Edhi Ambulance Service',
      number: '115',
      desc: 'Nationwide emergency ambulance network',
      badge: 'Nationwide 24/7',
    },
    {
      name: 'Chhipa Emergency Ambulance',
      number: '1020',
      desc: 'Rapid trauma and emergency response services',
      badge: '24/7 Hotline',
    },
    {
      name: 'National Poison Control Centre (JPMC)',
      number: '021-99205058',
      desc: 'Jinnah Post Graduate Medical Centre clinical toxicology hotline',
      badge: 'Specialist Toxicology',
    },
    {
      name: 'Mental Health Crisis Helpline (Umang)',
      number: '0311-7786264',
      desc: 'Immediate psychological emergency and crisis counseling',
      badge: 'Confidential Support',
    },
    {
      name: 'Police Emergency Assistance',
      number: '15',
      desc: 'Security, trauma scene protection, and highway rescue',
      badge: 'Emergency 15',
    },
  ];

  const sosMessage = `🚨 MEDICAL EMERGENCY ALERT (Via SehatSaathi):
Patient requires immediate urgent medical assistance.
${userLocation ? `Location: ${userLocation}` : 'Location: Live patient location pending detection'}
Rescue 1122 and emergency contacts dispatched. Please send immediate help!`;

  const handleCopySos = () => {
    navigator.clipboard.writeText(sosMessage);
    setCopiedSos(true);
    setTimeout(() => setCopiedSos(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Red Alert Header */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-900 via-red-800 to-rose-950 text-white shadow-2xl border border-red-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-700/80 border border-red-500 text-white text-xs font-bold mb-2 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              <span>National Emergency Protocol • Rescue 1122</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              Emergency Care & Rapid 1122
            </h1>
            <p className="text-xs sm:text-sm text-red-100 mt-1 max-w-xl">
              Toll-Free Government Ambulance Service active in all districts of Punjab, Sindh, KP, and Balochistan.
            </p>
          </div>

          <a
            href="tel:1122"
            className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-white text-red-700 hover:bg-red-50 font-extrabold text-base sm:text-lg shadow-xl hover:scale-105 active:scale-95 transition-all shrink-0 min-h-[56px]"
          >
            <PhoneCall className="w-6 h-6 animate-bounce" />
            <span>CALL 1122 NOW</span>
          </a>
        </div>
      </div>

      {/* Audio Emergency Notice */}
      <AudioPlayerControls
        currentLanguage={currentLanguage}
        textToSpeak="If you or someone around you has severe chest pain, sudden difficulty breathing, stroke symptoms, or heavy bleeding, call Rescue 1122 immediately. Do not delay."
      />

      {/* Red Flag Symptoms Grid */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span>Go to Hospital Immediately If You Have:</span>
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
                  <p className="text-xs font-semibold text-red-800 dark:text-red-300 mt-0.5">
                    {flag.native}
                  </p>
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
            <span>National Verified Emergency Helplines</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official 24/7 medical rescue, ambulance, and poison control hotlines across Pakistan.
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
                <span>Call {item.number}</span>
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
              Emergency SOS Message to Family & Contacts
            </h3>
            <p className="text-xs text-slate-500">
              Dispatches your actual GPS coordinates or landmark via WhatsApp, SMS, or clipboard
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopySos}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            {copiedSos ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedSos ? 'Copied!' : 'Copy SOS'}</span>
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
                {gpsCoordinates ? 'Live Coordinates Locked' : 'Accurate Location Tagging'}
              </span>
              <span className="text-teal-700 dark:text-teal-300">
                {userLocation || 'Attach your live GPS pin so rescue responders reach you without delay.'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={detectLocation}
            disabled={isDetectingLocation}
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {isDetectingLocation ? 'Detecting GPS...' : gpsCoordinates ? 'Refresh GPS' : 'Detect My Live GPS'}
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
            <span>Send SOS via WhatsApp</span>
          </a>

          <a
            href={`sms:?body=${encodeURIComponent(sosMessage)}`}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition-all min-h-[44px]"
          >
            <span>Send SOS via SMS</span>
          </a>
        </div>
      </div>
    </div>
  );
};
