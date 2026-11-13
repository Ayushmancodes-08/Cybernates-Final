import React, { useState, useEffect, useRef } from 'react';
import {
  Skull,
  Radio,
  Send,
  ShieldAlert,
  Flame,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Smartphone,
  Wifi,
  Terminal,
  Zap,
  RotateCw,
  Mail,
  MessageSquare,
  QrCode,
  Shuffle,
  Camera,
  Upload,
  Globe,
  FileText,
  UserCheck,
  Mic,
  MicOff,
  Square,
  Play,
  Volume2,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  Check,
  CheckCheck,
  ShieldCheck,
  Info,
  Bell,
  Trash2,
  X,
  Sparkles,
  Inbox,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  Users,
  UserPlus,
  PhoneIncoming,
  PhoneCall
} from 'lucide-react';
import { AiScamCallModal } from '../components/demo/AiScamCallModal';

interface ChatMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  sender_ip?: string;
  channel?: 'WHATSAPP' | 'EMAIL';
  email_subject?: string;
  email_sender_name?: string;
  text: string;
  media_url?: string;
  media_type?: string;
  timestamp: string;
  time_formatted?: string;
  status?: 'DELIVERED' | 'DROPPED';
  is_threat?: boolean;
  threat_type?: string;
  qwen_reasoning?: string;
  indicators?: string[];
  threat_score?: number;
}

interface ThreatNotification {
  id: string;
  title: string;
  message: string;
  sender: string;
  threat_type: string;
  timestamp: string;
  channel?: 'WHATSAPP' | 'EMAIL';
  email_subject?: string;
  media_url?: string;
  media_type?: string;
}

export interface RemoteAttackerSimulatorProps {
  defaultDevice?: 'PHONE_A' | 'PHONE_B';
}

