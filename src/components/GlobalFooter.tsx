import React from 'react';
import {
  Activity,
  ShieldCheck,
  PhoneCall,
  Mail,
  MapPin,
  Globe,
  Linkedin,
  ChevronRight,
} from 'lucide-react';
import { SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../services/i18n';

interface GlobalFooterProps {
  currentLanguage: SupportedLanguage;
  onNavigateTab: (tab: string) => void;
  onOpenDisclaimer?: () => void;
}

export const GlobalFooter: React.FC<GlobalFooterProps> = ({
  currentLanguage,
  onNavigateTab,
  onOpenDisclaimer,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';

  return (
    <footer
      id="sehatsaathi-global-footer"
      className="mt-16 border-t border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-[#081d18] text-slate-700 dark:text-slate-300 transition-colors"
    >
      {/* Top Banner with Emergency Helpline & 24/7 Doctor Network */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 bg-teal-900 text-teal-50 px-4 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-center sm:text-left">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-semibold text-white">
              {isUrdu
                ? '۲۴/۷ قومی ہنگامی طبی امداد:'
                : isRoman
                ? '24/7 Qaumi Emergency Medical Imdad:'
                : '24/7 National Emergency Medical Response:'}
            </span>
            <span className="bg-red-600 text-white font-black px-2.5 py-0.5 rounded-full text-xs tracking-wider">
              {isUrdu ? 'کال 1122' : isRoman ? 'DIAL 1122' : 'DIAL 1122'}
            </span>
          </div>

          <div className="flex items-center space-x-4 rtl:space-x-reverse text-xs">
            <span className="flex items-center space-x-1.5 rtl:space-x-reverse text-teal-200">
              <ShieldCheck className="w-4 h-4 text-teal-300" />
              <span>
                {isUrdu
                  ? 'پی ایم ڈی سی تصدیق شدہ ڈاکٹرز'
                  : isRoman
                  ? 'PMDC Certified Tele-Doctors'
                  : 'PMDC Certified Tele-Doctors On-Call'}
              </span>
            </span>
            <span className="hidden md:inline text-teal-400">•</span>
            <span className="hidden md:inline text-teal-200">
              {isUrdu
                ? '۳ زبانوں میں مکمل دستیاب (انگریزی، اردو، رومن اردو)'
                : isRoman
                ? '3 Zubano mein dastiyab (English, Urdu, Roman Urdu)'
                : 'Available in English, Urdu & Roman Urdu'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Links Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 text-left rtl:text-right">
          {/* Column 1 & 2: Branding & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <Activity className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase font-serif">
                  {isUrdu ? 'صحت ساتھی پرو' : 'SehatSaathi Pro'}
                </span>
                <p className="text-[10px] font-bold text-teal-700 dark:text-teal-400 tracking-wider uppercase">
                  {isUrdu
                    ? 'مصنوعی ذہانت اور مستند ڈاکٹرز کی زیر نگرانی'
                    : isRoman
                    ? 'AI-Assisted Healthcare • Doctor Verified'
                    : 'AI-Assisted Healthcare • Doctor Verified'}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
              {isUrdu
                ? 'پاکستان کا پہلا جامع ڈیجیٹل طبی نظام۔ علامات کا فوری معائنہ، ادویات کی حفاظت و مضر اثرات کی جانچ، درست لیب رپورٹس کا تجزیہ، اور مستند پی ایم ڈی سی ڈاکٹرز سے مشورہ۔'
                : isRoman
                ? 'Pakistan ka pehla integrated digital tele-triage nizam. Alamaat ka fori jaiza, dawaiyon ki hifazat, authentic lab reports ka tajziya, aur verified PMDC doctor tele-consultation.'
                : "Pakistan's first integrated bilingual clinical tele-triage system. Delivering rapid symptom assessment, pharmacological drug safety checks, authentic diagnostic laboratory reports, and verified PMDC tele-consultations."}
            </p>

            {/* Certifications and Compliance Tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-md text-[10px] font-bold text-teal-800 dark:text-teal-300">
                <ShieldCheck className="w-3 h-3 text-teal-600" />
                <span>{isUrdu ? 'پی ایم ڈی سی معیارات' : 'PMDC Tele-Triage Standards'}</span>
              </span>
              <span className="inline-flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[10px] font-bold text-slate-700 dark:text-slate-300">
                <span>{isUrdu ? 'ڈریپ (DRAP) تصدیق شدہ فارمولری' : 'DRAP Formulary Verified'}</span>
              </span>
              <span className="inline-flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[10px] font-bold text-slate-700 dark:text-slate-300">
                <span>ISO 15189 Aligned</span>
              </span>
            </div>
          </div>

          {/* Column 3: Clinical Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              {isUrdu ? 'طبی تشخیصی خدمات' : isRoman ? 'Diagnostic Khidmaat' : 'Diagnostic Services'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('symptoms')}
                  className="hover:text-teal-600 dark:hover:text-teal-400 flex items-center space-x-1.5 rtl:space-x-reverse transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-teal-600" />
                  <span>{t.navSymptoms}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('medicine')}
                  className="hover:text-teal-600 dark:hover:text-teal-400 flex items-center space-x-1.5 rtl:space-x-reverse transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-teal-600" />
                  <span>{t.navMedicine}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('reports')}
                  className="hover:text-teal-600 dark:hover:text-teal-400 flex items-center space-x-1.5 rtl:space-x-reverse transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-teal-600" />
                  <span>{t.navReports}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('records')}
                  className="hover:text-teal-600 dark:hover:text-teal-400 flex items-center space-x-1.5 rtl:space-x-reverse transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-teal-600" />
                  <span>{t.navRecords}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('care')}
                  className="hover:text-teal-600 dark:hover:text-teal-400 flex items-center space-x-1.5 rtl:space-x-reverse transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-teal-600" />
                  <span>{t.navNearby}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Patient Care & Languages */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              {isUrdu ? 'زبانیں اور معاونت' : isRoman ? 'Zubanein aur Sahulat' : 'Languages & Support'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-1.5 rtl:space-x-reverse text-slate-600 dark:text-slate-400">
                <Globe className="w-3.5 h-3.5 text-teal-600" />
                <span>{isUrdu ? 'انگریزی (English)' : 'English (Default)'}</span>
              </li>
              <li className="flex items-center space-x-1.5 rtl:space-x-reverse text-slate-600 dark:text-slate-400">
                <Globe className="w-3.5 h-3.5 text-teal-600" />
                <span>{isUrdu ? 'اردو (Urdu) - مکمل دائیں سے بائیں' : 'Urdu (اردو) - RTL Support'}</span>
              </li>
              <li className="flex items-center space-x-1.5 rtl:space-x-reverse text-slate-600 dark:text-slate-400">
                <Globe className="w-3.5 h-3.5 text-teal-600" />
                <span>{isUrdu ? 'رومن اردو (Roman Urdu)' : 'Roman Urdu (Phonetic Voice TTS)'}</span>
              </li>
              <li className="pt-1">
                <button
                  type="button"
                  onClick={() => onNavigateTab('doctor_portal')}
                  className="text-teal-700 dark:text-teal-400 font-bold hover:underline flex items-center space-x-1 rtl:space-x-reverse"
                >
                  <span>{t.navDoctorPortal}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: 24/7 Helpline & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              {isUrdu ? 'ہنگامی امداد اور رابطہ' : isRoman ? 'Emergency aur Rabta' : 'Emergency & Support'}
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start space-x-2 rtl:space-x-reverse">
                <PhoneCall className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {isUrdu ? 'ہنگامی ایمرجنسی' : isRoman ? 'Emergency Imdad' : 'Emergency Response'}
                  </div>
                  <div className="font-mono text-red-600 font-bold">
                    {isUrdu ? 'کال 1122 (ریسکیو)' : 'Dial 1122 (Ambulance)'}
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2 rtl:space-x-reverse">
                <PhoneCall className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {isUrdu ? 'ہیلپ لائن (ٹول فری)' : isRoman ? 'Helpline (Toll-Free)' : 'Helpline (Toll-Free)'}
                  </div>
                  <div className="font-mono text-slate-600 dark:text-slate-400">021-111-SEHAT (73428)</div>
                </div>
              </div>

              <div className="flex items-start space-x-2 rtl:space-x-reverse">
                <Mail className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {isUrdu ? 'طبی ای میل رابطہ' : isRoman ? 'Clinical Rabta' : 'Clinical Inquiries'}
                  </div>
                  <div className="font-mono text-slate-600 dark:text-slate-400">support@sehatsaathi.pk</div>
                </div>
              </div>

              <div className="flex items-start space-x-2 rtl:space-x-reverse">
                <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {isUrdu ? 'قومی نیٹ ورک' : isRoman ? 'Qaumi Network' : 'National Network'}
                  </div>
                  <div className="text-slate-500">
                    {isUrdu ? 'کراچی • لاہور • اسلام آباد' : 'Karachi • Lahore • Islamabad'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-left rtl:text-right space-y-2 bg-slate-100/60 dark:bg-slate-900/40 p-4 rounded-xl">
          <p>
            <strong>
              {isUrdu ? 'لازمی پی ایم ڈی سی طبی ہدایت:' : 'Mandatory PMDC Tele-Health Notice:'}{' '}
            </strong>
            {isUrdu
              ? 'صحت ساتھی پرو ابتدائی مصنوعی ذہانت پر مبنی تشخیصی رہنمائی فراہم کرتا ہے جو پی ایم ڈی سی سند یافتہ ڈاکٹرز کے زیر نگرانی تیار کی گئی ہے۔ یہ ایمرجنسی سرجری یا براہ راست ہسپتال کا متبادل نہیں ہے۔ کسی بھی شدید ایمرجنسی میں فوراً ریسکیو 1122 پر کال کریں یا قریبی ہسپتال تشریف لے جائیں۔'
              : isRoman
              ? 'SehatSaathi Pro ibtidayi artificial intelligence triage aur diagnostic reference khidmaat faraham karta hai jo PMDC licensed doctors se reviewed hain. Yeh emergency surgery ya hospital ka mutabadil nahi. Kisi bhi shadeed emergency mein foran 1122 par call karein.'
              : 'SehatSaathi Pro provides preliminary artificial intelligence triage and diagnostic reference services, reviewed by licensed PMDC medical practitioners. It does not substitute for emergency surgical procedures or in-person intensive care. In any acute medical emergency, immediately call Rescue 1122 or proceed to the nearest emergency hospital department.'}
          </p>
          <div className="flex flex-wrap gap-4 text-slate-500 pt-1">
            <button
              type="button"
              onClick={onOpenDisclaimer}
              className="text-teal-700 dark:text-teal-400 underline hover:text-teal-800"
            >
              {isUrdu
                ? 'مکمل طبی دستبرداری و شرائط استعمال'
                : isRoman
                ? 'Mukammal Clinical Disclaimer & Terms'
                : 'Full Clinical Disclaimer & Terms of Use'}
            </button>
            <span>•</span>
            <span>
              {isUrdu
                ? 'رازداری کی پالیسی (محفوظ ڈیٹا)'
                : isRoman
                ? 'Privacy Policy (Encrypted EHR Storage)'
                : 'Privacy Policy (Encrypted EHR Storage)'}
            </span>
            <span>•</span>
            <span>
              {isUrdu
                ? 'ڈریپ (DRAP) تصدیق شدہ ادویات'
                : isRoman
                ? 'DRAP Approved Medication Database'
                : 'DRAP Approved Medication Database'}
            </span>
          </div>
        </div>

        {/* Bottom Credits & Designer Badge (with safe clearance for mobile navigation bar) */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 pb-12 lg:pb-0">
          <div>
            © {new Date().getFullYear()} <strong>{isUrdu ? 'صحت ساتھی پرو' : 'SehatSaathi Pro'}</strong>.{' '}
            {isUrdu ? 'تمام حقوق محفوظ ہیں۔' : 'All rights reserved.'}
          </div>

          {/* Designer Credit with Interactive Links */}
          <div className="group relative cursor-default">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-2xs transition-all duration-300 group-hover:border-teal-500/50">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {isUrdu ? 'ڈیزائن از' : 'Design by'}{' '}
                <span className="font-semibold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  Yusra Khalique Ahmed
                </span>
              </p>
              <div className="flex items-center gap-1 pl-1.5 rtl:pl-0 rtl:pr-1.5 border-l rtl:border-l-0 rtl:border-r border-slate-200 dark:border-slate-700">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  title="Portfolio"
                >
                  <Globe className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
