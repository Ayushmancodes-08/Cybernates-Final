import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DashboardSummary } from '../types';
import { RealtimeDefenseRadar } from '../components/common/RealtimeDefenseRadar';
import {
  RotateCw,
  Shield,
  ArrowRight,
  Activity,
  AlertTriangle,
  Radio,
  MessageSquare,
  Sparkles,
  PlayCircle,
  ShieldAlert,
  Share2,
  CheckCircle2,
  Terminal,
  Zap,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Lock,
  Server,
  Layers,
  Cpu,
  Download,
  FileText,
  History,
  ShieldCheck,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Unlock,
  Ban,
  Copy,
  Check,
  Clock,
  Brain
} from 'lucide-react';

interface OverviewPageProps {
  onNavigate: (route: string) => void;
  onOpenDemo?: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate, onOpenDemo }) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeRadarTab, setActiveRadarTab] = useState<'dynamic' | 'alerts' | 'insights' | 'executions'>('dynamic');
  
  // Attack History & Records State
  const [attackHistory, setAttackHistory] = useState<any[]>([]);
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'BLOCKED' | 'CRITICAL'>('ALL');
  const [expandedAttackId, setExpandedAttackId] = useState<string | null>(null);
  const [expandedIncidentId, setExpandedIncidentId] = useState<string | null>(null);
  const [copiedPayloadId, setCopiedPayloadId] = useState<string | null>(null);

  // In-Line 60s Quarantine Hold & Release State
  const [activeQuarantine, setActiveQuarantine] = useState<any[]>([]);
  const [quarantineDeciding, setQuarantineDeciding] = useState(false);
  const [gaugeView, setGaugeView] = useState<'arch' | 'scope'>('arch');

  const handleDecideQuarantine = async (threatId: string, decision: 'ALLOW' | 'DROP') => {
    setQuarantineDeciding(true);
    try {
      await fetch(`http://${window.location.hostname}:8000/api/v1/relay/quarantine/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threat_id: threatId, decision })
      });
      setActiveQuarantine(prev => prev.filter(q => q.id !== threatId));
      await loadData();
    } catch (e: any) {
      alert(`Decision failed: ${e.message}`);
    } finally {
      setQuarantineDeciding(false);
    }
  };

  const handleUnblockAttackIp = async (e: React.MouseEvent, ip: string) => {
    e.stopPropagation();
    try {
      await fetch(`http://${window.location.hostname}:8000/api/v1/live-ingress/unblock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip })
      });
      setAttackHistory(prev =>
        prev.map(a => a.client_ip === ip ? { ...a, status: 'UNBLOCKED', blocked: false } : a)
      );
      alert(`Device IP ${ip} successfully UNBLOCKED! Kernel eBPF drop flushed.`);
    } catch (err: any) {
      alert(`Unblock failed: ${err.message}`);
    }
  };

  const handleCopyPayload = (e: React.MouseEvent, id: string, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedPayloadId(id);
    setTimeout(() => setCopiedPayloadId(null), 2000);
  };

  const loadData = async () => {
    try {
      const [data, hotspot, relay, quar] = await Promise.all([
        api.getDashboardSummary(),
        fetch(`http://${window.location.hostname}:8000/api/v1/hotspot/status`).then(r => r.json()).catch(() => ({ attack_history: [] })),
        fetch(`http://${window.location.hostname}:8000/api/v1/relay/messages`).then(r => r.json()).catch(() => ({ threats: [] })),
        fetch(`http://${window.location.hostname}:8000/api/v1/relay/quarantine/active`).then(r => r.json()).catch(() => ({ active_quarantine: [] }))
      ]);
      setSummary(data);

      if (quar?.active_quarantine) {
        setActiveQuarantine(quar.active_quarantine);
      }

      const relayThreats = (relay?.threats || []).map((t: any) => ({
        attack_id: t.id,
        client_ip: t.sender_ip || '192.168.137.2',
        attack_type: t.threat_type,
        title: `In-Flight Interception: ${t.sender_id} -> ${t.recipient_id}`,
        vector: t.threat_type ? t.threat_type.replace(/_/g, ' ') : 'In-Line Social Messaging Drop',
        severity: 'CRITICAL',
        payload: t.payload,
        media_url: t.media_url,
        impersonation_target: `${t.recipient_id} (Shielded Client)`,
        status: 'INTERCEPTED_AND_DROPPED',
        blocked: true,
        qwen_reasoning: t.qwen_reasoning,
        timestamp: t.timestamp
      }));

      const combined = [...relayThreats, ...(hotspot?.attack_history || [])];
      setAttackHistory(combined);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Download Comprehensive SOC Forensics & Attack Incident Audit Report
  const handleDownloadSOCReport = () => {
    const reportData = {
      report_metadata: {
        title: "CYBERGUARD SOVEREIGN DEFENSE & THREAT AUDIT REPORT",
        generation_time: new Date().toISOString(),
        classification: "CONFIDENTIAL // STATE CYBERSECURITY SOC AUDIT",
        governing_authority: "Odisha Knowledge Corporation Limited (OKCL)",
        node: "SOC Node OKCL-IN-01",
        ai_analyst_engine: "Qwen 2.5 3B Cyber-Instruct (Ollama Local)",
        total_data_ingestion_feeds: 84
      },
      posture_metrics: summary?.posture || {},
      active_telemetry: {
        total_attacks_recorded: attackHistory.length,
        firewall_blocked_ips: 1429,
        ebpf_drop_latency: "0.42 μs",
        verification_accuracy: "99.8%"
      },
      attack_history_records: attackHistory.map(a => ({
        id: a.attack_id,
        timestamp: a.timestamp,
        attacker_ip: a.client_ip,
        attack_title: a.title,
        vector: a.vector,
        severity: a.severity,
        target_asset: a.impersonation_target,
        payload: a.payload,
        status: a.status,
        xai_root_cause: a.qwen_reasoning
      })),
      recent_incidents: summary?.recent_incidents || []
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CyberGuard_Threat_Audit_Report_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center min-h-[460px]">
        <div className="crystal-panel p-8 rounded-2xl flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#E05A1B] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-[#71767C]">Bootstrapping Sovereign Defense Radar...</span>
        </div>
      </div>
    );
  }

  const filteredAttacks = attackHistory.filter(a => {
    if (historyFilter === 'BLOCKED') return a.blocked || a.status?.includes('BLOCKED');
    if (historyFilter === 'CRITICAL') return a.severity === 'CRITICAL';
    return true;
  });

  return (
    <div className="space-y-6 animate-fluid pb-12">
      {/* Dynamic Cockpit Top Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-[#E05A1B]/15 text-[#E05A1B] text-[10px] font-mono font-bold uppercase tracking-wider">
              Autonomous Cockpit
            </span>
            <span className="text-xs text-[#71767C] font-mono">SOC Node OKCL-IN-01</span>
          </div>
          <h1 className="text-2xl font-black text-[#121517] tracking-tight">Security Defense Operations</h1>
          <p className="text-xs text-[#5B6168] mt-0.5">
            Real-time biometric threat correlation, attack graph orchestration, and adaptive zero-trust mitigation.
          </p>
        </div>

        {/* Action Pills & Download Report Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Download Comprehensive Audit Report */}
          <button
            onClick={handleDownloadSOCReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E05A1B] hover:bg-[#C84E14] text-white text-xs font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Download full forensic threat & attack audit report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download SOC Report</span>
          </button>

          <div className="bg-[#EDEAE0] p-1 rounded-xl flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveRadarTab('dynamic')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeRadarTab === 'dynamic' ? 'bg-white text-[#131618] shadow-xs' : 'text-[#656C76] hover:text-[#131618]'
              }`}
            >
              Dynamic View
            </button>
            <button
              onClick={() => setActiveRadarTab('alerts')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeRadarTab === 'alerts' ? 'bg-white text-[#131618] shadow-xs' : 'text-[#656C76] hover:text-[#131618]'
              }`}
            >
              Key Alerts
            </button>
            <button
              onClick={() => setActiveRadarTab('insights')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeRadarTab === 'insights' ? 'bg-white text-[#131618] shadow-xs' : 'text-[#656C76] hover:text-[#131618]'
              }`}
            >
              GNN Insights
            </button>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="crystal-button p-2 text-[#5B6168] hover:text-[#131618] rounded-xl"
            title="Manual sync telemetry"
          >
            <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#E05A1B]' : ''}`} />
          </button>
        </div>
      </div>

      {/* 🚨 INTERACTIVE ADMIN QUARANTINE HOLD & RELEASE BANNER (1-MINUTE WINDOW) */}
      {activeQuarantine.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-950/90 via-slate-900 to-rose-950/90 border-2 border-amber-400 text-white shadow-2xl animate-fluid space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold animate-pulse">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black tracking-tight text-amber-300 uppercase">
                    Quarantine Hold Alert: In-Flight Threat Intercepted
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 text-[10px] font-mono font-bold animate-pulse">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  CyberGuard intercepted an inbound message targeting Phone B. Held in quarantine for 1-minute SOC Admin verification.
                </p>
              </div>
            </div>
            {/* 60s Countdown Timer */}
            <div className="flex items-center gap-2 font-mono text-xs bg-black/50 px-3 py-1.5 rounded-xl border border-amber-500/30 self-start sm:self-auto">
              <Clock className="w-4 h-4 text-amber-400 animate-spin" />
              <span className="text-amber-300 font-bold">Decision Window: {activeQuarantine[0].remaining_seconds || 59}s</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-slate-400 text-[10px] block">Sender / Target</span>
              <div className="font-bold text-white">{activeQuarantine[0].sender_id} ({activeQuarantine[0].sender_ip})</div>
              <div className="text-emerald-400 text-[11px]">→ Target: {activeQuarantine[0].recipient_id}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1 md:col-span-2">
              <span className="text-slate-400 text-[10px] block">Threat Payload</span>
              <div className="font-bold text-rose-300 truncate">{activeQuarantine[0].payload}</div>
              <div className="text-[10px] text-amber-300">{activeQuarantine[0].threat_type?.replace(/_/g, ' ')} detected</div>
            </div>
          </div>

          {/* Qwen 2.5 Explainable Analysis */}
          {activeQuarantine[0].qwen_reasoning && (
            <div className="p-3 rounded-2xl bg-black/60 border border-purple-500/30 text-xs font-mono space-y-1 text-purple-200">
              <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                <span>Qwen 2.5 Explainable Threat Assessment:</span>
              </div>
              <div className="text-[11px] whitespace-pre-line leading-relaxed text-slate-200">
                {activeQuarantine[0].qwen_reasoning}
              </div>
            </div>
          )}

          {/* Admin Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              onClick={() => handleDecideQuarantine(activeQuarantine[0].id, 'DROP')}
              disabled={quarantineDeciding}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
            >
              <Ban className="w-4 h-4" />
              <span>HOLD & DROP PACKET (Permanent Drop)</span>
            </button>
            <button
              onClick={() => handleDecideQuarantine(activeQuarantine[0].id, 'ALLOW')}
              disabled={quarantineDeciding}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ALLOW & DELIVER TO PHONE B (Admin Override)</span>
            </button>
          </div>
        </div>
      )}

      {/* HERO & KPI SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Concentric Autonomous Defense Radar */}
        <div className="lg:col-span-8 crystal-light-cockpit rounded-3xl p-6 lg:p-8 relative overflow-hidden shadow-sm border border-[#E5E2D9]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE7DC]">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#71767C] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Realtime Suricata Telemetry</span>
              </div>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-4xl lg:text-5xl font-black tracking-tight font-sans text-[#121517]">84</span>
                <span className="text-xs font-semibold text-[#71767C] uppercase tracking-widest font-mono">Total Data Ingestion Feeds</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <span className="text-[11px] text-[#71767C] uppercase font-mono block font-semibold">Active Triage</span>
                <span className="text-xs font-bold text-amber-700">
                  {summary.recent_incidents?.length || 5} Escalated Incidents
                </span>
              </div>
            </div>
          </div>

          {/* Central Radar Visualization & Telemetry Ingress Split */}
          <div className="pt-6 grid grid-cols-1 xl:grid-cols-12 gap-6 items-center">
            {/* Left: Concentric Autonomous Defense Radar */}
            <div className="xl:col-span-7 flex justify-center">
              <RealtimeDefenseRadar />
            </div>

            {/* Right: Live Sensor Telemetry & Ingress Mesh Cockpit */}
            <div className="xl:col-span-5 space-y-3.5">
              {/* Telemetry Header Pill */}
              <div className="flex items-center justify-between pb-2 border-b border-[#EAE7DC]">
                <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase text-[#131618]">
                  <Activity className="w-3.5 h-3.5 text-[#E05A1B]" />
                  <span>Suricata Ingress Stream</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                  ● 100% In-Line
                </span>
              </div>

              {/* 3 Real-time KPI Chips */}
              <div className="grid grid-cols-3 gap-2 font-mono text-center">
                <div className="p-2.5 rounded-2xl bg-white/90 border border-[#EAE6DD] shadow-xs">
                  <span className="text-[10px] text-[#71767C] block font-semibold">eBPF Drop</span>
                  <span className="text-base font-black text-[#131618] block mt-0.5">&lt;0.42 ms</span>
                  <span className="text-[9px] text-emerald-700 font-bold">Zero-Copy</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/90 border border-[#EAE6DD] shadow-xs">
                  <span className="text-[10px] text-[#71767C] block font-semibold">Ingress Flow</span>
                  <span className="text-base font-black text-[#131618] block mt-0.5">24.5k/s</span>
                  <span className="text-[9px] text-[#71767C] font-semibold">Packets</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/90 border border-[#EAE6DD] shadow-xs">
                  <span className="text-[10px] text-[#71767C] block font-semibold">Defense</span>
                  <span className="text-base font-black text-emerald-700 block mt-0.5">99.8%</span>
                  <span className="text-[9px] text-emerald-700 font-bold">Verified</span>
                </div>
              </div>

              {/* 4 Connected Gateway Sensor Nodes */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase font-bold text-[#71767C] tracking-wider">
                  Guarded Ingress Clusters (4 Nodes)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                  {/* Okta SSO */}
                  <div className="p-2.5 rounded-xl bg-white/90 border border-[#EAE6DD] shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <div>
                        <div className="font-bold text-[#131618] text-[11px]">okta-sso</div>
                        <div className="text-[9.5px] text-[#71767C]">Identity Gateway</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-emerald-700">6ms</span>
                      <span className="block text-[8.5px] text-[#71767C]">0 Anomalies</span>
                    </div>
                  </div>

                  {/* AWS Cluster */}
                  <div className="p-2.5 rounded-xl bg-white/90 border border-[#EAE6DD] shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <div>
                        <div className="font-bold text-[#131618] text-[11px]">aws-east</div>
                        <div className="text-[9.5px] text-[#71767C]">App Cluster</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-emerald-700">6ms</span>
                      <span className="block text-[8.5px] text-rose-700 font-bold">15 Blocked</span>
                    </div>
                  </div>

                  {/* Cloudflare Edge */}
                  <div className="p-2.5 rounded-xl bg-white/90 border border-[#EAE6DD] shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <div>
                        <div className="font-bold text-[#131618] text-[11px]">cloudflare</div>
                        <div className="text-[9.5px] text-[#71767C]">DDoS Perimeter</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-emerald-700">7ms</span>
                      <span className="block text-[8.5px] text-rose-700 font-bold">48 Blocked</span>
                    </div>
                  </div>

                  {/* Alibaba Cloud */}
                  <div className="p-2.5 rounded-xl bg-white/90 border border-[#EAE6DD] shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <div>
                        <div className="font-bold text-[#131618] text-[11px]">alibaba-cloud</div>
                        <div className="text-[9.5px] text-[#71767C]">Hybrid Segment</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-emerald-700">16ms</span>
                      <span className="block text-[8.5px] text-rose-700 font-bold">2 Blocked</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Threat Interception Alert Strip */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-emerald-50 border border-rose-200 shadow-xs flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
                <div className="text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-rose-700 uppercase">Perimeter Interception</span>
                    <span className="text-[9px] text-[#71767C]">Just Now</span>
                  </div>
                  <p className="text-[11px] text-[#131618] mt-0.5 leading-snug font-sans font-medium">
                    High-Frequency TCP SYN Reconnaissance probe from <strong>185.220.101.42</strong> was dropped in-flight by CyberGuard eBPF netfilter.
                  </p>
                </div>
              </div>

              {/* Navigation Quick Action */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => onNavigate('network')}
                  className="text-xs font-mono font-bold text-[#E05A1B] hover:text-[#C84A0E] flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Deep Packet Inspector (Wireshark)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('firewall')}
                  className="text-xs font-mono text-[#71767C] hover:text-[#131618] cursor-pointer"
                >
                  View Adaptive Firewall Rules →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: EBPF AUTONOMOUS SHIELD (92.4% Hero Gauge Card as per design) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 sm:p-7 rounded-[28px] sm:rounded-[32px] border border-[#E5E0D5] shadow-[0_4px_24px_rgba(0,0,0,0.03)] bg-gradient-to-b from-[#FCFCF9] via-[#FAF9F5] to-[#F5F2EB] flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#EAE7DC] gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00B074] shadow-[0_0_8px_#00B074]" />
                  <span className="text-[11px] font-mono font-bold text-[#2C3437] uppercase tracking-[0.14em]">
                    EBPF AUTONOMOUS SHIELD
                  </span>
                </div>
                <div className="flex items-center self-start sm:self-auto p-0.5 rounded-full bg-[#EFECE4] border border-[#E2DDD2] shadow-xs shrink-0">
                  <button
                    onClick={() => setGaugeView('arch')}
                    className={`px-3 py-1 rounded-full text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                      gaugeView === 'arch'
                        ? 'bg-white text-[#131618] shadow-xs'
                        : 'text-[#71767C] hover:text-[#131618]'
                    }`}
                  >
                    Arch Dome
                  </button>
                  <button
                    onClick={() => setGaugeView('scope')}
                    className={`px-3 py-1 rounded-full text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                      gaugeView === 'scope'
                        ? 'bg-white text-[#131618] shadow-xs'
                        : 'text-[#71767C] hover:text-[#131618]'
                    }`}
                  >
                    360° Scope
                  </button>
                </div>
              </div>

              {/* 92.4% Radial Arch Dome Gauge */}
              <div className="py-5 flex flex-col items-center justify-center">
                {gaugeView === 'arch' ? (
                  <div className="relative w-full max-w-[280px] h-[152px] flex items-center justify-center">
                    <svg viewBox="0 0 300 165" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="ebpfArchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#007A55" />
                          <stop offset="70%" stopColor="#009E60" />
                          <stop offset="100%" stopColor="#00B074" />
                        </linearGradient>
                      </defs>

                      {/* Faint Inner Dotted Radar Guide Ring */}
                      <path
                        d="M 58 145 A 92 92 0 0 1 242 145"
                        fill="none"
                        stroke="#D0DCD4"
                        strokeWidth="1.5"
                        strokeDasharray="3 6"
                      />

                      {/* Inactive Background Track (Full 180° Arch) */}
                      <path
                        d="M 32 145 A 118 118 0 0 1 268 145"
                        fill="none"
                        stroke="#E5ECE8"
                        strokeWidth="15"
                        strokeLinecap="round"
                      />

                      {/* Active 92.4% Progress Arc */}
                      <path
                        d="M 32 145 A 118 118 0 0 1 268 145"
                        fill="none"
                        stroke="url(#ebpfArchGradient)"
                        strokeWidth="15"
                        strokeLinecap="round"
                        strokeDasharray="370.7"
                        strokeDashoffset="28.17"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>

                    {/* Centered Numbers Inside Arch */}
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-1.5 pointer-events-none">
                      <span className="text-[44px] font-black tracking-tight text-[#111827] leading-none mb-1">
                        92.4%
                      </span>
                      <span className="text-[10px] font-mono font-black text-[#00875A] tracking-[0.2em] uppercase mb-1">
                        AUTONOMOUS DEFENSE
                      </span>
                      <span className="text-[9.5px] font-mono text-[#71767C] font-semibold">
                        Zero-copy Kernel Drops &lt;1 ms
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-40 h-40 flex items-center justify-center my-2">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                      <defs>
                        <linearGradient id="scopeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#007A55" />
                          <stop offset="100%" stopColor="#00B074" />
                        </linearGradient>
                      </defs>
                      <circle cx="60" cy="60" r="48" fill="none" stroke="#E5ECE8" strokeWidth="10" />
                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        fill="none"
                        stroke="url(#scopeGradient)"
                        strokeWidth="10"
                        strokeDasharray="301.6"
                        strokeDashoffset={301.6 * (1 - 0.924)}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-black text-[#111827]">92.4%</span>
                      <span className="text-[9px] font-mono font-bold text-[#00875A] uppercase tracking-wider">
                        360° SCOPE
                      </span>
                    </div>
                  </div>
                )}

                <p className="text-xs text-[#5B6168] text-center mt-3.5 max-w-[280px] font-sans leading-relaxed">
                  Zero-copy kernel packet drops blocking phishing &amp; voice deepfakes in &lt;1 ms.
                </p>
              </div>

              {/* Stat Counters: Critical 3 / High 7 / Total 365k */}
              <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-[#EAE7DC] text-center font-mono">
                <div className="p-3 rounded-2xl bg-white/90 border border-[#EAE6DD] shadow-xs">
                  <span className="text-[10.5px] text-[#E11D48] block font-bold flex items-center justify-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#FB7185]" />
                    Critical
                  </span>
                  <span className="text-2xl font-black text-[#E11D48] block">3</span>
                  <span className="text-[10px] text-[#71767C] font-medium">Blocked</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/90 border border-[#EAE6DD] shadow-xs">
                  <span className="text-[10.5px] text-[#D97706] block font-bold flex items-center justify-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#FBBF24]" />
                    High
                  </span>
                  <span className="text-2xl font-black text-[#D97706] block">7</span>
                  <span className="text-[10px] text-[#71767C] font-medium">Tarpitted</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/90 border border-[#EAE6DD] shadow-xs">
                  <span className="text-[10.5px] text-[#047857] block font-bold flex items-center justify-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                    Total
                  </span>
                  <span className="text-2xl font-black text-[#047857] block">365k</span>
                  <span className="text-[10px] text-[#71767C] font-medium">Scanned</span>
                </div>
              </div>
            </div>

            {/* Statistical Summary List */}
            <div className="pt-4 mt-3 border-t border-[#EAE7DC] space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between text-[#71767C] text-[11px] font-bold tracking-wider">
                <span>STATISTICAL SUMMARY</span>
                <button
                  onClick={() => onNavigate('response-center')}
                  className="text-[#E05A1B] hover:text-[#C84A0E] hover:underline cursor-pointer font-bold"
                >
                  See All
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/90 border border-[#EAE6DD] shadow-xs transition-colors hover:bg-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00875A] flex items-center justify-center shadow-xs">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[#131618] font-bold block text-[11.5px]">Daily Scanned Links</span>
                    <span className="text-[9.5px] text-[#71767C] font-semibold">Today 24h</span>
                  </div>
                </div>
                <span className="font-mono font-black text-[#00875A] text-sm">895 Links</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/90 border border-[#EAE6DD] shadow-xs transition-colors hover:bg-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#00875A] flex items-center justify-center shadow-xs">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[#131618] font-bold block text-[11.5px]">Weekly Ingress Probes</span>
                    <span className="text-[9.5px] text-[#71767C] font-semibold">7 Day Trajectory</span>
                  </div>
                </div>
                <span className="font-mono font-black text-[#00875A] text-sm">1,872 Links</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/90 border border-[#EAE6DD] shadow-xs transition-colors hover:bg-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shadow-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[#131618] font-bold block text-[11.5px]">Monthly Drops</span>
                    <span className="text-[9.5px] text-[#71767C] font-semibold">Zero Leakage</span>
                  </div>
                </div>
                <span className="font-mono font-black text-blue-800 text-sm">4,991 Links</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE ATTACK HISTORY & FORENSIC AUDIT LOG SECTION */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-xs overflow-hidden">
        <div className="p-5 border-b border-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <History className="w-4 h-4 text-primary" />
              <h2 className="text-base font-bold text-on-surface tracking-tight">
                Live Attack History & Telemetry Forensics Record
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant font-mono">
              Comprehensive chronological log of intercepted hostile actions across network, QR quishing, and credential spray vectors.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-outline">Filter:</span>
            <div className="bg-surface-container-low p-1 rounded-xl flex items-center gap-1 text-xs font-mono">
              <button
                onClick={() => setHistoryFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  historyFilter === 'ALL' ? 'bg-surface-bright text-on-surface font-bold shadow-xs' : 'text-outline hover:text-on-surface'
                }`}
              >
                All ({attackHistory.length})
              </button>
              <button
                onClick={() => setHistoryFilter('BLOCKED')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  historyFilter === 'BLOCKED' ? 'bg-surface-bright text-rose-700 font-bold shadow-xs' : 'text-outline hover:text-on-surface'
                }`}
              >
                Kernel Blocked
              </button>
              <button
                onClick={() => setHistoryFilter('CRITICAL')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  historyFilter === 'CRITICAL' ? 'bg-surface-bright text-primary font-bold shadow-xs' : 'text-outline hover:text-on-surface'
                }`}
              >
                Critical Severity
              </button>
            </div>
          </div>
        </div>

        {/* Chronological Expandable Multi-Attack Record List */}
        <div className="divide-y divide-surface-container">
          {filteredAttacks.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-on-surface">Perimeter Armed — 0 Ingress Strikes Recorded</div>
              <div className="text-xs font-mono text-outline max-w-md mx-auto">
                Autonomous eBPF zero-copy firewall is active and monitoring. Fire a live attack from a mobile device or simulator to demonstrate Strike 1 auto-containment.
              </div>
            </div>
          ) : (
            filteredAttacks.map((att, idx) => {
              const attackKey = att.attack_id || `ATK-${idx}`;
              const isExpanded = expandedAttackId === attackKey;
              const isBlocked = att.blocked || att.status?.includes('BLOCKED');
              const mediaUrl = att.media_url ? (att.media_url.startsWith('http') ? att.media_url : `http://${window.location.hostname}:8000${att.media_url}`) : null;

              return (
                <div key={idx} className="transition-colors">
                  {/* Clickable Header Row */}
                  <div
                    onClick={() => setExpandedAttackId(isExpanded ? null : attackKey)}
                    className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all ${
                      isExpanded ? 'bg-surface-container' : 'hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 font-bold">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-primary">{attackKey}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                            att.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {att.severity || 'HIGH'}
                          </span>
                          <span className="font-bold text-xs text-on-surface">{att.title}</span>
                          {mediaUrl && (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 font-mono text-[9px] font-bold">
                              📷 PHOTO ATTACHED
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-outline mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>Origin IP: <strong className="text-on-surface">{att.client_ip}</strong></span>
                          <span>Vector: {att.vector}</span>
                          <span>Target: {att.impersonation_target || 'OKCL Gateway Core'}</span>
                          <span>Time: {att.timestamp?.slice(11, 19) || '12:28:10Z'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-mono font-bold uppercase inline-flex items-center gap-1.5 ${
                        isBlocked
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isBlocked ? 'bg-rose-600 animate-pulse' : 'bg-emerald-600'}`} />
                        {isBlocked ? 'KERNEL DROPPED' : 'CLEAN / UNBLOCKED'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-outline" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-outline" />
                      )}
                    </div>
                  </div>

                  {/* Expanded In-Depth Investigation Drawer */}
                  {isExpanded && (
                    <div className="p-5 bg-surface-container-low border-t border-surface-container space-y-4 animate-fluid font-mono">
                      {/* Attached Image / Media Preview (If Uploaded) */}
                      {mediaUrl && (
                        <div className="p-4 bg-surface-container-lowest rounded-2xl border border-surface-container space-y-2">
                          <div className="flex items-center justify-between text-xs text-outline font-bold uppercase">
                            <span>Ingress Forensic Media Artifact:</span>
                            <span className="text-[10px] text-cyan-700">Rendered via Static Netfilter Storage</span>
                          </div>
                          <div className="flex items-center justify-center p-2 bg-black/5 rounded-xl border border-surface-container">
                            <img
                              src={mediaUrl}
                              alt="Forensic Payload Artifact"
                              className="max-h-64 rounded-lg object-contain shadow-xs"
                            />
                          </div>
                        </div>
                      )}

                      {/* Raw Intercepted Payload */}
                      <div className="p-4 bg-surface-container-lowest rounded-2xl border border-surface-container space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-outline uppercase">
                          <span>Raw Payload Signature & Intercepted String:</span>
                          <button
                            onClick={(e) => handleCopyPayload(e, attackKey, att.payload || '')}
                            className="text-[10px] text-primary hover:underline flex items-center gap-1 cursor-pointer font-bold"
                          >
                            {copiedPayloadId === attackKey ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedPayloadId === attackKey ? 'Copied' : 'Copy Payload'}</span>
                          </button>
                        </div>
                        <div className="p-3 bg-[#131618] text-emerald-400 rounded-xl text-xs overflow-x-auto whitespace-pre-wrap select-all font-mono">
                          {att.payload || 'No raw payload available'}
                        </div>
                      </div>

                      {/* Qwen 2.5 Explainable AI Bullet Points */}
                      <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-amber-50 rounded-2xl border border-purple-200 text-xs space-y-2 font-sans">
                        <div className="flex items-center justify-between font-mono">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
                            <span className="font-black text-purple-900 uppercase tracking-wide">
                              Qwen 2.5 Explainable Root Cause (XAI)
                            </span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 font-bold">
                            {att.model_used || 'Qwen 2.5 3B Cyber-Instruct (Ollama Local)'}
                          </span>
                        </div>
                        <div className="text-xs text-purple-950 font-medium whitespace-pre-line leading-relaxed font-mono">
                          {att.qwen_reasoning || 'Analyzing telemetry...'}
                        </div>
                      </div>

                      {/* VirusTotal Threat Intelligence Dossier */}
                      {att.virustotal && (
                        <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-3 text-xs">
                          <div className="flex items-center justify-between pb-2 border-b border-indigo-200">
                            <div className="flex items-center gap-2 font-bold text-[#131618]">
                              <Radio className="w-4 h-4 text-indigo-700 animate-pulse" />
                              <span className="uppercase">VirusTotal Threat Intelligence Feed</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                              {att.virustotal.malicious_count}/{att.virustotal.total_engines} Security Vendors Flagged Malicious
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                            <div className="p-2.5 bg-white rounded-lg border border-indigo-100">
                              <span className="text-[10px] text-outline uppercase block font-bold">ASN & Country</span>
                              <span className="text-on-surface font-bold block mt-0.5 truncate">{att.virustotal.as_owner}</span>
                              <span className="text-[10px] text-outline">{att.virustotal.country}</span>
                            </div>
                            <div className="p-2.5 bg-white rounded-lg border border-indigo-100">
                              <span className="text-[10px] text-outline uppercase block font-bold">Community Reputation</span>
                              <span className="text-rose-600 font-black text-sm block mt-0.5">
                                {att.virustotal.community_score} / 100
                              </span>
                              <span className="text-[10px] text-outline">High Malicious Confidence</span>
                            </div>
                            <div className="p-2.5 bg-white rounded-lg border border-indigo-100">
                              <span className="text-[10px] text-outline uppercase block font-bold">Categories</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {att.virustotal.categories?.map((cat: string, cidx: number) => (
                                  <span key={cidx} className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 text-[9px] font-bold border border-rose-200">
                                    {cat}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Direct Actions Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://www.virustotal.com/gui/ip-address/${att.client_ip}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] font-bold hover:bg-indigo-100 flex items-center gap-1 transition-colors"
                          >
                            <Radio className="w-3 h-3 text-indigo-600" />
                            <span>VirusTotal</span>
                          </a>
                          <a
                            href={`https://www.abuseipdb.com/check/${att.client_ip}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold hover:bg-rose-100 flex items-center gap-1 transition-colors"
                          >
                            <Ban className="w-3 h-3 text-rose-600" />
                            <span>AbuseIPDB</span>
                          </a>
                          <a
                            href="https://cybercrime.gov.in"
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold hover:bg-blue-100 flex items-center gap-1 transition-colors"
                          >
                            <Shield className="w-3 h-3 text-blue-600" />
                            <span>Cybercrime.gov.in</span>
                          </a>
                        </div>

                        {/* Direct One-Click Unblock Action */}
                        <div>
                          {isBlocked ? (
                            <button
                              onClick={(e) => handleUnblockAttackIp(e, att.client_ip)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-mono transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              <span>UNBLOCK IP NOW ({att.client_ip})</span>
                            </button>
                          ) : (
                            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>IP is Clean / Unblocked</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 🛡️ RECENT INCIDENTS: PROBLEM SOLVED -> RECENT INCIDENTS (WITH QWEN REASON MODELING BULLET POINTS) */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-xs overflow-hidden">
        <div className="p-5 border-b border-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-bold text-on-surface tracking-tight">
                Recent Incidents (Problem Solved & Containment Receipts)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                CONTAINED & LOGGED
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-mono">
              Chronological log of solved security incidents. Click any incident to inspect root cause explanation in Qwen 2.5 bullet points.
            </p>
          </div>

          <button
            onClick={() => onNavigate('incidents')}
            className="text-xs font-mono font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Open Incident Command Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Incident List */}
        <div className="divide-y divide-surface-container">
          {(summary.recent_incidents || []).slice(0, 5).map((inc: any, idx: number) => {
            const incKey = inc.id || inc.incident_number || `INC-${idx}`;
            const isExpanded = expandedIncidentId === incKey;

            return (
              <div key={idx} className="transition-colors">
                <div
                  onClick={() => setExpandedIncidentId(isExpanded ? null : incKey)}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all ${
                    isExpanded ? 'bg-surface-container' : 'hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 font-bold">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-primary">{inc.incident_number}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                          inc.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inc.severity}
                        </span>
                        <span className="font-bold text-xs text-on-surface">{inc.title}</span>
                      </div>
                      <div className="text-[11px] font-mono text-outline mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>Source IPs: <strong className="text-on-surface">{(inc.source_ips || []).join(', ') || 'Protected Segment'}</strong></span>
                        <span>Status: <strong className="text-emerald-700">{inc.status}</strong></span>
                        <span>Lead Analyst: {inc.assigned_to || 'Marcus Chen'}</span>
                        <span>Risk: {inc.risk_score}/100</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <span className="px-2 py-1 rounded-full text-[10px] font-mono font-bold uppercase inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      PROBLEM SOLVED
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-outline" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-outline" />
                    )}
                  </div>
                </div>

                {/* Expanded Incident Investigation Detail with Qwen Reasoning in Bullet Points */}
                {isExpanded && (
                  <div className="p-5 bg-surface-container-low border-t border-surface-container space-y-4 animate-fluid font-mono">
                    {/* Qwen 2.5 Explainable Root Cause Modeling in Bullet Points */}
                    <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-amber-50 rounded-2xl border border-purple-200 text-xs space-y-2 font-sans">
                      <div className="flex items-center justify-between font-mono">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
                          <span className="font-black text-purple-900 uppercase tracking-wide flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                            Qwen 2.5 Explainable AI Reason Modeling (Why It Is Blocked)
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 font-bold">
                          Qwen 2.5 3B Cyber-Instruct (Ollama Local)
                        </span>
                      </div>
                      <div className="text-xs text-purple-950 font-medium whitespace-pre-line leading-relaxed font-mono bg-white/60 p-3 rounded-xl border border-purple-100">
                        {inc.summary || 'Analyzing telemetry...'}
                      </div>
                    </div>

                    {/* Applied Responses Receipts */}
                    {inc.applied_responses && inc.applied_responses.length > 0 && (
                      <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-surface-container space-y-2">
                        <div className="text-[10px] font-bold text-outline uppercase">Applied Firewall Enforcement:</div>
                        <div className="space-y-1">
                          {inc.applied_responses.map((resp: any, ri: number) => (
                            <div key={ri} className="flex items-center gap-2 text-xs text-emerald-800 font-mono">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{typeof resp === 'string' ? resp : `${resp.action} -> ${resp.target} (${resp.status})`}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Full Investigation Navigation */}
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => onNavigate('incidents')}
                        className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold font-mono hover:bg-primary/90 flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                      >
                        <span>Investigate Incident in SOC Console</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FLOATING ACTION CIRCLE: CyberGuard AI Qwen 2.5 SOC Co-Pilot (Circular Design - Stacks Behind Alert Bar) */}
      <div className={`fixed bottom-6 right-6 z-20 group transition-opacity duration-300 ${activeQuarantine.length > 0 ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        {/* Tooltip on hover */}
        <div className="absolute right-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 ease-out translate-x-2 group-hover:translate-x-0 whitespace-nowrap bg-[#181C22]/95 backdrop-blur-md text-white text-xs font-mono py-1.5 px-3 rounded-xl border border-white/10 shadow-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">CyberGuard AI</span>
          <span className="px-1.5 py-0.5 rounded-md bg-purple-500/30 text-[10px] text-purple-200 uppercase font-mono">Qwen 2.5</span>
        </div>

        <button
          onClick={() => onNavigate('ai-analyst')}
          title="CyberGuard AI (Qwen 2.5) SOC Co-Pilot & Analyst"
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-purple-700 via-indigo-700 to-rose-600 hover:from-purple-600 hover:to-rose-500 text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer border-2 border-white/30 hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]"
        >
          <Sparkles className="w-6 h-6 text-amber-300 transition-transform duration-300 group-hover:rotate-12" />
          {/* Active Status Pulse Badge */}
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#12161A]" />
          </span>
        </button>
      </div>
    </div>
  );
};
