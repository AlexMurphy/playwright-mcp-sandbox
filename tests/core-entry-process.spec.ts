import { test, expect } from '@playwright/test';
import { OmazePage, EntryPage, CartPage, CheckoutPage } from './page-objects/omaze-pages';

test.describe('Entry Purchase Flow - Core Tests', () => {
  let omazePage: OmazePage;
  let entryPage: EntryPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    omazePage = new OmazePage(page);
    entryPage = new EntryPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
  });

  test('Complete entry purchase flow - Single Purchase', async ({ page }) => {
    test.info().annotations.push({
      type: 'feature',
      description: 'Tests the complete flow from homepage to checkout for single purchase entries'
    });

    // Step 1: Navigate to homepage and verify key elements
    await omazePage.goto();
    await expect(page).toHaveTitle(/Omaze UK/);
    await omazePage.verifyNavigationElements();
    
    // Step 2: Click Enter Now to access entry options
    await omazePage.clickEnterNow();
    await expect(page).toHaveURL(/enter-cheshire/);
    await expect(page).toHaveTitle(/Enter the Cheshire House Draw/);
    
    // Step 3: Select Single Purchase option and verify entry packages
    await entryPage.verifyEntryOptions();
    await entryPage.selectSinglePurchase();
    
    // Step 4: Purchase the smallest entry package (20 entries for £10)
    await entryPage.selectSmallestEntryPackage();
    await expect(page).toHaveURL(/cart/);
    
    // Step 5: Verify cart contents and progress through checkout steps
    await cartPage.verifyCartContents();
    await cartPage.verifyOrderTotal('£10');
    
    // Step 6: Continue to bonus entries step
    await cartPage.clickContinue();
    await expect(page.getByText('Special Offer').first()).toBeVisible();
    
    // Step 7: Proceed to checkout without bonus entries
    await cartPage.clickCheckout();
    await expect(page).toHaveURL(/checkouts/);
    await expect(page).toHaveTitle(/Checkout/);
    
    // Step 8: Verify checkout form elements
    await checkoutPage.verifyCheckoutForm();
    await checkoutPage.verifyRequiredFields();
  });

  test('Entry page functionality and mobile responsiveness', async ({ page }) => {
    test.info().annotations.push({
      type: 'mobile',
      description: 'Tests entry page functionality on mobile viewport'
    });

    await omazePage.goto();
    
    // Verify mobile navigation works
    await expect(omazePage.navigation).toBeVisible();
    await omazePage.verifyNavigationElements();
    
    // Test complete mobile flow
    await omazePage.clickEnterNow();
    await entryPage.verifyEntryOptions();
    await entryPage.selectSinglePurchase();
    
    // Verify buy buttons are accessible on mobile
    await expect(entryPage.buyNowButtons.first()).toBeVisible();
    await entryPage.selectSmallestEntryPackage();
    
    // Verify cart is functional on mobile
    await cartPage.verifyCartContents();
  });
});
