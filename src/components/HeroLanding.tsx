import React from 'react';
import { SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import {
  Stethoscope,
  Pill,
  FileText,
  MapPin,
  AlertTriangle,
  History,
  ShieldCheck,
  PhoneCall,
  Mic,
  Languages,
  Clock,
  ArrowRight,
  CheckCircle2,
  Users,
  Award,
  Sparkles,
} from 'lucide-react';

interface HeroLandingProps {
  currentLanguage: SupportedLanguage;
  onNavigate: (tab: string) => void;
  onOpenDisclaimer: () => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({
  currentLanguage,
  onNavigate,
  onOpenDisclaimer,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const quickTools = [
    {
      id: 'symptoms',
      title: t.navSymptoms,
      desc: 'Check illness by voice or text in 7 languages with color-coded urgency and doctor triage.',
      icon: Stethoscope,
      accent: 'teal',
      badge: 'Voice + Text',
    },
    {
      id: 'medicine',
      title: t.navMedicine,
      desc: 'Verify safety, pediatric dose warnings, reverse lookup, or scan medicine boxes & bottles.',
      icon: Pill,
      accent: 'emerald',
      badge: 'Age-Calibrated',
    },
    {
      id: 'reports',
      title: t.navReports,
      desc: 'Upload lab blood tests, X-rays, or video scan for clear normal/abnormal explanations.',
      icon: FileText,
      accent: 'cyan',
      badge: 'AI Vision + PMDC',
    },
    {
      id: 'nearby',
      title: t.navNearby,
      desc: 'Locate certified specialist doctors, 24/7 trauma hospitals, and delivery pharmacies.',
      icon: MapPin,
      accent: 'blue',
      badge: 'GPS + Cities',
    },
    {
      id: 'emergency',
      title: t.navEmergency,
      desc: 'Red-flag symptom detector with one-tap Rescue 1122 ambulance and emergency guide.',
      icon: AlertTriangle,
      accent: 'red',
      badge: 'Free Ambulance 1122',
      isEmergency: true,
    },
    {
      id: 'records',
      title: t.navRecords,
      desc: 'Secure digital health records, QR verified prescriptions, and family profiles.',
      icon: History,
      accent: 'indigo',
      badge: 'EHR + QR Code',
    },
  ];

  const referenceCards = [
    {
      tab: 'records',
      title: 'Digital Health Records & EHR',
      subtitle: 'Paperless prescriptions with verifiable PMDC QR codes and family profiles.',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=700&auto=format&fit=crop&q=80',
      actionText: 'View Medical Records',
      icon: History,
    },
    {
      tab: 'nearby',
      title: 'Verified Doctors & 24/7 Care',
      subtitle: 'Direct booking and contact with certified physicians across all provinces.',
      imageUrl: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=700&auto=format&fit=crop&q=80',
      actionText: 'Locate Clinics & Pharmacies',
      icon: MapPin,
    },
    {
      tab: 'symptoms',
      title: 'Symptom Triage with Voice',
      subtitle: 'Talk in Urdu, Sindhi, Pashto, Balochi, Punjabi, Saraiki, or English.',
      imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=700&auto=format&fit=crop&q=80',
      actionText: 'Start Voice Assessment',
      icon: Stethoscope,
    },
    {
      tab: 'emergency',
      title: 'Emergency 1122 Coordination',
      subtitle: 'Critical red-flag triage with instant GPS dispatch to nearest trauma center.',
      imageUrl: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=700&auto=format&fit=crop&q=80',
      actionText: 'Emergency Assistance',
      icon: AlertTriangle,
    },
  ];

  const testimonials = [
    {
      name: 'Bashir Ahmed',
      location: 'Multan, Punjab',
      quote: 'I spoke in Saraiki about my chest congestion. SehatSaathi understood my voice clearly, warned me to see a chest physician, and guided me to Nishtar Hospital.',
      lang: 'Saraiki',
    },
    {
      name: 'Zareena Baloch',
      location: 'Quetta, Balochistan',
      quote: 'Checking my child’s fever syrup dosage in Balochi was life-saving. It warned us that the adult paracetamol tablet was too dangerous for a 2-year old.',
      lang: 'Balochi',
    },
    {
      name: 'Gulzar Khan',
      location: 'Peshawar, KP',
      quote: 'Uploaded my father’s lab report photo and it highlighted the elevated blood sugar in clear Pashto. The doctor then verified the case digitally.',
      lang: 'Pashto',
    },
  ];

  return (
    <div className="w-full space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/70 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border-b border-teal-100 dark:border-slate-800 pt-8 pb-14 sm:pt-14 sm:pb-20">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-teal-200/30 dark:bg-teal-900/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-emerald-200/30 dark:bg-emerald-900/20 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading & Calls to Action */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/80 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 text-xs font-bold tracking-wide">
                <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>PMDC Licensed Doctor Hybrid Architecture</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                Pakistan’s Complete <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400">
                  AI + Doctor Health
                </span>{' '}
                Companion
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Describe symptoms by voice or text, verify medicine safety across all ages, decode lab reports & X-rays, and connect directly with verified Pakistani doctors — in your own mother tongue.
              </p>

              {/* Supported Languages Tag */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Languages className="w-3.5 h-3.5 text-teal-600" />
                  Full 7 Languages:
                </span>
                {['English', 'اردو', 'سنڌي', 'پښتو', 'بلوچی', 'پنجابی', 'سرائیکی'].map((lang) => (
                  <span
                    key={lang}
                    className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200 shadow-2xs"
                  >
                    {lang}
                  </span>
                ))}
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-4">
                <button
                  id="hero-start-symptom-btn"
                  type="button"
                  onClick={() => onNavigate('symptoms')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-lg shadow-teal-600/25 transition-all min-h-[48px]"
                >
                  <Mic className="w-5 h-5 text-teal-200" />
                  <span>Check Symptoms (Voice / Text)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="hero-check-medicine-btn"
                  type="button"
                  onClick={() => onNavigate('medicine')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-sm sm:text-base shadow-xs transition-all min-h-[48px]"
                >
                  <Pill className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span>Verify Medicine Safety</span>
                </button>

                <a
                  href="tel:1122"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/20 transition-all min-h-[48px]"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Rescue 1122</span>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-200/80 dark:border-slate-800 text-left">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    PMDC Verified Doctors
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    24/7 AI Pre-Triage
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Pediatric & Elderly Safe
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Rural Friendly Voice
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Doctor Visual */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-teal-500 to-emerald-400 opacity-20 blur-xl" />
                <div className="relative overflow-hidden rounded-3xl border border-teal-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&auto=format&fit=crop&q=80"
                    alt="Pakistani Medical Physician"
                    className="w-full h-80 sm:h-96 object-cover object-top"
                    referrerPolicy="no-referrer"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300 mb-0.5">
                          <ShieldCheck className="w-4 h-4" />
                          <span>PMDC Validated Clinical Network</span>
                        </div>
                        <h4 className="text-lg font-extrabold text-white">Dr. Tariq Mahmood Khan</h4>
                        <p className="text-xs text-slate-200">Consultant Physician • Nishtar Hospital Multan</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold">
                        Online Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating Micro Badge */}
                <div className="absolute -bottom-4 -left-4 sm:left-4 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-teal-100 dark:border-slate-700 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Dual Spoken Audio</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">All answers read aloud natively</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rotating Ribbon Banner */}
      <div className="w-full bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 py-3 overflow-hidden text-white text-xs font-bold tracking-widest uppercase select-none shadow-xs">
        <div className="flex items-center justify-around gap-6 animate-marquee whitespace-nowrap">
          <span>Trusted Care</span>
          <span>•</span>
          <span>7 Regional Pakistani Languages</span>
          <span>•</span>
          <span>PMDC Licensed Doctors</span>
          <span>•</span>
          <span>Pediatric Dosage Alerts</span>
          <span>•</span>
          <span>Rescue 1122 Ambulance</span>
          <span>•</span>
          <span>X-Ray & Lab Analysis</span>
          <span>•</span>
          <span>Available 24/7 Everywhere</span>
        </div>
      </div>

      {/* Quick Action Clinical Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Comprehensive Clinical Tools
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Each tool delivers both written text and clear spoken voice in your selected regional language.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {quickTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                id={`tool-card-${tool.id}`}
                type="button"
                onClick={() => onNavigate(tool.id)}
                className={`group text-left p-6 rounded-3xl bg-white dark:bg-slate-800/90 border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between ${
                  tool.isEmergency
                    ? 'border-red-200 dark:border-red-900/60 hover:border-red-400 bg-red-50/30 dark:bg-red-950/20'
                    : 'border-slate-200/80 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-600'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs ${
                        tool.isEmergency
                          ? 'bg-red-600 text-white'
                          : 'bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        tool.isEmergency
                          ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                          : 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300'
                      }`}
                    >
                      {tool.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400 group-hover:translate-x-1 transition-transform">
                  <span>Open Tool</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* The 4 Reference Sections with Authentic Medical Imagery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Complete Medical Ecosystem
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Engineered for Every Pakistani Family
            </h2>
          </div>
          <button
            type="button"
            onClick={onOpenDisclaimer}
            className="text-xs text-slate-500 hover:text-teal-600 dark:text-slate-400 underline"
          >
            Review Clinical Protocols & Disclaimers
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {referenceCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all"
              >
                <div className="relative h-48 sm:h-56 w-full overflow-hidden">
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                  <div className="absolute top-4 left-4 p-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-teal-600 dark:text-teal-400 shadow-md">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mb-2">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
                    {card.subtitle}
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate(card.tab)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-200 dark:border-teal-800 text-xs font-bold transition-all"
                  >
                    <span>{card.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Patient Testimonials from Across Pakistan */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-teal-900 via-slate-900 to-teal-950 text-white border border-teal-800 shadow-2xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-300">
              Tested Across Pakistan
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-1">
              Helping Families from Karachi to Khyber
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((tItem, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col justify-between text-left"
              >
                <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed italic mb-4">
                  "{tItem.quote}"
                </p>
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-white">{tItem.name}</h5>
                    <p className="text-xs text-teal-300">{tItem.location}</p>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-teal-500/30 text-teal-200 font-medium">
                    {tItem.lang}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
