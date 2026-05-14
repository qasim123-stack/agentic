-- ─── Staff ───────────────────────────────────────────────────────────────────
truncate table staff restart identity cascade;
insert into staff (name, role, training, access, risk, last_access) values
  ('Dr. Sarah Chen',    'Attending Physician',  'Overdue 14d', 'Active',         'amber', 'Today, 09:14'),
  ('James Ortega',      'Nurse Practitioner',   'Current',     'Active',         'green', 'Today, 11:02'),
  ('Linda Park',        'Medical Records',      'Overdue 32d', 'Active',         'red',   'Yesterday'),
  ('Tom Reyes',         'IT Administrator',     'Current',     'Active',         'green', 'Today, 08:45'),
  ('Maria Santos',      'Billing Coordinator',  'Overdue 7d',  'Active',         'amber', '3 days ago'),
  ('Eric Drummond',     'Radiologist',          'Current',     'Terminated ⚠️',  'red',   '2 days ago');

-- ─── Systems ─────────────────────────────────────────────────────────────────
truncate table systems restart identity cascade;
insert into systems (name, type, mfa, encrypted, baa, last_audit, risk, issue) values
  ('Epic EHR',          'EHR Platform',     true,  true,  true,  '12 days ago', 'green', null),
  ('ChatGPT (OpenAI)',  'AI Tool',           false, false, false, 'Never',       'red',   'Staff using with patient notes — no BAA exists. Instant HIPAA violation.'),
  ('Microsoft Copilot', 'AI Tool',           true,  true,  false, 'Never',       'red',   'BAA not confirmed. PHI may be processed outside HIPAA scope.'),
  ('AWS S3 (Patient)',  'Cloud Storage',     true,  true,  true,  '31 days ago', 'green', null),
  ('Staff Laptops',     'Endpoint',          false, true,  false, '47 days ago', 'amber', 'MFA not enforced on 12 of 34 laptops. Audit logs not reviewed.'),
  ('Zoom (Telehealth)', 'Communications',    true,  true,  true,  '5 days ago',  'green', null);

-- ─── Vendors ─────────────────────────────────────────────────────────────────
truncate table vendors restart identity cascade;
insert into vendors (name, type, baa_expiry, breach_clause, subcontractors, risk, exposure) values
  ('Amazon Web Services',   'Cloud Infra',       '2025-12-01', false, true,  'amber', '$950K'),
  ('Epic Systems',          'EHR Platform',      '2026-06-15', true,  true,  'green', '$0'),
  ('Zoom Video Comms',      'Telehealth',         '2025-11-30', true,  false, 'green', '$0'),
  ('Veeva Systems',         'Clinical Data',      '2024-08-01', false, false, 'red',   '$1.9M'),
  ('Nuance (Microsoft)',    'AI Transcription',   '2026-01-10', true,  true,  'green', '$0'),
  ('Clearwater Compliance', 'Risk Consulting',    '2025-09-01', false, false, 'amber', '$450K');

-- ─── Incidents ───────────────────────────────────────────────────────────────
truncate table incidents restart identity cascade;
insert into incidents (date, type, desc, status, severity) values
  ('2025-04-21', 'Unauthorized Access', 'Dr. Chen accessed 12 records outside her patients — flagged by audit log review.', 'Resolved', 'amber'),
  ('2025-03-08', 'Lost Device',         'Staff laptop reported missing — encryption confirmed, remote wipe executed.',       'Resolved', 'green'),
  ('2025-01-15', 'Email Misdirection',  'PHI sent to wrong email address. 1 patient affected. OCR notified.',               'Closed',   'amber');
