import React from 'react';

interface ShieldLogoProps {
  size?: number;
  className?: string;
}

export const ShieldLogo: React.FC<ShieldLogoProps> = ({ size = 36, className = '' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      width={size}
      height={size}
      fill="none"
      className={className}
    >
      <rect width="40" height="40" rx="8" fill="#1E293B" />
      <path
        d="M20 7L10 11.5V19C10 26.2 14.3 32.8 20 34.5C25.7 32.8 30 26.2 30 19V11.5L20 7Z"
        stroke="#2563EB"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="#172033"
      />
      <path
        d="M20 12L13.5 15.2V20C13.5 24.5 16.3 28.6 20 30C23.7 28.6 26.5 24.5 26.5 20V15.2L20 12Z"
        fill="#1E293B"
        stroke="#38BDF8"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="21" r="3" fill="#2563EB" />
      <path
        d="M20 15V18M20 24V27M15 21H17M23 21H25"
        stroke="#60A5FA"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};
