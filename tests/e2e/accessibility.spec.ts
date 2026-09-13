import { test, expect } from '@playwright/test';
import { setupAuthenticatedContext, loginViaApi, ensureWorkspaceModules } from '../helpers/auth';
import { createUnitTest, createLocationTest } from '../helpers/seed';

test.describe.serial('Inventory & Product Modals Accessibility Audit (WCAG)', () => {
  let session: { token: string; workspaceId: string };
  let testProductName: string;
  let testLocName: string;

  test.beforeAll(async () => {
    session = await loginViaApi('admin@niwa.local', 'ChangeMe123!');
    await ensureWorkspaceModules(session.workspaceId, ['products', 'inventory']);

    // Seed unit & location
    const unitRes = await createUnitTest(session.token, session.workspaceId, `Meter ${Date.now()}`, `M${Date.now().toString().slice(-4)}`);
    testLocName = `A11y Test Loc ${Date.now()}`;
    const locRes = await createLocationTest(session.token, session.workspaceId, testLocName, `A11Y${Date.now().toString().slice(-4)}`, 'WAREHOUSE');

    // Seed product with initial stock so row actions (Transfer, Reorder) are interactive
    testProductName = `A11y Fixture Product ${Date.now()}`;
    const prodRes = await fetch('http://localhost:4000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
        'x-workspace-id': session.workspaceId,
      },
      body: JSON.stringify({
        name: testProductName,
        type: 'PHYSICAL',
        defaultUnitId: unitRes.data?._id,
        sellingPrice: 100,
      }),
    });
    const prodData = await prodRes.json();
    const variantId = prodData.data?.defaultVariant?._id || prodData.data?.variants?.[0]?._id;

    // Establish opening stock
    await fetch('http://localhost:4000/api/inventory/adjust', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
        'x-workspace-id': session.workspaceId,
      },
      body: JSON.stringify({
        locationId: locRes.data?._id,
        inventoryItemId: variantId,
        type: 'OPENING',
        quantity: 50,
      }),
    });
  });

  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedContext(page, 'admin@niwa.local', 'ChangeMe123!');
  });

  test('13.1: Location Modal Accessibility Attributes & Escape Dismiss', async ({ page }) => {
    await page.goto('/inventory/locations');
    await page.waitForLoadState('domcontentloaded');

    // Open Location Modal
    await page.getByRole('button', { name: /add location/i }).click();

    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAttribute('aria-labelledby', 'location-modal-title');
    await expect(dialog).toHaveAttribute('aria-describedby', 'location-modal-desc');

    const title = page.locator('#location-modal-title');
    await expect(title).toBeVisible();
    await expect(title).toContainText(/add location/i);

    // Test dismiss via Escape key
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
  });

  test('13.2: Adjust Stock Modal Accessibility Attributes & Escape Dismiss', async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForLoadState('domcontentloaded');

    // Open Adjust Stock Modal
    await page.getByRole('button', { name: /adjust stock/i }).click();

    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAttribute('aria-labelledby', 'adjust-stock-title');
    await expect(dialog).toHaveAttribute('aria-describedby', 'adjust-stock-desc');

    const title = page.locator('#adjust-stock-title');
    await expect(title).toBeVisible();
    await expect(title).toContainText(/adjust stock/i);

    // Test dismiss via Escape key
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
  });

  test('13.3: Transfer Stock Modal Accessibility Attributes & Escape Dismiss', async ({ page }) => {
    await page.goto(`/inventory?q=${encodeURIComponent(testProductName)}`);
    await page.waitForLoadState('domcontentloaded');

    const row = page.locator('tbody tr', { hasText: testProductName }).first();
    await expect(row).toBeVisible({ timeout: 10000 });

    // Open Transfer modal from row dropdown
    await row.locator('button:has-text("More ▾")').click();
    await page.getByRole('button', { name: /transfer stock/i }).click();

    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAttribute('aria-labelledby', 'transfer-stock-title');
    await expect(dialog).toHaveAttribute('aria-describedby', 'transfer-stock-desc');

    const title = page.locator('#transfer-stock-title');
    await expect(title).toBeVisible();
    await expect(title).toContainText(/transfer stock between locations/i);

    // Test dismiss via Escape key
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
  });

  test('13.4: Reorder Settings Modal Accessibility Attributes & Escape Dismiss', async ({ page }) => {
    await page.goto(`/inventory?q=${encodeURIComponent(testProductName)}`);
    await page.waitForLoadState('domcontentloaded');

    const row = page.locator('tbody tr', { hasText: testProductName }).first();
    await expect(row).toBeVisible({ timeout: 10000 });

    // Open Reorder Settings modal from row dropdown
    await row.locator('button:has-text("More ▾")').click();
    const reorderOption = page.locator('button', { hasText: /reorder settings/i });
    await expect(reorderOption).toBeVisible();
    await reorderOption.click();

    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAttribute('aria-labelledby', 'reorder-settings-title');
    await expect(dialog).toHaveAttribute('aria-describedby', 'reorder-settings-desc');

    const title = page.locator('#reorder-settings-title');
    await expect(title).toBeVisible();
    await expect(title).toContainText(/reorder settings/i);

    // Test dismiss via Escape key
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
  });
});
