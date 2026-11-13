import React, { useState, useEffect } from 'react';
import { Search, Shield, AlertTriangle, User, Hash, X } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'incident' | 'threat' | 'firewall' | 'user';
  title: string;
  subtitle: string;
  badge: string;
  route: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sampleData: SearchResult[] = [
    { id: 'inc-1042', type: 'incident', title: 'INC-1042: Coordinated Port Scan & SSH Brute-Force', subtitle: 'Target: 10.0.12.44 | Risk: 94/100', badge: 'CRITICAL', route: 'investigation' },
    { id: 'inc-1041', type: 'incident', title: 'INC-1041: Credential Stuffing & Impossible Travel', subtitle: 'deepak.mohanty@okcl.org | Risk: 87/100', badge: 'HIGH', route: 'incidents' },
    { id: 'thr-8891', type: 'threat', title: '185.220.101.42 (Tor Exit Relay Node)', subtitle: 'SYN sweep on OKCL Gateway | Status: CONTAINED', badge: '94 RISK', route: 'threats' },
    { id: 'thr-8892', type: 'threat', title: '45.154.255.89 (Storm-0501 Botnet)', subtitle: 'SSH Password spray | Status: BLOCKED', badge: '88 RISK', route: 'threats' },
    { id: 'fw-9041', type: 'firewall', title: 'FW-9041: DROP ip saddr 185.220.101.42', subtitle: 'Netfilter rule | 14,280 packets dropped', badge: 'ACTIVE', route: 'firewall' },
    { id: 'usr-1', type: 'user', title: 'Elena Vance (Lead Security Architect)', subtitle: 'elena.vance@cyberguard.internal', badge: 'ADMIN', route: 'settings' },
    { id: 'usr-2', type: 'user', title: 'deepak.mohanty@okcl.org', subtitle: 'Finance & Operations | Impossible Travel Alert', badge: '87 RISK', route: 'identity' },
    { id: 'multi-sms', type: 'threat', title: 'SMS / Smishing: OKCL Scholarship KYC Phish', subtitle: 'Spoofed Header: OKCL-GOV | 96% Impersonation', badge: 'SMISHING', route: 'multimodal' },
    { id: 'multi-email', type: 'threat', title: 'Email / BEC: State e-Governance Audit Phish', subtitle: 'director.compliance@odisha-gov-portal.org', badge: 'EMAIL BEC', route: 'multimodal' },
    { id: 'multi-qr', type: 'threat', title: 'Images & QR: Campus Examination Quishing', subtitle: 'Decoded: okcl-scholarship.portal-claim.online', badge: 'QUISHING', route: 'multimodal' },
    { id: 'multi-voice', type: 'threat', title: 'Audio Deepfake: Dr. Mohanty CEO Cloned Call', subtitle: 'HiFi-GAN Vocoder 8.1kHz Cutoff Detected', badge: 'VOICE DEEPFAKE', route: 'multimodal' },
    { id: 'multi-video', type: 'threat', title: 'Video Deepfake: Keynote Speech Facial Seam', subtitle: 'Jawline seam anomaly & blink rate failure', badge: 'VIDEO DEEPFAKE', route: 'multimodal' },
    { id: 'graph-attack', type: 'threat', title: 'Cyber Attack Knowledge Graph & GNN Explorer', subtitle: 'Multi-hop correlation: Storm-0501 -> SMS -> Domain -> IP -> FW', badge: 'GNN GRAPH', route: 'graph-intelligence' }
  ];

  const filtered = sampleData.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-inverse-surface/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-surface-container flex items-center gap-3">
          <Search className="w-5 h-5 text-outline" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search IP, incident (INC-1042), user, firewall rule..."
            className="w-full bg-transparent border-none text-on-surface placeholder:text-outline text-sm focus:outline-none"
          />
          <button onClick={onClose} className="p-1 text-outline hover:text-on-surface rounded-lg hover:bg-surface-container">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[380px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-outline text-sm">
              No matching security entities found for "{query}"
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.route);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-surface-container text-primary">
                      {item.type === 'incident' && <AlertTriangle className="w-4 h-4" />}
                      {item.type === 'threat' && <Shield className="w-4 h-4" />}
                      {item.type === 'firewall' && <Hash className="w-4 h-4" />}
                      {item.type === 'user' && <User className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-on-surface">{item.title}</div>
                      <div className="text-xs text-on-surface-variant font-mono">{item.subtitle}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-surface-container text-outline">
                    {item.badge}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 bg-surface-container-low border-t border-surface-container flex items-center justify-between text-[11px] text-outline">
          <span>Navigate with <strong>↑</strong> <strong>↓</strong> and <strong>Enter</strong></span>
          <span>Press <strong>ESC</strong> to close</span>
        </div>
      </div>
    </div>
  );
};
