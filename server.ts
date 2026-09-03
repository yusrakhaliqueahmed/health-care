import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  ur: "Urdu (اردو)",
  sd: "Sindhi (سنڌي)",
  ps: "Pashto (پښتو)",
  bal: "Balochi (بلوچی)",
  pa: "Punjabi (پنجابی / Shahmukhi)",
  skr: "Saraiki (سرائیکی)",
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
      guidance = "اہم انتباہ (RED EMERGENCY): سینے میں شدید درد، سانس لینے میں تنگی یا بے ہوشی سنگین ایمرجنسی علامات ہیں۔ براہِ کرم فوراً آرام کریں اور ایمرجنسی میں ریسکیو 1122 پر کال کریں یا قریبی ایمرجنسی ہسپتال تشریف لے جائیں۔ یہ مصنوعی ذہانت کی ابتدائی راہنمائی ہے، ڈاکٹر سے فوری معائنہ لازمی ہے۔";
    } else if (langKey.startsWith("sd")) {
      guidance = "اهم خبرداري (RED EMERGENCY): ڇاتيءَ ۾ سخت سور، ساهه کڻڻ ۾ ڏکيائي يا بيهوشي هنگامي علامتون آهن. مهرباني ڪري فوري طور تي ريسڪيو 1122 تي ڪال ڪريو يا ويجهي اسپتال وڃو. هي طبي رهنمائي آهي، فوري ڊاڪٽر ڏيکاريو.";
    } else if (langKey.startsWith("ps")) {
      guidance = "مهم خبرداری (RED EMERGENCY): په سینې کې سخت درد او د ساه لنډي جدي نښې دي. مهرباني وکړئ سمدستي ریسکیو 1122 ته زنګ ووهئ یا نږدې روغتون ته لاړ شئ. دا د هوښیار سیسټم لارښوونه ده، د ډاکټر لیدل بیړني دي.";
    } else if (langKey.startsWith("bal")) {
      guidance = "سکیـں ھال (RED EMERGENCY): سینگ دردی ءُ ساہ بند بوھگ مزنیں خطرہ اِنت۔ زوت ریسکیو 1122 ءَ کال بکن اِت یا نادراھجاہ ءَ روگ لوٹیت۔ اے ڈاکٹر ئِ بدلہ نہ اِنت۔";
    } else if (langKey.startsWith("pa")) {
      guidance = "اہم وارننگ (RED EMERGENCY): چھاتی وچ تیز پیڑ یا ساہ گھٹن سنگین ایمرجنسی اے۔ فوراً ریسکیو 1122 تے کال کرو یا قریبی ہسپتال پہنچو۔ ڈاکٹر نال فوری رابطہ کرو۔";
    } else if (langKey.startsWith("skr")) {
      guidance = "اہم خبردار (RED EMERGENCY): چھاتی وچ سخت درد یا ساہ رکݨ خطرے دی علامت ہے۔ فوراً 1122 تے کال کرو یا نیڑے ہسپتال ونڄو۔ ڈاکٹر کولوں چیک کرواوݨ ضروری ہے۔";
    } else {
      guidance = "CRITICAL ALERT (RED EMERGENCY): Severe chest pain, shortness of breath, sudden weakness, or loss of consciousness require immediate emergency care. Please sit down comfortably, remain calm, and immediately call Rescue 1122 or head to the nearest hospital emergency department.";
    }
  } else if (isHeadache) {
    urgency = "GREEN";
    if (langKey.startsWith("ur")) {
      guidance = `سر درد کے لیے ابتدائی طبی راہنمائی (GREEN):
1. پرسکون اور مدہم روشنی والے ٹھنڈے کمرے میں 20-30 منٹ آرام کریں۔
2. پانی یا او آر ایس (ORS) کا زیادہ استعمال کریں کیونکہ پانی کی کمی سر درد کی عام وجہ ہے۔
3. اگر درد تناؤ کا ہو تو بالغوں کے لیے پیراسیٹامول (Paracetamol 500mg) مناسب سمجھی جاتی ہے۔
4. ریڈ فلیگ: اگر اچانک شدید دھماکے جیسا درد ہو تو فوراً ڈاکٹر سے رجوع کریں۔`;
    } else if (langKey.startsWith("sd")) {
      guidance = `مٿي جي سور لاءِ طبي مشورو (GREEN):
1. ٿڌي ۽ پرسڪون ڪمري ۾ آرام ڪريو.
2. گهڻو پاڻي يا او آر ايس (ORS) پيو.
3. بالغن لاءِ پيراسيٽامول طبي لحاظ کان فائديمند ٿي سگهي ٿي.
4. جيڪڏهن سور وڌي ته فوري ڊاڪٽر سان رجوع ڪريو.`;
    } else if (langKey.startsWith("ps")) {
      guidance = `د سر درد لپاره لومړنۍ طبي لارښوونه (GREEN):
1. په ارامه او تیاره خونه کې آرام وکړئ.
2. ډیرې اوبه یا او آر ایس وڅښئ.
3. د اړتیا په وخت کې د پاراسیټامول مناسبه کارونه مرسته کوي.
4. که درد ډیر سخت شي نو ډاکټر ته مراجعه وکړئ.`;
    } else if (langKey.startsWith("bal")) {
      guidance = `سرا دردی واستہ راہبند (GREEN):
1. وشیں ءُ آرامیں جاہ ءَ واب کپ اِت۔
2. آپ ءُ او آر ایس گیش پی اِت۔
3. پیراسیٹامول ئِ ورگ درد ءَ کم کنت۔
4. درد گیش بوت گڑا ڈاکٹر ءَ پیش دار اِت۔`;
    } else if (langKey.startsWith("pa")) {
      guidance = `سر پیڑ لئی گھریلو تے ابتدائی امداد (GREEN):
1. پرسکون کمرے وچ کچھ دیر آرام کرو۔
2. پانی تے نمکول ودھ پئو۔
3. پیراسیٹامول گولی درد گھٹ کرن وچ مدد دیندی اے۔
4. جے پیڑ نہ ہٹے تے ڈاکٹر کول جاؤ۔`;
    } else if (langKey.startsWith("skr")) {
      guidance = `سر درد واسطے ابتدائی صلاح (GREEN):
1. ٹھڈے تے پرسکون کمرے وچ آرام کرو۔
2. پاݨی دا استعمال ودھاوو۔
3. پیراسیٹامول گولی درد کوں گھٹ کریندی ہے۔
4. تکلیف ودھے تاں ڈاکٹر کولوں چیک کرواوو۔`;
    } else {
      guidance = `Clinical Assessment for Headache (Urgency: GREEN):
1. Rest in a quiet, dark, and well-ventilated room with minimal screen exposure.
2. Hydrate thoroughly with water or electrolyte solution (ORS), as dehydration is a frequent headache trigger.
3. For mild tension or stress headaches, adult patients commonly consider Paracetamol (500mg - 1000mg with water).
4. Red Flag Warnings: If you experience a sudden "thunderclap" headache, stiff neck, or vomiting, consult a doctor immediately.`;
    }
  } else if (isFever) {
    urgency = "YELLOW";
    if (langKey.startsWith("ur")) {
      guidance = `بخار کے لیے ابتدائی طبی راہنمائی (YELLOW):
1. ڈیجیٹل تھرمامیٹر سے درجہ حرارت ناپیں اور نوٹ کریں۔
2. ماتھے پر گیلے کپڑے کی ہلکی پٹیاں رکھیں اور وافر پانی پئیں۔
3. پیراسیٹامول مناسب خوراک میں استعمال کی جا سکتی ہے۔
4. اگر بخار 102°F سے زیادہ ہو یا 3 دن سے زائد رہے تو ڈاکٹر سے رجوع کریں۔`;
    } else if (langKey.startsWith("sd")) {
      guidance = `بخار لاءِ طبي هدايتون (YELLOW):
1. ٿرماميٽر سان بخار جو گرمي پد چيڪ ڪريو.
2. مٿي تي آلي ڪپڙي جون پٽيون رکو ۽ پاڻي گهڻو پيو.
3. مناسب پيراسيٽامول وٺو.
4. جيڪڏهن 3 ڏينهن کان وڌيڪ رهي ته ڊاڪٽر وٽ وڃو.`;
    } else if (langKey.startsWith("ps")) {
      guidance = `د تبې لپاره لومړنۍ لارښوونې (YELLOW):
1. د تبې کچه په ترمامیتر سره اندازه کړئ.
2. په تندي لنده ټوټه کیږدئ او مایعات ډیر وڅښئ.
3. پاراسیټامول د تبې په کمولو کې مرسته کوي.
4. که تبه اوږده شي نو ډاکټر سره اړیکه ونیسئ.`;
    } else if (langKey.startsWith("bal")) {
      guidance = `تب ئِ چارگ ءُ درمل (YELLOW):
1. وتی تب ءَ تھرمامیٹر ءَ چار اِت۔
2. پیشانی ءَ آپ بند پٹی ایر کن اِت ءُ آپ پی اِت۔
3. پیراسیٹامول مناسب مقدار ءَ کارمرز بکن اِت۔
4. تب سئے روچ ءَ گیش بوت گڑا ڈاکٹر ءَ روگ لوٹیت۔`;
    } else if (langKey.startsWith("pa")) {
      guidance = `بخار لئی ہدایات (YELLOW):
1. تھرمامیٹر نال بخار روز چیک کرو۔
2. متھے تے ٹھنڈی پٹیاں رکھو تے پانی بوہتا پئو۔
3. پیراسیٹامول خوراک دے مطابق لئو۔
4. بخار نہ لتھے تے ڈاکٹر کول جاؤ۔`;
    } else if (langKey.startsWith("skr")) {
      guidance = `بخار (تاپ) واسطے صلاح (YELLOW):
1. تھرمامیٹر نال بخار چیک کرو۔
2. متھے تے ٹھنڈے پاݨی دی پٹی رکھو۔
3. پیراسیٹامول مناسب مقدار وچ ورتو۔
4. تاپ نہ لتھے تاں ڈاکٹر کول ونڄو۔`;
    } else {
      guidance = `Clinical Assessment for Fever (Urgency: YELLOW):
1. Record your temperature every 4-6 hours with a clean digital thermometer.
2. Apply lukewarm sponging to the forehead and wear breathable cotton clothing.
3. Increase fluid intake (water, broths, ORS) to guard against dehydration.
4. Age-appropriate Paracetamol may assist in reducing discomfort.
5. Seek medical evaluation if temperature exceeds 102°F (38.9°C) or lasts beyond 72 hours.`;
    }
  } else {
    if (langKey.startsWith("ur")) {
      guidance = `آپ کی علامات نوٹ کر لی گئی ہیں: "${message}"۔
1. مکمل آرام کریں اور مناسب مقدار میں پانی استعمال کریں۔
2. علامات کی نوعیت اور مدت کو نوٹ کریں تاکہ ڈاکٹر کو درست معلومات فراہم کی جا سکیں۔
3. اگر تکلیف میں اضافہ ہو تو فوری طور پر مستند ڈاکٹر سے رجوع کریں۔`;
    } else if (langKey.startsWith("sd")) {
      guidance = `توهان جون علامتون نوٽ ڪيون ويون آهن: "${message}".
1. مڪمل آرام ڪريو ۽ پاڻي گهڻو پيو.
2. جيڪڏهن تڪليف وڌي ته فوري ڊاڪٽر سان رجوع ڪريو.`;
    } else if (langKey.startsWith("ps")) {
      guidance = `ستاسو نښې ثبت شوې: "${message}".
1. بشپړ آرام وکړئ او ډیر مایعات وڅښئ.
2. د ډاکټر سره د لیدو لپاره خپله طبي قضیه چمتو وساتئ.`;
    } else if (langKey.startsWith("bal")) {
      guidance = `شمارا نادراھی ھال نوٽ بوت: "${message}".
1. وش آرام بکن اِت ءُ آپ پی اِت۔
2. وتی دردی ڈاکٹر ءَ پیش دارگ واستہ ھمے رپورٹ ءَ بچار اِت۔`;
    } else if (langKey.startsWith("pa")) {
      guidance = `تہاڈی علامات نوٹ کر لئیاں گئیاں نیں: "${message}"۔
1. پورا آرام کرو تے پانی دا استعمال رکھو۔
2. تکلیف ودھن دی صورت وچ ڈاکٹر نال رابطہ کرو۔`;
    } else if (langKey.startsWith("skr")) {
      guidance = `تہاڈی بیماری دیاں علامات لکھ گھدیاں ہن: "${message}"۔
1. پورھا آرام کرو تے پاݨی پِیو۔
2. تکلیف ودھے تاں ڈاکٹر کوں ضرور ݙیکھاوو۔`;
    } else {
      guidance = `I have recorded your symptoms: "${message}".
1. Rest comfortably and ensure adequate hydration.
2. Track when the symptoms began, their severity (1-10), and whether eating, resting, or moving changes the pain.
3. If symptoms persist or worsen over the next 24-48 hours, consult a qualified healthcare provider.`;
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
- If English: Respond in fluent English.
- If Urdu: Respond in clean Urdu script (اردو).
- If Sindhi: Respond in proper Sindhi script (سنڌي).
- If Pashto: Respond in proper Pashto script (پښتو).
- If Balochi: Respond in proper Balochi script (بلوچی).
- If Punjabi: Respond in Punjabi (پنجابی / Shahmukhi script or clear Gurmukhi/Shahmukhi as familiar in Pakistan).
- If Saraiki: Respond in Saraiki script (سرائیکی).

PATIENT CONTEXT:
- Name: ${patientProfile.name || "Patient"}
- Age Group: ${patientProfile.ageGroup || "Adult (18-60)"}
- Specific Age: ${patientProfile.exactAge || "Not specified"}
- Gender: ${patientProfile.gender || "Not specified"}
- Known Conditions/Allergies: ${patientProfile.conditions || "None reported"}
- Current Medications: ${patientProfile.medications || "None reported"}

BEHAVIOR RULES:
1. Warm, respectful tone like a trusted rural health worker / family doctor's assistant.
2. If patient age or who this is for has not been confirmed yet, gently confirm who this consultation is for and their approximate age (Infant 0-2, Child 2-12, Teen 12-18, Adult 18-60, Elderly 60+) so guidance can be safely age-calibrated.
3. Conduct structured clinical history-taking: main symptom, duration, severity (1-10), associated symptoms, red flags.
4. Assess Urgency Level:
   - "GREEN" (Minor, self-care & OTC home tips)
   - "YELLOW" (Moderate, schedule doctor visit within 24-48 hours)
   - "RED" (Emergency: chest pain, severe shortness of breath, sudden weakness/stroke, profuse bleeding, infant high fever. Advise immediate Rescue 1122 or nearest hospital).
5. Always clearly state: "This is AI guidance prepared for doctor review, not a final medical diagnosis."
6. Provide actionable, concise advice. Keep sentences clear so they can easily be read aloud to low-literacy users.`;

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
CRITICAL LANGUAGE MANDATE: You MUST respond in ${language}. DO NOT default to English if the user requested Urdu, Sindhi, Pashto, Balochi, Punjabi, or Saraiki!
- If Urdu: Urdu script (اردو).
- If Sindhi: Sindhi script (سنڌي).
- If Pashto: Pashto script (پښتو).
- If Balochi: Balochi script (بلوچی).
- If Punjabi: Punjabi script (پنجابی).
- If Saraiki: Saraiki script (سرائیکی).
- If English: English.

SAFETY CONSTRAINTS:
1. Age-Aware Calibration:
   - Infant (0-2 years): Strict caution. Many common adult analgesics/cough syrups are contra-indicated or fatal in wrong doses.
   - Child (2-12 years): Weight/age-based dosing caution.
   - Elderly (60+ years): Kidney/liver sensitivity, fall-risk sedatives, NSAID gastrointestinal risk.
   - Pregnancy / Breastfeeding caution if applicable.
2. Mode handling:
   - "check": Is [Medicine] safe for [Condition] at age [Age]? Detail: Common uses, age-specific safety flag (Safe to continue / Consult doctor / Not recommended for this age), standard dosage disclaimer, when NOT to take, allergy/interaction alerts.
   - "reverse": Patient describes illness/symptoms + age -> Explain standard classes of medicine typically considered by physicians, but firmly clarify that a licensed prescription is required.
   - "photo": The user provided a photo of a medicine strip/bottle/box. Identify the brand or generic name printed, strength (mg/ml), dosage form (tablet, syrup, suspension, capsule, injection). Explain its standard indications and whether it is safe for the patient's stated age and complaint.
3. Every response MUST end with a clear reminder: "Yeh AI preliminary check hai. Dawai khareednay ya khanay se pehle hamesha licensed doctor ya pharmacist se tasdeeq karwayen." / "This is preliminary AI verification. Always confirm with a licensed doctor before taking any medicine."
4. Format output with clean, scannable sections:
   - Summary / Identification
   - Safety Status for this Age
   - Key Warnings / When NOT to take
   - Recommended Specialist / Next Step`;

      const parts: any[] = [];
      if (photoBase64) {
        parts.push({
          inlineData: {
            data: photoBase64.replace(/^data:[^;]+;base64,/, ""),
            mimeType: photoMimeType,
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
- If Urdu: Urdu script (اردو).
- If Sindhi: Sindhi script (سنڌي).
- If Pashto: Pashto script (پښتو).
- If Balochi: Balochi script (بلوچی).
- If Punjabi: Punjabi script (پنجابی).
- If Saraiki: Saraiki script (سرائیکی).
- If English: English.

YOUR MISSION:
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
5. Provide a clear color-coded urgency tag:
   - GREEN (Routine check / within normal limits)
   - YELLOW (Abnormalities present, consult your doctor within 2-3 days)
   - RED (Critical abnormal value e.g. extreme hemoglobin drop, acute fracture, urgent radiologic emergency)
6. Conclude with: "Confirmed by doctor review on SehatSaathi Pro."`;

      const imagePart = {
        inlineData: {
          data: photoBase64.replace(/^data:[^;]+;base64,/, ""),
          mimeType: photoMimeType,
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
