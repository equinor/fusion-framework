import { useAppModule } from '../useAppModule';
import type { AgGridModule } from '@equinor/fusion-framework-module-ag-grid';
import type { Theme } from '@equinor/fusion-framework-module-ag-grid/themes';

/**
 * React hook that returns the current AG Grid theme from the application-scoped
 * AG Grid module.
 *
 * @returns The active {@link Theme} object.
 * @throws If the AG Grid module is not registered in the application.
 */
export const useTheme = (): Theme => {
  const agGrid = useAppModule<AgGridModule>('agGrid');

  if (!agGrid) {
    throw new Error('agGrid module is not available');
  }

  return agGrid.theme as Theme;
};
