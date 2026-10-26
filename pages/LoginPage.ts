import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('https://www.saucedemo.com');
  }

  async login(username: string, password: string) {
    await this.page.fill('#user-name', username);
    await this.page.fill('#password', password);
    await this.page.click('#login-button');
  }

  async getErrorMessage() {
    return this.page.locator('[data-test="error"]');
  }

  async verifySuccessfulLogin() {
    await expect(this.page).toHaveURL('/inventory.html');
    await expect(this.page.locator('.title')).toHaveText('Products');
  }

  async verifyLoginError(expectedText?: string) {
    const error = this.page.locator('[data-test="error"]');
    await expect(error).toBeVisible();
    if (expectedText) await expect(error).toContainText(expectedText);
  }
}