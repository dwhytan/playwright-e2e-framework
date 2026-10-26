import { test, expect } from '@playwright/test';

test.describe('Visual Regression — Sauce Demo', () => {

  test('login page matches approved baseline snapshot', async ({ page }) => {
    await test.step('Navigate to the login page', async () => {
      await page.goto('https://www.saucedemo.com');
    });

    await test.step('Compare current UI against baseline screenshot (max 2% diff allowed)', async () => {
      await expect(page).toHaveScreenshot('login-page.png', { maxDiffPixelRatio: 0.02 });
    });
  });

  test('inventory page matches approved baseline snapshot', async ({ page }) => {
    await test.step('Log in and navigate to the inventory page', async () => {
      await page.goto('https://www.saucedemo.com');
      await page.fill('#user-name', 'standard_user');
      await page.fill('#password', 'secret_sauce');
      await page.click('#login-button');
    });

    await test.step('Compare current inventory UI against baseline screenshot (max 2% diff allowed)', async () => {
      await expect(page).toHaveScreenshot('inventory-page.png', { maxDiffPixelRatio: 0.02 });
    });
  });

  test('cart page matches approved baseline snapshot', async ({ page }) => {
    await test.step('Log in, add a product, and navigate to the cart', async () => {
      await page.goto('https://www.saucedemo.com');
      await page.fill('#user-name', 'standard_user');
      await page.fill('#password', 'secret_sauce');
      await page.click('#login-button');
      await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
      await page.click('.shopping_cart_link');
    });

    await test.step('Compare current cart UI against baseline screenshot (max 2% diff allowed)', async () => {
      await expect(page).toHaveScreenshot('cart-page.png', { maxDiffPixelRatio: 0.02 });
    });
  });

});