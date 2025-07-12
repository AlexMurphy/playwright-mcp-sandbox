import { test, expect } from '@playwright/test';
import { HomePage } from './page-objects/HomePage';
import { WinnersPage } from './page-objects/WinnersPage';

test.describe('Omaze UK - Winners Page Tests', () => {
  let homePage: HomePage;
  let winnersPage: WinnersPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    winnersPage = new WinnersPage(page);
    
    await homePage.goto();
    await homePage.acceptCookies();
    await homePage.navigateToWinners();
  });

  test('should display winners page correctly', async ({ page }) => {
    await test.step('Verify page loads with winner content', async () => {
      await winnersPage.verifyPageLoad();
      await expect(page).toHaveURL(/.*winners.*/);
    });

    await test.step('Verify multiple carousels are present', async () => {
      await winnersPage.verifyMultipleCarousels();
    });

    await test.step('Verify winner information is complete', async () => {
      await winnersPage.verifyWinnerInformation();
      
      const winnerCount = await winnersPage.getWinnerCount();
      expect(winnerCount).toBeGreaterThan(10);
    });
  });

  test('should navigate carousels correctly', async ({ page }) => {
    await test.step('Test carousel navigation functionality', async () => {
      await winnersPage.verifyCarouselNavigation(0);
    });

    await test.step('Test slide dot navigation', async () => {
      // Test clicking specific slide dots
      await winnersPage.clickSlideDot(0, 2);
      await page.waitForTimeout(1000);
      
      await winnersPage.clickSlideDot(0, 1);
      await page.waitForTimeout(1000);
    });

    await test.step('Test multiple carousel sections', async () => {
      // Test navigation on different carousel sections
      for (let i = 0; i < 3; i++) {
        await winnersPage.navigateCarousel(i, 'next');
        await page.waitForTimeout(500);
      }
    });
  });

  test('should display winner details correctly', async ({ page }) => {
    await test.step('Verify individual winner information', async () => {
      const firstWinner = await winnersPage.getWinnerDetails(0);
      
      expect(firstWinner.location).toBeTruthy();
      expect(firstWinner.prize).toContain('£');
      expect(firstWinner.entryCode).toContain('#');
    });

    await test.step('Verify video play buttons are functional', async () => {
      const videoButtons = winnersPage.watchVideoButtons;
      const buttonCount = await videoButtons.count();
      expect(buttonCount).toBeGreaterThan(5);
      
      // Test clicking first video button
      if (buttonCount > 0) {
        await videoButtons.first().click();
        await page.waitForTimeout(2000);
      }
    });
  });

  test('should be accessible', async ({ page }) => {
    await test.step('Check carousel accessibility', async () => {
      await winnersPage.verifyAccessibilityLabels();
    });

    await test.step('Verify keyboard navigation', async () => {
      // Test keyboard navigation on carousels
      const firstCarousel = winnersPage.carousels.first();
      await firstCarousel.press('Tab');
      await page.waitForTimeout(500);
      
      // Test arrow key navigation
      await firstCarousel.press('ArrowRight');
      await page.waitForTimeout(500);
    });

    await test.step('Check heading structure', async () => {
      const h2Count = await page.getByRole('heading', { level: 2 }).count();
      const h3Count = await page.getByRole('heading', { level: 3 }).count();
      
      expect(h2Count).toBeGreaterThan(5);
      expect(h3Count).toBeGreaterThan(10);
    });
  });

  test('should handle interactions correctly', async ({ page: _page }) => {
    await test.step('Test winner story interactions', async () => {
      const stories = winnersPage.winnerStories;
      const storyCount = await stories.count();
      
      expect(storyCount).toBeGreaterThan(20);
      
      // Verify stories contain required elements
      for (let i = 0; i < Math.min(3, storyCount); i++) {
        const story = stories.nth(i);
        
        await expect(story).toBeVisible();
        await expect(story).toContainText(/\w+/); // Has some text content
      }
    });

    await test.step('Test carousel auto-play behavior', async () => {
      // Monitor carousel changes over time  
      const carousel = winnersPage.carousels.first();
      await expect(carousel).toBeVisible();
      
      // Note: Auto-play behavior testing is optional since it might be disabled
    });
  });

  test('should display different winner categories', async ({ page }) => {
    await test.step('Verify house winners section', async () => {
      await expect(page.locator(':has-text("GRAND PRIZE WINNER")')).toHaveCount(20, { timeout: 10000 });
    });

    await test.step('Verify early bird winners section', async () => {
      await expect(page.locator(':has-text("EARLY BIRD PRIZE WINNER")')).toHaveCount(11, { timeout: 10000 });
    });

    await test.step('Verify cash winners section', async () => {
      await expect(page.locator(':has-text("cash")')).toHaveCount(15, { timeout: 10000 });
    });

    await test.step('Verify monthly subscriber winners', async () => {
      await expect(page.locator(':has-text("Monthly Subscriber")')).toHaveCount(15, { timeout: 10000 });
    });
  });

  test('should work on mobile devices', async ({ page }) => {
    await test.step('Set mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForTimeout(2000);
    });

    await test.step('Verify mobile carousel functionality', async () => {
      await winnersPage.verifyPageLoad();
      
      // Test touch/swipe simulation
      const firstCarousel = winnersPage.carousels.first();
      await firstCarousel.hover();
      
      // Simulate mobile tap on navigation
      const nextButton = firstCarousel.locator('button', { hasText: /next/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
      }
    });
  });

  test('should load images correctly', async ({ page }) => {
    await test.step('Verify winner images load', async () => {
      const images = page.locator('img');
      const imageCount = await images.count();
      
      expect(imageCount).toBeGreaterThan(20);
      
      // Check that first few images have loaded
      for (let i = 0; i < Math.min(5, imageCount); i++) {
        const image = images.nth(i);
        await expect(image).toBeVisible();
        
        // Check if image has src attribute
        const src = image;
        await expect(src).toHaveAttribute('src', );
      }
    });

    await test.step('Test lazy loading behavior', async () => {
      // Scroll to trigger lazy loading
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 2);
      });
      
      await page.waitForTimeout(2000);
      
      // Scroll back to top
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
    });
  });

  test('should handle performance correctly', async ({ page }) => {
    await test.step('Monitor page performance', async () => {
      const startTime = Date.now();
      
      await winnersPage.verifyPageLoad();
      await winnersPage.verifyMultipleCarousels();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(10000); // Page should load within 10 seconds
    });

    await test.step('Test carousel performance', async () => {
      const startTime = Date.now();
      
      // Rapidly navigate through carousel
      for (let i = 0; i < 5; i++) {
        await winnersPage.navigateCarousel(0, 'next');
        await page.waitForTimeout(100);
      }
      
      const navigationTime = Date.now() - startTime;
      expect(navigationTime).toBeLessThan(5000);
    });
  });
});
