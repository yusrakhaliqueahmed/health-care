import { VitalsReading, SugarTestTiming, SugarUnit, SupportedLanguage } from '../types';

export interface VitalsInputData {
  patientProfileId: string;
  patientName: string;
  patientAge?: string | number;
  hasDiabetesDiagnosis?: boolean;
  hasHypertensionDiagnosis?: boolean;
  // Specific requested test mode
  requestedMode?: 'all' | 'sugar' | 'bp' | 'heart';
  // Date & Day customization
  customDate?: string;
  customTimestamp?: number;
  dayOfWeek?: string;
  timeOfDay?: string;
  // Sugar
  sugarValue?: number;
  sugarUnit: SugarUnit;
  sugarTiming: SugarTestTiming;
  // BP
  systolic?: number;
  diastolic?: number;
  // Heart Rate
  heartRateBpm?: number;
  heartRateSource?: 'manual' | 'camera_sensor';
}

export interface DayInfo {
  dayEn: string;
  dayUr: string;
  dayRoman: string;
  fullDateStr: string;
}

export const DAYS_OF_WEEK: { key: string; en: string; ur: string; roman: string }[] = [
  { key: 'Saturday', en: 'Saturday', ur: 'ہفتہ', roman: 'Hafta (Saturday)' },
  { key: 'Sunday', en: 'Sunday', ur: 'اتوار', roman: 'Itwar (Sunday)' },
  { key: 'Monday', en: 'Monday', ur: 'پیر', roman: 'Peer (Monday)' },
  { key: 'Tuesday', en: 'Tuesday', ur: 'منگل', roman: 'Mangal (Tuesday)' },
  { key: 'Wednesday', en: 'Wednesday', ur: 'بدھ', roman: 'Budh (Wednesday)' },
  { key: 'Thursday', en: 'Thursday', ur: 'جمعرات', roman: 'Jumerat (Thursday)' },
  { key: 'Friday', en: 'Friday', ur: 'جمعہ', roman: 'Jummah (Friday)' },
];

export function getDayInfo(dateObj: Date = new Date()): DayInfo {
  const dayIndex = dateObj.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const dayMap: Record<number, { en: string; ur: string; roman: string }> = {
    0: { en: 'Sunday', ur: 'اتوار', roman: 'Itwar (Sunday)' },
    1: { en: 'Monday', ur: 'پیر', roman: 'Peer (Monday)' },
    2: { en: 'Tuesday', ur: 'منگل', roman: 'Mangal (Tuesday)' },
    3: { en: 'Wednesday', ur: 'بدھ', roman: 'Budh (Wednesday)' },
    4: { en: 'Thursday', ur: 'جمعرات', roman: 'Jumerat (Thursday)' },
    5: { en: 'Friday', ur: 'جمعہ', roman: 'Jummah (Friday)' },
    6: { en: 'Saturday', ur: 'ہفتہ', roman: 'Hafta (Saturday)' },
  };

  const dayData = dayMap[dayIndex] || { en: 'Today', ur: 'آج', roman: 'Aaj' };
  const fullDateStr = dateObj.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return {
    dayEn: dayData.en,
    dayUr: dayData.ur,
    dayRoman: dayData.roman,
    fullDateStr,
  };
}

export function convertSugarToMgDl(value: number, unit: SugarUnit): number {
  if (unit === 'mmol/L') {
    return Math.round(value * 18.018 * 10) / 10;
  }
  return value;
}

export function convertSugarFromMgDl(valueInMgDl: number, targetUnit: SugarUnit): number {
  if (targetUnit === 'mmol/L') {
    return Math.round((valueInMgDl / 18.018) * 10) / 10;
  }
  return valueInMgDl;
}

/**
 * Evaluates vitals with precision according to ADA (Diabetes) and AHA (Blood Pressure) guidelines.
 * Accurately analyzes single vitals (only sugar, only BP, or only heart rate) or all combined.
 */
