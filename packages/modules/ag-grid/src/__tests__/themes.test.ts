import { describe, expect, it } from 'vitest';

import { createThemeFromTheme, fusionTheme } from '../themes.js';

/** Generated CSS for a theme; `_getParamsCss` is AG Grid's internal param serialiser. */
const getParamsCss = (theme: unknown): string =>
  (theme as { _getParamsCss: () => string })._getParamsCss();

describe('fusionTheme', () => {
  it('maps colours to EDS CSS custom properties so the grid follows the colour scheme', () => {
    const css = getParamsCss(fusionTheme);

    expect(css).toContain('var(--eds-color-bg-accent-fill-emphasis-default)');
    expect(css).toContain('var(--eds-color-bg-neutral-surface)');
    expect(css).toContain('var(--eds-color-text-neutral-strong)');
    expect(css).toContain('var(--eds-color-border-neutral-subtle)');
  });

  it('inherits the browser colour scheme instead of forcing light', () => {
    const css = getParamsCss(fusionTheme);

    expect(css).toMatch(/--ag-browser-color-scheme: var\([^,]+, inherit\)/);
    expect(css).not.toMatch(/--ag-browser-color-scheme: var\([^,]+, light\)/);
  });

  it('keeps the EDS colour params when cloned for a child scope', () => {
    const css = getParamsCss(createThemeFromTheme(fusionTheme));

    expect(css).toContain('var(--eds-color-bg-accent-fill-emphasis-default)');
    expect(css).toMatch(/--ag-browser-color-scheme: var\([^,]+, inherit\)/);
  });
});
