import { test, expect } from '@playwright/test';
import { setupAuthenticatedContext, loginViaApi, ensureWorkspaceModules } from '../helpers/auth';
import { createUnitTest, createLocationTest } from '../helpers/seed';

test.describe.serial('Inventory Stock Transfer & Idempotency E2E Journey', () => {
  let session: { token: string; workspaceId: string };
  let unitId: string;
  let sourceLocId: string;
  let sourceLocName: string;
  let destLocId: string;
  let destLocName: string;
  let productName: string;
  let variantId: string;

  test.beforeAll(async () => {
    session = await loginViaApi('admin@niwa.local', 'ChangeMe123!');
    await ensureWorkspaceModules(session.workspaceId, ['products', 'inventory']);

    // Seed unit
    const unitRes = await createUnitTest(session.token, session.workspaceId, `Box ${Date.now()}`, `BX${Date.now().toString().slice(-4)}`);
    unitId = unitRes.data?._id;

    // Seed Source and Destination locations
    sourceLocName = `Transfer Source ${Date.now()}`;
    const sourceRes = await createLocationTest(session.token, session.workspaceId, sourceLocName, `TSRC${Date.now().toString().slice(-4)}`, 'WAREHOUSE');
    sourceLocId = sourceRes.data?._id;

    destLocName = `Transfer Dest ${Date.now()}`;
    const destRes = await createLocationTest(session.token, session.workspaceId, destLocName, `TDST${Date.now().toString().slice(-4)}`, 'STORE');
    destLocId = destRes.data?._id;

    // Seed Product
    productName = `Transfer Item ${Date.now()}`;
    const prodRes = await fetch('http://localhost:4000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
        'x-workspace-id': session.workspaceId,
      },
      body: JSON.stringify({
        name: productName,
        type: 'PHYSICAL',
        defaultUnitId: unitId,
        sellingPrice: 200,
        costPrice: 120,
      }),
    });
    const prodData = await prodRes.json();
    variantId = prodData.data?.defaultVariant?._id || prodData.data?.variants?.[0]?._id;

    // Record initial opening stock of 100 at Source Location via /api/inventory/adjust
    const adjRes = await fetch('http://localhost:4000/api/inventory/adjust', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
        'x-workspace-id': session.workspaceId,
      },
      body: JSON.stringify({
        locationId: sourceLocId,
        inventoryItemId: variantId,
        type: 'OPENING',
        quantity: 100,
        reason: 'Initial setup for transfer test',
      }),
    });
    const adjData = await adjRes.json();
    expect(adjData.success).toBe(true);
  });

  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedContext(page, 'admin@niwa.local', 'ChangeMe123!');
  });

  test('11: Stock Transfer Validation & E2E Execution', async ({ page }) => {
    await page.goto(`/inventory?q=${encodeURIComponent(productName)}`);
    await page.waitForLoadState('domcontentloaded');

    // Find source stock row
    const sourceRow = page.locator('tbody tr', { hasText: sourceLocName }).first();
    await expect(sourceRow).toBeVisible({ timeout: 10000 });
    await expect(sourceRow).toContainText('100');

    // Open More dropdown and click Transfer Stock
    const moreBtn = sourceRow.locator('button:has-text("More ▾")');
    await moreBtn.click();

    const transferMenuBtn = page.getByRole('button', { name: /transfer stock/i });
    await expect(transferMenuBtn).toBeVisible();
    await transferMenuBtn.click();

    // Verify modal dialog accessibility
    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toHaveAttribute('aria-modal', 'true');
    await expect(modal).toHaveAttribute('aria-labelledby', 'transfer-stock-title');

    // Verify source location details in transfer description
    const desc = page.locator('#transfer-stock-desc');
    await expect(desc).toContainText(sourceLocName);
    await expect(desc).toContainText('100');

    // Select Destination Location
    const destSelect = page.locator('#transfer-dest-location-id');
    const destOption = await destSelect.locator('option', { hasText: destLocName }).first().getAttribute('value');
    await destSelect.selectOption(destOption!);

    // Attempt invalid transfer: quantity > available (e.g. 500 exceeds max available 100)
    await page.locator('#transfer-quantity').fill('500');
    const isOverflow = await page.locator('#transfer-quantity').evaluate((el: HTMLInputElement) => el.validity.rangeOverflow);
    expect(isOverflow).toBe(true);

    // Enter valid quantity: 30
    await page.locator('#transfer-quantity').fill('30');
    const isValid = await page.locator('#transfer-quantity').evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(isValid).toBe(true);
    await page.locator('#transfer-reason').fill('Replenishment batch to retail store');

    // Submit valid transfer
    await page.getByRole('button', { name: /execute transfer/i }).click();

    // Verify modal closed
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // Verify Source row updated: On Hand was 100, now 70
    await expect(sourceRow).toContainText('70', { timeout: 10000 });

    // Verify Destination row created: On Hand is 30
    const destRow = page.locator('tbody tr', { hasText: destLocName }).first();
    await expect(destRow).toBeVisible({ timeout: 10000 });
    await expect(destRow).toContainText('30');
  });

  test('12: Transfer Ledger & Idempotency Verification', async ({ page }) => {
    // Navigate to Movement Ledger
    await page.goto('/inventory/movements');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: /stock movement ledger/i })).toBeVisible();

    // Verify TRANSFER entry appears with correct source and destination
    const transferEntry = page.locator('tbody tr', { hasText: productName }).filter({ hasText: 'TRANSFER' }).first();
    await expect(transferEntry).toBeVisible({ timeout: 10000 });
    await expect(transferEntry).toContainText(sourceLocName);
    await expect(transferEntry).toContainText(destLocName);
    await expect(transferEntry).toContainText('30');

    // Test Idempotent Transfer Submission via API
    const opId = `op_test_transfer_idem_${Date.now()}`;
    const transferPayload = {
      inventoryItemId: variantId,
      sourceLocationId: sourceLocId,
      destinationLocationId: destLocId,
      quantity: 15,
      reason: 'Idempotency validation transfer',
      operationId: opId,
    };

    // First transfer submission
    const res1 = await fetch('http://localhost:4000/api/inventory/transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
        'x-workspace-id': session.workspaceId,
      },
      body: JSON.stringify(transferPayload),
    });
    expect(res1.status).toBe(200);
    const data1 = await res1.json();
    expect(data1.data?.movement?.operationId).toBe(opId);

    // Duplicate transfer submission with identical operationId
    const res2 = await fetch('http://localhost:4000/api/inventory/transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
        'x-workspace-id': session.workspaceId,
      },
      body: JSON.stringify(transferPayload),
    });
    expect(res2.status).toBe(200);
    const data2 = await res2.json();
    // Must return the exact same movement record
    expect(data2.data?.movement?._id).toBe(data1.data?.movement?._id);

    // Verify final stock levels in UI:
    // Source started at 70, subtracted 15 once => 55
    // Dest started at 30, added 15 once => 45
    await page.goto(`/inventory?q=${encodeURIComponent(productName)}`);
    await page.waitForLoadState('domcontentloaded');

    const sourceRow = page.locator('tbody tr', { hasText: sourceLocName }).first();
    await expect(sourceRow).toContainText('55', { timeout: 10000 });

    const destRow = page.locator('tbody tr', { hasText: destLocName }).first();
    await expect(destRow).toContainText('45', { timeout: 10000 });
  });
});
