import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    // Typical selectors, these might need to be adjusted based on the actual CRM login page DOM
    this.emailInput = page.getByPlaceholder('name@company.com').or(page.getByLabel(/email/i)).or(page.locator('input[type="email"]'));
    this.passwordInput = page.getByPlaceholder('••••••••').or(page.getByLabel(/password/i)).or(page.locator('input[type="password"]'));
    this.submitButton = page.getByRole('button', { name: /sign in|login/i });
    this.errorMessage = page.getByRole('alert').or(page.locator('.text-red-500'));
  }

  async goto(): Promise<void> {
    await this.navigate('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectErrorMessage(message: string): Promise<void> {
    await expect(this.errorMessage.first()).toBeVisible();
    await expect(this.errorMessage.first()).toContainText(message);
  }
}
