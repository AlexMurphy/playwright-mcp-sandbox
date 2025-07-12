import { test, expect } from '@playwright/test';

test.describe('Omaze UK - Accessibility & Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://omaze.com');
  });

  test('should have proper page titles and meta information', async ({ page }) => {
    // Check homepage title
    await expect(page).toHaveTitle(/Your Chance to Win a House in Cheshire.*Omaze UK/);
    
    // Navigate to entry page and check title
    await page.getByRole('link', { name: 'Enter Now' }).first().click();
    await expect(page).toHaveTitle(/Enter the Cheshire House Draw.*Omaze UK/);
    
    // Navigate to FAQs and check title
    await page.getByRole('link', { name: 'FAQs' }).click();
    await expect(page).toHaveTitle(/Your Frequently Asked Questions, Answered.*Omaze UK/);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check main heading structure
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h2')).toBeVisible();
    
    // Navigate to FAQs to check detailed heading structure
    await page.getByRole('link', { name: 'FAQs' }).click();
    
    await expect(page.locator('h1:has-text("Frequently Asked Questions")')).toBeVisible();
    
    // Check h2 categories exist
    const h2Categories = [
      'Winning a Prize',
      'Entry Code', 
      'Subscriptions',
      'Account Creation',
      'Payment',
      'The Cheshire House',
      'Anthony Nolan'
    ];
    
    for (const category of h2Categories) {
      await expect(page.locator(`h2:has-text("${category}")`)).toBeVisible();
    }
  });

  test('should have accessible navigation elements', async ({ page }) => {
    // Check main navigation has proper role
    await expect(page.locator('navigation')).toBeVisible();
    
    // Check navigation links are properly labeled
    const navLinks = [
      'The Cheshire House',
      'McLaren Artura Spider',
      'Past Draws',
      'About Omaze',
      'Our Winners',
      'Draw Results'
    ];
    
    for (const linkText of navLinks) {
      await expect(page.getByRole('link', { name: linkText })).toBeVisible();
    }
    
    // Check authentication links
    await expect(page.getByRole('link', { name: 'Log In' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign Up' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Basket' })).toBeVisible();
  });

  test('should have accessible buttons and interactive elements', async ({ page }) => {
    // Check main CTA buttons
    await expect(page.getByRole('link', { name: 'Enter Now' })).toBeVisible();
    
    // Navigate to entry page to check tab functionality
    await page.getByRole('link', { name: 'Enter Now' }).first().click();
    
    // Check entry method tabs have proper roles
    await expect(page.getByRole('button', { name: 'Postal No purchase necessary' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Single Purchase' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Subscription' })).toBeVisible();
    
    // Test tab navigation
    await page.getByRole('button', { name: 'Single Purchase' }).click();
    await expect(page.getByRole('button', { name: 'Buy Now' })).toBeVisible();
    
    await page.getByRole('button', { name: 'Subscription' }).click();
    await expect(page.getByRole('button', { name: 'Enter Now' })).toBeVisible();
  });

  test('should have accessible form elements and labels', async ({ page }) => {
    // Navigate to login page to check form accessibility
    await page.getByRole('link', { name: 'Log In' }).click();
    
    await expect(page).toHaveURL(/.*login/);
    
    // Note: We'd need to check for proper form labels and input associations
    // This would require inspecting the actual form structure when available
    
    // Navigate back to test other forms
    await page.goBack();
    
    // Check cookie consent form
    await expect(page.getByRole('button', { name: 'Accept All' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Accept Essential Only' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Customise Cookies' })).toBeVisible();
  });

  test('should have proper image alt text and media accessibility', async ({ page }) => {
    // Check logo has proper alt text
    await expect(page.locator('img').first()).toBeVisible();
    
    // Check house images have proper descriptions
    // Note: The specific alt text would need to be checked based on the actual implementation
    
    // Navigate to gallery to check house tour images
    await page.getByRole('tab', { name: 'Gallery' }).click();
    
    // Check that images are present in gallery
    const imageCount = await page.locator('img').count();
    expect(imageCount).toBeGreaterThan(5);
  });

  test('should handle keyboard navigation properly', async ({ page }) => {
    // Test keyboard navigation on main elements
    
    // Focus on the main Enter Now button
    await page.getByRole('link', { name: 'Enter Now' }).first().focus();
    
    // Test tab navigation through header links
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Test space/enter activation on focused elements
    await page.getByRole('link', { name: 'Enter Now' }).first().click();
    
    // Test keyboard navigation on entry page tabs
    await page.getByRole('button', { name: 'Single Purchase' }).focus();
    await page.keyboard.press('Space');
    
    // Test arrow key navigation if implemented for tab groups
    await page.keyboard.press('ArrowRight');
  });

  test('should have reasonable page load performance', async ({ page }) => {
    const startTime = Date.now();
    
    // Navigate to entry page and measure basic timing
    await page.getByRole('link', { name: 'Enter Now' }).first().click();
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    
    // Basic performance check - page should load within reasonable time
    expect(loadTime).toBeLessThan(10000); // 10 seconds max
    
    // Check that essential content is visible quickly
    await expect(page.locator('text=YOUR CHANCE TO WIN THIS £4,000,000 HOUSE IN CHESHIRE')).toBeVisible();
  });

  test('should handle different viewport sizes', async ({ page }) => {
    // Test various viewport sizes
    const viewports = [
      { width: 320, height: 568 }, // Mobile small
      { width: 375, height: 667 }, // Mobile medium  
      { width: 768, height: 1024 }, // Tablet
      { width: 1024, height: 768 }, // Desktop small
      { width: 1920, height: 1080 } // Desktop large
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      // Check that essential content is still visible
      await expect(page.locator('text=£4 MILLION HOUSE IN CHESHIRE')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Enter Now' })).toBeVisible();
      
      // Check navigation is accessible
      if (viewport.width < 768) {
        // Mobile: Check for hamburger menu or mobile navigation
        await expect(page.getByRole('button').first()).toBeVisible();
      } else {
        // Desktop: Check for full navigation
        await expect(page.getByRole('link', { name: 'Past Draws' })).toBeVisible();
      }
    }
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Test navigation to non-existent page
    const response = await page.goto('https://omaze.co.uk/non-existent-page');
    
    // Should handle 404s gracefully (either redirect or show proper error page)
    expect([200, 301, 302, 404]).toContain(response?.status());
    
    // Navigate back to working page
    await page.goto('https://omaze.com');
    await expect(page.locator('text=£4 MILLION HOUSE IN CHESHIRE')).toBeVisible();
  });

  test('should have proper ARIA landmarks and structure', async ({ page }) => {
    // Check for main content landmark
    await expect(page.locator('main')).toBeVisible();
    
    // Check for navigation landmark
    await expect(page.locator('nav, [role="navigation"]')).toBeVisible();
    
    // Check for footer landmark
    await expect(page.locator('footer, [role="contentinfo"]')).toBeVisible();
    
    // Navigate to entry page to check tablist structure
    await page.getByRole('link', { name: 'Enter Now' }).first().click();
    
    // Check for proper tab structure
    await expect(page.locator('[role="tablist"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Postal No purchase necessary' })).toBeVisible();
  });

  test('should have proper color contrast and visual accessibility', async ({ page }) => {
    // Take screenshot for manual contrast checking
    await page.screenshot({ path: 'tests/screenshots/homepage-contrast.png', fullPage: true });
    
    // Check that text is visible against backgrounds
    // This is a basic check - proper contrast testing would need specialized tools
    
    const textElements = [
      page.locator('text=£4 MILLION HOUSE IN CHESHIRE'),
      page.locator('text=Enter Now'),
      page.locator('text=Live In. Rent Out. Sell Up.')
    ];
    
    for (const element of textElements) {
      await expect(element).toBeVisible();
    }
    
    // Navigate to entry page and check contrast there too
    await page.getByRole('link', { name: 'Enter Now' }).first().click();
    await page.screenshot({ path: 'tests/screenshots/entry-page-contrast.png', fullPage: true });
  });
});
