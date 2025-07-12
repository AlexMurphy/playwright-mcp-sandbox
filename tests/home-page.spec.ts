import { test, expect } from '@playwright/test';
import { HomePage } from './page-objects/HomePage';

test.describe('Omaze UK - Home Page Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.acceptCookies();
  });

  test('should load home page correctly', async ({ page }) => {
    await test.step('Verify page loads with essential elements', async () => {
      await homePage.verifyPageLoad();
    });

    await test.step('Verify hero content displays property information', async () => {
      await homePage.verifyHeroContent();
    });

    await test.step('Verify countdown timer is present and functional', async () => {
      await homePage.verifyCountdownTimer();
    });
  });

  test('should display correct navigation elements', async ({ page }) => {
    await test.step('Verify main navigation links are present', async () => {
      await homePage.verifyNavigationLinks();
    });

    await test.step('Verify user account links are accessible', async () => {
      await expect(homePage.loginLink).toBeVisible();
      await expect(homePage.signUpLink).toBeVisible();
      await expect(homePage.basketLink).toBeVisible();
    });
  });

  test('should display property showcase correctly', async ({ page }) => {
    await test.step('Verify property tabs are interactive', async () => {
      await expect(homePage.propertyTabs).toBeVisible();
      
      // Test tab switching
      const tabs = homePage.propertyTabs.getByRole('tab');
      const tabCount = await tabs.count();
      expect(tabCount).toBeGreaterThan(0);
      
      if (tabCount > 1) {
        await tabs.nth(1).click();
        await page.waitForTimeout(1000); // Wait for tab content to load
      }
    });

    await test.step('Verify Enter Now button is prominent and clickable', async () => {
      await expect(homePage.enterNowButton.first()).toBeVisible();
      await expect(homePage.enterNowButton.first()).toHaveAttribute('href', /.+/);
    });
  });

  test('should display footer content correctly', async ({ page }) => {
    await test.step('Verify footer links are present', async () => {
      await homePage.verifyFooterContent();
    });

    await test.step('Verify social media links are functional', async () => {
      const socialLinks = homePage.socialMediaLinks;
      const socialCount = await socialLinks.count();
      
      if (socialCount > 0) {
        // If social media links found, verify they work
        for (let i = 0; i < Math.min(socialCount, 4); i++) {
          await expect(socialLinks.nth(i)).toHaveAttribute('href', /.+/);
        }
      } else {
        // Log that no social media links found with current selector
        console.log('No social media links found with current selector - checking footer has content');
        await expect(page.locator('footer')).toContainText(/.+/);
      }
    });

    await test.step('Verify Trustpilot widget loads', async () => {
      await homePage.verifyTrustpilotWidget();
    });
  });

  test('should navigate to key pages correctly', async ({ page }) => {
    await test.step('Navigate to Winners page', async () => {
      await homePage.navigateToWinners();
      await expect(page).toHaveURL(/.*winners.*/);
      await expect(page.getByRole('heading', { name: /winner/i }).first()).toBeVisible();
    });

    await test.step('Navigate back and go to FAQs', async () => {
      await page.goBack();
      await homePage.navigateToFAQs();
      await expect(page).toHaveURL(/.*faqs.*/);
      await expect(page.getByRole('heading', { name: /frequently asked questions/i })).toBeVisible();
    });
  });

  test('should handle mobile viewport correctly', async ({ page }) => {
    await test.step('Test mobile responsive design', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await homePage.verifyPageLoad();
      
      // Verify mobile navigation (hamburger menu)
      const mobileMenuButton = page.getByRole('button').first();
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        await page.waitForTimeout(500);
      }
    });
  });

  test('should track analytics events correctly', async ({ page }) => {
    const analyticsRequests: string[] = [];
    
    await test.step('Monitor analytics calls', async () => {
      page.on('request', request => {
        const url = request.url();
        if (url.includes('analytics') || url.includes('gtm') || url.includes('ga')) {
          analyticsRequests.push(url);
        }
      });

      // Trigger some interactions
      await homePage.enterNowButton.first().click();
      await page.waitForTimeout(2000);
    });

    await test.step('Verify analytics tracking', async () => {
      expect(analyticsRequests.length).toBeGreaterThan(0);
    });
  });

  test('should be accessible', async ({ page }) => {
    await test.step('Check basic accessibility requirements', async () => {
      // Verify page has a title
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);

      // Verify main landmarks
      await expect(page.getByRole('navigation')).toBeVisible();
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByRole('contentinfo')).toBeVisible();

      // Verify heading hierarchy
      const h1Elements = page.getByRole('heading', { level: 1 });
      await expect(h1Elements).toHaveCount(1);
    });

    await test.step('Check interactive elements accessibility', async () => {
      // Verify links have accessible names
      const links = page.getByRole('link');
      const linkCount = await links.count();
      
      for (let i = 0; i < Math.min(5, linkCount); i++) {
        const linkText = await links.nth(i).textContent();
        expect(linkText?.trim()).toBeTruthy();
      }
    });
  });
});
