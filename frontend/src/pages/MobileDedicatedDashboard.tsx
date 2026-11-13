import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Zap,
  Radio,
  Search,
  Bell,
  CheckCircle2,
  Lock,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Flame,
  Activity,
  Wifi,
  Sparkles,
  Smartphone,
  RefreshCw,
  QrCode,
  FileCheck,
  Sun,
  Moon,
  Users,
  UserPlus,
  PhoneCall,
  MessageSquare,
  Share2,
  Trash2,
  Plus,
  AlertCircle,
  X,
  CheckCheck,
  PhoneIncoming,
  Fingerprint,
  MapPin
} from 'lucide-react';
import { AiScamCallModal } from '../components/demo/AiScamCallModal';
import { CommonAttacksPage } from './CommonAttacksPage';

interface MobileDashboardProps {
  onNavigate: (route: string) => void;
  onOpenDemo?: () => void;
}

export const MobileDedicatedDashboard: React.FC<MobileDashboardProps> = ({
  onNavigate,
  onOpenDemo
}) => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('cyberguard_mobile_theme') as 'light' | 'dark') || 'light';
  });
  const [gaugeStyle, setGaugeStyle] = useState<'arch' | 'circle'>('arch');
  const [activeTab, setActiveTab] = useState<'SHIELD' | 'CHECK_LINK' | 'CIRCLE' | 'COMMON_ATTACKS' | 'IDENTITY_SCAM' | 'MENTOR'>('SHIELD');
  const [linkInput, setLinkInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [autoRate, setAutoRate] = useState(92.4);
  const [recentThreats, setRecentThreats] = useState<any[]>([]);

  // Geofence & Identity Check Stolen Device Protection (User Upload Feature)
  const [isTrustedPlace, setIsTrustedPlace] = useState<boolean>(true);
  const [trustedWifiSsid, setTrustedWifiSsid] = useState<string>('OKCL_Office_Secure_5G');
  const [identityCheckActive, setIdentityCheckActive] = useState<boolean>(true);
  const [syntheticVoiceEnabled, setSyntheticVoiceEnabled] = useState<boolean>(true);
  const [crossAppScamEnabled, setCrossAppScamEnabled] = useState<boolean>(true);
  const [biometricModalOpen, setBiometricModalOpen] = useState<boolean>(false);
  const [biometricVerificationResult, setBiometricVerificationResult] = useState<'SUCCESS' | 'FAILED' | 'CHALLENGE_ACTIVE' | null>(null);
  const [biometricScanningAnim, setBiometricScanningAnim] = useState<boolean>(false);

  // 3-Slide Cyber Awareness Picture Carousel State
  const [awarenessSlideIndex, setAwarenessSlideIndex] = useState(0);
  const [pwaAlertToast, setPwaAlertToast] = useState<string | null>(null);

  // Circle Defense State
  const [circleMembers, setCircleMembers] = useState<any[]>([]);
  const [circleAlerts, setCircleAlerts] = useState<any[]>([]);
  const [activeCircleAlert, setActiveCircleAlert] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelationship, setNewRelationship] = useState('Parent / Senior Citizen');
  const [newRiskTier, setNewRiskTier] = useState('High Risk: Auto-Drop Voice Clones & e-KYC');
  const [simulating, setSimulating] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [circleStats, setCircleStats] = useState({ totalProtected: 4, neutralized: 18, signatures: 142 });

  const getBackendUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'http://127.0.0.1:8000';
  };

  const getWsUrl = () => {
    if (typeof window !== 'undefined') {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${proto}//${window.location.host}/api/v1/ws`;
    }
    return 'ws://127.0.0.1:8000/api/v1/ws';
  };

  const fetchCircleData = async () => {
    try {
      const res = await fetch(`${getBackendUrl()}/api/v1/circle/members`);
      const data = await res.json();
      if (data.members) {
        setCircleMembers(data.members);
        setCircleStats({
          totalProtected: data.total_protected || data.members.length,
          neutralized: data.total_attacks_neutralized || 18,
          signatures: data.synced_signatures_count || 142
        });
      }

      const alertRes = await fetch(`${getBackendUrl()}/api/v1/circle/alerts`);
      const alertData = await alertRes.json();
      if (alertData.alerts) {
        setCircleAlerts(alertData.alerts);
      }
    } catch (e) {
      console.debug('Circle fetch error:', e);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    try {
      const res = await fetch(`${getBackendUrl()}/api/v1/circle/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          phone: newPhone.trim(),
          relationship: newRelationship,
          risk_tier: newRiskTier
        })
      });
      const data = await res.json();
      if (data.member) {
        setCircleMembers((prev) => [...prev, data.member]);
        setIsAddModalOpen(false);
        setNewName('');
        setNewPhone('');
      }
    } catch (err: any) {
      alert(`Failed to add circle member: ${err.message}`);
    }
  };

  const handleRemoveMember = async (id: string) => {
    if (!confirm('Remove contact from your Circle Defense mesh?')) return;
    try {
      await fetch(`${getBackendUrl()}/api/v1/circle/remove/${id}`, { method: 'DELETE' });
      setCircleMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      // quiet
    }
  };

  const playVoiceAlert = (text: string) => {
    try {
      const audio = new Audio(`${getBackendUrl()}/api/v1/tts/synthesize?text=${encodeURIComponent(text)}&voice=google-in`);
      audio.playbackRate = 1.15;
      audio.play().catch(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const u = new SpeechSynthesisUtterance(text);
          u.lang = 'en-IN';
          u.rate = 1.15;
          window.speechSynthesis.speak(u);
        }
      });
    } catch (e) {}
  };

  const handleSimulateCircleAttack = async (targetName: string, attackType: string) => {
    setSimulating(true);
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
      if (data.alert) {
        setActiveCircleAlert(data.alert);
        setCircleAlerts((prev) => [data.alert, ...prev]);
        setCircleStats((s) => ({ ...s, neutralized: s.neutralized + 1 }));
        playVoiceAlert(`Warning: CyberGuard early warning alert received. Attack targeting ${data.alert.target_member} was intercepted.`);
      }
    } catch (err: any) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  useEffect(() => {
    fetchCircleData();
    const interval = setInterval(fetchCircleData, 5000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket Live Listener for Collaborative Circle Early Warnings
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWs = () => {
      try {
        ws = new WebSocket(getWsUrl());
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'CIRCLE_EARLY_WARNING') {
              setActiveCircleAlert(data);
              setCircleAlerts((prev) => [data, ...prev]);
              setCircleStats((s) => ({ ...s, neutralized: s.neutralized + 1 }));
              playVoiceAlert(`Warning: CyberGuard early warning alert received. Attack targeting ${data.target_member || 'circle member'} was intercepted. Preemptive defense signature synchronized.`);
            } else if (data.type === 'INLINE_ATTACK_INTERCEPTED') {
              const threatTitle = data.threat?.threat_type || 'Malicious Payload';
              const inlineAlert = {
                id: `inline-${Date.now()}`,
                type: 'CIRCLE_EARLY_WARNING',
                target_member: 'Suresh Mohanty (Grandpa)',
                source_device: data.sender_id || 'Phone A',
                threat_type: threatTitle,
                message: `🛡️ IN-LINE ATTACK INTERCEPTED: ${threatTitle.replace(/_/g, ' ')} targeting Phone B dropped in 0.42 μs eBPF with zero packet leakage!`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                severity: 'CRITICAL',
                qwen_reasoning: data.qwen_reasoning
              };
              setActiveCircleAlert(inlineAlert);
              setCircleAlerts((prev) => [inlineAlert, ...prev]);
              setCircleStats((s) => ({ ...s, neutralized: s.neutralized + 1 }));
              playVoiceAlert(`Alert: CyberGuard intercepted malicious in-line attack targeting your phone. Packet dropped with zero leakage.`);
            } else if (data.type === 'TRIGGER_REMOTE_SCAM_CALL') {
              setIsCallModalOpen(true);
            } else if (data.type === 'VISHING_CALL_INTERCEPTED') {
              setIsCallModalOpen(false);
              fetchCircleData();
            } else if (data.type === 'INLINE_ATTACK_INTERCEPTED') {
              const threatTitle = data.threat?.threat_type || 'Malicious Payload';
              const inlineAlert = {
                id: `inline-${Date.now()}`,
                type: 'CIRCLE_EARLY_WARNING',
                target_member: 'Suresh Mohanty (Grandpa)',
                source_device: data.sender_id || 'Phone A',
                threat_type: threatTitle,
                message: `🛡️ IN-LINE ATTACK INTERCEPTED: ${threatTitle.replace(/_/g, ' ')} targeting Phone B dropped in 0.42 μs eBPF with zero packet leakage!`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                severity: 'CRITICAL',
                qwen_reasoning: data.qwen_reasoning
              };
              setActiveCircleAlert(inlineAlert);
              setCircleAlerts((prev) => [inlineAlert, ...prev]);
              setCircleStats((s) => ({ ...s, neutralized: s.neutralized + 1 }));
            } else if (data.type === 'TRIGGER_REMOTE_SCAM_CALL') {
              setIsCallModalOpen(true);
            } else if (data.type === 'VISHING_CALL_INTERCEPTED') {
              setIsCallModalOpen(false);
              fetchCircleData();
            } else if (data.type === 'CIRCLE_MEMBER_ADDED' && data.member) {
              setCircleMembers((prev) => {
                if (prev.some((m) => m.id === data.member.id)) return prev;
                return [...prev, data.member];
              });
            }
          } catch (err) {
            console.debug('WS parse err:', err);
          }
        };

        ws.onclose = () => {
          reconnectTimeout = setTimeout(connectWs, 3000);
        };
      } catch (e) {
        reconnectTimeout = setTimeout(connectWs, 4000);
      }
    };

    connectWs();
    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('cyberguard_mobile_theme', themeMode);
    window.dispatchEvent(new Event('cyberguard_theme_changed'));
  }, [themeMode]);

  useEffect(() => {
    const fetchLiveThreats = async () => {
      try {
        const data = await api.getLiveThreats();
        setRecentThreats(data.slice(0, 4));
      } catch (e) {
        // quiet
      }
    };
    fetchLiveThreats();
    const interval = setInterval(fetchLiveThreats, 6000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate 3-Slide Cyber Awareness Picture Carousel (every 5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setAwarenessSlideIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // PWA Notification Dispatcher for Cyber Awareness
  const handleTriggerPwaAwareness = (title: string, advice: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          try {
            new Notification(`🛡️ CyberGuard Awareness Alert`, {
              body: `${title}\n${advice}`,
              icon: '/favicon.ico'
            });
          } catch (e) {
            // quiet
          }
        }
      });
    }
    setPwaAlertToast(`🔔 PWA Awareness Alert Dispatched to your device: "${title}"`);
    setTimeout(() => setPwaAlertToast(null), 4500);
  };

  const handleScanLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkInput.trim()) return;
    setScanning(true);
    setScanResult(null);

    try {
      const res = await api.analyzePhishing(linkInput.trim());
      setScanResult(res);
    } catch (err: any) {
      alert(`Scan failed: ${err.message}`);
    } finally {
      setScanning(false);
    }
  };

  const isDark = themeMode === 'dark';

  return (
    <div
      className={`min-h-[85vh] rounded-3xl transition-colors duration-300 font-sans pb-20 overflow-x-hidden border ${
        isDark
          ? 'bg-[#0A0E13] text-white border-white/10 shadow-2xl'
          : 'bg-white text-[#131618] border-[#E5E2D9] shadow-sm'
      }`}
    >
      {/* 1. Mobile Phone Top Notch & Brand Status Bar */}
      <header
        className={`px-4 sm:px-5 pt-4 pb-4 border-b sticky top-0 z-20 backdrop-blur-xl transition-colors ${
          isDark
            ? 'bg-[#0D141C]/90 border-white/10'
            : 'bg-[#FAF9F5]/90 border-[#EAE7DC]'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black shadow-md ${
                isDark
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                  : 'bg-[#E05A1B] text-white'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div
                className={`text-[10px] font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 ${
                  isDark ? 'text-emerald-400' : 'text-[#E05A1B]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? 'bg-emerald-400' : 'bg-[#E05A1B]'}`} />
                <span>eBPF Mobile Shield</span>
              </div>
              <h1 className="text-sm sm:text-base font-black tracking-tight">CyberGuard PhishGuard</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle Button (Light Mode <-> Dark Mode) */}
            <button
              onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
              className={`p-2 rounded-xl border transition-all ${
                isDark
                  ? 'bg-white/10 hover:bg-white/20 border-white/15 text-amber-300'
                  : 'bg-[#F2EFE8] hover:bg-[#EAE6DC] border-[#DCD7C9] text-[#131618]'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-indigo-700" />}
            </button>

            {/* Standalone Red-Team Attacker Console Link */}
            <button
              onClick={() => onNavigate('remote-attack')}
              className="px-2.5 py-1 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-[10px] font-mono font-bold flex items-center gap-1"
              title="Launch Standalone Attacker Portal"
            >
              <span>Attacker</span>
              <Flame className="w-3 h-3 text-rose-500" />
            </button>
          </div>
        </div>

        {/* 6 Mobile Segmented Tabs */}
        <div
          className={`grid grid-cols-6 gap-0.5 mt-3.5 p-1 rounded-2xl border text-[9.5px] sm:text-[11px] font-bold ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-[#F4F3ED] border-[#E2DDD2]'
          }`}
        >
          <button
            onClick={() => setActiveTab('SHIELD')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'SHIELD'
                ? isDark
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-lg font-black'
                  : 'bg-white text-[#131618] shadow-sm font-black'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-[#626870] hover:text-[#131618]'
            }`}
          >
            Shield
          </button>
          <button
            onClick={() => setActiveTab('IDENTITY_SCAM')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-0.5 ${
              activeTab === 'IDENTITY_SCAM'
                ? isDark
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg font-black'
                  : 'bg-white text-[#131618] shadow-sm font-black'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-[#626870] hover:text-[#131618]'
            }`}
          >
            <Fingerprint className="w-3 h-3 text-amber-500" />
            <span>Identity</span>
          </button>
          <button
            onClick={() => setActiveTab('CHECK_LINK')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'CHECK_LINK'
                ? isDark
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-lg font-black'
                  : 'bg-white text-[#131618] shadow-sm font-black'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-[#626870] hover:text-[#131618]'
            }`}
          >
            Scan Link
          </button>
          <button
            onClick={() => setActiveTab('CIRCLE')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-0.5 ${
              activeTab === 'CIRCLE'
                ? isDark
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-lg font-black'
                  : 'bg-white text-[#131618] shadow-sm font-black'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-[#626870] hover:text-[#131618]'
            }`}
          >
            <Users className="w-3 h-3 hidden sm:inline" />
            <span>Circle</span>
          </button>
          <button
            onClick={() => setActiveTab('COMMON_ATTACKS')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-0.5 ${
              activeTab === 'COMMON_ATTACKS'
                ? isDark
                  ? 'bg-gradient-to-r from-red-500 to-amber-500 text-black shadow-lg font-black'
                  : 'bg-white text-[#131618] shadow-sm font-black'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-[#626870] hover:text-[#131618]'
            }`}
          >
            <ShieldAlert className="w-3 h-3 hidden sm:inline text-red-500" />
            <span>10 Attacks</span>
          </button>
          <button
            onClick={() => setActiveTab('MENTOR')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'MENTOR'
                ? isDark
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-lg font-black'
                  : 'bg-white text-[#131618] shadow-sm font-black'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-[#626870] hover:text-[#131618]'
            }`}
          >
            Mentor
          </button>
        </div>
      </header>

      {/* Real-Time Circle Early Warning Banner */}
      {activeCircleAlert && (
        <div className="mx-4 mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-950 via-rose-950 to-slate-900 border-2 border-amber-500 shadow-2xl animate-fluid text-white z-30">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/40">
                <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-amber-300 flex items-center gap-1.5 flex-wrap">
                  <span>⚠️ CIRCLE DEFENSE ALERT: {activeCircleAlert.target_member}</span>
                  <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-amber-400 border border-amber-500/40">
                    {activeCircleAlert.timestamp || 'Now'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-200 mt-0.5 leading-relaxed">
                  {activeCircleAlert.message}
                </p>
                <div className="mt-1 flex items-center gap-2 text-[9.5px] font-mono text-emerald-400">
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PREEMPTIVE SIGNATURE AUTO-SYNCED TO YOUR PHONE (0.42 μs eBPF Drop)</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveCircleAlert(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. TAB 1: SHIELD HOME */}
      {activeTab === 'SHIELD' && (
        <main className="p-4 sm:p-5 space-y-4 sm:space-y-5 animate-in fade-in duration-200">
          {/* Toast Notification when PWA Alert Dispatched */}
          {pwaAlertToast && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-mono text-xs flex items-center justify-between animate-in fade-in shadow-xl">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-500 animate-bounce" />
                <span className="font-semibold">{pwaAlertToast}</span>
              </div>
              <button onClick={() => setPwaAlertToast(null)} className="font-bold text-emerald-700 cursor-pointer">
                ✕
              </button>
            </div>
          )}

          {/* 3-SLIDE CYBER AWARENESS PICTURE CAROUSEL (Live Campaigns & PWA Alerts) */}
          <div
            className={`rounded-3xl border overflow-hidden transition-all shadow-md ${
              isDark ? 'bg-[#111A24] border-white/10' : 'bg-white border-[#E5E2D9]'
            }`}
          >
            {/* Carousel Header */}
            <div className={`px-4 py-3 border-b flex items-center justify-between ${
              isDark ? 'border-white/10 bg-white/5' : 'border-[#EAE7DC] bg-[#FAF9F5]'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">
                  Live Cyber Threat Awareness
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Dot Indicators */}
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((idx) => (
                    <button
                      key={idx}
                      onClick={() => setAwarenessSlideIndex(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        awarenessSlideIndex === idx
                          ? 'w-5 bg-primary'
                          : isDark
                          ? 'w-1.5 bg-white/20'
                          : 'w-1.5 bg-slate-300'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1 pl-1">
                  <button
                    onClick={() => setAwarenessSlideIndex((prev) => (prev === 0 ? 2 : prev - 1))}
                    className="p-1 rounded-lg hover:bg-surface-container text-on-surface cursor-pointer"
                    title="Previous Slide"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setAwarenessSlideIndex((prev) => (prev + 1) % 3)}
                    className="p-1 rounded-lg hover:bg-surface-container text-on-surface cursor-pointer"
                    title="Next Slide"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Slide Body */}
            {awarenessSlideIndex === 0 && (
              <div className="animate-in fade-in duration-300">
                <div className="relative h-44 sm:h-52 w-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80"
                    alt="SBI KYC Phishing Alert"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-rose-600 w-fit uppercase tracking-wider mb-1">
                      ACTIVE THREAT WAVE #01 • BANKING SMISHING
                    </span>
                    <h3 className="text-base font-black leading-tight drop-shadow-md">
                      Mass Campaign: SBI & Banking e-KYC Freeze Scam
                    </h3>
                    <p className="text-[11px] text-slate-200 mt-1 line-clamp-2 leading-relaxed">
                      Over 42,000 citizens targeted with urgent text messages claiming PAN-Aadhaar freeze and account block.
                    </p>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 text-xs">
                    <strong className="block font-mono text-[10.5px] text-amber-900 dark:text-amber-300 uppercase tracking-wide">
                      🛡️ Golden Awareness Rule:
                    </strong>
                    <span className="mt-0.5 block leading-relaxed font-semibold">
                      Official Banks NEVER send suspension links via SMS or WhatsApp. Legitimate KYC is only updated inside the official bank app or at the physical branch.
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() =>
                        handleTriggerPwaAwareness(
                          'Mass Campaign: SBI & Banking e-KYC Freeze Scam',
                          'Official Banks NEVER send suspension links via SMS or WhatsApp! Never click sbi-kyc-auth links.'
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 text-xs font-mono font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
                      title="Send Live Push Notification to PWA"
                    >
                      <Bell className="w-3.5 h-3.5 animate-bounce text-primary" />
                      <span>Push PWA Alert</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('COMMON_ATTACKS')}
                      className="text-xs font-mono font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>10 Attacks Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {awarenessSlideIndex === 1 && (
              <div className="animate-in fade-in duration-300">
                <div className="relative h-44 sm:h-52 w-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80"
                    alt="AI Voice Clone and Digital Arrest"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-purple-600 w-fit uppercase tracking-wider mb-1">
                      EMERGING THREAT #02 • AI VOICE DEEPFAKE
                    </span>
                    <h3 className="text-base font-black leading-tight drop-shadow-md">
                      AI Voice Clone & "Digital Arrest" Video Extortion
                    </h3>
                    <p className="text-[11px] text-slate-200 mt-1 line-clamp-2 leading-relaxed">
                      Scammers clone child/relative voices in 3 seconds to claim hospital emergency or staged police arrest.
                    </p>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800 text-purple-950 dark:text-purple-200 text-xs">
                    <strong className="block font-mono text-[10.5px] text-purple-900 dark:text-purple-300 uppercase tracking-wide">
                      🛡️ Golden Awareness Rule:
                    </strong>
                    <span className="mt-0.5 block leading-relaxed font-semibold">
                      Establish a family verbal safeword. Official Police, CBI, and Courts NEVER conduct trials or demand money transfers over video calls.
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() =>
                        handleTriggerPwaAwareness(
                          'AI Voice Clone & Digital Arrest Alert',
                          'Official Police or CBI NEVER arrest or demand bail over Skype/WhatsApp video calls! Always call back your relative.'
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/25 text-xs font-mono font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
                      title="Send Live Push Notification to PWA"
                    >
                      <Bell className="w-3.5 h-3.5 animate-bounce text-purple-500" />
                      <span>Push PWA Alert</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('COMMON_ATTACKS')}
                      className="text-xs font-mono font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>10 Attacks Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {awarenessSlideIndex === 2 && (
              <div className="animate-in fade-in duration-300">
                <div className="relative h-44 sm:h-52 w-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80"
                    alt="Electricity Power Cut Scam"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-amber-600 w-fit uppercase tracking-wider mb-1">
                      WIDESPREAD SCHEME #03 • UTILITY EXTORTION
                    </span>
                    <h3 className="text-base font-black leading-tight drop-shadow-md">
                      Electricity Power Cut Tonight at 9:30 PM Scam
                    </h3>
                    <p className="text-[11px] text-slate-200 mt-1 line-clamp-2 leading-relaxed">
                      Coercive SMS claiming residential electricity power will be cut tonight from substation unless bill is settled.
                    </p>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 text-xs">
                    <strong className="block font-mono text-[10.5px] text-amber-900 dark:text-amber-300 uppercase tracking-wide">
                      🛡️ Golden Awareness Rule:
                    </strong>
                    <span className="mt-0.5 block leading-relaxed font-semibold">
                      State DISCOMs (TPCODL/WESCO) never disconnect power at night or ask you to call personal numbers. Report suspicious SMS to 1930.
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() =>
                        handleTriggerPwaAwareness(
                          'Electricity Power Cut Smishing Alert',
                          'DISCOMs never disconnect residential power at night or ask you to call personal numbers. Report to 1930.'
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/25 text-xs font-mono font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
                      title="Send Live Push Notification to PWA"
                    >
                      <Bell className="w-3.5 h-3.5 animate-bounce text-amber-500" />
                      <span>Push PWA Alert</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('COMMON_ATTACKS')}
                      className="text-xs font-mono font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>10 Attacks Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Statistical Summary List */}
          <div
            className={`p-4 sm:p-5 rounded-3xl border space-y-3 ${
              isDark ? 'bg-[#101820] border-white/10' : 'bg-[#FAF9F5] border-[#E5E2D9]'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-400' : 'text-[#71767C]'
              }`}
            >
              <span>Statistical Summary</span>
              <button
                onClick={() => onNavigate('network')}
                className={`font-semibold hover:underline ${isDark ? 'text-emerald-400' : 'text-[#E05A1B]'}`}
              >
                See All
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div
                className={`p-3 rounded-2xl border flex items-center justify-between ${
                  isDark ? 'bg-white/5 border-white/5' : 'bg-white border-[#EAE7DC]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`font-semibold block ${isDark ? 'text-slate-200' : 'text-[#131618]'}`}>Daily Scanned Links</span>
                    <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-[#888F96]'}`}>Today 24h</span>
                  </div>
                </div>
                <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>895 Links</span>
              </div>

              <div
                className={`p-3 rounded-2xl border flex items-center justify-between ${
                  isDark ? 'bg-white/5 border-white/5' : 'bg-white border-[#EAE7DC]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-600 flex items-center justify-center">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`font-semibold block ${isDark ? 'text-slate-200' : 'text-[#131618]'}`}>Weekly Ingress Probes</span>
                    <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-[#888F96]'}`}>7 Day Trajectory</span>
                  </div>
                </div>
                <span className={`font-bold ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>1,872 Links</span>
              </div>

              <div
                className={`p-3 rounded-2xl border flex items-center justify-between ${
                  isDark ? 'bg-white/5 border-white/5' : 'bg-white border-[#EAE7DC]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-600 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`font-semibold block ${isDark ? 'text-slate-200' : 'text-[#131618]'}`}>Monthly Drops</span>
                    <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-[#888F96]'}`}>Zero-day blocks</span>
                  </div>
                </div>
                <span className={`font-bold ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>4,991 Links</span>
              </div>
            </div>
          </div>

          {/* Interactive AI Voice Scam Call Demo Card */}
          <div
            className={`p-4 rounded-3xl border space-y-2.5 ${
              isDark
                ? 'bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-[#0F1722] border-rose-500/40'
                : 'bg-gradient-to-r from-rose-50 via-amber-50 to-white border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold">
                  <PhoneCall className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-rose-400 block">
                    Interactive Phone Call Simulator
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    AI Voice IVR Scam Call & In-Line OTP Sentinel
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                Live Demo
              </span>
            </div>

            <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Experience a live incoming scam call where a female AI voice claims to be State Bank of India, warns your account is paused, and solicits an OTP when you press 1.
            </p>

            <button
              onClick={() => setIsCallModalOpen(true)}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <PhoneIncoming className="w-4 h-4 text-white" />
              <span>Simulate Incoming SBI Scam Call Now</span>
            </button>
          </div>

          {/* Quick Jump Action Cards */}
          {/* Geofenced Identity Check & Scam Guard Quick Card */}
          <div
            onClick={() => setActiveTab('IDENTITY_SCAM')}
            className={`p-4 rounded-3xl border text-left cursor-pointer transition-all active:scale-98 shadow-xs ${
              isDark
                ? 'bg-gradient-to-r from-amber-950/30 via-slate-900 to-black border-amber-500/30 hover:border-amber-400'
                : 'bg-gradient-to-r from-amber-50 via-white to-amber-50/30 border-amber-200 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30">
                  <Fingerprint className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs">Identity Check & Scam Guard</span>
                    <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                      ACTIVE
                    </span>
                  </div>
                  <p className={`text-[10.5px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {isTrustedPlace ? `📍 Trusted Workplace: ${trustedWifiSsid}` : '⚠️ Away from Trusted Places: Strict Biometrics Enforced'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('multimodal')}
              className={`p-4 rounded-3xl border text-left space-y-1.5 transition-all active:scale-95 ${
                isDark
                  ? 'bg-gradient-to-br from-purple-950/40 to-[#101820] border-purple-500/30'
                  : 'bg-[#FAF9F5] border-[#E0DCD1] hover:bg-[#F2EFE8]'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs">Deepfake & QR</div>
              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-[#626870]'}`}>RawNet2 & ResNet50</p>
            </button>

            <button
              onClick={() => onNavigate('firewall')}
              className={`p-4 rounded-3xl border text-left space-y-1.5 transition-all active:scale-95 ${
                isDark
                  ? 'bg-gradient-to-br from-emerald-950/40 to-[#101820] border-emerald-500/30'
                  : 'bg-[#FAF9F5] border-[#E0DCD1] hover:bg-[#F2EFE8]'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs">Adaptive Firewall</div>
              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-[#626870]'}`}>eBPF rule unblock</p>
            </button>
          </div>
        </main>
      )}

      {/* 2.5 TAB: IDENTITY CHECK & SCAM PROTECTION (Matching User's Reference Screenshots) */}
      {activeTab === 'IDENTITY_SCAM' && (
        <main className="p-4 sm:p-5 space-y-5 animate-in fade-in duration-200">
          {/* Back button & Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveTab('SHIELD')}
              className="p-2 rounded-xl border border-white/10 hover:bg-white/5 flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Shield</span>
            </button>
            <span className="text-[10.5px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
              Autonomous Defense
            </span>
          </div>

          {/* ================================================================= */}
          {/* COMPONENT 1: SCAM PROTECTION (Exact replica of User Uploaded Image 1) */}
          {/* ================================================================= */}
          <div
            className={`rounded-3xl p-5 sm:p-6 border text-center space-y-4 shadow-xl ${
              isDark ? 'bg-gradient-to-b from-[#141A23] via-[#0E131A] to-black border-white/10' : 'bg-white border-[#E5E2D9]'
            }`}
          >
            {/* Orange Shield Avatar Icon */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 bg-amber-500/20 rounded-2xl blur-xl animate-pulse" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-b from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 text-black">
                <ShieldCheck className="w-9 h-9 text-slate-950 fill-amber-300" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-serif tracking-tight font-black">Scam protection</h2>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {syntheticVoiceEnabled && crossAppScamEnabled ? 'All 2 features active.' : '1 feature can be turned on.'}
              </p>
            </div>

            {/* Orange Turn On Button */}
            <button
              type="button"
              onClick={() => {
                setSyntheticVoiceEnabled(true);
                setCrossAppScamEnabled(true);
              }}
              className="w-full py-3.5 rounded-2xl bg-[#E06614] hover:bg-[#D05A0C] text-white font-bold text-sm shadow-lg shadow-orange-950/40 active:scale-98 transition-all cursor-pointer font-sans"
            >
              {syntheticVoiceEnabled && crossAppScamEnabled ? 'Protection Active' : 'Turn on'}
            </button>

            {/* Last 60 Days Stats Block */}
            <div className="text-left pt-2 space-y-2">
              <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Last 60 days
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#18212C] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`text-[11.5px] block font-medium leading-tight ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Synthetic voice
                  </span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-sm font-black font-mono text-emerald-400">3 Intercepted</span>
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#18212C] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`text-[11.5px] block font-medium leading-tight ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Cross-app scams
                  </span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-sm font-black font-mono text-emerald-400">1 Blocked</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scam Protection Features List */}
            <div className="text-left pt-2 space-y-3">
              <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Scam protection features
              </span>

              <div className={`rounded-2xl border divide-y ${isDark ? 'bg-[#18212C] border-white/5 divide-white/5' : 'bg-slate-50 border-slate-200 divide-slate-200'}`}>
                {/* Feature 1: Synthetic voice detection */}
                <div className="p-3.5 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                      <PhoneCall className="w-4 h-4 text-slate-300" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold leading-snug">Synthetic voice detection</h4>
                      <p className={`text-[11px] leading-relaxed mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Detects whether the other party is using an AI-synthesised voice during calls using real-time spectral frequency analysis.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSyntheticVoiceEnabled(!syntheticVoiceEnabled)}
                    className="text-xs font-mono font-bold text-slate-400 hover:text-white shrink-0 pt-0.5 flex items-center gap-0.5 cursor-pointer"
                  >
                    <span className={syntheticVoiceEnabled ? 'text-emerald-400' : 'text-slate-500'}>
                      {syntheticVoiceEnabled ? 'On' : 'Off'}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Feature 2: Cross-app scam detection */}
                <div className="p-3.5 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                      <Activity className="w-4 h-4 text-slate-300" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold leading-snug">Cross-app scam detection</h4>
                      <p className={`text-[11px] leading-relaxed mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Analyse activity across multiple apps (e.g. caller directing victim to download WhatsApp APKs or AnyDesk screen sharing) to detect common scam patterns.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCrossAppScamEnabled(!crossAppScamEnabled)}
                    className="text-xs font-mono font-bold text-slate-400 hover:text-white shrink-0 pt-0.5 flex items-center gap-0.5 cursor-pointer"
                  >
                    <span className={crossAppScamEnabled ? 'text-[#E06614]' : 'text-slate-500'}>
                      {crossAppScamEnabled ? 'On' : 'Off'}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* COMPONENT 2: SET UP IDENTITY CHECK (Exact replica of User Uploaded Image 2) */}
          {/* ================================================================= */}
          <div
            className={`rounded-3xl p-5 sm:p-6 border space-y-4 shadow-xl ${
              isDark ? 'bg-gradient-to-b from-[#111A24] to-black border-white/10' : 'bg-white border-[#E5E2D9]'
            }`}
          >
            {/* Shield Outline Header Icon */}
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <ShieldCheck className="w-8 h-8 text-cyan-400" />
            </div>

            <div>
              <h2 className="text-2xl font-serif tracking-tight font-black">Set up Identity Check</h2>
              <span className="text-xs text-blue-400 font-medium block mt-0.5 hover:underline cursor-pointer">
                How it works
              </span>
            </div>

            {/* Biometric requirement note */}
            <div className="flex items-start gap-3 pt-2">
              <Fingerprint className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold leading-snug text-slate-100">
                  Biometrics required for sensitive actions when away from your trusted places
                </h4>
                <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Your face or fingerprint biometrics will be needed for sensitive actions, such as:
                </p>
                <ul className={`text-[11px] space-y-1 pt-1 list-disc list-inside ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <li>Accessing saved passkeys and app passwords</li>
                  <li>Changing PIN, pattern or password, and turning off Find Hub</li>
                  <li>Changing Google Account password or 2-Step Verification</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 border-t border-white/10">
              <span className="text-slate-200 font-semibold block">Google Accounts & Banking Apps extra security:</span>
              <span>Passcode & SMS OTP fallback is completely disabled when outside trusted locations to eliminate shoulder-surfing and physical phone theft.</span>
            </div>

            {/* =============================================================== */}
            {/* INTERACTIVE GEOLOCATION & THEFT SIMULATOR (Demonstration Feature) */}
            {/* =============================================================== */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/15 space-y-3 pt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Wi-Fi Geofence Simulator:</span>
                </div>
                <span
                  className={`text-[9.5px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    isTrustedPlace
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                  }`}
                >
                  {isTrustedPlace ? '🟢 SAFE WORKPLACE' : '🔴 UNTRUSTED ZONE'}
                </span>
              </div>

              <div className="text-xs font-mono text-slate-300">
                Current Anchor: <strong className="text-white">{isTrustedPlace ? trustedWifiSsid : 'Public Wi-Fi / Cellular (Away from Home/Office)'}</strong>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsTrustedPlace(true)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                    isTrustedPlace
                      ? 'bg-emerald-500 text-black font-black border-emerald-400 shadow-md'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  🏢 In Safe Office
                </button>
                <button
                  type="button"
                  onClick={() => setIsTrustedPlace(false)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                    !isTrustedPlace
                      ? 'bg-rose-600 text-white font-black border-rose-500 shadow-md animate-pulse'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  🚶 Away in Public
                </button>
              </div>

              {/* Action: Simulate Sensitive Password Change */}
              <div className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    if (isTrustedPlace) {
                      alert(`✅ Standard Access Allowed:\nYou are inside your Trusted Workplace ("${trustedWifiSsid}"). Normal PIN and OTP verification are permitted.`);
                    } else {
                      setBiometricModalOpen(true);
                      setBiometricVerificationResult('CHALLENGE_ACTIVE');
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-black text-xs font-mono flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Test Stolen Phone Attack: Change Password</span>
                </button>
                <span className="block text-[9.5px] text-slate-400 text-center mt-1">
                  Tests shoulder-surfing theft protection when outside your trusted Wi-Fi.
                </span>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* 3. TAB 2: SCAN LINK */}
      {activeTab === 'CHECK_LINK' && (
        <main className="p-4 sm:p-5 space-y-4 sm:space-y-5 animate-in fade-in duration-200">
          <div
            className={`rounded-3xl p-5 sm:p-6 border space-y-3.5 ${
              isDark ? 'bg-gradient-to-b from-[#111A24] to-[#0A0F15] border-white/10' : 'bg-[#FAF9F5] border-[#E5E2D9]'
            }`}
          >
            <div
              className={`flex items-center gap-2 text-xs font-mono uppercase font-bold ${
                isDark ? 'text-emerald-400' : 'text-[#E05A1B]'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Phishing & Malicious URL Scanner</span>
            </div>
            <h2 className="text-base sm:text-lg font-black">Scan Link Here</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#5B6168]'}`}>
              Inspect lookalike homoglyphs, DNS age, credential harvesters, and malicious redirects.
            </p>

            <form onSubmit={handleScanLink} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="https://okcl-student-portal.support-login.top"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  className={`w-full pl-4 pr-11 py-3 rounded-2xl border text-xs font-mono focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-black/50 border-white/15 text-white placeholder-slate-500 focus:border-emerald-400'
                      : 'bg-white border-[#DCD7C9] text-[#131618] placeholder-[#888F96] focus:border-[#E05A1B]'
                  }`}
                />
                <button
                  type="submit"
                  disabled={scanning}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                    isDark ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'bg-[#E05A1B] text-white hover:bg-[#C84E14]'
                  }`}
                >
                  <Search className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLinkInput('https://okcl-student-portal.support-login.top/auth.php')}
                  className={`px-2.5 py-1 rounded-xl border text-[10px] font-mono transition-colors ${
                    isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-white border-[#DCD7C9] text-[#131618]'
                  }`}
                >
                  Load Fake Portal
                </button>
                <button
                  type="button"
                  onClick={() => setLinkInput('https://okcl.org')}
                  className={`px-2.5 py-1 rounded-xl border text-[10px] font-mono transition-colors ${
                    isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-white border-[#DCD7C9] text-[#131618]'
                  }`}
                >
                  Load Legit Domain
                </button>
              </div>
            </form>
          </div>

          {/* Link Scan Result Card */}
          {scanResult && (
            <div
              className={`rounded-3xl border p-5 space-y-4 animate-in fade-in duration-200 ${
                isDark ? 'bg-[#101820] border-white/10' : 'bg-white border-[#E5E2D9] shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE7DC]">
                <div className="flex items-center gap-2.5">
                  {scanResult.classification === 'CLEAN' ? (
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-600 flex items-center justify-center font-bold animate-pulse">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <span className={`text-[10px] font-mono uppercase block font-bold ${isDark ? 'text-slate-400' : 'text-[#71767C]'}`}>
                      Link Scan Result
                    </span>
                    <span
                      className={`text-xs sm:text-sm font-black ${
                        scanResult.classification === 'CLEAN' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {scanResult.classification === 'CLEAN' ? 'VERIFIED AUTHENTIC' : 'WARNING: MALICIOUS PHISHING'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-mono block ${isDark ? 'text-slate-400' : 'text-[#71767C]'}`}>Risk Score</span>
                  <span className="text-base font-black text-rose-500">{scanResult.risk_score}/100</span>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="font-semibold truncate">Target: {scanResult.url_or_subject}</div>
                {scanResult.indicators &&
                  scanResult.indicators.map((ind: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] opacity-80">
                      <span className="text-rose-500 shrink-0">•</span>
                      <span>{ind}</span>
                    </div>
                  ))}
              </div>

              <div
                className={`p-3 rounded-2xl border text-xs ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-[#FAF9F5] border-[#E8E5DC]'
                }`}
              >
                <span className={`text-[10px] font-mono uppercase font-bold block ${isDark ? 'text-emerald-400' : 'text-[#E05A1B]'}`}>
                  Recommended Mitigation
                </span>
                <span className="font-semibold">{scanResult.recommended_action}: In-line eBPF domain block applied.</span>
              </div>
            </div>
          )}
        </main>
      )}

      {/* 3. TAB: MY CIRCLE (FAMILY & CLOSE CONTACTS COLLABORATIVE DEFENSE) */}
      {activeTab === 'CIRCLE' && (
        <main className="p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
          {/* Hero Card: Circle Defense Mesh Status */}
          <div
            className={`rounded-3xl p-5 sm:p-6 border space-y-4 transition-all ${
              isDark
                ? 'bg-gradient-to-b from-[#0E1E2C] via-[#0A141E] to-[#070E15] border-cyan-500/30 shadow-2xl'
                : 'bg-gradient-to-b from-white via-[#F7FAFC] to-[#EDF2F7] border-[#CBD5E1] shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 text-black flex items-center justify-center font-bold shadow-md">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>P2P Defense Mesh Active</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight">My Circle Defense</h2>
                </div>
              </div>

              {/* Add to Circle CTA Button */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold font-mono flex items-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            </div>

            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Collaborative zero-trust defense network. When any member of your circle is targeted by an attack,
              CyberGuard neutralizes it and automatically synchronizes the preemptive protection signature to all devices.
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono">
              <div className={`p-2.5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                <div className="text-base sm:text-lg font-black text-cyan-400">{circleStats.totalProtected}</div>
                <div className="text-[9px] text-slate-400 uppercase">Members</div>
              </div>
              <div className={`p-2.5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                <div className="text-base sm:text-lg font-black text-emerald-400">{circleStats.neutralized}</div>
                <div className="text-[9px] text-slate-400 uppercase">Attacks Dropped</div>
              </div>
              <div className={`p-2.5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                <div className="text-base sm:text-lg font-black text-indigo-400">{circleStats.signatures}</div>
                <div className="text-[9px] text-slate-400 uppercase">eBPF Signatures</div>
              </div>
            </div>
          </div>

          {/* Interactive Live Demo Simulation Section (For Presentations & Demos) */}
          <div
            className={`rounded-3xl p-4 sm:p-5 border space-y-3 ${
              isDark
                ? 'bg-gradient-to-r from-amber-950/40 via-rose-950/30 to-[#0A1016] border-amber-500/40'
                : 'bg-[#FFFBEB] border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  Live Presentation & Pitch Simulation
                </span>
              </div>
              <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                Cross-Device Demo
              </span>
            </div>

            <p className={`text-xs ${isDark ? 'text-amber-200/80' : 'text-amber-900/80'}`}>
              Tap a simulation below to attack Contact A (Father / Mother) and watch Contact B (Self) immediately receive the cross-device early warning with zero packet leakage:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
              <button
                onClick={() => handleSimulateCircleAttack('Suresh Mohanty (Grandpa)', 'SENIOR_PENSION_KYC')}
                disabled={simulating}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-rose-950/80 to-amber-950/80 hover:bg-rose-900/90 border-2 border-rose-500/80 text-left transition-all active:scale-95 cursor-pointer shadow-md group"
              >
                <div className="font-bold text-rose-300 flex items-center gap-1 group-hover:text-rose-200">
                  <Smartphone className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">⭐ Scenario 1: Attack Grandpa (Phone B)</span>
                </div>
                <div className="text-[9.5px] text-slate-200 truncate mt-0.5">Pension Aadhaar Freeze Smishing</div>
              </button>

              <button
                onClick={() => handleSimulateCircleAttack('Deepak Mohanty (Father)', 'VOICE_CLONE')}
                disabled={simulating}
                className="p-2.5 rounded-2xl bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-500/60 text-left transition-all active:scale-95 cursor-pointer shadow-sm group"
              >
                <div className="font-bold text-indigo-300 flex items-center gap-1 group-hover:text-indigo-200">
                  <Flame className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">2. Attack Father (Voice)</span>
                </div>
                <div className="text-[9.5px] text-slate-300 truncate mt-0.5">Executive Wire Transfer Clone</div>
              </button>

              <button
                onClick={() => handleSimulateCircleAttack('Priya Mohanty (Mother)', 'EMAIL_PHISH')}
                disabled={simulating}
                className="p-2.5 rounded-2xl bg-blue-950/70 hover:bg-blue-900/80 border border-blue-500/60 text-left transition-all active:scale-95 cursor-pointer shadow-sm group"
              >
                <div className="font-bold text-blue-300 flex items-center gap-1 group-hover:text-blue-200">
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">3. Attack Mother (Email)</span>
                </div>
                <div className="text-[9.5px] text-slate-300 truncate mt-0.5">State Payroll Spear-Phish</div>
              </button>
            </div>
          </div>

          {/* Circle Members Roster */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Enrolled Circle Members ({circleMembers.length})
              </span>
              <button
                onClick={fetchCircleData}
                className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh Mesh</span>
              </button>
            </div>

            <div className="space-y-2">
              {circleMembers.map((member) => (
                <div
                  key={member.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isDark
                      ? 'bg-[#111A22] border-white/10 hover:border-cyan-500/40'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white font-black flex items-center justify-center shrink-0 text-sm shadow-md">
                        {member.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold truncate">{member.name}</span>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold shrink-0">
                            {member.relationship}
                          </span>
                          {(member.id === 'circle-0' || member.name.includes('Suresh')) && (
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shrink-0">
                              📱 Phone B (Protected Target)
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{member.phone}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold">🟢 {member.status || 'PROTECTED'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="text-[10px] font-mono font-bold text-emerald-400">
                          🛡️ {member.threats_shielded || 0} Blocked
                        </div>
                        <div className="text-[9px] text-slate-400">{member.device_label || 'Phone A'}</div>
                      </div>
                      {member.id !== 'circle-3' && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Remove from Circle"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400 truncate">
                      Protection: <span className="text-cyan-300 font-semibold">{member.risk_tier}</span>
                    </span>
                    <span className="text-slate-500 shrink-0">eBPF Sync: 0.42 μs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Circle Interceptions Stream */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 px-1 block">
              Recent Circle Early Warning Logs
            </span>
            <div className="space-y-2">
              {circleAlerts.length === 0 ? (
                <div className={`p-4 rounded-2xl border text-center text-xs ${isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  No attacks detected on your circle yet. All members safe.
                </div>
              ) : (
                circleAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-2xl border space-y-1 ${
                      isDark ? 'bg-[#181116] border-rose-500/40 text-slate-200' : 'bg-rose-50 border-rose-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10.5px] font-bold">
                      <span className="text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Intercepted on: {alert.target_member}</span>
                      </span>
                      <span className="text-[9.5px] font-mono text-slate-400">{alert.timestamp || 'Just now'}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-300 pl-5">
                      {alert.payload_snippet || alert.threat_type}
                    </div>
                    <div className="text-[9px] font-mono text-emerald-400 pl-5 flex items-center gap-1">
                      <CheckCheck className="w-3 h-3" />
                      <span>Signature auto-propagated to Circle devices (Zero Packet Leakage)</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      )}

      {/* 4. TAB 4: MOST COMMON CYBER ATTACKS (TOP 10 ENCYCLOPEDIA) */}
      {activeTab === 'COMMON_ATTACKS' && (
        <main className="p-2 sm:p-4 animate-in fade-in duration-200">
          <CommonAttacksPage onNavigate={onNavigate} />
        </main>
      )}

      {/* 5. TAB 5: AI CYBER MENTOR */}
      {activeTab === 'MENTOR' && (
        <main className="p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
          <div
            className={`rounded-3xl p-5 sm:p-6 border space-y-3 text-center ${
              isDark ? 'bg-gradient-to-b from-[#1C0D0D] to-[#0D0707] border-rose-900/40' : 'bg-[#FAF9F5] border-[#E5E2D9]'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 mx-auto flex items-center justify-center text-white shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-base sm:text-lg font-black">AI Cyber Mentor</h2>
            <p className={`text-xs max-w-xs mx-auto ${isDark ? 'text-rose-200/70' : 'text-[#5B6168]'}`}>
              Interactive plain-language cybersecurity tutor powered by Qwen 2.5 on Groq hardware.
            </p>
          </div>

          {/* Quick Access Topics Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs font-bold">
            <button
              onClick={() => onNavigate('ai-analyst')}
              className={`p-4 rounded-3xl border text-left space-y-1 transition-all active:scale-95 ${
                isDark
                  ? 'bg-[#140A0A] border-rose-900/30 text-white hover:border-rose-500/50'
                  : 'bg-white border-[#E0DCD1] text-[#131618] hover:bg-[#F8F7F2]'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center mb-2">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>Ask Anything</div>
              <div className={`text-[10px] font-normal ${isDark ? 'text-slate-400' : 'text-[#71767C]'}`}>Ask about attacks</div>
            </button>

            <button
              onClick={() => onNavigate('simulator')}
              className={`p-4 rounded-3xl border text-left space-y-1 transition-all active:scale-95 ${
                isDark
                  ? 'bg-[#140A0A] border-rose-900/30 text-white hover:border-rose-500/50'
                  : 'bg-white border-[#E0DCD1] text-[#131618] hover:bg-[#F8F7F2]'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center mb-2">
                <Activity className="w-4 h-4" />
              </div>
              <div>Practice Labs</div>
              <div className={`text-[10px] font-normal ${isDark ? 'text-slate-400' : 'text-[#71767C]'}`}>Simulate 6 attacks</div>
            </button>
          </div>

          <button
            onClick={() => onNavigate('ai-analyst')}
            className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-amber-600 rounded-2xl text-xs font-black text-white shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <span>Launch Full Qwen 2.5 SOC Co-Pilot</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </main>
      )}

      {/* ADD TO MY CIRCLE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fluid">
          <div
            className={`w-full max-w-md rounded-3xl p-5 border space-y-4 shadow-2xl ${
              isDark ? 'bg-[#0F1722] border-cyan-500/40 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500 text-black flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-black text-sm">Add Person to My Circle</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Full Name / Contact Label
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patra (Grandpa)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-black/40 border-white/15 text-white focus:border-cyan-400' : 'bg-slate-50 border-slate-300 focus:border-cyan-600'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98610 XXXXX"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-black/40 border-white/15 text-white focus:border-cyan-400' : 'bg-slate-50 border-slate-300 focus:border-cyan-600'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Relationship & Role
                </label>
                <select
                  value={newRelationship}
                  onChange={(e) => setNewRelationship(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-[#18222F] border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Parent / Senior Citizen">Parent / Senior Citizen (Highest Risk)</option>
                  <option value="Child / Student">Child / Student (Scholarship & Fee Scams)</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Close Colleague / Partner">Close Colleague / Business Partner</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Security Protection Tier
                </label>
                <select
                  value={newRiskTier}
                  onChange={(e) => setNewRiskTier(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none ${
                    isDark ? 'bg-[#18222F] border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="High Risk: Auto-Drop Voice Clones & e-KYC">High Risk: Auto-Drop Voice Clones & e-KYC</option>
                  <option value="Standard Mobile Shield">Standard Mobile Shield (Real-Time Inspection)</option>
                  <option value="Strict Zero-Trust Gateway">Strict Zero-Trust Gateway</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Enroll in Circle</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Biometric Verification Challenge Modal (Identity Check Away From Trusted Places) */}
      {biometricModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fluid select-none">
          <div className="relative w-full max-w-sm bg-gradient-to-b from-[#182230] via-[#0E1520] to-black rounded-[32px] border-2 border-amber-500/50 p-6 text-center text-white shadow-2xl space-y-4">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
              <div
                className={`relative w-16 h-16 rounded-2xl flex items-center justify-center border transition-all ${
                  biometricVerificationResult === 'SUCCESS'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                    : biometricVerificationResult === 'FAILED'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-500'
                    : 'bg-amber-500/20 border-amber-400 text-amber-400'
                }`}
              >
                <Fingerprint
                  className={`w-9 h-9 ${biometricScanningAnim ? 'animate-bounce text-cyan-400' : ''}`}
                />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black tracking-tight">Identity Check Required</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                You are currently <strong className="text-rose-400">Away from Trusted Workplace</strong>. PIN, password, and SMS OTP fallback are blocked.
              </p>
            </div>

            {biometricVerificationResult === 'CHALLENGE_ACTIVE' && (
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                  <span>🔒 Stolen Device Protection Active:</span>
                  <p className="text-[10.5px] text-slate-300 mt-1">
                    Even if someone snooped your lock screen PIN on the bus or cafe, they CANNOT reset your Google or banking account without your real face or fingerprint.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBiometricScanningAnim(true);
                      setTimeout(() => {
                        setBiometricScanningAnim(false);
                        setBiometricVerificationResult('SUCCESS');
                      }, 1200);
                    }}
                    disabled={biometricScanningAnim}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black text-xs font-mono flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
                  >
                    <Fingerprint className="w-4 h-4" />
                    <span>{biometricScanningAnim ? 'Verifying Hardware Sensor...' : 'Authenticate with Face / Fingerprint'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBiometricVerificationResult('FAILED');
                      // Broadcast circle alert
                      const theftAlert = {
                        target_member: 'Deepak Mohanty (Father)',
                        message: '🚨 CRITICAL SECURITY ALERT: Unauthorized password change attempt away from trusted workplace without biometrics! Device auto-locked.',
                        timestamp: 'Just Now',
                        threat_type: 'STOLEN_DEVICE_UNTRUSTED_ZONE'
                      };
                      setActiveCircleAlert(theftAlert);
                      setCircleAlerts((prev) => [theftAlert, ...prev]);
                    }}
                    className="w-full py-2.5 rounded-2xl border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white text-xs font-mono transition-all cursor-pointer"
                  >
                    Simulate Thief Attempt (No Biometric Match)
                  </button>
                </div>
              </div>
            )}

            {biometricVerificationResult === 'SUCCESS' && (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500 text-emerald-300 font-mono text-xs space-y-2 animate-in fade-in">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <strong className="block text-sm text-emerald-200">Biometric Identity Confirmed!</strong>
                <p className="text-[11px] text-slate-200">
                  Hardware enclave verified authentic owner. Google account and security settings access unlocked.
                </p>
                <button
                  type="button"
                  onClick={() => setBiometricModalOpen(false)}
                  className="mt-2 w-full py-2 rounded-xl bg-emerald-500 text-black font-black text-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}

            {biometricVerificationResult === 'FAILED' && (
              <div className="p-4 rounded-2xl bg-rose-500/20 border-2 border-rose-500 text-rose-300 font-mono text-xs space-y-2 animate-in fade-in">
                <AlertTriangle className="w-6 h-6 text-rose-400 mx-auto animate-bounce" />
                <strong className="block text-sm text-rose-200">Theft Attempt Neutralized!</strong>
                <p className="text-[11px] text-slate-200">
                  Password change blocked. 1-Hour security delay imposed and high-priority alert broadcast to the Family Circle!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setBiometricModalOpen(false);
                    setActiveTab('CIRCLE');
                  }}
                  className="mt-2 w-full py-2 rounded-xl bg-rose-600 text-white font-black text-xs cursor-pointer"
                >
                  View Circle Early Warning
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Voice Scam Call Simulator Modal */}
      <AiScamCallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        victimName="Deepak Mohanty (Father)"
        victimPhone="+91 98610 44219"
        onCallIntercepted={() => fetchCircleData()}
      />
    </div>
  );
};
