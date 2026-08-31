import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DealsPage } from '../pages/deals.page';

type AppFixtures = {
  loginPage: LoginPage;
  dealsPage: DealsPage;
};

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },
  dealsPage: async ({ page }, use) => {
    const dealsPage = new DealsPage(page);
    await use(dealsPage);
  }
});

export { expect } from '@playwright/test';
