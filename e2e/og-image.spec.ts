import { expect, test } from '@playwright/test';

test('og-image is not stale', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.goto('./');
  // If this fails, regenerate public/og-image.png and update snapshot:
  // pnpm test:e2e --update-snapshots
  await expect(page).toHaveScreenshot('og-image.png', {
    maxDiffPixelRatio: 0.02,
  });
});
