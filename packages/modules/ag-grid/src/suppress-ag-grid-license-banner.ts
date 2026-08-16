/**
 * Test helpers for the AG Grid Fusion module.
 *
 * @remarks
 * Import from `@equinor/fusion-framework-module-ag-grid/testing` in test setup
 * files only — these helpers patch global state and are not meant for
 * application runtime code.
 *
 * @packageDocumentation
 */

/**
 * Matches the lines AG Grid Enterprise writes through `console.error` when no
 * license key is configured: the "License Key Not Found" message itself, its
 * surrounding asterisk banner, and the `ag-grid.com` links it includes.
 */
const AG_GRID_LICENSE_BANNER = /AG Grid|ag-grid\.com|License Key Not Found|^\*+$|^\*.*\*$/;

/**
 * Silences AG Grid Enterprise's unlicensed "License Key Not Found" banner on
 * `console.error` so it doesn't bury real failures in test output.
 *
 * @remarks
 * AG Grid Enterprise logs this banner on every grid mount when no license key
 * is configured, which is expected in test environments that don't set one.
 * Call this once from a test setup file (e.g. Vitest's `setupFiles`); it
 * leaves other `console.error` calls untouched. Prefer configuring a real
 * license key via {@link enableAgGrid} to remove the banner outside of tests.
 *
 * @returns A function that restores the original `console.error`.
 *
 * @example
 * ```ts
 * // src/test/setupTests.ts
 * import { suppressAgGridLicenseBanner } from '@equinor/fusion-framework-module-ag-grid/testing';
 *
 * suppressAgGridLicenseBanner();
 * ```
 */
export const suppressAgGridLicenseBanner = (): (() => void) => {
  const originalConsoleError = console.error;

  console.error = (message?: unknown, ...rest: unknown[]): void => {
    // AG Grid logs the banner as a plain string; anything else is a real error and must pass through
    if (typeof message === 'string' && AG_GRID_LICENSE_BANNER.test(message)) {
      return;
    }
    originalConsoleError(message, ...rest);
  };

  return () => {
    console.error = originalConsoleError;
  };
};
