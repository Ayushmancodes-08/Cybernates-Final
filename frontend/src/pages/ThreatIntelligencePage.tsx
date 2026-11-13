import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ThreatIntelIndicator } from '../types';
import { 
  Globe, 
  RefreshCw, 
  Search, 
  Shield, 
  ExternalLink, 
  CheckCircle2, 
  Radio, 
  Database, 
  Cpu, 
  Sparkles, 
  Zap, 
  Layers,
  ArrowRight,
  Download
} from 'lucide-react';

export const ThreatIntelligencePage: React.FC = () => {
  const [indicators, setIndicators] = useState<ThreatIntelIndicator[]>([]);
  const [feeds, setFeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Selected Feed for Deep Inspection
  const [selectedFeed, setSelectedFeed] = useState<any | null>(null);

  useEffect(() => {
    const fetchIntel = async () => {
      try {
        const [ind, fd] = await Promise.all([api.getThreatIndicators(), api.getThreatFeeds()]);
        setIndicators(ind);
        setFeeds(fd);
        // Default select AlienVault for instant visibility if clicked
        if (fd && fd.length > 0) {
          setSelectedFeed(fd[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchIntel();
  }, []);

  const filtered = indicators.filter(
    (i) =>
      i.indicator.toLowerCase().includes(search.toLowerCase()) ||
      i.threat_actor.toLowerCase().includes(search.toLowerCase()) ||
      i.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150 relative pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Threat Intelligence</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Global IOC feeds, curated actor profiles, and automated STIX 2.1 taxonomy matching.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-lg border border-surface-container text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Feeds Synced Across 4 Gateways</span>
        </div>
      </div>

      {/* Feeds Status Cards (Interactive Click to Inspect & Sync) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {feeds.map((f, i) => {
          const isSelected = selectedFeed?.name === f.name;
          const isHighlight = f.name.includes('AlienVault') || f.name.includes('CISA');
          return (
            <div
              key={i}
              onClick={() => setSelectedFeed(f)}
              className={`p-4 rounded-xl cursor-pointer transition-all border shadow-xs space-y-2 relative ${
                isSelected
                  ? 'bg-amber-50/50 border-[#E05A1B] ring-2 ring-[#E05A1B]/20'
                  : 'bg-surface-container-lowest border-surface-container hover:border-[#E05A1B]/40 hover:bg-surface-container-low'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface truncate pr-2">{f.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  {f.status}
                </span>
              </div>
              <div className="text-lg font-mono font-bold text-primary">
                {f.indicators_count.toLocaleString()} <span className="text-xs font-normal text-outline">IOCs</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-outline pt-1 border-t border-surface-container/60">
                <span>Updated {f.last_updated}</span>
                {isHighlight && (
                  <span className="text-[10px] font-bold text-[#E05A1B] flex items-center gap-0.5">
                    Click to Inspect <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Feed Live Attack Stream Dossier (AlienVault & CISA) */}
      {selectedFeed && (
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-[#E05A1B]/30 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-container">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#E05A1B]/10 text-[#E05A1B]">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-on-surface font-mono">{selectedFeed.name}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-900">
                    Live Telemetry Ingress
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                  High-confidence active IOCs extracted directly from global sensor network pulses.
                </p>
              </div>
            </div>
          </div>

          {/* Recent Attacks Stream in this Feed */}
          <div>
            <div className="text-[11px] font-mono font-bold uppercase text-[#71767C] mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Recent Attack Telemetry Stream in Feed</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {(selectedFeed.recent_attacks || [
                {"indicator": "185.220.101.42", "type": "IPv4", "threat": "Active Tor Exit Scanner", "confidence": 98, "actor": "Tor Recon Outpost"},
                {"indicator": "45.154.255.89", "type": "IPv4", "threat": "JNDI Log4j Exploit Cluster", "confidence": 96, "actor": "Mirai / Gafgyt Subnet"},
                {"indicator": "okcl-student-portal.support-login.top", "type": "Domain", "threat": "Homoglyph Credential Harvester", "confidence": 97, "actor": "State Education Impersonator"},
                {"indicator": "91.240.118.17", "type": "IPv4", "threat": "Spear Phishing Ingress MTA", "confidence": 95, "actor": "APT28 Mimic"}
              ]).map((att: any, attIdx: number) => (
                <div key={attIdx} className="p-3 bg-surface-container-low rounded-xl border border-surface-container space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                      {att.type}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700">{att.confidence}% Conf.</span>
                  </div>
                  <div className="font-bold text-primary truncate text-[11px]" title={att.indicator}>
                    {att.indicator}
                  </div>
                  <div className="text-[10px] text-on-surface truncate" title={att.threat}>
                    {att.threat}
                  </div>
                  <div className="text-[9px] text-[#71767C] truncate">
                    Actor: {att.actor}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Indicators List */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container shadow-xs overflow-hidden">
        <div className="p-4 border-b border-surface-container flex flex-col sm:flex-row items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-on-surface">Active Correlated Indicators</h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search IOC, actor, or tag..."
              className="w-full h-8 pl-9 pr-3 text-xs font-mono rounded-lg bg-surface-container-low border border-transparent focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low border-b border-surface-container text-outline font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Indicator Value</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Attributed Threat Actor</th>
                <th className="p-3.5">Confidence</th>
                <th className="p-3.5">TLP Marking</th>
                <th className="p-3.5">Tags</th>
                <th className="p-3.5 text-right">Last Observed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container font-mono">
              {filtered.map((item, idx) => (
                <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                  <td className="p-3.5 font-bold text-primary">{item.indicator}</td>
                  <td className="p-3.5 text-on-surface-variant font-bold">{item.type}</td>
                  <td className="p-3.5 text-on-surface">{item.threat_actor}</td>
                  <td className="p-3.5">
                    <span className="font-bold text-emerald-700">{item.confidence}%</span>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.tlp === 'RED' ? 'bg-red-100 text-red-800' : item.tlp === 'AMBER' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      TLP:{item.tlp}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex gap-1">
                      {item.tags.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded bg-surface-container text-[9px] text-outline">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3.5 text-right text-outline">{item.last_seen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
