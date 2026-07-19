import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.describe('Authentication flow', () => {
  const registeredUser = {
    username: `testuser${Date.now()}`,
    email: `testuser${Date.now()}@test.com`,
    password: 'password123',
  };

  test('register a new user with unique username', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /register/i }).click();
    await expect(page.getByRole('heading', { name: /register/i })).toBeVisible();

    await page.getByLabel(/username/i).fill(registeredUser.username);
    await page.getByLabel(/email/i).fill(registeredUser.email);
    await page.getByLabel(/password/i).fill(registeredUser.password);

    await page.getByRole('button', { name: /register/i }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });

  test('login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/username/i).fill(registeredUser.username);
    await page.getByLabel(/password/i).fill(registeredUser.password);
    await page.getByRole('button', { name: /log in/i }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/username/i).fill('invalid_user_xyz');
    await page.getByLabel(/password/i).fill('wrong_password');
    await page.getByRole('button', { name: /log in/i }).click();

    await expect(page.locator('.error').first()).toBeVisible();
  });

  test('logout redirects to login page', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/username/i).fill(registeredUser.username);
    await page.getByLabel(/password/i).fill(registeredUser.password);
    await page.getByRole('button', { name: /log in/i }).click();

    await expect(page).toHaveURL(/\/$/);

    await page.getByRole('button', { name: /log out/i }).click();

    await expect(page).toHaveURL(/\/login$/);
  });
});
