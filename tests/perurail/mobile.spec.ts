import { test, expect, devices, Page } from '@playwright/test';

// Full iPhone emulation needs WebKit (Safari's engine). Android emulation needs Chromium, which PeruRail
// blocks, so for Android we check its screen size in Firefox without pretending to be another browser
const { defaultBrowserType, ...iPhone } = devices['iPhone 13'];
const phones = [
  { name: 'iPhone 13', browser: 'webkit', settings: iPhone },
  { name: 'Android screen (Pixel 7 size)', browser: 'firefox', settings: { viewport: devices['Pixel 7'].viewport } },
];

// True when nothing sticks out to the right, so the user never has to scroll sideways
async function fitsScreenWidth(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
}

for (const phone of phones) {
  test.describe(`PeruRail — Mobile — ${phone.name}`, () => {
    test.use(phone.settings);
    // Each phone runs in one browser only (see above)
    test.skip(({ browserName }) => browserName !== phone.browser, `${phone.name} runs in ${phone.browser}`);

    test(`PR-016 search form is usable on ${phone.name}`, { tag: '@mobile' }, async ({ page }) => {
      await test.step('Verify the search form fits the screen', async () => {
        await page.goto('/?tipoIdioma=1');
        await expect(page.locator('#Filtros_Ida_Fecha')).toBeVisible();
        await expect(page.locator('#btnSiguiente')).toBeVisible();
        expect(await fitsScreenWidth(page)).toBe(true);
      });

      await test.step('Search a one-way trip from Cusco to Machu Picchu', async () => {
        await page.getByText('One Way', { exact: true }).click();
        await page.locator('#select2-Filtros_Ida_Destino-container').click();
        await page.getByRole('treeitem', { name: 'MachuPicchu', exact: true }).click();
        await page.locator('#btnSiguiente').click();
      });

      await test.step('Verify trains are listed and fit the screen', async () => {
        await expect(page.locator('.row-desktop-trenes').first()).toBeVisible();
        expect(await fitsScreenWidth(page)).toBe(true);
      });
    });
  });
}