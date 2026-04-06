'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

interface NavLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface ActionLink {
  label: string;
  action: () => void;
  icon: React.ReactNode;
  isDanger?: boolean;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (response.ok) {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navLinks: NavLink[] = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        </svg>
      ),
    },
    {
      label: 'Propiedades',
      href: '/admin/propiedades',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11v-5m0 0V9m0 5h.01" />
        </svg>
      ),
    },
    {
      label: 'Leads',
      href: '/admin/leads',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292m0-5.292V2.75m0 13.604A4 4 0 108.364 20.4m0-13.604v13.604m0 0A4 4 0 1016 20.4" />
        </svg>
      ),
    },
    {
      label: 'Marketing',
      href: '/admin/marketing',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C9.5 15.938 11.56 17.972 14.146 17.972H20V4H4v10.696a2 2 0 001.684 1.646z" />
        </svg>
      ),
    },
    {
      label: 'Usuarios',
      href: '/admin/usuarios',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.666" />
        </svg>
      ),
    },
  ];

  const actionLinks: ActionLink[] = [
    {
      label: 'Volver al sitio',
      action: () => router.push('/'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      ),
    },
    {
      label: 'Cerrar sesión',
      action: handleLogout,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      isDanger: true,
    },
  ];

  const isActiveLink = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 lg:hidden bg-[#1a1a1a] border border-[#222] rounded-lg p-2 text-[#888] hover:text-white transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-[#111111] border-r border-[#222] flex flex-col z-40 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Gold accent line */}
        <div className="h-1 bg-[#4A8BC2]" />

        {/* Logo section */}
        <div className="px-6 py-8 border-b border-[#222]">
          <Logo height={32} />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActiveLink(link.href)
                  ? 'bg-[#1a1a1a] text-[#4A8BC2] border-l-2 border-[#4A8BC2]'
                  : 'text-[#888] hover:text-white hover:bg-[#1a1a1a]/50'
              }`}
            >
              {link.icon}
              <span className="text-sm font-medium">{link.label}</span>
            </a>
          ))}
        </nav>

        {/* Separator */}
        <div className="px-4 py-2">
          <div className="h-px bg-[#222]" />
        </div>

        {/* Action links */}
        <div className="px-4 py-6 space-y-2 border-t border-[#222]">
          {actionLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => {
                link.action();
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                link.isDanger
                  ? 'text-red-400 hover:bg-red-500/10'
                  : 'text-[#888] hover:text-white hover:bg-[#1a1a1a]/50'
              }`}
            >
              {link.icon}
              <span className="text-sm font-medium">{link.label}</span>
            </button>
          ))}
        </div>

        {/* Footer text */}
        <div className="px-6 py-4 border-t border-[#222] text-center">
          <p className="text-xs text-[#555]">Indubienes Admin v1.0</p>
        </div>
      </aside>
    </>
  );
}
