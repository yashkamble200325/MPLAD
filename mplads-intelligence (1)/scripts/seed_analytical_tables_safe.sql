-- ====================================================================
-- MPLADS INTELLIGENCE: Safe Analytical Tables Seed Migration
-- Target Database: Supabase PostgreSQL (Administrative Execution)
-- Target File: scripts/seed_analytical_tables_safe.sql
-- Records: 100 project_financials, 100 project_progress, 100 risk_scores, 20 duplicate_matches
--
-- SAFETY & IDEMPOTENCY GUARANTEES:
-- 1. NO DELETIONS: Existing tables and records are never deleted or truncated.
-- 2. STRICT IDEMPOTENCY: Re-executing this script will NOT create duplicate rows.
-- 3. SCHEMA RESPECT: Missing UNIQUE constraints on foreign key columns (project_id)
--    are identified; idempotency is achieved via "WHERE NOT EXISTS" without creating
--    unsolicited constraints on existing tables.
-- 4. FOREIGN KEY VALIDATION: Every project_id and matched_project_id is strictly
--    validated against existing projects.id rows via INNER JOINs.
-- 5. MINIMAL RLS: Row-Level Security remains enabled on all tables.
--    Only the minimal SELECT policy required for frontend viewing is ensured.
--    NO broad public/anonymous INSERT or UPDATE policies are created.
-- 6. UNTOUCHED TABLES: Core operational tables (projects, payments, risk_alerts,
--    investigations, investigation_notes, investigation_requests,
--    investigation_responses, users, system_settings) are NOT modified.
-- ====================================================================

-- STEP 1: Ensure Minimum Required RLS SELECT Policies for Public/Anonymous Read Access
-- (Note: Administrative execution via Supabase SQL Editor bypasses RLS for seeding.
--  Broad public INSERT / UPDATE policies are strictly forbidden and NOT created.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_financials' AND policyname = 'Allow public select project_financials') THEN
    CREATE POLICY "Allow public select project_financials" ON project_financials FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_progress' AND policyname = 'Allow public select project_progress') THEN
    CREATE POLICY "Allow public select project_progress" ON project_progress FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'risk_scores' AND policyname = 'Allow public select risk_scores') THEN
    CREATE POLICY "Allow public select risk_scores" ON risk_scores FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'duplicate_matches' AND policyname = 'Allow public select duplicate_matches') THEN
    CREATE POLICY "Allow public select duplicate_matches" ON duplicate_matches FOR SELECT USING (true);
  END IF;
END $$;

-- ====================================================================
-- STEP 2: Seed project_financials (100 rows)
-- Constraint note: project_financials has no unique constraint on project_id.
-- Idempotency: WHERE NOT EXISTS prevents duplicates if re-run.
-- Integrity: JOIN projects p ON p.id = v.project_id validates foreign key.
-- ====================================================================
INSERT INTO project_financials (project_id, sanctioned_amount, expenditure, financial_utilization)
SELECT
  v.project_id::uuid,
  v.sanctioned_amount::numeric,
  v.expenditure::numeric,
  v.financial_utilization::numeric
