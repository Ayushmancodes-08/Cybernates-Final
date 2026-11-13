import React, { useState } from 'react';
import { QrCode, Scan, ExternalLink, ShieldAlert, CheckCircle2, AlertTriangle, Globe, Lock } from 'lucide-react';

interface QRCodeInspectorProps {
  decodedPayload: string;
  isMalicious: boolean;
  ocrExtractedText?: string;
  destinationDomain?: string;
  domainAgeDays?: number;
}

export const QRCodeInspector: React.FC<QRCodeInspectorProps> = ({
  decodedPayload = 'https://okcl-scholarship.portal-claim.online/verify?id=88319',
  isMalicious = true,
  ocrExtractedText = 'OFFICIAL NOTICE: ODISHA KNOWLEDGE CORPORATION LIMITED. Scan to claim your pending student grant Rs 25,000 immediately.',
  destinationDomain = 'okcl-scholarship.portal-claim.online',
  domainAgeDays = 3
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(decodedPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-surface-container p-5 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-container">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isMalicious ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
          }`}>
            <QrCode className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-on-surface">Image & Quishing Decoder</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">
                Computer Vision OCR + QR Matrix Scanner
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Decodes concealed barcode payloads and analyzes destination domains
            </p>
          </div>
        </div>

        {/* Verdict */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[10px] uppercase font-mono tracking-wider text-outline">Payload Safety</div>
            <div className={`text-base font-mono font-extrabold ${isMalicious ? 'text-red-600' : 'text-emerald-600'}`}>
              {isMalicious ? 'QUISHING DETECTED' : 'CLEAN QR CODE'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: QR Visual + Decoded Payload + OCR Extract */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Visual Simulated QR Code */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-surface-container-low rounded-xl border border-surface-container">
          <div className="w-36 h-36 bg-white p-3 rounded-lg shadow-xs flex flex-col items-center justify-center relative border border-slate-200">
            {/* SVG QR Code Simulation */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Corner position squares */}
              <rect x="5" y="5" width="25" height="25" fill="#0f172a" />
              <rect x="10" y="10" width="15" height="15" fill="#ffffff" />
              <rect x="13" y="13" width="9" height="9" fill="#0f172a" />

              <rect x="70" y="5" width="25" height="25" fill="#0f172a" />
              <rect x="75" y="10" width="15" height="15" fill="#ffffff" />
              <rect x="78" y="13" width="9" height="9" fill="#0f172a" />

              <rect x="5" y="70" width="25" height="25" fill="#0f172a" />
              <rect x="10" y="75" width="15" height="15" fill="#ffffff" />
              <rect x="13" y="78" width="9" height="9" fill="#0f172a" />

              {/* Data modules pattern */}
              <rect x="35" y="10" width="6" height="6" fill="#0f172a" />
              <rect x="45" y="15" width="6" height="6" fill="#0f172a" />
              <rect x="55" y="8" width="6" height="6" fill="#0f172a" />
              <rect x="10" y="35" width="6" height="6" fill="#0f172a" />
              <rect x="20" y="45" width="6" height="6" fill="#0f172a" />
              <rect x="35" y="35" width="12" height="12" fill={isMalicious ? '#ef4444' : '#0f172a'} />
              <rect x="50" y="40" width="8" height="8" fill="#0f172a" />
              <rect x="65" y="35" width="15" height="8" fill="#0f172a" />
              <rect x="35" y="55" width="8" height="15" fill="#0f172a" />
              <rect x="48" y="58" width="14" height="6" fill={isMalicious ? '#ef4444' : '#0f172a'} />
              <rect x="70" y="55" width="12" height="12" fill="#0f172a" />
              <rect x="35" y="75" width="15" height="8" fill="#0f172a" />
              <rect x="55" y="72" width="10" height="14" fill="#0f172a" />
              <rect x="75" y="75" width="8" height="15" fill="#0f172a" />
            </svg>

            {/* Scan animation bar */}
            <div className="absolute top-2 left-2 right-2 h-0.5 bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-bounce" />
          </div>

          <span className="text-[11px] font-mono text-outline mt-2">ECC Level: High (Q-Code 30%)</span>
        </div>

        {/* Decoded Target Analysis */}
        <div className="md:col-span-8 space-y-3">
          {/* Decoded URL banner */}
          <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono font-bold text-outline">Decoded Payload Destination</span>
              <button
                onClick={handleCopy}
                className="text-[10px] font-mono text-primary hover:underline"
              >
                {copied ? 'Copied!' : 'Copy Payload'}
              </button>
            </div>
            <div className="flex items-center gap-2 p-2 bg-surface-container-lowest rounded-lg border border-surface-container font-mono text-xs text-red-600 break-all select-all">
              <Globe className="w-4 h-4 shrink-0 text-red-500" />
              <span>{decodedPayload}</span>
            </div>
          </div>

          {/* OCR Surrounding Text Extracted */}
          <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container space-y-1">
            <div className="text-[10px] uppercase font-mono font-bold text-outline">Tesseract Vision OCR Transcription</div>
            <p className="text-xs text-on-surface leading-relaxed italic bg-surface-container-lowest p-2 rounded-lg border border-surface-container">
              "{ocrExtractedText}"
            </p>
          </div>

          {/* Risk Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container">
              <div className="text-[10px] text-outline font-mono">Domain Registration Age</div>
              <div className="font-mono font-bold text-red-600">{domainAgeDays} Days Old (High Risk)</div>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container">
              <div className="text-[10px] text-outline font-mono">SSL Certificate Issuer</div>
              <div className="font-mono font-bold text-amber-600">Let's Encrypt Free Tier (No EV)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
