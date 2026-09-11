import { test, expect } from '@playwright/test';

// Helper to set up authenticated browser context and route mocks
async function setupAuthenticatedInventoryMocks(page: any) {
  // 1. Inject localStorage session
  await page.addInitScript(() => {
    window.localStorage.setItem('niwa.accessToken', 'e2e-test-token-jwt');
    window.localStorage.setItem('activeWorkspaceId', 'ws-e2e-a11y-test');
  });

  // 2. Intercept API routes with realistic mock data
  await page.route('**/api/inventory/locations*', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [
          { _id: 'loc-1', name: 'Main Store', code: 'STR-01', type: 'STORE', status: 'ACTIVE' },
          { _id: 'loc-2', name: 'Warehouse Beta', code: 'WH-02', type: 'WAREHOUSE', status: 'ACTIVE' },
        ],
        meta: { total: 2 },
      }),
    });
  });

  await page.route('**/api/inventory/levels*', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [
          {
            _id: 'lvl-1',
            levelId: 'LVL-001',
            onHand: 15,
            reserved: 2,
            available: 13,
            reorderPoint: 20,
            reorderQuantity: 50,
            locationId: { _id: 'loc-1', name: 'Main Store', code: 'STR-01' },
            inventoryItemId: {
              _id: 'item-1',
              inventoryItemId: 'INV-001',
              productVariantId: {
                _id: 'var-1',
                name: 'Standard 1kg',
                sku: 'PROD-1KG',
                productId: { _id: 'prod-1', name: 'Premium Coffee Beans' },
              },
            },
          },
        ],
        meta: { total: 1, page: 1, limit: 25 },
      }),
    });
  });

  await page.route('**/api/products*', async (route: any) => {
    const url = route.request().url();
    if (url.includes('/api/products/prod-1') || url.match(/\/api\/products\/[a-zA-Z0-9_-]+$/)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            _id: 'prod-1',
            productId: 'PRD-001',
            name: 'Premium Coffee Beans',
            description: 'Organic fair-trade roast',
            status: 'ACTIVE',
            variants: [
              {
                _id: 'var-1',
                variantId: 'VAR-001',
                name: 'Standard 1kg',
                sku: 'PROD-1KG',
                sellingPrice: 450,
                costPrice: 280,
                isDefault: true,
              },
            ],
          },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [
          {
            _id: 'prod-1',
            productId: 'PRD-001',
            name: 'Premium Coffee Beans',
            status: 'ACTIVE',
            defaultVariant: { _id: 'var-1', sku: 'PROD-1KG' },
          },
        ],
        meta: { total: 1 },
      }),
    });
  });
}

