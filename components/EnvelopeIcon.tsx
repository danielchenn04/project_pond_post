'use client';

import { useEffect, useState } from 'react';

type EnvelopeState = 'idle' | 'bounce' | 'fast-bounce' | 'sent' | 'new-mail' | 'sway' | 'error' | 'banned';

interface EnvelopeIconProps {
  state?: EnvelopeState;
  size?: number;
  badge?: number;
  className?: string;
  onClick?: () => void;
}

export default function EnvelopeIcon({
  state = 'idle',
  size = 40,
  badge = 0,
  className = '',
  onClick,
}: EnvelopeIconProps) {
  const [animClass, setAnimClass] = useState('');
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    if (state === 'sent') {
      setIsSent(true);
      const t = setTimeout(() => setIsSent(false), 1000);
      return () => clearTimeout(t);
    }
    setIsSent(false);
    switch (state) {
      case 'idle': setAnimClass('envelope-idle'); break;
      case 'bounce': setAnimClass('envelope-bounce'); break;
      case 'fast-bounce': setAnimClass('envelope-fast-bounce'); break;
      case 'sway': setAnimClass('envelope-sway'); break;
      case 'new-mail': setAnimClass('envelope-new-mail'); break;
      case 'error': setAnimClass('envelope-error'); break;
      case 'banned': setAnimClass('envelope-banned'); break;
      default: setAnimClass('');
    }
  }, [state]);

  return (
    <div
      className={`relative inline-flex items-center justify-center cursor-pointer select-none ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      <span
        className={`${animClass} ${isSent ? 'envelope-sent' : ''}`}
        style={{
          fontSize: size * 0.8,
          color: '#D4A373',
          display: 'block',
          lineHeight: 1,
        }}
      >
        ✉
      </span>
      {badge > 0 && (
        <span
          className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-white font-lato font-bold"
          style={{
            backgroundColor: '#BC6C25',
            minWidth: 18,
            height: 18,
            fontSize: 11,
            padding: '0 4px',
          }}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </div>
  );
}
