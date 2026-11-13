import React from 'react';
import { X, ShieldAlert, CheckCircle2, Info, ArrowRight } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose, onNavigate }) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'notif-1',
      title: 'Autonomous Firewall Rule Activated',
      desc: 'IP 185.220.101.42 dropped on netfilter table (INC-1042). Verified via netlink.',
      time: '12m ago',
      type: 'critical',
      route: 'firewall'
    },
    {
      id: 'notif-2',
      title: 'Impossible Travel Alert Neutralized',
      desc: 'Active sessions for deepak.mohanty@okcl.org revoked following dual Frankfurt/Bhubaneswar logins.',
      time: '48m ago',
      type: 'warning',
      route: 'identity'
    },
    {
      id: 'notif-3',
      title: 'Phishing Delivery Quarantined',
      desc: 'Inbound message from okcl-payroll.support-portal.top isolated at mail gateway.',
      time: '2h ago',
      type: 'success',
      route: 'phishing'
    },
    {
      id: 'notif-4',
      title: 'Threat Intel Feed Synced',
      desc: 'Tor consensus node list updated with 2,180 active relays.',
      time: '3h ago',
      type: 'info',
      route: 'threat-intelligence'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-inverse-surface/30 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface-container-lowest shadow-2xl border-l border-surface-container flex flex-col">
          <div className="p-4 border-b border-surface-container flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-on-surface">Security Alert Center</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-red-100 text-red-700 font-bold">4 Unread</span>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  onNavigate(n.route);
                  onClose();
                }}
                className="p-3.5 rounded-xl border border-surface-container hover:bg-surface-container-low cursor-pointer transition-all hover:shadow-xs group"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {n.type === 'critical' && <ShieldAlert className="w-4 h-4 text-red-600" />}
                    {n.type === 'warning' && <ShieldAlert className="w-4 h-4 text-amber-600" />}
                    {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {n.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-semibold text-on-surface truncate">{n.title}</h4>
                      <span className="text-[10px] font-mono text-outline shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{n.desc}</p>
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-primary font-medium group-hover:underline">
                      <span>Investigate in {n.route}</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-surface-container bg-surface-container-low flex justify-between items-center text-xs">
            <button onClick={onClose} className="text-outline hover:text-on-surface">Mark all as read</button>
            <span className="font-mono text-[10px] text-outline">ENGINE STREAM: SOC-01</span>
          </div>
        </div>
      </div>
    </div>
  );
};
