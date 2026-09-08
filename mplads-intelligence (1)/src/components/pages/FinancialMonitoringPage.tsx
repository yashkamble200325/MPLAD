import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { RiskBadge } from '../common/RiskBadge';
import { StatusBadge } from '../common/StatusBadge';
import { GovDisclaimer } from '../common/GovDisclaimer';
import {
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  Building2,
  FileSpreadsheet,
  ArrowUpRight,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const FinancialMonitoringPage: React.FC = () => {
  const { projects, getFilteredProjectsForRole, navigateToProject, currentRole } = useApp();

  const roleProjects = getFilteredProjectsForRole();

  // Metrics
  const totalSanctioned = roleProjects.reduce((sum, p) => sum + p.sanctionedAmount, 0);
  const totalExpenditure = roleProjects.reduce((sum, p) => sum + p.expenditure, 0);
  const overrunProjects = roleProjects.filter((p) => p.expenditure > p.sanctionedAmount);
  const totalOverrunAmount = overrunProjects.reduce(
    (sum, p) => sum + (p.expenditure - p.sanctionedAmount),
    0
  );

  // Category-wise budget vs expenditure chart
  const categoryMap: Record<string, { sanctioned: number; expenditure: number }> = {};
  roleProjects.forEach((p) => {
    if (!categoryMap[p.category]) {
      categoryMap[p.category] = { sanctioned: 0, expenditure: 0 };
    }
    categoryMap[p.category].sanctioned += p.sanctionedAmount;
    categoryMap[p.category].expenditure += p.expenditure;
  });

  const categoryChartData = Object.entries(categoryMap).map(([cat, data]) => ({
    category: cat,
    Sanctioned: Number((data.sanctioned ?? 0).toFixed(1)),
    Expenditure: Number((data.expenditure ?? 0).toFixed(1)),
  }));

  // Contractor concentration analysis
  const vendorMap: Record<string, { count: number; totalSpent: number; highRiskCount: number }> = {};
  roleProjects.forEach((p) => {
    const vName = p.contractorName || p.payments[0]?.vendor || p.implementingAgency;
    if (!vendorMap[vName]) {
      vendorMap[vName] = { count: 0, totalSpent: 0, highRiskCount: 0 };
    }
    vendorMap[vName].count += 1;
    vendorMap[vName].totalSpent += p.expenditure;
    if (p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL') {
      vendorMap[vName].highRiskCount += 1;
    }
  });

  const vendorList = Object.entries(vendorMap)
    .map(([name, d]) => ({
      name,
      count: d.count,
      totalSpent: Number((d.totalSpent ?? 0).toFixed(1)),
      highRiskCount: d.highRiskCount,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent);

  return (
    <div className="space-y-3.5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#002D62] tracking-tight flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-[#002D62]" />
              <span>Public Expenditure & Financial Surveillance</span>
            </h2>
            <span className="px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-mono font-semibold">
              Treasury Integration
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time monitoring of sanctioned ceilings, bill disbursement velocity, and contractor allocation caps
          </p>
        </div>

        <GovDisclaimer compact />
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <StatCard
          title="Sanctioned Total"
          value={`₹${(totalSanctioned ?? 0).toFixed(1)}L`}
          subtitle="Sanctioned Under MPLADS"
          icon={IndianRupee}
          accentColor="slate"
        />
        <StatCard
          title="Cumulative Expenditure"
          value={`₹${(totalExpenditure ?? 0).toFixed(1)}L`}
          subtitle={`Overall Rate: ${Math.round(((totalExpenditure || 0) / (totalSanctioned || 1)) * 100)}%`}
          icon={TrendingUp}
          accentColor="blue"
        />
        <StatCard
          title="Cost Overrun Works"
          value={overrunProjects.length}
          subtitle={`Over-limit: ₹${(totalOverrunAmount ?? 0).toFixed(1)} Lakhs`}
          icon={AlertTriangle}
          accentColor="red"
        />
        <StatCard
          title="Active Contractors"
          value={vendorList.length}
          subtitle="Commercial Agencies"
          icon={Building2}
          accentColor="purple"
        />
      </div>

      {/* Category Wise Expenditure Chart */}
      <div className="bg-white rounded border border-gray-200 p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#002D62]">
              Sectoral Sanction vs Expenditure Breakdown
            </h3>
            <p className="text-[11px] text-gray-500">
              Comparing approved allocations against treasury disbursements (₹ Lakhs)
            </p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="category"
                angle={-20}
                textAnchor="end"
                interval={0}
                tick={{ fontSize: 10 }}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '4px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Sanctioned" fill="#002D62" name="Sanctioned Amount" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Expenditure" fill="#e11d48" name="Actual Expenditure" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost Overrun Projects Table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-gray-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-900">
                Projects with Cost Overrun Anomalies ({overrunProjects.length})
              </h3>
              <p className="text-[11px] text-red-700">
                Disbursements exceeding 100% of approved sanction without ratified Revised Administrative Sanctions (RAS)
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
                <th className="py-2.5 px-3 text-right">Sanctioned</th>
                <th className="py-2.5 px-3 text-right">Actual Spent</th>
                <th className="py-2.5 px-3 text-right">Overrun (₹ Lakhs)</th>
                <th className="py-2.5 px-3 text-center">Overrun %</th>
                <th className="py-2.5 px-3 text-center">Risk Score</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {overrunProjects.map((p) => {
                const diff = p.expenditure - p.sanctionedAmount;
                const pct = Math.round((diff / p.sanctionedAmount) * 100);
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#002D62]">{p.id}</td>
                    <td className="py-2.5 px-3 font-medium text-gray-900 max-w-60 truncate">
                      {p.name}
                    </td>
                    <td className="py-2.5 px-3 text-gray-700">{p.district}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-gray-700">
                      ₹{p.sanctionedAmount}L
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600">
                      ₹{p.expenditure}L
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600">
                      +₹{(diff ?? 0).toFixed(2)}L
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-red-600">
                      +{pct}%
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

      {/* Contractor Concentration & Public Fund Allocation */}
      <div className="bg-white rounded border border-gray-200 p-3.5 sm:p-4 space-y-3 shadow-xs">
        <div className="border-b border-gray-100 pb-2 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#002D62]">
              Contractor Allocation & Risk Concentration
            </h3>
            <p className="text-[11px] text-gray-500">
              Public works volume aggregated by commercial contractor to prevent single-vendor monopolies
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {vendorList.slice(0, 6).map((v) => (
            <div key={v.name} className="p-3 bg-slate-50 rounded border border-gray-200 text-xs space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#002D62] truncate">{v.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-200 text-gray-800 rounded font-semibold">
                  {v.count} Works
                </span>
              </div>
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-[11px] text-gray-500">Cumulative Disbursed:</span>
                <span className="font-bold text-gray-900">₹{v.totalSpent} Lakhs</span>
              </div>
              {v.highRiskCount > 0 && (
                <div className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{v.highRiskCount} High-Risk Flagged Projects</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
