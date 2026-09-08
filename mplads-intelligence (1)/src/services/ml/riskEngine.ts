import { Project, RiskFactorScores, RiskWeights, RiskLevel } from '../../types';
import { extractFeatureVector } from './preprocessing';
import { isolationForestModel } from './isolationForest';
import { xgboostRiskModel } from './xgboostModel';
import { delayPredictorModel } from './delayPredictor';
import { sentenceTransformer } from './sentenceTransformer';
import { ComprehensiveAIAnalysis, AIFinding } from './types';

export const DEFAULT_CENTRAL_WEIGHTS: RiskWeights = {
  costAnomaly: 25,
  paymentAnomaly: 20,
  delayAnomaly: 20,
  duplicateSimilarity: 20,
  progressDeviation: 15,
};

export class CentralizedRiskEngine {
  private currentWeights: RiskWeights = { ...DEFAULT_CENTRAL_WEIGHTS };

  public setWeights(weights: RiskWeights) {
    this.currentWeights = { ...weights };
  }

  public getWeights(): RiskWeights {
    return { ...this.currentWeights };
  }

  // Evaluates a single project through all ML pipelines
  public evaluateProject(
    project: Project,
    catalog: Project[] = [],
    customWeights?: RiskWeights
  ): ComprehensiveAIAnalysis {
    const weights = customWeights || this.currentWeights;
    const fv = extractFeatureVector(project);

    // 1. Run Isolation Forest
    const ifResult = isolationForestModel.predict(fv);

    // 2. Run XGBoost Risk Classifier & TreeSHAP Explainability
    const xgbResult = xgboostRiskModel.predict(fv);

    // 3. Run Delay Predictor
    const delayResult = delayPredictorModel.predict(fv);

    // 4. Run Sentence Transformer Duplicate Match
    const dupResult = sentenceTransformer.findBestMatch(project, catalog);

    // 5. Calculate Component Factor Scores (0 - 100)
    // Dimension 1: Cost Anomaly Score
    // Combines Isolation Forest cost component + % overrun
    const rawCostAnomaly = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          fv.costOverrunPct > 0
            ? Math.min(100, fv.costOverrunPct * 1.05 + 10)
            : ifResult.anomalyScore * 0.25
        )
      )
    );

    // Dimension 2: Payment Velocity Anomaly Score
    const rawPaymentAnomaly = Math.min(
      100,
      Math.max(
        5,
        Math.round(
          fv.paymentClusteringIndex * 0.8 +
            (ifResult.isAnomalous ? 15 : 0)
        )
      )
    );

    // Dimension 3: Timeline Delay Score
    const rawDelayAnomaly = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          Math.min(100, (fv.delayDays / 180) * 100) * 0.65 +
            (delayResult.predictedDelayDays / 120) * 100 * 0.35
        )
      )
    );

    // Dimension 4: Duplicate Similarity Score
    const rawDuplicateSimilarity = Math.min(
      100,
      Math.max(0, dupResult.score)
    );

    // Dimension 5: Physical vs Financial Progress Deviation Score
    const rawProgressDeviation = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          fv.progressExpenditureGap > 0
            ? Math.min(100, fv.progressExpenditureGap * 1.4)
            : 0
        )
      )
    );

    const statutoryFactorScores: RiskFactorScores = {
      costAnomaly: rawCostAnomaly,
      paymentAnomaly: rawPaymentAnomaly,
      delayAnomaly: rawDelayAnomaly,
      duplicateSimilarity: rawDuplicateSimilarity,
      progressDeviation: rawProgressDeviation,
    };

    // 6. Centralized Weighted Composite Calculation
    const totalWeight =
      weights.costAnomaly +
      weights.paymentAnomaly +
      weights.delayAnomaly +
      weights.duplicateSimilarity +
      weights.progressDeviation;

    const weightedScore =
      (statutoryFactorScores.costAnomaly * weights.costAnomaly +
        statutoryFactorScores.paymentAnomaly * weights.paymentAnomaly +
        statutoryFactorScores.delayAnomaly * weights.delayAnomaly +
        statutoryFactorScores.duplicateSimilarity * weights.duplicateSimilarity +
        statutoryFactorScores.progressDeviation * weights.progressDeviation) /
      (totalWeight || 100);

    // Ensemble fusion with XGBoost predicted probability:
    // Blends multi-criteria utility score (70%) with direct XGBoost risk probability (30%)
    const finalScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(weightedScore * 0.70 + xgbResult.riskScore * 0.30)
      )
    );

    let compositeRiskLevel: RiskLevel = 'LOW';
    if (finalScore >= 80) compositeRiskLevel = 'CRITICAL';
    else if (finalScore >= 60) compositeRiskLevel = 'HIGH';
    else if (finalScore >= 40) compositeRiskLevel = 'MEDIUM';

    // 7. Generate Traceable Structured AI Findings
    const findings: AIFinding[] = [];
    const timestamp = new Date().toISOString();

    // Finding 1: Cost Anomaly
    if (fv.costOverrunPct > 10 || ifResult.isAnomalous) {
      findings.push({
        id: `FIND-COST-${project.id}-${Date.now().toString().slice(-4)}`,
        projectId: project.id,
        modelUsed: 'Isolation Forest + Statutory Variance Engine',
        modelVersion: 'v1.4',
        findingType: 'Cost Anomaly',
        severity: fv.costOverrunPct > 50 ? 'Critical' : fv.costOverrunPct > 20 ? 'High' : 'Medium',
        score: rawCostAnomaly,
        evidenceFactors: {
          sanctionedLakhs: project.sanctionedAmount,
          expenditureLakhs: project.expenditure,
          overrunPercent: `${fv.costOverrunPct.toFixed(1)}%`,
          isolationPathDepth: ifResult.pathLength,
        },
        explanation:
          fv.costOverrunPct > 0
            ? `Disbursed expenditure (₹${project.expenditure}L) exceeds sanctioned allocation (₹${project.sanctionedAmount}L) by ${fv.costOverrunPct.toFixed(1)}%. Model flags significant budgetary variance requiring administrative verification.`
            : 'Unusual expenditure rate observed relative to comparable district public works.',
        timestamp,
        status: 'Requires Human Verification',
      });
    }

    // Finding 2: Progress vs Expenditure Gap
    if (fv.progressExpenditureGap > 15) {
      findings.push({
        id: `FIND-GAP-${project.id}-${Date.now().toString().slice(-4)}`,
        projectId: project.id,
        modelUsed: 'XGBoost Feature Interaction Tree',
        modelVersion: 'v2.0',
        findingType: 'Progress vs Expenditure Gap',
        severity: fv.progressExpenditureGap > 35 ? 'Critical' : 'High',
        score: rawProgressDeviation,
        evidenceFactors: {
          financialUtilization: `${fv.financialUtilization.toFixed(1)}%`,
          physicalProgress: `${project.physicalProgress}%`,
          netDivergenceGap: `${fv.progressExpenditureGap.toFixed(1)} pts`,
        },
        explanation: `Financial utilization (${fv.financialUtilization.toFixed(1)}%) is materially ahead of verified ground execution (${project.physicalProgress}%). Potential risk of premature milestone disbursement.`,
        timestamp,
        status: 'Requires Human Verification',
      });
    }

    // Finding 3: Delay Risk
    if (fv.delayDays > 30 || delayResult.predictedDelayDays > 30) {
      findings.push({
        id: `FIND-DELAY-${project.id}-${Date.now().toString().slice(-4)}`,
        projectId: project.id,
        modelUsed: 'XGBoost Delay Regression Forecaster',
        modelVersion: 'v2.1',
        findingType: 'Milestone Delay Risk',
        severity: fv.delayDays > 90 ? 'Critical' : fv.delayDays > 45 ? 'High' : 'Medium',
        score: rawDelayAnomaly,
        evidenceFactors: {
          currentDelayDays: fv.delayDays,
          estimatedAdditionalDelayDays: delayResult.predictedDelayDays,
          modelConfidence: `${delayResult.confidenceScore}%`,
        },
        explanation: `Milestone execution is overdue by ${fv.delayDays} days with an estimated additional lag of ${delayResult.predictedDelayDays} days (Model Confidence: ${delayResult.confidenceScore}%).`,
        timestamp,
        status: 'Requires Human Verification',
      });
    }

    // Finding 4: Duplicate Pattern
    if (dupResult.score >= 70) {
      findings.push({
        id: `FIND-DUP-${project.id}-${Date.now().toString().slice(-4)}`,
        projectId: project.id,
        modelUsed: 'Sentence-BERT Contextual Semantic Matcher',
        modelVersion: 'v1.5',
        findingType: 'Potential Duplicate Pattern',
        severity: dupResult.score >= 85 ? 'Critical' : 'High',
        score: dupResult.score,
        evidenceFactors: {
          matchedProjectId: dupResult.matchedProjectId || 'N/A',
          matchedProjectName: dupResult.matchedProjectName || 'N/A',
          semanticCosine: dupResult.textCosineSimilarity,
          similarityPercent: `${dupResult.score}%`,
        },
        explanation: `Identified ${dupResult.score}% semantic and geospatial convergence with reference project ${dupResult.matchedProjectId} (${dupResult.matchedProjectName}). Requires cross-scheme verification against double-billing.`,
        timestamp,
        status: 'Requires Human Verification',
      });
    }

    // Finding 5: Payment Velocity Anomaly
    if (fv.paymentClusteringIndex >= 50) {
      findings.push({
        id: `FIND-VEL-${project.id}-${Date.now().toString().slice(-4)}`,
        projectId: project.id,
        modelUsed: 'Isolation Forest Transaction Burst Detector',
        modelVersion: 'v1.2',
        findingType: 'Payment Velocity Anomaly',
        severity: fv.paymentClusteringIndex >= 75 ? 'Critical' : 'High',
        score: rawPaymentAnomaly,
        evidenceFactors: {
          clusteringIndex: fv.paymentClusteringIndex,
          maxPaymentAmount: `₹${fv.maxPaymentAmount}L`,
          totalVouchers: fv.paymentCount,
        },
        explanation: `Elevated disbursement velocity index (${fv.paymentClusteringIndex}/100) indicates rapid clustered releases or large single-tranche transfers without proportional intermediate site inspections.`,
        timestamp,
        status: 'Requires Human Verification',
      });
    }

    let recommendation: 'Investigation Recommended' | 'Requires Human Verification' | 'Routine Monitoring' | 'Cleared by Verification' =
      'Routine Monitoring';
    if (finalScore >= 75 || findings.some((f) => f.severity === 'Critical')) {
      recommendation = 'Investigation Recommended';
    } else if (finalScore >= 50 || findings.length >= 2) {
      recommendation = 'Requires Human Verification';
    }

    return {
      projectId: project.id,
      evaluatedAt: timestamp,
      featureVector: fv,
      isolationForest: ifResult,
      xgboostRisk: xgbResult,
      delayPrediction: delayResult,
      duplicateDetection: dupResult,
      compositeRiskScore: finalScore,
      compositeRiskLevel: compositeRiskLevel,
      statutoryFactorScores,
      shapExplanation: xgbResult.shapExplanation,
      findings,
      recommendation,
      auditTrail: {
        engineVersion: '2.1.0-PROD-AUDIT',
        weightsApplied: { ...weights },
        timestamp,
      },
    };
  }

  // Batch re-score all projects in catalog
  public evaluateAllProjects(projects: Project[], weights?: RiskWeights): Project[] {
    const effectiveWeights = weights || this.currentWeights;

    return projects.map((project) => {
      const analysis = this.evaluateProject(project, projects, effectiveWeights);

      // Combine statutory/Supabase findings with ML findings
      const combinedFindings = [...(project.aiFindings || [])];
      const findingStrings = analysis.findings.map((f) => `${f.findingType}: ${f.explanation}`);
      findingStrings.forEach((f) => {
        if (!combinedFindings.includes(f)) {
          combinedFindings.push(f);
        }
      });
      if (combinedFindings.length === 0) {
        combinedFindings.push('All parameters within standard MoSPI/state monitoring thresholds.');
      }

      return {
        ...project,
        riskScore: analysis.compositeRiskScore,
        riskLevel: analysis.compositeRiskLevel,
        riskFactors: analysis.statutoryFactorScores,
        duplicateSimilarity: analysis.duplicateDetection.score,
        duplicateMatchProjectId: analysis.duplicateDetection.matchedProjectId,
        aiFindings: combinedFindings,
      };
    });
  }
}

export const riskEngine = new CentralizedRiskEngine();
