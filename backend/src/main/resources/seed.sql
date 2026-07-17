-- Seed realistic data for time tracking demo
-- Run in PostgreSQL via: docker compose exec -it postgres psql -U timetracking -d timetracking -f /tmp/seed.sql

BEGIN;

-- Delete existing tasks and associations (preserve users)
DELETE FROM task_projects;
DELETE FROM tasks;
DELETE FROM projects;

-- Use user id 6 (sayadihedi145@gmail.com) as the seed user

-- Projects (with hierarchy)
INSERT INTO projects (id, name, description, parent_id, user_id, created_at) VALUES
(1, 'University — Summer Term 2026', 'All university courses and assignments', NULL, 6, NOW()),
(2, 'SE2P — Software Engineering II', 'Software engineering lecture with practical project', 1, 6, NOW()),
(3, 'Final Project', 'Full-stack time tracking web application', 2, 6, NOW()),
(4, 'Exercise Sheets', 'Weekly SE2P exercises', 2, 6, NOW()),
(5, 'Personal Development', 'Gym, reading, and side projects', NULL, 6, NOW()),
(6, 'Gym & Fitness', 'Weekly workout routine', 5, 6, NOW()),
(7, 'Reading', 'Technical books and articles', 5, 6, NOW()),
(8, 'Part-time Job', 'Student assistant at university IT department', NULL, 6, NOW()),
(9, 'Server Maintenance', 'Monthly server updates and monitoring', 8, 6, NOW()),
(10, 'User Support', 'Helping students with IT issues', 8, 6, NOW());

-- Reset sequences so future inserts get correct IDs
SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));

-- Tasks for today (2026-07-17)
INSERT INTO tasks (id, description, start_time, end_time, running, user_id, created_at, updated_at) VALUES
(1, 'Morning workout — cardio and weights', '2026-07-17T07:00:00Z', '2026-07-17T08:00:00Z', FALSE, 6, NOW(), NOW()),
(2, 'SE2P final project — backend API design', '2026-07-17T09:00:00Z', '2026-07-17T12:30:00Z', FALSE, 6, NOW(), NOW()),
(3, 'Lunch break', '2026-07-17T12:30:00Z', '2026-07-17T13:15:00Z', FALSE, 6, NOW(), NOW()),
(4, 'SE2P final project — frontend React components', '2026-07-17T13:15:00Z', '2026-07-17T16:00:00Z', FALSE, 6, NOW(), NOW()),
(5, 'User support — resolve ticket #442 (email setup)', '2026-07-17T16:30:00Z', '2026-07-17T17:15:00Z', FALSE, 6, NOW(), NOW()),
(6, 'Reading — Clean Architecture (Ch. 12-14)', '2026-07-17T19:00:00Z', '2026-07-17T20:30:00Z', FALSE, 6, NOW(), NOW());

-- Tasks for this week (2026-07-13 to 2026-07-16)
INSERT INTO tasks (id, description, start_time, end_time, running, user_id, created_at, updated_at) VALUES
(10, 'Gym — upper body workout', '2026-07-14T07:00:00Z', '2026-07-14T08:00:00Z', FALSE, 6, NOW(), NOW()),
(11, 'SE2P exercise sheet 8 — Docker & Testcontainers', '2026-07-14T14:00:00Z', '2026-07-14T16:30:00Z', FALSE, 6, NOW(), NOW()),
(12, 'Server maintenance — apply security patches', '2026-07-15T10:00:00Z', '2026-07-15T12:00:00Z', FALSE, 6, NOW(), NOW()),
(13, 'SE2P final project — database schema design', '2026-07-15T14:00:00Z', '2026-07-15T17:00:00Z', FALSE, 6, NOW(), NOW()),
(14, 'User support — help desk shift', '2026-07-15T08:00:00Z', '2026-07-15T10:00:00Z', FALSE, 6, NOW(), NOW()),
(15, 'Reading — Designing Data-Intensive Applications (Ch. 5)', '2026-07-13T20:00:00Z', '2026-07-13T21:30:00Z', FALSE, 6, NOW(), NOW()),
(16, 'Gym — leg day', '2026-07-16T07:00:00Z', '2026-07-16T08:15:00Z', FALSE, 6, NOW(), NOW()),
(17, 'SE2P final project — JWT authentication', '2026-07-16T09:00:00Z', '2026-07-16T11:30:00Z', FALSE, 6, NOW(), NOW()),
(18, 'Server maintenance — backup verification', '2026-07-16T13:00:00Z', '2026-07-16T14:00:00Z', FALSE, 6, NOW(), NOW());