FROM (
  VALUES
    ('150a5976-66eb-412f-b285-123dccb08c76', 4500000, 2700000, 60),
    ('44823288-747d-4e4a-bbb5-42ffd26682fc', 4000000, 4400000, 110),
    ('4fa86265-6320-401c-98b9-3ca94c0124eb', 3500000, 2100000, 60),
    ('fffad9bc-44c5-4176-b0e2-f1891c31b015', 3000000, 1800000, 60),
    ('5175e5ba-1184-44e7-bbb4-fd920176ff2f', 2500000, 1500000, 60),
    ('a0fd8e17-d2ba-4ca2-ae7f-876bcd7b2af4', 2200000, 1320000, 60),
    ('94891f92-17ae-444b-9e1b-19a9f3cbdcf6', 2000000, 1200000, 60),
    ('0a37ecb1-655e-4062-8bc2-310beda20a56', 1800000, 1080000, 60),
    ('bd21a564-a1fb-43c2-b8eb-daa92a776f18', 1500000, 900000, 60),
    ('ce21588b-6132-426e-8ce7-190aae5564eb', 5000000, 5500000, 110),
    ('97d8effd-9983-4386-8924-b82865c07757', 4500000, 2700000, 60),
    ('0d060b31-df59-4043-9d94-3c10b8b65d68', 4000000, 2400000, 60),
    ('7c43e788-ab67-49ff-bd99-77e3f0a9fed7', 3500000, 2100000, 60),
    ('1b83937b-e33d-4a50-8012-c3efd1353fa5', 3000000, 3900000, 130),
    ('fb983b7e-e797-4a44-9755-685b87a84ebe', 2500000, 1500000, 60),
    ('458691f1-0282-422d-9f1e-70b2762f11c1', 2200000, 1320000, 60),
    ('ed89ee85-85ce-4142-95be-1dfccb346b18', 2000000, 1200000, 60),
    ('004eac50-a176-43d0-9aaa-b6084605ef4e', 1800000, 1980000, 110),
    ('8bba0940-1577-45ba-b02a-182313360a84', 1500000, 900000, 60),
    ('704a00b6-e5d7-4ce4-a56d-be43eb061774', 5000000, 3000000, 60),
    ('5978e3c4-0d33-4bad-93df-d466b4204c19', 4500000, 5850000, 130),
    ('24c96ec9-88f6-44d0-af27-afce9b6f365b', 4000000, 2400000, 60),
    ('3c03cb06-19c0-456c-804a-e8008a38b620', 3500000, 2100000, 60),
    ('c1781655-d9d3-4adc-beb0-ecc98c34643f', 3000000, 1800000, 60),
    ('90331a8a-dd01-4c51-817f-5a10aadffc80', 2500000, 2750000, 110),
    ('dff9e9a6-2c37-4ad8-9af6-71588eaf160e', 2200000, 1320000, 60),
    ('3c22858f-99aa-49f1-8bee-ac532f0a1f32', 2000000, 1200000, 60),
    ('0a54a714-a035-4900-bd8d-e09735d99fd4', 1800000, 1080000, 60),
    ('0821fd64-13bf-49d3-b104-1ba67b1e1126', 1500000, 900000, 60),
    ('6953421e-2887-4b10-b79a-95dfc4d74a47', 5000000, 3000000, 60),
    ('3646a95f-53b2-4b2d-b3b8-2cf68faac031', 4500000, 2700000, 60),
    ('24891057-5a34-417a-9a45-ec57263b3075', 4000000, 2400000, 60),
    ('3de2a786-e14e-40b8-9e0b-600dc74ddc5d', 3500000, 2100000, 60),
    ('40f770c0-cdc6-40f9-8cfa-d86df05c695d', 3000000, 1800000, 60),
    ('45af3e74-5d61-424e-8078-0dbb16661e8b', 2500000, 1500000, 60),
    ('bf55dfc5-1026-418d-bbb7-c6715cff084e', 2200000, 1320000, 60),
    ('9c525a55-8524-4d21-b27a-ad1bffc2fcf2', 2000000, 1200000, 60),
    ('6fb53f8e-bff7-44ca-a186-f24425fcf819', 1800000, 1080000, 60),
    ('fb9187c2-a459-40c5-8338-24cca880a3c8', 1500000, 900000, 60),
    ('5be30560-446c-467d-805c-459309afb1ce', 5000000, 5500000, 110),
    ('e7feaf17-bb2f-4287-b41e-aa4de242a3f5', 4500000, 2700000, 60),
    ('8258a483-2d12-46c8-a746-8dc08edfc489', 4000000, 2400000, 60),
    ('c3ffba76-fbce-4553-a27f-e5702a1c7892', 3500000, 2100000, 60),
    ('32cdf57a-0a13-45d7-a1ae-e9efba606333', 3000000, 3300000, 110),
    ('64827581-c31d-421c-9aa0-1eb96f6abaa7', 2500000, 1500000, 60),
    ('3d59346f-817b-4cef-ba98-dbfe97ecce0b', 2200000, 1320000, 60),
    ('d8aa5688-0a26-40c0-b8b3-8dae9a3a36cb', 2000000, 1200000, 60),
    ('8c516402-c465-4025-b75e-2654b467e1e1', 1800000, 2340000, 130),
    ('83ca0d7d-aa2e-49fe-89f1-b95909f9c7e2', 1500000, 900000, 60),
    ('27540fa9-09a1-424e-a164-e857efacabe4', 5000000, 3000000, 60),
    ('9294546a-3382-4bc9-a94d-038fd4ad009b', 4500000, 2700000, 60),
    ('2b0a8875-945a-4bbf-960c-fa7a94887b62', 4000000, 2400000, 60),
    ('084a2a8c-e2ab-45b1-a52f-64e729739a02', 3500000, 2100000, 60),
    ('cfb2aa68-bd18-4cda-a538-abdcb31980be', 3000000, 1800000, 60),
    ('b34fee3a-d536-40fa-bc29-7e4f5fc09da4', 2500000, 2750000, 110),
    ('7f3f08aa-24af-4e30-817f-62667cdae9b4', 2200000, 1320000, 60),
    ('acd1b221-0808-4293-93f5-cbe1d98ca045', 2000000, 1200000, 60),
    ('21460006-9785-49f9-9782-87df3887d55e', 1800000, 1080000, 60),
    ('50c72844-25df-42f0-9cda-5994bc20aed7', 1500000, 900000, 60),
    ('c76aa1a0-830b-4c87-b616-52a071671e55', 5000000, 3000000, 60),
    ('87066a28-13db-4fac-a6cb-31fd47a1c9f5', 4500000, 2700000, 60),
    ('4e7e64e5-8dce-4966-83a2-623f387b9284', 4000000, 2400000, 60),
    ('cc57ea86-c2a2-40d0-8c1f-2b72ee87e57a', 3500000, 4550000, 130),
    ('2ec0ef8e-68f6-4c09-b81a-ed3f4dff7eae', 3000000, 3900000, 130),
    ('e96da575-d989-47d0-838c-b72f17d3adae', 2500000, 1500000, 60),
    ('e884c1b7-8ed9-4567-a6d3-ae1246e5de9b', 2200000, 1320000, 60),
    ('6d117579-efac-480d-a5e2-453b1c23eddb', 2000000, 1200000, 60),
    ('71fd31e0-0faf-42a4-8164-6ba374764807', 1800000, 2340000, 130),
    ('ea35769e-a946-4e8a-bc48-c43651ea5c71', 1500000, 1650000, 110),
    ('eecfa6d4-6de9-4ab5-8d35-995a2e8c44c5', 5000000, 3000000, 60),
    ('e9f1ee0e-4bf1-49d5-977e-447b0b0f147c', 4500000, 5850000, 130),
    ('223da572-d0d5-4845-abaa-4ccbccb70eca', 4000000, 2400000, 60),
    ('fb52be3e-1e86-41a1-a842-0e292878129b', 3500000, 2100000, 60),
    ('c4099016-5a0e-47d2-b840-49133d11a4d8', 3000000, 1800000, 60),
    ('389dd8ac-c867-4070-a10c-e16f7b722cf8', 2500000, 1500000, 60),
    ('bb10a5a2-b3a8-436c-bc85-48feb067f649', 2200000, 1320000, 60),
    ('241db4c6-2645-4a6e-bcd8-7743beeea14b', 2000000, 1200000, 60),
    ('fffc557d-c32d-45ea-a12f-8129e7e0b52b', 1800000, 2340000, 130),
    ('4c057fe9-1dd0-4eb5-b034-2e7234edb833', 1500000, 900000, 60),
    ('67e8e779-097d-4a9e-a411-f3d8355b4150', 5000000, 3000000, 60),
    ('fcab6fd2-6c7a-4b54-a872-da6baa03d3db', 4500000, 2700000, 60),
    ('9f72a5e6-b625-4185-b0c7-972bf44abbce', 4000000, 2400000, 60),
    ('d961fc26-6b15-4700-8fdf-cc11b88d6a40', 3500000, 2100000, 60),
    ('d350dcdb-61e1-445f-9442-cce46dc3538b', 3000000, 1800000, 60),
    ('efd2499c-b35d-46fa-9e3f-2bad91b96188', 2500000, 1500000, 60),
    ('43b56b50-ec2c-41ce-bb42-1f19b52a51d7', 2200000, 2860000, 130),
    ('1f8a60d6-9033-4b45-b4e0-8a2ad66837cb', 2000000, 2200000, 110),
    ('45ba0128-6e4d-4101-bd10-63b7c5795efd', 1800000, 1080000, 60),
    ('7c9dcf7d-8a8c-442a-8982-d2a070038065', 1500000, 900000, 60),
    ('790d01d8-a77a-41c2-b897-58b79d29e781', 5000000, 3000000, 60),
    ('adcc0baa-1e55-4d25-8168-6f1c383dd2b5', 4500000, 5850000, 130),
    ('7513e87f-b26a-4712-a462-49212a11aa83', 4000000, 4400000, 110),
    ('41331759-81d2-49d2-b22c-2aba9824f90d', 3500000, 2100000, 60),
    ('a51b9784-449b-477a-a06f-b37e80a4ce65', 3000000, 1800000, 60),
    ('6ee6028e-e619-4dcf-aba3-97b3d8dbbfd2', 2500000, 1500000, 60),
    ('0c03e224-b961-427b-b4bb-b4aec5b6f9de', 2200000, 1320000, 60),
    ('b5796458-cf53-443d-93f4-4d440a00558d', 2000000, 1200000, 60),
    ('1723f6bd-71f0-467f-b7f7-09bed21600ad', 1800000, 1080000, 60),
    ('25766f51-8b46-4dc5-b8cf-e93afd37824d', 1500000, 900000, 60),
    ('6c37074f-fb44-4d3a-9f88-ee6cfcbc0556', 5000000, 3000000, 60)
) AS v(project_id, sanctioned_amount, expenditure, financial_utilization)
JOIN projects p ON p.id = v.project_id::uuid
WHERE NOT EXISTS (
  SELECT 1 FROM project_financials pf WHERE pf.project_id = v.project_id::uuid
);

