import React, { useState } from 'react';
import { Network, ZoomIn, ZoomOut, RotateCcw, Shield, AlertTriangle, Globe, User, Layers, ArrowRight, Sparkles, Filter } from 'lucide-react';

export interface GraphNode {
  id: string;
  label: string;
  type: 'threat_actor' | 'payload_sms' | 'domain' | 'ip_origin' | 'identity_user' | 'firewall_rule' | 'mitre_technique';
  riskScore: number;
  details: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
  severity: 'critical' | 'high' | 'medium' | 'info';
}

interface AttackGraphExplorerProps {
  onSelectNode?: (node: GraphNode) => void;
}

export const AttackGraphExplorer: React.FC<AttackGraphExplorerProps> = ({ onSelectNode }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [highlightPath, setHighlightPath] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1);

  // Nodes representing the correlated OKCL attack scenario
  const initialNodes: GraphNode[] = [
    { id: 'n-actor', label: 'Threat Actor: Storm-0501', type: 'threat_actor', riskScore: 98, details: 'Nation-state affiliated ransomware syndicate targeting educational & state infra', x: 120, y: 180 },
    { id: 'n-dlt', label: 'DLT Spoof: OKCL-GOV', type: 'payload_sms', riskScore: 94, details: 'Unauthorized telecom header injected via international SMS gateway', x: 300, y: 110 },
    { id: 'n-sms', label: 'SMS: Scholarship KYC Scam', type: 'payload_sms', riskScore: 96, details: 'Urgent notice requesting Rs 25,000 KYC update within 2 hours', x: 480, y: 110 },
    { id: 'n-qr', label: 'Quishing: Campus Fee Notice', type: 'payload_sms', riskScore: 92, details: 'Concealed QR code on counterfeit university examination letterhead', x: 480, y: 250 },
    { id: 'n-domain', label: 'okcl-scholarship.portal-claim.online', type: 'domain', riskScore: 95, details: 'Typosquat credential harvesting domain (Age: 3 days, Let\'s Encrypt SSL)', x: 680, y: 180 },
    { id: 'n-ip', label: 'IP: 103.212.45.19 (Frankfurt AS24940)', type: 'ip_origin', riskScore: 91, details: 'Hosting server for reverse proxy phishing kit & command-and-control beacon', x: 860, y: 180 },
    { id: 'n-user', label: 'Victim: deepak.mohanty@okcl.org', type: 'identity_user', riskScore: 87, details: 'Finance & Operations executive targeted via impossible travel authentication', x: 680, y: 320 },
    { id: 'n-fw', label: 'Adaptive FW: FW-RULE-DROP-9041', type: 'firewall_rule', riskScore: 0, details: 'Deterministic nftables kernel drop rule active (14,280 packets dropped, 0 bypass)', x: 860, y: 320 },
    { id: 'n-mitre', label: 'MITRE T1566: Phishing / Smishing', type: 'mitre_technique', riskScore: 90, details: 'Adversary uses spearphishing attachment & link with urgency psychology', x: 300, y: 250 }
  ];

  const edges: GraphEdge[] = [
    { source: 'n-actor', target: 'n-dlt', label: 'ACQUIRED_SPOOF', severity: 'critical' },
    { source: 'n-actor', target: 'n-mitre', label: 'EXECUTES_TTP', severity: 'high' },
    { source: 'n-dlt', target: 'n-sms', label: 'TRANSMITS_PAYLOAD', severity: 'critical' },
    { source: 'n-actor', target: 'n-qr', label: 'DISTRIBUTES_POSTER', severity: 'high' },
    { source: 'n-sms', target: 'n-domain', label: 'EMBEDDED_LINK', severity: 'critical' },
    { source: 'n-qr', target: 'n-domain', label: 'DECODES_TO', severity: 'critical' },
    { source: 'n-domain', target: 'n-ip', label: 'RESOLVES_DNS_A', severity: 'critical' },
    { source: 'n-sms', target: 'n-user', label: 'TARGETS_EXECUTIVE', severity: 'high' },
    { source: 'n-user', target: 'n-ip', label: 'IMPOSSIBLE_TRAVEL_SESSION', severity: 'critical' },
    { source: 'n-fw', target: 'n-ip', label: 'ENFORCES_NFTABLES_DROP', severity: 'info' }
  ];

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    if (onSelectNode) onSelectNode(node);
  };

  const getNodeColor = (type: GraphNode['type']) => {
    switch (type) {
      case 'threat_actor':
        return { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', icon: AlertTriangle };
      case 'payload_sms':
        return { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', icon: Layers };
      case 'domain':
        return { bg: '#fce7f3', border: '#ec4899', text: '#9d174d', icon: Globe };
      case 'ip_origin':
        return { bg: '#ffedd5', border: '#f97316', text: '#9a3412', icon: Network };
      case 'identity_user':
        return { bg: '#e0e7ff', border: '#6366f1', text: '#3730a3', icon: User };
      case 'firewall_rule':
        return { bg: '#dcfce7', border: '#22c55e', text: '#166534', icon: Shield };
      case 'mitre_technique':
        return { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8', icon: Sparkles };
      default:
        return { bg: '#f1f5f9', border: '#64748b', text: '#1e293b', icon: Network };
    }
  };

  const filteredNodes = filterType === 'all' 
    ? initialNodes 
    : initialNodes.filter(n => n.type === filterType);

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-surface-container p-5 space-y-4 shadow-xs">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-container">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
            <Network className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-on-surface">Cyber Attack Graph & GNN Intelligence</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                MULTI-HOP ATTACK CORRELATION
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Correlating Threat Actors, SMS Payloads, Quishing QR, Domains, IPs, Identities, and Kernel Firewalls.
            </p>
          </div>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(prev => Math.min(prev + 0.15, 1.6))}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.7))}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Badges Bar */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="text-outline font-mono text-[11px] self-center mr-1">Filter Nodes:</span>
        {[
          { id: 'all', label: 'All Entities (9)' },
          { id: 'threat_actor', label: 'Threat Actors' },
          { id: 'payload_sms', label: 'SMS & Quishing' },
          { id: 'domain', label: 'Domains' },
          { id: 'ip_origin', label: 'IP Nodes' },
          { id: 'identity_user', label: 'Users / Targets' },
          { id: 'firewall_rule', label: 'Active Firewalls' }
        ].map(btn => (
          <button
            key={btn.id}
            onClick={() => setFilterType(btn.id)}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all border ${
              filterType === btn.id
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant border-surface-container hover:bg-surface-container'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Interactive SVG Graph Canvas */}
      <div className="relative w-full h-[460px] bg-slate-950 rounded-xl overflow-hidden border border-surface-container shadow-inner">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />

        <svg
          className="w-full h-full cursor-grab active:cursor-grabbing"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.2s ease' }}
        >
          {/* Defs for arrowheads */}
          <defs>
            <marker id="arrow-critical" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
            </marker>
            <marker id="arrow-high" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
            </marker>
            <marker id="arrow-info" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e" />
            </marker>
          </defs>

          {/* Render Edges */}
          {edges.map((edge, idx) => {
            const src = initialNodes.find(n => n.id === edge.source);
            const tgt = initialNodes.find(n => n.id === edge.target);
            if (!src || !tgt) return null;

            const isHighlighted = selectedNode && (selectedNode.id === edge.source || selectedNode.id === edge.target);
            const strokeColor = edge.severity === 'critical' ? '#ef4444' : edge.severity === 'high' ? '#f59e0b' : '#22c55e';
            const markerId = `url(#arrow-${edge.severity === 'critical' ? 'critical' : edge.severity === 'high' ? 'high' : 'info'})`;

            return (
              <g key={idx} className="transition-opacity duration-200">
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke={strokeColor}
                  strokeWidth={isHighlighted ? 3 : 1.5}
                  strokeDasharray={edge.severity === 'critical' ? '4 2' : 'none'}
                  opacity={selectedNode ? (isHighlighted ? 1 : 0.25) : 0.75}
                  markerEnd={markerId}
                />
                {/* Edge Label */}
                <text
                  x={(src.x + tgt.x) / 2}
                  y={(src.y + tgt.y) / 2 - 6}
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                  opacity={selectedNode ? (isHighlighted ? 1 : 0.15) : 0.7}
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Render Nodes */}
          {filteredNodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const style = getNodeColor(node.type);

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => handleNodeClick(node)}
                className="cursor-pointer group"
              >
                {/* Glow ring on selection */}
                {isSelected && (
                  <circle
                    r="24"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    className="animate-ping"
                    opacity="0.75"
                  />
                )}

                {/* Node circle */}
                <circle
                  r="18"
                  fill={style.bg}
                  stroke={isSelected ? '#38bdf8' : style.border}
                  strokeWidth={isSelected ? 3 : 2}
                  className="transition-transform group-hover:scale-110"
                />

                {/* Risk score badge circle */}
                {node.riskScore > 0 && (
                  <circle
                    cx="12"
                    cy="-12"
                    r="8"
                    fill={node.riskScore > 85 ? '#ef4444' : '#f59e0b'}
                  />
                )}
                {node.riskScore > 0 && (
                  <text
                    x="12"
                    y="-9"
                    fill="#ffffff"
                    fontSize="8"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {node.riskScore}
                  </text>
                )}

                {/* Node text label */}
                <text
                  y="32"
                  fill="#f8fafc"
                  fontSize="10"
                  fontFamily="sans-serif"
                  fontWeight={isSelected ? 'bold' : '500'}
                  textAnchor="middle"
                  className="select-none"
                >
                  {node.label.length > 24 ? `${node.label.substring(0, 22)}...` : node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-[10px] font-mono text-slate-300 space-y-1">
          <div className="font-bold text-white mb-1">Graph Entity Legend:</div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Threat Actor / Origin
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> SMS / QR Quishing Payload
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> Typosquat Phishing Domain
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Executive Identity Victim
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Kernel Firewall Enforcement
          </div>
        </div>
      </div>

      {/* Selected Node Details Drawer */}
      {selectedNode ? (
        <div className="p-4 rounded-xl bg-surface-container-low border border-primary/30 animate-in fade-in space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary uppercase">{selectedNode.type.replace('_', ' ')}</span>
              <span className="text-sm font-bold text-on-surface">{selectedNode.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono text-outline">Risk Contribution:</span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                selectedNode.riskScore > 85 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {selectedNode.riskScore}/100
              </span>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
            {selectedNode.details}
          </p>
        </div>
      ) : (
        <div className="p-3 text-center text-xs text-outline font-mono bg-surface-container-low rounded-xl border border-surface-container">
          Click any graph node to inspect multi-hop attack paths, connected evidence, and policy mitigation status.
        </div>
      )}
    </div>
  );
};
