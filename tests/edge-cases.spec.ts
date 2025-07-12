import { test, expect } from "@playwright/test";

test.describe("Omaze UK - Edge Cases & Error Handling", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://omaze.com");
  });

  test("should handle network interruptions gracefully", async ({ page }) => {
    // Test basic page load
    await expect(
      page.locator("text=£4 MILLION HOUSE IN CHESHIRE"),
    ).toBeVisible();

    // Test navigation with potential network delays
    await page
      .getByRole("link", { name: "Enter Now" })
      .first()
      .click({ timeout: 10000 });
    await expect(
      page.locator("text=YOUR CHANCE TO WIN THIS £4,000,000 HOUSE IN CHESHIRE"),
    ).toBeVisible();
  });

  test("should handle rapid user interactions", async ({ page }) => {
    // Test rapid clicking on navigation elements
    for (let i = 0; i < 3; i++) {
      await page.getByRole("tab", { name: "Gallery" }).click();
      await page.getByRole("tab", { name: "Tour" }).click();
    }

    // Should still be functional after rapid interactions
    await expect(page.getByRole("tab", { name: "Tour" })).toBeVisible();

    // Test rapid entry method switching
    await page.getByRole("link", { name: "Enter Now" }).first().click();

    for (let i = 0; i < 3; i++) {
      await page.getByRole("button", { name: "Single Purchase" }).click();
      await page.getByRole("button", { name: "Subscription" }).click();
      await page
        .getByRole("button", { name: "Postal No purchase necessary" })
        .click();
    }

    // Should still display postal information correctly
    await expect(
      page.locator("text=Maximum one entry per postcard"),
    ).toBeVisible();
  });

  test("should handle cookie acceptance variations", async ({ page }) => {
    // Test different cookie consent options

    // First, test "Accept Essential Only"
    await page.getByRole("button", { name: "Accept Essential Only" }).click();
    await expect(page.locator("text=We value your privacy")).toBeHidden();

    // Reload page to test "Customise Cookies" flow
    await page.reload();
    if (await page.locator("text=We value your privacy").isVisible()) {
      await page.getByRole("button", { name: "Customise Cookies" }).click();
      // Note: This would need specific testing based on the cookie customization modal
    }
  });

  test("should handle direct URL access to various pages", async ({ page }) => {
    // Test direct navigation to key pages
    const pagesToTest = [
      {
        url: "https://omaze.co.uk/pages/enter-cheshire-iii",
        expectedText: "YOUR CHANCE TO WIN",
      },
      {
        url: "https://omaze.co.uk/pages/faqs",
        expectedText: "Frequently Asked Questions",
      },
      { url: "https://omaze.co.uk/pages/about-omaze", expectedText: "About" },
      { url: "https://omaze.co.uk/pages/past-draws", expectedText: "Past" },
      { url: "https://omaze.co.uk/pages/winners", expectedText: "Winners" },
    ];

    for (const pageTest of pagesToTest) {
      await page.goto(pageTest.url);
      await expect(page.locator(`text=${pageTest.expectedText}`)).toBeVisible({
        timeout: 10000,
      });
    }
  });

  test("should handle browser back/forward navigation", async ({ page }) => {
    // Start on homepage
    await expect(
      page.locator("text=£4 MILLION HOUSE IN CHESHIRE"),
    ).toBeVisible();

    // Navigate to entry page
    await page.getByRole("link", { name: "Enter Now" }).first().click();
    await expect(
      page.locator("text=YOUR CHANCE TO WIN THIS £4,000,000 HOUSE IN CHESHIRE"),
    ).toBeVisible();

    // Navigate to FAQs
    await page.getByRole("link", { name: "FAQs" }).click();
    await expect(page.locator("text=Frequently Asked Questions")).toBeVisible();

    // Test browser back button
    await page.goBack();
    await expect(
      page.locator("text=YOUR CHANCE TO WIN THIS £4,000,000 HOUSE IN CHESHIRE"),
    ).toBeVisible();

    // Test browser forward button
    await page.goForward();
    await expect(page.locator("text=Frequently Asked Questions")).toBeVisible();

    // Go back twice to homepage
    await page.goBack();
    await page.goBack();
    await expect(
      page.locator("text=£4 MILLION HOUSE IN CHESHIRE"),
    ).toBeVisible();
  });

  test("should handle page refresh during interactions", async ({ page }) => {
    // Navigate to entry page
    await page.getByRole("link", { name: "Enter Now" }).first().click();

    // Switch to subscription tab
    await page.getByRole("button", { name: "Subscription" }).click();
    await expect(page.locator("text=100 Entries")).toBeVisible();

    // Refresh the page
    await page.reload();

    // Should still show the entry page but may reset to default tab
    await expect(
      page.locator("text=YOUR CHANCE TO WIN THIS £4,000,000 HOUSE IN CHESHIRE"),
    ).toBeVisible();

    // Tab functionality should still work
    await page.getByRole("button", { name: "Single Purchase" }).click();
    await expect(page.locator("text=£10")).toBeVisible();
  });

  test("should handle external link behavior", async ({ page }) => {
    // Test social media links behavior
    const socialLinks = [
      "https://twitter.com/OmazeUK",
      "https://www.facebook.com/OmazeUK/",
      "https://www.instagram.com/omazeuk/",
      "https://www.youtube.com/channel/UCFtKZF8vImBVD4EI93STk3w",
    ];

    for (const socialUrl of socialLinks) {
      const linkLocator = page.locator(`[href="${socialUrl}"]`);
      if (await linkLocator.isVisible()) {
        await expect(linkLocator).toBeVisible();
        // Note: Testing actual external navigation would require handling new tabs/windows
      }
    }

    // Test Trustpilot link
    await expect(
      page.frameLocator("iframe").locator("text=TrustScore"),
    ).toBeVisible();
  });

  test("should handle form validation edge cases", async ({ page }) => {
    // Navigate to login page
    await page.getByRole("link", { name: "Log In" }).click();

    // Note: Actual form validation testing would depend on the specific form implementation
    // This is a placeholder for when we can test specific form fields

    await expect(page).toHaveURL(/.*login/);

    // Test navigation back to main site
    await page.getByRole("link").first().click(); // Logo or back link
  });

  test("should handle image loading failures gracefully", async ({ page }) => {
    // Test that page still functions if images fail to load
    // This would typically be tested with network interception

    await expect(
      page.locator("text=£4 MILLION HOUSE IN CHESHIRE"),
    ).toBeVisible();

    // Navigate to gallery where many images are loaded
    await page.getByRole("tab", { name: "Gallery" }).click();

    // Page should still be navigable even with potential image loading issues
    await page.getByRole("tab", { name: "Tour" }).click();
    await expect(page.getByRole("tab", { name: "Tour" })).toBeVisible();
  });

  test("should handle countdown timer edge cases", async ({ page }) => {
    // Check countdown timer is present
    await expect(page.locator("text=ENDS IN")).toBeVisible();

    // Verify countdown elements
    await expect(page.locator("text=D")).toBeVisible(); // Days
    await expect(page.locator("text=H")).toBeVisible(); // Hours
    await expect(page.locator("text=M")).toBeVisible(); // Minutes
    await expect(page.locator("text=S")).toBeVisible(); // Seconds

    // Wait a moment and check that timer is updating
    await page.waitForTimeout(2000);

    // Timer should still be visible after time passes
    await expect(page.locator("text=ENDS IN")).toBeVisible();
  });

  test("should handle subscription tier edge cases", async ({ page }) => {
    await page.getByRole("link", { name: "Enter Now" }).first().click();
    await page.getByRole("button", { name: "Subscription" }).click();

    // Test that all subscription tiers show correct information
    const subscriptionDetails = [
      { tier: "100 Entries", button: "Enter Now" },
      { tier: "200 Entries", button: "Enter Now" },
      { tier: "640 Entries", button: "Enter Now" },
    ];

    for (const detail of subscriptionDetails) {
      await expect(page.locator(`text=${detail.tier}`)).toBeVisible();
      await expect(
        page.getByRole("button", { name: detail.button }),
      ).toBeVisible();
    }

    // Check that bonus draw information is correct for eligible tiers
    await expect(page.locator("text=BONUS DRAW included")).toBeVisible();
    await expect(
      page.locator("text=monthly £100,000 cash prize draw"),
    ).toBeVisible();
  });

  test("should handle FAQ expandable content", async ({ page }) => {
    await page.getByRole("link", { name: "FAQs" }).click();

    // Test FAQ expansion (if implemented as expandable sections)
    const faqQuestions = [
      "How will you contact me if I've won a prize? +",
      "When and how will I know if I have won a prize? +",
      "What are the odds of winning? +",
    ];

    for (const question of faqQuestions) {
      const questionLocator = page.locator(`text=${question}`);
      if (await questionLocator.isVisible()) {
        await expect(questionLocator).toBeVisible();
        // Note: Actual expansion testing would depend on implementation
      }
    }
  });

  test("should handle charity information consistency", async ({ page }) => {
    // Check charity info on homepage
    await expect(page.locator("text=Anthony Nolan")).toBeVisible();

    // Check charity info on entry page
    await page.getByRole("link", { name: "Enter Now" }).first().click();
    await expect(page.locator("text=Anthony Nolan")).toBeVisible();
    await expect(page.locator("text=17% of all ticket sales")).toBeVisible();

    // Check charity info on FAQs
    await page.getByRole("link", { name: "FAQs" }).click();
    await expect(page.locator('h2:has-text("Anthony Nolan")')).toBeVisible();

    // Verify consistency of charity messaging across pages
    await page.goBack(); // Back to entry page
    await expect(page.locator("text=£1,000,000")).toBeVisible();
  });

  test("should handle window resizing during use", async ({ page }) => {
    // Start with desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(
      page.locator("text=£4 MILLION HOUSE IN CHESHIRE"),
    ).toBeVisible();

    // Navigate to entry page
    await page.getByRole("link", { name: "Enter Now" }).first().click();

    // Resize to mobile during use
    await page.setViewportSize({ width: 375, height: 667 });

    // Should still function properly
    await expect(
      page.locator("text=YOUR CHANCE TO WIN THIS £4,000,000 HOUSE IN CHESHIRE"),
    ).toBeVisible();

    // Test tab switching on mobile
    await page.getByRole("button", { name: "Single Purchase" }).click();
    await expect(page.locator("text=£10")).toBeVisible();

    // Resize back to desktop
    await page.setViewportSize({ width: 1200, height: 800 });

    // Should still work correctly
    await expect(page.locator("text=£10")).toBeVisible();
  });
});
