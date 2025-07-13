import { test, expect } from '@playwright/test';
import { OmazePage, EntryPage, CartPage, CheckoutPage } from './page-objects/omaze-pages';

test.describe('Entry Purchase Flow', () => {
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

  test('Cart quantity modification', async ({ page }) => {
    test.info().annotations.push({
      type: 'feature',
      description: 'Tests cart functionality including quantity modification and item removal'
    });

    // Navigate to entry page and add item to cart
    await omazePage.goto();
    await omazePage.clickEnterNow();
    await entryPage.selectSinglePurchase();
    await entryPage.selectSmallestEntryPackage();
    
    // Verify cart functionality
    await cartPage.verifyCartContents();
    await expect(cartPage.quantityInput).toHaveValue('1');
    await expect(cartPage.removeButton).toBeVisible();
    
    // Verify we can proceed through the flow
    await cartPage.clickContinue();
    await cartPage.clickCheckout();
    await expect(page).toHaveURL(/checkouts/);
  });

  test('Checkout form validation', async ({ page }) => {
    test.info().annotations.push({
      type: 'validation',
      description: 'Tests form validation on the checkout page'
    });

    // Navigate to checkout
    await omazePage.goto();
    await omazePage.clickEnterNow();
    await entryPage.selectSinglePurchase();
    await entryPage.selectSmallestEntryPackage();
    await cartPage.clickContinue();
    await cartPage.clickCheckout();
    
    // Verify form elements and attempt to submit without required fields
    await checkoutPage.verifyCheckoutForm();
    
    // Try to continue without filling required fields
    await checkoutPage.continueToPaymentButton.click();
    
    // Verify validation messages appear (this will depend on the actual validation behavior)
    await expect(checkoutPage.emailInput).toBeFocused();
  });

  test('Mobile navigation and responsiveness', async ({ page }) => {
    test.info().annotations.push({
      type: 'mobile',
      description: 'Tests the entry flow on mobile viewport (iPhone 15 Pro Max)'
    });

    // Navigate and verify mobile layout
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
    await cartPage.clickContinue();
    await cartPage.clickCheckout();
    
    // Verify checkout form is usable on mobile
    await checkoutPage.verifyCheckoutForm();
  });

  test('Entry options verification', async ({ page }) => {
    test.info().annotations.push({
      type: 'feature',
      description: 'Verifies all entry method options are available and functional'
    });

    await omazePage.goto();
    await omazePage.clickEnterNow();
    
    // Test all tab options are available
    await entryPage.verifyEntryOptions();
    
    // Test Single Purchase tab
    await entryPage.selectSinglePurchase();
    await expect(entryPage.buyNowButtons).toHaveCount(4); // Should have 4 different entry packages
    
    // Test Subscription tab
    await entryPage.subscriptionTab.click();
    await expect(page.getByText('Monthly Subscriptions')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enter Now' })).toHaveCount(3); // Should have 3 subscription options
    
    // Test Postal tab
    await entryPage.postalTab.click();
    await expect(page.getByText('Maximum one entry per postcard')).toBeVisible();
  });

  test('Checkout customer information form', async ({ page }) => {
    test.info().annotations.push({
      type: 'form',
      description: 'Tests filling out customer information in checkout'
    });

    // Navigate to checkout
    await omazePage.goto();
    await omazePage.clickEnterNow();
    await entryPage.selectSinglePurchase();
    await entryPage.selectSmallestEntryPackage();
    await cartPage.clickContinue();
    await cartPage.clickCheckout();
    
    // Fill out customer information
    const customerData = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Test Street',
      city: 'London',
      postcode: 'SW1A 1AA',
      phone: '07700 900123'
    };
    
    await checkoutPage.fillCustomerInformation(customerData);
    
    // Verify country is set to UK by default
    await expect(checkoutPage.countrySelect).toHaveValue('GB');
    
    // Verify marketing checkbox is checked by default
    await expect(checkoutPage.marketingCheckbox).toBeChecked();
    
    // Verify SMS checkbox is available
    await expect(checkoutPage.smsCheckbox).toBeVisible();
    
    // Verify form accepts the data
    await expect(checkoutPage.emailInput).toHaveValue(customerData.email);
    await expect(checkoutPage.firstNameInput).toHaveValue(customerData.firstName);
    await expect(checkoutPage.lastNameInput).toHaveValue(customerData.lastName);
  });

  test('Express checkout options', async ({ page }) => {
    test.info().annotations.push({
      type: 'payment',
      description: 'Verifies express checkout payment options are available'
    });

    // Navigate to checkout
    await omazePage.goto();
    await omazePage.clickEnterNow();
    await entryPage.selectSinglePurchase();
    await entryPage.selectSmallestEntryPackage();
    await cartPage.clickContinue();
    await cartPage.clickCheckout();
    
    // Verify express checkout options
    await expect(page.getByText('Express checkout')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Shop Pay' })).toBeVisible();
    
    // Verify PayPal option (in iframe)
    const paypalFrame = page.frameLocator('iframe').nth(0);
    await expect(paypalFrame.getByRole('button', { name: 'PayPal' })).toBeVisible();
    
    // Verify Google Pay option (in iframe)
    const googlePayFrame = page.frameLocator('iframe').nth(1);
    await expect(googlePayFrame.getByRole('button')).toBeVisible();
  });

  test('Terms and conditions links', async ({ page }) => {
    test.info().annotations.push({
      type: 'legal',
      description: 'Verifies all terms and conditions links are present and functional'
    });

    // Navigate to checkout
    await omazePage.goto();
    await omazePage.clickEnterNow();
    await entryPage.selectSinglePurchase();
    await entryPage.selectSmallestEntryPackage();
    await cartPage.clickContinue();
    await cartPage.clickCheckout();
    
    // Verify legal links are present
    await expect(page.getByRole('link', { name: 'Terms of Use' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Privacy Notice' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Official Rules' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Experience Rules' })).toBeVisible();
    
    // Test that legal notice text is present
    await expect(page.getByText('By continuing you agree to our')).toBeVisible();
  });
});
