'use client';

import { useEffect } from 'react';

// Forces light mode — theme toggle has been hidden per client request.
// Clears any previously saved dark preference so the site is always light.
export default function ForceDarkMode() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  return null;
}
