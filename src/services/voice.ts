import { SupportedLanguage } from '../types';
import { LANGUAGES } from './i18n';

type VoiceStateListener = (state: {
  isPlaying: boolean;
  isPaused: boolean;
  text: string;
  speed: number;
}) => void;

class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private stateListeners: Set<VoiceStateListener> = new Set();
  private isPlaying = false;
  private isPaused = false;
  private currentText = '';
  private currentLang: SupportedLanguage | string = 'en';
  private speed = 1.0;
  private isAutoPlayEnabled = false;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        if (this.synth && 'onvoiceschanged' in this.synth) {
          this.synth.onvoiceschanged = () => {
            this.synth?.getVoices();
          };
        }
      }
    }
  }

  public subscribe(listener: VoiceStateListener) {
    this.stateListeners.add(listener);
    listener({
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      text: this.currentText,
      speed: this.speed,
    });
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.stateListeners) {
      listener({
        isPlaying: this.isPlaying,
        isPaused: this.isPaused,
        text: this.currentText,
        speed: this.speed,
      });
    }
  }

  public setSpeed(newSpeed: number) {
    this.speed = newSpeed;
    if (this.currentAudio) {
      this.currentAudio.playbackRate = newSpeed;
    }
    if (this.isPlaying && this.currentText) {
      this.notify();
    } else {
      this.notify();
    }
  }

  public getSpeed(): number {
    return this.speed;
  }

  public setAutoPlay(val: boolean) {
    this.isAutoPlayEnabled = val;
  }

  public getAutoPlay(): boolean {
    return this.isAutoPlayEnabled;
  }

  public speak(rawText: string, lang: SupportedLanguage | string) {
    this.stop();

    // Clean markdown symbols & URLs for clearer speech
    const cleanText = rawText
      .replace(/[*_#`~[\]]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    if (!cleanText) return;

    this.currentText = cleanText;
    this.currentLang = lang;

    // First attempt: High quality streaming audio from /api/tts (Works in Urdu, English & Roman Urdu on all devices)
    try {
      const audioUrl = `/api/tts?text=${encodeURIComponent(cleanText.slice(0, 500))}&lang=${encodeURIComponent(lang)}`;
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;
      audio.playbackRate = this.speed;

      audio.onplay = () => {
        this.isPlaying = true;
        this.isPaused = false;
        this.notify();
      };

      audio.onpause = () => {
        if (audio.currentTime < audio.duration && !audio.ended) {
          this.isPaused = true;
          this.notify();
        }
      };

      audio.onended = () => {
        this.isPlaying = false;
        this.isPaused = false;
        this.currentAudio = null;
        this.notify();
      };

      audio.onerror = () => {
        console.warn('Audio streaming failed, falling back to Web Speech API synthesis');
        this.currentAudio = null;
        this.speakWebSpeech(cleanText, lang);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('HTML5 Audio playback interrupted, falling back to Web Speech API:', err);
          this.currentAudio = null;
          this.speakWebSpeech(cleanText, lang);
        });
      }
    } catch (err) {
      console.warn('Failed to initiate HTML5 Audio, using web speech fallback:', err);
      this.speakWebSpeech(cleanText, lang);
    }
  }

  private speakWebSpeech(cleanText: string, lang: SupportedLanguage | string) {
    if (!this.synth) return;

    // Resolve BCP-47 tag
    let bcp47 = 'en-US';
    if (typeof lang === 'string' && (lang in LANGUAGES)) {
      bcp47 = LANGUAGES[lang as SupportedLanguage].bcp47;
    } else if (typeof lang === 'string' && lang.includes('-')) {
      bcp47 = lang;
    }

    // Try finding best matching voice available on system
    const voices = this.synth.getVoices?.() || [];
    let matchedVoice: SpeechSynthesisVoice | undefined;

    if (lang === 'roman') {
      matchedVoice =
        voices.find((v) => v.lang.toLowerCase().startsWith('ur')) ||
        voices.find((v) => v.lang.toLowerCase().startsWith('hi')) ||
        voices.find((v) => v.lang.toLowerCase().startsWith('en-pk')) ||
        voices.find((v) => v.lang.toLowerCase().startsWith('en-in')) ||
        voices.find((v) => v.lang.toLowerCase().startsWith('en'));
    } else {
      matchedVoice =
        voices.find((v) => v.lang.toLowerCase().startsWith(bcp47.slice(0, 2).toLowerCase())) ||
        (bcp47.startsWith('ur') ? voices.find((v) => v.lang.toLowerCase().startsWith('hi')) : undefined);
    }

    let spokenText = cleanText;
    if (lang === 'roman') {
      const isUrduVoice = matchedVoice && (matchedVoice.lang.toLowerCase().startsWith('ur') || matchedVoice.lang.toLowerCase().startsWith('hi'));
      if (isUrduVoice) {
        spokenText = this.transliterateRomanToUrdu(cleanText);
        bcp47 = matchedVoice.lang;
      } else {
        spokenText = this.prepareRomanUrduForEnglishTTS(cleanText);
      }
    } else if (lang === 'ur' || bcp47.startsWith('ur')) {
      const isUrduVoice = matchedVoice && (matchedVoice.lang.toLowerCase().startsWith('ur') || matchedVoice.lang.toLowerCase().startsWith('hi'));
      if (isUrduVoice) {
        spokenText = cleanText;
        bcp47 = matchedVoice.lang;
      } else {
        const romanized = this.transliterateUrduScriptToRoman(cleanText);
        spokenText = this.prepareRomanUrduForEnglishTTS(romanized);
        matchedVoice =
          voices.find((v) => v.lang.toLowerCase().startsWith('en-pk')) ||
          voices.find((v) => v.lang.toLowerCase().startsWith('en-in')) ||
          voices.find((v) => v.lang.toLowerCase().startsWith('en')) ||
          voices[0];
        bcp47 = matchedVoice?.lang || 'en-US';
      }
    }

    const utterance = new SpeechSynthesisUtterance(spokenText);
    this.currentUtterance = utterance;
    utterance.lang = bcp47;
    utterance.rate = this.speed;
    utterance.pitch = 1.0;

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      this.isPlaying = true;
      this.isPaused = false;
      this.notify();
    };

    utterance.onend = () => {
      this.isPlaying = false;
      this.isPaused = false;
      this.currentUtterance = null;
      this.notify();
    };

    utterance.onerror = () => {
      this.isPlaying = false;
      this.isPaused = false;
      this.currentUtterance = null;
      this.notify();
    };

    utterance.onpause = () => {
      this.isPaused = true;
      this.notify();
    };

    utterance.onresume = () => {
      this.isPaused = false;
      this.notify();
    };

    try {
      this.synth.cancel();
      this.synth.speak(utterance);
    } catch (e) {
      console.warn('TTS playback error:', e);
      this.isPlaying = false;
      this.notify();
    }
  }

  public pause() {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      this.isPaused = true;
      this.notify();
      return;
    }
    if (this.synth && this.isPlaying && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
      this.notify();
    }
  }

  public resume() {
    if (this.currentAudio && this.isPaused) {
      this.currentAudio.play().catch(() => {});
      this.isPaused = false;
      this.notify();
      return;
    }
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.notify();
    }
  }

  public stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio.src = '';
      this.currentAudio = null;
    }
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (_) {}
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.currentUtterance = null;
    this.notify();
  }

  public replay() {
    if (this.currentText) {
      this.speak(this.currentText, this.currentLang || 'en');
    }
  }

  // Converts Roman Urdu text into Urdu Script so native Urdu TTS voice pronounces it with authentic accent & cadence
  private transliterateRomanToUrdu(text: string): string {
    const wordMap: Record<string, string> = {
      assalam: 'السلام',
      assalamu: 'السلام',
      alaikum: 'علیکم',
      'assalam-o-alaikum': 'السلام علیکم',
      aap: 'آپ',
      aapka: 'آپ کا',
      aapki: 'آپ کی',
      aapke: 'آپ کے',
      aapko: 'آپ کو',
      main: 'میں',
      mera: 'میرا',
      meri: 'میری',
      mere: 'میرے',
      mujhe: 'مجھے',
      mujhko: 'مجھ کو',
      hum: 'ہم',
      hamara: 'ہمارا',
      hamari: 'ہماری',
      hamare: 'ہمارے',
      woh: 'وہ',
      unka: 'ان کا',
      unki: 'ان کی',
      unke: 'ان کے',
      unhein: 'انہیں',
      yeh: 'یہ',
      is: 'اس',
      iska: 'اس کا',
      iski: 'اس کی',
      iske: 'اس کے',
      isko: 'اس کو',
      isse: 'اس سے',
      apna: 'اپنا',
      apni: 'اپنی',
      apne: 'اپنے',
      bukhar: 'بخار',
      dard: 'درد',
      sar: 'سر',
      khansi: 'کھانسی',
      balgham: 'بلغم',
      saans: 'سانس',
      takleef: 'تکلیف',
      pait: 'پیٹ',
      qai: 'قے',
      ulti: 'الٹی',
      dast: 'دست',
      kamzori: 'کمزوری',
      chakar: 'چکر',
      gala: 'گلا',
      khushk: 'خشک',
      kharash: 'خراش',
      seena: 'سینہ',
      seenay: 'سینے',
      dil: 'دل',
      dhadkan: 'دھڑکن',
      blood: 'بلڈ',
      pressure: 'پریشر',
      sugar: 'شوگر',
      khoon: 'خون',
      dawa: 'دوا',
      dawai: 'دوائی',
      dawaiyan: 'دوائیاں',
      tablet: 'ٹیبلٹ',
      syrup: 'شربت',
      goli: 'گولی',
      pani: 'پانی',
      piyein: 'پیئیں',
      peena: 'پینا',
      aaram: 'آرام',
      arram: 'آرام',
      karein: 'کریں',
      karo: 'کرو',
      karna: 'کرنا',
      khayein: 'کھائیں',
      khana: 'کھانا',
      din: 'دن',
      subah: 'صبح',
      dopahar: 'دوپہر',
      shaam: 'شام',
      raat: 'رات',
      ghante: 'گھنٹے',
      ghanton: 'گھنٹوں',
      baad: 'بعد',
      pehle: 'پہلے',
      saath: 'ساتھ',
      se: 'سے',
      ko: 'کو',
      ka: 'کا',
      ki: 'کی',
      ke: 'کے',
      mein: 'میں',
      par: 'پر',
      tak: 'تک',
      aur: 'اور',
      ya: 'یا',
      lekin: 'لیکن',
      agar: 'اگر',
      toh: 'تو',
      to: 'تو',
      bhi: 'بھی',
      nahi: 'نہیں',
      nahin: 'نہیں',
      mat: 'مت',
      hai: 'ہے',
      hain: 'ہیں',
      tha: 'تھا',
      thi: 'تھی',
      the: 'تھے',
      hoga: 'ہوگا',
      hogi: 'ہوگی',
      honge: 'ہوں گے',
      doctor: 'ڈاکٹر',
      dactar: 'ڈاکٹر',
      hospital: 'ہسپتال',
      qareebi: 'قریبی',
      foran: 'فوراً',
      fauri: 'فوری',
      emergency: 'ایمرجنسی',
      call: 'کال',
      check: 'چیک',
      report: 'رپورٹ',
      ilaaj: 'علاج',
      ilaj: 'علاج',
      sehat: 'صحت',
      saathi: 'ساتھی',
      pro: 'پرو',
      theek: 'ٹھیک',
      behtar: 'بہتر',
      shadeed: 'شدید',
      halka: 'ہلکا',
      halki: 'ہلکی',
      zyada: 'زیادہ',
      kam: 'کم',
      rozana: 'روزانہ',
      roz: 'روز',
      waqt: 'وقت',
      ehtiyat: 'احتیاط',
      garam: 'گرم',
      thand: 'ٹھنڈ',
      thanda: 'ٹھنڈا',
      thandi: 'ٹھنڈی',
      bachay: 'بچے',
      bacha: 'بچہ',
      buzurg: 'بزرگ',
      khasoosan: 'خصوصاً',
      zaroori: 'ضروری',
      faida: 'فائدہ',
      nuqsan: 'نقصان',
      hifazat: 'حفاظت',
    };

    return text
      .split(/(\s+|[.,!?;:()]+)/)
      .map((token) => {
        const clean = token.toLowerCase().trim();
        if (wordMap[clean]) {
          return wordMap[clean];
        }
        return token;
      })
      .join('');
  }

  // Phonetically softens Roman Urdu for standard English TTS so words are pronounced smoothly and never spelled out
  private prepareRomanUrduForEnglishTTS(text: string): string {
    return text
      // Replace typical letter combinations to prevent English spelling
      .replace(/\bAapko\b/gi, 'Aap ko')
      .replace(/\bAapki\b/gi, 'Aap kee')
      .replace(/\bAapka\b/gi, 'Aap kaa')
      .replace(/\bMujhe\b/gi, 'Moo-jhay')
      .replace(/\bBukhar\b/gi, 'Boo-khaar')
      .replace(/\bKhansi\b/gi, 'Khaan-see')
      .replace(/\bSaans\b/gi, 'Saance')
      .replace(/\bDawa\b/gi, 'Dawah')
      .replace(/\bDawai\b/gi, 'Dawaa-ee')
      .replace(/\bKarein\b/gi, 'Karayn')
      .replace(/\bHain\b/gi, 'Hine')
      .replace(/\bHai\b/gi, 'Hay')
      .replace(/\bNahi\b/gi, 'Na-hee')
      .replace(/\bNahin\b/gi, 'Na-heen')
      .replace(/\bZaroori\b/gi, 'Za-roo-ree')
      .replace(/\bDoctor\b/gi, 'Doctor')
      .replace(/\bHospital\b/gi, 'Hospital')
      .replace(/\bRescue\b/gi, 'Rescue');
  }

  // Transliterates Urdu Arabic script to clear phonetic Roman Urdu so standard TTS voices speak it audibly
  public transliterateUrduScriptToRoman(urduText: string): string {
    const directPhrases: Record<string, string> = {
      'یہ ایپ آپ کی رہنمائی کے لیے ہے، لیکن یہ کسی اصل ڈاکٹر کا متبادل نہیں ہے۔ کوئی بھی دوا لینے یا علاج شروع کرنے سے پہلے ہمیشہ مستند ڈاکٹر سے مشورہ کریں۔':
        'Yeh app aap ki rehnumai kay liye hai, lekin yeh kisi asal doctor ka mutabadil nahi hai. Koi bhi dawa laynay ya ilaaj shuru karnay say pehlay hamesha mustanad doctor say mashwara karein.',
      'اہم پیغام': 'Ahem Paigham',
      'ڈاکٹر کی تصدیق لازمی ہے': 'Doctor ki tasdeeq lazmi hai',
      'میں سمجھ گیا، جاری رکھیں': 'Main samajh gaya, jaari rakhein',
      'صحت ساتھی کلینیکل مانیٹر': 'SehatSaathi Clinical Monitor',
      'حقیقی انسانی دل اور ماہر ڈاکٹر': 'Haqeeqi insani dil aur maahir doctor',
    };

    const trimmed = urduText.trim();
    if (directPhrases[trimmed]) {
      return directPhrases[trimmed];
    }

    const wordDict: Record<string, string> = {
      'یہ': 'Yeh',
      'ایپ': 'App',
      'آپ': 'Aap',
      'کی': 'ki',
      'کے': 'kay',
      'کا': 'ka',
      'کو': 'ko',
      'سے': 'say',
      'میں': 'mein',
      'پر': 'par',
      'تک': 'tak',
      'اور': 'aur',
      'یا': 'ya',
      'ہے': 'hai',
      'ہیں': 'hain',
      'تھا': 'tha',
      'تھی': 'thi',
      'تھے': 'thay',
      'رہنمائی': 'rehnumai',
      'لیے': 'liye',
      'لیکن': 'lekin',
      'کسی': 'kisi',
      'اصل': 'asal',
      'ڈاکٹر': 'doctor',
      'متبادل': 'mutabadil',
      'نہیں': 'nahi',
      'کوئی': 'koi',
      'بھی': 'bhi',
      'دوا': 'dawa',
      'دوائی': 'dawai',
      'دوائیاں': 'dawaiyan',
      'لینے': 'laynay',
      'لینا': 'layna',
      'علاج': 'ilaaj',
      'شروع': 'shuru',
      'کرنے': 'karnay',
      'کرنا': 'karna',
      'کریں': 'karein',
      'پہلے': 'pehlay',
      'بعد': 'baad',
      'ہمیشہ': 'hamesha',
      'مستند': 'mustanad',
      'مشورہ': 'mashwara',
      'ضروری': 'zaroori',
      'احتیاط': 'ehtiyat',
      'بخار': 'bukhar',
      'کھانسی': 'khansi',
      'درد': 'dard',
      'سر': 'sar',
      'سینے': 'seenay',
      'سینہ': 'seena',
      'دل': 'dil',
      'سانس': 'saans',
      'تکلیف': 'takleef',
      'کمزوری': 'kamzori',
      'چکر': 'chakar',
      'ہسپتال': 'hospital',
      'ایمرجنسی': 'emergency',
      'فوری': 'fauri',
      'فوراً': 'foran',
      'صحت': 'sehat',
      'ساتھی': 'saathi',
      'بلڈ': 'blood',
      'پریشر': 'pressure',
      'شوگر': 'sugar',
      'خون': 'khoon',
      'گولی': 'goli',
      'شربت': 'sharbat',
      'آرام': 'aaram',
      'صبح': 'subah',
      'دوپہر': 'dopahar',
      'شام': 'shaam',
      'رات': 'raat',
      'روزانہ': 'rozana',
      'پانی': 'paani',
      'زیادہ': 'zyada',
      'کم': 'kam',
      'ٹھیک': 'theek',
      'بہتر': 'behtar',
      'شدید': 'shadeed',
      'ہلکا': 'halka',
    };

    return urduText
      .split(/(\s+|[.,!?;:()،۔]+)/)
      .map((token) => {
        const clean = token.trim();
        if (wordDict[clean]) {
          return wordDict[clean];
        }
        return token;
      })
      .join('');
  }
}

