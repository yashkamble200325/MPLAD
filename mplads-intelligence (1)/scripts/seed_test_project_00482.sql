-- ====================================================================
-- IDEMPOTENT SQL SEED FOR TEST PROJECT: MPLADS-MH-PUN-2026-00482
-- Project: Construction of Community Health Centre
-- District: Pune
-- All related rows in analytical and transactional tables included.
-- Run in Supabase SQL Editor.
-- ====================================================================

DO $$
DECLARE
    v_project_uuid UUID := 'c0000000-0000-4000-8000-000000000482'::UUID;
    v_matched_uuid UUID := 'c0000000-0000-4000-8000-000000000109'::UUID;
    v_inv_uuid UUID := 'd0000000-0000-4000-8000-000000000482'::UUID;
BEGIN
    -- 1. Insert or update the parallel matching project if not exists
    INSERT INTO public.projects (
        id, project_id, project_name, district, state, constituency, category,
        sanctioned_amount, estimated_cost, implementing_authority, status,
        start_date, expected_completion_date, latitude, longitude
    ) VALUES (
        v_matched_uuid,
        'MPLADS-MH-PUN-2025-00109',
        'Zilla Parishad Primary Health Sub-Centre Haveli',
        'Pune',
        'Maharashtra',
        'Pune Parliamentary Constituency',
        'Healthcare',
        2000000, -- 20 Lakhs
        2000000,
        'Zilla Parishad Pune',
        'In Progress',
        '2024-11-01',
        '2025-10-31',
        18.5204,
        73.8567
    ) ON CONFLICT (id) DO UPDATE SET
        project_name = EXCLUDED.project_name;

    -- 2. Insert or update the primary test project
    INSERT INTO public.projects (
        id, project_id, project_name, district, state, constituency, category,
        sanctioned_amount, estimated_cost, implementing_authority, status,
        start_date, expected_completion_date, latitude, longitude
    ) VALUES (
        v_project_uuid,
        'MPLADS-MH-PUN-2026-00482',
        'Construction of Community Health Centre',
        'Pune',
        'Maharashtra',
        'Pune Parliamentary Constituency',
        'Healthcare',
        2200000, -- ₹22,00,000 (22 Lakhs)
        2200000,
        'Public Works Division (PWD) Haveli Sub-Division',
        'Under Investigation',
        '2025-02-10',
        '2025-10-15',
        18.5204,
        73.8567
    ) ON CONFLICT (id) DO UPDATE SET
        project_name = EXCLUDED.project_name,
        sanctioned_amount = EXCLUDED.sanctioned_amount,
        status = EXCLUDED.status;

    -- 3. Project Financials: ₹47,50,000 actual expenditure, 92% financial utilization
    INSERT INTO public.project_financials (
        project_id, sanctioned_amount, released_amount, expenditure_incurred,
        unspent_balance, utilization_pct, last_expenditure_date, audit_cleared
    ) VALUES (
        v_project_uuid,
        2200000,
        2200000,
        4750000, -- ₹47,50,000 (47.5 Lakhs)
        0,
        92.00,   -- 92% Financial Utilization
        '2026-02-15',
        false
    ) ON CONFLICT (project_id) DO UPDATE SET
        expenditure_incurred = EXCLUDED.expenditure_incurred,
        utilization_pct = EXCLUDED.utilization_pct;

    -- 4. Project Progress: 61% Physical Progress, 127 Days Delay
    INSERT INTO public.project_progress (
        project_id, physical_progress_pct, stage, delay_days, inspection_count,
        geo_tagged, contractor_name, remarks
    ) VALUES (
        v_project_uuid,
        61.00, -- 61% Physical Progress
        'Structural Superstructure',
        127,   -- 127 days delay
        3,
        true,
        'M/s Sahyadri Buildcon Infra Pvt Ltd',
        'Work slowed pending structural sanction reconciliation. Structural framing complete; interior services stalled.'
    ) ON CONFLICT (project_id) DO UPDATE SET
        physical_progress_pct = EXCLUDED.physical_progress_pct,
        delay_days = EXCLUDED.delay_days;

    -- 5. Risk Scores: 94/100, CRITICAL, top_risk_factors JSONB
    INSERT INTO public.risk_scores (
        project_id, total_risk_score, risk_level, cost_anomaly_score,
        payment_anomaly_score, delay_score, duplicate_similarity_score,
        progress_expenditure_score, model_name, model_version, recommendation,
        top_risk_factors
    ) VALUES (
        v_project_uuid,
        94.00, -- 94/100
        'CRITICAL',
        98.00, -- Cost Anomaly Score
        88.00, -- Payment Anomaly Score
        92.00, -- Delay Score
        89.00, -- Duplicate Similarity Score (89%)
        95.00, -- Progress vs Expenditure Mismatch Score
        'Rule-Based Risk Engine',
        'prototype-1.0',
        'Immediate on-site technical inspection, bill freeze, and forensic audit of structural bills recommended.',
        '["Cost deviation: Booked expenditure of ₹47.50L exceeds sanction of ₹22.00L by 116%", "Progress-expenditure divergence: 92% financial utilization vs 61% physical execution", "Milestone delay of 127 days past expected handover", "High semantic & geospatial similarity (89%) with ZP Health Sub-Centre Haveli", "Multiple rounded advance disbursements without verified milestone M-Book entries"]'::JSONB
    ) ON CONFLICT (project_id) DO UPDATE SET
        total_risk_score = EXCLUDED.total_risk_score,
        risk_level = EXCLUDED.risk_level,
        top_risk_factors = EXCLUDED.top_risk_factors;

    -- 6. Duplicate Match: 89% similarity with parallel work
    DELETE FROM public.duplicate_matches WHERE project_id = v_project_uuid;
    INSERT INTO public.duplicate_matches (
        id, project_id, matched_project_id, similarity_score,
        status, match_reasons, location_distance_meters
    ) VALUES (
        gen_random_uuid(),
        v_project_uuid,
        v_matched_uuid,
        89.00,
        'Pending Review',
        'Overlapping Bill of Quantities (BoQ) item descriptions and identical site coordinates within 450 meters.',
        450
    );

    -- 7. Risk Alerts: Critical Alert
    INSERT INTO public.risk_alerts (
        project_id, alert_type, severity, score, description, status
    ) VALUES (
        v_project_uuid,
        'Critical Risk Threshold Exceeded',
        'Critical',
        94,
        'Project composite risk score reached 94/100. Disproportionate expenditure drawdown (₹47.50L vs ₹22.00L sanctioned) with 127 days delay and 89% cross-scheme duplicate similarity.',
        'Active'
    );

    -- 8. Investigation Docket
    DELETE FROM public.investigations WHERE project_id = v_project_uuid;
    INSERT INTO public.investigations (
        id, project_id, title, priority, status, assigned_to, reason
    ) VALUES (
        v_inv_uuid,
        v_project_uuid,
        'Inquiry into Cost Escalation & Parallel Scope in CHC Haveli',
        'CRITICAL',
        'Under Investigation',
        'Dr. Vivek Deshmukh (Statutory Auditor)',
        'Composite risk score 94. Expenditure exceeds sanction by 116% and 89% potential duplicate similarity with ZP Health Scheme.'
    );

    -- 9. Sample Payments (Total ₹47,50,000 across 3 disbursements)
    DELETE FROM public.payments WHERE project_id = v_project_uuid;
    INSERT INTO public.payments (
        project_id, payment_date, amount, recipient, description,
        payment_status, is_flagged, transaction_reference
    ) VALUES
    (
        v_project_uuid,
        '2025-04-10',
        1500000, -- ₹15,00,000
        'M/s Sahyadri Buildcon Infra Pvt Ltd',
        'Mobilization advance and initial foundation excavation',
        'Approved',
        false,
        'TXN-MH-PUN-00482-01'
    ),
    (
        v_project_uuid,
        '2025-08-20',
        1750000, -- ₹17,50,000
        'M/s Sahyadri Buildcon Infra Pvt Ltd',
        'RCC column cast and plinth level completion',
        'Approved',
        false,
        'TXN-MH-PUN-00482-02'
    ),
    (
        v_project_uuid,
        '2026-01-14',
        1500000, -- ₹15,00,000
        'M/s Sahyadri Buildcon Infra Pvt Ltd',
        'Superstructure slab concrete pouring advance bill',
        'Flagged',
        true,
        'TXN-MH-PUN-00482-03'
    );

END $$;
