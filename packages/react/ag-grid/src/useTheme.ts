import { useModule } from '@equinor/fusion-framework-react-module';
import type { AgGridModule } from '@equinor/fusion-framework-module-ag-grid';
import type { Theme } from '@equinor/fusion-framework-module-ag-grid/themes';

/**
 * Retrieves the current AG Grid theme from the Fusion Framework module system.
 *
 * Use `useTheme` inside a React component to obtain the resolved AG Grid
 * {@link Theme} configured for the application. The returned theme can be
 * passed directly to `<AgGridReact theme={theme} />` or further customized
 * with `.withParams()`.
 *
 * @returns The active AG Grid {@link Theme} provided by the `agGrid` module.
 *
 * @throws {Error} When the `agGrid` module has not been registered.
 *   Ensure {@link enableAgGrid} is called during application configuration.
 *
 * @example
 * ```tsx
 * import { AgGridReact } from '@equinor/fusion-framework-react-ag-grid';
 * import { useTheme } from '@equinor/fusion-framework-react-ag-grid';
 *
 * const MyGrid = () => {
 *   const theme = useTheme();
 *   return <AgGridReact theme={theme} rowData={rows} columnDefs={cols} />;
 * };
 * ```
 */
export const useTheme = (): Theme => {
  const agGrid = useModule<AgGridModule>('agGrid');

  if (!agGrid) {
    throw new Error('agGrid module is not available');
  }

  return agGrid.theme as Theme;
};

export default useTheme;
