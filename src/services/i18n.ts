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
  direction?: 'ltr' | 'rtl';
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
  navDoctorPortal: string;
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
  // Dashboard & Navigation localized strings
  pmdcCertifiedCare: string;
  doctorsOnDuty: string;
  medicalOverview: string;
  searchPlaceholder: string;
  searchButton: string;
  quickShortcuts: string;
  cardiologyTelemetryTitle: string;
  cardiologyTelemetrySubtitle: string;
  normalSinusRhythm: string;
  emergencySosReady: string;
  pmdcClinicalProtocol: string;
  primaryClinicalServices: string;
  primaryServicesSubtitle: string;
  safetyGuidelines: string;
  symptomsCardDesc: string;
  startAssessment: string;
  medicineCardDesc: string;
  verifyMedicine: string;
  reportsCardDesc: string;
  analyzeReport: string;
  nearbyCardDesc: string;
  findCareBtn: string;
  patientHealthVitals: string;
  viewEhr: string;
  heartRate: string;
  bloodPressure: string;
  bloodSugar: string;
  verifiedRx: string;
  active: string;
  notRecorded: string;
  recorded: string;
  noVitalsRecorded: string;
  recordVitals: string;
  consultantOnDuty: string;
  availableNow: string;
  doctorSpecialty: string;
  doctorLicense: string;
  doctorDesc: string;
  bookTeleconsult: string;
  portal: string;
  nationalEmergencyRescue: string;
  freeHelpline24_7: string;
  rescue1122Title: string;
  rescue1122Desc: string;
  shareLiveGps: string;
  gpsCopied: string;
  complianceNote: string;
  readDisclaimers: string;
  pmdcVerifiedDoctors: string;
  privacyHipaa: string;
  languagesSupportedBadge: string;
  aiAssistiveNote: string;
  designedBy: string;
  welcomeGreeting: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: {
    direction: 'ltr',
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
    navDoctorPortal: 'Doctor Review Portal',
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
    pmdcCertifiedCare: 'PMDC Certified Clinical Care',
    doctorsOnDuty: 'Doctors On Duty 24/7',
    medicalOverview: 'App Overview',
    searchPlaceholder: 'Describe symptoms or medicine (e.g., fever, throat pain, Augmentin)...',
    searchButton: 'Analyze',
    quickShortcuts: 'Quick shortcuts:',
    cardiologyTelemetryTitle: 'Cardiology & Vitality Telemetry',
    cardiologyTelemetrySubtitle: 'Real-Time Health Monitoring',
    normalSinusRhythm: 'Normal Sinus Rhythm (72 bpm)',
    emergencySosReady: 'Emergency Rescue 1122 Ready',
    pmdcClinicalProtocol: 'PMDC Clinical Protocols',
    primaryClinicalServices: 'Primary Clinical Services',
    primaryServicesSubtitle: 'AI-assisted, PMDC physician-backed diagnostic & guidance suite',
    safetyGuidelines: 'Safety Guidelines',
    symptomsCardDesc: 'Describe illness in your voice or text. Get triage rating, urgent care guidance, and case file for doctors.',
    startAssessment: 'Start Assessment',
    medicineCardDesc: 'Check syrup and tablet doses by child or adult age. Verify dangerous drug interactions and scan packaging photos.',
    verifyMedicine: 'Verify Medicine',
    reportsCardDesc: 'Upload blood test reports (CBC, HbA1c, LFT) or chest X-rays. Receive simplified normal/abnormal explanations in your language.',
    analyzeReport: 'Analyze Report',
    nearbyCardDesc: 'Connect directly with PMDC licensed physicians, book teleconsultations, and locate 24/7 pharmacies across Pakistan.',
    findCareBtn: 'Find Care',
    patientHealthVitals: 'Patient Health & Vitals',
    viewEhr: 'View EHR →',
    heartRate: 'Heart Rate',
    bloodPressure: 'Blood Pressure',
    bloodSugar: 'Blood Sugar',
    verifiedRx: 'Verified Rx',
    active: 'Active',
    notRecorded: 'Not recorded',
    recorded: 'Recorded',
    noVitalsRecorded: 'You have not recorded blood pressure, pulse, or sugar readings yet.',
    recordVitals: 'Record Vitals',
    consultantOnDuty: 'Consultant On Duty',
    availableNow: 'Available Now',
    doctorSpecialty: 'MBBS, FCPS • General Physician',
    doctorLicense: 'PMDC License #48291-P',
    doctorDesc: 'Available for instant AI case reviews, prescription approvals, and direct video consultations.',
    bookTeleconsult: 'Book Teleconsult',
    portal: 'Portal',
    nationalEmergencyRescue: 'National Emergency Rescue',
    freeHelpline24_7: '24/7 Free Helpline',
    rescue1122Title: 'Rescue 1122 Ambulance Dispatch',
    rescue1122Desc: 'Immediate medical evacuation, road trauma care, and hospital coordination across Pakistan.',
    shareLiveGps: 'Share Live GPS',
    gpsCopied: 'GPS Copied!',
    complianceNote: 'Compliant with Pakistan Medical & Dental Council (PMDC) digital tele-health guidelines.',
    readDisclaimers: 'Read Clinical Disclaimers & Privacy Notice →',
    pmdcVerifiedDoctors: 'PMDC Verified: 2,400+ Doctors',
    privacyHipaa: 'Privacy: HIPAA Encrypted',
    languagesSupportedBadge: 'Languages: English • Urdu (اردو) • Roman Urdu',
    aiAssistiveNote: 'Note: AI is assistive, always verify with a doctor',
    designedBy: 'Design by Yusra Khalique Ahmed',
    welcomeGreeting: 'Welcome',
  },
  roman: {
    direction: 'ltr',
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
    navDoctorPortal: 'Doctor Review Portal',
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
    pmdcCertifiedCare: 'PMDC Tasdeeq Shuda Tibbi Nigrani',
    doctorsOnDuty: 'Doctors 24/7 Duty Par Hain',
    medicalOverview: 'App Overview',
    searchPlaceholder: 'Alamaat ya dawai ka naam likhein (maslan bukhar, khansi, Panadol)...',
    searchButton: 'Janch Karein',
    quickShortcuts: 'Jald check karein:',
    cardiologyTelemetryTitle: 'Dil Ki Sehat Aur Vitals',
    cardiologyTelemetrySubtitle: 'Har Lamha Sehat Ki Nigrani',
    normalSinusRhythm: 'Dil Ki Dharkan Normal (72 bpm)',
    emergencySosReady: 'Emergency Rescue 1122 Tayar',
    pmdcClinicalProtocol: 'PMDC Clinical Rehnumai',
    primaryClinicalServices: 'Markazi Tibbi Sahuliyat',
    primaryServicesSubtitle: 'AI aur PMDC doctors ki nigrani mein mukammal rehnumai',
    safetyGuidelines: 'Hifazati Hidayat',
    symptomsCardDesc: 'Apni awaaz ya likh kar alamaat batayein. Fauri triage darja aur doctor case file hasil karein.',
    startAssessment: 'Assessment Shuru Karein',
    medicineCardDesc: 'Bachon aur badon ki dawai ki sahi miqdar janein. Do dawaon ka aapas mein asar aur photo scan karein.',
    verifyMedicine: 'Dawai Check Karein',
    reportsCardDesc: 'Khoon ke test (CBC, Sugar) ya X-ray upload karein. Apni zaban mein aasan wazahat hasil karein.',
    analyzeReport: 'Report Check Karein',
    nearbyCardDesc: 'PMDC doctors se rabta karein, video mashwara book karein, aur 24/7 medical stores talash karein.',
    findCareBtn: 'Sahulat Talash Karein',
    patientHealthVitals: 'Mareez Ki Sehat Aur Vitals',
    viewEhr: 'EHR Dekhein →',
    heartRate: 'Dil Ki Dharkan',
    bloodPressure: 'Blood Pressure',
    bloodSugar: 'Blood Sugar',
    verifiedRx: 'Tasdeeq Shuda Nuskha',
    active: 'Active',
    notRecorded: 'Darj nahi',
    recorded: 'Darj shuda',
    noVitalsRecorded: 'Aap ne abhi tak blood pressure, pulse ya sugar darj nahi ki.',
    recordVitals: 'Vitals Darj Karein',
    consultantOnDuty: 'Consultant Duty Par',
    availableNow: 'Dastiyab Hain',
    doctorSpecialty: 'MBBS, FCPS • General Physician',
    doctorLicense: 'PMDC License #48291-P',
    doctorDesc: 'Fauri case jaanch, nuskha manzoori aur video mashwaray ke liye hazir hain.',
    bookTeleconsult: 'Mashwara Book Karein',
    portal: 'Portal',
    nationalEmergencyRescue: 'Qoumi Emergency Rescue',
    freeHelpline24_7: '24/7 Muft Helpline',
    rescue1122Title: 'Rescue 1122 Ambulance Madad',
    rescue1122Desc: 'Poore Pakistan mein fori medical evacuation aur emergency hospital madad.',
    shareLiveGps: 'Live GPS Bhejein',
    gpsCopied: 'GPS Copy Ho Gaya!',
    complianceNote: 'Pakistan Medical & Dental Council (PMDC) ki digital health guidelines ke ain mutabiq.',
    readDisclaimers: 'Tibbi Wazahat Aur Privacy Notice Padhein →',
    pmdcVerifiedDoctors: 'PMDC Tasdeeq: 2,400+ Doctors',
    privacyHipaa: 'Privacy: HIPAA Mehfooz Data',
    languagesSupportedBadge: 'Zabanain: English • Urdu (اردو) • Roman Urdu',
    aiAssistiveNote: 'Note: AI madadgar hai, hamesha doctor se tasdeeq karein',
    designedBy: 'Design by Yusra Khalique Ahmed',
    welcomeGreeting: 'Khush Aamdeed',
  },
  ur: {
    direction: 'rtl',
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
    navDoctorPortal: 'ڈاکٹر جائزہ پورٹل',
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
    pmdcCertifiedCare: 'پی ایم ڈی سی تصدیق شدہ طبی نگہداشت',
    doctorsOnDuty: 'ڈاکٹرز 24/7 ڈیوٹی پر موجود',
    medicalOverview: 'ایپ کا تعارف',
    searchPlaceholder: 'علامات یا دوا کا نام درج کریں (مثلاً بخار، کھانسی، پیناڈول)...',
    searchButton: 'جانچ کریں',
    quickShortcuts: 'فوری جانچ:',
    cardiologyTelemetryTitle: 'امراضِ قلب اور وائٹلز ٹیلی میٹری',
    cardiologyTelemetrySubtitle: 'حقیقی وقت میں صحت کی نگرانی',
    normalSinusRhythm: 'دل کی باقاعدہ دھڑکن (72 bpm)',
    emergencySosReady: 'ایمرجنسی ریسکیو 1122 الرٹ',
    pmdcClinicalProtocol: 'پی ایم ڈی سی طبی پروٹوکولز',
    primaryClinicalServices: 'بنیادی طبی سہولیات',
    primaryServicesSubtitle: 'اے آئی اور پی ایم ڈی سی ڈاکٹرز کی تصدیق شدہ تشخیصی رہنمائی',
    safetyGuidelines: 'حفاظتی رہنما اصول',
    symptomsCardDesc: 'اپنی علامات بولیں یا لکھیں۔ فوری تشخیص، ہنگامی رہنمائی اور ڈاکٹر کے لیے رپورٹ حاصل کریں۔',
    startAssessment: 'معائنہ شروع کریں',
    medicineCardDesc: 'بچوں اور بڑوں کی دوا کی درست مقدار جانچیں۔ دو دواؤں کا باہمی اثر اور پیکنگ کی تصویر چیک کریں۔',
    verifyMedicine: 'دوا کی تصدیق کریں',
    reportsCardDesc: 'خون کے ٹیسٹ (سی بی سی، شوگر) یا ایکسرے اپلوڈ کریں۔ اپنی زبان میں آسان رپورٹ حاصل کریں۔',
    analyzeReport: 'رپورٹ کا جائزہ لیں',
    nearbyCardDesc: 'مستند پی ایم ڈی سی ڈاکٹرز سے رابطہ کریں، مشورہ بک کریں اور 24 گھنٹے کھلی فارمیسی تلاش کریں۔',
    findCareBtn: 'سہولت تلاش کریں',
    patientHealthVitals: 'مریض کی صحت اور وائٹلز',
    viewEhr: 'طبی ریکارڈ دیکھیں →',
    heartRate: 'دل کی دھڑکن',
    bloodPressure: 'بلڈ پریشر',
    bloodSugar: 'بلڈ شوگر',
    verifiedRx: 'تصدیق شدہ نسخہ',
    active: 'ایکٹو',
    notRecorded: 'درج نہیں',
    recorded: 'درج شدہ',
    noVitalsRecorded: 'آپ نے ابھی تک بلڈ پریشر، نبض یا شوگر درج نہیں کی ہے۔',
    recordVitals: 'وائٹلز درج کریں',
    consultantOnDuty: 'کنسلٹنٹ ڈاکٹر ڈیوٹی پر',
    availableNow: 'ابھی دستیاب ہیں',
    doctorSpecialty: 'ایم بی بی ایس، ایف سی پی ایس • جنرل فزیشن',
    doctorLicense: 'پی ایم ڈی سی لائسنس #48291-P',
    doctorDesc: 'فوری کیس جائزہ، نسخے کی منظوری اور براہ راست ویڈیو مشاورت کے لیے حاضر ہیں۔',
    bookTeleconsult: 'مشورہ بک کریں',
    portal: 'پورٹل',
    nationalEmergencyRescue: 'قومی ہنگامی ریسکیو سروس',
    freeHelpline24_7: '24 گھنٹے مفت ہیلپ لائن',
    rescue1122Title: 'ریسکیو 1122 ایمبولینس سروس',
    rescue1122Desc: 'پورے پاکستان میں فوری طبی منتقلی، حادثاتی نگہداشت اور ہسپتال رابطہ۔',
    shareLiveGps: 'لائیو لوکیشن بھیجیں',
    gpsCopied: 'لوکیشن کاپی ہو گئی!',
    complianceNote: 'پاکستان میڈیکل اینڈ ڈینٹل کونسل (پی ایم ڈی سی) کے ٹیلی ہیلتھ ضوابط کے عین مطابق۔',
    readDisclaimers: 'طبی رہنمائی اور رازداری کی شرائط پڑھیں →',
    pmdcVerifiedDoctors: 'پی ایم ڈی سی تصدیق شدہ: 2,400+ ڈاکٹرز',
    privacyHipaa: 'رازداری: ہپّا محفوظ ڈیٹا',
    languagesSupportedBadge: 'زبانیں: انگلش • اردو • رومن اردو',
    aiAssistiveNote: 'تنبیہ: اے آئی مددگار ہے، حتمی تشخیص ہمیشہ مستند ڈاکٹر سے تصدیق کروائیں',
    designedBy: 'ڈیزائن: یسریٰ خلیق احمد',
    welcomeGreeting: 'خوش آمدید',
  },
};
