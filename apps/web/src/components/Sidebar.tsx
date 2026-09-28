import React from 'react';
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  Layers,
  Bot,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  GitFork,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  activeIncidentsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  activeIncidentsCount,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="w-64 bg-slate-50 dark:bg-[#0E1526] flex-shrink-0 flex flex-col justify-between h-screen sticky top-0 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 select-none z-30 transition-colors">
      <div>
        {/* Brand / Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectView('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-900 dark:text-white font-extrabold tracking-tight text-base flex items-center">
                RecallOps
              </span>
              <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold tracking-wide">Incident Memory Agent</span>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="px-3 py-4 space-y-6 text-xs">
          {/* OVERVIEW */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Overview
            </div>
            <div className="space-y-1">
              <button
                onClick={() => onSelectView('dashboard')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-semibold transition-all ${
                  currentView === 'dashboard'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => onSelectView('activity')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-semibold transition-all ${
                  currentView === 'activity'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Activity</span>
              </button>
            </div>
          </div>

          {/* OPERATIONS */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Operations
            </div>
            <div className="space-y-1">
              <button
                onClick={() => onSelectView('incident-detail')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                  currentView === 'incident-detail'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Incidents</span>
                </div>
                {activeIncidentsCount > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      currentView === 'incident-detail'
                        ? 'bg-white/25 text-white'
                        : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                    }`}
                  >
                    {activeIncidentsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onSelectView('services')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-semibold transition-all ${
                  currentView === 'services'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Services</span>
              </button>

              <button
                onClick={() => onSelectView('agents')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-semibold transition-all ${
                  currentView === 'agents'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>Agents & Memory</span>
              </button>

              <button
                onClick={() => onSelectView('architecture')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-semibold transition-all ${
                  currentView === 'architecture'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <GitFork className="w-4 h-4" />
                <span>Architecture</span>
              </button>
            </div>
          </div>

          {/* ORGANIZATION */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Organization
            </div>
            <div className="space-y-1">
              <button
                onClick={() => onSelectView('team')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-semibold transition-all ${
                  currentView === 'team'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Team</span>
              </button>

              <button
                onClick={() => onSelectView('settings')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-semibold transition-all ${
                  currentView === 'settings'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-xs space-y-1">
        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800 font-semibold"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          <div className="flex items-center space-x-3">
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-brand-600" />
            )}
            <span>{theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 font-bold border border-slate-200 dark:border-slate-700 shadow-2xs">
            {theme}
          </span>
        </button>

        <button
          onClick={() => alert('RecallOps Decision Support Agent - Microsoft Hackathon 2026')}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Help & Support</span>
        </button>

        <button
          onClick={() => onSelectView('dashboard')}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
