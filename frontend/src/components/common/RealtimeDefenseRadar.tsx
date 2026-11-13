import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Radio,
  Server,
  Cloud,
  Lock,
  Cpu,
  Globe,
  RefreshCw,
  Zap,
  Info,
  CheckCircle2,
  X
} from 'lucide-react';

interface ThreatBlip {
  id: string;
  x: number; // percentage from center (-100 to 100)
  y: number; // percentage from center (-100 to 100)
  ip: string;
  type: string;
  severity: 'critical' | 'high' | 'medium';
  targetNode: string;
}

interface NodeStatus {
  id: string;
  name: string;
  provider: 'Okta' | 'AWS' | 'Cloudflare' | 'Alibaba' | 'Azure';
  status: 'healthy' | 'investigating' | 'mitigating';
  latency: number;
  activeRequests: number;
  blockedCount: number;
  lastIncident?: string;
  topPos: string;
  leftPos: string;
}

const INITIAL_NODES: NodeStatus[] = [
  {
    id: 'okta-idp',
    name: 'okta-sso',
    provider: 'Okta',
    status: 'healthy',
    latency: 18,
    activeRequests: 1420,
    blockedCount: 42,
    lastIncident: 'MFA Push Replay Attempt (Blocked)',
    topPos: '16%',
    leftPos: '18%'
  },
  {
    id: 'aws-east-cluster',
    name: 'aws-east',
    provider: 'AWS',
    status: 'investigating',
    latency: 34,
    activeRequests: 3840,
    blockedCount: 194,
    lastIncident: 'Egress SYN Flood to Tor Node (In-line TarPit)',
    topPos: '12%',
    leftPos: '74%'
  },
  {
    id: 'cloudflare-waf',
    name: 'cloudflare',
    provider: 'Cloudflare',
    status: 'healthy',
    latency: 9,
    activeRequests: 18450,
    blockedCount: 812,
    lastIncident: 'HTTP/2 Rapid Reset Exploit Dropped',
    topPos: '80%',
    leftPos: '22%'
  },
  {
    id: 'alibaba-gateway',
    name: 'alibaba-cloud',
    provider: 'Alibaba',
    status: 'healthy',
    latency: 52,
    activeRequests: 920,
    blockedCount: 15,
    lastIncident: 'Port Scan Nullified',
    topPos: '82%',
    leftPos: '72%'
  }
];

