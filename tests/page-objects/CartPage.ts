import { Page, Locator, expect } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly progressIndicator: Locator;
  readonly basketItems: Locator;
  readonly priceDisplay: Locator;
  readonly discountInfo: Locator;
  readonly nextButton: Locator;
  readonly continueShoppingLink: Locator;
  readonly howDidYouHearDropdown: Locator;
  readonly grandPrizeSection: Locator;
  readonly subscriptionDetails: Locator;
  readonly legalText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: /your basket/i });
    this.progressIndicator = page.getByRole('navigation', { name: /progress/i });
    this.basketItems = page.locator('[class*="cart"], [class*="basket"]');
    this.priceDisplay = page.locator(':has-text("£")');
    this.discountInfo = page.locator(':has-text("£5 OFF")');
    this.nextButton = page.getByRole('button', { name: /next/i });
    this.continueShoppingLink = page.getByRole('link', { name: /continue shopping/i });
    this.howDidYouHearDropdown = page.getByRole('combobox');
    this.grandPrizeSection = page.locator(':has-text("Grand Prize Draw")');
    this.subscriptionDetails = page.locator(':has-text("subscription"), :has-text("month")');
    this.legalText = page.locator(':has-text("Omaze UK Limited")');
  }

  async verifyPageLoad() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.progressIndicator).toBeVisible();
  }

  async verifyProgressSteps() {
    // Verify 4-step progress indicator
    const steps = this.progressIndicator.locator('li');
    await expect(steps).toHaveCount(8); // 4 numbers + 4 labels
  }

  async verifyBasketContents() {
    await expect(this.grandPrizeSection).toBeVisible();
    await expect(this.subscriptionDetails).toBeVisible();
    await expect(this.priceDisplay).toHaveCount(2, { timeout: 10000 }); // Current price and future price
  }

  async selectHowDidYouHear(option: string) {
    await this.howDidYouHearDropdown.selectOption({ label: option });
  }

  async proceedToNext() {
    await this.nextButton.click();
  }

  async continueShopping() {
    await this.continueShoppingLink.click();
  }

  async verifyDiscountApplied() {
    await expect(this.discountInfo).toBeVisible();
  }

  async verifyLegalInformation() {
    await expect(this.legalText).toBeVisible();
    await expect(this.page.locator(':has-text("17% of all ticket sales")')).toBeVisible();
  }

  async getCartTotal(): Promise<string> {
    const priceElement = this.priceDisplay.first();
    return await priceElement.textContent() || '';
  }
}
