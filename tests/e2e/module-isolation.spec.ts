import { test, expect } from '@playwright/test';
import { setupAuthenticatedContext, loginViaApi, ensureWorkspaceModules } from '../helpers/auth';
import { createUnitTest, createLocationTest } from '../helpers/seed';

test.describe.serial('Module Guards & Multi-Tenant Isolation E2E Journey', () => {
  let sessionA: { token: string; workspaceId: string };
  let sessionB: { token: string; workspaceId: string };
  let tenantAProductId: string;
  let tenantAProductName: string;
  let tenantALocId: string;
  let tenantALocName: string;

  test.beforeAll(async () => {
    // Session A (Customer workspace 01)
    sessionA = await loginViaApi('admin@niwa.local', 'ChangeMe123!');
    await ensureWorkspaceModules(sessionA.workspaceId, ['products', 'inventory']);

    // Session B (Tenant B workspace 02)
    sessionB = await loginViaApi('tenantb@niwa.local', 'ChangeMe123!');
    await ensureWorkspaceModules(sessionB.workspaceId, ['products', 'inventory']);

    // Seed Tenant A resources
    const unitA = await createUnitTest(sessionA.token, sessionA.workspaceId, `Box A ${Date.now()}`, `BA${Date.now().toString().slice(-4)}`);
    tenantALocName = `Tenant A Vault ${Date.now()}`;
    const locA = await createLocationTest(sessionA.token, sessionA.workspaceId, tenantALocName, `TAV${Date.now().toString().slice(-4)}`, 'WAREHOUSE');
    tenantALocId = locA.data?._id;

    tenantAProductName = `Tenant A Secret ${Date.now()}`;
    const prodA = await fetch('http://localhost:4000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionA.token}`,
        'x-workspace-id': sessionA.workspaceId,
      },
      body: JSON.stringify({
        name: tenantAProductName,
        type: 'PHYSICAL',
        defaultUnitId: unitA.data?._id,
        sellingPrice: 500,
        costPrice: 300,
      }),
    });
    const prodAData = await prodA.json();
    tenantAProductId = prodAData.data?._id;
  });

  test('14.1: Module Guard Enforcement (Disable, 403 Forbidden Block, Re-enable & Data Preservation)', async () => {
    // Step 1: Disable inventory module for workspace A
    const disableRes = await fetch('http://localhost:4000/api/modules/inventory', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionA.token}`,
        'x-workspace-id': sessionA.workspaceId,
      },
      body: JSON.stringify({ status: 'DISABLED' }),
    });
    expect(disableRes.status).toBe(200);

    // Step 2: Verify direct API requests to inventory are blocked with HTTP 403
    const locsBlockedRes = await fetch('http://localhost:4000/api/inventory/locations', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${sessionA.token}`,
        'x-workspace-id': sessionA.workspaceId,
      },
    });
    expect(locsBlockedRes.status).toBe(403);
    const locsBlockedData = await locsBlockedRes.json();
    expect(locsBlockedData.message).toMatch(/disabled for this workspace/i);

    const levelsBlockedRes = await fetch('http://localhost:4000/api/inventory/levels', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${sessionA.token}`,
        'x-workspace-id': sessionA.workspaceId,
      },
    });
    expect(levelsBlockedRes.status).toBe(403);

    // Step 3: Re-enable inventory module
    const enableRes = await fetch('http://localhost:4000/api/modules/inventory', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionA.token}`,
        'x-workspace-id': sessionA.workspaceId,
      },
      body: JSON.stringify({ status: 'ENABLED' }),
    });
    expect(enableRes.status).toBe(200);

    // Step 4: Verify previously created location is intact with zero data loss
    const locsActiveRes = await fetch(`http://localhost:4000/api/inventory/locations?q=${encodeURIComponent(tenantALocName)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${sessionA.token}`,
        'x-workspace-id': sessionA.workspaceId,
      },
    });
    expect(locsActiveRes.status).toBe(200);
    const locsActiveData = await locsActiveRes.json();
    const found = locsActiveData.data?.some((l: any) => l.name === tenantALocName);
    expect(found).toBe(true);
  });

  test('14.2: Strict Multi-Tenant Boundary Isolation in Browser and API', async ({ page }) => {
    // Authenticate browser as Tenant B
    await setupAuthenticatedContext(page, 'tenantb@niwa.local', 'ChangeMe123!');

    // Verify Tenant A's product is NOT visible in Tenant B's product catalog
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: /products/i }).first()).toBeVisible();

    const tenantAProductInB = page.locator('tbody tr', { hasText: tenantAProductName });
    await expect(tenantAProductInB).not.toBeVisible();

    // Verify Tenant A's location is NOT visible in Tenant B's locations directory
    await page.goto('/inventory/locations');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: /inventory locations/i })).toBeVisible();

    const tenantALocInB = page.locator('tbody tr', { hasText: tenantALocName });
    await expect(tenantALocInB).not.toBeVisible();

    // Direct ID lookup breach attempt for Tenant A's product using Tenant B's token
    const directProdBreach = await fetch(`http://localhost:4000/api/products/${tenantAProductId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${sessionB.token}`,
        'x-workspace-id': sessionB.workspaceId,
      },
    });
    expect(directProdBreach.status).toBe(404);

    // Direct ID lookup breach attempt for Tenant A's location using Tenant B's token
    const directLocBreach = await fetch(`http://localhost:4000/api/inventory/locations/${tenantALocId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${sessionB.token}`,
        'x-workspace-id': sessionB.workspaceId,
      },
    });
    expect(directLocBreach.status).toBe(404);

    // Tenant boundary breach attempt: Tenant B attempts to query Tenant A's workspace
    const crossTenantBreach = await fetch('http://localhost:4000/api/products', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${sessionB.token}`,
        'x-workspace-id': sessionA.workspaceId, // trying to access Workspace A
      },
    });
    expect(crossTenantBreach.status).toBe(403);
    const crossData = await crossTenantBreach.json();
    expect(crossData.message).toMatch(/not an active member of this workspace/i);
  });
});
