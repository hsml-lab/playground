import { expect, test } from '@playwright/test';

const HSML_EDITOR = ':not(.editor-readonly) > .cm-editor .cm-content';
const HTML_OUTPUT = '.editor-readonly .cm-editor .cm-content';

async function expandSidebar(page: import('@playwright/test').Page) {
  const sidebar = page.locator('aside');
  const box = await sidebar.boundingBox();
  if (!box || box.width === 0) {
    await page.locator('header button').first().click();
    await page.waitForTimeout(300);
  }
}

test.describe('page load', () => {
  test('shows header with title and version', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header')).toContainText('HSML');
    await expect(page.locator('header')).toContainText('0.7.0');
  });

  test('loads default HSML content', async ({ page }) => {
    await page.goto('/');
    const editor = page.locator(HSML_EDITOR);
    await expect(editor).toContainText('doctype html');
    await expect(editor).toContainText('h1#greeting');
  });

  test('compiles default content to HTML', async ({ page }) => {
    await page.goto('/');
    const output = page.locator(HTML_OUTPUT);
    await expect(output).toContainText('<!DOCTYPE html>');
    await expect(output).toContainText('<h1');
  });
});

test.describe('live compilation', () => {
  test('updates HTML output when typing', async ({ page }) => {
    await page.goto('/');
    const editor = page.locator(HSML_EDITOR);
    const output = page.locator(HTML_OUTPUT);

    // Clear editor and type valid HSML
    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type('p.hello');

    await expect(output).toContainText('<p class="hello"></p>', { timeout: 3000 });
  });
});

test.describe('pretty print', () => {
  test('outputs indented HTML by default', async ({ page }) => {
    await page.goto('/');
    const output = page.locator(HTML_OUTPUT);
    // Pretty print adds newlines — multi-line output
    await expect(output.locator('.cm-line')).not.toHaveCount(1);
  });

  test('outputs single-line HTML when disabled', async ({ page }) => {
    await page.goto('/');
    await expandSidebar(page);

    // Toggle pretty print off
    const toggle = page.getByText('Pretty print').locator('..');
    await toggle.locator('button[role="switch"]').click();

    // Wait for recompilation
    await page.waitForTimeout(500);

    const output = page.locator(HTML_OUTPUT);
    const lineCount = await output.locator('.cm-line').count();
    expect(lineCount).toBeLessThanOrEqual(2);
  });
});

test.describe('formatter', () => {
  test('format button reformats editor content', async ({ page }) => {
    await page.goto('/');
    await expandSidebar(page);

    // Click format
    await page.getByRole('button', { name: 'Format' }).click();

    // Content should still be valid HSML (compilation still works)
    const output = page.locator(HTML_OUTPUT);
    await expect(output).toContainText('<!DOCTYPE html>');

    // Editor should still contain the same elements
    const editor = page.locator(HSML_EDITOR);
    await expect(editor).toContainText('doctype html');
  });
});

test.describe('diagnostics', () => {
  test('shows diagnostic for duplicate IDs', async ({ page }) => {
    await page.goto('/');
    const editor = page.locator(HSML_EDITOR);

    // Clear and type HSML with duplicate IDs
    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type('h1#foo#bar');

    // Wait for compilation + lint
    await page.waitForTimeout(1000);

    // Diagnostic markers should appear
    const diagnostics = page.locator('.cm-lintRange-warning, .cm-lintRange-error');
    await expect(diagnostics.first()).toBeVisible({ timeout: 3000 });
  });

  test('hides diagnostics when toggle is off', async ({ page }) => {
    await page.goto('/');
    const editor = page.locator(HSML_EDITOR);

    // Type HSML with duplicate IDs
    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type('h1#foo#bar');
    await page.waitForTimeout(1000);

    // Expand sidebar and toggle diagnostics off
    await expandSidebar(page);
    const toggle = page.getByText('Show diagnostics').locator('..');
    await toggle.locator('button[role="switch"]').click();
    await page.waitForTimeout(500);

    // Diagnostic markers should be gone
    const diagnostics = page.locator('.cm-lintRange-warning, .cm-lintRange-error');
    await expect(diagnostics).toHaveCount(0);
  });
});

test.describe('theme toggle', () => {
  test('toggles dark class on html element', async ({ page }) => {
    await page.goto('/');

    // Default is dark
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Theme toggle is the second button in header (first is hamburger)
    const themeButton = page.locator('header button').nth(1);
    await themeButton.click();

    // Should switch to light
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    // Click again to go back to dark
    await themeButton.click();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});

test.describe('sidebar', () => {
  test('toggles sidebar visibility', async ({ page, viewport }) => {
    if (!viewport || viewport.width < 1024) test.skip();

    await page.goto('/');
    const sidebar = page.locator('aside');
    const menuButton = page.locator('header button').first();

    // Sidebar should be expanded on desktop
    const boxBefore = await sidebar.boundingBox();
    expect(boxBefore!.width).toBeGreaterThan(0);

    // Click hamburger to collapse
    await menuButton.click();
    await page.waitForTimeout(300);

    const boxAfter = await sidebar.boundingBox();
    expect(boxAfter?.width).toBe(0);

    // Click again to expand
    await menuButton.click();
    await page.waitForTimeout(300);

    const boxFinal = await sidebar.boundingBox();
    expect(boxFinal!.width).toBeGreaterThan(0);
  });
});

test.describe('responsive layout', () => {
  test('sidebar expanded by default on desktop', async ({ page, viewport }) => {
    if (!viewport || viewport.width < 1024) test.skip();

    await page.goto('/');
    const sidebar = page.locator('aside');
    const box = await sidebar.boundingBox();
    expect(box!.width).toBeGreaterThan(0);
  });

  test('sidebar collapsed by default on tablet', async ({ page, viewport }) => {
    if (!viewport || viewport.width >= 1024) test.skip();

    await page.goto('/');
    await page.waitForTimeout(300);
    const sidebar = page.locator('aside');
    const box = await sidebar.boundingBox();
    expect(box?.width).toBe(0);
  });

  test('sidebar collapsed by default on mobile', async ({ page, viewport }) => {
    if (!viewport || viewport.width >= 1024) test.skip();

    await page.goto('/');
    await page.waitForTimeout(300);
    const sidebar = page.locator('aside');
    const box = await sidebar.boundingBox();
    expect(box?.width).toBe(0);
  });
});

test.describe('URL state sharing', () => {
  test('encodes source in URL hash', async ({ page }) => {
    await page.goto('/');
    const editor = page.locator(HSML_EDITOR);

    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type('div.hello');

    // Wait for debounced hash update
    await page.waitForTimeout(500);

    const url = page.url();
    expect(url).toContain('#');
  });

  test('restores content from URL hash', async ({ page }) => {
    // Encode "p.hello" as base64
    const source = 'p.hello';
    const encoded = Buffer.from(encodeURIComponent(source)).toString('base64');

    await page.goto(`/#${encoded}`);
    const editor = page.locator(HSML_EDITOR);
    await expect(editor).toContainText('p.hello');
  });
});
