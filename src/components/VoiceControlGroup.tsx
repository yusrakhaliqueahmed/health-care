import React, { useEffect, useState } from 'react';
import { Play, Pause, Square, Volume2, Gauge, Mic, MicOff, Radio } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { voiceManager } from '../services/voice';

export interface VoiceControlGroupProps {
  currentLanguage: SupportedLanguage;
  textToSpeak?: string;
  label?: string;
  variant?: 'bar' | 'compact' | 'minimal' | 'card';
  size?: 'sm' | 'md' | 'lg';
  showSpeed?: boolean;
  showWaveform?: boolean;
  className?: string;
  // Optional custom audio playback hooks
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;

  // Optional recording mode support (when controlling voice input / microphone)
  mode?: 'playback' | 'recording';
  isRecording?: boolean;
  isRecordingPaused?: boolean;
  onStartRecording?: () => void;
  onPauseRecording?: () => void;
  onResumeRecording?: () => void;
  onStopRecording?: () => void;
}

export const VoiceControlGroup: React.FC<VoiceControlGroupProps> = ({
  currentLanguage,
  textToSpeak,
  label,
  variant = 'bar',
  size = 'md',
  showSpeed = true,
  showWaveform = true,
  className = '',
  onPlay,
  onPause,
  onStop,
  mode = 'playback',
  isRecording = false,
  isRecordingPaused = false,
  onStartRecording,
  onPauseRecording,
  onResumeRecording,
  onStopRecording,
}) => {
  const [voiceState, setVoiceState] = useState({
    isPlaying: false,
    isPaused: false,
    text: '',
    speed: 1.0,
  });

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';

  useEffect(() => {
    if (mode === 'playback') {
      const unsubscribe = voiceManager.subscribe((state) => {
        setVoiceState(state);
      });
      return () => unsubscribe();
    }
  }, [mode]);

  // Handle Play / Resume / Start
  const handlePlayOrResume = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (mode === 'recording') {
      if (isRecordingPaused && onResumeRecording) {
        onResumeRecording();
      } else if (onStartRecording) {
        onStartRecording();
      }
      return;
    }

    // Playback mode
    if (voiceState.isPaused) {
      if (onPlay) onPlay();
      else voiceManager.resume();
    } else if (textToSpeak) {
      if (onPlay) onPlay();
      else voiceManager.speak(textToSpeak, currentLanguage);
    } else if (voiceState.text) {
      if (onPlay) onPlay();
      else voiceManager.replay();
    }
  };

  // Handle Pause
  const handlePause = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (mode === 'recording') {
      if (onPauseRecording) onPauseRecording();
      return;
    }

    if (onPause) onPause();
    else voiceManager.pause();
  };

  // Handle Stop
  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (mode === 'recording') {
      if (onStopRecording) onStopRecording();
      return;
    }

    if (onStop) onStop();
    else voiceManager.stop();
  };

  // Cycle voice speed
  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const speeds = [0.8, 1.0, 1.25];
    const currentIndex = speeds.indexOf(voiceState.speed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    voiceManager.setSpeed(nextSpeed);
  };

  // Status flags
  const isPlaybackActive = mode === 'playback' && voiceState.isPlaying;
  const isPlaybackPaused = mode === 'playback' && voiceState.isPaused;
  const isPlaybackActiveOrPaused = mode === 'playback' && (voiceState.isPlaying || voiceState.isPaused);

  const isRecActive = mode === 'recording' && isRecording;
  const isRecPaused = mode === 'recording' && isRecordingPaused;
  const isRecActiveOrPaused = mode === 'recording' && (isRecording || isRecordingPaused);

  const isAnyActive = mode === 'recording' ? isRecActive : isPlaybackActive;
  const isAnyPaused = mode === 'recording' ? isRecPaused : isPlaybackPaused;
  const canPause = mode === 'recording' ? (isRecording && !isRecordingPaused) : (voiceState.isPlaying && !voiceState.isPaused);
  const canStop = mode === 'recording' ? isRecActiveOrPaused : isPlaybackActiveOrPaused;

  // Localized Labels
  const playLabel = isAnyPaused
    ? (isUrdu ? 'جاری رکھیں' : isRoman ? 'Jari Rakhein' : t.audioResume || 'Resume')
    : isAnyActive
    ? mode === 'recording'
      ? (isUrdu ? 'سن رہا ہوں...' : isRoman ? 'Sun raha hoon...' : 'Listening...')
      : (isUrdu ? 'چل رہا ہے' : isRoman ? 'Chal Raha Hai' : 'Playing')
    : mode === 'recording'
    ? (isUrdu ? 'بولیں' : isRoman ? 'Bolein' : 'Speak')
    : (isUrdu ? 'سنیں' : isRoman ? 'Sunen' : t.audioPlay || 'Play');

  const pauseLabel = isUrdu ? 'وقفہ' : isRoman ? 'Rokein' : t.audioPause || 'Pause';
  const stopLabel = isUrdu ? 'بند کریں' : isRoman ? 'Band Karein' : t.audioStop || 'Stop';

  const defaultTitle = mode === 'recording'
    ? (isUrdu ? 'صوتی ریکارڈنگ' : isRoman ? 'Voice Recording' : 'Voice Input')
    : (isUrdu ? 'صوتی رہنمائی (اردو)' : isRoman ? 'Audio Rehnumai (Roman)' : `Audio Guidance (${currentLanguage.toUpperCase()})`);

  // Size styling maps
  const btnPadding =
    size === 'sm'
      ? 'px-2 py-1 text-[11px]'
      : size === 'lg'
      ? 'px-3.5 py-2 text-sm'
      : 'px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs';

  const iconSize =
    size === 'sm'
      ? 'w-3 h-3'
      : size === 'lg'
      ? 'w-4 h-4'
      : 'w-3.5 h-3.5';

  // --- REUSABLE VISUAL LISTENING / SPEAKING ANIMATION ---
  const renderVisualPulseEffect = (compact = false) => {
    if (!isAnyActive || isAnyPaused) return null;

    if (mode === 'recording') {
      // Red Pulse & Audio Wave for Microphone Listening
      return (
        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-100/90 dark:bg-red-950/80 border border-red-300 dark:border-red-700/80 text-red-800 dark:text-red-200 shrink-0 ${
            compact ? 'text-[10px]' : 'text-xs'
          }`}
          aria-live="polite"
        >
          {/* Pulsing Red Dot */}
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
          </span>

          {/* Equalizer Waveform Bars */}
          <div className="flex items-center gap-0.5 h-3.5 px-0.5">
            <span className="w-0.5 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="w-0.5 h-3.5 bg-red-600 rounded-full animate-pulse delay-75" />
            <span className="w-0.5 h-2.5 bg-red-500 rounded-full animate-pulse delay-150" />
            <span className="w-0.5 h-3 bg-red-700 rounded-full animate-pulse delay-100" />
          </div>

          <span className="font-bold tracking-tight whitespace-nowrap">
            {isUrdu ? 'سن رہا ہوں...' : isRoman ? 'Sun raha hoon...' : 'Listening...'}
          </span>
        </div>
      );
    }

    // Teal / Emerald Pulse & Sound Wave for Audio Speaking
    return (
      <div
        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-100/90 dark:bg-teal-950/80 border border-teal-300 dark:border-teal-700/80 text-teal-900 dark:text-teal-200 shrink-0 ${
          compact ? 'text-[10px]' : 'text-xs'
        }`}
        aria-live="polite"
      >
        {/* Pulsing Audio Dot */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-80" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600" />
        </span>

        {/* Dynamic Equalizer Bars */}
        <div className="flex items-center gap-0.5 h-3.5 px-0.5">
          <span className="w-0.5 h-2.5 bg-teal-600 rounded-full animate-pulse" />
          <span className="w-0.5 h-3.5 bg-teal-500 rounded-full animate-pulse delay-75" />
          <span className="w-0.5 h-1.5 bg-teal-400 rounded-full animate-pulse delay-150" />
          <span className="w-0.5 h-3 bg-teal-700 rounded-full animate-pulse delay-100" />
        </div>

        <span className="font-bold tracking-tight whitespace-nowrap">
          {isUrdu ? 'آواز جاری ہے' : isRoman ? 'Bol raha hai' : 'Speaking'}
        </span>
      </div>
    );
  };

  // --- VARIANT 1: COMPACT (Perfect for card footers, chat pills, and dense headers) ---
  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 bg-white/95 dark:bg-slate-900 border ${
          isAnyActive && !isAnyPaused
            ? mode === 'recording'
              ? 'border-red-400 dark:border-red-700 shadow-sm shadow-red-500/20'
              : 'border-teal-400 dark:border-teal-600 shadow-sm shadow-teal-500/20'
            : 'border-teal-200/90 dark:border-teal-800/90 shadow-2xs'
        } rounded-2xl p-1 max-w-full overflow-hidden transition-all ${
          isUrdu ? 'rtl' : 'ltr'
        } ${className}`}
        dir={isUrdu ? 'rtl' : 'ltr'}
      >
        {/* Visual Listening / Speaking Pulse Indicator */}
        {showWaveform && renderVisualPulseEffect(true)}

        {/* 1. START / PLAY / RESUME */}
        <button
          type="button"
          onClick={handlePlayOrResume}
          className={`flex items-center gap-1 ${btnPadding} rounded-xl font-bold transition-all shrink-0 cursor-pointer select-none ${
            isAnyActive && !isAnyPaused
              ? mode === 'recording'
                ? 'bg-red-600 text-white shadow-xs animate-pulse ring-2 ring-red-400/40'
                : 'bg-teal-600 text-white shadow-xs ring-2 ring-teal-400/40'
              : 'bg-teal-50 dark:bg-slate-800 text-teal-800 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-slate-700 border border-teal-200/80 dark:border-teal-700/80'
          }`}
          title={playLabel}
          aria-label={playLabel}
        >
          {mode === 'recording' ? (
            <Mic className={`${iconSize} shrink-0 text-current`} />
          ) : (
            <Play className={`${iconSize} shrink-0 fill-current`} />
          )}
          <span className="whitespace-nowrap">{playLabel}</span>
        </button>

        {/* 2. PAUSE */}
        <button
          type="button"
          onClick={handlePause}
          disabled={!canPause}
          className={`flex items-center gap-1 ${btnPadding} rounded-xl font-bold transition-all shrink-0 select-none ${
            isAnyPaused
              ? 'bg-amber-500 text-slate-950 shadow-xs cursor-pointer ring-2 ring-amber-300'
              : canPause
              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700 cursor-pointer'
              : 'opacity-40 cursor-not-allowed text-slate-400 border border-transparent'
          }`}
          title={pauseLabel}
          aria-label={pauseLabel}
        >
          <Pause className={`${iconSize} shrink-0 fill-current`} />
          <span className="hidden xs:inline whitespace-nowrap">{pauseLabel}</span>
        </button>

        {/* 3. STOP */}
        <button
          type="button"
          onClick={handleStop}
          disabled={!canStop}
          className={`flex items-center gap-1 ${btnPadding} rounded-xl font-bold transition-all shrink-0 select-none ${
            canStop
              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-200 border border-rose-300 dark:border-rose-800 cursor-pointer'
              : 'opacity-40 cursor-not-allowed text-slate-400 border border-transparent'
          }`}
          title={stopLabel}
          aria-label={stopLabel}
        >
          {mode === 'recording' ? (
            <MicOff className={`${iconSize} shrink-0`} />
          ) : (
            <Square className={`${iconSize} shrink-0 fill-current`} />
          )}
          <span className="hidden xs:inline whitespace-nowrap">{stopLabel}</span>
        </button>

        {/* Optional Speed Indicator in compact view */}
        {showSpeed && mode === 'playback' && (
          <button
            type="button"
            onClick={cycleSpeed}
            className="flex items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 border border-slate-200 dark:border-slate-700 cursor-pointer"
            title="Voice Speed"
          >
            <Gauge className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>{voiceState.speed}x</span>
          </button>
        )}
      </div>
    );
  }

  // --- VARIANT 2: MINIMAL (Icon-centric for tight toolbars and input adornments) ---
  if (variant === 'minimal') {
    return (
      <div
        className={`inline-flex items-center gap-1 p-0.5 rounded-xl bg-slate-100/90 dark:bg-slate-800 border ${
          isAnyActive && !isAnyPaused
            ? 'border-teal-400 ring-1 ring-teal-400'
            : 'border-slate-200 dark:border-slate-700'
        } ${className}`}
        dir={isUrdu ? 'rtl' : 'ltr'}
      >
        <button
          type="button"
          onClick={handlePlayOrResume}
          className={`p-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
            isAnyActive && !isAnyPaused
              ? mode === 'recording'
                ? 'bg-red-600 text-white shadow-2xs animate-pulse'
                : 'bg-teal-600 text-white shadow-2xs'
              : 'text-teal-700 dark:text-teal-300 hover:bg-white dark:hover:bg-slate-700'
          }`}
          title={playLabel}
          aria-label={playLabel}
        >
          {mode === 'recording' ? (
            <Mic className={`${iconSize}`} />
          ) : (
            <Play className={`${iconSize} fill-current`} />
          )}
        </button>

        <button
          type="button"
          onClick={handlePause}
          disabled={!canPause}
          className={`p-1.5 rounded-lg transition-all shrink-0 ${
            isAnyPaused
              ? 'bg-amber-500 text-slate-950 shadow-2xs cursor-pointer'
              : canPause
              ? 'text-amber-700 dark:text-amber-300 hover:bg-white dark:hover:bg-slate-700 cursor-pointer'
              : 'opacity-30 text-slate-400 cursor-not-allowed'
          }`}
          title={pauseLabel}
          aria-label={pauseLabel}
        >
          <Pause className={`${iconSize} fill-current`} />
        </button>

        <button
          type="button"
          onClick={handleStop}
          disabled={!canStop}
          className={`p-1.5 rounded-lg transition-all shrink-0 ${
            canStop
              ? 'text-rose-600 dark:text-rose-400 hover:bg-white dark:hover:bg-slate-700 cursor-pointer'
              : 'opacity-30 text-slate-400 cursor-not-allowed'
          }`}
          title={stopLabel}
          aria-label={stopLabel}
        >
          {mode === 'recording' ? (
            <MicOff className={`${iconSize}`} />
          ) : (
            <Square className={`${iconSize} fill-current`} />
          )}
        </button>
      </div>
    );
  }

  // --- VARIANT 3: FULL BAR / CARD (Default: Comprehensive, responsive, beautiful) ---
  return (
    <div
      className={`w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 p-3 sm:p-3.5 bg-teal-50/90 dark:bg-slate-900 border ${
        isAnyActive && !isAnyPaused
          ? mode === 'recording'
            ? 'border-red-400 dark:border-red-700/80 shadow-md shadow-red-500/10'
            : 'border-teal-400 dark:border-teal-600/80 shadow-md shadow-teal-500/10'
          : 'border-teal-200 dark:border-teal-800/80 shadow-xs'
      } rounded-2xl transition-all ${
        isUrdu ? 'rtl font-urdu' : 'ltr'
      } ${className}`}
      dir={isUrdu ? 'rtl' : 'ltr'}
    >
      {/* Left/Header Label & Audio Status */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`p-2 rounded-xl text-white shadow-xs shrink-0 flex items-center justify-center transition-all ${
            isAnyActive && !isAnyPaused
              ? mode === 'recording'
                ? 'bg-red-600 animate-pulse ring-2 ring-red-400/50'
                : 'bg-teal-600 ring-2 ring-teal-400/50'
              : 'bg-teal-600'
          }`}
        >
          {mode === 'recording' ? (
            <Mic className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-xs sm:text-sm text-teal-950 dark:text-teal-100 truncate">
              {label || defaultTitle}
            </span>

            {/* Visual Listening / Speaking Pulse Indicator */}
            {renderVisualPulseEffect(false)}

            {isAnyPaused && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                <span>{isUrdu ? 'روکا گیا (Paused)' : isRoman ? 'Ruka Hua Hai' : 'Paused'}</span>
              </span>
            )}
          </div>

          <p className="text-[11px] text-teal-800/80 dark:text-teal-300/80 truncate">
            {mode === 'recording'
              ? isRecActive
                ? isUrdu
                  ? 'آپ کی آواز براہ راست سنی جا رہی ہے، بولتے رہیے...'
                  : 'Listening to your speech input in real-time...'
                : isUrdu
                ? 'بولنے کے لیے بٹن دبائیں'
                : 'Click play to start speaking'
              : isUrdu
              ? 'مکمل طبی نتائج اور ہدایات سننے کے لیے بٹن دبائیں'
              : isRoman
              ? 'Nateeja aur hifazati rehnumai sunnay ke liye play karein'
              : 'Listen to clinical results, warnings & recommendations'}
          </p>
        </div>
      </div>

      {/* Right/Controls Group: START, PAUSE, STOP + SPEED */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 self-end sm:self-center overflow-x-auto max-w-full pb-0.5">
        {/* 1. START / PLAY / RESUME BUTTON */}
        <button
          type="button"
          onClick={handlePlayOrResume}
          className={`flex items-center justify-center gap-1.5 ${btnPadding} rounded-xl font-bold transition-all shadow-xs shrink-0 cursor-pointer select-none active:scale-95 ${
            isAnyActive && !isAnyPaused
              ? mode === 'recording'
                ? 'bg-red-600 text-white shadow-red-600/30 animate-pulse'
                : 'bg-teal-600 text-white shadow-teal-600/30'
              : 'bg-teal-600 hover:bg-teal-700 text-white'
          }`}
          title={playLabel}
          aria-label={playLabel}
        >
          {mode === 'recording' ? (
            <Mic className={`${iconSize} shrink-0`} />
          ) : (
            <Play className={`${iconSize} shrink-0 fill-current`} />
          )}
          <span className="whitespace-nowrap">{playLabel}</span>
        </button>

        {/* 2. PAUSE BUTTON */}
        <button
          type="button"
          onClick={handlePause}
          disabled={!canPause}
          className={`flex items-center justify-center gap-1.5 ${btnPadding} rounded-xl font-bold transition-all shrink-0 select-none ${
            isAnyPaused
              ? 'bg-amber-500 text-slate-950 shadow-xs cursor-pointer active:scale-95'
              : canPause
              ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700 cursor-pointer active:scale-95'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-40 cursor-not-allowed border border-transparent'
          }`}
          title={pauseLabel}
          aria-label={pauseLabel}
        >
          <Pause className={`${iconSize} shrink-0 fill-current`} />
          <span className="whitespace-nowrap">{pauseLabel}</span>
        </button>

        {/* 3. STOP BUTTON */}
        <button
          type="button"
          onClick={handleStop}
          disabled={!canStop}
          className={`flex items-center justify-center gap-1.5 ${btnPadding} rounded-xl font-bold transition-all shrink-0 select-none ${
            canStop
              ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border border-rose-300 dark:border-rose-800 cursor-pointer active:scale-95'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-40 cursor-not-allowed border border-transparent'
          }`}
          title={stopLabel}
          aria-label={stopLabel}
        >
          {mode === 'recording' ? (
            <MicOff className={`${iconSize} shrink-0`} />
          ) : (
            <Square className={`${iconSize} shrink-0 fill-current`} />
          )}
          <span className="whitespace-nowrap">{stopLabel}</span>
        </button>

        {/* Speech Speed Cycle Button */}
        {showSpeed && mode === 'playback' && (
          <button
            type="button"
            onClick={cycleSpeed}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-mono font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shrink-0"
            title="Speed"
            aria-label="Speed"
          >
            <Gauge className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>{voiceState.speed}x</span>
          </button>
        )}
      </div>
    </div>
  );
};
