import { supabase } from '../lib/supabase';
import { AlertItem, RiskLevel, MaharashtraDistrict } from '../types';

export interface DbAlertRow {
  id: string;
  project_id: string;
  alert_type: string;
  severity: string;
  score: number;
  description: string;
  status: string;
  created_at: string;
}

export const alertService = {
  /**
   * Fetches all alerts from Supabase, joined with project name and district
   */
  async fetchAlerts(): Promise<AlertItem[]> {
    const { data: alertsData, error: alertErr } = await supabase
      .from('risk_alerts')
      .select(`
        *,
        projects (
          id,
          project_id,
          project_name,
          district
        )
      `)
      .order('created_at', { ascending: false });

    if (alertErr) {
      console.error('Error fetching alerts from Supabase:', alertErr);
      throw alertErr;
    }

    if (!alertsData) return [];

    return alertsData.map((row: any) => {
      const proj = row.projects;
      const sev = (row.severity || 'Medium').toUpperCase();
      let severity: RiskLevel = 'MEDIUM';
      if (sev.includes('CRIT') || row.score >= 80) severity = 'CRITICAL';
      else if (sev.includes('HIGH') || row.score >= 60) severity = 'HIGH';
      else if (sev.includes('MED') || row.score >= 40) severity = 'MEDIUM';
      else severity = 'LOW';

      let status: 'New' | 'Acknowledged' | 'Under Investigation' | 'Resolved' = 'New';
      if (row.status === 'Acknowledged') status = 'Acknowledged';
      else if (row.status === 'Resolved') status = 'Resolved';
      else if (row.status === 'Under Investigation') status = 'Under Investigation';
      else status = 'New';

      return {
        id: row.id,
        projectId: proj?.project_id || row.project_id,
        projectName: proj?.project_name || 'Infrastructure Public Works',
        district: (proj?.district as MaharashtraDistrict) || 'Pune',
        riskType: row.alert_type || 'Risk Anomaly Detected',
        severity,
        detectedDate: row.created_at ? row.created_at.split('T')[0] : '2026-02-15',
        riskScore: Math.round(row.score || 75),
        status,
        assignedOfficer: 'Shri Yash Kamble (Monitoring Officer)',
        description: row.description || 'Surveillance system flagged anomalous variance in expenditure and milestone velocity.',
      };
    });
  },

  /**
   * Updates an alert status in Supabase
   */
  async updateAlertStatus(alertId: string, status: 'Acknowledged' | 'Resolved' | 'Open'): Promise<void> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(alertId);
    if (isUuid) {
      await supabase.from('risk_alerts').update({ status }).eq('id', alertId);
    } else {
      const { data } = await supabase.from('risk_alerts').select('id').limit(100);
      const matched = data?.find(d => alertId.includes(d.id.substring(0, 8).toUpperCase()));
      if (matched) {
        await supabase.from('risk_alerts').update({ status }).eq('id', matched.id);
      }
    }
  }
};
