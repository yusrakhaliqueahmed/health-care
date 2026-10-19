// Smart Input Validation Service for SehatSaathi Pro
// Catches invalid text/voice entries, gibberish, numbers, emails, and misspellings with smart suggestions.

import { SupportedLanguage } from '../types';

export type InputValidationScope = 'medicine' | 'symptom' | 'condition' | 'symptom_followup' | 'general';

export interface InputValidationResult {
  isValid: boolean;
  errorType?: 'number_only' | 'email' | 'url' | 'gibberish' | 'unrecognized_medicine' | 'unrecognized_symptom' | 'empty' | 'too_short';
  alertMessage: {
    en: string;
    ur: string;
    roman: string;
  };
  spokenAlert: {
    en: string;
    ur: string;
    roman: string;
  };
  suggestion?: string;
  matchedName?: string;
}

// 1. Comprehensive Database of Known Medicines (Pakistan DRAP & Global Brands + Generics)
export const KNOWN_MEDICINES: string[] = [
  // Common Analgesics & Antipyretics
  'Panadol', 'Paracetamol', 'Calpol', 'Febrol', 'Disprol', 'Tylenol', 'Panadol Extra', 'Panadol CF', 'Panadol Syrup',
  'Disprin', 'Aspirin', 'Loprin', 'Ascard', 'Ecosprin',
  'Brufen', 'Ibuprofen', 'Arinac', 'Profen', 'Brufen Plus', 'Arinac Forte',
  'Ponstan', 'Mefenamic Acid', 'Voltral', 'Diclofenac', 'Diclofenac Sodium', 'Diclofenac Potassium',
  'Feldene', 'Piroxicam', 'Brexin', 'Celebrex', 'Celecoxib', 'Nuberol Forte', 'Caflam', 'Synflex', 'Naproxen',
  'Toradol', 'Ketorolac', 'Tramal', 'Tramadol',

  // Antibiotics & Anti-Infectives
  'Augmentin', 'Amoxicillin', 'Amoxil', 'Co-Amoxiclav', 'Curam', 'Klavox',
  'Flagyl', 'Metronidazole', 'Entamizole', 'Diloxanide',
  'Azomax', 'Azithromycin', 'Zithromax', 'Azeem',
  'Ciprobay', 'Ciprofloxacin', 'Novidat', 'Ciproxin', 'Bactoril',
  'Cravit', 'Levofloxacin', 'Leflox', 'Tavanic',
  'Cefixime', 'Cefspan', 'Caricef', 'Maxpan', 'Cef-4',
  'Velosef', 'Cephradine', 'Cefrine', 'Rocephin', 'Ceftriaxone', 'Claforan', 'Cefotaxime',
  'Klaricid', 'Clarithromycin', 'Klacid',
  'Amikacin', 'Gentamicin', 'Septran', 'Co-Trimoxazole', 'Doxycycline', 'Vibramycin',

  // Gastrointestinal & Antacids
  'Risek', 'Omeprazole', 'Losec', 'Omega',
  'Nexum', 'Esomeprazole', 'Nexium', 'Esita',
  'Gaviscon', 'Rennie', 'Digene', 'Simeco', 'Mucaine',
  'Zantac', 'Ranitidine', 'Famotidine',
  'Duspatalin', 'Mebeverine', 'Colofac',
  'Spasler', 'No-Spa', 'Drotaverine', 'Buscopan', 'Hyoscine',
  'Motilium', 'Domperidone', 'Maxolon', 'Metoclopramide', 'Onset', 'Ondansetron', 'Zofran', 'Gravinate', 'Dimenhydrinate',
  'Flagyl', 'Lomotil', 'Imodium', 'Loperamide', 'ORS', 'Nimkol', 'Pedialyte',
  'Duphalac', 'Lactulose', 'Cremaffin', 'Softlax',

  // Respiratory & Allergy
  'Ventolin', 'Salbutamol', 'Ventolin Inhaler', 'Aerolin', 'Asthalin',
  'Seretide', 'Symbicort', 'Clenil', 'Beclomethasone', 'Budesonide', 'Atrovent', 'Ipratropium',
  'Zyrtec', 'Cetirizine', 'Rigix', 'Fexet', 'Fexofenadine', 'Allegra',
  'Kestine', 'Ebastine', 'Softin', 'Loratadine', 'Claritin',
  'Hydryllin', 'Hydryllin DM', 'Sancos', 'Pulmonol', 'Acefyl', 'Corex', 'Sedatuss', 'T-Day',

  // Cardiovascular & Hypertension
  'Sofvasc', 'Amlodipine', 'Norvasc', 'Tenormin', 'Atenolol', 'Concor', 'Bisoprolol',
  'Capoten', 'Captopril', 'Zestril', 'Lisinopril', 'Diovan', 'Valsartan', 'Exforge', 'Co-Diovan',
  'Cardnit', 'Angisid', 'Nitroglycerin', 'Isordil', 'Plavix', 'Clopidogrel', 'Lowplat',
  'Lipitor', 'Atorvastatin', 'Crestor', 'Rosuvastatin',
  'Lasix', 'Furosemide', 'Aldactone', 'Spironolactone',

  // Diabetes & Endocrine
  'Glucophage', 'Metformin', 'Neodipar',
  'Getryl', 'Glimepiride', 'Amaryl',
  'Januvia', 'Sitagliptin', 'Galvus', 'Vildagliptin', 'Jardiance', 'Empagliflozin',
  'Insulin', 'Novorapid', 'Humulin', 'Lantus', 'Mixtard',
  'Thyroxine', 'Eltroxin',

  // Vitamins, Minerals & Supplements
  'Surbex Z', 'CaC 1000', 'Neurobion', 'Mecobalamin', 'Neuromet', 'Methycobal',
  'Vitamin C', 'Vitamin D', 'Sunny D', 'Indrop D', 'Evion', 'Vitamin E', 'Sangobion', 'Iberet', 'Folic Acid',

  // Topical & Dermatological
  'Polyfax', 'Polyfax Eye Ointment', 'Betnovate', 'Betnovate N', 'Dermovate', 'Hydrocortisone',
  'Fucidin', 'Fucicort', 'Canesten', 'Clotrimazole', 'Travocort',

  // CNS & Neuro-psychiatric
  'Xanax', 'Alprazolam', 'Lexotan', 'Bromazepam', 'Valium', 'Diazepam', 'Rivotril', 'Clonazepam',
  'Tegral', 'Carbamazepine', 'Epival', 'Sodium Valproate', 'Keppra', 'Levetiracetam',

  // Common Pakistani Medicines with Standard Strengths / Formulations
  'Panadol 500', 'Panadol 500mg', 'Panadol Extra 500mg', 'Panadol Syrup',
  'Brufen 400', 'Brufen 400mg', 'Brufen 200', 'Brufen 200mg', 'Brufen 600',
  'Augmentin 625', 'Augmentin 625mg', 'Augmentin 1g', 'Augmentin 375', 'Augmentin 375mg',
  'Disprin 300', 'Disprin 300mg', 'Disprin CV',
  'Flagyl 400', 'Flagyl 400mg', 'Flagyl 200', 'Flagyl Syrup',
  'Risek 20', 'Risek 20mg', 'Risek 40', 'Risek 40mg', 'Risek Insta',
  'Nexum 20', 'Nexum 20mg', 'Nexum 40', 'Nexum 40mg',
  'Amoxil 250', 'Amoxil 500', 'Amoxil 500mg',
  'Ciproxin 500', 'Ciproxin 500mg', 'Ciprobay 500',
  'Leflox 250', 'Leflox 500', 'Leflox 500mg',
  'Azomax 250', 'Azomax 500', 'Azomax 500mg',
  'Sofvasc 5', 'Sofvasc 5mg', 'Sofvasc 10', 'Sofvasc 10mg',
  'Concor 2.5', 'Concor 2.5mg', 'Concor 5', 'Concor 5mg',
  'Glucophage 500', 'Glucophage 500mg', 'Glucophage 850', 'Glucophage 1000',
  'Getryl 1mg', 'Getryl 2mg', 'Getryl 3mg', 'Getryl 4mg',

  // Authentic Urdu Script Medicine Names (پاکستان میں عام استعمال ہونے والی ادویات)
  'پیناڈول', 'پیراسیٹامول', 'کیلپول', 'فیبرول', 'ڈسپرول', 'ڈسپرین', 'ایسپرین', 'لوپرین', 'ایسکارڈ',
  'بروفین', 'آئیبوپروفین', 'ایرینیک', 'پروفین', 'پونسٹان', 'والٹرال', 'ڈکلوفینک', 'فیلڈین', 'بریکسن',
  'سیلیبریکس', 'نوبیرول', 'نوبیرول فورٹ', 'کافلام', 'سنفلیکس', 'ٹوراڈول', 'ٹرامال', 'ٹراماڈول',
  'اگمینٹن', 'ایموکسلن', 'ایموکسل', 'کیورم', 'فلیجل', 'میٹرو نیڈازول', 'اینٹامیزول', 'ایزومیکس',
  'ایزتھرومائسن', 'سیپرو بے', 'سیپروفلوکساسن', 'نوویڈیٹ', 'سیپروکسن', 'کریوٹ', 'لیو فلوکساسن',
  'لی فلوکس', 'سیفکسم', 'سیف سپین', 'ویلوسیف', 'سیفراڈین', 'روسیفن', 'کلیریکیڈ', 'سیپٹران', 'ڈوکسی سائکلین',
  'رائزک', 'اومیپرازول', 'نیکسیم', 'ایسومپرازول', 'گیوسکان', 'رینی', 'زینٹیک', 'ڈسپاٹالن', 'نو سپا',
  'بسکوپین', 'موٹیلیم', 'ڈومپیرائیڈون', 'میکسولون', 'گریونیٹ', 'ایموڈیم', 'او آر ایس', 'نمکول',
  'وینٹولن', 'سالبوٹامول', 'زیریٹیک', 'سیٹریزین', 'رجکس', 'فیکسٹ', 'سوفٹن', 'ہائیڈرلین',
  'سوفواسک', 'ایملوڈپائن', 'کون کور', 'بسوپرولول', 'کیپوٹن', 'ڈایوان', 'کارڈنٹ', 'پلیوکس',
  'لپریٹر', 'ایٹورواسٹاٹن', 'کرسٹور', 'لیزکس', 'گلوکوفاج', 'میٹفارمن', 'گیٹرل', 'امیرل', 'جانوویا',
  'انسولین', 'تھائیروکسن', 'سربیکس زیڈ', 'سی اے سی 1000', 'نیوروبین', 'پولی فیکس', 'بیٹنوویٹ',
  'ڈرموویٹ', 'زینکس', 'لیکسوٹن', 'ویلیم', 'ایپویل'
];

