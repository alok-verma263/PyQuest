import React from 'react';
import { Home, Compass, BookOpen, BarChart3, User } from 'lucide-react';

export type NavTab = 'home' | 'adventure' | 'practice' | 'progress' | 'profile';

export interface NavigationBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'HOME', icon: <Home size={17} /> },
    { id: 'adventure', label: 'ADVENTURE', icon: <Compass size={17} /> },
    { id: 'practice', label: 'PRACTICE', icon: <BookOpen size={17} /> },
    { id: 'progress', label: 'PROGRESS', icon: <BarChart3 size={17} /> },
    { id: 'profile', label: 'PROFILE', icon: <User size={17} /> },
  ];

  return (
    <nav className="w-full bg-slate-950/70 border-b border-slate-800/60 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center sm:justify-start gap-1 sm:gap-2 overflow-x-auto py-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
