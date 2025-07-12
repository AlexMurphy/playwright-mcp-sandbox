import { test, expect } from '@playwright/test';

test.describe('Omaze UK - User Journey Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://omaze.com');
  });

  test('complete entry flow - single purchase journey', async ({ page }) => {
    // Start from homepage
    await expect(page.locator('text=£4 MILLION HOUSE IN CHESHIRE')).toBeVisible();
    
    // Click Enter Now
    await page.getByRole('link', { name: 'Enter Now' }).first().click();
    
    // Select Single Purchase
    await page.getByRole('button', { name: 'Single Purchase' }).click();
    
    // Verify purchase options are visible
    await expect(page.locator('text=20 Entries')).toBeVisible();
    await expect(page.locator('text=45 Entries')).toBeVisible();
    await expect(page.locator('text=85 Entries')).toBeVisible();
    await expect(page.locator('text=320 Entries')).toBeVisible();
    
    // Check £5 OFF discount is applied
    await expect(page.locator('text=£5 OFF')).toBeVisible();
    
    // Verify charity information
    await expect(page.locator('text=Every entry you make into the Cheshire House Draw helps Anthony Nolan')).toBeVisible();
    
    // Check buy now buttons are present
    await expect(page.getByRole('button', { name: 'Buy Now' }).first()).toBeVisible();
  });

  test('complete entry flow - subscription journey', async ({ page }) => {
    await page.getByRole('link', { name: 'Enter Now' }).first().click();
    await page.getByRole('button', { name: 'Subscription' }).click();
    
    // Verify subscription tiers
    const subscriptionTiers = [
      { entries: '100 Entries', price: '£10', fullPrice: '£15' },
      { entries: '200 Entries', price: '£20', fullPrice: '£25' },
      { entries: '640 Entries', price: '£45', fullPrice: '£50' }
    ];
    
    for (const tier of subscriptionTiers) {
      await expect(page.locator(`text=${tier.entries}`)).toBeVisible();
      await expect(page.locator(`text=${tier.price}`)).toBeVisible();
      await expect(page.locator(`text=${tier.fullPrice}/month`)).toBeVisible();
    }
    
    // Check bonus draw information for higher tiers
    await expect(page.locator('text=BONUS DRAW included')).toBeVisible();
    await expect(page.locator('text=200 entries')).toBeVisible();
    await expect(page.locator('text=640 entries')).toBeVisible();
    
    // Verify enter now buttons
    await expect(page.getByRole('button', { name: 'Enter Now' })).toHaveCount(3);
  });

  test('postal entry journey', async ({ page }) => {
    await page.getByRole('link', { name: 'Enter Now' }).first().click();
    await page.getByRole('button', { name: 'Postal No purchase necessary' }).click();
    
    // Verify postal entry instructions
    await expect(page.locator('text=Maximum one entry per postcard')).toBeVisible();
    
    // Check address details
    const addressElements = [
      'Omaze Scrutineers',
      'Civica Election Services',
      '33 Clarendon Road',
      'London',
      'N8 0NW'
    ];
    
    for (const element of addressElements) {
      await expect(page.locator(`text=${element}`)).toBeVisible();
    }
    
    // Verify entry requirements
    await expect(page.locator('text=On a blank sheet of paper, or postcard, write or type your full, legal name')).toBeVisible();
    await expect(page.locator('text=Postal entries are treated in exactly the same way as paid entries')).toBeVisible();
  });

  test('navigation flow between main sections', async ({ page }) => {
    // Test navigation from homepage to various sections
    
    // To entry page
    await page.getByRole('link', { name: 'Enter Now' }).first().click();
    await expect(page).toHaveURL(/.*enter-cheshire-iii/);
    
    // Back to home via logo
    await page.getByRole('link').first().click(); // Logo link
    await expect(page).toHaveURL(/.*cheshire-iii$/);
    
    // To Past Draws
    await page.getByRole('link', { name: 'Past Draws' }).click();
    await expect(page).toHaveURL(/.*past-draws/);
    
    // To Winners
    await page.getByRole('link', { name: 'Our Winners' }).click();
    await expect(page).toHaveURL(/.*winners/);
    
    // To Draw Results
    await page.getByRole('link', { name: 'Draw Results' }).click();
    await expect(page).toHaveURL(/.*draw-results/);
    
    // To About
    await page.getByRole('link', { name: 'About Omaze' }).click();
    await expect(page).toHaveURL(/.*about-omaze/);
  });

  test('house tour and gallery interaction', async ({ page }) => {
    // Test house tour functionality
    await expect(page.getByRole('tab', { name: 'Tour', selected: true })).toBeVisible();
    
    // Switch to Gallery tab
    await page.getByRole('tab', { name: 'Gallery' }).click();
    // Note: We can't verify the selected state changes easily without more specific selectors
    
    // Switch to Floorplans
    await page.getByRole('tab', { name: 'Floorplans (1/2)' }).click();
    await page.getByRole('tab', { name: 'Floorplans (2/2)' }).click();
    
    // Test gallery navigation
    await page.getByRole('button', { name: 'Next slide' }).click();
    
    // Test individual slide navigation
    await page.getByRole('button', { name: 'Go to slide 2' }).click();
    await page.getByRole('button', { name: 'Go to slide 3' }).click();
    
    // Switch back to Tour
    await page.getByRole('tab', { name: 'Tour' }).click();
  });

  test('early bird prize information flow', async ({ page }) => {
    // Verify Early Bird prize is prominently displayed
    await expect(page.locator('text=McLaren Artura Spider')).toBeVisible();
    await expect(page.locator('text=Early Bird Prize')).toBeVisible();
    await expect(page.locator('text=Enter by Sunday 13th July')).toBeVisible();
    
    // Click on McLaren link
    await page.getByRole('link', { name: 'McLaren Artura Spider | Cheshire' }).click();
    await expect(page).toHaveURL(/.*cheshire-iii-win-a-mclaren-artura-spider/);
  });

  test('charity information deep dive', async ({ page }) => {
    // From homepage, check charity section
    await expect(page.locator('text=Anthony Nolan')).toBeVisible();
    await expect(page.locator('text=£1,000,000 donation')).toBeVisible();
    
    // Click to learn more about charity
    await page.getByRole('link', { name: 'Find Out More' }).click();
    await expect(page).toHaveURL(/.*anthony-nolan/);
    
    // Navigate back and check entry page charity info
    await page.goBack();
    await page.getByRole('link', { name: 'Enter Now' }).first().click();
    
    // Verify charity details on entry page
    await expect(page.locator('text=Anthony Nolan')).toBeVisible();
    await expect(page.locator('text=Omaze guarantees to make a minimum charitable donation of £1,000,000')).toBeVisible();
  });

  test('footer links comprehensive check', async ({ page }) => {
    const footer = page.locator('footer');
    
    // Test footer link categories
    await expect(footer.locator('h4:has-text("Draw")')).toBeVisible();
    await expect(footer.locator('h4:has-text("Omaze")')).toBeVisible();
    await expect(footer.locator('h4:has-text("Charity")')).toBeVisible();
    await expect(footer.locator('h4:has-text("Legal")')).toBeVisible();
    
    // Test key footer links
    const footerLinks = [
      'The Cheshire House',
      'Omaze Subscriptions', 
      'Past Draws',
      'Our Winners',
      'About Omaze',
      'FAQs',
      'Official Rules',
      'Terms of Use',
      'Privacy Notice',
      'Cookie Notice'
    ];
    
    for (const link of footerLinks) {
      await expect(footer.getByRole('link', { name: link })).toBeVisible();
    }
    
    // Test social media presence
    await expect(footer.locator('[href*="twitter.com/OmazeUK"]')).toBeVisible();
    await expect(footer.locator('[href*="facebook.com/OmazeUK"]')).toBeVisible();
    await expect(footer.locator('[href*="instagram.com/omazeuk"]')).toBeVisible();
    await expect(footer.locator('[href*="youtube.com"]')).toBeVisible();
  });
});
