import React from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, ArrowRight, UserCheck, AlertTriangle } from 'lucide-react';

interface ImpersonationEntity {
  name: string;
  category: 'Government' | 'Senior Management' | 'Educational Authority' | 'Financial Institution';
  officialDomain: string;
  officialSenderId: string;
  verifiedDkim: boolean;
}

interface DetectedImposter {
  imposterName: string;
  claimedTarget: string;
  spoofedDomain: string;
  spoofedSenderId: string;
  levenshteinDistance: number;
  threatVector: 'SMS' | 'EMAIL' | 'VOICE_DEEPFAKE' | 'QUISHING';
  confidenceScore: number;
}

interface ImpersonationMatrixProps {
  official?: ImpersonationEntity;
  imposter?: DetectedImposter;
}

export const ImpersonationMatrix: React.FC<ImpersonationMatrixProps> = ({
  official = {
    name: 'Odisha Knowledge Corporation Limited (OKCL)',
    category: 'Educational Authority',
    officialDomain: 'okcl.org',
    officialSenderId: 'OKCLTD',
    verifiedDkim: true
  },
  imposter = {
    imposterName: 'OKCL Scholarship & Grant Verification Cell',
    claimedTarget: 'Odisha Knowledge Corporation Limited',
    spoofedDomain: 'okcl-scholarship.portal-claim.online',
    spoofedSenderId: 'OKCL-GOV (Unregistered Header)',
    levenshteinDistance: 24,
    threatVector: 'SMS',
    confidenceScore: 96
  }
}) => {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-surface-container p-5 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-container">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-on-surface">Digital Impersonation Defense Matrix</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                AI COGNITIVE PERSONA MATCH
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Comparing verified official institutional profiles against detected deceptive impersonation artifacts
            </p>
          </div>
        </div>

        {/* Impersonation Probability */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[10px] uppercase font-mono tracking-wider text-outline">Impersonation Confidence</div>
            <div className="text-base font-mono font-extrabold text-red-600">
              {imposter.confidenceScore}% (CRITICAL)
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Genuine Profile Card */}
        <div className="p-4 rounded-xl bg-emerald-950/5 border border-emerald-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>VERIFIED OFFICIAL IDENTITY</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              TRUST ROOT 100%
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono text-outline block">Entity Name</span>
              <span className="font-semibold text-on-surface">{official.name}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-outline block">Institutional Sector</span>
              <span className="font-mono text-on-surface-variant">{official.category}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-outline block">Authorized Domain</span>
              <div className="flex items-center gap-1.5 font-mono text-emerald-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{official.officialDomain}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-outline block">Telecom DLT Sender Header</span>
              <div className="flex items-center gap-1.5 font-mono text-emerald-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{official.officialSenderId} (Gov Registered)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Counterfeit / Imposter Card */}
        <div className="p-4 rounded-xl bg-red-950/5 border border-red-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700 font-bold text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>DETECTED IMPOSTER ARTIFACT</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-100 text-red-800 animate-pulse">
              ACTIVE ATTACK VECTOR
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono text-outline block">Claimed Persona</span>
              <span className="font-semibold text-red-600">{imposter.imposterName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-outline block">Vector & Modality</span>
              <span className="font-mono text-on-surface-variant">{imposter.threatVector} Delivery</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-outline block">Counterfeit Domain Destination</span>
              <div className="flex items-center gap-1.5 font-mono text-red-600 font-bold">
                <XCircle className="w-3.5 h-3.5" />
                <span>{imposter.spoofedDomain}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-outline block">Sender Identity Header</span>
              <div className="flex items-center gap-1.5 font-mono text-red-600 font-bold">
                <XCircle className="w-3.5 h-3.5" />
                <span>{imposter.spoofedSenderId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Impersonation Indicators Checklist */}
      <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container space-y-2">
        <div className="text-xs font-semibold text-on-surface flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>Cognitive Impersonation Heuristics Evaluated:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
          <div className="p-2 rounded bg-surface-container-lowest border border-surface-container">
            <span className="text-outline block">Domain Typosquat Index:</span>
            <span className="text-red-600 font-bold">Distance: 24 (Lookalike Subdomain)</span>
          </div>
          <div className="p-2 rounded bg-surface-container-lowest border border-surface-container">
            <span className="text-outline block">DLT Registry Lookup:</span>
            <span className="text-red-600 font-bold">Header Not in Authorized Registry</span>
          </div>
          <div className="p-2 rounded bg-surface-container-lowest border border-surface-container">
            <span className="text-outline block">Urgency/Threat Phrasing:</span>
            <span className="text-red-600 font-bold">98% Psychological Pressure</span>
          </div>
        </div>
      </div>
    </div>
  );
};
