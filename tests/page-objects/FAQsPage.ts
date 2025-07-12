import { Page, Locator, expect } from '@playwright/test';

export class FAQsPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly faqSections: Locator;
  readonly faqQuestions: Locator;
  readonly faqAnswers: Locator;
  readonly expandableQuestions: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: /frequently asked questions/i });
    this.faqSections = page.locator('main > div > div');
    this.faqQuestions = page.getByRole('heading', { level: 4 });
    this.faqAnswers = page.locator('[class*="answer"], [class*="content"]');
    this.expandableQuestions = page.locator('[cursor="pointer"]');
    this.searchInput = page.getByRole('textbox', { name: /search/i });
  }

  async verifyPageLoad() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.faqSections).toHaveCount(10, { timeout: 10000 });
  }

  async expandQuestion(questionText: string) {
    const question = this.faqQuestions.filter({ hasText: questionText });
    await question.click();
  }

  async expandQuestionByIndex(index: number) {
    await this.faqQuestions.nth(index).click();
  }

  async verifyFAQSections() {
    const expectedSections = [
      'Winning a Prize',
      'Entry Code',
      'Subscriptions',
      'Account Creation',
      'Payment',
      'Need Help?',
      'The Cheshire House',
      'Entering The Draw - Cheshire',
      'Anthony Nolan',
      'House Rentals'
    ];

    for (const sectionName of expectedSections) {
      await expect(this.page.getByRole('heading', { name: sectionName })).toBeVisible();
    }
  }

  async verifyQuestionInteractivity() {
    // Test that questions are clickable and expandable
    const firstQuestion = this.faqQuestions.first();
    const questionText = await firstQuestion.textContent();
    
    expect(questionText).toContain('+');
    await firstQuestion.click();
    
    // Wait for expansion animation
    await this.page.waitForTimeout(500);
  }

  async searchFAQs(searchTerm: string) {
    if (await this.searchInput.isVisible({ timeout: 3000 })) {
      await this.searchInput.fill(searchTerm);
      await this.page.keyboard.press('Enter');
    }
  }

  async getQuestionCount(): Promise<number> {
    return await this.faqQuestions.count();
  }

  async verifyAccessibility() {
    // Check that FAQ questions have proper heading structure
    await expect(this.page.getByRole('heading', { level: 2 })).toHaveCount(10, { timeout: 10000 });
    await expect(this.page.getByRole('heading', { level: 4 })).toHaveCount(25, { timeout: 10000 });
  }

  async verifySpecificQuestions() {
    const importantQuestions = [
      'How will you contact me if I\'ve won a prize?',
      'What are the odds of winning?',
      'How can I cancel my subscription?',
      'Can I sell the house if I don\'t want to move in?'
    ];

    for (const question of importantQuestions) {
      await expect(this.faqQuestions.filter({ hasText: new RegExp(question, 'i') })).toBeVisible();
    }
  }
}
