import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DuplicatePair } from '../../types';
import { GovDisclaimer } from '../common/GovDisclaimer';
import { sentenceTransformer } from '../../services/ml/sentenceTransformer';
import {
  Copy,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  IndianRupee,
  Layers,
  ArrowRight,
  ShieldAlert,
  Search,
  Sparkles,
  GitCompare,
} from 'lucide-react';

export const DuplicateDetectionPage: React.FC = () => {
  const {
    duplicatePairs,
    updateDuplicatePairStatus,
    navigateToProject,
    currentRole,
    showToast,
    projects,
  } = useApp();

  const [selectedPairId, setSelectedPairId] = useState<string>(duplicatePairs[0]?.id || '');
  const activePair = duplicatePairs.find((d) => d.id === selectedPairId) || duplicatePairs[0];

  // State for arbitrary project pair comparison
  const [testProjectAId, setTestProjectAId] = useState<string>('');
  const [testProjectBId, setTestProjectBId] = useState<string>('');

  const projA = projects.find((p) => p.id === testProjectAId) || projects[0];
  const projB = projects.find((p) => p.id === testProjectBId) || projects[1] || projects[0];

  const liveComparison = useMemo(() => {
    if (!projA || !projB) return null;
    return sentenceTransformer.compareProjects(projA, projB);
  }, [projA, projB]);

  const handleVerify = (id: string, isDuplicate: boolean) => {
    updateDuplicatePairStatus(id, isDuplicate ? 'Verified Duplicate' : 'Verified Independent Scope');
    showToast(
      'Audit Determination Recorded',
      isDuplicate
        ? 'Classified as Potential Duplicate Pattern Verified by Auditor. Recovery inquiry initiated.'
        : 'Classified as Legitimate Independent Scope after administrative verification.',
      isDuplicate ? 'error' : 'info'
    );
  };

  return (
    <div className="space-y-3.5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#002D62] tracking-tight flex items-center gap-2">
              <Copy className="w-5 h-5 text-[#002D62]" />
              <span>Cross-Scheme Duplicate Project Detection Engine</span>
            </h2>
            <span className="px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-mono font-semibold">
              Sentence-BERT & Geospatial Matcher
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Detecting overlapping public works, double billing across PMGSY / JJM / ZP, and identical work orders via 32-dim subword semantic embeddings.
          </p>
        </div>

        <GovDisclaimer compact />
      </div>

      {/* Main Side-by-Side Comparison Workspace */}
      {activePair && (
        <div className="bg-white rounded border border-gray-200 p-3.5 sm:p-4 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#002D62]">
                  {activePair.id}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono ${
                    activePair.overallSimilarity >= 80
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {activePair.overallSimilarity}% Overall Similarity
                </span>
                <span className="text-xs text-gray-500 font-semibold">• {activePair.district}</span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                {activePair.explanation}
              </p>
            </div>

            {/* Adjudication Buttons */}
            <div className="flex items-center gap-2">
              {activePair.status === 'Pending Review' ? (
                <>
                  <button
                    onClick={() => handleVerify(activePair.id, false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-gray-500" />
                    <span>Independent Scope</span>
                  </button>
                  <button
                    onClick={() => handleVerify(activePair.id, true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Verify Duplicate</span>
                  </button>
                </>
              ) : (
                <span
                  className={`px-3 py-1 rounded text-xs font-bold ${
                    activePair.status === 'Verified Duplicate'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  Status: {activePair.status}
                </span>
              )}
            </div>
          </div>

          {/* Similarity Scores Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded border border-gray-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-gray-500 block">Description Similarity</span>
              <span className="text-sm font-bold font-mono text-gray-900">{activePair.descriptionSimilarity}%</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-gray-500 block">BoQ Cost Similarity</span>
              <span className="text-sm font-bold font-mono text-gray-900">{activePair.costSimilarity}%</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-gray-500 block">Geospatial Proximity</span>
              <span className="text-sm font-bold font-mono text-gray-900">{activePair.locationSimilarity}% Match</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-gray-500 block">Category Overlap</span>
              <span className="text-sm font-bold font-mono text-gray-900">{activePair.categorySimilarity}% Match</span>
            </div>
          </div>

          {/* Side by Side Comparative Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Project A (MPLADS) */}
            <div className="p-3.5 rounded border border-blue-200 bg-blue-50/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#002D62] px-2 py-0.5 bg-blue-100 rounded font-mono">
                  Scheme Work A: MPLADS
                </span>
                <button
                  onClick={() => navigateToProject(activePair.projectAId)}
                  className="text-xs font-bold text-[#002D62] hover:underline flex items-center gap-1"
                >
                  <span>Inspect Dossier</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                {activePair.projectAName}
              </h4>

              <div className="space-y-1 text-xs text-gray-700 font-mono">
                <div><span className="text-gray-500">Project ID:</span> {activePair.projectAId}</div>
                <div><span className="text-gray-500">District:</span> {activePair.district}</div>
              </div>
            </div>

            {/* Project B (Parallel Scheme) */}
            <div className="p-3.5 rounded border border-red-200 bg-red-50/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 px-2 py-0.5 bg-red-100 rounded font-mono">
                  Scheme Work B: Parallel Scheme
                </span>
                <span className="text-xs text-gray-500 font-mono">Parallel Work</span>
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                {activePair.projectBName}
              </h4>

              <div className="space-y-1 text-xs text-gray-700 font-mono">
                <div><span className="text-gray-500">Scheme Work ID:</span> {activePair.projectBId}</div>
                <div><span className="text-gray-500">District:</span> {activePair.district}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live On-Demand Pairwise Semantic Matching Lab */}
      <div className="bg-white rounded border border-gray-200 p-3.5 sm:p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-[#002D62]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#002D62]">
              Live On-Demand Semantic Cross-Matcher (Sentence-BERT 32-Dim)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-gray-500">
            Vector Cosine Model
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-[11px] text-gray-500 font-semibold block mb-1">
              Select Primary Work Order (A):
            </label>
            <select
              value={testProjectAId || projA?.id || ''}
              onChange={(e) => setTestProjectAId(e.target.value)}
              className="w-full text-xs p-2 border border-gray-300 rounded font-mono bg-slate-50"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} - {p.name.slice(0, 40)}...
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-gray-500 font-semibold block mb-1">
              Select Comparison Work Order (B):
            </label>
            <select
              value={testProjectBId || projB?.id || ''}
              onChange={(e) => setTestProjectBId(e.target.value)}
              className="w-full text-xs p-2 border border-gray-300 rounded font-mono bg-slate-50"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} - {p.name.slice(0, 40)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {liveComparison && (
          <div className="p-3 bg-slate-50 rounded border border-gray-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800">
                Inference Result: {liveComparison.explanation}
              </span>
              <span
                className={`px-2 py-0.5 rounded font-mono font-bold ${
                  liveComparison.score >= 70
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : liveComparison.score >= 40
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                Composite Match: {liveComparison.score}%
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-gray-600">
              <div>
                Semantic Cosine Sim:{' '}
                {(((liveComparison.textCosineSimilarity ?? liveComparison.semanticSimilarity ?? 0)) * 100).toFixed(1)}%
              </div>
              <div>
                Geo Distance:{' '}
                {(liveComparison.geographicProximityKm ?? liveComparison.geoDistanceKm ?? 0).toFixed(1)} km
              </div>
              <div>
                Cost Disparity:{' '}
                {(liveComparison.costRatio ?? 1).toFixed(2)}x
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Registry of All Flagged Duplicate Pairs */}
      <div className="bg-white rounded border border-gray-200 p-3.5 sm:p-4 space-y-3 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#002D62]">
          Identified Cross-Scheme Overlap Registry ({duplicatePairs.length})
        </h3>

        <div className="divide-y divide-gray-100">
          {duplicatePairs.map((pair) => (
            <div
              key={pair.id}
              onClick={() => setSelectedPairId(pair.id)}
              className={`py-2.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer hover:bg-slate-50 transition-colors rounded ${
                activePair?.id === pair.id ? 'bg-blue-50/50' : ''
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#002D62]">{pair.id}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                      pair.overallSimilarity >= 80
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {pair.overallSimilarity}% Match
                  </span>
                  <span className="text-xs text-gray-600 font-medium">{pair.district}</span>
                </div>
                <p className="text-xs text-gray-800 font-semibold truncate max-w-xl">
                  {pair.projectAName} <span className="text-gray-400">↔</span> {pair.projectBName}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                    pair.status === 'Pending Review'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : pair.status === 'Verified Duplicate'
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {pair.status}
                </span>
                <span className="text-xs text-[#002D62] font-semibold hover:underline">
                  Inspect →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
