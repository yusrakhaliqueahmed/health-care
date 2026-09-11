import express from "express";
import path from "path";
import fs from "fs";
import https from "https";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy initialization of Gemini
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Multi-model fallback execution with per-attempt timeout
async function generateContentWithFallback(
  ai: GoogleGenAI,
  options: {
    contents: any;
    config?: any;
    primaryModel?: string;
    timeoutMs?: number;
  }
): Promise<string> {
  const models = [
    options.primaryModel || "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
    "gemini-flash-latest",
  ];
  const timeoutMs = options.timeoutMs || 8000;

  for (const model of models) {
    try {
      const callPromise = ai.models.generateContent({
        model,
        contents: options.contents,
        config: options.config,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms for ${model}`)), timeoutMs)
      );

      const res: any = await Promise.race([callPromise, timeoutPromise]);
      if (res && res.text) {
        return res.text;
      }
    } catch (err: any) {
      console.warn(`[AI] Model ${model} failed or timed out:`, err?.message || err);
    }
  }

  throw new Error("All models failed or timed out");
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  roman: "Roman Urdu (Urdu in English alphabet)",
  ur: "Urdu (اردو)",
};

function getClinicalChatFallback(
  message: string,
  language: string,
  patientProfile: any
): { text: string; urgency: "GREEN" | "YELLOW" | "RED" } {
  const msgLower = (message || "").toLowerCase();
  const langKey = (language || "en").toLowerCase();

  let urgency: "GREEN" | "YELLOW" | "RED" = "GREEN";
  let guidance = "";

  const isEmergency =
    msgLower.includes("chest pain") ||
    msgLower.includes("breath") ||
    msgLower.includes("heart") ||
    msgLower.includes("stroke") ||
    msgLower.includes("unconscious") ||
    msgLower.includes("سینے میں درد") ||
    msgLower.includes("سانس") ||
    msgLower.includes("بے ہوش") ||
    msgLower.includes("ساهه") ||
    msgLower.includes("ساه لنډي") ||
    msgLower.includes("ساہ");

  const isHeadache =
    msgLower.includes("headache") ||
    msgLower.includes("head") ||
    msgLower.includes("migraine") ||
    msgLower.includes("سر درد") ||
    msgLower.includes("سر میں درد") ||
    msgLower.includes("مٿي جو سور") ||
    msgLower.includes("سر دردی");

  const isFever =
    msgLower.includes("fever") ||
    msgLower.includes("temperature") ||
    msgLower.includes("بخار") ||
    msgLower.includes("تبه") ||
    msgLower.includes("تاپ");

  if (isEmergency) {
    urgency = "RED";
    if (langKey.startsWith("ur")) {
      guidance = `### طبی خلاصہ (Clinical Overview)
سینے میں شدید درد، سانس لینے میں شدید تنگی، یا ہوش و حواس میں اچانک خرابی سنگین ایمرجنسی علامات ہیں۔

### خطرے کی علامات اور فوری الرٹ (Red Flags)
⚠️ اگر درج ذیل میں سے کوئی علامت ہو تو ایک لمحہ ضائع کیے بغیر ہسپتال جائیں:
- سینے یا بازو میں شدید دباؤ یا پسینے آنا
- سانس لینے میں ناقابل برداشت دشواری
- اچانک چکر آنا یا بے ہوشی کی کیفیت

### تجویز کردہ طبی لائحہ عمل (Recommended Care Plan)
1. فوراً ریسکیو 1122 پر کال کریں یا قریبی ایمرجنسی وارڈ تشریف لے جائیں۔
2. مریض کو پرسکون حالت میں نیم بیٹھی پوزیشن میں بٹھائیں اور سخت کپڑے ڈھیلے کریں۔

### محفوظ گھریلو احتیاطی تدابیر (Safe Home Care)
- اس حالت میں خود سے کوئی بھی بغیر ڈاکٹر تجویز کردہ دوا مت لیں۔
- ایمبولینس آنے تک مریض کے پاس موجود رہیں۔

### ڈاکٹر سے پوچھنے والے سوالات (Questions for Doctor)
- "کیا یہ دل یا پھیپھڑوں کا کوئی فوری عارضہ ہے؟"
- "کیا فوری ای سی جی (ECG) یا ایکسرے کی ضرورت ہے؟"`;
    } else if (langKey.startsWith("roman")) {
      guidance = `### Tibbi Khulasa (Clinical Overview)
Seenay mein shadeed dard, saans lene mein dushwari, ya achanak kamzori ahem acute emergency nishaniyan hain.

### Khatray ki Nishaniyan (Red Flags)
⚠️ Yeh alamaat fori emergency hospital ya 1122 ki mutalashi hain:
- Seenay par shadeed dabao jo baayein baazu ya gardan tak jaye
- Saans phoolna aur thanda paseena aana
- Behoshi ya achanak bolne mein dushwari

### Tajweez Kardah Aglay Iqdaamaat (Care Plan)
1. Foran Rescue 1122 call karein ya qareebi hospital Emergency Trauma Center jayein.
2. Mareez ko araam-deh semi-seated position mein bithayein.

### Gharelu Ehtiyaat (Safe Home Care)
- Khudi se koi unverified goli ya injection mat lein.
- Madad aane tak mareez ko akela na chorein.

### Doctor Se Poochne Walay Sawalaat (Questions for Doctor)
- "Kya fori ECG ya cardiac evaluation ki zaroorat hai?"
- "Is emergency ki bunyaadi wajah kya hai?"`;
    } else {
      guidance = `### Clinical Overview
Acute chest pain, severe shortness of breath, sudden neurological deficits, or loss of consciousness represent clinical red flags requiring immediate emergency intervention.

### Red Flags & Urgent Signs
⚠️ Seek immediate emergency medical care (Rescue 1122) if:
- Crushing pressure or radiating pain to jaw, back, or left arm
- Stridor, gasping for air, or bluish lips/fingers
- Confusion, fainting, or slurred speech

### Recommended Action Plan
1. Call Rescue 1122 immediately or transfer safely to the nearest Hospital Emergency Room.
2. Keep the patient upright or semi-reclined in a well-ventilated space.

### Safe Supportive Measures
- Do not administer unverified over-the-counter medications or home remedies.
- Monitor breathing and level of responsiveness until emergency medical technicians arrive.

### Questions for Your Doctor
- "Does this clinical presentation indicate an acute coronary or pulmonary event?"
- "What emergency diagnostic workup (ECG, Troponin, Chest X-ray) is being initiated?"`;
    }
  } else if (isHeadache) {
    urgency = "GREEN";
    if (langKey.startsWith("ur")) {
      guidance = `### طبی خلاصہ (Clinical Overview)
سر درد ایک عام طبی علامت ہے جو اکثر ذہنی دباؤ، نیند کی کمی، یا پانی کی کمی (Dehydration) کی وجہ سے ہوتی ہے۔

### ممکنہ وجوہات اور تشخیصی پہلو (Potential Causes)
- تناؤ کا سر درد (Tension Headache): سر کے دونوں اطراف ہلکا یا درمیانہ دباؤ۔
- پانی کی کمی (Dehydration): جسم میں نمکیات یا پانی کی عارضی کمی۔
- آنکھوں یا سکرین کا دباؤ: موبائل یا کمپیوٹر کے مسلسل استعمال سے۔

### خطرے کی علامات اور فوری الرٹ (Red Flags)
⚠️ اگر درد اچانک بجلی کوندنے جیسا شدید ہو، گردن اکڑ جائے یا قے اور دھندلا پن ہو تو فوری ڈاکٹر سے رجوع کریں۔

### تجویز کردہ طبی لائحہ عمل (Recommended Care Plan)
1. پرسکون اور مدہم روشنی والے ٹھنڈے کمرے میں 30 منٹ آرام کریں۔
2. نمکیات اور پانی کی کمی دور کرنے کے لیے او آر ایس (ORS) یا لیموں پانی کا استعمال کریں۔
3. ضرورت پڑنے پر بالغوں کے لیے پیراسیٹامول (Paracetamol 500mg) کی گولی لی جا سکتی ہے۔

### محفوظ گھریلو احتیاطی تدابیر (Safe Home Care)
- چائے یا کافی کا زیادہ استعمال محدود کریں۔
- موبائل فون کی سکرین سے وقفہ لیں۔

### ڈاکٹر سے پوچھنے والے سوالات (Questions for Doctor)
- "اگر سر درد 48 گھنٹے جاری رہے تو کیا بلڈ پریشر یا نظر کا معائنہ ضروری ہے؟"
- "کیا یہ مائگرین (آدھے سر کا درد) ہو سکتا ہے؟"`;
    } else if (langKey.startsWith("roman")) {
      guidance = `### Tibbi Khulasa (Clinical Overview)
Sar dard aam tor par stress, neend ki kami, thakawat ya paani ki kami (dehydration) ki wajah se hota hai.

### Mumkin Wajoohaat (Potential Causes)
- Tension Headache: Sar ke ird gird bandhi hui patti jaisa dabao.
- Dehydration: Din bhar paani kam peene se sar dard.
- Eye Strain: Screen time aur roshni se sar dard.

### Khatray ki Nishaniyan (Red Flags)
⚠️ Agar achanak shadeed tareen dhamaka-khez dard ho, gardan mein sakhti ho ya ultiyan aayen toh foran emergency jayein.

### Tajweez Kardah Aglay Iqdaamaat (Care Plan)
1. Halka andhere aur thanday kamray mein 20-30 minute mukammal aaram karein.
2. Paani ya ORS solution piyein taakay dehydration khatam ho.
3. Agar dard tang karey toh adult dose Paracetamol (500mg) li ja sakti hai.

### Gharelu Ehtiyaat (Safe Home Care)
- Screen band rakhein aur chai/coffee ki miqdaar control karein.
- Bina doctor mashwara ke painkiller ki over-dosing na karein.

### Doctor Se Poochne Walay Sawalaat (Questions for Doctor)
- "Agar sar dard do din se zyada rahay toh kya blood pressure check karwana chahiye?"
- "Kya iske peeche sinus ya eyesight ka masla hai?"`;
    } else {
      guidance = `### Clinical Overview
Headache is a common clinical complaint frequently triggered by psychological stress, muscle tension, dehydration, or sleep deprivation.

### Potential Causes & Considerations
- Tension-Type Headache: Dull, aching band-like pressure across the forehead or back of the head.
- Dehydration & Fatigue: Suboptimal fluid balance and prolonged physical or mental exertion.
- Digital Eye Strain: Extended exposure to bright screens or uncorrected refractive error.

### Red Flags & Urgent Signs
⚠️ Seek immediate urgent evaluation if:
- Sudden "thunderclap" headache reaching peak intensity within seconds
- Associated neck stiffness, high fever, neurological deficits, or confusion
- Headache following a recent head injury

### Recommended Action Plan
1. Rest in a quiet, darkened, well-ventilated room with minimal cognitive stimulation.
2. Rehydrate promptly with water or an electrolyte solution (ORS).
3. If relief is required, adults may consider single-ingredient Paracetamol (500mg–1000mg with water) according to package guidelines.

### Safe Supportive Measures
- Avoid skipping meals and limit high caffeine intake.
- Apply a cool or lukewarm damp compress to the temples or forehead.

### Questions for Your Doctor
- "Could my recurrent headaches be related to blood pressure or sinus inflammation?"
- "At what point should we consider formal neurological imaging (CT/MRI)?"`;
    }
  } else if (isFever) {
    urgency = "YELLOW";
    if (langKey.startsWith("ur")) {
      guidance = `### طبی خلاصہ (Clinical Overview)
بخار جسم کے مدافعتی نظام (Immune System) کا کسی بیکٹیریل یا وائرل انفیکشن کے خلاف قدرتی دفاعی ردعمل ہے۔

### ممکنہ وجوہات اور تشخیصی پہلو (Potential Causes)
- **وائرل انفیکشن (Viral Illness / Flu)**: نزلہ، زکام اور جسم درد کے ساتھ۔
- **موسمی انفیکشن یا ملیریا/ڈینگی**: مچھر کے موسم میں تیز بخار اور لرزہ۔
- **گلے یا سینے کا انفیکشن**: کھانسی، بلغم یا گلے میں سوزش۔

### خطرے کی علامات اور فوری الرٹ (Red Flags)
⚠️ اگر درجہ حرارت 103°F سے تجاوز کرے، دورے پڑیں، سانس پھولے، یا شیر خوار بچے کو تیز بخار ہو تو فوری ہسپتال جائیں۔

### تجویز کردہ طبی لائحہ عمل (Recommended Care Plan)
1. ہر 4 سے 6 گھنٹے بعد ڈیجیٹل تھرمامیٹر سے بخار کی پیمائش کر کے ڈائری میں لکھیں۔
2. ماتھے اور پاؤں پر عام نلکے کے پانی کی پٹیاں رکھیں (برف کا پانی مت استعمال کریں)۔
3. بالغ مریض ڈاکٹر یا فارماسسٹ کے مشورے سے پیراسیٹامول لے سکتے ہیں۔

### محفوظ گھریلو احتیاطی تدابیر (Safe Home Care)
- پانی، سوپ اور او آر ایس وافر مقدار میں پیئیں تاکہ جسم میں خشکی نہ ہو۔
- بغیر ڈاکٹر کی پرچی کے ہرگز اینٹی بائیوٹک (Antibiotics) استعمال نہ کریں۔

### ڈاکٹر سے پوچھنے والے سوالات (Questions for Doctor)
- "کیا بخار کی اصل وجہ معلوم کرنے کے لیے CBC یا ملیریا/ڈینگی ٹیسٹ درکار ہے؟"
- "بخار کتنے دن میں اترنا چاہیے؟"`;
    } else if (langKey.startsWith("roman")) {
      guidance = `### Tibbi Khulasa (Clinical Overview)
Bukhar body ke immune system ka kisi viral ya bacterial infection ke khilaaf qudrati difaai rad-e-amal hai.

### Mumkin Wajoohaat (Potential Causes)
- **Seasonal Viral Fever**: Nazla, zukam aur jism dard ke sath bukhar.
- **Throat / Chest Infection**: Galay mein kharash ya khansi ke sath.
- **Mosquito-borne (Dengue / Malaria)**: Tez bukhar thand lag kar aana.

### Khatray ki Nishaniyan (Red Flags)
⚠️ Agar bukhar 103°F se zyada ho, bache ko jhatkay (convulsions) lagain ya saans lene mein dushwari ho toh foran hospital jayein.

### Tajweez Kardah Aglay Iqdaamaat (Care Plan)
1. Digital thermometer se har 4-6 ghantay mein bukhar note karein.
2. Mathay par normal paani ki pattiyaan karein (thanda barf ka paani use na karein).
3. Paracetamol munasib miqdaar mein bukhaar kam karne ke liye li ja sakti hai.

### Gharelu Ehtiyaat (Safe Home Care)
- ORS, paani aur yakhni zyada piyein taakay dehydration na ho.
- Bina doctor ke kisi qisam ki Antibiotic (Augmentin, Cipro etc.) khud se mat lein.

### Doctor Se Poochne Walay Sawalaat (Questions for Doctor)
- "Kya CBC blood test ya malaria test karwana zaroori hai?"
- "Agar bukhar 3 din se zyada rahay toh konsi medicine badalni chahiye?"`;
    } else {
      guidance = `### Clinical Overview
Fever (pyrexia) is a regulated elevation of body core temperature, functioning as a physiological response to fight viral or bacterial pathogens.

### Potential Causes & Considerations
- **Acute Viral Syndrome / Upper Respiratory Infection**: Common cold, influenza, or seasonal viral illnesses.
- **Bacterial Etiologies**: Pharyngitis, urinary tract infections, or localized infections.
- **Endemic Considerations**: Dengue, Malaria, or Typhoid fever depending on exposure and season.

### Red Flags & Urgent Signs
⚠️ Seek urgent evaluation if:
- Core temperature exceeds 103°F (39.4°C) or does not respond to antipyretics
- Persistent vomiting with inability to retain fluids for >12 hours
- Petechial skin rash, confusion, stiff neck, or seizures

### Recommended Action Plan
1. Monitor core temperature every 4–6 hours using a calibrated digital thermometer and maintain a log.
2. Apply lukewarm (tepid) water sponging to the forehead and extremities; avoid icy water or alcohol rubs.
3. Standard adult antipyretics like Paracetamol (500mg–1000mg every 6 hours, max 4000mg/day) may be used for comfort.

### Safe Supportive Measures
- Emphasize vigorous oral hydration (water, broths, electrolyte ORS) to replace insensible fluid loss.
- Never self-administer unprescribed antibiotics; antibiotics do not treat viral illnesses and promote bacterial resistance.

### Questions for Your Doctor
- "Is a Complete Blood Count (CBC) or Dengue NS1/Malaria MP test indicated at this point?"
- "What specific signs indicate that I should return to the clinic immediately?"`;
    }
  } else {
    if (langKey.startsWith("ur")) {
      guidance = `### طبی خلاصہ (Clinical Overview)
آپ کی علامات نوٹ کر لی گئی ہیں: "${message}"۔ یہ ابتدائی طبی تجزیہ ڈاکٹر کے معائنے کے لیے تیار کیا گیا ہے۔

### ممکنہ وجوہات اور تشخیصی پہلو (Potential Causes)
- علامات کی تفصیل کے مطابق ابتدائی طبی تجزیہ تجویز کرتا ہے کہ جسمانی تھکاوٹ، عارضی سوزش یا عام نظامِ ہضم کی خرابی ہو سکتی ہے۔

### خطرے کی علامات اور فوری الرٹ (Red Flags)
⚠️ اگر تکلیف اچانک ناقابل برداشت ہو جائے، شدید قے، بے ہوشی یا سانس میں دشواری ہو تو فوری ایمرجنسی سے رابطہ کریں۔

### تجویز کردہ طبی لائحہ عمل (Recommended Care Plan)
1. مکمل آرام کریں اور مناسب مقدار میں پانی استعمال کریں۔
2. علامات کے دورانیے اور شدت کو روزانہ نوٹ کریں تاکہ ڈاکٹر کو درست ہسٹری دی جا سکے۔
3. اگر تکلیف 24 سے 48 گھنٹوں میں بہتر نہ ہو تو جنرل فزیشن سے باقاعدہ چیک اپ کروائیں۔

### محفوظ گھریلو احتیاطی تدابیر (Safe Home Care)
- ہلکی، تازہ اور متوازن غذا استعمال کریں۔
- بلا ضرورت پین کلرز یا غیر تصدیق شدہ ادویات سے پرہیز کریں۔

### ڈاکٹر سے پوچھنے والے سوالات (Questions for Doctor)
- "ان علامات کی اصل تشخیص کے لیے کیا کوئی خون کا ٹیسٹ ضروری ہے؟"
- "کیا طرزِ زندگی یا خوراک میں تبدیلی سے یہ علامات رک سکتی ہیں؟"`;
    } else if (langKey.startsWith("roman")) {
      guidance = `### Tibbi Khulasa (Clinical Overview)
Aapki alamaat note kar li gayi hain: "${message}". Yeh preliminary assessment doctor ke muayenay ke liye banaya gaya hai.

### Mumkin Wajoohaat (Potential Causes)
- Alamaat ki noiyat ke mutabiq yeh aam thakawat, temporary inflammation ya seasonal infection ho sakta hai.

### Khatray ki Nishaniyan (Red Flags)
⚠️ Agar takleef shadeed ho jaye, saans lene mein dushwari ho ya ulti na rukay toh foran emergency hospital jayein.

### Tajweez Kardah Aglay Iqdaamaat (Care Plan)
1. Mukammal aaram karein aur paani/ORS munasib miqdaar mein piyein.
2. Alamaat kab shuru huin aur kitni takleef hai (1-10 scale), isko note karein.
3. Agar takleef 24-48 ghantay mein theek na ho toh mustanad physician se checkup karwayen.

### Gharelu Ehtiyaat (Safe Home Care)
- Halka khana khayein aur screen time kam karein.
- Khudi se koi painkiller ya antibiotic na lein.

### Doctor Se Poochne Walay Sawalaat (Questions for Doctor)
- "Kya in alamaat ke liye kisi routine lab test ki zaroorat hai?"
- "Takleef kitne din mein theek hone ki tawaqqo hai?"`;
    } else {
      guidance = `### Clinical Overview
Your reported symptoms have been recorded: "${message}". This preliminary clinical assessment has been structured for licensed physician evaluation.

### Potential Causes & Considerations
- Based on the preliminary symptom profile, potential factors include transient localized inflammation, physiological fatigue, or mild self-limiting infections.

### Red Flags & Urgent Signs
⚠️ Seek prompt medical evaluation if:
- Rapid worsening of pain or emergence of localized swelling
- High persistent fever, severe dizziness, or fluid intolerance
- Any sudden loss of normal functional capacity

### Recommended Action Plan
1. Rest adequately and ensure consistent oral hydration throughout the day.
2. Document symptom progression, timing, and severity (1–10 scale) to share during your clinical consultation.
3. Schedule an evaluation with a General Physician if symptoms do not improve within 24–48 hours.

### Safe Supportive Measures
- Maintain a light, nutrient-dense diet and avoid strenuous physical strain.
- Refrain from self-prescribing antibiotics or duplicate analgesics.

### Questions for Your Doctor
- "What diagnostic investigations are indicated if these symptoms persist?"
- "What conservative therapies or lifestyle adjustments will aid recovery?"`;
    }
  }

  return { text: guidance, urgency };
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Health checks for Cloud Run rollout, liveness, and container monitoring
  app.get(["/health", "/healthz", "/api/health"], (_req, res) => {
    res.status(200).json({ status: "ok", service: "SehatSaathi Pro Backend", timestamp: new Date().toISOString() });
  });

  // AI Symptom Checker & Clinical Conversation
  app.post("/api/chat", async (req, res) => {
    const {
      message = "",
      history = [],
      language = "English",
      patientProfile = {},
      photoBase64,
      photoMimeType = "image/jpeg",
    } = req.body;

    const targetLanguage = LANGUAGE_NAMES[language] || language;

    try {
      const ai = getAI();

      const systemInstruction = `You are "SehatSaathi Pro AI", a warm, respectful, culturally sensitive, patient medical assistant serving both rural and urban users across Pakistan.
You assist users in preparing a structured clinical case file for real licensed doctors.
TARGET LANGUAGE: ${targetLanguage} (${language}).
CRITICAL LANGUAGE MANDATE: You MUST respond purely and natively in ${targetLanguage}.
- If English: Respond in fluent, professional clinical English.
- If Roman Urdu: Respond in natural, easy-to-read Roman Urdu (Urdu written with English alphabet, e.g. "Aapko bukhar kab se hai? Paani zyada piyein aur aaram karein").
- If Urdu: Respond in clean, elegant Urdu script (اردو).

PATIENT CONTEXT:
- Name: ${patientProfile.name || "Patient"}
- Age Group: ${patientProfile.ageGroup || "Adult (18-60)"}
- Specific Age: ${patientProfile.exactAge || "Not specified"}
- Gender: ${patientProfile.gender || "Not specified"}
- Known Conditions/Allergies: ${patientProfile.conditions || "None reported"}
- Current Medications: ${patientProfile.medications || "None reported"}

BEHAVIOR & ANTI-HALLUCINATION RULES:
1. Warm, respectful, highly professional tone like a reputable clinical portal (Mayo Clinic, WebMD, NHS) combined with an empathetic family physician's assistant.
2. If patient age or who this is for has not been confirmed yet, gently confirm who this consultation is for and their approximate age (Infant 0-2, Child 2-12, Teen 12-18, Adult 18-60, Elderly 60+) so guidance can be safely age-calibrated.
3. Conduct structured clinical history-taking: main symptom, duration, severity (1-10), associated symptoms, red flags.
4. Assess Urgency Level:
   - "GREEN" (Minor, self-care & OTC home tips)
   - "YELLOW" (Moderate, schedule doctor visit within 24-48 hours)
   - "RED" (Emergency: chest pain, severe shortness of breath, sudden weakness/stroke, profuse bleeding, infant high fever. Advise immediate Rescue 1122 or nearest hospital).
5. Always clearly state: "This is preliminary AI triage prepared for doctor review, not a final medical diagnosis."
6. Strict Anti-Hallucination Mandate: You must never hallucinate diagnoses, invent lab numbers, or claim a cure. List possible causes as differentials for a physician to verify. Provide only verified medical facts in plain language.
7. CRITICAL PROFESSIONAL PRESENTATION FORMAT:
Do NOT output a messy text blob or unformatted wall of text. Always present information like an authoritative medical portal (e.g. Mayo Clinic / WebMD / NHS) using the following structured sections with Markdown headers:

If English:
### Clinical Overview
[2-3 sentence clear, empathetic clinical summary of the patient's presentation]

### Potential Causes & Considerations
- **[Possible Cause 1]**: Why this matches the symptoms described.
- **[Possible Cause 2]**: Additional clinical factor to discuss with the doctor.

### Red Flags & Urgent Signs
⚠️ Seek immediate urgent evaluation (Rescue 1122 or ER) if:
- [Specific red flag warning 1]
- [Specific red flag warning 2]

### Recommended Action Plan
1. [Primary next clinical step with timeframe, e.g. Consult General Physician within 24-48h]
2. [Diagnostic checks or physical examinations commonly performed]

### Safe Supportive Measures
- [Safe hydration, rest, or dietary supportive care]
- [Safety warning: Never take unprescribed antibiotics or duplicate painkillers]

### Questions for Your Doctor
- "[Key question to ask during your consultation]"
- "[Follow-up question regarding tests or recovery]"

If Urdu (اردو):
### طبی خلاصہ (Clinical Overview)
[مریض کی علامات کا جامع اور تسلی بخش جائزہ]

### ممکنہ وجوہات اور تشخیصی پہلو (Potential Causes)
- **[ممکنہ وجہ 1]**: علامات کی طبی مطابقت۔
- **[ممکنہ وجہ 2]**: دیگر متعلقہ عوامل۔

### خطرے کی علامات اور فوری الرٹ (Red Flags)
⚠️ اگر درج ذیل علامات ظاہر ہوں تو فوری ہسپتال یا 1122 سے رجوع کریں:
- [خطرناک علامت 1]

### تجویز کردہ طبی لائحہ عمل (Recommended Care Plan)
1. مستند ڈاکٹر سے معائنہ کروائیں۔
2. علامات کے دورانیے کو نوٹ رکھیں۔

### محفوظ گھریلو احتیاطی تدابیر (Safe Home Care)
- آرام، پانی کا زیادہ استعمال اور بغیر ڈاکٹر کے اینٹی بائیوٹکس سے پرہیز۔

### ڈاکٹر سے پوچھنے والے سوالات (Questions for Doctor)
- "[اہم سوال جو ڈاکٹر سے پوچھنا چاہیے]"

If Roman Urdu:
### Tibbi Khulasa (Clinical Overview)
[Alamaat ka mukhtasar aur wazeh clinical jaiza]

### Mumkin Wajoohaat (Potential Causes)
- **[Wajah 1]**: Alamaat ke mutabiq wazahat.
- **[Wajah 2]**: Doosra mumkin pehlu.

### Khatray ki Nishaniyan (Red Flags)
⚠️ Agar yeh alamaat hon toh foran hospital jayein:
- [Khatarnak alamat]

### Tajweez Kardah Aglay Iqdaamaat (Care Plan)
1. Mustanad doctor se 24-48 ghantay mein checkup karwayen.

### Gharelu Ehtiyaat (Safe Home Care)
- Paani ka istemaal, aaram, aur bina prescription antibiotic lene se parhez.

### Doctor Se Poochne Walay Sawalaat (Questions for Doctor)
- "[Doctor se poochne wala ahem sawal]"`;

      const contents: any[] = [];

      // Add conversation history
      for (const h of history.slice(-6)) {
        contents.push({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }],
        });
      }

      // Add current message parts
      const userParts: any[] = [];
      if (photoBase64) {
        userParts.push({
          inlineData: {
            data: photoBase64.replace(/^data:[^;]+;base64,/, ""),
            mimeType: photoMimeType,
          },
        });
      }
      userParts.push({ text: message || "Please review my symptoms." });

      contents.push({
        role: "user",
        parts: userParts,
      });

      const text = await generateContentWithFallback(ai, {
        contents,
        primaryModel: "gemini-3.1-flash-lite",
        timeoutMs: 8000,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      // Determine urgency tag
      let urgency: "GREEN" | "YELLOW" | "RED" = "GREEN";
      const upper = (text || "").toUpperCase();
      if (
        upper.includes("RED") ||
        upper.includes("EMERGENCY") ||
        upper.includes("1122") ||
        upper.includes("HOSPITAL IMMEDIATELY") ||
        upper.includes("فوری ہسپتال") ||
        upper.includes("ایمرجنسی")
      ) {
        urgency = "RED";
      } else if (
        upper.includes("YELLOW") ||
        upper.includes("SEE DOCTOR") ||
        upper.includes("24-48") ||
        upper.includes("ڈاکٹر کو دکھائیں")
      ) {
        urgency = "YELLOW";
      }

      res.json({
        text,
        urgency,
        language,
      });
    } catch (error: any) {
      console.warn("Chat error, using clinical fallback:", error?.message || error);
      // Fallback guarantees response never hangs or fails
      const fallback = getClinicalChatFallback(message, language, patientProfile);
      res.json({
        text: fallback.text,
        urgency: fallback.urgency,
        language,
        isFallback: true,
      });
    }
  });

  // Medicine Verification & Lookup API
  app.post("/api/medicine-check", async (req, res) => {
    try {
      const {
        medicineName,
        condition,
        ageGroup,
        exactAge,
        patientAllergies,
        currentMedicines,
        mode = "check", // 'check', 'reverse', 'photo'
        language = "English",
        photoBase64,
        photoMimeType = "image/jpeg",
        conversationHistory = [],
      } = req.body;

      const ai = getAI();

      const systemInstruction = `You are the "SehatSaathi Pro Medicine Safety Engine", assisting Pakistani patients and doctors.
TARGET LANGUAGE: ${language}.
CRITICAL LANGUAGE MANDATE: You MUST respond in ${language}.
- If English: Professional English.
- If Roman Urdu: Natural, clear Roman Urdu (Urdu written in English script).
- If Urdu: Urdu script (اردو).

SAFETY & ANTI-HALLUCINATION CONSTRAINTS:
1. Age-Aware Calibration:
   - Infant (0-2 years): Strict caution. Many common adult analgesics/cough syrups are contra-indicated or fatal in wrong doses.
   - Child (2-12 years): Weight/age-based dosing caution. Never recommend Aspirin (Disprin) to children due to fatal Reye's Syndrome risk.
   - Elderly (60+ years): Kidney/liver sensitivity, fall-risk sedatives, NSAID gastrointestinal bleeding risk.
   - Pregnancy / Breastfeeding: Flag any potential teratogenic or milk-transfer concerns.
2. Regulatory & Pharmacopeia Accuracy (DRAP & WHO):
   - Clearly distinguish between Generic Names (Active Ingredients) and Brand Names.
   - Strict Prescription Mandate: Antibiotics (e.g. Augmentin, Ciprofloxacin, Azithromycin), steroids, and controlled drugs CANNOT be taken over-the-counter. State clearly that taking antibiotics without a physician's prescription causes dangerous antimicrobial resistance and may harm the patient.
   - Never invent drug indications, never endorse unverified miracle cures, and never guarantee 100% cure rates.
3. Mode handling:
   - "check": Is [Medicine] safe for [Condition] at age [Age]? Detail: Common uses, age-specific safety flag (Safe to continue / Consult doctor / Not recommended for this age), standard dosage disclaimer, when NOT to take, allergy/interaction alerts.
   - "reverse": Patient describes illness/symptoms + age -> Explain standard classes of medicine typically considered by physicians, but firmly clarify that a licensed prescription is required.
   - "photo": The user provided a photo of a medicine strip/bottle/box. Identify the brand or generic name printed, strength (mg/ml), dosage form (tablet, syrup, suspension, capsule, injection). Explain its standard indications and whether it is safe for the patient's stated age and complaint.
4. Every response MUST end with a clear reminder: "Yeh AI preliminary check hai. Dawai khareednay ya khanay se pehle hamesha licensed doctor ya pharmacist se tasdeeq karwayen." / "This is preliminary AI verification. Always confirm with a licensed doctor before taking any medicine."
5. Format output with clean, scannable Markdown sections matching a professional pharmacy portal:
   ### Drug Profile & Classification
   - **Brand Name**: [Name]
   - **Generic (Active Ingredient)**: [Chemical name]
   - **Therapeutic Class**: [Pharmacological category]
   - **Common Formulations**: [Tablet, Syrup, Drops, Injection, etc.]

   ### Age-Specific Safety Assessment
   - **Safety Status**: [SAFE FOR THIS AGE / CAUTION - DOCTOR EVALUATION REQUIRED / NOT RECOMMENDED OR DANGEROUS]
   - **Specific Age Rationale**: [Explain safety impact on infant, child, pregnant, or elderly organ systems]

   ### Approved Clinical Indications
   - [Approved medical uses according to DRAP / WHO]

   ### Contraindications & Critical Warnings
   - [Conditions or populations that must NEVER take this]
   - [Dangerous drug-drug or food interactions]

   ### Adverse Effects to Watch For
   - **Common**: [Mild expected side effects]
   - **Severe**: [Allergic or toxic reactions requiring emergency medical care]

   ### Safe Administration & Next Steps
   - [Proper administration guidance]
   - [Reminder that antibiotics or prescription drugs strictly require a licensed doctor's prescription]`;

      const parts: any[] = [];
      if (photoBase64) {
        let cleanBase64 = photoBase64;
        let mimeType = photoMimeType;
        if (photoBase64.startsWith("http://") || photoBase64.startsWith("https://")) {
          try {
            const imgResp = await fetch(photoBase64);
            const arrayBuffer = await imgResp.arrayBuffer();
            cleanBase64 = Buffer.from(arrayBuffer).toString("base64");
            mimeType = imgResp.headers.get("content-type") || photoMimeType;
          } catch (e) {
            console.warn("Failed to fetch medicine image url:", e);
          }
        } else {
          cleanBase64 = photoBase64.replace(/^data:[^;]+;base64,/, "");
        }

        parts.push({
          inlineData: {
            data: cleanBase64,
            mimeType,
          },
        });
      }

      let promptText = `Mode: ${mode}\n`;
      promptText += `Medicine Name / Query: ${medicineName || "Identified from image"}\n`;
      promptText += `Condition / Symptom: ${condition || "General inquiry"}\n`;
      promptText += `Patient Age / Group: ${exactAge ? exactAge + " years old" : ageGroup || "Adult"}\n`;
      promptText += `Known Allergies: ${patientAllergies || "None"}\n`;
      promptText += `Current Medications: ${currentMedicines || "None"}\n`;

      if (conversationHistory.length > 0) {
        promptText += `\nFollow-up context from previous dialogue:\n`;
        for (const msg of conversationHistory) {
          promptText += `${msg.role}: ${msg.content}\n`;
        }
      }

      parts.push({ text: promptText });

      const text = await generateContentWithFallback(ai, {
        contents: [{ parts }],
        primaryModel: "gemini-3.1-flash-lite",
        timeoutMs: 8000,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });

      let safetyStatus: "SAFE" | "CAUTION" | "DANGER" = "CAUTION";
      const upper = text.toUpperCase();
      if (upper.includes("NOT RECOMMENDED") || upper.includes("DANGEROUS") || upper.includes("CONTRAINDICATED") || upper.includes("نقصان دہ")) {
        safetyStatus = "DANGER";
      } else if (upper.includes("SAFE TO CONTINUE") || upper.includes("SAFE FOR THIS AGE") || upper.includes("عام طور پر محفوظ")) {
        safetyStatus = "SAFE";
      }

      res.json({
        text,
        safetyStatus,
        language,
        mode,
      });
    } catch (error: any) {
      console.error("Medicine check error:", error);
      res.status(500).json({
        error: error.message || "Failed to analyze medicine",
        fallbackText: "Unable to verify medicine automatically. Please show this medicine to a licensed doctor or pharmacist before use.",
      });
    }
  });

  // Persistent User Data & Unified Health Records Storage
  const DATA_DIR = path.join(process.cwd(), "data");
  const RECORDS_STORE_FILE = path.join(DATA_DIR, "user_records_store.json");

  function ensureDataStoreExists(): Record<string, { profiles: any[]; records: any[]; vitals?: any }> {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(RECORDS_STORE_FILE)) {
        fs.writeFileSync(RECORDS_STORE_FILE, JSON.stringify({}, null, 2), "utf-8");
        return {};
      }
      const raw = fs.readFileSync(RECORDS_STORE_FILE, "utf-8");
      return JSON.parse(raw) || {};
    } catch (e) {
      console.warn("Data store read error, resetting in-memory fallback:", e);
      return {};
    }
  }

  function saveUserDataStore(data: Record<string, any>) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(RECORDS_STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error("Data store write error:", e);
    }
  }

  function getDefaultUserRecords(userName: string = "Patient"): any[] {
    return [
      {
        id: "SS-REC-88412",
        referenceNumber: "SS-2026-88412",
        labCaseNumber: "LB-77491",
        userId: "default",
        patientProfileId: "prof-self",
        patientName: userName,
        patientAge: "34 Y",
        patientGender: "male",
        category: "lab_report",
        title: "Complete Blood Count (CBC) Panel",
        panelName: "COMPLETE BLOOD COUNT (CBC)",
        date: "07-Sep-2026 11:30 AM",
        status: "doctor_approved",
        reviewedByDoctor: "Dr. Ayesha Malik",
        doctorPmdc: "PMDC #48291-P",
        urgency: "YELLOW",
        testResults: [
          {
            testName: "Hemoglobin (Hb)",
            result: "10.8",
            referenceRange: "13.5 - 17.5",
            unit: "g/dL",
            isAbnormal: true,
            notes: "Mild microcytic hypochromic pattern",
          },
          {
            testName: "Total Leukocyte Count (TLC / WBC)",
            result: "7,800",
            referenceRange: "4,000 - 11,000",
            unit: "/uL",
            isAbnormal: false,
          },
          {
            testName: "Platelets Count",
            result: "245,000",
            referenceRange: "150,000 - 450,000",
            unit: "/uL",
            isAbnormal: false,
          },
          {
            testName: "Hematocrit (PCV)",
            result: "33.5",
            referenceRange: "40.0 - 52.0",
            unit: "%",
            isAbnormal: true,
            notes: "Reduced oxygen-carrying capacity",
          },
          {
            testName: "Mean Corpuscular Volume (MCV)",
            result: "74.2",
            referenceRange: "80.0 - 100.0",
            unit: "fL",
            isAbnormal: true,
          },
          {
            testName: "Erythrocyte Sedimentation Rate (ESR)",
            result: "14",
            referenceRange: "0 - 15",
            unit: "mm/1st hr",
            isAbnormal: false,
          },
        ],
        clinicalNotes:
          "Mild nutritional anemia pattern identified with microcytosis. Attending physician recommends dietary iron enrichment (spinach, dates, lean meats) and oral ferrous bisglycinate with Vitamin C. Repeat CBC in 6 weeks.",
        doctorComments:
          "Reviewed and countersigned. Patient advised against taking tea immediately after meals to avoid inhibiting iron absorption.",
      },
      {
        id: "SS-REC-91204",
        referenceNumber: "SS-2026-91204",
        labCaseNumber: "LB-82915",
        userId: "default",
        patientProfileId: "prof-self",
        patientName: userName,
        patientAge: "34 Y",
        patientGender: "male",
        category: "medicine",
        title: "Panadol Extra (Paracetamol + Caffeine) Clinical Verification",
        panelName: "MEDICINE CHECK RESULT",
        date: "05-Sep-2026 04:15 PM",
        status: "doctor_approved",
        reviewedByDoctor: "Dr. Tariq Jameel",
        doctorPmdc: "PMDC #31094-S",
        urgency: "GREEN",
        testResults: [
          {
            testName: "Active Ingredient 1",
            result: "Paracetamol 500mg",
            referenceRange: "Standard Analgesic / Antipyretic",
            unit: "mg",
            isAbnormal: false,
          },
          {
            testName: "Active Ingredient 2",
            result: "Caffeine 65mg",
            referenceRange: "Analgesic Adjuvant (<200mg/dose)",
            unit: "mg",
            isAbnormal: false,
          },
          {
            testName: "Max Daily Limit Verification",
            result: "4,000 mg / 24 Hours",
            referenceRange: "Safe Upper Limit (Adults)",
            unit: "mg",
            isAbnormal: false,
          },
          {
            testName: "Hepatic / Liver Safety Index",
            result: "Class A (Safe at stated dose)",
            referenceRange: "Normal LFT Required if Chronic",
            isAbnormal: false,
          },
          {
            testName: "Pediatric Contraindication Screen",
            result: "Not Recommended for Children < 12y",
            referenceRange: "Standard DRAP Warning",
            isAbnormal: false,
          },
        ],
        clinicalNotes:
          "Appropriate for acute mild-to-moderate tension headache and fever. Take 1-2 tablets every 6 hours with a full glass of water. Do NOT combine with other over-the-counter paracetamol products (Disprin Extra, Calpol, etc.) to prevent hepatotoxicity.",
        doctorComments: "Approved for short-term symptomatic relief (maximum 3 consecutive days).",
      },
      {
        id: "SS-REC-67120",
        referenceNumber: "SS-2026-67120",
        labCaseNumber: "LB-55193",
        userId: "default",
        patientProfileId: "prof-self",
        patientName: userName,
        patientAge: "34 Y",
        patientGender: "male",
        category: "symptom",
        title: "Upper Respiratory & Pharyngitis Clinical Triage",
        panelName: "SYMPTOM SUMMARY",
        date: "03-Sep-2026 09:20 AM",
        status: "ai_preliminary",
        urgency: "GREEN",
        testResults: [
          {
            testName: "Chief Complaint",
            result: "Sore Throat & Mild Dry Cough x 2 Days",
            referenceRange: "Acute Duration (< 7 days)",
            isAbnormal: false,
          },
          {
            testName: "Measured Body Temperature",
            result: "99.8 °F (Low-grade pyrexia)",
            referenceRange: "97.0 - 99.0 °F",
            isAbnormal: true,
            notes: "Mild fever spike responding to fluids",
          },
          {
            testName: "Respiratory Distress / Stridor Screen",
            result: "Clear & Unlabored",
            referenceRange: "No accessory muscle usage",
            isAbnormal: false,
          },
          {
            testName: "Emergency Red Flag Audit",
            result: "All 5 Negative (No chest pain/hemoptysis)",
            referenceRange: "Zero Critical Indicators",
            isAbnormal: false,
          },
        ],
        clinicalNotes:
          "Clinical presentation consistent with viral pharyngitis / seasonal change irritation. Warm saline gargles (1/2 tsp salt in warm water) 3 times daily. Hydrate with warm broths and honey-lemon tea. Physical clinic visit recommended if high fever (>102°F) develops or symptoms persist past 5 days.",
      },
      {
        id: "SS-REC-44192",
        referenceNumber: "SS-2026-44192",
        labCaseNumber: "LB-39912",
        userId: "default",
        patientProfileId: "prof-self",
        patientName: userName,
        patientAge: "34 Y",
        patientGender: "male",
        category: "prescription",
        title: "Seasonal Allergy & Bronchial Care Prescription",
        panelName: "LICENSED MEDICAL PRESCRIPTION",
        date: "01-Sep-2026 02:45 PM",
        status: "doctor_approved",
        reviewedByDoctor: "Dr. Ayesha Malik",
        doctorPmdc: "PMDC #48291-P",
        urgency: "GREEN",
        prescriptionData: {
          diagnosis: "Seasonal Allergic Rhinitis & Mild Tracheitis",
          medicines: [
            {
              name: "Tab. Montika (Montelukast) 10mg",
              dosage: "10mg",
              duration: "14 Days",
              instructions: "1 tablet daily at bedtime",
              frequency: "Once Daily",
            },
            {
              name: "Tab. Rigix (Cetirizine) 10mg",
              dosage: "10mg",
              duration: "5 Days",
              instructions: "1 tablet as needed for severe sneezing or itching",
              frequency: "As Needed",
            },
            {
              name: "Syr. Acefyl (Diprophylline) 120ml",
              dosage: "2 teaspoons",
              duration: "5 Days",
              instructions: "Twice daily after meals",
              frequency: "Twice Daily",
            },
          ],
          notes: "Avoid direct ice water, cold air conditioning drafts, and dusty environments.",
        },
        testResults: [
          {
            testName: "Primary Clinical Diagnosis",
            result: "Seasonal Allergic Rhinitis with Mild Tracheitis",
            referenceRange: "ICD-10 J30.1",
            isAbnormal: false,
          },
          {
            testName: "Doctor Verification",
            result: "Signed & Digitally Verified via PMDC Portal",
            referenceRange: "Valid for 30 Days",
            isAbnormal: false,
          },
          {
            testName: "DRAP Pharmacy Dispensing Code",
            result: "DISP-VERIFIED-9821",
            referenceRange: "Official DRAP Barcode QR",
            isAbnormal: false,
          },
        ],
        clinicalNotes:
          "Prescription issued after clinical tele-triage. Patient advised to complete full course of Montelukast to prevent nighttime airway spasms.",
        doctorComments: "Patient instructed to report if rash or significant drowsiness occurs.",
      },
    ];
  }

  function getDefaultUserProfiles(userName: string = "Myself"): any[] {
    return [
      {
        id: "prof-self",
        name: userName || "Myself",
        relation: "Self",
        ageGroup: "adult",
        exactAge: 34,
        gender: "male",
        bloodGroup: "B+",
        conditions: "Mild seasonal allergies",
        medications: "None regular",
        allergies: "Dust, Pollen",
        emergencyContact: "0300-1234567",
      },
      {
        id: "prof-child-1",
        name: "Ali (Son)",
        relation: "Child",
        ageGroup: "child",
        exactAge: 6,
        gender: "male",
        bloodGroup: "O+",
        conditions: "None",
        medications: "None",
        allergies: "No known drug allergies",
      },
      {
        id: "prof-parent-1",
        name: "Ami Jan (Mother)",
        relation: "Parent",
        ageGroup: "elderly",
        exactAge: 62,
        gender: "female",
        bloodGroup: "A+",
        conditions: "Hypertension, Type 2 Diabetes",
        medications: "Tab. Glucophage 500mg, Tab. Softvas 5mg",
        allergies: "Penicillin allergy",
        emergencyContact: "0321-9876543",
      },
    ];
  }

  // GET User Data (survives logout/login!)
  app.get("/api/user-data/:userKey", (req, res) => {
    try {
      const userKey = (req.params.userKey || "default").toLowerCase().trim();
      const store = ensureDataStoreExists();

      if (!store[userKey]) {
        // Initialize default profiles and realistic sample records for this user
        const defaultName = userKey.includes("@") ? userKey.split("@")[0].replace(/[._]/g, " ") : "Patient";
        store[userKey] = {
          profiles: getDefaultUserProfiles(defaultName),
          records: getDefaultUserRecords(defaultName),
          vitals: {
            bloodSugar: "105 mg/dL",
            bloodPressure: "120/80 mmHg",
            heartRate: "72 bpm",
            weight: "68 kg",
            recordedAt: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
          },
        };
        saveUserDataStore(store);
      }

      res.json({
        success: true,
        userKey,
        profiles: store[userKey].profiles || [],
        records: store[userKey].records || [],
        vitals: store[userKey].vitals || {},
      });
    } catch (e: any) {
      console.error("Failed to get user data:", e);
      res.status(500).json({ error: "Failed to load user records" });
    }
  });

  // POST User Data (saves/syncs all profiles and records)
  app.post("/api/user-data/:userKey", (req, res) => {
    try {
      const userKey = (req.params.userKey || "default").toLowerCase().trim();
      const { profiles, records, vitals } = req.body;
      const store = ensureDataStoreExists();

      store[userKey] = {
        profiles: profiles || store[userKey]?.profiles || [],
        records: records || store[userKey]?.records || [],
        vitals: vitals || store[userKey]?.vitals || {},
      };

      saveUserDataStore(store);
      res.json({ success: true, count: store[userKey].records.length });
    } catch (e: any) {
      console.error("Failed to save user data:", e);
      res.status(500).json({ error: "Failed to persist user records" });
    }
  });

  // POST Single Record (Appends or updates a record)
  app.post("/api/records", (req, res) => {
    try {
      const { userKey = "default", record } = req.body;
      if (!record || !record.id) {
        return res.status(400).json({ error: "Valid record object with an id is required" });
      }

      const key = (userKey || "default").toLowerCase().trim();
      const store = ensureDataStoreExists();
      if (!store[key]) {
        store[key] = {
          profiles: getDefaultUserProfiles(),
          records: getDefaultUserRecords(),
        };
      }

      const existingIndex = store[key].records.findIndex((r: any) => r.id === record.id);
      if (existingIndex >= 0) {
        store[key].records[existingIndex] = { ...store[key].records[existingIndex], ...record };
      } else {
        store[key].records.unshift(record);
      }

      saveUserDataStore(store);
      res.json({ success: true, recordId: record.id, totalRecords: store[key].records.length });
    } catch (e: any) {
      console.error("Failed to save record:", e);
      res.status(500).json({ error: "Failed to save record" });
    }
  });

  // DELETE Single Record
  app.delete("/api/records/:userKey/:recordId", (req, res) => {
    try {
      const key = (req.params.userKey || "default").toLowerCase().trim();
      const recordId = req.params.recordId;
      const store = ensureDataStoreExists();

      if (store[key] && Array.isArray(store[key].records)) {
        store[key].records = store[key].records.filter((r: any) => r.id !== recordId);
        saveUserDataStore(store);
      }

      res.json({ success: true, recordId });
    } catch (e: any) {
      console.error("Failed to delete record:", e);
      res.status(500).json({ error: "Failed to delete record" });
    }
  });

  // Medical Report & X-ray Analysis API
  app.post("/api/report-analyze", async (req, res) => {
    try {
      const {
        reportType = "lab", // 'lab', 'xray', 'mri', 'prescription', 'video_scan'
        photoBase64,
        photoMimeType = "image/jpeg",
        notes = "",
        language = "English",
        patientAge = "Adult",
      } = req.body;

      if (!photoBase64) {
        return res.status(400).json({ error: "Photo or video frame base64 is required" });
      }

      const ai = getAI();

      const systemInstruction = `You are the "SehatSaathi Pro Clinical Imaging & Report Triage Specialist" serving patients and doctors in Pakistan.
TARGET LANGUAGE: ${language}.
CRITICAL LANGUAGE MANDATE: You MUST respond purely in ${language}.
- If English: Professional English.
- If Roman Urdu: Clean, accessible Roman Urdu (Urdu written in English alphabet).
- If Urdu: Urdu script (اردو).

YOUR MISSION & ANTI-HALLUCINATION RULES:
1. Examine the uploaded medical report or X-ray / scan image.
2. If it is a LAB REPORT (CBC, Blood Sugar, LFT, Lipid, Urine, etc.):
   - Extract key test parameters.
   - Compare each against standard age-appropriate reference ranges (${patientAge}).
   - Clearly label each as NORMAL (سب ٹھیک) or ABNORMAL / HIGH / LOW (غیر معمولی / زیادہ / کم).
   - Explain what abnormal values generally signify in plain, non-scary language.
3. If it is an X-RAY / SCAN / CT / MRI:
   - Identify the anatomical region (Chest, Knee, Spine, Abdomen, etc.).
   - Describe visible features in plain language (e.g., clear lung fields vs visible infiltration, bone continuity vs fracture lines).
   - Clearly mandate: "Radiologist and attending doctor verification is mandatory before any clinical decision."
4. Check if the image quality is too blurry, tilted, or cut off. If completely unreadable, explicitly ask the user to retake a clearer photo or record a steady video.
5. Strict Anti-Hallucination Mandate: Only discuss values and findings visibly present in the image. Do NOT invent lab numbers, patient names, diagnoses, or reference ranges. If an area or number is unclear, state clearly that it is illegible.
6. Provide a clear color-coded urgency tag:
   - GREEN (Routine check / within normal limits)
   - YELLOW (Abnormalities present, consult your doctor within 2-3 days)
   - RED (Critical abnormal value e.g. extreme hemoglobin drop, acute fracture, urgent radiologic emergency)
7. Conclude with a strict clinical disclosure: "This is an automated preliminary breakdown for patient guidance and education. It does NOT constitute an official radiology report or clinical diagnosis. Physical evaluation by a licensed physician or radiologist is mandatory."`;

      let cleanBase64 = photoBase64;
      let mimeType = photoMimeType;
      if (photoBase64.startsWith("http://") || photoBase64.startsWith("https://")) {
        try {
          const imgResp = await fetch(photoBase64);
          const arrayBuffer = await imgResp.arrayBuffer();
          cleanBase64 = Buffer.from(arrayBuffer).toString("base64");
          mimeType = imgResp.headers.get("content-type") || photoMimeType;
        } catch (e) {
          console.warn("Failed to fetch report image url:", e);
        }
      } else {
        cleanBase64 = photoBase64.replace(/^data:[^;]+;base64,/, "");
      }

      const imagePart = {
        inlineData: {
          data: cleanBase64,
          mimeType,
        },
      };

      const promptText = `Report Type: ${reportType}\nPatient Age/Profile: ${patientAge}\nAdditional Patient Voice Notes: ${notes || "None provided"}\nPlease provide full structured explanation.`;

      const text = await generateContentWithFallback(ai, {
        contents: [{ parts: [imagePart, { text: promptText }] }],
        primaryModel: "gemini-3.1-flash-lite",
        timeoutMs: 8000,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      let urgency: "GREEN" | "YELLOW" | "RED" = "YELLOW";
      const upper = text.toUpperCase();
      if (upper.includes("RED") || upper.includes("CRITICAL") || upper.includes("URGENT") || upper.includes("فوری")) {
        urgency = "RED";
      } else if (upper.includes("GREEN") || upper.includes("NORMAL") || upper.includes("ALL NORMAL") || upper.includes("سب ٹھیک")) {
        urgency = "GREEN";
      }

      res.json({
        text,
        urgency,
        language,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Report analyze error:", error);
      res.status(500).json({
        error: error.message || "Failed to analyze report",
        fallbackText: "The report image could not be processed. Please make sure the photo is in focus with good lighting, or upload another image.",
      });
    }
  });

  // Audio cache for instant replay & high-performance playback
  const ttsAudioCache = new Map<string, Buffer>();

  function fetchTTSChunk(text: string, tl: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(tl)}&client=tw-ob`;
      https.get(
        url,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        },
        (upstreamRes) => {
          if (upstreamRes.statusCode !== 200) {
            return reject(new Error(`TTS upstream error HTTP ${upstreamRes.statusCode}`));
          }
          const chunks: Buffer[] = [];
          upstreamRes.on("data", (c) => chunks.push(c));
          upstreamRes.on("end", () => resolve(Buffer.concat(chunks)));
          upstreamRes.on("error", reject);
        }
      ).on("error", reject);
    });
  }

  async function generateSpeechAudio(rawText: string, lang: string): Promise<Buffer> {
    // Clean text: strip markdown symbols, URLs, asterisks, brackets
    const clean = rawText
      .replace(/[*_#`~[\]()]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!clean) {
      throw new Error("Empty text after cleaning");
    }

    const normalizedLang = (lang || "en").toLowerCase();
    const cacheKey = `${normalizedLang}:${clean.slice(0, 300)}`;
    if (ttsAudioCache.has(cacheKey)) {
      return ttsAudioCache.get(cacheKey)!;
    }

    // Determine Google TTS target language tag (tl)
    let tl = "en";
    const hasUrduScript = /[\u0600-\u06FF]/.test(clean);

    if (normalizedLang === "ur" || normalizedLang === "urdu" || hasUrduScript) {
      tl = "ur";
    } else if (normalizedLang === "roman" || normalizedLang === "roman urdu") {
      // Roman Urdu: tl='hi' natively pronounces Romanized South Asian / Urdu / Hindi syllables with authentic accent!
      tl = "hi";
    } else {
      tl = "en";
    }

    // Chunk text if needed into <= 130 chars segments (Google TTS chunk limit)
    const sentences = clean.match(/[^.!?،\n;]+[.!?،\n;]*/g) || [clean];
    const chunks: string[] = [];
    let currentChunk = "";

    for (const s of sentences) {
      if ((currentChunk + " " + s).trim().length <= 130) {
        currentChunk = (currentChunk + " " + s).trim();
      } else {
        if (currentChunk) chunks.push(currentChunk);
        if (s.length > 130) {
          const words = s.split(" ");
          let sub = "";
          for (const w of words) {
            if ((sub + " " + w).trim().length <= 130) {
              sub = (sub + " " + w).trim();
            } else {
              if (sub) chunks.push(sub);
              sub = w;
            }
          }
          if (sub) chunks.push(sub);
          currentChunk = "";
        } else {
          currentChunk = s.trim();
        }
      }
    }
    if (currentChunk) chunks.push(currentChunk);

    // Limit to first 8 chunks for audio stream safety
    const safeChunks = chunks.slice(0, 8);
    const audioBuffers: Buffer[] = [];

    for (const chunk of safeChunks) {
      try {
        const buf = await fetchTTSChunk(chunk, tl);
        if (buf && buf.length > 0) {
          audioBuffers.push(buf);
        }
      } catch (err) {
        console.warn(`TTS fetch failed for chunk "${chunk.slice(0, 30)}":`, err);
      }
    }

    if (audioBuffers.length === 0) {
      throw new Error("Failed to produce audio buffers");
    }

    const combined = Buffer.concat(audioBuffers);
    if (ttsAudioCache.size > 150) {
      const firstKey = ttsAudioCache.keys().next().value;
      if (firstKey) ttsAudioCache.delete(firstKey);
    }
    ttsAudioCache.set(cacheKey, combined);
    return combined;
  }

  // Audio Text-To-Speech GET API (direct streaming into HTML5 Audio element)
  app.get("/api/tts", async (req, res) => {
    try {
      const text = (req.query.text as string) || "";
      const lang = ((req.query.lang || req.query.language) as string) || "en";
      if (!text.trim()) {
        return res.status(400).send("Text query parameter required");
      }

      const audioBuffer = await generateSpeechAudio(text, lang);
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.send(audioBuffer);
    } catch (err: any) {
      console.error("GET /api/tts error:", err);
      res.status(500).send("Failed to generate speech audio");
    }
  });

  // Audio Text-To-Speech POST API route
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, lang = "en", language } = req.body;
      const targetLang = lang || language || "en";
      if (!text || !text.trim()) {
        return res.status(400).json({ error: "Text is required" });
      }

      const audioBuffer = await generateSpeechAudio(text, targetLang);
      res.json({
        audioBase64: audioBuffer.toString("base64"),
        mimeType: "audio/mpeg",
        language: targetLang,
      });
    } catch (err: any) {
      console.error("POST /api/tts error:", err);
      res.status(500).json({ error: "Failed to generate speech audio", fallbackToWebSpeech: true });
    }
  });

  // Audio Speech-To-Text Transcription API for Urdu, Roman Urdu & English
  app.post("/api/transcribe-audio", async (req, res) => {
    try {
      const { audioBase64, mimeType = "audio/webm", language = "ur" } = req.body;
      if (!audioBase64) {
        return res.status(400).json({ error: "audioBase64 payload is required" });
      }

      const ai = getAI();
      let languageGuide = "";
      if (language === "ur") {
        languageGuide = "The speaker is speaking in Pakistani Urdu. Transcribe accurately into standard Urdu script (اردو). Preserve Pakistani medical terms and medicine names (like Panadol, Disprin, Augmentin, Brufen, BP, Sugar, Bukhar) accurately.";
      } else if (language === "roman") {
        languageGuide = "The speaker is speaking in Urdu / Hindi. Transcribe directly into natural, everyday Roman Urdu using the Latin / English alphabet (for example: 'Mujhe 2 din se shadeed bukhar aur gale mein dard hai'). Do not output Arabic script.";
      } else {
        languageGuide = "The speaker is speaking in English. Transcribe accurately in English.";
      }

      const prompt = `You are an expert medical transcription engine specialized in South Asian languages and healthcare terminology.
${languageGuide}
Clean up background ambient noise and filler stutter if any, but preserve all clinical symptoms, numbers, duration, and medicine names.
CRITICAL: Output ONLY the exact transcribed text string. Do NOT add any preamble, explanation, markdown backticks, quotes, or metadata.`;

      const contents = [
        {
          parts: [
            {
              inlineData: {
                mimeType: (mimeType || "audio/webm").split(";")[0],
                data: audioBase64,
              },
            },
            { text: prompt },
          ],
        },
      ];

      const result = await generateContentWithFallback(ai, {
        contents,
        primaryModel: "gemini-3.1-flash-lite",
        timeoutMs: 9000,
      });

      const cleanTranscript = (result || "").trim().replace(/^["']|["']$/g, "");
      res.json({ transcript: cleanTranscript });
    } catch (err: any) {
      console.error("Transcribe audio error:", err);
      res.status(500).json({ error: "Failed to transcribe audio", details: err.message });
    }
  });

  // Vite middleware in development, static files in production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const candidatePaths = [
      path.join(process.cwd(), "dist"),
      path.join(__dirname, "dist"),
      __dirname,
    ];
    const distPath =
      candidatePaths.find((p) => fs.existsSync(path.join(p, "index.html"))) ||
      candidatePaths[0];

    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send("SehatSaathi Pro Backend is running.");
      }
    });
  }

  const PORT = 3000;

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SehatSaathi Pro server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
