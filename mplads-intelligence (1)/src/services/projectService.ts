import { supabase } from '../lib/supabase';
import { Project, PaymentRecord, MaharashtraDistrict, ProjectCategory, ProjectStatus, RiskLevel, RiskFactorScores } from '../types';

export interface DbProject {
  id: string;
  project_id: string;
  mp_allocation_id?: string;
  district_id?: string;
  constituency_id?: string;
  state: string;
  district: string;
  constituency?: string;
  project_name: string;
  category: string;
  description: string;
  sanctioned_amount: number;
  estimated_cost: number;
  start_date: string;
  expected_completion_date: string;
  actual_completion_date?: string | null;
  status: string;
  implementing_authority: string;
  created_at: string;
  updated_at: string;
}

export interface DbPayment {
  id: string;
  project_id: string;
  payment_date: string;
  amount: number;
  recipient?: string;
  vendor_name?: string;
  purpose?: string;
  description?: string;
  invoice_number?: string;
  transaction_reference?: string;
  payment_status?: string;
  is_flagged?: boolean;
  created_at: string;
}

export interface DbAlert {
  id: string;
  project_id: string;
  alert_type: string;
  severity: string;
  score?: number;
  description: string;
  status: string;
  created_at: string;
}

export interface DbRiskScore {
  id: string;
  project_id: string;
  total_risk_score: number;
  risk_level: string;
  cost_anomaly_score: number;
  payment_anomaly_score: number;
  delay_score: number;
  duplicate_similarity_score: number;
  progress_expenditure_score: number;
  model_name?: string;
  model_version?: string;
  prediction?: string;
  top_risk_factors?: string[];
  recommendation?: string;
  input_timestamp?: string;
  created_at: string;
}

export interface DbProjectFinancial {
  id: string;
  project_id: string;
  sanctioned_amount: number;
  expenditure: number;
  financial_utilization: number;
  created_at: string;
}

export interface DbProjectProgress {
  id: string;
  project_id: string;
  physical_progress: number;
  delay_days: number;
  remarks?: string;
  created_at: string;
}

export interface DbDuplicateMatch {
  id: string;
  project_id: string;
  matched_project_id: string;
  similarity_score: number;
  status?: string;
  created_at: string;
}

// Coordinate anchors for Maharashtra districts
const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Pune: { lat: 18.5204, lng: 73.8567 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Thane: { lat: 19.2183, lng: 72.9781 },
  Nagpur: { lat: 21.1458, lng: 79.0882 },
  Nashik: { lat: 19.9975, lng: 73.7898 },
  Raigad: { lat: 18.5158, lng: 73.1822 },
  Kolhapur: { lat: 16.705, lng: 74.2433 },
  Satara: { lat: 17.6805, lng: 74.0183 },
  Ratnagiri: { lat: 16.9902, lng: 73.312 },
  'Chhatrapati Sambhajinagar': { lat: 19.8762, lng: 75.3433 },
};

