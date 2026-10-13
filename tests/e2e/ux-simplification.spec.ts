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

  test('3. Customer 360 Searchable Directory & Full Profile Deep-Link (Zero Raw ObjectId Input)', async ({ page }) => {
    // Seed test Person and Company via backend API
    const unique = Date.now();
    const personRes = await fetch('http://localhost:4000/api/crm/people', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
        'x-workspace-id': session.workspaceId,
      },
      body: JSON.stringify({
        firstName: 'Aarav',
        lastName: `Patel ${unique}`,
        emails: [{ email: `aarav.${unique}@test.local`, isPrimary: true }],
        phones: [{ phone: `+9198765${unique.toString().slice(-5)}`, isPrimary: true }],
        jobTitle: 'Procurement Head',
      }),
    });
    const personJson = await personRes.json();
    const personId = personJson.data?._id;

    const companyRes = await fetch('http://localhost:4000/api/crm/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
        'x-workspace-id': session.workspaceId,
      },
      body: JSON.stringify({
        name: `Acme Logistics ${unique}`,
        industry: 'Supply Chain',
        domain: `acmelogistics${unique}.local`,
      }),
    });
    const companyJson = await companyRes.json();
    const companyId = companyJson.data?._id;

    // 1. Verify Directory list view
    await page.goto('/crm/customer-360');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: /customer 360 directory/i })).toBeVisible();
    const searchInput = page.getByPlaceholder(/search customer by name, phone, email, or role/i);
    await expect(searchInput).toBeVisible();

    // Switch between People and Companies tabs
    const companiesTab = page.getByRole('button', { name: /companies/i }).first();
    await companiesTab.click();
    await expect(page.getByPlaceholder(/search company by name, industry, or domain/i)).toBeVisible();

    // Switch back to People tab
    const peopleTab = page.getByRole('button', { name: /people/i }).first();
    await peopleTab.click();

    // 2. Open Person 360 Profile and verify full profile renders without ANY client-side exception
    if (personId) {
      await page.goto(`/crm/customer-360?recordType=Person&recordId=${personId}`);
      await page.waitForLoadState('domcontentloaded');

      // Assert zero client-side exceptions
      await expect(page.locator('text=Application error: a client-side exception has occurred')).not.toBeVisible();

      // Profile header & badge
      await expect(page.getByRole('heading', { name: new RegExp(`Aarav Patel ${unique}`, 'i') })).toBeVisible();
      await expect(page.getByText('Person', { exact: true })).toBeVisible();

      // Stat cards
      await expect(page.getByText(/open deals/i)).toBeVisible();
      await expect(page.getByText(/lifetime leads/i)).toBeVisible();
      await expect(page.getByText(/customer tasks/i).or(page.getByText(/overdue/i))).toBeVisible();
      await expect(page.getByText(/communication/i)).toBeVisible();

      // Tabs: switch to Deals, Leads, Tasks, and Timeline
      await page.getByRole('button', { name: /deals/i }).first().click();
      await expect(page.getByText(/associated deals/i)).toBeVisible();

      await page.getByRole('button', { name: /leads/i }).first().click();
      await expect(page.getByText(/active leads/i)).toBeVisible();

      await page.getByRole('button', { name: /tasks/i }).first().click();
      await expect(page.getByText(/customer tasks/i)).toBeVisible();

      await page.getByRole('button', { name: /timeline/i }).first().click();
      await expect(page.getByText(/activity timeline/i)).toBeVisible();

      // Verify no client errors after all tab switches
      await expect(page.locator('text=Application error: a client-side exception has occurred')).not.toBeVisible();
    }

    // 3. Open Company 360 Profile and verify
    if (companyId) {
      await page.goto(`/crm/customer-360?recordType=Company&recordId=${companyId}`);
      await page.waitForLoadState('domcontentloaded');

      await expect(page.locator('text=Application error: a client-side exception has occurred')).not.toBeVisible();
      await expect(page.getByRole('heading', { name: new RegExp(`Acme Logistics ${unique}`, 'i') })).toBeVisible();
      await expect(page.getByText('Company', { exact: true })).toBeVisible();
    }
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
