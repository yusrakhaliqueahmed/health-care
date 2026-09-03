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

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/60 rounded-full px-2.5 py-1 text-xs text-teal-800 dark:text-teal-200 ${className}`}>
        {voiceState.isPlaying ? (
          <>
            <div className="flex items-center gap-0.5 h-3 px-0.5">
              <span className="w-1 h-3 bg-teal-500 rounded-full animate-pulse" />
              <span className="w-1 h-2 bg-teal-600 rounded-full animate-pulse delay-75" />
              <span className="w-1 h-3.5 bg-teal-400 rounded-full animate-pulse delay-150" />
            </div>
            {voiceState.isPaused ? (
              <button
                type="button"
                onClick={handlePlayOrResume}
                className="p-1 hover:bg-teal-100 dark:hover:bg-teal-800 rounded-full"
                title={t.audioResume}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePause}
                className="p-1 hover:bg-teal-100 dark:hover:bg-teal-800 rounded-full"
                title={t.audioPause}
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
              </button>
            )}
            <button
              type="button"
              onClick={handleStop}
              className="p-1 hover:bg-teal-100 dark:hover:bg-teal-800 rounded-full"
              title={t.audioStop}
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handlePlayOrResume}
            className="flex items-center gap-1 font-medium hover:text-teal-600 dark:hover:text-teal-300"
            title={t.audioPlay}
          >
            <Volume2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>{t.audioPlay}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center flex-wrap gap-2 px-3 py-2 bg-teal-50/80 dark:bg-slate-800/80 border border-teal-200 dark:border-teal-800/60 rounded-xl shadow-xs text-sm text-slate-800 dark:text-slate-200 ${className}`}
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-teal-600 text-white rounded-lg shadow-xs">
          <Volume2 className="w-4 h-4" />
        </div>
        <span className="font-semibold text-xs tracking-wide uppercase text-teal-800 dark:text-teal-300">
          Audio Guidance ({currentLanguage.toUpperCase()})
        </span>
      </div>

      {voiceState.isPlaying && (
        <div className="flex items-center gap-1 h-4 px-1">
          <span className="w-1 h-3.5 bg-teal-600 dark:bg-teal-400 rounded-full animate-pulse" />
          <span className="w-1 h-2 bg-teal-500 dark:bg-teal-300 rounded-full animate-pulse delay-75" />
          <span className="w-1 h-4 bg-teal-700 dark:bg-teal-200 rounded-full animate-pulse delay-150" />
          <span className="w-1 h-2.5 bg-teal-600 dark:bg-teal-400 rounded-full animate-pulse delay-100" />
        </div>
      )}

      <div className="flex items-center gap-1.5 ml-auto">
        {voiceState.isPlaying ? (
          <>
            {voiceState.isPaused ? (
              <button
                type="button"
                onClick={handlePlayOrResume}
                className="flex items-center gap-1 px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t.audioResume}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePause}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>{t.audioPause}</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleStop}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{t.audioStop}</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handlePlayOrResume}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium shadow-xs transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{t.audioPlay}</span>
          </button>
        )}

        <button
          type="button"
          onClick={handlePlayOrResume}
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-teal-100 dark:hover:bg-slate-700 rounded-lg text-xs transition-colors"
          title="Replay from start"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={cycleSpeed}
          className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-mono font-semibold transition-colors"
          title="Adjust speech speed"
        >
          <Gauge className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>{voiceState.speed}x</span>
        </button>
      </div>
    </div>
  );
};