export const projectService = {
  /**
   * Fetches all projects from Supabase with relational payments, alerts, risk scores, financials, progress, and investigations
   */
  async fetchProjects(): Promise<Project[]> {
    // 1. Fetch projects and auxiliary tables in parallel
    const [
      projRes,
      payRes,
      alertRes,
      riskScoreRes,
      finRes,
      progRes,
      dupRes,
      invRes,
    ] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('payments').select('*').order('payment_date', { ascending: true }),
      supabase.from('risk_alerts').select('*'),
      supabase.from('risk_scores').select('*'),
      supabase.from('project_financials').select('*'),
      supabase.from('project_progress').select('*'),
      supabase.from('duplicate_matches').select('*'),
      supabase.from('investigations').select('id, project_id, status, title'),
    ]);

    const { data: dbProjects, error: projErr } = projRes;
    if (projErr) {
      console.error('Error fetching projects from Supabase:', projErr);
      throw projErr;
    }

    if (!dbProjects || dbProjects.length === 0) {
      return [];
    }

    const dbPayments = payRes.data || [];
    const dbAlerts = alertRes.data || [];
    const dbRiskScores = riskScoreRes.data || [];
    const dbFinancials = finRes.data || [];
    const dbProgress = progRes.data || [];
    const dbDuplicates = dupRes.data || [];
    const dbInvestigations = invRes.data || [];

    // Index payments by project UUID
    const paymentsByProjectId = new Map<string, DbPayment[]>();
    dbPayments.forEach((pay: any) => {
      const existing = paymentsByProjectId.get(pay.project_id) || [];
      existing.push(pay);
      paymentsByProjectId.set(pay.project_id, existing);
    });

    // Index alerts by project UUID
    const alertsByProjectId = new Map<string, DbAlert[]>();
    dbAlerts.forEach((alt: any) => {
      const existing = alertsByProjectId.get(alt.project_id) || [];
      existing.push(alt);
      alertsByProjectId.set(alt.project_id, existing);
    });

    // Index risk scores by project UUID or project_id code
    const riskScoresByProjectId = new Map<string, DbRiskScore>();
    dbRiskScores.forEach((rs: any) => {
      if (rs.project_id) riskScoresByProjectId.set(rs.project_id, rs);
    });

    // Index financials by project UUID
    const financialsByProjectId = new Map<string, DbProjectFinancial>();
    dbFinancials.forEach((fin: any) => {
      if (fin.project_id) financialsByProjectId.set(fin.project_id, fin);
    });

    // Index progress by project UUID
    const progressByProjectId = new Map<string, DbProjectProgress>();
    dbProgress.forEach((prog: any) => {
      if (prog.project_id) progressByProjectId.set(prog.project_id, prog);
    });

    // Index duplicate matches by project UUID
    const duplicatesByProjectId = new Map<string, DbDuplicateMatch>();
    dbDuplicates.forEach((dup: any) => {
      if (dup.project_id) duplicatesByProjectId.set(dup.project_id, dup);
      if (dup.matched_project_id) duplicatesByProjectId.set(dup.matched_project_id, dup);
    });

    // Index active investigations by project UUID
    const investigationsByProjectId = new Map<string, any>();
    dbInvestigations.forEach((inv: any) => {
      if (inv.project_id) investigationsByProjectId.set(inv.project_id, inv);
    });

    const now = new Date();

    return dbProjects.map((p: DbProject) => {
      const projectPayments = paymentsByProjectId.get(p.id) || [];
      const projectAlerts = alertsByProjectId.get(p.id) || [];
      const linkedRiskScore = riskScoresByProjectId.get(p.id) || riskScoresByProjectId.get(p.project_id);
      const linkedFinancial = financialsByProjectId.get(p.id) || financialsByProjectId.get(p.project_id);
      const linkedProgress = progressByProjectId.get(p.id) || progressByProjectId.get(p.project_id);
      const linkedDuplicate = duplicatesByProjectId.get(p.id) || duplicatesByProjectId.get(p.project_id);
      const linkedInvestigation = investigationsByProjectId.get(p.id) || investigationsByProjectId.get(p.project_id);

      // Financials: Prefer project_financials table if present, else derive from payments & project table
      let sanctionedAmount = Number((p.sanctioned_amount / 100000).toFixed(2));
      const totalPaidRupees = projectPayments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
      let expenditure = Number((totalPaidRupees / 100000).toFixed(2));
      let financialUtilization = sanctionedAmount > 0
        ? Number(Math.min(250, (expenditure / sanctionedAmount) * 100).toFixed(1))
        : 0;

      if (linkedFinancial) {
        if (linkedFinancial.sanctioned_amount) {
          sanctionedAmount = Number((linkedFinancial.sanctioned_amount / 100000).toFixed(2));
        }
        if (linkedFinancial.expenditure) {
          expenditure = Number((linkedFinancial.expenditure / 100000).toFixed(2));
        }
        if (linkedFinancial.financial_utilization !== undefined) {
          financialUtilization = Number(linkedFinancial.financial_utilization.toFixed(1));
        }
      }

      // Calculate delay days
      let delayDays = 0;
      if (linkedProgress?.delay_days !== undefined && linkedProgress.delay_days > 0) {
        delayDays = linkedProgress.delay_days;
      } else if (p.expected_completion_date) {
        const expectedDate = new Date(p.expected_completion_date);
        if (expectedDate < now && p.status !== 'Completed') {
          const diffTime = Math.abs(now.getTime() - expectedDate.getTime());
          delayDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
      }

      // Physical progress: Prefer project_progress table if present
      let physicalProgress = 0;
      if (linkedProgress?.physical_progress !== undefined) {
        physicalProgress = linkedProgress.physical_progress;
      } else if (p.status === 'Completed') {
        physicalProgress = 100;
      } else if (p.status === 'Not Started') {
        physicalProgress = 0;
      } else {
        const hasCriticalAlert = projectAlerts.some((a) => a.severity?.toUpperCase() === 'CRITICAL');
        if (hasCriticalAlert) {
          physicalProgress = Math.max(10, Math.round(financialUtilization * 0.45));
        } else if (projectAlerts.length > 0) {
          physicalProgress = Math.max(20, Math.round(financialUtilization * 0.75));
        } else {
          physicalProgress = Math.min(95, Math.max(30, Math.round(financialUtilization * 0.95)));
        }
      }
      physicalProgress = Math.min(100, Math.max(0, physicalProgress));

      // Calculate or parse risk score and severity
      let riskScore = 18;
      let riskLevel: RiskLevel = 'LOW';
      const aiFindings: string[] = [];

      if (linkedRiskScore) {
        // Direct official risk score from Supabase risk_scores table
        riskScore = Math.round(linkedRiskScore.total_risk_score);
        const sev = (linkedRiskScore.risk_level || 'Low').toUpperCase();
        if (sev.includes('CRIT') || riskScore >= 80) riskLevel = 'CRITICAL';
        else if (sev.includes('HIGH') || riskScore >= 60) riskLevel = 'HIGH';
        else if (sev.includes('MED') || riskScore >= 40) riskLevel = 'MEDIUM';
        else riskLevel = 'LOW';

        if (linkedRiskScore.recommendation) {
          aiFindings.push(linkedRiskScore.recommendation);
        }
        let parsedFactors: any[] = [];
        if (Array.isArray(linkedRiskScore.top_risk_factors)) {
          parsedFactors = linkedRiskScore.top_risk_factors;
        } else if (typeof linkedRiskScore.top_risk_factors === 'string') {
          try {
            const parsed = JSON.parse(linkedRiskScore.top_risk_factors);
            if (Array.isArray(parsed)) parsedFactors = parsed;
            else if (typeof parsed === 'string') parsedFactors = [parsed];
          } catch {
            parsedFactors = [linkedRiskScore.top_risk_factors];
          }
        }
        parsedFactors.forEach((factor: any) => {
          let strFactor = '';
          if (typeof factor === 'string') {
            strFactor = factor;
          } else if (factor && typeof factor === 'object') {
            strFactor = factor.factor || factor.description || factor.name || JSON.stringify(factor);
          }
          if (strFactor && !aiFindings.includes(strFactor)) {
            aiFindings.push(strFactor);
          }
        });
      } else if (projectAlerts.length > 0) {
        const topAlert = [...projectAlerts].sort((a, b) => (b.score || 0) - (a.score || 0))[0];
        riskScore = Math.round(topAlert.score || 75);

        const sev = (topAlert.severity || 'Medium').toUpperCase();
        if (sev.includes('CRIT') || riskScore >= 80) riskLevel = 'CRITICAL';
        else if (sev.includes('HIGH') || riskScore >= 60) riskLevel = 'HIGH';
        else if (sev.includes('MED') || riskScore >= 40) riskLevel = 'MEDIUM';
        else riskLevel = 'LOW';
      } else {
        riskScore = 0;
        riskLevel = 'LOW';
      }

      // Add alert descriptions to findings
      projectAlerts.forEach((alt) => {
        if (alt.description) {
          const sentences = alt.description.split('. ').map(s => s.trim()).filter(Boolean);
          sentences.forEach(s => {
            const clean = s.endsWith('.') ? s : `${s}.`;
            if (!aiFindings.includes(clean) && !clean.toLowerCase().includes('risk score:')) {
              aiFindings.push(clean);
            }
          });
        }
      });

      if (linkedProgress?.remarks) {
        aiFindings.push(linkedProgress.remarks);
      }

      if (aiFindings.length === 0) {
        aiFindings.push('Awaiting formal statutory inspection report.');
      }

      // Risk factor scores - directly from Supabase risk_scores table
      const costAnomaly = linkedRiskScore?.cost_anomaly_score ?? 0;
      const paymentAnomaly = linkedRiskScore?.payment_anomaly_score ?? (projectPayments.some(p => p.is_flagged || p.payment_status === 'Flagged') ? 85 : 0);
      const delayAnomaly = linkedRiskScore?.delay_score ?? 0;
      const duplicateSimilarity = linkedRiskScore?.duplicate_similarity_score ?? (linkedDuplicate ? linkedDuplicate.similarity_score : 0);
      const progressDeviation = linkedRiskScore?.progress_expenditure_score ?? 0;

      const riskFactors: RiskFactorScores = {
        costAnomaly,
        paymentAnomaly,
        delayAnomaly,
        duplicateSimilarity,
        progressDeviation,
      };

      // Formatted payment records matching real Supabase schema
      const payments: PaymentRecord[] = projectPayments.map((pay) => {
        const isFlagged = pay.payment_status === 'Flagged' || pay.payment_status === 'Anomalous' || pay.is_flagged === true;
        return {
          id: pay.id,
          date: pay.payment_date,
          vendor: pay.recipient || pay.vendor_name || 'District Infrastructure Contractor',
          amount: Number((pay.amount / 100000).toFixed(2)),
          description: pay.description || pay.purpose || 'Initial project payment',
          status: isFlagged ? 'Flagged' : 'Approved',
          invoiceNumber: pay.transaction_reference || pay.invoice_number || `TXN-${pay.id.substring(0, 8).toUpperCase()}`,
          isAnomalous: isFlagged,
        };
      });

      // Coordinates
      const coords = DISTRICT_COORDINATES[p.district] || { lat: 18.5204, lng: 73.8567 };

      // Map DB status to clean UI status
      let cleanStatus: ProjectStatus = 'In Progress';
      if (linkedInvestigation && linkedInvestigation.status !== 'Resolved' && linkedInvestigation.status !== 'False Positive') {
        cleanStatus = 'Under Investigation';
      } else if (p.status === 'Completed') cleanStatus = 'Completed';
      else if (p.status === 'Delayed') cleanStatus = 'Delayed';
      else if (p.status === 'Under Investigation') cleanStatus = 'Under Investigation';
      else if (p.status === 'Not Started') cleanStatus = 'Sanctioned';
      else if (riskLevel === 'CRITICAL' && projectAlerts.length > 0) cleanStatus = 'Under Investigation';
      else cleanStatus = 'In Progress';

      return {
        id: p.project_id || p.id,
        uuid: p.id,
        dbId: p.id,
        name: p.project_name,
        district: (p.district as MaharashtraDistrict) || 'Pune',
        category: (p.category as ProjectCategory) || 'Public Infrastructure',
        sanctionedAmount,
        expenditure,
        physicalProgress,
        financialUtilization,
        startDate: p.start_date || '2025-04-01',
        expectedCompletionDate: p.expected_completion_date || '2026-03-31',
        delayDays,
        duplicateSimilarity: riskFactors.duplicateSimilarity,
        status: cleanStatus,
        riskScore,
        riskLevel,
        implementingAgency: p.implementing_authority || 'Zilla Parishad',
        nodalOfficer: 'Shri Yash Kamble (State Monitoring Cell)',
        contractorName: payments[0]?.vendor || 'M/s Infra Corp Ltd',
        constituency: p.constituency || `${p.district} Parliamentary Constituency`,
        riskFactors,
        aiFindings,
        payments,
        coordinates: coords,
        lastUpdated: p.updated_at || p.created_at || new Date().toISOString(),
      };
    });
  },

  /**
   * Updates physical progress and remarks for a project in Supabase
   */
  async updateProjectProgress(
    projectId: string,
    physicalProgress: number,
    expenditure: number,
    remarks?: string
  ): Promise<void> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId);
    let targetUuid = projectId;

    if (!isUuid) {
      const { data } = await supabase.from('projects').select('id').eq('project_id', projectId).limit(1);
      if (data && data[0]) targetUuid = data[0].id;
    }

    // 1. Update projects
    await supabase.from('projects').update({
      updated_at: new Date().toISOString(),
    }).eq('id', targetUuid);

    // 2. Upsert into project_progress table
    try {
      await supabase.from('project_progress').upsert({
        project_id: targetUuid,
        physical_progress: physicalProgress,
        remarks: remarks || 'Site milestone progress recorded by inspecting authority.',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'project_id' });
    } catch (e) {
      console.warn('Notice on project_progress update:', e);
    }
  }
};
