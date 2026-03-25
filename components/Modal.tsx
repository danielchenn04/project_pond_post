'use client';

import { useEffect, useRef } from 'react';

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  destructive?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({ open, onClose, title, destructive, children, className = '' }: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  function handleBackdropClick(e: React.MouseEvent) {
    if (destructive) return;
    if (e.target === backdropRef.current) onClose?.();
  }

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={handleBackdropClick}
    >
      <div
        className={`modal-enter relative w-full max-w-lg mx-4 rounded-2xl p-8 shadow-2xl ${className}`}
        style={{
          backgroundColor: '#FCF9F2',
          borderTop: destructive ? '4px solid #BC6C25' : undefined,
        }}
      >
        {title && (
          <h2 className="font-playfair text-2xl text-deep-forest mb-4">{title}</h2>
        )}
        {onClose && !destructive && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-guardian-slate hover:text-slate-dark text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
