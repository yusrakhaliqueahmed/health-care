import React from 'react';

interface ClinicalHeartIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  variant?: 'anatomical-heart' | 'pulse-wave';
}

/**
 * Authentic Clinical Anatomical Human Heart Icon
 * Replaces cartoon/valentine shapes with true cardiology anatomy:
 * - Aortic arch with 3 branch arteries (brachiocephalic, carotid, subclavian)
 * - Pulmonary artery trunk
 * - Superior vena cava
 * - Anatomical ventricular mass and apex
 * - Coronary arterial groove
 */
export const ClinicalHeartIcon: React.FC<ClinicalHeartIconProps> = ({
  size = 24,
  className = 'w-5 h-5 text-teal-400',
  variant = 'anatomical-heart',
  ...props
}) => {
  if (variant === 'pulse-wave') {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        {...props}
      >
        <path d="M2 12h3.5l1.5-4 2.5 8 2.5-6.5 1.5 3.5 1.5-1.5 2 1.5 1.5-2.5 1 2h4" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* 1. Aortic Arch with three cephalic branch vessels */}
      <path d="M10.5 4.8C10.5 3 13.5 2.2 15.5 3.5c1.8 1.2 2 3.2 1.8 5.2" />
      {/* Three branching arteries from aorta */}
      <path d="M12 3.8V2" />
      <path d="M13.8 3.2l.6-1.5" />
      <path d="M15.4 3.8l.9-1.3" />

      {/* 2. Superior Vena Cava (Right upper entrance) */}
      <path d="M7.8 7.5V4.2c0-.5.4-.9.9-.9h.8" />

      {/* 3. Pulmonary Trunk & Artery (Left anterior crossing) */}
      <path d="M9.8 8.8c.8-1.5 2.4-2.5 4.4-2.2 1.2.2 2.3.8 2.8 1.8" />
      <path d="M17 7.2l2-.8" />

      {/* 4. Ventricular Muscle Body (Left Ventricle + Apex tilting left, Right Ventricle) */}
      <path d="M6.5 11c-.8 1.8-.4 4.5.8 6.5 1.8 2.8 4.2 4.5 5.8 4.5 1.8 0 4.2-2.5 5.2-4.5 1.2-2.4 1.4-5.2.2-7.2-1.2-2-3.8-2.6-5.5-1.5-1.2.8-1.8 1.7-2.2 2.7-1.2-.2-3.1-.3-4.3-.5z" />

      {/* 5. Anterior Interventricular Coronary Artery Groove */}
      <path d="M11 11.5c.2 2.2-.4 4.2-1.4 6.2-.4.8-.8 1.8-.6 2.8" strokeDasharray="1 1.5" />
      <path d="M11.5 13.8c1.2.6 2.2 1.4 2.8 2.4" />
    </svg>
  );
};

