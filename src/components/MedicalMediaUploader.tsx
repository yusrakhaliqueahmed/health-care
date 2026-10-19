import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Video,
  Upload,
  Film,
  X,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Maximize2,
  SwitchCamera,
  Sparkles,
} from 'lucide-react';
import { SupportedLanguage } from '../types';

export interface CapturedMediaItem {
  dataUrl: string; // Base64 JPEG for AI analysis (image or extracted video frame)
  videoUrl?: string; // Object URL or base64 if a video was recorded/uploaded
  fileType: 'image' | 'video' | 'pdf';
  fileName?: string;
  duration?: number;
}

interface MedicalMediaUploaderProps {
  currentLanguage: SupportedLanguage;
  mediaType?: 'xray' | 'report' | 'symptom';
  onMediaCaptured: (item: CapturedMediaItem) => void;
  existingMedia?: CapturedMediaItem | null;
  onClear?: () => void;
  className?: string;
  allowMultiplePages?: boolean;
  onMultiplePagesCaptured?: (items: CapturedMediaItem[]) => void;
}

export const MedicalMediaUploader: React.FC<MedicalMediaUploaderProps> = ({
  currentLanguage,
  mediaType = 'xray',
  onMediaCaptured,
  existingMedia,
  onClear,
  className = '',
}) => {
  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';

  // Modal state for in-app live camera / video recorder
  const [isLiveRecorderOpen, setIsLiveRecorderOpen] = useState(false);
  const [recorderMode, setRecorderMode] = useState<'photo' | 'video'>('video');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [recorderError, setRecorderError] = useState<string | null>(null);

  // Hidden native file inputs
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const cameraPhotoInputRef = useRef<HTMLInputElement>(null);
  const cameraVideoInputRef = useRef<HTMLInputElement>(null);

  // Media streams & recording refs
  const videoStreamRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Clean up stream on unmount or modal close
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  // Start live in-app camera
  const openLiveCaptureModal = async (mode: 'photo' | 'video') => {
    setRecorderMode(mode);
    setRecorderError(null);
    setIsLiveRecorderOpen(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera streaming not supported');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: mode === 'video', // audio optional for video
      });

      mediaStreamRef.current = stream;
      if (videoStreamRef.current) {
        videoStreamRef.current.srcObject = stream;
        videoStreamRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('In-app getUserMedia fallback to native capture input:', err);
      // If live stream is blocked (e.g. strict iframe permissions or camera in use),
      // seamlessly trigger the device's native camera input!
      setIsLiveRecorderOpen(false);
      if (mode === 'photo') {
        cameraPhotoInputRef.current?.click();
      } else {
        cameraVideoInputRef.current?.click();
      }
    }
  };

  const closeLiveCaptureModal = () => {
    stopCameraStream();
    setIsLiveRecorderOpen(false);
  };

  const toggleCameraFacing = async () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    stopCameraStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: nextFacing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: recorderMode === 'video',
      });
      mediaStreamRef.current = stream;
      if (videoStreamRef.current) {
        videoStreamRef.current.srcObject = stream;
        videoStreamRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn('Switch camera error:', err);
    }
  };

  // Capture a still frame from live viewfinder
  const captureStillPhotoFromStream = () => {
    if (!videoStreamRef.current) return;
    const video = videoStreamRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    closeLiveCaptureModal();
    onMediaCaptured({
      dataUrl,
      fileType: 'image',
      fileName: `camera_${Date.now()}.jpg`,
    });
  };

  // Start live video recording
  const startLiveRecording = () => {
    if (!mediaStreamRef.current) return;
    recordedChunksRef.current = [];

    try {
      const options = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? { mimeType: 'video/webm;codecs=vp9' }
        : MediaRecorder.isTypeSupported('video/webm')
        ? { mimeType: 'video/webm' }
        : MediaRecorder.isTypeSupported('video/mp4')
        ? { mimeType: 'video/mp4' }
        : undefined;

      const mediaRecorder = new MediaRecorder(mediaStreamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || 'video/webm';
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const videoFile = new File([blob], `xray_recording_${Date.now()}.webm`, { type: mimeType });
        await processVideoFile(videoFile);
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 29) {
            // Auto cap at 30 seconds for optimal speed
            stopLiveRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.warn('Failed to start MediaRecorder:', err);
      setRecorderError(
        isUrdu
          ? 'براہ راست ریکارڈنگ شروع نہ ہو سکی۔ برائے مہربانی ویڈیو فائل منتخب کریں۔'
          : 'Could not record live video. Please select a video file.'
      );
    }
  };

  // Stop live video recording and extract frame
  const stopLiveRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsRecording(false);
    closeLiveCaptureModal();
  };

  // Process a selected or recorded video file:
  // 1. Create a video playback URL
  // 2. Draw a high-contrast representative frame at 1s / midpoint on canvas for AI OCR/Vision
  const processVideoFile = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      const videoUrl = URL.createObjectURL(file);
      video.src = videoUrl;

      video.onloadeddata = () => {
        // Seek to 1s or middle to get past initial shaky start
        const targetTime = Math.min(1.2, (video.duration || 2) / 2);
        video.currentTime = targetTime;
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 1280;
          canvas.height = video.videoHeight || 720;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const frameDataUrl = canvas.toDataURL('image/jpeg', 0.92);

            onMediaCaptured({
              dataUrl: frameDataUrl,
              videoUrl,
              fileType: 'video',
              fileName: file.name,
              duration: Math.round(video.duration || 0),
            });
            resolve();
            return;
          }
          resolve();
        } catch (err) {
          reject(err);
        }
      };

      video.onerror = () => {
        console.warn('Video load error, using file without extracted frame');
        const reader = new FileReader();
        reader.onload = () => {
          onMediaCaptured({
            dataUrl: reader.result as string,
            videoUrl,
            fileType: 'video',
            fileName: file.name,
          });
          resolve();
        };
        reader.readAsDataURL(file);
      };
    });
  };

  // Handle image upload from file picker
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      // PDF document handling
      const reader = new FileReader();
      reader.onload = () => {
        onMediaCaptured({
          dataUrl: reader.result as string,
          fileType: 'pdf',
          fileName: file.name,
        });
      };
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onMediaCaptured({
        dataUrl: reader.result as string,
        fileType: 'image',
        fileName: file.name,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle video upload from file picker
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processVideoFile(file);
    e.target.value = '';
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden File Inputs for all standard web & mobile device triggers */}
      <input
        ref={imageFileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleImageFileChange}
      />
      <input
        ref={videoFileInputRef}
        type="file"
        accept="video/*,.mp4,.webm,.mov,.mkv"
        className="hidden"
        onChange={handleVideoFileChange}
      />
      <input
        ref={cameraPhotoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageFileChange}
      />
      <input
        ref={cameraVideoInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={handleVideoFileChange}
      />

      {/* 4 SIMULTANEOUS BUTTONS VISIBLE AT A TIME */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold px-0.5">
          <span>
            {mediaType === 'xray'
              ? isUrdu
                ? 'ایکسرے / رپورٹ کے لیے دستیاب 4 آپشنز:'
                : isRoman
                ? 'X-Ray / Report ke 4 Options:'
                : '4 Media Options for X-Ray / Report:'
              : isUrdu
              ? 'تصویر یا ویڈیو منسلک کرنے کے آپشنز:'
              : 'Choose Live Camera, Video, or File:'}
          </span>
          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold">
            {isUrdu ? 'تمام ایک وقت میں دستیاب' : 'Available at a time'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          {/* 1. Take Live Photo */}
          <button
            type="button"
            id="btn-take-live-photo"
            onClick={() => openLiveCaptureModal('photo')}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-teal-200 dark:border-teal-800 hover:border-teal-500 dark:hover:border-teal-400 hover:bg-teal-50/60 dark:hover:bg-teal-950/40 text-slate-800 dark:text-slate-100 shadow-xs transition-all text-center cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold leading-tight">
              {isUrdu ? 'کیمرے سے تصویر لیں' : isRoman ? 'Live Photo Lein' : 'Take Live Photo'}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-400 hidden sm:inline">
              {isUrdu ? 'فوری تصویر کھینچیں' : 'Direct Camera'}
            </span>
          </button>

          {/* 2. Record Live Video */}
          <button
            type="button"
            id="btn-record-live-video"
            onClick={() => openLiveCaptureModal('video')}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-rose-200 dark:border-rose-900/60 hover:border-rose-500 dark:hover:border-rose-400 hover:bg-rose-50/60 dark:hover:bg-rose-950/40 text-slate-800 dark:text-slate-100 shadow-xs transition-all text-center cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Video className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold leading-tight text-rose-900 dark:text-rose-200">
              {isUrdu ? 'لائیو ویڈیو بنائیں' : isRoman ? 'Video Record Karein' : 'Record Live Video'}
            </span>
            <span className="text-[10px] text-rose-500 dark:text-rose-400 font-semibold hidden sm:inline">
              {isUrdu ? 'ایکسرے / اسکین کی ویڈیو' : 'X-Ray Viewbox Video'}
            </span>
          </button>

          {/* 3. Upload Downloaded / Saved Image or PDF */}
          <button
            type="button"
            id="btn-upload-saved-image"
            onClick={() => imageFileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-100 shadow-xs transition-all text-center cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold leading-tight">
              {isUrdu ? 'ڈاؤنلوڈ شدہ تصویر / PDF' : isRoman ? 'Saved Photo / PDF' : 'Upload Image / PDF'}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-400 hidden sm:inline">
              {isUrdu ? 'گیلری یا فائلز سے' : 'Gallery & Files'}
            </span>
          </button>

          {/* 4. Upload Video File */}
          <button
            type="button"
            id="btn-upload-video-file"
            onClick={() => videoFileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-100 shadow-xs transition-all text-center cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold leading-tight">
              {isUrdu ? 'ویڈیو فائل اپلوڈ کریں' : isRoman ? 'Video File Upload' : 'Upload Video File'}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-400 hidden sm:inline">
              {isUrdu ? 'MP4, MOV, WebM' : 'MP4, MOV, WebM'}
            </span>
          </button>
        </div>
      </div>

      {/* MEDIA PREVIEW CARD (When an item is attached) */}
      {existingMedia && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-teal-50 dark:bg-slate-800/90 border-2 border-teal-300 dark:border-teal-700 shadow-sm animate-in fade-in slide-in-from-top-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Media Thumbnail / Video Preview */}
              {existingMedia.fileType === 'video' ? (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-black border border-teal-400 shrink-0">
                  {existingMedia.videoUrl ? (
                    <video
                      src={existingMedia.videoUrl}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      controls
                    />
                  ) : (
                    <img
                      src={existingMedia.dataUrl}
                      alt="Video frame"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/75 text-[9px] font-bold text-white flex items-center gap-0.5">
                    <Film className="w-2.5 h-2.5 text-rose-400" />
                    <span>VID</span>
                  </span>
                </div>
              ) : existingMedia.fileType === 'pdf' ? (
                <div className="w-20 h-20 rounded-xl bg-rose-100 dark:bg-rose-950 border border-rose-300 flex flex-col items-center justify-center text-rose-700 shrink-0">
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold">PDF FILE</span>
                </div>
              ) : (
                <img
                  src={existingMedia.dataUrl}
                  alt="Medical Document"
                  className="w-20 h-20 object-cover rounded-xl border border-teal-400 shrink-0 shadow-xs"
                />
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-200 dark:bg-teal-900/80 text-teal-900 dark:text-teal-200 text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 dark:text-teal-300" />
                    {existingMedia.fileType === 'video'
                      ? isUrdu
                        ? 'ویڈیو ریکارڈنگ منسلک ہے'
                        : 'X-Ray Video Attached'
                      : isUrdu
                      ? 'طبی تصویر منسلک ہے'
                      : 'Medical Media Attached'}
                  </span>
                  {existingMedia.fileType === 'video' && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 text-[10px] font-semibold">
                      <Sparkles className="w-3 h-3" />
                      {isUrdu ? 'تشخیصی فریم برآمد شدہ' : 'AI Diagnostic Frame Extracted'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {existingMedia.fileName ||
                    (existingMedia.fileType === 'video'
                      ? 'xray_scan_recording.webm'
                      : 'medical_report_photo.jpg')}
                </p>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isUrdu
                    ? 'یہ فائل اے آئی تجزیہ اور ڈاکٹر کے ریویو کے لیے استعمال ہوگی۔'
                    : 'This media will be examined by AI and attached to the doctor case file.'}
                </p>
              </div>
            </div>

            {/* Clear / Retake Button */}
            {onClear && (
              <button
                type="button"
                onClick={onClear}
                className="self-end sm:self-center px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'ہٹائیں / دوبارہ لیں' : 'Remove / Retake'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* IN-APP LIVE CAMERA / VIDEO RECORDER MODAL */}
      {isLiveRecorderOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
          <div className="relative w-full max-w-xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800/80 border-b border-slate-700">
              <div className="flex items-center gap-2">
                {recorderMode === 'video' ? (
                  <Video className="w-5 h-5 text-rose-400" />
                ) : (
                  <Camera className="w-5 h-5 text-teal-400" />
                )}
                <h3 className="font-bold text-sm sm:text-base text-white">
                  {recorderMode === 'video'
                    ? isUrdu
                      ? 'لائیو ایکسرے / رپورٹ ویڈیو ریکارڈنگ'
                      : 'Live X-Ray / Report Video Recorder'
                    : isUrdu
                    ? 'لائیو طبی تصویر کیمرہ'
                    : 'Live Medical Camera'}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                  title="Switch Camera (Front/Back)"
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={closeLiveCaptureModal}
                  className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Stream Viewfinder */}
            <div className="relative flex-1 bg-black flex items-center justify-center min-h-[320px] overflow-hidden">
              <video
                ref={videoStreamRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full max-h-[55vh] object-contain"
              />

              {/* Viewfinder Target Guidelines for X-Ray */}
              <div className="absolute inset-6 border border-white/20 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between text-[11px] text-white/60 font-mono">
                  <span>[ SEHAT-SAATHI MEDICAL VISION ]</span>
                  <span>{recorderMode === 'video' ? 'VIDEO REC' : 'STILL PHOTO'}</span>
                </div>
                <div className="text-center text-xs text-white/70 bg-black/40 backdrop-blur-xs py-1 px-3 rounded-full mx-auto">
                  {recorderMode === 'video'
                    ? isUrdu
                      ? 'ایکسرے کو کیمرے کے سامنے رکھیں اور ریکارڈنگ کا بٹن دبائیں'
                      : 'Hold camera steadily over X-ray viewbox or light window'
                    : isUrdu
                    ? 'رپورٹ یا علامت کو چوکھٹے کے اندر لائیں'
                    : 'Position medical document or symptom inside frame'}
                </div>
              </div>

              {/* Live Recording Red Indicator & Timer */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-600/90 text-white font-mono text-xs font-bold shadow-lg animate-pulse">
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  <span>REC {formatSeconds(recordingSeconds)} / 00:30</span>
                </div>
              )}

              {/* Error Message if any */}
              {recorderError && (
                <div className="absolute inset-x-4 bottom-4 p-3 rounded-xl bg-rose-950/90 border border-rose-500 text-rose-200 text-xs font-medium text-center">
                  {recorderError}
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="p-4 sm:p-5 bg-slate-850 bg-slate-900 border-t border-slate-800 flex items-center justify-around">
              {recorderMode === 'photo' ? (
                // Still photo capture button
                <button
                  type="button"
                  onClick={captureStillPhotoFromStream}
                  className="px-6 py-3 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm shadow-xl flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                >
                  <Camera className="w-5 h-5" />
                  <span>{isUrdu ? 'تصویر کھینچیں' : 'Capture Photo'}</span>
                </button>
              ) : !isRecording ? (
                // Start Video Recording button
                <button
                  type="button"
                  onClick={startLiveRecording}
                  className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl flex items-center gap-2.5 cursor-pointer transition-transform active:scale-95"
                >
                  <div className="w-4 h-4 rounded-full bg-white" />
                  <span>{isUrdu ? 'ویڈیو ریکارڈنگ شروع کریں' : 'Start Video Recording'}</span>
                </button>
              ) : (
                // Stop Video Recording button
                <button
                  type="button"
                  onClick={stopLiveRecording}
                  className="px-6 py-3 rounded-full bg-white hover:bg-slate-200 text-rose-700 font-black text-sm shadow-xl flex items-center gap-2.5 cursor-pointer transition-transform active:scale-95"
                >
                  <div className="w-4 h-4 rounded-sm bg-rose-600" />
                  <span>{isUrdu ? 'ریکارڈنگ مکمل کریں (Save Video)' : 'Stop & Use Video'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
