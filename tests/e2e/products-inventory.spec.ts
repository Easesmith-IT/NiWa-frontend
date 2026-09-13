import { test, expect } from '@playwright/test';
import { setupAuthenticatedContext } from '../helpers/auth';

test.describe('NIWA Products & Inventory — Critical User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedContext(page, 'admin@niwa.local', 'ChangeMe123!');
  });

  test('Journey A: Products Catalog & Create Product Form Verification', async ({ page }) => {
    // Navigate to /products
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');

    // Verify catalog title and Add Product CTA
    await expect(page).toHaveURL(/\/products/);
    const addProductLink = page.locator('a[href="/products/new"]').first();
    await expect(addProductLink).toBeVisible();

    // Navigate to Create Product page
    await addProductLink.click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/products\/new/);

    // Verify essential form controls
    const nameInput = page.getByPlaceholder(/Basmati Rice 5kg/i);
    await expect(nameInput).toBeVisible();

    const priceInput = page.getByPlaceholder(/350/i);
    await expect(priceInput).toBeVisible();

    // Verify progressive disclosure button
    const toggleAdvancedBtn = page.getByRole('button', { name: /show advanced/i });
    if (await toggleAdvancedBtn.isVisible()) {
      await toggleAdvancedBtn.click();
      await expect(page.getByPlaceholder(/RICE-5KG-001/i)).toBeVisible();
    }
  });

  test('Journey B: Inventory Overview & Stock Operations Verification', async ({ page }) => {
    // Navigate to /inventory
    await page.goto('/inventory');
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveURL(/\/inventory/);

    // Verify Adjust Stock CTA
    const adjustBtn = page.getByRole('button', { name: /adjust stock/i });
    await expect(adjustBtn).toBeVisible();

    // Open Adjust Stock modal
    await adjustBtn.click();
    const modalTitle = page.locator('#adjust-stock-title');
    await expect(modalTitle).toBeVisible();

    // Verify operation mode buttons
    await expect(page.getByRole('button', { name: /\+ Add/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /− Reduce/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /✎ Count/i })).toBeVisible();

    // Test Escape key dismissal
    await page.keyboard.press('Escape');
    await expect(modalTitle).not.toBeVisible();
  });

  test('Journey C & D: Context Preservation & Movement Ledger Verification', async ({ page }) => {
    // Navigate to /inventory/movements
    await page.goto('/inventory/movements');
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveURL(/\/inventory\/movements/);

    // Verify sub-navigation bar links
    const mainArea = page.getByRole('main');
    await expect(mainArea.getByRole('link', { name: /stock levels/i })).toBeVisible();
    await expect(mainArea.getByRole('link', { name: /locations/i })).toBeVisible();
    await expect(mainArea.getByRole('link', { name: /movement ledger/i })).toBeVisible();

    // Verify query param context preservation on /inventory
    await page.goto('/inventory?q=Rice');
    await page.waitForLoadState('domcontentloaded');
    const searchInput = page.getByPlaceholder(/search by product name, sku, or location/i);
    await expect(searchInput).toHaveValue('Rice');
  });
});
