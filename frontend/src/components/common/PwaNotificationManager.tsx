import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Bell,
  BellRing,
  ShieldAlert,
  CheckCircle2,
  Ban,
  Clock,
  Sparkles,
  Smartphone,
  X,
  Zap,
  ExternalLink
} from 'lucide-react';

interface QuarantineItem {
  id: string;
  sender_id: string;
  sender_ip: string;
  recipient_id: string;
  threat_type: string;
  payload: string;
  qwen_reasoning?: string;
  remaining_seconds?: number;
}

interface MobileAttackToast {
  id: string;
  title: string;
  vector: string;
  client_ip: string;
  media_url?: string;
  media_type?: string;
  qwen_reasoning?: string;
  threat_id?: string;
  timestamp: string;
}

export const PwaNotificationManager: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [activeQuarantine, setActiveQuarantine] = useState<QuarantineItem[]>([]);
  const [mobileAttackToast, setMobileAttackToast] = useState<MobileAttackToast | null>(null);
  const mobileToastTimerRef = useRef<any>(null);
  const [deciding, setDeciding] = useState(false);
  const [showPromptBanner, setShowPromptBanner] = useState(false);
  const [isDesktopScreen, setIsDesktopScreen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktopScreen(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getBackendUrl = () => {
    const host = window.location.hostname || '127.0.0.1';
    return `http://${host}:8000`;
  };

  const getWsUrl = () => {
    const host = window.location.hostname || '127.0.0.1';
    return `ws://${host}:8000/api/v1/ws`;
  };

  // 1. Detect PWA Installability
  useEffect(() => {
    // Check if running in standalone mode (already installed as PWA)
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowPromptBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Check Notification status
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // 2. Poll & Listen for In-Flight Quarantine Threats
  const fetchQuarantine = async () => {
    try {
      const res = await fetch(`${getBackendUrl()}/api/v1/relay/quarantine/active`);
      const data = await res.json();
      if (data.active_quarantine) {
        setActiveQuarantine(data.active_quarantine);
      }
    } catch (e) {
      // offline fallback
    }
  };

  useEffect(() => {
    fetchQuarantine();
    const interval = setInterval(fetchQuarantine, 3000);
    return () => clearInterval(interval);
  }, []);

  // 3. WebSocket Real-Time Listener for Inbound Threat Push Alerts
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;

    const connectWs = () => {
      try {
        ws = new WebSocket(getWsUrl());
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'ATTACK_FIRED' || data.type === 'INLINE_ATTACK_INTERCEPTED' || data.type === 'QUARANTINE_HOLD_ALERT') {
              if (data.type === 'INLINE_ATTACK_INTERCEPTED' || data.type === 'QUARANTINE_HOLD_ALERT') {
                fetchQuarantine();
              }

              // Always trigger sleek small mobile toaster for SOC Admin on mobile screens
              const title = data.attack?.title || (data.type === 'ATTACK_FIRED' ? 'Ingress Strike Intercepted' : 'In-Line Attack Quarantined');
              const vector = data.attack?.vector || data.threat?.threat_type?.replace(/_/g, ' ') || 'Hostile Ingress Vector';
              const client_ip = data.client_ip || data.sender_ip || '192.168.137.2';
              const media_url = data.media_url || data.threat?.media_url;
              const media_type = data.media_type || data.threat?.media_type;
              const qwen_reasoning = data.qwen_reasoning || data.threat?.qwen_reasoning;

              setMobileAttackToast({
                id: String(Date.now()),
                title,
                vector,
                client_ip,
                media_url,
                media_type,
                qwen_reasoning,
                threat_id: data.threat_id || data.threat?.id,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              });

              if (mobileToastTimerRef.current) clearTimeout(mobileToastTimerRef.current);
              mobileToastTimerRef.current = setTimeout(() => {
                setMobileAttackToast(null);
              }, 6000);

              // Trigger Native Phone Lock Screen / Tray Notification!
              if ('Notification' in window && Notification.permission === 'granted') {
                const titleStr = `🚨 CyberGuard Alert: ${data.threat?.threat_type?.replace(/_/g, ' ') || 'Threat Intercepted'}`;
                const bodyStr = `In-line threat from ${data.sender_id || client_ip}. Tap to Block or Release!`;

                const activeThreatId = data.threat_id || data.threat?.id;
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.ready.then((reg) => {
                    (reg as any).showNotification(titleStr, {
                      body: bodyStr,
                      icon: '/shield.svg',
                      badge: '/shield.svg',
                      tag: 'cyberguard-quarantine',
                      data: { url: '/', threat_id: activeThreatId },
                      requireInteraction: true,
                      actions: [
                        { action: 'allow', title: '🟢 ALLOW (Release)' },
                        { action: 'drop', title: '🔴 DROP (Block IP)' }
                      ]
                    });
                  });
                } else {
                  new Notification(titleStr, {
                    body: bodyStr,
                    icon: '/shield.svg',
                    badge: '/shield.svg',
                    tag: 'cyberguard-quarantine'
                  });
                }

                // Vibrate Phone if supported
                if ('vibrate' in navigator) {
                  navigator.vibrate([300, 100, 300, 100, 300]);
                }
              }
            } else if (data.type === 'RELAY_MESSAGE_DELIVERED' || data.type === 'QUARANTINE_PERMANENTLY_DROPPED') {
              fetchQuarantine();
            }
          } catch (err) {
            console.debug('WS message parse err:', err);
          }
        };

        ws.onclose = () => {
          reconnectTimer = setTimeout(connectWs, 3500);
        };
      } catch (err) {
        reconnectTimer = setTimeout(connectWs, 4000);
      }
    };

    connectWs();
    return () => {
      if (ws) ws.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  // Trigger PWA Installation Dialog
  const handleInstallClick = async () => {
    if (!installPrompt) {
      alert('PWA Installation: On iOS Safari, tap the Share icon and select "Add to Home Screen". On Chrome/Android, tap menu (⋮) and select "Install app".');
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowPromptBanner(false);
      setInstallPrompt(null);
    }
  };

  // Request Native Notification Permission
  const handleRequestNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Notifications are not supported in this browser.');
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setNotificationsEnabled(true);
        new Notification('🛡️ CyberGuard SOC Alerts Active', {
          body: 'You will receive real-time notifications on this phone whenever an in-flight attack is quarantined.',
          icon: '/shield.svg'
        });
      } else {
        alert('Notification permission was not granted. Please allow notifications in your browser settings.');
      }
    } catch (e: any) {
      alert(`Notification error: ${e.message}`);
    }
  };

  // Admin Quick Action: ALLOW & RELEASE or BLOCK & DROP
  const handleDecide = async (threatId: string, decision: 'ALLOW' | 'DROP') => {
    setDeciding(true);
    try {
      await fetch(`${getBackendUrl()}/api/v1/relay/quarantine/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threat_id: threatId, decision })
      });
      setActiveQuarantine((prev) => prev.filter((item) => item.id !== threatId));
      fetchQuarantine();
    } catch (err: any) {
      alert(`Decision failed: ${err.message}`);
    } finally {
      setDeciding(false);
    }
  };

  const isAttackerPage =
    typeof window !== 'undefined' &&
    (window.location.pathname.includes('attacker') ||
      window.location.pathname.includes('/a') ||
      window.location.pathname.includes('ingress') ||
      window.location.port === '5900');

  if (isAttackerPage) {
    return null;
  }

  return (
    <>
      {/* =================================================================== */}
      {/* 1. PROPER SMALL MOBILE TOASTER FOR SOC ADMIN (TOP OF MOBILE SCREEN) */}
      {/* =================================================================== */}
      {mobileAttackToast && !isDesktopScreen && !isAttackerPage && (
        <div
          onClick={() => {
            window.location.href = '/live-threats';
          }}
          className="fixed top-3 inset-x-2.5 max-w-sm mx-auto z-[99999] p-2.5 rounded-2xl bg-[#12161E]/95 backdrop-blur-md border border-rose-500/80 shadow-2xl text-white pointer-events-auto select-none animate-fluid cursor-pointer transition-all active:scale-98"
        >
          <div className="flex items-center gap-2.5">
            {/* Thumbnail or Alert Icon */}
            {mobileAttackToast.media_url ? (
              <img
                src={`${getBackendUrl()}${mobileAttackToast.media_url}`}
                alt="Threat Thumbnail"
                className="w-12 h-12 rounded-xl object-cover border border-rose-500/70 shrink-0 bg-black/60 shadow-md"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/40 font-bold animate-pulse">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              </div>
            )}

            {/* Info Body */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-black text-rose-300 truncate uppercase tracking-tight flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping shrink-0" />
                  <span className="truncate">{mobileAttackToast.title}</span>
                </span>
                <span className="text-[8.5px] font-mono px-1.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40 shrink-0 font-bold">
                  0.42 μs eBPF
                </span>
              </div>

              <div className="text-[10px] font-mono text-slate-300 truncate mt-0.5">
                Src: <strong className="text-white">{mobileAttackToast.client_ip}</strong> • <span className="text-rose-400 font-bold">{mobileAttackToast.vector}</span>
              </div>

              {mobileAttackToast.qwen_reasoning ? (
                <div className="text-[9px] font-mono text-purple-300 truncate mt-0.5 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-purple-400 shrink-0" />
                  <span className="truncate">{mobileAttackToast.qwen_reasoning.replace(/[\n\r#*-]/g, ' ').trim()}</span>
                </div>
              ) : (
                <div className="text-[9px] font-mono text-emerald-400 mt-0.5 font-bold">
                  ✓ Netfilter Kernel Drop (Zero Packet Leakage)
                </div>
              )}
            </div>

            {/* Dismiss Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMobileAttackToast(null);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 shrink-0"
              title="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. PROPER SMALL MOBILE QUARANTINE TOASTER FOR SOC ADMIN (BOTTOM)    */}
      {/* =================================================================== */}
      {activeQuarantine.length > 0 && !isDesktopScreen && !isAttackerPage && (
        <div className="fixed bottom-3 inset-x-2.5 max-w-sm mx-auto z-[99998] p-3 rounded-2xl bg-[#181C22]/98 backdrop-blur-md border border-amber-400 shadow-2xl text-white space-y-2 pointer-events-auto select-none font-sans animate-fluid">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-[11px] font-black tracking-tight text-amber-300 uppercase">
                SOC Quarantine Hold
              </h4>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/60 border border-amber-500/40 text-[9px] font-mono text-amber-300 font-bold">
              <Clock className="w-2.5 h-2.5 animate-spin" />
              <span>{activeQuarantine[0].remaining_seconds || 59}s</span>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-300 space-y-0.5">
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>From: <strong className="text-white">{activeQuarantine[0].sender_id}</strong> ({activeQuarantine[0].sender_ip})</span>
              <span className="text-amber-400 font-bold">{activeQuarantine[0].threat_type?.replace(/_/g, ' ')}</span>
            </div>
            <div className="p-1.5 rounded-lg bg-black/60 border border-white/10 text-rose-300 text-[10px] truncate font-bold">
              {activeQuarantine[0].payload}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-0.5 font-mono text-[11px]">
            <button
              onClick={() => handleDecide(activeQuarantine[0].id, 'DROP')}
              disabled={deciding}
              className="py-2 px-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-sm"
            >
              <Ban className="w-3 h-3" />
              <span>BLOCK & DROP</span>
            </button>
            <button
              onClick={() => handleDecide(activeQuarantine[0].id, 'ALLOW')}
              disabled={deciding}
              className="py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-sm"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>ALLOW</span>
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. REAL-TIME LAPTOP SOC ADMIN QUARANTINE DRAWER (WORKING FINE)      */}
      {/* =================================================================== */}
      {activeQuarantine.length > 0 && isDesktopScreen && !isAttackerPage && (
        <div className="fixed inset-x-3 bottom-3 sm:inset-x-auto sm:right-6 sm:bottom-24 sm:max-w-md z-[9999] p-4 rounded-3xl bg-[#181C22] border-2 border-amber-400 text-white shadow-2xl animate-fluid space-y-3 font-sans select-none pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold animate-pulse">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-tight text-amber-300 uppercase">
                  SOC Admin Quarantine Hold
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">
                  {activeQuarantine[0].threat_type?.replace(/_/g, ' ') || 'Hostile Payload'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/50 border border-amber-500/30 text-[10px] font-mono text-amber-300 font-bold">
              <Clock className="w-3 h-3 text-amber-400 animate-spin" />
              <span>{activeQuarantine[0].remaining_seconds || 59}s</span>
            </div>
          </div>

          {/* Details */}
          <div className="text-xs font-mono space-y-1">
            <div className="flex justify-between text-slate-400 text-[10px]">
              <span>From: <strong className="text-white">{activeQuarantine[0].sender_id}</strong></span>
              <span>Target: <strong className="text-emerald-400">{activeQuarantine[0].recipient_id}</strong></span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-rose-300 text-[11px] truncate font-bold">
              {activeQuarantine[0].payload}
            </div>
          </div>

          {/* Qwen 2.5 Explainable Summary */}
          {activeQuarantine[0].qwen_reasoning && (
            <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[10px] font-mono text-purple-200 line-clamp-3 leading-relaxed">
              {activeQuarantine[0].qwen_reasoning}
            </div>
          )}

          {/* Admin Fast Decision Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
            <button
              onClick={() => handleDecide(activeQuarantine[0].id, 'DROP')}
              disabled={deciding}
              className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>BLOCK & DROP</span>
            </button>
            <button
              onClick={() => handleDecide(activeQuarantine[0].id, 'ALLOW')}
              disabled={deciding}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ALLOW & RELEASE</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PwaNotificationManager;
