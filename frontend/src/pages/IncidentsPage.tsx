import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { IncidentItem } from '../types';
import { SeverityBadge, StatusBadge, RiskScoreBadge } from '../components/common/Badges';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Kanban,
  List
} from 'lucide-react';

interface IncidentsPageProps {
  onSelectIncident: (id: string) => void;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({ onSelectIncident }) => {
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  const fetchIncidents = async () => {
    try {
      const data = await api.getIncidents();
      setIncidents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const filtered = incidents.filter((inc) => {
    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;
    const matchesSearch =
      inc.incident_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.assigned_to.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fluid">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-[#E05A1B]/15 text-[#E05A1B] text-[10px] font-mono font-bold uppercase tracking-wider">
              Autonomous SOC Triage
            </span>
            <span className="text-xs text-[#71767C] font-mono">MITRE ATT&CK Correlated</span>
          </div>
          <h1 className="text-2xl font-black text-[#121517] tracking-tight">Incident Command & Investigation</h1>
          <p className="text-xs text-[#5B6168] mt-0.5">
            Real-time correlation of high-velocity multi-stage intrusions, autonomous forensics, and mitigation audit receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="bg-[#EDEAE0] p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-[#131618] shadow-xs' : 'text-[#71767C] hover:text-[#131618]'
              }`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'kanban' ? 'bg-white text-[#131618] shadow-xs' : 'text-[#71767C] hover:text-[#131618]'
              }`}
              title="Kanban view"
            >
              <Kanban className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => onSelectIncident('inc-1042')}
            className="px-3.5 py-1.5 rounded-xl bg-[#E05A1B] text-white text-xs font-bold hover:bg-[#C84E14] transition-all flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>Open Flagship INC-1042</span>
          </button>
        </div>
      </div>

      {/* SLA & Severity KPI Ticker Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="crystal-panel p-4 rounded-2xl">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#71767C] font-bold">Total In Triage</span>
          <div className="mt-1 text-2xl font-black text-[#131618]">{incidents.length} Active</div>
          <span className="text-[11px] text-[#5B6168]">Across 3 tenants</span>
        </div>

        <div className="crystal-panel p-4 rounded-2xl">
          <span className="text-[10px] font-mono uppercase tracking-wider text-rose-600 font-bold">Critical Escalations</span>
          <div className="mt-1 text-2xl font-black text-rose-600">
            {incidents.filter((i) => i.severity === 'CRITICAL').length} High Priority
          </div>
          <span className="text-[11px] text-rose-500 font-semibold">Immediate action req</span>
        </div>

        <div className="crystal-panel p-4 rounded-2xl">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 font-bold">Avg SLA Remaining</span>
          <div className="mt-1 text-2xl font-black text-[#131618]">18 mins</div>
          <span className="text-[11px] text-emerald-600 font-semibold">99.4% on-target</span>
        </div>

        <div className="crystal-panel p-4 rounded-2xl">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 font-bold">Auto-Contained</span>
          <div className="mt-1 text-2xl font-black text-emerald-700">89%</div>
          <span className="text-[11px] text-[#5B6168]">Via eBPF firewall</span>
        </div>
      </div>

      {/* Search & Tabs Filter Bar */}
      <div className="crystal-panel p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8A9099] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incident number, title, assigned analyst..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#F2EFE7]/80 hover:bg-[#F2EFE7] focus:bg-white text-xs text-[#131618] border border-[#DCD7C9] focus:border-[#E05A1B] focus:outline-none transition-all placeholder:text-[#888F96]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 font-mono text-xs">
          {['ALL', 'TRIAGE', 'INVESTIGATING', 'CONTAINED', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl transition-all font-semibold ${
                statusFilter === st
                  ? 'bg-[#181C20] text-white shadow-xs'
                  : 'bg-[#EDEAE0] text-[#555C65] hover:bg-[#E5E1D4]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Incident Display */}
      {loading ? (
        <div className="p-16 text-center crystal-panel rounded-2xl">
          <div className="w-8 h-8 border-2 border-[#E05A1B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs font-mono text-[#71767C]">Loading Correlated Security Incidents...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center crystal-panel rounded-2xl text-xs text-[#71767C]">
          No incidents matching current criteria.
        </div>
      ) : viewMode === 'table' ? (
        /* Crystalline Incident Table */
        <div className="crystal-panel rounded-2xl overflow-hidden border border-[#E5E2D9]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#F2EFE7] text-[#71767C] text-[10px] uppercase font-bold font-mono border-b border-[#E0DCD1]">
                <tr>
                  <th className="py-3 px-4">Incident ID</th>
                  <th className="py-3 px-4">Title & Attack Vector</th>
                  <th className="py-3 px-3">Severity</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Risk</th>
                  <th className="py-3 px-3">SLA</th>
                  <th className="py-3 px-4">Assigned SOC</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDEAE0] bg-white">
                {filtered.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => onSelectIncident(inc.id)}
                    className="hover:bg-[#F9F8F5] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#E05A1B]">
                      {inc.incident_number}
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-bold text-[#131618] group-hover:text-[#E05A1B] transition-colors">
                        {inc.title}
                      </div>
                      <div className="text-[11px] text-[#71767C] truncate mt-0.5">{inc.summary}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <SeverityBadge severity={inc.severity} />
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={inc.status} />
                    </td>
                    <td className="py-3.5 px-3">
                      <RiskScoreBadge score={inc.risk_score} />
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-[#5B6168]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#8A9099]" />
                        {inc.sla_remaining}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-[#131618]">
                      {inc.assigned_to}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIncident(inc.id);
                        }}
                        className="p-1.5 text-[#5B6168] hover:text-[#E05A1B] rounded-lg group-hover:bg-[#EDEAE0] transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban Card Layout */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['INVESTIGATING', 'CONTAINED', 'RESOLVED'].map((columnStatus) => {
            const colIncidents = filtered.filter((i) => i.status === columnStatus);
            return (
              <div key={columnStatus} className="crystal-panel p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E2D9]">
                  <span className="text-xs font-mono font-bold uppercase text-[#131618]">
                    {columnStatus}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#E5E2D9] text-[10px] font-mono font-bold text-[#555C65]">
                    {colIncidents.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {colIncidents.map((inc) => (
                    <div
                      key={inc.id}
                      onClick={() => onSelectIncident(inc.id)}
                      className="p-3.5 rounded-xl bg-white border border-[#E0DCD1] hover:border-[#E05A1B] shadow-xs cursor-pointer space-y-2.5 transition-all group hover:-translate-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-[#E05A1B]">
                          {inc.incident_number}
                        </span>
                        <SeverityBadge severity={inc.severity} />
                      </div>
                      <h4 className="text-xs font-bold text-[#131618] group-hover:text-[#E05A1B] transition-colors line-clamp-2">
                        {inc.title}
                      </h4>
                      <p className="text-[11px] text-[#71767C] line-clamp-2">{inc.summary}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-[#F2EFE7] text-[10px] font-mono text-[#5B6168]">
                        <span>{inc.assigned_to}</span>
                        <span>SLA: {inc.sla_remaining}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
