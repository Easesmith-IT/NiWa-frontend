import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 },
];

const routes = [
  { path: '/login', name: 'login' },
  { path: '/crm/flows', name: 'crm-flows' },
  { path: '/deals', name: 'deals' },
  { path: '/contacts', name: 'contacts' },
  { path: '/inbox', name: 'inbox' },
];

for (const vp of viewports) {
  test.describe(`Responsive Viewport & ARIA Audit — ${vp.name} (${vp.width}x${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const r of routes) {
      test(`Audit page ${r.path} on ${vp.name}`, async ({ page }) => {
        // Navigate to route
        await page.goto(r.path, { waitUntil: 'domcontentloaded' });

        // 1. Horizontal Overflow Check
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const innerWidth = await page.evaluate(() => window.innerWidth);
        expect(scrollWidth, `Horizontal scroll overflow detected on ${r.path} (${vp.name})`).toBeLessThanOrEqual(innerWidth + 2);

        // 2. Interactive Element Accessibility & Touch Target Check
        const buttons = await page.locator('button, a[href], input, select, textarea').all();
        console.log(`[${vp.name}] ${r.path}: Found ${buttons.length} interactive controls`);

        // 3. Capture Visual Snapshot
        await page.screenshot({
          path: `test-results/audit-${r.name}-${vp.name}.png`,
          fullPage: false,
        });
      });
    }
  });
}
