import { SupportedLanguage, LanguageInfo } from '../types';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  flag: string;
  greeting: string;
}

export const LANGUAGES: Record<SupportedLanguage, LanguageInfo> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    bcp47: 'en-US',
    isRtl: false,
    greeting: 'Hello, I am SehatSaathi Pro. How can I help you today?',
  },
  ur: {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    bcp47: 'ur-PK',
    isRtl: false,
    greeting: 'السلام علیکم! میں صحت ساتھی ہوں۔ آج میں آپ کی کیا طبی مدد کر سکتا ہوں؟',
  },
  roman: {
    code: 'roman',
    name: 'Roman Urdu',
    nativeName: 'Roman Urdu',
    bcp47: 'ur-PK',
    isRtl: false,
    greeting: 'Assalam-o-Alaikum! Main SehatSaathi hoon. Aaj main aap ki kya madad kar sakta hoon?',
  },
};

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    flag: '🇬🇧',
    greeting: 'Hello, I am SehatSaathi Pro. How can I help you today?',
  },
  {
    code: 'ur',
    label: 'Urdu',
    nativeLabel: 'اردو',
    flag: '🇵🇰',
    greeting: 'السلام علیکم! میں صحت ساتھی ہوں۔ آج میں آپ کی کیا طبی مدد کر سکتا ہوں؟',
  },
  {
    code: 'roman',
    label: 'Roman Urdu',
    nativeLabel: 'Roman Urdu',
    flag: '🇵🇰',
    greeting: 'Assalam-o-Alaikum! Main SehatSaathi hoon. Aaj aap ki kya madad kar sakta hoon?',
  },
];

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
  navVitals: string;
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
  // Vitals & Doctor Onboarding extensions
  checkMyVitals: string;
  vitalsTrackerDesc: string;
  vitalsHistory: string;
  joinAsDoctor: string;
  registerDoctorBtn: string;
  doctorOnboardingTitle: string;
  doctorOnboardingSubtitle: string;
  doctorDemoNoticeBanner: string;
  demoDoctorBadge: string;
  pmdcVerifiedBadge: string;
  aiOnlyResultNotice: string;
  sugarFasting: string;
  sugarRandom: string;
  sugarPostMeal: string;
  sugarHba1c: string;
  systolicBp: string;
  diastolicBp: string;
  pulseRate: string;
  detectPulseCamera: string;
  speakVitals: string;
  vitalsNormalFeedback: string;
  vitalsBorderlineFeedback: string;
  vitalsCriticalFeedback: string;
  sendVitalsToDoctor: string;
  adminPortalTitle: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: {
    direction: 'ltr',
    appName: 'SehatSaathi Pro',
    appSubtitle: 'Your Digital Healthcare Companion',
    tagline: 'AI TRIAGE + LICENSED CLINICAL PROTOCOLS • AVAILABLE 24/7',
    disclaimerBanner: 'Preliminary medical guidance. Always consult a licensed PMDC doctor before taking medication.',
    disclaimerTitle: 'Medical Safety & Clinical Notice',
    disclaimerText: 'This app provides assistive medical triage and health information, but is never a substitute for an in-person clinical evaluation by a licensed doctor. In case of chest pain, severe bleeding, breathing distress, or acute emergencies, call Rescue 1122 or proceed to the nearest trauma hospital immediately.',
    disclaimerAgree: 'I Understand & Agree, Continue',
    navHome: 'Home',
    navSymptoms: 'Symptom Triage',
    navMedicine: 'Medicine Safety',
    navReports: 'Report & X-Ray',
    navNearby: 'Find Care',
    navEmergency: 'Emergency 1122',
    navRecords: 'My Records',
    navVitals: 'Vitals Tracker',
    navDoctorMode: 'Doctor Mode',
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
    doctorReviewTag: 'Preliminary AI Triage — Pending Verified Doctor Sign-off',
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
    // New additions
    checkMyVitals: 'Check My Vitals',
    vitalsTrackerDesc: 'Track your Blood Sugar, Blood Pressure, and Heart Rate with clinical interpretation and doctor-supervised review.',
    vitalsHistory: 'Vitals History & Trends',
    joinAsDoctor: 'Join as a Doctor',
    registerDoctorBtn: 'Register as a Doctor',
    doctorOnboardingTitle: 'Doctor Registration & PMDC Verification',
    doctorOnboardingSubtitle: 'Join our certified medical panel with your official PMDC license and qualifications',
    doctorDemoNoticeBanner: 'Notice: This platform is currently onboarding doctors. The doctor profiles shown below are placeholder demo examples and do not represent real, verified, licensed doctors yet. Please do not rely on them for actual medical consultation until they display a "PMDC Verified" badge.',
    demoDoctorBadge: 'Demo Profile — Not a Real Doctor',
    pmdcVerifiedBadge: '✅ PMDC Verified',
    aiOnlyResultNotice: 'This result is AI-generated only and has not yet been reviewed by a licensed doctor.',
    sugarFasting: 'Fasting (8-12 hrs no food)',
    sugarRandom: 'Random (Any time of day)',
    sugarPostMeal: 'Post-Meal (2 hrs after eating)',
    sugarHba1c: 'HbA1c (3-Month Average %)',
    systolicBp: 'Systolic (Top number, mmHg)',
    diastolicBp: 'Diastolic (Bottom number, mmHg)',
    pulseRate: 'Heart Rate / Pulse (BPM)',
    detectPulseCamera: 'Check Pulse with Camera',
    speakVitals: 'Speak your vitals',
    vitalsNormalFeedback: 'Great news! Your vitals are within normal, healthy ranges. Keep maintaining balanced hydration, nutritious diet, and regular activity.',
    vitalsBorderlineFeedback: 'Your reading is outside the standard optimal range. Adjust dietary intake, rest, and re-check in 2 hours. If guidance is needed, you can send this summary to our doctor queue.',
    vitalsCriticalFeedback: 'Urgent Clinical Alert: This reading indicates a potential hypertensive or metabolic crisis. Please proceed to the nearest emergency trauma center or call 1122 right away.',
    sendVitalsToDoctor: 'Send Vitals Summary to Doctor Review Queue',
    adminPortalTitle: 'Admin & Doctor Verification Portal',
  },
  roman: {
    direction: 'ltr',
    appName: 'SehatSaathi Pro',
    appSubtitle: 'Aap Ka Digital Health Saathi',
    tagline: 'AI TRIAGE + PMDC DOCTOR PROTOCOLS • 24/7 DASTIYAB',
    disclaimerBanner: 'Ibtidai tibbi rehnumai. Koi bhi dawa shuru karne se pehle licensed PMDC doctor se mashwara zaroori hai.',
    disclaimerTitle: 'Tibbi Hifazat Ka Zaroori Notice',
    disclaimerText: 'Yeh app aapki madad aur rehnumai ke liye hai, lekin yeh kisi licensed doctor ke muainay ka mutabadil nahi hai. Seenay mein dard, shadeed saans ki takleef ya emergency ki soorat mein foran Rescue 1122 par call karein ya qareebi hospital tashreef le jayein.',
    disclaimerAgree: 'Main Samajh Gaya / Gayi, Aagay Barhein',
    navHome: 'Home',
    navSymptoms: 'Alamaat Checker',
    navMedicine: 'Dawaiyon ki Hifazat',
    navReports: 'Lab Reports & X-Ray',
    navNearby: 'Doctors & Hospitals',
    navEmergency: 'Emergency 1122',
    navRecords: 'Tibbi Records',
    navVitals: 'Vitals Tracker',
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
    doctorReviewTag: 'Ibtidai AI Triage — Doctor Approval Pending',
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
    // New additions
    checkMyVitals: 'Apnay Vitals Check Karein',
    vitalsTrackerDesc: 'Apna Blood Sugar, Blood Pressure aur Pulse Rate track karein aur fori medical review hasil karein.',
    vitalsHistory: 'Vitals Ka Record Aur Trend',
    joinAsDoctor: 'Bataur Doctor Shamil Hon',
    registerDoctorBtn: 'Doctor Registration Karein',
    doctorOnboardingTitle: 'Doctor Registration & PMDC Verification',
    doctorOnboardingSubtitle: 'Apni PMDC registration aur asnaad ke sath hamaray medical board mein shamil hon',
    doctorDemoNoticeBanner: 'Zaroori Notice: Yeh platform abhi licensed doctors ki onboarding ke marhalay mein hai. Neechay dikhaye gaye doctor profiles sirf demo/namoona hain aur abhi asli verified doctors nahi hain. Baraye meherbani inhein tibbi mashwaray ke liye use na karein jab tak un par "PMDC Verified" badge na ho.',
    demoDoctorBadge: 'Demo Profile — Asli Doctor Nahi',
    pmdcVerifiedBadge: '✅ PMDC Verified',
    aiOnlyResultNotice: 'Yeh result sirf AI-generated hai aur abhi kisi licensed doctor ne is ko check nahi kiya.',
    sugarFasting: 'Fasting (Nahar munh, 8-12 ghantay)',
    sugarRandom: 'Random (Din mein kisi bhi waqt)',
    sugarPostMeal: 'Khanay ke 2 ghantay baad',
    sugarHba1c: 'HbA1c (3 maah ka average %)',
    systolicBp: 'Systolic (Ooper wala number, mmHg)',
    diastolicBp: 'Diastolic (Neechay wala number, mmHg)',
    pulseRate: 'Dil Ki Dharkan / Pulse (BPM)',
    detectPulseCamera: 'Camera se Pulse Check Karein',
    speakVitals: 'Bol kar vitals batayein',
    vitalsNormalFeedback: 'Bohat achhi baat hai! Aap ke vitals normal range mein hain. Paani ki miqdar, sehat-bakhsh ghiza aur rozana walk jari rakhein.',
    vitalsBorderlineFeedback: 'Aap ki reading mamooli si kam ya zyada hai. Namak aur meethay mein parhez karein aur 2 ghantay baad dobara check karein. Doctor ki raye ke liye case summary bhej saktay hain.',
    vitalsCriticalFeedback: 'Khatray Ki Ghanti: Yeh reading intehai ghair mamooli hai. Baraye meherbani foran qareebi hospital emergency tashreef le jayein ya 1122 par call karein.',
    sendVitalsToDoctor: 'Vitals Doctor Review Queue Mein Bhejein',
    adminPortalTitle: 'Admin Aur Doctor Verification Portal',
  },
  ur: {
    direction: 'ltr',
    appName: 'صحت ساتھی پرو',
    appSubtitle: 'آپ کا بااعتماد ڈیجیٹل ہیلتھ ساتھی',
    tagline: 'اے آئی طبی رہنمائی + پی ایم ڈی سی تصدیق شدہ طریقہ کار • 24/7 دستیاب',
    disclaimerBanner: 'ابتدائی طبی رہنمائی۔ کوئی بھی دوا شروع کرنے سے پہلے ہمیشہ مستند ڈاکٹر سے مشورہ فرمائیں۔',
    disclaimerTitle: 'طبی رہنمائی اور حفاظتی ہدایات',
    disclaimerText: 'یہ ایپلیکیشن عام معلومات اور ابتدائی طبی رہنمائی کی غرض سے بنائی گئی ہے، یہ کسی لائسنس یافتہ ڈاکٹر کے معائنے کا متبادل نہیں ہے۔ سینے میں درد، سانس میں شدید گھٹن، بے ہوشی یا کسی بھی ایمرجنسی کی صورت میں فوری طور پر ریسکیو 1122 پر کال کریں یا قریبی ہسپتال تشریف لے جائیں۔',
    disclaimerAgree: 'میں سمجھ گیا / سمجھ گئی ہوں، آگے بڑھیں',
    navHome: 'مرکزی صفحہ',
    navSymptoms: 'علامات کی جانچ',
    navMedicine: 'ادویات کی رہنمائی',
    navReports: 'رپورٹ اور ایکسرے',
    navNearby: 'ڈاکٹر و ہسپتال',
    navEmergency: 'ایمرجنسی 1122',
    navRecords: 'طبی ریکارڈز',
    navVitals: 'وائٹلز ٹریکر',
    navDoctorMode: 'ڈاکٹر موڈ',
    navDoctorPortal: 'ڈاکٹر و ایڈمن پورٹل',
    login: 'لاگ ان کریں',
    signup: 'نیا اکاؤنٹ بنائیں',
    logout: 'لاگ آؤٹ کریں',
    welcomeUser: 'خوش آمدید',
    call1122: 'کال 1122',
    emergencyAlert: 'فوری ہنگامی طبی امداد',
    whoIsThisFor: 'یہ طبی مشورہ کس کے لیے درکار ہے؟',
    forSelf: 'میرے اپنے لیے (بالغ)',
    forChild: 'بچے کے لیے (2 سے 12 سال)',
    forElderly: 'بزرگ کے لیے (60 سال یا زائد)',
    forTeen: 'نوجوان کے لیے (13 سے 18 سال)',
    forInfant: 'شیر خوار بچے کے لیے (0 سے 2 سال)',
    typeOrSpeak: 'اپنی علامات بول کر بتائیں یا یہاں تحریر فرمائیں...',
    voiceInput: 'بولنے کے لیے بٹن دبائیں',
    listening: 'سن رہا ہوں... فرمائیے',
    stopVoice: 'آواز روکیں',
    audioPlay: 'آواز سنیں',
    audioPause: 'آواز روکیں',
    audioResume: 'دوبارہ سنیں',
    audioStop: 'آواز بند کریں',
    audioSpeed: 'رفتار',
    checkMedicine: 'دوا کی معلومات اور حفاظت جانچیں',
    reverseLookup: 'بیماری کی مناسبت سے دوا کی معلومات',
    photoMedicine: 'دوا کے پتے یا شیشی کی تصویر اسکین کریں',
    uploadReport: 'لیب رپورٹ یا ایکسرے اپلوڈ کریں',
    takePhoto: 'تصویر کھینچیں',
    uploadGallery: 'گیلری سے منتخب کریں',
    recordVideo: 'ویڈیو کی مدد سے اسکین کریں',
    doctorReviewTag: 'ابتدائی اے آئی جائزہ — ڈاکٹر کی توثیق کا منتظر',
    greenUrgency: 'معمولی نوعیت / گھریلو احتیاط کافی ہے',
    yellowUrgency: 'ڈاکٹر سے جلد معائنہ کروائیں',
    redUrgency: 'فوری ہسپتال ایمرجنسی درکار ہے',
    sendToDoctor: 'یہ کیس ڈاکٹر کے پاس بھیجیں',
    findCareTitle: 'قریبی مستند ڈاکٹرز، ہسپتال اور فارمیسیز',
    doctorsTab: 'ماہر ڈاکٹرز',
    hospitalsTab: 'ایمرجنسی ہسپتال',
    pharmaciesTab: 'فارمیسی و ہوم ڈلیوری',
    useMyLocation: 'میری موجودہ لوکیشن استعمال کریں',
    selectCity: 'اپنا شہر منتخب فرمائیں',
    doctorFee: 'مشاورتی فیس',
    open24_7: '24 گھنٹے ایمرجنسی کھلی ہے',
    hasDelivery: 'گھر پر ادویات کی ڈلیوری دستیاب ہے',
    verifiedPmdc: 'پی ایم ڈی سی سے منظور شدہ',
    prescriptionQr: 'تصدیق شدہ ڈیجیٹل نسخہ (QR)',
    patientEhr: 'طبی ریکارڈز اور محفوظ نسخے',
    familyProfiles: 'خاندانی اراکین کے پروفائلز',
    pmdcCertifiedCare: 'پی ایم ڈی سی کے معیارات کے مطابق طبی نگہداشت',
    doctorsOnDuty: 'ڈاکٹرز 24 گھنٹے ڈیوٹی پر موجود',
    medicalOverview: 'ایپلیکیشن کا تعارف',
    searchPlaceholder: 'اپنی علامات یا دوا کا نام درج فرمائیں (مثلاً بخار، کھانسی، پیناڈول)...',
    searchButton: 'تجزیہ کریں',
    quickShortcuts: 'فوری رسائی:',
    cardiologyTelemetryTitle: 'امراضِ قلب اور وائٹلز کی نگرانی',
    cardiologyTelemetrySubtitle: 'حقیقی وقت میں نبض اور بلڈ پریشر کا معائنہ',
    normalSinusRhythm: 'دل کی باقاعدہ دھڑکن (72 bpm)',
    emergencySosReady: 'ایمرجنسی ریسکیو 1122 تیار ہے',
    pmdcClinicalProtocol: 'پی ایم ڈی سی کلینیکل پروٹوکولز',
    primaryClinicalServices: 'بنیادی طبی خدمات',
    primaryServicesSubtitle: 'اے آئی تجزیہ اور پی ایم ڈی سی ڈاکٹرز کی رہنمائی کے ساتھ',
    safetyGuidelines: 'حفاظتی رہنما اصول',
    symptomsCardDesc: 'اپنی بیماری بول کر بتائیں یا لکھیں۔ فوری ابتدائی درجہ بندی، ایمرجنسی الرٹ اور ڈاکٹر کے لیے فائل تیار کریں۔',
    startAssessment: 'معائنہ شروع فرمائیں',
    medicineCardDesc: 'بچوں اور بڑوں کی دوا کی درست خوراک جانچیں۔ دو مختلف دواؤں کے مضر باہمی اثرات اور پیکیجنگ کی تصدیق کریں۔',
    verifyMedicine: 'دوا کی جانچ کریں',
    reportsCardDesc: 'خون کے ٹیسٹ (سی بی سی، شوگر، ایل ایف ٹی) یا ایکسرے اپلوڈ کریں۔ آسان اردو میں جامع وضاحت حاصل کریں۔',
    analyzeReport: 'رپورٹ کا معائنہ کریں',
    nearbyCardDesc: 'پاکستان بھر کے تصدیق شدہ ڈاکٹرز تلاش کریں، ویڈیو مشورہ بک کریں اور 24 گھنٹے کھلی فارمیسیز دیکھیں۔',
    findCareBtn: 'طبی سہولت تلاش کریں',
    patientHealthVitals: 'مریض کی صحت اور اہم وائٹلز',
    viewEhr: 'طبی ریکارڈ ملاحظہ فرمائیں →',
    heartRate: 'دل کی دھڑکن / نبض',
    bloodPressure: 'بلڈ پریشر',
    bloodSugar: 'بلڈ شوگر',
    verifiedRx: 'تصدیق شدہ نسخہ',
    active: 'ایکٹو',
    notRecorded: 'درج نہیں ہوا',
    recorded: 'ریکارڈ شدہ',
    noVitalsRecorded: 'آپ نے ابھی تک اپنا بلڈ پریشر، نبض یا بلڈ شوگر درج نہیں کی ہے۔',
    recordVitals: 'وائٹلز درج فرمائیں',
    consultantOnDuty: 'کنسلٹنٹ ڈاکٹر حاضر ہیں',
    availableNow: 'ابھی دستیاب ہیں',
    doctorSpecialty: 'ایم بی بی ایس، ایف سی پی ایس • جنرل فزیشن',
    doctorLicense: 'پی ایم ڈی سی لائسنس #48291-P',
    doctorDesc: 'فوری کیس کے جائزے، نسخے کی باقاعدہ منظوری اور ویڈیو مشاورت کے لیے آن لائن موجود ہیں۔',
    bookTeleconsult: 'طبی مشورہ بک کریں',
    portal: 'پورٹل',
    nationalEmergencyRescue: 'قومی ہنگامی ریسکیو سروس',
    freeHelpline24_7: '24 گھنٹے مفت ہیلپ لائن',
    rescue1122Title: 'ریسکیو 1122 ایمبولینس سروس',
    rescue1122Desc: 'پاکستان بھر میں فوری طبی منتقلی، حادثاتی نگہداشت اور ہسپتال رابطہ کی سہولت۔',
    shareLiveGps: 'لائیو لوکیشن بھیجیں',
    gpsCopied: 'لوکیشن کاپی ہو چکی ہے!',
    complianceNote: 'پاکستان میڈیکل اینڈ ڈینٹل کونسل (پی ایم ڈی سی) کے ٹیلی ہیلتھ ضوابط کے عین مطابق۔',
    readDisclaimers: 'طبی انتباہ اور رازداری کی شرائط پڑھیں →',
    pmdcVerifiedDoctors: 'پی ایم ڈی سی رجسٹرڈ ڈاکٹرز پینل',
    privacyHipaa: 'طبی رازداری: مکمل محفوظ ڈیٹا',
    languagesSupportedBadge: 'زبانیں: اردو • انگلش • رومن اردو',
    aiAssistiveNote: 'تنبیہ: یہ اے آئی مشورہ محض ابتدائی مدد کے لیے ہے، حتمی تشخیص ہمیشہ مستند ڈاکٹر سے تصدیق کروائیں۔',
    designedBy: 'طراحی اور پیشکش: یسریٰ خلیق احمد',
    welcomeGreeting: 'خوش آمدید',
    // New additions for Vitals, Onboarding & Transparency
    checkMyVitals: 'وائٹلز چیک کریں',
    vitalsTrackerDesc: 'گھر بیٹھے اپنا بلڈ شوگر، بلڈ پریشر اور نبض ریکارڈ کریں اور فوری طبی رہنمائی حاصل کریں۔',
    vitalsHistory: 'وائٹلز کا تاریخچہ اور رجحان',
    joinAsDoctor: 'بطور ڈاکٹر رجسٹریشن کروائیں',
    registerDoctorBtn: 'ڈاکٹر کے طور پر شامل ہوں',
    doctorOnboardingTitle: 'ڈاکٹر رجسٹریشن اور پی ایم ڈی سی توثیق',
    doctorOnboardingSubtitle: 'اپنے سرکاری پی ایم ڈی سی لائسنس اور اسناد کے ساتھ ہمارے تصدیق شدہ پینل کا حصہ بنیں',
    doctorDemoNoticeBanner: 'اہم آگاہی: یہ پلیٹ فارم فی الوقت مستند ڈاکٹروں کے باقاعدہ اندراج (آن بورڈنگ) کے مرحلے میں ہے۔ نیچے نظر آنے والے ڈاکٹروں کے پروفائلز صرف ڈیمو / نمونہ ہیں اور ابھی اصلی تصدیق شدہ ڈاکٹروں کی نمائندگی نہیں کرتے۔ جب تک کسی پروفائل پر تصدیق شدہ بیج (PMDC Verified) ظاہر نہ ہو، برائے مہربانی اسے حتمی طبی مشورے کے لیے استعمال نہ فرمائیں۔',
    demoDoctorBadge: 'ڈیمو پروفائل — عارضی نمونہ',
    pmdcVerifiedBadge: '✅ پی ایم ڈی سی تصدیق شدہ',
    aiOnlyResultNotice: 'یہ نتیجہ صرف اے آئی کی تیار کردہ ابتدائی رہنمائی ہے اور ابھی تک کسی مستند ڈاکٹر نے اس کی توثیق نہیں کی ہے۔',
    sugarFasting: 'نہار منہ (فاسٹنگ، 8 تا 12 گھنٹے بھوکے)',
    sugarRandom: 'عام وقت (رینڈم، دن میں کسی بھی وقت)',
    sugarPostMeal: 'کھانے کے 2 گھنٹے بعد',
    sugarHba1c: 'تین ماہ کا اوسط تناسب (HbA1c %)',
    systolicBp: 'سسٹولک (اوپر والا، mmHg)',
    diastolicBp: 'ڈائیسٹولک (نیچے والا، mmHg)',
    pulseRate: 'نبض / دل کی دھڑکن (BPM)',
    detectPulseCamera: 'کیمرے کے سینسر سے نبض چیک کریں',
    speakVitals: 'بول کر وائٹلز بتائیں',
    vitalsNormalFeedback: 'ماشاءاللہ! آپ کے وائٹلز بالکل نارمل اور صحت مند حدود میں ہیں۔ متوازن غذا، مناسب پانی کا استعمال اور روزانہ واک جاری رکھیں۔',
    vitalsBorderlineFeedback: 'آپ کی ریڈنگ نارمل حدود سے قدرے مختلف ہے۔ نمک اور میٹھے میں احتیاط برتیں اور 2 گھنٹے بعد دوبارہ چیک کریں۔ اگر ضرورت ہو تو یہ کیس ڈاکٹر کے جائزے کے لیے بھیجیں۔',
    vitalsCriticalFeedback: 'فوری توجہ فرمائیں! یہ ریڈنگ خطرناک حد تک غیر معمولی ہے۔ برائے مہربانی تاخیر کیے بغیر قریبی ہسپتال ایمرجنسی تشریف لے جائیں یا 1122 پر کال کریں۔',
    sendVitalsToDoctor: 'وائٹلز کا خلاصہ ڈاکٹر کے معائنے کے لیے بھیجیں',
    adminPortalTitle: 'ایڈمن اور ڈاکٹر توثیقی ڈیش بورڈ',
  },
};
