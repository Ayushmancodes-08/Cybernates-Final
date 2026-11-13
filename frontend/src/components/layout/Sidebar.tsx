import React from 'react';
import {
  LayoutDashboard,
  Radio,
  AlertTriangle,
  Shield,
  Network,
  UserCheck,
  MailWarning,
  Sparkles,
  Globe,
  Zap,
  PlayCircle,
  Activity,
  Settings,
  X,
  Video,
  Share2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Skull,
  LucideIcon
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  highlight?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse
}) => {
  const navSections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, badge: 'Live' }
      ]
    },
    {
      title: 'Active Defense',
      items: [
        { id: 'network', label: 'Network & DPI', icon: Network, badge: 'Wireshark' },
        { id: 'threats', label: 'Live Threats', icon: Radio },
        { id: 'incidents', label: 'Incidents', icon: AlertTriangle, badge: '3' },
        { id: 'firewall', label: 'Adaptive Firewall', icon: Shield }
      ]
    },
    {
      title: 'Intelligence Lab',
      items: [
        { id: 'multimodal', label: 'Multimodal Threat Lab', icon: Video, badge: 'Forensics' },
        { id: 'graph-intelligence', label: 'Attack Graph GNN', icon: Share2 },
        { id: 'identity', label: 'Identity & Access', icon: UserCheck },
        { id: 'phishing', label: 'Phishing Engine', icon: MailWarning },
        { id: 'ai-analyst', label: 'AI SOC Analyst', icon: Sparkles, highlight: true },
        { id: 'threat-intelligence', label: 'Global Intel', icon: Globe }
      ]
    },
    {
      title: 'Operations',
      items: [
        { id: 'response-center', label: 'Response Playbooks', icon: Zap },
        { id: 'simulator', label: 'Attack Simulator', icon: PlayCircle }
      ]
    },
    {
      title: 'System',
      items: [
        { id: 'system-health', label: 'Telemetry & Probes', icon: Activity },
        { id: 'settings', label: 'Configuration', icon: Settings }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#F4F3ED] border-r border-[#E5E2D9] text-[#1D2125] flex flex-col transition-all duration-200 ease-in-out lg:translate-x-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#E5E2D9] bg-[#EDEBE2]/60 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-[#E05A1B] flex items-center justify-center text-white shadow-xs shrink-0 font-bold">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-bold text-[#14171A] tracking-tight">CyberGuard</span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#71767C]">SOC Console</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Desktop Collapse 2D Toggle */}
            <button
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-[#5B6168] hover:text-[#14171A] hover:bg-[#E5E2D9] transition-colors"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Mobile close */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-[#5B6168] hover:text-[#14171A] rounded-lg hover:bg-[#E5E2D9]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-0.5">
              {!isCollapsed ? (
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[#8A9099] font-semibold">
                  {section.title}
                </div>
              ) : (
                <div className="w-full h-px bg-[#E5E2D9] my-2" />
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  currentRoute === item.id ||
                  (item.id === 'incidents' && currentRoute === 'investigation');

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      onCloseMobile();
                    }}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full group relative flex items-center ${
                      isCollapsed ? 'justify-center px-0' : 'justify-between px-3'
                    } py-2 rounded-xl text-xs font-medium transition-all text-left ${
                      isActive
                        ? 'bg-[#181C20] text-white shadow-xs font-semibold'
                        : item.highlight
                        ? 'text-[#C2410C] bg-[#FFEDD5]/60 hover:bg-[#FFEDD5]'
                        : 'text-[#484F56] hover:bg-[#EAE7DC] hover:text-[#14171A]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform duration-150 ${
                          isActive
                            ? 'text-[#F97316]'
                            : item.highlight
                            ? 'text-[#EA580C]'
                            : 'text-[#697078] group-hover:text-[#14171A]'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md uppercase font-bold shrink-0 ${
                          isActive
                            ? 'bg-[#2B3138] text-[#F97316]'
                            : item.badge === 'Wireshark'
                            ? 'bg-[#D97706]/15 text-[#B45309]'
                            : 'bg-[#E0DDD0] text-[#4A515A]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Collapsed Tooltip */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#14171A] text-white text-xs font-medium rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Pill Status */}
        <div className="p-3 bg-[#EAE8DD] border-t border-[#E5E2D9] shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center justify-between px-1 text-[11px] font-mono text-[#5B6168]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-[#14171A]">CORE ACTIVE</span>
              </div>
              <span className="text-[10px] bg-[#DCD8CC] px-1.5 py-0.5 rounded text-[#444A52]">v4.2</span>
            </div>
          ) : (
            <div className="flex justify-center" title="Core Engine Active">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
