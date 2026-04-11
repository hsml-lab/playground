import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import LZString from 'lz-string';

const EDITABLE_EDITOR = ':not(.editor-readonly) > .cm-editor .cm-content';
const READONLY_OUTPUT = '.editor-readonly .cm-editor .cm-content';

function sidebarToggle(page: Page) {
  return page.getByRole('button', { name: /sidebar/i });
}

function themeToggle(page: Page) {
  return page.getByRole('button', { name: /light mode|dark mode/i });
}

async function expandSidebar(page: Page) {
  const sidebar = page.locator('aside');
  const box = await sidebar.boundingBox();
  if (!box || box.width === 0) {
    await sidebarToggle(page).click();
    await expect(sidebar).not.toHaveCSS('width', '0px');
  }
}

test.describe('SEO meta tags', () => {
  test('has correct title', async ({ page }) => {
    await page.goto('./');
    await expect(page).toHaveTitle('HSML Playground');
  });

  test('has meta description', async ({ page }) => {
    await page.goto('./');
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /HSML.*HTML.*real-time/);
  });

  test('has Open Graph tags', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      'HSML Playground',
    );
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
      'content',
      /HSML/,
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', /playground/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /og-image\.png/,
    );
  });

  test('has Twitter card tags', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    );
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
      'content',
      'HSML Playground',
    );
  });

  test('has theme-color', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', /.+/);
  });

  test('has favicon', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', /favicon\.svg/);
  });
});

test.describe('page load', () => {
  test('shows header with title and version', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('header')).toContainText('HSML');
    await expect(page.locator('header')).toContainText(/\d+\.\d+\.\d+/);
  });

  test('loads default HSML content', async ({ page }) => {
    await page.goto('./');
    const editor = page.locator(EDITABLE_EDITOR);
    await expect(editor).toContainText('doctype html');
    await expect(editor).toContainText('h1#greeting');
  });

  test('compiles default content to HTML', async ({ page }) => {
    await page.goto('./');
    const output = page.locator(READONLY_OUTPUT);
    await expect(output).toContainText('<!DOCTYPE html>');
    await expect(output).toContainText('<h1');
  });
});

test.describe('live compilation', () => {
  test('updates HTML output when typing', async ({ page }) => {
    await page.goto('./');
    const editor = page.locator(EDITABLE_EDITOR);
    const output = page.locator(READONLY_OUTPUT);

    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type('p.hello');

    await expect(output).toContainText('<p class="hello"></p>');
  });
});

test.describe('pretty print', () => {
  test('outputs indented HTML by default', async ({ page }) => {
    await page.goto('./');
    const output = page.locator(READONLY_OUTPUT);
    await expect(output.locator('.cm-line')).not.toHaveCount(1);
  });

  test('outputs single-line HTML when disabled', async ({ page }) => {
    await page.goto('./');
    await expandSidebar(page);

    const toggle = page.getByText('Pretty print').locator('..');
    await toggle.locator('button[role="switch"]').click();

    const output = page.locator(READONLY_OUTPUT);
    await expect.poll(() => output.locator('.cm-line').count()).toBeLessThanOrEqual(2);
  });
});

test.describe('formatter', () => {
  test('format button reformats editor content', async ({ page }) => {
    await page.goto('./');
    await expandSidebar(page);

    await page.getByRole('button', { name: 'Format' }).click();

    const output = page.locator(READONLY_OUTPUT);
    await expect(output).toContainText('<!DOCTYPE html>');

    const editor = page.locator(EDITABLE_EDITOR);
    await expect(editor).toContainText('doctype html');
  });
});

test.describe('indentation', () => {
  test('Tab inserts two spaces', async ({ page }) => {
    await page.goto('./');
    const editor = page.locator(EDITABLE_EDITOR);

    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type('div');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.keyboard.type('span');

    await expect(editor).toContainText('  span');
  });

  test('Shift+Tab removes two spaces', async ({ page }) => {
    await page.goto('./');
    const editor = page.locator(EDITABLE_EDITOR);

    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type('div');
    await page.keyboard.press('Enter');
    await page.keyboard.type('    span');
    await page.keyboard.press('Home');
    await page.keyboard.press('Shift+Tab');

    await expect(editor).toContainText('  span');
  });
});

