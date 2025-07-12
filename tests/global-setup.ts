import { chromium, FullConfig } from '@playwright/test';

export default async function globalSetup(_config: FullConfig) {
  // Launch browser and create a new page
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to the site to check if it's accessible
    await page.goto('https://omaze.co.uk', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Accept cookies if banner appears - try multiple selectors
    const cookieSelectors = [
      'button:has-text("Accept")',
      'button:has-text("Accept All")',
      'button:has-text("Agree")',
      '[data-testid="accept-cookies"]',
      '[id*="accept"]',
      '[class*="accept"]'
    ];

    for (const selector of cookieSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {
          await element.click();
          await page.waitForTimeout(1000);
          break;
        }
      } catch {
        continue;
      }
    }
    
    console.log('✅ Global setup completed - site is accessible');
    
    // Store any global state if needed
    // await page.context().storageState({ path: 'storage-state.json' });
    
  } catch {
    console.log('⚠️ Global setup warning: Site may be temporarily unavailable');
    // Don't fail the entire test suite if the site is temporarily unavailable
  } finally {
    await browser.close();
  }
}
