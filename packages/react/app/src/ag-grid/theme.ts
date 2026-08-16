/**
 * AG Grid theme sub-path entry-point.
 *
 * @remarks
 * Re-exports the Fusion AG Grid theme utilities from
 * `@equinor/fusion-framework-module-ag-grid/themes`, together with the
 * application-scoped {@link useTheme} hook.
 *
 * @packageDocumentation
 */
export {
  fusionTheme,
  createThemeFromTheme,
  createTheme,
} from '@equinor/fusion-framework-module-ag-grid/themes';
export type { Theme } from '@equinor/fusion-framework-module-ag-grid/themes';
export { useTheme } from './useTheme';