export const RealtimeDefenseRadar: React.FC = () => {
  const [nodes, setNodes] = useState<NodeStatus[]>(INITIAL_NODES);
  const [autoRate, setAutoRate] = useState<number>(92.4);
  const [endpointsCount, setEndpointsCount] = useState<number>(4718);
  const [radarDegrees, setRadarDegrees] = useState<number>(0);
  const [activeBlips, setActiveBlips] = useState<ThreatBlip[]>([]);
  const [selectedNode, setSelectedNode] = useState<NodeStatus | null>(null);
  const [recentInterception, setRecentInterception] = useState<string>('eBPF dropped Tor Exit Node SYN probe');

  // Real-time radar rotating beam
  useEffect(() => {
    const sweepInterval = setInterval(() => {
      setRadarDegrees((prev) => (prev + 3) % 360);
    }, 30);
    return () => clearInterval(sweepInterval);
  }, []);

  // Poll hotspot / attack hub for live attacks to trigger instant red blips & node alarms!
  useEffect(() => {
    const checkHotspotAttacks = async () => {
      try {
        const res = await fetch(`http://${window.location.hostname}:8000/api/v1/hotspot/status`);
        if (res.ok) {
          const data = await res.json();
          if (data.attack_history && data.attack_history.length > 0) {
            const latest = data.attack_history[0];
            setRecentInterception(`${latest.title} from ${latest.client_ip}`);
            
            // Spawn critical blip aimed at okta or aws
            const newBlip: ThreatBlip = {
              id: latest.attack_id || `blip-${Date.now()}`,
              x: 25,
              y: -40,
              ip: latest.client_ip,
              type: latest.title,
              severity: 'critical',
              targetNode: 'aws-east'
            };
            setActiveBlips((prev) => {
              if (prev.some(b => b.id === newBlip.id)) return prev;
              return [newBlip, ...prev.slice(0, 3)];
            });
          }
        }
      } catch (e) {
        // quiet fallback
      }
    };

    checkHotspotAttacks();
    const interval = setInterval(checkHotspotAttacks, 3000);
    return () => clearInterval(interval);
  }, []);

  // Real-time dynamic threat blips generation & live metric twitching
  useEffect(() => {
    const tickInterval = setInterval(() => {
      // Small real-time jitter in auto-mitigated percentage and endpoints
      setAutoRate((prev) => {
        const delta = (Math.random() - 0.48) * 0.3;
        return parseFloat(Math.min(96.5, Math.max(89.0, prev + delta)).toFixed(1));
      });

      setEndpointsCount((prev) => {
        const delta = Math.floor((Math.random() - 0.4) * 3);
        return prev + delta;
      });

      // Update node latency & request counters
      setNodes((prevNodes) =>
        prevNodes.map((n) => {
          const latencyDelta = Math.floor((Math.random() - 0.5) * 4);
          const reqDelta = Math.floor((Math.random() - 0.4) * 25);
          return {
            ...n,
            latency: Math.max(6, n.latency + latencyDelta),
            activeRequests: Math.max(100, n.activeRequests + reqDelta)
          };
        })
      );

      // Random threat blip spawns on radar
      if (Math.random() > 0.4) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 35 + Math.random() * 45; // between 35% and 80%
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const ip = `185.${Math.floor(100 + Math.random() * 150)}.${Math.floor(10 + Math.random() * 200)}.${Math.floor(2 + Math.random() * 250)}`;
        const targets = ['aws-east', 'okta-sso', 'cloudflare', 'alibaba-cloud'];
        const target = targets[Math.floor(Math.random() * targets.length)];

        const newBlip: ThreatBlip = {
          id: `blip-${Date.now()}-${Math.random()}`,
          x,
          y,
          ip,
          type: Math.random() > 0.5 ? 'Log4j RCE Probe' : 'Distributed Port Sweep',
          severity: Math.random() > 0.7 ? 'critical' : 'high',
          targetNode: target
        };

        setActiveBlips((prev) => [...prev.slice(-4), newBlip]);
        setRecentInterception(`eBPF dropped ${newBlip.type} from ${ip}`);
      }
    }, 1800);

    return () => clearInterval(tickInterval);
  }, []);

  return (
    <div className="relative w-full max-w-[480px] aspect-square flex items-center justify-center select-none">
      {/* 1. Radar Circular Scope Canvas - High End Luxury Crisp Ceramic White */}
      <div className="absolute inset-0 rounded-full border border-[#DCD7C9] bg-gradient-to-b from-[#FFFFFF] via-[#FAF9F5] to-[#F1EFE8] overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.06)]">
        {/* Background Grid Crosshairs */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-px bg-[#E2DED2]" />
          <div className="h-full w-px bg-[#E2DED2] absolute" />
        </div>

        {/* Concentric Defense Perimeter Circles */}
        {/* Outer Ring: Edge / Public Ingress */}
        <div className="absolute inset-3 rounded-full border border-dashed border-[#CEC9BA] animate-[spin_120s_linear_infinite]" />
        
        {/* Middle Ring: Cloud & Workload Orbit */}
        <div className="absolute inset-14 rounded-full border border-emerald-600/25" />
        
        {/* Inner Ring: Kernel & DMZ Defense Layer */}
        <div className="absolute inset-28 rounded-full border border-emerald-600/35" />

        {/* 2. Real-Time Rotating Radar Sweep Beam */}
        <div
          className="absolute inset-0 origin-center pointer-events-none"
          style={{
            transform: `rotate(${radarDegrees}deg)`,
            background: 'conic-gradient(from 0deg at 50% 50%, rgba(16, 185, 129, 0.22) 0deg, rgba(16, 185, 129, 0.05) 35deg, transparent 70deg)'
          }}
        />

        {/* 3. Live Threat Blips on Radar Screen */}
        {activeBlips.map((blip) => (
          <div
            key={blip.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
            style={{
              left: `${50 + blip.x * 0.45}%`,
              top: `${50 + blip.y * 0.45}%`
            }}
          >
            {/* Blip Dot */}
            <span
              className={`w-2.5 h-2.5 rounded-full block animate-ping absolute ${
                blip.severity === 'critical' ? 'bg-rose-500' : 'bg-amber-400'
              }`}
            />
            <span
              className={`w-2.5 h-2.5 rounded-full block relative ${
                blip.severity === 'critical' ? 'bg-rose-600' : 'bg-amber-500'
              }`}
            />

            {/* Hover Tooltip for Blip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-white text-[#131618] p-2 rounded-xl text-[10px] font-mono whitespace-nowrap shadow-xl border border-[#DCD7C9] z-40">
              <div className="font-bold text-rose-700">{blip.type}</div>
              <div className="text-[#5B6168]">IP: {blip.ip}</div>
              <div className="text-emerald-700 font-bold">Status: Kernel Dropped</div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Center Core Autonomous Mitigation Dial */}
      <div className="w-40 h-40 rounded-full bg-gradient-to-b from-white to-[#F5F4EE] border-2 border-[#DCD7C9] flex flex-col items-center justify-center text-center shadow-[0_10px_30px_rgba(16,185,129,0.18)] z-20 transition-all hover:scale-105 cursor-pointer">
        <div className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-emerald-700 font-bold mb-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          <span>AUTONOMOUS CORE</span>
        </div>
        <span className="text-3xl lg:text-4xl font-black text-[#131618] font-sans tracking-tight">
          {autoRate}%
        </span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 font-black mt-0.5">
          AUTO MITIGATED
        </span>
        <span className="text-[9px] font-mono text-[#656C76] mt-0.5">
          {(100 - autoRate).toFixed(1)}% L2 Escalated
        </span>
      </div>

      {/* 5. Top Endpoints Pill (Interactive) */}
      <div className="absolute top-1 z-30 px-3.5 py-1.5 rounded-full bg-[#E05A1B]/15 backdrop-blur-md border border-[#E05A1B]/35 text-[#C84E14] text-xs font-mono font-bold shadow-sm flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-[#E05A1B]" />
        <span>{endpointsCount.toLocaleString()} Endpoints Guarded</span>
      </div>

      {/* 6. Interactive Floating Cloud Connector Badges */}
      {nodes.map((node) => {
        const isWarning = node.status === 'investigating';
        return (
          <div
            key={node.id}
            onClick={() => setSelectedNode(node)}
            style={{ top: node.topPos, left: node.leftPos }}
            className={`absolute z-30 px-3 py-1.5 rounded-xl backdrop-blur-md border cursor-pointer transition-all duration-200 transform hover:scale-110 shadow-md flex items-center gap-2 ${
              isWarning
                ? 'bg-amber-100/90 border-amber-300 text-amber-900 animate-pulse'
                : 'bg-white/95 hover:bg-white border-[#DCD7C9] text-[#131618]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isWarning ? 'bg-amber-600 animate-ping' : 'bg-emerald-600'
              }`}
            />
            <span className="text-[11px] font-mono font-bold">{node.name}</span>
            <span className="text-[9px] font-mono text-[#71767C] hidden sm:inline font-semibold">
              {node.latency}ms
            </span>
          </div>
        );
      })}

      {/* 7. Bottom Live Interception Ticker */}
      <div className="absolute -bottom-4 z-30 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#DCD7C9] text-[10px] font-mono text-[#444B53] flex items-center gap-2 shadow-md max-w-[340px] truncate">
        <Zap className="w-3 h-3 text-[#E05A1B] shrink-0 animate-bounce" />
        <span className="text-emerald-700 font-bold shrink-0">INTERCEPTED:</span>
        <span className="truncate font-semibold">{recentInterception}</span>
      </div>

      {/* 8. Interactive Node Detail Drawer (When any cloud badge is clicked) */}
      {selectedNode && (
        <div className="absolute inset-4 z-40 bg-white/98 backdrop-blur-xl border border-[#DCD7C9] rounded-3xl p-5 text-[#131618] flex flex-col justify-between shadow-2xl animate-fluid">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE7DC]">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-[#E05A1B]" />
              <span className="font-mono text-xs font-bold uppercase text-[#131618]">{selectedNode.provider} Cloud Gateway</span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 text-[#71767C] hover:text-[#131618] rounded-lg hover:bg-[#F1EFE8]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs my-2">
            <div className="flex justify-between py-1 border-b border-[#F1EFE8]">
              <span className="text-[#71767C]">Node Cluster:</span>
              <span className="font-bold text-[#131618]">{selectedNode.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F1EFE8]">
              <span className="text-[#71767C]">eBPF Roundtrip Latency:</span>
              <span className="font-bold text-emerald-700">{selectedNode.latency} ms</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F1EFE8]">
              <span className="text-[#71767C]">Active Egress Flows:</span>
              <span className="font-bold text-[#131618]">{selectedNode.activeRequests.toLocaleString()} req/s</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F1EFE8]">
              <span className="text-[#71767C]">Autonomous Blocks:</span>
              <span className="font-bold text-rose-700">{selectedNode.blockedCount} threats nullified</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F8F7F2] border border-[#EAE7DC]">
              <div className="text-[10px] uppercase text-[#71767C] font-bold">Latest Mitigation Log</div>
              <div className="text-amber-800 font-semibold text-[11px] mt-0.5">{selectedNode.lastIncident}</div>
            </div>
          </div>

          <button
            onClick={() => setSelectedNode(null)}
            className="w-full py-2 bg-[#121517] text-white rounded-xl text-xs font-bold hover:bg-[#2C3138] transition-colors"
          >
            Close Telemetry Inspector
          </button>
        </div>
      )}
    </div>
  );
};

