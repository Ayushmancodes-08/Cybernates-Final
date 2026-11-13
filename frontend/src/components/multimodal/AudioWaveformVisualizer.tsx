import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, CheckCircle, Volume2, Waves } from 'lucide-react';

interface AudioWaveformVisualizerProps {
  authenticityScore: number; // 0 - 100 (higher = more authentic)
  isSynthesized: boolean;
  sampleName?: string;
  durationSeconds?: number;
}

export const AudioWaveformVisualizer: React.FC<AudioWaveformVisualizerProps> = ({
  authenticityScore,
  isSynthesized,
  sampleName = 'CEO_Emergency_Authorization_Call.wav',
  durationSeconds = 14.8
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [activeSegment, setActiveSegment] = useState<number | null>(null);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setPlaybackProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1.5;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Synthetic frequency anomalies at specific time points
  const anomalyMarkers = isSynthesized ? [
    { timePct: 24, label: 'Unnatural Pitch Shift (F0 Flatline)', severity: 'high' },
    { timePct: 58, label: 'HiFi-GAN 8kHz Roll-off Cutoff', severity: 'critical' },
    { timePct: 82, label: 'Missing Breath/Vocal Tract Microtremor', severity: 'medium' }
  ] : [];

  // Waveform bars simulation
  const waveformBars = Array.from({ length: 48 }).map((_, i) => {
    // Artificial pattern for deepfakes: overly uniform or sudden spikes
    const baseHeight = Math.sin(i * 0.4) * 35 + 45;
    const isAnomaly = anomalyMarkers.some(m => Math.abs(m.timePct - (i / 48) * 100) < 4);
    const height = isAnomaly ? Math.min(95, baseHeight + 30) : baseHeight;
    return {
      index: i,
      height,
      pct: (i / 48) * 100,
      isAnomaly
    };
  });

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-surface-container p-5 space-y-4 shadow-xs">
      {/* Header info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-container">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isSynthesized ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
          }`}>
            <Waves className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-on-surface">{sampleName}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">
                {durationSeconds}s • 44.1kHz • 16-bit PCM
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Acoustic Spectral & Neural Vocoder Artifact Inspector
            </p>
          </div>
        </div>

        {/* Authenticity Metric Pill */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[10px] uppercase font-mono tracking-wider text-outline">Authenticity Score</div>
            <div className={`text-base font-mono font-extrabold ${
              authenticityScore < 40 ? 'text-red-600' : authenticityScore < 70 ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {authenticityScore}%
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${
            isSynthesized
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {isSynthesized ? 'SYNTHETIC VOICE DETECTED' : 'NATURAL HUMAN VOICE'}
          </div>
        </div>
      </div>

      {/* Interactive Waveform Display */}
      <div className="space-y-2">
        <div className="relative h-28 bg-surface-container-low rounded-xl p-3 flex items-end justify-between gap-1 overflow-hidden border border-surface-container">
          {/* Playhead line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-primary z-20 transition-all duration-100 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
            style={{ left: `${playbackProgress}%` }}
          />

          {/* Anomaly Highlight Zones */}
          {anomalyMarkers.map((marker, idx) => (
            <div
              key={idx}
              className="absolute top-0 bottom-0 bg-red-500/10 border-x border-red-500/30 z-10 cursor-pointer"
              style={{ left: `${marker.timePct - 3}%`, width: '6%' }}
              onClick={() => setActiveSegment(idx)}
              title={marker.label}
            />
          ))}

          {/* Waveform Bars */}
          {waveformBars.map((bar) => {
            const isPlayed = bar.pct <= playbackProgress;
            return (
              <div
                key={bar.index}
                className="flex-1 flex flex-col justify-end items-center h-full group cursor-pointer"
                onClick={() => setPlaybackProgress(bar.pct)}
              >
                <div
                  className={`w-full rounded-xs transition-all ${
                    bar.isAnomaly
                      ? 'bg-red-500 group-hover:bg-red-400'
                      : isPlayed
                      ? 'bg-primary'
                      : 'bg-surface-container-high group-hover:bg-outline-variant'
                  }`}
                  style={{ height: `${bar.height}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Playback Controls & Progress Bar */}
        <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg bg-primary hover:bg-primary-hover text-on-primary transition-colors flex items-center justify-center"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setPlaybackProgress(0);
              }}
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
              title="Reset Audio Playhead"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-xs text-on-surface font-medium">
              {((playbackProgress / 100) * durationSeconds).toFixed(1)}s / {durationSeconds}s
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-primary" /> Normal Audio
            </span>
            <span className="flex items-center gap-1.5 text-red-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Deepfake Anomaly Trigger
            </span>
          </div>
        </div>
      </div>

      {/* Spectral Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container space-y-1">
          <div className="text-[10px] uppercase font-mono text-outline">Spectral Cutoff Frequency</div>
          <div className="text-sm font-mono font-bold text-on-surface">
            {isSynthesized ? '8,150 Hz (Steep Lowpass)' : '21,400 Hz (Full Spectrum)'}
          </div>
          <p className="text-[11px] text-on-surface-variant">
            {isSynthesized ? 'Characteristic signature of neural vocoder (HiFi-GAN/DiffWave).' : 'Natural human acoustic dispersion detected.'}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container space-y-1">
          <div className="text-[10px] uppercase font-mono text-outline">Pitch Variance (F0 Contour)</div>
          <div className="text-sm font-mono font-bold text-on-surface">
            {isSynthesized ? 'σ = 4.2 Hz (Robotic Prosody)' : 'σ = 28.7 Hz (Natural Inflection)'}
          </div>
          <p className="text-[11px] text-on-surface-variant">
            {isSynthesized ? 'Unnatural flat fundamental frequency indicating cloned model.' : 'Organic speech cadence and breathing pauses verified.'}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container space-y-1">
          <div className="text-[10px] uppercase font-mono text-outline">Voiceprint Match Distance</div>
          <div className="text-sm font-mono font-bold text-on-surface">
            {isSynthesized ? 'Cosine Sim: 0.94 vs CEO Profile' : 'Cosine Sim: 0.22 (Unregistered)'}
          </div>
          <p className="text-[11px] text-on-surface-variant">
            {isSynthesized ? 'Targeted impersonation of verified executive biometric profile.' : 'No biometric impersonation match.'}
          </p>
        </div>
      </div>
    </div>
  );
};
