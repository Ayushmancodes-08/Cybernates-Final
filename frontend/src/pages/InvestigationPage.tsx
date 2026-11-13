import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { IncidentItem } from '../types';
import { SeverityBadge, StatusBadge, RiskScoreBadge } from '../components/common/Badges';
import {
  ArrowLeft,
  Shield,
  Clock,
  CheckCircle2,
  FileText,
  Send,
  Sparkles,
  AlertTriangle,
  Lock,
  ExternalLink
} from 'lucide-react';

interface InvestigationPageProps {
  incidentId?: string;
  onBack: () => void;
  onAskAI: (query: string) => void;
}

export const InvestigationPage: React.FC<InvestigationPageProps> = ({
  incidentId = 'inc-1042',
  onBack,
  onAskAI
}) => {
  const [incident, setIncident] = useState<IncidentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [noteInput, setNoteInput] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchDetail = async () => {
    try {
      const data = await api.getIncident(incidentId);
      setIncident(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [incidentId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    try {
      await api.updateIncident(incidentId, { notes: noteInput.trim() });
      setNoteInput('');
      await fetchDetail();
    } catch (err: any) {
      alert(`Failed to add note: ${err.message}`);
    }
  };

  const handleExecuteAction = (actionTitle: string) => {
    setActionNotice(`Containment executed: ${actionTitle}. Netlink receipt logged in Response Center.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  if (loading || !incident) {
    return (
      <div className="p-12 text-center text-outline text-xs font-mono">
        Loading Incident Investigation Canvas...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container border border-surface-container text-on-surface transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary">{incident.incident_number}</span>
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
            </div>
            <h1 className="text-xl font-bold text-on-surface tracking-tight mt-0.5">{incident.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAskAI(`Explain why IP ${incident.source_ips[0]} was blocked in ${incident.incident_number}`)}
            className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs transition-colors flex items-center gap-1.5 border border-primary/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Consult AI Analyst</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">{actionNotice}</span>
        </div>
      )}

      {/* Grid: Left column (Incident Metadata & Timeline) / Right Column (Evidence & Responses) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns */}
        <div className="lg:col-span-7 space-y-6">
          {/* Qwen 2.5 Explainable AI Reason Modeling Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-amber-50 border border-purple-200 shadow-xs space-y-3 font-sans">
            <div className="flex items-center justify-between font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
                <span className="font-black text-purple-900 uppercase tracking-wide flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-purple-700" />
                  Qwen 2.5 Explainable AI Reason Modeling (Why It Is Blocked)
                </span>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-200 text-purple-900 font-bold">
                Qwen 2.5 3B Cyber-Instruct (Ollama Local)
              </span>
            </div>

            <div className="text-xs text-purple-950 font-medium whitespace-pre-line leading-relaxed font-mono bg-white/70 p-4 rounded-xl border border-purple-100 shadow-2xs">
              {incident.summary || "Analyzing telemetry with Qwen 2.5..."}
            </div>
          </div>

          {/* Incident Metadata Overview */}
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-3">
            <h2 className="text-xs font-mono uppercase text-outline font-semibold">Incident Metadata & Target Assets</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container">
                <div className="text-[10px] font-mono text-outline uppercase">Lead Analyst</div>
                <div className="text-xs font-semibold text-on-surface mt-0.5">{incident.assigned_to}</div>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container">
                <div className="text-[10px] font-mono text-outline uppercase">SLA Countdown</div>
                <div className="text-xs font-semibold text-emerald-700 font-mono mt-0.5">{incident.sla_remaining}</div>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container">
                <div className="text-[10px] font-mono text-outline uppercase">Risk Score</div>
                <div className="mt-0.5"><RiskScoreBadge score={incident.risk_score} /></div>
              </div>
            </div>
          </div>

          {/* Chronological Correlated Timeline */}
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-4">
            <h2 className="text-xs font-mono uppercase text-outline font-semibold">Correlated Telemetry Timeline</h2>
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container">
              {incident.timeline?.map((item, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-surface-container-lowest" />
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-outline">{item.time}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-surface-container rounded font-semibold text-on-surface-variant">
                      {item.severity}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface mt-1 leading-relaxed">{item.event}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Analyst Notes Thread */}
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-4">
            <h2 className="text-xs font-mono uppercase text-outline font-semibold">Analyst Notes & Audit Log</h2>
            <div className="space-y-2">
              {incident.analyst_notes?.map((note, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-surface-container-low text-xs text-on-surface font-mono">
                  {note}
                </div>
              ))}
            </div>

            <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
              <input
                type="text"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Append an investigation note..."
                className="flex-1 h-9 px-3 text-xs bg-surface-container-low rounded-lg border border-surface-container focus:border-primary focus:outline-none text-on-surface"
              />
              <button
                type="submit"
                className="px-3.5 h-9 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Note</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right 5 Columns */}
        <div className="lg:col-span-5 space-y-6">
          {/* Applied Automated Responses */}
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-3">
            <h2 className="text-xs font-mono uppercase text-outline font-semibold">Verified Response Receipts</h2>
            <div className="space-y-2.5">
              {incident.applied_responses?.map((resp, i) => (
                <div key={i} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-900">{resp.action}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                      {resp.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 font-mono">Target: {resp.target}</div>
                  <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-1">
                    <span>By: {resp.by}</span>
                    <span>{resp.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Cards */}
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-3">
            <h2 className="text-xs font-mono uppercase text-outline font-semibold">Deterministic Evidence Artifacts</h2>
            <div className="space-y-2">
              {incident.evidence_items?.map((ev, i) => (
                <div key={i} className="p-3 rounded-lg bg-surface-container-low border border-surface-container space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-on-surface">{ev.title}</span>
                    <span className="text-[10px] font-mono text-outline">{ev.timestamp}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant font-mono">{ev.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Containment Actions */}
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-3">
            <h2 className="text-xs font-mono uppercase text-outline font-semibold">Recommended Playbook Actions</h2>
            <div className="space-y-2">
              {incident.suggested_actions?.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl border border-surface-container hover:border-primary/40 bg-surface-container-lowest space-y-1.5 transition-all"
                >
                  <div className="text-xs font-semibold text-on-surface">{act.title}</div>
                  <p className="text-[11px] text-outline">{act.impact}</p>
                  <button
                    onClick={() => handleExecuteAction(act.title)}
                    className="mt-1 px-3 py-1 rounded bg-primary hover:bg-primary/90 text-white font-mono text-[11px] font-semibold transition-colors"
                  >
                    Authorize Action
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
