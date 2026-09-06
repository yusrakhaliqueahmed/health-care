import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

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

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "SehatSaathi Pro Backend" });
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

  // Audio Text-To-Speech API route for high quality speech audio
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, language = "English" } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      // Try Gemini TTS if available and short text, or return speech metadata
      const ai = getAI();
      try {
        const ttsResponse = await ai.models.generateContent({
          model: "gemini-3.1-flash-tts-preview",
          contents: [{ parts: [{ text: text.slice(0, 400) }] }],
          config: {
            responseModalities: ["AUDIO" as any],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: "Kore" },
              },
            },
          },
        });

        const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          return res.json({
            audioBase64: base64Audio,
            mimeType: "audio/mp3",
            sampleRate: 24000,
            provider: "gemini-tts",
          });
        }
      } catch (ttsErr) {
        // Fallback gracefully to client Web Speech API synthesis
      }

      res.json({
        fallbackToWebSpeech: true,
        text,
        language,
      });
    } catch (err: any) {
      res.json({ fallbackToWebSpeech: true, text: req.body?.text || "" });
    }
  });

  // Vite middleware in development, static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SehatSaathi Pro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