// Recognized pharmaceutical dosage units & forms (English & Urdu)
export const PHARMA_DOSAGE_UNITS = [
  'mg', 'g', 'gm', 'gram', 'grams', 'mcg', 'ug', 'kg',
  'ml', 'l', 'ltr', 'liter', 'litres', 'cc',
  'iu', 'ui', 'meq', 'mmol',
  'tablet', 'tablets', 'tab', 'tabs',
  'capsule', 'capsules', 'cap', 'caps',
  'syrup', 'suspension', 'drops', 'drop',
  'puff', 'puffs', 'inhaler',
  'amp', 'ampoule', 'vial', 'injection', 'inj',
  'sachet', 'sachets',
  'forte', 'plus', 'extra', 'sr', 'xr', 'cr', 'ds',
  // Urdu dosage units & forms
  'ملی گرام', 'ملی لیٹر', 'گرام', 'ایم جی', 'ایم ایل',
  'قطرے', 'گولی', 'گولیاں', 'کیپسول', 'شربت', 'ساشے', 'پف', 'انجکشن', 'فورٹ', 'پلس', 'ایکسٹرا'
];

// Helper: Check if input consists solely of symbols/punctuation (no letters or numbers)
export function isSymbolsOnly(text: string): boolean {
  return !/[a-zA-Z0-9\u0600-\u06FF]/.test(text);
}

