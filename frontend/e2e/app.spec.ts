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

async function loginUser(
  page,
  user: { username: string; password: string }
) {
  await page.goto('/login');
  await page.getByLabel(/username/i).fill(user.username);
  await page.getByLabel(/password/i).fill(user.password);
  await page.getByRole('button', { name: /log in/i }).click();
  await expect(page).toHaveURL(/\/$/);
}

test.describe('Time Tracking App E2E', () => {
  const testUser = {
    username: `e2euser_${Date.now()}`,
    email: `e2e_${Date.now()}@test.com`,
    password: 'password123',
  };

  test('user can register, login, start timer, stop timer, and view tasks', async ({ page }) => {
    await registerUser(page, testUser);

    // Logout
    await page.getByRole('button', { name: /log out/i }).click();
    await expect(page).toHaveURL(/\/login$/);

    // Login
    await loginUser(page, testUser);

    // Start timer
    await page.getByPlaceholder(/what are you working on/i).fill('E2E test task');
    await page.getByRole('button', { name: /start timer/i }).click();

    // Timer should show running state
    await expect(page.getByText(/Timer running/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /stop timer/i })).toBeVisible();

    // Wait a bit then stop timer
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: /stop timer/i }).click();

    // After stopping, timer is paused; click Log time to return to ready state
    await page.getByRole('button', { name: /log time/i }).click();
    await expect(page.getByRole('button', { name: /start timer/i })).toBeVisible();

    // Navigate to tasks page and verify task exists
    await page.getByRole('link', { name: /tasks/i }).click();
    await expect(page).toHaveURL(/\/tasks$/);
    await expect(page.locator('.task-row', { hasText: /e2e test task/i }).first()).toBeVisible();
  });

  test('user can add manual task entry', async ({ page }) => {
    const user = {
      username: `manual_${Date.now()}`,
      email: `manual_${Date.now()}@test.com`,
      password: 'password123',
    };
    await registerUser(page, user);

    // Navigate to tasks
    await page.getByRole('link', { name: /tasks/i }).click();
    await expect(page).toHaveURL(/\/tasks$/);

    // Add manual entry
    await page.getByRole('button', { name: /add manual entry/i }).click();
    await page.getByLabel(/description/i).fill('Manual test task');
    await page.getByLabel(/start time/i).fill('2024-01-01T10:00');
    await page.getByLabel(/end time/i).fill('2024-01-01T12:00');

    await page.getByRole('button', { name: /add task/i }).click();

    // Should show the new task
    await expect(page.getByText(/manual test task/i)).toBeVisible();
  });

  test('user can edit and delete tasks', async ({ page }) => {
    const user = {
      username: `edit_${Date.now()}`,
      email: `edit_${Date.now()}@test.com`,
      password: 'password123',
    };
    await registerUser(page, user);

    // Navigate to tasks
    await page.getByRole('link', { name: /tasks/i }).click();

    // Create a task first via manual entry so we have something to edit
    await page.getByRole('button', { name: /add manual entry/i }).click();
    await page.getByLabel(/description/i).fill('Task to edit');
    await page.getByLabel(/start time/i).fill('2024-01-01T10:00');
    await page.getByLabel(/end time/i).fill('2024-01-01T11:00');
    await page.getByRole('button', { name: /add task/i }).click();
    await expect(page.getByText(/task to edit/i)).toBeVisible();

    // Find a task and edit it
    const taskRow = page.locator('.task-row', { hasText: /task to edit/i }).first();
    await taskRow.getByRole('button', { name: /edit/i }).click();

    await page.getByLabel(/description/i).fill('Updated task name');
    await page.getByRole('button', { name: /update task/i }).click();

    await expect(page.getByText(/updated task name/i)).toBeVisible();

    // Delete the task
    const updatedRow = page.locator('.task-row', { hasText: /updated task name/i }).first();

    // Confirm deletion dialog before clicking delete
    page.on('dialog', dialog => dialog.accept());
    await updatedRow.getByRole('button', { name: /delete/i }).click();

    await expect(page.getByText(/updated task name/i)).not.toBeVisible();
  });

  test('user can create and manage projects', async ({ page }) => {
    const user = {
      username: `project_${Date.now()}`,
      email: `project_${Date.now()}@test.com`,
      password: 'password123',
    };
    await registerUser(page, user);

    // Navigate to projects
    await page.getByRole('link', { name: /projects/i }).click();
    await expect(page).toHaveURL(/\/projects$/);

    // Create new project
    await page.getByRole('button', { name: /new project/i }).click();
    await page.getByLabel(/name/i).fill('E2E Test Project');
    await page.getByLabel(/description/i).fill('Project created during E2E test');
    await page.getByRole('button', { name: /create/i }).click();

    await expect(page.getByText(/e2e test project/i)).toBeVisible();
  });

  test('user can view reports with different periods', async ({ page }) => {
    const user = {
      username: `reports_${Date.now()}`,
      email: `reports_${Date.now()}@test.com`,
      password: 'password123',
    };
    await registerUser(page, user);

    // Navigate to reports
    await page.getByRole('link', { name: /reports/i }).click();
    await expect(page).toHaveURL(/\/reports$/);

    // Check default today view
    await expect(page.getByText(/today's summary/i)).toBeVisible();

    // Switch to week view
    await page.getByRole('button', { name: /this week/i }).click();
    await expect(page.getByText(/weekly summary/i)).toBeVisible();

    // Switch to month view
    await page.getByRole('button', { name: /this month/i }).click();
    await expect(page.getByText(/monthly summary/i)).toBeVisible();
  });

  test('invalid login shows error message', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/username/i).fill('nonexistent_user');
    await page.getByLabel(/password/i).fill('wrong_password');
    await page.getByRole('button', { name: /log in/i }).click();

    await expect(page.locator('.error').first()).toBeVisible();
  });

  test('unauthenticated users are redirected to login', async ({ page }) => {
    await page.goto('/tasks');
    await expect(page).toHaveURL(/\/login$/);
  });
});