-- Tasks for earlier in the month (July 2026)
INSERT INTO tasks (id, description, start_time, end_time, running, user_id, created_at, updated_at) VALUES
(20, 'Gym — full body workout', '2026-07-03T07:00:00Z', '2026-07-03T08:00:00Z', FALSE, 6, NOW(), NOW()),
(21, 'SE2P lecture — Design Patterns', '2026-07-07T08:00:00Z', '2026-07-07T10:00:00Z', FALSE, 6, NOW(), NOW()),
(22, 'SE2P exercise sheet 7 — Spring Boot testing', '2026-07-08T14:00:00Z', '2026-07-08T17:00:00Z', FALSE, 6, NOW(), NOW()),
(23, 'Reading — System Design Interview (Ch. 1-3)', '2026-07-09T19:00:00Z', '2026-07-09T21:00:00Z', FALSE, 6, NOW(), NOW()),
(24, 'User support — onboarding new student assistants', '2026-07-10T09:00:00Z', '2026-07-10T11:00:00Z', FALSE, 6, NOW(), NOW()),
(25, 'Server maintenance — disk cleanup and monitoring setup', '2026-07-01T10:00:00Z', '2026-07-01T12:30:00Z', FALSE, 6, NOW(), NOW()),
(26, 'SE2P final project — requirements analysis', '2026-07-02T09:00:00Z', '2026-07-02T11:00:00Z', FALSE, 6, NOW(), NOW()),
(27, 'Gym — cardio session', '2026-07-10T07:00:00Z', '2026-07-10T08:00:00Z', FALSE, 6, NOW(), NOW()),
(28, 'Part-time job — prepare workshop slides', '2026-07-11T13:00:00Z', '2026-07-11T15:00:00Z', FALSE, 6, NOW(), NOW());

SELECT setval('tasks_id_seq', (SELECT MAX(id) FROM tasks));

-- Link tasks to projects
INSERT INTO task_projects (task_id, project_id) VALUES
-- Today tasks
(1, 6),      -- Morning workout -> Gym & Fitness
(2, 3),      -- SE2P final project backend -> Final Project
(2, 2),      -- Also counts for SE2P lecture
(3, 5),      -- Lunch break -> Personal Development (optional)
(4, 3),      -- SE2P final project frontend -> Final Project
(4, 2),      -- Also counts for SE2P lecture
(5, 10),     -- User support ticket -> User Support
(5, 8),      -- Also counts for Part-time Job
(6, 7),      -- Reading -> Reading

-- This week tasks
(10, 6),     -- Gym upper body -> Gym & Fitness
(11, 4),     -- Exercise sheet 8 -> Exercise Sheets
(11, 2),     -- Also counts for SE2P lecture
(12, 9),     -- Server maintenance -> Server Maintenance
(12, 8),     -- Also counts for Part-time Job
(13, 3),     -- DB schema design -> Final Project
(13, 2),     -- Also counts for SE2P lecture
(14, 10),    -- Help desk -> User Support
(14, 8),     -- Also counts for Part-time Job
(15, 7),    -- Reading Designing Data-Intensive Apps -> Reading
(16, 6),    -- Leg day -> Gym & Fitness
(17, 3),    -- JWT auth -> Final Project
(17, 2),    -- Also counts for SE2P lecture
(18, 9),    -- Backup verification -> Server Maintenance
(18, 8),    -- Also counts for Part-time Job

-- Earlier in month
(20, 6),    -- Full body workout -> Gym & Fitness
(21, 2),    -- Design Patterns lecture -> SE2P lecture
(22, 4),    -- Exercise sheet 7 -> Exercise Sheets
(22, 2),    -- Also counts for SE2P lecture
(23, 7),    -- System Design Interview -> Reading
(24, 10),   -- Onboarding -> User Support
(24, 8),    -- Also counts for Part-time Job
(25, 9),    -- Disk cleanup -> Server Maintenance
(25, 8),    -- Also counts for Part-time Job
(26, 3),    -- Requirements analysis -> Final Project
(26, 2),    -- Also counts for SE2P lecture
(27, 6),    -- Cardio -> Gym & Fitness
(28, 8);    -- Workshop slides -> Part-time Job

COMMIT;
