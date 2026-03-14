/**
 * React wrapper component for rendering AG Grid data grids.
 *
 * Use `AgGridReact` inside any Fusion Framework React application to display
 * tabular data with sorting, filtering, grouping, and editing capabilities.
 *
 * @see {@link https://www.ag-grid.com/react-data-grid/ | AG Grid React documentation}
 */
export { AgGridReact } from 'ag-grid-react';

/** Props accepted by the {@link AgGridReact} component. */
export type { AgGridReactProps } from 'ag-grid-react';

/**
 * Enables the AG Grid module on a Fusion Framework module configurator.
 *
 * Call `enableAgGrid` during application configuration to register the AG Grid
 * module, which provides license management, default theme, and module
 * registration for every grid instance in the application.
 *
 * @param configurator - The Fusion Framework module configurator to extend.
 * @param callback - Optional builder callback for customizing theme, license key, or registered AG Grid modules.
 *
 * @example
 * ```ts
 * import { enableAgGrid } from '@equinor/fusion-framework-react-ag-grid';
 *
 * export const configure = (configurator) => {
 *   enableAgGrid(configurator);
 * };
 * ```
 */
export { enableAgGrid } from '@equinor/fusion-framework-module-ag-grid';

/**
 * Read-only interface for the initialized AG Grid module provider.
 *
 * Exposes the resolved `licenseKey` and `theme` used by all grid instances.
 */
export type { IAgGridProvider } from '@equinor/fusion-framework-module-ag-grid';

/**
 * Pre-built Fusion theme for AG Grid based on the Equinor Design System.
 *
 * Applies the Equinor font family and EDS accent colors on top of the AG Grid
 * Alpine base theme. Use `fusionTheme` as a starting point and call
 * `.withParams()` to customize further.
 */
export { fusionTheme } from '@equinor/fusion-framework-module-ag-grid/themes';

/**
 * Creates a new empty AG Grid {@link Theme} instance.
 *
 * Useful when building a theme from scratch rather than extending
 * {@link fusionTheme} or another existing theme.
 *
 * @returns A blank AG Grid `Theme` ready for `.withParams()` or `.withPart()` calls.
 */
export { createTheme } from '@equinor/fusion-framework-module-ag-grid/themes';

/** AG Grid theme type used throughout the Fusion AG Grid integration. */
export type { Theme } from '@equinor/fusion-framework-module-ag-grid/themes';
