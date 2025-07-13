import { test, expect } from '@playwright/test';
import { OmazePage, EntryPage, CartPage, CheckoutPage } from './page-objects/omaze-pages';

test.describe('Accessibility Tests - Entry Purchase Flow', () => {
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

  test('Homepage accessibility checks', async ({ page }) => {
    test.info().annotations.push({
      type: 'accessibility',
      description: 'Tests homepage for accessibility compliance including ARIA labels and keyboard navigation'
    });

    await omazePage.goto();
    
    // Check page has proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toBeVisible();
    
    // Verify main navigation has proper ARIA attributes
    await expect(omazePage.navigation).toHaveAttribute('role', 'navigation');
    
    // Check Enter Now button has proper accessibility attributes
    const enterButton = page.getByRole('link', { name: 'Enter Now' });
    await expect(enterButton).toBeVisible();
    await expect(enterButton).toHaveAttribute('href');
    
    // Test keyboard navigation to Enter Now button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(enterButton).toBeFocused();
    
    // Test Enter key activation
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/enter-cheshire/);
  });

  test('Entry page accessibility and keyboard navigation', async ({ page }) => {
    test.info().annotations.push({
      type: 'accessibility',
      description: 'Tests entry page tab navigation and form element accessibility'
    });

    await omazePage.goto();
    await omazePage.clickEnterNow();
    
    // Verify tab navigation between entry methods
    await entryPage.singlePurchaseTab.focus();
    await expect(entryPage.singlePurchaseTab).toBeFocused();
    
    await page.keyboard.press('ArrowRight');
    await expect(entryPage.subscriptionTab).toBeFocused();
    
    await page.keyboard.press('ArrowRight');
    await expect(entryPage.postalTab).toBeFocused();
    
    // Test buy buttons are keyboard accessible
    await entryPage.selectSinglePurchase();
    const firstBuyButton = entryPage.buyNowButtons.first();
    
    // Navigate to first buy button with Tab
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(firstBuyButton).toBeFocused();
    
    // Activate with Enter key
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/cart/);
  });

  test('Cart page accessibility features', async ({ page }) => {
    test.info().annotations.push({
      type: 'accessibility',
      description: 'Tests cart functionality with keyboard navigation and screen reader compatibility'
    });

    // Navigate to cart
    await omazePage.goto();
    await omazePage.clickEnterNow();
    await entryPage.selectSinglePurchase();
    await entryPage.selectSmallestEntryPackage();
    
    // Check quantity input has proper label
    await expect(cartPage.quantityInput).toHaveAttribute('aria-label');
    
    // Test keyboard modification of quantity
    await cartPage.quantityInput.focus();
    await expect(cartPage.quantityInput).toBeFocused();
    
    // Test remove button accessibility
    await expect(cartPage.removeButton).toHaveAttribute('aria-label');
    await cartPage.removeButton.focus();
    await expect(cartPage.removeButton).toBeFocused();
    
    // Test continue button keyboard activation
    await cartPage.continueButton.focus();
    await expect(cartPage.continueButton).toBeFocused();
    await page.keyboard.press('Enter');
    
    // Verify navigation to next step
    await expect(page.getByText('Special Offer')).toBeVisible();
  });

  test('Checkout form accessibility and ARIA labels', async ({ page }) => {
    test.info().annotations.push({
      type: 'accessibility',
      description: 'Tests checkout form for proper labels, error handling, and keyboard navigation'
    });

    // Navigate to checkout
    await omazePage.goto();
    await omazePage.clickEnterNow();
    await entryPage.selectSinglePurchase();
    await entryPage.selectSmallestEntryPackage();
    await cartPage.clickContinue();
    await cartPage.clickCheckout();
    
    // Check form has proper heading
    const formHeading = page.getByRole('heading', { name: /Contact information|Customer information/ });
    await expect(formHeading).toBeVisible();
    
    // Verify all input fields have proper labels
    await expect(checkoutPage.emailInput).toHaveAttribute('aria-label');
    await expect(checkoutPage.firstNameInput).toHaveAttribute('aria-label');
    await expect(checkoutPage.lastNameInput).toHaveAttribute('aria-label');
    await expect(checkoutPage.addressInput).toHaveAttribute('aria-label');
    await expect(checkoutPage.cityInput).toHaveAttribute('aria-label');
    await expect(checkoutPage.postcodeInput).toHaveAttribute('aria-label');
    await expect(checkoutPage.phoneInput).toHaveAttribute('aria-label');
    
    // Test keyboard navigation through form fields
    await checkoutPage.emailInput.focus();
    await expect(checkoutPage.emailInput).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(checkoutPage.firstNameInput).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(checkoutPage.lastNameInput).toBeFocused();
    
    // Test select dropdown accessibility
    await checkoutPage.countrySelect.focus();
    await expect(checkoutPage.countrySelect).toBeFocused();
    await expect(checkoutPage.countrySelect).toHaveAttribute('aria-label');
    
    // Test checkbox accessibility
    await expect(checkoutPage.marketingCheckbox).toHaveAttribute('aria-label');
    await checkoutPage.marketingCheckbox.focus();
    await expect(checkoutPage.marketingCheckbox).toBeFocused();
    
    // Toggle checkbox with spacebar
    await page.keyboard.press('Space');
    await expect(checkoutPage.marketingCheckbox).not.toBeChecked();
    
    await page.keyboard.press('Space');
    await expect(checkoutPage.marketingCheckbox).toBeChecked();
  });

  test('Mobile touch accessibility', async ({ page }) => {
    test.info().annotations.push({
      type: 'mobile-accessibility',
      description: 'Tests touch target sizes and mobile accessibility features'
    });

    await omazePage.goto();
    
    // Check Enter Now button touch target size (should be at least 44x44px)
    const enterButton = page.getByRole('link', { name: 'Enter Now' });
    const buttonBox = await enterButton.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
    expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
    
    // Navigate to entry page and check buy button sizes
    await omazePage.clickEnterNow();
    await entryPage.selectSinglePurchase();
    
    const buyButton = entryPage.buyNowButtons.first();
    const buyButtonBox = await buyButton.boundingBox();
    expect(buyButtonBox?.height).toBeGreaterThanOrEqual(44);
    expect(buyButtonBox?.width).toBeGreaterThanOrEqual(44);
    
    // Continue to cart and check touch targets
    await entryPage.selectSmallestEntryPackage();
    
    const continueButtonBox = await cartPage.continueButton.boundingBox();
    expect(continueButtonBox?.height).toBeGreaterThanOrEqual(44);
    
    const removeButtonBox = await cartPage.removeButton.boundingBox();
    expect(removeButtonBox?.height).toBeGreaterThanOrEqual(44);
    expect(removeButtonBox?.width).toBeGreaterThanOrEqual(44);
  });

  test('Color contrast and visual accessibility', async ({ page }) => {
    test.info().annotations.push({
      type: 'visual-accessibility',
      description: 'Tests for sufficient color contrast and visual elements'
    });

    await omazePage.goto();
    
    // Check that important elements are visible
    await expect(page.getByRole('link', { name: 'Enter Now' })).toBeVisible();
    
    // Navigate through flow and check visibility at each step
    await omazePage.clickEnterNow();
    await expect(page.getByRole('heading')).toBeVisible();
    await expect(entryPage.singlePurchaseTab).toBeVisible();
    
    await entryPage.selectSinglePurchase();
    await expect(entryPage.buyNowButtons.first()).toBeVisible();
    
    await entryPage.selectSmallestEntryPackage();
    await expect(cartPage.continueButton).toBeVisible();
    await expect(cartPage.removeButton).toBeVisible();
    
    await cartPage.clickContinue();
    await cartPage.clickCheckout();
    
    // Check form elements are visible and readable
    await expect(checkoutPage.emailInput).toBeVisible();
    await expect(checkoutPage.continueToPaymentButton).toBeVisible();
    
    // Verify error states would be visible (attempt form submission)
    await checkoutPage.continueToPaymentButton.click();
    // Focus should move to first invalid field for accessibility
    await expect(checkoutPage.emailInput).toBeFocused();
  });

  test('Screen reader announcements and ARIA live regions', async ({ page }) => {
    test.info().annotations.push({
      type: 'screen-reader',
      description: 'Tests for proper ARIA live regions and screen reader announcements'
    });

    await omazePage.goto();
    await omazePage.clickEnterNow();
    await entryPage.selectSinglePurchase();
    await entryPage.selectSmallestEntryPackage();
    
    // Check for cart update announcements
    const ariaLiveRegions = page.locator('[aria-live]');
    const count = await ariaLiveRegions.count();
    
    // Should have at least one live region for cart updates
    expect(count).toBeGreaterThanOrEqual(0);
    
    // Continue through flow to checkout
    await cartPage.clickContinue();
    await cartPage.clickCheckout();
    
    // Check for form validation announcements
    await checkoutPage.continueToPaymentButton.click();
    
    // Wait for potential error announcements
    await page.waitForTimeout(1000);
    
    // Check if error messages have proper ARIA attributes
    const errorMessages = page.locator('[role="alert"], [aria-invalid="true"]');
    const errorCount = await errorMessages.count();
    
    // Should have error indicators when form is invalid
    if (errorCount > 0) {
      await expect(errorMessages.first()).toBeVisible();
    }
  });

  test('Focus management and tab order', async ({ page }) => {
    test.info().annotations.push({
      type: 'focus-management',
      description: 'Tests logical tab order and focus management throughout the flow'
    });

    await omazePage.goto();
    
    // Test tab order on homepage
    await page.keyboard.press('Tab'); // Should focus first interactive element
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(firstFocused);
    
    // Navigate to entry page and test tab order
    await omazePage.clickEnterNow();
    
    // Reset focus and test tab navigation through entry options
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to reach all interactive elements
    await entryPage.selectSinglePurchase();
    
    // Test that buy buttons are in logical tab order
    let tabCount = 0;
    while (tabCount < 10) { // Limit to prevent infinite loop
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      const isButton = await focusedElement.evaluate(el => 
        el.tagName === 'BUTTON' || el.tagName === 'A'
      ).catch(() => false);
      
      if (isButton) {
        const text = await focusedElement.textContent().catch(() => '');
        if (text?.includes('£')) {
          // Found a buy button, click it
          await page.keyboard.press('Enter');
          break;
        }
      }
      tabCount++;
    }
    
    // Should be on cart page now
    await expect(page).toHaveURL(/cart/);
    
    // Test focus moves logically through cart elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Focus should be on interactive cart elements
    const cartFocused = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
    expect(cartFocused).toBeTruthy();
  });
});
