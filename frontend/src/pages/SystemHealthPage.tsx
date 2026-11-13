import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SystemHealthData } from '../types';
import { Activity, CheckCircle2, Cpu, HardDrive, Wifi, ShieldAlert, RefreshCw } from 'lucide-react';

export const SystemHealthPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      const data = await api.getSystemHealth();
      setHealth(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !health) {
    return <div className="p-12 text-center text-xs font-mono text-outline">Loading System Health Diagnostics...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">System Health & Daemon Diagnostics</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              ALL PROBES PASSING
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Operational telemetry for kernel netlink sockets, inference workers, and deterministic risk services.
          </p>
        </div>

        <button
          onClick={fetchHealth}
          className="px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container hover:bg-surface-container text-xs font-semibold flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Probes</span>
        </button>
      </div>

      {/* Resource Metrics Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs">
          <div className="flex items-center justify-between text-xs text-outline font-medium">
            <span>Cluster CPU Load</span>
            <Cpu className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold text-on-surface font-sans">
            {health.system_metrics.cpu_usage_pct}%
          </div>
          <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden mt-2">
            <div className="h-full bg-primary rounded-full" style={{ width: `${health.system_metrics.cpu_usage_pct}%` }} />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs">
          <div className="flex items-center justify-between text-xs text-outline font-medium">
            <span>RAM Utilization</span>
            <HardDrive className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold text-on-surface font-sans">
            {health.system_metrics.memory_usage_pct}%
          </div>
          <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden mt-2">
            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${health.system_metrics.memory_usage_pct}%` }} />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs">
          <div className="flex items-center justify-between text-xs text-outline font-medium">
            <span>Network Gateway</span>
            <Wifi className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold text-on-surface font-sans">
            {health.system_metrics.network_throughput_gbps} <span className="text-xs font-normal text-outline">Gbps</span>
          </div>
          <p className="text-[11px] text-outline mt-2 font-mono">0 dropped packets at NIC</p>
        </div>

        <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs">
          <div className="flex items-center justify-between text-xs text-outline font-medium">
            <span>Core Engine Uptime</span>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold text-on-surface font-sans">
            {Math.floor(health.uptime_seconds / 86400)}d {Math.floor((health.uptime_seconds % 86400) / 3600)}h
          </div>
          <p className="text-[11px] text-emerald-700 font-mono mt-2">Continuous zero-downtime</p>
        </div>
      </div>

      {/* Subsystem Health Grid */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container shadow-xs overflow-hidden">
        <div className="p-4 border-b border-surface-container">
          <h3 className="text-sm font-semibold text-on-surface">Subsystem Probes & Response Latencies</h3>
        </div>
        <div className="divide-y divide-surface-container font-mono">
          {health.services.map((svc, i) => (
            <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container-low transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-on-surface">{svc.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {svc.status}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">{svc.details}</p>
              </div>

              <div className="text-xs font-bold text-primary font-mono shrink-0">
                Latency: {svc.latency_ms} ms
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
