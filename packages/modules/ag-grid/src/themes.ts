import { type Part, type Theme, createPart, createTheme, themeAlpine } from 'ag-grid-community';

/**
 * Default Fusion theme for AG Grid.
 *
 * Based on the AG Grid `alpine` theme with Equinor brand overrides. Colours reference
 * EDS CSS custom properties from `@equinor/eds-tokens/css/variables`, so the grid
 * follows the active EDS colour scheme (`data-color-scheme`, or the OS/browser preference):
 * - Font family set to `Equinor, sans-serif`
 * - Accent, background, foreground and border colours mapped to EDS semantic colours
 * - Browser colour scheme (native scrollbars and inputs) inherited from the host page
 *
 * @remarks
 * The host (portal or app) must load `@equinor/eds-tokens/css/variables`; there are
 * no literal fallbacks, so the grid has no EDS colours without the stylesheet.
 *
 * Use {@link IAgGridConfigurator.setTheme | builder.setTheme()} to customise or
 * replace this theme during application configuration.
 */
export const fusionTheme: Theme = themeAlpine.withParams({
  fontFamily: 'Equinor, sans-serif',
  accentColor: 'var(--eds-color-bg-accent-fill-emphasis-default)',
  backgroundColor: 'var(--eds-color-bg-neutral-surface)',
  foregroundColor: 'var(--eds-color-text-neutral-strong)',
  borderColor: 'var(--eds-color-border-neutral-subtle)',
  // Alpine forces `light`, which would keep native controls light inside a dark page.
  browserColorScheme: 'inherit',
});

/**
 * Creates a new theme based on an existing theme.
 *
 * @remarks
 * Cloning a theme is necessary to create a local instance of the theme,
 * as AG Grid performs internal `instanceof` checks on the theme object and its parts.
 *
 * When consuming an incoming theme object, it is likely to be a different instance,
 * since AG Grid might have been created in a different context (e.g., portal implementation).
 *
 * @example
 * ```ts
 * // portal
 * enableAgGrid(configurator, async (builder) => {
 *  builder.withTheme(fusionTheme);
 * });
 *
 * // consumer
 * enableAgGrid(configurator, async (builder) => {
 *  // parent is a reference to the portal ag-grid module instance
 *  const theme = createThemeFromTheme(parent.getTheme());
 *  builder.withTheme(theme);
 * });
 * ```
 *
 * @param theme - The theme to clone
 * @returns A new theme with the same parts as the input theme
 */
// Deliberately co-located with the related `fusionTheme` default
// fusion-lint-disable-next-line single-export-per-file
export const createThemeFromTheme = (theme: Theme): Theme => {
  // biome-ignore lint/suspicious/noExplicitAny: fails to infer type of theme.parts
  const parts = (theme as Theme & { parts: Part<any>[] }).parts ?? [];

  // convert each part to a new part and add it to the new theme
  const newTheme = parts.reduce((acc, part) => {
    // convert part to a new part, to ensure it's a PartImpl
    return acc.withPart(createPart(part));
  }, createTheme());

  return newTheme;
};

/**
 * Re-exported `createTheme` factory from `ag-grid-community`.
 *
 * Useful for building a brand-new theme without extending an existing one.
 */
export { createTheme, type Theme };

export default { fusionTheme };
