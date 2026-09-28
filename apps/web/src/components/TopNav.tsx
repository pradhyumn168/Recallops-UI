import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  Sun,
  Moon,
  User,
  Shield,
  PhoneCall,
  LogOut,
  Layers,
  Users,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { IncidentContext } from '../types';

interface TopNavProps {
  demoMode?: boolean;
  modelUsed?: string;
  fallbackUsed?: boolean;
  incidents?: IncidentContext[];
  onSelectIncident?: (incidentId: string) => void;
  onSearch?: (query: string) => void;
  onOpenArchitecture?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  incidents = [],
  onSelectIncident,
  onSearch,
}) => {
  const [searchVal, setSearchVal] = useState('');
  const [debouncedVal, setDebouncedVal] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedVal(searchVal);
      onSearch?.(searchVal);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchVal, onSearch]);

  // Filter incidents across multiple fields
  const searchResults = useMemo(() => {
    const term = debouncedVal.trim().toLowerCase();
    if (!term) return [];

    return incidents.filter((inc) => {
      const idMatch = inc.incident_id.toLowerCase().includes(term);
      const titleMatch = inc.title.toLowerCase().includes(term);
      const serviceMatch = inc.service.toLowerCase().includes(term);
      const severityMatch = inc.severity.toLowerCase().includes(term);
      const statusMatch = inc.status.toLowerCase().includes(term);
      const ownerMatch = (inc.owner?.name || '').toLowerCase().includes(term);
      const responderMatch = (inc.assigned_responders || []).some((r) =>
        r.name.toLowerCase().includes(term)
      );
      const userCount = inc.impactedUsers || inc.metrics?.affected_checkout_attempts || 0;
      const countMatch =
        String(userCount).includes(term) ||
        userCount.toLocaleString().toLowerCase().includes(term) ||
        (term === 'user' || term === 'users');

      return (
        idMatch ||
        titleMatch ||
        serviceMatch ||
        severityMatch ||
        statusMatch ||
        ownerMatch ||
        responderMatch ||
        countMatch
      );
    });
  }, [incidents, debouncedVal]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchResults]);

  // Handle outside click and keyboard shortcuts
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setIsDropdownOpen(false);
        searchInputRef.current?.blur();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectIncidentItem = (incidentId: string) => {
    onSelectIncident?.(incidentId);
    setIsSearchOpen(false);
    setSearchVal('');
    setSelectedIndex(-1);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchOpen || searchResults.length === 0) {
      if (e.key === 'ArrowDown' && searchVal.trim().length > 0) {
        setIsSearchOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
        handleSelectIncidentItem(searchResults[selectedIndex].incident_id);
      } else if (searchResults.length > 0) {
        handleSelectIncidentItem(searchResults[0].incident_id);
      }
    }
  };

  const getSeverityBadgeClass = (sev: string) => {
    switch (sev) {
      case 'P1':
        return 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'P2':
        return 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'P3':
        return 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'Resolving':
        return 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'Open':
        return 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'Investigating':
      default:
        return 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-[#111625] border-b border-slate-200 dark:border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-40 transition-colors shadow-xs">
      {/* Global Incident Search with Debounced Dropdown */}
      <div className="relative w-full max-w-lg" ref={searchContainerRef}>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => {
              if (searchVal.trim().length > 0) setIsSearchOpen(true);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Search incident ID, title, service, owner, severity, users..."
            aria-label="Global incident search"
            aria-expanded={isSearchOpen}
            aria-haspopup="listbox"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-inner font-medium"
          />
        </div>

        {/* Debounced Search Results Dropdown */}
        {isSearchOpen && searchVal.trim().length > 0 && (
          <div
            role="listbox"
            aria-label="Search suggestions"
            className="absolute top-full left-0 mt-2 w-full max-h-96 overflow-y-auto bg-white dark:bg-[#161F36] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100 text-xs"
          >
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <span>Matching Incidents ({searchResults.length})</span>
              <span className="text-[9px] font-mono text-slate-400 font-normal">Use ↑ ↓ to navigate, Enter to select</span>
            </div>

            {searchResults.length === 0 ? (
              <div className="p-6 text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  No incidents found matching "{searchVal}"
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Search by incident ID (e.g. INC-2026), title, service, status, severity, or impacted users.
                </p>
              </div>
            ) : (
              searchResults.map((inc, index) => {
                const isSelected = index === selectedIndex;
                const userCount = inc.impactedUsers || inc.metrics?.affected_checkout_attempts || 0;

                return (
                  <div
                    key={inc.incident_id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectIncidentItem(inc.incident_id)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border flex flex-col space-y-1.5 ${
                      isSelected
                        ? 'bg-brand-50/70 dark:bg-brand-950/60 border-brand-500 shadow-sm'
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-brand-600 dark:text-brand-400">
                          {inc.incident_id}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${getSeverityBadgeClass(inc.severity)}`}>
                          {inc.severity}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(inc.status)}`}>
                          {inc.status}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{userCount.toLocaleString()} users</span>
                      </div>
                    </div>

                    <div className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                      {inc.title}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                      <div className="flex items-center space-x-1.5 font-medium">
                        <Layers className="w-3 h-3 text-slate-400" />
                        <span>{inc.service}</span>
                      </div>
                      {inc.owner && (
                        <div className="flex items-center space-x-1.5 font-medium">
                          <span className="text-slate-400 text-[10px]">Owner:</span>
                          <span className="text-slate-800 dark:text-slate-200 font-semibold">{inc.owner.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Segmented Theme Switcher + Admin Profile Control */}
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
            {/* Strict True-Circle Avatar: equal w and h (36px), aspect-square, border-radius: 50% */}
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
