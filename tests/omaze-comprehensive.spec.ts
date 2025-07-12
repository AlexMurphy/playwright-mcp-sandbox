import { test, expect } from '@playwright/test';

test.describe('Omaze UK - Comprehensive Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Visit the Omaze UK homepage
    await page.goto('https://omaze.com');
  });

  test('should display main house draw information on homepage', async ({ page }) => {
    // Verify the main house draw information is displayed (Cheshire house worth £4 million)
    await expect(page.locator('text=£4 MILLION HOUSE IN CHESHIRE')).toBeVisible();
    await expect(page.locator('text=£250,000 in Cash')).toBeVisible();
    
    // Check that the house features and benefits are visible (4 bedrooms, 5 bathrooms, wellness suite)
    await expect(page.locator('text=4 bedrooms')).toBeVisible();
    await expect(page.locator('text=5 bathrooms')).toBeVisible();
    await expect(page.locator('text=Wellness Suite')).toBeVisible();
    await expect(page.locator('text=6,396 sq ft')).toBeVisible();
  });

  test('should navigate to entry page and show all entry methods', async ({ page }) => {
    // Test navigation to the entry page via 'Enter Now' button
    await page.getByRole('link', { name: 'Enter Now' }).first().click();
    
    await expect(page).toHaveURL(/.*enter-cheshire-iii/);
    await expect(page.locator('text=YOUR CHANCE TO WIN THIS £4,000,000 HOUSE IN CHESHIRE')).toBeVisible();
    
    // Verify all three entry methods are available (Postal, Single Purchase, Subscription)
    await expect(page.getByRole('button', { name: 'Postal No purchase necessary' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Single Purchase' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Subscription' })).toBeVisible();
  });

  test('should switch between entry method tabs correctly', async ({ page }) => {
    await page.getByRole('link', { name: 'Enter Now' }).first().click();
    
    // Test switching between entry method tabs
    
    // Test Single Purchase tab
    await page.getByRole('button', { name: 'Single Purchase' }).click();
    // Verify single purchase options show correct pricing (£10, £25, £45, £145)
    await expect(page.locator('text=£10')).toBeVisible();
    await expect(page.locator('text=£25')).toBeVisible();
    await expect(page.locator('text=£45')).toBeVisible();
    await expect(page.locator('text=£145')).toBeVisible();
    
    // Test Subscription tab
    await page.getByRole('button', { name: 'Subscription' }).click();
    // Check subscription options display monthly pricing and entry counts
    await expect(page.locator('text=100 Entries')).toBeVisible();
    await expect(page.locator('text=200 Entries')).toBeVisible();
    await expect(page.locator('text=640 Entries')).toBeVisible();
    await expect(page.locator('text=/month')).toBeVisible();
    
    // Test Postal tab
    await page.getByRole('button', { name: 'Postal No purchase necessary' }).click();
    // Verify postal entry instructions are comprehensive and include address
    await expect(page.locator('text=Maximum one entry per postcard')).toBeVisible();
    await expect(page.locator('text=Civica Election Services')).toBeVisible();
    await expect(page.locator('text=33 Clarendon Road')).toBeVisible();
    await expect(page.locator('text=London')).toBeVisible();
    await expect(page.locator('text=N8 0NW')).toBeVisible();
  });

  test('should navigate to FAQs and verify content organization', async ({ page }) => {
    // Test navigation to FAQs page
    await page.getByRole('link', { name: 'FAQs' }).click();
    
    await expect(page).toHaveURL(/.*faqs/);
    await expect(page.locator('h1:has-text("Frequently Asked Questions")')).toBeVisible();
    
    // Verify FAQ sections are organized by topic (Winning, Subscriptions, Payment, etc.)
    await expect(page.locator('h2:has-text("Winning a Prize")')).toBeVisible();
    await expect(page.locator('h2:has-text("Subscriptions")')).toBeVisible();
    await expect(page.locator('h2:has-text("Payment")')).toBeVisible();
    await expect(page.locator('h2:has-text("Account Creation")')).toBeVisible();
    await expect(page.locator('h2:has-text("The Cheshire House")')).toBeVisible();
    await expect(page.locator('h2:has-text("Anthony Nolan")')).toBeVisible();
  });

  test('should verify header navigation links work correctly', async ({ page }) => {
    // Check navigation links in header work correctly
    
    // Test Past Draws link
    await page.getByRole('link', { name: 'Past Draws' }).click();
    await expect(page).toHaveURL(/.*past-draws/);
    
    // Navigate back to home
    await page.getByRole('link', { name: 'Omaze UK logo' }).first().click();
    
    // Test About Omaze link
    await page.getByRole('link', { name: 'About Omaze' }).click();
    await expect(page).toHaveURL(/.*about-omaze/);
    
    // Navigate back to home
    await page.getByRole('link', { name: 'Omaze UK logo' }).first().click();
    
    // Test Our Winners link
    await page.getByRole('link', { name: 'Our Winners' }).click();
    await expect(page).toHaveURL(/.*winners/);
  });

  test('should verify charity information is prominently displayed', async ({ page }) => {
    // Test charity information is prominently displayed (Anthony Nolan partnership)
    await expect(page.locator('text=Anthony Nolan')).toBeVisible();
    await expect(page.locator('text=£1,000,000 donation')).toBeVisible();
    
    // Navigate to entry page to check charity info there too
    await page.getByRole('link', { name: 'Enter Now' }).first().click();
    await expect(page.locator('text=Anthony Nolan')).toBeVisible();
  });

  test('should verify footer links and social media integration', async ({ page }) => {
    // Verify footer links are functional
    const footer = page.locator('footer');
    await expect(footer.getByRole('link', { name: 'About Omaze' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'FAQs' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Privacy Notice' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Terms of Use' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Official Rules' })).toBeVisible();
    
    // Test social media links in footer
    await expect(footer.locator('[href*="twitter.com"]')).toBeVisible();
    await expect(footer.locator('[href*="facebook.com"]')).toBeVisible();
    await expect(footer.locator('[href*="instagram.com"]')).toBeVisible();
    await expect(footer.locator('[href*="youtube.com"]')).toBeVisible();
  });

  test('should verify Trustpilot integration and compliance', async ({ page }) => {
    // Check Trustpilot integration is visible
    await expect(page.frameLocator('iframe').locator('text=TrustScore')).toBeVisible();
    await expect(page.frameLocator('iframe').locator('text=4.7')).toBeVisible();
    
    // Verify legal compliance information is present (terms, privacy, rules)
    await expect(page.locator('text=© 2025 Omaze')).toBeVisible();
    await expect(page.locator('img[alt*="Chartered Institute of Fundraising"]')).toBeVisible();
    await expect(page.locator('img[alt*="Fundraising Regulator"]')).toBeVisible();
  });

  test('should verify draw timing and Early Bird prize information', async ({ page }) => {
    // Verify draw closing date and countdown timer functionality
    await expect(page.locator('text=ENDS IN')).toBeVisible();
    
    // Test Early Bird prize information is displayed
    await expect(page.locator('text=McLaren Artura Spider')).toBeVisible();
    await expect(page.locator('text=Early Bird Prize')).toBeVisible();
    await expect(page.locator('text=Enter by Sunday 13th July')).toBeVisible();
  });

  test('should verify house gallery and property information', async ({ page }) => {
    // Verify house gallery and tour functionality
    await expect(page.getByRole('tab', { name: 'Tour', selected: true })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Gallery' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Floorplans (1/2)' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Floorplans (2/2)' })).toBeVisible();
    
    // Check location and value information is accurate
    await expect(page.locator('text=House Value')).toBeVisible();
    await expect(page.locator('text=£4,000,000')).toBeVisible();
    await expect(page.locator('text=Estimated Monthly Rental')).toBeVisible();
    await expect(page.locator('text=£18,000-£20,000')).toBeVisible();
    
    // Test gallery navigation
    await page.getByRole('button', { name: 'Next slide' }).click();
    
    // Test different tabs
    await page.getByRole('tab', { name: 'Gallery' }).click();
    await page.getByRole('tab', { name: 'Floorplans (1/2)' }).click();
  });

  test('should verify account and authentication features', async ({ page }) => {
    // Check authentication links
    await expect(page.getByRole('link', { name: 'Log In' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign Up' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Basket' })).toBeVisible();
    
    // Test navigation to login page
    await page.getByRole('link', { name: 'Log In' }).click();
    await expect(page).toHaveURL(/.*account\/login/);
    
    // Navigate back
    await page.goBack();
    
    // Test navigation to signup page
    await page.getByRole('link', { name: 'Sign Up' }).click();
    await expect(page).toHaveURL(/.*account\/register/);
  });

  test('should handle cookie consent mechanism', async ({ page }) => {
    // Verify cookie consent mechanism works properly
    await expect(page.locator('text=We value your privacy')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Accept All' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Accept Essential Only' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Customise Cookies' })).toBeVisible();
    
    // Test accepting cookies
    await page.getByRole('button', { name: 'Accept All' }).click();
    // Cookie banner should disappear
    await expect(page.locator('text=We value your privacy')).not.toBeVisible();
  });

  test('should verify mobile responsiveness basics', async ({ page }) => {
    // Test mobile responsiveness of key elements
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify main elements are still visible on mobile
    await expect(page.locator('text=£4 MILLION HOUSE IN CHESHIRE')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Enter Now' })).toBeVisible();
    
    // Check mobile navigation
    await expect(page.getByRole('button').first()).toBeVisible(); // hamburger menu
    
    // Test entry page on mobile
    await page.getByRole('link', { name: 'Enter Now' }).first().click();
    await expect(page.locator('text=YOUR CHANCE TO WIN THIS £4,000,000 HOUSE IN CHESHIRE')).toBeVisible();
  });

  test('should verify subscription and pricing details', async ({ page }) => {
    await page.getByRole('link', { name: 'Enter Now' }).first().click();
    
    // Check subscription pricing details
    await page.getByRole('button', { name: 'Subscription' }).click();
    
    // Verify £5 OFF promotion
    await expect(page.locator('text=£5 OFF')).toBeVisible();
    await expect(page.locator('text=your first month')).toBeVisible();
    
    // Check cancellation terms
    await expect(page.locator('text=Cancel at any time')).toBeVisible();
    
    // Verify bonus draw information
    await expect(page.locator('text=🎁 BONUS DRAW:')).toBeVisible();
    await expect(page.locator('text=monthly £100,000 cash prize draw')).toBeVisible();
  });

  test('should verify charity and fundraising information', async ({ page }) => {
    await page.getByRole('link', { name: 'Enter Now' }).first().click();
    
    // Check charity fundraising details
    await expect(page.locator('text=Anthony Nolan')).toBeVisible();
    await expect(page.locator('text=17% of all ticket sales')).toBeVisible();
    await expect(page.locator('text=Over one third of sales goes to charity and VAT')).toBeVisible();
    
    // Test charity link
    await page.getByRole('link', { name: 'Anthony Nolan' }).first().click();
    await expect(page).toHaveURL(/.*anthony-nolan/);
  });
});
