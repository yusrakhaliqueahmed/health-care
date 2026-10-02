import React, { useEffect, useState } from 'react';
import { voiceManager } from '../services/voice';
import { Play, Pause, Square, RotateCcw, Volume2, Gauge } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../services/i18n';

interface AudioPlayerControlsProps {
  currentLanguage: SupportedLanguage;
  textToSpeak?: string;
  className?: string;
  compact?: boolean;
}

export const AudioPlayerControls: React.FC<AudioPlayerControlsProps> = ({
  currentLanguage,
  textToSpeak,
  className = '',
  compact = false,
}) => {
  const [voiceState, setVoiceState] = useState({
    isPlaying: false,
    isPaused: false,
    text: '',
    speed: 1.0,
  });

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  useEffect(() => {
    const unsubscribe = voiceManager.subscribe((state) => {
      setVoiceState(state);
    });
    return () => unsubscribe();
  }, []);

  const handlePlayOrResume = () => {
    if (voiceState.isPaused) {
      voiceManager.resume();
    } else if (textToSpeak) {
      voiceManager.speak(textToSpeak, currentLanguage);
    } else if (voiceState.text) {
      voiceManager.replay();
    }
  };

  const handlePause = () => {
    voiceManager.pause();
  };

  const handleStop = () => {
    voiceManager.stop();
  };

  const cycleSpeed = () => {
    const speeds = [0.8, 1.0, 1.25];
    const currentIndex = speeds.indexOf(voiceState.speed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    voiceManager.setSpeed(nextSpeed);
  };

  const isUrdu = currentLanguage === 'ur';

  const startLabel = voiceState.isPaused
    ? (isUrdu ? 'جاری رکھیں' : t.audioResume)
    : (isUrdu ? 'چلائیں' : t.audioPlay);
  const pauseLabel = isUrdu ? 'وقفہ' : t.audioPause;
  const stopLabel = isUrdu ? 'بند کریں' : t.audioStop;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 bg-teal-50/90 dark:bg-slate-900 border border-teal-200 dark:border-teal-800/80 rounded-2xl p-1 text-xs text-teal-800 dark:text-teal-200 shadow-2xs ${className}`}>
        {/* Visual Pulse Waveform when speaking */}
        {voiceState.isPlaying && !voiceState.isPaused && (
          <div className="flex items-center gap-0.5 h-3 px-1">
            <span className="w-1 h-3 bg-teal-500 rounded-full animate-pulse" />
            <span className="w-1 h-2 bg-teal-600 rounded-full animate-pulse delay-75" />
            <span className="w-1 h-3.5 bg-teal-400 rounded-full animate-pulse delay-150" />
          </div>
        )}

        {/* 1. START / PLAY / RESUME BUTTON */}
        <button
          type="button"
          onClick={handlePlayOrResume}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            voiceState.isPlaying && !voiceState.isPaused
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-slate-700 border border-teal-200/60 dark:border-teal-700'
          }`}
          title={startLabel}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{startLabel}</span>
        </button>

        {/* 2. PAUSE BUTTON */}
        <button
          type="button"
          onClick={handlePause}
          disabled={!voiceState.isPlaying || voiceState.isPaused}
          className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold transition-all ${
            voiceState.isPaused
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : voiceState.isPlaying
              ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950/80 dark:text-amber-200 cursor-pointer border border-amber-300 dark:border-amber-700'
              : 'opacity-40 cursor-not-allowed text-slate-400 border border-transparent'
          }`}
          title={pauseLabel}
        >
          <Pause className="w-3.5 h-3.5 fill-current" />
          <span>{pauseLabel}</span>
        </button>

        {/* 3. STOP BUTTON */}
        <button
          type="button"
          onClick={handleStop}
          disabled={!voiceState.isPlaying && !voiceState.isPaused}
          className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold transition-all ${
            voiceState.isPlaying || voiceState.isPaused
              ? 'bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950/80 dark:text-rose-200 cursor-pointer border border-rose-300 dark:border-rose-800'
              : 'opacity-40 cursor-not-allowed text-slate-400 border border-transparent'
          }`}
          title={stopLabel}
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>{stopLabel}</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center flex-wrap gap-2 px-3.5 py-2.5 bg-teal-50/90 dark:bg-slate-900 border border-teal-200 dark:border-teal-800/80 rounded-2xl shadow-xs text-sm text-slate-800 dark:text-slate-200 ${className}`}
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-teal-600 text-white rounded-lg shadow-xs">
          <Volume2 className="w-4 h-4" />
        </div>
        <span className="font-semibold text-xs tracking-wide uppercase text-teal-800 dark:text-teal-300">
          {isUrdu ? 'آواز کی رہنمائی (اردو)' : `Audio Guidance (${currentLanguage.toUpperCase()})`}
        </span>
      </div>

      {voiceState.isPlaying && !voiceState.isPaused && (
        <div className="flex items-center gap-1 h-4 px-1">
          <span className="w-1 h-3.5 bg-teal-600 dark:bg-teal-400 rounded-full animate-pulse" />
          <span className="w-1 h-2 bg-teal-500 dark:bg-teal-300 rounded-full animate-pulse delay-75" />
          <span className="w-1 h-4 bg-teal-700 dark:bg-teal-200 rounded-full animate-pulse delay-150" />
          <span className="w-1 h-2.5 bg-teal-600 dark:bg-teal-400 rounded-full animate-pulse delay-100" />
        </div>
      )}

      {/* 3 Prominent Audio Action Buttons: START, PAUSE, STOP */}
      <div className="flex items-center gap-2 ml-auto">
        {/* 1. START / PLAY / RESUME */}
        <button
          type="button"
          onClick={handlePlayOrResume}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer ${
            voiceState.isPlaying && !voiceState.isPaused
              ? 'bg-teal-600 text-white'
              : 'bg-teal-600 hover:bg-teal-700 text-white'
          }`}
          title={startLabel}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{startLabel}</span>
        </button>

        {/* 2. PAUSE */}
        <button
          type="button"
          onClick={handlePause}
          disabled={!voiceState.isPlaying || voiceState.isPaused}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            voiceState.isPaused
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : voiceState.isPlaying
              ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700 cursor-pointer'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-50 cursor-not-allowed'
          }`}
          title={pauseLabel}
        >
          <Pause className="w-3.5 h-3.5 fill-current" />
          <span>{pauseLabel}</span>
        </button>

        {/* 3. STOP */}
        <button
          type="button"
          onClick={handleStop}
          disabled={!voiceState.isPlaying && !voiceState.isPaused}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            voiceState.isPlaying || voiceState.isPaused
              ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border border-rose-300 dark:border-rose-800 cursor-pointer'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-50 cursor-not-allowed'
          }`}
          title={stopLabel}
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>{stopLabel}</span>
        </button>

        {/* Speed adjustment */}
        <button
          type="button"
          onClick={cycleSpeed}
          className="flex items-center gap-1 px-2 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-mono font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
          title="Adjust speech speed"
        >
          <Gauge className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>{voiceState.speed}x</span>
        </button>
      </div>
    </div>
  );
};
