import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Settings, Save, Shield, Users, CheckCircle2, Sliders, Bell } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [settings, setSettings] = useState<any>({
    auto_mitigation_enabled: true,
    risk_threshold_auto_block: 85,
    rule_default_ttl_minutes: 60,
    suricata_ids_mode: 'INLINE_PREVENTION',
    qwen_ai_analyst_enabled: true,
    notification_webhook: 'https://hooks.cyberguard.internal/alerts'
  });
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const s = await api.getSettings();
        setSettings(s);
        if (hasRole(['admin'])) {
          const u = await api.getUsers();
          setUsersList(u);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Settings & Policy Configuration</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Configure autonomous enforcement boundaries, risk thresholds, and operator RBAC.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings successfully synced with backend API</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Policy Configuration (7 Cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-6 border border-surface-container shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-surface-container pb-3">
            <Sliders className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-on-surface">Deterministic Policy Thresholds</h2>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Auto mitigation toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low border border-surface-container">
              <div>
                <div className="text-xs font-semibold text-on-surface">Autonomous Mitigation</div>
                <div className="text-[11px] text-outline">Automatically synthesize and deploy netfilter rules when risk threshold is tripped.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.auto_mitigation_enabled}
                onChange={(e) => setSettings({ ...settings, auto_mitigation_enabled: e.target.checked })}
                className="w-4 h-4 text-primary rounded cursor-pointer"
              />
            </div>

            {/* Risk score slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-on-surface">Auto-Block Risk Score Threshold</span>
                <span className="font-mono font-bold text-primary">{settings.risk_threshold_auto_block} / 100</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={settings.risk_threshold_auto_block}
                onChange={(e) => setSettings({ ...settings, risk_threshold_auto_block: parseInt(e.target.value, 10) })}
                className="w-full cursor-pointer accent-primary"
              />
              <p className="text-[11px] text-outline">Threats scoring at or above this value trigger an autonomous DROP action.</p>
            </div>

            {/* Default rule TTL */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface">Default Ephemeral Rule TTL (Minutes)</label>
              <select
                value={settings.rule_default_ttl_minutes}
                onChange={(e) => setSettings({ ...settings, rule_default_ttl_minutes: parseInt(e.target.value, 10) })}
                className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container text-xs font-mono focus:border-primary focus:outline-none"
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">60 Minutes (1 Hour - Recommended)</option>
                <option value="240">240 Minutes (4 Hours)</option>
                <option value="1440">1440 Minutes (24 Hours)</option>
              </select>
            </div>

            {/* Suricata IDS Mode */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface">Suricata Network Engine Mode</label>
              <select
                value={settings.suricata_ids_mode}
                onChange={(e) => setSettings({ ...settings, suricata_ids_mode: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container text-xs font-mono focus:border-primary focus:outline-none"
              >
                <option value="INLINE_PREVENTION">INLINE_PREVENTION (Active Netfilter Bypass)</option>
                <option value="PASSIVE_TAP">PASSIVE_TAP (SPAN Port Mirroring Only)</option>
              </select>
            </div>

            {/* Webhook */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface">SIEM / SOC Webhook Integration</label>
              <input
                type="text"
                value={settings.notification_webhook || ''}
                onChange={(e) => setSettings({ ...settings, notification_webhook: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container text-xs font-mono focus:border-primary focus:outline-none"
              />
            </div>

            {/* Groq AI & LangChain Configuration */}
            <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200/80 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                  <span className="text-xs font-bold text-on-surface">Groq AI & LangChain Integration</span>
                </div>
                <span className="text-[10px] font-mono text-purple-700 font-bold bg-purple-100 px-2 py-0.5 rounded-full">
                  HIGH-SPEED LLM ACCELERATION
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface">Groq API Key (Optional)</label>
                <input
                  type="password"
                  value={settings.groq_api_key || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSettings({ ...settings, groq_api_key: val });
                    if (val.trim()) {
                      localStorage.setItem('cyberguard_groq_api_key', val.trim());
                    } else {
                      localStorage.removeItem('cyberguard_groq_api_key');
                    }
                  }}
                  placeholder="gsk_... (Leave blank to use local Qwen 2.5 engine)"
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container text-xs font-mono focus:border-primary focus:outline-none"
                />
                <p className="text-[11px] text-outline">
                  Paste your Groq API key to power the AI Analyst with ultra-fast LangChain reasoning. If blank, CyberGuard automatically uses our built-in Qwen 2.5 telemetry reasoning engine.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface">Groq Inference Model</label>
                <select
                  value={settings.groq_model || 'llama-3.3-70b-versatile'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSettings({ ...settings, groq_model: val });
                    localStorage.setItem('cyberguard_groq_model', val);
                  }}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container text-xs font-mono focus:border-primary focus:outline-none"
                >
                  <option value="llama-3.3-70b-versatile">LLaMA 3.3 70B Versatile (Recommended)</option>
                  <option value="qwen/qwen-2.5-coder-32b">Qwen 2.5 Coder 32B (Qwen Aligned)</option>
                  <option value="llama-3.1-8b-instant">LLaMA 3.1 8B Instant (Ultra-low latency)</option>
                  <option value="deepseek-r1-distill-llama-70b">DeepSeek R1 Distill 70B</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </button>
            </div>
          </form>
        </div>

        {/* Operator RBAC Directory (5 Cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-6 border border-surface-container shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-container pb-3">
            <Users className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-on-surface">SOC Operators & RBAC Roles</h2>
          </div>

          <p className="text-xs text-on-surface-variant">
            Backend RBAC guarantees strict tenant and role isolation. Viewers cannot perform mutations.
          </p>

          <div className="space-y-3 pt-2">
            {usersList.length > 0 ? (
              usersList.map((u) => (
                <div key={u.id} className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface">{u.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-800' : u.role === 'analyst' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                  <div className="text-xs text-outline font-mono">{u.email}</div>
                  <div className="text-[11px] text-on-surface-variant">{u.title}</div>
                </div>
              ))
            ) : (
              <div className="text-xs text-outline font-mono">
                Current Operator: <strong>{user?.name}</strong> ({user?.role})
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
