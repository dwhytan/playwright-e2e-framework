import { test, expect } from '@playwright/test';

test.describe('Sauce Demo - Checkout', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
  });

  test('add product to cart and verify cart badge', async ({ page }) => {
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  test('complete checkout flow', async ({ page }) => {
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('.shopping_cart_link');
    await expect(page).toHaveURL('https://www.saucedemo.com/cart.html');
    await page.click('[data-test="checkout"]');
    await page.fill('[data-test="firstName"]', 'Davis');
    await page.fill('[data-test="lastName"]', 'Huaytan');
    await page.fill('[data-test="postalCode"]', '15001');
    await page.click('[data-test="continue"]');
    await page.click('[data-test="finish"]');
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
  });

  test('remove product from cart', async ({ page }) => {
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('.shopping_cart_link');
    await page.click('[data-test="remove-sauce-labs-backpack"]');
    await expect(page.locator('.cart_item')).not.toBeVisible();
  });

});