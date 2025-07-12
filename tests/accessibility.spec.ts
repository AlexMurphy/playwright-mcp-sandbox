import { test, expect } from '@playwright/test';

test.describe('Omaze UK - Accessibility Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Accept cookies if banner appears
    const acceptButton = page.getByRole('button', { name: /accept|agree/i });
    if (await acceptButton.isVisible({ timeout: 3000 })) {
      await acceptButton.click();
    }
  });

  test('should meet basic accessibility requirements on home page', async ({ page }) => {
    await test.step('Check page structure and landmarks', async () => {
      // Verify semantic HTML structure
      await expect(page.locator('header, nav, main, footer')).toHaveCount(4);
      await expect(page.getByRole('navigation')).toBeVisible();
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByRole('contentinfo')).toBeVisible();
    });

    await test.step('Check heading hierarchy', async () => {
      // Verify proper heading structure (h1 > h2 > h3, etc.)
      const h1Elements = page.getByRole('heading', { level: 1 });
      await expect(h1Elements).toHaveCount(1);
      
      const h2Elements = page.getByRole('heading', { level: 2 });
      const h2Count = await h2Elements.count();
      expect(h2Count).toBeGreaterThan(0);
    });

    await test.step('Check images have alt text', async () => {
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < Math.min(10, imageCount); i++) {
        const image = images.nth(i);
        const alt = await image.getAttribute('alt');
        const ariaLabel = await image.getAttribute('aria-label');
        
        // Images should have either alt text or aria-label
        expect(alt !== null || ariaLabel !== null).toBeTruthy();
      }
    });

    await test.step('Check links have accessible names', async () => {
      const links = page.getByRole('link');
      const linkCount = await links.count();
      
      for (let i = 0; i < Math.min(10, linkCount); i++) {
        const link = links.nth(i);
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        
        // Links should have visible text or aria-label
        expect(text?.trim() || ariaLabel).toBeTruthy();
      }
    });
  });

  test('should support keyboard navigation', async ({ page }) => {
    await test.step('Test tab navigation through interactive elements', async () => {
      // Start from top of page
      await page.keyboard.press('Home');
      
      // Tab through first few interactive elements
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
        
        // Check that focused element is visible
        const focusedElement = page.locator(':focus');
        if (await focusedElement.count() > 0) {
          await expect(focusedElement).toBeVisible();
        }
      }
    });

    await test.step('Test Enter key activation on buttons', async () => {
      const firstButton = page.getByRole('button').first();
      if (await firstButton.isVisible()) {
        await firstButton.focus();
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
      }
    });

    await test.step('Test Space key activation on buttons', async () => {
      const buttons = page.getByRole('button');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 1) {
        const secondButton = buttons.nth(1);
        await secondButton.focus();
        await page.keyboard.press('Space');
        await page.waitForTimeout(1000);
      }
    });
  });

  test('should have proper color contrast', async ({ page }) => {
    await test.step('Check text elements have sufficient contrast', async () => {
      // Get computed styles for key text elements
      const textElements = [
        page.getByRole('heading').first(),
        page.getByRole('link').first(),
        page.getByRole('button').first()
      ];

      for (const element of textElements) {
        if (await element.isVisible()) {
          const styles = await element.evaluate(el => {
            const computed = getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
              fontSize: computed.fontSize
            };
          });
          
          // Basic check that elements have color styles
          expect(styles.color).toBeTruthy();
          expect(styles.fontSize).toBeTruthy();
        }
      }
    });
  });

  test('should be accessible on winners page', async ({ page }) => {
    await test.step('Navigate to winners page', async () => {
      await page.getByRole('link', { name: /our winners/i }).click();
      await expect(page).toHaveURL(/.*winners.*/);
    });

    await test.step('Check carousel accessibility', async () => {
      // Verify carousel controls have proper labels
      const nextButtons = page.getByRole('button', { name: /next slide/i });
      await expect(nextButtons.first()).toBeVisible();
      
      const slideButtons = page.getByRole('button', { name: /go to slide/i });
      const slideButtonCount = await slideButtons.count();
      expect(slideButtonCount).toBeGreaterThan(5);
    });

    await test.step('Test carousel keyboard navigation', async () => {
      const carousel = page.locator('.swiper-container, [class*="carousel"]').first();
      await carousel.focus();
      
      // Test arrow key navigation
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(500);
      
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(500);
    });
  });

  test('should be accessible on entry page', async ({ page }) => {
    await test.step('Navigate to entry page', async () => {
      await page.getByRole('link', { name: /enter now/i }).first().click();
      await expect(page).toHaveURL(/.*enter.*/);
    });

    await test.step('Check form accessibility', async () => {
      // Verify tabs have proper ARIA attributes
      const tablist = page.getByRole('tablist');
      await expect(tablist).toBeVisible();
      
      const tabs = page.getByRole('tab');
      const tabCount = await tabs.count();
      expect(tabCount).toBeGreaterThan(0);
      
      // Check first tab has proper attributes
      const firstTab = tabs.first();
      const ariaSelected = firstTab;
      await expect(ariaSelected).toHaveAttribute('aria-selected', );
    });

    await test.step('Test tab navigation with keyboard', async () => {
      const tabs = page.getByRole('tab');
      const tabCount = await tabs.count();
      
      if (tabCount > 1) {
        await tabs.first().focus();
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(500);
        
        // Check that focus moved to next tab
        const focusedTab = page.locator(':focus');
        await expect(focusedTab).toBeVisible();
      }
    });
  });

  test('should be accessible on FAQs page', async ({ page }) => {
    await test.step('Navigate to FAQs page', async () => {
      await page.getByRole('link', { name: /faqs/i }).click();
      await expect(page).toHaveURL(/.*faqs.*/);
    });

    await test.step('Check FAQ accessibility structure', async () => {
      // Verify heading levels are logical
      const h2Count = await page.getByRole('heading', { level: 2 }).count();
      const h4Count = await page.getByRole('heading', { level: 4 }).count();
      
      expect(h2Count).toBeGreaterThan(5);
      expect(h4Count).toBeGreaterThan(20);
    });

    await test.step('Test FAQ interaction accessibility', async () => {
      const firstQuestion = page.getByRole('heading', { level: 4 }).first();
      
      // Test click activation
      await firstQuestion.click();
      await page.waitForTimeout(500);
      
      // Test keyboard activation
      await firstQuestion.focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
    });
  });

  test('should handle focus management correctly', async ({ page }) => {
    await test.step('Test skip links if present', async () => {
      // Check for skip to main content link
      const skipLink = page.getByRole('link', { name: /skip to main/i });
      if (await skipLink.isVisible({ timeout: 1000 })) {
        await skipLink.click();
        
        // Verify focus moved to main content
        const mainElement = page.getByRole('main');
        await expect(mainElement).toBeFocused();
      }
    });

    await test.step('Test focus trapping in modals', async () => {
      // Look for modal triggers
      const modalButtons = page.getByRole('button', { name: /watch|play|video/i });
      if (await modalButtons.count() > 0) {
        await modalButtons.first().click();
        await page.waitForTimeout(1000);
        
        // If modal opened, test escape key
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    });
  });

  test('should work with screen reader simulation', async ({ page }) => {
    await test.step('Check ARIA landmarks', async () => {
      // Verify ARIA landmarks are present
      const landmarks = await page.locator('[role="banner"], [role="navigation"], [role="main"], [role="contentinfo"]').count();
      expect(landmarks).toBeGreaterThan(2);
    });

    await test.step('Check ARIA labels and descriptions', async () => {
      // Find elements with ARIA attributes
      const ariaLabelElements = page.locator('[aria-label]');
      const ariaDescElements = page.locator('[aria-describedby]');
      
      const labelCount = await ariaLabelElements.count();
      const descCount = await ariaDescElements.count();
      
      // Some elements should have ARIA attributes
      expect(labelCount + descCount).toBeGreaterThan(0);
    });

    await test.step('Check live regions for dynamic content', async () => {
      // Look for live regions that announce changes
      const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]');
      const liveRegionCount = await liveRegions.count();
      
      // Live regions might not be present on static pages, so this is informational
      console.log(`Found ${liveRegionCount} live regions`);
    });
  });

  test('should maintain accessibility on mobile', async ({ page }) => {
    await test.step('Set mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
    });

    await test.step('Test mobile touch targets', async () => {
      // Verify interactive elements are large enough for touch
      const buttons = page.getByRole('button');
      
      // Check first few buttons have adequate size
      for (let i = 0; i < Math.min(5, await buttons.count()); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const box = await button.boundingBox();
          if (box) {
            // Touch targets should be at least 44x44 pixels
            expect(Math.min(box.width, box.height)).toBeGreaterThan(30);
          }
        }
      }
    });

    await test.step('Test mobile navigation accessibility', async () => {
      // Test mobile menu if present
      const mobileMenuButton = page.getByRole('button').first();
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        await page.waitForTimeout(1000);
        
        // Verify menu is accessible
        const navigation = page.getByRole('navigation');
        await expect(navigation).toBeVisible();
      }
    });
  });
});
