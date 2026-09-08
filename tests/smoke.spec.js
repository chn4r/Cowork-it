const { test, expect } = require('@playwright/test');
let pageErrors=[];
test.beforeEach(async ({ page }) => {pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));await page.goto('/');});
test.afterEach(async()=>{expect(pageErrors,'Aucune erreur JavaScript non gérée').toEqual([])});

test('navigation principale', async ({ page }) => {
  for (const name of ['Explorer','Carte','Publier','Rencontres','Messages']) {
    await page.getByRole('button',{name,exact:false}).first().click();
    await expect(page.locator('.page.active')).toBeVisible();
  }
});

test('filtres, fiche lieu et favoris', async ({ page }) => {
  await page.getByRole('button',{name:/Disponible maintenant/i}).click();
  const firstPlace=page.locator('[data-place-card]').first();await expect(firstPlace).toBeVisible();
  await firstPlace.locator('[data-action="favorite"]').click();
  await firstPlace.locator('[data-action="open-place"]').click();
  await expect(page.locator('#modalBackdrop')).toHaveClass(/show/);
  await page.locator('[data-action="close-modal"]').click();
});

test('publication locale persistante', async ({ page }) => {
  await page.goto('/#publish');
  await page.locator('#pubTitle').fill('Lieu de test automatisé');
  await page.locator('#pubCity').fill('Rennes');
  await page.locator('#pubDesc').fill('Publication créée par le test Playwright.');
  await page.locator('#pubConfirm').check();
  await page.locator('#publishForm').getByRole('button',{name:/Publier/i}).click();
  await expect(page.locator('body')).toContainText('Lieu de test automatisé');
  await page.reload();await expect(page.locator('body')).toContainText('Lieu de test automatisé');
});

test('messagerie locale', async ({ page }) => {
  await page.goto('/#people');
  await page.locator('[data-action="contact-person"]').first().click();
  await page.locator('#chatInput').fill('Message de test automatisé');
  await page.locator('#chatForm').getByRole('button',{name:/Envoyer/i}).click();
  await expect(page.locator('#chatBody')).toContainText('Message de test automatisé');
});

test('paramètres réseau', async ({ page }) => {
  await page.locator('[data-action="open-settings"]').click();
  await expect(page.locator('#netMode')).toBeVisible();
  await page.selectOption('#netMode','local');
  await page.locator('[data-action="save-network"]').click();
  await expect(page.locator('#networkBadge')).toContainText(/Mode démo local/i);
});
