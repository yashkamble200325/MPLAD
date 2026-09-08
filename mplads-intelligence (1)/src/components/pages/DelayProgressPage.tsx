import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { RiskBadge } from '../common/RiskBadge';
import { StatusBadge } from '../common/StatusBadge';
import { GovDisclaimer } from '../common/GovDisclaimer';
import {
  Clock,
  TrendingUp,
  AlertTriangle,
  FileCheck2,
  Calendar,
  AlertCircle,
  Eye,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const DelayProgressPage: React.FC = () => {
  const { projects, getFilteredProjectsForRole, navigateToProject, currentRole } = useApp();

  const roleProjects = getFilteredProjectsForRole();

  // Metrics
  const delayedProjects = roleProjects.filter((p) => p.delayDays > 0);
  const severeDelayed = roleProjects.filter((p) => p.delayDays > 90);

  // Divergence calculation: projects where Financial % significantly exceeds Physical %
  const divergentProjects = roleProjects.filter(
    (p) => p.financialUtilization - p.physicalProgress > 25
  );

  // Chart data: Physical vs Financial Progress comparison
  const progressComparisonData = roleProjects.slice(0, 8).map((p) => ({
    id: p.id.split('-')[3] || p.id,
    fullName: p.name,
    Physical: p.physicalProgress,
    Financial: Math.min(150, p.financialUtilization),
    Divergence: Math.max(0, Math.round(p.financialUtilization - p.physicalProgress)),
  }));

  return (
    <div className="space-y-3.5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#002D62] tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#002D62]" />
              <span>Execution Delays & Physical-Financial Divergence</span>
            </h2>
            <span className="px-2 py-0.5 text-[10px] bg-amber-50 text-amber-800 border border-amber-200 rounded font-mono font-semibold">
              Milestone Surveillance
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Detecting premature financial drawdowns ahead of certified ground execution milestones
          </p>
        </div>

        <GovDisclaimer compact />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <StatCard
          title="Delayed Projects"
          value={delayedProjects.length}
          subtitle="Past Target Completion"
          icon={Clock}
          accentColor="amber"
        />
        <StatCard
          title="Severe Delay (>90 Days)"
          value={severeDelayed.length}
          subtitle="Critical Stagnation"
          icon={AlertTriangle}
          accentColor="red"
        />
        <StatCard
          title="High Divergence (>25%)"
          value={divergentProjects.length}
          subtitle="Premature Fund Release"
          icon={TrendingUp}
          accentColor="blue"
        />
        <StatCard
          title="On-Schedule Ratio"
          value={`${roleProjects.length > 0 ? Math.round(((roleProjects.length - delayedProjects.length) / roleProjects.length) * 100) : 0}%`}
          subtitle="Healthy Timeline"
          icon={CheckCircle2}
          accentColor="emerald"
        />
      </div>

      {/* Progress Comparison Chart */}
      <div className="bg-white rounded border border-gray-200 p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#002D62]">
              Physical Progress (%) vs Financial Utilization (%)
            </h3>
            <p className="text-[11px] text-gray-500">
              Red bars substantially exceeding green bars indicate severe financial divergence anomalies
            </p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={progressComparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="id" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 160]} />
              <Tooltip
                contentStyle={{ fontSize: '11px', borderRadius: '4px' }}
                formatter={(val: any, name: any, item: any) => [
                  `${val}%`,
                  `${name} (${item.payload.fullName.slice(0, 30)}...)`,
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Physical" fill="#10b981" name="Physical Work Done %" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Financial" fill="#e11d48" name="Funds Disbursed %" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Divergence Anomaly Table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-gray-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#002D62]" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#002D62]">
                High Physical vs Financial Divergence Projects ({divergentProjects.length})
              </h3>
              <p className="text-[11px] text-gray-500">
                Disbursements outpace verified site work by more than 25 percentage points
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-slate-50 text-gray-700 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Project ID</th>
                <th className="py-2.5 px-3">Project Name</th>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3 text-center">Physical %</th>
                <th className="py-2.5 px-3 text-center">Financial %</th>
                <th className="py-2.5 px-3 text-center">Divergence Gap</th>
                <th className="py-2.5 px-3 text-center">Delay</th>
                <th className="py-2.5 px-3 text-center">Risk Score</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {divergentProjects.map((p) => {
                const gap = Math.round(p.financialUtilization - p.physicalProgress);
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#002D62]">{p.id}</td>
                    <td className="py-2.5 px-3 font-medium text-gray-900 max-w-64 truncate">
                      {p.name}
                    </td>
                    <td className="py-2.5 px-3 text-gray-700">{p.district}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-gray-800">
                      {p.physicalProgress}%
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-red-600">
                      {Math.round(p.financialUtilization)}%
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-extrabold text-[#002D62]">
                      +{gap}%
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {p.delayDays > 0 ? (
                        <span className="text-red-600 font-semibold">+{p.delayDays}d</span>
                      ) : (
                        <span className="text-emerald-700">0d</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <RiskBadge level={p.riskLevel} score={p.riskScore} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => navigateToProject(p.id)}
                        className="px-2.5 py-1 rounded bg-[#002D62] hover:bg-[#001f44] text-white text-[11px] font-semibold shadow-xs transition-colors"
                      >
                        Inspect Dossier
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
