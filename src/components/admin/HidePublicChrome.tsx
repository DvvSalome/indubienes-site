'use client';

import { useEffect } from 'react';

// Hides the public Header/Footer/WhatsApp when inside /admin
export default function HidePublicChrome() {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return null;
}
