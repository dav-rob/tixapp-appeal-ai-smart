import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Monitor console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });
    
    // Navigate to home page
    await page.goto('/');
  });

  test('should have no console errors on initial load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    expect(errors).toHaveLength(0);
  });

  test('should navigate from home to scan page and back', async ({ page }) => {
    // Verify we're on home page
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Scan or Upload Ticket')).toBeVisible();

    // Click scan ticket button
    await page.locator('text=Scan or Upload Ticket').click();
    
    // Verify we're on scan page
    await expect(page).toHaveURL('/scan');
    await expect(page.locator('text=Back')).toBeVisible();

    // Click back button
    await page.locator('text=Back').click();
    
    // Verify we're back on home page
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Scan or Upload Ticket')).toBeVisible();
  });

  test('should navigate from home to dashboard page and back', async ({ page }) => {
    // Verify we're on home page
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=View My Tickets')).toBeVisible();

    // Click view tickets button
    await page.locator('text=View My Tickets').click();
    
    // Verify we're on dashboard page
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Back')).toBeVisible();

    // Click back button
    await page.locator('text=Back').click();
    
    // Verify we're back on home page
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=View My Tickets')).toBeVisible();
  });

  test('should navigate using header TixApp logo', async ({ page }) => {
    // Navigate to scan page first
    await page.locator('text=Scan or Upload Ticket').click();
    await expect(page).toHaveURL('/scan');

    // Click TixApp logo in header
    await page.locator('button:has-text("TixApp")').click();
    
    // Verify we're back on home page
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Scan or Upload Ticket')).toBeVisible();
  });

  test('should navigate using sidebar home button', async ({ page }) => {
    // Navigate to scan page first
    await page.locator('text=Scan or Upload Ticket').click();
    await expect(page).toHaveURL('/scan');

    // Open sidebar
    await page.locator('button[aria-label="Open navigation menu"]').click();
    
    // Wait for sidebar to be visible
    await expect(page.locator('text=Our Team')).toBeVisible();
    
    // Click Home button in sidebar
    await page.locator('button:has-text("Home")').click();
    
    // Verify we're back on home page
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Scan or Upload Ticket')).toBeVisible();
  });

  test('should maintain URL state on page refresh', async ({ page }) => {
    // Navigate to scan page
    await page.locator('text=Scan or Upload Ticket').click();
    await expect(page).toHaveURL('/scan');

    // Refresh the page
    await page.reload();
    
    // Verify we're still on scan page after refresh
    await expect(page).toHaveURL('/scan');
    await expect(page.locator('text=Back')).toBeVisible();
  });

  test('should navigate to details page from scan and back', async ({ page }) => {
    // Navigate to scan page
    await page.locator('text=Scan or Upload Ticket').click();
    await expect(page).toHaveURL('/scan');

    // Check if there's a way to navigate to details (this might need to be implemented)
    // For now, let's directly navigate to details to test the back functionality
    await page.goto('/details');
    await expect(page).toHaveURL('/details');
    await expect(page.locator('text=Back')).toBeVisible();

    // Click back button
    await page.locator('text=Back').click();
    
    // Since we navigated directly, back should go to previous page (scan)
    await expect(page).toHaveURL('/scan');
  });

  test('should navigate to details page from dashboard and back', async ({ page }) => {
    // Navigate to dashboard page
    await page.locator('text=View My Tickets').click();
    await expect(page).toHaveURL('/dashboard');

    // Navigate to details page directly (simulating a ticket click)
    await page.goto('/details');
    await expect(page).toHaveURL('/details');
    await expect(page.locator('text=Back')).toBeVisible();

    // Click back button
    await page.locator('text=Back').click();
    
    // Should go back to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should handle browser back button correctly', async ({ page }) => {
    // Navigate through several pages
    await page.locator('text=Scan or Upload Ticket').click();
    await expect(page).toHaveURL('/scan');

    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    await page.goto('/details');
    await expect(page).toHaveURL('/details');

    // Use browser back button
    await page.goBack();
    await expect(page).toHaveURL('/dashboard');

    await page.goBack();
    await expect(page).toHaveURL('/scan');

    await page.goBack();
    await expect(page).toHaveURL('/');
  });

  test('should handle direct URL access', async ({ page }) => {
    // Test direct navigation to each route
    const routes = ['/scan', '/dashboard', '/details'];
    
    for (const route of routes) {
      await page.goto(route);
      await expect(page).toHaveURL(route);
      
      // Verify back button is present on non-home pages
      await expect(page.locator('text=Back')).toBeVisible();
      
      // Verify header is present
      await expect(page.locator('button:has-text("TixApp")')).toBeVisible();
    }
  });

  test('should not have any JavaScript errors during navigation flow', async ({ page }) => {
    const jsErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });

    // Complete navigation flow
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.locator('text=Scan or Upload Ticket').click();
    await page.waitForLoadState('networkidle');

    await page.locator('text=Back').click();
    await page.waitForLoadState('networkidle');

    await page.locator('text=View My Tickets').click();
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("TixApp")').click();
    await page.waitForLoadState('networkidle');

    // Check for errors
    expect(jsErrors).toHaveLength(0);
  });
});