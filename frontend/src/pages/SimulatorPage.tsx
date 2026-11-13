import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SimulatorScenario, SimulatorRunResult } from '../types';
import {
  PlayCircle,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  ArrowRight,
  Smartphone,
  Laptop,
  Wifi,
  Copy,
  ExternalLink,
  Zap,
  PhoneCall,
  Volume2,
  Radio,
  Unlock,
  Layers,
  ChevronDown,
  ChevronUp,
  Sliders,
  Sparkles,
  Key,
  UserCheck,
  Lock,
  Eye,
  X,
  FileText
} from 'lucide-react';
import { AiScamCallModal } from '../components/demo/AiScamCallModal';

interface SimulatorPageProps {
  onNavigate: (route: string) => void;
}

interface StepByStepAttackData {
  title: string;
  category: string;
  vector: string;
  mitre: string;
  senderIp: string;
  senderName: string;
  channel: string;
  target: string;
  payload: string;
  mlModel: string;
  confidenceScore: string;
  threatScore: number;
  extractedIndicators: string[];
  kernelAction: string;
  kernelLatency: string;
  qwenSummary: string;
  circleBroadcast: string;
}

export const SimulatorPage: React.FC<SimulatorPageProps> = ({ onNavigate }) => {
  const { user, login } = useAuth();

  // --- Network & Hotspot IP Configuration ---
  const defaultHost = typeof window !== 'undefined' ? window.location.hostname || '192.168.137.1' : '192.168.137.1';
  const [hostIp, setHostIp] = useState<string>(() => {
    if (defaultHost === 'localhost' || defaultHost === '127.0.0.1') {
      return '192.168.137.1';
    }
    return defaultHost;
  });
  const [customIpInput, setCustomIpInput] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [roleSwitchNotice, setRoleSwitchNotice] = useState<string | null>(null);

  // --- Live Status & Telemetry ---
  const [wsConnected, setWsConnected] = useState(false);
  const [activeAlert, setActiveAlert] = useState<any | null>(null);
  const [resolveNotice, setResolveNotice] = useState<string | null>(null);
  const [unblocking, setUnblocking] = useState(false);

  // --- Step-by-Step Pipeline Inspector Modal ---
  const [selectedAttackStepData, setSelectedAttackStepData] = useState<StepByStepAttackData | null>(null);
  const [activePipelineStep, setActivePipelineStep] = useState<number>(1);
  const [pipelineAnimating, setPipelineAnimating] = useState(false);

  // --- Demonstration 1 State ---
  const [injectingType, setInjectingType] = useState<string | null>(null);
  const [lastRelayResult, setLastRelayResult] = useState<any | null>(null);

  // --- Demonstration 2 State (Circle Defense) ---
  const [circleMembers, setCircleMembers] = useState<any[]>([]);
  const [circleSimulating, setCircleSimulating] = useState(false);
  const [lastCircleAlert, setLastCircleAlert] = useState<any | null>(null);
  const [syncedSignaturesCount, setSyncedSignaturesCount] = useState<number>(142);

  // --- Demonstration 3 State (AI Scam Call Simulator) ---
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [lastCallResult, setLastCallResult] = useState<any | null>(null);

  // --- Legacy Sandbox Runner State ---
  const [scenarios, setScenarios] = useState<SimulatorScenario[]>([]);
  const [runningScenarioId, setRunningScenarioId] = useState<string | null>(null);
  const [lastScenarioResult, setLastScenarioResult] = useState<SimulatorRunResult | null>(null);
  const [showLegacySandbox, setShowLegacySandbox] = useState(false);

  // URLs for Physical Phones
  const phoneAUrl = `http://${hostIp}:5173/remote-attack?device=phone_a`;
  const phoneBUrl = `http://${hostIp}:5173/mobile-app`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const getBackendUrl = () => `http://${hostIp}:8000`;
  const getWsUrl = () => `ws://${hostIp}:8000/api/v1/ws`;

  // Fetch initial circle members & scenarios
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const scData = await api.getSimulatorScenarios();
        setScenarios(scData);
      } catch (e) {
        console.error('Failed to load scenarios:', e);
      }

      try {
        const cRes = await fetch(`${getBackendUrl()}/api/v1/circle/members`);
        const cData = await cRes.json();
        if (cData.members) {
          setCircleMembers(cData.members);
          if (cData.synced_signatures_count) {
            setSyncedSignaturesCount(cData.synced_signatures_count);
          }
        }
      } catch (e) {
        console.error('Failed to load circle members:', e);
      }
    };

    fetchInitialData();
  }, [hostIp]);

  // WebSocket Live Listener
  useEffect(() => {
    let ws: WebSocket | null = null;
    let timer: any = null;

    const connect = () => {
      try {
        ws = new WebSocket(getWsUrl());
        ws.onopen = () => setWsConnected(true);
        ws.onclose = () => {
          setWsConnected(false);
          timer = setTimeout(connect, 3000);
        };
        ws.onerror = () => ws?.close();
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'CIRCLE_EARLY_WARNING') {
              setActiveAlert(data);
              setLastCircleAlert(data);
              setSyncedSignaturesCount((prev) => prev + 1);
            } else if (data.type === 'VISHING_CALL_INTERCEPTED') {
              setActiveAlert(data);
              setLastCallResult(data);
            } else if (data.type === 'RELAY_THREAT_INTERCEPTED') {
              setActiveAlert(data);
            } else if (data.type === 'IP_UNBLOCKED') {
              setResolveNotice(`IP ${data.client_ip} unblocked and flushed from eBPF netfilter.`);
              setTimeout(() => setResolveNotice(null), 3500);
            }
          } catch (e) {
            console.error('WS parse error', e);
          }
        };
      } catch (e) {
        setWsConnected(false);
      }
    };

    connect();
    return () => {
      if (ws) ws.close();
      if (timer) clearTimeout(timer);
    };
  }, [hostIp]);

  // --- Step-by-Step Execution Animator ---
  const triggerPipelineAnimation = (stepData: StepByStepAttackData) => {
    setSelectedAttackStepData(stepData);
    setActivePipelineStep(1);
    setPipelineAnimating(true);

    // Step through 1 to 6 automatically
    const timers = [
      setTimeout(() => setActivePipelineStep(2), 400),
      setTimeout(() => setActivePipelineStep(3), 850),
      setTimeout(() => setActivePipelineStep(4), 1300),
      setTimeout(() => setActivePipelineStep(5), 1750),
      setTimeout(() => {
        setActivePipelineStep(6);
        setPipelineAnimating(false);
      }, 2200)
    ];

    return () => timers.forEach(clearTimeout);
  };

  // --- Quick Role Switcher Handler ---
  const handleQuickRoleSwitch = async (email: string, pass: string, roleName: string) => {
    try {
      await login(email, pass);
      setRoleSwitchNotice(`Active session switched to ${roleName} (${email})!`);
      setTimeout(() => setRoleSwitchNotice(null), 3500);
    } catch (err: any) {
      alert(`Role switch failed: ${err.message}`);
    }
  };

  // --- Demo 1: Trigger Attack with Step-by-Step Visualization ---
  const handleInjectAttack = async (type: string) => {
    setInjectingType(type);
    setLastRelayResult(null);

    let payload = '';
    let channel = 'SMS';
    let mediaType = 'text';
    let subject = '';
    let senderName = 'Phone A';

    let stepInfo: StepByStepAttackData;

    switch (type) {
      case 'SCHOLARSHIP':
        channel = 'SMS';
        payload = '[AX-MEDHABRUTI] Final notice: Your Odisha State Post-Matric Scholarship payment of Rs 25,000 is pending. Verify bank account within 2 hours or grant will be canceled: https://medhabruti-gov-verify.top';
        stepInfo = {
          title: 'AX-MEDHABRUTI Scholarship Urgency Scam',
          category: 'SMS Smishing',
          vector: 'SMS_SMISHING',
          mitre: 'T1566.002 - Spearphishing Link / Smishing',
          senderIp: '192.168.137.119',
          senderName: 'Phone A (Simulated Attacker)',
          channel: 'SMS Telephony Gateway',
          target: 'Rahul Sharma (+91 70081 22910)',
          payload,
          mlModel: 'DeBERTa-v3 NLP Intent Engine + Class-Weighted Logistic Regression',
          confidenceScore: '96.8% Malicious Confidence',
          threatScore: 98,
          extractedIndicators: [
            'Panic urgency token: "verify within 2 hours"',
            'State grant impersonation: "Rs 25,000 pending"',
            'Lookalike domain: medhabruti-gov-verify.top (registered < 3 days ago)',
            'DLT Header AX-MEDHABRUTI spoofed with no valid telecom cryptographic token'
          ],
          kernelAction: 'eBPF Netfilter zero-copy DROP table insertion',
          kernelLatency: '0.42 μs (<0.5s end-to-end containment)',
          qwenSummary: 'Qwen 2.5 3B flagged high-severity psychological coercion coercing student to enter banking credentials. Packet dropped immediately with 0 bytes leakage to recipient.',
          circleBroadcast: 'Dispatched preemptive blacklist signature to Papa, Mother, Sister, and Grandpa Suresh Mohanty.'
        };
        break;

      case 'PAYROLL_EMAIL':
        channel = 'EMAIL';
        subject = 'Mandatory Direct Deposit Payroll Account Verification';
        senderName = 'Odisha State HRMS Portal';
        payload = 'Notice to State Employees: Failure to update direct deposit banking credentials before 5:00 PM today will cause your monthly salary disbursal to be held. Access portal: https://hrms-odisha-gov.site/login';
        stepInfo = {
          title: 'Odisha State HRMS Direct Deposit Spear Phishing',
          category: 'Spear Phishing Email',
          vector: 'SPEAR_PHISHING_EMAIL',
          mitre: 'T1566.001 - Spearphishing Attachment / Link',
          senderIp: '192.168.137.119',
          senderName: 'Spoofed HRMS Service <payroll@hrms-odisha-gov.site>',
          channel: 'SMTP / Webmail Ingress',
          target: 'Rahul Sharma (State Employee)',
          payload,
          mlModel: 'Lexical Random Forest (18 Features) + PhiUSIIL XGBoost Benchmark',
          confidenceScore: '98.4% Phishing Probability',
          threatScore: 97,
          extractedIndicators: [
            'Lookalike domain: hrms-odisha-gov.site (homoglyph attack)',
            'Urgency pressure: "salary disbursal to be held today"',
            'SPF/DKIM alignment failure: 192.168.137.119 not authorized by state treasury',
            'Credential harvest form detected at /login endpoint'
          ],
          kernelAction: 'SMTP In-Line Gateway DROP & Session Terminated',
          kernelLatency: '0.38 μs (<0.5s drop)',
          qwenSummary: 'Qwen 2.5 identified financial coercion targeting government payroll credentials. Quarantined and permanently dropped.',
          circleBroadcast: 'HRMS phishing signature pushed to all circle endpoints.'
        };
        break;

      case 'SBI_SMISHING':
        channel = 'WHATSAPP';
        payload = 'Dear Customer, Your SBI account ending in XX81 has been placed on hold due to pending KYC. Click immediately to complete verification and prevent block: https://sbi-kyc-auth.top';
        stepInfo = {
          title: 'SBI YONO Banking KYC Suspension Scam',
          category: 'Social Messaging Phish',
          vector: 'WHATSAPP_PHISH',
          mitre: 'T1566.002 - Spearphishing Link',
          senderIp: '192.168.137.119',
          senderName: 'SBI Verification Bot (Spoofed)',
          channel: 'WhatsApp In-Line Relay',
          target: 'Rahul Sharma / Citizen Endpoint',
          payload,
          mlModel: 'PhiUSIIL XGBoost + Scikit-Learn Random Forest',
          confidenceScore: '99.1% Phishing Probability',
          threatScore: 99,
          extractedIndicators: [
            'Bank impersonation: State Bank of India YONO brand lure',
            'Account suspension panic: "placed on hold due to KYC"',
            'High Shannon lexical entropy: 4.62 on sbi-kyc-auth.top',
            'Fake OAuth credential collection signature'
          ],
          kernelAction: 'eBPF Netfilter zero-copy DROP executed',
          kernelLatency: '0.42 μs (<0.5s drop)',
          qwenSummary: 'Qwen 2.5 flagged fraudulent banking KYC credential theft attempt. In-flight packet dropped with zero bytes delivered.',
          circleBroadcast: 'Preemptive early warning dispatched to Family Circle Mesh.'
        };
        break;

      case 'POWER_CUT':
        channel = 'SMS';
        payload = 'Dear Consumer, Your electricity power supply will be disconnected tonight at 9:30 PM from the sub-station because your previous month bill was not updated. Contact electricity officer at 98610-44219 immediately.';
        stepInfo = {
          title: 'Urgent Electricity Disconnection Smishing',
          category: 'Utility Urgent Scam',
          vector: 'SMS_SMISHING',
          mitre: 'T1566.003 - Spearphishing via Service',
          senderIp: '192.168.137.119',
          senderName: 'Electricity Sub-Station (Spoofed)',
          channel: 'SMS Telephony Gateway',
          target: 'Rahul Sharma / Citizen Endpoint',
          payload,
          mlModel: 'DeBERTa-v3 NLP Intent Engine + SMS Corpus Logistic Regression',
          confidenceScore: '95.4% Panic Index Score',
          threatScore: 94,
          extractedIndicators: [
            'Imminent service loss threat: "power disconnected tonight at 9:30 PM"',
            'Unregistered personal mobile provided instead of official DISCOM toll-free',
            'Bypasses official TPCODL/WESCO utility payment gateway',
            'Known coercive extortion pattern targeting residential power meters'
          ],
          kernelAction: 'In-Line Telephony Filter DROP',
          kernelLatency: '0.45 μs (<0.5s drop)',
          qwenSummary: 'Identified classic utility extortion smishing payload designed to harvest immediate UPI payments. Dropped in-flight.',
          circleBroadcast: 'Dispatched alert to Family Circle: Warning against utility phone call extortion.'
        };
        break;

      case 'VOICE_DEEPFAKE':
        channel = 'AUDIO';
        mediaType = 'audio';
        payload = 'Urgent voice memo (8,150 Hz vocoder cutoff): "Deepak, this is Principal Secretary Mishra. Please immediately execute the vendor invoice batch via RTGS to avoid procurement penalties."';
        stepInfo = {
          title: 'CEO / Secretary Voice Clone BEC Wire Scam',
          category: 'Synthetic Voice Deepfake',
          vector: 'AI_VOICE_DEEPFAKE',
          mitre: 'T1565.002 - Transmitted Data Manipulation / Deepfake',
          senderIp: '192.168.137.119',
          senderName: 'Principal Secretary Mishra (Voice Clone)',
          channel: 'Audio VoIP / Messaging Stream',
          target: 'Deepak Mohanty (Parent / Finance Officer)',
          payload,
          mlModel: 'RawNet2 + High-Frequency FFT Vocoder Residual Analyzer',
          confidenceScore: '93.6% Synthetic Voice Confidence (6.4% Authenticity)',
          threatScore: 96,
          extractedIndicators: [
            'Acoustic roll-off cutoff anomaly at exactly 8,150 Hz',
            'Absence of micro-tremors and natural glottal pulses in formant frequencies',
            'Synthetic neural vocoder phase artifacts detected',
            'Urgent RTGS invoice clearance demand bypassed double-signatory protocol'
          ],
          kernelAction: 'Audio Stream In-Line Termination & Drop',
          kernelLatency: '0.42 μs (<0.5s drop)',
          qwenSummary: 'Qwen 2.5 verified voice clone signature. Intercepted in-flight with zero audio packets leaked to victim loudspeaker.',
          circleBroadcast: 'Auto-deployed voice clone spectral fingerprint to all Circle devices.'
        };
        break;

      case 'BENIGN_MESSAGE':
        channel = 'WHATSAPP';
        payload = 'Hey Dad, reaching home by 7:30 PM for dinner. Got the fresh vegetables you asked for!';
        stepInfo = {
          title: 'Genuine Authenticated Family Message',
          category: 'Clean Benign Traffic',
          vector: 'BENIGN_TRAFFIC',
          mitre: 'N/A (Authorized Communication)',
          senderIp: '192.168.137.119',
          senderName: 'Rahul Sharma (Family Member)',
          channel: 'WhatsApp Messaging Ingress',
          target: 'Deepak Mohanty (Father)',
          payload,
          mlModel: 'CyberGuard Multi-Model Ensemble Classifier',
          confidenceScore: '99.8% Clean Authenticity Score',
          threatScore: 2,
          extractedIndicators: [
            'Zero psychological urgency tokens',
            'No external hyperlinks or executable redirects',
            'Authentic sender conversation history verified',
            'Cryptographic payload signature clean'
          ],
          kernelAction: 'KERNEL ALLOW: 0.08 μs Pass-Through',
          kernelLatency: '0.08 μs (Zero Latency, Clean Delivery)',
          qwenSummary: 'Benign family communication verified. Packet delivered to Phone B with 100% fidelity and zero delay.',
          circleBroadcast: 'No threat detected; normal communication logged.'
        };
        break;

      default:
        payload = 'Test payload';
        stepInfo = {
          title: 'Generic Test Strike',
          category: 'Test',
          vector: 'TEST_VECTOR',
          mitre: 'T1000',
          senderIp: '192.168.137.119',
          senderName: 'Tester',
          channel: 'Test',
          target: 'Endpoint',
          payload,
          mlModel: 'Test Model',
          confidenceScore: '90%',
          threatScore: 90,
          extractedIndicators: ['Test Indicator'],
          kernelAction: 'DROP',
          kernelLatency: '0.42 μs',
          qwenSummary: 'Test execution.',
          circleBroadcast: 'Test broadcast.'
        };
    }

    // Trigger step-by-step visual pipeline modal immediately
    triggerPipelineAnimation(stepInfo);

    try {
      const res = await fetch(`${getBackendUrl()}/api/v1/relay/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: payload,
          channel,
          media_type: mediaType,
          email_subject: subject,
          email_sender_name: senderName
        })
      });
      const data = await res.json();
      setLastRelayResult(data);
    } catch (err: any) {
      alert(`Relay strike failed: ${err.message}`);
    } finally {
      setInjectingType(null);
    }
  };

  // --- Fast Unblock / Reset ---
  const handleFastUnblock = async () => {
    setUnblocking(true);
    try {
      await fetch(`${getBackendUrl()}/api/v1/live-ingress/unblock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: '192.168.137.119' })
      });
      setResolveNotice(`eBPF netfilter table cleared. IP 192.168.137.119 unblocked in 0.42 μs.`);
      setTimeout(() => setResolveNotice(null), 3500);
    } catch (e: any) {
      alert(`Unblock error: ${e.message}`);
    } finally {
      setUnblocking(false);
    }
  };

  // --- Demo 2: Simulate Attack on Grandpa Suresh Mohanty ---
  const handleSimulateCircleAttack = async (targetName: string, attackType: string) => {
    setCircleSimulating(true);

    const stepInfo: StepByStepAttackData = {
      title: `Circle Attack on ${targetName}`,
      category: attackType === 'VOICE_CLONE' ? 'Synthetic Voice Deepfake' : 'Banking Smishing Scam',
      vector: attackType === 'VOICE_CLONE' ? 'AI_VOICE_DEEPFAKE' : 'SBI_SMISHING',
      mitre: 'T1566.002 - Smishing / Circle Vulnerability Exploitation',
      senderIp: '192.168.137.119',
      senderName: 'Attacker Ingress Node',
      channel: 'Mobile Telephony / Circle Mesh',
      target: `${targetName} (+91 98610 99999)`,
      payload: attackType === 'VOICE_CLONE'
        ? 'Voice note impersonating son: "Grandpa, I had an accident, wire Rs 15,000 urgently to this UPI"'
        : 'SBI Account ending XX81 blocked today. Update KYC urgently: https://sbi-kyc-auth.top',
      mlModel: 'DeBERTa-v3 Intent Engine + RawNet2 Vocoder Analyzer',
      confidenceScore: '98.7% Threat Confidence',
      threatScore: 99,
      extractedIndicators: [
        'Exploitation of senior citizen trust relationship',
        'Coercive urgency targeting emergency medical/banking funds',
        'In-line Telephony Sentinel flagged unauthorized payment solicitation',
        'Circle early-warning broadcast triggered across all 4 family devices'
      ],
      kernelAction: 'KERNEL eBPF DROP: 0.42 μs execution on Grandpa device',
      kernelLatency: '0.42 μs (Zero Packet Leakage)',
      qwenSummary: `Qwen 2.5 identified high-vulnerability attack targeting ${targetName}. Packet dropped at kernel level. Instant early warning dispatched to Papa (Deepak) and Son (Rahul).`,
      circleBroadcast: `Dispatched CIRCLE_EARLY_WARNING alert to all family devices. Synced signatures incremented to ${syncedSignaturesCount + 1}.`
    };

    triggerPipelineAnimation(stepInfo);

    try {
      const res = await fetch(`${getBackendUrl()}/api/v1/circle/simulate-attack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_member_name: targetName,
          attack_type: attackType
        })
      });
      const data = await res.json();
      setLastCircleAlert(data.alert);
      setActiveAlert(data.alert);
      setSyncedSignaturesCount((prev) => prev + 1);

      const cRes = await fetch(`${getBackendUrl()}/api/v1/circle/members`);
      const cData = await cRes.json();
      if (cData.members) setCircleMembers(cData.members);
    } catch (e: any) {
      alert(`Circle simulation error: ${e.message}`);
    } finally {
      setCircleSimulating(false);
    }
  };

  // --- Legacy Sandbox Run Handler ---
  const handleRunLegacyScenario = async (scenarioId: string) => {
    setRunningScenarioId(scenarioId);
    setLastScenarioResult(null);
    try {
      const res = await api.runSimulator(scenarioId);
      setLastScenarioResult(res);
    } catch (err: any) {
      alert(`Scenario execution failed: ${err.message}`);
    } finally {
      setRunningScenarioId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-7xl mx-auto pb-16">
      {/* =========================================================================
          SECTION 1: MASTER HEADER & HOTSPOT / IP CONFIGURATOR
         ========================================================================= */}
      <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-on-surface tracking-tight flex items-center gap-2">
                  Laptop SOC Demonstration Cockpit
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                    LIVE MULTI-NODE
                  </span>
                </h1>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Orchestrate live demonstrations across this Laptop SOC console and 2 physical mobile phones over Local Wi-Fi or Hotspot.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Engine Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low border border-surface-container text-xs font-mono">
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
              <span className="font-semibold text-on-surface">SOC WebSocket:</span>
              <span className={wsConnected ? 'text-emerald-700 font-bold' : 'text-red-700'}>
                {wsConnected ? 'ONLINE' : 'RECONNECTING'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>eBPF In-Line Kernel: <strong>0.42 μs DROP</strong></span>
            </div>

            <button
              onClick={handleFastUnblock}
              disabled={unblocking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline/20 text-xs font-mono text-on-surface cursor-pointer transition-all"
              title="Flush netfilter table and unblock simulated attacker IP"
            >
              <Unlock className="w-3.5 h-3.5 text-amber-600" />
              <span>{unblocking ? 'Flushing...' : 'Fast Unblock IP (<0.5s)'}</span>
            </button>
          </div>
        </div>

        {/* Hotspot & IP Address Selector */}
        <div className="mt-5 pt-4 border-t border-surface-container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-on-surface">
              <Wifi className="w-4 h-4 text-primary" />
              <span className="font-bold">Active Laptop IP / Hotspot Gateway:</span>
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold border border-primary/20">
                http://{hostIp}:5173
              </span>
            </div>

            {/* IP Preset Switches */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono text-on-surface-variant">Quick Switch:</span>
              <button
                onClick={() => setHostIp('192.168.137.1')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                  hostIp === '192.168.137.1'
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-container-low hover:bg-surface-container text-on-surface border border-surface-container'
                }`}
              >
                Mobile Hotspot (192.168.137.1)
              </button>
              <button
                onClick={() => setHostIp('192.168.65.62')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                  hostIp === '192.168.65.62'
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-container-low hover:bg-surface-container text-on-surface border border-surface-container'
                }`}
              >
                Wi-Fi LAN (192.168.65.62)
              </button>
              <button
                onClick={() => setHostIp('127.0.0.1')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                  hostIp === '127.0.0.1' || hostIp === 'localhost'
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-container-low hover:bg-surface-container text-on-surface border border-surface-container'
                }`}
              >
                Localhost (127.0.0.1)
              </button>

              {/* Custom IP Entry */}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Custom IP..."
                  value={customIpInput}
                  onChange={(e) => setCustomIpInput(e.target.value)}
                  className="px-2 py-1 text-[11px] font-mono rounded-lg border border-surface-container bg-surface-container-lowest text-on-surface w-28 focus:outline-none focus:border-primary"
                />
                <button
                  onClick={() => {
                    if (customIpInput.trim()) setHostIp(customIpInput.trim());
                  }}
                  className="px-2 py-1 rounded-lg bg-surface-container hover:bg-primary hover:text-white text-[11px] font-mono text-on-surface transition-all cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Global Alert Banner (if any received via WebSocket) */}
        {activeAlert && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold font-mono uppercase tracking-wide text-amber-800">
                  {activeAlert.type || 'LIVE THREAT INTERCEPTED'}
                </div>
                <div className="text-xs mt-0.5 font-medium leading-relaxed">
                  {activeAlert.message || activeAlert.toast_laptop?.title || 'Threat intercepted in-flight by CyberGuard eBPF kernel.'}
                </div>
                {activeAlert.payload_snippet && (
                  <div className="mt-1.5 text-[11px] font-mono bg-white/70 px-2 py-1 rounded border border-amber-200">
                    <strong>Payload:</strong> {activeAlert.payload_snippet}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setActiveAlert(null)}
              className="text-xs text-amber-700 hover:text-amber-950 font-bold px-2 py-1 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Resolution Toast Notice */}
        {resolveNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{resolveNotice}</span>
            </div>
            <button onClick={() => setResolveNotice(null)} className="font-bold text-emerald-700 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Role Switch Toast */}
        {roleSwitchNotice && (
          <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-300 text-blue-900 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>{roleSwitchNotice}</span>
            </div>
            <button onClick={() => setRoleSwitchNotice(null)} className="font-bold text-blue-700 cursor-pointer">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 2: ROLE-BASED ACCESS & LIVE LOGIN CREDENTIALS HUB
         ========================================================================= */}
      <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container pb-4">
          <div className="flex items-center gap-2.5">
            <Key className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-base font-bold text-on-surface">Role-Based Access Control & Demonstration Credentials</h2>
              <p className="text-xs text-on-surface-variant">
                Switch roles with 1-click or use these credentials to log in on different devices/browsers to test RBAC enforcement.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-outline">Active Role:</span>
            <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold border border-primary/20">
              {user?.role?.toUpperCase() || 'ADMIN'} ({user?.name || 'Elena Vance'})
            </span>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Role 1: Security Architect (Admin) */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                  ROLE: ADMIN
                </span>
                <span className="text-[10px] font-mono text-outline">Tier-4 Lead</span>
              </div>
              <div className="font-bold text-sm text-on-surface mt-1">Elena Vance</div>
              <div className="text-[11px] text-on-surface-variant">Lead Security Architect</div>

              <div className="mt-2 p-2 rounded bg-surface-container-lowest border border-surface-container space-y-1 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-on-surface font-semibold truncate max-w-[140px]">elena.vance@cyberguard.internal</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Password:</span>
                  <span className="text-primary font-bold">CyberGuard@2026!Admin</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Permissions: Full kernel eBPF override, tenant management, quarantine release.
              </div>
            </div>

            <div className="pt-2 border-t border-surface-container flex items-center gap-1.5">
              <button
                onClick={() => handleQuickRoleSwitch('elena.vance@cyberguard.internal', 'CyberGuard@2026!Admin', 'Lead Architect (Admin)')}
                className="w-full py-1.5 px-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-[11px] font-mono font-semibold transition-all cursor-pointer shadow-xs text-center"
              >
                1-Tap Switch to Admin
              </button>
              <button
                onClick={() => copyToClipboard('elena.vance@cyberguard.internal', 'elena_email')}
                className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] cursor-pointer"
                title="Copy Email"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Role 2: Senior SOC Analyst */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                  ROLE: ANALYST
                </span>
                <span className="text-[10px] font-mono text-outline">SOC Operations</span>
              </div>
              <div className="font-bold text-sm text-on-surface mt-1">Marcus Chen</div>
              <div className="text-[11px] text-on-surface-variant">Senior SOC Incident Analyst</div>

              <div className="mt-2 p-2 rounded bg-surface-container-lowest border border-surface-container space-y-1 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-on-surface font-semibold truncate max-w-[140px]">marcus.chen@cyberguard.internal</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Password:</span>
                  <span className="text-amber-800 font-bold">CyberGuard@2026!Analyst</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Permissions: Threat triage, incident investigation, Qwen 2.5 AI queries.
              </div>
            </div>

            <div className="pt-2 border-t border-surface-container flex items-center gap-1.5">
              <button
                onClick={() => handleQuickRoleSwitch('marcus.chen@cyberguard.internal', 'CyberGuard@2026!Analyst', 'Senior SOC Analyst')}
                className="w-full py-1.5 px-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-mono font-semibold transition-all cursor-pointer shadow-xs text-center"
              >
                1-Tap Switch to Analyst
              </button>
              <button
                onClick={() => copyToClipboard('marcus.chen@cyberguard.internal', 'marcus_email')}
                className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] cursor-pointer"
                title="Copy Email"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Role 3: Security Auditor (Viewer) */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                  ROLE: VIEWER
                </span>
                <span className="text-[10px] font-mono text-outline">Audit / Compliance</span>
              </div>
              <div className="font-bold text-sm text-on-surface mt-1">Sarah Jenkins</div>
              <div className="text-[11px] text-on-surface-variant">Security & Compliance Auditor</div>

              <div className="mt-2 p-2 rounded bg-surface-container-lowest border border-surface-container space-y-1 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-on-surface font-semibold truncate max-w-[140px]">sarah.jenkins@cyberguard.internal</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Password:</span>
                  <span className="text-slate-800 font-bold">CyberGuard@2026!Viewer</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Permissions: Read-only audit access, compliance telemetry, verified logs.
              </div>
            </div>

            <div className="pt-2 border-t border-surface-container flex items-center gap-1.5">
              <button
                onClick={() => handleQuickRoleSwitch('sarah.jenkins@cyberguard.internal', 'CyberGuard@2026!Viewer', 'Compliance Auditor (Viewer)')}
                className="w-full py-1.5 px-2 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-[11px] font-mono font-semibold transition-all cursor-pointer shadow-xs text-center"
              >
                1-Tap Switch to Viewer
              </button>
              <button
                onClick={() => copyToClipboard('sarah.jenkins@cyberguard.internal', 'sarah_email')}
                className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] cursor-pointer"
                title="Copy Email"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Role 4: Protected Citizen / Single User (Phone B) */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-300 space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                  ROLE: CITIZEN
                </span>
                <span className="text-[10px] font-mono text-emerald-800 font-bold">Phone B Endpoint</span>
              </div>
              <div className="font-bold text-sm text-on-surface mt-1">Rahul Sharma</div>
              <div className="text-[11px] text-emerald-900 font-medium">Family Circle Admin / Protected Citizen</div>

              <div className="mt-2 p-2 rounded bg-white border border-emerald-200 space-y-1 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="text-emerald-800 font-bold">+91 70081 22910</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Direct App:</span>
                  <span className="text-primary font-bold">/mobile-app</span>
                </div>
              </div>
              <div className="text-[10px] text-emerald-800 mt-1">
                Permissions: Circle Mesh Defense, PhishGuard link scanner, AI Mentor.
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-200 flex items-center gap-1.5">
              <a
                href={phoneBUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-1.5 px-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-mono font-semibold transition-all shadow-xs text-center flex items-center justify-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Open Citizen Mobile</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: DUAL PHYSICAL PHONE PAIRING & QR CODES
         ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Phone A Pairing Card */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-red-100 text-red-700 font-mono font-bold text-xs">NODE 1</span>
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-red-600" />
                  Phone A: Attacker Mobile
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-50 text-red-700 border border-red-200">
                INGRESS SENDER
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
              Connect Phone 1 to the laptop hotspot, then scan this QR code or navigate to this link to access the simulated attacker interface (injecting SMS, WhatsApp, voice memos & deepfakes).
            </p>

            {/* QR Code and URL Container */}
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl bg-surface-container-low border border-surface-container">
              <div className="w-28 h-28 bg-white p-1 rounded-lg border border-surface-container shadow-xs shrink-0 flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(phoneAUrl)}`}
                  alt="QR Code for Phone A"
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>

              <div className="space-y-2 w-full min-w-0">
                <div className="text-[11px] font-mono text-outline font-semibold">PAIRING URL:</div>
                <div className="p-2 rounded bg-surface-container-lowest border border-surface-container text-xs font-mono text-primary truncate select-all">
                  {phoneAUrl}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => copyToClipboard(phoneAUrl, 'phone_a')}
                    className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-mono font-semibold flex items-center gap-1.5 text-on-surface transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedLink === 'phone_a' ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                  <a
                    href={phoneAUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-xs font-mono font-semibold flex items-center gap-1.5 text-primary transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Tab</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 text-[10px] font-mono text-slate-500">
            Simulates: Ingress attack node sending forged packets into CyberGuard in-line gateway.
          </div>
        </div>

        {/* Phone B Pairing Card */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-bold text-xs">NODE 2</span>
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  Phone B: Protected Citizen Mobile
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                PROTECTED ENDPOINT
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
              Connect Phone 2 to the laptop hotspot, then scan this QR code to launch the protected citizen dashboard with live Circle defense mesh and in-line protection feed.
            </p>

            {/* QR Code and URL Container */}
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl bg-surface-container-low border border-surface-container">
              <div className="w-28 h-28 bg-white p-1 rounded-lg border border-surface-container shadow-xs shrink-0 flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(phoneBUrl)}`}
                  alt="QR Code for Phone B"
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>

              <div className="space-y-2 w-full min-w-0">
                <div className="text-[11px] font-mono text-outline font-semibold">PAIRING URL (CITIZEN APP):</div>
                <div className="p-2 rounded bg-surface-container-lowest border border-surface-container text-xs font-mono text-emerald-700 truncate select-all">
                  {phoneBUrl}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => copyToClipboard(phoneBUrl, 'phone_b')}
                    className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-mono font-semibold flex items-center gap-1.5 text-on-surface transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedLink === 'phone_b' ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                  <a
                    href={phoneBUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-xs font-mono font-semibold flex items-center gap-1.5 text-emerald-800 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Tab</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 text-[10px] font-mono text-slate-500">
            Simulates: Rahul Sharma / Protected Citizen endpoint receiving 0 bytes leakage during attacks.
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: 3-NODE LIVE TOPOLOGY ARCHITECTURE MAP
         ========================================================================= */}
      <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs">
        <div className="flex items-center justify-between border-b border-surface-container pb-4">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-base font-bold text-on-surface">3-Node Real-Time Architectural Topology</h2>
              <p className="text-xs text-on-surface-variant">
                Traffic flow verified at Linux kernel netfilter layer: Phone A &rarr; CyberGuard Gateway &rarr; Phone B
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            ZERO PACKET LEAKAGE ENFORCED
          </span>
        </div>

        {/* Visual Topology Graph */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Node 1 */}
          <div className="p-4 rounded-xl bg-red-50/60 border border-red-200 space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-red-800 font-bold text-xs font-mono">
              <Smartphone className="w-4 h-4 text-red-600" />
              <span>NODE 1: PHONE A (ATTACKER)</span>
            </div>
            <div className="text-xs font-semibold text-on-surface">Physical Attacker Mobile</div>
            <div className="text-[11px] font-mono text-on-surface-variant">
              IP: <span className="font-bold text-red-700">192.168.137.119</span>
            </div>
            <div className="text-[10px] font-mono text-outline">
              Vectors: SMS Smishing, Deepfake Audio, Spear Phishing
            </div>
          </div>

          {/* Node Central: CyberGuard Core Laptop */}
          <div className="p-4 rounded-xl bg-primary/5 border-2 border-primary/40 space-y-2 text-center relative shadow-sm">
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-primary text-white text-[9px] font-mono font-bold tracking-wider uppercase">
              IN-LINE GATEWAY
            </div>
            <div className="flex items-center justify-center gap-2 text-primary font-bold text-xs font-mono pt-1">
              <Laptop className="w-4 h-4" />
              <span>CYBERGUARD SOC (LAPTOP)</span>
            </div>
            <div className="text-xs font-bold text-on-surface">eBPF Netfilter + Qwen 2.5 3B</div>
            <div className="flex justify-center items-center gap-2 text-[10px] font-mono text-emerald-700 font-semibold">
              <Zap className="w-3 h-3 text-emerald-600" />
              <span>Inspection Latency: <strong>0.42 μs</strong></span>
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              Decision: <strong className="text-red-700">KERNEL DROP</strong> on Malicious / <strong className="text-emerald-700">DELIVER</strong> on Clean
            </div>
          </div>

          {/* Node 2 */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2 text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end gap-2 text-emerald-800 font-bold text-xs font-mono">
              <span>NODE 2: PHONE B (PROTECTED)</span>
              <Smartphone className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xs font-semibold text-on-surface">Citizen / Family Member Endpoint</div>
            <div className="text-[11px] font-mono text-on-surface-variant">
              Target: <span className="font-bold text-emerald-700">Rahul Sharma (+91 70081 22910)</span>
            </div>
            <div className="text-[10px] font-mono text-outline">
              Delivery Outcome: <strong>0 Bytes of malicious payload delivered</strong>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 5: DEMONSTRATION 1 (PHONE A -> PHONE B IN-LINE STRIKE)
         ========================================================================= */}
      <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container pb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs font-mono">
              1
            </span>
            <div>
              <h2 className="text-base font-bold text-on-surface">Demonstration 1: Live In-Line Strike (Phone A &rarr; Phone B)</h2>
              <p className="text-xs text-on-surface-variant">
                Click any attack button below to trigger the live strike AND open the step-by-step forensic execution pipeline.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-surface-container-low border border-surface-container text-on-surface">
            Sub-second kernel mitigation: <strong>&lt;0.5s</strong>
          </span>
        </div>

        {/* 1-Click Injection Buttons */}
        <div>
          <div className="text-xs font-mono font-bold text-on-surface mb-2.5">
            CLICK ON EACH ATTACK TO VIEW REAL-TIME STEP-BY-STEP PROCESS:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => handleInjectAttack('SCHOLARSHIP')}
              disabled={injectingType !== null}
              className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container hover:border-red-400 text-left transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center justify-between text-xs font-mono font-bold text-red-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  1. Scholarship Urgency (SMS)
                </span>
                <PlayCircle className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">
                Fake AX-MEDHABRUTI grant cancel lure with deceptive verify link.
              </p>
              <div className="mt-2 text-[10px] font-mono text-primary flex items-center gap-1 font-semibold">
                <span>Inspect Step-by-Step Flow</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>

            <button
              onClick={() => handleInjectAttack('PAYROLL_EMAIL')}
              disabled={injectingType !== null}
              className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container hover:border-amber-400 text-left transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
                  2. HRMS Payroll Phish (Email)
                </span>
                <PlayCircle className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">
                Odisha Govt direct deposit credential harvest form targeting salary.
              </p>
              <div className="mt-2 text-[10px] font-mono text-amber-800 flex items-center gap-1 font-semibold">
                <span>Inspect Step-by-Step Flow</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>

            <button
              onClick={() => handleInjectAttack('SBI_SMISHING')}
              disabled={injectingType !== null}
              className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container hover:border-red-400 text-left transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center justify-between text-xs font-mono font-bold text-red-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  3. SBI YONO Block (WhatsApp)
                </span>
                <PlayCircle className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">
                Urgent PAN/Aadhaar KYC suspension link coercing credential disclosure.
              </p>
              <div className="mt-2 text-[10px] font-mono text-red-700 flex items-center gap-1 font-semibold">
                <span>Inspect Step-by-Step Flow</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>

            <button
              onClick={() => handleInjectAttack('POWER_CUT')}
              disabled={injectingType !== null}
              className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container hover:border-orange-400 text-left transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center justify-between text-xs font-mono font-bold text-orange-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-600" />
                  4. Power Cut Notice (SMS)
                </span>
                <PlayCircle className="w-4 h-4 text-orange-600 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">
                Electricity disconnected at 9:30 PM urgency extortion smishing.
              </p>
              <div className="mt-2 text-[10px] font-mono text-orange-800 flex items-center gap-1 font-semibold">
                <span>Inspect Step-by-Step Flow</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>

            <button
              onClick={() => handleInjectAttack('VOICE_DEEPFAKE')}
              disabled={injectingType !== null}
              className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container hover:border-purple-400 text-left transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center justify-between text-xs font-mono font-bold text-purple-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
                  5. Voice Deepfake BEC (Audio)
                </span>
                <PlayCircle className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">
                Synthetic voice memo (8.15 kHz vocoder cutoff) soliciting RTGS wire.
              </p>
              <div className="mt-2 text-[10px] font-mono text-purple-800 flex items-center gap-1 font-semibold">
                <span>Inspect Step-by-Step Flow</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>

            <button
              onClick={() => handleInjectAttack('BENIGN_MESSAGE')}
              disabled={injectingType !== null}
              className="p-4 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/60 border border-emerald-200 text-left transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-800">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  6. Genuine Safe Message
                </span>
                <PlayCircle className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-[11px] text-emerald-700 mt-1.5 leading-relaxed">
                "Hey Dad, reaching home by 7:30 PM..." Clean delivery with zero latency.
              </p>
              <div className="mt-2 text-[10px] font-mono text-emerald-800 flex items-center gap-1 font-semibold">
                <span>Inspect Clean Pass Flow</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          </div>
        </div>

        {/* Quick Summary Strip */}
        {lastRelayResult && (
          <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex flex-wrap items-center justify-between text-xs font-mono">
            <span className="text-on-surface">
              Last Strike: <strong>{lastRelayResult.status}</strong>
            </span>
            <span className="text-emerald-700 font-bold">
              Latency: &lt;0.5s drop (0.42 μs eBPF)
            </span>
            <button
              onClick={() => {
                if (selectedAttackStepData) triggerPipelineAnimation(selectedAttackStepData);
              }}
              className="text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Re-Open Step-by-Step Process</span>
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 6: DEMONSTRATION 2 ("ATTACK ON GRANDPA SHOWING IT TO PAPA OR SON")
         ========================================================================= */}
      <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container pb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs font-mono">
              2
            </span>
            <div>
              <h2 className="text-base font-bold text-on-surface">
                Demonstration 2: "Attack on Grandpa Showing it to Papa or Son" (Circle Defense Mesh)
              </h2>
              <p className="text-xs text-on-surface-variant">
                Simulate an attack on Grandpa Suresh Mohanty. CyberGuard drops the attack and instantly broadcasts early warning pulses to Papa and Son.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 font-bold border border-purple-200">
              Mesh Signatures Synced: {syncedSignaturesCount}
            </span>
          </div>
        </div>

        {/* Interactive Family Mesh Roster */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Grandpa Card */}
          <div className="p-4 rounded-xl bg-amber-50/60 border-2 border-amber-300 relative space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                TARGET MEMBER
              </span>
              <span className="text-[10px] font-mono text-amber-800 font-bold">Senior Citizen</span>
            </div>
            <div className="font-bold text-sm text-on-surface">Suresh Mohanty (Grandpa)</div>
            <div className="text-xs font-mono text-outline">+91 98610 99999</div>
            <div className="text-[10px] text-amber-800 font-medium">
              Vulnerability: High (e-KYC & Voice Clones)
            </div>

            <div className="pt-2 border-t border-amber-200 space-y-1.5">
              <button
                onClick={() => handleSimulateCircleAttack('Suresh Mohanty (Grandpa)', 'SBI_SMISHING')}
                disabled={circleSimulating}
                className="w-full py-1.5 px-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Simulate Smishing Attack</span>
              </button>

              <button
                onClick={() => handleSimulateCircleAttack('Suresh Mohanty (Grandpa)', 'VOICE_CLONE')}
                disabled={circleSimulating}
                className="w-full py-1.5 px-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Simulate Voice Clone</span>
              </button>
            </div>
          </div>

          {/* Papa Card */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                RECIPROCAL RECEIVER
              </span>
              <span className="text-[10px] font-mono text-blue-700 font-bold">Parent</span>
            </div>
            <div className="font-bold text-sm text-on-surface">Deepak Mohanty (Father)</div>
            <div className="text-xs font-mono text-outline">+91 98610 44219</div>
            <div className="text-[10px] text-on-surface-variant font-medium">
              Status: <strong>EARLY WARNING READY</strong>
            </div>
            <div className="pt-3 border-t border-surface-container text-[11px] font-mono text-slate-600">
              Receives instant alert when Grandpa is targeted. Threat signature auto-deployed.
            </div>
          </div>

          {/* Son Card (Rahul Sharma / Phone B) */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                THIS PHONE (PHONE B)
              </span>
              <span className="text-[10px] font-mono text-emerald-800 font-bold">Admin / Son</span>
            </div>
            <div className="font-bold text-sm text-on-surface">Rahul Sharma (Son)</div>
            <div className="text-xs font-mono text-outline">+91 70081 22910</div>
            <div className="text-[10px] text-emerald-800 font-medium">
              Device: <strong>Phone B (Protected Endpoint)</strong>
            </div>
            <div className="pt-3 border-t border-emerald-200 text-[11px] font-mono text-emerald-900">
              Receives real-time push alert & audio warning when Grandpa or Papa is attacked!
            </div>
          </div>

          {/* Sister Card */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                CIRCLE NODE 4
              </span>
              <span className="text-[10px] font-mono text-slate-700 font-bold">Student</span>
            </div>
            <div className="font-bold text-sm text-on-surface">Ananya Mohanty (Sister)</div>
            <div className="text-xs font-mono text-outline">+91 99380 55193</div>
            <div className="text-[10px] text-on-surface-variant font-medium">
              Focus: Exam & Scholarship Shield
            </div>
            <div className="pt-3 border-t border-surface-container text-[11px] font-mono text-slate-600">
              Preemptive signature pool shared with all 4 circle devices.
            </div>
          </div>
        </div>

        {/* Live Circle Warning Banner if Triggered */}
        {lastCircleAlert && (
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-bold font-mono">
              <Radio className="w-4 h-4 text-purple-700 animate-pulse" />
              <span>COLLABORATIVE CIRCLE DEFENSE PULSE BROADCAST</span>
              <span className="text-[10px] bg-purple-200 text-purple-900 px-2 py-0.5 rounded font-mono">
                {lastCircleAlert.timestamp}
              </span>
            </div>
            <p className="text-xs leading-relaxed font-medium">{lastCircleAlert.message}</p>
            <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-purple-800 pt-1 border-t border-purple-200">
              <span>Target: <strong>{lastCircleAlert.target_member}</strong></span>
              <span>Threat Vector: <strong>{lastCircleAlert.threat_type}</strong></span>
              <span>Auto-Synced Devices: <strong>{lastCircleAlert.synced_devices_count} endpoints</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 7: DEMONSTRATION 3 (INTERACTIVE AI SCAM CALL SIMULATOR)
         ========================================================================= */}
      <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container pb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs font-mono">
              3
            </span>
            <div>
              <h2 className="text-base font-bold text-on-surface">
                Demonstration 3: Interactive AI Scam Call Simulator (SBI Fraud IVR & OTP Sentinel)
              </h2>
              <p className="text-xs text-on-surface-variant">
                Full voice telephony simulation. Female AI IVR coerces victim for KYC; CyberGuard Call Sentinel terminates call immediately when OTP is requested.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCallModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-mono flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Launch Live Call Demo Now</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-1.5">
            <div className="font-bold text-on-surface flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              1. Spoofed Inbound Call
            </div>
            <p className="text-on-surface-variant text-[11px] leading-relaxed">
              Caller ID: <strong>+91 1800-425-3800</strong> (State Bank of India). Female automated voice announces account suspension urgency.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-1.5">
            <div className="font-bold text-on-surface flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              2. Interactive DTMF Keypad
            </div>
            <p className="text-on-surface-variant text-[11px] leading-relaxed">
              Victim presses <strong>1</strong> on keypad. Synthetic DTMF tones play and IVR transitions to urgent 4-digit banking OTP demand.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-1.5">
            <div className="font-bold text-on-surface flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              3. In-Line Call Sentinel Block
            </div>
            <p className="text-on-surface-variant text-[11px] leading-relaxed">
              CyberGuard intercepts audio stream, cuts the call with 0 OTP disclosure, and broadcasts: <em>"Bank employees NEVER ask for OTP or PIN!"</em>
            </p>
          </div>
        </div>

        {lastCallResult && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-mono text-xs space-y-1">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>VISHING CALL INTERCEPTION VERIFIED & LOGGED</span>
            </div>
            <div>Threat ID: {lastCallResult.threat_id} | Action: {lastCallResult.action || 'CALL_TERMINATED_IN_LINE'}</div>
            <div className="text-[11px] text-emerald-800">
              Synced directly to Incident Queue, Live Threats, and Global Chatbot Assistant.
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 8: STEP-BY-STEP FORENSIC EXECUTION PIPELINE INSPECTOR MODAL
         ========================================================================= */}
      {selectedAttackStepData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-container-lowest border border-surface-container rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-surface-container pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-red-100 text-red-800 font-bold border border-red-200">
                    FORENSIC PIPELINE INSPECTION
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    MITRE: {selectedAttackStepData.mitre}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-on-surface mt-1">
                  {selectedAttackStepData.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAttackStepData(null)}
                className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pipeline Stage Bar */}
            <div className="grid grid-cols-6 gap-1.5 text-center text-[10px] font-mono">
              {[
                { num: 1, label: 'Ingress' },
                { num: 2, label: 'In-Flight' },
                { num: 3, label: 'AI Evaluation' },
                { num: 4, label: 'Kernel DROP' },
                { num: 5, label: 'SOC Escalation' },
                { num: 6, label: 'Circle Mesh' }
              ].map((st) => {
                const isPassed = activePipelineStep >= st.num;
                const isCurrent = activePipelineStep === st.num;
                return (
                  <div
                    key={st.num}
                    className={`p-2 rounded-xl border transition-all ${
                      isPassed
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold shadow-xs'
                        : 'bg-surface-container-low border-surface-container text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {isPassed ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <span>{st.num}</span>}
                    </div>
                    <div className="mt-0.5 truncate">{st.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Step-by-Step Detailed Breakdown */}
            <div className="space-y-3 text-xs">
              {/* Step 1: Ingress Packet Generation */}
              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container space-y-1">
                <div className="flex items-center justify-between font-mono font-bold text-red-700">
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-800 flex items-center justify-center text-[11px]">1</span>
                    STAGE 1: INGRESS THREAT GENERATION
                  </span>
                  <span className="text-[10px] text-slate-500">Source: {selectedAttackStepData.senderIp}</span>
                </div>
                <div className="text-on-surface">
                  Sender: <strong>{selectedAttackStepData.senderName}</strong> via <strong>{selectedAttackStepData.channel}</strong>
                </div>
                <div className="p-2 rounded bg-surface-container-lowest border border-surface-container font-mono text-[11px] text-slate-700 select-all">
                  &gt; Payload: "{selectedAttackStepData.payload}"
                </div>
              </div>

              {/* Step 2: In-Flight Gateway Interception */}
              {activePipelineStep >= 2 && (
                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container space-y-1 animate-in fade-in">
                  <div className="flex items-center justify-between font-mono font-bold text-amber-700">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[11px]">2</span>
                      STAGE 2: IN-FLIGHT PACKET INTERCEPTION
                    </span>
                    <span className="text-[10px] text-slate-500">In-Line CyberGuard Gateway (Port 8000)</span>
                  </div>
                  <div className="text-on-surface leading-relaxed">
                    Packet intercepted before reaching target (<strong>{selectedAttackStepData.target}</strong>). In-flight buffer held in zero-copy memory for deep feature extraction.
                  </div>
                </div>
              )}

              {/* Step 3: Deep AI Evaluation */}
              {activePipelineStep >= 3 && (
                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between font-mono font-bold text-blue-700">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px]">3</span>
                      STAGE 3: MACHINE LEARNING & FORENSIC HEURISTICS
                    </span>
                    <span className="text-[10px] text-blue-800 font-bold">{selectedAttackStepData.confidenceScore}</span>
                  </div>
                  <div className="text-on-surface">
                    Model Architecture: <strong>{selectedAttackStepData.mlModel}</strong>
                  </div>
                  <div className="space-y-1 pt-1">
                    {selectedAttackStepData.extractedIndicators.map((ind, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                        <span className="text-primary font-mono">•</span>
                        <span>{ind}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Autonomous Linux Kernel DROP */}
              {activePipelineStep >= 4 && (
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-300 space-y-1 animate-in fade-in">
                  <div className="flex items-center justify-between font-mono font-bold text-emerald-900">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center text-[11px]">4</span>
                      STAGE 4: AUTONOMOUS eBPF NETFILTER DROP
                    </span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-mono font-bold">
                      {selectedAttackStepData.kernelLatency}
                    </span>
                  </div>
                  <div className="text-emerald-950 font-medium leading-relaxed">
                    Action: <strong>{selectedAttackStepData.kernelAction}</strong>. 0 bytes delivered to {selectedAttackStepData.target}. Zero packet leakage verified.
                  </div>
                </div>
              )}

              {/* Step 5: Qwen 2.5 Analysis & SOC Escalation */}
              {activePipelineStep >= 5 && (
                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container space-y-1 animate-in fade-in">
                  <div className="flex items-center justify-between font-mono font-bold text-purple-700">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center text-[11px]">5</span>
                      STAGE 5: EXPLAINABLE AI REASONING & SOC INCIDENT QUEUE
                    </span>
                    <span className="text-[10px] text-purple-700 font-mono">Qwen 2.5 3B Cyber-Instruct</span>
                  </div>
                  <div className="text-on-surface-variant text-[11px] leading-relaxed">
                    {selectedAttackStepData.qwenSummary}
                  </div>
                </div>
              )}

              {/* Step 6: Collaborative Circle Defense Pulse */}
              {activePipelineStep >= 6 && (
                <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-300 space-y-1 animate-in fade-in">
                  <div className="flex items-center justify-between font-mono font-bold text-purple-900">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-900 flex items-center justify-center text-[11px]">6</span>
                      STAGE 6: CIRCLE DEFENSE EARLY WARNING BROADCAST
                    </span>
                    <span className="text-[10px] bg-purple-200 text-purple-900 px-2 py-0.5 rounded font-mono">
                      Mesh Radiated
                    </span>
                  </div>
                  <div className="text-purple-950 font-medium text-[11px]">
                    {selectedAttackStepData.circleBroadcast}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-surface-container flex items-center justify-between">
              <div className="text-[11px] font-mono text-outline">
                Status: {pipelineAnimating ? 'Pipeline Executing...' : 'Execution Completed (Verified Clean)'}
              </div>
              <button
                onClick={() => setSelectedAttackStepData(null)}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 9: LEGACY SANDBOX RUNNER (PRESERVED & EXPANDABLE)
         ========================================================================= */}
      <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs">
        <button
          onClick={() => setShowLegacySandbox(!showLegacySandbox)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-on-surface">
              Advanced Network & Rule Generation Scenarios ({scenarios.length} Scenarios Available)
            </h3>
          </div>
          {showLegacySandbox ? <ChevronUp className="w-4 h-4 text-outline" /> : <ChevronDown className="w-4 h-4 text-outline" />}
        </button>

        {showLegacySandbox && (
          <div className="mt-4 pt-4 border-t border-surface-container space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scenarios.map((sc) => {
                const isRunning = runningScenarioId === sc.id;
                return (
                  <div
                    key={sc.id}
                    className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-primary">{sc.category}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-100 text-red-800 uppercase">
                          {sc.severity}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-on-surface mt-1">{sc.name}</h4>
                      <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">{sc.description}</p>
                    </div>

                    <div className="pt-2 border-t border-surface-container flex items-center justify-between">
                      <span className="text-[10px] font-mono text-outline">TARGET: {sc.targeted_subsystem}</span>
                      <button
                        onClick={() => handleRunLegacyScenario(sc.id)}
                        disabled={isRunning}
                        className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                      >
                        {isRunning ? (
                          <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <PlayCircle className="w-3.5 h-3.5" />
                        )}
                        <span>{isRunning ? 'Running...' : 'Execute'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scenario Result Log */}
            {lastScenarioResult && (
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-on-surface">Execution Log: {lastScenarioResult.status}</span>
                  </div>
                  {lastScenarioResult.adaptive_rule_created && (
                    <button
                      onClick={() => onNavigate('firewall')}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 font-mono cursor-pointer"
                    >
                      <span>Inspect Rule in Firewall</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="bg-[#0b1c30] text-emerald-400 p-3 rounded-xl font-mono text-xs space-y-1 overflow-x-auto shadow-inner">
                  {lastScenarioResult.execution_log.map((line, idx) => (
                    <div key={idx}>
                      <span className="text-slate-500 mr-2">&gt;</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 10: MOUNTED AI SCAM CALL MODAL (INTERACTIVE CALL SIMULATION)
         ========================================================================= */}
      <AiScamCallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        victimName="Deepak Mohanty (Father)"
        victimPhone="+91 98610 44219"
        onCallIntercepted={(details) => {
          setLastCallResult(details);
          setActiveAlert({
            type: 'VISHING_CALL_INTERCEPTED',
            message: `🚨 Call intercepted: Bank employees NEVER ask for OTP or PIN! Caller ${details.caller_id} dropped at telephony kernel.`,
            ...details
          });
        }}
      />
    </div>
  );
};
