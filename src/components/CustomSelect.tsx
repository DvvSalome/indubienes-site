'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  variant?: 'default' | 'hero' | 'filter';
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar',
  label,
  variant = 'default',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate dropdown position when opened
  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, updatePosition]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        ref.current && !ref.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }
  }, [isOpen]);

  const baseStyles = {
    default: {
      trigger: 'bg-card border border-border text-foreground hover:border-gold/50',
      dropdown: 'bg-card border border-border',
      option: 'text-muted hover:text-foreground hover:bg-surface',
      optionActive: 'text-gold bg-gold/10',
    },
    hero: {
      trigger: 'bg-white/[0.07] border border-white/[0.12] text-white hover:border-gold/40 hover:bg-white/[0.1]',
      dropdown: 'bg-[#1A1A1A] border border-white/[0.15] shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
      option: 'text-white/70 hover:text-white hover:bg-white/[0.08]',
      optionActive: 'text-gold bg-gold/10',
    },
    filter: {
      trigger: 'bg-surface border border-border text-foreground hover:border-gold/40',
      dropdown: 'bg-card border border-border shadow-2xl',
      option: 'text-muted hover:text-foreground hover:bg-surface',
      optionActive: 'text-gold bg-gold/10',
    },
  };

  const s = baseStyles[variant];

  const dropdownContent = (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: dropdownPos.top,
        left: dropdownPos.left,
        width: dropdownPos.width,
        zIndex: 9999,
      }}
      className={`rounded-xl overflow-hidden shadow-2xl transition-all duration-200 origin-top ${s.dropdown} ${
        isOpen
          ? 'opacity-100 scale-y-100'
          : 'opacity-0 scale-y-95 pointer-events-none'
      }`}
    >
      <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              onChange(opt.value);
              setIsOpen(false);
            }}
            className={`w-full text-left px-4 py-2.5 text-sm font-body transition-all duration-200 ${
              opt.value === value ? s.optionActive : s.option
            }`}
          >
            <span className="flex items-center justify-between">
              {opt.label}
              {opt.value === value && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gold">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="block text-xs font-body text-muted mb-1.5 tracking-wide">{label}</label>
      )}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-sm font-body transition-all duration-300 ${s.trigger} ${isOpen ? 'border-gold/60 shadow-[0_0_0_2px_rgba(201,169,98,0.15)]' : ''}`}
      >
        <span className={value ? '' : 'opacity-50'}>{selectedLabel}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Portal dropdown — renders at body level, escapes all overflow:hidden parents */}
      {mounted && createPortal(dropdownContent, document.body)}
    </div>
  );
}
