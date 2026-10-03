import React, { useState, useRef, useEffect } from 'react';
import { SupportedLanguage } from '../types';
import { LANGUAGES } from '../services/i18n';
import { Globe, Check, ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  compact?: boolean;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  compact = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLangInfo = LANGUAGES[currentLanguage] || LANGUAGES.en;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (code: SupportedLanguage) => {
    onLanguageChange(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        id="language-selector-button"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={
          compact
            ? "inline-flex items-center justify-between gap-1 px-2 py-1 text-xs font-semibold rounded-xl bg-teal-900/80 hover:bg-teal-800 text-white border border-teal-700/50 shadow-xs transition-all focus:outline-hidden min-h-[32px] sm:min-h-[36px] cursor-pointer"
            : "inline-flex items-center justify-between gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all focus:outline-hidden focus:ring-2 focus:ring-teal-500 min-h-[36px] sm:min-h-[40px] cursor-pointer"
        }
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={`Current Language: ${activeLangInfo.name}`}
      >
        <Globe className={`shrink-0 ${compact ? 'w-3.5 h-3.5 text-teal-300' : 'w-4 h-4 text-teal-600 dark:text-teal-400'}`} />
        <span className={`font-semibold ${compact ? 'text-xs uppercase tracking-wider' : ''}`}>
          {compact
            ? currentLanguage === 'ur'
              ? 'اردو'
              : currentLanguage === 'roman'
              ? 'ROM'
              : 'EN'
            : activeLangInfo.nativeName}
        </span>
        {!compact && (
          <span className="hidden md:inline text-xs text-slate-400 dark:text-slate-500 font-normal">
            ({activeLangInfo.name})
          </span>
        )}
        <ChevronDown
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${
            compact ? 'w-3 h-3 text-teal-300' : 'w-3.5 h-3.5'
          } ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Subtle backdrop for quick tap outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div
            id="language-dropdown-menu"
            className="absolute top-full mt-1.5 right-0 rtl:right-auto rtl:left-0 w-52 sm:w-56 max-w-[85vw] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
            role="menu"
            aria-orientation="vertical"
          >
            <div className="px-3.5 py-1.5 border-b border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Select Language / زبان چنیں
              </p>
            </div>

            <div className="py-1">
              {(Object.keys(LANGUAGES) as SupportedLanguage[]).map((code) => {
                const lang = LANGUAGES[code];
                const isSelected = currentLanguage === code;

                return (
                  <button
                    key={code}
                    id={`lang-option-${code}`}
                    type="button"
                    onClick={() => handleSelect(code)}
                    className={`w-full text-left rtl:text-right px-3.5 py-2.5 flex items-center justify-between transition-colors cursor-pointer text-xs sm:text-sm ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 font-bold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                    role="menuitem"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {lang.nativeName}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {lang.name}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="p-1 rounded-full bg-teal-600 text-white shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
