import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RiskBadge } from '../common/RiskBadge';
import { StatusBadge } from '../common/StatusBadge';
import { GovDisclaimer } from '../common/GovDisclaimer';
import {
  IndianRupee,
  Clock,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  Calendar,
  Building2,
  User,
  MapPin,
  FileText,
  SearchCheck,
  Download,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ClipboardList,
  Copy,
  ChevronLeft,
  FileCheck2,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

export const ProjectDetailsPage: React.FC = () => {
  const {
    selectedProjectId,
    setSelectedProjectId,
    getProjectById,
    projects,
    currentRole,
    investigations,
    navigateToCase,
    setCurrentPage,
    updateProjectProgress,
    createInvestigationFromAlert,
    getProjectAnalysis,
    showToast,
  } = useApp();

  const project =
    (selectedProjectId ? getProjectById(selectedProjectId) : undefined) ||
    projects[0];

  const analysis = project ? getProjectAnalysis(project.id) : null;

  // Active Tab: 'overview' | 'financial' | 'progress' | 'risk' | 'duplicates' | 'documents' | 'investigation'
  const [activeTab, setActiveTab] = useState<
    'overview' | 'financial' | 'progress' | 'risk' | 'duplicates' | 'documents' | 'investigation'
  >('overview');

  // Progressive Disclosure Toggles
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [newPhysical, setNewPhysical] = useState(project ? project.physicalProgress : 0);
  const [newExp, setNewExp] = useState(project ? project.expenditure : 0);
  const [progressRemarks, setProgressRemarks] = useState('');

  if (!project) {
    return (
      <div className="bg-white p-8 rounded-lg text-center text-slate-600 border border-slate-200">
        <p>No project selected.</p>
        <button
          onClick={() => setCurrentPage('projects')}
          className="mt-3 px-4 py-2 bg-[#002D62] text-white rounded text-xs font-bold"
        >
          Return to Projects Directory
        </button>
      </div>
    );
  }

  const existingCase = investigations.find((c) => c.projectId === project.id);
  const overrunDiff = (project.expenditure ?? 0) - (project.sanctionedAmount ?? 0);
  const isOverrun = overrunDiff > 0;
  const overrunPct = project.sanctionedAmount > 0
    ? Math.round((overrunDiff / project.sanctionedAmount) * 100)
    : 0;
  const progressGap = (project.financialUtilization ?? 0) - (project.physicalProgress ?? 0);

  const handleInitiateInvestigation = () => {
    if (existingCase) {
      navigateToCase(existingCase.id);
    } else {
      createInvestigationFromAlert('ALT-2026-0091', 'Dr. Vivek Deshmukh (Auditor)');
      showToast('Investigation Docket Opened', `Formal review initiated for ${project.id}.`, 'info');
    }
  };

  const handleSaveProgress = () => {
    updateProjectProgress(project.id, Number(newPhysical), Number(newExp));
    showToast('Progress Updated', `Milestone status updated for ${project.id}.`, 'success');
    setProgressModalOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Navigation Breadcrumb & Project Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => setCurrentPage('projects')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#002D62] hover:underline self-start"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Projects Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Switch Project:</span>
          <select
            value={project.id}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#002D62]"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.district}) - {p.riskLevel}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TOP SECTION: Project Identity & Prominent Risk */}
      <div className="bg-white p-5 sm:p-6 rounded-lg border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {project.id}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-bold text-slate-700">
                {project.district} District
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-600">{project.category}</span>
              <span className="text-slate-300">•</span>
              <StatusBadge status={project.status} size="sm" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-[#002D62] tracking-tight">
              {project.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Implementing Agency: <strong className="text-slate-800">{project.implementingAgency}</strong> | Nodal Officer: <strong className="text-slate-800">{project.nodalOfficer}</strong>
            </p>
          </div>

          {/* Prominent Risk Card */}
          <div className="p-3.5 sm:p-4 rounded-lg bg-slate-50 border border-slate-200 text-center min-w-[160px] self-start sm:self-auto">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Risk Assessment
            </div>
            <div className="mt-1">
              <span
                className={`text-lg sm:text-xl font-extrabold uppercase px-3 py-1 rounded-full inline-block ${
                  project.riskLevel === 'CRITICAL'
                    ? 'bg-rose-600 text-white'
                    : project.riskLevel === 'HIGH'
                    ? 'bg-amber-500 text-white'
                    : project.riskLevel === 'MEDIUM'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {project.riskLevel} RISK
              </span>
            </div>
            <div className="text-xs font-mono font-bold text-slate-600 mt-1">
              Score: {project.riskScore} / 100
            </div>
          </div>
        </div>

        {/* PROJECT STATUS SUMMARY BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100 text-center font-mono">
          <div className="p-2.5 bg-slate-50 rounded-md">
            <div className="text-[11px] text-slate-500 font-sans font-semibold">Physical Progress</div>
            <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              {project.physicalProgress}%
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-md">
            <div className="text-[11px] text-slate-500 font-sans font-semibold">Financial Utilization</div>
            <div
              className={`text-base sm:text-lg font-bold mt-0.5 ${
                progressGap > 20 ? 'text-rose-700' : 'text-slate-900'
              }`}
            >
              {project.financialUtilization}%
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-md">
            <div className="text-[11px] text-slate-500 font-sans font-semibold">Timeline Delay</div>
            <div
              className={`text-base sm:text-lg font-bold mt-0.5 ${
                project.delayDays > 30 ? 'text-amber-700' : 'text-slate-900'
              }`}
            >
              {project.delayDays > 0 ? `${project.delayDays} days` : 'On Schedule'}
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-md">
            <div className="text-[11px] text-slate-500 font-sans font-semibold">Sanctioned Amount</div>
            <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              ₹{project.sanctionedAmount} Lakh
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-md col-span-2 sm:col-span-1">
            <div className="text-[11px] text-slate-500 font-sans font-semibold">Total Expenditure</div>
            <div
              className={`text-base sm:text-lg font-bold mt-0.5 ${
                isOverrun ? 'text-rose-700' : 'text-slate-900'
              }`}
            >
              ₹{project.expenditure} Lakh
            </div>
          </div>
        </div>

        {/* WHY THIS PROJECT NEEDS ATTENTION (3-5 Clear Plain-Language Findings) */}
        <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs sm:text-sm font-bold text-rose-900 uppercase tracking-wider">
              WHY THIS PROJECT NEEDS ATTENTION
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-800 pt-1">
            {isOverrun && (
              <div className="flex items-start gap-2 bg-white/80 p-2 rounded border border-rose-100">
                <span className="w-2 h-2 rounded-full bg-rose-600 mt-1 shrink-0" />
                <div>
                  <strong>Cost Overrun: </strong>
                  Expenditure (₹{project.expenditure}L) is significantly higher than the sanctioned limit (₹{project.sanctionedAmount}L, +{overrunPct}%).
                </div>
              </div>
            )}

            {progressGap > 15 && (
              <div className="flex items-start gap-2 bg-white/80 p-2 rounded border border-rose-100">
                <span className="w-2 h-2 rounded-full bg-rose-600 mt-1 shrink-0" />
                <div>
                  <strong>Progress Divergence: </strong>
                  Financial utilization ({project.financialUtilization}%) is {progressGap} percentage points higher than physical progress ({project.physicalProgress}%).
                </div>
              </div>
            )}

            {project.delayDays > 30 && (
              <div className="flex items-start gap-2 bg-white/80 p-2 rounded border border-rose-100">
                <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                <div>
                  <strong>Timeline Delay: </strong>
                  The project is currently {project.delayDays} days behind the approved completion schedule.
                </div>
              </div>
            )}

            {project.duplicateSimilarity && project.duplicateSimilarity > 70 && (
              <div className="flex items-start gap-2 bg-white/80 p-2 rounded border border-rose-100">
                <span className="w-2 h-2 rounded-full bg-purple-600 mt-1 shrink-0" />
                <div>
                  <strong>Similar Project Identified: </strong>
                  A work with {project.duplicateSimilarity}% similarity was found in {project.district} district.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RECOMMENDED ACTION BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleInitiateInvestigation}
              className="px-4 py-2 bg-[#002D62] hover:bg-blue-900 text-white text-xs font-bold rounded shadow-xs transition-colors flex items-center gap-1.5"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>{existingCase ? 'View Active Investigation' : 'Start Investigation'}</span>
            </button>

            {currentRole === 'DISTRICT_AUTHORITY' && (
              <button
                onClick={() => setProgressModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded shadow-xs transition-colors"
              >
                Update Ground Progress
              </button>
            )}

            <button
              onClick={() => {
                showToast('Clarification Sent', `Inquiry dispatched to ${project.implementingAgency}.`, 'info');
              }}
              className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded transition-colors"
            >
              Request Clarification
            </button>
          </div>

          <button
            onClick={() => {
              showToast('Exporting Dossier', `Downloading audit summary for ${project.id}...`, 'success');
            }}
            className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Summary</span>
          </button>
        </div>
      </div>

      {/* SIMPLE TABS NAVIGATION */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50/70">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'financial', label: 'Financial' },
            { id: 'progress', label: 'Progress & Delay' },
            { id: 'risk', label: 'Risk Analysis' },
            { id: 'duplicates', label: 'Similar Works' },
            { id: 'documents', label: 'Documents' },
            { id: 'investigation', label: 'Investigation & History' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-[#002D62] text-[#002D62] bg-white font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="p-5 sm:p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-[#002D62] uppercase tracking-wider mb-3">
                Project Information & Key Contacts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-md border border-slate-200 space-y-2">
                  <div>
                    <span className="text-slate-400 block">Work Description:</span>
                    <span className="font-semibold text-slate-800">{project.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Sanction Order Reference:</span>
                    <span className="font-mono text-slate-800">AS-{project.id.replace('MPLADS-', '')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Sanction Date:</span>
                    <span className="font-mono text-slate-800">{project.startDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Target Completion Date:</span>
                    <span className="font-mono text-slate-800">{project.expectedCompletionDate}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-md border border-slate-200 space-y-2">
                  <div>
                    <span className="text-slate-400 block">Executing Agency:</span>
                    <span className="font-semibold text-slate-800">{project.implementingAgency}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Nodal Officer:</span>
                    <span className="font-semibold text-slate-800">{project.nodalOfficer}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Contractor / Vendor:</span>
                    <span className="font-semibold text-slate-800">{project.contractorName || 'Public Works Contractor'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">GPS Coordinates:</span>
                    <span className="font-mono text-slate-800">
                      {project.coordinates.lat.toFixed(4)}° N, {project.coordinates.lng.toFixed(4)}° E
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FINANCIAL */}
        {activeTab === 'financial' && (
          <div className="p-5 sm:p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-[#002D62] uppercase tracking-wider mb-2">
                FINANCIAL SUMMARY
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-center">
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-500 font-sans">Sanctioned Budget</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    ₹{project.sanctionedAmount} Lakh
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-500 font-sans">Funds Released</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    ₹{project.sanctionedAmount} Lakh
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-500 font-sans">Total Disbursed</div>
                  <div
                    className={`text-2xl font-bold mt-1 ${
                      isOverrun ? 'text-rose-700' : 'text-slate-900'
                    }`}
                  >
                    ₹{project.expenditure} Lakh
                  </div>
                </div>
              </div>

              {/* Cost Status Badge */}
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-md text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-rose-900">Cost Status: </span>
                  <span className="text-slate-800">
                    {isOverrun
                      ? `Significantly Above Sanctioned Amount (+₹${overrunDiff.toFixed(1)} Lakh, +${overrunPct}%)`
                      : 'Within Approved Sanction Limit'}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-rose-200 text-rose-900 font-bold rounded text-[11px]">
                  {isOverrun ? 'OVERRUN DETECTED' : 'NORMAL'}
                </span>
              </div>
            </div>

            {/* AI Finding Banner */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs space-y-1">
              <div className="font-bold text-[#002D62] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-[#002D62]" />
                <span>AI FINDING</span>
              </div>
              <p className="text-slate-700">
                Unusual expenditure pattern identified. High volume of rapid disbursement drawdowns occurred prior to certified milestone completions.
              </p>
            </div>

            {/* Toggle Payment Details Table */}
            <div className="pt-2">
              <button
                onClick={() => setShowPaymentDetails(!showPaymentDetails)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>{showPaymentDetails ? 'Hide Payment Details' : 'View Payment Details'}</span>
                {showPaymentDetails ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {showPaymentDetails && (
                <div className="mt-3 overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Voucher Ref</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Vendor / Beneficiary</th>
                        <th className="py-2.5 px-3">Purpose</th>
                        <th className="py-2.5 px-3 text-right">Amount (₹ Lakh)</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {project.payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-bold text-slate-800">{p.id}</td>
                          <td className="py-2 px-3 font-mono text-slate-600">{p.date}</td>
                          <td className="py-2 px-3 font-medium text-slate-900">{p.vendor}</td>
                          <td className="py-2 px-3 text-slate-700">{p.description}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                            ₹{(p.amount ?? 0).toFixed(1)}L
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                p.status === 'Approved'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PROGRESS & DELAY */}
        {activeTab === 'progress' && (
          <div className="p-5 sm:p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-[#002D62] uppercase tracking-wider mb-4">
                PROJECT PROGRESS
              </h3>

              <div className="space-y-4 max-w-2xl text-xs">
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Physical Progress (Verified on Ground)</span>
                    <span className="font-mono font-bold">{project.physicalProgress}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${project.physicalProgress}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Financial Utilization (Funds Disbursed)</span>
                    <span className="font-mono font-bold text-rose-700">
                      {project.financialUtilization}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-600 rounded-full transition-all"
                      style={{ width: `${project.financialUtilization}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Progress Gap */}
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg inline-block">
                <span className="text-xs text-slate-500 font-medium">Progress Gap: </span>
                <span className="text-sm font-bold text-rose-700 font-mono">
                  {progressGap} percentage points
                </span>
                <span className="text-xs text-slate-500 ml-1">
                  (Financial release exceeds physical execution)
                </span>
              </div>
            </div>

            {/* Delay Section */}
            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                SCHEDULE DELAY
              </h4>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="text-xs text-amber-800 font-semibold">Total Delay</div>
                  <div className="text-xl font-bold font-mono text-amber-900 mt-0.5">
                    {project.delayDays} days
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Status: <span className="text-amber-800">Significantly Delayed</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Target Completion Date: <strong className="font-mono">{project.expectedCompletionDate}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Plain-Language AI Assessment */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs space-y-1">
              <div className="font-bold text-[#002D62] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-[#002D62]" />
                <span>AI Assessment</span>
              </div>
              <p className="text-slate-700">
                High likelihood of further delay based on current project progress velocity. Ground inspection recommended.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: RISK ANALYSIS */}
        {activeTab === 'risk' && (
          <div className="p-5 sm:p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-[#002D62] uppercase tracking-wider mb-3">
                AI RISK ANALYSIS
              </h3>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between max-w-xl">
                <div>
                  <span className="text-xs text-slate-500 block">Project Risk Assessment</span>
                  <span className="text-xl font-bold text-rose-700 uppercase">
                    {project.riskLevel} RISK
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Risk Score</span>
                  <span className="text-2xl font-bold font-mono text-rose-700">
                    {project.riskScore} / 100
                  </span>
                </div>
              </div>
            </div>

            {/* KEY FINDINGS */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                KEY FINDINGS
              </h4>
              <ul className="space-y-2 text-xs text-slate-800">
                {project.aiFindings && project.aiFindings.length > 0 ? (
                  project.aiFindings.map((finding, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0 mt-1" />
                      <span>{finding}</span>
                    </li>
                  ))
                ) : (
                  <>
                    {isOverrun && (
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0 mt-1" />
                        <span>Cost anomaly — Booked expenditure exceeds sanction by ₹{overrunDiff.toFixed(1)} Lakh (+{overrunPct}%)</span>
                      </li>
                    )}
                    {project.delayDays > 30 && (
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1" />
                        <span>Significant project delay — Currently {project.delayDays} days past scheduled milestone</span>
                      </li>
                    )}
                    {progressGap > 15 && (
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0 mt-1" />
                        <span>Progress and expenditure mismatch — {progressGap} percentage points divergence between funds ({project.financialUtilization}%) and physical execution ({project.physicalProgress}%)</span>
                      </li>
                    )}
                    {project.duplicateSimilarity && project.duplicateSimilarity > 70 && (
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0 mt-1" />
                        <span>Highly similar project identified — {project.duplicateSimilarity}% match in vicinity</span>
                      </li>
                    )}
                  </>
                )}
              </ul>
            </div>

            {/* WHY THE SYSTEM FLAGGED THIS PROJECT */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider">
                WHY THE SYSTEM FLAGGED THIS PROJECT
              </h4>
              <p>
                The automated monitoring model assesses expenditure rate against milestone verifications. This project triggered multiple independent anomaly thresholds: rapid financial drawdown with lagging physical progress, substantial budget overrun, and an execution delay exceeding 90 days.
              </p>
            </div>

            {/* Officer Decision Options */}
            <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                OFFICER DECISION SUPPORT
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleInitiateInvestigation}
                  className="px-3.5 py-1.5 bg-[#002D62] text-white text-xs font-bold rounded shadow-xs hover:bg-blue-900"
                >
                  Start Formal Investigation
                </button>
                <button
                  onClick={() => showToast('Marked for Monitoring', 'Project added to close watch watchlist.', 'info')}
                  className="px-3.5 py-1.5 bg-amber-100 text-amber-900 text-xs font-semibold rounded hover:bg-amber-200"
                >
                  Mark for Close Monitoring
                </button>
                <button
                  onClick={() => showToast('Dismissed', 'Risk flag dismissed with officer note.', 'warning')}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded hover:bg-slate-200"
                >
                  Dismiss / False Positive
                </button>
              </div>
            </div>

            {/* Advanced Technical Details Collapsible */}
            <div className="pt-2">
              <button
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                className="text-xs font-semibold text-slate-600 hover:text-[#002D62] flex items-center gap-1"
              >
                <span>Advanced Technical Details</span>
                {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showTechnicalDetails && analysis && (
                <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-sans">Model</span>
                      <span className="font-bold text-slate-800">Isolation Forest</span>
                      <span className="block text-[10px] text-slate-500">Score: {analysis.isolationForest.anomalyScore}/100</span>
                    </div>

                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-sans">Risk Classifier</span>
                      <span className="font-bold text-slate-800">XGBoost Prob.</span>
                      <span className="block text-[10px] text-rose-700">
                        {((analysis.xgboostRisk?.riskProbability ?? 0) * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-sans">Delay Predictor</span>
                      <span className="font-bold text-slate-800">Random Forest</span>
                      <span className="block text-[10px] text-amber-700">+{analysis.delayPrediction.predictedDelayDays} Days</span>
                    </div>

                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-sans">Similarity</span>
                      <span className="font-bold text-slate-800">MiniLM-L6</span>
                      <span className="block text-[10px] text-indigo-700">{analysis.duplicateDetection.score}%</span>
                    </div>
                  </div>

                  {/* SHAP Values */}
                  {analysis.shapExplanation && (
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">SHAP Feature Contributions:</span>
                      <div className="space-y-1">
                        {analysis.shapExplanation.values.map((v) => (
                          <div key={v.feature} className="flex justify-between text-[11px]">
                            <span className="text-slate-600">{v.displayName}</span>
                            <span className={`font-mono font-bold ${v.shapValue > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                              {v.sign}{v.shapValue} pts
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: SIMILAR WORKS (DUPLICATE DETECTION) */}
        {activeTab === 'duplicates' && (
          <div className="p-5 sm:p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-[#002D62] uppercase tracking-wider mb-2">
                SIMILAR WORK IDENTIFICATION
              </h3>
              <p className="text-xs text-slate-600">
                Detects works with overlapping descriptions, contractor allocations, or close geographic proximity.
              </p>
            </div>

            {project.duplicateSimilarity && project.duplicateSimilarity > 70 ? (
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-purple-200 text-purple-900 font-bold rounded text-xs">
                      {project.duplicateSimilarity}% similarity
                    </span>
                    <span className="font-bold text-purple-900 text-sm">
                      POTENTIALLY SIMILAR WORK DETECTED
                    </span>
                  </div>
                  <span className="text-xs text-purple-700 font-semibold">
                    Potential Duplicate — Requires Verification
                  </span>
                </div>

                <p className="text-xs text-slate-700">
                  Another project with a highly similar work description, identical executing agency, and within 5.2 km radius was identified in Pune district.
                </p>

                {/* Side-by-Side Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
                  <div className="p-3 bg-white rounded border border-purple-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Current Project</span>
                    <div className="font-bold text-[#002D62] mt-0.5">{project.name}</div>
                    <div className="text-slate-500 font-mono text-[11px]">{project.id}</div>
                    <div className="mt-2 text-slate-600">
                      Sanctioned: ₹{project.sanctionedAmount}L | Contractor: {project.contractorName}
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded border border-purple-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Compared Work</span>
                    <div className="font-bold text-[#002D62] mt-0.5">Community Healthcare Centre Upgrade</div>
                    <div className="text-slate-500 font-mono text-[11px]">MPLADS-MH-PUN-2025-00319</div>
                    <div className="mt-2 text-slate-600">
                      Sanctioned: ₹20.0L | Contractor: {project.contractorName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      showToast('Review Docket Opened', 'Cross-project comparison report ready.', 'info');
                    }}
                    className="px-3 py-1.5 bg-[#002D62] text-white text-xs font-bold rounded shadow-xs"
                  >
                    Compare Scope Documents
                  </button>
                  <button
                    onClick={() => {
                      showToast('Marked Verified', 'Marked as independent scope by officer.', 'success');
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded hover:bg-slate-50"
                  >
                    Confirm Independent Scope
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-lg text-center text-xs text-slate-500 border border-slate-200">
                No duplicate or overlapping works flagged for this project in the district repository.
              </div>
            )}
          </div>
        )}

        {/* TAB 6: DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#002D62] uppercase tracking-wider mb-1">
                PROJECT RECORDS & DOCUMENTS
              </h3>
              <p className="text-xs text-slate-500">
                Required statutory records, administrative sanctions, and ground measurement books
              </p>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { name: 'Administrative Sanction (AS) Order', ref: `AS-${project.id.replace('MPLADS-', '')}`, status: 'Verified', date: project.startDate },
                { name: 'Technical Sanction (TS) Approval', ref: 'TS-PWD-PUN-2026-88', status: 'Verified', date: '15-Oct-2025' },
                { name: 'Measurement Book (MB) Entries', ref: 'MB-Book-412/2026', status: 'Discrepancy Flagged', date: '28-Jan-2026' },
                { name: 'Utilization Certificate (UC) FY25', ref: 'UC-MH-PUN-2026-04', status: 'Pending Review', date: '14-Feb-2026' },
                { name: 'Geo-Tagged Site Inspection Photos', ref: '6 Photos Uploaded', status: 'Verified', date: '02-Mar-2026' },
              ].map((doc, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{doc.name}</div>
                    <div className="text-slate-500 font-mono text-[11px]">{doc.ref} • {doc.date}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        doc.status === 'Verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : doc.status === 'Discrepancy Flagged'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {doc.status}
                    </span>
                    <button
                      onClick={() => showToast('Viewing Document', `Opening ${doc.name}...`, 'info')}
                      className="text-xs text-[#002D62] font-semibold hover:underline"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: INVESTIGATION & ACTIVITY */}
        {activeTab === 'investigation' && (
          <div className="p-5 sm:p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-[#002D62] uppercase tracking-wider mb-2">
                INVESTIGATION & CASE ACTIVITY
              </h3>
              <p className="text-xs text-slate-500">
                Track formal review progress and officer action items
              </p>
            </div>

            {/* Step-by-step progress indicator */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                INVESTIGATION WORKFLOW
              </div>
              <div className="flex items-center justify-between text-xs max-w-2xl font-semibold">
                <span className="text-emerald-700 font-bold">1. Review ✓</span>
                <span className="text-slate-300">→</span>
                <span className="text-emerald-700 font-bold">2. Assign ✓</span>
                <span className="text-slate-300">→</span>
                <span className="text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded">3. Collect Information (Current)</span>
                <span className="text-slate-300">→</span>
                <span className="text-slate-400">4. Verify</span>
                <span className="text-slate-300">→</span>
                <span className="text-slate-400">5. Close</span>
              </div>
            </div>

            {/* CURRENT TASK */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-lg space-y-2 text-xs">
              <span className="font-bold text-[#002D62] uppercase tracking-wider block">
                CURRENT TASK
              </span>
              <p className="text-slate-800">
                Review project expenditure documents and cross-check contractor payment invoices against certified Measurement Book entries.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  onClick={() => setActiveTab('documents')}
                  className="px-3 py-1.5 bg-[#002D62] text-white text-xs font-bold rounded shadow-xs"
                >
                  View Documents
                </button>
                <button
                  onClick={() => showToast('Note Added', 'Officer verification remark saved to case docket.', 'success')}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded hover:bg-slate-50"
                >
                  Add Officer Note
                </button>
                <button
                  onClick={() => showToast('Clarification Sent', 'Clarification requested from District Engineer.', 'info')}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded hover:bg-slate-50"
                >
                  Request Clarification
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Update Modal for District Authority */}
      {progressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-lg w-full p-5 space-y-4">
            <h3 className="text-base font-bold text-[#002D62]">
              Submit Ground Progress & Billing Update
            </h3>
            <p className="text-xs text-slate-600">
              Update certified physical progress and booked expenditure for project{' '}
              <strong className="font-mono">{project.id}</strong>.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Physical Execution Progress (0-100%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newPhysical}
                  onChange={(e) => setNewPhysical(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-[#002D62] font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Cumulative Booked Expenditure (₹ Lakhs)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newExp}
                  onChange={(e) => setNewExp(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-[#002D62] font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Engineering Certification Remarks / MB Reference
                </label>
                <textarea
                  rows={3}
                  value={progressRemarks}
                  onChange={(e) => setProgressRemarks(e.target.value)}
                  placeholder="Measurement Book No. verified by Assistant Engineer..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-[#002D62]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setProgressModalOpen(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProgress}
                className="px-4 py-1.5 bg-[#002D62] hover:bg-blue-900 text-white rounded text-xs font-bold"
              >
                Save Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
