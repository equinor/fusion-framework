/**
 * Community-tier entry point for `@equinor/fusion-framework-react-ag-charts`.
 *
 * Re-exports every symbol from `ag-charts-community`, which includes type
 * definitions (e.g. `AgChartOptions`, `AgChartTheme`), community feature
 * modules (e.g. `AllCommunityModule`), and the `ModuleRegistry` used to
 * register chart modules at application startup.
 *
 * Import from this sub-path when you need chart option types, community
 * modules, or the module registry. Use the main entry point (`/`) for the
 * React `AgCharts` component and `/enterprise` for enterprise-only modules.
 *
 * @example
 * ```ts
 * import {
 *   AllCommunityModule,
 *   ModuleRegistry,
 * } from '@equinor/fusion-framework-react-ag-charts/community';
 *
 * // Register all community chart features once at app startup
 * ModuleRegistry.registerModules([AllCommunityModule]);
 * ```
 *
 * @module @equinor/fusion-framework-react-ag-charts/community
 * @see {@link https://www.ag-grid.com/charts/ | AG Charts documentation}
 */
export * from 'ag-charts-community';
