import React from 'react';
import { SupportedLanguage } from '../types';
import { VoiceControlGroup } from './VoiceControlGroup';

export interface AudioPlayerControlsProps {
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
  return (
    <VoiceControlGroup
      currentLanguage={currentLanguage}
      textToSpeak={textToSpeak}
      variant={compact ? 'compact' : 'bar'}
      className={className}
    />
  );
};
