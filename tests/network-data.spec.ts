import { test, expect } from '@playwright/test';
import { OmazePage, EntryPage, CartPage, CheckoutPage } from './page-objects/omaze-pages';

test.describe('Network and Data Layer Tests', () => {
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

  test('Page load performance and critical resources', async ({ page }) => {
    test.info().annotations.push({
      type: 'performance',
      description: 'Tests page load performance and monitors critical resource loading'
    });

    const responses: any[] = [];
    const requestTimings: any[] = [];
    
    // Monitor network requests
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        contentType: response.headers()['content-type'],
        timing: Date.now()
      });
    });

    page.on('request', request => {
      requestTimings.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now(),
        resourceType: request.resourceType()
      });
    });

    const startTime = Date.now();
    await omazePage.goto();
    const loadTime = Date.now() - startTime;

    // Verify page loaded successfully
    await expect(page).toHaveTitle(/Omaze UK/);
    
    // Check page load time is reasonable (less than 5 seconds)
    expect(loadTime).toBeLessThan(5000);
    
    // Verify critical resources loaded successfully
    const mainDocumentResponse = responses.find(r => r.url === 'https://omaze.co.uk/' && r.status === 200);
    expect(mainDocumentResponse).toBeTruthy();
    
    // Check for CSS resources
    const cssResponses = responses.filter(r => r.contentType?.includes('text/css'));
    expect(cssResponses.length).toBeGreaterThan(0);
    
    // Check for JavaScript resources
    const jsResponses = responses.filter(r => r.contentType?.includes('javascript'));
    expect(jsResponses.length).toBeGreaterThan(0);
    
    // Verify no critical 4xx/5xx errors
    const errorResponses = responses.filter(r => r.status >= 400);
    const criticalErrors = errorResponses.filter(r => 
      r.resourceType === 'document' || 
      r.resourceType === 'stylesheet' || 
      r.url.includes('main') || 
      r.url.includes('critical')
    );
    expect(criticalErrors.length).toBe(0);
  });

  test('Data layer events for entry selection', async ({ page }) => {
    test.info().annotations.push({
      type: 'analytics',
      description: 'Tests Google Analytics and data layer events during entry selection'
    });

    const dataLayerEvents: any[] = [];
    
    // Monitor data layer pushes
    await page.addInitScript(() => {
      (window as any).dataLayer = (window as any).dataLayer || [];
      const originalPush = (window as any).dataLayer.push;
      (window as any).dataLayer.push = function(...args: any[]) {
        // Store events for testing
        (window as any).__dataLayerEvents = (window as any).__dataLayerEvents || [];
        (window as any).__dataLayerEvents.push(...args);
        return originalPush.apply(this, args);
      };
    });

    await omazePage.goto();
    
    // Wait for initial page load events
    await page.waitForTimeout(2000);
    
    // Get initial data layer events
    const initialEvents = await page.evaluate(() => (window as any).__dataLayerEvents || []);
    dataLayerEvents.push(...initialEvents);
    
    // Navigate to entry page and monitor events
    await omazePage.clickEnterNow();
    await page.waitForTimeout(1000);
    
    const entryPageEvents = await page.evaluate(() => (window as any).__dataLayerEvents || []);
    dataLayerEvents.push(...entryPageEvents);
    
    // Select entry package and monitor add to cart events
    await entryPage.selectSinglePurchase();
    await page.waitForTimeout(500);
    
    await entryPage.selectSmallestEntryPackage();
    await page.waitForTimeout(1000);
    
    // Get all events after add to cart
    const allEvents = await page.evaluate(() => (window as any).__dataLayerEvents || []);
    
    // Look for expected analytics events
    const pageViewEvents = allEvents.filter((event: any) => 
      event.event === 'page_view' || 
      event.event === 'gtm.dom' ||
      event.event === 'gtm.load'
    );
    expect(pageViewEvents.length).toBeGreaterThan(0);
    
    // Look for add to cart or purchase events
    const ecommerceEvents = allEvents.filter((event: any) => 
      event.event === 'add_to_cart' || 
      event.event === 'begin_checkout' ||
      event.ecommerce || 
      event.event === 'purchase_initiated'
    );
    
    // Should have some form of ecommerce tracking
    console.log('Captured data layer events:', allEvents.length);
    console.log('Ecommerce events found:', ecommerceEvents.length);
  });

  test('API calls during checkout process', async ({ page }) => {
    test.info().annotations.push({
      type: 'api',
      description: 'Tests API calls made during the checkout process'
    });

    const apiCalls: any[] = [];
    
    // Monitor API requests
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/') || url.includes('checkout') || url.includes('cart')) {
        apiCalls.push({
          url,
          method: request.method(),
          headers: request.headers(),
          postData: request.postData(),
          timestamp: Date.now()
        });
      }
    });

    page.on('response', response => {
      const url = response.url();
      if (url.includes('/api/') || url.includes('checkout') || url.includes('cart')) {
        const existingCall = apiCalls.find(call => call.url === url);
        if (existingCall) {
          existingCall.status = response.status();
          existingCall.responseHeaders = response.headers();
        }
      }
    });

    // Navigate through the checkout flow
    await omazePage.goto();
    await omazePage.clickEnterNow();
    await entryPage.selectSinglePurchase();
    await entryPage.selectSmallestEntryPackage();
    
    // Wait for cart API calls
    await page.waitForTimeout(2000);
    
    await cartPage.clickContinue();
    await cartPage.clickCheckout();
    
    // Wait for checkout API calls
    await page.waitForTimeout(2000);
    
    // Fill out form to trigger validation API calls
    await checkoutPage.fillCustomerInformation({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Test Street',
      city: 'London',
      postcode: 'SW1A 1AA',
      phone: '07700 900123'
    });
    
    // Wait for any validation API calls
    await page.waitForTimeout(1000);
    
    // Analyze captured API calls
    console.log(`Captured ${apiCalls.length} API calls`);
    
    // Verify no API calls failed with 4xx/5xx errors
    const failedCalls = apiCalls.filter(call => call.status >= 400);
    expect(failedCalls.length).toBe(0);
    
    // Check for expected API patterns
    const cartCalls = apiCalls.filter(call => call.url.includes('cart'));
    const checkoutCalls = apiCalls.filter(call => call.url.includes('checkout'));
    
    console.log(`Cart API calls: ${cartCalls.length}`);
    console.log(`Checkout API calls: ${checkoutCalls.length}`);
  });

  test('Third-party integrations and external requests', async ({ page }) => {
    test.info().annotations.push({
      type: 'integrations',
      description: 'Tests third-party service integrations and external API calls'
    });

    const externalRequests: any[] = [];
    
    // Monitor requests to external domains
    page.on('request', request => {
      const url = request.url();
      if (!url.includes('omaze.co.uk') && !url.includes('localhost')) {
        externalRequests.push({
          url,
          domain: new URL(url).hostname,
          method: request.method(),
          resourceType: request.resourceType(),
          timestamp: Date.now()
        });
      }
    });

    await omazePage.goto();
    
    // Wait for all external resources to load
    await page.waitForTimeout(3000);
    
    // Navigate through flow to trigger more external calls
    await omazePage.clickEnterNow();
    await page.waitForTimeout(2000);
    
    await entryPage.selectSinglePurchase();
    await entryPage.selectSmallestEntryPackage();
    await page.waitForTimeout(2000);
    
    await cartPage.clickContinue();
    await cartPage.clickCheckout();
    await page.waitForTimeout(3000);
    
    // Analyze external requests
    const uniqueDomains = [...new Set(externalRequests.map(req => req.domain))];
    console.log('External domains contacted:', uniqueDomains);
    
    // Check for expected third-party services
    const analyticsRequests = externalRequests.filter(req => 
      req.domain.includes('google-analytics') || 
      req.domain.includes('googletagmanager') ||
      req.domain.includes('gtm')
    );
    
    const paymentRequests = externalRequests.filter(req => 
      req.domain.includes('paypal') || 
      req.domain.includes('stripe') ||
      req.domain.includes('googlepay')
    );
    
    const cdnRequests = externalRequests.filter(req => 
      req.domain.includes('cdn') ||
      req.domain.includes('cloudfront') ||
      req.domain.includes('cloudflare')
    );
    
    console.log(`Analytics requests: ${analyticsRequests.length}`);
    console.log(`Payment service requests: ${paymentRequests.length}`);
    console.log(`CDN requests: ${cdnRequests.length}`);
    
    // Verify we have expected integrations
    expect(uniqueDomains.length).toBeGreaterThan(0);
  });

  test('Form submission and validation network calls', async ({ page }) => {
    test.info().annotations.push({
      type: 'form-validation',
      description: 'Tests network calls during form validation and submission attempts'
    });

    const formRequests: any[] = [];
    
    // Monitor form-related requests
    page.on('request', request => {
      const url = request.url();
      const postData = request.postData();
      
      if (request.method() === 'POST' || postData) {
        formRequests.push({
          url,
          method: request.method(),
          postData,
          headers: request.headers(),
          timestamp: Date.now()
        });
      }
    });

    // Navigate to checkout form
    await omazePage.goto();
    await omazePage.clickEnterNow();
    await entryPage.selectSinglePurchase();
    await entryPage.selectSmallestEntryPackage();
    await cartPage.clickContinue();
    await cartPage.clickCheckout();
    
    // Try to submit empty form to trigger validation
    await checkoutPage.continueToPaymentButton.click();
    await page.waitForTimeout(1000);
    
    // Fill out form partially
    await checkoutPage.emailInput.fill('test@example.com');
    await checkoutPage.firstNameInput.fill('John');
    await page.waitForTimeout(500);
    
    // Try to submit again
    await checkoutPage.continueToPaymentButton.click();
    await page.waitForTimeout(1000);
    
    // Fill out complete form
    await checkoutPage.fillCustomerInformation({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Test Street',
      city: 'London',
      postcode: 'SW1A 1AA',
      phone: '07700 900123'
    });
    
    // Final submission attempt
    await checkoutPage.continueToPaymentButton.click();
    await page.waitForTimeout(2000);
    
    // Analyze form submission requests
    console.log(`Form-related requests captured: ${formRequests.length}`);
    
    if (formRequests.length > 0) {
      const checkoutSubmissions = formRequests.filter(req => 
        req.url.includes('checkout') || 
        req.url.includes('submit') ||
        req.url.includes('validate')
      );
      
      console.log(`Checkout submission requests: ${checkoutSubmissions.length}`);
      
      // Verify POST requests have proper content type
      const postRequests = formRequests.filter(req => req.method === 'POST');
      postRequests.forEach(req => {
        expect(req.headers['content-type']).toBeTruthy();
      });
    }
  });

  test('Mobile performance and network optimization', async ({ page }) => {
    test.info().annotations.push({
      type: 'mobile-performance',
      description: 'Tests mobile-specific performance and network optimization'
    });

    const networkMetrics = {
      totalRequests: 0,
      totalBytes: 0,
      imageRequests: 0,
      cssRequests: 0,
      jsRequests: 0,
      slowRequests: [] as Array<{url: string, responseTime: number, status: number}>
    };

    const startTime = Date.now();
    
    page.on('response', async response => {
      networkMetrics.totalRequests++;
      
      const contentLength = response.headers()['content-length'];
      if (contentLength) {
        networkMetrics.totalBytes += parseInt(contentLength, 10);
      }
      
      const url = response.url();
      const responseTime = Date.now() - startTime;
      
      if (url.includes('.jpg') || url.includes('.png') || url.includes('.webp')) {
        networkMetrics.imageRequests++;
      } else if (url.includes('.css')) {
        networkMetrics.cssRequests++;
      } else if (url.includes('.js')) {
        networkMetrics.jsRequests++;
      }
      
      // Flag slow requests (over 2 seconds)
      if (responseTime > 2000) {
        networkMetrics.slowRequests.push({
          url,
          responseTime,
          status: response.status()
        });
      }
    });

    // Test complete mobile flow
    await omazePage.goto();
    await page.waitForLoadState('networkidle');
    
    await omazePage.clickEnterNow();
    await page.waitForLoadState('networkidle');
    
    await entryPage.selectSinglePurchase();
    await entryPage.selectSmallestEntryPackage();
    await page.waitForLoadState('networkidle');
    
    await cartPage.clickContinue();
    await cartPage.clickCheckout();
    await page.waitForLoadState('networkidle');
    
    // Analyze mobile performance metrics
    console.log('Mobile Network Metrics:', networkMetrics);
    
    // Verify reasonable resource usage for mobile
    expect(networkMetrics.totalRequests).toBeLessThan(100); // Should not have excessive requests
    expect(networkMetrics.slowRequests.length).toBeLessThan(5); // Most requests should be fast
    
    // Check image optimization (should use modern formats)
    const totalImageRequests = networkMetrics.imageRequests;
    console.log(`Image requests: ${totalImageRequests}`);
    
    // Log total data usage
    const totalMB = networkMetrics.totalBytes / (1024 * 1024);
    console.log(`Total data transferred: ${totalMB.toFixed(2)} MB`);
    
    // For mobile, total page weight should be reasonable
    expect(totalMB).toBeLessThan(10); // Should not exceed 10MB for mobile experience
  });
});
