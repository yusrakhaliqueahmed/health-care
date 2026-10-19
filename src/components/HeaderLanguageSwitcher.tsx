import React, { useState, useRef, useEffect } from 'react';
import { SupportedLanguage } from '../types';
import { LANGUAGES } from '../services/i18n';
import { Globe, Check, ChevronDown, Sparkles } from 'lucide-react';

interface HeaderLanguageSwitcherProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  compact?: boolean;
  className?: string;
}

export const HeaderLanguageSwitcher: React.FC<HeaderLanguageSwitcherProps> = ({
  currentLanguage,
  onLanguageChange,
  compact = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLangInfo = LANGUAGES[currentLanguage] || LANGUAGES.en;

  // Persist language to localStorage and dynamically update whole UI
  const handleSelect = (code: SupportedLanguage) => {
    try {
      localStorage.setItem('sehat_saathi_language', code);
    } catch (e) {
      console.warn('localStorage error saving language:', e);
    }
    onLanguageChange(code);
    setIsOpen(false);
  };

  // Close when clicked outside
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

  const languagesList: { code: SupportedLanguage; name: string; nativeName: string; flag: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
    { code: 'roman', name: 'Roman Urdu', nativeName: 'Roman Urdu', flag: '🇵🇰' },
  ];

  return (
    <div
      id="header-language-switcher-container"
      className={`relative inline-block text-left ${className}`}
      ref={dropdownRef}
    >
      {/* Switcher Button: Neon glass in dark mode, clean white in light mode */}
      <button
        id="header-language-switcher-button"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={`Current Language: ${activeLangInfo.name} (${activeLangInfo.nativeName})`}
        className={
          compact
            ? "inline-flex items-center justify-between gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer min-h-[32px] sm:min-h-[36px] bg-white dark:bg-[#0c1230]/80 text-slate-800 dark:text-[#22D3EE] border border-slate-200 dark:border-[#22D3EE]/40 hover:border-[#22D3EE] dark:shadow-[0_0_12px_rgba(34,211,238,0.2)] dark:hover:shadow-[0_0_18px_rgba(34,211,238,0.35)]"
            : "inline-flex items-center justify-between gap-2 px-3 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer min-h-[36px] sm:min-h-[40px] bg-white dark:bg-[#0c1230]/80 text-slate-900 dark:text-[#FFFFFF] border border-slate-200 dark:border-[#22D3EE]/40 hover:border-[#22D3EE] dark:shadow-[0_0_15px_rgba(34,211,238,0.2)] dark:hover:shadow-[0_0_22px_rgba(34,211,238,0.4)]"
        }
      >
        <Globe
          className={`shrink-0 ${
            compact
              ? 'w-3.5 h-3.5 text-blue-600 dark:text-[#22D3EE]'
              : 'w-4 h-4 text-blue-600 dark:text-[#22D3EE]'
          }`}
        />

        <span className="tracking-tight font-extrabold flex items-center gap-1">
          <span>{compact ? (currentLanguage === 'ur' ? 'اردو' : currentLanguage === 'roman' ? 'ROM' : 'EN') : activeLangInfo.nativeName}</span>
          {!compact && (
            <span className="text-[11px] font-normal text-slate-500 dark:text-[#A5B4FC]">
              ({activeLangInfo.name})
            </span>
          )}
        </span>

        <ChevronDown
          className={`shrink-0 transition-transform duration-200 text-slate-400 dark:text-[#22D3EE] ${
            compact ? 'w-3 h-3' : 'w-3.5 h-3.5'
          } ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop for click outside */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div
            id="header-language-dropdown-menu"
            className="absolute top-full mt-2 right-0 rtl:right-auto rtl:left-0 w-56 max-w-[85vw] rounded-2xl p-1.5 z-50 transition-all bg-white dark:bg-[#0c1230] border border-slate-200 dark:border-[#22D3EE]/50 shadow-xl dark:shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(34,211,238,0.25)]"
            role="menu"
            aria-orientation="vertical"
          >
            {/* Header label */}
            <div className="px-3 py-1.5 border-b border-slate-100 dark:border-[#22D3EE]/20 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-[#A5B4FC] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600 dark:text-[#22D3EE]" />
                <span>Select Language / زبان چنیں</span>
              </span>
            </div>

            {/* Language options */}
            <div className="py-1 space-y-1">
              {languagesList.map((lang) => {
                const isSelected = currentLanguage === lang.code;

                return (
                  <button
                    key={lang.code}
                    id={`header-lang-opt-${lang.code}`}
                    type="button"
                    onClick={() => handleSelect(lang.code)}
                    role="menuitem"
                    className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer text-xs sm:text-sm font-bold ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-[#22D3EE]/15 text-blue-900 dark:text-[#22D3EE] border border-blue-200 dark:border-[#22D3EE]/40 shadow-xs'
                        : 'text-slate-700 dark:text-[#C7D2FE] hover:bg-slate-50 dark:hover:bg-[#161F48] hover:text-slate-900 dark:hover:text-[#FFFFFF]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base leading-none">{lang.flag}</span>
                      <div className="flex flex-col">
                        <span className="text-slate-900 dark:text-[#FFFFFF] leading-snug">
                          {lang.nativeName}
                        </span>
                        <span className="text-[10px] font-normal text-slate-500 dark:text-[#A5B4FC]">
                          {lang.name}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-blue-600 dark:bg-[#22D3EE] text-white dark:text-[#050816] flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
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
