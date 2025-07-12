import { Page, Locator, expect } from '@playwright/test';

export class EntryPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly navigationTabs: Locator;
  readonly postalTab: Locator;
  readonly singlePurchaseTab: Locator;
  readonly subscriptionTab: Locator;
  readonly subscriptionOptions: Locator;
  readonly enterNowButtons: Locator;
  readonly priceDisplay: Locator;
  readonly entriesDisplay: Locator;
  readonly discountBanner: Locator;
  readonly charityInfo: Locator;
  readonly legalText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: /your chance to win/i });
    this.navigationTabs = page.getByRole('navigation', { name: /tabs/i });
    this.postalTab = page.getByRole('button', { name: /postal/i });
    this.singlePurchaseTab = page.getByRole('button', { name: /single purchase/i });
    this.subscriptionTab = page.getByRole('button', { name: /subscription/i });
    this.subscriptionOptions = page.locator('[class*="subscription"], [id*="subscription"]');
    this.enterNowButtons = page.getByRole('button', { name: /enter now/i });
    this.priceDisplay = page.locator('[class*="price"], :has-text("£")');
    this.entriesDisplay = page.locator(':has-text("entries"), :has-text("Entries")');
    this.discountBanner = page.locator(':has-text("£5 OFF"), :has-text("discount")');
    this.charityInfo = page.locator(':has-text("Anthony Nolan"), :has-text("charity")');
    this.legalText = page.locator(':has-text("terms"), :has-text("purchase necessary")');
  }

  async selectSubscriptionOption(optionIndex: number = 0) {
    await this.enterNowButtons.nth(optionIndex).click();
  }

  async selectPostalEntry() {
    await this.postalTab.click();
  }

  async selectSinglePurchase() {
    await this.singlePurchaseTab.click();
  }

  async selectSubscription() {
    await this.subscriptionTab.click();
  }

  async verifyPageLoad() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.navigationTabs).toBeVisible();
  }

  async verifySubscriptionOptions() {
    // Check that there are multiple subscription tiers
    await expect(this.enterNowButtons).toHaveCount(3, { timeout: 10000 });
    await expect(this.priceDisplay).toHaveCount(6, { timeout: 10000 }); // 3 options x 2 price displays each
    await expect(this.entriesDisplay).toHaveCount(3, { timeout: 10000 });
  }

  async verifyDiscountOffer() {
    await expect(this.discountBanner).toBeVisible();
    await expect(this.page.locator(':has-text("£5 OFF")')).toBeVisible();
  }

  async verifyCharityInformation() {
    await expect(this.charityInfo).toBeVisible();
    await expect(this.page.locator(':has-text("Supporting")')).toBeVisible();
  }

  async verifyLegalCompliance() {
    await expect(this.legalText).toBeVisible();
    await expect(this.page.locator(':has-text("No purchase necessary")')).toBeVisible();
  }

  async getPriceText(optionIndex: number = 0): Promise<string> {
    return await this.priceDisplay.nth(optionIndex).textContent() || '';
  }

  async getEntriesCount(optionIndex: number = 0): Promise<string> {
    return await this.entriesDisplay.nth(optionIndex).textContent() || '';
  }
}
