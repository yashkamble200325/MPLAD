import { MaharashtraDistrict, ProjectCategory, RiskLevel, RiskFactorScores, RiskWeights } from '../../types';

export interface ProjectFeatureVector {
  projectId: string;
  sanctionedAmount: number; // in Lakhs
  expenditure: number; // in Lakhs
  costOverrunRatio: number; // (exp - sanc) / sanc
  costOverrunPct: number; // max(0, costOverrunRatio * 100)
  financialUtilization: number; // (exp / sanc) * 100
  physicalProgress: number; // 0-100
  progressExpenditureGap: number; // financialUtilization - physicalProgress
  delayDays: number;
  plannedDurationDays: number;
  elapsedDays: number;
  progressVelocity: number; // physicalProgress / elapsedDays
  paymentCount: number;
  avgPaymentAmount: number;
  maxPaymentAmount: number;
  paymentClusteringIndex: number; // 0-100 index of clustered disbursements
  duplicateSimilarity: number; // 0-100
  categoryCode: number; // 0-7
  districtCode: number; // 0-9
  historicalCostBenchmarkRatio: number; // exp / category_avg_cost
}

export interface ContributingFeature {
  name: string;
  displayName: string;
  value: number | string;
  contribution: number; // positive increases risk, negative decreases
  direction: 'increases_risk' | 'decreases_risk' | 'neutral';
  benchmark: string;
}

export interface IsolationForestResult {
  anomalyScore: number; // 0-100
  rawAnomalyScore: number; // 0-1 normalized isolation score
  isAnomalous: boolean;
  pathLength: number;
  averagePathLength: number;
  expectedPathLength: number;
  contributingFeatures: ContributingFeature[];
  summary: string;
}

export interface XGBoostRiskResult {
  riskScore: number; // 0-100
  riskProbability: number; // 0.0 - 1.0 (e.g. 0.94)
  riskLevel: RiskLevel;
  rawMargin: number;
  shapExplanation: ShapExplanation;
  summary: string;
}

export interface DelayPredictionResult {
  predictedDelayDays: number; // Estimated additional delay days
  delayRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  delayProbability: number; // 0.0 - 1.0 (e.g. 0.78)
  estimatedCompletionLagDays: number;
  forecastDate: string;
  confidenceScore: number; // e.g. 78%
  keyDrivers: string[];
  isEstimate: true;
}

export interface SemanticMatchResult {
  score: number; // 0-100
  classification: 'Low Similarity' | 'Moderate Similarity' | 'High Similarity' | 'Very High Similarity';
  matchedProjectId?: string;
  matchedProjectName?: string;
  matchedDistrict?: string;
  textCosineSimilarity: number; // 0.0 - 1.0
  semanticSimilarity?: number;
  categoryMatch: boolean;
  geographicProximityKm: number;
  geoDistanceKm?: number;
  costRatio?: number;
  statusLabel: 'Potential Duplicate — Verification Required' | 'Low Risk of Overlap';
  explanation: string;
}

export interface ShapValueItem {
  feature: string;
  displayName: string;
  value: number | string;
  shapValue: number; // impact on risk score in points
  relativeImpactPercent: number; // percentage of total positive push
  sign: '+' | '-';
}

export interface ShapExplanation {
  baseValue: number; // average baseline risk
  predictedValue: number;
  values: ShapValueItem[];
  topPositiveDrivers: ShapValueItem[];
  topNegativeDrivers: ShapValueItem[];
}

export interface AIFinding {
  id: string;
  projectId: string;
  modelUsed: string;
  modelVersion: string;
  findingType:
    | 'Cost Anomaly'
    | 'Progress vs Expenditure Gap'
    | 'Milestone Delay Risk'
    | 'Potential Duplicate Pattern'
    | 'Payment Velocity Anomaly'
    | 'Composite Risk Flag';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  score: number; // 0-100
  evidenceFactors: Record<string, string | number>;
  explanation: string;
  timestamp: string;
  status: 'Requires Human Verification' | 'Investigation Recommended' | 'Under Investigation' | 'Verified' | 'False Positive';
}

export interface ModelMetadata {
  name: string;
  modelType: string;
  version: string;
  trainingDate: string;
  featureVersion: string;
  status: 'Active' | 'Calibrated';
  accuracyOrAUC: string;
  description: string;
  inferenceLatencyMs: number;
}

export interface ComprehensiveAIAnalysis {
  projectId: string;
  evaluatedAt: string;
  featureVector: ProjectFeatureVector;
  isolationForest: IsolationForestResult;
  xgboostRisk: XGBoostRiskResult;
  delayPrediction: DelayPredictionResult;
  duplicateDetection: SemanticMatchResult;
  compositeRiskScore: number;
  compositeRiskLevel: RiskLevel;
  statutoryFactorScores: RiskFactorScores;
  shapExplanation: ShapExplanation;
  findings: AIFinding[];
  recommendation: 'Investigation Recommended' | 'Requires Human Verification' | 'Routine Monitoring' | 'Cleared by Verification';
  auditTrail: {
    engineVersion: string;
    weightsApplied: RiskWeights;
    timestamp: string;
  };
}
