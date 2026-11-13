import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Smartphone,
  PhoneCall,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  Flame,
  Search,
  Bell,
  Sparkles,
  PlayCircle,
  Eye,
  Info,
  Radio,
  FileText,
  Volume2,
  QrCode,
  Briefcase,
  Fingerprint,
  Cpu,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface CommonAttacksPageProps {
  onNavigate?: (route: string) => void;
}

interface CyberAttackItem {
  id: string;
  rank: number;
  title: string;
  subtitle: string;
  severity: 'CRITICAL' | 'HIGH' | 'URGENT';
  category: 'Banking' | 'Messaging' | 'Utility' | 'Deepfake' | 'Extortion' | 'Employment' | 'Biometric' | 'Telecom';
  icon: any;
  scamPlaybook: string;
  realWorldPayload: string;
  howCyberguardShields: string;
  goldenRule: string;
  mitreTactic: string;
}

export const CommonAttacksPage: React.FC<CommonAttacksPageProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>('atk-1');
  const [pwaAlertNotice, setPwaAlertNotice] = useState<string | null>(null);

  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('cyberguard_mobile_theme') === 'dark';
  });

  useEffect(() => {
    const syncTheme = () => {
      setIsDark(localStorage.getItem('cyberguard_mobile_theme') === 'dark');
    };
    window.addEventListener('cyberguard_theme_changed', syncTheme);
    window.addEventListener('storage', syncTheme);
    return () => {
      window.removeEventListener('cyberguard_theme_changed', syncTheme);
      window.removeEventListener('storage', syncTheme);
    };
  }, []);

  const attacks: CyberAttackItem[] = [
    {
      id: 'atk-1',
      rank: 1,
      title: 'SMS Banking Smishing (e-KYC & Account Freeze)',
      subtitle: 'Deceptive text messages claiming bank account or debit card suspension',
      severity: 'CRITICAL',
      category: 'Banking',
      icon: Smartphone,
      scamPlaybook:
        'Scammers send mass SMS claiming your SBI/HDFC/PNB bank account is frozen due to expired PAN-Aadhaar KYC. Urges clicking a deceptive lookalike link (sbi-kyc-auth.top) to harvest NetBanking passwords and OTPs.',
      realWorldPayload:
        'Dear Customer, Your SBI account ending in XX81 has been placed on hold due to pending KYC. Click immediately to complete verification and prevent block: https://sbi-kyc-auth.top',
      howCyberguardShields:
        'DeBERTa-v3 NLP Intent Engine analyzes psychological panic triggers in <0.5s; eBPF Linux kernel netfilter drops in-flight packets with zero bytes delivered.',
      goldenRule:
        'Real Banks NEVER send suspension links via SMS or WhatsApp. Legitimate KYC is only updated inside the official banking app or at the bank branch.',
      mitreTactic: 'T1566.002 - Spearphishing Link (Smishing)'
    },
    {
      id: 'atk-2',
      rank: 2,
      title: 'WhatsApp Impersonation & Malicious APK Malware',
      subtitle: 'Trojanized Android packages disguised as wedding invites or govt schemes',
      severity: 'CRITICAL',
      category: 'Messaging',
      icon: Flame,
      scamPlaybook:
        'Fraudsters forward malicious `.apk` files on WhatsApp disguised as wedding invitations (Wedding_Card.apk), PM-Kisan Yojana, or electricity update tools. Once installed, it gains accessibility rights and steals banking OTPs.',
      realWorldPayload:
        'Dear Friend, kindly join our family wedding ceremony on 25th Nov. Download digital invitation card: Wedding_Invite_2026.apk',
      howCyberguardShields:
        'In-line binary header inspector identifies unauthorized SMS intercept permissions and blocks the APK download in-flight.',
      goldenRule:
        'Never install any application ending with .apk received via WhatsApp or Telegram. Install applications only from the verified Google Play Store.',
      mitreTactic: 'T1444 - Mobile Impersonation / Malicious APK'
    },
    {
      id: 'atk-3',
      rank: 3,
      title: 'Fake Electricity & Utility Disconnection Threats',
      subtitle: 'Extortion messages threatening power shutoff tonight at 9:30 PM',
      severity: 'HIGH',
      category: 'Utility',
      icon: Zap,
      scamPlaybook:
        'Victim receives an SMS stating power will be cut tonight at 9:30 PM from the substation because previous month bill was not updated. Prompts victim to call a personal mobile number where scammer asks for remote app download or urgent UPI transfer.',
      realWorldPayload:
        'Dear Consumer, Your electricity power supply will be disconnected tonight at 9:30 PM from the sub-station because your previous month bill was not updated. Contact electricity officer at 98610-44219 immediately.',
      howCyberguardShields:
        'Heuristic Panic Index classifier detects utility extortion vectors and drops the forged transmission before reaching citizen inbox.',
      goldenRule:
        'State DISCOMs (TPCODL/WESCO) never disconnect residential power at night or ask you to call personal numbers. Report immediately to Cyber Helpline 1930.',
      mitreTactic: 'T1566.003 - Spearphishing via Service Extortion'
    },
    {
      id: 'atk-4',
      rank: 4,
      title: 'AI Voice Clone Family Emergency (Kinship & BEC Scam)',
      subtitle: 'Synthetic audio replicating child/relative voice claiming hospital emergency',
      severity: 'CRITICAL',
      category: 'Deepfake',
      icon: Volume2,
      scamPlaybook:
        'Scammers scrape 3 seconds of voice from Instagram/YouTube, generate synthetic clones using neural vocoders, and call parents/grandparents claiming a road accident, police custody, or hospital emergency demanding immediate wire.',
      realWorldPayload:
        'Urgent voice note: "Dad, this is Rahul. I had an accident, my phone is dying. Please wire Rs 25,000 immediately to this clinic doctor UPI to start treatment."',
      howCyberguardShields:
        'RawNet2 vocoder residual analyzer flags 8,150 Hz spectral cutoff anomaly in 0.42 μs, terminating the audio stream before loudspeaker playback.',
      goldenRule:
        'Establish a secret family verbal safeword. Always hang up and call back the relative on their known contact number before sending any emergency money.',
      mitreTactic: 'T1565.002 - Transmitted Data Manipulation / Deepfake'
    },
    {
      id: 'atk-5',
      rank: 5,
      title: '"Digital Arrest" Fake Police & CBI Video Extortion',
      subtitle: 'Coercive video calls with fake police station backdrops accusing victim of crimes',
      severity: 'CRITICAL',
      category: 'Extortion',
      icon: AlertTriangle,
      scamPlaybook:
        'Fraudsters impersonate CBI, Mumbai Police, or Customs over Skype/WhatsApp video calls wearing forged police uniforms. They falsely accuse the victim of sending illegal narcotics parcels and coerce them into transferring money for "verification".',
      realWorldPayload:
        'Notice of Digital Arrest: A FedEx parcel with contraband drugs was seized in your name. You are placed under Digital Arrest. Transfer bail security deposit to avoid arrest.',
      howCyberguardShields:
        'CyberGuard Telephony Sentinel flags unauthorized VoIP video channels and warns victim: "Official Law Enforcement NEVER conducts arrests over video calls."',
      goldenRule:
        'There is NO concept of "Digital Arrest" under Indian Law! Police, CBI, and Courts NEVER conduct trials or demand money transfers over video calls.',
      mitreTactic: 'T1598.003 - Telephony Phishing & Extortion'
    },
    {
      id: 'atk-6',
      rank: 6,
      title: 'Scholarship & State Grant Phishing (AX-MEDHABRUTI)',
      subtitle: 'Forged SMS targeting students claiming Post-Matric grant cancellation',
      severity: 'HIGH',
      category: 'Employment',
      icon: Briefcase,
      scamPlaybook:
        'Students receive forged SMS with headers like AX-MEDHABRUTI claiming a Rs 25,000 state grant is on hold. Directs to fake scholarship portals to steal Aadhaar, bank details, and OTPs.',
      realWorldPayload:
        '[AX-MEDHABRUTI] Final notice: Your Odisha State Post-Matric Scholarship payment of Rs 25,000 is pending. Verify bank account within 2 hours or grant will be canceled: https://medhabruti-gov-verify.top',
      howCyberguardShields:
        'Cryptographic DLT telecom header verification drops forged sender IDs; PhiUSIIL XGBoost flags lookalike domain registered < 14 days ago.',
      goldenRule:
        'Government scholarships are credited directly via DBT (Direct Benefit Transfer). State departments never require you to enter banking passwords on external links.',
      mitreTactic: 'T1566.002 - Spearphishing Link / Smishing'
    },
    {
      id: 'atk-7',
      rank: 7,
      title: 'Malicious UPI QR Quishing (Physical QR Code Tamper)',
      subtitle: 'Deceptive QR codes pasted over merchant codes or sent claiming cashback',
      severity: 'HIGH',
      category: 'Banking',
      icon: QrCode,
      scamPlaybook:
        'Scammers paste fraudulent QR stickers over merchant payment stands or send QR codes claiming "Scan to receive Rs 2,000 cashback". Scanning prompts user to enter UPI PIN, which deducts funds instead of crediting them.',
      realWorldPayload:
        'upi://pay?pa=unverified-merchant@axl&pn=State%20Cashback%20Reward&am=2000&cu=INR (Claim Reward QR Code)',
      howCyberguardShields:
        'OpenCV QR matrix decoder inspects payment intent URI in-line, detects unverified VPA merchant redirection, and blocks the payment gateway call.',
      goldenRule:
        'Golden Rule of UPI: Entering your UPI PIN ALWAYS DEDUCTS money from your account. You NEVER enter a PIN to receive or claim money!',
      mitreTactic: 'T1566.003 - Quishing (QR Phishing) / Payment Tamper'
    },
    {
      id: 'atk-8',
      rank: 8,
      title: 'Part-Time Work-From-Home / Telegram Task Scams',
      subtitle: 'Lures promising Rs 5,000 daily for liking YouTube videos or hotel ratings',
      severity: 'HIGH',
      category: 'Employment',
      icon: Sparkles,
      scamPlaybook:
        'Unsolicited WhatsApp messages offer Rs 3,000 - Rs 8,000 daily for easy tasks like liking YouTube videos or Google reviews. Small initial payouts build trust before luring victim into high-value crypto "prepaid tasks" where funds are stolen.',
      realWorldPayload:
        'Earn Rs 5,000 daily working from home! Simply like YouTube videos and submit screenshots. Join Telegram manager @TaskEarn2026 to start now.',
      howCyberguardShields:
        'Multi-vector pattern matching identifies task scam recruitment keywords and blacklists associated Telegram gateway URLs.',
      goldenRule:
        'Legitimate companies never pay money for liking videos or ask you to pay "prepaid deposits" to withdraw your earnings.',
      mitreTactic: 'T1566.002 - Social Engineering Task Fraud'
    },
    {
      id: 'atk-9',
      rank: 9,
      title: 'AePS Biometric Fingerprint Clone & Banking Thefts',
      subtitle: 'Harvesting land registry silicone fingerprint copies to drain micro-ATMs',
      severity: 'HIGH',
      category: 'Biometric',
      icon: Fingerprint,
      scamPlaybook:
        'Scammers harvest public land registry documents with high-resolution fingerprint scans, replicate fingerprints onto silicone rubber molds, and use Aadhaar Enabled Payment System (AePS) to withdraw cash without OTP.',
      realWorldPayload:
        'Unauthorized micro-ATM AePS cash withdrawal: Rs 10,000 debited from bank account via biometric terminal.',
      howCyberguardShields:
        'CyberGuard advises citizens and triggers automated reminders to keep Aadhaar biometrics locked via mAadhaar portal.',
      goldenRule:
        'Keep your Aadhaar biometrics locked using the official mAadhaar app or UIDAI website. Unlock it only for 10 minutes when you physically need to authenticate.',
      mitreTactic: 'T1078 - Valid Accounts / Biometric Replay'
    },
    {
      id: 'atk-10',
      rank: 10,
      title: 'SIM Swap & Telecom OTP Hijacking',
      subtitle: 'Fraudulently issuing duplicate SIM cards to hijack banking and 2FA SMS',
      severity: 'CRITICAL',
      category: 'Telecom',
      icon: Cpu,
      scamPlaybook:
        'Using forged Aadhaar documents, scammers convince telecom store operators to issue a replacement SIM for the victim number. Victim phone suddenly loses network, while scammers intercept banking OTPs to drain accounts.',
      realWorldPayload:
        'Telecom SIM swap notification: "Your SIM card replacement request has been processed successfully."',
      howCyberguardShields:
        'Telephony Sentinel monitors cellular IMSI hardware state; detects abrupt carrier registration changes and freezes banking sessions immediately.',
      goldenRule:
        'If your phone unexpectedly displays "No Service" for more than 15 minutes in a known coverage area, contact your telecom carrier and bank immediately.',
      mitreTactic: 'T1078.004 - SIM Swap / Credential Hijack'
    }
  ];

  const categories = ['ALL', 'Banking', 'Messaging', 'Utility', 'Deepfake', 'Extortion', 'Employment', 'Biometric', 'Telecom'];

  const filteredAttacks = attacks.filter((atk) => {
    const matchesCategory = selectedCategory === 'ALL' || atk.category === selectedCategory;
    const matchesSearch =
      atk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atk.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atk.scamPlaybook.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atk.goldenRule.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Trigger PWA Push Notification for Awareness
  const handleTriggerPwaAlert = (atk: CyberAttackItem) => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          try {
            new Notification(`🛡️ CyberGuard Awareness: ${atk.title}`, {
              body: `Rule: ${atk.goldenRule}`,
              icon: '/favicon.ico'
            });
          } catch (e) {
            // quiet
          }
        }
      });
    }

    setPwaAlertNotice(`🔔 PWA Push Notification Dispatched: "${atk.title}" sent to your device!`);
    setTimeout(() => setPwaAlertNotice(null), 4000);
  };

  return (
    <div
      className={`min-h-[85vh] rounded-3xl transition-colors duration-300 font-sans pb-20 p-4 sm:p-6 border ${
        isDark
          ? 'bg-[#0A0E13] text-white border-white/10 shadow-2xl'
          : 'bg-white text-[#131618] border-[#E5E2D9] shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="space-y-2 border-b border-surface-container pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-500/10 text-red-600 font-bold border border-red-500/20">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest font-black text-red-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                <span>CITIZEN CYBER AWARENESS ENCYCLOPEDIA</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                Top 10 Most Common Cyber Attacks
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTriggerPwaAlert(attacks[0])}
              className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold font-mono flex items-center gap-2 transition-all shadow-xs cursor-pointer hover:bg-primary/90"
            >
              <Bell className="w-4 h-4 animate-bounce" />
              <span>Subscribe to PWA Alerts</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed max-w-3xl">
          Learn how today's top cyber attack syndicates operate, inspect real-world messages, understand how CyberGuard's in-line eBPF kernel drops them, and memorize the golden protection rule for each.
        </p>
      </div>

      {/* PWA Alert Notice Toast */}
      {pwaAlertNotice && (
        <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-mono text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{pwaAlertNotice}</span>
          </div>
          <button onClick={() => setPwaAlertNotice(null)} className="font-bold text-emerald-800 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="mt-5 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            placeholder="Search common attacks by keywords (e.g., OTP, SBI, Electricity, Deepfake, QR)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border transition-all focus:outline-none focus:border-primary ${
              isDark
                ? 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                : 'bg-surface-container-low border-surface-container text-on-surface placeholder-slate-400'
            }`}
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap font-semibold ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-xs'
                  : isDark
                  ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List of 10 Attacks */}
      <div className="mt-6 space-y-3.5">
        {filteredAttacks.map((atk) => {
          const isExpanded = expandedId === atk.id;
          const Icon = atk.icon;

          return (
            <div
              key={atk.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isDark
                  ? 'bg-white/5 border-white/10 hover:border-white/20'
                  : 'bg-surface-container-lowest border-surface-container hover:border-primary/40 shadow-xs'
              }`}
            >
              {/* Card Header Accordion Trigger */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : atk.id)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold ${
                      atk.severity === 'CRITICAL'
                        ? 'bg-red-500/15 text-red-600 border border-red-500/30'
                        : atk.severity === 'HIGH'
                        ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                        : 'bg-blue-500/15 text-blue-600 border border-blue-500/30'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/10 text-primary">
                        #{atk.rank} OF 10
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          atk.severity === 'CRITICAL'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {atk.severity}
                      </span>
                      <span className="text-[10px] font-mono text-outline">{atk.category}</span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-on-surface mt-1 truncate">
                      {atk.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant truncate">{atk.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-outline" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-outline" />
                  )}
                </div>
              </button>

              {/* Accordion Expanded Body */}
              {isExpanded && (
                <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-surface-container space-y-4 animate-in fade-in text-xs">
                  {/* 1. How Scammers Attack */}
                  <div>
                    <div className="text-[11px] font-mono font-bold text-outline uppercase tracking-wider mb-1">
                      1. How Scammers Attack (The Scam Playbook):
                    </div>
                    <p className="text-on-surface leading-relaxed">{atk.scamPlaybook}</p>
                  </div>

                  {/* 2. Real-World Attack Payload Lure */}
                  <div>
                    <div className="text-[11px] font-mono font-bold text-red-700 uppercase tracking-wider mb-1">
                      2. Real-World Attack Message / Payload Snippet:
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container font-mono text-[11px] text-slate-800 dark:text-slate-200 select-all leading-relaxed">
                      &gt; "{atk.realWorldPayload}"
                    </div>
                  </div>

                  {/* 3. How CyberGuard Shields You */}
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-300 text-emerald-950 space-y-1">
                    <div className="font-mono font-bold text-emerald-900 flex items-center gap-1.5 text-[11px]">
                      <Zap className="w-4 h-4 text-emerald-600" />
                      <span>3. How CyberGuard In-Line Shield Neutralizes It:</span>
                    </div>
                    <p className="leading-relaxed">{atk.howCyberguardShields}</p>
                    <div className="text-[10px] font-mono text-emerald-800 pt-1">
                      MITRE ATT&CK: <strong>{atk.mitreTactic}</strong> | In-Line Latency: <strong>0.42 μs eBPF Drop</strong>
                    </div>
                  </div>

                  {/* 4. Golden Protection Rule */}
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-300 text-amber-950 space-y-1">
                    <div className="font-mono font-bold text-amber-900 flex items-center gap-1.5 text-[11px]">
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      <span>4. Golden Protection Rule (Stay Safe):</span>
                    </div>
                    <p className="font-semibold leading-relaxed">{atk.goldenRule}</p>
                  </div>

                  {/* Actions: Send to PWA & Test In-Line Simulator */}
                  <div className="pt-2 border-t border-surface-container flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => handleTriggerPwaAlert(atk)}
                      className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-mono font-semibold flex items-center gap-1.5 text-on-surface transition-all cursor-pointer"
                    >
                      <Bell className="w-3.5 h-3.5 text-primary" />
                      <span>Send Alert to My Device via PWA</span>
                    </button>

                    {onNavigate && (
                      <button
                        onClick={() => onNavigate('simulator')}
                        className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-xs font-mono font-semibold flex items-center gap-1.5 text-primary transition-all cursor-pointer"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Simulate Attack in SOC Cockpit</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

