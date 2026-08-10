import { expect, test } from '@playwright/test';
test('welcome explains the product and offers both open paths', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'RokuLab' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open Roku Project' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open bundled Hello World' })).toBeVisible();
});
