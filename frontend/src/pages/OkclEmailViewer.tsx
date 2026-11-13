import React, { useState } from 'react';
import {
  Mail,
  ShieldAlert,
  AlertTriangle,
  QrCode,
  Download,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Sparkles,
  Smartphone
} from 'lucide-react';

export const OkclEmailViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const qrUrl = 'https://okcl-verification-portal.digital-kyc-auth.in/verify?candidate_id=OKCL-2026-94812';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0F141A] text-[#1e293b] p-4 sm:p-8 font-sans selection:bg-rose-500/20">
      {/* Top Demo Bar */}
      <div className="max-w-3xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#18202A] p-4 rounded-2xl border border-white/10 text-white">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5 text-xs font-mono font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>SOC Console</span>
          </a>
          <div>
            <div className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LIVE DEMONSTRATION ASSET</span>
            </div>
            <h2 className="text-sm font-bold text-white">OKCL Quishing Spear-Phishing Attack</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Phish URL' : 'Copy Phish URL'}</span>
          </button>
          <a
            href="/multimodal"
            className="px-3.5 py-1.5 rounded-xl bg-[#E05A1B] hover:bg-[#C84E14] text-white text-xs font-bold font-mono flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Scan in Threat Lab</span>
          </a>
        </div>
      </div>

      {/* Main Email Container (Outlook / Gmail Web Mockup) */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Email Client Header Bar */}
        <div className="bg-[#F8FAFC] border-b border-slate-200 p-5 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold uppercase tracking-wider">
                Inbound Email (Untrusted External Network)
              </span>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                URGENT: OKCL e-Certificate &amp; OS-CIT Examination Verification Mandatory (Ref: OKCL/2026/SEC-94812)
              </h1>
            </div>
            <span className="text-xs font-mono text-slate-400 whitespace-nowrap">
              Sun, Nov 8, 2026, 2:00 PM
            </span>
          </div>

          {/* Sender & Security Warning Box */}
          <div className="p-3 bg-rose-50/80 rounded-2xl border border-rose-200 space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-slate-700 gap-1">
              <div>
                <strong className="text-slate-900">From: </strong>
                <span className="text-slate-800 font-semibold">Odisha Knowledge Corporation Ltd </span>
                <span className="text-rose-700 font-bold">&lt;verification@okcl-support-portal.in&gt;</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px] self-start sm:self-auto">
                SPF: FAIL | DKIM: NONE
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-600">
              <strong className="text-slate-800">To: </strong>
              <span>candidate.odisha@gov.in (Registered OS-CIT Candidate)</span>
            </div>

            <div className="text-[11px] text-rose-700 font-sans flex items-center gap-1.5 pt-1 border-t border-rose-200/60 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
              <span>CyberGuard Flag: Lookalike domain 'okcl-support-portal.in' registered 2 days ago via unverified offshore registrar.</span>
            </div>
          </div>
        </div>

        {/* Email Body: Official OKCL Notice Document */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* OKCL Official Blue & Orange Header */}
          <div className="rounded-2xl overflow-hidden border border-slate-300 shadow-sm">
            <div className="bg-gradient-to-r from-[#1E3A8A] via-[#1E40AF] to-[#0369A1] text-white p-6 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-mono tracking-widest text-[#BAE6FD] font-bold uppercase">
                    GOVERNMENT OF ODISHA JOINT INITIATIVE
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                    ODISHA KNOWLEDGE CORPORATION LIMITED
                  </h2>
                  <p className="text-xs text-sky-200 font-sans mt-0.5">
                    Directorate of Technical Education &amp; Examination Verification Cell
                  </p>
                </div>
                <div className="self-start sm:self-center bg-[#F97316] text-white text-[11px] font-mono font-black px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-sm">
                  OFFICIAL MANDATE
                </div>
              </div>
            </div>
            <div className="h-1.5 bg-[#F97316] w-full" />
          </div>

          {/* Urgent Warning Ribbon */}
          <div className="p-4 bg-rose-50 border-l-4 border-rose-600 rounded-xl space-y-1">
            <div className="text-xs font-mono font-bold text-rose-900 uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              CRITICAL: 24-HOUR CERTIFICATE INVALIDATION NOTICE
            </div>
            <p className="text-xs text-rose-800 font-sans leading-relaxed">
              Under Odisha State Gazette Notification No. ED-OKCL/2026/881, failure to complete biometric Aadhaar validation will result in the immediate revocation of your certificate validity across OPSC, OSSC, and State University admission portals.
            </p>
          </div>

          {/* Metadata Table */}
          <table className="w-full text-xs font-mono border-collapse bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-3 font-bold text-slate-500 bg-slate-100/70 w-44">Notice Reference:</td>
                <td className="p-3 font-bold text-slate-900">OKCL/EXAM/2026/MANDATE-94812</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-3 font-bold text-slate-500 bg-slate-100/70">Candidate Registration:</td>
                <td className="p-3 text-slate-800">OS-CIT-2026-REG-44812 (Active Registry)</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-3 font-bold text-slate-500 bg-slate-100/70">Issuing Directorate:</td>
                <td className="p-3 text-slate-800">Office of Controller of Examinations, OKCL Bhubaneswar</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-500 bg-slate-100/70">Verification Deadline:</td>
                <td className="p-3 font-black text-rose-700">TODAY BEFORE 11:59 PM IST (STRICT DEADLINE)</td>
              </tr>
            </tbody>
          </table>

          {/* Main Notice Prose */}
          <div className="space-y-3 text-xs text-slate-700 font-sans leading-relaxed">
            <p className="font-semibold text-slate-900">Dear Candidate,</p>
            <p>
              This is an urgent mandatory communication from the <strong>Odisha Knowledge Corporation Limited (OKCL)</strong> Examination &amp; Certification Directorate.
            </p>
            <p>
              As per the revised State Educational Security Mandate (Ref: 2026/ED-441), all active holders of <strong>OS-CIT (Odisha State Certificate in Information Technology)</strong> qualifications must re-authenticate their digital Aadhaar signature linkage within 24 hours of receiving this electronic notification.
            </p>
            <p>
              Unverified certificates will be flagged as <em>"SUSPENDED / FRAUDULENT"</em> on the central state public recruitment repository and employment exchanges.
            </p>
          </div>

          {/* Quishing QR Code Card */}
          <div className="p-6 bg-gradient-to-b from-sky-50 to-white rounded-3xl border-2 border-dashed border-[#0284C7] text-center space-y-3 shadow-sm">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-[10px] font-mono font-bold uppercase tracking-wider">
              <Smartphone className="w-3.5 h-3.5 text-blue-700" />
              <span>Fast-Track Smartphone Authentication</span>
            </div>

            <div className="w-56 h-56 mx-auto bg-white p-3 rounded-2xl shadow-lg border border-slate-200 flex items-center justify-center">
              <img
                src="/okcl_qr.png"
                alt="OKCL Fast-Track Quishing QR Code"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            <div>
              <div className="text-xs font-black text-slate-900 tracking-tight">
                SCAN WITH SMARTPHONE CAMERA / GOOGLE LENS / PAYTM
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-1">
                Embedded Gateway: <span className="font-bold text-sky-700">okcl-verification-portal.digital-kyc-auth.in</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={qrUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>Click Here to Complete Aadhaar e-KYC Online</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <p className="text-[10px] text-slate-400 font-mono">
              Scan takes &lt; 30 seconds. Requires 12-digit Aadhaar number and OTP verification.
            </p>
          </div>

          {/* Security Disclaimer */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] font-sans text-slate-500 leading-relaxed">
            <strong>Important Security Advisory:</strong> Never share your 6-digit Aadhaar OTP or banking MPIN with any third-party representative. OKCL Customer Support will never ask for your debit card numbers or internet banking passwords.
          </div>

          {/* Official Sign-Off Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
            <div>
              <div className="font-bold text-slate-800">Controller of Examinations &amp; Digital Governance</div>
              <div className="text-[11px]">Odisha Knowledge Corporation Limited (OKCL)</div>
              <div className="text-[10px] text-slate-400">Plot No. 108/3607, Jayadev Vihar, Bhubaneswar, Odisha 751013</div>
            </div>
            <div className="text-right text-[10px] font-mono text-slate-400">
              <div>Notice ID: 2026-OKCL-SEC-94812</div>
              <div>Cryptographic SHA-256 Validated</div>
            </div>
          </div>
        </div>
      </div>

      {/* Demonstration Instructions footer pill */}
      <div className="max-w-3xl mx-auto mt-6 text-center text-xs font-mono text-slate-400">
        Presentation Tip: Open this URL on your phone or projector: <span className="text-amber-400 font-bold">{typeof window !== 'undefined' ? `${window.location.origin}/demo-email` : 'http://10.83.165.169:5800/demo-email'}</span> and scan the QR code live using any phone camera to demonstrate CyberGuard Quishing detection!
      </div>
    </div>
  );
};

