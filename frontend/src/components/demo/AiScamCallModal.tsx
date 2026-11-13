import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  PhoneIncoming,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Volume2,
  VolumeX,
  XCircle,
  CheckCircle2,
  Lock,
  Zap,
  Sparkles,
  RotateCcw,
  User,
  ArrowRight,
  X
} from 'lucide-react';

interface AiScamCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  victimName?: string;
  victimPhone?: string;
  onCallIntercepted?: (details: any) => void;
}

type CallStage = 'RINGING' | 'AI_SPEAKING_KYC' | 'WAITING_DIGIT_1' | 'AI_SPEAKING_OTP' | 'WAITING_OTP' | 'INTERCEPTED_DROPPED';

export const AiScamCallModal: React.FC<AiScamCallModalProps> = ({
  isOpen,
  onClose,
  victimName = 'Deepak Mohanty (Father)',
  victimPhone = '+91 98610 44219',
  onCallIntercepted
}) => {
  const [stage, setStage] = useState<CallStage>('RINGING');
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [audioMuted, setAudioMuted] = useState(false);
  const [waveformActive, setWaveformActive] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('google-in');
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voiceNameDisplay, setVoiceNameDisplay] = useState<string>('Google Assistant Female (India en-IN)');
  const timerRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Stop any active audio stream immediately
  const stopAllAudio = () => {
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch (e) {}
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setWaveformActive(false);
  };

  // Pre-load natural female voices on component load
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      // Priority ranking for the most natural, human-sounding female IVR voice:
      // 1. Indian English Natural Online voices (Microsoft Neerja Online / Natural)
      // 2. Microsoft Heera / Swara / Kavya (Indian English Female)
      // 3. Google UK English Female / Google US English Female / Google हिन्दी
      // 4. Microsoft Zira / Jenny Neural
      // 5. Apple Samantha / Karen
      const naturalFemaleVoice =
        voices.find((v) => v.name.toLowerCase().includes('natural') && (v.name.includes('Neerja') || v.lang === 'en-IN' || v.name.includes('India'))) ||
        voices.find((v) => v.lang === 'en-IN' && (v.name.includes('Female') || v.name.includes('Heera') || v.name.includes('Neerja') || v.name.includes('Swara'))) ||
        voices.find((v) => v.name.includes('Google UK English Female') || v.name.includes('Google US English Female')) ||
        voices.find((v) => v.name.includes('Zira') || v.name.includes('Jenny') || v.name.includes('Aria')) ||
        voices.find((v) => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Karen')) ||
        voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || !v.name.toLowerCase().includes('david'))) ||
        voices[0];

      if (naturalFemaleVoice) {
        setSelectedVoice(naturalFemaleVoice);
        setVoiceNameDisplay(naturalFemaleVoice.name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Play realistic banking IVR 2-tone melodic chime before speaking
  const playTelecomChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.12); // E5

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
      setTimeout(() => ctx.close(), 350);
    } catch (e) {}
  };

  // Play synthetic DTMF tone
  const playDtmfTone = (freq1: number = 697, freq2: number = 1209) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.value = freq1;
      osc2.frequency.value = freq2;
      gain.gain.value = 0.12;

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      setTimeout(() => {
        osc1.stop();
        osc2.stop();
        ctx.close();
      }, 180);
    } catch (e) {
      // quiet
    }
  };

  // Play Ringtone Beep
  const playRingtoneSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => {
        osc.stop();
        ctx.close();
      }, 1000);
    } catch (e) {}
  };

  // Browser SpeechSynthesis Fallback (strictly filters English to avoid awkward regional mispronunciations)
  const fallbackBrowserSpeak = (text: string, onEnd?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) setTimeout(onEnd, 3500);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Urgent, assertive pacing (1.14 rate) creating high-stakes banking alert delivery
    utterance.rate = 1.14;
    utterance.pitch = 1.0;
    utterance.lang = 'en-IN';

    const voices = window.speechSynthesis.getVoices();
    // Exclude Bangla or non-English voices when speaking English
    const naturalEnVoice =
      voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Neerja') || v.name.includes('Heera') || v.name.includes('Google UK English Female') || v.name.includes('Zira') || v.name.includes('Samantha'))) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0];

    if (naturalEnVoice) {
      utterance.voice = naturalEnVoice;
      setVoiceNameDisplay(naturalEnVoice.name);
    }

    utterance.onstart = () => setWaveformActive(true);
    utterance.onend = () => {
      setWaveformActive(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      setWaveformActive(false);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  };

  // High-Fidelity Neural / Google Assistant Speech Synthesis
  const speakText = async (text: string, onEnd?: () => void) => {
    stopAllAudio();
    playTelecomChime();

    // Map display voice name
    if (selectedVoiceId === 'google-in') setVoiceNameDisplay('Google Assistant (India en-IN)');
    else if (selectedVoiceId === 'google-us') setVoiceNameDisplay('Google Assistant (US en-US)');
    else if (selectedVoiceId === 'edge-neerja') setVoiceNameDisplay('Microsoft Neerja Natural (SBI IVR)');
    else if (selectedVoiceId === 'edge-neerja-expressive') setVoiceNameDisplay('Microsoft Neerja Expressive');
    else if (selectedVoiceId === 'edge-jenny') setVoiceNameDisplay('Microsoft Jenny Neural (US)');
    else setVoiceNameDisplay('Device Browser Voice');

    if (selectedVoiceId !== 'browser-speech') {
      try {
        const host = window.location.hostname || '127.0.0.1';
        const url = `http://${host}:8000/api/v1/tts/synthesize?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(selectedVoiceId)}`;
        const audio = new Audio(url);
        // Increase playback speed to 1.15 to generate realistic high-pressure regulatory urgency
        audio.playbackRate = 1.15;
        currentAudioRef.current = audio;

        audio.onplay = () => setWaveformActive(true);
        audio.onended = () => {
          setWaveformActive(false);
          currentAudioRef.current = null;
          if (onEnd) onEnd();
        };
        audio.onerror = () => {
          console.warn('Backend audio synthesis failed, using browser fallback');
          fallbackBrowserSpeak(text, onEnd);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('Audio play prevented or interrupted:', err);
            fallbackBrowserSpeak(text, onEnd);
          });
        }
        return;
      } catch (e) {
        fallbackBrowserSpeak(text, onEnd);
        return;
      }
    }

    fallbackBrowserSpeak(text, onEnd);
  };

  // Initialize call when modal opens
  useEffect(() => {
    if (isOpen) {
      setStage('RINGING');
      setCallDuration(0);
      setTranscript('');
      setOtpInput('');
      playRingtoneSound();
    } else {
      stopAllAudio();
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen]);

  // Call timer effect
  useEffect(() => {
    if (stage !== 'RINGING' && stage !== 'INTERCEPTED_DROPPED') {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage]);

  // Step 1: User Accepts Call
  const handleAcceptCall = () => {
    setStage('AI_SPEAKING_KYC');
    const speechScript =
      'Hello. I am calling from State Bank of India fraud prevention division. Your savings account is being paused due to suspicious malicious activity. You have to complete your regulatory KYC immediately. Press 1 on your keypad to complete your KYC verification. Press 2 to cancel, resulting in permanent ban of your bank account.';

    setTranscript(speechScript);
    speakText(speechScript, () => {
      setStage('WAITING_DIGIT_1');
    });
  };

  // Step 2: User Presses Keypad '1'
  const handlePressKeypad = (digit: string) => {
    playDtmfTone();
    if (stage === 'WAITING_DIGIT_1' || stage === 'AI_SPEAKING_KYC') {
      if (digit === '1') {
        setStage('AI_SPEAKING_OTP');
        const otpPromptScript =
          'You have selected mandatory KYC verification. Please enter the 4-digit OTP received on your registered mobile number now to authenticate your identity.';
        setTranscript(otpPromptScript);
        speakText(otpPromptScript, () => {
          setStage('WAITING_OTP');
        });
      } else if (digit === '2') {
        const cancelScript = 'Cancelling KYC verification. Your account is being permanently frozen.';
        setTranscript(cancelScript);
        speakText(cancelScript, () => {
          handleDropCall();
        });
      }
    } else if (stage === 'WAITING_OTP' || stage === 'AI_SPEAKING_OTP') {
      // User is typing OTP digits
      const updated = (otpInput + digit).slice(0, 4);
      setOtpInput(updated);
      if (updated.length >= 1) {
        // Trigger In-Line Protection immediately on OTP solicitation/entry!
        triggerCallInterception(updated);
      }
    }
  };

  // Step 3: CyberGuard Call Sentinel Intercepts!
  const triggerCallInterception = async (enteredDigits: string) => {
    stopAllAudio();
    setStage('INTERCEPTED_DROPPED');
    playDtmfTone(850, 1477); // High alert tone

    const getBackendUrl = () => {
      const host = window.location.hostname || '127.0.0.1';
      return `http://${host}:8000`;
    };

    try {
      const res = await fetch(`${getBackendUrl()}/api/v1/call/intercept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caller_id: '+91 1800-425-3800',
          caller_name: 'State Bank of India (Spoofed IVR)',
          victim_name: victimName,
          victim_phone: victimPhone,
          scam_vector: 'VISHING_VOICE_OTP_SCAM',
          audio_transcript: transcript,
          dtmf_digits_pressed: '1',
          otp_blocked: true
        })
      });
      const data = await res.json();
      if (onCallIntercepted) {
        onCallIntercepted(data);
      }
    } catch (e) {
      console.debug('Call intercept error:', e);
    }
  };

  const handleDropCall = () => {
    stopAllAudio();
    onClose();
  };

  if (!isOpen) return null;

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 font-sans select-none animate-fluid">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#0F1722] via-[#0A0F17] to-black rounded-[38px] border-4 border-slate-700/80 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden text-white flex flex-col justify-between min-h-[580px] max-h-[92vh]">
        {/* Top Header & Speaker Notch */}
        <div className="pt-3 pb-1 px-4 flex items-center justify-between">
          <div className="w-6" />
          <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center gap-1.5 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-slate-800" />
            <div className="w-8 h-1 bg-slate-800 rounded-full" />
          </div>
          <button
            onClick={handleDropCall}
            className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer transition-colors"
            title="Close Simulator"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Permanent Google Assistant India Female Voice Badge */}
        <div className="px-3.5 py-1.5 flex items-center justify-between text-[10.5px] font-mono border-b border-white/10 bg-emerald-950/30">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Permanent IVR Voice:</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-900/50 border border-emerald-500/40 text-emerald-200 text-[10px] font-mono font-bold">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Google Assistant Female (India)</span>
          </div>
        </div>

        {/* =================================================================== */}
        {/* STAGE 1: INCOMING CALL SCREEN */}
        {/* =================================================================== */}
        {stage === 'RINGING' && (
          <div className="flex-1 flex flex-col justify-between p-6 text-center animate-fluid">
            <div className="space-y-3 pt-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 mx-auto flex items-center justify-center text-white shadow-2xl animate-pulse">
                <PhoneIncoming className="w-10 h-10 animate-bounce" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-white">State Bank of India</h2>
                <div className="text-sm font-mono text-amber-300 font-bold mt-0.5">+91 1800-425-3800</div>
                <div className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 text-[10px] font-mono border border-rose-500/40">
                  ⚠️ Spoofed VoIP Carrier CLI (Toll-Free Route)
                </div>
              </div>
            </div>

            <div className="text-xs font-mono text-slate-400 space-y-1">
              <div>Incoming Call targeting:</div>
              <div className="text-white font-bold">{victimName} ({victimPhone})</div>
            </div>

            {/* Answer / Decline Controls */}
            <div className="flex items-center justify-around pb-6 pt-4">
              <button
                onClick={handleDropCall}
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
                title="Decline Call"
              >
                <PhoneOff className="w-7 h-7" />
              </button>

              <button
                onClick={handleAcceptCall}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-90 transition-transform cursor-pointer animate-pulse"
                title="Answer Call"
              >
                <Phone className="w-7 h-7" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STAGE 2: ACTIVE CALL & AI IVR VOICE */}
        {/* =================================================================== */}
        {stage !== 'RINGING' && stage !== 'INTERCEPTED_DROPPED' && (
          <div className="flex-1 flex flex-col justify-between p-5 text-center animate-fluid">
            {/* Header */}
            <div>
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Call Active • {formatSeconds(callDuration)}</span>
              </div>
              <h3 className="text-base font-black mt-1">SBI Fraud Prevention Unit</h3>
              <div className="text-[11px] font-mono text-slate-400">+91 1800-425-3800</div>
              <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[9.5px] font-mono text-emerald-300">
                <Volume2 className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span className="truncate max-w-[220px]">Natural Voice: {voiceNameDisplay}</span>
              </div>
            </div>

            {/* Waveform Animation reacting to AI Voice */}
            <div className="py-2 flex items-center justify-center gap-1 h-12">
              {[40, 70, 95, 60, 85, 100, 75, 45, 90, 65, 30].map((h, i) => (
                <div
                  key={i}
                  style={{
                    height: waveformActive ? `${Math.max(12, (h * Math.sin(Date.now() / 200 + i)) % 44 + 10)}px` : '6px'
                  }}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    stage === 'WAITING_OTP' ? 'bg-amber-400' : 'bg-cyan-400'
                  }`}
                />
              ))}
            </div>

            {/* Live Subtitle Transcript Bubble */}
            <div className="p-3 rounded-2xl bg-black/60 border border-white/10 text-left text-xs font-mono space-y-1 max-h-32 overflow-y-auto">
              <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-bold">
                <Volume2 className="w-3 h-3" />
                <span>AI Operator Speaking (Female IVR):</span>
              </div>
              <p className="text-[11px] text-slate-200 leading-snug">{transcript}</p>
            </div>

            {/* Interactive Keypad */}
            <div className="space-y-2 py-2">
              {stage === 'WAITING_DIGIT_1' && (
                <div className="text-[10px] font-mono text-amber-300 font-bold bg-amber-950/60 p-1.5 rounded-lg border border-amber-500/30">
                  👉 Press 1 to complete KYC | Press 2 to Cancel
                </div>
              )}

              {stage === 'WAITING_OTP' && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-rose-300 font-bold bg-rose-950/60 p-1.5 rounded-lg border border-rose-500/40">
                    ⚠️ Enter 4-Digit Banking OTP now:
                  </div>
                  <div className="flex justify-center gap-2 font-mono text-lg font-bold">
                    {[0, 1, 2, 3].map((idx) => (
                      <div
                        key={idx}
                        className="w-8 h-9 rounded-lg bg-black/80 border border-amber-400/60 flex items-center justify-center text-amber-300 shadow-inner"
                      >
                        {otpInput[idx] ? '•' : ''}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3x4 Dialpad */}
              <div className="grid grid-cols-3 gap-1.5 max-w-[240px] mx-auto text-sm font-bold font-mono">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                  <button
                    key={k}
                    onClick={() => handlePressKeypad(k)}
                    className="h-10 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-cyan-500 active:text-black border border-white/10 flex items-center justify-center transition-all cursor-pointer shadow-sm text-slate-100"
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            {/* End Call Button */}
            <div className="pt-1">
              <button
                onClick={handleDropCall}
                className="w-12 h-12 rounded-full bg-rose-600 hover:bg-rose-700 mx-auto flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
                title="Hang up"
              >
                <PhoneOff className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STAGE 3: CYBERGUARD IN-LINE CALL INTERCEPTED & DROPPED */}
        {/* =================================================================== */}
        {stage === 'INTERCEPTED_DROPPED' && (
          <div className="flex-1 flex flex-col justify-between p-5 text-center bg-gradient-to-b from-rose-950 via-[#13070A] to-black animate-fluid">
            <div className="space-y-3 pt-3">
              <div className="w-16 h-16 rounded-3xl bg-rose-600/30 border-2 border-rose-500 mx-auto flex items-center justify-center text-rose-400 shadow-[0_0_40px_rgba(244,63,94,0.4)] animate-pulse">
                <ShieldAlert className="w-9 h-9 text-rose-400" />
              </div>

              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-[10px] font-mono font-black uppercase tracking-wider text-white">
                  CALL TERMINATED IN-LINE
                </span>
                <h3 className="text-lg font-black text-rose-300 mt-2">
                  Phishing Call Intercepted!
                </h3>
                <div className="text-xs font-mono text-slate-300 mt-1">
                  AI Voice Scammer Attempted OTP Theft
                </div>
              </div>
            </div>

            {/* Golden Security Rule Banner Requested by User */}
            <div className="p-3.5 rounded-2xl bg-amber-500/20 border-2 border-amber-400 text-amber-200 text-xs font-mono font-black space-y-1 shadow-lg text-left">
              <div className="flex items-center gap-1.5 text-amber-300 font-black text-xs uppercase tracking-tight">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>GOLDEN RULE: Bank Employees NEVER ask for OTP!</span>
              </div>
              <p className="text-[10px] font-normal text-amber-100 leading-snug">
                State Bank of India and RBI regulations strictly prohibit staff from asking for OTPs, PINs, or CVV. CyberGuard dropped this call before your OTP could be leaked.
              </p>
            </div>

            {/* Forensic Metrics */}
            <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-[9.5px] font-mono text-slate-300 text-left space-y-1">
              <div className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Zero OTP Data Leakage (Packet Filter Active)</span>
              </div>
              <div className="text-cyan-400 font-bold flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>Preemptive Blacklist Synced to My Circle Devices</span>
              </div>
              <div className="text-slate-400">Caller: +91 1800-425-3800 (Spoofed SBI IVR)</div>
            </div>

            {/* Dismiss CTA */}
            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <span>Shield Confirmed • Close Simulator</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

