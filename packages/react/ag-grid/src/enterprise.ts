/**
 * Re-exports every public symbol from `ag-grid-enterprise`.
 *
 * Import enterprise-tier AG Grid modules such as row grouping, tree data,
 * server-side row model, Excel export, and integrated charts from this entry
 * point so the application resolves a single shared copy of
 * `ag-grid-enterprise` managed by the Fusion Framework monorepo.
 *
 * @remarks
 * An AG Grid enterprise license key must be configured via
 * {@link enableAgGrid} for enterprise features to function without
 * watermarks.
 *
 * @example
 * ```ts
 * import { IntegratedChartsModule, RowGroupingModule } from '@equinor/fusion-framework-react-ag-grid/enterprise';
 * ```
 *
 * @see {@link https://www.ag-grid.com/react-data-grid/licensing/ | AG Grid Licensing}
 * @module enterprise
 */
export * from 'ag-grid-enterprise';