export const RemoteAttackerSimulator: React.FC<RemoteAttackerSimulatorProps> = ({ defaultDevice }) => {
  // Device Identity: "Phone A" (Attacker/Sender) or "Phone B" (Protected Recipient)
  const [currentDevice, setCurrentDevice] = useState<'PHONE_A' | 'PHONE_B'>(() => {
    if (defaultDevice) return defaultDevice;
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const d = params.get('device')?.toLowerCase() || params.get('role')?.toLowerCase();
      if (
        path.includes('phone-b') ||
        path.includes('victim') ||
        path.includes('recipient') ||
        path.includes('target') ||
        d === 'phone_b' ||
        d === 'b' ||
        d === 'victim' ||
        d === 'recipient'
      ) {
        return 'PHONE_B';
      }
    }
    return 'PHONE_A';
  });

  const [deviceIp, setDeviceIp] = useState<string>('192.168.137.119');
  const [unblocking, setUnblocking] = useState(false);
  const [activeChannel, setActiveChannel] = useState<'WHATSAPP' | 'EMAIL'>('WHATSAPP');
  const [resolveNotice, setResolveNotice] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeToast, setActiveToast] = useState<ThreatNotification | null>(null);
  const [activeCircleAlert, setActiveCircleAlert] = useState<any | null>(null);
  const [showCircleDrawer, setShowCircleDrawer] = useState(false);
  const [circleMembers, setCircleMembers] = useState<any[]>([]);
  const [isScamCallModalOpen, setIsScamCallModalOpen] = useState(false);

  // Fetch Circle Members
  const fetchCircleMembers = async () => {
    try {
      const res = await fetch(`${getBackendUrl()}/api/v1/circle/members`);
      const d = await res.json();
      if (d.members) setCircleMembers(d.members);
    } catch (e) {}
  };

  // Fast Resolution Handler - Instant Unblock & Kernel Flush (<0.5s)
  const handleFastResolve = async () => {
    try {
      await fetch(`${getBackendUrl()}/api/v1/hotspot/unblock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: deviceIp })
      });
      setActiveToast(null);
      setResolveNotice(`⚡ Threat Resolved & IP ${deviceIp} Unblocked (0.28ms). Kernel Netfilter Flushed.`);
      setTimeout(() => setResolveNotice(null), 3500);
    } catch (e: any) {
      setResolveNotice(`Resolution error: ${e.message}`);
      setTimeout(() => setResolveNotice(null), 3500);
    }
  };

  // Unblock IP Handler for instant 1-tap reset on mobile
  const handleUnblockThisIp = async () => {
    setUnblocking(true);
    try {
      await fetch(`${getBackendUrl()}/api/v1/live-ingress/unblock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: deviceIp })
      });
      setResolveNotice(`IP ${deviceIp} unblocked from firewall netfilter table.`);
      setTimeout(() => setResolveNotice(null), 3500);
    } catch (e: any) {
      alert(`Unblock error: ${e.message}`);
    } finally {
      setUnblocking(false);
    }
  };

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // Image Upload State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

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

  // Scroll to bottom on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeToast]);

  // Fetch Device IP & Message Feed
  const fetchMessages = async () => {
    try {
      const res = await fetch(`${getBackendUrl()}/api/v1/relay/messages`);
      const data = await res.json();
      if (data.client_ip) {
        setDeviceIp(data.client_ip);
      }
      if (data.messages) {
        if (data.threats && data.threats.length > 0) {
          const threatMsgs: ChatMessage[] = data.threats.map((t: any) => ({
            id: t.id,
            sender_id: t.sender_id,
            recipient_id: t.recipient_id,
            channel: t.channel,
            email_subject: t.email_subject,
            email_sender_name: t.email_sender_name,
            text: t.payload,
            media_url: t.media_url,
            media_type: t.media_type,
            timestamp: t.timestamp,
            time_formatted: t.time_formatted,
            status: 'DROPPED',
            is_threat: true,
            threat_type: t.threat_type,
            qwen_reasoning: t.qwen_reasoning,
            indicators: t.indicators,
            threat_score: t.threat_score
          }));
          const existingIds = new Set(data.messages.map((m: any) => m.id));
          const newThreats = threatMsgs.filter((t) => !existingIds.has(t.id));
          const combined = [...data.messages, ...newThreats].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          setMessages(combined);
        } else {
          setMessages(data.messages);
        }
      }
    } catch (e) {
      console.debug('Error polling relay messages:', e);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${getBackendUrl()}/api/v1/hotspot/status`);
      const data = await res.json();
      if (data.client_ip) {
        setDeviceIp(data.client_ip);
      } else {
        setDeviceIp('192.168.137.119');
      }
    } catch (e) {
      setDeviceIp('192.168.137.119');
    }
  };

  // Initial load & polling fallback
  useEffect(() => {
    fetchStatus();
    fetchMessages();
    fetchCircleMembers();
    const interval = setInterval(() => {
      fetchMessages();
      fetchStatus();
      fetchCircleMembers();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket Live Real-Time Connection
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWs = () => {
      try {
        ws = new WebSocket(getWsUrl());
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'RELAY_MESSAGE_DELIVERED' && data.message) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === data.message.id)) return prev;
                return [...prev, data.message];
              });
            } else if (data.type === 'INLINE_ATTACK_INTERCEPTED') {
              const msgChannel = data.threat?.channel || (data.threat?.threat_type === 'SPEAR_PHISHING_EMAIL' ? 'EMAIL' : 'WHATSAPP');
              const msgSubject = data.threat?.email_subject;
              const msgSenderName = data.threat?.email_sender_name;

              // Trigger toaster notification on Phone B with media thumbnail and add to feed!
              if (currentDevice === 'PHONE_B' && data.toast_recipient) {
                setActiveToast({
                  id: String(Date.now()),
                  title: data.toast_recipient.title,
                  message: data.toast_recipient.message,
                  sender: data.sender_id,
                  threat_type: data.threat?.threat_type || 'Malicious Payload',
                  channel: msgChannel,
                  email_subject: msgSubject,
                  timestamp: data.toast_recipient.timestamp,
                  media_url: data.media_url || data.threat?.media_url || data.toast_recipient?.media_url,
                  media_type: data.media_type || data.threat?.media_type || data.toast_recipient?.media_type
                });
                setTimeout(() => setActiveToast(null), 6000);

                const bDroppedMsg: ChatMessage = {
                  id: `drop-${Date.now()}`,
                  sender_id: data.sender_id || 'Phone A',
                  recipient_id: 'Phone B',
                  channel: msgChannel,
                  email_subject: msgSubject,
                  email_sender_name: msgSenderName,
                  text: data.threat?.payload || 'Malicious Attack Payload Intercepted',
                  media_url: data.media_url || data.threat?.media_url,
                  media_type: data.media_type || data.threat?.media_type,
                  timestamp: new Date().toISOString(),
                  time_formatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  status: 'DROPPED',
                  is_threat: true,
                  threat_type: data.threat?.threat_type,
                  qwen_reasoning: data.threat?.qwen_reasoning,
                  indicators: data.threat?.indicators,
                  threat_score: data.threat?.threat_score
                };
                setMessages((prev) => [...prev, bDroppedMsg]);
                playVoiceAlert("Inbound attack intercepted and dropped in-flight by CyberGuard.");
              }
              // If we are Phone A, show inline dropped alert with image preview and Qwen bullet reasoning
              if (currentDevice === 'PHONE_A') {
                const droppedMsg: ChatMessage = {
                  id: `drop-${Date.now()}`,
                  sender_id: 'Phone A',
                  recipient_id: 'Phone B',
                  channel: msgChannel,
                  email_subject: msgSubject,
                  email_sender_name: msgSenderName,
                  text: data.threat?.payload || 'Malicious Attack Payload',
                  media_url: data.media_url || data.threat?.media_url,
                  media_type: data.media_type || data.threat?.media_type,
                  timestamp: new Date().toISOString(),
                  time_formatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  status: 'DROPPED',
                  is_threat: true,
                  threat_type: data.threat?.threat_type,
                  qwen_reasoning: data.threat?.qwen_reasoning,
                  indicators: data.threat?.indicators,
                  threat_score: data.threat?.threat_score
                };
                setMessages((prev) => [...prev, droppedMsg]);
              }
            } else if (data.type === 'TRIGGER_REMOTE_SCAM_CALL') {
              if (currentDevice === 'PHONE_B') {
                setIsScamCallModalOpen(true);
              }
            } else if (data.type === 'RELAY_CLEARED') {
              setMessages([]);
            } else if (data.type === 'CIRCLE_EARLY_WARNING') {
              setActiveCircleAlert(data);
              setTimeout(() => setActiveCircleAlert(null), 10000);
              playVoiceAlert(`Warning: CyberGuard early warning alert received. Attack targeting ${data.target_member || 'circle member'} was intercepted. Preemptive defense signature synchronized.`);
            } else if (data.type === 'VISHING_CALL_INTERCEPTED') {
              if (currentDevice === 'PHONE_B') {
                setActiveToast({
                  id: String(Date.now()),
                  title: '🛑 Scam Phone Call Terminated In-Line',
                  message: 'AI Voice Scammer impersonated SBI and attempted OTP theft. CyberGuard terminated the call before OTP leakage!',
                  sender: data.caller_name || '+91 1800-425-3800',
                  threat_type: 'VISHING_VOICE_OTP_SCAM',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
                setTimeout(() => setActiveToast(null), 7000);
              }
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
  }, [currentDevice]);

  // ---------------------------------------------------------------------------
  // Message Transmission Handler
  // ---------------------------------------------------------------------------
  const handleSendMessage = async (
    customPayload?: string,
    attackType?: string,
    overrideChannel?: 'WHATSAPP' | 'EMAIL',
    customSubject?: string,
    customSender?: string
  ) => {
    const textToSend = customPayload !== undefined ? customPayload : inputText;
    if (!textToSend.trim()) return;

    const channelToSend = overrideChannel || (attackType === 'EMAIL_PHISH' ? 'EMAIL' : activeChannel);
    const isEmail = channelToSend === 'EMAIL';
    const emailSubjectToSend =
      customSubject || (isEmail ? 'URGENT: State Employee Payroll Direct Deposit Verification' : '');
    const emailSenderToSend =
      customSender || (isEmail ? 'OKCL Directorate of Human Resources' : '');

    setLoading(true);
    setInputText('');

    try {
      const endpoint = `${getBackendUrl()}/api/v1/relay/send`;
      const senderName = currentDevice === 'PHONE_A' ? 'Phone A' : 'Phone B';
      const recipientName = currentDevice === 'PHONE_A' ? 'Phone B' : 'Phone A';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: senderName,
          recipient_id: recipientName,
          text: textToSend,
          attack_type: attackType || '',
          channel: channelToSend,
          email_subject: emailSubjectToSend,
          email_sender_name: emailSenderToSend
        })
      });

      const data = await res.json();
      if (data.is_threat) {
        // Threat was intercepted and dropped in-flight!
        if (currentDevice === 'PHONE_A') {
          const droppedMsg: ChatMessage = {
            id: `drop-${Date.now()}`,
            sender_id: 'Phone A',
            recipient_id: 'Phone B',
            channel: channelToSend,
            email_subject: emailSubjectToSend,
            email_sender_name: emailSenderToSend,
            text: textToSend,
            timestamp: new Date().toISOString(),
            time_formatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'DROPPED',
            is_threat: true,
            threat_type: data.threat?.threat_type,
            qwen_reasoning: data.threat?.qwen_reasoning,
            indicators: data.threat?.indicators,
            threat_score: data.threat?.threat_score
          };
          setMessages((prev) => [...prev, droppedMsg]);
        }
      } else if (data.message) {
        // Clean benign message delivered
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
    } catch (err: any) {
      alert(`Send failed: ${err.message}. Ensure CyberGuard backend is running.`);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Audio Recording (Microphone) Handler
  // ---------------------------------------------------------------------------
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Microphone access not supported on this browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        stream.getTracks().forEach((t) => t.stop());
        await handleSendAudioBlob(blob, 'Genuine Voice Note');
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } catch (err: any) {
      alert(`Microphone permission denied: ${err.message}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleSendAudioBlob = async (blob: Blob, label: string, isSynthetic: boolean = false) => {
    setLoading(true);
    try {
      const endpoint = `${getBackendUrl()}/api/v1/relay/send`;
      const formData = new FormData();
      formData.append('file', blob, isSynthetic ? 'synthetic_voice_clone.wav' : 'user_voice_note.webm');
      formData.append('sender_id', currentDevice === 'PHONE_A' ? 'Phone A' : 'Phone B');
      formData.append('recipient_id', currentDevice === 'PHONE_A' ? 'Phone B' : 'Phone A');
      formData.append('text', label);
      if (isSynthetic) {
        formData.append('attack_type', 'VOICE_CLONE');
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.is_threat && currentDevice === 'PHONE_A') {
        setMessages((prev) => [
          ...prev,
          {
            id: `drop-${Date.now()}`,
            sender_id: 'Phone A',
            recipient_id: 'Phone B',
            text: label,
            media_url: data.threat?.media_url,
            media_type: 'audio',
            timestamp: new Date().toISOString(),
            time_formatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'DROPPED',
            is_threat: true,
            threat_type: 'AI_VOICE_DEEPFAKE',
            qwen_reasoning: data.threat?.qwen_reasoning,
            indicators: data.threat?.indicators,
            threat_score: data.threat?.threat_score
          }
        ]);
      }
    } catch (err: any) {
      alert(`Audio send failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fast Trigger: Synthetic Voice Clone
  const handleSendSyntheticVoiceSample = async () => {
    setLoading(true);
    try {
      const sampleRes = await fetch(`${getBackendUrl()}/api/v1/demo-samples/5_FAKE_minister_voice_clone_urgent.wav`);
      const sampleBlob = await sampleRes.blob();
      await handleSendAudioBlob(sampleBlob, '🎙️ Voice Note (0:14): Urgent Executive Authorization for State Vendor Settlement - Dr. Deepak Mohanty (MD)', true);
    } catch (err: any) {
      alert(`Voice sample failed: ${err.message}`);
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Camera & Image Handlers
  // ---------------------------------------------------------------------------
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await handleSendImageFile(file, `Photo: ${file.name}`);
    }
  };

  const handleSendImageFile = async (file: File | Blob, label: string, isSynthetic: boolean = false) => {
    setLoading(true);
    try {
      const endpoint = `${getBackendUrl()}/api/v1/relay/send`;
      const formData = new FormData();
      formData.append('file', file, isSynthetic ? 'synthetic_deepfake_face.png' : 'camera_photo.jpg');
      formData.append('sender_id', currentDevice === 'PHONE_A' ? 'Phone A' : 'Phone B');
      formData.append('recipient_id', currentDevice === 'PHONE_A' ? 'Phone B' : 'Phone A');
      formData.append('text', label);
      if (isSynthetic) {
        formData.append('attack_type', 'IMAGE_DEEPFAKE');
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.is_threat && currentDevice === 'PHONE_A') {
        setMessages((prev) => [
          ...prev,
          {
            id: `drop-${Date.now()}`,
            sender_id: 'Phone A',
            recipient_id: 'Phone B',
            text: label,
            media_url: data.threat?.media_url,
            media_type: 'image',
            timestamp: new Date().toISOString(),
            time_formatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'DROPPED',
            is_threat: true,
            threat_type: 'AI_IMAGE_DEEPFAKE',
            qwen_reasoning: data.threat?.qwen_reasoning,
            indicators: data.threat?.indicators,
            threat_score: data.threat?.threat_score
          }
        ]);
      }
    } catch (err: any) {
      alert(`Image send failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fast Trigger: Synthetic Face Deepfake
  const handleSendDeepfakePhotoSample = async () => {
    setLoading(true);
    try {
      const sampleRes = await fetch(`${getBackendUrl()}/api/v1/demo-samples/2_FAKE_deepfake_minister_speech.png`);
      const sampleBlob = await sampleRes.blob();
      await handleSendImageFile(sampleBlob, '📷 Official ID Photo: Dr. Deepak Mohanty - State Education Directorate Verification', true);
    } catch (err: any) {
      alert(`Deepfake sample failed: ${err.message}`);
      setLoading(false);
    }
  };

  // Reset Conversation
  const handleClearChat = async () => {
    if (!confirm('Clear messenger history for a fresh demonstration?')) return;
    try {
      await fetch(`${getBackendUrl()}/api/v1/relay/clear`, { method: 'POST' });
      setMessages([]);
      setActiveToast(null);
    } catch (e) {
      setMessages([]);
    }
  };

  const senderLabel = currentDevice === 'PHONE_A' ? 'Phone A (Attacker)' : 'Phone B (Protected)';
  const peerLabel = currentDevice === 'PHONE_A' ? 'Phone B' : 'Phone A';

  return (
    <div className="h-[100dvh] max-h-[100dvh] bg-[#0B141A] text-white flex flex-col justify-between max-w-xl mx-auto font-sans selection:bg-emerald-500/20 overflow-hidden touch-manipulation">
      {/* =================================================================== */}
      {/* 1. TOP HEADER & DEVICE SWITCHER */}
      {/* =================================================================== */}
      <div className="bg-[#202C33] px-3 py-2 flex items-center justify-between border-b border-[#2A3942] sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white shrink-0 ${
              currentDevice === 'PHONE_A' ? 'bg-rose-600' : 'bg-emerald-600'
            }`}
          >
            {currentDevice === 'PHONE_A' ? 'A' : 'B'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-white truncate">{senderLabel}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 font-bold shrink-0">
                {deviceIp}
              </span>
              <button
                onClick={handleUnblockThisIp}
                disabled={unblocking}
                title="Unblock device IP in Linux firewall netfilter"
                className="px-2 py-0.5 rounded-full bg-emerald-700/80 hover:bg-emerald-600 text-white text-[9px] font-mono font-bold flex items-center gap-1 border border-emerald-400/40 transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <Unlock className="w-2.5 h-2.5 text-emerald-300" />
                <span>{unblocking ? '...' : 'Unblock IP'}</span>
              </button>
            </div>
            <div className="text-[9.5px] text-slate-400 flex items-center gap-1 font-mono truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate">CyberGuard In-Line Shield Active</span>
            </div>
          </div>
        </div>

        {/* Clear Chat & Role Switcher */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleClearChat}
            title="Reset Chat Feed"
            className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-slate-400 hover:text-white"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Channel Mode Toggle (WhatsApp vs Email) */}
          <div className="flex bg-black/50 p-0.5 rounded-xl border border-white/10 text-[9.5px] font-mono font-bold">
            <button
              onClick={() => setActiveChannel('WHATSAPP')}
              title="Switch to WhatsApp / SMS Mobile Messenger"
              className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-all ${
                activeChannel === 'WHATSAPP'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              onClick={() => setActiveChannel('EMAIL')}
              title="Switch to Corporate Email Client"
              className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-all ${
                activeChannel === 'EMAIL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mail className="w-3 h-3" />
              <span className="hidden sm:inline">Email</span>
            </button>
          </div>

          {/* Circle Defense Mesh Pill */}
          <button
            onClick={() => setShowCircleDrawer(!showCircleDrawer)}
            title="Open Collaborative Circle Defense Mesh"
            className={`px-2 py-1 rounded-xl border text-[9.5px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
              showCircleDrawer
                ? 'bg-cyan-500 text-black border-cyan-400 shadow-sm'
                : 'bg-black/50 hover:bg-black/70 border-white/10 text-cyan-300'
            }`}
          >
            <Users className="w-3 h-3" />
            <span className="hidden sm:inline">Circle</span>
            <span className="px-1 py-0.2 rounded-full bg-cyan-400/20 text-[8.5px]">{circleMembers.length || 4}</span>
          </button>

          {/* Quick Device Toggle */}
          <div className="flex bg-black/50 p-0.5 rounded-xl border border-white/10 text-[10px] font-mono font-bold">
            <button
              onClick={() => setCurrentDevice('PHONE_A')}
              className={`px-2 py-1 rounded-lg transition-all ${
                currentDevice === 'PHONE_A' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400'
              }`}
            >
              Phone A
            </button>
            <button
              onClick={() => setCurrentDevice('PHONE_B')}
              className={`px-2 py-1 rounded-lg transition-all ${
                currentDevice === 'PHONE_B' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400'
              }`}
            >
              Phone B
            </button>
          </div>
        </div>
      </div>

      {/* Lightning Fast Resolution Notification Flash */}
      {resolveNotice && (
        <div className="bg-emerald-600 text-white px-3 py-1.5 text-center text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-lg animate-fluid z-30">
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          <span>{resolveNotice}</span>
        </div>
      )}

      {/* Collaborative Circle Defense Preemptive Alert */}
      {activeCircleAlert && (
        <div className="m-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-950 via-rose-950 to-slate-900 border-2 border-amber-500 shadow-2xl text-white z-40 animate-fluid">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/40">
                <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-amber-300 flex items-center gap-1.5 flex-wrap">
                  <span>⚠️ CIRCLE DEFENSE ALERT: {activeCircleAlert.target_member}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/60 text-amber-400 border border-amber-500/40">
                    {activeCircleAlert.timestamp || 'Now'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-200 mt-0.5 leading-relaxed">
                  {activeCircleAlert.message}
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-[9.5px] font-mono text-emerald-400">
                  <CheckCheck className="w-3 h-3 text-emerald-400" />
                  <span>PREEMPTIVE SIGNATURE AUTO-SYNCED TO PHONE B (0.42 μs eBPF Drop)</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveCircleAlert(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Circle Defense Mesh Slide-Down Drawer */}
      {showCircleDrawer && (
        <div className="mx-3 my-2 p-3.5 rounded-2xl bg-[#0D1824] border border-cyan-500/40 shadow-xl space-y-2.5 z-30 animate-fluid">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">My Circle Defense Network</div>
                <div className="text-[9px] font-mono text-cyan-400">Collaborative P2P early warning active</div>
              </div>
            </div>
            <button
              onClick={() => setShowCircleDrawer(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-[10px] text-slate-300 leading-snug">
            Any attack targeted at <span className="text-amber-300 font-bold">Contact A (Father)</span> automatically triggers
            an early warning and preemptive signature synchronization on <span className="text-emerald-300 font-bold">Contact B (Self)</span> with zero packet leakage.
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[9.5px] font-mono">
            {circleMembers.map((m) => (
              <div key={m.id} className="p-2 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                <div className="font-bold text-slate-200 truncate">{m.name}</div>
                <div className="text-slate-400 truncate">{m.phone}</div>
                <div className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{m.status || 'PROTECTED'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick 1-Tap Trigger for Presentation */}
          <div className="pt-1">
            <button
              onClick={async () => {
                try {
                  await fetch(`${getBackendUrl()}/api/v1/circle/simulate-attack`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ target_member_name: 'Deepak Mohanty (Father)', attack_type: 'SBI_SMISHING' })
                  });
                } catch (e) {}
              }}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 text-white font-mono font-bold text-[10px] flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Zap className="w-3 h-3 text-amber-200" />
              <span>Simulate Attack on Father & Broadcast Early Warning to Circle</span>
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. PROTECTIVE TOAST NOTIFICATION ON PHONE B */}
      {/* =================================================================== */}
      {activeToast && (
        <div
          onClick={() => setActiveToast(null)}
          className={`m-3 p-3.5 rounded-2xl shadow-2xl z-40 cursor-pointer transition-all duration-300 hover:opacity-90 active:scale-98 animate-fluid border-2 ${
            activeToast.channel === 'EMAIL'
              ? 'bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-blue-400'
              : 'bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border-emerald-400'
          }`}
          title="Tap to dismiss"
        >
          <div className="flex items-start gap-2.5">
            {activeToast.media_url ? (
              <img
                src={`${getBackendUrl()}${activeToast.media_url}`}
                alt="Quarantined Media"
                className="w-12 h-12 rounded-xl object-cover border border-emerald-400/60 shrink-0 bg-black/60 shadow-md"
              />
            ) : (
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  activeToast.channel === 'EMAIL'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                }`}
              >
                {activeToast.channel === 'EMAIL' ? (
                  <Mail className="w-5 h-5 text-blue-400" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                )}
              </div>
            )}
            <div className="flex-1 text-xs min-w-0">
              <div className="font-bold flex items-center justify-between">
                <span className={activeToast.channel === 'EMAIL' ? 'text-blue-300 truncate' : 'text-emerald-300 truncate'}>
                  {activeToast.channel === 'EMAIL'
                    ? `📧 Phishing Email Intercepted: ${activeToast.email_subject || 'URGENT: State Payroll'}`
                    : activeToast.title}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono">{activeToast.timestamp}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveToast(null);
                    }}
                    className="p-1 -mr-1 -mt-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                    title="Dismiss notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-200 mt-0.5 leading-relaxed">
                {activeToast.message}
              </p>
              <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono">
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>ZERO PACKET LEAKAGE: In-line packet dropped. Never delivered.</span>
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFastResolve();
                  }}
                  className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 shrink-0 cursor-pointer shadow-xs active:scale-95"
                >
                  <Zap className="w-2.5 h-2.5 text-amber-300" />
                  <span>Instant Resolve</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. CHAT / EMAIL MESSAGE FEED AREA */}
      {/* =================================================================== */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
        {/* Active Channel Notification Banner */}
        <div className="p-2 rounded-xl bg-[#182229] border border-white/5 text-[10px] text-center text-slate-400 font-mono space-y-0.5">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold">
            <Lock className="w-3 h-3" />
            <span>
              {activeChannel === 'EMAIL'
                ? 'OKCL Secure Mail (TLS 1.3 / DKIM) - CyberGuard In-Line Email Gateway'
                : 'CyberGuard In-Line Adaptive Firewall Active (WhatsApp / SMS Mode)'}
            </span>
          </div>
          <div>All traffic between Phone A and Phone B is inspected in-flight in &lt; 0.5s.</div>
        </div>

        {messages.map((msg) => {
          const isMe =
            (currentDevice === 'PHONE_A' && msg.sender_id === 'Phone A') ||
            (currentDevice === 'PHONE_B' && msg.sender_id === 'Phone B');

          const isEmail = msg.channel === 'EMAIL';

          // ===================================================================
          // TEMPLATE 1: CORPORATE EMAIL EQUIVALENT TEMPLATE (FOR EMAIL PHISHING)
          // ===================================================================
          if (isEmail) {
            const isDropped = msg.status === 'DROPPED';
            return (
              <div key={msg.id} className="w-full my-2 animate-fluid">
                <div
                  className={`rounded-2xl border transition-all p-3.5 shadow-xl ${
                    isDropped
                      ? 'bg-gradient-to-b from-[#1a0f14] via-[#111827] to-[#0b101b] border-rose-500/70 ring-1 ring-rose-500/40 text-slate-100'
                      : 'bg-gradient-to-b from-[#1e293b] to-[#0f172a] border-slate-700/80 text-slate-100'
                  }`}
                >
                  {/* Top Email Envelope Header */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/60">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isDropped ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-white truncate flex items-center gap-1.5">
                          <span>
                            {msg.email_sender_name ||
                              (msg.sender_id === 'Phone A' ? 'OKCL HR Directorate' : 'Staff Employee')}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400 truncate">
                            &lt;
                            {msg.sender_id === 'Phone A'
                              ? 'hr-payroll@okcl-portal.org'
                              : 'staff@okcl.internal'}
                            &gt;
                          </span>
                        </div>
                        <div className="text-[9.5px] font-mono text-slate-400 truncate">
                          To: {msg.recipient_id === 'Phone B' ? 'staff-account@okcl.internal' : 'hr-desk@okcl.org'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[9px] font-mono text-slate-400">{msg.time_formatted || 'Now'}</div>
                      <span
                        className={`text-[8.5px] font-mono px-2 py-0.5 rounded-full font-bold inline-block mt-0.5 ${
                          isDropped
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                        }`}
                      >
                        {isDropped ? '⚠️ DMARC FAIL / SPOOFED' : '🛡️ SPF: PASS | DKIM: PASS'}
                      </span>
                    </div>
                  </div>

                  {/* Subject Line Bar */}
                  <div className="text-xs font-bold text-amber-300/90 flex items-center gap-1.5 mb-2.5">
                    <span className="text-[9.5px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Subject
                    </span>
                    <span className="truncate">
                      {msg.email_subject || 'URGENT: State Employee Payroll Direct Deposit Verification'}
                    </span>
                  </div>

                  {/* Email Body Card */}
                  <div
                    className={`p-3 rounded-xl text-xs leading-relaxed space-y-2.5 ${
                      isDropped
                        ? 'bg-black/60 border border-rose-500/30 font-mono text-[11px]'
                        : 'bg-slate-900/70 border border-white/5'
                    }`}
                  >
                    <div className={`whitespace-pre-wrap ${isDropped ? 'line-through text-slate-300' : 'text-slate-100'}`}>
                      {msg.text}
                    </div>

                    {/* Interactive Simulated CTA Action Button */}
                    <div className="pt-1">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold ${
                          isDropped
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50 line-through opacity-70'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        <span>
                          {isDropped ? '⛔ QUARANTINED MALICIOUS LINK' : 'Verify Direct Deposit Portal'}
                        </span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>

                    {/* Official Corporate Footer */}
                    <div className="text-[8.5px] text-slate-500 border-t border-slate-800 pt-1.5 font-mono">
                      Official Notification • Odisha Knowledge Corporation Limited (OKCL) Security Gateway • TLS 1.3
                    </div>
                  </div>

                  {/* If Dropped by CyberGuard: Show Interception Banner, 1-Tap Resolve, & Explainable AI */}
                  {isDropped && (
                    <div className="mt-2.5 space-y-2">
                      <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-500/50 text-[9.5px] font-mono text-rose-200 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span className="font-bold truncate">
                            ⛔ ZERO PACKET LEAKAGE: In-line packet dropped by CyberGuard Email Gateway (0.42 μs eBPF Drop)
                          </span>
                        </div>
                        <button
                          onClick={handleFastResolve}
                          className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer shrink-0 ml-1"
                        >
                          <Zap className="w-2.5 h-2.5 text-amber-300" />
                          <span>Instant Resolve</span>
                        </button>
                      </div>

                      {/* Qwen 2.5 Explainable AI Reasoning */}
                      {msg.qwen_reasoning && (
                        <div className="p-2 rounded-xl bg-purple-950/50 border border-purple-500/40 text-[9.5px] font-mono text-purple-200 space-y-1">
                          <div className="flex items-center gap-1 text-purple-300 font-bold">
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            <span>Qwen 2.5 Reason Modeling:</span>
                          </div>
                          <div className="whitespace-pre-line leading-relaxed text-purple-100 pl-1">
                            {msg.qwen_reasoning}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // ===================================================================
          // TEMPLATE 2: WHATSAPP / SMS CHAT BUBBLE TEMPLATE
          // ===================================================================

          // Case A: WhatsApp / SMS Dropped by CyberGuard
          if (msg.status === 'DROPPED') {
            return (
              <div key={msg.id} className="flex justify-end animate-fluid">
                <div className="max-w-[88%] rounded-2xl p-2.5 bg-gradient-to-br from-rose-950/90 to-slate-950 border border-rose-500/80 text-white rounded-tr-none shadow-xl space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-rose-300 font-bold border-b border-rose-500/30 pb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      <span className="uppercase tracking-tight">BLOCKED IN-FLIGHT</span>
                    </span>
                    <span className="text-slate-400">{msg.time_formatted || 'Now'}</span>
                  </div>

                  {/* If Media (Image / Deepfake Photo) was Dropped: Render Full Mobile Image Preview */}
                  {msg.media_type === 'image' && msg.media_url && (
                    <div className="relative rounded-xl overflow-hidden border border-rose-500/60 my-1 bg-black/80 shadow-inner group">
                      <img
                        src={`${getBackendUrl()}${msg.media_url}`}
                        alt="Intercepted Deepfake"
                        className="w-full max-h-48 object-cover filter brightness-90 contrast-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent flex flex-col justify-between p-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full bg-rose-600/90 text-[8.5px] font-mono font-black text-white uppercase tracking-wider flex items-center gap-1 shadow-md border border-rose-400/50">
                            <ShieldAlert className="w-2.5 h-2.5" />
                            <span>⛔ INTERCEPTED BY CYBERGUARD</span>
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-black/80 text-[8.5px] font-mono text-rose-300 font-bold border border-rose-500/40">
                            0.42 μs eBPF
                          </span>
                        </div>
                        <div className="text-[9px] font-mono text-rose-200 font-bold bg-black/70 px-2 py-1 rounded-lg border border-rose-500/30">
                          MesoInception-4 / 2D FFT Anomaly • Threat Score: {msg.threat_score || 95}%
                        </div>
                      </div>
                    </div>
                  )}

                  {/* If Audio (Synthetic Voice Clone) was Dropped */}
                  {msg.media_type === 'audio' && msg.media_url && (
                    <div className="p-2 rounded-xl bg-black/60 border border-indigo-500/40 space-y-1">
                      <div className="text-[10px] font-mono text-indigo-300 font-bold flex items-center gap-1">
                        <Volume2 className="w-3 h-3 text-indigo-400" />
                        <span>Synthetic Voice Note Intercepted (8.1 kHz Cutoff)</span>
                      </div>
                      <audio src={`${getBackendUrl()}${msg.media_url}`} controls className="w-full h-7 opacity-80" />
                    </div>
                  )}

                  {/* Text payload with strike-through styling */}
                  <p className="line-through text-slate-300 font-mono text-[11px] break-all leading-snug">
                    {msg.text}
                  </p>

                  {/* Zero Packet Leakage Containment Banner + Instant Resolve Button */}
                  <div className="text-[9.5px] text-rose-300 font-mono font-bold bg-rose-950/60 px-2 py-1 rounded-lg border border-rose-500/30 flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <XCircle className="w-3 h-3 text-rose-400 shrink-0" />
                      <span className="truncate">ZERO PACKET LEAKAGE: In-line packet dropped. Never delivered to {msg.recipient_id}.</span>
                    </div>
                    <button
                      onClick={handleFastResolve}
                      className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer shrink-0 ml-1"
                    >
                      <Zap className="w-2.5 h-2.5 text-amber-300" />
                      <span>Instant Resolve</span>
                    </button>
                  </div>

                  {/* Qwen 2.5 Explainable AI Reasoning in Bullet Points */}
                  {msg.qwen_reasoning && (
                    <div className="p-2 rounded-xl bg-purple-950/50 border border-purple-500/40 text-[9.5px] font-mono text-purple-200 space-y-1 mt-1">
                      <div className="flex items-center gap-1 text-purple-300 font-bold">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span>Qwen 2.5 Reason Modeling:</span>
                      </div>
                      <div className="whitespace-pre-line leading-relaxed text-purple-100 pl-1">
                        {msg.qwen_reasoning}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // Case B: WhatsApp / SMS Delivered Clean
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm ${
                  isMe
                    ? 'bg-[#005C4B] text-white rounded-tr-none'
                    : 'bg-[#202C33] text-slate-100 rounded-tl-none border border-white/5'
                }`}
              >
                {!isMe && (
                  <div className="text-[10px] font-mono text-emerald-400 font-bold mb-0.5">
                    {msg.sender_id}
                  </div>
                )}

                {/* Render Media Preview if available */}
                {msg.media_type === 'image' && msg.media_url && (
                  <img
                    src={`${getBackendUrl()}${msg.media_url}`}
                    alt="Media"
                    className="w-full h-40 object-cover rounded-xl mb-1.5 border border-white/10"
                  />
                )}

                {msg.media_type === 'audio' && msg.media_url && (
                  <audio src={`${getBackendUrl()}${msg.media_url}`} controls className="w-full h-8 mb-1" />
                )}

                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-300 font-mono">
                  <span>{msg.time_formatted || 'Now'}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-cyan-300" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatBottomRef} />
      </div>

      {/* =================================================================== */}
      {/* 4. ATTACK TRIGGER PILLS (ONLY VISIBLE ON PHONE A) */}
      {/* =================================================================== */}
      {currentDevice === 'PHONE_A' && (
        <div className="p-2 bg-[#182229] border-t border-[#2A3942] space-y-1.5">
          <div className="text-[10px] font-mono font-bold text-slate-400 flex items-center justify-between px-1">
            <span className="flex items-center gap-1 text-rose-400">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>1-Tap In-Line Threat Injections targeting Phone B:</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px] font-mono">
            {/* Threat 1: Scholarship Approved e-KYC Scam (User Requested) */}
            <button
              onClick={() =>
                handleSendMessage(
                  'Hello user, Your Medhabruti scholarship of ₹25,000 has been approved. Final e-KYC verification is pending. Please verify your student profile immediately to receive bank disbursement: https://okcl-scholarship.gov-portal.xyz/verify-kyc?sid=94812',
                  'WHATSAPP_PHISH'
                )
              }
              disabled={loading}
              className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 border border-rose-500/50 text-left transition-all active:scale-95 cursor-pointer shadow-sm group"
            >
              <div className="font-bold text-rose-300 flex items-center gap-1 group-hover:text-rose-200">
                <Globe className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate">1. Scholarship Scam</span>
              </div>
              <div className="text-[9px] text-slate-300 truncate mt-0.5">Scholarship approved, KYC pending...</div>
            </button>

            {/* Threat 2: Urgent SBI Account Blocked KYC Scam */}
            <button
              onClick={() =>
                handleSendMessage(
                  '[VK-SBIBNK] Dear Customer, Your SBI account ending in XX81 has been placed on hold due to pending regulatory KYC. Update your PAN & Aadhaar details today to avoid permanent service suspension: https://sbi-kyc-auth.top/update-portal',
                  'SMS_SMISHING'
                )
              }
              disabled={loading}
              className="p-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/70 border border-amber-500/50 text-left transition-all active:scale-95 cursor-pointer shadow-sm group"
            >
              <div className="font-bold text-amber-300 flex items-center gap-1 group-hover:text-amber-200">
                <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">2. SBI KYC Scam</span>
              </div>
              <div className="text-[9px] text-slate-300 truncate mt-0.5">Account blocked today, update KYC...</div>
            </button>

            {/* Threat 3: State HR Directorate Payroll Spear-Phish (Corporate Email Equivalent) */}
            <button
              onClick={() => {
                setActiveChannel('EMAIL');
                handleSendMessage(
                  'Dear State Employee,\n\nYour monthly direct deposit payroll disbursement for November 2026 has failed compliance validation due to pending IFSC/Aadhaar re-linking.\n\nPlease verify your official employee single-sign-on credentials immediately to avoid payroll hold: https://bhubaneswar-wellness-clinic.org/okcl-payroll/session.php\n\nDirectorate of Human Resources & Accounts\nGovernment of Odisha',
                  'EMAIL_PHISH',
                  'EMAIL',
                  'URGENT: State Employee Payroll Direct Deposit Verification',
                  'OKCL Directorate of Human Resources'
                );
              }}
              disabled={loading}
              className="p-2 rounded-xl bg-blue-950/70 hover:bg-blue-900/80 border border-blue-500/60 text-left transition-all active:scale-95 cursor-pointer shadow-sm group"
            >
              <div className="font-bold text-blue-300 flex items-center gap-1 group-hover:text-blue-200">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">3. Payroll Phish (Email)</span>
              </div>
              <div className="text-[9px] text-slate-300 truncate mt-0.5">Direct deposit failed, verify credentials...</div>
            </button>

            {/* Threat 4: Power Disconnection Notice Scam */}
            <button
              onClick={() =>
                handleSendMessage(
                  '[OD-POWER] Dear Consumer, Your electricity connection will be disconnected tonight at 9:30 PM due to unpaid electricity bill of ₹1,420. Contact officer or pay immediately: https://electricity-bill-update.online/pay',
                  'SMS_SMISHING',
                  'WHATSAPP'
                )
              }
              disabled={loading}
              className="p-2 rounded-xl bg-orange-950/60 hover:bg-orange-900/70 border border-orange-500/50 text-left transition-all active:scale-95 cursor-pointer shadow-sm group"
            >
              <div className="font-bold text-orange-300 flex items-center gap-1 group-hover:text-orange-200">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span className="truncate">4. Power Cut Scam</span>
              </div>
              <div className="text-[9px] text-slate-300 truncate mt-0.5">Power disconnected tonight...</div>
            </button>

            {/* Threat 5: Synthetic Voice Clone */}
            <button
              onClick={handleSendSyntheticVoiceSample}
              disabled={loading}
              className="p-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/70 border border-indigo-500/50 text-left transition-all active:scale-95 cursor-pointer shadow-sm group"
            >
              <div className="font-bold text-indigo-300 flex items-center gap-1 group-hover:text-indigo-200">
                <Volume2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">5. Voice Deepfake</span>
              </div>
              <div className="text-[9px] text-slate-300 truncate mt-0.5">Urgent executive wire auth note</div>
            </button>

            {/* Threat 6: Face Deepfake Photo */}
            <button
              onClick={handleSendDeepfakePhotoSample}
              disabled={loading}
              className="p-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/70 border border-cyan-500/50 text-left transition-all active:scale-95 cursor-pointer shadow-sm group"
            >
              <div className="font-bold text-cyan-300 flex items-center gap-1 group-hover:text-cyan-200">
                <Camera className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">6. Face Deepfake</span>
              </div>
              <div className="text-[9px] text-slate-300 truncate mt-0.5">Official state biometric photo ID</div>
            </button>

            {/* Threat 7: Interactive AI Voice Scam Call (SBI OTP Vishing) */}
            <button
              onClick={async () => {
                setIsScamCallModalOpen(true);
                try {
                  await fetch(`${getBackendUrl()}/api/v1/call/trigger-remote`, { method: 'POST' });
                } catch (e) {}
              }}
              className="p-2 rounded-xl bg-gradient-to-r from-rose-950 via-amber-950 to-slate-900 hover:from-rose-900 hover:to-amber-900 border border-rose-400/70 text-left transition-all active:scale-95 cursor-pointer shadow-md group col-span-2 sm:col-span-3"
            >
              <div className="font-black text-rose-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <PhoneIncoming className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                  <span>7. Launch Interactive AI Scam Call Demo (SBI Fraud IVR)</span>
                </span>
                <span className="text-[8.5px] font-mono px-2 py-0.2 rounded-full bg-rose-600 text-white font-bold">
                  LIVE IVR CALL
                </span>
              </div>
              <div className="text-[9.5px] text-amber-200 truncate mt-0.5 font-normal">
                Female AI operator calls user: "Account paused... Press 1 for KYC... Ask for 4-digit OTP" & In-line Terminated!
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Active In-Line Neural Scanning Banner */}
      {loading && (
        <div className="bg-emerald-950/90 border-t border-emerald-500/40 px-3 py-1.5 flex items-center justify-between text-[10px] font-mono text-emerald-300 animate-pulse">
          <div className="flex items-center gap-2">
            <RotateCw className="w-3 h-3 text-emerald-400 animate-spin" />
            <span>CyberGuard In-Line Deep Neural Inspection (&lt; 0.5s)...</span>
          </div>
          <span className="text-[9px] text-emerald-400/80 font-bold">Kernel Netfilter Active</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. BOTTOM INPUT BAR (TEXT / MIC / CAMERA) - MOBILE OPTIMIZED */}
      {/* =================================================================== */}
      <div className="bg-[#202C33] p-2.5 pb-4 sm:pb-2.5 flex items-center gap-2 border-t border-[#2A3942] sticky bottom-0 z-30 shadow-lg">
        {/* Hidden Camera File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageFileChange}
          className="hidden"
        />

        {/* Snap Photo Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading || isRecording}
          title="Snap Camera Photo"
          className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-slate-200 flex items-center justify-center cursor-pointer active:scale-90 transition-transform shrink-0"
        >
          <Camera className="w-5 h-5 text-cyan-400" />
        </button>

        {/* Voice Note Mic Button */}
        {isRecording ? (
          <button
            onClick={stopRecording}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse cursor-pointer shrink-0"
          >
            <Square className="w-4 h-4" />
            <span>Stop ({recordingSeconds}s)</span>
          </button>
        ) : (
          <button
            onClick={startRecording}
            disabled={loading}
            title="Record Voice Note"
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-slate-200 flex items-center justify-center cursor-pointer active:scale-90 transition-transform shrink-0"
          >
            <Mic className="w-5 h-5 text-indigo-400" />
          </button>
        )}

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={
            currentDevice === 'PHONE_A'
              ? activeChannel === 'EMAIL'
                ? 'Compose spear-phishing email (e.g. Dear Employee, payroll direct deposit...)'
                : 'Type realistic lure (e.g., Hello user, Your scholarship is approved...)'
              : activeChannel === 'EMAIL'
              ? 'Reply via OKCL secure email...'
              : 'Reply to Phone A...'
          }
          className="flex-1 bg-[#2A3942] text-white text-xs px-3.5 py-2.5 rounded-2xl focus:outline-none placeholder-slate-400 border border-transparent focus:border-emerald-500/50"
        />

        {/* Send Button */}
        <button
          onClick={() => handleSendMessage()}
          disabled={loading || !inputText.trim()}
          className="w-10 h-10 rounded-full bg-[#00A884] hover:bg-[#008F6F] flex items-center justify-center text-white cursor-pointer transition-all active:scale-90 disabled:opacity-40 shrink-0 shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive AI Voice Scam Call Simulator Modal */}
      <AiScamCallModal
        isOpen={isScamCallModalOpen}
        onClose={() => setIsScamCallModalOpen(false)}
        victimName={currentDevice === 'PHONE_A' ? 'Phone B (Protected Endpoint)' : 'Phone A'}
        victimPhone="+91 98610 44219"
        onCallIntercepted={() => fetchCircleMembers()}
      />
    </div>
  );
};

export default RemoteAttackerSimulator;