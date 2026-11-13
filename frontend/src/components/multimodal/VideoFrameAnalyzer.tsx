import React, { useState } from 'react';
import { Eye, EyeOff, Video, Scan, ShieldAlert, Sparkles, Layers, Sliders } from 'lucide-react';

interface VideoFrameAnalyzerProps {
  authenticityScore: number;
  isDeepfake: boolean;
  videoTitle?: string;
  fps?: number;
}

export const VideoFrameAnalyzer: React.FC<VideoFrameAnalyzerProps> = ({
  authenticityScore,
  isDeepfake,
  videoTitle = 'Executive_Emergency_Press_Briefing.mp4',
  fps = 30
}) => {
  const [selectedFrame, setSelectedFrame] = useState<number>(42);
  const [showLandmarks, setShowLandmarks] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);

  const totalFrames = 120;

  // Frame data generator
  const frames = Array.from({ length: 12 }).map((_, i) => {
    const frameNum = (i + 1) * 10;
    // Anomaly peak between frames 40 and 80
    const anomalyScore = isDeepfake && frameNum >= 40 && frameNum <= 80 ? 92 : isDeepfake ? 65 : 12;
    return {
      frameNum,
      anomalyScore,
      blinkDetected: frameNum === 30 || frameNum === 90,
      timestamp: `00:0${Math.floor(frameNum / fps)}.${((frameNum % fps) * 33).toString().padStart(2, '0')}`
    };
  });

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-surface-container p-5 space-y-4 shadow-xs">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-container">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDeepfake ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
          }`}>
            <Video className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-on-surface">{videoTitle}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">
                1080p • {fps} FPS • H.264 AVC
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Temporal Frame Consistency & Facial Seam Boundary Analyzer
            </p>
          </div>
        </div>

        {/* Deepfake Verdict */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[10px] uppercase font-mono tracking-wider text-outline">Facial Authenticity</div>
            <div className={`text-base font-mono font-extrabold ${
              authenticityScore < 40 ? 'text-purple-600' : 'text-emerald-600'
            }`}>
              {authenticityScore}%
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${
            isDeepfake
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {isDeepfake ? 'MANIPULATED DEEPFAKE DETECTED' : 'GENUINE RECORDING'}
          </div>
        </div>
      </div>

      {/* Frame Visual Simulation Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Visual Inspection Viewport */}
        <div className="lg:col-span-7 bg-surface-container-high rounded-xl aspect-video relative overflow-hidden border border-surface-container flex items-center justify-center">
          {/* Simulated Face Model SVG */}
          <svg className="w-48 h-48" viewBox="0 0 200 200">
            {/* Base head outline */}
            <ellipse cx="100" cy="100" rx="60" ry="75" fill="#1e293b" stroke="#475569" strokeWidth="2" />
            
            {/* Eyes */}
            <ellipse cx="80" cy="85" rx="10" ry="6" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.5" />
            <circle cx="80" cy="85" r="3" fill="#38bdf8" />
            <ellipse cx="120" cy="85" rx="10" ry="6" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.5" />
            <circle cx="120" cy="85" r="3" fill="#38bdf8" />

            {/* Mouth */}
            <path d="M 85 135 Q 100 145 115 135" stroke="#94a3b8" strokeWidth="2" fill="none" />

            {/* Synthetic Seam Heatmap Overlay */}
            {isDeepfake && showHeatmap && (
              <path
                d="M 60 70 Q 100 50 140 70 Q 145 140 100 165 Q 55 140 60 70"
                fill="none"
                stroke="#a855f7"
                strokeWidth="4"
                strokeDasharray="4 2"
                className="animate-pulse"
                opacity="0.85"
              />
            )}

            {/* Landmark Mesh Points */}
            {showLandmarks && (
              <g fill="#38bdf8">
                <circle cx="80" cy="75" r="2" />
                <circle cx="120" cy="75" r="2" />
                <circle cx="100" cy="110" r="2" />
                <circle cx="85" cy="135" r="2" />
                <circle cx="115" cy="135" r="2" />
                <circle cx="100" cy="142" r="2" />
                <circle cx="70" cy="100" r="2" />
                <circle cx="130" cy="100" r="2" />
              </g>
            )}
          </svg>

          {/* Overlay HUD Tags */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono text-white flex items-center gap-1.5 border border-white/10">
            <Scan className="w-3.5 h-3.5 text-purple-400 animate-spin" />
            <span>Frame #{selectedFrame} • FaceSeam v4.2</span>
          </div>

          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <button
              onClick={() => setShowLandmarks(!showLandmarks)}
              className={`px-2 py-1 rounded text-[10px] font-mono font-medium transition-colors ${
                showLandmarks ? 'bg-primary text-white' : 'bg-black/60 text-slate-300'
              }`}
            >
              Landmarks {showLandmarks ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-2 py-1 rounded text-[10px] font-mono font-medium transition-colors ${
                showHeatmap ? 'bg-purple-600 text-white' : 'bg-black/60 text-slate-300'
              }`}
            >
              Seam Heatmap {showHeatmap ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Frame Metric Breakdown */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-on-surface-variant font-medium">Jawline Boundary Inconsistency</span>
              <span className="font-mono font-bold text-purple-600">{isDeepfake ? '88.4%' : '4.1%'}</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full"
                style={{ width: isDeepfake ? '88.4%' : '4.1%' }}
              />
            </div>
            <p className="text-[11px] text-outline pt-0.5">
              Gaussian blend seam detected between source face and synthetic overlay.
            </p>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-on-surface-variant font-medium">Blinking Rate & Eye Aspect Ratio</span>
              <span className="font-mono font-bold text-amber-600">{isDeepfake ? '1.2 blinks/min (Abnormal)' : '14 blinks/min (Normal)'}</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: isDeepfake ? '15%' : '80%' }}
              />
            </div>
            <p className="text-[11px] text-outline pt-0.5">
              Unnatural prolonged open eyes typical of GAN frame generation.
            </p>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-on-surface-variant font-medium">Lip-Sync Phase Correlation</span>
              <span className="font-mono font-bold text-red-600">{isDeepfake ? '0.31 (Audio Lag Drift)' : '0.94 (Synchronized)'}</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full"
                style={{ width: isDeepfake ? '31%' : '94%' }}
              />
            </div>
            <p className="text-[11px] text-outline pt-0.5">
              Phoneme-to-viseme mouth shape alignment failure detected.
            </p>
          </div>
        </div>
      </div>

      {/* Frame Scrubber Bar */}
      <div className="space-y-2 pt-2 border-t border-surface-container">
        <div className="flex items-center justify-between text-xs text-on-surface-variant">
          <span className="font-semibold text-on-surface">Frame-by-Frame Timeline (120 Total Frames)</span>
          <span className="font-mono text-outline">Selected: Frame #{selectedFrame}</span>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
          {frames.map((f) => (
            <button
              key={f.frameNum}
              onClick={() => setSelectedFrame(f.frameNum)}
              className={`p-2 rounded-lg text-center font-mono text-[10px] transition-all border ${
                selectedFrame === f.frameNum
                  ? 'border-purple-500 bg-purple-50 text-purple-900 shadow-xs'
                  : f.anomalyScore > 75
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-surface-container bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <div className="font-bold">#{f.frameNum}</div>
              <div className="text-[9px] opacity-75">{f.anomalyScore}%</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
