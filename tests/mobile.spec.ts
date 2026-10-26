import { test, expect, devices } from '@playwright/test';

const iPhone = devices['iPhone 13'];
const pixel = devices['Pixel 5'];

test.describe('Mobile — Sauce Demo', () => {

  test('login page renders correctly on iPhone 13 (390x844)', async ({ browser }) => {
    const context = await browser.newContext({ ...iPhone });
    const page = await context.newPage();

    await test.step('Open the login page on iPhone 13 viewport', async () => {
      await page.goto('https://www.saucedemo.com');
    });

    await test.step('Verify key elements are visible on mobile screen', async () => {
      await expect(page.locator('#login-button')).toBeVisible();
      await expect(page.locator('#user-name')).toBeVisible();
    });

    await test.step('Verify visual regression screenshot on iPhone 13', async () => {
      await expect(page).toHaveScreenshot('login-iphone13.png', { maxDiffPixelRatio: 0.02 });
    });

    await context.close();
  });

  test('login works correctly on Pixel 5 (Android, 393x851)', async ({ browser }) => {
    const context = await browser.newContext({ ...pixel });
    const page = await context.newPage();

    await test.step('Open the login page on Pixel 5 viewport', async () => {
      await page.goto('https://www.saucedemo.com');
    });

    await test.step('Enter credentials and log in', async () => {
      await page.fill('#user-name', 'standard_user');
      await page.fill('#password', 'secret_sauce');
      await page.click('#login-button');
    });

    await test.step('Verify successful access to inventory from Android device', async () => {
      await expect(page).toHaveURL(/inventory\.html/);
      await expect(page.locator('.title')).toHaveText('Products');
    });

    await context.close();
  });

  test('inventory page is responsive on iPhone 13', async ({ browser }) => {
    const context = await browser.newContext({ ...iPhone });
    const page = await context.newPage();

    await test.step('Log in from iPhone 13', async () => {
      await page.goto('https://www.saucedemo.com');
      await page.fill('#user-name', 'standard_user');
      await page.fill('#password', 'secret_sauce');
      await page.click('#login-button');
    });

    await test.step('Verify the product list is displayed on mobile', async () => {
      await expect(page.locator('.inventory_list')).toBeVisible();
    });

    await test.step('Verify visual regression screenshot of inventory on iPhone 13', async () => {
      await expect(page).toHaveScreenshot('inventory-iphone13.png', { maxDiffPixelRatio: 0.02 });
    });

    await context.close();
  });

}); 