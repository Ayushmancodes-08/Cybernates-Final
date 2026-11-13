import React, { useState } from 'react';
import { AttackGraphExplorer, GraphNode } from '../components/graph/AttackGraphExplorer';
import { Network, Share2, Sparkles, Terminal, Code2, Cpu, CheckCircle2, Sliders, Shield, BookOpen } from 'lucide-react';

export const GraphIntelligencePage: React.FC = () => {
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<GraphNode | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'GRAPH_EXPLORER' | 'ML_TRAINING_GUIDE'>('GRAPH_EXPLORER');

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">
              Graph Threat Intelligence & GNN Analytics
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-50 text-indigo-800 font-bold border border-indigo-200">
              GRAPH NEURAL NETWORKS
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Heterogeneous cyberattack graph mapping adversaries, SMS payloads, QR Quishing, typosquat domains, victim sessions, and kernel firewall enforcement.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-surface-container-lowest p-1 rounded-xl border border-surface-container">
          <button
            onClick={() => setActiveSubTab('GRAPH_EXPLORER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeSubTab === 'GRAPH_EXPLORER' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Interactive Attack Graph</span>
          </button>
          <button
            onClick={() => setActiveSubTab('ML_TRAINING_GUIDE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeSubTab === 'ML_TRAINING_GUIDE' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Multi-Model Training Specs</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'GRAPH_EXPLORER' ? (
        <div className="space-y-6">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container space-y-1">
              <div className="text-[10px] font-mono uppercase text-outline">Graph Entities (Nodes)</div>
              <div className="text-xl font-bold font-mono text-on-surface">9 Entities</div>
              <p className="text-[11px] text-on-surface-variant">Heterogeneous cyber taxonomy</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container space-y-1">
              <div className="text-[10px] font-mono uppercase text-outline">Correlated Edges</div>
              <div className="text-xl font-bold font-mono text-primary">10 Multi-Hop Links</div>
              <p className="text-[11px] text-on-surface-variant">Attribution to Storm-0501</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container space-y-1">
              <div className="text-[10px] font-mono uppercase text-outline">Louvain Community Clusters</div>
              <div className="text-xl font-bold font-mono text-indigo-600">2 Threat Rings</div>
              <p className="text-[11px] text-on-surface-variant">SMS/QR + Impossible Travel</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container space-y-1">
              <div className="text-[10px] font-mono uppercase text-outline">Firewall Defense Coverage</div>
              <div className="text-xl font-bold font-mono text-emerald-600">100% Contained</div>
              <p className="text-[11px] text-on-surface-variant">Netfilter drop active at perimeter</p>
            </div>
          </div>

          {/* Interactive Graph Explorer */}
          <AttackGraphExplorer onSelectNode={(node) => setSelectedNodeDetails(node)} />
        </div>
      ) : (
        /* Multi-Model Training & Fine-Tuning Guide Tab */
        <div className="space-y-6 animate-in fade-in">
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container space-y-4">
            <div className="flex items-center gap-3 border-b border-surface-container pb-3">
              <Cpu className="w-5 h-5 text-primary" />
              <div>
                <h3 className="text-sm font-bold text-on-surface">Multi-Model Training, Fine-Tuning & Explainability Specifications</h3>
                <p className="text-xs text-on-surface-variant">
                  Architectures, feature representations, datasets, and XAI engines utilized across CyberGuard.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
              {/* KNN & Anomaly Section */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-on-surface font-mono">1. K-Nearest Neighbors (KNN) + Isolation Forest</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-100 text-amber-800 font-semibold">Tabular / GeoIP</span>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  <strong>Task:</strong> Network flow rate burst detection & User Geo-Velocity Impossible Travel.
                </p>
                <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-surface-container font-mono text-[11px] space-y-1">
                  <div><strong>Features:</strong> [Δ_distance_km, Δ_time_seconds, flow_syn_ratio, packet_entropy]</div>
                  <div><strong>Training Library:</strong> scikit-learn + Faiss IndexFlatL2</div>
                  <div><strong>Explainability (XAI):</strong> Euclidean distance from nearest centroid (σ-deviation metric)</div>
                </div>
              </div>

              {/* CNN Section */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-on-surface font-mono">2. ResNet50 / EfficientNet CNN</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-100 text-purple-800 font-semibold">Computer Vision / Audio Spectrograms</span>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  <strong>Task:</strong> Audio Vocoder roll-off (&gt; 8 kHz) and Video facial landmark boundary seam detection.
                </p>
                <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-surface-container font-mono text-[11px] space-y-1">
                  <div><strong>Inputs:</strong> 128-band Log-Mel Spectrograms (Audio) & 224x224 RGB Facial Crops (Video)</div>
                  <div><strong>Loss Function:</strong> Focal Loss (dealing with imbalanced deepfake datasets)</div>
                  <div><strong>Explainability (XAI):</strong> Grad-CAM heatmaps highlighting exact pixel / frequency triggers</div>
                </div>
              </div>

              {/* GNN Section */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-on-surface font-mono">3. PyTorch Geometric (PyG) Heterogeneous GNN</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-100 text-indigo-800 font-semibold">Attack Graph Relational Network</span>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  <strong>Task:</strong> Multi-hop campaign clustering, lateral movement detection, and link prediction.
                </p>
                <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-surface-container font-mono text-[11px] space-y-1">
                  <div><strong>Layer Architecture:</strong> 2-Layer Relational Graph Convolutional Network (RGCN)</div>
                  <div><strong>Edge Relations:</strong> RESOLVES_TO, SENDS_SMS, ATTEMPTS_LOGIN, DROPPED_BY</div>
                  <div><strong>Explainability (XAI):</strong> GNNExplainer (identifying minimum influential subgraph path)</div>
                </div>
              </div>

              {/* Qwen 2.5 LoRA Section */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-on-surface font-mono">4. Qwen 2.5-3B-Instruct (LoRA Fine-Tuned)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-semibold">Security Co-Pilot / XAI Synthesis</span>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  <strong>Task:</strong> Translating mathematical model scores into executive MITRE ATT&CK explanations.
                </p>
                <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-surface-container font-mono text-[11px] space-y-1">
                  <div><strong>Fine-Tuning:</strong> QLoRA (Rank $r=16$, $\alpha=32$, target_modules=[q_proj, v_proj])</div>
                  <div><strong>Alignment:</strong> DPO (Direct Preference Optimization) on factual security incident pairs</div>
                  <div><strong>Role:</strong> Advisory reasoning co-pilot; strictly decoupled from Policy Enforcement</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
