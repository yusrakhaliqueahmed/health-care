import React, { useEffect, useRef } from 'react';
import { SupportedLanguage } from '../types';
import { voiceManager } from '../services/voice';
import { AlertTriangle, Camera, Upload, Video, Volume2, RefreshCw, X } from 'lucide-react';

interface InvalidUploadAlertProps {
  reason?: 'not_medical' | 'not_medicine' | 'unclear_blurry';
  customAlertText?: string;
  customSpokenText?: string;
  currentLanguage: SupportedLanguage;
  onTakePhoto?: () => void;
  onUploadGallery?: () => void;
  onRecordVideo?: () => void;
  onDismiss?: () => void;
  autoSpeak?: boolean;
}

export const InvalidUploadAlert: React.FC<InvalidUploadAlertProps> = ({
  reason = 'not_medical',
  customAlertText,
  customSpokenText,
  currentLanguage,
  onTakePhoto,
  onUploadGallery,
  onRecordVideo,
  onDismiss,
  autoSpeak = true,
}) => {
  const lastSpokenRef = useRef<string>('');

  // Localized alert text
  let alertText = customAlertText || '';
  let spokenText = customSpokenText || alertText;

  if (!alertText) {
    if (reason === 'not_medicine') {
      alertText =
        currentLanguage === 'ur'
          ? 'یہ تصویر کسی دوا کی ڈبیا، پتی یا نسخہ معلوم نہیں ہوتی۔ برائے مہربانی دوا کی درست تصویر یا ویڈیو اپلوڈ کریں۔'
          : currentLanguage === 'roman'
          ? 'Yeh picture kisi dawai ki packaging ya prescription nahi lagti. Baraye meherbani sahi medicine ki photo ya video upload karein.'
          : "This doesn't appear to be a medicine bottle, tablet strip, or prescription. Please upload the correct medicine picture or video.";
      spokenText = alertText;
    } else if (reason === 'unclear_blurry') {
      alertText =
        currentLanguage === 'ur'
          ? 'یہ میڈیکل تصویر بہت دھندلی یا اندھیرے میں ہے اور پڑھی نہیں جا رہی۔ برائے مہربانی اچھی روشنی میں صاف تصویر یا ویڈیو دوبارہ لیں۔'
          : currentLanguage === 'roman'
          ? 'Yeh picture bohat dhundli ya andheray mein hai. Baraye meherbani achi roshni mein saaf photo ya video dobara lein.'
          : 'This image is too blurry or dark to read clearly. Please retake a clear, steady photo or video with good lighting.';
      spokenText = alertText;
    } else {
      // General not medical report/X-ray/medicine photo
      alertText =
        currentLanguage === 'ur'
          ? 'یہ تصویر یا ویڈیو کوئی میڈیکل رپورٹ، ایکسرے یا دوا کی تصویر معلوم نہیں ہوتی۔ برائے مہربانی درست میڈیکل رپورٹ یا دوا کی تصویر یا ویڈیو اپلوڈ کریں۔'
          : currentLanguage === 'roman'
          ? 'Yeh picture ya video koi medical report, X-ray ya medicine ki photo nahi lagti. Baraye meherbani sahi medicine ya medical report ki photo ya video upload karein.'
          : "This doesn't appear to be a medical report, X-ray, or medicine photo. Please upload or capture the correct medicine or medical report picture or video.";
      spokenText = alertText;
    }
  }

  // Voice output spoken aloud once automatically
  useEffect(() => {
    if (autoSpeak && spokenText && lastSpokenRef.current !== spokenText) {
      lastSpokenRef.current = spokenText;
      voiceManager.stop();
      voiceManager.speak(spokenText, currentLanguage);
    }
  }, [spokenText, currentLanguage, autoSpeak]);

  // Stop sound on unmount
  useEffect(() => {
    return () => {
      voiceManager.stop();
    };
  }, []);

  const handleReplay = () => {
    voiceManager.stop();
    voiceManager.speak(spokenText, currentLanguage);
  };

  return (
    <div
      id="invalid-upload-alert-card"
      className="p-5 sm:p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-300 dark:border-rose-800 shadow-md text-rose-950 dark:text-rose-100 space-y-4 animate-in fade-in slide-in-from-top-2"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-200 dark:bg-rose-900/80 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-rose-900 dark:text-rose-200">
                {currentLanguage === 'ur'
                  ? 'غیر متعلقہ یا ناقابل تصدیق فائل'
                  : currentLanguage === 'roman'
                  ? 'Ghair Mutaliqa File / Invalid Upload'
                  : 'Invalid / Unrelated Upload Detected'}
              </h3>
              <button
                type="button"
                onClick={handleReplay}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-200 dark:bg-rose-800 text-rose-900 dark:text-rose-100 hover:bg-rose-300 dark:hover:bg-rose-700 text-xs font-bold transition-all"
                title="Hear voice alert"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{currentLanguage === 'ur' ? 'آواز سنیں' : currentLanguage === 'roman' ? 'Awaz Sunein' : 'Listen'}</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-rose-800 dark:text-rose-200 leading-relaxed font-medium">
              {alertText}
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-rose-600 hover:text-rose-900 dark:text-rose-400 p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Guide user on what to do next with 3 easily accessible options */}
      <div className="pt-2 border-t border-rose-200 dark:border-rose-800/80">
        <p className="text-xs font-bold text-rose-900 dark:text-rose-200 mb-2.5">
          {currentLanguage === 'ur'
            ? 'برائے مہربانی درج ذیل میں سے ایک طریقہ منتخب کر کے درست تصویر یا ویڈیو دیں:'
            : currentLanguage === 'roman'
            ? 'Baraye meherbani neechay diye gaye tareeqon se dobara koshish karein:'
            : 'Please choose an option below to upload the correct medical document, X-ray, or medicine:'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          {onTakePhoto && (
            <button
              type="button"
              onClick={onTakePhoto}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700 hover:border-teal-600 dark:hover:border-teal-500 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-xs hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-all min-h-[44px]"
            >
              <Camera className="w-4 h-4 text-teal-600" />
              <span>
                {currentLanguage === 'ur'
                  ? '📷 کیمرے سے تصویر لیں'
                  : currentLanguage === 'roman'
                  ? '📷 Take Photo'
                  : '📷 Take Photo'}
              </span>
            </button>
          )}

          {onUploadGallery && (
            <button
              type="button"
              onClick={onUploadGallery}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700 hover:border-teal-600 dark:hover:border-teal-500 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-xs hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-all min-h-[44px]"
            >
              <Upload className="w-4 h-4 text-teal-600" />
              <span>
                {currentLanguage === 'ur'
                  ? '🖼️ گیلری سے اپلوڈ کریں'
                  : currentLanguage === 'roman'
                  ? '🖼️ Upload from Gallery'
                  : '🖼️ Upload from Gallery'}
              </span>
            </button>
          )}

          {onRecordVideo && (
            <button
              type="button"
              onClick={onRecordVideo}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700 hover:border-teal-600 dark:hover:border-teal-500 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-xs hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-all min-h-[44px]"
            >
              <Video className="w-4 h-4 text-teal-600" />
              <span>
                {currentLanguage === 'ur'
                  ? '🎥 ویڈیو ریکارڈ کریں'
                  : currentLanguage === 'roman'
                  ? '🎥 Record Video'
                  : '🎥 Record Video'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
