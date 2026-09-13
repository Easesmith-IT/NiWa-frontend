import { test, expect } from '@playwright/test';
import { setupAuthenticatedContext, loginViaApi } from '../helpers/auth';
import { createUnitTest } from '../helpers/seed';

test.describe('Products & Variants & Suppliers E2E Journey', () => {
  let session: { token: string; workspaceId: string };
  let testUnitId: string;
  let testUnitCode: string;
  let testProductId: string;

  test.beforeAll(async () => {
    session = await loginViaApi('admin@niwa.local', 'ChangeMe123!');
    const randomSuffix = Math.floor(Math.random() * 10000);
    testUnitCode = `KG${randomSuffix}`;
    const unitRes = await createUnitTest(session.token, session.workspaceId, `Kilogram ${randomSuffix}`, testUnitCode);
    testUnitId = unitRes.data?._id;

    const prodRes = await fetch('http://localhost:4000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
        'x-workspace-id': session.workspaceId,
      },
      body: JSON.stringify({
        name: `E2E Fixture Product ${randomSuffix}`,
        sellingPrice: 350,
        defaultUnitId: testUnitId,
      }),
    });
    const prodData = await prodRes.json();
    testProductId = prodData.data?._id;
  });

  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedContext(page, 'admin@niwa.local', 'ChangeMe123!');
  });

  test('5.1 & 5.2: Product Navigation, Unit Required Validation & Simple-by-Default Creation', async ({ page }) => {
    // 5.1 Product Navigation
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/products/);
    await expect(page.getByRole('heading', { name: /products & catalog/i })).toBeVisible();

    // Click Add Product
    const addProductLink = page.getByRole('link', { name: /add product/i }).first();
    await expect(addProductLink).toBeVisible();
    await addProductLink.click();
    await page.waitForURL(/\/products\/new/);

    // Verify simple-by-default fields
    const nameInput = page.getByPlaceholder(/Basmati Rice/i);
    const priceInput = page.getByPlaceholder(/350/i);
    const unitSelect = page.locator('select').first();
    const saveButton = page.getByRole('button', { name: /save product/i });

    await expect(nameInput).toBeVisible();
    await expect(priceInput).toBeVisible();
    await expect(unitSelect).toBeVisible();
    await expect(unitSelect).toHaveAttribute('required', '');

    // Attempt submission WITHOUT Unit
    await nameInput.fill('E2E Test Rice');
    await priceInput.fill('150');
    await unitSelect.selectOption('');

    // Check validity
    const isInvalid = await unitSelect.evaluate((e: HTMLSelectElement) => !e.checkValidity());
    expect(isInvalid).toBe(true);

    // Now select valid Unit and submit
    await unitSelect.selectOption(testUnitId);
    await saveButton.click();

    // 5.3 Verify redirection to product detail and human-readable Product ID generated
    await page.waitForURL(/\/products\/[a-zA-Z0-9_-]+$/, { timeout: 15000 });
    const prodIdText = page.getByText(/Business ID: PRD-/i);
    await expect(prodIdText).toBeVisible();

    // Verify Product detail displays product information
    await expect(page.getByRole('heading', { name: /E2E Test Rice/i })).toBeVisible();

    // Verify default variant was automatically created
    const variantsSection = page.locator('section, div', { hasText: /variants/i }).first();
    await expect(variantsSection).toContainText(/Standard|E2E Test Rice/i);
  });

  test('6: Product Variant Management & Duplicate SKU/Barcode Validation', async ({ page }) => {
    // Navigate to the test product detail directly
    await page.goto(`/products/${testProductId}`);
    await page.waitForLoadState('domcontentloaded');

    // Click Add Variant
    const addVariantBtn = page.getByRole('button', { name: /add variant/i });
    await expect(addVariantBtn).toBeVisible();
    await addVariantBtn.click();

    const uniqueSku = `SKU-E2E-${Date.now()}`;
    const uniqueBarcode = `BAR-${Date.now()}`;

    // Fill variant details
    await page.getByPlaceholder(/e\.g\. Red \/ Large/i).fill('Family 5kg Pack');
    await page.getByPlaceholder(/SKU-001/i).fill(uniqueSku);
    await page.getByPlaceholder(/890123\.\.\./i).fill(uniqueBarcode);
    await page.getByPlaceholder(/350/i).fill('650');
    await page.getByPlaceholder(/280/i).fill('500');

    // Save variant
    await page.getByRole('button', { name: /save variant/i }).click();

    // Verify variant appears in variants list
    const variantItem = page.locator('div', { hasText: uniqueSku }).first();
    await expect(variantItem).toBeVisible({ timeout: 10000 });
    await expect(variantItem).toContainText('Family 5kg Pack');
    await expect(variantItem).toContainText('650');

    // Test duplicate SKU validation: attempt to create variant with same SKU
    await addVariantBtn.click();
    await page.getByPlaceholder(/e\.g\. Red \/ Large/i).fill('Duplicate Pack');
    await page.getByPlaceholder(/SKU-001/i).fill(uniqueSku);
    await page.getByPlaceholder(/350/i).fill('700');
    await page.getByRole('button', { name: /save variant/i }).click();

    // Verify domain error for duplicate SKU
    const errorBox = page.locator('.text-red-700 span, .bg-red-50 span').first();
    await expect(errorBox).toBeVisible();
    await expect(errorBox).toContainText(/already exists|duplicate|sku/i);

    // Cancel variant form
    await page.getByRole('button', { name: /cancel/i }).first().click();
  });

  test('7: Supplier Management E2E Journey', async ({ page }) => {
    await page.goto('/products/suppliers');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: /suppliers directory/i })).toBeVisible();

    // Click Add Supplier
    const addSupplierBtn = page.getByRole('button', { name: /add supplier/i });
    await addSupplierBtn.click();

    const supplierName = `Global Agri Supply ${Date.now()}`;
    await page.getByPlaceholder(/e\.g\. Acme Logistics/i).fill(supplierName);
    await page.getByPlaceholder(/\+1 234 567 890/i).fill('+919876543210');
    await page.getByPlaceholder(/supplier@example\.com/i).fill('supply@globalagri.local');
    await page.getByPlaceholder(/City, Country/i).fill('Industrial Area Hub 2');

    // Submit
    await page.getByRole('button', { name: /save supplier/i }).click();

    // Verify supplier appears
    const supplierRow = page.locator('tbody tr', { hasText: supplierName });
    await expect(supplierRow).toBeVisible();
    await expect(supplierRow).toContainText('supply@globalagri.local');

    // Edit supplier
    const editBtn = supplierRow.locator('button').first();
    await editBtn.click();

    const editNameInput = page.locator('input[value*="Global Agri Supply"]');
    await editNameInput.fill(`${supplierName} Updated`);
    await page.getByRole('button', { name: /update supplier/i }).click();

    // Verify updated name persists
    await expect(page.locator('tbody tr', { hasText: `${supplierName} Updated` })).toBeVisible();
  });

  test('8: Product-Supplier Relationship E2E Journey', async ({ page }) => {
    // Navigate directly to the test product
    await page.goto(`/products/${testProductId}`);
    await page.waitForLoadState('domcontentloaded');

    // In Product Detail, find Link Supplier button (Truck icon)
    const linkSupplierBtn = page.locator('button[title="Link Supplier"]').first();
    await expect(linkSupplierBtn).toBeVisible({ timeout: 10000 });
    await linkSupplierBtn.click();

    // Fill Link Supplier form
    const suppSku = `SUP-SKU-${Date.now()}`;
    const supplierForm = page.locator('form').filter({ hasText: /link supplier to/i });
    const supplierSelect = supplierForm.locator('select');
    await expect(supplierSelect).toBeVisible();
    await supplierSelect.selectOption({ index: 1 });

    await supplierForm.getByPlaceholder(/e\.g\. SUP-SKU-99/i).fill(suppSku);
    await supplierForm.getByPlaceholder(/250/i).fill('180');

    // Submit Link inside form
    await supplierForm.getByRole('button', { name: /link supplier/i }).click();

    // Verify supplier relationship appears
    const suppRow = page.locator('div, tr', { hasText: suppSku }).first();
    await expect(suppRow).toBeVisible({ timeout: 10000 });
    await expect(suppRow).toContainText('180');

    // Unlink supplier
    const unlinkBtn = page.locator('button[title="Unlink Supplier"], button:has-text("Unlink")').first();
    await expect(unlinkBtn).toBeVisible({ timeout: 5000 });
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await unlinkBtn.click();
    await expect(suppRow).not.toBeVisible({ timeout: 5000 });
  });
});
