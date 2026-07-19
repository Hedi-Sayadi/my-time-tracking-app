-- Auto-run demo data for the professor (idempotent, runs on every dev startup)
-- This file is executed automatically by Spring Boot when sql.init.mode=always
-- Includes enough data to demonstrate all three custom features.

-- 1. Create the main demo user if not present (so the professor can log in immediately)
INSERT INTO users (id, username, email, password_hash, timezone, weekly_target_hours, created_at, updated_at)
SELECT 6, 'sayadihedi145', 'sayadihedi145@gmail.com',
       '$2b$10$hFgVmrxiyJrugzA26OQybuzwGThAiXDe6JFdDx205fqycyGxg4nqS',
       'Europe/Berlin', 40, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 6 OR username = 'sayadihedi145' OR email = 'sayadihedi145@gmail.com');

-- 2. Time Budgets: projects with hour budgets
INSERT INTO projects (id, name, description, parent_id, user_id, budget_hours, created_at)
SELECT * FROM (VALUES
  (1, 'University — Summer Term 2026', 'All university courses and assignments', NULL::bigint, 6, NULL::int, NOW()),
  (2, 'SE2P — Software Engineering II', 'Software engineering lecture with practical project', 1, 6, 60, NOW()),
  (3, 'Final Project', 'Full-stack time tracking web application', 2, 6, 80, NOW()),
  (4, 'Exercise Sheets', 'Weekly SE2P exercises', 2, 6, 20, NOW()),
  (5, 'Personal Development', 'Gym, reading, and side projects', NULL::bigint, 6, NULL::int, NOW()),
  (6, 'Gym & Fitness', 'Weekly workout routine', 5, 6, 8, NOW()),
  (7, 'Reading', 'Technical books and articles', 5, 6, 10, NOW()),
  (8, 'Part-time Job', 'Student assistant at university IT department', NULL::bigint, 6, 40, NOW()),
  (9, 'Server Maintenance', 'Monthly server updates and monitoring', 8, 6, 12, NOW()),
  (10, 'User Support', 'Helping students with IT issues', 8, 6, 15, NOW())
) AS v(id, name, description, parent_id, user_id, budget_hours, created_at)
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE id = v.id);

SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));

-- 3. Team Dashboard / Project Sharing: add a second demo teammate
INSERT INTO users (id, username, email, password_hash, timezone, weekly_target_hours, created_at, updated_at)
SELECT 7, 'demoteammate', 'demo@timetracking.local',
       '$2b$10$K2JoU7eaWX6ds3mI89M6KOpza3i2hQSpih1Ri9fMI2FIFoYl1FJ7m',
       'Europe/Berlin', 20, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 7 OR username = 'demoteammate' OR email = 'demo@timetracking.local');

-- Share some projects with the teammate
INSERT INTO project_members (project_id, user_id, created_at)
SELECT p, u, NOW() FROM (VALUES (3, 7), (2, 7), (8, 7)) AS v(p, u)
WHERE NOT EXISTS (SELECT 1 FROM project_members WHERE project_id = v.p AND user_id = v.u);

-- 4. Tasks for the main user (user 6)
INSERT INTO tasks (id, description, start_time, end_time, running, user_id, created_at, updated_at)
SELECT * FROM (VALUES
  (1,  'Morning workout — cardio and weights',                  '2026-07-17T07:00:00Z'::timestamp, '2026-07-17T08:00:00Z'::timestamp, FALSE, 6, NOW(), NOW()),
  (2,  'SE2P final project — backend API design',                 '2026-07-17T09:00:00Z'::timestamp, '2026-07-17T12:30:00Z'::timestamp, FALSE, 6, NOW(), NOW()),
  (4,  'SE2P final project — frontend React components',          '2026-07-17T13:15:00Z'::timestamp, '2026-07-17T16:00:00Z'::timestamp, FALSE, 6, NOW(), NOW()),
  (5,  'User support — resolve ticket #442',                      '2026-07-17T16:30:00Z'::timestamp, '2026-07-17T17:15:00Z'::timestamp, FALSE, 6, NOW(), NOW()),
  (6,  'Reading — Clean Architecture (Ch. 12-14)',                  '2026-07-17T19:00:00Z'::timestamp, '2026-07-17T20:30:00Z'::timestamp, FALSE, 6, NOW(), NOW()),
  (11, 'SE2P exercise sheet 8 — Docker & Testcontainers',         '2026-07-14T14:00:00Z'::timestamp, '2026-07-14T16:30:00Z'::timestamp, FALSE, 6, NOW(), NOW()),
  (13, 'SE2P final project — database schema design',             '2026-07-15T14:00:00Z'::timestamp, '2026-07-15T17:00:00Z'::timestamp, FALSE, 6, NOW(), NOW()),
  (16, 'Gym — leg day',                                           '2026-07-16T07:00:00Z'::timestamp, '2026-07-16T08:15:00Z'::timestamp, FALSE, 6, NOW(), NOW()),
  (17, 'SE2P final project — JWT authentication',                 '2026-07-16T09:00:00Z'::timestamp, '2026-07-16T11:30:00Z'::timestamp, FALSE, 6, NOW(), NOW())
) AS v(id, description, start_time, end_time, running, user_id, created_at, updated_at)
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE id = v.id);

SELECT setval('tasks_id_seq', (SELECT MAX(id) FROM tasks));

-- 5. Tasks for the teammate (user 7) so Team Dashboard has data
INSERT INTO tasks (id, description, start_time, end_time, running, user_id, created_at, updated_at)
SELECT * FROM (VALUES
  (101, 'SE2P final project — peer review',         '2026-07-17T09:00:00Z'::timestamp, '2026-07-17T11:00:00Z'::timestamp, FALSE, 7, NOW(), NOW()),
  (102, 'SE2P final project — code review',          '2026-07-16T14:00:00Z'::timestamp, '2026-07-16T16:00:00Z'::timestamp, FALSE, 7, NOW(), NOW()),
  (103, 'Part-time job — update documentation',      '2026-07-15T10:00:00Z'::timestamp, '2026-07-15T11:30:00Z'::timestamp, FALSE, 7, NOW(), NOW()),
  (104, 'SE2P exercise sheet 8 — pair programming',  '2026-07-14T09:00:00Z'::timestamp, '2026-07-14T11:00:00Z'::timestamp, FALSE, 7, NOW(), NOW()),
  (105, 'Server maintenance — monitor alerts',       '2026-07-13T08:00:00Z'::timestamp, '2026-07-13T09:30:00Z'::timestamp, FALSE, 7, NOW(), NOW())
) AS v(id, description, start_time, end_time, running, user_id, created_at, updated_at)
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE id = v.id);

-- 6. Link tasks to projects
INSERT INTO task_projects (task_id, project_id)
SELECT t, p FROM (VALUES
  (1, 6),   (2, 3),   (2, 2),
  (4, 3),   (4, 2),   (5, 10),  (5, 8),
  (6, 7),   (11, 4),  (11, 2),  (13, 3),  (13, 2),
  (16, 6),  (17, 3),  (17, 2),
  (101, 3), (101, 2), (102, 3), (102, 2), (103, 8),
  (104, 4), (104, 2), (105, 9)
) AS v(t, p)
WHERE NOT EXISTS (SELECT 1 FROM task_projects WHERE task_id = v.t AND project_id = v.p);