-- ====================================================================
-- STEP 3: Seed project_progress (100 rows)
-- Constraint note: project_progress has no unique constraint on project_id.
-- Idempotency: WHERE NOT EXISTS prevents duplicates if re-run.
-- Integrity: JOIN projects p ON p.id = v.project_id validates foreign key.
-- ====================================================================
INSERT INTO project_progress (project_id, physical_progress, delay_days, remarks)
SELECT
  v.project_id::uuid,
  v.physical_progress::integer,
  v.delay_days::integer,
  v.remarks::text
FROM (
  VALUES
    ('150a5976-66eb-412f-b285-123dccb08c76', 45, 0, 'Execution progressing per division milestone plan.'),
    ('44823288-747d-4e4a-bbb5-42ffd26682fc', 95, 0, 'Execution progressing per division milestone plan.'),
    ('4fa86265-6320-401c-98b9-3ca94c0124eb', 100, 0, 'Execution progressing per division milestone plan.'),
    ('fffad9bc-44c5-4176-b0e2-f1891c31b015', 100, 0, 'Execution progressing per division milestone plan.'),
    ('5175e5ba-1184-44e7-bbb4-fd920176ff2f', 57, 0, 'Execution progressing per division milestone plan.'),
    ('a0fd8e17-d2ba-4ca2-ae7f-876bcd7b2af4', 57, 0, 'Execution progressing per division milestone plan.'),
    ('94891f92-17ae-444b-9e1b-19a9f3cbdcf6', 57, 0, 'Execution progressing per division milestone plan.'),
    ('0a37ecb1-655e-4062-8bc2-310beda20a56', 0, 0, 'Physical progress lagging behind fund disbursement milestones.'),
    ('bd21a564-a1fb-43c2-b8eb-daa92a776f18', 57, 0, 'Execution progressing per division milestone plan.'),
    ('ce21588b-6132-426e-8ce7-190aae5564eb', 80, 0, 'Physical progress lagging behind fund disbursement milestones.'),
    ('97d8effd-9983-4386-8924-b82865c07757', 57, 0, 'Execution progressing per division milestone plan.'),
    ('0d060b31-df59-4043-9d94-3c10b8b65d68', 45, 0, 'Execution progressing per division milestone plan.'),
    ('7c43e788-ab67-49ff-bd99-77e3f0a9fed7', 100, 0, 'Execution progressing per division milestone plan.'),
    ('1b83937b-e33d-4a50-8012-c3efd1353fa5', 100, 0, 'Physical progress lagging behind fund disbursement milestones.'),
    ('fb983b7e-e797-4a44-9755-685b87a84ebe', 57, 0, 'Execution progressing per division milestone plan.'),
    ('458691f1-0282-422d-9f1e-70b2762f11c1', 57, 0, 'Execution progressing per division milestone plan.'),
    ('ed89ee85-85ce-4142-95be-1dfccb346b18', 57, 0, 'Execution progressing per division milestone plan.'),
    ('004eac50-a176-43d0-9aaa-b6084605ef4e', 0, 0, 'Physical progress lagging behind fund disbursement milestones.'),
    ('8bba0940-1577-45ba-b02a-182313360a84', 57, 0, 'Execution progressing per division milestone plan.'),
    ('704a00b6-e5d7-4ce4-a56d-be43eb061774', 57, 0, 'Execution progressing per division milestone plan.'),
    ('5978e3c4-0d33-4bad-93df-d466b4204c19', 80, 0, 'Physical progress lagging behind fund disbursement milestones.'),
    ('24c96ec9-88f6-44d0-af27-afce9b6f365b', 45, 0, 'Execution progressing per division milestone plan.'),
    ('3c03cb06-19c0-456c-804a-e8008a38b620', 100, 0, 'Execution progressing per division milestone plan.'),
    ('c1781655-d9d3-4adc-beb0-ecc98c34643f', 100, 0, 'Execution progressing per division milestone plan.'),
    ('90331a8a-dd01-4c51-817f-5a10aadffc80', 95, 0, 'Execution progressing per division milestone plan.'),
    ('dff9e9a6-2c37-4ad8-9af6-71588eaf160e', 57, 0, 'Execution progressing per division milestone plan.'),
    ('3c22858f-99aa-49f1-8bee-ac532f0a1f32', 57, 0, 'Execution progressing per division milestone plan.'),
    ('0a54a714-a035-4900-bd8d-e09735d99fd4', 0, 0, 'Physical progress lagging behind fund disbursement milestones.'),
    ('0821fd64-13bf-49d3-b104-1ba67b1e1126', 57, 0, 'Execution progressing per division milestone plan.'),
    ('6953421e-2887-4b10-b79a-95dfc4d74a47', 57, 0, 'Execution progressing per division milestone plan.'),
    ('3646a95f-53b2-4b2d-b3b8-2cf68faac031', 57, 0, 'Execution progressing per division milestone plan.'),
    ('24891057-5a34-417a-9a45-ec57263b3075', 57, 0, 'Execution progressing per division milestone plan.'),
    ('3de2a786-e14e-40b8-9e0b-600dc74ddc5d', 100, 0, 'Execution progressing per division milestone plan.'),
    ('40f770c0-cdc6-40f9-8cfa-d86df05c695d', 100, 0, 'Execution progressing per division milestone plan.'),
    ('45af3e74-5d61-424e-8078-0dbb16661e8b', 57, 0, 'Execution progressing per division milestone plan.'),
    ('bf55dfc5-1026-418d-bbb7-c6715cff084e', 57, 0, 'Execution progressing per division milestone plan.'),
    ('9c525a55-8524-4d21-b27a-ad1bffc2fcf2', 57, 0, 'Execution progressing per division milestone plan.'),
    ('6fb53f8e-bff7-44ca-a186-f24425fcf819', 0, 0, 'Physical progress lagging behind fund disbursement milestones.'),
    ('fb9187c2-a459-40c5-8338-24cca880a3c8', 57, 0, 'Execution progressing per division milestone plan.'),
    ('5be30560-446c-467d-805c-459309afb1ce', 95, 0, 'Execution progressing per division milestone plan.'),
    ('e7feaf17-bb2f-4287-b41e-aa4de242a3f5', 57, 0, 'Execution progressing per division milestone plan.'),
    ('8258a483-2d12-46c8-a746-8dc08edfc489', 45, 0, 'Execution progressing per division milestone plan.'),
    ('c3ffba76-fbce-4553-a27f-e5702a1c7892', 100, 0, 'Execution progressing per division milestone plan.'),
    ('32cdf57a-0a13-45d7-a1ae-e9efba606333', 100, 0, 'Execution progressing per division milestone plan.'),
    ('64827581-c31d-421c-9aa0-1eb96f6abaa7', 45, 0, 'Execution progressing per division milestone plan.'),
    ('3d59346f-817b-4cef-ba98-dbfe97ecce0b', 57, 0, 'Execution progressing per division milestone plan.'),
    ('d8aa5688-0a26-40c0-b8b3-8dae9a3a36cb', 45, 0, 'Execution progressing per division milestone plan.'),
    ('8c516402-c465-4025-b75e-2654b467e1e1', 0, 0, 'Physical progress lagging behind fund disbursement milestones.'),
    ('83ca0d7d-aa2e-49fe-89f1-b95909f9c7e2', 57, 0, 'Execution progressing per division milestone plan.'),
    ('27540fa9-09a1-424e-a164-e857efacabe4', 45, 0, 'Execution progressing per division milestone plan.'),
    ('9294546a-3382-4bc9-a94d-038fd4ad009b', 57, 0, 'Execution progressing per division milestone plan.'),
    ('2b0a8875-945a-4bbf-960c-fa7a94887b62', 57, 0, 'Execution progressing per division milestone plan.'),
    ('084a2a8c-e2ab-45b1-a52f-64e729739a02', 100, 0, 'Execution progressing per division milestone plan.'),
    ('cfb2aa68-bd18-4cda-a538-abdcb31980be', 100, 0, 'Execution progressing per division milestone plan.'),
    ('b34fee3a-d536-40fa-bc29-7e4f5fc09da4', 95, 0, 'Execution progressing per division milestone plan.'),
    ('7f3f08aa-24af-4e30-817f-62667cdae9b4', 57, 0, 'Execution progressing per division milestone plan.'),
    ('acd1b221-0808-4293-93f5-cbe1d98ca045', 57, 0, 'Execution progressing per division milestone plan.'),
    ('21460006-9785-49f9-9782-87df3887d55e', 0, 0, 'Physical progress lagging behind fund disbursement milestones.'),
    ('50c72844-25df-42f0-9cda-5994bc20aed7', 57, 0, 'Execution progressing per division milestone plan.'),
    ('c76aa1a0-830b-4c87-b616-52a071671e55', 57, 0, 'Execution progressing per division milestone plan.'),
    ('87066a28-13db-4fac-a6cb-31fd47a1c9f5', 57, 0, 'Execution progressing per division milestone plan.'),
    ('4e7e64e5-8dce-4966-83a2-623f387b9284', 45, 0, 'Execution progressing per division milestone plan.'),
    ('cc57ea86-c2a2-40d0-8c1f-2b72ee87e57a', 100, 0, 'Physical progress lagging behind fund disbursement milestones.'),
    ('2ec0ef8e-68f6-4c09-b81a-ed3f4dff7eae', 100, 0, 'Physical progress lagging behind fund disbursement milestones.'),
    ('e96da575-d989-47d0-838c-b72f17d3adae', 57, 0, 'Execution progressing per division milestone plan.'),
    ('e884c1b7-8ed9-4567-a6d3-ae1246e5de9b', 57, 0, 'Execution progressing per division milestone plan.'),
    ('6d117579-efac-480d-a5e2-453b1c23eddb', 57, 0, 'Execution progressing per division milestone plan.'),
    ('71fd31e0-0faf-42a4-8164-6ba374764807', 0, 0, 'Physical progress lagging behind fund disbursement milestones.'),
    ('ea35769e-a946-4e8a-bc48-c43651ea5c71', 80, 0, 'Physical progress lagging behind fund disbursement milestones.'),
    ('eecfa6d4-6de9-4ab5-8d35-995a2e8c44c5', 57, 0, 'Execution progressing per division milestone plan.'),
    ('e9f1ee0e-4bf1-49d5-977e-447b0b0f147c', 80, 0, 'Physical progress lagging behind fund disbursement milestones.'),
    ('223da572-d0d5-4845-abaa-4ccbccb70eca', 57, 0, 'Execution progressing per division milestone plan.'),
    ('fb52be3e-1e86-41a1-a842-0e292878129b', 100, 0, 'Execution progressing per division milestone plan.'),
    ('c4099016-5a0e-47d2-b840-49133d11a4d8', 100, 0, 'Execution progressing per division milestone plan.'),
    ('389dd8ac-c867-4070-a10c-e16f7b722cf8', 57, 0, 'Execution progressing per division milestone plan.'),
    ('bb10a5a2-b3a8-436c-bc85-48feb067f649', 57, 0, 'Execution progressing per division milestone plan.'),
    ('241db4c6-2645-4a6e-bcd8-7743beeea14b', 45, 0, 'Execution progressing per division milestone plan.'),
    ('fffc557d-c32d-45ea-a12f-8129e7e0b52b', 0, 0, 'Physical progress lagging behind fund disbursement milestones.'),
    ('4c057fe9-1dd0-4eb5-b034-2e7234edb833', 57, 0, 'Execution progressing per division milestone plan.'),
    ('67e8e779-097d-4a9e-a411-f3d8355b4150', 57, 0, 'Execution progressing per division milestone plan.'),
    ('fcab6fd2-6c7a-4b54-a872-da6baa03d3db', 57, 0, 'Execution progressing per division milestone plan.'),
    ('9f72a5e6-b625-4185-b0c7-972bf44abbce', 57, 0, 'Execution progressing per division milestone plan.'),
    ('d961fc26-6b15-4700-8fdf-cc11b88d6a40', 100, 0, 'Execution progressing per division milestone plan.'),
    ('d350dcdb-61e1-445f-9442-cce46dc3538b', 100, 0, 'Execution progressing per division milestone plan.'),
    ('efd2499c-b35d-46fa-9e3f-2bad91b96188', 57, 0, 'Execution progressing per division milestone plan.'),
    ('43b56b50-ec2c-41ce-bb42-1f19b52a51d7', 80, 0, 'Physical progress lagging behind fund disbursement milestones.'),
    ('1f8a60d6-9033-4b45-b4e0-8a2ad66837cb', 95, 0, 'Execution progressing per division milestone plan.'),
    ('45ba0128-6e4d-4101-bd10-63b7c5795efd', 0, 0, 'Physical progress lagging behind fund disbursement milestones.'),
    ('7c9dcf7d-8a8c-442a-8982-d2a070038065', 45, 0, 'Execution progressing per division milestone plan.'),
    ('790d01d8-a77a-41c2-b897-58b79d29e781', 57, 0, 'Execution progressing per division milestone plan.'),
    ('adcc0baa-1e55-4d25-8168-6f1c383dd2b5', 80, 0, 'Physical progress lagging behind fund disbursement milestones.'),
    ('7513e87f-b26a-4712-a462-49212a11aa83', 95, 0, 'Execution progressing per division milestone plan.'),
    ('41331759-81d2-49d2-b22c-2aba9824f90d', 100, 0, 'Execution progressing per division milestone plan.'),
    ('a51b9784-449b-477a-a06f-b37e80a4ce65', 100, 0, 'Execution progressing per division milestone plan.'),
    ('6ee6028e-e619-4dcf-aba3-97b3d8dbbfd2', 57, 0, 'Execution progressing per division milestone plan.'),
    ('0c03e224-b961-427b-b4bb-b4aec5b6f9de', 45, 0, 'Execution progressing per division milestone plan.'),
    ('b5796458-cf53-443d-93f4-4d440a00558d', 45, 0, 'Execution progressing per division milestone plan.'),
    ('1723f6bd-71f0-467f-b7f7-09bed21600ad', 0, 0, 'Physical progress lagging behind fund disbursement milestones.'),
    ('25766f51-8b46-4dc5-b8cf-e93afd37824d', 57, 0, 'Execution progressing per division milestone plan.'),
    ('6c37074f-fb44-4d3a-9f88-ee6cfcbc0556', 57, 0, 'Execution progressing per division milestone plan.')
) AS v(project_id, physical_progress, delay_days, remarks)
JOIN projects p ON p.id = v.project_id::uuid
WHERE NOT EXISTS (
  SELECT 1 FROM project_progress pp WHERE pp.project_id = v.project_id::uuid
);