export function evaluateVitals(input: VitalsInputData): VitalsReading {
  const {
    patientProfileId,
    patientName,
    patientAge,
    sugarValue,
    sugarUnit = 'mg/dL',
    sugarTiming = 'fasting',
    systolic,
    diastolic,
    heartRateBpm,
    heartRateSource = 'manual',
    hasDiabetesDiagnosis,
    hasHypertensionDiagnosis,
    requestedMode,
    customDate,
    customTimestamp,
    dayOfWeek,
    timeOfDay,
  } = input;

  const timestamp = customTimestamp || Date.now();
  const dateObj = new Date(timestamp);
  const detectedDay = getDayInfo(dateObj);

  const finalDayEn = dayOfWeek || detectedDay.dayEn;
  const dayMatch = DAYS_OF_WEEK.find((d) => d.en.toLowerCase() === finalDayEn.toLowerCase()) || {
    en: finalDayEn,
    ur: detectedDay.dayUr,
    roman: detectedDay.dayRoman,
  };

  const formattedDate = customDate || dateObj.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = timeOfDay || dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  let overallUrgency: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
  const issues: string[] = [];
  const lifestyleTips: string[] = [];

  const elevateUrgency = (level: 'YELLOW' | 'RED') => {
    if (level === 'RED') {
      overallUrgency = 'RED';
    } else if (overallUrgency === 'GREEN') {
      overallUrgency = 'YELLOW';
    }
  };

  // Determine actual vital type tested
  const hasSugar = sugarValue !== undefined && !isNaN(sugarValue) && sugarValue > 0;
  const hasBp = systolic !== undefined && diastolic !== undefined && systolic > 0 && diastolic > 0;
  const hasHr = heartRateBpm !== undefined && !isNaN(heartRateBpm) && heartRateBpm > 0;

  const vitalType: 'sugar' | 'bp' | 'heart_rate' | 'all' =
    requestedMode === 'sugar'
      ? 'sugar'
      : requestedMode === 'bp'
      ? 'bp'
      : requestedMode === 'heart'
      ? 'heart_rate'
      : hasSugar && hasBp
      ? 'all'
      : hasSugar
      ? 'sugar'
      : hasBp
      ? 'bp'
      : 'heart_rate';

  let sugarMgDl: number | undefined = undefined;
  if (hasSugar && sugarValue) {
    sugarMgDl = sugarTiming === 'hba1c' ? sugarValue : convertSugarToMgDl(sugarValue, sugarUnit);
  }

  // ==========================================
  // 1. BLOOD SUGAR CLINICAL EVALUATION (ADA Standards)
  // ==========================================
  let sugarCategory = 'Normal';
  let sugarCategoryUrdu = 'نارمل شوگر';
  let sugarCategoryRoman = 'Normal Sugar';
  let sugarUrgency: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
  let sugarSuggestionEn = '';
  let sugarSuggestionUrdu = '';
  let sugarSuggestionRoman = '';
  let sugarRefText = '';

  if (hasSugar && sugarMgDl !== undefined) {
    if (sugarTiming === 'hba1c') {
      sugarRefText = 'HbA1c Reference: Normal < 5.7% | Pre-diabetes: 5.7 - 6.4% | Diabetes: ≥ 6.5%';
      if (sugarMgDl >= 10.0 || sugarMgDl < 4.0) {
        sugarUrgency = 'RED';
        elevateUrgency('RED');
        sugarCategory = 'Critically Abnormal HbA1c';
        sugarCategoryUrdu = 'انتہائی خطرناک HbA1c';
        sugarCategoryRoman = 'Khatarnaak HbA1c';
        sugarSuggestionEn = 'Critically abnormal 3-month average glucose. High risk of microvascular complications. Urgent physician evaluation required.';
        sugarSuggestionUrdu = 'تین ماہ کا اوسط شوگر لیول خطرناک حد تک غیر متوازن ہے۔ اعصابی اور گردوں کی پیچیدگیوں سے بچاؤ کے لیے فوری ڈاکٹر سے رجوع کریں۔';
        sugarSuggestionRoman = '3 maah ki average sugar bohat zyada hai. Foran diabetologist ya physician ko dikhayein.';
        issues.push(`HbA1c of ${sugarMgDl}% is at a critically high level.`);
      } else if (sugarMgDl >= 6.5) {
        sugarUrgency = 'YELLOW';
        elevateUrgency('YELLOW');
        sugarCategory = 'Elevated HbA1c (Diabetic Range)';
        sugarCategoryUrdu = 'ہائی HbA1c (ذیابیطس کی حد)';
        sugarCategoryRoman = 'High HbA1c (Diabetes Range)';
        sugarSuggestionEn = 'HbA1c indicates persistent hyperglycemia over the past 90 days. Follow low-glycemic diet and consult a doctor for glycemic management.';
        sugarSuggestionUrdu = 'گزشتہ 90 دنوں کے دوران اوسط شوگر بلند رہی ہے۔ نشاستہ دار اور میٹھی غذاؤں سے سخت پرہیز اور ڈاکٹر کے مشورے سے ادویات کا جائزہ لیں۔';
        sugarSuggestionRoman = 'Guzishta 90 dino mein sugar high rahi hai. Parhez karein aur doctor se check karwayein.';
        issues.push(`HbA1c of ${sugarMgDl}% indicates elevated average glucose.`);
      } else if (sugarMgDl >= 5.7) {
        sugarUrgency = 'YELLOW';
        elevateUrgency('YELLOW');
        sugarCategory = 'Pre-diabetes HbA1c (Borderline)';
        sugarCategoryUrdu = 'پری ذیابیطس (بارڈر لائن)';
        sugarCategoryRoman = 'Pre-diabetes HbA1c';
        sugarSuggestionEn = 'Impaired glucose tolerance. 30 minutes daily brisk walking and cutting refined sugars can reverse this to normal.';
        sugarSuggestionUrdu = 'شوگر بارڈر لائن پر ہے۔ روزانہ 30 منٹ تیز چہل قدمی اور سفید چینی کا مکمل پرہیز اسے دوبارہ نارمل کر سکتا ہے۔';
        sugarSuggestionRoman = 'Sugar borderline par hai. Rozana 30 minute walk aur meethay se parhez karein.';
        issues.push(`HbA1c of ${sugarMgDl}% is slightly above normal.`);
      } else {
        sugarCategory = 'Optimal HbA1c';
        sugarCategoryUrdu = 'بہترین HbA1c (نارمل)';
        sugarCategoryRoman = 'Optimal HbA1c (Normal)';
        sugarSuggestionEn = 'Excellent long-term glucose control. Continue your healthy active lifestyle and balanced nutrition.';
        sugarSuggestionUrdu = 'ماشاءاللہ! تین ماہ کا اوسط شوگر لیول بالکل نارمل اور محفوظ ہے۔ اپنی متوازن خوراک جاری رکھیں۔';
        sugarSuggestionRoman = 'Shabash! Sugar level pichle 3 maah se bilkul normal aur stable hai.';
      }
    } else if (sugarTiming === 'fasting') {
      sugarRefText = 'Fasting Reference: Normal: 70 - 99 mg/dL | Impaired: 100 - 125 mg/dL | Diabetes: ≥ 126 mg/dL';
      if (sugarMgDl < 54) {
        sugarUrgency = 'RED';
        elevateUrgency('RED');
        sugarCategory = 'Severe Hypoglycemia (Critically Low)';
        sugarCategoryUrdu = 'خطرناک حد تک کم شوگر (ہائپوگلائسیمیا)';
        sugarCategoryRoman = 'Khatarnaak Had Tak Low Sugar';
        sugarSuggestionEn = 'Take 15-20g of fast-acting carbohydrates immediately (half glass juice, 3-4 candies, or sugar water). Re-check in 15 minutes. Call 1122 if fainting occurs.';
        sugarSuggestionUrdu = 'فوری طور پر آدھا گلاس شربت، جوس یا 3 عدد ٹافیاں لیں۔ 15 منٹ بعد دوبارہ چیک کریں۔ غنودگی کی صورت میں فوراً 1122 ملائیں۔';
        sugarSuggestionRoman = 'Foran meetha pani, juice ya 3 toffees lein. 15 minute baad dobara check karein.';
        issues.push(`Fasting sugar of ${sugarValue} ${sugarUnit} is dangerously low.`);
      } else if (sugarMgDl > 250) {
        sugarUrgency = 'RED';
        elevateUrgency('RED');
        sugarCategory = 'Severe Hyperglycemia (Critically High)';
        sugarCategoryUrdu = 'انتہائی بلند نہار منہ شوگر';
        sugarCategoryRoman = 'Bohat Zyada High Sugar';
        sugarSuggestionEn = 'Severe acute hyperglycemia. Drink plenty of water to prevent dehydration. Seek urgent medical attention or contact your physician.';
        sugarSuggestionUrdu = 'نہار منہ شوگر خطرناک حد تک زیادہ ہے۔ پانی زیادہ پئیں اور فوری ہسپتال یا اپنے معالج سے رجوع کریں۔';
        sugarSuggestionRoman = 'Fasting sugar bohat high hai. Paani zyada piyein aur doctor se check karwayein.';
        issues.push(`Fasting sugar of ${sugarValue} ${sugarUnit} is dangerously high.`);
      } else if (sugarMgDl >= 126) {
        sugarUrgency = 'YELLOW';
        elevateUrgency('YELLOW');
        sugarCategory = 'High Fasting Sugar (Diabetic Range)';
        sugarCategoryUrdu = 'ہائی نہار منہ شوگر';
        sugarCategoryRoman = 'High Fasting Sugar';
        sugarSuggestionEn = 'Elevated fasting glucose. Avoid refined carbs, sweets, white bread, and sugary tea. Request a fasting lab confirmation and HbA1c.';
        sugarSuggestionUrdu = 'نہار منہ شوگر معمول سے زیادہ ہے۔ میٹھی چائے، بیکری آئٹمز اور سفید آٹے سے پرہیز فرمائیں اور ڈاکٹر کو رپورٹ دکھائیں۔';
        sugarSuggestionRoman = 'Fasting sugar normal se zyada hai. Meethi chai aur bakery se parhez karein.';
        issues.push(`Fasting sugar of ${sugarValue} ${sugarUnit} is in diabetic range (≥126 mg/dL).`);
      } else if (sugarMgDl >= 100) {
        sugarUrgency = 'YELLOW';
        elevateUrgency('YELLOW');
        sugarCategory = 'Impaired Fasting Glucose (Borderline)';
        sugarCategoryUrdu = 'بارڈر لائن نہار منہ شوگر (پری ذیابیطس)';
        sugarCategoryRoman = 'Borderline Fasting Sugar';
        sugarSuggestionEn = 'Early warning indicator (Pre-diabetes). Regular morning brisk walks (30 min) and low carbohydrate meals can successfully normalize your glucose.';
        sugarSuggestionUrdu = 'شوگر کی ابتدائی علامات (بارڈر لائن) ہیں۔ صبح کی 30 منٹ چہل قدمی اور چکنائی و میٹھے میں اعتدال سے یہ معمول پر آ سکتی ہے۔';
        sugarSuggestionRoman = 'Sugar borderline hai. Subah ki sair aur halki ghiza se control ho sakti hai.';
        issues.push(`Fasting sugar of ${sugarValue} ${sugarUnit} is slightly high (100-125 mg/dL).`);
      } else if (sugarMgDl < 70) {
        sugarUrgency = 'YELLOW';
        elevateUrgency('YELLOW');
        sugarCategory = 'Mild Low Sugar';
        sugarCategoryUrdu = 'ہلکی کم شوگر';
        sugarCategoryRoman = 'Mamooli Low Sugar';
        sugarSuggestionEn = 'Slightly low fasting glucose. Have your breakfast promptly. Avoid delaying meals when active.';
        sugarSuggestionUrdu = 'نہار منہ شوگر قدرے کم ہے۔ بروقت ناشتہ فرمائیں اور بھوکے پیٹ بھاری مشقت سے گریز کریں۔';
        sugarSuggestionRoman = 'Sugar thodi low hai. Foran sehat-mand nashta karein.';
        issues.push(`Fasting sugar of ${sugarValue} ${sugarUnit} is lower than 70 mg/dL.`);
      } else {
        sugarCategory = 'Normal Fasting Sugar';
        sugarCategoryUrdu = 'نارمل نہار منہ شوگر (متوازن)';
        sugarCategoryRoman = 'Normal Fasting Sugar';
        sugarSuggestionEn = 'Your fasting blood glucose is in the optimal healthy range (70-99 mg/dL). Keep up your balanced meal timings.';
        sugarSuggestionUrdu = 'ماشاءاللہ! آپ کی نہار منہ شوگر بالکل نارمل اور متوازن (70 تا 99 mg/dL) ہے۔ اپنا معمول برقرار رکھیں۔';
        sugarSuggestionRoman = 'Zabardast! Fasting sugar bilkul perfect aur normal range mein hai.';
      }
    } else {
      // Random or Post-Meal
      sugarRefText = 'Post-Meal / Random Reference: Normal < 140 mg/dL | Impaired: 140 - 199 mg/dL | High: ≥ 200 mg/dL';
      if (sugarMgDl < 54) {
        sugarUrgency = 'RED';
        elevateUrgency('RED');
        sugarCategory = 'Severe Hypoglycemia (Critically Low)';
        sugarCategoryUrdu = 'خطرناک حد تک کم شوگر';
        sugarCategoryRoman = 'Severe Low Sugar';
        sugarSuggestionEn = 'Urgent: Consume 15g sugar/juice now. Risk of dizziness or syncope. Re-check in 15 minutes.';
        sugarSuggestionUrdu = 'فوری طور پر میٹھا شربت یا گلوکوز لیں۔ چکر آنے اور غشی کا خطرہ ہے۔ 15 منٹ بعد دوبارہ چیک کریں۔';
        sugarSuggestionRoman = 'Foran meetha lein. Chakar ya behoshi ka khatra hai. 15 min baad dobara check karein.';
        issues.push(`Blood sugar of ${sugarValue} ${sugarUnit} is dangerously low.`);
      } else if (sugarMgDl > 300) {
        sugarUrgency = 'RED';
        elevateUrgency('RED');
        sugarCategory = 'Severe Hyperglycemia (Critically High)';
        sugarCategoryUrdu = 'انتہائی بلند شوگر';
        sugarCategoryRoman = 'Khatarnaak High Sugar';
        sugarSuggestionEn = 'Blood sugar is dangerously elevated. Hydrate with water. Contact emergency or medical doctor for urgent management.';
        sugarSuggestionUrdu = 'شوگر 300 سے زیادہ ہے جو خطرناک ہے۔ کثرت سے پانی پئیں اور فوری قریبی معالج کو دکھائیں۔';
        sugarSuggestionRoman = 'Sugar 300 se upar hai jo shadeed khatarnaak hai. Foran doctor se rabta karein.';
        issues.push(`Blood sugar of ${sugarValue} ${sugarUnit} is dangerously high.`);
      } else if (sugarMgDl >= 200) {
        sugarUrgency = 'YELLOW';
        elevateUrgency('YELLOW');
        sugarCategory = 'High Blood Sugar (Hyperglycemia)';
        sugarCategoryUrdu = 'ہائی بلڈ شوگر';
        sugarCategoryRoman = 'High Blood Sugar';
        sugarSuggestionEn = 'Reading is 200+ mg/dL. Rest, drink water, avoid carbohydrates and sweet chai. Consult a physician.';
        sugarSuggestionUrdu = 'شوگر 200 سے زائد ہے۔ میٹھے مشروبات اور چاول سے پرہیز کریں، پانی پئیں اور معالج سے دوا ایڈجسٹ کروائیں۔';
        sugarSuggestionRoman = 'Sugar 200 se zyada hai. Meethay se parhez karein aur doctor ko check karwayein.';
        issues.push(`Blood sugar of ${sugarValue} ${sugarUnit} is elevated (≥ 200 mg/dL).`);
      } else if (sugarMgDl >= 140) {
        sugarUrgency = 'YELLOW';
        elevateUrgency('YELLOW');
        sugarCategory = 'Borderline Elevated Sugar';
        sugarCategoryUrdu = 'قدرے بلند شوگر (بارڈر لائن)';
        sugarCategoryRoman = 'Borderline Elevated Sugar';
        sugarSuggestionEn = 'Slightly high post-meal reading (140-199 mg/dL). Take a 15-minute gentle walk after meals to help clear glucose.';
        sugarSuggestionUrdu = 'کھانے کے بعد شوگر معمولی سی بلند ہے۔ کھانے کے بعد 15 منٹ ہلکی واک معمول بنائیں، اس سے شوگر قابو میں رہتی ہے۔';
        sugarSuggestionRoman = 'Khanay ke baad sugar thodi high hai. Khanay ke baad 15 minute walk kiya karein.';
        issues.push(`Blood sugar of ${sugarValue} ${sugarUnit} is slightly above 140 mg/dL.`);
      } else if (sugarMgDl < 70) {
        sugarUrgency = 'YELLOW';
        elevateUrgency('YELLOW');
        sugarCategory = 'Mild Low Sugar';
        sugarCategoryUrdu = 'ہلکی کم شوگر';
        sugarCategoryRoman = 'Mamooli Low Sugar';
        sugarSuggestionEn = 'Blood sugar is lower than 70 mg/dL. Eat a balanced snack (nuts, fruit, or small meal) to stabilize.';
        sugarSuggestionUrdu = 'شوگر 70 سے کم ہے۔ فوری ہلکی غذا یا پھل کھائیں تاکہ کمزوری نہ ہو۔';
        sugarSuggestionRoman = 'Sugar 70 se kam hai. Kuch halka-phulka kha lein.';
        issues.push(`Blood sugar of ${sugarValue} ${sugarUnit} is lower than 70 mg/dL.`);
      } else {
        sugarCategory = 'Normal Blood Sugar';
        sugarCategoryUrdu = 'نارمل بلڈ شوگر (متوازن)';
        sugarCategoryRoman = 'Normal Blood Sugar';
        sugarSuggestionEn = 'Post-meal / Random glucose is within healthy limits (< 140 mg/dL). Excellent digestive glycemic response!';
        sugarSuggestionUrdu = 'ماشاءاللہ! کھانے کے بعد شوگر کی مقدار نارمل حدود (140 سے کم) میں ہے۔ خوراک اور روٹین بہترین ہے۔';
        sugarSuggestionRoman = 'Bohat achhi baat hai! Sugar ki reading bilkul normal (< 140) hai.';
      }
    }
  }

  // ==========================================
  // 2. BLOOD PRESSURE CLINICAL EVALUATION (AHA Guidelines)
  // ==========================================
  let bpCategory = 'Normal';
  let bpCategoryUrdu = 'نارمل بلڈ پریشر';
  let bpCategoryRoman = 'Normal BP';
  let bpUrgency: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
  let bpSuggestionEn = '';
  let bpSuggestionUrdu = '';
  let bpSuggestionRoman = '';
  const bpRefText = 'AHA BP Reference: Normal: <120/<80 mmHg | Elevated: 120-129/<80 | Stage 1: 130-139/80-89 | Stage 2: ≥140/≥90 | Crisis: >180/>120';

  if (hasBp && systolic !== undefined && diastolic !== undefined) {
    if (systolic >= 180 || diastolic >= 120) {
      bpUrgency = 'RED';
      elevateUrgency('RED');
      bpCategory = 'Hypertensive Crisis (Critically High)';
      bpCategoryUrdu = 'ہائپرٹینشن کرائسس (انتہائی خطرناک بی پی)';
      bpCategoryRoman = 'Hypertensive Crisis (Khatarnaak BP)';
      bpSuggestionEn = 'Medical Emergency! Blood pressure >180/>120 puts critical stress on brain and heart. Rest quietly and call 1122 or proceed to Emergency immediately.';
      bpSuggestionUrdu = 'طبی ایمرجنسی! بی پی 180/120 سے زائد ہونا دل اور دماغ کے لیے خطرہ ہے۔ خاموشی سے بیٹھ جائیں اور فوری 1122 کال کریں یا ہسپتال جائیں۔';
      bpSuggestionRoman = 'Emergency alert! BP 180/120 se zyada hai. Foran araam se baith jayein aur Rescue 1122 ya hospital jayein.';
      issues.push(`Blood pressure ${systolic}/${diastolic} mmHg is in the hypertensive crisis zone.`);
    } else if (systolic < 90 || diastolic < 60) {
      bpUrgency = 'RED';
      elevateUrgency('RED');
      bpCategory = 'Hypotension (Critically Low BP)';
      bpCategoryUrdu = 'لو بلڈ پریشر (خطرناک حد تک کم)';
      bpCategoryRoman = 'Low Blood Pressure (Hypotension)';
      bpSuggestionEn = 'Blood pressure is critically low. Lie down flat and elevate legs above heart level. Drink ORS or salted lemonade. Seek emergency help if feeling faint.';
      bpSuggestionUrdu = 'بلڈ پریشر خطرناک حد تک گر گیا ہے۔ سیدھے لیٹ کر پاؤں اونچے کریں۔ او آر ایس یا ہلکا نمکین لیموں پانی پئیں۔ غشی کی صورت میں فوراً معالج کو دکھائیں۔';
      bpSuggestionRoman = 'BP shadeed low hai. Seedhe lait kar taangein ooper karein aur ORS ya halka namkeen paani piyein.';
      issues.push(`Blood pressure ${systolic}/${diastolic} mmHg is lower than standard safe limits.`);
    } else if (systolic >= 140 || diastolic >= 90) {
      bpUrgency = 'YELLOW';
      elevateUrgency('YELLOW');
      bpCategory = 'Stage 2 Hypertension';
      bpCategoryUrdu = 'اسٹیج 2 ہائی بلڈ پریشر';
      bpCategoryRoman = 'Stage 2 High BP';
      bpSuggestionEn = 'Significantly high blood pressure. Strictly cut sodium/salt (avoid pickles, salty fried items, processed snacks). Schedule a doctor visit for BP evaluation.';
      bpSuggestionUrdu = 'بلڈ پریشر واضح طور پر بلند ہے۔ سالن میں نمک کم کریں، اچار، پاپڑ اور نمکین تلی ہوئی اشیاء سے سخت پرہیز فرمائیں اور ڈاکٹر کو چیک کروائیں۔';
      bpSuggestionRoman = 'BP high hai (Stage 2). Namak bilkul kam karein, achar aur fried cheezon se parhez karein aur doctor ko dikhayein.';
      issues.push(`Blood pressure ${systolic}/${diastolic} mmHg is significantly high.`);
    } else if (systolic >= 130 || diastolic >= 80) {
      bpUrgency = 'YELLOW';
      elevateUrgency('YELLOW');
      bpCategory = 'Stage 1 Hypertension';
      bpCategoryUrdu = 'اسٹیج 1 ہائی بلڈ پریشر (بلند)';
      bpCategoryRoman = 'Stage 1 High BP';
      bpSuggestionEn = 'Blood pressure is elevated above 130/80 mmHg. Adopt the DASH diet (high potassium, green vegetables, low salt), reduce stress, and re-check regularly.';
      bpSuggestionUrdu = 'بلڈ پریشر 130/80 سے قدرے بلند ہے۔ غذا میں پوٹاشیم (تازہ سبزیاں، کیلا) شامل کریں، نمک محدود کریں، اور روزانہ پرسکون واک کریں۔';
      bpSuggestionRoman = 'BP 130/80 se thoda sa zyada hai. Namak kam karein aur rozana 30 minute halki walk karein.';
      issues.push(`Blood pressure ${systolic}/${diastolic} mmHg is in Stage 1 hypertension range.`);
    } else if (systolic >= 120 && diastolic < 80) {
      bpUrgency = 'YELLOW';
      elevateUrgency('YELLOW');
      bpCategory = 'Elevated Blood Pressure';
      bpCategoryUrdu = 'معمولی بڑھا ہوا بلڈ پریشر';
      bpCategoryRoman = 'Mamooli Barha Hua BP';
      bpSuggestionEn = 'Systolic is slightly elevated (120-129 mmHg). Maintain a healthy weight, limit caffeine/tea, and practice deep breathing.';
      bpSuggestionUrdu = 'اوپر والا بی پی قدرے بڑھا ہوا ہے۔ چائے اور کیفین کم کریں، گہرے سانس کی ورزش کریں اور متوازن غذا جاری رکھیں۔';
      bpSuggestionRoman = 'BP mamooli sa upar hai. Chai kam karein aur pur-sukoon rahein.';
      issues.push(`Systolic blood pressure of ${systolic} mmHg is slightly elevated.`);
    } else {
      bpCategory = 'Optimal Normal Blood Pressure';
      bpCategoryUrdu = 'بہترین نارمل بلڈ پریشر (متوازن)';
      bpCategoryRoman = 'Optimal Normal BP';
      bpSuggestionEn = 'Your blood pressure is in the ideal healthy range (< 120/80 mmHg). Excellent cardiovascular health!';
      bpSuggestionUrdu = 'ماشاءاللہ! آپ کا بلڈ پریشر مثالی اور بہترین نارمل حد (120/80 سے کم) میں ہے۔ دل اور رگوں کی صحت زبردست ہے۔';
      bpSuggestionRoman = 'Shabash! Aap ka blood pressure bilkul ideal aur normal (< 120/80) chal raha hai.';
    }
  }

  // ==========================================
  // 3. HEART RATE / PULSE CLINICAL EVALUATION
  // ==========================================
  let hrCategory = 'Normal';
  let hrCategoryUrdu = 'نارمل نبض / دھڑکن';
  let hrCategoryRoman = 'Normal Heart Rate';
  let hrUrgency: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
  let hrSuggestionEn = '';
  let hrSuggestionUrdu = '';
  let hrSuggestionRoman = '';
  const hrRefText = 'Adult Resting Pulse Reference: 60 - 100 Beats Per Minute (BPM)';

  if (hasHr && heartRateBpm !== undefined) {
    if (heartRateBpm >= 130) {
      hrUrgency = 'RED';
      elevateUrgency('RED');
      hrCategory = 'Severe Tachycardia (Critically Rapid)';
      hrCategoryUrdu = 'انتہائی تیز نبض (خطرناک ٹیکیکارڈیا)';
      hrCategoryRoman = 'Shadeed Taiz Dharkan';
      hrSuggestionEn = 'Resting heart rate >130 BPM is dangerously rapid. Sit down, take slow deep breaths, avoid caffeine. Seek immediate medical emergency evaluation.';
      hrSuggestionUrdu = 'آرام کی حالت میں نبض 130 سے تیز ہونا خطرناک ہے۔ پرسکون بیٹھ کر گہرے سانس لیں اور فوری قریبی ایمرجنسی چیک اپ کروائیں۔';
      hrSuggestionRoman = 'Dil ki dharkan 130 se zyada taiz hai. Foran aaraam karein aur emergency doctor ko check karwayein.';
      issues.push(`Resting heart rate of ${heartRateBpm} BPM is critically rapid.`);
    } else if (heartRateBpm < 50) {
      hrUrgency = 'RED';
      elevateUrgency('RED');
      hrCategory = 'Severe Bradycardia (Critically Slow)';
      hrCategoryUrdu = 'انتہائی سست نبض (بریڈی کارڈیا)';
      hrCategoryRoman = 'Shadeed Sust Dharkan';
      hrSuggestionEn = 'Heart rate is severely low (<50 BPM). If accompanied by dizziness, shortness of breath, or fatigue, seek immediate medical care.';
      hrSuggestionUrdu = 'دل کی دھڑکن 50 سے کم ہے۔ اگر چکر آنا یا سانس پھولنا محسوس ہو تو فوری ڈاکٹر سے رجوع کریں۔';
      hrSuggestionRoman = 'Pulse 50 se kam hai. Agar kamzori ya chakar aayein to foran hospital check karwayein.';
      issues.push(`Resting heart rate of ${heartRateBpm} BPM is critically slow.`);
    } else if (heartRateBpm > 100) {
      hrUrgency = 'YELLOW';
      elevateUrgency('YELLOW');
      hrCategory = 'Mild Tachycardia (Elevated Pulse)';
      hrCategoryUrdu = 'تیز نبض (معمولی ٹیکیکارڈیا)';
      hrCategoryRoman = 'Taiz Pulse (Mild Tachycardia)';
      hrSuggestionEn = 'Heart rate is elevated (>100 BPM). Ensure adequate hydration with cool water, rest in a cool room, avoid stress, energy drinks, and tobacco.';
      hrSuggestionUrdu = 'نبض 100 سے زیادہ تیز ہے۔ پانی زیادہ پئیں، پرسکون ماحول میں آرام فرمائیں، سگریٹ نوشی اور انرجی ڈرنکس سے پرہیز کریں۔';
      hrSuggestionRoman = 'Pulse 100 se thodi taiz hai. Paani piyein, thandi jagah aaraam karein aur chai/coffee kam karein.';
      issues.push(`Pulse of ${heartRateBpm} BPM is slightly elevated above 100 BPM.`);
    } else if (heartRateBpm < 60) {
      hrUrgency = 'YELLOW';
      elevateUrgency('YELLOW');
      hrCategory = 'Mild Bradycardia (Slow Pulse)';
      hrCategoryUrdu = 'ہلکی سست نبض';
      hrCategoryRoman = 'Mild Slow Pulse';
      hrSuggestionEn = 'Pulse is below 60 BPM. Common in athletes, but monitor for fatigue or lightheadedness.';
      hrSuggestionUrdu = 'نبض 60 سے قدرے کم ہے۔ کھلاڑیوں میں یہ عام ہے، تاہم اگر سستی یا غنودگی ہو تو ڈاکٹر کو بتائیں۔';
      hrSuggestionRoman = 'Pulse 60 se thodi kam hai. Agar chakar na aayein to aam tor par theek hota hai.';
      issues.push(`Pulse of ${heartRateBpm} BPM is slightly below 60 BPM.`);
    } else {
      hrCategory = 'Normal Resting Heart Rate';
      hrCategoryUrdu = 'نارمل نبض (60 تا 100 بی پی ایم)';
      hrCategoryRoman = 'Normal Resting Heart Rate';
      hrSuggestionEn = 'Pulse rate is steady and healthy (60-100 BPM). Normal sinus rhythm.';
      hrSuggestionUrdu = 'ماشاءاللہ! دل کی دھڑکن کی رفتار بالکل نارمل، ہموار اور متوازن ہے۔';
      hrSuggestionRoman = 'Aap ki pulse bilkul theek aur normal chal rahi hai.';
    }
  }

  // ==========================================
  // LIFESTYLE & GENERAL GUIDANCE SYNTHESIS
  // ==========================================
  if (overallUrgency === 'GREEN') {
    lifestyleTips.push('Drink 8-10 glasses of clean water daily to support kidney function and blood pressure balance.');
    lifestyleTips.push('Maintain 30 minutes of brisk walking or active movement 5 days a week.');
    lifestyleTips.push('Prioritize whole grains, pulses (daal), fresh seasonal salads, and home-cooked balanced meals.');
  } else if (overallUrgency === 'YELLOW') {
    if (hasBp && systolic && systolic >= 120) {
      lifestyleTips.push('Strictly control table salt: avoid salty chatni, pickles (achar), and processed savory snacks.');
    }
    if (hasSugar && sugarMgDl && sugarMgDl >= 100) {
      lifestyleTips.push('Eliminate table sugar, sweets, sweetened tea, and refined bakery flour.');
    }
    if (hasHr && heartRateBpm && heartRateBpm > 100) {
      lifestyleTips.push('Rest in a calm, ventilated environment and avoid caffeine, tobacco, or stress triggers.');
    }
    lifestyleTips.push('Re-check your readings at the same time tomorrow to track daily trend.');
  } else {
    lifestyleTips.push('IMMEDIATE MEDICAL ALERT: Do NOT engage in physical exertion. Sit or lie comfortably.');
    lifestyleTips.push('Do NOT take unprescribed emergency medicines. Call 1122 or proceed to nearest hospital emergency.');
  }

  // ==========================================
  // TITLE & MULTILINGUAL STRINGS TAILORED TO MODE
  // ==========================================
  let title = 'Vitals Health Assessment';
  let interpEn = '';
  let interpUr = '';
  let interpRoman = '';
  let guideEn = '';
  let guideUr = '';
  let guideRoman = '';

  if (vitalType === 'sugar') {
    title = `Blood Sugar Report: ${sugarCategory}`;
    interpEn = `Blood Sugar Reading: ${sugarValue} ${sugarUnit} (${sugarTiming}). Status: ${sugarCategory}. ${sugarSuggestionEn}`;
    interpUr = `بلڈ شوگر ٹیسٹ رپورٹ: ${sugarValue} ${sugarUnit} (${sugarTiming === 'fasting' ? 'نہار منہ' : sugarTiming === 'post_meal' ? 'کھانے کے بعد' : sugarTiming === 'hba1c' ? 'HbA1c' : 'رینڈم'})۔ نتیجہ: ${sugarCategoryUrdu}۔ ${sugarSuggestionUrdu}`;
    interpRoman = `Sugar Reading: ${sugarValue} ${sugarUnit} (${sugarTiming}). Nateeja: ${sugarCategoryRoman}. ${sugarSuggestionRoman}`;

    guideEn = overallUrgency === 'GREEN'
      ? 'Your sugar level is healthy and stable. Keep tracking your fasting and post-meal levels periodically.'
      : overallUrgency === 'YELLOW'
      ? 'Dietary discipline and lifestyle habits are crucial. Consider booking a lab test or physician review if this persists.'
      : 'Immediate action required. High/low sugar can lead to metabolic emergency. Contact medical doctor.';

    guideUr = overallUrgency === 'GREEN'
      ? 'آپ کی شوگر محفوظ اور نارمل حد میں ہے۔ باقاعدگی سے نگرانی جاری رکھیں۔'
      : overallUrgency === 'YELLOW'
      ? 'خوراک اور واک پر توجہ دیں۔ اے آئی ادویات تجویز نہیں کر سکتی، ضرورت پڑنے پر ڈاکٹر سے رابطہ فرمائیں۔'
      : 'فوری توجہ فرمائیں۔ شوگر کا انتہائی اتار چڑھاؤ خطرناک ہو سکتا ہے، فوراً ہسپتال جائیں۔';

    guideRoman = overallUrgency === 'GREEN'
      ? 'Aap ki sugar bilkul theek hai. Apni sehat-mand ghiza jari rakhein.'
      : overallUrgency === 'YELLOW'
      ? 'Meethay se parhez karein aur agar barha rahe to doctor ko dikhayein.'
      : 'Emergency alert! Sugar shadeed abnormal hai, foran hospital jayein.';
  } else if (vitalType === 'bp') {
    title = `Blood Pressure Assessment: ${bpCategory}`;
    interpEn = `Blood Pressure: ${systolic}/${diastolic} mmHg. Status: ${bpCategory}. ${bpSuggestionEn}`;
    interpUr = `بلڈ پریشر کی رپورٹ: ${systolic}/${diastolic} mmHg۔ نتیجہ: ${bpCategoryUrdu}۔ ${bpSuggestionUrdu}`;
    interpRoman = `Blood Pressure: ${systolic}/${diastolic} mmHg. Nateeja: ${bpCategoryRoman}. ${bpSuggestionRoman}`;

    guideEn = overallUrgency === 'GREEN'
      ? 'Your blood pressure is optimal. Continue heart-healthy habits (low salt, regular walking).'
      : overallUrgency === 'YELLOW'
      ? 'Blood pressure is elevated. Reduce sodium, manage stress, and track morning and evening readings.'
      : 'CRITICAL HYPERTENSIVE ALERT: Do not delay. Contact Rescue 1122 or nearest emergency department.';

    guideUr = overallUrgency === 'GREEN'
      ? 'آپ کا بلڈ پریشر بالکل مثالی ہے۔ کم نمک اور روزانہ واک کی عادت جاری رکھیں۔'
      : overallUrgency === 'YELLOW'
      ? 'بلڈ پریشر معمول سے زیادہ ہے۔ نمک کم فرمائیں اور چند دن مسلسل صبح شام کا ریکارڈ نوٹ کریں۔'
      : '🚨 ہنگامی الرٹ: بی پی انتہائی زیادہ ہے۔ تاخیر نہ فرمائیں، فوری 1122 یا قریبی ہسپتال پہنچیں۔';

    guideRoman = overallUrgency === 'GREEN'
      ? 'Aap ka blood pressure normal hai. Namak kam aur walk jari rakhein.'
      : overallUrgency === 'YELLOW'
      ? 'BP barha hua hai. Namak kam karein aur subah shaam ka record note karein.'
      : 'Emergency! BP bohat zyada hai, foran hospital jayein.';
  } else if (vitalType === 'heart_rate') {
    title = `Heart Rate & Pulse Report: ${hrCategory}`;
    interpEn = `Pulse: ${heartRateBpm} BPM. Status: ${hrCategory}. ${hrSuggestionEn}`;
    interpUr = `دل کی دھڑکن اور نبض کی رپورٹ: ${heartRateBpm} BPM۔ نتیجہ: ${hrCategoryUrdu}۔ ${hrSuggestionUrdu}`;
    interpRoman = `Pulse: ${heartRateBpm} BPM. Nateeja: ${hrCategoryRoman}. ${hrSuggestionRoman}`;

    guideEn = overallUrgency === 'GREEN'
      ? 'Steady resting heart rate. Indicates good physical endurance and cardiovascular balance.'
      : overallUrgency === 'YELLOW'
      ? 'Pulse is outside standard resting bounds. Rest quietly, hydrate, and re-check in 30 minutes.'
      : 'Severe tachycardia/bradycardia. Immediate clinical cardiac evaluation advised.';

    guideUr = overallUrgency === 'GREEN'
      ? 'نبض کی رفتار بالکل متوازن اور صحت مند ہے۔'
      : overallUrgency === 'YELLOW'
      ? 'نبض معمول سے قدرے مختلف ہے۔ ٹھنڈے پانی کے گھونٹ لیں اور پرسکون ہو کر دوبارہ چیک کریں۔'
      : '🚨 دل کی دھڑکن خطرناک حد تک تیز یا سست ہے۔ فوری طبی معائنہ کروائیں۔';

    guideRoman = overallUrgency === 'GREEN'
      ? 'Pulse bilkul normal chal rahi hai.'
      : overallUrgency === 'YELLOW'
      ? 'Pulse thodi abnormal hai. Aaraam karein aur paani piyein.'
      : 'Emergency! Dil ki dharkan khatarnaak had tak abnormal hai.';
  } else {
    // All vitals
    title = overallUrgency === 'GREEN'
      ? 'All Recorded Vitals Within Normal Limits'
      : overallUrgency === 'YELLOW'
      ? 'Borderline / Elevated Vitals Detected'
      : '🚨 Critically Abnormal Vitals — Immediate Action Advised';

    const partsEn: string[] = [];
    const partsUr: string[] = [];
    const partsRoman: string[] = [];

    if (hasSugar) {
      partsEn.push(`Sugar: ${sugarValue} ${sugarUnit} (${sugarCategory})`);
      partsUr.push(`شوگر: ${sugarValue} ${sugarUnit} (${sugarCategoryUrdu})`);
      partsRoman.push(`Sugar: ${sugarValue} ${sugarUnit} (${sugarCategoryRoman})`);
    }
    if (hasBp) {
      partsEn.push(`BP: ${systolic}/${diastolic} mmHg (${bpCategory})`);
      partsUr.push(`بی پی: ${systolic}/${diastolic} mmHg (${bpCategoryUrdu})`);
      partsRoman.push(`BP: ${systolic}/${diastolic} mmHg (${bpCategoryRoman})`);
    }
    if (hasHr) {
      partsEn.push(`Pulse: ${heartRateBpm} BPM (${hrCategory})`);
      partsUr.push(`نبض: ${heartRateBpm} BPM (${hrCategoryUrdu})`);
      partsRoman.push(`Pulse: ${heartRateBpm} BPM (${hrCategoryRoman})`);
    }

    interpEn = partsEn.join(' | ');
    interpUr = partsUr.join(' • ');
    interpRoman = partsRoman.join(' | ');

    guideEn = overallUrgency === 'GREEN'
      ? 'All checked vitals are in optimal ranges. Excellent cardiovascular and metabolic control.'
      : overallUrgency === 'YELLOW'
      ? 'One or more readings are borderline/elevated. Review dietary salt and sugar, rest, and monitor continuously.'
      : 'Severe clinical abnormality detected. Proceed immediately to emergency care or call 1122.';

    guideUr = overallUrgency === 'GREEN'
      ? 'ماشاءاللہ! تمام چیک کیے گئے وائٹلز محفوظ اور نارمل حدود میں ہیں۔'
      : overallUrgency === 'YELLOW'
      ? 'ایک یا زائد ریڈنگز میں اتار چڑھاؤ ہے۔ نمک اور میٹھے میں پرہیز فرمائیں اور نگاہ رکھیں۔'
      : '🚨 ریڈنگز خطرناک حد تک غیر متوازن ہیں۔ فوری 1122 یا قریبی ہسپتال تشریف لے جائیں۔';

    guideRoman = overallUrgency === 'GREEN'
      ? 'Tamaam vitals normal hain. Shabash!'
      : overallUrgency === 'YELLOW'
      ? 'Kuch readings abnormal hain. Parhez karein aur nigrani rakhein.'
      : 'Emergency alert! Foran hospital jayein ya 1122 milayein.';
  }

  // Combined Reference Ranges
  const activeRefs: string[] = [];
  if (hasSugar) activeRefs.push(sugarRefText);
  if (hasBp) activeRefs.push(bpRefText);
  if (hasHr) activeRefs.push(hrRefText);

  return {
    id: `vital-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    patientProfileId,
    patientName,
    patientAge: String(patientAge || '35'),
    date: formattedDate,
    timestamp,
    dayOfWeek: finalDayEn,
    dayNameUrdu: dayMatch.ur,
    dayNameRoman: dayMatch.roman,
    timeOfDay: formattedTime,
    vitalType,
    sugarValue: hasSugar ? sugarValue : undefined,
    sugarUnit: hasSugar ? sugarUnit : undefined,
    sugarTiming: hasSugar ? sugarTiming : undefined,
    systolic: hasBp ? systolic : undefined,
    diastolic: hasBp ? diastolic : undefined,
    heartRateBpm: hasHr ? heartRateBpm : undefined,
    heartRateSource,
    sugarStatus: hasSugar ? {
      category: sugarCategory,
      categoryUrdu: sugarCategoryUrdu,
      categoryRoman: sugarCategoryRoman,
      urgency: sugarUrgency,
      suggestion: sugarSuggestionEn,
      suggestionUrdu: sugarSuggestionUrdu,
      suggestionRoman: sugarSuggestionRoman,
    } : undefined,
    bpStatus: hasBp ? {
      category: bpCategory,
      categoryUrdu: bpCategoryUrdu,
      categoryRoman: bpCategoryRoman,
      urgency: bpUrgency,
      suggestion: bpSuggestionEn,
      suggestionUrdu: bpSuggestionUrdu,
      suggestionRoman: bpSuggestionRoman,
    } : undefined,
    heartRateStatus: hasHr ? {
      category: hrCategory,
      categoryUrdu: hrCategoryUrdu,
      categoryRoman: hrCategoryRoman,
      urgency: hrUrgency,
      suggestion: hrSuggestionEn,
      suggestionUrdu: hrSuggestionUrdu,
      suggestionRoman: hrSuggestionRoman,
    } : undefined,
    dailyDoctorSummary: {
      en: `${finalDayEn} Clinical Overview: ${hasSugar ? `Sugar ${sugarValue} ${sugarUnit} (${sugarCategory}). ` : ''}${hasBp ? `BP ${systolic}/${diastolic} mmHg (${bpCategory}). ` : ''}${hasHr ? `Pulse ${heartRateBpm} BPM. ` : ''}`,
      ur: `${dayMatch.ur} کا طبی جائزہ: ${hasSugar ? `شوگر ${sugarValue} ${sugarUnit} (${sugarCategoryUrdu})۔ ` : ''}${hasBp ? `بی پی ${systolic}/${diastolic} mmHg (${bpCategoryUrdu})۔ ` : ''}${hasHr ? `نبض ${heartRateBpm} BPM (${hrCategoryUrdu})۔ ` : ''}`,
      roman: `${dayMatch.roman} ka Jaiza: ${hasSugar ? `Sugar ${sugarValue} ${sugarUnit}. ` : ''}${hasBp ? `BP ${systolic}/${diastolic} mmHg. ` : ''}${hasHr ? `Pulse ${heartRateBpm} BPM. ` : ''}`,
    },
    urgency: overallUrgency,
    categoryTitle: title,
    referenceRangeText: activeRefs.join(' • '),
    interpretationText: {
      en: interpEn,
      ur: interpUr,
      roman: interpRoman,
    },
    guidanceText: {
      en: guideEn,
      ur: guideUr,
      roman: guideRoman,
    },
    lifestyleTips,
    isDoctorReviewed: false,
  };
}

/**
 * Generates an authentic, structured week of day-by-day records (Saturday to Friday)
 * so the patient can see exactly:
 * - Saturday ko sugar kitni thi, BP kitna tha, Heart rate kitna tha!
 * - Sunday, Monday, Tuesday, etc. with individual tests and day-specific AI doctor suggestions!
 */
export function generateInitialVitalsHistory(profileId: string = 'prof-self', patientName: string = 'Patient'): VitalsReading[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // Define 7 days with realistic diverse clinical scenarios including Saturday, Sunday, etc.
  const dayTemplates: Array<{
    daysAgo: number;
    dayOfWeek: string;
    dayUr: string;
    dayRoman: string;
    sugar?: { val: number; unit: SugarUnit; timing: SugarTestTiming };
    bp?: { sys: number; dia: number };
    hr?: number;
  }> = [
    {
      daysAgo: 2, // e.g. Saturday
      dayOfWeek: 'Saturday',
      dayUr: 'ہفتہ',
      dayRoman: 'Hafta (Saturday)',
      sugar: { val: 108, unit: 'mg/dL', timing: 'fasting' },
      bp: { sys: 122, dia: 80 },
      hr: 72,
    },
    {
      daysAgo: 1, // e.g. Sunday
      dayOfWeek: 'Sunday',
      dayUr: 'اتوار',
      dayRoman: 'Itwar (Sunday)',
      sugar: { val: 138, unit: 'mg/dL', timing: 'post_meal' },
      bp: { sys: 126, dia: 82 },
      hr: 76,
    },
    {
      daysAgo: 0, // e.g. Today / Monday
      dayOfWeek: 'Monday',
      dayUr: 'پیر',
      dayRoman: 'Peer (Monday)',
      sugar: { val: 96, unit: 'mg/dL', timing: 'fasting' },
      bp: { sys: 118, dia: 78 },
      hr: 70,
    },
    {
      daysAgo: 3, // Friday
      dayOfWeek: 'Friday',
      dayUr: 'جمعہ',
      dayRoman: 'Jummah (Friday)',
      sugar: { val: 94, unit: 'mg/dL', timing: 'fasting' },
      bp: { sys: 119, dia: 77 },
      hr: 68,
    },
    {
      daysAgo: 4, // Thursday
      dayOfWeek: 'Thursday',
      dayUr: 'جمعرات',
      dayRoman: 'Jumerat (Thursday)',
      sugar: { val: 114, unit: 'mg/dL', timing: 'fasting' },
      bp: { sys: 124, dia: 82 },
      hr: 74,
    },
    {
      daysAgo: 5, // Wednesday - only BP was checked!
      dayOfWeek: 'Wednesday',
      dayUr: 'بدھ',
      dayRoman: 'Budh (Wednesday)',
      bp: { sys: 132, dia: 84 },
      hr: 75,
    },
    {
      daysAgo: 6, // Tuesday - only Sugar was checked!
      dayOfWeek: 'Tuesday',
      dayUr: 'منگل',
      dayRoman: 'Mangal (Tuesday)',
      sugar: { val: 102, unit: 'mg/dL', timing: 'fasting' },
    },
  ];

  return dayTemplates.map((t, idx) => {
    const ts = now - t.daysAgo * dayMs;
    const d = new Date(ts);
    const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    return evaluateVitals({
      patientProfileId: profileId,
      patientName,
      patientAge: '35',
      customDate: dateStr,
      customTimestamp: ts,
      dayOfWeek: t.dayOfWeek,
      timeOfDay: idx % 2 === 0 ? '08:30 AM' : '02:15 PM',
      sugarValue: t.sugar?.val,
      sugarUnit: t.sugar?.unit || 'mg/dL',
      sugarTiming: t.sugar?.timing || 'fasting',
      systolic: t.bp?.sys,
      diastolic: t.bp?.dia,
      heartRateBpm: t.hr,
    });
  });
}

/**
 * Calculates weekly statistics, averages, and clinical trend insights across day logs
 */
export function calculateWeeklyVitalsAverages(readings: VitalsReading[]) {
  const sugarReadings = readings.filter((r) => r.sugarValue && r.sugarValue > 0);
  const bpReadings = readings.filter((r) => r.systolic && r.diastolic);
  const hrReadings = readings.filter((r) => r.heartRateBpm && r.heartRateBpm > 0);

  const avgSugar = sugarReadings.length > 0
    ? Math.round(sugarReadings.reduce((acc, curr) => acc + (curr.sugarValue || 0), 0) / sugarReadings.length)
    : null;

  const avgSys = bpReadings.length > 0
    ? Math.round(bpReadings.reduce((acc, curr) => acc + (curr.systolic || 0), 0) / bpReadings.length)
    : null;

  const avgDia = bpReadings.length > 0
    ? Math.round(bpReadings.reduce((acc, curr) => acc + (curr.diastolic || 0), 0) / bpReadings.length)
    : null;

  const avgHr = hrReadings.length > 0
    ? Math.round(hrReadings.reduce((acc, curr) => acc + (curr.heartRateBpm || 0), 0) / hrReadings.length)
    : null;

  // Trend synthesis
  let weeklyStatus: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
  let trendAdviceEn = 'Weekly vitals indicate overall stable cardiovascular and metabolic balance.';
  let trendAdviceUr = 'ماشاءاللہ! پورے ہفتے کے دوران بلڈ پریشر اور شوگر کا توازن مجموعی طور پر بہتر اور مستحکم رہا ہے۔';
  let trendAdviceRoman = 'Pura hafta vitals stable rahe hain. Apni roteen jari rakhein.';

  if (avgSys && avgSys >= 135) {
    weeklyStatus = 'YELLOW';
    trendAdviceEn = 'Weekly blood pressure average is on the higher side. Maintain low sodium and schedule a doctor review.';
    trendAdviceUr = 'پورے ہفتے کا اوسط بلڈ پریشر قدرے بلند رہا ہے۔ سالن میں نمک کم کریں اور ہفتہ وار چیک اپ کروائیں۔';
    trendAdviceRoman = 'Hafta-waar BP average thoda zyada raha hai. Namak kam karein.';
  } else if (avgSugar && avgSugar >= 120) {
    weeklyStatus = 'YELLOW';
    trendAdviceEn = 'Weekly fasting sugar is slightly elevated. Focus on 30 min morning walks and cutting refined carbohydrates.';
    trendAdviceUr = 'پورے ہفتے میں شوگر کا اوسط لیول کچھ بلند ہے۔ صبح کی چہل قدمی اور میٹھے سے پرہیز پر زور دیں۔';
    trendAdviceRoman = 'Sugar average thodi high hai. Meethay se parhez aur rozana walk karein.';
  }

  return {
    totalDaysRecorded: readings.length,
    avgSugar,
    avgSystolic: avgSys,
    avgDiastolic: avgDia,
    avgHeartRate: avgHr,
    weeklyStatus,
    trendAdviceEn,
    trendAdviceUr,
    trendAdviceRoman,
  };
}

/**
 * Parses natural speech transcripts into structured vitals fields.
 * Supports English, Urdu, and Roman Urdu speech.
 */
export function parseVitalsFromSpeech(transcript: string): Partial<VitalsInputData> {
  const parsed: Partial<VitalsInputData> = {};
  const text = transcript.toLowerCase().trim();

  // 1. Blood Pressure: e.g. "120 over 80", "130 by 85", "140 / 90", "130 بٹہ 85"
  const bpMatch = text.match(/(\b\d{2,3}\b)\s*(?:over|\/|by|بٹہ|aur|and)\s*(\b\d{2,3}\b)/i) ||
                  text.match(/(?:bp|blood pressure|بلڈ پریشر)\s*(?:is|hai|hay|:)?\s*(\b\d{2,3}\b)\s*[,/ ]\s*(\b\d{2,3}\b)/i);
  if (bpMatch) {
    const s = parseInt(bpMatch[1], 10);
    const d = parseInt(bpMatch[2], 10);
    if (s >= 60 && s <= 280 && d >= 30 && d <= 180) {
      parsed.systolic = s;
      parsed.diastolic = d;
    }
  }

  // 2. Blood Sugar: e.g. "sugar 140", "sugar 6.5 mmol", "fasting sugar 110"
  const sugarUnitMatch = text.includes('mmol') ? 'mmol/L' : 'mg/dL';
  parsed.sugarUnit = sugarUnitMatch;

  let timing: SugarTestTiming = 'random';
  if (text.includes('fasting') || text.includes('nahar') || text.includes('نہار') || text.includes('bhookay')) {
    timing = 'fasting';
  } else if (text.includes('post') || text.includes('after meal') || text.includes('khanay ke baad') || text.includes('کھانے کے بعد')) {
    timing = 'post_meal';
  } else if (text.includes('hba1c') || text.includes('a1c') || text.includes('تین ماہ')) {
    timing = 'hba1c';
  }
  parsed.sugarTiming = timing;

  const sugarMatch = text.match(/(?:sugar|glucose|شوگر)\s*(?:is|hai|hay|level|ki reading)?\s*[:\s]?\s*(\d+(?:\.\d+)?)/i) ||
                     text.match(/(\d+(?:\.\d+)?)\s*(?:mg\/dl|mmol\/l|mg|mmol)\s*(?:sugar|glucose)?/i) ||
                     text.match(/(\d+(?:\.\d+)?)\s*(?:hai|hay)?\s*(?:fasting|random|post meal)?\s*(?:sugar|mein)/i);
  if (sugarMatch) {
    const val = parseFloat(sugarMatch[1]);
    if (!isNaN(val) && val > 0 && val < 1000) {
      parsed.sugarValue = val;
    }
  }

  // 3. Heart Rate / Pulse: e.g. "pulse 78", "heart rate 82 bpm", "dharkan 75"
  const hrMatch = text.match(/(?:heart rate|pulse|نبض|dharkan|dhar-kan|bpm)\s*(?:is|hai|hay|:)?\s*(\d{2,3})/i) ||
                  text.match(/(\d{2,3})\s*(?:bpm|beats per minute|dharkan)/i);
  if (hrMatch) {
    const bpm = parseInt(hrMatch[1], 10);
    if (bpm >= 30 && bpm <= 240) {
      parsed.heartRateBpm = bpm;
    }
  }

  return parsed;
}
