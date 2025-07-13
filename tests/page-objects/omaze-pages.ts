import { Page, Locator, expect } from '@playwright/test';

export class OmazePage {
  readonly page: Page;
  readonly enterNowButton: Locator;
  readonly navigation: Locator;
  readonly basketLink: Locator;
  readonly loginLink: Locator;
  readonly signUpLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.enterNowButton = page.getByRole('link', { name: 'Enter Now' });
    this.navigation = page.getByRole('navigation').first();
    this.basketLink = page.getByRole('link', { name: /Basket/ });
    this.loginLink = page.getByRole('link', { name: 'Log In' });
    this.signUpLink = page.getByRole('link', { name: 'Sign Up' });
  }

  async goto() {
    await this.page.goto('/');
    // Handle cookie consent banner if present
    await this.handleCookieConsent();
  }

  async handleCookieConsent() {
    try {
      // Wait for cookie banner and accept it
      const cookieAcceptButton = this.page.locator('#onetrust-accept-btn-handler');
      await cookieAcceptButton.waitFor({ timeout: 5000 });
      await cookieAcceptButton.click();
      // Wait a moment for banner to disappear
      await this.page.waitForTimeout(1000);
    } catch (error) {
      // Cookie banner might not be present or already dismissed
      console.log('Cookie banner not found or already dismissed');
    }
  }

  async clickEnterNow() {
    // Ensure cookie banner is handled before clicking
    await this.handleCookieConsent();
    // Wait for the button to be clickable
    await this.enterNowButton.waitFor({ state: 'visible' });
    await this.enterNowButton.click({ force: true });
  }

  async verifyNavigationElements() {
    await expect(this.basketLink).toBeVisible();
    await expect(this.loginLink).toBeVisible();
    await expect(this.signUpLink).toBeVisible();
  }
}

export class EntryPage {
  readonly page: Page;
  readonly postalTab: Locator;
  readonly singlePurchaseTab: Locator;
  readonly subscriptionTab: Locator;
  readonly buyNowButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.postalTab = page.getByRole('button', { name: 'Postal No purchase necessary' });
    this.singlePurchaseTab = page.getByRole('button', { name: 'Single Purchase' });
    this.subscriptionTab = page.getByRole('button', { name: 'Subscription' });
    this.buyNowButtons = page.getByRole('button', { name: 'Buy Now' });
  }

  async selectSinglePurchase() {
    await this.singlePurchaseTab.click();
  }

  async selectSmallestEntryPackage() {
    // Click the last "Buy Now" button which should be the smallest package (20 entries)
    await this.buyNowButtons.last().click();
  }

  async verifyEntryOptions() {
    await expect(this.postalTab).toBeVisible();
    await expect(this.singlePurchaseTab).toBeVisible();
    await expect(this.subscriptionTab).toBeVisible();
  }
}

export class CartPage {
  readonly page: Page;
  readonly continueButton: Locator;
  readonly checkoutButton: Locator;
  readonly orderTotal: Locator;
  readonly progressIndicator: Locator;
  readonly removeButton: Locator;
  readonly quantityInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    this.orderTotal = page.getByRole('heading', { name: /Order Total/ });
    this.progressIndicator = page.getByRole('navigation', { name: 'Progress' });
    this.removeButton = page.getByRole('button', { name: 'Remove' });
    this.quantityInput = page.locator('input[type="text"][disabled]');
  }

  async clickContinue() {
    await this.continueButton.click();
  }

  async clickCheckout() {
    await this.checkoutButton.click();
  }

  async verifyCartContents() {
    await expect(this.orderTotal).toBeVisible();
    await expect(this.progressIndicator).toBeVisible();
  }

  async verifyOrderTotal(expectedTotal: string) {
    await expect(this.orderTotal).toContainText(expectedTotal);
  }
}

export class CheckoutPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly postcodeInput: Locator;
  readonly phoneInput: Locator;
  readonly continueToPaymentButton: Locator;
  readonly returnToBasketLink: Locator;
  readonly countrySelect: Locator;
  readonly marketingCheckbox: Locator;
  readonly smsCheckbox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.firstNameInput = page.getByRole('textbox', { name: 'First name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last name' });
    this.addressInput = page.getByRole('combobox', { name: 'Address' });
    this.cityInput = page.getByRole('textbox', { name: 'City' });
    this.postcodeInput = page.getByRole('textbox', { name: 'Postcode' });
    this.phoneInput = page.getByRole('textbox', { name: 'Phone (optional)' });
    this.continueToPaymentButton = page.getByRole('button', { name: 'Continue to payment' });
    this.returnToBasketLink = page.getByRole('link', { name: 'Return to basket' });
    this.countrySelect = page.getByRole('combobox', { name: 'Country/Region' });
    this.marketingCheckbox = page.getByRole('checkbox', { name: /From time to time, Omaze would like to send you marketing/ });
    this.smsCheckbox = page.getByRole('checkbox', { name: 'Text me with news and offers' });
  }

  async fillCustomerInformation(customerData: {
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postcode: string;
    phone?: string;
  }) {
    await this.emailInput.fill(customerData.email);
    await this.firstNameInput.fill(customerData.firstName);
    await this.lastNameInput.fill(customerData.lastName);
    await this.addressInput.fill(customerData.address);
    await this.cityInput.fill(customerData.city);
    await this.postcodeInput.fill(customerData.postcode);
    
    if (customerData.phone) {
      await this.phoneInput.fill(customerData.phone);
    }
  }

  async verifyCheckoutForm() {
    await expect(this.emailInput).toBeVisible();
    await expect(this.firstNameInput).toBeVisible();
    await expect(this.lastNameInput).toBeVisible();
    await expect(this.continueToPaymentButton).toBeVisible();
  }

  async verifyRequiredFields() {
    await expect(this.emailInput).toHaveAttribute('required', '');
    await expect(this.firstNameInput).toHaveAttribute('required', '');
    await expect(this.lastNameInput).toHaveAttribute('required', '');
  }
}
