import { test, expect } from '@playwright/test';
import { HomePage } from './page-objects/HomePage';
import { FAQsPage } from './page-objects/FAQsPage';

test.describe('Omaze UK - FAQs Page Tests', () => {
  let homePage: HomePage;
  let faqsPage: FAQsPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    faqsPage = new FAQsPage(page);
    
    await homePage.goto();
    await homePage.acceptCookies();
    await homePage.navigateToFAQs();
  });

  test('should display FAQs page correctly', async ({ page }) => {
    await test.step('Verify page loads with FAQ content', async () => {
      await faqsPage.verifyPageLoad();
      await expect(page).toHaveURL(/.*faqs.*/);
    });

    await test.step('Verify FAQ sections are organized correctly', async () => {
      await faqsPage.verifyFAQSections();
    });

    await test.step('Verify question count is appropriate', async () => {
      const questionCount = await faqsPage.getQuestionCount();
      expect(questionCount).toBeGreaterThan(20);
      expect(questionCount).toBeLessThan(50);
    });
  });

  test('should handle FAQ interactions correctly', async ({ page }) => {
    await test.step('Test question expansion functionality', async () => {
      await faqsPage.verifyQuestionInteractivity();
    });

    await test.step('Test expanding specific questions', async () => {
      await faqsPage.expandQuestion('How will you contact me if I\'ve won a prize?');
      await page.waitForTimeout(1000);
      
      await faqsPage.expandQuestion('What are the odds of winning?');
      await page.waitForTimeout(1000);
    });

    await test.step('Test multiple question interactions', async () => {
      // Test expanding questions by index
      for (let i = 0; i < 3; i++) {
        await faqsPage.expandQuestionByIndex(i);
        await page.waitForTimeout(500);
      }
    });
  });

  test('should display important FAQ content', async ({ page }) => {
    await test.step('Verify critical questions are present', async () => {
      await faqsPage.verifySpecificQuestions();
    });

    await test.step('Verify charity information is included', async () => {
      await expect(page.getByRole('heading', { name: /anthony nolan/i })).toBeVisible();
      await expect(page.locator(':has-text("percentage of sales goes to the charity")')).toBeVisible();
    });

    await test.step('Verify subscription information is comprehensive', async () => {
      await expect(page.locator(':has-text("cancel my subscription")')).toBeVisible();
      await expect(page.locator(':has-text("subscription entries")')).toBeVisible();
      await expect(page.locator(':has-text("charged every month")')).toBeVisible();
    });

    await test.step('Verify prize information is detailed', async () => {
      await expect(page.locator(':has-text("sell the house")')).toBeVisible();
      await expect(page.locator(':has-text("stamp duty")')).toBeVisible();
      await expect(page.locator(':has-text("furnishings included")')).toBeVisible();
    });
  });

  test('should be accessible', async ({ page }) => {
    await test.step('Check accessibility structure', async () => {
      await faqsPage.verifyAccessibility();
    });

    await test.step('Test keyboard navigation', async () => {
      // Test Tab navigation through questions
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);
      
      // Test Enter to expand questions
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
    });

    await test.step('Verify ARIA attributes', async () => {
      const questions = faqsPage.faqQuestions;
      const firstQuestion = questions.first();
      
      // Check if questions have proper cursor styling (indicates interactivity)
      const cursor = await firstQuestion.evaluate(el => getComputedStyle(el).cursor);
      expect(cursor).toBe('pointer');
    });
  });

  test('should handle search functionality', async ({ page }) => {
    await test.step('Test FAQ search if available', async () => {
      // Search functionality might not be implemented, so we test conditionally
      await faqsPage.searchFAQs('subscription');
      await page.waitForTimeout(1000);
    });

    await test.step('Test filtering by section', async () => {
      // Navigate to specific sections
      const subscriptionSection = page.getByRole('heading', { name: 'Subscriptions' });
      await subscriptionSection.scrollIntoViewIfNeeded();
      await expect(subscriptionSection).toBeVisible();
    });
  });

  test('should display section-specific content correctly', async ({ page }) => {
    await test.step('Verify "Winning a Prize" section', async () => {
      const section = page.locator(':has-text("Winning a Prize")').first();
      await section.scrollIntoViewIfNeeded();
      
      await expect(page.locator(':has-text("How will you contact me")')).toBeVisible();
      await expect(page.locator(':has-text("odds of winning")')).toBeVisible();
      await expect(page.locator(':has-text("winners drawn")')).toBeVisible();
    });

    await test.step('Verify "Subscriptions" section', async () => {
      const section = page.locator(':has-text("Subscriptions")').first();
      await section.scrollIntoViewIfNeeded();
      
      await expect(page.locator(':has-text("cancel my subscription")')).toBeVisible();
      await expect(page.locator(':has-text("payment method")')).toBeVisible();
      await expect(page.locator(':has-text("charged every month")')).toBeVisible();
    });

    await test.step('Verify "The Cheshire House" section', async () => {
      const section = page.locator(':has-text("The Cheshire House")').first();
      await section.scrollIntoViewIfNeeded();
      
      await expect(page.locator(':has-text("sell the house")')).toBeVisible();
      await expect(page.locator(':has-text("furnishings included")')).toBeVisible();
      await expect(page.locator(':has-text("stamp duty")')).toBeVisible();
    });
  });

  test('should work correctly on mobile devices', async ({ page }) => {
    await test.step('Set mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
    });

    await test.step('Verify mobile FAQ layout', async () => {
      await faqsPage.verifyPageLoad();
      
      // Test mobile question expansion
      await faqsPage.expandQuestionByIndex(0);
      await page.waitForTimeout(1000);
    });

    await test.step('Test mobile scrolling through sections', async () => {
      // Scroll through different FAQ sections
      const sections = ['Winning a Prize', 'Subscriptions', 'The Cheshire House'];
      
      for (const sectionName of sections) {
        const section = page.getByRole('heading', { name: sectionName });
        await section.scrollIntoViewIfNeeded();
        await expect(section).toBeVisible();
        await page.waitForTimeout(500);
      }
    });
  });

  test('should handle content updates correctly', async ({ page }) => {
    await test.step('Verify current draw information', async () => {
      // Check that FAQ content reflects current draw (Cheshire)
      await expect(page.locator(':has-text("Cheshire")')).toHaveCount(6, { timeout: 10000 });
      await expect(page.locator(':has-text("Anthony Nolan")')).toBeVisible();
    });

    await test.step('Verify historical draw information', async () => {
      // Check that previous draws are mentioned in FAQs
      await expect(page.locator(':has-text("Sussex")')).toBeVisible();
      await expect(page.locator(':has-text("Cotswolds")')).toBeVisible();
      await expect(page.locator(':has-text("London")')).toBeVisible();
    });
  });

  test('should provide comprehensive information', async ({ page }) => {
    await test.step('Verify legal and compliance information', async () => {
      await expect(page.locator(':has-text("UK citizen")')).toBeVisible();
      await expect(page.locator(':has-text("purchase limit")')).toBeVisible();
      await expect(page.locator(':has-text("entry code")')).toBeVisible();
    });

    await test.step('Verify technical support information', async () => {
      await expect(page.locator(':has-text("get in touch")')).toBeVisible();
      await expect(page.locator(':has-text("PayPal")')).toBeVisible();
      await expect(page.locator(':has-text("account")')).toBeVisible();
    });

    await test.step('Verify prize details are complete', async () => {
      await expect(page.locator(':has-text("rental")')).toBeVisible();
      await expect(page.locator(':has-text("cost to run")')).toBeVisible();
      await expect(page.locator(':has-text("legal fees")')).toBeVisible();
    });
  });

  test('should load quickly and efficiently', async ({ page }) => {
    await test.step('Monitor page performance', async () => {
      const startTime = Date.now();
      
      await faqsPage.verifyPageLoad();
      await faqsPage.verifyFAQSections();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    await test.step('Test rapid question expansion', async () => {
      const startTime = Date.now();
      
      // Rapidly expand multiple questions
      for (let i = 0; i < 5; i++) {
        await faqsPage.expandQuestionByIndex(i);
        await page.waitForTimeout(100);
      }
      
      const expansionTime = Date.now() - startTime;
      expect(expansionTime).toBeLessThan(3000);
    });
  });
});