export const voiceManager = new VoiceService();

// Speech-To-Text Recognition helper
export interface SpeechRecognitionHelper {
  start: (
    lang: SupportedLanguage,
    onResult: (text: string) => void,
    onError?: (err: any) => void,
    onEnd?: () => void
  ) => void;
  stop: () => void;
  isSupported: boolean;
}

export function createSpeechRecognizer(): SpeechRecognitionHelper {
  const hasBrowserSTT =
    typeof window !== 'undefined' &&
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  const hasMediaRecorder =
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined';

  const isSupported = hasBrowserSTT || hasMediaRecorder;

  let recognitionInstance: any = null;
  let mediaStream: MediaStream | null = null;
  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: Blob[] = [];
  let isListening = false;
  let accumulatedTranscript = '';
  let activeLang: SupportedLanguage = 'ur';
  let activeOnResult: ((text: string) => void) | null = null;
  let activeOnError: ((err: any) => void) | null = null;
  let activeOnEnd: (() => void) | null = null;

  const transcribeViaServer = async (audioBlob: Blob, lang: SupportedLanguage) => {
    if (audioBlob.size < 500) {
      if (activeOnEnd) activeOnEnd();
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          if (!base64Data) {
            if (activeOnEnd) activeOnEnd();
            return;
          }

          const response = await fetch('/api/transcribe-audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64Data,
              mimeType: audioBlob.type || 'audio/webm',
              language: lang,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.transcript && data.transcript.trim()) {
              if (activeOnResult) activeOnResult(data.transcript.trim());
            }
          }
        } catch (serverErr) {
          console.warn('Server audio transcription error:', serverErr);
        } finally {
          if (activeOnEnd) activeOnEnd();
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (e) {
      console.warn('Error reading audio blob:', e);
      if (activeOnEnd) activeOnEnd();
    }
  };

  const stopAll = () => {
    isListening = false;

    // Stop web speech recognition
    if (recognitionInstance) {
      try {
        recognitionInstance.stop();
      } catch (e) {
        // ignore
      }
      recognitionInstance = null;
    }

    // Stop media recorder
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      try {
        mediaRecorder.stop();
      } catch (e) {
        // ignore
      }
    }

    // Stop microphone tracks
    if (mediaStream) {
      try {
        mediaStream.getTracks().forEach((track) => track.stop());
      } catch (e) {
        // ignore
      }
      mediaStream = null;
    }
  };

  return {
    isSupported,
    start: async (lang, onResult, onError, onEnd) => {
      stopAll();

      isListening = true;
      activeLang = lang;
      activeOnResult = onResult;
      activeOnError = onError || null;
      activeOnEnd = onEnd || null;
      accumulatedTranscript = '';
      audioChunks = [];

      // 1. Request microphone access for audio fallback recording
      if (hasMediaRecorder) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          mediaStream = stream;

          const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus'
            : MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : MediaRecorder.isTypeSupported('audio/mp4')
            ? 'audio/mp4'
            : '';

          const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
          mediaRecorder = recorder;

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              audioChunks.push(e.data);
            }
          };

          recorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: mimeType || 'audio/webm' });
            // If browser recognition did not yield text or if Roman which requires specialized models
            if (!accumulatedTranscript.trim() || lang === 'roman') {
              transcribeViaServer(audioBlob, lang);
            } else {
              if (activeOnEnd) activeOnEnd();
            }
          };

          recorder.start(250);
        } catch (micErr: any) {
          console.warn('Microphone recording error (will rely on browser STT if available):', micErr);
        }
      }

      // 2. Browser Web Speech Recognition (for instant streaming interim results where supported)
      if (hasBrowserSTT) {
        try {
          const SpeechRec =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          recognitionInstance = new SpeechRec();

          // Select primary locale
          let chosenLocale = LANGUAGES[lang]?.bcp47 || 'ur-PK';
          if (lang === 'roman') {
            chosenLocale = 'ur-PK';
          }

          recognitionInstance.lang = chosenLocale;
          recognitionInstance.continuous = false;
          recognitionInstance.interimResults = true;

          recognitionInstance.onresult = (event: any) => {
            let current = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              current += event.results[i][0].transcript;
            }
            if (current.trim()) {
              accumulatedTranscript = current.trim();
              // For English and Urdu, emit browser result immediately
              if (lang === 'en' || lang === 'ur') {
                onResult(accumulatedTranscript);
              }
            }
          };

          recognitionInstance.onerror = (event: any) => {
            console.warn('Browser speech recognition warning:', event.error);
            // If language is not supported natively in browser, do NOT fail the user!
            // The media recorder will pass the audio to the server endpoint!
            if (event.error !== 'language-not-supported' && event.error !== 'no-speech') {
              if (onError && !hasMediaRecorder) onError(event);
            }
          };

          recognitionInstance.onend = () => {
            if (isListening && accumulatedTranscript.trim() && (lang === 'en' || lang === 'ur')) {
              stopAll();
              if (onEnd) onEnd();
            }
          };

          recognitionInstance.start();
        } catch (e) {
          console.warn('Browser SpeechRec start warning:', e);
        }
      }
    },
    stop: () => {
      stopAll();
    },
  };
}
