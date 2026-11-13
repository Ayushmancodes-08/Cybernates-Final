import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { AIChatMessage, AIStatusData } from '../../types';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  ShieldCheck,
  CheckCircle2,
  Key,
  Maximize2,
  Minimize2,
  RotateCcw,
  Cpu,
  HelpCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface GlobalChatbotWidgetProps {
  onNavigate?: (route: string) => void;
}

export const GlobalChatbotWidget: React.FC<GlobalChatbotWidgetProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [groqKey, setGroqKey] = useState<string>(() => localStorage.getItem('cyberguard_groq_api_key') || '');
  const [selectedModel, setSelectedModel] = useState<string>(() => localStorage.getItem('cyberguard_groq_model') || 'llama-3.3-70b-versatile');
  const [aiStatus, setAiStatus] = useState<AIStatusData | null>(null);

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getWsUrl = () => {
    const host = window.location.hostname || '127.0.0.1';
    return `ws://${host}:8000/api/v1/ws`;
  };

  // Real-Time WebSocket Synchronization across the Entire App
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWs = () => {
      try {
        ws = new WebSocket(getWsUrl());
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            let alertText = '';

            if (data.type === 'VISHING_CALL_INTERCEPTED') {
              alertText =
                `🚨 LIVE VISHING SCAM CALL INTERCEPTED!\n\n` +
                `• Caller: ${data.caller_name || 'State Bank of India (Spoofed IVR)'} (${data.caller_id || '+91 1800-425-3800'})\n` +
                `• Target: ${data.victim_name || 'Deepak Mohanty (Father)'}\n` +
                `• Scam Vector: AI Voice Automated KYC Urgency Scam\n` +
                `• In-Line Mitigation: Call terminated immediately by CyberGuard Telephony Sentinel when 4-digit bank OTP was solicited. Zero OTP packet leakage confirmed!\n` +
                `• Critical Rule: Bank employees NEVER ask for OTP or PIN! Ask me for forensic details or DoT Chakshu reporting steps.`;
            } else if (data.type === 'INLINE_ATTACK_INTERCEPTED') {
              const tType = data.threat?.threat_type || 'In-Line Attack';
              alertText =
                `🚨 LIVE IN-LINE ATTACK INTERCEPTED!\n\n` +
                `• Vector: ${tType.replace(/_/g, ' ')}\n` +
                `• Target: ${data.recipient_id || 'Protected Endpoint'}\n` +
                `• Origin: ${data.sender_id || 'Phone A'} (${data.sender_ip || data.client_ip || '192.168.137.119'})\n` +
                `• Mitigation: In-flight packet dropped in 0.42 μs eBPF. Zero packet leakage!\n` +
                (data.qwen_reasoning ? `• AI Root Cause: ${data.qwen_reasoning.slice(0, 150)}...\n\n` : '\n') +
                `Ask me: "Explain this attack" or "What should the SOC analyst do next?"`;
            } else if (data.type === 'CIRCLE_EARLY_WARNING') {
              alertText =
                `⚠️ CIRCLE DEFENSE EARLY WARNING BROADCAST!\n\n` +
                `• Contact Targeted: ${data.target_member}\n` +
                `• Threat Type: ${data.threat_type || 'Social Engineering Scam'}\n` +
                `• Preemptive Synchronization: Blacklist signature auto-deployed across all Circle devices (0.42 μs eBPF Drop).\n` +
                `• Status: 100% Contained.`;
            }

            if (alertText) {
              const alertMsg: AIChatMessage = {
                role: 'assistant',
                content: alertText,
                model_used: 'CyberGuard Live Real-Time SOC Sentinel',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
              setMessages((prev) => [...prev, alertMsg]);
              setUnreadAlertsCount((prev) => prev + 1);
            }
          } catch (err) {
            console.debug('Chatbot WS parse err:', err);
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

  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      role: 'assistant',
      content:
        '👋 Greetings Operator! I am CyberGuard Qwen AI Security Co-pilot.\n\n' +
        '• New to the SOC? Ask me to explain what CyberGuard does in brief and plain English.\n' +
        '• Admin or Analyst? Ask "What are the recent attacks?" for a live executive briefing.\n' +
        '• Inspecting a threat? Ask about any incident (INC-1042, Voice Deepfake, Scholarship Quishing, Impossible Travel) to get the exact technical root cause.',
      model_used: 'Qwen 2.5 Plain-Language Engine',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  useEffect(() => {
    // Fetch backend AI Status
    api.getAIStatus()
      .then((status) => {
        setAiStatus(status);
        if (status.groq_configured && !groqKey) {
          // Backend already has env or settings key
        }
      })
      .catch((err) => console.debug('AI status check:', err));
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSaveGroqConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (groqKey.trim()) {
      localStorage.setItem('cyberguard_groq_api_key', groqKey.trim());
    } else {
      localStorage.removeItem('cyberguard_groq_api_key');
    }
    localStorage.setItem('cyberguard_groq_model', selectedModel);
    setShowConfig(false);
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || query;
    if (!text.trim() || loading) return;

    const userMsg: AIChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    // Build conversation history for LangChain / Qwen
    const convHistory = messages.map((m) => ({
      role: m.role,
      content: m.content
    }));

    try {
      const activeKey = groqKey.trim() || undefined;
      const res = await api.askAI(
        text,
        undefined,
        undefined,
        convHistory,
        activeKey,
        selectedModel
      );

      const assistantMsg: AIChatMessage = {
        role: 'assistant',
        content: res.answer,
        evidence: res.grounded_evidence,
        mitre: res.mitre_references,
        recommended: res.recommended_actions,
        disclaimer: res.disclaimer,
        model_used: res.model_used || (activeKey ? `Groq ${selectedModel}` : 'Qwen 2.5 Local Telemetry Engine'),
        is_groq: res.is_groq,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: AIChatMessage = {
        role: 'assistant',
        content: `⚠️ Query processing error: ${err.message || 'Unable to connect to AI Analyst service.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Conversation history reset. How can I assist you with OKCL security telemetry or incident triage today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const quickPills = [
    { label: '👋 New to SOC? Explain in brief', query: 'I am new to the SOC, can you explain CyberGuard properly in brief and short?' },
    { label: '🚨 What are the recent attacks?', query: 'What are the recent attacks and current active threats in the system?' },
    { label: '🔍 Explain INC-1042 (Tor Port Scan)', query: 'Why was IP 185.220.101.42 blocked in INC-1042? Explain the real reason.' },
    { label: '🎙️ Explain Voice Deepfake Call', query: 'Explain the voice deepfake audio call targeting Dr. Deepak Mohanty in plain English' },
    { label: '📱 Explain Scholarship Quishing Scam', query: 'Explain the Scholarship Quishing QR and SMS scam blocked in the attack graph' },
    { label: '✈️ Explain Impossible Travel Alert', query: 'Explain why Deepak Mohanty had an Impossible Travel alert and why it was blocked' },
    { label: '🛡️ Show Active Firewall Drops', query: 'What are the active firewall drop rules and how do they safely protect the network?' }
  ];

  return (
    <>
      {/* Floating Launcher Button - Circular Design (z-20 Stacks Behind Alert Bar and Toasters) */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setUnreadAlertsCount(0);
          }}
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-20 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-purple-700 via-indigo-600 to-[#E05A1B] text-white shadow-2xl hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border-2 border-white/30 flex items-center justify-center group"
          aria-label="Open CyberGuard AI Assistant"
          title="CyberGuard AI (Qwen 2.5) SOC Co-Pilot & Analyst"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-6 h-6 md:w-7 md:h-7 animate-pulse text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#181C22] animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#181C22]" />

            {/* Unread Live Threat Badge */}
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-3 -right-3 px-2 py-0.5 rounded-full bg-rose-600 border border-white text-white font-mono font-black text-[10px] animate-bounce shadow-lg">
                ! {unreadAlertsCount}
              </span>
            )}
          </div>

          {/* Clean Hover Label Pill */}
          <span className="absolute -top-8 px-2 py-0.5 rounded-full bg-[#181C22]/90 border border-white/20 text-[10px] font-mono font-bold text-white shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {unreadAlertsCount > 0 ? `🚨 ${unreadAlertsCount} Live Incident Alert` : 'CyberGuard AI (Qwen 2.5)'}
          </span>
        </button>
      )}

      {/* Main Chat Drawer / Window */}
      {isOpen && (
        <div
          className={`fixed z-50 shadow-2xl flex flex-col bg-surface-container-lowest border border-surface-container rounded-2xl overflow-hidden transition-all duration-200 ${
            isExpanded
              ? 'bottom-4 right-4 top-4 left-4 md:left-auto md:w-[780px] md:h-[92vh]'
              : 'bottom-6 right-6 w-[94vw] sm:w-[440px] h-[640px] max-h-[90vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-[#171b26] via-[#1e2338] to-[#121624] text-white flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold tracking-tight">CyberGuard AI Co-Pilot</h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
                    {groqKey.trim() || aiStatus?.groq_configured ? 'GROQ + LANGCHAIN' : 'QWEN 2.5'}
                  </span>
                </div>
                <div className="text-[10px] text-white/60 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Plain-Language Telemetry Advisor</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowConfig(!showConfig)}
                title="Configure Groq API Key & Model"
                className={`p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors ${
                  showConfig || groqKey.trim() ? 'text-purple-300 bg-white/10' : ''
                }`}
              >
                <Key className="w-4 h-4" />
              </button>
              <button
                onClick={clearChat}
                title="Reset Conversation"
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Restore size' : 'Expand window'}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Groq API Key Configuration Drawer */}
          {showConfig && (
            <div className="p-3.5 bg-surface-container-low border-b border-surface-container text-xs animate-in slide-in-from-top duration-150 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-on-surface">
                  <Cpu className="w-4 h-4 text-primary" />
                  <span>Groq AI & LangChain Settings</span>
                </div>
                <span className="text-[10px] text-outline font-mono">Optional high-speed inference</span>
              </div>
              <form onSubmit={handleSaveGroqConfig} className="space-y-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-on-surface block mb-1">
                    Groq API Key (gsk_...)
                  </label>
                  <input
                    type="password"
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    placeholder="Paste GROQ_API_KEY or leave blank for local Qwen 2.5"
                    className="w-full h-8 px-2.5 text-xs rounded-lg bg-surface-container-lowest border border-surface-container text-on-surface font-mono focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-semibold text-outline block mb-1">Model Selection</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full h-8 px-2 text-xs rounded-lg bg-surface-container-lowest border border-surface-container text-on-surface font-mono focus:border-primary focus:outline-none"
                    >
                      <option value="llama-3.3-70b-versatile">LLaMA 3.3 70B Versatile (Fast & Smart)</option>
                      <option value="qwen/qwen-2.5-coder-32b">Qwen 2.5 Coder 32B</option>
                      <option value="llama-3.1-8b-instant">LLaMA 3.1 8B Instant (Ultra-fast)</option>
                      <option value="deepseek-r1-distill-llama-70b">DeepSeek R1 Distill 70B</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="h-8 px-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Save Key
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-outline">
                  💡 When Groq API key is saved, requests run via LangChain + Groq. Without a key, CyberGuard runs our local Qwen 2.5 expert reasoning engine.
                </p>
              </form>
            </div>
          )}

          {/* Quick Prompts Carousel Bar */}
          <div className="px-3 py-2 bg-surface-container-low border-b border-surface-container overflow-x-auto flex gap-1.5 no-scrollbar shrink-0">
            {quickPills.map((pill, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(pill.query)}
                disabled={loading}
                className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-surface-container-lowest hover:bg-surface-container border border-surface-container text-on-surface-variant hover:text-primary transition-all text-left whitespace-nowrap cursor-pointer shadow-xs disabled:opacity-50"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.role === 'user' ? 'ml-auto flex-row-reverse max-w-[85%]' : 'max-w-[95%]'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    m.role === 'user'
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-purple-100 text-purple-700 border border-purple-200'
                  }`}
                >
                  {m.role === 'user' ? 'OP' : <Sparkles className="w-3.5 h-3.5" />}
                </div>

                {/* Message Body */}
                <div
                  className={`p-3.5 rounded-2xl leading-relaxed space-y-2.5 shadow-xs ${
                    m.role === 'user'
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-surface-container-low border border-surface-container rounded-tl-none text-on-surface'
                  }`}
                >
                  {/* Model tag if assistant */}
                  {m.role === 'assistant' && m.model_used && (
                    <div className="flex items-center justify-between text-[10px] text-outline font-mono border-b border-surface-container pb-1 mb-1">
                      <span className="font-semibold text-purple-700">{m.model_used}</span>
                      <span>{m.timestamp}</span>
                    </div>
                  )}

                  {/* Main text */}
                  <div className="whitespace-pre-wrap">{m.content}</div>

                  {/* Grounded Evidence Citations */}
                  {m.evidence && m.evidence.length > 0 && (
                    <div className="pt-2 border-t border-surface-container/60 space-y-1">
                      <div className="text-[10px] font-mono uppercase font-bold text-outline">
                        Grounded Evidence Citations
                      </div>
                      {m.evidence.map((ev, i) => (
                        <div key={i} className="text-[11px] font-mono text-on-surface-variant flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{ev}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* MITRE ATT&CK Badges */}
                  {m.mitre && m.mitre.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {m.mitre.map((mit, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-surface-container text-[10px] font-mono text-primary font-semibold"
                        >
                          {mit}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Recommended Triage Advice */}
                  {m.recommended && m.recommended.length > 0 && (
                    <div className="pt-1.5 border-t border-surface-container/60 text-[11px] font-mono text-outline">
                      <strong className="text-on-surface">Recommended Triage:</strong>
                      <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-on-surface-variant">
                        {m.recommended.map((act, i) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Timestamp for user */}
                  {m.role === 'user' && (
                    <div className="text-[9px] text-white/70 text-right font-mono">{m.timestamp}</div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 max-w-[85%] items-center">
                <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="p-3 rounded-2xl bg-surface-container-low border border-surface-container text-xs text-outline font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
                  <span>Evaluating SOC telemetry corpus & reasoning root causes...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-surface-container-low border-t border-surface-container shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about recent attacks, incidents (INC-1042), deepfakes, or SOC basics..."
                className="flex-1 h-10 px-3.5 text-xs rounded-xl bg-surface-container-lowest border border-surface-container focus:border-primary focus:outline-none text-on-surface shadow-xs"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ask</span>
              </button>
            </form>
            <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-outline font-mono">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Deterministic Linux Policy Engine retains sole enforcement authority</span>
              </span>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate('ai-analyst');
                  }}
                  className="hover:underline text-primary"
                >
                  Full Page View →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