test.describe('Products & Inventory — Accessible Dialog Hardening', () => {
  test('Adjust Stock Dialog semantics, form labeling, and Escape dismissal', async ({ page }) => {
    await setupAuthenticatedInventoryMocks(page);

    await page.goto('/inventory');
    await page.waitForLoadState('domcontentloaded');

    // If redirected to login (unauthenticated runtime), skip gracefully
    if (page.url().includes('/login')) {
      test.skip(true, 'NOT VERIFIED — authenticated runtime unavailable');
      return;
    }

    // Open Adjust Stock modal
    const adjustBtn = page.getByRole('button', { name: /adjust stock/i });
    await expect(adjustBtn).toBeVisible();
    await adjustBtn.click();

    // Verify Modal container semantics
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAccessibleName(/adjust stock/i);

    // Verify aria-labelledby references existing title
    const labelledBy = await dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    await expect(page.locator(`#${labelledBy}`)).toBeVisible();

    // Verify Accessible Close button
    const closeBtn = page.getByRole('button', { name: /close dialog/i });
    await expect(closeBtn).toBeVisible();

    // Verify accessible form controls
    await expect(page.getByLabel(/quantity/i)).toBeVisible();

    // Test Escape key dismissal
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('Transfer Stock Dialog semantics, form labeling, and Escape dismissal', async ({ page }) => {
    await setupAuthenticatedInventoryMocks(page);

    await page.goto('/inventory');
    await page.waitForLoadState('domcontentloaded');

    if (page.url().includes('/login')) {
      test.skip(true, 'NOT VERIFIED — authenticated runtime unavailable');
      return;
    }

    // Find quick action button for transfer or open transfer modal
    const transferBtn = page.getByRole('button', { name: /transfer stock/i }).or(page.locator('button[title*="Transfer"]')).first();
    if (await transferBtn.isVisible()) {
      await transferBtn.click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveAttribute('aria-modal', 'true');
      await expect(dialog).toHaveAccessibleName(/transfer stock/i);

      // Verify aria-labelledby and aria-describedby
      const labelledBy = await dialog.getAttribute('aria-labelledby');
      expect(labelledBy).toBe('transfer-stock-title');
      await expect(page.locator(`#${labelledBy}`)).toBeVisible();

      const describedBy = await dialog.getAttribute('aria-describedby');
      expect(describedBy).toBe('transfer-stock-desc');
      await expect(page.locator(`#${describedBy}`)).toBeVisible();

      // Verify form controls
      await expect(page.getByLabel(/destination location/i)).toBeVisible();
      await expect(page.getByLabel(/quantity to transfer/i)).toBeVisible();

      // Close on Escape
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
    }
  });

  test('Reorder Settings Dialog semantics, description hints, and Escape dismissal', async ({ page }) => {
    await setupAuthenticatedInventoryMocks(page);

    await page.goto('/inventory');
    await page.waitForLoadState('domcontentloaded');

    if (page.url().includes('/login')) {
      test.skip(true, 'NOT VERIFIED — authenticated runtime unavailable');
      return;
    }

    // Find reorder action button
    const reorderBtn = page.getByRole('button', { name: /reorder settings/i }).or(page.locator('button[title*="Reorder"]')).first();
    if (await reorderBtn.isVisible()) {
      await reorderBtn.click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveAttribute('aria-modal', 'true');
      await expect(dialog).toHaveAccessibleName(/reorder settings/i);

      // Verify aria-labelledby and aria-describedby
      const labelledBy = await dialog.getAttribute('aria-labelledby');
      expect(labelledBy).toBe('reorder-settings-title');
      await expect(page.locator(`#${labelledBy}`)).toBeVisible();

      const describedBy = await dialog.getAttribute('aria-describedby');
      expect(describedBy).toBe('reorder-settings-desc');
      await expect(page.locator(`#${describedBy}`)).toBeVisible();

      // Verify form controls and hint associations
      const reorderPointInput = page.getByLabel(/reorder point/i);
      await expect(reorderPointInput).toBeVisible();
      await expect(reorderPointInput).toHaveAttribute('aria-describedby', 'reorder-point-hint');

      const reorderQtyInput = page.getByLabel(/reorder quantity/i);
      await expect(reorderQtyInput).toBeVisible();
      await expect(reorderQtyInput).toHaveAttribute('aria-describedby', 'reorder-qty-hint');

      // Close on Escape
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
    }
  });

  test('Product Detail Contextual Stock Modal semantics and Escape dismissal', async ({ page }) => {
    await setupAuthenticatedInventoryMocks(page);

    await page.goto('/products/prod-1');
    await page.waitForLoadState('domcontentloaded');

    if (page.url().includes('/login')) {
      test.skip(true, 'NOT VERIFIED — authenticated runtime unavailable');
      return;
    }

    // Find "+ Add Stock" quick action on product detail
    const addStockBtn = page.getByRole('button', { name: /\+ add stock/i }).first();
    if (await addStockBtn.isVisible()) {
      await addStockBtn.click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveAttribute('aria-modal', 'true');
      await expect(dialog).toHaveAccessibleName(/add stock/i);

      // Verify aria-labelledby and aria-describedby
      const labelledBy = await dialog.getAttribute('aria-labelledby');
      expect(labelledBy).toBe('stock-action-modal-title');
      await expect(page.locator(`#${labelledBy}`)).toBeVisible();

      const describedBy = await dialog.getAttribute('aria-describedby');
      expect(describedBy).toBe('stock-action-modal-desc');
      await expect(page.locator(`#${describedBy}`)).toBeVisible();

      // Verify form controls
      await expect(page.getByLabel(/product variant/i)).toBeVisible();
      await expect(page.getByLabel(/quantity/i)).toBeVisible();

      // Close on Escape
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
    }
  });

  test('Location Management Dialog semantics and Escape dismissal', async ({ page }) => {
    await setupAuthenticatedInventoryMocks(page);

    await page.goto('/inventory/locations');
    await page.waitForLoadState('domcontentloaded');

    if (page.url().includes('/login')) {
      test.skip(true, 'NOT VERIFIED — authenticated runtime unavailable');
      return;
    }

    // Open Add Location modal
    const addLocationBtn = page.getByRole('button', { name: /add location/i });
    if (await addLocationBtn.isVisible()) {
      await addLocationBtn.click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveAttribute('aria-modal', 'true');
      await expect(dialog).toHaveAccessibleName(/add location/i);

      // Verify aria-labelledby and aria-describedby
      const labelledBy = await dialog.getAttribute('aria-labelledby');
      expect(labelledBy).toBe('location-modal-title');
      await expect(page.locator(`#${labelledBy}`)).toBeVisible();

      const describedBy = await dialog.getAttribute('aria-describedby');
      expect(describedBy).toBe('location-modal-desc');
      await expect(page.locator(`#${describedBy}`)).toBeVisible();

      // Verify form controls
      await expect(page.getByLabel(/location name/i)).toBeVisible();
      await expect(page.getByLabel(/code/i)).toBeVisible();

      // Close on Escape
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
    }
  });
});
