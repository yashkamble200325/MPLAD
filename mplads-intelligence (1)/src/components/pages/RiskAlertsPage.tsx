import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertItem, RiskLevel } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { GovDisclaimer } from '../common/GovDisclaimer';
import {
  AlertTriangle,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  SearchCheck,
  Eye,
  Clock,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const RiskAlertsPage: React.FC = () => {
  const {
    alerts,
    currentRole,
    acknowledgeAlert,
    createInvestigationFromAlert,
    navigateToProject,
    navigateToCase,
    investigations,
  } = useApp();

  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter alerts
  const filteredAlerts = alerts.filter((alert) => {
    // If District Authority, show alerts for their active district jurisdiction
    if (currentRole === 'DISTRICT_AUTHORITY') {
      const activeDistrict = alerts.some((a) => a.district === 'Pune') ? 'Pune' : (alerts[0]?.district || 'Mumbai');
      if (alert.district && alert.district !== activeDistrict) {
        return false;
      }
    }

    const matchesSeverity = severityFilter === 'ALL' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || alert.status === statusFilter;
    const matchesSearch =
      alert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.projectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.riskType.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSeverity && matchesStatus && matchesSearch;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const highCount = alerts.filter((a) => a.severity === 'HIGH').length;
  const newCount = alerts.filter((a) => a.status === 'New').length;

  return (
    <div className="space-y-3.5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#002D62] tracking-tight">
              Early-Warning Risk & Anomaly Alerts
            </h2>
            <span className="px-2 py-0.5 text-[10px] bg-red-50 text-red-800 border border-red-200 rounded font-mono font-semibold">
              {alerts.length} Surveillance Events
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Automated anomaly triage feed alerting monitoring officers to cost, payment, delay, and duplicate spikes
          </p>
        </div>

        <GovDisclaimer compact />
      </div>

      {/* Alert KPI Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded border border-gray-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-semibold text-gray-500 uppercase">Unreviewed / New</span>
            <div className="text-lg font-bold font-mono text-[#002D62] mt-0.5">{newCount}</div>
          </div>
          <span className="p-2 rounded bg-blue-50 text-[#002D62]">
            <Clock className="w-4 h-4" />
          </span>
        </div>

        <div className="bg-white p-3 rounded border border-gray-200 flex items-center justify-between border-l-4 border-l-red-600 shadow-xs">
          <div>
            <span className="text-[10px] font-semibold text-red-700 uppercase">Critical Severity</span>
            <div className="text-lg font-bold font-mono text-red-700 mt-0.5">{criticalCount}</div>
          </div>
          <span className="p-2 rounded bg-red-50 text-red-700">
            <ShieldAlert className="w-4 h-4" />
          </span>
        </div>

        <div className="bg-white p-3 rounded border border-gray-200 flex items-center justify-between border-l-4 border-l-amber-500 shadow-xs">
          <div>
            <span className="text-[10px] font-semibold text-amber-700 uppercase">High Severity</span>
            <div className="text-lg font-bold font-mono text-amber-800 mt-0.5">{highCount}</div>
          </div>
          <span className="p-2 rounded bg-amber-50 text-amber-700">
            <AlertTriangle className="w-4 h-4" />
          </span>
        </div>

        <div className="bg-white p-3 rounded border border-gray-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-semibold text-gray-500 uppercase">Audit Cases Created</span>
            <div className="text-lg font-bold font-mono text-[#002D62] mt-0.5">{investigations.length}</div>
          </div>
          <span className="p-2 rounded bg-blue-50 text-[#002D62]">
            <SearchCheck className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded border border-gray-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-64">
          <div className="relative flex-1 min-w-48">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search alert by ID, title, or project..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#002D62] font-mono"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#002D62]"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#002D62]"
          >
            <option value="ALL">All Statuses</option>
            <option value="New">New</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Showing {filteredAlerts.length} of {alerts.length} alerts
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-2.5">
        {filteredAlerts.map((alert) => {
          const associatedCase = investigations.find((c) => c.projectId === alert.projectId);

          return (
            <div
              key={alert.id}
              className={`bg-white rounded border p-3 sm:p-3.5 transition-all shadow-xs ${
                alert.severity === 'CRITICAL'
                  ? 'border-l-4 border-l-red-600 border-gray-200'
                  : alert.severity === 'HIGH'
                  ? 'border-l-4 border-l-amber-500 border-gray-200'
                  : 'border-l-4 border-l-yellow-500 border-gray-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#002D62]">
                      {alert.id}
                    </span>
                    <RiskBadge level={alert.severity} size="sm" />
                    <span
                      className={`text-[10px] px-2 py-0.2 rounded font-semibold ${
                        alert.status === 'New'
                          ? 'bg-blue-50 text-[#002D62] border border-blue-200'
                          : alert.status === 'Acknowledged'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : alert.status === 'Under Investigation'
                          ? 'bg-purple-50 text-purple-800 border border-purple-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {alert.status}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {alert.detectedDate}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                    {alert.riskType}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {alert.description}
                  </p>

                  <div className="flex items-center gap-2 pt-1 text-xs text-gray-500 font-mono">
                    <span>Project:</span>
                    <button
                      onClick={() => navigateToProject(alert.projectId)}
                      className="font-bold text-[#002D62] hover:underline flex items-center gap-1"
                    >
                      {alert.projectId} — {alert.projectName}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap sm:flex-col items-end gap-2 shrink-0 pt-2 sm:pt-0">
                  <button
                    onClick={() => navigateToProject(alert.projectId)}
                    className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-gray-200"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Dossier</span>
                  </button>

                  {alert.status === 'New' && currentRole !== 'DISTRICT_AUTHORITY' && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-3 py-1.5 rounded bg-blue-50 hover:bg-blue-100 text-[#002D62] border border-blue-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Acknowledge Alert</span>
                    </button>
                  )}

                  {associatedCase ? (
                    <button
                      onClick={() => navigateToCase(associatedCase.id)}
                      className="px-3 py-1.5 rounded bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <SearchCheck className="w-3.5 h-3.5" />
                      <span>Open Case ({associatedCase.id})</span>
                    </button>
                  ) : (
                    currentRole !== 'DISTRICT_AUTHORITY' && (
                      <button
                        onClick={() =>
                          createInvestigationFromAlert(
                            alert.id,
                            'Dr. Vivek Deshmukh (Auditor)'
                          )
                        }
                        className="px-3 py-1.5 rounded bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        <span>Escalate to Audit</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
