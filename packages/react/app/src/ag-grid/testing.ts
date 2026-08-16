/**
 * AG Grid test helpers sub-path entry-point.
 *
 * @remarks
 * Re-exports the AG Grid test helpers from
 * `@equinor/fusion-framework-module-ag-grid/testing`. Import from test setup
 * files only — these helpers patch global state and are not meant for
 * application runtime code.
 *
 * @packageDocumentation
 */

/**
 * Silences AG Grid Enterprise's unlicensed "License Key Not Found" banner on
 * `console.error` so it doesn't bury real failures in test output.
 *
 * @returns A function that restores the original `console.error`.
 */
export { suppressAgGridLicenseBanner } from '@equinor/fusion-framework-module-ag-grid/testing';
