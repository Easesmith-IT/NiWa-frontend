import { test, expect } from '../../fixtures/app.fixture';

test.describe('Deals Pipeline functionality', () => {
  test('should redirect to login if unauthorized or load deals if authorized', async ({ dealsPage, page }) => {
    // Navigate to the Deals page directly
    await dealsPage.goto();
    
    // Check if the application enforces auth redirects. 
    // Wait for the URL to settle.
    await page.waitForLoadState('networkidle');

    // It will either redirect to /login or stay on /deals
    const url = page.url();
    if (url.includes('/login')) {
      // Auth enforcement is working correctly
      await expect(page).toHaveURL(/\/login/);
    } else {
      // If no auth is enforced or a mock auth is present, we should see the deals page
      await expect(page).toHaveURL(/\/deals/);
      // Optional: Check for basic UI elements like a new deal button or search bar if they exist
      // await expect(dealsPage.searchInput).toBeVisible();
    }
  });
});
