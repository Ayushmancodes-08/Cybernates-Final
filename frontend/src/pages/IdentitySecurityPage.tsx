import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { IdentityUser, IdentityAnomaly } from '../types';
import { RiskScoreBadge, SeverityBadge } from '../components/common/Badges';
import { UserCheck, ShieldAlert, Key, Globe, Ban, CheckCircle2 } from 'lucide-react';

export const IdentitySecurityPage: React.FC = () => {
  const [users, setUsers] = useState<IdentityUser[]>([]);
  const [anomalies, setAnomalies] = useState<IdentityAnomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingEmail, setRevokingEmail] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchIdentity = async () => {
    try {
      const [u, a] = await Promise.all([api.getIdentityUsers(), api.getIdentityAnomalies()]);
      setUsers(u);
      setAnomalies(a);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdentity();
  }, []);

  const handleRevoke = async (email: string) => {
    setRevokingEmail(email);
    try {
      await api.revokeSession(email);
      setSuccessMsg(`Session tokens invalidated in Redis session store for ${email}`);
      await fetchIdentity();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(`Revocation failed: ${err.message}`);
    } finally {
      setRevokingEmail(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Identity Security & Behavior Analytics</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Credential anomaly tracking, impossible travel velocity detection, and session token authority.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-lg border border-surface-container text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Identity Engine: Active Monitoring</span>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Active Identity Anomalies */}
      <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-600" />
          <h2 className="text-sm font-bold text-on-surface">Critical Identity Anomalies Detected</h2>
        </div>

        <div className="space-y-3">
          {anomalies.map((anom) => (
            <div
              key={anom.id}
              className="p-4 rounded-xl border border-red-200/80 bg-red-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-red-800">{anom.anomaly_type}</span>
                  <SeverityBadge severity={anom.severity} />
                  <RiskScoreBadge score={anom.risk_score} />
                </div>
                <div className="text-xs font-semibold text-on-surface">Target User: {anom.user_email}</div>
                <p className="text-xs text-on-surface-variant">{anom.details}</p>
              </div>

              <div className="shrink-0">
                <span className="px-2.5 py-1 rounded bg-red-100 text-red-800 text-[11px] font-mono font-bold">
                  {anom.action_taken}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Profiles Directory */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container shadow-xs overflow-hidden">
        <div className="p-4 border-b border-surface-container">
          <h3 className="text-sm font-semibold text-on-surface">Monitored Institutional Identities</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low border-b border-surface-container text-outline font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3.5">User Identity</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Risk Score</th>
                <th className="p-3.5">MFA Status</th>
                <th className="p-3.5">Active Sessions</th>
                <th className="p-3.5">Last Observed Location</th>
                <th className="p-3.5 text-right">Emergency Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container font-mono">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-on-surface">{u.username}</div>
                    <div className="text-[11px] text-outline">{u.email}</div>
                  </td>
                  <td className="p-3.5 text-on-surface-variant">{u.department}</td>
                  <td className="p-3.5">
                    <RiskScoreBadge score={u.risk_score} />
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      MFA ENFORCED
                    </span>
                  </td>
                  <td className="p-3.5 text-on-surface font-bold">{u.active_sessions}</td>
                  <td className="p-3.5 text-on-surface-variant text-[11px]">{u.last_location}</td>
                  <td className="p-3.5 text-right">
                    {u.active_sessions > 0 ? (
                      <button
                        onClick={() => handleRevoke(u.email)}
                        disabled={revokingEmail === u.email}
                        className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold transition-colors inline-flex items-center gap-1 shadow-xs"
                      >
                        <Ban className="w-3 h-3" />
                        <span>{revokingEmail === u.email ? 'Revoking...' : 'Revoke Session'}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-outline">Revoked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
