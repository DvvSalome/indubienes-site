'use client';

import { useEffect } from 'react';

export default function ForceDarkMode() {
  useEffect(() => {
    // Always force dark mode — remove any saved light mode preference
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    try {
      window.localStorage?.removeItem('theme');
    } catch {}
  }, []);

  return null;
}
