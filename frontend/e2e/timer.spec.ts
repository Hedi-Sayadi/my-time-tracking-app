import { test, expect } from '@playwright/test';

test.describe('Time tracking flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/username/i).fill('sayadihedi145');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /log in/i }).click();

    await expect(page).toHaveURL(/\/$/);
  });

  test('start timer with a task description', async ({ page }) => {
    await page.getByPlaceholder(/what are you working on/i).fill('E2E timer test task');
    await page.getByRole('button', { name: /start timer/i }).click();

    await expect(page.getByText(/running now/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /stop timer/i })).toBeVisible();
  });

  test('verify timer is running and shows elapsed time', async ({ page }) => {
    await page.getByPlaceholder(/what are you working on/i).fill('E2E elapsed time task');
    await page.getByRole('button', { name: /start timer/i }).click();

    await expect(page.getByText(/running now/i)).toBeVisible();

    const elapsed = page.locator('[data-testid="elapsed-time"], .timer-display, .elapsed-time').first();
    await expect(elapsed).toBeVisible();
  });

  test('stop the timer and verify task appears in task list', async ({ page }) => {
    const taskName = `E2E stop test ${Date.now()}`;
    await page.getByPlaceholder(/what are you working on/i).fill(taskName);
    await page.getByRole('button', { name: /start timer/i }).click();

    await expect(page.getByText(/running now/i)).toBeVisible();

    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: /stop timer/i }).click();

    await expect(page.getByRole('button', { name: /start timer/i })).toBeVisible();

    await page.getByRole('link', { name: /tasks/i }).click();
    await expect(page).toHaveURL(/\/tasks$/);
    await expect(page.getByText(new RegExp(taskName, 'i'))).toBeVisible();
  });
});