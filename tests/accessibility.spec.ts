import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility (WCAG 2.1) — Sauce Demo', () => {

  test('login page has no critical accessibility violations', async ({ page }) => {
    await test.step('Navigate to the login page', async () => {
      await page.goto('https://www.saucedemo.com');
    });

    await test.step('Run axe-core analysis (WCAG 2.0 A/AA) and verify no violations', async () => {
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      expect(results.violations.length).toBe(0);
    });
  });

  test('inventory page has no critical accessibility violations', async ({ page }) => {
    await test.step('Log in and navigate to the inventory page', async () => {
      await page.goto('https://www.saucedemo.com');
      await page.fill('#user-name', 'standard_user');
      await page.fill('#password', 'secret_sauce');
      await page.click('#login-button');
    });

    await test.step('Run axe-core analysis and verify no critical or serious violations', async () => {
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      const critical = results.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      );
      expect(critical.length).toBe(0);
    });
  });

  test('checkout page has no critical accessibility violations', async ({ page }) => {
    await test.step('Log in, add product, and navigate to checkout', async () => {
      await page.goto('https://www.saucedemo.com');
      await page.fill('#user-name', 'standard_user');
      await page.fill('#password', 'secret_sauce');
      await page.click('#login-button');
      await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
      await page.click('.shopping_cart_link');
      await page.click('[data-test="checkout"]');
    });

    await test.step('Run axe-core analysis and verify no critical or serious violations', async () => {
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      const critical = results.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      );
      expect(critical.length).toBe(0);
    });
  });

});