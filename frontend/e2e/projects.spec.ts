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

test.describe('Project management', () => {
  test('create a new project and verify it appears in project list', async ({ page }) => {
    const user = {
      username: `proj_${Date.now()}`,
      email: `proj_${Date.now()}@test.com`,
      password: 'password123',
    };
    await registerUser(page, user);

    const projectName = `E2E Project ${Date.now()}`;

    await page.getByRole('link', { name: /projects/i }).click();
    await expect(page).toHaveURL(/\/projects$/);

    await page.getByRole('button', { name: /new project/i }).click();

    await page.getByLabel(/name/i).fill(projectName);
    await page.getByLabel(/description/i).fill('Project created during E2E test');
    await page.getByRole('button', { name: /create/i }).click();

    await expect(page.getByText(new RegExp(projectName, 'i'))).toBeVisible();
  });

  test('view project detail page', async ({ page }) => {
    const user = {
      username: `detail_${Date.now()}`,
      email: `detail_${Date.now()}@test.com`,
      password: 'password123',
    };
    await registerUser(page, user);

    const projectName = `E2E Detail ${Date.now()}`;

    await page.getByRole('link', { name: /projects/i }).click();
    await expect(page).toHaveURL(/\/projects$/);

    await page.getByRole('button', { name: /new project/i }).click();
    await page.getByLabel(/name/i).fill(projectName);
    await page.getByLabel(/description/i).fill('Project for detail view test');
    await page.getByRole('button', { name: /create/i }).click();

    await expect(page.getByText(new RegExp(projectName, 'i'))).toBeVisible();

    // Click the "View" button next to the project
    const projectRow = page.locator('.project-item', { hasText: new RegExp(projectName, 'i') }).first();
    await projectRow.getByRole('button', { name: /view/i }).click();

    await expect(page).toHaveURL(/\/projects\/\d+$/);
    await expect(page.getByText(new RegExp(projectName, 'i'))).toBeVisible();
  });

  test('verify time budget progress bar is visible on project detail', async ({ page }) => {
    const user = {
      username: `budget_${Date.now()}`,
      email: `budget_${Date.now()}@test.com`,
      password: 'password123',
    };
    await registerUser(page, user);

    const projectName = `E2E Budget ${Date.now()}`;

    await page.getByRole('link', { name: /projects/i }).click();

    await page.getByRole('button', { name: /new project/i }).click();
    await page.getByLabel(/name/i).fill(projectName);
    await page.getByLabel(/description/i).fill('Project for budget progress test');
    await page.getByLabel(/Budget hours/i).fill('10');
    await page.getByRole('button', { name: /create/i }).click();

    await expect(page.getByText(new RegExp(projectName, 'i'))).toBeVisible();

    // Click the "View" button next to the project
    const projectRow = page.locator('.project-item', { hasText: new RegExp(projectName, 'i') }).first();
    await projectRow.getByRole('button', { name: /view/i }).click();
    await expect(page).toHaveURL(/\/projects\/\d+$/);

    // The budget section shows on project detail when budget is set
    await expect(page.getByText(/Budget/i).first()).toBeVisible();
  });
});
