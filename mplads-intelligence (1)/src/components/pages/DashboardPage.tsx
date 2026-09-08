import React from 'react';
import { useApp } from '../../context/AppContext';
import { RiskBadge } from '../common/RiskBadge';
import { GovDisclaimer } from '../common/GovDisclaimer';
import {
  FolderKanban,
  AlertTriangle,
  ClipboardList,
  ShieldAlert,
  ArrowRight,
  Clock,
  IndianRupee,
  CheckCircle2,
  FileText,
  Building2,
  AlertCircle,
  Eye,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    currentRole,
    projects,
    getFilteredProjectsForRole,
    alerts,
    investigations,
    navigateToProject,
    navigateToCase,
    setCurrentPage,
    setSelectedProjectId,
  } = useApp();

  const roleProjects = getFilteredProjectsForRole();

  // Officer name based on role
  const officerName =
    currentRole === 'SUPER_ADMIN'
      ? 'Shri Amitabh Sharma, IAS'
      : currentRole === 'MONITORING_OFFICER'
      ? 'Shri Yash Kamble (Monitoring Officer)'
      : currentRole === 'DISTRICT_AUTHORITY'
      ? 'Er. Sandeep Patil (District Collectorate)'
      : 'Dr. Vivek Deshmukh (Auditor)';

  // Core metrics for the 4 major summary cards
  const totalProjectsCount = roleProjects.length;
  const criticalCount = roleProjects.filter((p) => p.riskLevel === 'CRITICAL').length;
  const highRiskCount = roleProjects.filter((p) => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL').length;
  const activeInvestigationsCount = investigations.filter(
    (c) => c.status !== 'Resolved' && c.status !== 'False Positive'
  ).length;
  const projectsNeedingAction = roleProjects.filter(
    (p) => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH' || p.delayDays > 60 || p.expenditure > p.sanctionedAmount
  );

  // Additional dynamic counts for role-specific dashboard cards
  const pendingUpdatesCount = roleProjects.filter(
    (p) => p.status === 'Delayed' || p.delayDays > 30 || p.physicalProgress < 50
  ).length;
  const pendingClarificationsCount = investigations.flatMap((c) => c.clarifications).filter(
    (cl) => cl.status === 'Pending'
  ).length;
  const documentsRequiredCount = roleProjects.filter(
    (p) => p.expenditure > 0 && p.payments.length === 0
  ).length || roleProjects.filter((p) => p.status === 'In Progress' && p.physicalProgress >= 50).length;
  const casesAwaitingReviewCount = investigations.filter(
    (c) => c.status === 'Human Review' || c.status === 'Clarification Requested' || c.status === 'In Progress'
  ).length;
  const evidencePendingCount = investigations.filter(
    (c) => c.clarifications.some((cl) => cl.status === 'Pending') || c.status === 'In Progress'
  ).length;

  // Projects for "NEEDS YOUR ATTENTION" sorted by risk score descending
  const attentionProjects = [...projectsNeedingAction]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 4);

  const handleReviewProject = (id: string) => {
    setSelectedProjectId(id);
    navigateToProject(id);
  };

  return (
    <div className="space-y-5">
      {/* Top Greeting Section */}
      <div className="bg-white p-5 sm:p-6 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                MPLADS Project Monitoring
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Live Surveillance
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#002D62] tracking-tight mt-1">
              Good morning, {officerName}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Here is the current status of projects requiring your administrative attention and oversight.
            </p>
          </div>

          <GovDisclaimer compact />
        </div>
      </div>

      {/* 4 Major Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {currentRole === 'DISTRICT_AUTHORITY' ? (
          <>
            <div
              onClick={() => setCurrentPage('projects')}
              className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  My District Projects
                </span>
                <FolderKanban className="w-4 h-4 text-[#002D62]" />
              </div>
              <div className="text-3xl font-bold text-[#002D62] font-mono mt-2">
                {totalProjectsCount}
              </div>
              <p className="text-xs text-slate-500 mt-1.5">{roleProjects[0]?.district || 'District'} Works Portfolio</p>
            </div>

            <div
              onClick={() => setCurrentPage('projects')}
              className="bg-white p-4 sm:p-5 rounded-lg border border-amber-200 hover:border-amber-300 transition-all cursor-pointer shadow-xs bg-amber-50/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Updates Required
                </span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-bold text-amber-700 font-mono mt-2">{pendingUpdatesCount}</div>
              <p className="text-xs text-amber-700 mt-1.5">Milestone progress pending</p>
            </div>

            <div
              onClick={() => setCurrentPage('investigations')}
              className="bg-white p-4 sm:p-5 rounded-lg border border-rose-200 hover:border-rose-300 transition-all cursor-pointer shadow-xs bg-rose-50/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                  Clarifications Pending
                </span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-3xl font-bold text-rose-700 font-mono mt-2">{pendingClarificationsCount}</div>
              <p className="text-xs text-rose-700 mt-1.5">Authority inquiries awaiting reply</p>
            </div>

            <div
              onClick={() => setCurrentPage('project-details')}
              className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Documents Required
                </span>
                <FileText className="w-4 h-4 text-slate-600" />
              </div>
              <div className="text-3xl font-bold text-slate-800 font-mono mt-2">{documentsRequiredCount}</div>
              <p className="text-xs text-slate-500 mt-1.5">UCs & Measurement Books</p>
            </div>
          </>
        ) : currentRole === 'AUDITOR_INVESTIGATOR' ? (
          <>
            <div
              onClick={() => setCurrentPage('investigations')}
              className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Assigned Cases
                </span>
                <ClipboardList className="w-4 h-4 text-[#002D62]" />
              </div>
              <div className="text-3xl font-bold text-[#002D62] font-mono mt-2">
                {activeInvestigationsCount}
              </div>
              <p className="text-xs text-slate-500 mt-1.5">Open verification dockets</p>
            </div>

            <div
              onClick={() => setCurrentPage('investigations')}
              className="bg-white p-4 sm:p-5 rounded-lg border border-amber-200 hover:border-amber-300 transition-all cursor-pointer shadow-xs bg-amber-50/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Cases Awaiting Review
                </span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-bold text-amber-700 font-mono mt-2">{casesAwaitingReviewCount}</div>
              <p className="text-xs text-amber-700 mt-1.5">Action pending auditor review</p>
            </div>

            <div
              onClick={() => setCurrentPage('investigations')}
              className="bg-white p-4 sm:p-5 rounded-lg border border-purple-200 hover:border-purple-300 transition-all cursor-pointer shadow-xs bg-purple-50/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-800">
                  Evidence Pending
                </span>
                <FileText className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-700 font-mono mt-2">{evidencePendingCount}</div>
              <p className="text-xs text-purple-700 mt-1.5">Awaiting contractor vouchers</p>
            </div>

            <div
              onClick={() => setCurrentPage('projects')}
              className="bg-white p-4 sm:p-5 rounded-lg border border-rose-200 hover:border-rose-300 transition-all cursor-pointer shadow-xs bg-rose-50/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                  High Risk Projects
                </span>
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-3xl font-bold text-rose-700 font-mono mt-2">
                {highRiskCount}
              </div>
              <p className="text-xs text-rose-700 mt-1.5">Score ≥ 60/100</p>
            </div>
          </>
        ) : (
          // Monitoring Officer / Super Admin
          <>
            <div
              onClick={() => setCurrentPage('projects')}
              className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Projects Monitored
                </span>
                <FolderKanban className="w-4 h-4 text-[#002D62]" />
              </div>
              <div className="text-3xl font-bold text-[#002D62] font-mono mt-2">
                {totalProjectsCount}
              </div>
              <p className="text-xs text-slate-500 mt-1.5">Across 8 administrative districts</p>
            </div>

            <div
              onClick={() => setCurrentPage('projects')}
              className="bg-white p-4 sm:p-5 rounded-lg border border-amber-200 hover:border-amber-300 transition-all cursor-pointer shadow-xs bg-amber-50/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Projects Needing Action
                </span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-bold text-amber-700 font-mono mt-2">
                {projectsNeedingAction.length}
              </div>
              <p className="text-xs text-amber-700 mt-1.5">Cost, delay or progress flags</p>
            </div>

            <div
              onClick={() => setCurrentPage('risk-alerts')}
              className="bg-white p-4 sm:p-5 rounded-lg border border-rose-200 hover:border-rose-300 transition-all cursor-pointer shadow-xs bg-rose-50/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                  High & Critical Risk
                </span>
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-3xl font-bold text-rose-700 font-mono mt-2">
                {highRiskCount}
              </div>
              <p className="text-xs text-rose-700 mt-1.5">Priority review required</p>
            </div>

            <div
              onClick={() => setCurrentPage('investigations')}
              className="bg-white p-4 sm:p-5 rounded-lg border border-purple-200 hover:border-purple-300 transition-all cursor-pointer shadow-xs bg-purple-50/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-800">
                  Under Investigation
                </span>
                <ClipboardList className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-700 font-mono mt-2">
                {activeInvestigationsCount}
              </div>
              <p className="text-xs text-purple-700 mt-1.5">Formal inquiry proceedings</p>
            </div>
          </>
        )}
      </div>

      {/* "NEEDS YOUR ATTENTION" SECTION - Centerpiece for Officers */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
              <h2 className="text-base sm:text-lg font-bold text-[#002D62] tracking-tight">
                NEEDS YOUR ATTENTION
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              {attentionProjects.length} high-priority projects require administrative review or verification.
            </p>
          </div>

          <button
            onClick={() => setCurrentPage('projects')}
            className="text-xs font-semibold text-[#002D62] hover:text-blue-900 flex items-center gap-1 self-start sm:self-center"
          >
            <span>View All Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* List of Attention Cards */}
        <div className="divide-y divide-slate-100">
          {attentionProjects.map((proj) => {
            // Determine plain language primary reason
            let primaryReason = 'Administrative review recommended based on project metrics.';
            if (proj.expenditure > proj.sanctionedAmount) {
              const overrunPct = Math.round(
                ((proj.expenditure - proj.sanctionedAmount) / proj.sanctionedAmount) * 100
              );
              primaryReason = `Expenditure is significantly above the sanctioned amount (₹${proj.expenditure}L vs ₹${proj.sanctionedAmount}L sanctioned, +${overrunPct}%).`;
            } else if (proj.financialUtilization - proj.physicalProgress > 25) {
              primaryReason = `Financial utilization (${proj.financialUtilization}%) is materially ahead of verified physical progress (${proj.physicalProgress}%).`;
            } else if (proj.delayDays > 60) {
              primaryReason = `Project execution is ${proj.delayDays} days behind the scheduled milestone timeline.`;
            } else if (proj.duplicateSimilarity && proj.duplicateSimilarity > 75) {
              primaryReason = `A highly similar work (${proj.duplicateSimilarity}% match) was identified in close geographic proximity.`;
            }

            const existingCase = investigations.find((c) => c.projectId === proj.id);

            return (
              <div
                key={proj.id}
                className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Project Identity & Reasons */}
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      {proj.id}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-bold text-slate-700">
                      {proj.district} District
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">{proj.category}</span>
                    <span className="text-slate-300">•</span>
                    <RiskBadge level={proj.riskLevel} score={proj.riskScore} size="sm" />
                  </div>

                  <h3
                    onClick={() => handleReviewProject(proj.id)}
                    className="text-base font-bold text-[#002D62] hover:underline cursor-pointer"
                  >
                    {proj.name}
                  </h3>

                  <div className="p-2.5 bg-rose-50/70 border border-rose-100 rounded-md text-xs text-slate-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-rose-900 block sm:inline">
                        Why this project is flagged:{' '}
                      </span>
                      <span>{primaryReason}</span>
                    </div>
                  </div>

                  {/* Summary Metric Chips */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1 font-mono">
                    <div>
                      <span className="text-slate-400">Sanctioned: </span>
                      <span className="font-bold text-slate-800">₹{proj.sanctionedAmount}L</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Spent: </span>
                      <span
                        className={`font-bold ${
                          proj.expenditure > proj.sanctionedAmount ? 'text-rose-700' : 'text-slate-800'
                        }`}
                      >
                        ₹{proj.expenditure}L
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Physical Progress: </span>
                      <span className="font-bold text-slate-800">{proj.physicalProgress}%</span>
                    </div>
                    {proj.delayDays > 0 && (
                      <div>
                        <span className="text-slate-400">Delay: </span>
                        <span className="font-bold text-amber-800">+{proj.delayDays} days</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Primary Action Button */}
                <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0">
                  <button
                    onClick={() => handleReviewProject(proj.id)}
                    className="w-full sm:w-auto px-4 py-2 bg-[#002D62] hover:bg-blue-900 text-white text-xs font-bold rounded-md shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Review Project</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {existingCase && (
                    <button
                      onClick={() => navigateToCase(existingCase.id)}
                      className="w-full sm:w-auto px-3 py-1.5 bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 text-xs font-semibold rounded-md transition-colors"
                    >
                      View Investigation
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Status Breakdown & Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Project Execution Status Overview */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-sm font-bold text-[#002D62] uppercase tracking-wider">
                Execution Status Summary
              </h3>
              <p className="text-xs text-slate-500">
                Overall operational health of projects in your jurisdiction
              </p>
            </div>
            <button
              onClick={() => setCurrentPage('projects')}
              className="text-xs font-semibold text-[#002D62] hover:underline"
            >
              Directory →
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center pt-1">
            <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100">
              <div className="text-xs text-emerald-800 font-semibold">On Schedule</div>
              <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
                {roleProjects.filter((p) => p.delayDays <= 0).length}
              </div>
              <div className="text-[11px] text-emerald-600 mt-0.5">Normal velocity</div>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-100">
              <div className="text-xs text-amber-800 font-semibold">Delayed Works</div>
              <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
                {roleProjects.filter((p) => p.delayDays > 0).length}
              </div>
              <div className="text-[11px] text-amber-600 mt-0.5">Exceeding timeline</div>
            </div>

            <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-100">
              <div className="text-xs text-rose-800 font-semibold">Over Budget</div>
              <div className="text-2xl font-bold font-mono text-rose-700 mt-1">
                {roleProjects.filter((p) => p.expenditure > p.sanctionedAmount).length}
              </div>
              <div className="text-[11px] text-rose-600 mt-0.5">Exceeding sanction</div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Recent Alerts */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-sm font-bold text-[#002D62] uppercase tracking-wider">
                Recent Alerts
              </h3>
              <p className="text-xs text-slate-500">Unacknowledged warnings</p>
            </div>
            <button
              onClick={() => setCurrentPage('risk-alerts')}
              className="text-xs font-semibold text-[#002D62] hover:underline"
            >
              All Alerts ({alerts.length}) →
            </button>
          </div>

          <div className="space-y-2.5">
            {alerts.slice(0, 3).map((a) => (
              <div
                key={a.id}
                onClick={() => handleReviewProject(a.projectId)}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors cursor-pointer text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#002D62] truncate max-w-[180px]">
                    {a.projectName}
                  </span>
                  <RiskBadge level={a.severity} size="sm" />
                </div>
                <p className="text-slate-600 text-[11px] line-clamp-2">{a.description}</p>
                <div className="text-[10px] text-slate-400 font-mono">
                  Detected: {a.detectedDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
