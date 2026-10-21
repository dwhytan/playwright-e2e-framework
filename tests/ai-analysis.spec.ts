import { test, expect } from '@playwright/test';
import { analyzeTestFailure } from '../utils/aiAnalyzer';

test.describe('AI-Assisted Test Analysis', () => {

  test('analyze a simulated login failure', async ({ page }) => {
    let errorMessage = '';
    let analysisResult = '';

    try {
      await page.goto('https://www.saucedemo.com');
      await page.fill('#user-name', 'locked_out_user');
      await page.fill('#password', 'secret_sauce');
      await page.click('#login-button');

      const error = await page.locator('[data-test="error"]').textContent();
      errorMessage = error || 'Unknown error';

      analysisResult = await analyzeTestFailure(
        'Login with locked out user',
        errorMessage,
        'Navigate to login page, enter locked_out_user credentials, click login button'
      );

      console.log('\n🤖 AI Analysis:\n', analysisResult);

    } catch (e) {
      console.log('Analysis error:', e);
    }

    expect(errorMessage).toContain('locked out');
    expect(analysisResult.length).toBeGreaterThan(0);
  });

});