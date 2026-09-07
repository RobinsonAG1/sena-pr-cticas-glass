import React from 'react';

interface SenaLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  glow?: boolean;
  className?: string;
}

export const SenaLogo: React.FC<SenaLogoProps> = ({
  size = 'md',
  showText = true,
  glow = true,
  className = '',
}) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const glowStyle = glow
    ? {
        filter: 'drop-shadow(0 0 10px rgba(78, 222, 163, 0.6)) drop-shadow(0 0 20px rgba(57, 169, 0, 0.4))',
      }
    : undefined;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        className={`relative flex items-center justify-center shrink-0 ${sizeMap[size]} transition-transform duration-300 hover:scale-105`}
        style={glowStyle}
      >
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Circular Head */}
          <circle cx="60" cy="18" r="14" fill="#39A900" />
          
          {/* Horizontal Shoulder/Arms Bar */}
          <rect x="10" y="44" width="100" height="12" rx="3" fill="#39A900" />

          {/* Left Leg Arch */}
          <path
            d="M 12 56 L 42 114 L 56 114 L 32 62 L 54 62 L 60 74 L 66 62 L 88 62 L 64 114 L 78 114 L 108 56 Z"
            fill="#39A900"
          />

          {/* Inner Chevron Inverted V */}
          <path
            d="M 60 72 L 40 114 L 52 114 L 60 96 L 68 114 L 80 114 Z"
            fill="#4edea3"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight select-none">
          <span className="font-extrabold tracking-tight text-white flex items-center gap-1.5 text-lg">
            <span className="text-[#39A900] drop-shadow-[0_0_8px_rgba(57,169,0,0.6)] font-black">
              SENA
            </span>
            <span className="font-semibold text-slate-100">Prácticas</span>
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
            Etapa Productiva
          </span>
        </div>
      )}
    </div>
  );
};
