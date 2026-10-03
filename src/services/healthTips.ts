export interface HealthTip {
  id: string;
  category: {
    en: string;
    ur: string;
    roman: string;
  };
  title: {
    en: string;
    ur: string;
    roman: string;
  };
  content: {
    en: string;
    ur: string;
    roman: string;
  };
  actionableStep: {
    en: string;
    ur: string;
    roman: string;
  };
  source: string;
}

export const VERIFIED_HEALTH_TIPS: HealthTip[] = [
  {
    id: 'tip-bp-salt',
    category: {
      en: 'Heart & Blood Pressure',
      ur: 'امراضِ قلب اور بلڈ پریشر',
      roman: 'Dil aur Blood Pressure',
    },
    title: {
      en: 'Lower Sodium to Protect Your Arteries',
      ur: 'نمک کا اعتدال اور بلڈ پریشر کا کنٹرول',
      roman: 'Namak Mein Kami aur BP Ka Control',
    },
    content: {
      en: 'Excess dietary salt is the leading contributor to hypertension and stroke in Pakistan. Restricting daily intake to less than 1 teaspoon (5g) helps keep systolic pressure stable and protects delicate renal vessels.',
      ur: 'کھانے میں نمک کا زیادہ استعمال پاکستان میں ہائی بلڈ پریشر اور فالج کی سب سے بڑی وجہ ہے۔ روزانہ نمک کی مقدار ایک چائے کے چمچ (5 گرام) سے کم رکھنے سے بلڈ پریشر قابو میں رہتا ہے اور گردے محفوظ رہتے ہیں۔',
      roman: 'Khanay mein namak ka zyada istemal high blood pressure aur stroke ki bari wajah hai. Rozana 1 chaye ke chamach se kam namak istemal karein taake dil aur gurday mehfooz rahein.',
    },
    actionableStep: {
      en: 'Avoid adding extra salt at the table; flavor lentils and curries with lemon, garlic, or coriander instead.',
      ur: 'کھانے کی میز پر اوپر سے نمک چھڑکنے سے گریز فرمائیں؛ سالن اور دال میں نمک کے بجائے لیموں، لہسن اور ہرا دھنیا استعمال کریں۔',
      roman: 'Dastarkhwan par ooper se namak mat daalein; leemo, lehsan aur dhania ka istemal barhayein.',
    },
    source: 'Pakistan Hypertension League & WHO Clinical Guidance',
  },
  {
    id: 'tip-diabetes-walk',
    category: {
      en: 'Diabetes Care',
      ur: 'ذیابیطس / شوگر کی نگہداشت',
      roman: 'Sugar aur Diabetes',
    },
    title: {
      en: 'A 15-Minute Post-Meal Walk Clears Blood Glucose',
      ur: 'کھانے کے بعد 15 منٹ کی واک اور شوگر کا توازن',
      roman: 'Khanay Ke Baad 15-Minute Walk',
    },
    content: {
      en: 'Light walking within 30 minutes of finishing lunch or dinner activates GLUT-4 glucose transporters in skeletal muscle, pulling sugar from the bloodstream without requiring extra insulin production.',
      ur: 'دوپہر یا رات کے کھانے کے 30 منٹ کے اندر 15 منٹ کی ہلکی چہل قدمی پٹھوں کو خون سے فاضل شوگر جذب کرنے میں مدد دیتی ہے، جس سے کھانے کے بعد شوگر کا اچانک اضافہ رک جاتا ہے۔',
      roman: 'Khanay ke 30 minute baad 15 minute tehelna khoon mein sugar ke achanak izafay ko rokta hai aur insulin ki karkardagi behtar karta hai.',
    },
    actionableStep: {
      en: 'Take a relaxed 10 to 15-minute stroll around your courtyard or room after heavy meals.',
      ur: 'کھانے کے فوراً بعد لیٹنے کے بجائے صحن یا کمرے میں 10 سے 15 منٹ پُرسکون انداز میں چہل قدمی فرمائیں۔',
      roman: 'Bhari khanay ke baad foran sonay ke bajaye 10-15 minute tehlein.',
    },
    source: 'International Diabetes Federation (IDF) South Asia Protocol',
  },
  {
    id: 'tip-hydration-heat',
    category: {
      en: 'Summer Wellness & Kidneys',
      ur: 'گرمیوں کی نگہداشت اور گردوں کی حفاظت',
      roman: 'Garmi aur Gurdon Ki Hifazat',
    },
    title: {
      en: 'Prevent Renal Stones with Consistent Hydration',
      ur: 'گردے کی پتھری اور پانی کا مناسب استعمال',
      roman: 'Gurday Ki Pathri Se Bachao',
    },
    content: {
      en: 'During hot and dry weather across Sindh and Punjab, concentrated urine rapidly forms calcium oxalate crystals. Drinking at least 8 to 10 glasses of clean water keeps urine clear and protects filtration units.',
      ur: 'گرمیوں کے موسم میں پسینہ زیادہ آنے سے پیشاب گاڑھا ہو جاتا ہے جس سے گردے میں پتھری بننے کا خطرہ بڑھ جاتا ہے۔ روزانہ کم از کم 8 سے 10 گلاس صاف پانی پینا گردوں کے فلٹر کو رواں رکھتا ہے۔',
      roman: 'Garmi ke mausam mein rozana 8 se 10 glass saaf paani piyein taake gurdon mein calcium crystals aur pathri na ban sake.',
    },
    actionableStep: {
      en: 'Check urine color: it should be pale straw. If dark amber, immediately drink two glasses of water.',
      ur: 'پیشاب کی رنگت پر نظر رکھیں: ہلکا زرد رنگ نارمل ہے، اگر رنگت گہری ہو تو فوراً دو گلاس پانی پیئیں۔',
      roman: 'Agar peshab ka rang gehra peela ho toh foran 2 glass paani piyein.',
    },
    source: 'Sindh Institute of Urology and Transplantation (SIUT) Guidelines',
  },
  {
    id: 'tip-dengue-prevention',
    category: {
      en: 'Infectious Diseases',
      ur: 'موسمی وبائی امراض اور ڈینگی سے بچاؤ',
      roman: 'Dengue aur Wabaai Amraaz',
    },
    title: {
      en: 'Eliminate Stagnant Clean Water to Stop Aedes Mosquitoes',
      ur: 'صاف کھڑے پانی کا خاتمہ اور ڈینگی مچھر کا تدارک',
      roman: 'Kharay Paani Ka Khatma aur Dengue',
    },
    content: {
      en: 'The Aedes mosquito breeds predominantly in clean, stagnant water inside coolers, pots, plant trays, and roof containers. A single female can deposit hundreds of eggs that hatch within 48 hours.',
      ur: 'ڈینگی مچھر صاف اور کھڑے پانی میں افزائش پاتا ہے، جیسے کہ روم کولر، گملے، ٹائر یا کھلی ٹینکیاں۔ گھر کے اندر اور چھت پر جمع شدہ صاف پانی کو ہر 3 دن بعد خشک کرنا ڈینگی سے بچاؤ کا سب سے مؤثر طریقہ ہے۔',
      roman: 'Dengue machhar saaf kharay paani mein anday deta hai. Room cooler, gamlay aur tankiyan har 3 din baad saaf aur khushk karein.',
    },
    actionableStep: {
      en: 'Inspect room air-coolers and pot saucers weekly; scrub container walls to dislodge mosquito eggs.',
      ur: 'روم کولرز اور پودوں کے گملوں کی نیچے رکھی پلیٹوں کو ہفتہ وار چیک کریں اور اندرونی سطح کو رگڑ کر صاف کریں۔',
      roman: 'Coolers aur gamlon ke bartan har haftey saaf karein aur full sleeve kapray pehnein.',
    },
    source: 'National Institute of Health (NIH) Islamabad Epidemic Alert',
  },
  {
    id: 'tip-pediatric-fever',
    category: {
      en: 'Child Health & Parenting',
      ur: 'بچوں کی نگہداشت اور بخار کی تدابیر',
      roman: 'Bachon Ka Bukhar aur Hifazat',
    },
    title: {
      en: 'Safe Fever Management: Sponging & Age-Calibrated Paracetamol',
      ur: 'بچوں میں بخار: عرقِ گلاب یا نیم گرم پانی کی پٹیاں',
      roman: 'Bachon Ke Bukhar Mein Patti',
    },
    content: {
      en: 'Never immerse a febrile child in ice-cold water as shivering dramatically spikes core body temperature. Use lukewarm sponging on the forehead and neck, and administer paracetamol strictly by child weight, never guessing.',
      ur: 'بخار کی حالت میں بچے کو ہرگز برف کے پانی سے نہ نہلائیں کیونکہ کپکپی سے جسم کا اندرونی درجہ حرارت مزید بڑھ جاتا ہے۔ پیشانی اور بغلوں پر نیم گرم یا عام نلکے کے پانی کی پٹیاں رکھیں اور دوا ہمیشہ وزن کے مطابق دیں۔',
      roman: 'Bukhar mein bachay par baraf ka paani mat daalein; aam taaza paani ki patti karein aur dawai hamesha doctor ke bataye mutabiq dein.',
    },
    actionableStep: {
      en: 'Ensure adequate oral fluids like soup or breastmilk to prevent febrile seizures and dehydration.',
      ur: 'بچے کو پانی، سوپ یا ماں کا دودھ وقتاً فوقتاً پلاتے رہیں تاکہ جسم میں پانی کی کمی نہ ہو اور جھٹکے لگنے کا خطرہ ٹل جائے۔',
      roman: 'Bachay ko paani, soup ya doodh pilatay rahein taake dehydration na ho.',
    },
    source: 'Pakistan Pediatric Association (PPA) Clinical Guidelines',
  },
  {
    id: 'tip-antibiotic-stewardship',
    category: {
      en: 'Medicine Safety',
      ur: 'ادویات کی حفاظت اور اینٹی بائیوٹکس',
      roman: 'Antibiotic Ka Sahi Istemal',
    },
    title: {
      en: 'Antibiotics Do Not Cure Viral Flu or Common Cold',
      ur: 'نزلہ زکام میں اینٹی بائیوٹکس کا بے جا استعمال نہ کریں',
      roman: 'Nazla Zukaam Mein Antibiotic Mat Lein',
    },
    content: {
      en: 'Over 90% of sore throats, runny noses, and seasonal coughs are caused by viral pathogens. Taking antibiotics for viral infections causes drug resistance, renders future treatments ineffective, and destroys healthy gut flora.',
      ur: 'موسمی نزلہ، زکام اور گلے کی خراش کی 90 فیصد وجوہات وائرل ہوتی ہیں جن پر اینٹی بائیوٹک گولیاں بے اثر ہوتی ہیں۔ خود سے اینٹی بائیوٹک کھانا بیکٹیریا کو طاقتور بنا دیتا ہے اور مستقبل میں عام دوائیں اثر نہیں کرتیں۔',
      roman: 'Nazla aur sardi aam taur par viral hoti hain jin par antibiotic asar nahi karti. Bina doctori nuskhe ke antibiotic mat lein.',
    },
    actionableStep: {
      en: 'Treat seasonal colds with warm green tea, honey, saline gargles, and steam inhalation unless a doctor confirms bacterial infection.',
      ur: 'نزلہ زکام میں جوشاندہ، شہد، نمکین پانی کے غرارے اور بھاپ کا استعمال کریں؛ اینٹی بائیوٹک صرف مستند ڈاکٹر کے نسخے پر لیں۔',
      roman: 'Garam joshanda, shehad aur bhap lein; antibiotic sirf doctor ki hidayat par shuru karein.',
    },
    source: 'Drug Regulatory Authority of Pakistan (DRAP) & PMDC Alert',
  },
  {
    id: 'tip-sleep-hygiene',
    category: {
      en: 'Mental Health & Sleep',
      ur: 'دماغی سکون اور معیاری نیند',
      roman: 'Pur-Sukoon Neend aur Dimaghi Sehat',
    },
    title: {
      en: 'Digital Sunset: Turn Off Blue Screens 45 Minutes Before Bed',
      ur: 'سونے سے پہلے موبائل اسکرین کی نیلی روشنی سے پرہیز',
      roman: 'Sonay Se Pehle Mobile Screen Band Karein',
    },
    content: {
      en: 'Smartphone screens emit short-wavelength blue light that directly suppresses melatonin synthesis in the pineal gland. Disconnecting 45 minutes before sleep restores deep restorative REM sleep cycles and reduces morning anxiety.',
      ur: 'موبائل فون اور ٹی وی کی نیلی روشنی دماغ میں نیند لانے والے ہارمون (میلاٹونن) کو روک دیتی ہے۔ سونے سے 45 منٹ پہلے موبائل الگ رکھ دینے سے گہری نیند آتی ہے اور صبح ذہنی تناؤ کم ہوتا ہے۔',
      roman: 'Sonay se 45 minute pehle phone door rakh dein taake dimagh relax ho aur gehri neend aa sakay.',
    },
    actionableStep: {
      en: 'Charge your phone away from your pillow and read a book or practice calm deep breathing before sleeping.',
      ur: 'موبائل کو سرہانے کے بجائے دور چارجنگ پر لگائیں اور سونے سے قبل کوئی کتاب پڑھیں یا پُرسکون سانس کی مشق کریں۔',
      roman: 'Phone ko takiye se door rakhein aur sonay se pehle pursukoon mahol banayein.',
    },
    source: 'Pakistan Psychiatric Society & Harvard Sleep Medicine Protocol',
  },
];

/**
 * Returns a deterministic daily health tip based on the day of the year
 */
export function getDailyHealthTip(offset = 0): HealthTip {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const index = Math.abs((dayOfYear + offset) % VERIFIED_HEALTH_TIPS.length);
  return VERIFIED_HEALTH_TIPS[index];
}
