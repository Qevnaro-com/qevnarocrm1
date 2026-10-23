import React from 'react';

export const Logo = ({ variant = 'dark', size = 'md', className = '', showSubtitle = true }) => {
  // variant: 'dark' (for dark navy sidebar) or 'light' (for white/light backgrounds)
  const isDark = variant === 'dark';

  const sizeClasses = {
    sm: { img: 'h-7', text: 'text-lg', sub: 'text-[9px]' },
    md: { img: 'h-9', text: 'text-xl', sub: 'text-[10px]' },
    lg: { img: 'h-12', text: 'text-2xl', sub: 'text-xs' },
  }[size] || { img: 'h-9', text: 'text-xl', sub: 'text-[10px]' };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Brand Icon Badge */}
      <div className="relative flex items-center justify-center shrink-0">
        <div className={`relative rounded-xl overflow-hidden shadow-sm flex items-center justify-center ${
          size === 'lg' ? 'w-12 h-12' : size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'
        } ${isDark ? 'bg-white/10 ring-1 ring-white/15' : 'bg-brand-navy shadow-brand'}`}>
          {/* Hexagonal Q Mark Vector */}
          <svg
            viewBox="0 0 100 100"
            className={`${size === 'lg' ? 'w-8 h-8' : size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Hexagon Outer Q Ring */}
            <path
              d="M50 8 L86 28 V70 L50 90 L14 70 V28 Z"
              stroke={isDark ? '#FFFFFF' : '#FFFFFF'}
              strokeWidth="9"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Inner Vibrant Blue Arrow Chevron */}
            <path
              d="M32 58 L50 40 L68 58"
              stroke="#2977FD"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Q Tail Slash */}
            <path
              d="M62 62 L82 82"
              stroke="#2977FD"
              strokeWidth="10"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black tracking-wider uppercase font-sans ${sizeClasses.text} ${
              isDark ? 'text-white' : 'text-brand-navy'
            }`}
          >
            QEVNARO
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded tracking-wider bg-brand-accent text-white uppercase">
            CRM
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`tracking-widest font-semibold uppercase mt-0.5 ${sizeClasses.sub} ${
              isDark ? 'text-blue-200/70' : 'text-slate-400'
            }`}
          >
            Operations & Telecalling
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;
