import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  ChevronRight,
  LogOut,
  Building,
  User,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Activity,
  Radio,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  currentRoute: string;
  isSidebarCollapsed: boolean;
  onOpenMobileSidebar: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenTenantSwitcher: () => void;
  onOpenDemo: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentRoute,
  isSidebarCollapsed,
  onOpenMobileSidebar,
  onOpenSearch,
  onOpenNotifications,
  onOpenTenantSwitcher,
  onOpenDemo
}) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [fluidState, setFluidState] = useState<'nominal' | 'inspected' | 'threat'>('nominal');

  // Cycle fluid dynamic island status smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      setFluidState((prev) => {
        if (prev === 'nominal') return 'inspected';
        if (prev === 'inspected') return 'threat';
        return 'nominal';
      });
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const routeTitles: Record<string, string> = {
    overview: 'SOC Dynamic Cockpit',
    threats: 'Live Threats Stream',
    incidents: 'Incident Command',
    investigation: 'Incident Investigation: INC-1042',
    firewall: 'Adaptive Core Firewall',
    network: 'Deep Packet Inspection (Wireshark Suite)',
    identity: 'Identity Security',
    phishing: 'Phishing Analysis Engine',
    multimodal: 'Multimodal Threat & Deepfake Lab',
    'graph-intelligence': 'Attack Graph & GNN Intelligence',
    'ai-analyst': 'AI Security Analyst',
    'threat-intelligence': 'Threat Intelligence',
    'response-center': 'Automated Response Playbooks',
    simulator: 'Attack Simulator Sandbox',
    'system-health': 'System Health & Probes',
    settings: 'Settings & Security Policies'
  };

  const currentTitle = routeTitles[currentRoute] || 'Security Engine';

  return (
    <header
      className={`fixed top-0 right-0 left-0 transition-all duration-200 ease-in-out ${
        isSidebarCollapsed ? 'lg:left-20' : 'lg:left-64'
      } h-16 crystal-panel border-b border-[#E5E2D9] z-30`}
    >
      <div className="h-16 w-full px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Section: Mobile Menu + Breadcrumbs (Shrink-safe & Isolated) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0 max-w-[200px] sm:max-w-[280px]">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 text-[#5B6168] hover:text-[#121517] hover:bg-[#EAE7DC] rounded-xl transition-all shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs / Page Title */}
          <div className="flex items-center gap-1.5 text-xs text-[#71767C] min-w-0 truncate">
            <span className="font-mono text-[#8F949C] hidden md:inline font-semibold">CYBERGUARD</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#B8BDC4] hidden md:inline shrink-0" />
            <span className="text-[#131618] font-bold tracking-tight truncate text-sm sm:text-xs">
              {currentTitle}
            </span>
          </div>
        </div>

        {/* Center Section: Centered Responsive Search Bar + Optional Large-Screen Status Island */}
        <div className="flex items-center justify-center gap-3 flex-1 min-w-0 px-2">
          {/* Search Trigger Bar */}
          <div
            onClick={onOpenSearch}
            className="relative w-full max-w-[220px] sm:max-w-[320px] md:max-w-[380px] cursor-pointer group"
          >
            <div className="w-full h-9 pl-8 sm:pl-9 pr-9 sm:pr-11 bg-[#F2F0E8]/80 hover:bg-[#F2F0E8] text-[#131618] rounded-xl flex items-center text-xs transition-all border border-[#E0DCD1] hover:border-[#C9C3B4] shadow-xs">
              <Search className="w-3.5 h-3.5 text-[#888F96] absolute left-2.5 sm:left-3 transition-colors group-hover:text-[#131618] shrink-0" />
              <span className="text-[#767E86] truncate text-[11px] sm:text-xs">
                Search packets, IP, vectors...
              </span>
              <kbd className="hidden sm:inline-flex absolute right-2.5 px-1.5 py-0.5 bg-white/90 border border-[#D5D0C3] rounded-md text-[10px] font-mono text-[#626870] font-semibold shadow-xs">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Ultra-Wide Dynamic Status Island (Only rendered on 2xl: >=1536px so it never crowds laptops) */}
          <div className="hidden 2xl:flex items-center shrink-0">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 border shadow-xs ${
                fluidState === 'nominal'
                  ? 'bg-emerald-50/80 border-emerald-200/80 text-emerald-800'
                  : fluidState === 'inspected'
                  ? 'bg-sky-50/80 border-sky-200/80 text-sky-800'
                  : 'bg-amber-50/80 border-amber-200/80 text-amber-800'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full animate-ping ${
                  fluidState === 'nominal'
                    ? 'bg-emerald-500'
                    : fluidState === 'inspected'
                    ? 'bg-sky-500'
                    : 'bg-amber-500'
                }`}
              />
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase whitespace-nowrap">
                {fluidState === 'nominal' && '● ZERO-TRUST SHIELD'}
                {fluidState === 'inspected' && '● 24K PKTS/S DPI'}
                {fluidState === 'threat' && '● 1 SUSPICIOUS BEACON'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Live Demo, Tenant, Notifications, User (Shrink-safe & Organized) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Live Hackathon Demonstration Mode Trigger */}
          <button
            onClick={onOpenDemo}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#E05A1B] hover:bg-[#C84E14] text-white rounded-xl transition-all text-xs font-bold shadow-xs active:scale-95 cursor-pointer shrink-0"
            title="Launch Live Demonstration Mode"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse shrink-0" />
            <span className="hidden sm:inline">Live Demo</span>
          </button>

          {/* Tenant Switcher Button */}
          <button
            onClick={onOpenTenantSwitcher}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#EDEAE0] hover:bg-[#E5E1D4] text-[#131618] rounded-xl transition-all text-xs font-semibold border border-[#DDD8CB] shrink-0"
            title="Switch Workspace Tenant"
          >
            <Building className="w-3.5 h-3.5 text-[#E05A1B] shrink-0" />
            <span className="truncate max-w-[85px] lg:max-w-[110px]">
              {user?.active_tenant === 'tenant-okcl-edu-02'
                ? 'OKCL Edu'
                : user?.active_tenant === 'tenant-okcl-gov-03'
                ? 'Odisha Gov'
                : 'OKCL Primary'}
            </span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-[#5B6168] hover:text-[#121517] hover:bg-[#EDEAE0] rounded-xl transition-colors shrink-0"
            title="Security Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white" />
          </button>

          <div className="h-5 w-px bg-[#DCD8CC] hidden sm:block shrink-0" />

          {/* User Profile */}
          <div className="relative shrink-0">
            <div
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-[#EDEAE0] transition-colors"
            >
              <img
                src={
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80'
                }
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-xs shrink-0"
              />
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-bold text-[#131618] leading-tight truncate max-w-[100px]">
                  {user?.name || 'Elena Vance'}
                </span>
                <span className="text-[10px] font-mono text-[#71767C] uppercase tracking-wider">
                  {user?.role || 'Admin'}
                </span>
              </div>
            </div>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 crystal-panel bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-[#DDD8CB] py-2 z-50 animate-fluid">
                <div className="px-4 py-2 border-b border-[#E5E2D9]">
                  <p className="text-xs font-bold text-[#131618]">{user?.name}</p>
                  <p className="text-[11px] text-[#71767C] truncate">{user?.email}</p>
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#E05A1B]/10 text-[#E05A1B] font-bold uppercase">
                    Role: {user?.role}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-[#DC2626] hover:bg-[#FEE2E2]/60 flex items-center gap-2 font-medium transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out of Console</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
