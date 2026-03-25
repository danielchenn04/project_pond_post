'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onDismiss: () => void;
}

export default function Toast({ message, type = 'success', onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, type === 'error' ? 5000 : 2600);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div
        className="toast-animate px-5 py-2.5 rounded-full font-lato font-semibold text-sm text-white shadow-lg"
        style={{ backgroundColor: type === 'success' ? '#606C38' : '#BC6C25' }}
      >
        {message}
      </div>
    </div>
  );
}

// Hook for toast management
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
  }

  function dismissToast() {
    setToast(null);
  }

  return { toast, showToast, dismissToast };
}
