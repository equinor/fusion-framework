import { type Part, type Theme, themeAlpine, createTheme, createPart } from 'ag-grid-community';

/**
 * The Fusion theme for AG Grid.
 */
export const fusionTheme: Theme = themeAlpine.withParams({
  fontFamily: 'Equinor, sans-serif',
});

/**
 * Creates a new theme based on an existing theme.
 *
 * @note
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

export { createTheme, type Theme };

export default { fusionTheme };
