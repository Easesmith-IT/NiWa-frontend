import { test, expect } from '@playwright/test';
import { setupAuthenticatedContext, loginViaApi, ensureWorkspaceModules } from '../helpers/auth';
import { createUnitTest, createLocationTest } from '../helpers/seed';

test.describe.serial('Inventory & Stock Management E2E Journey', () => {
  let session: { token: string; workspaceId: string };
  let unitId: string;
  let warehouseLocationId: string;
  let warehouseLocationName: string;
  let warehouseLocationCode: string;
  let retailLocationName: string;
  let testProductName: string;

  test.beforeAll(async () => {
    session = await loginViaApi('admin@niwa.local', 'ChangeMe123!');
    await ensureWorkspaceModules(session.workspaceId, ['products', 'inventory']);

    // Seed unit
    const unitRes = await createUnitTest(session.token, session.workspaceId, `Piece ${Date.now()}`, `PC${Date.now().toString().slice(-4)}`);
    unitId = unitRes.data?._id;

    // Seed initial warehouse location via helper
    warehouseLocationName = `WH Alpha ${Date.now()}`;
    warehouseLocationCode = `WHA${Date.now().toString().slice(-4)}`;
    const locRes = await createLocationTest(session.token, session.workspaceId, warehouseLocationName, warehouseLocationCode, 'WAREHOUSE');
    warehouseLocationId = locRes.data?._id;

    // Seed a product with variant for stock tests
    testProductName = `Inv Test Product ${Date.now()}`;
    await fetch('http://localhost:4000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
        'x-workspace-id': session.workspaceId,
      },
      body: JSON.stringify({
        name: testProductName,
        type: 'PHYSICAL',
        defaultUnitId: unitId,
        sellingPrice: 150,
        costPrice: 100,
      }),
    });
  });

  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedContext(page, 'admin@niwa.local', 'ChangeMe123!');
  });

  test('9: Location Management E2E Journey', async ({ page }) => {
    await page.goto('/inventory/locations');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: /inventory locations/i })).toBeVisible();

    // Verify existing warehouse location from beforeAll is present
    await expect(page.locator('tbody tr', { hasText: warehouseLocationName })).toBeVisible({ timeout: 10000 });

    // Click Add Location button
    const addLocBtn = page.getByRole('button', { name: /add location/i });
    await expect(addLocBtn).toBeVisible();
    await addLocBtn.click();

    // Verify accessible modal dialog
    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toHaveAttribute('aria-modal', 'true');
    await expect(modal).toHaveAttribute('aria-labelledby', 'location-modal-title');

    retailLocationName = `Retail Front ${Date.now()}`;
    const retailCode = `RF${Date.now().toString().slice(-4)}`;

    // Fill form
    await page.locator('#location-name-input').fill(retailLocationName);
    await page.locator('#location-code-input').fill(retailCode);
    await page.locator('#location-type-input').selectOption('RETAIL');
    await page.locator('#location-address-input').fill('Storefront Counter 1');

    // Submit
    await page.getByRole('button', { name: /create location/i }).click();

    // Verify newly created location appears in table with RETAIL badge and ACTIVE status
    const retailRow = page.locator('tbody tr', { hasText: retailLocationName });
    await expect(retailRow).toBeVisible({ timeout: 10000 });
    await expect(retailRow).toContainText('RETAIL');
    await expect(retailRow).toContainText('ACTIVE');

    // Edit location
    const editBtn = retailRow.locator('button[title="Edit Location"]');
    await editBtn.click();

    await expect(modal).toBeVisible();
    await page.locator('#location-address-input').fill('Updated Storefront Counter 10');
    await page.getByRole('button', { name: /update location/i }).click();

    // Verify updated address appears
    await expect(retailRow).toContainText('Updated Storefront Counter 10');
  });

  test('10.1: Opening Stock & Duplicate-Opening Protection', async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: /inventory stock/i })).toBeVisible();

    // Click top "Adjust Stock" button
    const adjustBtn = page.getByRole('button', { name: /adjust stock/i });
    await expect(adjustBtn).toBeVisible();
    await adjustBtn.click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();

    // Select product and location using option values
    const variantOption = await page.locator('#adjust-variant-id option', { hasText: testProductName }).first().getAttribute('value');
    await page.locator('#adjust-variant-id').selectOption(variantOption!);

    const locationOption = await page.locator('#adjust-location-id option', { hasText: warehouseLocationName }).first().getAttribute('value');
    await page.locator('#adjust-location-id').selectOption(locationOption!);

    // Select "★ Opening" operation button
    await page.getByRole('button', { name: /opening/i }).click();

    // Fill opening quantity
    await page.locator('#adjust-quantity').fill('100');
    await page.locator('#adjust-reason').fill('Initial opening stock rollout');

    // Submit
    await page.getByRole('button', { name: /save stock/i }).click();

    // Verify row appears in Stock Levels table with 100 On Hand
    const stockRow = page.locator('tbody tr', { hasText: testProductName }).first();
    await expect(stockRow).toBeVisible({ timeout: 10000 });
    await expect(stockRow).toContainText('100');
    await expect(stockRow).toContainText(warehouseLocationName);

    // Test Duplicate Opening Stock Protection
    await adjustBtn.click();
    await expect(modal).toBeVisible();

    await page.locator('#adjust-variant-id').selectOption(variantOption!);
    await page.locator('#adjust-location-id').selectOption(locationOption!);
    await page.getByRole('button', { name: /opening/i }).click();
    await page.locator('#adjust-quantity').fill('50');

    await page.getByRole('button', { name: /save stock/i }).click();

    // Verify domain error
    const alertBox = page.locator('#adjust-error-msg');
    await expect(alertBox).toBeVisible({ timeout: 5000 });
    await expect(alertBox).toContainText(/already been established|opening stock/i);

    // Cancel modal
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(modal).not.toBeVisible();

    // Stock level must still be 100
    await expect(stockRow).toContainText('100');
  });

  test('10.2, 10.3 & 10.4: Stock Operations (Receipt, Reduction & Physical Count)', async ({ page }) => {
    await page.goto(`/inventory?q=${encodeURIComponent(testProductName)}`);
    await page.waitForLoadState('domcontentloaded');

    const stockRow = page.locator('tbody tr', { hasText: testProductName }).first();
    await expect(stockRow).toBeVisible({ timeout: 10000 });

    // --- 10.2: Quick + Add (RECEIPT) ---
    const addBtn = stockRow.locator('button[title*="Add Stock"], button:has-text("+")').first();
    await addBtn.click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await page.locator('#adjust-quantity').fill('25');
    await page.locator('#adjust-reason').fill('Supplier purchase delivery batch A');
    await page.getByRole('button', { name: /save stock/i }).click();

    // Wait for table update and verify On Hand = 125
    await expect(stockRow).toContainText('125', { timeout: 10000 });

    // --- 10.3: Quick − Reduce (DAMAGE) ---
    const reduceBtn = stockRow.locator('button[title*="Reduce Stock"], button:has-text("−")').first();
    await reduceBtn.click();

    await expect(modal).toBeVisible();
    await page.locator('#adjust-reduction-category').selectOption('DAMAGE');
    await page.locator('#adjust-quantity').fill('10');
    await page.locator('#adjust-reason').fill('Damaged packaging during unloading');
    await page.getByRole('button', { name: /save stock/i }).click();

    // Verify On Hand = 115 (125 - 10)
    await expect(stockRow).toContainText('115', { timeout: 10000 });

    // --- 10.4: Physical Count Adjustment (ADJUSTMENT delta) ---
    const moreBtn = stockRow.locator('button:has-text("More ▾")');
    await moreBtn.click();

    const countBtn = page.getByRole('button', { name: /physical count/i });
    await expect(countBtn).toBeVisible();
    await countBtn.click();

    await expect(modal).toBeVisible();
    // New actual count = 120
    await page.locator('#adjust-quantity').fill('120');
    await page.locator('#adjust-reason').fill('Cycle count reconciliation');
    await page.getByRole('button', { name: /save stock/i }).click();

    // Verify On Hand adjusts directly to 120
    await expect(stockRow).toContainText('120', { timeout: 10000 });
  });

  test('10.5: Negative Stock Policy Rejection', async ({ page }) => {
    await page.goto(`/inventory?q=${encodeURIComponent(testProductName)}`);
    await page.waitForLoadState('domcontentloaded');

    const stockRow = page.locator('tbody tr', { hasText: testProductName }).first();
    await expect(stockRow).toBeVisible({ timeout: 10000 });
    await expect(stockRow).toContainText('120');

    // Attempt to reduce stock by 500 (exceeds 120 on hand)
    const reduceBtn = stockRow.locator('button[title*="Reduce Stock"], button:has-text("−")').first();
    await reduceBtn.click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await page.locator('#adjust-reduction-category').selectOption('SALE');
    await page.locator('#adjust-quantity').fill('500');
    await page.locator('#adjust-reason').fill('Oversold offline');

    await page.getByRole('button', { name: /save stock/i }).click();

    // Verify domain error
    const alertBox = page.locator('#adjust-error-msg');
    await expect(alertBox).toBeVisible({ timeout: 5000 });
    await expect(alertBox).toContainText(/insufficient stock|negative quantity/i);

    // Cancel modal
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(modal).not.toBeVisible();

    // Verify stock remains untouched at 120
    await expect(stockRow).toContainText('120');
  });
});
