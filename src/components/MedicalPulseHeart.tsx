import React from 'react';
import { motion } from 'motion/react';

interface MedicalPulseHeartProps {
  size?: number | string;
  className?: string;
  showGlow?: boolean;
  pulseGlowColor?: string;
}

/**
 * Professional Medical Line-Art Heart with ECG Pulse Line
 * - Clean monoline heart contour with rounded joins
 * - Hospital-grade ECG/heartbeat pulse line running through center and extending beyond both sides
 * - In teal/mint telehealth palette with subtle 2D pulsing glow and gentle scale-in
 * - Zero 3D, zero WebGL, crisp SVG on Light and Dark themes
 */
export const MedicalPulseHeart: React.FC<MedicalPulseHeartProps> = ({
  size = 140,
  className = '',
  showGlow = true,
}) => {
  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label="Medical Heart with ECG Pulse"
      role="img"
    >
      {/* Subtle 2D ambient pulsing glow */}
      {showGlow && (
        <div
          className="absolute inset-2 rounded-full bg-teal-500/20 dark:bg-teal-400/25 blur-xl pointer-events-none animate-[pulse_3s_ease-in-out_infinite]"
          aria-hidden="true"
        />
      )}

      {/* Crisp Monoline SVG Heart + ECG Pulse Wave */}
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-xs"
      >
        <defs>
          <linearGradient id="medHeartGradient" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
          <linearGradient id="medPulseGradient" x1="10" y1="60" x2="110" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>

        {/* Clean Monoline Heart Outline */}
        <path
          d="M 60 38 C 55 26, 36 22, 25 34 C 14 48, 24 67, 60 97 C 96 67, 106 48, 95 34 C 84 22, 65 26, 60 38 Z"
          stroke="url(#medHeartGradient)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-colors duration-300"
        />

        {/* ECG Heartbeat Pulse Line running through the center and extending beyond both sides */}
        <path
          d="M 8 60 H 34 L 40 60 L 44 54 L 48 68 L 55 36 L 62 82 L 67 54 L 72 65 L 76 60 H 112"
          stroke="url(#medPulseGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-colors duration-300"
        />
      </svg>
    </motion.div>
  );
};
