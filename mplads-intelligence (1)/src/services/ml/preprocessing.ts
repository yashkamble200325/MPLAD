import { Project, ProjectCategory, MaharashtraDistrict } from '../../types';
import { ProjectFeatureVector } from './types';

// Category encodings and historical standard benchmark costs (in Lakhs)
export const CATEGORY_METADATA: Record<ProjectCategory, { code: number; avgSanction: number; avgDurationMonths: number }> = {
  'Healthcare': { code: 0, avgSanction: 25.0, avgDurationMonths: 10 },
  'Drinking Water': { code: 1, avgSanction: 18.0, avgDurationMonths: 6 },
  'Road Development': { code: 2, avgSanction: 35.0, avgDurationMonths: 12 },
  'Community Hall': { code: 3, avgSanction: 20.0, avgDurationMonths: 8 },
  'School Infrastructure': { code: 4, avgSanction: 22.0, avgDurationMonths: 9 },
  'Sanitation': { code: 5, avgSanction: 12.0, avgDurationMonths: 5 },
  'Street Lighting': { code: 6, avgSanction: 8.0, avgDurationMonths: 4 },
  'Public Infrastructure': { code: 7, avgSanction: 30.0, avgDurationMonths: 11 },
};

export const DISTRICT_METADATA: Record<MaharashtraDistrict, { code: number; riskIndex: number }> = {
  'Pune': { code: 0, riskIndex: 1.05 },
  'Mumbai': { code: 1, riskIndex: 1.10 },
  'Thane': { code: 2, riskIndex: 1.02 },
  'Nagpur': { code: 3, riskIndex: 0.98 },
  'Nashik': { code: 4, riskIndex: 0.95 },
  'Raigad': { code: 5, riskIndex: 0.99 },
  'Kolhapur': { code: 6, riskIndex: 0.93 },
  'Satara': { code: 7, riskIndex: 0.92 },
  'Ratnagiri': { code: 8, riskIndex: 0.90 },
  'Chhatrapati Sambhajinagar': { code: 9, riskIndex: 0.96 },
};

export function extractFeatureVector(project: Project): ProjectFeatureVector {
  const sanctioned = Math.max(0.1, project.sanctionedAmount);
  const expenditure = Math.max(0, project.expenditure);
  const costOverrunRatio = (expenditure - sanctioned) / sanctioned;
  const costOverrunPct = Math.max(0, costOverrunRatio * 100);
  const financialUtilization = Math.min(300, (expenditure / sanctioned) * 100);
  const physicalProgress = Math.min(100, Math.max(0, project.physicalProgress));
  const progressExpenditureGap = Math.max(-100, Math.min(100, financialUtilization - physicalProgress));

  // Date metrics
  const start = new Date(project.startDate || '2025-01-01').getTime();
  const end = new Date(project.expectedCompletionDate || '2025-12-31').getTime();
  const now = new Date('2026-03-01').getTime(); // Current reference evaluation timeline

  const plannedDurationDays = Math.max(30, Math.round((end - start) / 86400000));
  const elapsedDays = Math.max(1, Math.round((now - start) / 86400000));
  const progressVelocity = Number((physicalProgress / Math.max(1, elapsedDays)).toFixed(4));

  // Payment transactions analysis
  const payments = project.payments || [];
  const paymentCount = payments.length;
  const totalPaymentAmt = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const avgPaymentAmount = paymentCount > 0 ? totalPaymentAmt / paymentCount : expenditure / Math.max(1, paymentCount);
  const maxPaymentAmount = payments.length > 0 ? Math.max(...payments.map((p) => p.amount || 0)) : expenditure;

  // Calculate payment clustering / velocity index (0 to 100)
  // Higher if payments are concentrated in short timespans or disproportionately high
  let paymentClusteringIndex = 0;
  if (payments.length > 1) {
    const dates = payments.map((p) => new Date(p.date).getTime()).sort((a, b) => a - b);
    let minGapDays = 999;
    for (let i = 1; i < dates.length; i++) {
      const gap = (dates[i] - dates[i - 1]) / 86400000;
      if (gap < minGapDays) minGapDays = gap;
    }
    const hasFlaggedVoucher = payments.some((p) => p.isAnomalous || p.status === 'Flagged');
    const rapidClustering = minGapDays < 15 ? 40 : minGapDays < 30 ? 25 : 10;
    const sizeConcentration = (maxPaymentAmount / sanctioned) > 0.4 ? 35 : (maxPaymentAmount / sanctioned) > 0.25 ? 20 : 5;
    paymentClusteringIndex = Math.min(100, rapidClustering + sizeConcentration + (hasFlaggedVoucher ? 25 : 0));
  } else if (payments.length === 1 && payments[0].amount > sanctioned * 0.5) {
    paymentClusteringIndex = 65;
  } else {
    // If no individual payments array, estimate from financial utilization vs physical progress
    paymentClusteringIndex = Math.min(100, Math.max(10, Math.round((financialUtilization / 100) * 50 + (project.riskFactors?.paymentAnomaly || 20) * 0.5)));
  }

  const catMeta = CATEGORY_METADATA[project.category] || { code: 0, avgSanction: 20.0, avgDurationMonths: 8 };
  const distMeta = DISTRICT_METADATA[project.district] || { code: 0, riskIndex: 1.0 };
  const historicalCostBenchmarkRatio = Number((expenditure / catMeta.avgSanction).toFixed(3));

  return {
    projectId: project.id,
    sanctionedAmount: sanctioned,
    expenditure,
    costOverrunRatio,
    costOverrunPct,
    financialUtilization,
    physicalProgress,
    progressExpenditureGap,
    delayDays: Math.max(0, project.delayDays || 0),
    plannedDurationDays,
    elapsedDays,
    progressVelocity,
    paymentCount,
    avgPaymentAmount,
    maxPaymentAmount,
    paymentClusteringIndex,
    duplicateSimilarity: project.duplicateSimilarity || 0,
    categoryCode: catMeta.code,
    districtCode: distMeta.code,
    historicalCostBenchmarkRatio,
  };
}