// Helper: Check if input is ONLY a number or ONLY a dosage/power (e.g. "500", "500mg", "400 mg", "625", "10ml", "500 ملی گرام")
// with no actual medicine name attached
export function isDosageOrNumberOnly(text: string): boolean {
  const clean = text.trim();
  if (!clean) return false;

  // If there are no alphabetic or Urdu letters at all, but there are digits -> number only!
  if (!/[a-zA-Z\u0600-\u06FF]/.test(clean)) {
    return /\d/.test(clean);
  }

  // Strip digits, symbols, punctuation, and known dosage units
  let stripped = clean.toLowerCase();

  // Remove numbers (Latin + Urdu/Arabic digits)
  stripped = stripped.replace(/[\d\u0660-\u0669\u06F0-\u06F9]+/g, ' ');

  // Remove common symbols & punctuation
  stripped = stripped.replace(/[.,/\\#?!@$%^&*()_\-+=\[\]{}<>:;"'`~|]/g, ' ');

  // Remove dosage units
  for (const unit of PHARMA_DOSAGE_UNITS) {
    const escaped = unit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|\\s)${escaped}(\\s|$)`, 'gi');
    stripped = stripped.replace(regex, ' ');
  }

  // Also remove common stray Latin dosage suffixes attached to numbers like "mg", "ml", "g", "gm", "iu"
  stripped = stripped.replace(/\b(mg|g|gm|ml|mcg|iu|cc|tabs?|caps?)\b/gi, ' ');

  stripped = stripped.replace(/\s+/g, '').trim();

  // If nothing remains or only 1 meaningless letter remains, the input was just a number or power/dosage!
  return stripped.length === 0;
}

// Helper: Extract medicine base name and power/strength from input
// e.g. "Panadol 500mg" -> { medicineName: "Panadol", strength: "500mg", hasMedicineWord: true }
// e.g. "Augmentin 625" -> { medicineName: "Augmentin", strength: "625", hasMedicineWord: true }
// e.g. "پیناڈول 500" -> { medicineName: "پیناڈول", strength: "500", hasMedicineWord: true }
export function extractMedicineAndStrength(text: string): {
  baseMedicine: string;
  strength: string;
  hasMedicineWord: boolean;
} {
  const clean = text.trim();

  // Extract strength/potency pattern (e.g. 500mg, 625, 400 mg, 1g, 20 ملی گرام)
  const strengthMatch = clean.match(
    /\b(\d+(?:\.\d+)?\s*(?:mg|g|gm|mcg|ml|iu|milli\s*gram|drops?|tablets?|tab|tabs?|caps?|capsules?|puffs?|amp|ملی\s*گرام|ایم\s*جی|ایم\s*ایل|گرام)?|\d+\s*\/\s*\d+\s*(?:mg|ml)?|\d+)\b/i
  );

  const strength = strengthMatch ? strengthMatch[0].trim() : '';

  // Remove numbers and dosage units to isolate the core medicine name
  let baseMedicine = clean;
  if (strength) {
    baseMedicine = clean.replace(strength, ' ');
  }

  // Clean punctuation from base medicine
  baseMedicine = baseMedicine
    .replace(/[#?!@$%^&*()_+=\[\]{}<>:;"'`~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const hasMedicineWord = /[a-zA-Z\u0600-\u06FF]{2,}/.test(baseMedicine);

  return {
    baseMedicine: baseMedicine || clean,
    strength,
    hasMedicineWord,
  };
}

// Common drug stem patterns recognized by pharmacological nomenclature
export const MEDICINE_STEM_PATTERNS = [
  /cillin$/i, /mycin$/i, /micin$/i, /floxacin$/i, /cycline$/i, /cef/i, /ceph/i,
  /olol$/i, /pril$/i, /sartan$/i, /statin$/i, /prazole$/i, /tidine$/i, /dipine$/i,
  /zole$/i, /asone$/i, /olone$/i, /cort/i, /oxacin$/i, /vir$/i, /mab$/i,
  /pam$/i, /lam$/i, /gliptin$/i, /gliflozin$/i, /triptan$/i, /setron$/i,
  /ine$/i, /mol$/i, /fen$/i, /ate$/i, /ide$/i, /ium$/i, /ol$/i
];

// 2. Comprehensive Database of Known Diseases & Symptoms (English, Urdu script, Roman Urdu)
export const KNOWN_CONDITIONS_AND_SYMPTOMS: { name: string; display: string; aliases: string[] }[] = [
  { name: 'fever', display: 'Fever (Bukhar)', aliases: ['fever', 'bukhar', 'بخار', 'high temperature', 'chills', 'kapkapi', 'shivering', 'thand lagna', 'tap', 'hararat', 'pyrexia', 'fevr', 'bukhr'] },
  { name: 'headache', display: 'Headache (Sar Dard)', aliases: ['headache', 'sar dard', 'sar ka dard', 'سر درد', 'migraine', 'aadha sar dard', 'ادھے سر کا درد', 'tension headache', 'cephalea', 'hedache', 'head ache'] },
  { name: 'cough', display: 'Cough (Khansi)', aliases: ['cough', 'khansi', 'کھانسی', 'khansi aana', 'balgham', 'balgham wali khansi', 'sookhi khansi', 'khushk khansi', 'dry cough', 'wet cough', 'phlegm', 'coug', 'khasi'] },
  { name: 'flu', display: 'Flu / Cold (Nazla Zukaam)', aliases: ['flu', 'cold', 'nazla', 'zukaam', 'zukam', 'زکام', 'نزلہ', 'runny nose', 'behne wali naak', 'blocked nose', 'band naak', 'sneezing', 'cheenkein', 'چھینکیں', 'flue', 'fluu', 'flue'] },
  { name: 'sore_throat', display: 'Sore Throat (Gala Kharab)', aliases: ['sore throat', 'gala kharab', 'gale mein dard', 'گلے میں درد', 'galay ki sozish', 'tonsils', 'tonsillitis', 'throat pain', 'pharyngitis', 'khich khich'] },
  { name: 'chest_pain', display: 'Chest Pain (Seenay Mein Dard)', aliases: ['chest pain', 'seenay mein dard', 'seene ka dard', 'سینے میں درد', 'angina', 'heart attack', 'heartburn', 'seene ki jalan', 'tezabiyat', 'chest heaviness', 'chest tightness'] },
  { name: 'shortness_of_breath', display: 'Shortness of Breath (Saans Phoolna)', aliases: ['shortness of breath', 'saans phoolna', 'saans ki takleef', 'سانس لینے میں دشواری', 'asthma', 'dama', 'دمہ', 'wheezing', 'breathlessness', 'dyspnea', 'saans mein seeti', 'astma'] },
  { name: 'stomach_pain', display: 'Stomach Pain (Pait Dard)', aliases: ['stomach pain', 'pait dard', 'pait ka dard', 'پیٹ کا درد', 'abdominal pain', 'cramps', 'maror', 'gastric pain', 'belly ache', 'gas', 'afhara', 'bloating', 'bad hazmi', 'بدہضمی', 'indigestion', 'acidity', 'gastritis', 'ulcer'] },
  { name: 'diarrhea', display: 'Diarrhea (Dast / Loose Motion)', aliases: ['diarrhea', 'dast', 'دست', 'loose motion', 'motions', 'ishal', 'اسہال', 'watery stool', 'loose stool', 'loose motions', 'diarrhoea', 'diaria'] },
  { name: 'vomiting', display: 'Vomiting / Nausea (Ulti / Matli)', aliases: ['vomiting', 'ulti', 'الٹی', 'qai', 'قے', 'nausea', 'matli', 'متلی', 'food poisoning', 'dil kharab', 'puking', 'vomtng'] },
  { name: 'diabetes', display: 'Diabetes (Sugar)', aliases: ['diabetes', 'sugar', 'ذیابیطس', 'diabetic', 'high sugar', 'blood sugar', 'sugar ki bimari', 'diabetis', 'shugar'] },
  { name: 'hypertension', display: 'Hypertension (High Blood Pressure)', aliases: ['hypertension', 'high blood pressure', 'high bp', 'blood pressure', 'ہائی بلڈ پریشر', 'bp high', 'low bp', 'bp low', 'low blood pressure'] },
  { name: 'body_pain', display: 'Body Pain & Fatigue (Jism Mein Dard)', aliases: ['body pain', 'body aches', 'jism mein dard', 'جسم میں درد', 'pathon ka khichao', 'fatigue', 'thakawat', 'تھکاوٹ', 'weakness', 'kamzori', 'کمزوری', 'muscle pain', 'myalgia'] },
  { name: 'joint_pain', display: 'Joint Pain / Arthritis (Joron Ka Dard)', aliases: ['joint pain', 'joron ka dard', 'جوڑوں کا درد', 'arthritis', 'gathiya', 'گھٹیا', 'knee pain', 'ghutne ka dard', 'back pain', 'kamar dard', 'کمر درد', 'neck pain', 'gardan ka dard', 'sciatica'] },
  { name: 'skin_rash', display: 'Skin Rash & Allergy (Khareesh / Kharish)', aliases: ['skin rash', 'khareesh', 'kharish', 'خارش', 'itching', 'allergy', 'الرجی', 'hives', 'pitte', 'eczema', 'psoriasis', 'pimples', 'danay', 'acne', 'alrgy'] },
  { name: 'dizziness', display: 'Dizziness / Vertigo (Chakkar Aana)', aliases: ['dizziness', 'chakkar', 'chakkar aana', 'چکر', 'vertigo', 'fainting', 'behoshi', 'بے ہوشی', 'lightheaded'] },
  { name: 'uti', display: 'Urinary Tract Infection (Peshab Mein Jalan)', aliases: ['uti', 'urinary infection', 'peshab mein jalan', 'پیشاب میں جلن', 'burning urination', 'dysuria', 'urine pain', 'kidney stone', 'gurday ki pathri', 'گردے کی پتھری'] },
  { name: 'infection', display: 'Infection (Jaraseem)', aliases: ['infection', 'jaraseem', 'انفیکشن', 'sepsis', 'pus', 'peep'] },
  { name: 'dengue', display: 'Dengue Fever', aliases: ['dengue', 'dengue fever', 'ڈینگی', 'dengu', 'dangi'] },
  { name: 'malaria', display: 'Malaria', aliases: ['malaria', 'ملیریا', 'malria', 'thandi lag kar bukhar'] },
  { name: 'typhoid', display: 'Typhoid Fever', aliases: ['typhoid', 'motijhara', 'ٹائیفائیڈ', 'typhod', 'meadi bukhar'] },
  { name: 'hepatitis', display: 'Hepatitis / Jaundice (Yarqan)', aliases: ['hepatitis', 'yarqan', 'یرقان', 'jaundice', 'peeliya', 'kala yarqan', 'peela yarqan'] },
  { name: 'pneumonia', display: 'Pneumonia (Nimonia)', aliases: ['pneumonia', 'nimonia', 'نمونیا', 'pneumnia', 'chest infection'] },
  { name: 'constipation', display: 'Constipation (Qabz)', aliases: ['constipation', 'qabz', 'قبض', 'piles', 'bawaseer', 'بواسیر', 'hard stool'] },
  { name: 'anxiety', display: 'Anxiety / Stress (Ghabrahat)', aliases: ['anxiety', 'ghabrahat', 'گھبراہٹ', 'bechaini', 'stress', 'depression', 'afsurdagi', 'افسردگی', 'panic attack', 'palpitations', 'dil ki dharkan tezz'] },
  { name: 'insomnia', display: 'Insomnia (Neend Na Aana)', aliases: ['insomnia', 'neend na aana', 'نیند کی کمی', 'sleeplessness', 'neend ki takleef'] },
  { name: 'eye_ear_pain', display: 'Eye / Ear / Dental Pain', aliases: ['eye pain', 'aankh mein dard', 'آنکھ کا درد', 'red eye', 'lal aankh', 'ear pain', 'kaan dard', 'کان میں درد', 'toothache', 'daant dard', 'دانت کا درد'] },
  { name: 'anemia', display: 'Anemia (Khoon Ki Kami)', aliases: ['anemia', 'khoon ki kami', 'خون کی کمی', 'low hemoglobin', 'pale skin'] },
  { name: 'stroke', display: 'Stroke / Paralysis (Falij)', aliases: ['stroke', 'falij', 'فالج', 'paralysis', 'facial drop', 'sudden weakness', 'seizure', 'mirgi', 'مرگی', 'fits'] },
  { name: 'injury', display: 'Injury / Cut / Burn (Zakhm)', aliases: ['injury', 'wound', 'cut', 'zakhm', 'زخم', 'bleeding', 'khoon behna', 'burn', 'jal jana', 'chot', 'fracture', 'haddi tootna'] },
];

// Recognized Medical Acronyms (which would otherwise look like non-vowel gibberish)
export const VALID_MEDICAL_ACRONYMS = new Set([
  'BP', 'ECG', 'EKG', 'CBC', 'MRI', 'CT', 'LFT', 'RFT', 'ESR', 'ORS',
  'ENT', 'PCOS', 'PCOD', 'GERD', 'COPD', 'UTI', 'IBS', 'TB', 'HIV',
  'WBC', 'RBC', 'HGB', 'HB', 'HCT', 'MCV', 'MCH', 'MCHC', 'PLT',
  'FBS', 'RBS', 'HBA1C', 'BUN', 'CR', 'ALT', 'AST', 'ALP', 'GGT',
  'PSA', 'TSH', 'FT3', 'FT4', 'CRP', 'RA', 'ASO', 'VDRL', 'TPHA',
  'HBSAG', 'HCV', 'PCR', 'Echo', 'USG', 'XRAY', 'X-RAY', 'ICU', 'ER',
  'PMDC', 'WHO', 'DRAP', 'OTC', 'Rx', 'IV', 'IM', 'SC', 'PRN', 'TDS', 'BD', 'OD', 'TID', 'BID', 'QID'
]);

// Valid conversational responses in follow-up answers (Yes/No, durations, severity, locations)
export const VALID_FOLLOWUP_TOKENS = new Set([
  'yes', 'no', 'yeah', 'yep', 'nope', 'haan', 'ji haan', 'nahi', 'jee nahi', 'نہیں', 'ہاں', 'جی ہاں', 'جی نہیں',
  'today', 'yesterday', 'days', 'day', 'weeks', 'week', 'months', 'month', 'hours', 'hour',
  'aaj', 'kal', 'din', 'hafta', 'hafte', 'haftay', 'mahina', 'mahine', 'ghanta', 'ghantay', 'subah', 'raat', 'sham', 'dopahar',
  'آج', 'کل', 'دن', 'ہفتے', 'مہینے', 'گھنٹے', 'صبح', 'شام', 'رات', 'دوپہر',
  'severe', 'mild', 'moderate', 'extreme', 'slight', 'halka', 'shadeed', 'bohat zyada', 'darmiyana', 'شدید', 'ہلکا', 'درمیانہ',
  'left', 'right', 'both', 'bayaan', 'dayaan', 'dono', 'دایاں', 'بایاں', 'دونوں',
  'none', 'nothing', 'koi nahi', 'kuch nahi', 'کوئی نہیں', 'کچھ نہیں',
  'fever', 'pain', 'vomiting', 'cough', 'ache', 'dard', 'bukhar', 'khansi',
  'eating', 'walking', 'sleeping', 'resting', 'sitting', 'khana', 'chalna', 'sona', 'aaram',
  'better', 'worse', 'same', 'behtar', 'kharab', 'waisa hi', 'بہتر', 'خراب',
]);

// Helper: Levenshtein Distance for fuzzy matching
export function calculateLevenshteinDistance(a: string, b: string): number {
  const s1 = a.toLowerCase();
  const s2 = b.toLowerCase();
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// Find closest known medicine
export function findClosestMedicine(input: string): { name: string; distance: number } | null {
  const clean = input.trim().toLowerCase();
  if (clean.length < 3) return null;

  let bestMatch: string | null = null;
  let minDistance = 999;

  for (const med of KNOWN_MEDICINES) {
    const medLower = med.toLowerCase();
    // Direct exact match
    if (medLower === clean) {
      return { name: med, distance: 0 };
    }
    const dist = calculateLevenshteinDistance(clean, medLower);
    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = med;
    }
  }

  // Threshold criteria: distance <= 2 for words >= 5 chars, distance 1 for 4 chars
  const maxAllowed = clean.length >= 6 ? 2 : clean.length >= 4 ? 1 : 0;
  if (bestMatch && minDistance <= maxAllowed && minDistance > 0) {
    return { name: bestMatch, distance: minDistance };
  }

  return null;
}

// Find closest known condition or symptom
export function findClosestCondition(input: string): { name: string; display: string; distance: number } | null {
  const clean = input.trim().toLowerCase();
  if (clean.length < 3) return null;

  let bestMatch: { name: string; display: string } | null = null;
  let minDistance = 999;

  for (const cond of KNOWN_CONDITIONS_AND_SYMPTOMS) {
    for (const alias of cond.aliases) {
      const aliasLower = alias.toLowerCase();
      if (aliasLower === clean) {
        return { name: cond.name, display: cond.display, distance: 0 };
      }
      const dist = calculateLevenshteinDistance(clean, aliasLower);
      if (dist < minDistance) {
        minDistance = dist;
        bestMatch = { name: cond.name, display: cond.display };
      }
    }
  }

  const maxAllowed = clean.length >= 6 ? 2 : clean.length >= 4 ? 1 : 0;
  if (bestMatch && minDistance <= maxAllowed && minDistance > 0) {
    return { name: bestMatch.name, display: bestMatch.display, distance: minDistance };
  }

  return null;
}

// Check if string contains any known medicine
export function containsKnownMedicine(text: string): boolean {
  const lower = text.toLowerCase();
  for (const med of KNOWN_MEDICINES) {
    if (lower.includes(med.toLowerCase())) return true;
  }
  // Check pharmacopeia stem patterns
  const words = lower.split(/[\s,.-]+/);
  for (const word of words) {
    if (word.length >= 4) {
      for (const pattern of MEDICINE_STEM_PATTERNS) {
        if (pattern.test(word)) return true;
      }
    }
  }
  return false;
}

// Check if string contains any known condition/symptom/body part
export function containsKnownSymptomOrCondition(text: string): boolean {
  const lower = text.toLowerCase();
  for (const cond of KNOWN_CONDITIONS_AND_SYMPTOMS) {
    for (const alias of cond.aliases) {
      if (lower.includes(alias.toLowerCase())) return true;
    }
  }
  return false;
}

// Main Smart Input Validator
export function validateMedicalInput(
  rawInput: string,
  scope: InputValidationScope = 'general',
  _language: SupportedLanguage = 'en'
): InputValidationResult {
  const text = (rawInput || '').trim();

  // 1. Empty Check
  if (!text) {
    return {
      isValid: false,
      errorType: 'empty',
      alertMessage: {
        en: 'Please enter or speak your symptoms or medicine name.',
        ur: 'برائے مہربانی اپنی علامات یا دوا کا نام لکھیں یا بولیں۔',
        roman: 'Baraye meherbani apni alamaat ya dawai ka naam likhein ya bolein.',
      },
      spokenAlert: {
        en: 'Please enter or speak your symptoms or medicine name.',
        ur: 'برائے مہربانی اپنی علامات یا دوا کا نام لکھیں یا بولیں۔',
        roman: 'Baraye meherbani apni alamaat ya dawai ka naam likhein ya bolein.',
      },
    };
  }

  // 2. Email Address Check (e.g. someone@email.com)
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  if (emailPattern.test(text)) {
    return {
      isValid: false,
      errorType: 'email',
      alertMessage: {
        en: "This appears to be an email address, not a medical symptom or medicine name. Please enter your health complaint or medicine.",
        ur: 'یہ ای میل ایڈریس معلوم ہوتا ہے، کوئی طبی علامت یا دوا نہیں۔ برائے مہربانی اپنی بیماری یا دوا درج کریں۔',
        roman: 'Yeh email address lagta hai, koi tibbi alamat ya dawai nahi. Baraye meherbani apni beemari ya dawai darj karein.',
      },
      spokenAlert: {
        en: "This doesn't look like a valid symptom or medicine name. Please enter the correct name of your illness or medicine.",
        ur: 'یہ درست علامت یا دوا کا نام معلوم نہیں ہوتا۔ برائے مہربانی اپنی بیماری یا دوا کا درست نام درج کریں۔',
        roman: 'Yeh kisi drust alamat ya dawai ka naam nahi lagta. Baraye meherbani apni beemari ya dawai ka sahi naam darj karein.',
      },
    };
  }

  // 3. Web URL Check
  if (/^https?:\/\//i.test(text) || /www\.[a-z0-9]/i.test(text)) {
    return {
      isValid: false,
      errorType: 'url',
      alertMessage: {
        en: "This is a web link. Please enter a valid symptom, illness, or medicine name.",
        ur: 'یہ ویب لنک ہے۔ برائے مہربانی درست بیماری، علامت یا دوا کا نام درج کریں۔',
        roman: 'Yeh web link hai. Baraye meherbani sahi beemari ya dawai ka naam likhein.',
      },
      spokenAlert: {
        en: "This doesn't look like a valid symptom or medicine name. Please enter the correct name of your illness or medicine.",
        ur: 'یہ درست علامت یا دوا کا نام معلوم نہیں ہوتا۔ برائے مہربانی اپنی بیماری یا دوا کا درست نام درج کریں۔',
        roman: 'Yeh kisi drust alamat ya dawai ka naam nahi lagta. Baraye meherbani apni beemari ya dawai ka sahi naam darj karein.',
      },
    };
  }

  // 4. Standalone Symbols Check (e.g. "???", "###", "@#$%", "---", "***", "+++", "!?!")
  // Rejects standalone symbols with no alphabetic or numeric content
  if (isSymbolsOnly(text)) {
    const isMed = scope === 'medicine';
    return {
      isValid: false,
      errorType: 'gibberish',
      alertMessage: {
        en: isMed
          ? "Symbols alone are not accepted. Please enter the actual medicine name (e.g., Panadol 500mg or Brufen 400)."
          : "Symbols alone are not accepted. Please enter your symptoms or illness name.",
        ur: isMed
          ? "صرف علامات یا نشانات قبول نہیں ہیں۔ برائے مہربانی دوا کا اصل نام درج کریں (مثلاً پیناڈول 500mg یا بروفین 400)۔"
          : "صرف علامات قبول نہیں ہیں۔ برائے مہربانی اپنی بیماری یا علامات کا اصل نام درج کریں۔",
        roman: isMed
          ? "Sirf symbols accept nahi hotay. Baraye meherbani dawai ka sahi naam darj karein (maslan Panadol 500mg ya Brufen 400)."
          : "Sirf symbols accept nahi hotay. Baraye meherbani apni beemari ya alamat ka sahi naam darj karein.",
      },
      spokenAlert: {
        en: isMed
          ? "Symbols alone are not accepted. Please enter the medicine name."
          : "Symbols alone are not accepted. Please enter your symptoms.",
        ur: isMed
          ? "صرف علامات قبول نہیں ہیں۔ برائے مہربانی دوا کا نام درج کریں۔"
          : "صرف علامات قبول نہیں ہیں۔ برائے مہربانی علامات کا نام درج کریں۔",
        roman: isMed
          ? "Sirf symbols accept nahi hotay. Baraye meherbani dawai ka naam darj karein."
          : "Sirf symbols accept nahi hotay. Baraye meherbani alamat ka naam darj karein.",
      },
    };
  }

  // 5. Standalone Numbers & Standalone Dosage/Power Check (e.g. "500", "500mg", "400 mg", "625", "10ml", "500 ملی گرام")
  // Numbers or power alone are strictly rejected unless accompanied by the medicine name (e.g. "Panadol 500mg")!
  if (isDosageOrNumberOnly(text)) {
    if (scope === 'symptom_followup') {
      const numVal = parseInt(text.replace(/[^\d]/g, ''), 10);
      // Valid pain rating (1-10) or day duration (1-100)
      if (!isNaN(numVal) && numVal >= 1 && numVal <= 100 && text.length <= 4) {
        return {
          isValid: true,
          alertMessage: { en: '', ur: '', roman: '' },
          spokenAlert: { en: '', ur: '', roman: '' },
        };
      }
    }

    const isMed = scope === 'medicine' || scope === 'general';
    return {
      isValid: false,
      errorType: 'number_only',
      alertMessage: {
        en: isMed
          ? "Please enter the medicine name along with its dosage. Standalone numbers or dosage strength (like 500mg or 400) cannot be checked alone. Numbers are only accepted along with a medicine name (e.g., Panadol 500mg or Augmentin 625)."
          : "Please enter your symptoms or illness name. Numbers or symbols alone are not medical symptoms.",
        ur: isMed
          ? "براہ کرم دوا کا نام بھی ساتھ درج کریں۔ صرف نمبر یا پاور (جیسے 500mg یا 400) اکیلے قبول نہیں کی جا سکتیں۔ پاور صرف دوا کے نام کے ساتھ قبول کی جاتی ہے (مثلاً پیناڈول 500mg یا اگمینٹن 625)۔"
          : "براہ کرم اپنی علامات یا بیماری کا نام درج کریں۔ صرف نمبرز یا علامات بیماری کا نام نہیں ہو سکتے۔",
        roman: isMed
          ? "Baraye meherbani dawai ka naam bhi sath darj karein. Sirf number ya power (jesy 500mg ya 400) akele accept nahi hoti. Power sirf dawa ke naam ke sath accept hoti hai (maslan Panadol 500mg ya Augmentin 625)."
          : "Baraye meherbani apni alamat ya beemari ka naam darj karein. Sirf numbers ya symbols alamat nahi hotay.",
      },
      spokenAlert: {
        en: isMed
          ? "Please enter the medicine name along with the strength, for example Panadol 500mg."
          : "Please enter your correct symptoms or illness name.",
        ur: isMed
          ? "براہ کرم دوا کا نام بھی ساتھ لکھیں، صرف نمبر یا پاور اکیلے نہیں لکھی جا سکتی۔ جیسے پیناڈول 500 ملی گرام۔"
          : "براہ کرم اپنی صحیح علامات کا نام درج کریں۔",
        roman: isMed
          ? "Baraye meherbani dawai ka naam bhi sath likhein, sirf number ya power akeli accept nahi hoti. Jesy Panadol 500mg."
          : "Baraye meherbani apni sahi alamat ka naam darj karein.",
      },
    };
  }

  // 5. Gibberish, Keyboard Mash, Repeated Characters & Nonsense Check
  const isMedScope = scope === 'medicine';
  const genericAlertMsg = {
    en: isMedScope
      ? "This doesn't look like a valid medicine name. Please enter the correct medicine name or upload a clear picture or video."
      : "This doesn't look like a valid symptom or illness name. Please enter your correct symptoms or upload a clear photo or video.",
    ur: isMedScope
      ? 'یہ دوا کا درست نام معلوم نہیں ہوتا۔ برائے مہربانی صحیح دوا کا نام لکھیں یا دوا کی درست تصویر یا ویڈیو اپلوڈ کریں۔'
      : 'یہ درست علامت یا بیماری کا نام معلوم نہیں ہوتا۔ برائے مہربانی صحیح علامات لکھیں یا درست تصویر یا ویڈیو اپلوڈ کریں۔',
    roman: isMedScope
      ? 'Yeh kisi dawai ka sahi naam nahi lagta. Baraye meherbani sahi medicine ka naam likhein ya sahi picture ya video upload karein.'
      : 'Yeh kisi drust alamat ya beemari ka naam nahi lagta. Baraye meherbani apni sahi alamat likhein ya sahi picture ya video upload karein.',
  };
  const genericSpokenAlert = {
    en: isMedScope
      ? "Please enter the correct medicine name or upload a valid picture or video."
      : "Please enter your correct symptoms or illness name, or upload a clear photo or video.",
    ur: isMedScope
      ? 'برائے مہربانی صحیح دوا کا نام لکھیں یا دوا کی درست تصویر یا ویڈیو اپلوڈ کریں۔'
      : 'برائے مہربانی اپنی صحیح علامات کا نام لکھیں یا درست تصویر یا ویڈیو اپلوڈ کریں۔',
    roman: isMedScope
      ? 'Baraye meherbani sahi medicine ka naam likhein ya dawai ki sahi picture ya video upload karein.'
      : 'Baraye meherbani apni sahi alamat ka naam likhein ya sahi picture ya video upload karein.',
  };

  // A. Same character repeated 4+ times (e.g. "aaaaa", "zzzzz", "hhhhhh", "قققق")
  if (/([a-zA-Z\u0600-\u06FF])\1{3,}/i.test(text)) {
    return {
      isValid: false,
      errorType: 'gibberish',
      alertMessage: genericAlertMsg,
      spokenAlert: genericSpokenAlert,
    };
  }

  // B. Classic Keyboard row mash (asdfgh, qwerty, zxcvb, lkjhg)
  const keyboardMashes = ['asdf', 'qwerty', 'zxcv', 'lkjh', 'poiuy', 'mnbvc', 'dfghjk', 'fjdksl', 'asdfgh'];
  const lowerText = text.toLowerCase();
  if (keyboardMashes.some((mash) => lowerText.includes(mash))) {
    return {
      isValid: false,
      errorType: 'gibberish',
      alertMessage: genericAlertMsg,
      spokenAlert: genericSpokenAlert,
    };
  }

  // C. Latin text with no vowels having length >= 4 (excluding recognized medical acronyms like BP, CBC, ECG)
  const words = text.split(/[\s,.-]+/);
  for (const w of words) {
    const cleanWord = w.toUpperCase();
    if (cleanWord.length >= 4 && /^[A-Z]+$/.test(cleanWord)) {
      const hasVowels = /[AEIOUY]/.test(cleanWord);
      if (!hasVowels && !VALID_MEDICAL_ACRONYMS.has(cleanWord)) {
        return {
          isValid: false,
          errorType: 'gibberish',
          alertMessage: genericAlertMsg,
          spokenAlert: genericSpokenAlert,
        };
      }
    }
  }

  // D. Only symbols or punctuation (e.g. "???", "!!!", "@#$%", "---")
  if (!/[a-zA-Z0-9\u0600-\u06FF]/.test(text)) {
    return {
      isValid: false,
      errorType: 'gibberish',
      alertMessage: genericAlertMsg,
      spokenAlert: genericSpokenAlert,
    };
  }

  // E. Single character meaningless letter (e.g. "x", "q", "z")
  if (text.length === 1 && !['a', 'i', 'ہ', 'ی'].includes(lowerText)) {
    return {
      isValid: false,
      errorType: 'too_short',
      alertMessage: {
        en: "The entered text is too short. Please enter the full name of your illness or medicine.",
        ur: 'یہ نام بہت مختصر ہے۔ برائے مہربانی بیماری یا دوا کا پورا نام درج کریں۔',
        roman: 'Yeh naam bohat chota hai. Baraye meherbani poora naam darj karein.',
      },
      spokenAlert: {
        en: "This doesn't look like a valid symptom or medicine name. Please enter the correct name of your illness or medicine.",
        ur: 'یہ درست علامت یا دوا کا نام معلوم نہیں ہوتا۔ برائے مہربانی اپنی بیماری یا دوا کا درست نام درج کریں۔',
        roman: 'Yeh kisi drust alamat ya dawai ka naam nahi lagta. Baraye meherbani apni beemari ya dawai ka sahi naam darj karein.',
      },
    };
  }

  // 6. Follow-up Chat Answer Validation
  if (scope === 'symptom_followup') {
    // If it has multiple words or common follow-up phrases, it's valid!
    for (const w of words) {
      if (VALID_FOLLOWUP_TOKENS.has(w.toLowerCase())) {
        return {
          isValid: true,
          alertMessage: { en: '', ur: '', roman: '' },
          spokenAlert: { en: '', ur: '', roman: '' },
        };
      }
    }
    // Check if it describes a symptom, condition, or medicine
    if (containsKnownSymptomOrCondition(text) || containsKnownMedicine(text)) {
      return {
        isValid: true,
        alertMessage: { en: '', ur: '', roman: '' },
        spokenAlert: { en: '', ur: '', roman: '' },
      };
    }
    // If words look like regular conversational text (has vowels, sensible lengths)
    if (words.length >= 2 && words.every((w) => w.length < 25)) {
      return {
        isValid: true,
        alertMessage: { en: '', ur: '', roman: '' },
        spokenAlert: { en: '', ur: '', roman: '' },
      };
    }
  }

  // 7. Medicine-Specific Field Validation (Medicine Check: "Check-a-Medicine" mode)
  if (scope === 'medicine') {
    // A. Check exact known medicine or generic stem on full text
    if (containsKnownMedicine(text)) {
      return {
        isValid: true,
        alertMessage: { en: '', ur: '', roman: '' },
        spokenAlert: { en: '', ur: '', roman: '' },
      };
    }

    // B. Deconstruct input into base medicine name + strength/power
    // e.g. "Panadol 500mg" -> base: "Panadol", strength: "500mg"
    // e.g. "Augmentin 625" -> base: "Augmentin", strength: "625"
    // e.g. "پیناڈول 500" -> base: "پیناڈول", strength: "500"
    // e.g. "Brufen 400" -> base: "Brufen", strength: "400"
    const parsed = extractMedicineAndStrength(text);

    if (parsed.hasMedicineWord) {
      // 1. Check if isolated base medicine is known
      if (containsKnownMedicine(parsed.baseMedicine)) {
        return {
          isValid: true,
          alertMessage: { en: '', ur: '', roman: '' },
          spokenAlert: { en: '', ur: '', roman: '' },
        };
      }

      // 2. Check fuzzy match for misspellings on the base medicine (e.g. "Panadolll 500mg" -> "Panadol 500mg")
      const closestMed = findClosestMedicine(parsed.baseMedicine);
      if (closestMed) {
        const suggestion = parsed.strength ? `${closestMed.name} ${parsed.strength}` : closestMed.name;
        return {
          isValid: false,
          errorType: 'unrecognized_medicine',
          suggestion,
          alertMessage: {
            en: `This doesn't look like a valid medicine name. Did you mean "${suggestion}"?`,
            ur: `یہ دوا کا درست نام معلوم نہیں ہوتا۔ کیا آپ کی مراد "${suggestion}" ہے؟`,
            roman: `Yeh kisi dawai ka sahi naam nahi lagta. Kya aap ki muraad "${suggestion}" hai?`,
          },
          spokenAlert: {
            en: `This doesn't look like a valid medicine name. Did you mean ${suggestion}?`,
            ur: `یہ دوا کا درست نام معلوم نہیں ہوتا۔ کیا آپ کی مراد ${suggestion} ہے؟`,
            roman: `Yeh kisi dawai ka sahi naam nahi lagta. Kya aap ki muraad ${suggestion} hai?`,
          },
        };
      }

      // 3. Pharmacopeia stem matching (e.g. "moxifloxacin 400mg")
      const baseWords = parsed.baseMedicine.split(/[\s,.-]+/);
      for (const w of baseWords) {
        if (w.length >= 4) {
          for (const pattern of MEDICINE_STEM_PATTERNS) {
            if (pattern.test(w)) {
              return {
                isValid: true,
                alertMessage: { en: '', ur: '', roman: '' },
                spokenAlert: { en: '', ur: '', roman: '' },
              };
            }
          }
        }
      }

      // 4. If the medicine query has a recognized word/name >= 3 characters AND a power/number attached
      // (e.g. "Leflox 500", "Risek 20", "Azomax 250", "Moxiget 400mg", "Betnovate-N", "Sofvasc 5mg"):
      // It is a genuine medicine query with strength/dosage -> ACCEPT and route to medicine check engine!
      if (parsed.strength && parsed.baseMedicine.length >= 3) {
        return {
          isValid: true,
          alertMessage: { en: '', ur: '', roman: '' },
          spokenAlert: { en: '', ur: '', roman: '' },
        };
      }
    }

    // C. If user entered a health condition instead of a medicine in this field (e.g. "drops for ear pain" or "flu")
    if (containsKnownSymptomOrCondition(text)) {
      return {
        isValid: true,
        alertMessage: { en: '', ur: '', roman: '' },
        spokenAlert: { en: '', ur: '', roman: '' },
      };
    }

    // D. Unrecognized medicine
    return {
      isValid: false,
      errorType: 'unrecognized_medicine',
      alertMessage: {
        en: "This doesn't look like a valid medicine name. Please enter the correct name of your medicine (e.g., Panadol 500mg, Augmentin 625, Brufen 400).",
        ur: 'یہ دوا کا درست نام معلوم نہیں ہوتا۔ برائے مہربانی اپنی دوا کا صحیح نام درج کریں (مثلاً پیناڈول 500mg، اگمینٹن 625، بروفین 400)۔',
        roman: 'Yeh kisi dawai ka sahi naam nahi lagta. Baraye meherbani apni dawai ka theek naam darj karein (maslan Panadol 500mg, Augmentin 625, Brufen 400).',
      },
      spokenAlert: {
        en: "This doesn't look like a valid medicine name. Please enter the correct name of your medicine.",
        ur: 'یہ دوا کا درست نام معلوم نہیں ہوتا۔ برائے مہربانی اپنی دوا کا صحیح نام درج کریں۔',
        roman: 'Yeh kisi dawai ka sahi naam nahi lagta. Baraye meherbani apni dawai ka theek naam darj karein.',
      },
    };
  }

  // 8. Symptom / Condition / Reverse Lookup Field Validation
  if (scope === 'symptom' || scope === 'condition') {
    // Check exact known symptoms
    if (containsKnownSymptomOrCondition(text) || containsKnownMedicine(text)) {
      return {
        isValid: true,
        alertMessage: { en: '', ur: '', roman: '' },
        spokenAlert: { en: '', ur: '', roman: '' },
      };
    }

    // Check fuzzy match for misspelled conditions (e.g. "diabetis" -> "Diabetes", "hedache" -> "Headache", "fevr" -> "Fever")
    const closestCond = findClosestCondition(text);
    if (closestCond) {
      const suggestion = closestCond.display;
      return {
        isValid: false,
        errorType: 'unrecognized_symptom',
        suggestion,
        alertMessage: {
          en: `This doesn't look like a valid symptom name. Did you mean "${suggestion}"?`,
          ur: `یہ علامت کا درست نام معلوم نہیں ہوتا۔ کیا آپ کی مراد "${suggestion}" ہے؟`,
          roman: `Yeh kisi alamat ka sahi naam nahi lagta. Kya aap ki muraad "${suggestion}" hai?`,
        },
        spokenAlert: {
          en: `This doesn't look like a valid symptom name. Did you mean ${suggestion}?`,
          ur: `یہ علامت کا درست نام معلوم نہیں ہوتا۔ کیا آپ کی مراد ${suggestion} ہے؟`,
          roman: `Yeh kisi alamat ka sahi naam nahi lagta. Kya aap ki muraad ${suggestion} hai?`,
        },
      };
    }

    // If it's a multi-word descriptive sentence (e.g. "I feel very weak and have body pain"), don't be overly strict
    if (words.length >= 3) {
      return {
        isValid: true,
        alertMessage: { en: '', ur: '', roman: '' },
        spokenAlert: { en: '', ur: '', roman: '' },
      };
    }

    // If single or 2 unknown words without medical relevance
    return {
      isValid: false,
      errorType: 'unrecognized_symptom',
      alertMessage: {
        en: "This doesn't look like a valid symptom or illness name. Please enter the correct name of your illness.",
        ur: 'یہ علامت یا بیماری کا درست نام معلوم نہیں ہوتا۔ برائے مہربانی اپنی بیماری یا علامت کا صحیح نام درج کریں۔',
        roman: 'Yeh kisi alamat ya beemari ka sahi naam nahi lagta. Baraye meherbani apni beemari ya alamat ka theek naam darj karein.',
      },
      spokenAlert: {
        en: "This doesn't look like a valid symptom or illness name. Please enter the correct name of your illness.",
        ur: 'یہ علامت یا بیماری کا درست نام معلوم نہیں ہوتا۔ برائے مہربانی اپنی بیماری یا علامت کا صحیح نام درج کریں۔',
        roman: 'Yeh kisi alamat ya beemari ka sahi naam nahi lagta. Baraye meherbani apni beemari ya alamat ka theek naam darj karein.',
      },
    };
  }

  // 9. General fallback validation
  if (!containsKnownMedicine(text) && !containsKnownSymptomOrCondition(text) && words.length <= 2) {
    // Check if close to medicine or condition
    const medClose = findClosestMedicine(text);
    if (medClose) {
      return {
        isValid: false,
        errorType: 'unrecognized_medicine',
        suggestion: medClose.name,
        alertMessage: {
          en: `This doesn't look like a valid name. Did you mean "${medClose.name}"?`,
          ur: `یہ درست نام معلوم نہیں ہوتا۔ کیا آپ کی مراد "${medClose.name}" ہے؟`,
          roman: `Yeh theek naam nahi lagta. Kya aap ki muraad "${medClose.name}" hai?`,
        },
        spokenAlert: {
          en: `This doesn't look like a valid name. Did you mean ${medClose.name}?`,
          ur: `یہ درست نام معلوم نہیں ہوتا۔ کیا آپ کی مراد ${medClose.name} ہے؟`,
          roman: `Yeh theek naam nahi lagta. Kya aap ki muraad ${medClose.name} hai?`,
        },
      };
    }

    const condClose = findClosestCondition(text);
    if (condClose) {
      return {
        isValid: false,
        errorType: 'unrecognized_symptom',
        suggestion: condClose.display,
        alertMessage: {
          en: `This doesn't look like a valid name. Did you mean "${condClose.display}"?`,
          ur: `یہ درست نام معلوم نہیں ہوتا۔ کیا آپ کی مراد "${condClose.display}" ہے؟`,
          roman: `Yeh theek naam nahi lagta. Kya aap ki muraad "${condClose.display}" ہے؟`,
        },
        spokenAlert: {
          en: `This doesn't look like a valid name. Did you mean ${condClose.display}?`,
          ur: `یہ درست نام معلوم نہیں ہوتا۔ کیا آپ کی مراد ${condClose.display} ہے؟`,
          roman: `Yeh theek naam nahi lagta. Kya aap ki muraad ${condClose.display} hai?`,
        },
      };
    }

    return {
      isValid: false,
      errorType: 'gibberish',
      alertMessage: {
        en: "This doesn't look like a valid symptom or medicine name. Please enter the correct name of your illness or medicine.",
        ur: 'یہ درست علامت یا دوا کا نام معلوم نہیں ہوتا۔ برائے مہربانی اپنی بیماری یا دوا کا درست نام درج کریں۔',
        roman: 'Yeh kisi drust alamat ya dawai ka naam nahi lagta. Baraye meherbani apni beemari ya dawai ka sahi naam darj karein.',
      },
      spokenAlert: {
        en: "This doesn't look like a valid symptom or medicine name. Please enter the correct name of your illness or medicine.",
        ur: 'یہ درست علامت یا دوا کا نام معلوم نہیں ہوتا۔ برائے مہربانی اپنی بیماری یا دوا کا درست نام درج کریں۔',
        roman: 'Yeh kisi drust alamat ya dawai ka naam nahi lagta. Baraye meherbani apni beemari ya dawai ka sahi naam darj karein.',
      },
    };
  }

  return {
    isValid: true,
    alertMessage: { en: '', ur: '', roman: '' },
    spokenAlert: { en: '', ur: '', roman: '' },
  };
}

// Upload Media Validation Messages (Part 2)
export const UPLOAD_VALIDATION_MESSAGES = {
  not_medical: {
    alert: {
      en: "This doesn't appear to be a medical report, X-ray, or medicine photo. Please upload or capture the correct image/video.",
      ur: 'یہ تصویر یا ویڈیو کوئی میڈیکل رپورٹ، ایکسرے یا دوا کی تصویر معلوم نہیں ہوتی۔ برائے مہربانی درست میڈیکل دستاویز یا دوا اپلوڈ کریں۔',
      roman: 'Yeh picture ya video koi medical report, X-ray ya medicine ki photo nahi lagti. Baraye meherbani sahi medical image ya video upload karein.',
    },
    spoken: {
      en: "This doesn't appear to be a medical report, X-ray, or medicine photo. Please upload or capture the correct image or video.",
      ur: 'یہ تصویر یا ویڈیو کوئی میڈیکل رپورٹ، ایکسرے یا دوا کی تصویر معلوم نہیں ہوتی۔ برائے مہربانی درست میڈیکل دستاویز یا دوا اپلوڈ کریں۔',
      roman: 'Yeh picture ya video koi medical report, X-ray ya medicine ki photo nahi lagti. Baraye meherbani sahi medical image ya video upload karein.',
    },
  },
  not_medicine: {
    alert: {
      en: "This doesn't appear to be a medicine bottle, tablet strip, or prescription. Please capture or upload a clear medicine photo.",
      ur: 'یہ تصویر کسی دوا کی ڈبیا، پتی یا نسخہ معلوم نہیں ہوتی۔ برائے مہربانی دوا کی صاف تصویر اپلوڈ کریں۔',
      roman: 'Yeh picture kisi dawai ki packaging ya prescription nahi lagti. Baraye meherbani dawai ki saaf photo upload karein.',
    },
    spoken: {
      en: "This doesn't appear to be a medicine photo. Please capture or upload the correct medicine photo.",
      ur: 'یہ دوا کی تصویر معلوم نہیں ہوتی۔ برائے مہربانی دوا کی درست تصویر اپلوڈ کریں۔',
      roman: 'Yeh picture dawai ki nahi lagti. Baraye meherbani sahi dawai ki photo upload karein.',
    },
  },
  unclear_blurry: {
    alert: {
      en: "This image is too blurry or dark to read clearly. Please retake a clear, steady photo or video with good lighting.",
      ur: 'یہ تصویر بہت دھندلی یا اندھیرے میں ہے اور پڑھی نہیں جا رہی۔ برائے مہربانی اچھی روشنی میں صاف تصویر یا ویڈیو دوبارہ لیں۔',
      roman: 'Yeh picture bohat dhundli ya andheray mein hai. Baraye meherbani achi roshni mein saaf photo ya video dobara lein.',
    },
    spoken: {
      en: "This image is too blurry or dark to read. Please retake a clear photo or video with good lighting.",
      ur: 'یہ تصویر بہت دھندلی یا اندھیرے میں ہے۔ برائے مہربانی اچھی روشنی میں صاف تصویر دوبارہ لیں۔',
      roman: 'Yeh picture bohat dhundli hai. Baraye meherbani achi roshni mein saaf photo dobara lein.',
    },
  },
};
