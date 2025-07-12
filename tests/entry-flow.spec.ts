import { test, expect } from '@playwright/test';
import { HomePage } from './page-objects/HomePage';
import { EntryPage } from './page-objects/EntryPage';
import { CartPage } from './page-objects/CartPage';

test.describe('Omaze UK - Entry Flow Tests', () => {
  let homePage: HomePage;
  let entryPage: EntryPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    entryPage = new EntryPage(page);
    cartPage = new CartPage(page);
    
    await homePage.goto();
    await homePage.acceptCookies();
  });

  test('should complete subscription entry flow', async ({ page }) => {
    await test.step('Navigate to entry page', async () => {
      await homePage.clickEnterNow();
      await expect(page).toHaveURL(/.*enter.*/);
      await entryPage.verifyPageLoad();
    });

    await test.step('Verify subscription options are displayed', async () => {
      await entryPage.verifySubscriptionOptions();
      await entryPage.verifyDiscountOffer();
      await entryPage.verifyCharityInformation();
    });

    await test.step('Select subscription option', async () => {
      await entryPage.selectSubscriptionOption(0); // Select first option
      await page.waitForTimeout(2000); // Wait for navigation/processing
    });

    await test.step('Verify cart page loads correctly', async () => {
      await expect(page).toHaveURL(/.*cart.*/);
      await cartPage.verifyPageLoad();
      await cartPage.verifyBasketContents();
    });

    await test.step('Verify progress indicator', async () => {
      await cartPage.verifyProgressSteps();
      await cartPage.verifyDiscountApplied();
    });

    await test.step('Fill required form fields', async () => {
      await cartPage.selectHowDidYouHear('Social media');
      await cartPage.verifyLegalInformation();
    });
  });

  test('should display correct pricing information', async ({ page: _page }) => {
    await test.step('Navigate to entry page and verify pricing', async () => {
      await homePage.clickEnterNow();
      await entryPage.verifyPageLoad();
      
      // Verify multiple subscription tiers with different prices
      const firstOptionPrice = await entryPage.getPriceText(0);
      const secondOptionPrice = await entryPage.getPriceText(1);
      
      expect(firstOptionPrice).toContain('£');
      expect(secondOptionPrice).toContain('£');
      expect(firstOptionPrice).not.toBe(secondOptionPrice);
    });

    await test.step('Verify entries count for each tier', async () => {
      const firstOptionEntries = await entryPage.getEntriesCount(0);
      const secondOptionEntries = await entryPage.getEntriesCount(1);
      
      expect(firstOptionEntries).toContain('100');
      expect(secondOptionEntries).toContain('200');
    });
  });

  test('should handle different entry methods', async ({ page }) => {
    await test.step('Test postal entry option', async () => {
      await homePage.clickEnterNow();
      await entryPage.verifyPageLoad();
      
      await entryPage.selectPostalEntry();
      await page.waitForTimeout(1000);
      
      // Verify postal entry information is displayed
      await entryPage.verifyLegalCompliance();
    });

    await test.step('Test single purchase option', async () => {
      await entryPage.selectSinglePurchase();
      await page.waitForTimeout(1000);
      
      // Verify single purchase options are available
      const enterButtons = entryPage.enterNowButtons;
      const buttonCount = await enterButtons.count();
      expect(buttonCount).toBeGreaterThan(0);
    });
  });

  test('should validate form requirements', async ({ page }) => {
    await test.step('Navigate through entry flow to cart', async () => {
      await homePage.clickEnterNow();
      await entryPage.selectSubscriptionOption(0);
      await cartPage.verifyPageLoad();
    });

    await test.step('Test form validation', async () => {
      // Try to proceed without filling required fields
      const nextButton = cartPage.nextButton;
      
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        
        // Check if we stayed on the same page (validation failed)
        await expect(page).toHaveURL(/.*cart.*/);
      }
    });

    await test.step('Fill form and verify progression', async () => {
      await cartPage.selectHowDidYouHear('Social media');
      
      // Note: We won't complete the full payment flow in tests
      // but we can verify the form accepts the input
      const cartTotal = await cartPage.getCartTotal();
      expect(cartTotal).toContain('£');
    });
  });

  test('should handle network requests correctly', async ({ page }) => {
    const apiRequests: string[] = [];
    
    await test.step('Monitor API calls during entry flow', async () => {
      page.on('request', request => {
        const url = request.url();
        if (url.includes('/api/') || url.includes('produce_batch') || url.includes('graphql')) {
          apiRequests.push(url);
        }
      });

      await homePage.clickEnterNow();
      await entryPage.selectSubscriptionOption(0);
      await page.waitForTimeout(3000);
    });

    await test.step('Verify API interactions', async () => {
      expect(apiRequests.length).toBeGreaterThan(0);
      
      // Check for Shopify API calls
      const shopifyAPIs = apiRequests.filter(url => 
        url.includes('shopify') || url.includes('monorail')
      );
      expect(shopifyAPIs.length).toBeGreaterThan(0);
    });
  });

  test('should work correctly on mobile devices', async ({ page }) => {
    await test.step('Set mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
    });

    await test.step('Complete mobile entry flow', async () => {
      await homePage.clickEnterNow();
      await entryPage.verifyPageLoad();
      
      // Verify mobile layout displays correctly
      await expect(entryPage.subscriptionOptions).toBeVisible();
      await expect(entryPage.enterNowButtons.first()).toBeVisible();
    });

    await test.step('Test mobile interaction', async () => {
      await entryPage.selectSubscriptionOption(0);
      await page.waitForTimeout(2000);
      
      if (await page.url().includes('cart')) {
        await cartPage.verifyPageLoad();
      }
    });
  });

  test('should validate accessibility in entry flow', async ({ page }) => {
    await test.step('Check entry page accessibility', async () => {
      await homePage.clickEnterNow();
      await entryPage.verifyPageLoad();
      
      // Verify form labels and structure
      const headings = page.getByRole('heading');
      const buttons = page.getByRole('button');
      const tabList = page.getByRole('tablist');
      
      await expect(headings.first()).toBeVisible();
      await expect(buttons.first()).toBeVisible();
      await expect(tabList).toBeVisible();
    });

    await test.step('Check cart page accessibility', async () => {
      await entryPage.selectSubscriptionOption(0);
      
      if (await page.url().includes('cart')) {
        // Verify form elements have proper labels
        const dropdown = cartPage.howDidYouHearDropdown;
        await expect(dropdown).toBeVisible();
        
        // Verify progress indicator is accessible
        await expect(cartPage.progressIndicator).toBeVisible();
      }
    });
  });

  test('should handle error scenarios gracefully', async ({ page }) => {
    await test.step('Test with slow network', async () => {
      // Simulate slow network
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 100);
      });
      
      await homePage.clickEnterNow();
      await entryPage.verifyPageLoad();
    });

    await test.step('Test with navigation interruption', async () => {
      await entryPage.selectSubscriptionOption(0);
      
      // Quickly navigate back
      await page.goBack();
      await page.waitForTimeout(1000);
      
      // Verify we can navigate forward again
      await page.goForward();
      await page.waitForTimeout(1000);
    });
  });
});
