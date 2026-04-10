import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

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
    const encoded = Buffer.from(encodeURIComponent(source)).toString('base64');

    await page.goto(`./#${encoded}`);
    const editor = page.locator(EDITABLE_EDITOR);
    await expect(editor).toContainText('p.hello');
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
    const encoded = 'h:' + Buffer.from(encodeURIComponent(source)).toString('base64');

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
