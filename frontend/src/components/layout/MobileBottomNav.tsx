import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  Video,
  Radio,
  Sparkles,
  PlayCircle
} from 'lucide-react';

interface MobileBottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenDemo: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentRoute,
  onNavigate,
  onOpenDemo
}) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('cyberguard_mobile_theme') === 'dark';
  });

  useEffect(() => {
    const syncTheme = () => {
      setIsDark(localStorage.getItem('cyberguard_mobile_theme') === 'dark');
    };
    window.addEventListener('cyberguard_theme_changed', syncTheme);
    window.addEventListener('storage', syncTheme);
    return () => {
      window.removeEventListener('cyberguard_theme_changed', syncTheme);
      window.removeEventListener('storage', syncTheme);
    };
  }, []);

  const tabs = [
    { id: 'overview', label: 'Cockpit', icon: LayoutDashboard },
    { id: 'firewall', label: 'Firewall', icon: ShieldAlert },
    { id: 'common-attacks', label: 'Common Attacks', icon: ShieldAlert },
    { id: 'threats', label: 'Stream', icon: Radio },
    { id: 'ai-analyst', label: 'AI Analyst', icon: Sparkles }
  ];

  return (
    <nav
      className={`lg:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur-xl border-t px-2 py-1.5 transition-colors duration-200 pb-[max(0.5rem,env(safe-area-inset-bottom))] ${
        isDark
          ? 'bg-[#0A0E13]/95 border-white/10 text-white shadow-[0_-8px_25px_rgba(0,0,0,0.6)]'
          : 'bg-white/95 border-[#E5E2D9] text-[#131618] shadow-[0_-8px_20px_rgba(0,0,0,0.04)]'
      }`}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentRoute === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 ${
                isActive
                  ? isDark
                    ? 'text-emerald-400 scale-105 font-bold'
                    : 'text-[#E05A1B] scale-105 font-bold'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-[#71767C] hover:text-[#131618]'
              }`}
            >
              <div
                className={`w-9 h-7 rounded-lg flex items-center justify-center transition-all ${
                  isActive
                    ? isDark
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-[#E05A1B]/15 text-[#E05A1B]'
                    : 'text-inherit'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