test.describe('diagnostics', () => {
  test('shows diagnostic for duplicate IDs', async ({ page }) => {
    await page.goto('./');
    const editor = page.locator(EDITABLE_EDITOR);

    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type('h1#foo#bar');

    const diagnostics = page.locator('.cm-lintRange-warning, .cm-lintRange-error');
    await expect(diagnostics.first()).toBeVisible();
  });

  test('hides diagnostics when toggle is off', async ({ page }) => {
    await page.goto('./');
    const editor = page.locator(EDITABLE_EDITOR);

    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type('h1#foo#bar');

    const diagnostics = page.locator('.cm-lintRange-warning, .cm-lintRange-error');
    await expect(diagnostics.first()).toBeVisible();

    await expandSidebar(page);
    const toggle = page.getByText('Show diagnostics').locator('..');
    await toggle.locator('button[role="switch"]').click();

    await expect(diagnostics).toHaveCount(0);
  });
});

test.describe('share button', () => {
  test('copies URL to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('./');

    await page.getByRole('button', { name: 'Share URL' }).click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('playground');
  });

  test('shows toast notification', async ({ page }) => {
    await page.goto('./');

    await page.getByRole('button', { name: 'Share URL' }).click();

    const toast = page.locator('[data-state="open"]', { hasText: 'URL copied to clipboard' });
    await expect(toast).toBeVisible();
  });

  test('toast disappears after timeout', async ({ page }) => {
    await page.goto('./');

    await page.getByRole('button', { name: 'Share URL' }).click();

    const toast = page.locator('[data-state="open"]', { hasText: 'URL copied to clipboard' });
    await expect(toast).toBeVisible();
    await expect(toast).not.toBeVisible({ timeout: 5000 });
  });
});

