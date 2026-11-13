import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { AIChatMessage, AIStatusData } from '../types';
import {
  Sparkles,
  Send,
  ShieldCheck,
  CheckCircle2,
  Key,
  RotateCcw,
  Cpu,
  BookOpen,
  AlertTriangle,
  Radio,
  FileText,
  ChevronDown,
  ChevronUp,
  Brain,
  ShieldAlert,
  ArrowRight,
  Zap,
  Terminal,
  Activity,
  User,
  Sliders,
  Check
} from 'lucide-react';

interface AIAnalystPageProps {
  initialQuery?: string;
}

export const AIAnalystPage: React.FC<AIAnalystPageProps> = ({ initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [showGroqSettings, setShowGroqSettings] = useState(false);
  const [groqKey, setGroqKey] = useState<string>(() => localStorage.getItem('cyberguard_groq_api_key') || '');
  const [selectedModel, setSelectedModel] = useState<string>(() => localStorage.getItem('cyberguard_groq_model') || 'qwen/qwen3.8-27b');
  const [aiStatus, setAiStatus] = useState<AIStatusData | null>(null);
  const [activeCategory, setActiveCategory] = useState<'NEW_TO_SOC' | 'RECENT_ATTACKS' | 'DEEPFAKES' | 'INCIDENTS'>('RECENT_ATTACKS');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Greetings Operator. I am CyberGuard Qwen AI Security Analyst, your live contextual telemetry co-pilot for the OKCL infrastructure.\n\n' +
        '• If you are new to the SOC, ask me anything—I explain complex concepts in brief and simple English.\n' +
        '• If you are an Admin, ask "What are the recent attacks?" for an executive briefing of active threats and containment status.\n' +
        '• For any incident or deepfake alert, I break down the exact forensic evidence and root cause.',
      model_used: 'Qwen 2.5 3B Cyber-Instruct (Ollama Local)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  useEffect(() => {
    api.getAIStatus()
      .then(setAiStatus)
      .catch((err) => console.debug('AI status error:', err));
  }, []);

  useEffect(() => {
    if (initialQuery) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSaveGroq = (e: React.FormEvent) => {
    e.preventDefault();
    if (groqKey.trim()) {
      localStorage.setItem('cyberguard_groq_api_key', groqKey.trim());
    } else {
      localStorage.removeItem('cyberguard_groq_api_key');
    }
    localStorage.setItem('cyberguard_groq_model', selectedModel);
    setShowGroqSettings(false);
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
    if (!textToSend) setQuery('');
    setLoading(true);

    try {
      // Build conversation history
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.askAI(text, undefined, undefined, history, groqKey, selectedModel);

      const aiMsg: AIChatMessage = {
        role: 'assistant',
        content: res.answer,
        model_used: res.model_used || 'Qwen 2.5 3B Cyber-Instruct (Ollama Local)',
        grounded_evidence: res.grounded_evidence,
        mitre_references: res.mitre_references,
        recommended_actions: res.recommended_actions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Unable to query AI Analyst: ${err.message || 'Network error'}. Fallback engine active.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = {
    RECENT_ATTACKS: [
      'What are the recent attacks on the system?',
      'Which IP addresses are currently blocked at the Linux kernel firewall?',
      'Give me an executive summary of Incident INC-1042'
    ],
    DEEPFAKES: [
      'Explain the voice deepfake attack targeting Dr. Deepak Mohanty in plain English',
      'How did CyberGuard detect the deepfake video briefing?',
      'What is an acoustic vocoder cutoff frequency and why does it prove a voice clone?'
    ],
    NEW_TO_SOC: [
      'I am new to the SOC, can you explain what CyberGuard does?',
      'What is an eBPF firewall and why is it faster than standard firewalls?',
      'What does "zero-copy bypass" mean in simple words?'
    ],
    INCIDENTS: [
      'What is the root cause of the impossible travel alert?',
      'Explain the Tor exit node SYN scan attacking port 22',
      'What actions should I take to contain the OKCL student scholarship phish?'
    ]
  };

  return (
    <div className="space-y-6 animate-fluid">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-[#E05A1B]/15 text-[#E05A1B] text-[10px] font-mono font-bold uppercase tracking-wider">
              Slide 5 & 8 Committed Model
            </span>
            <span className="text-xs text-[#71767C] font-mono">Qwen 2.5 3B Ollama Edge Co-Pilot</span>
          </div>
          <h1 className="text-2xl font-black text-[#121517] tracking-tight">AI Security Analyst (Qwen 2.5 3B)</h1>
          <p className="text-xs text-[#5B6168] mt-0.5">
            Context-aware plain-language security advisory, live incident root-cause forensics, and autonomous containment explanation.
          </p>
        </div>

        {/* Engine Status & Ollama Config Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-1.5 crystal-panel rounded-xl text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-[#131618]">Ollama Active (Qwen 2.5 3B)</span>
          </div>

          <button
            onClick={() => setShowGroqSettings(!showGroqSettings)}
            className="crystal-button p-2 text-[#5B6168] hover:text-[#131618] rounded-xl flex items-center gap-1.5 text-xs font-semibold"
            title="Configure Ollama Model Parameters"
          >
            <Sliders className="w-4 h-4 text-[#E05A1B]" />
            <span className="hidden sm:inline">Ollama Config</span>
          </button>
        </div>
      </div>

      {/* Ollama Settings Dropdown Modal */}
      {showGroqSettings && (
        <div className="crystal-panel p-5 rounded-2xl border border-[#E5E2D9] animate-fluid space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E2D9]">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#E05A1B]" />
              <h3 className="text-xs font-mono uppercase font-bold text-[#131618]">Ollama Local Daemon (Qwen 2.5 3B)</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 font-bold">● Local 3B Model Active</span>
          </div>

          <form onSubmit={handleSaveGroq} className="space-y-3 text-xs">
            <div>
              <label className="block text-[#5B6168] font-mono mb-1 font-semibold">Ollama Daemon Socket / Token</label>
              <input
                type="password"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="ollama://localhost:11434"
                className="w-full px-3 py-2 bg-[#F4F3ED] rounded-xl border border-[#DCD7C9] text-xs font-mono text-[#131618] focus:outline-none focus:border-[#E05A1B]"
              />
            </div>

            <div>
              <label className="block text-[#5B6168] font-mono mb-1 font-semibold">Quantized Model Weight</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 bg-[#F4F3ED] rounded-xl border border-[#DCD7C9] text-xs font-mono text-[#131618]"
              >
                <option value="qwen/qwen3.8-27b">qwen2.5:3b-instruct-q4_K_M (Committed 3B Architecture)</option>
                <option value="llama-3.3-70b-versatile">llama3.3:70b-instruct-q4_0</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowGroqSettings(false)}
                className="px-3.5 py-1.5 bg-[#EDEAE0] text-[#555C65] rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#E05A1B] text-white rounded-xl font-bold shadow-xs hover:bg-[#C84E14]"
              >
                Save & Apply Key
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Suggested Prompt Category Bar */}
      <div className="crystal-panel p-2 rounded-2xl flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'RECENT_ATTACKS', label: 'Recent Attacks & Status', icon: ShieldAlert },
          { id: 'DEEPFAKES', label: 'Deepfakes & Voice Clones', icon: Radio },
          { id: 'NEW_TO_SOC', label: 'New to SOC (Explain Simply)', icon: BookOpen },
          { id: 'INCIDENTS', label: 'Incident Forensics', icon: Activity }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#181C20] text-white shadow-xs font-bold'
                  : 'text-[#555C65] hover:bg-[#EDEAE0] hover:text-[#131618]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F97316]' : 'text-[#71767C]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Prompts Chips */}
      <div className="flex flex-wrap gap-2">
        {quickPrompts[activeCategory].map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="crystal-button px-3 py-1.5 rounded-xl text-xs text-[#131618] hover:text-[#E05A1B] hover:border-[#E05A1B] transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-[#E05A1B]" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Main Chat Conversation Container (Apple visionOS Crystal Window) */}
      <div className="crystal-panel rounded-3xl border border-[#E5E2D9] overflow-hidden flex flex-col h-[540px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-sans">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-xs ${
                    isUser ? 'bg-[#181C20]' : 'bg-[#E05A1B]'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
                </div>

                {/* Message Body */}
                <div
                  className={`p-4 rounded-2xl space-y-2 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-[#181C20] text-white rounded-tr-xs shadow-xs'
                      : 'bg-white text-[#131618] border border-[#E5E2D9] rounded-tl-xs shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] font-mono opacity-70 border-b border-white/10 pb-1">
                    <span className="font-bold">{isUser ? 'Operator' : 'CyberGuard AI Analyst'}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Content (Supports formatted plain-language text) */}
                  <div className="whitespace-pre-wrap font-sans text-xs">{msg.content}</div>

                  {/* Grounded Evidence Tags */}
                  {!isUser && msg.grounded_evidence && msg.grounded_evidence.length > 0 && (
                    <div className="pt-2 border-t border-[#EDEAE0] space-y-1">
                      <span className="text-[10px] font-mono uppercase text-[#71767C] font-bold block">
                        Grounded SOC Telemetry:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {msg.grounded_evidence.map((ev, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-[#F4F3ED] text-[#4A515A] text-[10px] font-mono border border-[#E0DCD1]"
                          >
                            {ev}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MITRE ATT&CK References */}
                  {!isUser && msg.mitre_references && msg.mitre_references.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {msg.mitre_references.map((mitre, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-[#E05A1B]/10 text-[#E05A1B] text-[10px] font-mono font-bold"
                        >
                          {mitre}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Model attribution badge */}
                  {!isUser && msg.model_used && (
                    <div className="text-[9px] font-mono text-[#8A9099] pt-1">
                      Inference Engine: {msg.model_used}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-xl mr-auto">
              <div className="w-8 h-8 rounded-full bg-[#E05A1B] flex items-center justify-center shrink-0 text-white shadow-xs">
                <Sparkles className="w-4 h-4 animate-spin text-white" />
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-[#E5E2D9] text-xs font-mono text-[#71767C] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#E05A1B] animate-ping" />
                <span>Qwen 3.8-27B synthesizing telemetry reasoning on Groq...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Textbox Bar */}
        <div className="p-3 bg-[#EAE8DE] border-t border-[#DCD7C9]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything (e.g. 'What are the recent attacks?', 'Explain the voice deepfake', or 'Explain eBPF in simple English')..."
              className="flex-1 h-10 px-4 rounded-xl bg-white text-xs text-[#131618] border border-[#D5D0C3] focus:border-[#E05A1B] focus:outline-none placeholder:text-[#888F96] shadow-xs"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="h-10 px-4 bg-[#E05A1B] hover:bg-[#C84E14] text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
