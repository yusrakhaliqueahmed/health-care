import React, { useEffect, useState } from 'react';
import { Play, Pause, Square, Volume2, Gauge, X } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { voiceManager } from '../services/voice';

interface FloatingAudioPlayerProps {
  currentLanguage: SupportedLanguage;
}

export const FloatingAudioPlayer: React.FC<FloatingAudioPlayerProps> = ({ currentLanguage }) => {
  const [voiceState, setVoiceState] = useState({
    isPlaying: false,
    isPaused: false,
    text: '',
    speed: 1.0,
  });

  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const unsub = voiceManager.subscribe((state) => {
      setVoiceState(state);
      if (state.isPlaying) {
        setDismissed(false);
      }
    });
    return () => unsub();
  }, []);

  const isUrdu = currentLanguage === 'ur';
  const isRoman = currentLanguage === 'roman';

  // Only render if audio is currently playing or paused, and not dismissed
  if ((!voiceState.isPlaying && !voiceState.isPaused) || dismissed) {
    return null;
  }

  const speeds = [1.0, 1.25, 1.75, 2.0] as const;

  const handlePlayOrResume = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (voiceState.isPaused) {
      voiceManager.resume();
    } else if (voiceState.text) {
      voiceManager.replay();
    }
  };

  const handlePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    voiceManager.pause();
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    voiceManager.stop();
  };

  const handleSetSpeed = (spd: number, e: React.MouseEvent) => {
    e.stopPropagation();
    voiceManager.setSpeed(spd);
  };

  const playLabel = voiceState.isPaused
    ? (isUrdu ? 'جاری رکھیں' : isRoman ? 'Jari Rakhein' : 'Resume')
    : (isUrdu ? 'چل رہا ہے' : isRoman ? 'Chal Raha Hai' : 'Playing');

  const pauseLabel = isUrdu ? 'وقفہ' : isRoman ? 'Rokein' : 'Pause';
  const stopLabel = isUrdu ? 'بند کریں' : isRoman ? 'Band Karein' : 'Stop';

  return (
    <aside
      id="global-floating-voice-player"
      aria-label="Active Audio Player"
      className="fixed bottom-16 lg:bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-xl z-50 animate-in fade-in slide-in-from-bottom-3 duration-200"
      dir="ltr"
    >
      <div className="bg-slate-900/95 dark:bg-[#071a16]/95 text-white backdrop-blur-md border border-teal-500/50 rounded-2xl shadow-2xl p-2.5 sm:p-3 flex flex-col gap-2 ring-1 ring-teal-400/30">
        {/* Top: Status & Equalizer Waveform */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-teal-600/90 text-white shrink-0 flex items-center justify-center">
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
            </div>

            {/* Speaking equalizer bars */}
            <div className="flex items-center gap-0.5 h-3 px-1">
              <span className={`w-0.5 rounded-full bg-teal-400 ${voiceState.isPlaying && !voiceState.isPaused ? 'h-3 animate-pulse' : 'h-1.5'}`} />
              <span className={`w-0.5 rounded-full bg-teal-300 ${voiceState.isPlaying && !voiceState.isPaused ? 'h-4 animate-pulse delay-75' : 'h-2'}`} />
              <span className={`w-0.5 rounded-full bg-emerald-400 ${voiceState.isPlaying && !voiceState.isPaused ? 'h-2 animate-pulse delay-150' : 'h-1'}`} />
              <span className={`w-0.5 rounded-full bg-teal-400 ${voiceState.isPlaying && !voiceState.isPaused ? 'h-3.5 animate-pulse delay-100' : 'h-2'}`} />
            </div>

            <span className="text-xs font-bold text-teal-200 truncate">
              {voiceState.isPaused
                ? (isUrdu ? 'روکا گیا (Paused)' : isRoman ? 'Ruka Hua Hai' : 'Audio Paused')
                : (isUrdu ? 'صوتی رہنمائی جاری ہے...' : isRoman ? 'Awaaz chal rahi hai...' : 'Voice Guidance Active...')}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Minimize"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Text snippet */}
        {voiceState.text && (
          <p className="text-[11px] text-slate-300/90 truncate font-sans px-1">
            &ldquo;{voiceState.text.slice(0, 110)}...&rdquo;
          </p>
        )}

        {/* Controls: Start/Resume, Pause, Stop + Speeds 1x, 1.25x, 1.75x, 2x */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Play / Resume */}
            <button
              type="button"
              onClick={handlePlayOrResume}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                voiceState.isPlaying && !voiceState.isPaused
                  ? 'bg-teal-500 text-slate-950 shadow-xs'
                  : 'bg-teal-600 hover:bg-teal-500 text-white'
              }`}
              title={playLabel}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{playLabel}</span>
            </button>

            {/* Pause */}
            <button
              type="button"
              onClick={handlePause}
              disabled={voiceState.isPaused}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                voiceState.isPaused
                  ? 'bg-amber-500 text-slate-950 shadow-xs ring-2 ring-amber-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 cursor-pointer'
              }`}
              title={pauseLabel}
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>{pauseLabel}</span>
            </button>

            {/* Stop */}
            <button
              type="button"
              onClick={handleStop}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60 transition-all cursor-pointer"
              title={stopLabel}
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{stopLabel}</span>
            </button>
          </div>

          {/* Speed Selector: 1x, 1.25x, 1.75x, 2x */}
          <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700 shrink-0">
            <span className="text-[10px] font-bold text-teal-300 px-1 hidden xs:inline flex items-center gap-0.5">
              <Gauge className="w-3 h-3 text-teal-400" />
              <span>{isUrdu ? 'رفتار' : 'Speed'}</span>
            </span>
            {speeds.map((spd) => {
              const isActive = Math.abs(voiceState.speed - spd) < 0.05;
              return (
                <button
                  key={spd}
                  type="button"
                  onClick={(e) => handleSetSpeed(spd, e)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-500 text-slate-950 shadow-xs scale-105 ring-1 ring-teal-300 font-extrabold'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  title={`Speed ${spd}x`}
                  aria-label={`Speed ${spd}x`}
                >
                  {spd}x
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};
