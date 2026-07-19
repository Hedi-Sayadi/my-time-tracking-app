import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

async function registerUser(
  page,
  user: { username: string; email: string; password: string }
) {
  await page.goto('/register');
  await page.getByLabel(/username/i).fill(user.username);
  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/password/i).fill(user.password);
  await page.getByRole('button', { name: /register/i }).click();
  await expect(page).toHaveURL(/\/$/);
}

test.describe('Dashboard', () => {
  test('weekly goal ring is visible', async ({ page }) => {
    const user = {
      username: `dash_${Date.now()}`,
      email: `dash_${Date.now()}@test.com`,
      password: 'password123',
    };
    await registerUser(page, user);

    // Set a weekly goal so the ring appears
    await page.goto('/settings');
    await page.getByLabel(/Target hours per week/i).fill('20');
    await page.getByRole('button', { name: /Save goal/i }).click();

    await page.goto('/');
    await expect(page.getByRole('heading', { name: /your weekly goal/i })).toBeVisible();
  });

  test('metric cards are displayed', async ({ page }) => {
    const user = {
      username: `metric_${Date.now()}`,
      email: `metric_${Date.now()}@test.com`,
      password: 'password123',
    };
    await registerUser(page, user);

    const metricCard = page.locator('.metric-card, [data-testid="metric-card"]').first();
    await expect(metricCard).toBeVisible();
  });

  test('timer card is visible', async ({ page }) => {
    const user = {
      username: `timerdash_${Date.now()}`,
      email: `timerdash_${Date.now()}@test.com`,
      password: 'password123',
    };
    await registerUser(page, user);

    const timerCard = page.locator('.timer-card').first();
    await expect(timerCard).toBeVisible();

    await expect(page.getByRole('button', { name: /start timer/i })).toBeVisible();
  });

  test('project list is displayed on dashboard', async ({ page }) => {
    const user = {
      username: `projdash_${Date.now()}`,
      email: `projdash_${Date.now()}@test.com`,
      password: 'password123',
    };
    await registerUser(page, user);

    // Dashboard shows a Projects metric card with count
    await expect(page.getByLabel(/Summary metrics/i).getByText('Projects').first()).toBeVisible();
  });
});
