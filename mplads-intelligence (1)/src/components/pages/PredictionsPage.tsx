import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { RiskBadge } from '../common/RiskBadge';
import { GovDisclaimer } from '../common/GovDisclaimer';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const PredictionsPage: React.FC = () => {
  const { projects, navigateToProject, getProjectAnalysis } = useApp();

  // Predictive projection chart data for overall fiscal year
  const projectionData = [
    { month: 'Oct 25', actualOverrun: 14.2, projectedOverrun: 14.2 },
    { month: 'Nov 25', actualOverrun: 22.0, projectedOverrun: 21.8 },
    { month: 'Dec 25', actualOverrun: 35.8, projectedOverrun: 34.5 },
    { month: 'Jan 26', actualOverrun: 58.4, projectedOverrun: 56.0 },
    { month: 'Feb 26 (Current)', actualOverrun: 84.6, projectedOverrun: 84.6 },
    { month: 'Mar 26 (Forecast)', projectedOverrun: 112.0 },
    { month: 'Apr 26 (Forecast)', projectedOverrun: 138.5 },
    { month: 'May 26 (Forecast)', projectedOverrun: 154.0 },
  ];

  // Dynamic ML analysis calculations across projects
  const nonCompleted = projects.filter((p) => p.status !== 'Completed');
  const projectAnalyses = nonCompleted
    .map((p) => ({
      project: p,
      analysis: getProjectAnalysis(p.id),
    }))
    .filter(
      (pa): pa is { project: typeof pa.project; analysis: NonNullable<typeof pa.analysis> } =>
        pa.analysis !== null
    );

  const highStoppageRiskCount = projectAnalyses.filter(
    (pa) => pa.analysis.xgboostRisk.riskProbability >= 0.75
  ).length;

  const avgPredictedLag = Math.round(
    projectAnalyses.reduce((acc, pa) => acc + pa.analysis.delayPrediction.predictedDelayDays, 0) /
      (projectAnalyses.length || 1)
  );

  const avgConfidence = (
    (projectAnalyses.reduce(
      (acc, pa) => acc + (pa.analysis?.delayPrediction?.confidenceScore ?? 0),
      0
    ) / (projectAnalyses.length || 1)) ||
    0
  ).toFixed(1);

  // Projects with highest predicted delay or overrun probability
  const predictedAtRisk = [...projectAnalyses]
    .sort((a, b) => b.analysis.xgboostRisk.riskProbability - a.analysis.xgboostRisk.riskProbability)
    .slice(0, 6);

  return (
    <div className="space-y-3.5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#002D62] tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#002D62]" />
              <span>Predictive Risk Modeling & Trajectory Forecasts</span>
            </h2>
            <span className="px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-mono font-semibold">
              Live Gradient Boosting Regression
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Statistical projection of cost escalation trajectories and milestone slippage probabilities via calibrated ML models
          </p>
        </div>

        <GovDisclaimer compact />
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
        <StatCard
          title="Projected Fiscal Overrun"
          value="₹154.0L"
          subtitle="Forecasted by May 2026"
          icon={TrendingUp}
          accentColor="red"
        />
        <StatCard
          title="High Escalation Likelihood"
          value={`${highStoppageRiskCount} Works`}
          subtitle="XGBoost Prob. ≥ 75%"
          icon={AlertTriangle}
          accentColor="amber"
        />
        <StatCard
          title="Milestone Delay Forecast"
          value={`+${avgPredictedLag} Days`}
          subtitle="Average Predicted Lag"
          icon={Clock}
          accentColor="slate"
        />
        <StatCard
          title="Model Confidence"
          value={`${avgConfidence}%`}
          subtitle="Ensemble Evaluation Metric"
          icon={Sparkles}
          accentColor="purple"
        />
      </div>

      {/* Forecast Chart */}
      <div className="bg-white rounded border border-gray-200 p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#002D62]">
              Cumulative Statewide Cost Escalation Trajectory (₹ Lakhs)
            </h3>
            <p className="text-[11px] text-gray-500">
              Solid line: Treasury recorded disbursements | Dashed line: Machine-learning projection if unaddressed
            </p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '4px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line
                type="monotone"
                dataKey="actualOverrun"
                name="Actual Recorded Overrun"
                stroke="#002D62"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="projectedOverrun"
                name="Projected Trend (XGBoost/ARIMA)"
                stroke="#e11d48"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* High Escalation Probability Projects */}
      <div className="bg-white rounded border border-gray-200 p-3.5 sm:p-4 space-y-3 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#002D62]">
          Projects with Highest Predicted Escalation Probability
        </h3>

        <div className="divide-y divide-gray-100">
          {predictedAtRisk.map(({ project: p, analysis }) => {
            const prob = Math.round(analysis.xgboostRisk.riskProbability * 100);
            return (
              <div
                key={p.id}
                onClick={() => navigateToProject(p.id)}
                className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 cursor-pointer transition-colors px-2 rounded"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#002D62]">{p.id}</span>
                    <RiskBadge level={p.riskLevel} score={p.riskScore} size="sm" />
                    <span className="text-xs text-gray-500 font-semibold">• {p.district}</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-800">{p.name}</p>
                  <p className="text-[11px] text-gray-500">
                    ML Forecast: Predicted additional delay of +{analysis.delayPrediction.predictedDelayDays} days
                    (Target Completion: {analysis.delayPrediction.forecastDate}; Confidence: {analysis.delayPrediction.confidenceScore}%).
                    Isolation Forest Score: {analysis.isolationForest.anomalyScore}/100.
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-gray-500 block">
                      XGBoost Probability
                    </span>
                    <span className="font-mono font-bold text-red-700 text-xs sm:text-sm">{prob}%</span>
                  </div>
                  <span className="text-xs text-[#002D62] font-semibold hover:underline">
                    Dossier →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
