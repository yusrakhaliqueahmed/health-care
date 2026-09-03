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
  private stateListeners: Set<VoiceStateListener> = new Set();
  private isPlaying = false;
  private isPaused = false;
  private currentText = '';
  private speed = 1.0;
  private isAutoPlayEnabled = true;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
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
    if (this.isPlaying && this.currentText) {
      // Re-trigger with new rate
      const savedText = this.currentText;
      const lang = (this.currentUtterance?.lang as any) || 'en-US';
      this.stop();
      this.speak(savedText, lang);
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
    if (!this.synth) return;

    this.stop();

    // Clean markdown symbols for clearer speech
    const cleanText = rawText
      .replace(/[*_#`~[\]]/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    if (!cleanText) return;

    this.currentText = cleanText;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance = utterance;

    // Resolve BCP-47 tag
    let bcp47 = 'en-US';
    if (typeof lang === 'string' && (lang in LANGUAGES)) {
      bcp47 = LANGUAGES[lang as SupportedLanguage].bcp47;
    } else if (typeof lang === 'string' && lang.includes('-')) {
      bcp47 = lang;
    }

    utterance.lang = bcp47;
    utterance.rate = this.speed;
    utterance.pitch = 1.0;

    // Try finding best matching voice available on system
    const voices = this.synth.getVoices?.() || [];
    const matchedVoice = voices.find((v) =>
      v.lang.toLowerCase().startsWith(bcp47.slice(0, 2).toLowerCase())
    );
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
      this.synth.speak(utterance);
    } catch (e) {
      console.warn('TTS playback error:', e);
      this.isPlaying = false;
      this.notify();
    }
  }

  public pause() {
    if (this.synth && this.isPlaying && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
      this.notify();
    }
  }

  public resume() {
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.notify();
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.currentUtterance = null;
    this.notify();
  }

  public replay() {
    if (this.currentText) {
      const text = this.currentText;
      const lang = this.currentUtterance?.lang || 'en-US';
      this.speak(text, lang);
    }
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
  const isSupported =
    typeof window !== 'undefined' &&
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  let recognitionInstance: any = null;

  return {
    isSupported,
    start: (lang, onResult, onError, onEnd) => {
      if (!isSupported) {
        if (onError) onError(new Error('Speech recognition not supported in this browser'));
        return;
      }

      try {
        const SpeechRec =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionInstance = new SpeechRec();

        const langInfo = LANGUAGES[lang] || LANGUAGES.en;
        recognitionInstance.lang = langInfo.bcp47;
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = true;

        recognitionInstance.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript.trim()) {
            onResult(transcript.trim());
          }
        };

        recognitionInstance.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          if (onError) onError(event);
        };

        recognitionInstance.onend = () => {
          if (onEnd) onEnd();
        };

        recognitionInstance.start();
      } catch (e) {
        console.error('Failed to start speech recognition:', e);
        if (onError) onError(e);
      }
    },
    stop: () => {
      if (recognitionInstance) {
        try {
          recognitionInstance.stop();
        } catch (e) {
          // ignore
        }
      }
    },
  };
}
