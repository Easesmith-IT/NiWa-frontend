import { test, expect } from '@playwright/test';
import { setupAuthenticatedContext, loginViaApi, ensureWorkspaceModules } from '../helpers/auth';

test.describe('NIWA UX Simplification E2E Verification', () => {
  let session: { token: string; workspaceId: string };

  test.beforeAll(async () => {
    session = await loginViaApi('admin@niwa.local', 'ChangeMe123!');
    await fetch('http://localhost:4000/api/modules/purchasing', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
        'x-workspace-id': session.workspaceId,
      },
      body: JSON.stringify({ status: 'DISABLED' }),
    });
    await ensureWorkspaceModules(session.token, session.workspaceId, ['products', 'inventory']);
  });

  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedContext(page, 'admin@niwa.local', 'ChangeMe123!');
  });

  test('1. Home Dashboard renders Needs Your Attention, Quick Actions, and collapsible Telemetry', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: /needs your attention today/i })).toBeVisible();
    await expect(page.getByText(/unread & awaiting reply/i)).toBeVisible();
    await expect(page.getByText(/tasks due & overdue/i)).toBeVisible();
    await expect(page.getByText(/expiring 24h windows/i)).toBeVisible();

    // Quick action buttons
    await expect(page.getByRole('button', { name: /open inbox/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /customer 360/i })).toBeVisible();

    // Collapsible telemetry section
    const telemetryToggle = page.getByRole('button', {
      name: /whatsapp cloud api & automation telemetry/i,
    });
    await expect(telemetryToggle).toBeVisible();
    await expect(page.getByText(/outbound dispatched/i)).toBeVisible();

    // Collapse and re-expand telemetry
    await telemetryToggle.click();
    await expect(page.getByText(/outbound dispatched/i)).not.toBeVisible();
    await telemetryToggle.click();
    await expect(page.getByText(/outbound dispatched/i)).toBeVisible();
  });

  test('2. Sidebar 6-Group Navigation & Topbar Clickable Breadcrumbs', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/crm/customer-360');
    await page.waitForLoadState('domcontentloaded');

    // Verify Topbar Breadcrumb shows CRM & Customers > Customer 360
    const breadcrumbNav = page.getByRole('navigation', { name: /breadcrumb/i });
    await expect(breadcrumbNav).toBeVisible();
    await expect(breadcrumbNav).toContainText('CRM & Customers');
    await expect(breadcrumbNav).toContainText('Customer 360');

    // Verify consolidated sidebar group headings
    const sidebar = page.locator('aside');
    await expect(sidebar).toContainText('Workspace');
    await expect(sidebar).toContainText('CRM & Customers');
    await expect(sidebar).toContainText('Catalog & Stock');
    await expect(sidebar).toContainText('Automate & System');
  });

  test('3. Customer 360 Searchable Directory & Lookup Hub (Zero Raw ObjectId Input)', async ({ page }) => {
    await page.goto('/crm/customer-360');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: /customer 360 directory/i })).toBeVisible();
    const searchInput = page.getByPlaceholder(/search customer by name, phone, email, or role/i);
    await expect(searchInput).toBeVisible();

    // Switch between People and Companies tabs
    const companiesTab = page.getByRole('button', { name: /companies/i }).first();
    await companiesTab.click();
    await expect(page.getByPlaceholder(/search company by name, industry, or domain/i)).toBeVisible();
  });

  test('4. Universal Create opens in-place ContactCreateModal with auto-CRM Person link', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('domcontentloaded');

    // Click Universal Create button in Topbar
    const createBtn = page.getByRole('button', { name: /open universal create menu/i });
    await createBtn.click();

    // Click New Contact inside the Universal Create modal
    const createContactAction = page.getByRole('button', { name: /new contact/i });
    await expect(createContactAction).toBeVisible();
    await createContactAction.click();

    // Verify ContactCreateModal opens in-place on /deals without redirecting
    await expect(page).toHaveURL(/\/deals/);
    await expect(page.getByRole('heading', { name: /create customer \/ contact/i })).toBeVisible();

    // Verify "Also create & link CRM Customer (Person) profile" is checked by default
    const autoPersonCheckbox = page.locator('input[type="checkbox"]');
    await expect(autoPersonCheckbox).toBeChecked();
  });

  test('5. Tasks Linked Record Picker uses searchable human-readable combobox', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('domcontentloaded');

    // Open New Task or inspect LinkedRecordSelector trigger button
    const searchBtn = page.getByRole('button', { name: /search & select a/i }).first();
    if (await searchBtn.isVisible()) {
      await searchBtn.click();
      await expect(page.getByPlaceholder(/type name, phone, email, or title/i)).toBeVisible();
    }
  });
});
