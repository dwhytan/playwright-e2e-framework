import { test, expect, devices } from '@playwright/test';

const iPhone = devices['iPhone 13'];
const pixel = devices['Pixel 5'];

test.describe('Mobile Testing - Sauce Demo', () => {

  test('login page renders correctly on iPhone 13', async ({ browser }) => {
    const context = await browser.newContext({ ...iPhone });
    const page = await context.newPage();
    await page.goto('https://www.saucedemo.com');
    await expect(page.locator('#login-button')).toBeVisible();
    await expect(page.locator('#user-name')).toBeVisible();
    await expect(page).toHaveScreenshot('login-iphone13.png', {
      maxDiffPixelRatio: 0.02
    });
    await context.close();
  });

  test('login works correctly on Pixel 5', async ({ browser }) => {
    const context = await browser.newContext({ ...pixel });
    const page = await context.newPage();
    await page.goto('https://www.saucedemo.com');
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
    await expect(page.locator('.title')).toHaveText('Products');
    await context.close();
  });

  test('inventory page is responsive on iPhone 13', async ({ browser }) => {
    const context = await browser.newContext({ ...iPhone });
    const page = await context.newPage();
    await page.goto('https://www.saucedemo.com');
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
    await expect(page.locator('.inventory_list')).toBeVisible();
    await expect(page).toHaveScreenshot('inventory-iphone13.png', {
      maxDiffPixelRatio: 0.02
    });
    await context.close();
  });

});