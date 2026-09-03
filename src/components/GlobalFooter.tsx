import React from 'react';

interface GlobalFooterProps {
  className?: string;
  showSubtitle?: boolean;
}

export const GlobalFooter: React.FC<GlobalFooterProps> = ({
  className = '',
  showSubtitle = true,
}) => {
  return (
    <footer
      id="global-attribution-footer"
      className={`w-full py-2.5 px-4 mt-auto shrink-0 select-none border-t border-slate-200/50 dark:border-slate-800/60 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xs transition-colors ${className}`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] sm:text-xs">
        {showSubtitle && (
          <div className="text-center sm:text-left text-slate-400 dark:text-slate-500 font-medium">
            SehatSaathi Pro • PMDC Certified Clinical Guide
          </div>
        )}
        <div className={`font-semibold text-slate-400 dark:text-slate-500 tracking-wide ${showSubtitle ? 'text-center sm:text-right' : 'w-full text-center'}`}>
          Design by Yusra Khalique Ahmed
        </div>
      </div>
    </footer>
  );
};
