import { SupportedLanguage, LanguageInfo } from '../types';

export const LANGUAGES: Record<SupportedLanguage, LanguageInfo> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    bcp47: 'en-US',
    isRtl: false,
    greeting: 'Welcome to SehatSaathi Pro',
  },
  roman: {
    code: 'roman',
    name: 'Roman Urdu',
    nativeName: 'Roman Urdu',
    bcp47: 'ur-PK',
    isRtl: false,
    greeting: 'SehatSaathi Pro mein khush aamdeed',
  },
  ur: {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    bcp47: 'ur-PK',
    isRtl: true,
    greeting: 'صحت ساتھی پرو میں خوش آمدید',
  },
};

export interface Translations {
  appName: string;
  appSubtitle: string;
  tagline: string;
  disclaimerBanner: string;
  disclaimerTitle: string;
  disclaimerText: string;
  disclaimerAgree: string;
  navHome: string;
  navSymptoms: string;
  navMedicine: string;
  navReports: string;
  navNearby: string;
  navEmergency: string;
  navRecords: string;
  navDoctorMode: string;
  login: string;
  signup: string;
  logout: string;
  welcomeUser: string;
  call1122: string;
  emergencyAlert: string;
  whoIsThisFor: string;
  forSelf: string;
  forChild: string;
  forElderly: string;
  forTeen: string;
  forInfant: string;
  typeOrSpeak: string;
  voiceInput: string;
  listening: string;
  stopVoice: string;
  audioPlay: string;
  audioPause: string;
  audioResume: string;
  audioStop: string;
  audioSpeed: string;
  checkMedicine: string;
  reverseLookup: string;
  photoMedicine: string;
  uploadReport: string;
  takePhoto: string;
  uploadGallery: string;
  recordVideo: string;
  doctorReviewTag: string;
  greenUrgency: string;
  yellowUrgency: string;
  redUrgency: string;
  sendToDoctor: string;
  findCareTitle: string;
  doctorsTab: string;
  hospitalsTab: string;
  pharmaciesTab: string;
  useMyLocation: string;
  selectCity: string;
  doctorFee: string;
  open24_7: string;
  hasDelivery: string;
  verifiedPmdc: string;
  prescriptionQr: string;
  patientEhr: string;
  familyProfiles: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: {
    appName: 'SehatSaathi Pro',
    appSubtitle: 'Your Digital Healthcare Companion',
    tagline: 'AI + PMDC DOCTOR VERIFIED • AVAILABLE 24/7',
    disclaimerBanner: 'Preliminary medical guidance. Always consult a licensed PMDC doctor before taking medication.',
    disclaimerTitle: 'Medical Safety Notice',
    disclaimerText: 'This app is designed to guide and assist you, but it is not a replacement for a licensed doctor. In case of serious illness, bleeding, chest pain, or emergencies, contact Rescue 1122 or visit an emergency room immediately.',
    disclaimerAgree: 'I Understand, Continue',
    navHome: 'Home',
    navSymptoms: 'Symptom Triage',
    navMedicine: 'Medicine Safety',
    navReports: 'Report & X-Ray',
    navNearby: 'Find Care',
    navEmergency: 'Emergency 1122',
    navRecords: 'My Records',
    navDoctorMode: 'Doctor Portal',
    login: 'Sign In',
    signup: 'Create Account',
    logout: 'Sign Out',
    welcomeUser: 'Welcome',
    call1122: 'Call 1122',
    emergencyAlert: 'Immediate Emergency Help',
    whoIsThisFor: 'Who is this consultation for?',
    forSelf: 'Myself (Adult)',
    forChild: 'Child (2-12 yrs)',
    forElderly: 'Elderly (60+ yrs)',
    forTeen: 'Teenager (13-18 yrs)',
    forInfant: 'Infant (0-2 yrs)',
    typeOrSpeak: 'Describe your symptoms or ask in your language...',
    voiceInput: 'Tap to Speak',
    listening: 'Listening... speak now',
    stopVoice: 'Stop Recording',
    audioPlay: 'Listen',
    audioPause: 'Pause',
    audioResume: 'Resume',
    audioStop: 'Stop Audio',
    audioSpeed: 'Speed',
    checkMedicine: 'Check a Medicine',
    reverseLookup: 'Illness to Medicine',
    photoMedicine: 'Scan Medicine Photo',
    uploadReport: 'Upload Lab Report or X-Ray',
    takePhoto: 'Take Photo',
    uploadGallery: 'Upload from Gallery',
    recordVideo: 'Scan via Video',
    doctorReviewTag: 'Preliminary AI — Verified by PMDC Doctor',
    greenUrgency: 'Minor / Home Care',
    yellowUrgency: 'Consult Doctor Soon',
    redUrgency: 'Emergency Hospital Required',
    sendToDoctor: 'Send Case to PMDC Doctor',
    findCareTitle: 'Find Nearby Doctors, Hospitals & Pharmacies',
    doctorsTab: 'Specialist Doctors',
    hospitalsTab: 'Emergency Hospitals',
    pharmaciesTab: 'Pharmacies & Delivery',
    useMyLocation: 'Use My Current GPS',
    selectCity: 'Select City in Pakistan',
    doctorFee: 'Fee',
    open24_7: '24/7 Emergency',
    hasDelivery: 'Home Delivery Available',
    verifiedPmdc: 'PMDC Registered',
    prescriptionQr: 'Verified QR Digital Prescription',
    patientEhr: 'Health Records & Prescriptions',
    familyProfiles: 'Family Profiles',
  },
  roman: {
    appName: 'SehatSaathi Pro',
    appSubtitle: 'Aap Ka Digital Health Saathi',
    tagline: 'AI + PMDC DOCTOR VERIFIED • 24/7 DASTIYAB',
    disclaimerBanner: 'Ibtidai tibbi rehnumai. Koi bhi dawa lene se pehle licensed PMDC doctor se mashwara zaroori hai.',
    disclaimerTitle: 'Tibbi Hifazat Ka Zaroori Notice',
    disclaimerText: 'Yeh app aapki madad aur rehnumai ke liye hai, lekin yeh kisi licensed doctor ka mutabadil nahi hai. Seenay mein dard, shadeed saans ki takleef ya emergency ki soorat mein foran Rescue 1122 par call karein ya qareebi hospital tashreef le jayein.',
    disclaimerAgree: 'Main Samajh Gaya / Gayi, Aagay Barhein',
    navHome: 'Home',
    navSymptoms: 'Alamaat Checker',
    navMedicine: 'Dawaiyon ki Hifazat',
    navReports: 'Lab Reports & X-Ray',
    navNearby: 'Doctors & Hospitals',
    navEmergency: 'Emergency 1122',
    navRecords: 'Tibbi Records',
    navDoctorMode: 'Doctor Portal',
    login: 'Sign In',
    signup: 'Account Banayein',
    logout: 'Sign Out',
    welcomeUser: 'Khush Aamdeed',
    call1122: 'Call 1122',
    emergencyAlert: 'Fori Emergency Imdad',
    whoIsThisFor: 'Yeh mashwara kis ke liye hai?',
    forSelf: 'Apnay liye (Adult)',
    forChild: 'Bachay ke liye (2-12 saal)',
    forElderly: 'Buzurg ke liye (60+ saal)',
    forTeen: 'Naujawan ke liye (13-18 saal)',
    forInfant: 'Sheer-khaar bachay ke liye (0-2 saal)',
    typeOrSpeak: 'Apni alamaat bol kar batayein ya type karein...',
    voiceInput: 'Bolnay ke liye tap karein',
    listening: 'Sun raha hoon... baat karein',
    stopVoice: 'Recording band karein',
    audioPlay: 'Awaaz sunein',
    audioPause: 'Rokein',
    audioResume: 'Dobara sunein',
    audioStop: 'Awaaz band karein',
    audioSpeed: 'Raftaar',
    checkMedicine: 'Dawa ki Hifazat Check Karein',
    reverseLookup: 'Bimari se Dawa Maloom Karein',
    photoMedicine: 'Dawai ki Tasweer Scan Karein',
    uploadReport: 'Lab Report ya X-Ray Upload Karein',
    takePhoto: 'Tasweer Lein',
    uploadGallery: 'Gallery se Upload Karein',
    recordVideo: 'Video ke zariye Scan Karein',
    doctorReviewTag: 'Ibtidai AI — PMDC Doctor se tasdeeq shuda',
    greenUrgency: 'Mamooli Takleef / Ghar par Dekhbhal',
    yellowUrgency: 'Jald Doctor ko Dikhayein',
    redUrgency: 'Fori Emergency Hospital Zaroori',
    sendToDoctor: 'Case PMDC Doctor ko Bhejein',
    findCareTitle: 'Qareebi Doctors, Hospitals aur Medical Stores',
    doctorsTab: 'Specialist Doctors',
    hospitalsTab: 'Emergency Hospitals',
    pharmaciesTab: 'Pharmacies & Delivery',
    useMyLocation: 'Meri Mojooda GPS Location Istemal Karein',
    selectCity: 'Pakistan ka Shehr Muntakhib Karein',
    doctorFee: 'Fees',
    open24_7: '24/7 Emergency',
    hasDelivery: 'Home Delivery Dastiyab',
    verifiedPmdc: 'PMDC Registered',
    prescriptionQr: 'Verified QR Digital Nuskha',
    patientEhr: 'Tibbi Records & Nuskhay',
    familyProfiles: 'Khandani Profiles',
  },
  ur: {
    appName: 'صحت ساتھی پرو',
    appSubtitle: 'آپ کا ڈیجیٹل ہیلتھ ساتھی',
    tagline: 'اے آئی + پی ایم ڈی سی تصدیق شدہ ڈاکٹر • 24/7 دستیاب',
    disclaimerBanner: 'ابتدائی طبی رہنمائی۔ کوئی بھی دوا لینے سے پہلے مستند ڈاکٹر سے مشورہ ضروری ہے۔',
    disclaimerTitle: 'طبی حفاظت کی اہم ہدایت',
    disclaimerText: 'یہ ایپ آپ کی مدد اور رہنمائی کے لیے ہے، لیکن یہ کسی لائسنس یافتہ ڈاکٹر کا متبادل نہیں ہے۔ سینے میں درد، شدید سانس کی تکلیف یا ایمرجنسی کی صورت میں فوری ریسکیو 1122 کال کریں یا قریبی ہسپتال پہنچیں۔',
    disclaimerAgree: 'میں سمجھ گیا / سمجھ گئی، آگے بڑھیں',
    navHome: 'مرکزی صفحہ',
    navSymptoms: 'علامات کی جانچ',
    navMedicine: 'دوا کی تصدیق',
    navReports: 'رپورٹ اور ایکسرے',
    navNearby: 'ڈاکٹر و ہسپتال تلاش',
    navEmergency: 'ایمرجنسی 1122',
    navRecords: 'طبی ریکارڈ',
    navDoctorMode: 'ڈاکٹر پورٹل',
    login: 'لاگ ان',
    signup: 'اکاؤنٹ بنائیں',
    logout: 'لاگ آؤٹ',
    welcomeUser: 'خوش آمدید',
    call1122: 'کال 1122',
    emergencyAlert: 'فوری ہنگامی امداد',
    whoIsThisFor: 'یہ مشورہ کس کے لیے ہے؟',
    forSelf: 'میرے اپنے لیے',
    forChild: 'بچے کے لیے (2-12 سال)',
    forElderly: 'بزرگ کے لیے (60+ سال)',
    forTeen: 'نوجوان کے لیے (13-18 سال)',
    forInfant: 'شیر خوار (0-2 سال)',
    typeOrSpeak: 'اپنی علامات بول کر بتائیں یا لکھیں...',
    voiceInput: 'بولنے کے لیے دبائیں',
    listening: 'سن رہا ہوں... بات کیجیے',
    stopVoice: 'روکیں',
    audioPlay: 'آواز سنیں',
    audioPause: 'روکیں',
    audioResume: 'دوبارہ سنیں',
    audioStop: 'آواز بند کریں',
    audioSpeed: 'رفتار',
    checkMedicine: 'دوا کا نام چیک کریں',
    reverseLookup: 'بیماری سے دوا کی معلومات',
    photoMedicine: 'دوا کی تصویر اسکین کریں',
    uploadReport: 'لیب رپورٹ یا ایکسرے اپلوڈ کریں',
    takePhoto: 'تصویر کھینچیں',
    uploadGallery: 'گیلری سے منتخب کریں',
    recordVideo: 'ویڈیو سے اسکین کریں',
    doctorReviewTag: 'ابتدائی اے آئی جائزہ — ڈاکٹر سے توثیق شدہ',
    greenUrgency: 'معمولی / گھریلو احتیاط',
    yellowUrgency: 'جلد ڈاکٹر سے رجوع کریں',
    redUrgency: 'فوری ہسپتال ایمرجنسی',
    sendToDoctor: 'کیس ڈاکٹر کو بھیجیں',
    findCareTitle: 'قریبی ڈاکٹرز، ہسپتال اور میڈیکل اسٹورز',
    doctorsTab: 'ماہر ڈاکٹرز',
    hospitalsTab: 'ایمرجنسی ہسپتال',
    pharmaciesTab: 'فارمیسی و ہوم ڈلیوری',
    useMyLocation: 'میری لوکیشن استعمال کریں',
    selectCity: 'شہر منتخب کریں',
    doctorFee: 'فیس',
    open24_7: '24 گھنٹے ایمرجنسی',
    hasDelivery: 'گھر پر ڈلیوری دستیاب',
    verifiedPmdc: 'پی ایم ڈی سی رجسٹرڈ',
    prescriptionQr: 'تصدیق شدہ ڈیجیٹل نسخہ (QR)',
    patientEhr: 'طبی ریکارڈ اور نسخے',
    familyProfiles: 'خاندانی پروفائلز',
  },
};
