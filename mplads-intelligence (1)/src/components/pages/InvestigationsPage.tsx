import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InvestigationCase, InvestigationStatus, InvestigationPriority, UserRole, MaharashtraDistrict, RiskLevel } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { GovDisclaimer } from '../common/GovDisclaimer';
import { ConfirmationModal } from '../common/ConfirmationModal';
import {
  SearchCheck,
  ShieldAlert,
  FileText,
  Clock,
  Send,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Building2,
  Calendar,
  MessageSquare,
  Paperclip,
  ExternalLink,
  Plus,
  RotateCcw,
  UserCheck,
  Scale,
  ArrowRight,
  HelpCircle,
  FileCheck,
  FileSpreadsheet,
  FileUp,
} from 'lucide-react';

export const InvestigationsPage: React.FC = () => {
  const {
    investigations,
    selectedCaseId,
    setSelectedCaseId,
    getCaseById,
    projects,
    assignCase,
    createInvestigationCase,
    verifyCaseFinding,
    markCaseFalsePositive,
    setCaseDetermination,
    resolveCase,
    addCaseNote,
    requestClarification,
    respondToClarification,
    uploadEvidence,
    navigateToProject,
    currentRole,
    showToast,
  } = useApp();

  const activeCase = (selectedCaseId ? getCaseById(selectedCaseId) : undefined) || investigations[0];

  // Tab State inside case dossier
  const [activeTab, setActiveTab] = useState<'timeline' | 'clarifications' | 'evidence' | 'notes'>('timeline');

  // Input states
  const [noteInput, setNoteInput] = useState('');
  const [clarifQuestion, setClarifQuestion] = useState('');
  const [clarifDueDate, setClarifDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [evidenceName, setEvidenceName] = useState('');
  const [evidenceType, setEvidenceType] = useState('Measurement Book Extract');

  // Reassign officer modal
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedNewOfficer, setSelectedNewOfficer] = useState(activeCase?.assignedTo || '');

  // Clarification reply modal (District Authority rejoinder)
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [activeClarifId, setActiveClarifId] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyDocName, setReplyDocName] = useState('');
  const [replyPhysical, setReplyPhysical] = useState<number | ''>('');
  const [replyExpenditure, setReplyExpenditure] = useState<number | ''>('');

  // Determination Modals
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyRemarks, setVerifyRemarks] = useState('');
  const [falsePositiveModalOpen, setFalsePositiveModalOpen] = useState(false);
  const [fpJustification, setFpJustification] = useState('');
  const [furtherReviewModalOpen, setFurtherReviewModalOpen] = useState(false);
  const [furtherReviewNotes, setFurtherReviewNotes] = useState('');
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolveSummary, setResolveSummary] = useState('');

  // Create New Case Modal
  const [createCaseModalOpen, setCreateCaseModalOpen] = useState(false);
  const [newCaseProjectId, setNewCaseProjectId] = useState(projects[0]?.id || '');
  const [newCaseReason, setNewCaseReason] = useState('');
  const [newCaseOfficer, setNewCaseOfficer] = useState('Dr. Vivek Deshmukh (Auditor)');
  const [newCasePriority, setNewCasePriority] = useState<InvestigationPriority>('High');
  const [newCaseDueDate, setNewCaseDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );

  const canCreateCase = currentRole === 'SUPER_ADMIN' || currentRole === 'MONITORING_OFFICER';
  const canMakeDetermination = currentRole === 'SUPER_ADMIN' || currentRole === 'AUDITOR_INVESTIGATOR';
  const canRespondClarification = currentRole === 'SUPER_ADMIN' || currentRole === 'DISTRICT_AUTHORITY';
  const canIssueNotice = currentRole === 'SUPER_ADMIN' || currentRole === 'MONITORING_OFFICER' || currentRole === 'AUDITOR_INVESTIGATOR';

  // Status Pipeline Stages
  const pipelineStages: InvestigationStatus[] = [
    'Assigned',
    'In Progress',
    'Clarification Requested',
    'Clarification Received',
    'Human Review',
    'Verified',
  ];

  const getStageIndex = (status: InvestigationStatus) => {
    switch (status) {
      case 'Assigned':
        return 0;
      case 'In Progress':
        return 1;
      case 'Clarification Requested':
        return 2;
      case 'Clarification Received':
        return 3;
      case 'Human Review':
        return 4;
      case 'Verified':
      case 'Resolved':
      case 'False Positive':
      case 'Further Review Required':
        return 5;
      default:
        return 0;
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    addCaseNote(activeCase.id, noteInput.trim());
    setNoteInput('');
  };

  const handleSendClarification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clarifQuestion.trim()) return;
    const fullQuery = clarifDueDate
      ? `${clarifQuestion.trim()} [Statutory Compliance Due Date: ${clarifDueDate}]`
      : clarifQuestion.trim();
    requestClarification(activeCase.id, fullQuery);
    setClarifQuestion('');
  };

  const handleOpenReplyModal = (clarifId: string) => {
    setActiveClarifId(clarifId);
    setReplyText('Official explanation: Revised geological excavation schedule vetted by Chief Engineer, PWD. Milestone bills re-inspected.');
    setReplyDocName('CE_Approval_Geological_Strata_Nov2025.pdf');
    const linkedProj = projects.find((p) => p.id === activeCase.projectId);
    setReplyPhysical(linkedProj ? linkedProj.physicalProgress + 5 : 45);
    setReplyExpenditure(linkedProj ? linkedProj.expenditure : 140);
    setReplyModalOpen(true);
  };

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const progressUpdate =
      typeof replyPhysical === 'number' && typeof replyExpenditure === 'number'
        ? { physical: replyPhysical, expenditure: replyExpenditure }
        : undefined;

    respondToClarification(
      activeCase.id,
      activeClarifId,
      replyText.trim(),
      replyDocName.trim() || undefined,
      progressUpdate
    );
    setReplyModalOpen(false);
    setActiveClarifId('');
  };

  const handleAddEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceName.trim()) return;
    uploadEvidence(activeCase.id, evidenceName.trim(), evidenceType);
    setEvidenceName('');
  };

  const handleReassignOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNewOfficer) return;
    assignCase(activeCase.id, selectedNewOfficer);
    setReassignModalOpen(false);
  };

  const handleCreateNewCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseReason.trim()) {
      showToast('Validation Failed', 'Please specify the audit inquiry reason / mandate', 'warning');
      return;
    }
    const targetProject = projects.find((p) => p.id === newCaseProjectId);
    if (!targetProject) return;

    createInvestigationCase({
      projectId: targetProject.id,
      projectName: targetProject.name,
      district: targetProject.district,
      riskScore: targetProject.riskScore,
      riskLevel: targetProject.riskLevel,
      reason: newCaseReason.trim(),
      assignedTo: newCaseOfficer,
      priority: newCasePriority,
      dueDate: newCaseDueDate,
      status: 'Assigned',
    });

    setCreateCaseModalOpen(false);
    setNewCaseReason('');
  };

  if (!activeCase) {
    return (
      <div className="bg-white p-8 rounded border border-gray-200 text-center">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-gray-800">No Investigation Cases Available</h3>
        <p className="text-xs text-gray-500 mt-1">Initiate a new audit case or triage alerts from the Risk & Alerts page.</p>
      </div>
    );
  }

  const currentStageIdx = getStageIndex(activeCase.status);

  return (
    <div className="space-y-3.5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#002D62] tracking-tight flex items-center gap-2">
              <SearchCheck className="w-5 h-5 text-[#002D62]" />
              <span>Statutory Investigation & Human Verification Workflow</span>
            </h2>
            <span className="px-2 py-0.5 text-[10px] bg-blue-50 text-[#002D62] border border-blue-200 rounded font-mono font-semibold">
              Formal Case Docket
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Audit case docket for statutory clarifications, site inspections, evidence gathering, and formal determination
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canCreateCase && (
            <button
              onClick={() => setCreateCaseModalOpen(true)}
              className="px-3 py-1.5 rounded bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Initiate Case Docket</span>
            </button>
          )}
          <GovDisclaimer compact />
        </div>
      </div>

      {/* Case Selector + Quick Case Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded border border-gray-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">Active Audit Case:</span>
          <select
            value={activeCase.id}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-50 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#002D62]"
          >
            {investigations.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} — {c.projectName} [{c.status}]
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateToProject(activeCase.projectId)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 shadow-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
            <span>Open Project Dossier ({activeCase.projectId})</span>
          </button>
        </div>
      </div>

      {/* Status Pipeline Visual Indicator */}
      <div className="bg-white p-3 sm:p-4 rounded border border-gray-200 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Investigation Status Pipeline
          </span>
          <span className="text-xs font-mono font-bold text-[#002D62]">
            Current Stage: <span className="text-blue-700">{activeCase.status}</span>
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {pipelineStages.map((stage, idx) => {
            const isCompleted = idx < currentStageIdx || activeCase.status === 'Resolved' || activeCase.status === 'Verified';
            const isCurrent = idx === currentStageIdx;
            return (
              <div
                key={stage}
                className={`p-2 rounded border text-center transition-all ${
                  isCurrent
                    ? 'bg-blue-50 border-[#002D62] text-[#002D62] font-bold shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-800 font-medium'
                    : 'bg-slate-50 border-gray-200 text-gray-400'
                }`}
              >
                <div className="text-[10px] uppercase font-mono tracking-tight">Step 0{idx + 1}</div>
                <div className="text-xs truncate mt-0.5">{stage}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Case Workspace */}
      <div className="bg-white rounded border border-gray-200 p-4 sm:p-5 space-y-4 shadow-xs">
        {/* Case Header Details */}
        <div className="border-b border-gray-100 pb-4 flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold bg-[#002D62] text-white px-2 py-0.5 rounded">
                {activeCase.id}
              </span>
              <StatusBadge status={activeCase.status} />
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono ${
                  activeCase.priority === 'Critical'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {activeCase.priority} Priority
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Opened: {activeCase.createdAt}
              </span>
              {activeCase.dueDate && (
                <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono font-medium">
                  Compliance Due: {activeCase.dueDate}
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-[#002D62]">
              {activeCase.projectName}
            </h3>

            <p className="text-xs text-gray-600 max-w-3xl leading-relaxed">
              Target Project: <strong className="font-mono">{activeCase.projectId}</strong> — {activeCase.district} District
            </p>

            {activeCase.reason && (
              <div className="text-xs bg-slate-50 p-2 rounded border border-gray-200 text-slate-700 max-w-3xl">
                <strong className="text-slate-900 font-semibold">Audit Mandate / Reason:</strong> {activeCase.reason}
              </div>
            )}
          </div>

          {/* Determination / Resolution Action Bar */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2.5 rounded border border-gray-200">
            {/* Reassign Officer Button */}
            {(currentRole === 'SUPER_ADMIN' || currentRole === 'MONITORING_OFFICER') && (
              <button
                onClick={() => {
                  setSelectedNewOfficer(activeCase.assignedTo);
                  setReassignModalOpen(true);
                }}
                className="px-2.5 py-1.5 rounded bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-gray-300 flex items-center gap-1 shadow-2xs transition-colors"
                title="Reassign case officer"
              >
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Reassign</span>
              </button>
            )}

            {/* 3 Statutory Final Determination Options for Auditor / Admin */}
            {canMakeDetermination && activeCase.status !== 'Resolved' && (
              <>
                <button
                  onClick={() => setVerifyModalOpen(true)}
                  className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                  title="Verify anomaly and recommend administrative recovery"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>1. Verify Anomaly</span>
                </button>

                <button
                  onClick={() => setFalsePositiveModalOpen(true)}
                  className="px-3 py-1.5 rounded bg-white hover:bg-slate-100 text-gray-800 text-xs font-semibold flex items-center gap-1 transition-colors border border-gray-300 shadow-2xs"
                  title="Dismiss flag as false positive after review"
                >
                  <XCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>2. False Positive</span>
                </button>

                <button
                  onClick={() => setFurtherReviewModalOpen(true)}
                  className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                  title="Escalate to Higher Review Committee"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>3. Further Review</span>
                </button>
              </>
            )}

            {/* Mark Resolved */}
            {(currentRole === 'SUPER_ADMIN' || currentRole === 'MONITORING_OFFICER') && activeCase.status !== 'Resolved' && (
              <button
                onClick={() => setResolveModalOpen(true)}
                className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Resolved</span>
              </button>
            )}
          </div>
        </div>

        {/* Assigned Officer & Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded border border-gray-200">
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-semibold block">Assigned Officer</span>
            <span className="font-bold text-[#002D62]">{activeCase.assignedTo}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-semibold block">Statutory Case Status</span>
            <span className="font-semibold text-gray-800">{activeCase.status}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-semibold block">Evidence Items</span>
            <span className="font-mono font-bold text-gray-900">{activeCase.evidences.length} Attached</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-semibold block">Clarifications</span>
            <span className="font-mono font-bold text-gray-900">{activeCase.clarifications.length} Notices Issued</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-2 transition-colors border-b-2 ${
              activeTab === 'timeline'
                ? 'border-[#002D62] text-[#002D62]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Audit Timeline & History ({activeCase.timeline.length})
          </button>
          <button
            onClick={() => setActiveTab('clarifications')}
            className={`pb-2 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'clarifications'
                ? 'border-[#002D62] text-[#002D62]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>Statutory Clarification Notices</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-gray-800">
              {activeCase.clarifications.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`pb-2 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'evidence'
                ? 'border-[#002D62] text-[#002D62]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>Evidence Docket</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-gray-800">
              {activeCase.evidences.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-2 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-[#002D62] text-[#002D62]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>Auditor Notes</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-gray-800">
              {activeCase.notes.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Timeline */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <div className="relative border-l-2 border-gray-200 ml-4 pl-5 space-y-4 py-2">
              {activeCase.timeline.map((item, idx) => (
                <div key={idx} className="relative text-xs space-y-1">
                  <div className="absolute -left-7 top-1 w-3.5 h-3.5 rounded-full bg-[#002D62] border-2 border-white shadow-xs"></div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{item.title}</span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {item.date}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-normal">{item.description}</p>
                  <span className="text-[10px] font-semibold text-gray-500 block">
                    Logged by: {item.actor}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Clarification Notices */}
        {activeTab === 'clarifications' && (
          <div className="space-y-4">
            {/* Notices List */}
            <div className="space-y-3">
              {activeCase.clarifications.length === 0 ? (
                <p className="text-xs text-gray-500 py-4">
                  No clarification notices issued yet for this case.
                </p>
              ) : (
                activeCase.clarifications.map((notice) => (
                  <div
                    key={notice.id}
                    className="p-3.5 rounded border border-gray-200 bg-slate-50/50 space-y-2.5 text-xs shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#002D62]">{notice.id}</span>
                        <span
                          className={`text-[10px] px-2 py-0.2 rounded font-semibold ${
                            notice.status === 'Responded'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {notice.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400 font-mono">
                        Issued: {notice.queryDate}
                      </span>
                    </div>

                    <div className="text-gray-700 bg-white p-2.5 rounded border border-gray-200">
                      <strong>Statutory Inquiry ({notice.queriedBy}):</strong> {notice.query}
                    </div>

                    {notice.response ? (
                      <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1.5">
                        <div className="flex items-center justify-between font-semibold text-[11px]">
                          <span>Formal Written Rejoinder ({notice.respondedBy}):</span>
                          <span className="font-mono text-gray-500">{notice.responseDate}</span>
                        </div>
                        <p className="text-xs leading-relaxed">{notice.response}</p>
                        {notice.supportingDocumentName && (
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-800 pt-1">
                            <Paperclip className="w-3 h-3 text-emerald-600" />
                            <span>Supporting Document Attached: {notice.supportingDocumentName}</span>
                          </div>
                        )}
                        {notice.updatedProgress && (
                          <div className="text-[11px] font-semibold text-emerald-900 bg-white/60 p-1.5 rounded border border-emerald-200 flex items-center gap-3">
                            <span>Ground Physical Progress Updated: {notice.updatedProgress.physical}%</span>
                            <span>Recorded Expenditure: ₹{notice.updatedProgress.expenditure} Lakhs</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-gray-100">
                        <span className="text-[11px] text-amber-800 font-medium">
                          Awaiting official technical explanation from implementing authority
                        </span>
                        {canRespondClarification && (
                          <button
                            onClick={() => handleOpenReplyModal(notice.id)}
                            className="px-3 py-1 rounded bg-[#002D62] hover:bg-[#001f44] text-white text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                          >
                            <Send className="w-3 h-3" />
                            <span>Submit District Rejoinder</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Issue New Clarification Notice Form (Auditor / Monitoring Officer) */}
            {canIssueNotice && (
              <form onSubmit={handleSendClarification} className="p-3.5 sm:p-4 rounded border border-gray-200 bg-white space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#002D62] flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-[#002D62]" />
                    <span>Issue Formal Clarification Notice</span>
                  </h4>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500">Compliance Due Date:</span>
                    <input
                      type="date"
                      value={clarifDueDate}
                      onChange={(e) => setClarifDueDate(e.target.value)}
                      className="px-2 py-1 text-xs bg-slate-50 border border-gray-200 rounded font-mono"
                    />
                  </div>
                </div>

                <div>
                  <textarea
                    rows={3}
                    placeholder="Detailed statutory inquiry questions, Measurement Book references, or voucher queries..."
                    value={clarifQuestion}
                    onChange={(e) => setClarifQuestion(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded focus:bg-white focus:ring-1 focus:ring-[#002D62]"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    Issue Formal Notice
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab 3: Evidence Docket */}
        {activeTab === 'evidence' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeCase.evidences.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3.5 rounded border border-gray-200 bg-slate-50 text-xs space-y-1.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#002D62]">{ev.id}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-gray-700 rounded font-semibold">
                      {ev.fileType}
                    </span>
                  </div>
                  <h5 className="font-bold text-gray-900">{ev.title}</h5>
                  <div className="text-[11px] text-gray-500 font-mono">
                    Uploaded by: {ev.uploadedBy} • {ev.uploadedDate} ({ev.size})
                  </div>
                  {ev.notes && <p className="text-gray-600 text-[11px] italic">{ev.notes}</p>}
                </div>
              ))}
            </div>

            {/* Upload Evidence Docket Form */}
            <form onSubmit={handleAddEvidence} className="p-3.5 sm:p-4 rounded border border-gray-200 bg-white space-y-3 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#002D62] flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-[#002D62]" />
                <span>Attach Audit Evidence / Inspection Record</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Evidence title (e.g. Geotagged site drone inspection photos)"
                  value={evidenceName}
                  onChange={(e) => setEvidenceName(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded focus:bg-white focus:ring-1 focus:ring-[#002D62]"
                />

                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded focus:bg-white focus:ring-1 focus:ring-[#002D62]"
                >
                  <option value="Measurement Book Extract">Measurement Book Extract</option>
                  <option value="Drone Geotagged Photos">Drone Geotagged Photos</option>
                  <option value="Treasury RTGS Voucher">Treasury RTGS Voucher</option>
                  <option value="Contractor Bank Statement">Contractor Bank Statement</option>
                  <option value="Technical Sanction Order">Technical Sanction Order</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold transition-colors shadow-xs"
                >
                  Attach to Case Docket
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 4: Auditor Notes */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="space-y-2.5">
              {activeCase.notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 rounded border border-gray-200 bg-slate-50 text-xs space-y-1 shadow-xs"
                >
                  <div className="flex items-center justify-between font-semibold text-gray-800">
                    <span className="text-[#002D62]">{note.author} ({note.role})</span>
                    <span className="text-[11px] text-gray-400 font-mono">{note.date}</span>
                  </div>
                  <p className="text-gray-700 leading-normal">{note.note}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-gray-100">
              <textarea
                rows={2}
                placeholder="Add internal auditor observations, field inspection log, or directives..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded focus:bg-white focus:ring-1 focus:ring-[#002D62]"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Add Audit Note
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* MODAL 1: Reassign Officer */}
      {reassignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-[#002D62] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#002D62]" />
                <span>Reassign Case Officer</span>
              </h3>
              <button onClick={() => setReassignModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
            </div>
            <form onSubmit={handleReassignOfficer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Lead Investigating Officer:</label>
                <select
                  value={selectedNewOfficer}
                  onChange={(e) => setSelectedNewOfficer(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-gray-200 rounded font-medium focus:bg-white"
                >
                  <option value="Dr. Vivek Deshmukh (Auditor)">Dr. Vivek Deshmukh (Auditor / CAG Cadre)</option>
                  <option value="Shri Rajesh Deshmukh, IAS (Monitoring Officer)">Shri Rajesh Deshmukh, IAS (State Monitoring Cell)</option>
                  <option value="Er. Sandeep Patil (District Cell)">Er. Sandeep Patil (Executive Engineer, PWD)</option>
                  <option value="Shri Amit Thorat (Field Inspection Cell)">Shri Amit Thorat (Field Inspection Cell)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setReassignModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-bold text-white bg-[#002D62] hover:bg-[#001f44] rounded shadow-xs"
                >
                  Confirm Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: District Authority Clarification Rejoinder */}
      {replyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-[#002D62] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#002D62]" />
                <span>Submit District Authority Rejoinder</span>
              </h3>
              <button onClick={() => setReplyModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
            </div>
            <form onSubmit={handleSubmitReply} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Written Technical Explanation / Justification:</label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Supporting Document / Order Reference:</label>
                <input
                  type="text"
                  value={replyDocName}
                  onChange={(e) => setReplyDocName(e.target.value)}
                  placeholder="e.g. CE_Approval_Geological_Strata_Nov2025.pdf"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-gray-200 rounded font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Updated Physical Progress (%):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={replyPhysical}
                    onChange={(e) => setReplyPhysical(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-gray-200 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Updated Expenditure (₹ Lakhs):</label>
                  <input
                    type="number"
                    min="0"
                    value={replyExpenditure}
                    onChange={(e) => setReplyExpenditure(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-gray-200 rounded font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setReplyModalOpen(false)}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 font-bold text-white bg-[#002D62] hover:bg-[#001f44] rounded shadow-xs"
                >
                  Submit Official Rejoinder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Determination 1 — Verify Anomaly */}
      {verifyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-red-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-red-700 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Confirm Anomaly as Statutory Audit Finding</span>
              </h3>
              <button onClick={() => setVerifyModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
            </div>
            <div className="text-xs text-gray-600 space-y-2">
              <p>
                Human verification will confirm this risk pattern as an official audit discrepancy. This action triggers formal administrative recovery or vigilance referral.
              </p>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Audit Determination Remarks (Required):</label>
                <textarea
                  rows={3}
                  value={verifyRemarks}
                  onChange={(e) => setVerifyRemarks(e.target.value)}
                  placeholder="Record ground inspection findings, MB measurement deviations, and recovery directives..."
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded focus:bg-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setVerifyModalOpen(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded border border-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setCaseDetermination(
                    activeCase.id,
                    'Verified',
                    verifyRemarks.trim() || 'Ground audit verified: Discrepancy between reported progress and field metrics confirmed.'
                  );
                  setVerifyModalOpen(false);
                }}
                className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded shadow-xs"
              >
                Confirm Verified Finding
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Determination 2 — False Positive */}
      {falsePositiveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-slate-500" />
                <span>Classify Case as False Positive</span>
              </h3>
              <button onClick={() => setFalsePositiveModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
            </div>
            <div className="text-xs text-gray-600 space-y-2">
              <p>
                Classifying as False Positive requires a mandatory written justification explaining why the statistical anomaly is legitimate (e.g. Revised Sanction, technical delay).
              </p>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Mandatory Justification:</label>
                <textarea
                  rows={3}
                  value={fpJustification}
                  onChange={(e) => setFpJustification(e.target.value)}
                  placeholder="State the administrative approval or valid field condition that explains the deviation..."
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded focus:bg-white"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setFalsePositiveModalOpen(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded border border-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!fpJustification.trim()}
                onClick={() => {
                  setCaseDetermination(activeCase.id, 'False Positive', fpJustification.trim());
                  setFalsePositiveModalOpen(false);
                }}
                className="px-3 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 disabled:opacity-50 rounded shadow-xs"
              >
                Confirm False Positive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Determination 3 — Further Review Required */}
      {furtherReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-amber-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Escalate for Further Technical Review</span>
              </h3>
              <button onClick={() => setFurtherReviewModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
            </div>
            <div className="text-xs text-gray-600 space-y-2">
              <p>
                Escalate this case to the State Technical Sanction Committee for specialized soil testing, drone photogrammetry, or multi-agency verification.
              </p>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Escalation Justification & Mandate:</label>
                <textarea
                  rows={3}
                  value={furtherReviewNotes}
                  onChange={(e) => setFurtherReviewNotes(e.target.value)}
                  placeholder="Detail why preliminary audit evidence is inconclusive and which external expertise is requested..."
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded focus:bg-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setFurtherReviewModalOpen(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded border border-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setCaseDetermination(
                    activeCase.id,
                    'Further Review Required',
                    furtherReviewNotes.trim() || 'Escalated to State Technical Audit Review Committee for structural engineering evaluation.'
                  );
                  setFurtherReviewModalOpen(false);
                }}
                className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded shadow-xs"
              >
                Escalate Case
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Resolve Case */}
      {resolveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-emerald-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Mark Investigation Case as Resolved</span>
              </h3>
              <button onClick={() => setResolveModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
            </div>
            <div className="text-xs text-gray-600 space-y-2">
              <p>
                Finalize remediation, confirm recovery orders or milestone rectification, and close the statutory investigation docket.
              </p>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Resolution Summary Note:</label>
                <textarea
                  rows={3}
                  value={resolveSummary}
                  onChange={(e) => setResolveSummary(e.target.value)}
                  placeholder="Record remediation actions, recovery chalans, or approved milestone revisions..."
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded focus:bg-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setResolveModalOpen(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded border border-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resolveCase(
                    activeCase.id,
                    resolveSummary.trim() || 'Remedial actions completed: Recoveries initiated and revised milestone schedule approved.'
                  );
                  setResolveModalOpen(false);
                }}
                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-xs"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: Initiate New Case Docket */}
      {createCaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-[#002D62] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#002D62]" />
                <span>Initiate New Investigation Docket</span>
              </h3>
              <button onClick={() => setCreateCaseModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
            </div>
            <form onSubmit={handleCreateNewCase} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Target MPLADS Project:</label>
                <select
                  value={newCaseProjectId}
                  onChange={(e) => setNewCaseProjectId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-gray-200 rounded focus:bg-white font-medium"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} — {p.name} ({p.district} • Risk: {p.riskScore}/100)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Audit Mandate / Inquiry Reason:</label>
                <textarea
                  rows={2}
                  value={newCaseReason}
                  onChange={(e) => setNewCaseReason(e.target.value)}
                  placeholder="Specify anomaly indicators (e.g. 0% ground progress vs 82% payment, ghost vendor alerts, duplicate GIS footprint)..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-gray-200 rounded focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Assigned Auditor:</label>
                  <select
                    value={newCaseOfficer}
                    onChange={(e) => setNewCaseOfficer(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-gray-200 rounded"
                  >
                    <option value="Dr. Vivek Deshmukh (Auditor)">Dr. Vivek Deshmukh (Auditor)</option>
                    <option value="Shri Rajesh Deshmukh, IAS (Monitoring Officer)">Shri Rajesh Deshmukh, IAS</option>
                    <option value="Er. Sandeep Patil (District Cell)">Er. Sandeep Patil (District Cell)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Priority Level:</label>
                  <select
                    value={newCasePriority}
                    onChange={(e) => setNewCasePriority(e.target.value as InvestigationPriority)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-gray-200 rounded"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Target Compliance Due Date:</label>
                <input
                  type="date"
                  value={newCaseDueDate}
                  onChange={(e) => setNewCaseDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-gray-200 rounded font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setCreateCaseModalOpen(false)}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 font-bold text-white bg-[#002D62] hover:bg-[#001f44] rounded shadow-xs"
                >
                  Create & Assign Docket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
