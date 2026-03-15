/**
 * Main entry point for `@equinor/fusion-framework-react-ag-charts`.
 *
 * Re-exports every symbol from `ag-charts-react`, including the {@link AgCharts}
 * React component used to render AG Charts inside Fusion Framework applications.
 *
 * Import this entry point when you need the React component or any React-level
 * AG Charts utility. For type-only imports such as `AgChartOptions`, use the
 * `/community` or `/enterprise` sub-path instead.
 *
 * @example
 * ```tsx
 * import { AgCharts } from '@equinor/fusion-framework-react-ag-charts';
 * ```
 *
 * @module @equinor/fusion-framework-react-ag-charts
 * @see {@link https://www.ag-grid.com/charts/ | AG Charts documentation}
 */
export * from 'ag-charts-react';
