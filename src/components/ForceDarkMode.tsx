'use client';

import { useEffect } from 'react';

// Initializes theme from saved preference. Defaults to light mode.
export default function ForceDarkMode() {
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      // Default: light mode
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return null;
}
