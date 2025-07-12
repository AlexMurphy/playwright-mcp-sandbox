import { Page, Locator, expect } from '@playwright/test';

export class WinnersPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly carousels: Locator;
  readonly carouselSlides: Locator;
  readonly nextButtons: Locator;
  readonly slideDots: Locator;
  readonly watchVideoButtons: Locator;
  readonly winnerStories: Locator;
  readonly entryCodeElements: Locator;
  readonly prizeAmounts: Locator;
  readonly winnerLocations: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: /sussex grand prize winner/i }).first();
    this.carousels = page.locator('.swiper-container, [class*="carousel"]');
    this.carouselSlides = page.locator('[class*="slide"], .swiper-slide');
    this.nextButtons = page.getByRole('button', { name: /next slide/i });
    this.slideDots = page.getByRole('button', { name: /go to slide/i });
    this.watchVideoButtons = page.getByRole('button', { name: /watch the magic/i });
    this.winnerStories = page.locator(':has-text("won"), :has-text("winner")');
    this.entryCodeElements = page.locator(':has-text("#"), :has-text("WINNING ENTRY CODE")');
    this.prizeAmounts = page.locator(':has-text("£"), :has-text("cash"), :has-text("House")');
    this.winnerLocations = page.locator(':has-text("from"), :has-text("Yorkshire"), :has-text("London")');
  }

  async verifyPageLoad() {
    await expect(this.winnerStories.first()).toBeVisible();
    await expect(this.carousels.first()).toBeVisible();
  }

  async verifyMultipleCarousels() {
    // Check for multiple carousel sections
    await expect(this.carousels).toHaveCount(5, { timeout: 15000 });
  }

  async navigateCarousel(carouselIndex: number = 0, direction: 'next' | 'previous' = 'next') {
    const carousel = this.carousels.nth(carouselIndex);
    if (direction === 'next') {
      await carousel.locator('button', { hasText: /next/i }).click();
    }
  }

  async clickSlideDot(carouselIndex: number, slideNumber: number) {
    const carousel = this.carousels.nth(carouselIndex);
    await carousel.getByRole('button', { name: `Go to slide ${slideNumber}` }).click();
  }

  async playWinnerVideo(index: number = 0) {
    await this.watchVideoButtons.nth(index).click();
  }

  async verifyWinnerInformation() {
    // Verify winner stories contain required information
    await expect(this.entryCodeElements.first()).toBeVisible();
    await expect(this.prizeAmounts.first()).toBeVisible();
    await expect(this.winnerLocations.first()).toBeVisible();
  }

  async verifyAccessibilityLabels() {
    // Check that carousel controls have proper ARIA labels
    const firstCarousel = this.carousels.first();
    await expect(firstCarousel.getByRole('button', { name: /next slide/i })).toBeVisible();
    await expect(firstCarousel.getByRole('button', { name: /go to slide 1/i })).toBeVisible();
  }

  async getWinnerCount(): Promise<number> {
    return await this.winnerStories.count();
  }

  async getWinnerDetails(index: number): Promise<{
    location: string;
    prize: string;
    entryCode: string;
  }> {
    const winnerElement = this.winnerStories.nth(index);
    const location = await winnerElement.locator(':has-text("from")').textContent() || '';
    const prize = await winnerElement.locator(':has-text("£")').textContent() || '';
    const entryCode = await winnerElement.locator(':has-text("#")').textContent() || '';
    
    return { location, prize, entryCode };
  }

  async verifyCarouselNavigation(carouselIndex: number = 0) {
    const carousel = this.carousels.nth(carouselIndex);
    const initialSlide = await carousel.locator('[class*="active"], [aria-current="true"]').first().textContent();
    
    // Navigate to next slide
    await this.navigateCarousel(carouselIndex, 'next');
    await this.page.waitForTimeout(1000); // Wait for transition
    
    const newSlide = await carousel.locator('[class*="active"], [aria-current="true"]').first().textContent();
    expect(newSlide).not.toBe(initialSlide);
  }
}
