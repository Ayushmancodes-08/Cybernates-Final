import React from 'react';
import { Sparkles, Shield, AlertTriangle, CheckCircle, FileText, ArrowRight, CornerDownRight } from 'lucide-react';
import { RiskScoreBadge, SeverityBadge } from '../common/Badges';

interface EvidenceFactor {
  factor: string;
  weight: number; // 0-100
  evidenceText: string;
  status: 'critical' | 'high' | 'medium' | 'safe';
}

interface ExplainableEvidenceCardProps {
  threatTitle: string;
  riskScore: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  xaiExplanation: string;
  contributingFactors: EvidenceFactor[];
  recommendedActions: string[];
  onExecuteAction?: (action: string) => void;
}

export const ExplainableEvidenceCard: React.FC<ExplainableEvidenceCardProps> = ({
  threatTitle,
  riskScore,
  severity,
  xaiExplanation,
  contributingFactors,
  recommendedActions,
  onExecuteAction
}) => {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-surface-container p-5 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-container">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-on-surface">{threatTitle}</h3>
              <SeverityBadge severity={severity} />
            </div>
            <p className="text-xs text-on-surface-variant">
              Explainable AI (XAI) Decision Rationale & Contributing Evidence Vectors
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[10px] uppercase font-mono tracking-wider text-outline">Authoritative Risk</div>
            <RiskScoreBadge score={riskScore} />
          </div>
        </div>
      </div>

      {/* Main XAI Natural Language Explanation Box */}
      <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-900 font-mono uppercase">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Qwen 2.5 Advisory Copilot — Plain-Language Triage:</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-200 text-purple-900">
            PLAIN ENGLISH EXPLANATION
          </span>
        </div>
        <p className="text-xs text-on-surface leading-relaxed font-sans font-medium bg-white p-3.5 rounded-lg border border-purple-100 shadow-xs">
          "{xaiExplanation}"
        </p>
      </div>

      {/* Contributing Factors Breakdown */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-on-surface">
          Contributing Threat Indicators & Factor Weights:
        </div>

        <div className="space-y-2">
          {contributingFactors.map((f, i) => (
            <div
              key={i}
              className="p-3 bg-surface-container-low rounded-xl border border-surface-container space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CornerDownRight className="w-3.5 h-3.5 text-outline" />
                  <span className="font-semibold text-on-surface">{f.factor}</span>
                </div>
                <span className={`font-mono text-xs font-bold ${
                  f.status === 'critical' ? 'text-red-600' : f.status === 'high' ? 'text-amber-600' : 'text-primary'
                }`}>
                  Weight: {f.weight}%
                </span>
              </div>

              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    f.status === 'critical' ? 'bg-red-500' : f.status === 'high' ? 'bg-amber-500' : 'bg-primary'
                  }`}
                  style={{ width: `${f.weight}%` }}
                />
              </div>

              <div className="text-[11px] text-on-surface-variant font-mono pl-5">
                Evidence: <span className="text-on-surface">{f.evidenceText}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Mitigations */}
      <div className="pt-2 border-t border-surface-container space-y-2">
        <div className="text-xs font-semibold text-on-surface flex items-center justify-between">
          <span>Authoritative Policy Engine Recommendations:</span>
          <span className="text-[10px] font-mono text-outline">Deterministic Verification Guaranteed</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {recommendedActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => onExecuteAction && onExecuteAction(action)}
              className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-primary hover:text-white border border-surface-container-high text-xs font-medium text-on-surface transition-all flex items-center gap-1.5 group"
            >
              <span>{action}</span>
              <ArrowRight className="w-3.5 h-3.5 text-outline group-hover:text-white transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
