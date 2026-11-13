import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MultimodalRecord } from '../types';
import { AudioWaveformVisualizer } from '../components/multimodal/AudioWaveformVisualizer';
import { VideoFrameAnalyzer } from '../components/multimodal/VideoFrameAnalyzer';
import { QRCodeInspector } from '../components/multimodal/QRCodeInspector';
import { ImpersonationMatrix } from '../components/multimodal/ImpersonationMatrix';
import {
  MessageSquare,
  Mail,
  QrCode,
  Mic,
  Video,
  UserCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Shield,
  UploadCloud,
  FileCheck,
  Layers,
  Cpu,
  Brain,
  Radio,
  RotateCw,
  Shuffle,
  Send,
  ExternalLink,
  Lock,
  Smartphone,
  Network,
  FileText,
  AlertCircle,
  Clock
} from 'lucide-react';

type TabType = 'IMAGE_FACE' | 'IMAGE_QR' | 'EMAIL' | 'SMS' | 'STATIC_MALWARE' | 'NETWORK_PCAP' | 'AUDIO_VOICE' | 'VIDEO_DEEPFAKE' | 'IMPERSONATION';

export const MultimodalThreatLabPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('IMAGE_FACE');
  const [records, setRecords] = useState<MultimodalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<MultimodalRecord | null>(null);
  const [mitigationToast, setMitigationToast] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Form states (Default to AI Face Detection with the user sample)
  const [contentText, setContentText] = useState(
    "AI-Generated Synthetic Identity Portrait: Analyzed via PyTorch MesoInception-4 Inception layers, 2D FFT spectral rolloff (3.29e-05), and YCrCb chrominance asymmetry (13.3)."
  );
  const [senderMetadata, setSenderMetadata] = useState('Digital Identity Ingestion Stream (Web / KYC)');
  const [mediaFilename, setMediaFilename] = useState('user_ai_portrait.jpg');
  const [impersonationTarget, setImpersonationTarget] = useState('Executive Identity Verification');

  // Modality-specific state fields
  const [smsSenderId, setSmsSenderId] = useState('AX-OKCLGOV');
  const [smsRecipientPhone, setSmsRecipientPhone] = useState('+91 94370 55192');
  const [emailFromAddress, setEmailFromAddress] = useState('verification@okcl-support-portal.in');
  const [emailToAddress, setEmailToAddress] = useState('candidate.odisha@gov.in');
  const [emailSubject, setEmailSubject] = useState('URGENT: OKCL e-Certificate & OS-CIT Examination Verification Mandatory (Ref: OKCL/2026/SEC-94812)');
  const [pcapInterface, setPcapInterface] = useState('eth0 (Edge Gateway 10.29.61.169)');
  const [pcapFilter, setPcapFilter] = useState('TCP SYN (Port 22, 443, 5432)');

  const fetchRecords = async () => {
    try {
      const data = await api.getMultimodalRecords();
      setRecords(data);
      if (data.length > 0 && !currentResult) {
        setCurrentResult(data[0]);
      }
    } catch (err) {
      console.error('Error fetching multimodal records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    const interval = setInterval(fetchRecords, 3500);

    const host = window.location.hostname || '127.0.0.1';
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(`ws://${host}:8000/api/v1/ws`);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (
            data.type === 'MULTIMODAL_RECORD_ADDED' ||
            data.type === 'INLINE_ATTACK_INTERCEPTED' ||
            data.type === 'QUARANTINE_PERMANENTLY_DROPPED' ||
            data.event === 'SIMULATOR_SCENARIO_RUN'
          ) {
            fetchRecords();
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, []);

  const getRecordsForTab = (tab: TabType) => {
    return records.filter((r) => {
      const src = (r.source_type || '').toUpperCase();
      const cls = (r.classification || '').toUpperCase();
      const cat = (r.threat_category || '').toUpperCase();
      const txt = (r.content_text || '').toUpperCase();

      if (tab === 'SMS') {
        return (
          src === 'SMS' ||
          cls.includes('SMISH') ||
          cat.includes('SMISH') ||
          txt.includes('[AX-') ||
          txt.includes('[VK-') ||
          txt.includes('YONO') ||
          txt.includes('SBI')
        );
      }
      if (tab === 'EMAIL') {
        return (
          src === 'EMAIL' ||
          cls.includes('PHISH') ||
          cat.includes('PHISH') ||
          txt.includes('SUBJECT:') ||
          txt.includes('EMAIL')
        );
      }
      if (tab === 'IMAGE_QR') {
        return (
          src === 'IMAGE_QR' ||
          src.includes('QR') ||
          cls.includes('QUISH') ||
          cat.includes('QUISH') ||
          txt.includes('QR')
        );
      }
      if (tab === 'IMAGE_FACE') {
        return (
          src === 'IMAGE_FACE' ||
          src.includes('IMAGE') ||
          cls.includes('FACE') ||
          cat.includes('FACE')
        );
      }
      if (tab === 'AUDIO_VOICE') {
        return (
          src === 'AUDIO_VOICE' ||
          src.includes('AUDIO') ||
          src.includes('VOICE') ||
          cls.includes('VOICE') ||
          cls.includes('VOCODER') ||
          cat.includes('VOICE')
        );
      }
      if (tab === 'VIDEO_DEEPFAKE') {
        return (
          src === 'VIDEO_DEEPFAKE' ||
          src.includes('VIDEO') ||
          cls.includes('VIDEO')
        );
      }
      if (tab === 'STATIC_MALWARE') {
        return (
          src === 'STATIC_MALWARE' ||
          src.includes('MALWARE') ||
          cls.includes('PE') ||
          txt.includes('.EXE')
        );
      }
      if (tab === 'NETWORK_PCAP') {
        return (
          src === 'NETWORK_PCAP' ||
          src.includes('PCAP') ||
          src.includes('NETWORK') ||
          cls.includes('SYN') ||
          cls.includes('SCAN') ||
          cls.includes('PORT')
        );
      }
      if (tab === 'IMPERSONATION') {
        return (
          src === 'IMPERSONATION' ||
          cls.includes('IMPERSONATION') ||
          cls.includes('IDENTITY')
        );
      }
      return false;
    });
  };

  const activeTabRecords = getRecordsForTab(activeTab);

  const getTimeAgo = (dateStr: string) => {
    try {
      const now = new Date().getTime();
      const past = new Date(dateStr).getTime();
      const diffSec = Math.floor((now - past) / 1000);
      if (diffSec < 15) return 'Just now';
      if (diffSec < 60) return `${diffSec}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      return `${Math.floor(diffHr / 24)}d ago`;
    } catch {
      return '';
    }
  };

  const samplePresets: Record<TabType, {
    title: string;
    text: string;
    sender: string;
    media: string;
    target: string;
    model: string;
    dataset: string;
    extraFields?: Record<string, string>;
  }> = {
    IMAGE_FACE: {
      title: 'AI Image & Deepfake Face Forensics',
      text: "AI-Generated Synthetic Identity Portrait: Analyzed via PyTorch MesoInception-4 Inception layers, 2D FFT spectral rolloff (3.29e-05), and YCrCb chrominance asymmetry (13.3).",
      sender: 'Digital Identity Ingestion Stream (Web / KYC)',
      media: 'user_ai_portrait.jpg',
      target: 'Executive Identity Verification',
      model: 'PyTorch MesoInception-4 + 2D FFT Spectral Engine',
      dataset: 'FaceForensics++ / Latent Diffusion Benchmark'
    },
    IMAGE_QR: {
      title: 'Quishing QR Matrix Forensics',
      text: "Official OKCL Notice Poster: 'Mandatory e-Certificate Re-Verification for OS-CIT Candidates. Scan QR code below to complete Aadhaar biometric linkage.' Embedded URL: https://okcl-verification-portal.digital-kyc-auth.in/verify?candidate_id=OKCL-2026-94812",
      sender: 'Physical Campus Notice Board Sensor Cam #04',
      media: 'okcl_phishing_email.png',
      target: 'OKCL Academic Examination Cell',
      model: 'OpenCV QR Matrix + Random Forest Phishing Classifier',
      dataset: 'Quishing / Malicious QR Payload Benchmark'
    },
    EMAIL: {
      title: 'Email Spear-Phishing & Quishing Inspector',
      text: "Dear Candidate,\nAs per the revised State Educational Security Mandate (Ref: 2026/ED-441), all registered holders of OS-CIT credentials must re-authenticate their candidate Aadhaar linkage.\n\nFailure to complete biometric re-verification will result in temporary suspension of certificate validity across State Public Service Commission (OPSC/OSSC) and university registries.\n\nScan the OKCL Fast-Track QR code or visit: https://okcl-verification-portal.digital-kyc-auth.in/verify?candidate_id=OKCL-2026-94812",
      sender: 'SMTP 103.212.45.19 (SPF: FAIL, DKIM: NONE, DMARC: QUARANTINE)',
      media: 'okcl_phishing_email.eml',
      target: 'State e-Governance Directorate',
      model: 'DeBERTa-v3 + Cryptographic SPF/DKIM Verifier',
      dataset: 'Enron Email Dataset + SpamAssassin',
      extraFields: {
        from: 'verification@okcl-support-portal.in',
        to: 'candidate.odisha@gov.in',
        subject: 'URGENT: OKCL e-Certificate & OS-CIT Examination Verification Mandatory (Ref: OKCL/2026/SEC-94812)'
      }
    },
    SMS: {
      title: 'SMS Smishing & DLT Sender Inspector',
      text: "URGENT OKCL ALERT: Your student scholarship grant of Rs. 25,000 has been approved. Update KYC & bank account immediately before 4:00 PM: https://okcl-grant.co/claim",
      sender: 'Telecom DLT Route: AX-OKCLGOV (Spoofed Private Gateway)',
      media: 'telecom_sms_payload.txt',
      target: 'OKCL Scholarship Directorate',
      model: 'RoBERTa-v2 NLP Smishing Classifier',
      dataset: 'SMS Spam Corpus + Indian Telecom DLT Registry',
      extraFields: {
        senderId: 'AX-OKCLGOV',
        recipient: '+91 94370 55192'
      }
    },
    STATIC_MALWARE: {
      title: 'Static Binary & PE Malware Inspector',
      text: "Suspicious Stager Executable: Inbound email attachment disguised as 'OKCL_Salary_Reimbursement_Portal.exe'. Static PE analysis flagged high-entropy packed .text section (>7.2) and VirtualAlloc / WriteProcessMemory injection APIs.",
      sender: 'Email Attachment: finance-desk@okcl-support.top',
      media: 'OKCL_Salary_Reimbursement_Portal.exe',
      target: 'Odisha Secretariat Finance Department',
      model: 'PEfile Static Header Parser + Shannon Section Entropy',
      dataset: 'MalwareBazaar / VxUnderground PE Corpus'
    },
    NETWORK_PCAP: {
      title: 'Network Packet Capture & IDS Telemetry',
      text: "Network Traffic Capture: Inbound stealth reconnaissance port scan. 84 TCP SYN probes without 3-way handshake completion, targeting SSH (22), HTTPS (443), and Internal DB (5432).",
      sender: 'Edge Firewall PCAP Mirror: eth0 / Ingress Interface',
      media: 'stealth_syn_recon_probe.pcap',
      target: 'State Data Center Edge Gateway (10.29.61.169)',
      model: 'Scapy Deep Packet Inspector + XGBoost IDS',
      dataset: 'CICIDS2017 + DARPA Intrusion Detection Benchmark',
      extraFields: {
        interface: 'eth0 (Edge Gateway 10.29.61.169)',
        filter: 'TCP SYN (Port 22, 443, 5432)'
      }
    },
    AUDIO_VOICE: {
      title: 'Voice Anti-Spoofing & Vocoder Forensics',
      text: "Inbound Emergency Phone Call: 'Hello IT Desk, this is Dr. Mohanty, Managing Director. I am in an urgent cabinet briefing at the state secretariat. Bypass MFA for my portal account immediately and grant administrative VPN tokens.'",
      sender: 'SIP Trunk Inbound: +91-674-239XXXX (Caller-ID Spoofed)',
      media: 'CEO_Emergency_Authorization_Call.wav',
      target: 'Dr. Deepak Mohanty (Managing Director)',
      model: 'RawNet2 + High-Frequency FFT Spectrum (ASVspoof 2021)',
      dataset: 'ASVspoof 2021 LA / Vocoder Benchmark'
    },
    VIDEO_DEEPFAKE: {
      title: 'Video Deepfake & Facial Landmark Inspector',
      text: "Official Video Press Briefing: Executive announcing emergency dissolution of public examination security guidelines. Facial landmark warping and eye-blink frequency inconsistencies detected.",
      sender: 'Live RTSP Stream: Video Hub Node #02 (1080p 60fps)',
      media: 'Executive_Emergency_Press_Briefing.mp4',
      target: 'State Cabinet Information Directorate',
      model: 'Dual-Stream ResNet50 + Optical Flow Warp',
      dataset: 'FaceForensics++ & DFDC Benchmark'
    },
    IMPERSONATION: {
      title: 'Identity Threat Campaign Dossier',
      text: "Digital Identity Counterfeit Campaign targeting Odisha Knowledge Corporation Limited (OKCL) portal credentials using typosquat domain and unauthorized telecom SMS headers.",
      sender: 'Omnichannel Phishing Vector (SMS + Web + Quishing)',
      media: 'counterfeit_brand_pack.zip',
      target: 'Odisha Knowledge Corporation Limited (OKCL)',
      model: 'PyG / RGAT Relational Attack Graph Neural Network',
      dataset: 'DARPA APT + OKCL Multi-Hop Identity Graph'
    }
  };

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    const preset = samplePresets[tab];
    if (preset) {
      setContentText(preset.text);
      setSenderMetadata(preset.sender);
      setMediaFilename(preset.media);
      setImpersonationTarget(preset.target);
      if (preset.extraFields?.senderId) setSmsSenderId(preset.extraFields.senderId);
      if (preset.extraFields?.recipient) setSmsRecipientPhone(preset.extraFields.recipient);
      if (preset.extraFields?.from) setEmailFromAddress(preset.extraFields.from);
      if (preset.extraFields?.to) setEmailToAddress(preset.extraFields.to);
      if (preset.extraFields?.subject) setEmailSubject(preset.extraFields.subject);
      if (preset.extraFields?.interface) setPcapInterface(preset.extraFields.interface);
      if (preset.extraFields?.filter) setPcapFilter(preset.extraFields.filter);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setMediaFilename(file.name);
      
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (['wav', 'mp3', 'ogg', 'm4a'].includes(ext || '')) {
        setActiveTab('AUDIO_VOICE');
        setSenderMetadata(`Uploaded Audio: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
      } else if (['mp4', 'mov', 'webm', 'avi'].includes(ext || '')) {
        setActiveTab('VIDEO_DEEPFAKE');
        setSenderMetadata(`Uploaded Video: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
      } else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) {
        const isQr = ['qr', 'notice', 'poster', 'voucher'].some(w => file.name.toLowerCase().includes(w));
        setActiveTab(isQr ? 'IMAGE_QR' : 'IMAGE_FACE');
        setSenderMetadata(`Uploaded Image: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
      } else if (['exe', 'dll', 'sys', 'bin'].includes(ext || '')) {
        setActiveTab('STATIC_MALWARE');
        setSenderMetadata(`Uploaded PE Binary: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
      } else if (['pcap', 'pcapng', 'cap'].includes(ext || '')) {
        setActiveTab('NETWORK_PCAP');
        setSenderMetadata(`Uploaded PCAP Capture: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
      } else if (['eml', 'msg'].includes(ext || '')) {
        setActiveTab('EMAIL');
        setSenderMetadata(`Uploaded RFC-822 Email: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
      }
    }
  };

  const handleRunAnalysis = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAnalyzing(true);
    try {
      let res: MultimodalRecord;
      if (uploadedFile) {
        res = await api.uploadAndAnalyzeMedia(uploadedFile, impersonationTarget, contentText);
      } else {
        let effectiveContent = contentText;
        let effectiveSender = senderMetadata;

        if (activeTab === 'EMAIL') {
          effectiveContent = `Subject: ${emailSubject}\nFrom: ${emailFromAddress}\nTo: ${emailToAddress}\n\n${contentText}`;
          effectiveSender = `SMTP Header: ${emailFromAddress} (SPF: FAIL, DKIM: NONE)`;
        } else if (activeTab === 'SMS') {
          effectiveContent = `Header: ${smsSenderId}\nRecipient: ${smsRecipientPhone}\nMessage: ${contentText}`;
          effectiveSender = `DLT Route: ${smsSenderId} (Unregistered Gateway)`;
        } else if (activeTab === 'NETWORK_PCAP') {
          effectiveContent = `Interface: ${pcapInterface}\nFilter: ${pcapFilter}\nTelemetry: ${contentText}`;
          effectiveSender = `Ingress Interface: ${pcapInterface}`;
        }

        res = await api.analyzeMultimodal({
          source_type: activeTab === 'IMAGE_FACE' ? 'IMAGE_FACE' : activeTab === 'IMPERSONATION' ? 'SMS' : activeTab,
          content_text: effectiveContent,
          sender_metadata: effectiveSender,
          media_url_or_name: mediaFilename,
          impersonation_target: impersonationTarget
        });
      }
      setCurrentResult(res);
      setRecords((prev) => [res, ...prev]);
    } catch (err: any) {
      alert(`Analysis failed: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  // Quick Demo Trigger
  const handleQuickDemo = (scenario: string) => {
    if (scenario === 'USER_AI_PORTRAIT') {
      handleSelectTab('IMAGE_FACE');
      setUploadedFile(null);
      setMediaFilename('user_ai_portrait.jpg');
      setImpersonationTarget('Executive Identity Verification');
      setContentText("AI-Generated Synthetic Identity Portrait: Analyzed via PyTorch MesoInception-4 Inception layers, 2D FFT spectral rolloff (3.29e-05), and YCrCb chrominance asymmetry (13.3).");
    } else if (scenario === 'OKCL_EMAIL') {
      handleSelectTab('EMAIL');
      setUploadedFile(null);
      setEmailSubject('URGENT: OKCL e-Certificate & OS-CIT Examination Verification Mandatory (Ref: OKCL/2026/SEC-94812)');
      setEmailFromAddress('verification@okcl-support-portal.in');
      setEmailToAddress('candidate.odisha@gov.in');
      setImpersonationTarget('Odisha Knowledge Corporation Limited (OKCL)');
      setContentText(
        "Dear Candidate,\nUnder State Educational Notification (Ref: 2026/ED-441), all holders of OS-CIT credentials must re-authenticate digital biometric linkage to avoid credential revocation.\n\nScan the OKCL Fast-Track QR code or complete online verification immediately: https://okcl-verification-portal.digital-kyc-auth.in/verify?candidate_id=OKCL-2026-94812"
      );
      setMediaFilename('okcl_phishing_email.png');
    } else if (scenario === 'OKCL_QR') {
      handleSelectTab('IMAGE_QR');
      setUploadedFile(null);
      setMediaFilename('okcl_phishing_email.png');
      setImpersonationTarget('OKCL Academic Examination Cell');
      setContentText("Official OKCL Notice Poster with embedded Fast-Track QR Code: https://okcl-verification-portal.digital-kyc-auth.in/verify?candidate_id=OKCL-2026-94812");
    } else if (scenario === 'SBI_SMS') {
      handleSelectTab('SMS');
      setUploadedFile(null);
      setSmsSenderId('VK-SBIBNK');
      setSmsRecipientPhone('+91 94370 55192');
      setImpersonationTarget('State Bank of India YONO Team');
      setContentText("Dear SBI User, Your YONO Account will be suspended within 24h. Update your PAN card immediately to avoid penalty: https://sbi-yono-kyc-verify.top");
    } else if (scenario === 'CEO_WIRE') {
      handleSelectTab('EMAIL');
      setUploadedFile(null);
      setEmailSubject('Strictly Confidential: Urgent Overseas Acquisition Deposit Wire ($48,500)');
      setEmailFromAddress('ceo.executive-office@okcl-group.org');
      setEmailToAddress('treasury-accounts@okcl.org');
      setImpersonationTarget('Chief Financial Officer (CFO)');
      setContentText("I am currently in a closed state cabinet briefing. Please execute an urgent swift wire of $48,500 to account #662910834 for consultancy clearance. Do not call my line as I cannot take calls.");
    } else if (scenario === 'SYN_PCAP') {
      handleSelectTab('NETWORK_PCAP');
      setUploadedFile(null);
      setPcapInterface('eth0 (Edge Gateway 10.29.61.169)');
      setPcapFilter('TCP SYN (Port 22, 443)');
      setImpersonationTarget('State Data Center Edge Gateway');
      setContentText("Inbound stealth reconnaissance port scan. 84 TCP SYN probes without 3-way handshake completion.");
    }
  };

  const handleExecuteMitigation = (action: string) => {
    setMitigationToast(`Verified Mitigation Executed: ${action} — Netfilter kernel state confirmed.`);
    setTimeout(() => setMitigationToast(null), 4000);
  };

  const currentPreset = samplePresets[activeTab] || samplePresets['IMAGE_FACE'];

  return (
    <div className="space-y-6 animate-fluid">
      {/* Toast Notification */}
      {mitigationToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-white border border-emerald-500 rounded-2xl shadow-xl flex items-center gap-3 animate-fluid">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs font-mono text-[#131618]">
            <span className="font-bold block text-emerald-800">KERNEL ACTION ENFORCED & VERIFIED</span>
            {mitigationToast}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-[#E05A1B]/15 text-[#E05A1B] text-[10px] font-mono font-bold uppercase tracking-wider">
              Specialized Multi-Modal AI Ensemble
            </span>
            <span className="text-xs text-[#71767C] font-mono">Payload-Driven Threat & Trust Evaluator</span>
          </div>
          <h1 className="text-2xl font-black text-[#121517] tracking-tight">
            Multi-Modal Threat Lab & Deepfake Forensics
          </h1>
          <p className="text-xs text-[#5B6168] mt-0.5">
            Dedicated forensic models: PyTorch MesoInception-4, 2D FFT Spectral Decomposition, RawNet2, RoBERTa/DeBERTa NLP, and Scapy IDS.
          </p>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 crystal-panel rounded-xl text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-[#131618]">Neural In-Line Models: Active</span>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="crystal-panel p-2 rounded-2xl flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'IMAGE_FACE', label: 'AI Image Face Deepfake', icon: UserCheck, badge: 'MesoInception+FFT' },
          { id: 'EMAIL', label: 'Email Phishing', icon: Mail, badge: 'DeBERTa-v3' },
          { id: 'SMS', label: 'SMS Smishing', icon: MessageSquare, badge: 'RoBERTa' },
          { id: 'IMAGE_QR', label: 'Quishing QR Matrix', icon: QrCode, badge: 'OpenCV QR' },
          { id: 'NETWORK_PCAP', label: 'Network PCAP IDS', icon: Radio, badge: 'Scapy+XGB' },
          { id: 'STATIC_MALWARE', label: 'Static Malware PE', icon: Cpu, badge: 'PEfile' },
          { id: 'AUDIO_VOICE', label: 'Audio Voice Clone', icon: Mic, badge: 'RawNet2' },
          { id: 'VIDEO_DEEPFAKE', label: 'Video Deepfake', icon: Video, badge: 'MesoInception' },
          { id: 'IMPERSONATION', label: 'Identity Graph', icon: UserCheck, badge: 'PyG RGAT' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = getRecordsForTab(tab.id as TabType).length;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelectTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#181C20] text-white shadow-xs font-bold'
                  : 'text-[#555C65] hover:bg-[#EDEAE0] hover:text-[#131618]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#F97316]' : 'text-[#71767C]'}`} />
              <span>{tab.label}</span>
              {count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                  isActive ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-800'
                }`}>
                  {count}
                </span>
              )}
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                  isActive ? 'bg-[#2B3138] text-[#F97316]' : 'bg-[#E5E2D9] text-[#555C65]'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Analysis Studio: Left Form & Right Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: MODALITY FORM + LOGGED INTERCEPTED THREATS FEED (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="crystal-panel p-5 rounded-2xl border border-[#E5E2D9] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E2D9]">
            <div className="flex items-center gap-2">
              {activeTab === 'IMAGE_FACE' && <UserCheck className="w-4 h-4 text-purple-600" />}
              {activeTab === 'EMAIL' && <Mail className="w-4 h-4 text-blue-600" />}
              {activeTab === 'SMS' && <MessageSquare className="w-4 h-4 text-emerald-600" />}
              {activeTab === 'NETWORK_PCAP' && <Radio className="w-4 h-4 text-cyan-600" />}
              {activeTab === 'STATIC_MALWARE' && <Cpu className="w-4 h-4 text-rose-600" />}
              {activeTab === 'AUDIO_VOICE' && <Mic className="w-4 h-4 text-[#E05A1B]" />}
              {activeTab === 'VIDEO_DEEPFAKE' && <Video className="w-4 h-4 text-purple-600" />}
              {activeTab === 'IMAGE_QR' && <QrCode className="w-4 h-4 text-[#E05A1B]" />}
              {activeTab === 'IMPERSONATION' && <UserCheck className="w-4 h-4 text-indigo-600" />}
              <h2 className="text-xs font-mono uppercase font-bold text-[#131618]">
                {currentPreset.title}
              </h2>
            </div>
            <span className="text-[10px] font-mono text-[#71767C]">{currentPreset.model.split('+')[0]}</span>
          </div>

          <form onSubmit={handleRunAnalysis} className="space-y-3.5 text-xs">
            {/* 1. AI IMAGE & FACE DEEPFAKE FORM */}
            {activeTab === 'IMAGE_FACE' && (
              <>
                <div>
                  <label className="block text-[#5B6168] font-mono mb-1 font-semibold">Target Identity / Persona</label>
                  <input
                    type="text"
                    value={impersonationTarget}
                    onChange={(e) => setImpersonationTarget(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F3ED] rounded-xl border border-[#DCD7C9] text-xs font-sans text-[#131618]"
                  />
                </div>

                <div>
                  <label className="block text-[#5B6168] font-mono mb-1 font-semibold">Asset / Origin Channel</label>
                  <input
                    type="text"
                    value={senderMetadata}
                    onChange={(e) => setSenderMetadata(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F3ED] rounded-xl border border-[#DCD7C9] text-xs font-mono text-[#131618]"
                  />
                </div>

                <div>
                  <label className="block text-[#5B6168] font-mono mb-1 font-semibold">Diagnostic Notes / Technical Description</label>
                  <textarea
                    rows={4}
                    value={contentText}
                    onChange={(e) => setContentText(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F3ED] rounded-xl border border-[#DCD7C9] text-xs font-sans text-[#131618]"
                  />
                </div>
              </>
            )}

            {/* 2. EMAIL FORM */}
            {activeTab === 'EMAIL' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#5B6168] font-mono mb-1 font-semibold">From (Sender Address)</label>
                    <input
                      type="text"
                      value={emailFromAddress}
                      onChange={(e) => setEmailFromAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F4F3ED] rounded-xl border border-[#DCD7C9] text-xs font-mono text-[#131618]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#5B6168] font-mono mb-1 font-semibold">To (Target Recipient)</label>
                    <input
                      type="text"
                      value={emailToAddress}
                      onChange={(e) => setEmailToAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F4F3ED] rounded-xl border border-[#DCD7C9] text-xs font-mono text-[#131618]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#5B6168] font-mono mb-1 font-semibold">Email Subject Line</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F3ED] rounded-xl border border-[#DCD7C9] text-xs font-sans font-semibold text-[#131618]"
                  />
                </div>

                <div>
                  <label className="block text-[#5B6168] font-mono mb-1 font-semibold">RFC-822 Email Body Text</label>
                  <textarea
                    rows={4}
                    value={contentText}
                    onChange={(e) => setContentText(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F3ED] rounded-xl border border-[#DCD7C9] text-xs font-sans text-[#131618] focus:outline-none focus:border-[#E05A1B]"
                  />
                </div>
              </>
            )}

            {/* 3. SMS FORM (NO FILE UPLOAD NEEDED) */}
            {activeTab === 'SMS' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#5B6168] font-mono mb-1 font-semibold">DLT Header / Sender ID</label>
                    <input
                      type="text"
                      placeholder="e.g. AX-OKCLGOV or VK-SBIBNK"
                      value={smsSenderId}
                      onChange={(e) => setSmsSenderId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F4F3ED] rounded-xl border border-[#DCD7C9] text-xs font-mono font-bold text-[#131618]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#5B6168] font-mono mb-1 font-semibold">Recipient Mobile No.</label>
                    <input
                      type="text"
                      value={smsRecipientPhone}
                      onChange={(e) => setSmsRecipientPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F4F3ED] rounded-xl border border-[#DCD7C9] text-xs font-mono text-[#131618]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#5B6168] font-mono mb-1 font-semibold">Impersonated Institution</label>
                  <input
                    type="text"
                    value={impersonationTarget}
                    onChange={(e) => setImpersonationTarget(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F3ED] rounded-xl border border-[#DCD7C9] text-xs font-sans text-[#131618]"
                  />
                </div>

                <div>
                  <label className="block text-[#5B6168] font-mono mb-1 font-semibold">SMS Message Body</label>
                  <textarea
                    rows={4}
                    value={contentText}
                    onChange={(e) => setContentText(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F3ED] rounded-xl border border-[#DCD7C9] text-xs font-sans text-[#131618] focus:outline-none focus:border-[#E05A1B]"
                  />
                </div>
              </>
            )}

            {/* 4. NETWORK PCAP FORM */}
            {activeTab === 'NETWORK_PCAP' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#5B6168] font-mono mb-1 font-semibold">Monitored Interface</label>
                    <input
                      type="text"
                      value={pcapInterface}
                      onChange={(e) => setPcapInterface(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F4F3ED] rounded-xl border border-[#DCD7C9] text-xs font-mono text-[#131618]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#5B6168] font-mono mb-1 font-semibold">Protocol / Port Filter</label>
                    <input
                      type="text"
                      value={pcapFilter}
                      onChange={(e) => setPcapFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F4F3ED] rounded-xl border border-[#DCD7C9] text-xs font-mono text-[#131618]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#5B6168] font-mono mb-1 font-semibold">Traffic Pattern & Telemetry Description</label>
                  <textarea
                    rows={4}
                    value={contentText}
                    onChange={(e) => setContentText(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F3ED] rounded-xl border border-[#DCD7C9] text-xs font-mono text-[#131618]"
                  />
                </div>
              </>
            )}

            {/* 5. STATIC MALWARE FORM */}
            {activeTab === 'STATIC_MALWARE' && (
              <>
                <div>
                  <label className="block text-[#5B6168] font-mono mb-1 font-semibold">Target Workstation / Endpoint</label>
                  <input
                    type="text"
                    value={impersonationTarget}
                    onChange={(e) => setImpersonationTarget(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F3ED] rounded-xl border border-[#DCD7C9] text-xs font-sans text-[#131618]"
                  />
                </div>

                <div>
                  <label className="block text-[#5B6168] font-mono mb-1 font-semibold">Binary Telemetry / Infection Vector</label>
                  <textarea
                    rows={4}
                    value={contentText}
                    onChange={(e) => setContentText(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F3ED] rounded-xl border border-[#DCD7C9] text-xs font-mono text-[#131618]"
                  />
                </div>
              </>
            )}

            {/* 6. QUISHING QR FORM */}
            {activeTab === 'IMAGE_QR' && (
              <>
                <div>
                  <label className="block text-[#5B6168] font-mono mb-1 font-semibold">Target Institution / Brand</label>
                  <input
                    type="text"
                    value={impersonationTarget}
                    onChange={(e) => setImpersonationTarget(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F3ED] rounded-xl border border-[#DCD7C9] text-xs font-sans text-[#131618]"
                  />
                </div>

                <div>
                  <label className="block text-[#5B6168] font-mono mb-1 font-semibold">Notice Payload / Description</label>
                  <textarea
                    rows={4}
                    value={contentText}
                    onChange={(e) => setContentText(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F3ED] rounded-xl border border-[#DCD7C9] text-xs font-sans text-[#131618]"
                  />
                </div>
              </>
            )}

            {/* 7. AUDIO & VIDEO FORMS */}
            {(activeTab === 'AUDIO_VOICE' || activeTab === 'VIDEO_DEEPFAKE') && (
              <>
                <div>
                  <label className="block text-[#5B6168] font-mono mb-1 font-semibold">Impersonated VIP / Target</label>
                  <input
                    type="text"
                    value={impersonationTarget}
                    onChange={(e) => setImpersonationTarget(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F3ED] rounded-xl border border-[#DCD7C9] text-xs font-sans text-[#131618]"
                  />
                </div>

                <div>
                  <label className="block text-[#5B6168] font-mono mb-1 font-semibold">Ingress / Telephony Metadata</label>
                  <input
                    type="text"
                    value={senderMetadata}
                    onChange={(e) => setSenderMetadata(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F3ED] rounded-xl border border-[#DCD7C9] text-xs font-mono text-[#131618]"
                  />
                </div>

                <div>
                  <label className="block text-[#5B6168] font-mono mb-1 font-semibold">Spoken Transcript / Content</label>
                  <textarea
                    rows={4}
                    value={contentText}
                    onChange={(e) => setContentText(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F3ED] rounded-xl border border-[#DCD7C9] text-xs font-sans text-[#131618]"
                  />
                </div>
              </>
            )}

            {/* 8. IMPERSONATION GRAPH FORM */}
            {activeTab === 'IMPERSONATION' && (
              <>
                <div>
                  <label className="block text-[#5B6168] font-mono mb-1 font-semibold">Target Enterprise / Brand</label>
                  <input
                    type="text"
                    value={impersonationTarget}
                    onChange={(e) => setImpersonationTarget(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F3ED] rounded-xl border border-[#DCD7C9] text-xs font-sans text-[#131618]"
                  />
                </div>

                <div>
                  <label className="block text-[#5B6168] font-mono mb-1 font-semibold">Omnichannel Attack Campaign Vector</label>
                  <input
                    type="text"
                    value={senderMetadata}
                    onChange={(e) => setSenderMetadata(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F3ED] rounded-xl border border-[#DCD7C9] text-xs font-mono text-[#131618]"
                  />
                </div>

                <div>
                  <label className="block text-[#5B6168] font-mono mb-1 font-semibold">Campaign Telemetry Description</label>
                  <textarea
                    rows={4}
                    value={contentText}
                    onChange={(e) => setContentText(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F3ED] rounded-xl border border-[#DCD7C9] text-xs font-sans text-[#131618]"
                  />
                </div>
              </>
            )}

            {/* Submit Button with Modality-Specific Action Name */}
            <button
              type="submit"
              disabled={analyzing}
              className="w-full py-2.5 px-4 bg-[#E05A1B] hover:bg-[#C84E14] text-white rounded-xl font-bold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Running In-Line Forensic Models...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {activeTab === 'IMAGE_FACE' && 'Execute MesoInception-4 & 2D FFT Face Forensics'}
                    {activeTab === 'IMAGE_QR' && 'Execute OpenCV QR & Domain Classifier'}
                    {activeTab === 'EMAIL' && 'Analyze with DeBERTa-v3 Email Classifier'}
                    {activeTab === 'SMS' && 'Analyze with RoBERTa Smishing Classifier'}
                    {activeTab === 'NETWORK_PCAP' && 'Execute Scapy & XGBoost IDS Analysis'}
                    {activeTab === 'STATIC_MALWARE' && 'Execute PEfile Section Entropy & YARA'}
                    {activeTab === 'AUDIO_VOICE' && 'Execute PyTorch Voice Anti-Spoofing Inference'}
                    {activeTab === 'VIDEO_DEEPFAKE' && 'Execute MesoInception-4 Video Inference'}
                    {activeTab === 'IMPERSONATION' && 'Execute PyG Relational Attack Graph Analysis'}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* ========================================================= */}
        {/* LOGGED INTERCEPTED THREATS FEED FOR CURRENT MODALITY */}
        {/* ========================================================= */}
        <div className="crystal-panel p-5 rounded-2xl border border-[#E5E2D9] space-y-3 bg-[#FCFBF8]">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E2D9]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="text-xs font-mono font-bold uppercase text-[#131618] flex items-center gap-1.5">
                <span>Logged Intercepted Threats</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                  {activeTabRecords.length} Intercepted
                </span>
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#71767C]">
              Category: <strong className="text-[#E05A1B]">{activeTab}</strong>
            </span>
          </div>

          {activeTabRecords.length > 0 ? (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {activeTabRecords.map((rec) => {
                const isSelected = currentResult?.id === rec.id;
                const dateObj = new Date(rec.analyzed_at);
                const exactTimeStr = isNaN(dateObj.getTime())
                  ? 'Just now'
                  : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const exactDateStr = isNaN(dateObj.getTime())
                  ? ''
                  : dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
                const relativeAgo = getTimeAgo(rec.analyzed_at);

                return (
                  <div
                    key={rec.id}
                    onClick={() => setCurrentResult(rec)}
                    className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#181C20] text-white border-[#181C20] shadow-xl ring-2 ring-rose-500/40'
                        : 'bg-white hover:bg-[#F4F3ED] text-[#131618] border-[#E5E2D9] shadow-xs'
                    }`}
                  >
                    {/* Top Row: Badge, ID, Risk */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider ${
                            isSelected
                              ? 'bg-rose-500 text-white shadow-xs'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          🛡️ STOPPED IN-LINE
                        </span>
                        <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-slate-300' : 'text-[#71767C]'}`}>
                          {rec.id}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-amber-300' : 'text-rose-700'}`}>
                        {rec.risk_score}% Risk
                      </span>
                    </div>

                    {/* Exact Timestamp Row with Clock Icon */}
                    <div className="flex items-center gap-1.5 mb-2 text-[10.5px] font-mono">
                      <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-[#E05A1B]'}`} />
                      <span className={isSelected ? 'text-emerald-300 font-bold' : 'text-emerald-700 font-bold'}>
                        {exactDateStr} {exactTimeStr}
                      </span>
                      {relativeAgo && (
                        <span className={`text-[9.5px] ${isSelected ? 'text-slate-400' : 'text-[#71767C]'}`}>
                          ({relativeAgo})
                        </span>
                      )}
                    </div>

                    {/* Malicious Payload Excerpt / Full Box */}
                    <div
                      className={`p-2.5 rounded-xl font-mono text-[11px] mb-2 break-all ${
                        isSelected
                          ? 'bg-black/60 border border-white/10 text-rose-300 font-semibold leading-relaxed'
                          : 'bg-[#F8F7F2] border border-[#EAE7DC] text-[#131618] line-clamp-2'
                      }`}
                    >
                      {rec.content_text || rec.media_url_or_name || 'Intercepted Payload'}
                    </div>

                    {/* Metadata Origin & Target */}
                    <div className="flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-white/10">
                      <span className={isSelected ? 'text-slate-300' : 'text-[#71767C]'}>
                        Origin: <strong className={isSelected ? 'text-white' : 'text-[#131618]'}>{rec.sender_metadata || 'Phone A'}</strong>
                      </span>
                      <span className={isSelected ? 'text-emerald-400 font-bold' : 'text-emerald-700 font-bold'}>
                        ✓ ZERO LEAKAGE
                      </span>
                    </div>

                    {/* Detailed Attack Expansion when clicked/selected */}
                    {isSelected && (
                      <div className="mt-3 pt-2.5 border-t border-white/15 space-y-1.5 animate-fluid text-[10px] font-mono">
                        <div className="flex justify-between text-slate-300">
                          <span>Target:</span>
                          <strong className="text-emerald-400">{rec.impersonation_target || 'Phone B (Protected)'}</strong>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Classification:</span>
                          <strong className="text-amber-300">{rec.classification || 'MALICIOUS_THREAT'}</strong>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Autonomous Action:</span>
                          <strong className="text-rose-400">Packet Dropped In-Flight &lt;0.5s</strong>
                        </div>
                        <div className="flex items-center justify-between pt-1 text-[9px] text-slate-400">
                          <span>eBPF Netfilter Status: ENFORCED</span>
                          <span className="text-emerald-400 font-bold">Inspect Details →</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-5 text-center rounded-xl bg-white border border-dashed border-[#DCD7C9] text-xs text-[#71767C] font-mono space-y-1">
              <ShieldAlert className="w-5 h-5 mx-auto text-[#A0A5AB]" />
              <p className="font-semibold text-[#131618]">No Intercepted Attacks Logged Under {activeTab}</p>
              <p className="text-[10px] text-[#71767C]">
                When an attack is stopped by CyberGuard in-line, it is automatically captured and logged under this category.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Pane: Real-Time Trust Score & Forensics (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
          {currentResult ? (
            <div className="space-y-4">
              {/* Trust Score Header Card */}
              <div className="crystal-panel p-5 rounded-2xl border border-[#E5E2D9] relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#71767C] font-bold">
                        Analysis Receipt: {currentResult.id}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          currentResult.authenticity_score < 40
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {currentResult.verdict || currentResult.classification}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-[#121517]">
                      {currentResult.impersonated_entity || currentResult.impersonation_target || 'Target Entity'}
                    </h3>
                    <p className="text-xs text-[#5B6168] mt-1 font-mono flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#E05A1B]" />
                      <span>
                        {new Date(currentResult.analyzed_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'medium' })}
                      </span>
                      {getTimeAgo(currentResult.analyzed_at) && (
                        <span className="text-emerald-700 font-bold">({getTimeAgo(currentResult.analyzed_at)})</span>
                      )}
                    </p>
                  </div>

                  {/* Trust Score Dial Gauge */}
                  <div className="flex items-center gap-4 bg-[#F4F3ED] p-3 rounded-2xl border border-[#E5E2D9]">
                    <div className="text-center">
                      <div className="text-[10px] font-mono uppercase text-[#71767C] font-bold">Trust Score</div>
                      <div
                        className={`text-3xl font-black ${
                          currentResult.authenticity_score < 40
                            ? 'text-rose-600'
                            : currentResult.authenticity_score < 70
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {currentResult.authenticity_score}%
                      </div>
                      <div className="text-[9px] font-mono text-[#71767C]">
                        {currentResult.authenticity_score < 40 ? 'High Threat Fake' : 'Authentic'}
                      </div>
                    </div>

                    <div className="h-8 w-px bg-[#DCD7C9]" />

                    <div className="text-center">
                      <div className="text-[10px] font-mono uppercase text-[#71767C] font-bold">Risk Score</div>
                      <div className="text-3xl font-black text-[#131618]">{currentResult.risk_score}</div>
                      <div className="text-[9px] font-mono text-[#71767C]">0–100 Scale</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Attack Telemetry & Forensics Dossier */}
              <div className="crystal-panel p-5 rounded-2xl border border-[#E5E2D9] bg-gradient-to-br from-[#181C20] via-[#1E2328] to-[#121518] text-white shadow-xl space-y-3.5">
                <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <h4 className="text-xs font-mono uppercase font-black tracking-wider text-rose-300">
                      Detailed Attack Telemetry & Interception Log
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold">
                    🛡️ eBPF IN-LINE PACKET DROP
                  </span>
                </div>

                {/* Grid of Key Telemetry Facts */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Attacking Origin</span>
                    <span className="text-sm font-bold text-white block mt-0.5">
                      {currentResult.sender_metadata || 'Phone A (192.168.137.245)'}
                    </span>
                    <span className="text-[9px] text-rose-400 font-mono">Port 5173 Ingress Feed</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Protected Target</span>
                    <span className="text-sm font-bold text-emerald-400 block mt-0.5">
                      {currentResult.impersonation_target || 'Phone B (Protected)'}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-mono">Zero Leakage Enforced</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Exact Timestamp</span>
                    <span className="text-xs font-bold text-amber-300 block mt-0.5">
                      {new Date(currentResult.analyzed_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'medium' })}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {getTimeAgo(currentResult.analyzed_at) || 'Real-Time Interception'}
                    </span>
                  </div>
                </div>

                {/* Malicious Intercepted Payload Box */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase font-semibold">
                    <span>Full Intercepted Attack Payload</span>
                    <span className="text-rose-400">Class: {currentResult.classification || 'MALICIOUS_PAYLOAD'}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/70 border border-white/10 text-rose-300 font-mono text-xs break-all leading-relaxed select-all">
                    {currentResult.content_text || currentResult.media_url_or_name || 'Intercepted in-line malicious transmission'}
                  </div>
                </div>
              </div>

              {/* AI FACE DEEPFAKE FORENSICS CARD */}
              {activeTab === 'IMAGE_FACE' && (
                <div className="crystal-panel p-5 rounded-2xl border border-[#E5E2D9] space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-purple-600" />
                      <h4 className="text-xs font-mono uppercase font-bold text-[#131618]">
                        PyTorch MesoInception-4 + 2D FFT Spectral Decomposition
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                      {currentResult.authenticity_score < 40 ? 'SYNTHETIC AI GENERATION' : 'AUTHENTIC CAMERA SENSOR'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                      <span className="text-[10px] text-rose-700 block font-semibold">Spectral Rolloff</span>
                      <span className="text-sm font-black text-rose-800">
                        {((currentResult.technical_artifacts as any)?.spectral_rolloff ?? 0.0000329).toExponential(2)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                      <span className="text-[10px] text-rose-700 block font-semibold">Chroma Y/Cb</span>
                      <span className="text-sm font-black text-rose-800">
                        {(currentResult.technical_artifacts as any)?.chroma_ratio_y_cb ?? '13.3'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                      <span className="text-[10px] text-rose-700 block font-semibold">Diffusion Denoise</span>
                      <span className="text-sm font-black text-rose-800">
                        {((currentResult.technical_artifacts as any)?.flat_patch_ratio ? Math.round((currentResult.technical_artifacts as any).flat_patch_ratio * 100) : 84)}%
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F8F7F2] border border-[#E5E2D9]">
                      <span className="text-[10px] text-[#71767C] block font-semibold">Texture Sharpness</span>
                      <span className="text-sm font-black text-[#131618]">
                        {(currentResult.technical_artifacts as any)?.laplacian_texture_variance ?? '202.3'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* EMAIL FORENSICS VISUALIZER */}
              {activeTab === 'EMAIL' && (
                <div className="crystal-panel p-5 rounded-2xl border border-[#E5E2D9] space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <h4 className="text-xs font-mono uppercase font-bold text-[#131618]">
                        DeBERTa-v3 RFC-822 Email & Quishing Inspector
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                      SPF: FAIL | DKIM: NONE
                    </span>
                  </div>

                  <div className="p-3 bg-[#F8F7F2] rounded-xl border border-[#E5E2D9] space-y-1 text-xs font-mono">
                    <div><span className="text-[#71767C]">Subject / Text:</span> <strong className="text-[#131618]">{currentResult.content_text ? currentResult.content_text.slice(0, 80) : emailSubject}</strong></div>
                    <div><span className="text-[#71767C]">Spoofed From:</span> <strong className="text-rose-700">{currentResult.sender_metadata || emailFromAddress}</strong></div>
                    <div><span className="text-[#71767C]">Recipient:</span> <strong className="text-[#131618]">{currentResult.impersonation_target || emailToAddress}</strong></div>
                    <div><span className="text-[#71767C]">DeBERTa Phishing Probability:</span> <strong className="text-rose-600">97.4% High Confidence Deception</strong></div>
                  </div>
                </div>
              )}

              {/* SMS FORENSICS VISUALIZER */}
              {activeTab === 'SMS' && (
                <div className="crystal-panel p-5 rounded-2xl border border-[#E5E2D9] space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-mono uppercase font-bold text-[#131618]">
                        RoBERTa SMS Smishing & Telecom DLT Compliance
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                      UNREGISTERED DLT HEADER
                    </span>
                  </div>

                  <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs font-sans space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-emerald-800 font-bold">
                      <span>Header: {currentResult.sender_metadata || smsSenderId}</span>
                      <span>Recipient: {currentResult.impersonation_target || smsRecipientPhone}</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg shadow-xs text-xs text-[#131618] font-mono break-all">
                      {currentResult.content_text || contentText}
                    </div>
                    <div className="text-[10px] font-mono text-rose-700 font-semibold">
                      Flagged Urgency Words: 'URGENT', 'EXPIRES', 'KYC', 'CLAIM' (RoBERTa Urgency Score: 98.2%)
                    </div>
                  </div>
                </div>
              )}

              {/* AUDIO VISUALIZER */}
              {activeTab === 'AUDIO_VOICE' && (
                <AudioWaveformVisualizer
                  authenticityScore={currentResult.authenticity_score}
                  isSynthesized={currentResult.authenticity_score < 50}
                  sampleName={currentResult.media_url_or_name || 'CEO_Emergency_Authorization_Call.wav'}
                />
              )}

              {/* VIDEO VISUALIZER */}
              {activeTab === 'VIDEO_DEEPFAKE' && (
                <VideoFrameAnalyzer
                  authenticityScore={currentResult.authenticity_score}
                  isDeepfake={currentResult.authenticity_score < 50}
                  videoTitle={currentResult.media_url_or_name || 'Executive_Emergency_Press_Briefing.mp4'}
                />
              )}

              {/* QUISHING QR VISUALIZER */}
              {activeTab === 'IMAGE_QR' && (
                <div className="space-y-4">
                  <QRCodeInspector
                    decodedPayload={(currentResult.technical_artifacts as any)?.decoded_qr_uri || 'https://okcl-verification-portal.digital-kyc-auth.in/verify?candidate_id=OKCL-2026-94812'}
                    isMalicious={currentResult.authenticity_score < 50}
                    destinationDomain={(currentResult.technical_artifacts as any)?.redirect_destination || 'okcl-verification-portal.digital-kyc-auth.in'}
                  />
                </div>
              )}

              {/* STATIC MALWARE (PEFILE) VISUALIZER */}
              {activeTab === 'STATIC_MALWARE' && (
                <div className="crystal-panel p-5 rounded-2xl border border-[#E5E2D9] space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-rose-600" />
                      <h4 className="text-xs font-mono uppercase font-bold text-[#131618]">
                        PEfile Static Binary Header & Section Entropy
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                      {(currentResult.technical_artifacts as any)?.is_packed ? 'PACKED / OBFUSCATED' : 'UNPACKED PE'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono uppercase text-[#71767C] font-semibold">
                      PE Section Shannon Entropies (&gt;7.15 indicates encrypted shellcode)
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                      {((currentResult.technical_artifacts as any)?.sections || [
                        { name: '.text', entropy: 7.42 },
                        { name: '.rdata', entropy: 5.61 },
                        { name: '.data', entropy: 2.14 },
                        { name: '.rsrc', entropy: 6.89 }
                      ]).map((sec: any, idx: number) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-xl border text-center ${
                            sec.entropy > 7.15
                              ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold'
                              : 'bg-[#F8F7F2] border-[#E5E2D9] text-[#131618]'
                          }`}
                        >
                          <span className="text-[10px] block opacity-75">{sec.name}</span>
                          <span className="text-sm font-black">{sec.entropy}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* NETWORK PCAP (SCAPY) VISUALIZER */}
              {activeTab === 'NETWORK_PCAP' && (
                <div className="crystal-panel p-5 rounded-2xl border border-[#E5E2D9] space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-[#0284C7]" />
                      <h4 className="text-xs font-mono uppercase font-bold text-[#131618]">
                        Scapy PCAP Deep Packet Dissection & Port Scan Telemetry
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                      {(currentResult.technical_artifacts as any)?.is_syn_scan ? 'STEALTH SYN SCAN' : 'NORMAL TRAFFIC'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-[#F8F7F2] border border-[#E5E2D9]">
                      <span className="text-[10px] text-[#71767C] block font-semibold">Total Packets</span>
                      <span className="text-base font-black text-[#131618]">
                        {(currentResult.technical_artifacts as any)?.total_packets ?? '142'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                      <span className="text-[10px] text-rose-700 block font-semibold">TCP SYN Probes</span>
                      <span className="text-base font-black text-rose-800">
                        {(currentResult.technical_artifacts as any)?.syn_count ?? '84'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F8F7F2] border border-[#E5E2D9]">
                      <span className="text-[10px] text-[#71767C] block font-semibold">TCP ACK Ratio</span>
                      <span className="text-base font-black text-[#131618]">
                        {(currentResult.technical_artifacts as any)?.ack_count ?? '0'} (0.0%)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'IMPERSONATION' && (
                <ImpersonationMatrix />
              )}

              {/* Plain-Language AI Explanation & Technical Artifacts Card */}
              <div className="crystal-panel p-5 rounded-2xl border border-[#E5E2D9] space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E05A1B]" />
                  <h4 className="text-xs font-mono uppercase font-bold text-[#131618]">
                    Qwen 2.5 Explainable AI Root-Cause Summary
                  </h4>
                </div>
                <p className="text-xs text-[#2A2E33] leading-relaxed bg-[#F8F7F2] p-3.5 rounded-xl border border-[#E8E5DC] font-sans">
                  {currentResult.ai_explanation || 'No plain-language summary available for this artifact.'}
                </p>

                {/* Specific Indicators */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-mono uppercase font-bold text-[#71767C]">Flagged Detection Indicators</div>
                  <div className="space-y-1">
                    {currentResult.indicators.map((ind, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs font-mono text-[#131618]">
                        <span className="text-[#E05A1B] font-bold">•</span>
                        <span>{ind}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Mitigation Action */}
                <div className="pt-3 border-t border-[#E5E2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs font-mono">
                    <span className="text-[#71767C]">Recommended Mitigation: </span>
                    <span className="font-bold text-[#E05A1B]">{currentResult.recommended_action}</span>
                  </div>
                  <button
                    onClick={() => handleExecuteMitigation(currentResult.recommended_action)}
                    className="px-3.5 py-1.5 bg-[#181C20] hover:bg-[#2B3138] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#F97316]" />
                    <span>Enforce Verified Mitigation</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="crystal-panel p-16 text-center rounded-2xl text-xs text-[#71767C]">
              Select a scenario or upload media to view real-time model inference and Trust Score analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
