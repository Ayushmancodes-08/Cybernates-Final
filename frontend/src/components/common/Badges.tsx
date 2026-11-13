import React from 'react';

export const SeverityBadge: React.FC<{ severity: string; className?: string }> = ({ severity, className = '' }) => {
  const sev = (severity || 'LOW').toUpperCase();
  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (sev === 'CRITICAL') {
    styles = 'bg-red-50 text-red-700 border-red-200 font-semibold ring-1 ring-red-300/40';
  } else if (sev === 'HIGH') {
    styles = 'bg-orange-50 text-orange-700 border-orange-200 font-semibold';
  } else if (sev === 'MEDIUM') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (sev === 'LOW' || sev === 'INFO') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider border ${styles} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${sev === 'CRITICAL' ? 'bg-red-500 animate-pulse' : sev === 'HIGH' ? 'bg-orange-500' : sev === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
      {sev}
    </span>
  );
};

export const RiskScoreBadge: React.FC<{ score: number; className?: string }> = ({ score, className = '' }) => {
  let color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (score >= 85) {
    color = 'text-red-700 bg-red-50 border-red-200';
  } else if (score >= 70) {
    color = 'text-orange-700 bg-orange-50 border-orange-200';
  } else if (score >= 40) {
    color = 'text-amber-700 bg-amber-50 border-amber-200';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-xs font-semibold border ${color} ${className}`}>
      <span>Risk</span>
      <span className="font-bold">{score}</span>
      <span className="text-[10px] opacity-75">/100</span>
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className = '' }) => {
  const st = (status || 'UNKNOWN').toUpperCase();
  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (st === 'CONTAINED' || st === 'VERIFIED' || st === 'APPLIED_VERIFIED' || st === 'RESOLVED' || st === 'ALLOWED') {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold';
  } else if (st === 'BLOCKED') {
    styles = 'bg-red-50 text-red-800 border-red-200 font-semibold';
  } else if (st === 'ACTIVE' || st === 'INVESTIGATING' || st === 'IN_PROGRESS') {
    styles = 'bg-blue-50 text-blue-800 border-blue-200 font-semibold';
  } else if (st === 'TRIAGING' || st === 'TRIAGE' || st === 'PENDING' || st === 'AWAITING_REVIEW') {
    styles = 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider border ${styles} ${className}`}>
      {st.replace(/_/g, ' ')}
    </span>
  );
};
