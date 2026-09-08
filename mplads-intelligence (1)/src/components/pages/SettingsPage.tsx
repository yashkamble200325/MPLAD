import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GovDisclaimer } from '../common/GovDisclaimer';
import {
  Settings,
  Sliders,
  Shield,
  RotateCcw,
  Save,
  CheckCircle2,
  Database,
  RefreshCw,
  Bell,
  Lock,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { restoreBaseline, showToast } = useApp();

  // Settings form states
  const [costOverrunThreshold, setCostOverrunThreshold] = useState('15');
  const [divergenceGapThreshold, setDivergenceGapThreshold] = useState('25');
  const [delayThresholdDays, setDelayThresholdDays] = useState('30');
  const [duplicateThresholdPct, setDuplicateThresholdPct] = useState('75');
  const [syncIntervalMins, setSyncIntervalMins] = useState('15');
  const [auditLogRetentionYears, setAuditLogRetentionYears] = useState('7');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(
      'System Parameters Updated',
      'Anomaly trigger thresholds and sync parameters successfully saved to secure registry.',
      'success'
    );
  };

  return (
    <div className="space-y-3.5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#002D62] tracking-tight flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#002D62]" />
              <span>System Settings & Surveillance Threshold Calibration</span>
            </h2>
            <span className="px-2 py-0.5 text-[10px] bg-slate-100 text-[#002D62] border border-slate-300 rounded font-mono font-semibold">
              Super Admin Only
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure automated alert thresholds, statutory data integration cadence, and retention policies
          </p>
        </div>

        <GovDisclaimer compact />
      </div>

      <form onSubmit={handleSave} className="space-y-3.5">
        {/* Section 1: Anomaly Alert Trigger Thresholds */}
        <div className="bg-white rounded border border-gray-200 p-3.5 sm:p-4 space-y-3.5 shadow-xs">
          <div className="border-b border-gray-100 pb-2.5 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#002D62]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#002D62]">
              Automated Anomaly Alert Trigger Thresholds
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-gray-800 block">
                Cost Overrun Alert Sensitivity (%)
              </label>
              <p className="text-[11px] text-gray-500">
                Trigger flag when disbursements exceed sanctioned budget by this percentage.
              </p>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={costOverrunThreshold}
                  onChange={(e) => setCostOverrunThreshold(e.target.value)}
                  className="w-28 px-2.5 py-1.5 font-mono text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#002D62] focus:border-[#002D62]"
                />
                <span className="text-gray-500">% Over Budget</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-800 block">
                Physical vs Financial Divergence Gap (%)
              </label>
              <p className="text-[11px] text-gray-500">
                Trigger flag when Financial Utilization % exceeds certified Physical Progress % by this margin.
              </p>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  min="10"
                  max="50"
                  value={divergenceGapThreshold}
                  onChange={(e) => setDivergenceGapThreshold(e.target.value)}
                  className="w-28 px-2.5 py-1.5 font-mono text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#002D62] focus:border-[#002D62]"
                />
                <span className="text-gray-500">% Percentage Points Gap</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-800 block">
                Milestone Delay Stagnation Threshold (Days)
              </label>
              <p className="text-[11px] text-gray-500">
                Trigger overdue warning when completion target date is exceeded by:
              </p>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  min="7"
                  max="120"
                  value={delayThresholdDays}
                  onChange={(e) => setDelayThresholdDays(e.target.value)}
                  className="w-28 px-2.5 py-1.5 font-mono text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#002D62] focus:border-[#002D62]"
                />
                <span className="text-gray-500">Days Past Target</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-800 block">
                Cross-Scheme Duplicate Similarity Threshold (%)
              </label>
              <p className="text-[11px] text-gray-500">
                Flag potential duplicate work order when composite similarity exceeds:
              </p>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  min="50"
                  max="95"
                  value={duplicateThresholdPct}
                  onChange={(e) => setDuplicateThresholdPct(e.target.value)}
                  className="w-28 px-2.5 py-1.5 font-mono text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#002D62] focus:border-[#002D62]"
                />
                <span className="text-gray-500">% Match Ratio</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Data Integration & Governance */}
        <div className="bg-white rounded border border-gray-200 p-3.5 sm:p-4 space-y-3.5 shadow-xs">
          <div className="border-b border-gray-100 pb-2.5 flex items-center gap-2">
            <Database className="w-4 h-4 text-[#002D62]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#002D62]">
              Treasury Gateway & Data Governance
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-gray-800 block">
                Public Financial Management System (PFMS) Sync Interval
              </label>
              <p className="text-[11px] text-gray-500">
                Frequency of electronic RTGS disbursement feed ingestion from State Treasury.
              </p>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={syncIntervalMins}
                  onChange={(e) => setSyncIntervalMins(e.target.value)}
                  className="w-28 px-2.5 py-1.5 font-mono text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#002D62] focus:border-[#002D62]"
                />
                <span className="text-gray-500">Minutes</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-800 block">
                Audit Trail & Evidence Retention Period
              </label>
              <p className="text-[11px] text-gray-500">
                CAG and statutory audit compliance retention duration.
              </p>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  min="3"
                  max="15"
                  value={auditLogRetentionYears}
                  onChange={(e) => setAuditLogRetentionYears(e.target.value)}
                  className="w-28 px-2.5 py-1.5 font-mono text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#002D62] focus:border-[#002D62]"
                />
                <span className="text-gray-500">Years</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between bg-white p-3.5 sm:p-4 rounded border border-gray-200 shadow-xs">
          <button
            type="button"
            onClick={restoreBaseline}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-300 hover:bg-slate-100 text-gray-700 text-xs font-semibold transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Default Baseline Parameters</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save System Parameters</span>
          </button>
        </div>
      </form>
    </div>
  );
};
