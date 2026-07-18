import { test, expect } from '@playwright/test';

test.describe('Project management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/username/i).fill('sayadihedi145');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /log in/i }).click();

    await expect(page).toHaveURL(/\/$/);
  });

  test('create a new project and verify it appears in project list', async ({ page }) => {
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
    const projectName = `E2E Detail ${Date.now()}`;

    await page.getByRole('link', { name: /projects/i }).click();
    await expect(page).toHaveURL(/\/projects$/);

    await page.getByRole('button', { name: /new project/i }).click();
    await page.getByLabel(/name/i).fill(projectName);
    await page.getByLabel(/description/i).fill('Project for detail view test');
    await page.getByRole('button', { name: /create/i }).click();

    await expect(page.getByText(new RegExp(projectName, 'i'))).toBeVisible();

    await page.getByRole('link', { name: new RegExp(projectName, 'i') }).click();

    await expect(page).toHaveURL(/\/projects\/\d+$/);
    await expect(page.getByText(new RegExp(projectName, 'i'))).toBeVisible();
  });

  test('verify time budget progress bar is visible on project detail', async ({ page }) => {
    const projectName = `E2E Budget ${Date.now()}`;

    await page.getByRole('link', { name: /projects/i }).click();

    await page.getByRole('button', { name: /new project/i }).click();
    await page.getByLabel(/name/i).fill(projectName);
    await page.getByLabel(/description/i).fill('Project for budget progress test');
    if (await page.getByLabel(/time budget/i).isVisible().catch(() => false)) {
      await page.getByLabel(/time budget/i).fill('10');
    }
    await page.getByRole('button', { name: /create/i }).click();

    await expect(page.getByText(new RegExp(projectName, 'i'))).toBeVisible();

    await page.getByRole('link', { name: new RegExp(projectName, 'i') }).click();
    await expect(page).toHaveURL(/\/projects\/\d+$/);

    const progressBar = page.locator('.progress-bar, [role="progressbar"], .progress').first();
    await expect(progressBar).toBeVisible();
  });
});