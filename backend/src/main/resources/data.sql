INSERT INTO users (username, email, password_hash, timezone, weekly_target_hours, created_at, updated_at)
VALUES (
  'sayadihedi145',
  'demo@example.com',
  '$2b$10$FkJDplLeF18SW1XLKQlYQekZIEWvYWk4Ra2tRtsyyZOOB34NAf1yS',
  'Europe/Berlin',
  20,
  NOW(),
  NOW()
)
ON CONFLICT (username) DO NOTHING;
