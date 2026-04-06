'use client';

import { useEffect } from 'react';

// Initializes theme from saved preference or system preference.
// Must stay in sync with ThemeToggle logic to avoid flashes.
export default function ForceDarkMode() {
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    // Match ThemeToggle logic: saved value wins, then system preference
    const shouldBeDark = saved === 'dark' || (!saved && prefersDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  return null;
}
