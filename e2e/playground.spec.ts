import { expect, test } from '@playwright/test';

const HSML_EDITOR = ':not(.editor-readonly) > .cm-editor .cm-content';
const HTML_OUTPUT = '.editor-readonly .cm-editor .cm-content';

async function expandSidebar(page: import('@playwright/test').Page) {
  const sidebar = page.locator('aside');
  const box = await sidebar.boundingBox();
  if (!box || box.width === 0) {
    await page.locator('header button').first().click();
    // Wait for sidebar animation to complete
    await expect(sidebar).not.toHaveCSS('width', '0px');
  }
}

test.describe('page load', () => {
  test('shows header with title and version', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header')).toContainText('HSML');
    await expect(page.locator('header')).toContainText(/\d+\.\d+\.\d+/);
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

    await expect(output).toContainText('<p class="hello"></p>');
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

    // Output should collapse to at most 2 lines (content + possible trailing empty line)
    const output = page.locator(HTML_OUTPUT);
    await expect.poll(() => output.locator('.cm-line').count()).toBeLessThanOrEqual(2);
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

    // Clear and type HSML with duplicate IDs on same element
    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type('h1#foo#bar');

    // Diagnostic markers should appear (auto-waits)
    const diagnostics = page.locator('.cm-lintRange-warning, .cm-lintRange-error');
    await expect(diagnostics.first()).toBeVisible();
  });

  test('hides diagnostics when toggle is off', async ({ page }) => {
    await page.goto('/');
    const editor = page.locator(HSML_EDITOR);

    // Type HSML with duplicate IDs on same element
    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type('h1#foo#bar');

    // Wait for diagnostics to appear first
    const diagnostics = page.locator('.cm-lintRange-warning, .cm-lintRange-error');
    await expect(diagnostics.first()).toBeVisible();

    // Expand sidebar and toggle diagnostics off
    await expandSidebar(page);
    const toggle = page.getByText('Show diagnostics').locator('..');
    await toggle.locator('button[role="switch"]').click();

    // Diagnostic markers should disappear
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
  test('has animated transition', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveCSS('transition', /width/);
  });

  test('has correct default state for viewport', async ({ page, viewport }) => {
    await page.goto('/');
    const sidebar = page.locator('aside');

    if (viewport && viewport.width >= 1024) {
      await expect(sidebar).not.toHaveCSS('width', '0px');
    } else {
      await expect(sidebar).toHaveCSS('width', '0px');
    }
  });

  test('toggles sidebar visibility', async ({ page, viewport }) => {
    await page.goto('/');
    const sidebar = page.locator('aside');
    const menuButton = page.locator('header button').first();
    const startsExpanded = !!viewport && viewport.width >= 1024;

    if (startsExpanded) {
      await expect(sidebar).not.toHaveCSS('width', '0px');
    } else {
      await expect(sidebar).toHaveCSS('width', '0px');
    }

    // First click: toggle from default state
    await menuButton.click();
    if (startsExpanded) {
      await expect(sidebar).toHaveCSS('width', '0px');
    } else {
      await expect(sidebar).not.toHaveCSS('width', '0px');
    }

    // Second click: toggle back
    await menuButton.click();
    if (startsExpanded) {
      await expect(sidebar).not.toHaveCSS('width', '0px');
    } else {
      await expect(sidebar).toHaveCSS('width', '0px');
    }
  });
});

test.describe('URL state sharing', () => {
  test('encodes source in URL hash', async ({ page }) => {
    await page.goto('/');
    const editor = page.locator(HSML_EDITOR);

    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type('div.hello');

    // Wait for URL hash to update (auto-wait via polling)
    await expect(page).toHaveURL(/#.+/);
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