test.describe('theme toggle', () => {
  test('toggles dark class on html element', async ({ page }) => {
    await page.goto('./');

    await expect(page.locator('html')).toHaveClass(/dark/);

    await themeToggle(page).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    await themeToggle(page).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});

test.describe('sidebar', () => {
  test('has animated transition', async ({ page }) => {
    await page.goto('./');
    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveCSS('transition', /width/);
  });

  test('has correct default state for viewport', async ({ page, viewport }) => {
    await page.goto('./');
    const sidebar = page.locator('aside');

    if (viewport && viewport.width >= 1024) {
      await expect(sidebar).not.toHaveCSS('width', '0px');
    } else {
      await expect(sidebar).toHaveCSS('width', '0px');
    }
  });

  test('toggles sidebar visibility', async ({ page, viewport }) => {
    await page.goto('./');
    const sidebar = page.locator('aside');
    const startsExpanded = !!viewport && viewport.width >= 1024;

    if (startsExpanded) {
      await expect(sidebar).not.toHaveCSS('width', '0px');
    } else {
      await expect(sidebar).toHaveCSS('width', '0px');
    }

    await sidebarToggle(page).click();
    if (startsExpanded) {
      await expect(sidebar).toHaveCSS('width', '0px');
    } else {
      await expect(sidebar).not.toHaveCSS('width', '0px');
    }

    await sidebarToggle(page).click();
    if (startsExpanded) {
      await expect(sidebar).not.toHaveCSS('width', '0px');
    } else {
      await expect(sidebar).toHaveCSS('width', '0px');
    }
  });
});

test.describe('URL state sharing', () => {
  test('encodes source in URL hash', async ({ page }) => {
    await page.goto('./');
    const initialUrl = page.url();
    const editor = page.locator(EDITABLE_EDITOR);

    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type('div.hello');

    await expect(page).toHaveURL(/#.+/);
    await expect.poll(() => page.url()).not.toBe(initialUrl);
  });

  test('restores content from URL hash', async ({ page }) => {
    const source = 'p.hello';
    const encoded = 'c:' + LZString.compressToEncodedURIComponent(source);

    await page.goto(`./#${encoded}`);
    const editor = page.locator(EDITABLE_EDITOR);
    await expect(editor).toContainText('p.hello');
  });
});

test.describe('copy button', () => {
  test('copies output to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('./');

    const output = page.locator(READONLY_OUTPUT);
    await expect(output).toContainText('<!DOCTYPE html>');

    // Hover the output panel to reveal copy button, then click
    const outputPanel = page.locator('.editor-readonly').locator('..');
    await outputPanel.hover();
    await outputPanel.getByRole('button', { name: 'Copy to clipboard' }).click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('<!DOCTYPE html>');
  });

  test('copies input to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('./');

    const editor = page.locator(EDITABLE_EDITOR);
    await expect(editor).toContainText('doctype html');

    // Hover the input panel to reveal copy button, then click
    const inputPanel = page.locator('.group').filter({ has: page.locator(EDITABLE_EDITOR) });
    await inputPanel.hover();
    await inputPanel.getByRole('button', { name: 'Copy to clipboard' }).click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('doctype html');
  });

  test('shows check icon after copy', async ({ page }) => {
    await page.goto('./');

    const outputPanel = page.locator('.editor-readonly').locator('..');
    await outputPanel.hover();
    await outputPanel.getByRole('button', { name: 'Copy to clipboard' }).click();

    await expect(page.locator('.icon-\\[lucide--check\\]').first()).toBeVisible();
  });
});

test.describe('editor labels', () => {
  test('shows HSML and HTML labels in compile mode', async ({ page }) => {
    await page.goto('./');
    const labels = page.locator('button', { hasText: /^(HSML|HTML)$/ });
    await expect(labels).toHaveCount(2);
    await expect(labels.first()).toContainText('HSML');
    await expect(labels.last()).toContainText('HTML');
  });

  test('clicking label toggles conversion mode', async ({ page }) => {
    await page.goto('./');

    // Click the HTML label to switch to convert mode
    const htmlLabel = page.locator('button', { hasText: /^HTML$/ }).first();
    await htmlLabel.click();

    // Labels should swap — input is now HTML, output is HSML
    const labels = page.locator('button', { hasText: /^(HSML|HTML)$/ });
    await expect(labels.first()).toContainText('HTML');
    await expect(labels.last()).toContainText('HSML');
  });

  test('clicking label works with sidebar closed', async ({ page }) => {
    await page.goto('./');

    // Close sidebar if open
    const sidebar = page.locator('aside');
    const box = await sidebar.boundingBox();
    if (box && box.width > 0) {
      await sidebarToggle(page).click();
      await expect(sidebar).toHaveCSS('width', '0px');
    }

    // Click label to switch mode — no sidebar needed
    const label = page.locator('button', { hasText: /^HTML$/ }).first();
    await label.click();

    // Should be in convert mode
    await expect(page).toHaveURL(/h:/);
  });
});

test.describe('convert mode (HTML → HSML)', () => {
  async function switchToConvertMode(page: Page) {
    await expandSidebar(page);
    await page.getByRole('button', { name: 'HTML → HSML' }).click();
  }

  test('switches to convert mode', async ({ page }) => {
    await page.goto('./');
    await switchToConvertMode(page);

    // HTML editor should be visible with default content
    const htmlEditor = page.locator(EDITABLE_EDITOR);
    await expect(htmlEditor).toContainText('<!DOCTYPE html>');
  });

  test('converts HTML to HSML', async ({ page }) => {
    await page.goto('./');
    await switchToConvertMode(page);

    const htmlEditor = page.locator(EDITABLE_EDITOR);
    const hsmlOutput = page.locator(READONLY_OUTPUT);

    await htmlEditor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type('<div class="hello"><p>World</p></div>');

    await expect(hsmlOutput).toContainText('.hello');
    await expect(hsmlOutput).toContainText('p');
  });

  test('hides compile options in convert mode', async ({ page }) => {
    await page.goto('./');
    await switchToConvertMode(page);

    await expect(page.getByText('Formatter')).not.toBeVisible();
    await expect(page.getByText('Pretty print')).not.toBeVisible();
    await expect(page.getByText('Show diagnostics')).not.toBeVisible();
  });

  test('preserves mode in URL hash', async ({ page }) => {
    await page.goto('./');
    await switchToConvertMode(page);

    // URL should contain h: prefix
    await expect(page).toHaveURL(/h:/);
  });

  test('restores convert mode from URL hash', async ({ page }) => {
    const source = '<p>Hello</p>';
    const encoded = 'h:' + LZString.compressToEncodedURIComponent(source);

    await page.goto(`./#${encoded}`);

    // Should be in convert mode with the HTML content
    const htmlEditor = page.locator(EDITABLE_EDITOR);
    await expect(htmlEditor).toContainText('<p>Hello</p>');

    // HSML output should show conversion result
    const hsmlOutput = page.locator(READONLY_OUTPUT);
    await expect(hsmlOutput).toContainText('p');
  });

  test('switches back to compile mode', async ({ page }) => {
    await page.goto('./');
    await switchToConvertMode(page);
    await page.getByRole('button', { name: 'HSML → HTML' }).click();

    // Should show HSML editor with default content
    const editor = page.locator(EDITABLE_EDITOR);
    await expect(editor).toContainText('doctype html');
  });
});
