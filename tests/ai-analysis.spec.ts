import { test, expect } from '@playwright/test';
import { analyzeTestFailure } from '../utils/aiAnalyzer';

test.describe('AI-Assisted Test Analysis', () => {

  test('AI analyzes a simulated login failure for a locked-out user', async ({ page }) => {
    let errorMessage = '';
    let analysisResult = '';

    await test.step('Navigate to the login page and attempt login with a locked-out account', async () => {
      await page.goto('https://www.saucedemo.com');
      await page.fill('#user-name', 'locked_out_user');
      await page.fill('#password', 'secret_sauce');
      await page.click('#login-button');
    });

    await test.step('Capture the error message returned by the application', async () => {
      const error = await page.locator('[data-test="error"]').textContent();
      errorMessage = error || 'Unknown error';
    });

    await test.step('Send failure context to AI analyzer and retrieve diagnosis', async () => {
      analysisResult = await analyzeTestFailure(
        'Login with locked out user',
        errorMessage,
        'Navigate to login page, enter locked_out_user credentials, click login button'
      );
      console.log('\n🤖 AI Analysis:\n', analysisResult);
    });

    await test.step('Verify error message indicates account is locked out', async () => {
      expect(errorMessage).toContain('locked out');
    });

    await test.step('Verify AI analyzer returned a non-empty diagnosis', async () => {
      expect(analysisResult.length).toBeGreaterThan(0);
    });
  });

});