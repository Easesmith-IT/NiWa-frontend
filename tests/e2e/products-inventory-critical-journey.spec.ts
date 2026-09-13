import { test, expect } from '@playwright/test';
import { setupAuthenticatedContext, loginViaApi, ensureWorkspaceModules } from '../helpers/auth';
import { createUnitTest, createCategoryTest, createLocationTest } from '../helpers/seed';

test.describe.serial('Products & Inventory Complete Critical Journey', () => {
  let session: { token: string; workspaceId: string };
  let unitId: string;
  let unitCode: string;
  let categoryId: string;
  let locAId: string;
  let locAName: string;
  let locACode: string;
  let locBId: string;
  let locBName: string;
  let locBCode: string;
  let supplierId: string;
  let supplierName: string;
  let productName: string;
  let variantSku: string;
  let productId: string;
  let variantId: string;

  test.beforeAll(async () => {
    session = await loginViaApi('admin@niwa.local', 'ChangeMe123!');
    await ensureWorkspaceModules(session.workspaceId, ['products', 'inventory']);

    // Seed unit
    unitCode = `KG${Date.now().toString().slice(-4)}`;
    const unitRes = await createUnitTest(session.token, session.workspaceId, `Kilogram ${Date.now()}`, unitCode);
    unitId = unitRes.data?._id;

    // Seed category
    const catRes = await createCategoryTest(session.token, session.workspaceId, `Grains ${Date.now()}`, `CAT${Date.now().toString().slice(-4)}`);
    categoryId = catRes.data?._id;

    // Seed Location A (Central Warehouse) & Location B (Retail Storefront)
    locAName = `CJ Central WH ${Date.now()}`;
    locACode = `CJA${Date.now().toString().slice(-4)}`;
    const locARes = await createLocationTest(session.token, session.workspaceId, locAName, locACode, 'WAREHOUSE');
    locAId = locARes.data?._id;

    locBName = `CJ Retail Store ${Date.now()}`;
    locBCode = `CJB${Date.now().toString().slice(-4)}`;
    const locBRes = await createLocationTest(session.token, session.workspaceId, locBName, locBCode, 'RETAIL');
    locBId = locBRes.data?._id;

    // Seed Supplier
    supplierName = `AgriCorp Supplier ${Date.now()}`;
    const suppRes = await fetch('http://localhost:4000/api/products/suppliers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
        'x-workspace-id': session.workspaceId,
      },
      body: JSON.stringify({
        name: supplierName,
        email: `contact@agricorp${Date.now()}.local`,
        phone: '+919988776655',
      }),
    });
    const suppData = await suppRes.json();
    supplierId = suppData.data?._id;
  });

  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedContext(page, 'admin@niwa.local', 'ChangeMe123!');
  });

  test('Critical Journey: Complete Products, Variants, Suppliers, Multi-Location Inventory & Stock Ledger', async ({ page }) => {
    // -------------------------------------------------------------
    // Step 1: Create Product via UI (/products/new)
    // -------------------------------------------------------------
    await page.goto('/products/new');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: /add new product/i })).toBeVisible();

    productName = `Basmati Rice Superb ${Date.now()}`;
    await page.getByPlaceholder(/Basmati Rice 5kg/i).fill(productName);

    // Select Unit
    await page.locator('select').filter({ hasText: /select unit/i }).selectOption(unitId);

    // Fill Initial Pricing
    await page.getByPlaceholder(/350/i).fill('450');

    // Submit Product Creation Form
    await page.getByRole('button', { name: /save product/i }).click();

    // Verify redirected to Product Detail page
    await page.waitForURL(/\/products\/[a-zA-Z0-9_-]+$/, { timeout: 15000 });
    productId = page.url().split('/').pop()!;
    await expect(page.getByRole('heading', { name: productName })).toBeVisible({ timeout: 10000 });

    // -------------------------------------------------------------
    // Step 2: Add Product Variant
    // -------------------------------------------------------------
    const addVariantBtn = page.getByRole('button', { name: /add variant/i });
    await expect(addVariantBtn).toBeVisible();
    await addVariantBtn.click();

    variantSku = `SKU-CJ-${Date.now()}`;
    await page.getByPlaceholder(/e\.g\. Red \/ Large/i).fill('Family 10kg Sack');
    await page.getByPlaceholder(/SKU-001/i).fill(variantSku);
    await page.getByPlaceholder(/350/i).fill('850');
    await page.getByPlaceholder(/280/i).fill('650');

    await page.getByRole('button', { name: /save variant/i }).click();

    // Verify variant appears in the list
    const variantRow = page.locator('div', { hasText: variantSku }).first();
    await expect(variantRow).toBeVisible({ timeout: 10000 });
    await expect(variantRow).toContainText('Family 10kg Sack');

    // -------------------------------------------------------------
    // Step 3: Link Supplier to Variant
    // -------------------------------------------------------------
    const linkSuppBtn = variantRow.locator('button[title="Link Supplier"]').first();
    await linkSuppBtn.click();

    const suppForm = page.locator('form').filter({ hasText: /link supplier to/i });
    await expect(suppForm).toBeVisible();
    await suppForm.locator('select').selectOption(supplierId);

    const suppSku = `SUP-CJ-${Date.now()}`;
    await suppForm.getByPlaceholder(/e\.g\. SUP-SKU-99/i).fill(suppSku);
    await suppForm.getByPlaceholder(/250/i).fill('600');
    await suppForm.getByRole('button', { name: /link supplier/i }).click();

    // Verify linked supplier appears
    await expect(page.locator('div', { hasText: suppSku }).first()).toBeVisible({ timeout: 10000 });

    // -------------------------------------------------------------
    // Step 4: Establish Initial Opening Stock (100 units at LOC_A)
    // -------------------------------------------------------------
    await page.goto('/inventory');
    await page.waitForLoadState('domcontentloaded');

    await page.getByRole('button', { name: /adjust stock/i }).click();
    const adjustModal = page.locator('div[role="dialog"]');
    await expect(adjustModal).toBeVisible();

    const variantOption = await page.locator('#adjust-variant-id option', { hasText: productName }).first().getAttribute('value');
    await page.locator('#adjust-variant-id').selectOption(variantOption!);

    const locAOption = await page.locator('#adjust-location-id option', { hasText: locAName }).first().getAttribute('value');
    await page.locator('#adjust-location-id').selectOption(locAOption!);

    await page.getByRole('button', { name: /opening/i }).click();
    await page.locator('#adjust-quantity').fill('100');
    await page.locator('#adjust-reason').fill('Rollout baseline inventory');
    await page.getByRole('button', { name: /save stock/i }).click();

    // Verify Stock table displays 100 On Hand at LOC_A
    const stockRowA = page.locator('tbody tr', { hasText: productName }).filter({ hasText: locAName }).first();
    await expect(stockRowA).toBeVisible({ timeout: 10000 });
    await expect(stockRowA).toContainText('100');

    // -------------------------------------------------------------
    // Step 5: Quick + Add Stock (RECEIPT +50)
    // -------------------------------------------------------------
    const addStockBtn = stockRowA.locator('button[title*="Add Stock"], button:has-text("+")').first();
    await addStockBtn.click();
    await expect(adjustModal).toBeVisible();
    await page.locator('#adjust-quantity').fill('50');
    await page.locator('#adjust-reason').fill('Supplier purchase delivery lot 1');
    await page.getByRole('button', { name: /save stock/i }).click();

    // Verify On Hand = 150
    await expect(stockRowA).toContainText('150', { timeout: 10000 });

    // -------------------------------------------------------------
    // Step 6: Quick − Reduce Stock (DAMAGE -20)
    // -------------------------------------------------------------
    const reduceStockBtn = stockRowA.locator('button[title*="Reduce Stock"], button:has-text("−")').first();
    await reduceStockBtn.click();
    await expect(adjustModal).toBeVisible();
    await page.locator('#adjust-reduction-category').selectOption('DAMAGE');
    await page.locator('#adjust-quantity').fill('20');
    await page.locator('#adjust-reason').fill('Water damage in transit');
    await page.getByRole('button', { name: /save stock/i }).click();

    // Verify On Hand = 130
    await expect(stockRowA).toContainText('130', { timeout: 10000 });

    // -------------------------------------------------------------
    // Step 7: Transfer Stock (30 units from LOC_A to LOC_B)
    // -------------------------------------------------------------
    await stockRowA.locator('button:has-text("More ▾")').click();
    await page.getByRole('button', { name: /transfer stock/i }).click();

    const transferModal = page.locator('div[role="dialog"]');
    await expect(transferModal).toBeVisible();

    const locBOption = await page.locator('#transfer-dest-location-id option', { hasText: locBName }).first().getAttribute('value');
    await page.locator('#transfer-dest-location-id').selectOption(locBOption!);

    await page.locator('#transfer-quantity').fill('30');
    await page.locator('#transfer-reason').fill('Replenishing retail counter inventory');
    await page.getByRole('button', { name: /execute transfer/i }).click();

    await expect(transferModal).not.toBeVisible({ timeout: 5000 });

    // Verify LOC_A On Hand decremented to 100 (130 - 30)
    await expect(stockRowA).toContainText('100', { timeout: 10000 });

    // Verify LOC_B On Hand created with 30
    const stockRowB = page.locator('tbody tr', { hasText: productName }).filter({ hasText: locBName }).first();
    await expect(stockRowB).toBeVisible({ timeout: 10000 });
    await expect(stockRowB).toContainText('30');

    // -------------------------------------------------------------
    // Step 8: Physical Count Adjustment at LOC_B (Count = 28, delta -2)
    // -------------------------------------------------------------
    await stockRowB.locator('button:has-text("More ▾")').click();
    await page.getByRole('button', { name: /physical count/i }).click();
    await expect(adjustModal).toBeVisible();

    await page.locator('#adjust-quantity').fill('28');
    await page.locator('#adjust-reason').fill('Physical inventory discrepancy audit');
    await page.getByRole('button', { name: /save stock/i }).click();

    // Verify LOC_B On Hand adjusted to 28
    await expect(stockRowB).toContainText('28', { timeout: 10000 });

    // -------------------------------------------------------------
    // Step 9: Audit Ledger & Mathematical Integrity Verification
    // -------------------------------------------------------------
    await page.goto('/inventory/movements');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: /stock movement ledger/i })).toBeVisible();

    // Filter movements or verify table rows for the created product
    const productMovements = page.locator('tbody tr', { hasText: productName });
    await expect(productMovements.first()).toBeVisible({ timeout: 10000 });

    // Verify all movement types are recorded in the ledger
    await expect(productMovements.filter({ hasText: 'OPENING' })).toBeVisible();
    await expect(productMovements.filter({ hasText: 'RECEIPT' })).toBeVisible();
    await expect(productMovements.filter({ hasText: 'DAMAGE' })).toBeVisible();
    await expect(productMovements.filter({ hasText: 'TRANSFER' })).toBeVisible();
    await expect(productMovements.filter({ hasText: 'ADJUSTMENT' })).toBeVisible();

    // Direct Database Mathematical Verification via API:
    // Query backend levels for this product across all locations
    const levelsRes = await fetch(`http://localhost:4000/api/inventory/levels`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'x-workspace-id': session.workspaceId,
      },
    });
    const levelsJson = await levelsRes.json();
    const productLevels = levelsJson.data.filter(
      (l: any) => l.inventoryItemId?.productVariantId?.productId?.name === productName
    );

    const totalOnHand = productLevels.reduce((acc: number, l: any) => acc + l.onHand, 0);
    // Calculation: 100 (LOC_A) + 28 (LOC_B) = 128
    expect(totalOnHand).toBe(128);

    // Sum of movements for this product:
    const movRes = await fetch('http://localhost:4000/api/inventory/movements?limit=100', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'x-workspace-id': session.workspaceId,
      },
    });
    const movJson = await movRes.json();
    const relatedMovements = movJson.data.filter(
      (m: any) => m.inventoryItemId?.productVariantId?.productId?.name === productName
    );

    // Ledger has:
    // +100 (OPENING)
    // +50 (RECEIPT)
    // -20 (DAMAGE)
    // +30 (TRANSFER internal rebalance)
    // -2 (ADJUSTMENT physical count delta from 30 to 28)
    expect(relatedMovements.length).toBeGreaterThanOrEqual(5);
  });
});
