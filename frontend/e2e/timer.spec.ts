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

test.describe('Time tracking flow', () => {
  test('start timer with a task description', async ({ page }) => {
    const user = {
      username: `timer_${Date.now()}`,
      email: `timer_${Date.now()}@test.com`,
      password: 'password123',
    };
    await registerUser(page, user);

    await page.getByPlaceholder(/what are you working on/i).fill('E2E timer test task');
    await page.getByRole('button', { name: /start timer/i }).click();

    await expect(page.getByText(/Timer running/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /stop timer/i })).toBeVisible();
  });

  test('verify timer is running and shows elapsed time', async ({ page }) => {
    const user = {
      username: `elapsed_${Date.now()}`,
      email: `elapsed_${Date.now()}@test.com`,
      password: 'password123',
    };
    await registerUser(page, user);

    await page.getByPlaceholder(/what are you working on/i).fill('E2E elapsed time task');
    await page.getByRole('button', { name: /start timer/i }).click();

    await expect(page.getByText(/Timer running/i)).toBeVisible();

    const elapsed = page.locator('.timer-display').first();
    await expect(elapsed).toBeVisible();
  });

  test('stop the timer and verify task appears in task list', async ({ page }) => {
    const user = {
      username: `stop_${Date.now()}`,
      email: `stop_${Date.now()}@test.com`,
      password: 'password123',
    };
    await registerUser(page, user);

    const taskName = `E2E stop test ${Date.now()}`;
    await page.getByPlaceholder(/what are you working on/i).fill(taskName);
    await page.getByRole('button', { name: /start timer/i }).click();

    await expect(page.getByText(/Timer running/i)).toBeVisible();

    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: /stop timer/i }).click();

    // After stopping, timer is in "paused" state with Resume/Log time buttons
    await page.getByRole('button', { name: /log time/i }).click();
    await expect(page.getByRole('button', { name: /start timer/i })).toBeVisible();

    await page.getByRole('link', { name: /tasks/i }).click();
    await expect(page).toHaveURL(/\/tasks$/);
    await expect(page.getByText(new RegExp(taskName, 'i')).first()).toBeVisible();
  });
});
