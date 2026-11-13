import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PhishingAnalysisResult } from '../types';
import { RiskScoreBadge } from '../components/common/Badges';
import { Search, ShieldCheck, ShieldAlert, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const PhishingAnalysisPage: React.FC = () => {
  const [history, setHistory] = useState<PhishingAnalysisResult[]>([]);
  const [inputContent, setInputContent] = useState('https://okcl-student-portal.support-login.top/auth.php');
  const [analyzing, setAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<PhishingAnalysisResult | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await api.getPhishingHistory();
        setHistory(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadHistory();
  }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;
    setAnalyzing(true);
    try {
      const res = await api.analyzePhishing(inputContent.trim(), 'all-staff@okcl.org');
      setCurrentResult(res);
      setHistory((prev) => [res, ...prev]);
    } catch (err: any) {
      alert(`Scan failed: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const isClean = currentResult?.classification === 'CLEAN';
  const isMalicious = currentResult?.classification?.includes('MALICIOUS');

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Phishing Analysis & Malicious Domain Engine</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Heuristic lexical inspection, WHOIS maturity verification, and ML brand masquerade classification powered by Qwen 2.5.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-lg border border-surface-container text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Classifier: Random Forest + Qwen 2.5 Cyber-Instruct</span>
        </div>
      </div>

      {/* Scanner Box */}
      <div className="p-6 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-4">
        <h2 className="text-sm font-semibold text-on-surface">Inspect URL, Domain, or Suspicious Link</h2>
        <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            placeholder="Enter URL to inspect (e.g. https://apexmedclinic.org/okcl-staff-payroll/login.php or https://okcl.org)"
            className="flex-1 h-11 px-4 text-xs font-mono rounded-xl border border-surface-container bg-surface-container-low focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={analyzing}
            className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shrink-0 shadow-xs cursor-pointer"
          >
            {analyzing ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Run Real-Time Scan</span>
              </>
            )}
          </button>
        </form>

        {/* Scan Result Card */}
        {currentResult && (
          <div className={`mt-4 p-5 rounded-xl border space-y-4 animate-in fade-in ${
            isClean 
              ? 'border-emerald-200 bg-emerald-50/30' 
              : isMalicious 
                ? 'border-red-200 bg-red-50/30' 
                : 'border-amber-200 bg-amber-50/30'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-current/10">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold uppercase ${
                  isClean 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : isMalicious 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-amber-100 text-amber-800'
                }`}>
                  {currentResult.classification}
                </span>
                <span className="text-xs font-mono font-semibold text-on-surface truncate">
                  {currentResult.url_or_subject}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-outline">
                  {isClean ? 'Authenticity / Trust:' : 'Phishing Confidence:'} {currentResult.confidence_pct}%
                </span>
                <RiskScoreBadge score={currentResult.risk_score} />
              </div>
            </div>

            {/* Repurposed Aged Domain Warning Banner */}
            {currentResult.is_aged_repurposed_domain && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-100/90 border border-red-300 rounded-lg text-red-950 text-xs font-mono">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-red-900 uppercase">Expired / Repurposed Aged Domain Hijack Detected</div>
                  <div>
                    This domain was created {currentResult.domain_age_days} days ago ({Math.round(currentResult.domain_age_days / 365.25 * 10) / 10} yrs), but ownership/NS transferred {currentResult.days_since_update || 4} days ago with a newborn {currentResult.ssl_cert_age_days || 2}-day-old SSL certificate. Local Qwen 2.5 flagged a critical semantic mismatch.
                  </div>
                </div>
              </div>
            )}

            {/* Qwen 2.5 Explainable AI Summary */}
            {currentResult.ai_summary && (
              <div className="p-3.5 rounded-lg bg-surface-container-lowest border border-surface-container text-xs font-sans text-on-surface leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-[11px] font-mono text-primary mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Qwen 2.5 Senior SOC Analyst Explanation</span>
                </div>
                <div className="text-on-surface-variant whitespace-pre-line space-y-1">
                  {currentResult.ai_summary}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container">
                <div className="text-[10px] font-mono text-outline uppercase">Domain Age & History</div>
                <div className="text-sm font-bold text-on-surface font-mono mt-0.5">
                  {currentResult.domain_age_days} Days{' '}
                  <span className={`text-[11px] font-medium ${
                    currentResult.is_aged_repurposed_domain
                      ? 'text-red-600'
                      : currentResult.domain_age_days >= 180 
                        ? 'text-emerald-600' 
                        : currentResult.domain_age_days >= 30 
                          ? 'text-amber-600' 
                          : 'text-red-600'
                  }`}>
                    {currentResult.is_aged_repurposed_domain
                      ? '(Aged Domain Repurposed!)'
                      : currentResult.domain_age_days >= 180 
                        ? '(Trusted & Mature)' 
                        : currentResult.domain_age_days >= 30 
                          ? '(Moderate Age)' 
                          : '(Suspicious / Newly Registered)'}
                  </span>
                </div>
                {currentResult.is_aged_repurposed_domain && (
                  <div className="text-[11px] font-mono text-red-700 mt-1">
                    Updated: {currentResult.days_since_update}d ago • SSL Cert: {currentResult.ssl_cert_age_days}d old
                  </div>
                )}
              </div>

              <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container">
                <div className="text-[10px] font-mono text-outline uppercase">Target / Impersonation</div>
                <div className={`text-sm font-bold font-mono mt-0.5 ${
                  currentResult.brand_impersonated ? 'text-red-700' : 'text-emerald-700'
                }`}>
                  {currentResult.brand_impersonated || 'None (Authentic)'}
                </div>
                {currentResult.virustotal_flags && (
                  <div className="text-[11px] font-mono text-red-700 mt-1">
                    VirusTotal: {currentResult.virustotal_flags}
                  </div>
                )}
              </div>

              <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container">
                <div className="text-[10px] font-mono text-outline uppercase">Recommended Policy</div>
                <div className={`text-xs font-bold font-mono mt-0.5 ${
                  currentResult.recommended_action === 'ALLOW' 
                    ? 'text-emerald-800' 
                    : currentResult.recommended_action === 'WARN_USER' 
                      ? 'text-amber-800' 
                      : 'text-red-800'
                }`}>
                  {currentResult.recommended_action}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="text-xs font-mono text-outline uppercase font-semibold mb-1.5">Detected Heuristics & Signals</div>
              <div className="space-y-1">
                {currentResult.indicators.map((ind, i) => (
                  <div key={i} className="text-xs font-mono text-slate-700 flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      isClean ? 'bg-emerald-500' : 'bg-red-500'
                    }`} />
                    <span>{ind}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Historical Analyses */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container shadow-xs overflow-hidden">
        <div className="p-4 border-b border-surface-container">
          <h3 className="text-sm font-semibold text-on-surface">Recent Phishing Telemetry Triage</h3>
        </div>
        <div className="divide-y divide-surface-container">
          {history.map((h) => (
            <div key={h.id} className="p-4 hover:bg-surface-container-low transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    h.classification.includes('MALICIOUS') 
                      ? 'bg-red-100 text-red-800' 
                      : h.classification === 'SUSPICIOUS' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {h.classification}
                  </span>
                  <span className="text-xs font-mono font-bold text-on-surface truncate">{h.url_or_subject}</span>
                </div>
                <p className="text-xs text-on-surface-variant font-mono">
                  {h.classification === 'CLEAN' ? 'Authenticity' : 'Confidence'}: {h.confidence_pct}% • Domain Age: {h.domain_age_days}d ({h.domain_age_days >= 180 ? 'Trusted' : 'Suspicious'}) • Target: {h.brand_impersonated || (h.classification === 'CLEAN' ? 'Verified Namespace' : 'General')}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <RiskScoreBadge score={h.risk_score} />
                <span className="text-xs font-mono text-outline">{h.analyzed_at.slice(11, 19)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
