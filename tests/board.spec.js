// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Board of Trustees Page', () => {
  test('should load the board page successfully', async ({ page }) => {
    await page.goto('/about/board.html');
    await expect(page).toHaveTitle(/Board of Trustees/);
  });

  test('should display all board member images', async ({ page }) => {
    await page.goto('/about/board.html');

    // Get all board member images
    const images = page.locator('.board-member-photo img');

    // Should have 15 board members
    await expect(images).toHaveCount(15);

    // Check that all images are loaded
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const image = images.nth(i);
      // Wait for image to be visible
      await expect(image).toBeVisible();
      // Check that image has loaded (has natural dimensions)
      const hasNaturalDimensions = await image.evaluate((img) => {
        return img.naturalWidth > 0 && img.naturalHeight > 0;
      });
      expect(hasNaturalDimensions).toBeTruthy();
    }
  });

  test('should display executive board section', async ({ page }) => {
    await page.goto('/about/board.html');

    // Check for executive board section
    const executiveSection = page.locator('.board-section').first();
    await expect(executiveSection.locator('h3')).toHaveText('Executive Board');

    // Should have 4 executive board members
    const executiveMembers = executiveSection.locator('.board-member');
    await expect(executiveMembers).toHaveCount(4);
  });

  test('should display all board member names', async ({ page }) => {
    await page.goto('/about/board.html');

    const expectedMembers = [
      'Steve Tillack',
      'Peter Coy',
      'Aarti Budhiraja',
      'Amrita Kumar',
      'Steve Chen',
      'Jeff Shaari',
      'Theodore Alevrontas',
      'Patricia Chen',
      'Dave Emerson',
      'Ray Slaman',
      'Krishna Kumar',
      'Stacey Braff',
      'Chris Jones',
      'Andrew Zimmerman',
      'Heidi Heintz'
    ];

    for (const name of expectedMembers) {
      await expect(page.locator('.board-member-info h4', { hasText: name })).toBeVisible();
    }
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/about/board.html');

    // Check that navigation links exist
    await expect(page.locator('nav a[href="/"]')).toBeVisible();
    await expect(page.locator('nav a[href="/about/"]')).toBeVisible();
    await expect(page.locator('nav a[href="/contact/"]')).toBeVisible();
  });

  test('should display CTA section', async ({ page }) => {
    await page.goto('/about/board.html');

    // Check for CTA section
    const ctaSection = page.locator('.cta-section');
    await expect(ctaSection.locator('h2')).toHaveText('Join Our Mission');
    await expect(ctaSection.locator('a.btn-primary')).toHaveText('Contact Us');
    await expect(ctaSection.locator('a.btn-secondary')).toHaveText('Volunteer');
  });
});
