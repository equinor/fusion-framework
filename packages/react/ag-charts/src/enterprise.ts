/**
 * Enterprise-tier entry point for `@equinor/fusion-framework-react-ag-charts`.
 *
 * Re-exports every symbol from `ag-charts-enterprise`, which includes advanced
 * chart modules such as `AgChartsEnterpriseModule` and enterprise-only chart
 * types (e.g. waterfall, heatmap, sunburst, treemap).
 *
 * Use this sub-path when your application requires enterprise charting
 * features. For community modules and types use `/community`, and for the
 * React `AgCharts` component use the main entry point (`/`).
 *
 * @remarks
 * Enterprise features require a valid AG Charts enterprise license.
 * When combining AG Charts enterprise with AG Grid integrated charting,
 * pass `AgChartsEnterpriseModule` to `IntegratedChartsModule.with()` from
 * `@equinor/fusion-framework-react-ag-grid/enterprise`.
 *
 * @example
 * ```ts
 * import { AgChartsEnterpriseModule } from '@equinor/fusion-framework-react-ag-charts/enterprise';
 * ```
 *
 * @module @equinor/fusion-framework-react-ag-charts/enterprise
 * @see {@link https://www.ag-grid.com/charts/ | AG Charts documentation}
 */
export * from 'ag-charts-enterprise';
