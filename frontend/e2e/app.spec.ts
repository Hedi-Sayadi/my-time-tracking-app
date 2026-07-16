import { test, expect } from '@playwright/test';

test.describe('Time Tracking App E2E', () => {
  const testUser = {
    username: `e2euser_${Date.now()}`,
    email: `e2e_${Date.now()}@test.com`,
    password: 'password123',
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user can register, login, start timer, stop timer, and view tasks', async ({ page }) => {
    // Navigate to register page
    await page.getByRole('link', { name: /register/i }).click();
    await expect(page.getByRole('heading', { name: /register/i })).toBeVisible();

    // Fill registration form
    await page.getByLabel(/username/i).fill(testUser.username);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    
    // Submit registration
    await page.getByRole('button', { name: /register/i }).click();
    
    // Should redirect to dashboard after successful registration
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText(/dashboard/i)).toBeVisible();

    // Logout
    await page.getByRole('button', { name: /log out/i }).click();
    await expect(page).toHaveURL(/\/login$/);

    // Login
    await page.getByLabel(/username/i).fill(testUser.username);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole('button', { name: /log in/i }).click();
    
    await expect(page).toHaveURL(/\/$/);

    // Start timer
    await page.getByPlaceholder(/what are you working on/i).fill('E2E test task');
    await page.getByRole('button', { name: /start timer/i }).click();
    
    // Timer should show running state
    await expect(page.getByText(/running now/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /stop timer/i })).toBeVisible();

    // Wait a bit then stop timer
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: /stop timer/i }).click();
    
    // Should show start button again
    await expect(page.getByRole('button', { name: /start timer/i })).toBeVisible();

    // Navigate to tasks page and verify task exists
    await page.getByRole('link', { name: /tasks/i }).click();
    await expect(page).toHaveURL(/\/tasks$/);
    await expect(page.getByText(/e2e test task/i)).toBeVisible();
  });

  test('user can add manual task entry', async ({ page }) => {
    // Navigate to login and authenticate
    await page.goto('/login');
    await page.getByLabel(/username/i).fill(testUser.username);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole('button', { name: /log in/i }).click();
    
    await expect(page).toHaveURL(/\/$/);

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
    // Login first
    await page.goto('/login');
    await page.getByLabel(/username/i).fill(testUser.username);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole('button', { name: /log in/i }).click();
    
    await expect(page).toHaveURL(/\/$/);

    // Navigate to tasks
    await page.getByRole('link', { name: /tasks/i }).click();
    
    // Find a task and edit it
    const taskRow = page.locator('.task-row', { hasText: /e2e test task/i }).first();
    await taskRow.getByRole('button', { name: /edit/i }).click();
    
    await page.getByLabel(/description/i).fill('Updated task name');
    await page.getByRole('button', { name: /update task/i }).click();
    
    await expect(page.getByText(/updated task name/i)).toBeVisible();

    // Delete the task
    const updatedRow = page.locator('.task-row', { hasText: /updated task name/i }).first();
    await updatedRow.getByRole('button', { name: /delete/i }).click();
    
    // Confirm deletion
    page.on('dialog', dialog => dialog.accept());
    
    await expect(page.getByText(/updated task name/i)).not.toBeVisible();
  });

  test('user can create and manage projects', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel(/username/i).fill(testUser.username);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole('button', { name: /log in/i }).click();
    
    await expect(page).toHaveURL(/\/$/);

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
    // Login
    await page.goto('/login');
    await page.getByLabel(/username/i).fill(testUser.username);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole('button', { name: /log in/i }).click();
    
    await expect(page).toHaveURL(/\/$/);

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
    
    await expect(page.getByText(/invalid username or password/i)).toBeVisible();
  });

  test('unauthenticated users are redirected to login', async ({ page }) => {
    await page.goto('/tasks');
    await expect(page).toHaveURL(/\/login$/);
  });
});
