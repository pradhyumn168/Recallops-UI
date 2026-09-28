import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Sun, Moon, User, Shield, PhoneCall, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface TopNavProps {
  demoMode?: boolean;
  modelUsed?: string;
  fallbackUsed?: boolean;
  onSearch?: (query: string) => void;
  onOpenArchitecture?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onSearch,
}) => {
  const [searchVal, setSearchVal] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  // Close dropdown on outside click or ESC key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-[#111625] border-b border-slate-200 dark:border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20 transition-colors shadow-xs">
      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchVal}
          onChange={(e) => {
            setSearchVal(e.target.value);
            onSearch?.(e.target.value);
          }}
          placeholder="Search incidents, services, or agents..."
          aria-label="Search incidents, services, or agents"
          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-inner"
        />
      </div>

      {/* Right Controls: Segmented Theme Switcher + Admin Profile Control only */}
      <div className="flex items-center space-x-4">
        {/* PROMINENT LIGHT / DARK THEME SWITCHER */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-2xs">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              theme === 'light'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            title="Switch to Light Mode"
            aria-label="Switch to Light Mode"
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Light</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              theme === 'dark'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            title="Switch to Dark Mode"
            aria-label="Switch to Dark Mode"
          >
            <Moon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dark</span>
          </button>
        </div>

        {/* Subtle Vertical Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        {/* User Profile Control & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            aria-label="User Profile and Account Menu"
            className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
          >
            {/* Strict True-Circle Avatar: equal w and h (36px), aspect-square, border-radius: 50% via rounded-full */}
            <div className="w-9 h-9 min-w-[36px] min-h-[36px] aspect-square rounded-full shrink-0 flex items-center justify-center font-bold text-xs ring-2 ring-brand-300 dark:ring-brand-700 bg-brand-600 text-white shadow-xs select-none">
              MT
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Mike Taylor</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Platform SRE Admin</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#161F36] border border-slate-200 dark:border-slate-700 shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100 text-xs">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-3">
                <div className="w-10 h-10 min-w-[40px] min-h-[40px] aspect-square rounded-full shrink-0 flex items-center justify-center font-bold text-sm bg-brand-600 text-white ring-2 ring-brand-300 dark:ring-brand-700 shadow-xs">
                  MT
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white truncate">Mike Taylor</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">mike.taylor@recallops.internal</div>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Incident Commander</span>
                  </div>
                </div>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>View SRE Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <PhoneCall className="w-4 h-4 text-slate-400" />
                  <span>On-Call Rotation Schedule</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span>Security & Permissions</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    alert('Signed out from RecallOps SRE console.');
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
