import React from 'react';
import { Building, Check, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TenantSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TenantSwitcherModal: React.FC<TenantSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { user, setTenant } = useAuth();

  if (!isOpen) return null;

  const tenants = [
    {
      id: 'tenant-okcl-soc-01',
      name: 'CyberGuard SOC - Primary (Odisha)',
      region: 'Asia-South1 (Bhubaneswar Datacenter)',
      tier: 'Enterprise Critical Tier-1',
      nodes: 128
    },
    {
      id: 'tenant-okcl-edu-02',
      name: 'OKCL State Education Grid',
      region: 'Asia-South1 (Odisha Knowledge Grid)',
      tier: 'State Public Infrastructure',
      nodes: 84
    },
    {
      id: 'tenant-okcl-gov-03',
      name: 'Odisha eGovernance Cloud',
      region: 'Asia-South1 (Secured Gov Cluster)',
      tier: 'Government Tier-4 High Security',
      nodes: 210
    }
  ];

  const currentTenantId = user?.active_tenant || 'tenant-okcl-soc-01';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container overflow-hidden">
        <div className="p-5 border-b border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-on-surface">Switch Security Workspace</h3>
              <p className="text-xs text-on-surface-variant">Select an authorized multi-tenant SOC context</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {tenants.map((t) => {
            const isSelected = t.id === currentTenantId;
            return (
              <div
                key={t.id}
                onClick={() => {
                  setTenant(t.id);
                  onClose();
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-surface-container hover:bg-surface-container-low hover:border-outline-variant'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-on-surface">{t.name}</span>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary text-white font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-on-surface-variant flex items-center gap-3">
                    <span>{t.region}</span>
                    <span>•</span>
                    <span className="font-mono text-outline">{t.nodes} Monitored Nodes</span>
                  </div>
                  <div className="text-[11px] text-primary/80 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t.tier}</span>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-surface-container-low border-t border-surface-container text-xs text-outline flex items-center justify-between">
          <span>Tenant isolation enforced deterministically by API backend</span>
          <span className="font-mono text-[10px]">AUTH: RBAC SECURED</span>
        </div>
      </div>
    </div>
  );
};