-- ====================================================================
-- STEP 4: Seed risk_scores (100 rows)
-- Constraint note: risk_scores has no unique constraint on project_id.
-- Idempotency: WHERE NOT EXISTS prevents duplicates if re-run.
-- Integrity: JOIN projects p ON p.id = v.project_id validates foreign key.
-- Methodology: Rule-Based Risk Engine, prototype-1.0
-- ====================================================================
INSERT INTO risk_scores (
  project_id,
  total_risk_score,
  progress_expenditure_score,
  model_name,
  model_version,
  prediction,
  top_risk_factors,
  recommendation,
  risk_level,
  cost_anomaly_score,
  payment_anomaly_score,
  delay_score,
  duplicate_similarity_score,
  input_timestamp
)
SELECT
  v.project_id::uuid,
  v.total_risk_score::numeric,
  v.progress_expenditure_score::numeric,
  v.model_name::text,
  v.model_version::text,
  v.prediction::text,
  to_jsonb(v.top_risk_factors),
  v.recommendation::text,
  v.risk_level::text,
  v.cost_anomaly_score::numeric,
  v.payment_anomaly_score::numeric,
  v.delay_score::numeric,
  v.duplicate_similarity_score::numeric,
  v.input_timestamp::timestamptz
FROM (
  VALUES
    ('150a5976-66eb-412f-b285-123dccb08c76', 20, 15, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Flagged multi-tranche payment velocity identified'], 'Potential Risk: Regular divisional milestone monitoring advised.', 'MEDIUM', 10, 65, 0, 10, '2026-09-06T15:19:16.831Z'),
    ('44823288-747d-4e4a-bbb5-42ffd26682fc', 13, 15, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 25, '2026-09-06T15:19:16.831Z'),
    ('4fa86265-6320-401c-98b9-3ca94c0124eb', 8, 0, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.831Z'),
    ('fffad9bc-44c5-4176-b0e2-f1891c31b015', 11, 0, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 25, '2026-09-06T15:19:16.831Z'),
    ('5175e5ba-1184-44e7-bbb4-fd920176ff2f', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.831Z'),
    ('a0fd8e17-d2ba-4ca2-ae7f-876bcd7b2af4', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.831Z'),
    ('94891f92-17ae-444b-9e1b-19a9f3cbdcf6', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.831Z'),
    ('0a37ecb1-655e-4062-8bc2-310beda20a56', 17, 60, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Financial disbursement substantially leads physical progress'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.831Z'),
    ('bd21a564-a1fb-43c2-b8eb-daa92a776f18', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.831Z'),
    ('ce21588b-6132-426e-8ce7-190aae5564eb', 25, 30, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Financial disbursement substantially leads physical progress', 'Flagged multi-tranche payment velocity identified'], 'Potential Risk: Regular divisional milestone monitoring advised.', 'MEDIUM', 10, 65, 0, 25, '2026-09-06T15:19:16.831Z'),
    ('97d8effd-9983-4386-8924-b82865c07757', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('0d060b31-df59-4043-9d94-3c10b8b65d68', 23, 15, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Flagged multi-tranche payment velocity identified'], 'Potential Risk: Regular divisional milestone monitoring advised.', 'MEDIUM', 10, 65, 0, 25, '2026-09-06T15:19:16.832Z'),
    ('7c43e788-ab67-49ff-bd99-77e3f0a9fed7', 8, 0, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('1b83937b-e33d-4a50-8012-c3efd1353fa5', 27, 30, 'Rule-Based Risk Engine', 'prototype-1.0', 'Requires Human Verification', ARRAY['Financial disbursement substantially leads physical progress', 'Flagged multi-tranche payment velocity identified'], 'Requires Human Verification: Immediate on-site technical inspection and audit inquiry recommended.', 'CRITICAL', 30, 65, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('fb983b7e-e797-4a44-9755-685b87a84ebe', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('458691f1-0282-422d-9f1e-70b2762f11c1', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('ed89ee85-85ce-4142-95be-1dfccb346b18', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('004eac50-a176-43d0-9aaa-b6084605ef4e', 26, 100, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Financial disbursement substantially leads physical progress'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 25, '2026-09-06T15:19:16.832Z'),
    ('8bba0940-1577-45ba-b02a-182313360a84', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('704a00b6-e5d7-4ce4-a56d-be43eb061774', 11, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 25, '2026-09-06T15:19:16.832Z'),
    ('5978e3c4-0d33-4bad-93df-d466b4204c19', 30, 50, 'Rule-Based Risk Engine', 'prototype-1.0', 'High-Risk Pattern Identified', ARRAY['Financial disbursement substantially leads physical progress', 'Flagged multi-tranche payment velocity identified'], 'High-Risk Pattern Identified: Formal clarification notice to be issued to implementing authority.', 'HIGH', 30, 65, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('24c96ec9-88f6-44d0-af27-afce9b6f365b', 20, 15, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Flagged multi-tranche payment velocity identified'], 'Potential Risk: Regular divisional milestone monitoring advised.', 'MEDIUM', 10, 65, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('3c03cb06-19c0-456c-804a-e8008a38b620', 8, 0, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('c1781655-d9d3-4adc-beb0-ecc98c34643f', 8, 0, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('90331a8a-dd01-4c51-817f-5a10aadffc80', 10, 15, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('dff9e9a6-2c37-4ad8-9af6-71588eaf160e', 11, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 25, '2026-09-06T15:19:16.832Z'),
    ('3c22858f-99aa-49f1-8bee-ac532f0a1f32', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('0a54a714-a035-4900-bd8d-e09735d99fd4', 20, 60, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Financial disbursement substantially leads physical progress'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 25, '2026-09-06T15:19:16.832Z'),
    ('0821fd64-13bf-49d3-b104-1ba67b1e1126', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('6953421e-2887-4b10-b79a-95dfc4d74a47', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('3646a95f-53b2-4b2d-b3b8-2cf68faac031', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('24891057-5a34-417a-9a45-ec57263b3075', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('3de2a786-e14e-40b8-9e0b-600dc74ddc5d', 8, 0, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('40f770c0-cdc6-40f9-8cfa-d86df05c695d', 11, 0, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 25, '2026-09-06T15:19:16.832Z'),
    ('45af3e74-5d61-424e-8078-0dbb16661e8b', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('bf55dfc5-1026-418d-bbb7-c6715cff084e', 11, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 25, '2026-09-06T15:19:16.832Z'),
    ('9c525a55-8524-4d21-b27a-ad1bffc2fcf2', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('6fb53f8e-bff7-44ca-a186-f24425fcf819', 17, 60, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Financial disbursement substantially leads physical progress'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('fb9187c2-a459-40c5-8338-24cca880a3c8', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('5be30560-446c-467d-805c-459309afb1ce', 10, 15, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('e7feaf17-bb2f-4287-b41e-aa4de242a3f5', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('8258a483-2d12-46c8-a746-8dc08edfc489', 23, 15, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Flagged multi-tranche payment velocity identified'], 'Potential Risk: Regular divisional milestone monitoring advised.', 'MEDIUM', 10, 65, 0, 25, '2026-09-06T15:19:16.832Z'),
    ('c3ffba76-fbce-4553-a27f-e5702a1c7892', 8, 0, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('32cdf57a-0a13-45d7-a1ae-e9efba606333', 22, 10, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Flagged multi-tranche payment velocity identified'], 'Potential Risk: Regular divisional milestone monitoring advised.', 'MEDIUM', 10, 65, 0, 25, '2026-09-06T15:19:16.832Z'),
    ('64827581-c31d-421c-9aa0-1eb96f6abaa7', 20, 15, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Flagged multi-tranche payment velocity identified'], 'Potential Risk: Regular divisional milestone monitoring advised.', 'MEDIUM', 10, 65, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('3d59346f-817b-4cef-ba98-dbfe97ecce0b', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('d8aa5688-0a26-40c0-b8b3-8dae9a3a36cb', 20, 15, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Flagged multi-tranche payment velocity identified'], 'Potential Risk: Regular divisional milestone monitoring advised.', 'MEDIUM', 10, 65, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('8c516402-c465-4025-b75e-2654b467e1e1', 38, 100, 'Rule-Based Risk Engine', 'prototype-1.0', 'High-Risk Pattern Identified', ARRAY['Financial disbursement substantially leads physical progress', 'Flagged multi-tranche payment velocity identified'], 'High-Risk Pattern Identified: Formal clarification notice to be issued to implementing authority.', 'HIGH', 30, 65, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('83ca0d7d-aa2e-49fe-89f1-b95909f9c7e2', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('27540fa9-09a1-424e-a164-e857efacabe4', 23, 15, 'Rule-Based Risk Engine', 'prototype-1.0', 'High-Risk Pattern Identified', ARRAY['Flagged multi-tranche payment velocity identified'], 'High-Risk Pattern Identified: Formal clarification notice to be issued to implementing authority.', 'HIGH', 10, 65, 0, 25, '2026-09-06T15:19:16.832Z'),
    ('9294546a-3382-4bc9-a94d-038fd4ad009b', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('2b0a8875-945a-4bbf-960c-fa7a94887b62', 11, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 25, '2026-09-06T15:19:16.832Z'),
    ('084a2a8c-e2ab-45b1-a52f-64e729739a02', 8, 0, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('cfb2aa68-bd18-4cda-a538-abdcb31980be', 8, 0, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('b34fee3a-d536-40fa-bc29-7e4f5fc09da4', 10, 15, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('7f3f08aa-24af-4e30-817f-62667cdae9b4', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('acd1b221-0808-4293-93f5-cbe1d98ca045', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('21460006-9785-49f9-9782-87df3887d55e', 30, 60, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Financial disbursement substantially leads physical progress', 'Flagged multi-tranche payment velocity identified'], 'Potential Risk: Regular divisional milestone monitoring advised.', 'MEDIUM', 10, 65, 0, 25, '2026-09-06T15:19:16.832Z'),
    ('50c72844-25df-42f0-9cda-5994bc20aed7', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('c76aa1a0-830b-4c87-b616-52a071671e55', 11, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 25, '2026-09-06T15:19:16.832Z'),
    ('87066a28-13db-4fac-a6cb-31fd47a1c9f5', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('4e7e64e5-8dce-4966-83a2-623f387b9284', 20, 15, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Flagged multi-tranche payment velocity identified'], 'Potential Risk: Regular divisional milestone monitoring advised.', 'MEDIUM', 10, 65, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('cc57ea86-c2a2-40d0-8c1f-2b72ee87e57a', 27, 30, 'Rule-Based Risk Engine', 'prototype-1.0', 'High-Risk Pattern Identified', ARRAY['Financial disbursement substantially leads physical progress', 'Flagged multi-tranche payment velocity identified'], 'High-Risk Pattern Identified: Formal clarification notice to be issued to implementing authority.', 'HIGH', 30, 65, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('2ec0ef8e-68f6-4c09-b81a-ed3f4dff7eae', 27, 30, 'Rule-Based Risk Engine', 'prototype-1.0', 'Requires Human Verification', ARRAY['Financial disbursement substantially leads physical progress', 'Flagged multi-tranche payment velocity identified'], 'Requires Human Verification: Immediate on-site technical inspection and audit inquiry recommended.', 'CRITICAL', 30, 65, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('e96da575-d989-47d0-838c-b72f17d3adae', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('e884c1b7-8ed9-4567-a6d3-ae1246e5de9b', 11, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 25, '2026-09-06T15:19:16.832Z'),
    ('6d117579-efac-480d-a5e2-453b1c23eddb', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('71fd31e0-0faf-42a4-8164-6ba374764807', 41, 100, 'Rule-Based Risk Engine', 'prototype-1.0', 'High-Risk Pattern Identified', ARRAY['Financial disbursement substantially leads physical progress', 'Flagged multi-tranche payment velocity identified'], 'High-Risk Pattern Identified: Formal clarification notice to be issued to implementing authority.', 'HIGH', 30, 65, 0, 25, '2026-09-06T15:19:16.832Z'),
    ('ea35769e-a946-4e8a-bc48-c43651ea5c71', 22, 30, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Financial disbursement substantially leads physical progress', 'Flagged multi-tranche payment velocity identified'], 'Potential Risk: Regular divisional milestone monitoring advised.', 'MEDIUM', 10, 65, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('eecfa6d4-6de9-4ab5-8d35-995a2e8c44c5', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('e9f1ee0e-4bf1-49d5-977e-447b0b0f147c', 30, 50, 'Rule-Based Risk Engine', 'prototype-1.0', 'High-Risk Pattern Identified', ARRAY['Financial disbursement substantially leads physical progress', 'Flagged multi-tranche payment velocity identified'], 'High-Risk Pattern Identified: Formal clarification notice to be issued to implementing authority.', 'HIGH', 30, 65, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('223da572-d0d5-4845-abaa-4ccbccb70eca', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('fb52be3e-1e86-41a1-a842-0e292878129b', 8, 0, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('c4099016-5a0e-47d2-b840-49133d11a4d8', 11, 0, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 25, '2026-09-06T15:19:16.832Z'),
    ('389dd8ac-c867-4070-a10c-e16f7b722cf8', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('bb10a5a2-b3a8-436c-bc85-48feb067f649', 11, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 25, '2026-09-06T15:19:16.832Z'),
    ('241db4c6-2645-4a6e-bcd8-7743beeea14b', 20, 15, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Flagged multi-tranche payment velocity identified'], 'Potential Risk: Regular divisional milestone monitoring advised.', 'MEDIUM', 10, 65, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('fffc557d-c32d-45ea-a12f-8129e7e0b52b', 38, 100, 'Rule-Based Risk Engine', 'prototype-1.0', 'High-Risk Pattern Identified', ARRAY['Financial disbursement substantially leads physical progress', 'Flagged multi-tranche payment velocity identified'], 'High-Risk Pattern Identified: Formal clarification notice to be issued to implementing authority.', 'HIGH', 30, 65, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('4c057fe9-1dd0-4eb5-b034-2e7234edb833', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('67e8e779-097d-4a9e-a411-f3d8355b4150', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('fcab6fd2-6c7a-4b54-a872-da6baa03d3db', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('9f72a5e6-b625-4185-b0c7-972bf44abbce', 11, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 25, '2026-09-06T15:19:16.832Z'),
    ('d961fc26-6b15-4700-8fdf-cc11b88d6a40', 8, 0, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('d350dcdb-61e1-445f-9442-cce46dc3538b', 11, 0, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 25, '2026-09-06T15:19:16.832Z'),
    ('efd2499c-b35d-46fa-9e3f-2bad91b96188', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('43b56b50-ec2c-41ce-bb42-1f19b52a51d7', 30, 50, 'Rule-Based Risk Engine', 'prototype-1.0', 'High-Risk Pattern Identified', ARRAY['Financial disbursement substantially leads physical progress', 'Flagged multi-tranche payment velocity identified'], 'High-Risk Pattern Identified: Formal clarification notice to be issued to implementing authority.', 'HIGH', 30, 65, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('1f8a60d6-9033-4b45-b4e0-8a2ad66837cb', 10, 15, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('45ba0128-6e4d-4101-bd10-63b7c5795efd', 17, 60, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Financial disbursement substantially leads physical progress'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('7c9dcf7d-8a8c-442a-8982-d2a070038065', 20, 15, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Flagged multi-tranche payment velocity identified'], 'Potential Risk: Regular divisional milestone monitoring advised.', 'MEDIUM', 10, 65, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('790d01d8-a77a-41c2-b897-58b79d29e781', 11, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 25, '2026-09-06T15:19:16.832Z'),
    ('adcc0baa-1e55-4d25-8168-6f1c383dd2b5', 30, 50, 'Rule-Based Risk Engine', 'prototype-1.0', 'High-Risk Pattern Identified', ARRAY['Financial disbursement substantially leads physical progress', 'Flagged multi-tranche payment velocity identified'], 'High-Risk Pattern Identified: Formal clarification notice to be issued to implementing authority.', 'HIGH', 30, 65, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('7513e87f-b26a-4712-a462-49212a11aa83', 13, 15, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 25, '2026-09-06T15:19:16.832Z'),
    ('41331759-81d2-49d2-b22c-2aba9824f90d', 8, 0, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('a51b9784-449b-477a-a06f-b37e80a4ce65', 8, 0, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('6ee6028e-e619-4dcf-aba3-97b3d8dbbfd2', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('0c03e224-b961-427b-b4bb-b4aec5b6f9de', 20, 15, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Flagged multi-tranche payment velocity identified'], 'Potential Risk: Regular divisional milestone monitoring advised.', 'MEDIUM', 10, 65, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('b5796458-cf53-443d-93f4-4d440a00558d', 20, 15, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Flagged multi-tranche payment velocity identified'], 'Potential Risk: Regular divisional milestone monitoring advised.', 'MEDIUM', 10, 65, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('1723f6bd-71f0-467f-b7f7-09bed21600ad', 30, 60, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Financial disbursement substantially leads physical progress', 'Flagged multi-tranche payment velocity identified'], 'Potential Risk: Regular divisional milestone monitoring advised.', 'MEDIUM', 10, 65, 0, 25, '2026-09-06T15:19:16.832Z'),
    ('25766f51-8b46-4dc5-b8cf-e93afd37824d', 8, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 10, '2026-09-06T15:19:16.832Z'),
    ('6c37074f-fb44-4d3a-9f88-ee6cfcbc0556', 11, 3, 'Rule-Based Risk Engine', 'prototype-1.0', 'Potential Risk', ARRAY['Routine execution parameters within tolerance'], 'Low Risk: Normal statutory audit clearance.', 'LOW', 10, 15, 0, 25, '2026-09-06T15:19:16.832Z')
) AS v(
  project_id,
  total_risk_score,
  progress_expenditure_score,
  model_name,
  model_version,
  prediction,
  top_risk_factors,
  recommendation,
  risk_level,
  cost_anomaly_score,
  payment_anomaly_score,
  delay_score,
  duplicate_similarity_score,
  input_timestamp
)
JOIN projects p ON p.id = v.project_id::uuid
WHERE NOT EXISTS (
  SELECT 1 FROM risk_scores rs WHERE rs.project_id = v.project_id::uuid
);

-- ====================================================================
-- STEP 5: Seed duplicate_matches (20 rows)
-- Constraint note: duplicate_matches has no unique constraint on (project_id, matched_project_id).
-- Idempotency: WHERE NOT EXISTS prevents duplicates if re-run.
-- Integrity: JOIN projects on both project_id and matched_project_id validates relationships.
-- ====================================================================
INSERT INTO duplicate_matches (project_id, matched_project_id, similarity_score, status)
SELECT
  v.project_id::uuid,
  v.matched_project_id::uuid,
  v.similarity_score::numeric,
  v.status::text
FROM (
  VALUES
    ('150a5976-66eb-412f-b285-123dccb08c76', '44823288-747d-4e4a-bbb5-42ffd26682fc', 75, 'Potential Similarity'),
    ('44823288-747d-4e4a-bbb5-42ffd26682fc', '4fa86265-6320-401c-98b9-3ca94c0124eb', 76, 'Potential Similarity'),
    ('4fa86265-6320-401c-98b9-3ca94c0124eb', 'fffad9bc-44c5-4176-b0e2-f1891c31b015', 77, 'Potential Similarity'),
    ('fffad9bc-44c5-4176-b0e2-f1891c31b015', '5175e5ba-1184-44e7-bbb4-fd920176ff2f', 78, 'Potential Similarity'),
    ('5175e5ba-1184-44e7-bbb4-fd920176ff2f', 'a0fd8e17-d2ba-4ca2-ae7f-876bcd7b2af4', 79, 'Potential Similarity'),
    ('a0fd8e17-d2ba-4ca2-ae7f-876bcd7b2af4', '94891f92-17ae-444b-9e1b-19a9f3cbdcf6', 80, 'Potential Similarity'),
    ('94891f92-17ae-444b-9e1b-19a9f3cbdcf6', '0a37ecb1-655e-4062-8bc2-310beda20a56', 81, 'Potential Similarity'),
    ('0a37ecb1-655e-4062-8bc2-310beda20a56', 'bd21a564-a1fb-43c2-b8eb-daa92a776f18', 82, 'Potential Similarity'),
    ('bd21a564-a1fb-43c2-b8eb-daa92a776f18', 'ce21588b-6132-426e-8ce7-190aae5564eb', 83, 'Potential Similarity'),
    ('ce21588b-6132-426e-8ce7-190aae5564eb', '97d8effd-9983-4386-8924-b82865c07757', 84, 'Potential Similarity'),
    ('97d8effd-9983-4386-8924-b82865c07757', '0d060b31-df59-4043-9d94-3c10b8b65d68', 85, 'Potential Similarity'),
    ('0d060b31-df59-4043-9d94-3c10b8b65d68', '7c43e788-ab67-49ff-bd99-77e3f0a9fed7', 86, 'Potential Similarity'),
    ('7c43e788-ab67-49ff-bd99-77e3f0a9fed7', '1b83937b-e33d-4a50-8012-c3efd1353fa5', 87, 'Potential Similarity'),
    ('1b83937b-e33d-4a50-8012-c3efd1353fa5', 'fb983b7e-e797-4a44-9755-685b87a84ebe', 88, 'Potential Similarity'),
    ('fb983b7e-e797-4a44-9755-685b87a84ebe', '458691f1-0282-422d-9f1e-70b2762f11c1', 89, 'Potential Similarity'),
    ('458691f1-0282-422d-9f1e-70b2762f11c1', 'ed89ee85-85ce-4142-95be-1dfccb346b18', 90, 'Potential Similarity'),
    ('ed89ee85-85ce-4142-95be-1dfccb346b18', '004eac50-a176-43d0-9aaa-b6084605ef4e', 91, 'Potential Similarity'),
    ('004eac50-a176-43d0-9aaa-b6084605ef4e', '8bba0940-1577-45ba-b02a-182313360a84', 92, 'Potential Similarity'),
    ('8bba0940-1577-45ba-b02a-182313360a84', '704a00b6-e5d7-4ce4-a56d-be43eb061774', 93, 'Potential Similarity'),
    ('704a00b6-e5d7-4ce4-a56d-be43eb061774', '5978e3c4-0d33-4bad-93df-d466b4204c19', 94, 'Potential Similarity')
) AS v(project_id, matched_project_id, similarity_score, status)
JOIN projects p1 ON p1.id = v.project_id::uuid
JOIN projects p2 ON p2.id = v.matched_project_id::uuid
WHERE NOT EXISTS (
  SELECT 1 FROM duplicate_matches dm
  WHERE dm.project_id = v.project_id::uuid
    AND dm.matched_project_id = v.matched_project_id::uuid
);

-- ====================================================================
-- STEP 6: VERIFICATION QUERIES (Requirements 12, 13, 14)
-- ====================================================================

-- Query 1: Detailed Table Counts and Target Validation (Requirement 12)
SELECT
  'projects' AS table_name, count(*) AS actual_count, 100 AS expected_count, (count(*) = 100) AS is_valid FROM projects
UNION ALL
SELECT 'project_financials', count(*), 100, (count(*) = 100) FROM project_financials
UNION ALL
SELECT 'project_progress', count(*), 100, (count(*) = 100) FROM project_progress
UNION ALL
SELECT 'risk_scores', count(*), 100, (count(*) = 100) FROM risk_scores
UNION ALL
SELECT 'payments', count(*), 300, (count(*) = 300) FROM payments
UNION ALL
SELECT 'duplicate_matches', count(*), 20, (count(*) = 20) FROM duplicate_matches
UNION ALL
SELECT 'risk_alerts', count(*), 27, (count(*) = 27) FROM risk_alerts
UNION ALL
SELECT 'investigations', count(*), 11, (count(*) = 11) FROM investigations
UNION ALL
SELECT 'investigation_requests', count(*), 11, (count(*) = 11) FROM investigation_requests
UNION ALL
SELECT 'investigation_responses', count(*), 11, (count(*) = 11) FROM investigation_responses
UNION ALL
SELECT 'users', count(*), 4, (count(*) = 4) FROM users
UNION ALL
SELECT 'system_settings', count(*), 3, (count(*) = 3) FROM system_settings;

-- Query 2: Horizontal Count Summary (Requirement 12)
SELECT
  (SELECT count(*) FROM projects) AS count_projects,                               -- Expected: 100
  (SELECT count(*) FROM project_financials) AS count_project_financials,           -- Expected: 100
  (SELECT count(*) FROM project_progress) AS count_project_progress,               -- Expected: 100
  (SELECT count(*) FROM risk_scores) AS count_risk_scores,                         -- Expected: 100
  (SELECT count(*) FROM payments) AS count_payments,                               -- Expected: 300
  (SELECT count(*) FROM duplicate_matches) AS count_duplicate_matches,             -- Expected: 20
  (SELECT count(*) FROM risk_alerts) AS count_risk_alerts,                         -- Expected: 27
  (SELECT count(*) FROM investigations) AS count_investigations,                   -- Expected: 11
  (SELECT count(*) FROM investigation_requests) AS count_investigation_requests,   -- Expected: 11
  (SELECT count(*) FROM investigation_responses) AS count_investigation_responses, -- Expected: 11
  (SELECT count(*) FROM users) AS count_users,                                     -- Expected: 4
  (SELECT count(*) FROM system_settings) AS count_system_settings;                 -- Expected: 3

-- Query 3: Orphan Dependency Checks (Requirement 13) - All Expected to be 0
SELECT
  (SELECT count(*) FROM project_financials pf LEFT JOIN projects p ON pf.project_id = p.id WHERE p.id IS NULL) AS orphan_project_financials,
  (SELECT count(*) FROM project_progress pp LEFT JOIN projects p ON pp.project_id = p.id WHERE p.id IS NULL) AS orphan_project_progress,
  (SELECT count(*) FROM risk_scores rs LEFT JOIN projects p ON rs.project_id = p.id WHERE p.id IS NULL) AS orphan_risk_scores,
  (SELECT count(*) FROM duplicate_matches dm LEFT JOIN projects p ON dm.project_id = p.id WHERE p.id IS NULL) AS orphan_duplicate_matches_source,
  (SELECT count(*) FROM duplicate_matches dm LEFT JOIN projects p ON dm.matched_project_id = p.id WHERE p.id IS NULL) AS orphan_duplicate_matches_target;

-- Query 4: Project-to-Analytical 1:1 Cardinality Check (Requirement 14)
SELECT
  count(*) AS total_projects,                                                      -- Expected: 100
  count(*) FILTER (WHERE financials_count = 1) AS projects_with_1_financials,     -- Expected: 100
  count(*) FILTER (WHERE progress_count = 1) AS projects_with_1_progress,         -- Expected: 100
  count(*) FILTER (WHERE risk_count = 1) AS projects_with_1_risk_score,           -- Expected: 100
  count(*) FILTER (WHERE financials_count != 1 OR progress_count != 1 OR risk_count != 1) AS projects_with_cardinality_mismatch -- Expected: 0
FROM (
  SELECT
    p.id,
    (SELECT count(*) FROM project_financials pf WHERE pf.project_id = p.id) AS financials_count,
    (SELECT count(*) FROM project_progress pp WHERE pp.project_id = p.id) AS progress_count,
    (SELECT count(*) FROM risk_scores rs WHERE rs.project_id = p.id) AS risk_count
  FROM projects p
) sub;
