import { test, expect } from '@playwright/test';

test.describe('Visual Regression Testing - Sauce Demo', () => {

  test('login page matches snapshot', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await expect(page).toHaveScreenshot('login-page.png', {
      maxDiffPixelRatio: 0.02
    });
  });

  test('inventory page matches snapshot', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
    await expect(page).toHaveScreenshot('inventory-page.png', {
      maxDiffPixelRatio: 0.02
    });
  });

  test('cart page matches snapshot', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('.shopping_cart_link');
    await expect(page).toHaveScreenshot('cart-page.png', {
      maxDiffPixelRatio: 0.02
    });
  });

});