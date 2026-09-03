import React, { useState, useRef, useEffect } from 'react';
import { SupportedLanguage } from '../types';
import { LANGUAGES } from '../services/i18n';
import { Globe, Check, ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
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
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        id="language-selector-button"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between gap-2 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all focus:outline-hidden focus:ring-2 focus:ring-teal-500 min-h-[44px]"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
        <span className="font-medium text-slate-900 dark:text-white">
          {activeLangInfo.nativeName}
        </span>
        <span className="hidden md:inline text-xs text-slate-400 dark:text-slate-500 font-normal">
          ({activeLangInfo.name})
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          {/* Mobile backdrop for easy tap dismissal */}
          <div
            className="fixed inset-0 bg-black/40 z-40 sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div
            id="language-dropdown-menu"
            className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 bottom-4 sm:bottom-auto sm:top-full mt-2 w-auto sm:w-64 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
            role="menu"
            aria-orientation="vertical"
          >
            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Select Language / زبان چنیں
              </p>
            </div>

            <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto py-1">
              {(Object.keys(LANGUAGES) as SupportedLanguage[]).map((code) => {
                const lang = LANGUAGES[code];
                const isSelected = currentLanguage === code;

                return (
                  <button
                    key={code}
                    id={`lang-option-${code}`}
                    type="button"
                    onClick={() => handleSelect(code)}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors min-h-[44px] ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 font-bold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                    role="menuitem"
                  >
                    <div className="flex flex-col">
                      <span className="text-base sm:text-sm font-semibold text-slate-900 dark:text-white">
                        {lang.nativeName}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
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
