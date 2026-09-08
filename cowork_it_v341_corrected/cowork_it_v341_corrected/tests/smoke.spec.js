const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('navigation principale', async ({ page }) => {
  for (const name of ['Explorer','Carte','Publier','Rencontres','Messages']) {
    const nav = page.getByRole('button', { name, exact: false }).first();
    await nav.click();
    await expect(page.locator('.page.active')).toBeVisible();
  }
});

test('fiche lieu et favoris', async ({ page }) => {
  await page.goto('/#explore');
  const firstPlace = page.locator('[data-place-card]').first();
  await expect(firstPlace).toBeVisible();
  await firstPlace.locator('[data-action="favorite"]').click();
  await firstPlace.locator('[data-action="open-place"]').click();
  await expect(page.locator('#modalBackdrop')).toHaveClass(/show/);
  await page.locator('[data-action="close-modal"]').click();
});

test('publication locale', async ({ page }) => {
  await page.goto('/#publish');
  await page.locator('#pubTitle').fill('Lieu de test automatisé');
  await page.locator('#pubCity').fill('Rennes');
  await page.locator('#pubDesc').fill('Publication créée par le test Playwright.');
  await page.locator('#pubConfirm').check();
  await page.locator('#publishForm').getByRole('button', { name: /Publier/i }).click();
  await expect(page.locator('body')).toContainText('Lieu de test automatisé');
});

test('message', async ({ page }) => {
  await page.goto('/#people');
  const firstContact = page.locator('[data-action="contact-person"]').first();
  await firstContact.click();
  await page.locator('#chatInput').fill('Message de test automatisé');
  await page.locator('#chatForm').getByRole('button', { name: /Envoyer/i }).click();
  await expect(page.locator('#chatBody')).toContainText('Message de test automatisé');
});
