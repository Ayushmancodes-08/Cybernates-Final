import React, { useState } from 'react';
import { ShieldLogo } from '../components/common/ShieldLogo';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, Building, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('elena.vance@cyberguard.internal');
  const [password, setPassword] = useState('CyberGuard@2026!Admin');
  const [tenantId, setTenantId] = useState('tenant-okcl-soc-01');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password, tenantId);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (_role: 'admin' = 'admin') => {
    setError(null);
    setEmail('elena.vance@cyberguard.internal');
    setPassword('CyberGuard@2026!Admin');
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f8f9ff] text-on-surface font-sans relative overflow-hidden">
      {/* Subtle enterprise background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbdbf5_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-200/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-sky-200/25 blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full flex flex-col lg:flex-row items-stretch justify-center relative z-10">
        {/* Left Column: Brand & Security Mission (OKCL context) */}
        <div className="hidden lg:flex flex-1 max-w-xl xl:max-w-2xl flex-col justify-between p-10 xl:p-14 bg-white/80 backdrop-blur-md border-r border-[#e5eeff] shadow-[4px_0_24px_rgba(0,40,120,0.02)]">
          <div>
            <div className="flex items-center gap-3">
              <ShieldLogo size={42} />
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[#0b1c30]">CyberGuard</h1>
                <p className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">Adaptive Security Operations</p>
              </div>
            </div>

            <div className="mt-12 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#eff4ff] border border-[#cbdbf5] text-primary text-xs font-mono font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>ODISHA KNOWLEDGE CORPORATION LIMITED (OKCL)</span>
              </div>
              
              <h2 className="text-3xl xl:text-4xl font-bold text-[#0b1c30] tracking-tight leading-tight">
                AI-Powered Adaptive Firewall & Enterprise Threat Defense
              </h2>
              
              <p className="text-sm text-on-surface-variant leading-relaxed">
                CyberGuard seamlessly connects security telemetry, explainable risk scoring, deterministic policy enforcement, and autonomous netlink kernel verification in one unified SOC platform.
              </p>

              {/* Loop features */}
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <div className="p-3.5 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] hover:bg-[#eff4ff]/60 hover:border-[#cbdbf5] transition-all">
                  <div className="text-xs font-mono text-primary uppercase font-bold">01. Detect & Score</div>
                  <div className="text-xs text-on-surface-variant mt-1 leading-snug">Deterministic risk engine with explainable weights.</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] hover:bg-[#eff4ff]/60 hover:border-[#cbdbf5] transition-all">
                  <div className="text-xs font-mono text-primary uppercase font-bold">02. Adapt & Enforce</div>
                  <div className="text-xs text-on-surface-variant mt-1 leading-snug">nftables kernel rules synthesized automatically.</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] hover:bg-[#eff4ff]/60 hover:border-[#cbdbf5] transition-all">
                  <div className="text-xs font-mono text-primary uppercase font-bold">03. Verify & Audit</div>
                  <div className="text-xs text-on-surface-variant mt-1 leading-snug">Netlink verification with immutable audit logs.</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] hover:bg-[#eff4ff]/60 hover:border-[#cbdbf5] transition-all">
                  <div className="text-xs font-mono text-primary uppercase font-bold">04. Qwen AI Co-Pilot</div>
                  <div className="text-xs text-on-surface-variant mt-1 leading-snug">Contextual triage without bypassing policy engine.</div>
                </div>
              </div>

              {/* Live Status Indicators Banner */}
              <div className="p-3.5 rounded-xl bg-[#eff4ff] border border-[#cbdbf5] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium text-[#0b1c30]">SOC Fleet Posture:</span>
                  <span className="font-mono font-bold text-primary">92/100 Nominal</span>
                </div>
                <span className="font-mono text-[11px] text-[#555e74]">eBPF & nftables Active</span>
              </div>
            </div>
          </div>

            <div className="pt-8 border-t border-[#e5eeff] text-xs font-mono text-outline flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-on-surface-variant">ENGINE STATUS: OPERATIONAL</span>
            </div>
            <span>BUILD: v4.19.0-OKCL</span>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#e5eeff] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 space-y-6">
            <div className="text-center lg:text-left space-y-2">
              <div className="inline-flex lg:hidden items-center gap-2 mb-2">
                <ShieldLogo size={36} />
                <span className="text-lg font-bold text-[#0b1c30]">CyberGuard</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-[#0b1c30]">Sign In to SOC Console</h2>
              <p className="text-xs text-on-surface-variant">
                Authenticate with authorized credentials to access CyberGuard operations.
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Admin Demo Fill */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono text-outline uppercase tracking-wider font-semibold">
                  Administrator Access (Full SOC Clearance)
                </label>
                <button
                  type="button"
                  onClick={() => setDemoCredentials('admin')}
                  className="text-[11px] font-mono text-primary hover:text-blue-700 font-semibold hover:underline"
                >
                  Quick-Fill Admin
                </button>
              </div>
              <div
                onClick={() => setDemoCredentials('admin')}
                className="p-3.5 rounded-xl border border-[#cbdbf5] bg-[#f8f9ff] hover:bg-[#eff4ff] hover:border-primary/50 cursor-pointer transition-all flex items-center justify-between group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    EV
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#0b1c30] group-hover:text-primary transition-colors">
                      Elena Vance (Lead Security Architect)
                    </div>
                    <div className="text-[11px] font-mono text-on-surface-variant">
                      elena.vance@cyberguard.internal • Role: Admin
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#eff4ff] text-primary font-bold border border-[#cbdbf5]">
                  ADMIN ONLY
                </span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#0b1c30]">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@cyberguard.internal"
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[#f8f9ff] hover:bg-white focus:bg-white border border-[#c3c6d7] focus:border-primary text-xs text-[#0b1c30] placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#0b1c30]">Security Key / Password</label>
                  <span className="text-[11px] text-primary hover:underline cursor-pointer">Argon2id Hash</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#f8f9ff] hover:bg-white focus:bg-white border border-[#c3c6d7] focus:border-primary text-xs text-[#0b1c30] placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-[#0b1c30]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Workspace Tenant */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#0b1c30]">Authorized Workspace Context</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    className="w-full h-11 pl-10 pr-8 rounded-xl bg-[#f8f9ff] hover:bg-white focus:bg-white border border-[#c3c6d7] focus:border-primary text-xs text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all appearance-none cursor-pointer shadow-xs"
                  >
                    <option value="tenant-okcl-soc-01">CyberGuard SOC - Primary (Odisha Datacenter)</option>
                    <option value="tenant-okcl-edu-02">OKCL State Education Grid</option>
                    <option value="tenant-okcl-gov-03">Odisha eGovernance Cloud</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-2 rounded-xl bg-primary hover:bg-[#003ea8] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Authenticate & Launch Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Trust and Compliance Badges */}
            <div className="pt-4 border-t border-[#e5eeff] flex items-center justify-around text-[10px] font-mono text-outline">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>ARGON2ID</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>JWT ROTATION</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>RBAC BOUND</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

