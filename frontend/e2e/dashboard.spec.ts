import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/username/i).fill('sayadihedi145');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /log in/i }).click();

    await expect(page).toHaveURL(/\/$/);
  });

  test('weekly goal ring is visible', async ({ page }) => {
    const goalRing = page
      .locator(
        '[data-testid="weekly-goal"], .weekly-goal, .goal-ring, [aria-label*="weekly goal" i]'
      )
      .first();
    await expect(goalRing).toBeVisible();
  });

  test('metric cards are displayed', async ({ page }) => {
    const metricCard = page.locator('.metric-card, [data-testid="metric-card"], .card').first();
    await expect(metricCard).toBeVisible();
  });

  test('timer card is visible', async ({ page }) => {
    const timerCard = page.locator('[data-testid="timer-card"], .timer-card, .timer').first();
    await expect(timerCard).toBeVisible();

    await expect(page.getByRole('button', { name: /start timer/i })).toBeVisible();
  });

  test('project list is displayed on dashboard', async ({ page }) => {
    const projectSection = page
      .locator('[data-testid="dashboard-projects"], .dashboard-projects, .projects-list')
      .first();
    await expect(projectSection).toBeVisible();
  });
});
