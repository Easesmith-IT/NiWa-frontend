import { test, expect } from '@playwright/test';
import { setupAuthenticatedContext, loginViaApi } from '../helpers/auth';
import { createUnitTest } from '../helpers/seed';

test.describe('Products Relationship UX — Brand, Unit, Category, Variant & Supplier', () => {
  let session: { token: string; workspaceId: string };
  const rand = Math.floor(Math.random() * 10000);

  test.beforeAll(async () => {
    session = await loginViaApi('admin@niwa.local', 'ChangeMe123!');
  });

  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedContext(page, 'admin@niwa.local', 'ChangeMe123!');
  });

  test('1. Brand Directory UX: Create, Display, and Edit Brand', async ({ page }) => {
    await page.goto('/products/brands');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: /brand registry/i })).toBeVisible();

    // Verify subnav links exist in main container
    const mainArea = page.getByRole('main');
    await expect(mainArea.getByRole('link', { name: /units/i })).toBeVisible();
    await expect(mainArea.getByRole('link', { name: /categories/i })).toBeVisible();
    await expect(mainArea.getByRole('link', { name: /suppliers/i })).toBeVisible();

    // Create Brand
    await page.getByRole('button', { name: /add brand/i }).click();
    const brandName = `E2E Brand Alpha ${rand}`;
    await page.getByPlaceholder(/e\.g\. Nike, Apple, Samsung/i).fill(brandName);
    await page.getByPlaceholder(/optional description/i).fill('Testing Category');
    await page.getByRole('button', { name: /save brand/i }).click();

    // Verify Brand appears in table
    const brandRow = page.locator('tbody tr', { hasText: brandName });
    await expect(brandRow).toBeVisible({ timeout: 10000 });

    // Edit Brand
    const editBtn = brandRow.locator('button[title="Edit brand"], button:has-text("Edit")').first();
    await editBtn.click();

    // Update Brand Name
    const updatedBrandName = `E2E Brand Alpha ${rand} Updated`;
    const nameInput = page.locator('input[value*="E2E Brand Alpha"]').first();
    await nameInput.fill(updatedBrandName);
    await page.getByRole('button', { name: /update brand/i }).click();

    // Verify updated brand name persists
    await expect(page.locator('tbody tr', { hasText: updatedBrandName })).toBeVisible({ timeout: 10000 });
  });

  test('2. Unit Directory UX: Create, Display, and Edit Unit', async ({ page }) => {
    await page.goto('/products/units');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: /units of measure/i })).toBeVisible();

    // Verify subnav in main area
    const mainArea = page.getByRole('main');
    await expect(mainArea.getByRole('link', { name: /brands/i })).toBeVisible();
    await expect(mainArea.getByRole('link', { name: /categories/i })).toBeVisible();

    // Create Unit
    await page.getByRole('button', { name: /add unit/i }).click();
    const unitName = `Measurement Unit ${rand}`;
    const unitCode = `MU${rand}`;
    await page.getByPlaceholder(/e\.g\. Kilogram, Pieces, Liter/i).fill(unitName);
    await page.getByPlaceholder(/e\.g\. KG, PCS, LTR/i).fill(unitCode);
    await page.getByRole('button', { name: /save unit/i }).click();

    // Verify unit row in table (case-insensitive for code)
    const unitRow = page.locator('tbody tr', { hasText: unitName });
    await expect(unitRow).toBeVisible({ timeout: 10000 });
    await expect(unitRow).toContainText(new RegExp(unitCode, 'i'));

    // Edit Unit
    const editBtn = unitRow.locator('button[title="Edit unit"], button:has-text("Edit")').first();
    await editBtn.click();

    const updatedUnitName = `Measurement Unit ${rand} Renamed`;
    const nameInput = page.locator('input[value*="Measurement Unit"]').first();
    await nameInput.fill(updatedUnitName);
    await page.getByRole('button', { name: /update unit/i }).click();

    // Verify updated unit name persists
    await expect(page.locator('tbody tr', { hasText: updatedUnitName })).toBeVisible({ timeout: 10000 });
  });

  test('3. Complete Product Relationship Hub & Variant Supplier Lifecycle', async ({ page }) => {
    // Seed prerequisite Brand and Supplier via API for reliable execution
    const brandRes = await fetch('http://localhost:4000/api/products/brands', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
        'x-workspace-id': session.workspaceId,
      },
      body: JSON.stringify({ name: `Hub Brand ${rand}` }),
    });
    const brandData = await brandRes.json();
    const testBrandId = brandData.data?._id;

    const supp1Res = await fetch('http://localhost:4000/api/products/suppliers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
        'x-workspace-id': session.workspaceId,
      },
      body: JSON.stringify({ name: `Primary Supplier ${rand}`, email: `prim${rand}@supplier.local` }),
    });
    const supp1Data = await supp1Res.json();
    const supp1Id = supp1Data.data?._id;

    const supp2Res = await fetch('http://localhost:4000/api/products/suppliers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
        'x-workspace-id': session.workspaceId,
      },
      body: JSON.stringify({ name: `Backup Supplier ${rand}`, email: `back${rand}@supplier.local` }),
    });
    const supp2Data = await supp2Res.json();
    const supp2Id = supp2Data.data?._id;

    const unitRes = await createUnitTest(session.token, session.workspaceId, `Hub Unit ${rand}`, `HU${rand}`);
    const unitId = unitRes.data?._id;

    // 1. Create a Product via UI
    await page.goto('/products/new');
    await page.waitForLoadState('domcontentloaded');

    const productName = `Relationship Hub Product ${rand}`;
    await page.getByPlaceholder(/Basmati Rice/i).fill(productName);
    await page.getByPlaceholder(/350/i).fill('450');

    // Select Unit
    const unitSelect = page.locator('select').first();
    await unitSelect.selectOption(unitId);

    // Save
    await page.getByRole('button', { name: /save product/i }).click();
    await page.waitForURL(/\/products\/[a-zA-Z0-9_-]+$/, { timeout: 15000 });

    // 2. Verify Product Detail Header Relationship Badges
    await expect(page.getByRole('heading', { name: productName })).toBeVisible({ timeout: 15000 });

    // Brand empty state check
    const assignBrandAction = page.locator('button:has-text("[Assign Brand]")');
    await expect(assignBrandAction).toBeVisible();

    // Unit badge check
    await expect(page.locator('span', { hasText: new RegExp(`HU${rand}`, 'i') }).first()).toBeVisible();

    // 3. Edit Product: Assign Brand via Edit form
    const editProductBtn = page.getByRole('button', { name: 'Edit Product' }).or(page.locator('button:has-text("Edit Product")')).first();
    await editProductBtn.click();

    // Brand dropdown in edit form
    const editForm = page.locator('form').filter({ hasText: /edit product details/i });
    await expect(editForm).toBeVisible();

    const brandSelect = editForm.locator('label', { hasText: /^Brand$/i }).locator('..').locator('select');
    await expect(brandSelect).toBeVisible();
    await brandSelect.selectOption(testBrandId);

    // Save product edit
    await page.getByRole('button', { name: /save changes/i }).click();

    // Verify Brand badge is now visible in top header
    await expect(page.locator('span', { hasText: `Hub Brand ${rand}` }).first()).toBeVisible({ timeout: 10000 });

    // 4. Variant Suppliers Relationship UX
    // Empty state should be visible initially
    await expect(page.getByText(/no suppliers linked to this variant/i)).toBeVisible();

    // Click Add Supplier
    const addSupplierBtn = page.locator('button:has-text("Add Supplier")').first();
    await addSupplierBtn.click();

    // Fill Link Supplier form
    const supplierForm = page.locator('form').filter({ hasText: /link supplier to/i });
    await expect(supplierForm).toBeVisible();

    const suppSelect = supplierForm.locator('select');
    await suppSelect.selectOption(supp1Id);

    const sup1Sku = `SUP1-${rand}`;
    await supplierForm.getByPlaceholder(/e\.g\. SUP-SKU-99/i).fill(sup1Sku);
    await supplierForm.getByPlaceholder(/250/i).fill('220');
    await supplierForm.locator('input[type="number"]').nth(1).fill('10'); // MOQ

    // Check Preferred checkbox
    const prefCheckbox = supplierForm.locator('input[type="checkbox"]');
    await prefCheckbox.check();

    await supplierForm.getByRole('button', { name: /link supplier/i }).click();

    // Verify Supplier card displays with Preferred badge, MOQ, and Purchase Price
    const supp1Card = page.locator('div.p-2\\.5', { hasText: `Primary Supplier ${rand}` }).first();
    await expect(supp1Card).toBeVisible({ timeout: 10000 });
    await expect(supp1Card).toContainText('Preferred');
    await expect(supp1Card).toContainText('MOQ: 10');
    await expect(supp1Card).toContainText('₹220');
    await expect(supp1Card).toContainText(sup1Sku);

    // 5. Edit Supplier Relationship inline
    const editSuppBtn = supp1Card.locator('button[title="Edit supplier relationship"]');
    await editSuppBtn.click();

    // Form should appear with prefilled values
    const editSuppForm = page.locator('form').filter({ hasText: /edit supplier:/i });
    await expect(editSuppForm).toBeVisible();

    // Update MOQ and Price
    await editSuppForm.locator('input[type="number"]').first().fill('240'); // Price
    await editSuppForm.locator('input[type="number"]').nth(1).fill('25'); // MOQ
    await editSuppForm.getByRole('button', { name: /save/i }).click();

    // Verify updated values persist
    await expect(supp1Card).toContainText('MOQ: 25', { timeout: 10000 });
    await expect(supp1Card).toContainText('₹240');

    // 6. Add Second Supplier
    await addSupplierBtn.click();
    await suppSelect.selectOption(supp2Id);
    await supplierForm.getByPlaceholder(/250/i).fill('260');
    await supplierForm.getByRole('button', { name: /link supplier/i }).click();

    const supp2Card = page.locator('div.p-2\\.5', { hasText: `Backup Supplier ${rand}` }).first();
    await expect(supp2Card).toBeVisible({ timeout: 10000 });

    // 7. Unlink First Supplier
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    const unlinkBtn = supp1Card.locator('button[title="Unlink Supplier"]');
    await unlinkBtn.click();

    // Verify First supplier is removed from variant
    await expect(page.getByText(sup1Sku)).not.toBeVisible({ timeout: 10000 });
    // Second supplier is still linked
    await expect(supp2Card).toBeVisible();

    // 8. Verify Master Supplier record in Directory was NOT deleted
    await page.goto('/products/suppliers');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('tbody tr', { hasText: `Primary Supplier ${rand}` })).toBeVisible();
    await expect(page.locator('tbody tr', { hasText: `Backup Supplier ${rand}` })).toBeVisible();
  });
});
