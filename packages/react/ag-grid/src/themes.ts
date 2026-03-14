/**
 * Theme utilities for AG Grid in Fusion Framework.
 *
 * This entry point re-exports the Fusion-specific AG Grid theme helpers from
 * `@equinor/fusion-framework-module-ag-grid/themes`. Use it when you need
 * direct access to theme creation or cloning without going through the main
 * package entry point.
 *
 * @module themes
 */

/**
 * Pre-built Fusion theme for AG Grid based on the Equinor Design System.
 *
 * Applies Equinor fonts and EDS accent colors on the Alpine base theme.
 */
export { fusionTheme } from '@equinor/fusion-framework-module-ag-grid/themes';

/**
 * Creates a new AG Grid theme by cloning an existing theme instance.
 *
 * Cloning is necessary because AG Grid performs internal `instanceof` checks
 * on theme objects. When a theme crosses module boundaries (for example from
 * a portal host to an embedded application), cloning ensures parts are
 * re-instantiated in the local AG Grid context.
 *
 * @param theme - The source theme to clone.
 * @returns A new `Theme` containing the same parts as the input.
 */
export { createThemeFromTheme } from '@equinor/fusion-framework-module-ag-grid/themes';

/**
 * Creates a new empty AG Grid theme.
 *
 * @returns A blank `Theme` ready for `.withParams()` or `.withPart()` calls.
 */
export { createTheme } from '@equinor/fusion-framework-module-ag-grid/themes';

/** AG Grid theme type used across the Fusion AG Grid integration. */
export type { Theme } from '@equinor/fusion-framework-module-ag-grid/themes';
