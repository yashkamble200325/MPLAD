import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FinancialMonitoringPage } from './FinancialMonitoringPage';
import { DelayProgressPage } from './DelayProgressPage';
import { DuplicateDetectionPage } from './DuplicateDetectionPage';
import { GovDisclaimer } from '../common/GovDisclaimer';
import {
  IndianRupee,
  Clock,
  Copy,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface ProjectMonitoringPageProps {
  initialTab?: 'financial' | 'progress' | 'duplicates';
}

export const ProjectMonitoringPage: React.FC<ProjectMonitoringPageProps> = ({
  initialTab = 'financial',
}) => {
  const { currentRole, duplicatePairs, projects } = useApp();
  const [activeTab, setActiveTab] = useState<'financial' | 'progress' | 'duplicates'>(initialTab);

  const pendingDuplicatesCount = duplicatePairs.filter((d) => d.status === 'Pending Review').length;
  const delayedCount = projects.filter((p) => p.delayDays > 30).length;
  const overrunCount = projects.filter((p) => p.expenditure > p.sanctionedAmount).length;

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-[#002D62] tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#002D62]" />
              <span>Project Execution & Compliance Monitoring</span>
            </h1>
            <span className="px-2.5 py-0.5 text-xs bg-slate-100 text-[#002D62] rounded-full font-semibold border border-slate-200">
              State Oversight
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Track expenditure limits, milestone timelines, physical execution progress, and potential work duplications.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 self-start md:self-center">
          <button
            onClick={() => setActiveTab('financial')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'financial'
                ? 'bg-white text-[#002D62] shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <IndianRupee className="w-3.5 h-3.5" />
            <span>Financial Health</span>
            {overrunCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold">
                {overrunCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'progress'
                ? 'bg-white text-[#002D62] shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Progress & Delays</span>
            {delayedCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                {delayedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('duplicates')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'duplicates'
                ? 'bg-white text-[#002D62] shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Similar Works Check</span>
            {pendingDuplicatesCount > 0 && (
              <span className="px-1.5 py-0.2 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold">
                {pendingDuplicatesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="transition-all">
        {activeTab === 'financial' && <FinancialMonitoringPage />}
        {activeTab === 'progress' && <DelayProgressPage />}
        {activeTab === 'duplicates' && <DuplicateDetectionPage />}
      </div>
    </div>
  );
};
