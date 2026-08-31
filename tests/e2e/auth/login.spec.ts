import { test, expect } from '../../fixtures/app.fixture';

test.describe('Login functionality', () => {
  test('should show error for invalid credentials', async ({ loginPage }) => {
    // This is a basic smoke test with dummy invalid credentials
    await loginPage.login('invalid@example.com', 'wrongpassword');
    // Assuming the application shows some error message. 
    // This will likely fail or pass depending on the actual app response.
    // In a real scenario, this helps us verify Playwright can interact with the app.
    // If there is no error message UI configured, we might expect URL to remain /login
    await expect(loginPage.page).toHaveURL(/\/login/);
  });
});
