import React, { useEffect, useRef } from 'react';
import { SupportedLanguage } from '../types';
import { voiceManager } from '../services/voice';
import { AlertCircle, Volume2, Sparkles, X } from 'lucide-react';

interface SmartValidationAlertProps {
  alertText: string;
  spokenText?: string;
  currentLanguage: SupportedLanguage;
  suggestion?: string;
  onApplySuggestion?: (suggestion: string) => void;
  onDismiss?: () => void;
  autoSpeak?: boolean;
}

export const SmartValidationAlert: React.FC<SmartValidationAlertProps> = ({
  alertText,
  spokenText,
  currentLanguage,
  suggestion,
  onApplySuggestion,
  onDismiss,
  autoSpeak = true,
}) => {
  const textToSpeak = spokenText || alertText;
  const lastSpokenRef = useRef<string>('');

  // Speak aloud once when alert text appears or changes
  useEffect(() => {
    if (autoSpeak && textToSpeak && lastSpokenRef.current !== textToSpeak) {
      lastSpokenRef.current = textToSpeak;
      voiceManager.stop();
      voiceManager.speak(textToSpeak, currentLanguage);
    }
  }, [textToSpeak, currentLanguage, autoSpeak]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      voiceManager.stop();
    };
  }, []);

  const handleReplayVoice = () => {
    voiceManager.stop();
    voiceManager.speak(textToSpeak, currentLanguage);
  };

  const suggestionPillLabel =
    currentLanguage === 'ur'
      ? `کیا آپ کی مراد "${suggestion}" ہے؟ منتخب کرنے کے لیے ٹیپ کریں`
      : currentLanguage === 'roman'
      ? `Did you mean "${suggestion}"? Tap to apply`
      : `Did you mean "${suggestion}"? Tap to apply`;

  return (
    <div
      id="smart-input-validation-alert"
      className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 shadow-sm text-amber-900 dark:text-amber-100 animate-in fade-in slide-in-from-top-1 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-900/80 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-semibold leading-relaxed">
                {alertText}
              </span>
              <button
                type="button"
                onClick={handleReplayVoice}
                title="Hear voice alert"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-200/70 dark:bg-amber-800 text-amber-900 dark:text-amber-200 hover:bg-amber-300 dark:hover:bg-amber-700 text-[11px] font-bold transition-all"
              >
                <Volume2 className="w-3 h-3 text-amber-700 dark:text-amber-300" />
                <span>
                  {currentLanguage === 'ur' ? 'آواز سنیں' : currentLanguage === 'roman' ? 'Awaz Sunein' : 'Listen'}
                </span>
              </button>
            </div>

            {/* Tappable suggestion if available */}
            {suggestion && onApplySuggestion && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => onApplySuggestion(suggestion)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition-transform active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{suggestionPillLabel}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-amber-700 hover:text-amber-950 dark:text-amber-400 p-1 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
