import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { GovDisclaimer } from '../common/GovDisclaimer';
import { RiskBadge } from '../common/RiskBadge';
import { ACTIVE_ML_MODELS } from '../../services/ml/modelRegistry';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sliders,
  RotateCcw,
  ClipboardList,
  AlertCircle,
  FileText,
  Activity,
} from 'lucide-react';

export const AIAnalysisPage: React.FC = () => {
  const {
    riskWeights,
    updateRiskWeights,
    projects,
    navigateToProject,
    navigateToCase,
    investigations,
    createInvestigationFromAlert,
    getProjectAnalysis,
    showToast,
  } = useApp();

  // Selected project for analysis
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects[0]?.id || 'MPLADS-MH-PUN-2026-00482'
  );

  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Local state for weight calibration in technical panel
  const [costW, setCostW] = useState(riskWeights.costAnomaly || 25);
  const [velW, setVelW] = useState(riskWeights.paymentAnomaly || 20);
  const [delayW, setDelayW] = useState(riskWeights.delayAnomaly || 20);
  const [divW, setDivW] = useState(riskWeights.progressDeviation || 15);
  const [dupW, setDupW] = useState(riskWeights.duplicateSimilarity || 20);

  const selectedProject =
    projects.find((p) => p.id === selectedProjectId) || projects[0];

  const analysis = useMemo(() => {
    if (!selectedProject) return null;
    return getProjectAnalysis(selectedProject.id);
  }, [selectedProject, getProjectAnalysis, riskWeights]);

  const totalWeight = costW + velW + delayW + divW + dupW;

  const handleApplyWeights = () => {
    if (totalWeight !== 100) {
      showToast('Validation Warning', `Total weights must sum to 100%. Currently at ${totalWeight}%.`, 'warning');
      return;
    }
    updateRiskWeights({
      costAnomaly: costW,
      paymentAnomaly: velW,
      delayAnomaly: delayW,
      progressDeviation: divW,
      duplicateSimilarity: dupW,
    });
    showToast('Analysis Calibrated', 'Risk scoring weights updated.', 'success');
  };

  const handleResetWeights = () => {
    setCostW(25);
    setVelW(20);
    setDelayW(20);
    setDivW(15);
    setDupW(20);
    updateRiskWeights({
      costAnomaly: 25,
      paymentAnomaly: 20,
      delayAnomaly: 20,
      progressDeviation: 15,
      duplicateSimilarity: 20,
    });
    showToast('Reset Complete', 'Default risk weights restored.', 'info');
  };

  const existingCase = selectedProject
    ? investigations.find((c) => c.projectId === selectedProject.id)
    : undefined;

  const handleStartInvestigation = () => {
    if (!selectedProject) return;
    if (existingCase) {
      navigateToCase(existingCase.id);
    } else {
      createInvestigationFromAlert('ALT-2026-0091', 'Dr. Vivek Deshmukh (Auditor)');
      showToast('Investigation Started', `Case opened for ${selectedProject.id}.`, 'info');
    }
  };

  if (!selectedProject) return null;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#002D62] tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#002D62]" />
            <span>Risk Analysis & Decision Support</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Clear, transparent explanations for flagged projects to assist administrative decision-making.
          </p>
        </div>

        {/* Project Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Select Project:</span>
          <select
            value={selectedProject.id}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#002D62]"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.district}) — {p.riskLevel}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TOP RISK LEVEL CARD */}
      <div className="bg-white p-5 sm:p-6 rounded-lg border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="text-xs font-mono text-slate-500 font-bold">
              {selectedProject.id} • {selectedProject.district} District
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#002D62] mt-0.5">
              {selectedProject.name}
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">
              Implementing Agency: <strong className="text-slate-700">{selectedProject.implementingAgency}</strong>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-center min-w-[170px] self-start sm:self-auto">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Project Risk
            </div>
            <div className="mt-1">
              <span
                className={`text-lg font-extrabold uppercase px-3 py-1 rounded-full inline-block ${
                  selectedProject.riskLevel === 'CRITICAL'
                    ? 'bg-rose-600 text-white'
                    : selectedProject.riskLevel === 'HIGH'
                    ? 'bg-amber-500 text-white'
                    : selectedProject.riskLevel === 'MEDIUM'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {selectedProject.riskLevel}
              </span>
            </div>
            <div className="text-xs font-mono font-bold text-slate-700 mt-1">
              Score: {selectedProject.riskScore} / 100
            </div>
          </div>
        </div>

        {/* KEY FINDINGS */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            KEY FINDINGS & STATUTORY ANOMALIES
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-800">
            {selectedProject.aiFindings && selectedProject.aiFindings.map((finding, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 bg-blue-50/70 border border-blue-100 rounded-md">
                <AlertCircle className="w-4 h-4 text-[#002D62] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#002D62] block font-semibold">Surveillance Finding #{idx + 1}:</strong>
                  <span>{finding}</span>
                </div>
              </div>
            ))}
            {selectedProject.expenditure > selectedProject.sanctionedAmount && (
              <div className="flex items-start gap-2 p-3 bg-rose-50/70 border border-rose-100 rounded-md">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-rose-900 block font-semibold">Cost Anomaly:</strong>
                  Expenditure (₹{selectedProject.expenditure}L) exceeds sanctioned limit (₹{selectedProject.sanctionedAmount}L) by ₹{(selectedProject.expenditure - selectedProject.sanctionedAmount).toFixed(1)} Lakh.
                </div>
              </div>
            )}

            {selectedProject.financialUtilization - selectedProject.physicalProgress > 15 && (
              <div className="flex items-start gap-2 p-3 bg-rose-50/70 border border-rose-100 rounded-md">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-rose-900 block font-semibold">Progress Mismatch:</strong>
                  Financial utilization ({selectedProject.financialUtilization}%) is materially ahead of verified ground execution ({selectedProject.physicalProgress}%).
                </div>
              </div>
            )}

            {selectedProject.delayDays > 30 && (
              <div className="flex items-start gap-2 p-3 bg-amber-50/70 border border-amber-100 rounded-md">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-900 block font-semibold">Significant Timeline Delay:</strong>
                  The project is {selectedProject.delayDays} days behind schedule against the approved target date.
                </div>
              </div>
            )}

            {selectedProject.duplicateSimilarity && selectedProject.duplicateSimilarity > 70 && (
              <div className="flex items-start gap-2 p-3 bg-purple-50/70 border border-purple-100 rounded-md">
                <AlertCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-purple-900 block font-semibold">Highly Similar Work Identified:</strong>
                  A potentially duplicate or overlapping scope work ({selectedProject.duplicateSimilarity}% match) was detected nearby.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* WHY THE SYSTEM FLAGGED THIS PROJECT */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs text-slate-700">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider">
            WHY THE SYSTEM FLAGGED THIS PROJECT
          </h4>
          <p className="leading-relaxed">
            The surveillance system continuously evaluates ground progress against billing velocity and historical completion benchmarks. For this project, multiple risk thresholds were crossed simultaneously: high expenditure drawdown without corresponding physical certification, budget overrun beyond approved contingency margins, and delayed milestone delivery.
          </p>
        </div>

        {/* OFFICER DECISION SUPPORT */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              OFFICER DECISION SUPPORT
            </span>
            <span className="text-xs text-slate-500">
              Select an action based on your administrative review of this assessment.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleStartInvestigation}
              className="px-4 py-2 bg-[#002D62] hover:bg-blue-900 text-white text-xs font-bold rounded shadow-xs transition-colors flex items-center gap-1.5"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>{existingCase ? 'View Investigation' : 'Start Investigation'}</span>
            </button>
            <button
              onClick={() => showToast('Watchlist Updated', 'Project marked for close monitoring.', 'info')}
              className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold rounded transition-colors"
            >
              Mark for Monitoring
            </button>
            <button
              onClick={() => showToast('Dismissed', 'Risk flag dismissed with officer concurrence.', 'warning')}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded transition-colors"
            >
              Dismiss / False Positive
            </button>
          </div>
        </div>
      </div>

      {/* ADVANCED TECHNICAL DETAILS (COLLAPSIBLE) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full p-4 flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors uppercase tracking-wider"
        >
          <span>Advanced Technical Details & Model Analytics</span>
          <div className="flex items-center gap-1 text-slate-500 font-normal normal-case text-xs">
            <span>{showTechnicalDetails ? 'Hide Details' : 'Show Details'}</span>
            {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showTechnicalDetails && (
          <div className="p-5 border-t border-slate-100 space-y-5 text-xs">
            {/* Live Model Indicators */}
            {analysis && (
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Active Analysis Models
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-sans block">Anomaly Detection</span>
                    <span className="font-bold text-slate-800 text-sm">Isolation Forest</span>
                    <span className="block text-[11px] text-slate-600 mt-1">
                      Score: {analysis.isolationForest.anomalyScore} / 100
                    </span>
                    <span className="text-[10px] text-slate-400">Path Depth: {analysis.isolationForest.pathLength}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-sans block">Risk Classifier</span>
                    <span className="font-bold text-slate-800 text-sm">XGBoost Risk</span>
                    <span className="block text-[11px] text-rose-700 font-bold mt-1">
                      {((analysis.xgboostRisk?.riskProbability ?? 0) * 100).toFixed(1)}% Prob.
                    </span>
                    <span className="text-[10px] text-slate-400">Raw Margin: {analysis.xgboostRisk?.rawMargin ?? 0}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-sans block">Timeline Forecast</span>
                    <span className="font-bold text-slate-800 text-sm">Delay Forecaster</span>
                    <span className="block text-[11px] text-amber-700 font-bold mt-1">
                      +{analysis.delayPrediction.predictedDelayDays} Days
                    </span>
                    <span className="text-[10px] text-slate-400">Confidence: {analysis.delayPrediction.confidenceScore}%</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-sans block">Semantic Match</span>
                    <span className="font-bold text-slate-800 text-sm">Sentence-BERT</span>
                    <span className="block text-[11px] text-indigo-700 font-bold mt-1">
                      {analysis.duplicateDetection.score}% Overlap
                    </span>
                    <span className="text-[10px] text-slate-400 truncate block">
                      Ref: {analysis.duplicateDetection.matchedProjectId || 'None'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TreeSHAP Feature Attributions */}
            {analysis?.shapExplanation && (
              <div className="pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2">
                  TreeSHAP Feature Contributions
                </h4>
                <div className="space-y-1.5 max-w-xl">
                  {analysis.shapExplanation.values.map((v) => (
                    <div key={v.feature} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-slate-700">{v.displayName}</span>
                      <span className={`font-mono font-bold ${v.shapValue > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {v.sign}{v.shapValue} pts ({v.value})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Calibration Weight Adjustment Sliders */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider">
                  Risk Weight Calibration
                </h4>
                <span className={`font-mono font-bold text-xs ${totalWeight === 100 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  Sum: {totalWeight}% (Must be 100%)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Cost Overrun Weight</span>
                    <span className="font-mono font-bold">{costW}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={costW}
                    onChange={(e) => setCostW(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Payment Velocity Weight</span>
                    <span className="font-mono font-bold">{velW}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={velW}
                    onChange={(e) => setVelW(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Timeline Delay Weight</span>
                    <span className="font-mono font-bold">{delayW}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={delayW}
                    onChange={(e) => setDelayW(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress Divergence Weight</span>
                    <span className="font-mono font-bold">{divW}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={divW}
                    onChange={(e) => setDivW(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Duplicate Similarity Weight</span>
                    <span className="font-mono font-bold">{dupW}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={dupW}
                    onChange={(e) => setDupW(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleApplyWeights}
                  disabled={totalWeight !== 100}
                  className="px-3.5 py-1.5 bg-[#002D62] text-white text-xs font-bold rounded disabled:opacity-40"
                >
                  Apply Calibration
                </button>
                <button
                  onClick={handleResetWeights}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded hover:bg-slate-50"
                >
                  Reset Defaults
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
