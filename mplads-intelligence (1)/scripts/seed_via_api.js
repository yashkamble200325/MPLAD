import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(url, key);

export async function runDirectSeed() {
  console.log('Testing connection to Supabase...');
  const { data: projects, error: pErr } = await supabase.from('projects').select('id, sanctioned_amount, project_id, status, expected_completion_date, category, district');
  if (pErr) {
    console.error('Failed to fetch projects:', pErr);
    return;
  }
  console.log(`Found ${projects.length} existing projects.`);

  const { data: payments } = await supabase.from('payments').select('id, project_id, amount, payment_status');
  const { data: alerts } = await supabase.from('risk_alerts').select('id, project_id, severity, score');

  const payByProj = new Map();
  (payments || []).forEach(p => {
    const l = payByProj.get(p.project_id) || [];
    l.push(p);
    payByProj.set(p.project_id, l);
  });

  const alertByProj = new Map();
  (alerts || []).forEach(a => {
    const l = alertByProj.get(a.project_id) || [];
    l.push(a);
    alertByProj.set(a.project_id, l);
  });

  const financials = [];
  const progress = [];
  const riskScores = [];
  const now = new Date('2026-03-01T00:00:00.000Z');

  for (const proj of projects) {
    const proPays = payByProj.get(proj.id) || [];
    const proAlerts = alertByProj.get(proj.id) || [];
    const totalPaid = proPays.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const sanctioned = Number(proj.sanctioned_amount || 0);
    const util = sanctioned > 0 ? Number(((totalPaid / sanctioned) * 100).toFixed(1)) : 0;

    financials.push({
      project_id: proj.id,
      sanctioned_amount: sanctioned,
      expenditure: totalPaid,
      financial_utilization: util
    });

    let delayDays = 0;
    if (proj.expected_completion_date) {
      const expDate = new Date(proj.expected_completion_date);
      if (expDate < now && proj.status !== 'Completed') {
        delayDays = Math.ceil(Math.abs(now.getTime() - expDate.getTime()) / (1000 * 60 * 60 * 24));
      }
    }

    let physicalProgress = 0;
    if (proj.status === 'Completed') physicalProgress = 100;
    else if (proj.status === 'Not Started') physicalProgress = 0;
    else {
      const hasCrit = proAlerts.some(a => a.severity === 'Critical');
      if (hasCrit) physicalProgress = Math.max(10, Math.min(65, Math.round(util * 0.45)));
      else if (proAlerts.length > 0) physicalProgress = Math.max(20, Math.min(80, Math.round(util * 0.75)));
      else physicalProgress = Math.min(95, Math.max(30, Math.round(util * 0.95)));
    }

    progress.push({
      project_id: proj.id,
      physical_progress: physicalProgress,
      delay_days: delayDays,
      remarks: delayDays > 90
        ? 'Milestone stagnation recorded: execution delayed past sanctioned completion schedule.'
        : (util > physicalProgress + 25
          ? 'Physical progress lagging behind fund disbursement milestones.'
          : 'Execution progressing per division milestone plan.')
    });

    const costScore = totalPaid > sanctioned ? Math.min(100, Math.round(((totalPaid - sanctioned) / sanctioned) * 100)) : 10;
    const paymentScore = proPays.some(p => p.payment_status === 'Flagged') ? 85 : (proAlerts.length > 0 ? 65 : 15);
    const delayScore = Math.min(100, Math.round(delayDays * 0.8));
    const duplicateScore = (proj.category === 'Road Development' || proj.category === 'Community Hall') ? 25 : 10;
    const progressExpenditureScore = Math.min(100, Math.max(0, Math.round(util - physicalProgress)));

    const totalRisk = Math.round(costScore * 0.25 + paymentScore * 0.20 + delayScore * 0.20 + duplicateScore * 0.20 + progressExpenditureScore * 0.15);
    let riskLevel = 'LOW';
    if (totalRisk >= 80 || proAlerts.some(a => a.severity === 'Critical')) riskLevel = 'CRITICAL';
    else if (totalRisk >= 60 || proAlerts.some(a => a.severity === 'High')) riskLevel = 'HIGH';
    else if (totalRisk >= 40 || proAlerts.length > 0) riskLevel = 'MEDIUM';

    const topFactors = [];
    if (costScore > 50) topFactors.push('Expenditure overrun exceeding sanctioned ceiling');
    if (progressExpenditureScore > 20) topFactors.push('Financial disbursement substantially leads physical progress');
    if (delayDays > 60) topFactors.push(`Project execution overdue by ${delayDays} calendar days`);
    if (paymentScore > 50) topFactors.push('Flagged multi-tranche payment velocity identified');
    if (topFactors.length === 0) topFactors.push('Routine execution parameters within tolerance');

    const recommendation = riskLevel === 'CRITICAL'
      ? 'Requires Human Verification: Immediate on-site technical inspection and audit inquiry recommended.'
      : (riskLevel === 'HIGH'
        ? 'High-Risk Pattern Identified: Formal clarification notice to be issued to implementing authority.'
        : (riskLevel === 'MEDIUM'
          ? 'Potential Risk: Regular divisional milestone monitoring advised.'
          : 'Low Risk: Normal statutory audit clearance.'));

    riskScores.push({
      project_id: proj.id,
      total_risk_score: totalRisk,
      progress_expenditure_score: progressExpenditureScore,
      model_name: 'Rule-Based Risk Engine',
      model_version: 'prototype-1.0',
      prediction: riskLevel === 'CRITICAL' ? 'Requires Human Verification' : (riskLevel === 'HIGH' ? 'High-Risk Pattern Identified' : 'Potential Risk'),
      top_risk_factors: topFactors,
      recommendation: recommendation,
      risk_level: riskLevel,
      cost_anomaly_score: costScore,
      payment_anomaly_score: paymentScore,
      delay_score: delayScore,
      duplicate_similarity_score: duplicateScore,
      input_timestamp: new Date().toISOString()
    });
  }

  const duplicateMatches = [];
  for (let i = 0; i < Math.min(20, projects.length - 1); i++) {
    const p1 = projects[i];
    const p2 = projects.slice(i + 1).find(p => p.category === p1.category || p.district === p1.district) || projects[i + 1];
    duplicateMatches.push({
      project_id: p1.id,
      matched_project_id: p2.id,
      similarity_score: 75 + (i % 20),
      status: 'Potential Similarity'
    });
  }

  console.log('Attempting API upsert for analytical tables...');
  const finRes = await supabase.from('project_financials').upsert(financials, { onConflict: 'project_id' });
  console.log('project_financials result:', finRes.error || 'SUCCESS (' + financials.length + ' rows)');

  const progRes = await supabase.from('project_progress').upsert(progress, { onConflict: 'project_id' });
  console.log('project_progress result:', progRes.error || 'SUCCESS (' + progress.length + ' rows)');

  const rsRes = await supabase.from('risk_scores').upsert(riskScores, { onConflict: 'project_id' });
  console.log('risk_scores result:', rsRes.error || 'SUCCESS (' + riskScores.length + ' rows)');

  const dupRes = await supabase.from('duplicate_matches').insert(duplicateMatches);
  console.log('duplicate_matches result:', dupRes.error || 'SUCCESS (' + duplicateMatches.length + ' rows)');
}

runDirectSeed();
