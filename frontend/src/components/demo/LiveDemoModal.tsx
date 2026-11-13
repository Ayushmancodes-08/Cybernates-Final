import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  PlayCircle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  ArrowRight,
  Radio,
  Video,
  Share2,
  Sparkles,
  X,
  Volume2,
  QrCode,
  Network,
  Cpu,
  Layers,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Flame,
  Check
} from 'lucide-react';
import { SimulatorRunResult } from '../../types';

interface LiveDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

type DemoKey = 'PORT_SWEEP_FIREWALL' | 'VOICE_DEEPFAKE' | 'SCHOLARSHIP_QUISHING' | 'COMPARISON_SLIDE9';

export const LiveDemoModal: React.FC<LiveDemoModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [activeDemo, setActiveDemo] = useState<DemoKey>('PORT_SWEEP_FIREWALL');
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState<number>(0);
  const [result, setResult] = useState<SimulatorRunResult | null>(null);
  const [showScript, setShowScript] = useState(true);

  if (!isOpen) return null;

  const handleRunDemo = async (scenarioId: string) => {
    setRunning(true);
    setResult(null);
    setStep(1);

    try {
      // Step animation sequence
      setTimeout(() => setStep(2), 500);
      setTimeout(() => setStep(3), 1100);
      setTimeout(() => setStep(4), 1700);

      const res = await api.runSimulator(scenarioId);
      setTimeout(() => {
        setResult(res);
        setStep(5);
        setRunning(false);
      }, 2300);
    } catch (err: any) {
      alert(`Demonstration execution failed: ${err.message}`);
      setRunning(false);
      setStep(0);
    }
  };

  const handleJumpToSubsystem = (route: string) => {
    onClose();
    onNavigate(route);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-4xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container overflow-hidden flex flex-col max-h-[92vh] my-auto">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0b1c30] to-[#132d4e] text-white flex items-center justify-between shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/30 border border-primary/50 text-sky-300">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
                  OKCL HACKATHON • PROBLEM STATEMENT 9 • TEAM CYBERNATES
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  LIVE DEMO SUITE
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Interactive Judge Demonstration & Live Threat Scenarios
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex items-center gap-1 p-2 bg-surface-container-low border-b border-surface-container overflow-x-auto text-xs shrink-0">
          <button
            onClick={() => { setActiveDemo('PORT_SWEEP_FIREWALL'); setResult(null); setStep(0); }}
            className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeDemo === 'PORT_SWEEP_FIREWALL'
                ? 'bg-primary text-white shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>1. Autonomous Adaptive Firewall</span>
            <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-mono">L3/L4 Technical</span>
          </button>

          <button
            onClick={() => { setActiveDemo('VOICE_DEEPFAKE'); setResult(null); setStep(0); }}
            className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeDemo === 'VOICE_DEEPFAKE'
                ? 'bg-primary text-white shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>2. Multimodal Voice Deepfake</span>
            <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-mono">L7 Human Trust</span>
          </button>

          <button
            onClick={() => { setActiveDemo('SCHOLARSHIP_QUISHING'); setResult(null); setStep(0); }}
            className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeDemo === 'SCHOLARSHIP_QUISHING'
                ? 'bg-primary text-white shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>3. QR Quishing & GNN Campaign</span>
            <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-mono">Correlation</span>
          </button>

          <button
            onClick={() => { setActiveDemo('COMPARISON_SLIDE9'); setResult(null); setStep(0); }}
            className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeDemo === 'COMPARISON_SLIDE9'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Slide 9: AI vs Legacy Firewall</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-on-surface">
          
          {/* ========================================================================= */}
          {/* DEMO 1: ADAPTIVE FIREWALL & PORT SWEEP */}
          {/* ========================================================================= */}
          {activeDemo === 'PORT_SWEEP_FIREWALL' && (
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-blue-50/70 border border-blue-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-200 text-blue-900">
                      PPTX SLIDES 3 & 5 & 9
                    </span>
                    <h3 className="text-sm font-bold text-blue-950">
                      Scenario 1: Distributed TCP Port Sweep → Autonomous Kernel Netlink Drop
                    </h3>
                  </div>
                  <p className="text-xs text-blue-900/80 mt-1">
                    Simulates an adversary reconnaissance probe across 1,024 ports against the OKCL Core Gateway. Proves that risk calculation triggers deterministic rule synthesis with ephemeral TTL and Linux kernel Netlink verification.
                  </p>
                </div>

                <button
                  onClick={() => handleRunDemo('sim-port-scan')}
                  disabled={running}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {running ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <PlayCircle className="w-4 h-4" />
                  )}
                  <span>{running ? 'Executing Live Attack...' : 'Trigger Live Attack Probe'}</span>
                </button>
              </div>

              {/* Live Multi-Stage Animated Pipeline */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-3">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-outline flex items-center justify-between">
                  <span>Autonomous SOC Decision Pipeline</span>
                  <span className="text-primary">{step > 0 ? `Stage ${step} of 5 Active` : 'Ready to Execute'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  <div className={`p-3 rounded-lg border text-xs space-y-1 transition-all ${
                    step >= 1 ? 'bg-white border-primary shadow-xs' : 'bg-surface-container border-transparent opacity-60'
                  }`}>
                    <div className="font-mono text-[10px] font-bold text-primary">01. INGESTION</div>
                    <div className="font-semibold text-on-surface">SYN Flood Injected</div>
                    <p className="text-[10px] text-on-surface-variant">1,024 packets sent to 10.0.12.44:443</p>
                  </div>

                  <div className={`p-3 rounded-lg border text-xs space-y-1 transition-all ${
                    step >= 2 ? 'bg-white border-primary shadow-xs' : 'bg-surface-container border-transparent opacity-60'
                  }`}>
                    <div className="font-mono text-[10px] font-bold text-primary">02. SENSOR IDS</div>
                    <div className="font-semibold text-on-surface">Suricata Sensor</div>
                    <p className="text-[10px] text-on-surface-variant">Rule #2018489 triggered</p>
                  </div>

                  <div className={`p-3 rounded-lg border text-xs space-y-1 transition-all ${
                    step >= 3 ? 'bg-white border-amber-500 shadow-xs' : 'bg-surface-container border-transparent opacity-60'
                  }`}>
                    <div className="font-mono text-[10px] font-bold text-amber-600">03. RISK ENGINE</div>
                    <div className="font-semibold text-on-surface">Risk Score: 94/100</div>
                    <p className="text-[10px] text-on-surface-variant">Surpasses 85 threshold</p>
                  </div>

                  <div className={`p-3 rounded-lg border text-xs space-y-1 transition-all ${
                    step >= 4 ? 'bg-white border-blue-600 shadow-xs' : 'bg-surface-container border-transparent opacity-60'
                  }`}>
                    <div className="font-mono text-[10px] font-bold text-blue-600">04. POLICY ENGINE</div>
                    <div className="font-semibold text-on-surface">Synthesize nftables</div>
                    <p className="text-[10px] text-on-surface-variant">Rule DROP with 3600s TTL</p>
                  </div>

                  <div className={`p-3 rounded-lg border text-xs space-y-1 transition-all ${
                    step >= 5 ? 'bg-emerald-50 border-emerald-500 shadow-xs' : 'bg-surface-container border-transparent opacity-60'
                  }`}>
                    <div className="font-mono text-[10px] font-bold text-emerald-700">05. KERNEL RECEIPT</div>
                    <div className="font-semibold text-emerald-900">APPLIED_VERIFIED</div>
                    <p className="text-[10px] text-emerald-700">Zero packet leakage in netlink</p>
                  </div>
                </div>
              </div>

              {/* Execution Result Log Terminal */}
              {result && (
                <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-primary" />
                      <span className="text-xs font-mono font-bold">Linux Netlink Socket Terminal Proof</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold">
                        RULE {result.adaptive_rule_created} ACTIVE
                      </span>
                    </div>

                    <button
                      onClick={() => handleJumpToSubsystem('firewall')}
                      className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <span>Inspect in Adaptive Firewall Table</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0b1c30] text-emerald-400 font-mono text-xs space-y-1 overflow-x-auto shadow-inner">
                    {result.execution_log.map((line, idx) => (
                      <div key={idx} className="leading-relaxed">
                        <span className="text-slate-500 mr-2">&gt;</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>

                  {/* Qwen 2.5 Plain Language Explanation Box */}
                  <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-200 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-900 font-mono">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span>QWEN 2.5 PLAIN-LANGUAGE EXPLANATION: WHY WAS THIS ATTACK BLOCKED?</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-200 text-purple-900">
                        PLAIN ENGLISH FOR JUDGES
                      </span>
                    </div>
                    <div className="text-xs text-on-surface leading-relaxed font-sans bg-white p-3.5 rounded-lg border border-purple-100 shadow-xs space-y-2">
                      <p>
                        <strong>What Happened:</strong> An attacker used the anonymous Tor network to knock on 1,024 different digital doors (ports) on the OKCL State Gateway in just 12 seconds, trying to find an open entry point to break into the network.
                      </p>
                      <p>
                        <strong>Why It Was Blocked:</strong> Our intrusion sensor spotted 8,420 rapid connection packets with zero normal communication. The risk score hit 94/100 (way above the 85-point danger limit). CyberGuard automatically created a Linux kernel firewall rule in 11 milliseconds that slammed the door shut and completely blocked the attacker's IP.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Judge Q&A & Speaker Notes Box */}
              <div className="rounded-xl border border-surface-container bg-surface-container-low overflow-hidden">
                <button
                  onClick={() => setShowScript(!showScript)}
                  className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-on-surface hover:bg-surface-container transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Presenter Cheat Sheet: What to Highlight to the Judges (30s Pitch)</span>
                  </div>
                  {showScript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showScript && (
                  <div className="p-4 pt-1 text-xs text-on-surface-variant space-y-2 border-t border-surface-container bg-surface-container-lowest">
                    <p className="leading-relaxed">
                      <strong>The Key Point to Tell Judges:</strong> <em>"Traditional firewalls require a human analyst to review logs 45 minutes after an attack. CyberGuard synthesizes an ephemeral nftables DROP rule in 11 milliseconds. Notice that generative LLMs are strictly forbidden from touching firewall commands—only our deterministic Policy Engine evaluates the 85-point threshold and verifies receipt in kernel space via Netlink socket."</em>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px] font-mono">
                      <div className="p-2 rounded bg-surface-container-low">
                        <span className="text-outline">Latency:</span> <strong>11ms vs 45min</strong>
                      </div>
                      <div className="p-2 rounded bg-surface-container-low">
                        <span className="text-outline">Expiry:</span> <strong>TTL 3600s (No Stale Rules)</strong>
                      </div>
                      <div className="p-2 rounded bg-surface-container-low">
                        <span className="text-outline">Verification:</span> <strong>Netlink Socket AF_NETLINK</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* DEMO 2: AUDIO VOICE DEEPFAKE & MEL-SPECTROGRAM */}
          {/* ========================================================================= */}
          {activeDemo === 'VOICE_DEEPFAKE' && (
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-purple-50/70 border border-purple-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-200 text-purple-900">
                      PPTX SLIDES 4 & 6 & 8
                    </span>
                    <h3 className="text-sm font-bold text-purple-950">
                      Scenario 2: Multimodal Threat Lab — Audio Voice Deepfake & Mel-Spectrogram
                    </h3>
                  </div>
                  <p className="text-xs text-purple-900/80 mt-1">
                    Simulates an inbound VoIP emergency call spoofing Managing Director Dr. Deepak Mohanty requesting administrative MFA bypass. RawNet2 extracts Mel-spectrograms to catch vocoder high-frequency roll-off (&gt;8.15 kHz) and robotic pitch flatlines.
                  </p>
                </div>

                <button
                  onClick={() => handleRunDemo('sim-deepfake')}
                  disabled={running}
                  className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {running ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                  <span>{running ? 'Analyzing Acoustic Call...' : 'Test Inbound Audio Deepfake'}</span>
                </button>
              </div>

              {/* Visual Mel-Spectrogram & Acoustic Metrics Mockup */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0f172a] text-white space-y-3 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-mono font-bold text-sky-400">128-Band Mel-Spectrogram (RawNet2)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                      SYNTHETIC VOCODER DETECTED
                    </span>
                  </div>

                  {/* Simulated Spectrogram Heatmap */}
                  <div className="h-32 w-full rounded-lg bg-gradient-to-t from-red-600 via-amber-500 to-blue-900 relative overflow-hidden flex items-end p-2">
                    <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:6px_6px] opacity-40" />
                    
                    {/* Cutoff highlight line */}
                    <div className="absolute top-4 left-0 right-0 border-b-2 border-dashed border-red-400 flex items-center justify-between px-2 text-[10px] font-mono text-red-200">
                      <span>Nyquist High-Freq Cutoff: 8,150 Hz</span>
                      <span className="bg-red-900/90 px-1.5 py-0.5 rounded">VOC_ROLLOFF_ABRUPT</span>
                    </div>

                    <div className="relative z-10 w-full flex items-end justify-between gap-1 h-20 opacity-80">
                      {[40, 65, 80, 75, 90, 85, 70, 60, 45, 30, 20, 5, 2, 0, 0, 0].map((h, i) => (
                        <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-yellow-300 rounded-t-xs" />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Frequency Range: 0 - 16,000 Hz</span>
                    <span className="text-amber-400">Pitch Flatline: F0 σ = 4.2 Hz</span>
                  </div>
                </div>

                {/* Classification Verdict Card */}
                <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-[10px] font-mono uppercase text-outline">Acoustic Forensics Score</div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-4xl font-extrabold text-red-600">86%</span>
                      <span className="text-xs font-semibold text-outline">Deepfake Probability (Authenticity: 14%)</span>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between p-2 rounded bg-surface-container-lowest">
                        <span className="text-on-surface-variant">Caller ID:</span>
                        <span className="font-mono font-bold text-red-700">+91-674-239XXXX (Spoofed Managing Director)</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-surface-container-lowest">
                        <span className="text-on-surface-variant">Neural Model:</span>
                        <span className="font-mono text-on-surface">RawNet2 Spectral CNN (ASVspoof 2021)</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-surface-container-lowest">
                        <span className="text-on-surface-variant">Action Taken:</span>
                        <span className="font-mono font-bold text-emerald-700">SIP Origin Quarantined + Admin Lock</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleJumpToSubsystem('multimodal')}
                    className="w-full py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    <span>Inspect Full Multimodal Threat Lab</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Execution Log */}
              {result && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="p-3.5 rounded-xl bg-[#0b1c30] text-emerald-400 font-mono text-xs space-y-1 overflow-x-auto shadow-inner">
                    {result.execution_log.map((line, idx) => (
                      <div key={idx} className="leading-relaxed">
                        <span className="text-slate-500 mr-2">&gt;</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>

                  {/* Qwen 2.5 Plain Language Explanation Box */}
                  <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-900 font-mono">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span>QWEN 2.5 PLAIN-LANGUAGE EXPLANATION: WHY WAS THIS ATTACK BLOCKED?</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-200 text-purple-900">
                        PLAIN ENGLISH FOR JUDGES
                      </span>
                    </div>
                    <div className="text-xs text-on-surface leading-relaxed font-sans bg-white p-3.5 rounded-lg border border-purple-100 shadow-xs space-y-2">
                      <p>
                        <strong>What Happened:</strong> An attacker used generative AI to clone Managing Director Dr. Deepak Mohanty's voice and called the IT helpdesk demanding emergency administrative login access without multi-factor authentication.
                      </p>
                      <p>
                        <strong>Why It Was Blocked:</strong> To human ears the call sounds genuine, but our audio AI detected that the high-frequency sound waves abruptly stop above 8,150 Hz (a clear robotic vocoder signature) and lacked natural human pitch variations. CyberGuard immediately quarantined the phone line and locked the account to prevent unauthorized takeover.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Speaker Notes */}
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container text-xs space-y-2">
                <span className="font-bold text-on-surface flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Speaker Talking Point for Judges:
                </span>
                <p className="text-on-surface-variant leading-relaxed">
                  <em>"Human ears cannot detect deepfake audio because neural vocoders sound completely natural to us. But in spectral analysis, neural vocoders leave a dead giveaway: their power drops abruptly past 8.1 kHz, and their pitch contour lacks human emotional variance. CyberGuard flags this in real time before an administrator falls victim to CEO fraud."</em>
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* DEMO 3: SCHOLARSHIP QUISHING & ATTACK GRAPH */}
          {/* ========================================================================= */}
          {activeDemo === 'SCHOLARSHIP_QUISHING' && (
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900">
                      PPTX SLIDES 4 & 7 & 8
                    </span>
                    <h3 className="text-sm font-bold text-emerald-950">
                      Scenario 3: Omnichannel QR Quishing & Heterogeneous Attack Graph Correlation
                    </h3>
                  </div>
                  <p className="text-xs text-emerald-900/80 mt-1">
                    Simulates a coordinated campaign targeting OKCL students: physical QR poster + spoofed DLT SMS ('OKCL-GOV') redirecting to a zero-day credential harvester domain. Proves GNN cross-plane correlation.
                  </p>
                </div>

                <button
                  onClick={() => handleRunDemo('sim-quishing')}
                  disabled={running}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {running ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                  <span>{running ? 'Correlating Campaign...' : 'Simulate Quishing Blitz'}</span>
                </button>
              </div>

              {/* Correlation Chain Visual */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-3">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-outline">
                  Multi-Hop Heterogeneous Knowledge Graph Chain (PyG RGAT)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container space-y-1">
                    <div className="text-[10px] font-mono text-red-600 font-bold">THREAT ACTOR</div>
                    <div className="font-bold text-on-surface">Storm-0501</div>
                    <p className="text-[10px] text-on-surface-variant">Known APT phishing group</p>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container space-y-1">
                    <div className="text-[10px] font-mono text-amber-600 font-bold">DECEPTION VECTORS</div>
                    <div className="font-bold text-on-surface">Notice QR + SMS</div>
                    <p className="text-[10px] text-on-surface-variant">Spoofed DLT: 'OKCL-GOV'</p>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container space-y-1">
                    <div className="text-[10px] font-mono text-purple-600 font-bold">TARGET DOMAIN</div>
                    <div className="font-mono text-xs font-bold text-on-surface truncate">okcl-scholarship.online</div>
                    <p className="text-[10px] text-on-surface-variant">Domain age 3 days</p>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container space-y-1">
                    <div className="text-[10px] font-mono text-emerald-600 font-bold">AUTOMATED DROP</div>
                    <div className="font-mono text-xs font-bold text-emerald-700">103.212.45.19</div>
                    <p className="text-[10px] text-on-surface-variant">Kernel drop at perimeter</p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleJumpToSubsystem('graph-intelligence')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Open Interactive Attack Graph Canvas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Execution Log */}
              {result && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="p-3.5 rounded-xl bg-[#0b1c30] text-emerald-400 font-mono text-xs space-y-1 overflow-x-auto shadow-inner">
                    {result.execution_log.map((line, idx) => (
                      <div key={idx} className="leading-relaxed">
                        <span className="text-slate-500 mr-2">&gt;</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>

                  {/* Qwen 2.5 Plain Language Explanation Box */}
                  <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-900 font-mono">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span>QWEN 2.5 PLAIN-LANGUAGE EXPLANATION: WHY WAS THIS ATTACK BLOCKED?</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-200 text-purple-900">
                        PLAIN ENGLISH FOR JUDGES
                      </span>
                    </div>
                    <div className="text-xs text-on-surface leading-relaxed font-sans bg-white p-3.5 rounded-lg border border-purple-100 shadow-xs space-y-2">
                      <p>
                        <strong>What Happened:</strong> Adversary group Storm-0501 targeted OKCL students using both fake SMS messages and counterfeit QR code posters stuck on campus notice boards, claiming their Rs. 25,000 scholarship would be cancelled unless they paid immediately.
                      </p>
                      <p>
                        <strong>Why It Was Blocked:</strong> Both the physical poster QR code and the digital SMS directed victims to the same scam website (okcl-scholarship.portal-claim.online) registered only 3 days ago. Our Graph Neural Network (GNN) linked both vectors to a central host server in Frankfurt (103.212.45.19). CyberGuard wrote a single kernel firewall drop rule that instantly blocked the server, collapsing the entire statewide campaign at once.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Speaker Notes */}
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container text-xs space-y-2">
                <span className="font-bold text-on-surface flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Speaker Talking Point for Judges:
                </span>
                <p className="text-on-surface-variant leading-relaxed">
                  <em>"An SMS in Bhubaneswar and a network probe from Frankfurt look totally unrelated to traditional firewalls. CyberGuard links them into a single heterogeneous graph. By identifying the root command-and-control server, one single nftables kernel drop terminates the entire scholarship phishing campaign across all OKCL state colleges simultaneously."</em>
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SLIDE 9: TRADITIONAL VS CYBERGUARD COMPARISON MATRIX */}
          {/* ========================================================================= */}
          {activeDemo === 'COMPARISON_SLIDE9' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-200 text-indigo-900">
                    DIRECT FROM PPTX SLIDE 9
                  </span>
                  <h3 className="text-sm font-bold text-indigo-950">
                    Architectural Comparison: Traditional Security vs CyberGuard Adaptive AI Firewall
                  </h3>
                </div>
                <p className="text-xs text-indigo-900/80 mt-1">
                  Why legacy rule-based appliances fail against modern AI-powered multimodal deception, and how CyberGuard solves each flaw.
                </p>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto rounded-xl border border-surface-container">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-surface-container">
                      <th className="p-3 font-mono uppercase text-outline">Dimension</th>
                      <th className="p-3 font-semibold text-red-900 bg-red-50/50">Traditional Rule-Based Security</th>
                      <th className="p-3 font-bold text-emerald-900 bg-emerald-50/50">CyberGuard Adaptive AI Firewall</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container bg-surface-container-lowest">
                    <tr>
                      <td className="p-3 font-bold text-on-surface">Detection Paradigm</td>
                      <td className="p-3 text-on-surface-variant bg-red-50/20">Predefined signatures & fixed static rules (L3/L4 packet headers)</td>
                      <td className="p-3 font-semibold text-emerald-800 bg-emerald-50/20">Multi-Model AI Ensemble (Text + Vision + Audio + Flow + GNN)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-on-surface">Data Sources</td>
                      <td className="p-3 text-on-surface-variant bg-red-50/20">Isolated firewalls & syslog feeds without cross-domain correlation</td>
                      <td className="p-3 font-semibold text-emerald-800 bg-emerald-50/20">Cross-plane correlation (SMS + Mel-Spectrogram + Netlink + Identity)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-on-surface">Response Velocity</td>
                      <td className="p-3 text-on-surface-variant bg-red-50/20">Manual analyst ticket triage (~45 minutes average MTTR)</td>
                      <td className="p-3 font-semibold text-emerald-800 bg-emerald-50/20">Sub-millisecond autonomous rule synthesis (~11 milliseconds)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-on-surface">Rule Ephemerality</td>
                      <td className="p-3 text-on-surface-variant bg-red-50/20">Permanent static ACLs causing rule-bloat & false blocks</td>
                      <td className="p-3 font-semibold text-emerald-800 bg-emerald-50/20">Ephemeral rules with customizable Time-To-Live (TTL 3600s)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-on-surface">Enforcement Proof</td>
                      <td className="p-3 text-on-surface-variant bg-red-50/20">Assumed policy pushes with zero cryptographic kernel verification</td>
                      <td className="p-3 font-semibold text-emerald-800 bg-emerald-50/20">Linux Netlink socket (AF_NETLINK) returning immutable proof receipt</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-on-surface">Explainability (XAI)</td>
                      <td className="p-3 text-on-surface-variant bg-red-50/20">Black-box signature IDs without semantic justification</td>
                      <td className="p-3 font-semibold text-emerald-800 bg-emerald-50/20">LIME token weights, Nyquist cutoffs, and Qwen 2.5 MITRE triage</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-surface-container-low border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-mono">Demo Environment: Safe Isolated Sandbox Active</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleJumpToSubsystem('simulator')}
              className="px-3.5 py-1.5 rounded-lg border border-surface-container bg-surface-container-lowest hover:bg-surface-container text-on-surface font-semibold transition-colors"
            >
              Open Full Attack Simulator
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors shadow-xs"
            >
              Close Showcase
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
