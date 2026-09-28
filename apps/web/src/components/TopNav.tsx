import React, { useState } from 'react';
import { Search, Bell, ChevronDown, Cpu, Database, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface TopNavProps {
  demoMode: boolean;
  modelUsed: string;
  fallbackUsed: boolean;
  onSearch?: (query: string) => void;
  onOpenArchitecture?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  demoMode,
  modelUsed,
  fallbackUsed,
  onSearch,
  onOpenArchitecture,
}) => {
  const [searchVal, setSearchVal] = useState('');
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-16 bg-white dark:bg-[#111625] border-b border-slate-200 dark:border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20 transition-colors shadow-xs">
      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          value={searchVal}
          onChange={(e) => {
            setSearchVal(e.target.value);
            onSearch?.(e.target.value);
          }}
          placeholder="Search incidents, services, or agents..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-inner"
        />
      </div>

      {/* Right User & System Controls */}
      <div className="flex items-center space-x-3">
        {/* PROMINENT LIGHT / DARK THEME SWITCHER */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              theme === 'light'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            title="Switch to Light Mode"
          >
            <Sun className="w-3.5 h-3.5" />
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
          >
            <Moon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dark</span>
          </button>
        </div>

        {/* Memory System Badge */}
        <div
          onClick={onOpenArchitecture}
          className="cursor-pointer hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700"
          title="Click to view canonical architecture"
        >
          <Database className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span>{demoMode ? 'Local Memory' : 'Hindsight Cloud'}</span>
        </div>

        {/* LLM Engine Badge */}
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/70 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold">
          <Cpu className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span className="font-mono text-[11px]">{fallbackUsed ? 'qwen3.8-27b' : modelUsed || 'gpt-oss-120b'}</span>
        </div>

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
          title="Incident Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-brand-600 absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-[#111625]" />
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3 pl-2 border-l border-slate-200 dark:border-slate-800 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-brand-200 dark:ring-brand-900 shadow-sm">
            MT
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Mike Taylor</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Platform SRE Admin</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </header>
  );
};
export default TopNav;
