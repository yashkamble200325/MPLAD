import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(url, key);

async function generateSeed() {
  const { data: projects, error: pErr } = await supabase.from('projects').select('*').order('created_at', { ascending: true });
  if (pErr || !projects) {
    console.error('Error fetching projects:', pErr);
    process.exit(1);
  }
  const { data: payments } = await supabase.from('payments').select('*');
  const { data: alerts } = await supabase.from('risk_alerts').select('*');

  console.log('Fetched projects:', projects.length);
  console.log('Fetched payments:', (payments || []).length);
  console.log('Fetched alerts:', (alerts || []).length);

  // Group payments by project_id
  const payByProj = new Map();
  (payments || []).forEach(p => {
    const list = payByProj.get(p.project_id) || [];
    list.push(p);
    payByProj.set(p.project_id, list);
  });

  // Group alerts by project_id
  const alertByProj = new Map();
  (alerts || []).forEach(a => {
    const list = alertByProj.get(a.project_id) || [];
    list.push(a);
    alertByProj.set(a.project_id, list);
  });

  const financials = [];
  const progress = [];
  const riskScores = [];

  const now = new Date('2026-03-01T00:00:00.000Z');

  projects.forEach((proj) => {
    const proPays = payByProj.get(proj.id) || [];
    const proAlerts = alertByProj.get(proj.id) || [];

    const totalPaidRupees = proPays.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const sanctionedRupees = Number(proj.sanctioned_amount || 0);
    const utilizationPct = sanctionedRupees > 0
      ? Number(((totalPaidRupees / sanctionedRupees) * 100).toFixed(1))
      : 0;

    // Financial record
    financials.push({
      project_id: proj.id,
      sanctioned_amount: sanctionedRupees,
      expenditure: totalPaidRupees,
      financial_utilization: utilizationPct
    });

    // Delay calculation
    let delayDays = 0;
    if (proj.expected_completion_date) {
      const expDate = new Date(proj.expected_completion_date);
      if (expDate < now && proj.status !== 'Completed') {
        delayDays = Math.ceil(Math.abs(now.getTime() - expDate.getTime()) / (1000 * 60 * 60 * 24));
      }
    }

    // Physical progress calculation
    let physicalProgress = 0;
    if (proj.status === 'Completed') {
      physicalProgress = 100;
    } else if (proj.status === 'Not Started') {
      physicalProgress = 0;
    } else {
      const hasCrit = proAlerts.some(a => a.severity === 'Critical');
      if (hasCrit) {
        physicalProgress = Math.max(10, Math.min(65, Math.round(utilizationPct * 0.45)));
      } else if (proAlerts.length > 0) {
        physicalProgress = Math.max(20, Math.min(80, Math.round(utilizationPct * 0.75)));
      } else {
        physicalProgress = Math.min(95, Math.max(30, Math.round(utilizationPct * 0.95)));
      }
    }

    const remarks = delayDays > 90
      ? 'Milestone stagnation recorded: execution delayed past sanctioned completion schedule.'
      : (utilizationPct > physicalProgress + 25
        ? 'Physical progress lagging behind fund disbursement milestones.'
        : 'Execution progressing per division milestone plan.');

    progress.push({
      project_id: proj.id,
      physical_progress: physicalProgress,
      delay_days: delayDays,
      remarks: remarks
    });

    // Risk calculation
    const costScore = totalPaidRupees > sanctionedRupees
      ? Math.min(100, Math.round(((totalPaidRupees - sanctionedRupees) / sanctionedRupees) * 100))
      : 10;
    const paymentScore = proPays.some(p => p.payment_status === 'Flagged') ? 85 : (proAlerts.length > 0 ? 65 : 15);
    const delayScore = Math.min(100, Math.round(delayDays * 0.8));
    const duplicateScore = (proj.category === 'Road Development' || proj.category === 'Community Hall') ? 25 : 10;
    const progressExpenditureScore = Math.min(100, Math.max(0, Math.round(utilizationPct - physicalProgress)));

    const totalRisk = Math.round(
      costScore * 0.25 +
      paymentScore * 0.20 +
      delayScore * 0.20 +
      duplicateScore * 0.20 +
      progressExpenditureScore * 0.15
    );

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
  });

  // Generate 20 duplicate matches among similar projects in same category/district
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

  console.log('Prepared counts:');
  console.log('- project_financials:', financials.length);
  console.log('- project_progress:', progress.length);
  console.log('- risk_scores:', riskScores.length);
  console.log('- duplicate_matches:', duplicateMatches.length);

  // Write SQL script
  fs.mkdirSync('scripts', { recursive: true });
  let sql = '-- ====================================================================\n';
  sql += '-- MPLADS INTELLIGENCE: Analytical Tables Population & RLS Policies Migration\n';
  sql += '-- Database: Supabase PostgreSQL\n';
  sql += '-- Records: 100 project_financials, 100 project_progress, 100 risk_scores, 20 duplicate_matches\n';
  sql += '-- ====================================================================\n\n';

  sql += '-- STEP 1: Ensure Minimum Required RLS Policies for Anonymous/Public Client Access\n';
  sql += 'DO $$\nBEGIN\n';
  sql += '  -- project_financials policies\n';
  sql += '  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = \'project_financials\' AND policyname = \'Allow public select project_financials\') THEN\n';
  sql += '    CREATE POLICY \"Allow public select project_financials\" ON project_financials FOR SELECT USING (true);\n';
  sql += '  END IF;\n';
  sql += '  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = \'project_financials\' AND policyname = \'Allow public insert project_financials\') THEN\n';
  sql += '    CREATE POLICY \"Allow public insert project_financials\" ON project_financials FOR INSERT WITH CHECK (true);\n';
  sql += '  END IF;\n';
  sql += '  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = \'project_financials\' AND policyname = \'Allow public update project_financials\') THEN\n';
  sql += '    CREATE POLICY \"Allow public update project_financials\" ON project_financials FOR UPDATE USING (true);\n';
  sql += '  END IF;\n\n';

  sql += '  -- project_progress policies\n';
  sql += '  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = \'project_progress\' AND policyname = \'Allow public select project_progress\') THEN\n';
  sql += '    CREATE POLICY \"Allow public select project_progress\" ON project_progress FOR SELECT USING (true);\n';
  sql += '  END IF;\n';
  sql += '  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = \'project_progress\' AND policyname = \'Allow public insert project_progress\') THEN\n';
  sql += '    CREATE POLICY \"Allow public insert project_progress\" ON project_progress FOR INSERT WITH CHECK (true);\n';
  sql += '  END IF;\n';
  sql += '  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = \'project_progress\' AND policyname = \'Allow public update project_progress\') THEN\n';
  sql += '    CREATE POLICY \"Allow public update project_progress\" ON project_progress FOR UPDATE USING (true);\n';
  sql += '  END IF;\n\n';

  sql += '  -- risk_scores policies\n';
  sql += '  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = \'risk_scores\' AND policyname = \'Allow public select risk_scores\') THEN\n';
  sql += '    CREATE POLICY \"Allow public select risk_scores\" ON risk_scores FOR SELECT USING (true);\n';
  sql += '  END IF;\n';
  sql += '  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = \'risk_scores\' AND policyname = \'Allow public insert risk_scores\') THEN\n';
  sql += '    CREATE POLICY \"Allow public insert risk_scores\" ON risk_scores FOR INSERT WITH CHECK (true);\n';
  sql += '  END IF;\n';
  sql += '  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = \'risk_scores\' AND policyname = \'Allow public update risk_scores\') THEN\n';
  sql += '    CREATE POLICY \"Allow public update risk_scores\" ON risk_scores FOR UPDATE USING (true);\n';
  sql += '  END IF;\n\n';

  sql += '  -- duplicate_matches policies\n';
  sql += '  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = \'duplicate_matches\' AND policyname = \'Allow public select duplicate_matches\') THEN\n';
  sql += '    CREATE POLICY \"Allow public select duplicate_matches\" ON duplicate_matches FOR SELECT USING (true);\n';
  sql += '  END IF;\n';
  sql += '  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = \'duplicate_matches\' AND policyname = \'Allow public insert duplicate_matches\') THEN\n';
  sql += '    CREATE POLICY \"Allow public insert duplicate_matches\" ON duplicate_matches FOR INSERT WITH CHECK (true);\n';
  sql += '  END IF;\n';
  sql += '  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = \'duplicate_matches\' AND policyname = \'Allow public update duplicate_matches\') THEN\n';
  sql += '    CREATE POLICY \"Allow public update duplicate_matches\" ON duplicate_matches FOR UPDATE USING (true);\n';
  sql += '  END IF;\n';
  sql += 'END $$;\n\n';

  sql += '-- STEP 2: Clear any potential stale records before idempotent population\n';
  sql += 'DELETE FROM project_financials;\n';
  sql += 'DELETE FROM project_progress;\n';
  sql += 'DELETE FROM risk_scores;\n';
  sql += 'DELETE FROM duplicate_matches;\n\n';

  sql += '-- STEP 3: Seed project_financials (100 rows)\n';
  sql += 'INSERT INTO project_financials (project_id, sanctioned_amount, expenditure, financial_utilization)\nVALUES\n';
  sql += financials.map(f => `  ('${f.project_id}', ${f.sanctioned_amount}, ${f.expenditure}, ${f.financial_utilization})`).join(',\n');
  sql += ';\n\n';

  sql += '-- STEP 4: Seed project_progress (100 rows)\n';
  sql += 'INSERT INTO project_progress (project_id, physical_progress, delay_days, remarks)\nVALUES\n';
  sql += progress.map(p => `  ('${p.project_id}', ${p.physical_progress}, ${p.delay_days}, '${p.remarks.replace(/'/g, "''")}')`).join(',\n');
  sql += ';\n\n';

  sql += '-- STEP 5: Seed risk_scores (100 rows)\n';
  sql += 'INSERT INTO risk_scores (project_id, total_risk_score, progress_expenditure_score, model_name, model_version, prediction, top_risk_factors, recommendation, risk_level, cost_anomaly_score, payment_anomaly_score, delay_score, duplicate_similarity_score, input_timestamp)\nVALUES\n';
  sql += riskScores.map(r => `  ('${r.project_id}', ${r.total_risk_score}, ${r.progress_expenditure_score}, '${r.model_name}', '${r.model_version}', '${r.prediction}', ARRAY[${r.top_risk_factors.map(f => "'" + f.replace(/'/g, "''") + "'").join(', ')}], '${r.recommendation.replace(/'/g, "''")}', '${r.risk_level}', ${r.cost_anomaly_score}, ${r.payment_anomaly_score}, ${r.delay_score}, ${r.duplicate_similarity_score}, '${r.input_timestamp}')`).join(',\n');
  sql += ';\n\n';

  sql += '-- STEP 6: Seed duplicate_matches (20 rows)\n';
  sql += 'INSERT INTO duplicate_matches (project_id, matched_project_id, similarity_score, status)\nVALUES\n';
  sql += duplicateMatches.map(d => `  ('${d.project_id}', '${d.matched_project_id}', ${d.similarity_score}, '${d.status}')`).join(',\n');
  sql += ';\n\n';

  sql += '-- STEP 7: Validation Query\n';
  sql += 'SELECT\n';
  sql += '  (SELECT count(*) FROM projects) as count_projects,\n';
  sql += '  (SELECT count(*) FROM project_financials) as count_financials,\n';
  sql += '  (SELECT count(*) FROM project_progress) as count_progress,\n';
  sql += '  (SELECT count(*) FROM risk_scores) as count_risk_scores,\n';
  sql += '  (SELECT count(*) FROM duplicate_matches) as count_duplicate_matches;\n';

  fs.writeFileSync('scripts/seed_analytical_tables.sql', sql);
  console.log('Saved scripts/seed_analytical_tables.sql! Size:', sql.length, 'bytes');
}

generateSeed();
