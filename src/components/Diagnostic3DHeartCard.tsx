import React from 'react';
import { SupportedLanguage } from '../types';
import { TrustedDoctorsCard } from './TrustedDoctorsCard';

interface Diagnostic3DHeartCardProps {
  currentLanguage?: SupportedLanguage;
  size?: number;
  interactive?: boolean;
  showExpandButton?: boolean;
  className?: string;
  onOpenCall?: () => void;
  onOpenMessage?: () => void;
  onBookAppointment?: () => void;
}

/**
 * Replaces the legacy 3D heart with the clinical-grade Trusted Doctors Teleconsult presentation card
 * Fully maintains backwards-compatibility for existing call and message handlers.
 */
export const Diagnostic3DHeartCard: React.FC<Diagnostic3DHeartCardProps> = ({
  currentLanguage = 'en',
  className = '',
  onOpenCall,
  onOpenMessage,
  onBookAppointment,
}) => {
  return (
    <TrustedDoctorsCard
      currentLanguage={currentLanguage}
      className={className}
      onBookAppointment={onBookAppointment || onOpenCall}
      onOpenCall={onOpenCall}
      onOpenMessage={onOpenMessage}
    />
  );
};
