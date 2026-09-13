import { Page } from '@playwright/test';

export interface TestSession {
  token: string;
  workspaceId: string;
}

export async function loginViaApi(
  email = 'admin@niwa.local',
  password = 'ChangeMe123!'
): Promise<TestSession> {
  const res = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API login failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  const token = data.accessToken || data.token;
  const workspaceId = data.activeWorkspaceId || data.activeMembership?.workspaceId || 'ws_prod_customer_01';

  return { token, workspaceId };
}

export async function setupAuthenticatedContext(
  page: Page,
  email = 'admin@niwa.local',
  password = 'ChangeMe123!'
): Promise<TestSession> {
  const session = await loginViaApi(email, password);

  await page.addInitScript(
    ({ token, workspaceId }) => {
      window.localStorage.setItem('niwa.accessToken', token);
      window.localStorage.setItem('activeWorkspaceId', workspaceId);
    },
    session
  );

  return session;
}

export async function loginViaUI(
  page: Page,
  email = 'admin@niwa.local',
  password = 'ChangeMe123!'
): Promise<void> {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');

  const emailInput = page.getByPlaceholder('name@company.com').or(page.getByLabel(/email/i)).or(page.locator('input[type="email"]'));
  const passwordInput = page.getByPlaceholder('••••••••').or(page.getByLabel(/password/i)).or(page.locator('input[type="password"]'));
  const submitButton = page.getByRole('button', { name: /sign in|login/i });

  await emailInput.fill(email);
  await passwordInput.fill(password);
  await submitButton.click();

  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
}

export async function ensureWorkspaceModules(
  token: string,
  workspaceId: string,
  modules: string[] = ['products', 'inventory']
): Promise<void> {
  for (const mod of modules) {
    await fetch(`http://localhost:4000/api/modules/${mod}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-workspace-id': workspaceId,
      },
      body: JSON.stringify({ status: 'ENABLED' }),
    });
  }
}
