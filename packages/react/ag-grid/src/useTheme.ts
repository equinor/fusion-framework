import { useModule } from '@equinor/fusion-framework-react-module';
import { type AgGridModule } from '@equinor/fusion-framework-module-ag-grid';
import { type Theme } from '@equinor/fusion-framework-module-ag-grid/themes';

/**
 * Hook for using the current AG Grid theme.
 */
export const useTheme = (): Theme => {
  const agGrid = useModule<AgGridModule>('agGrid');

  if (!agGrid) {
    throw new Error('agGrid module is not available');
  }

  return agGrid.theme as Theme;
};

export default useTheme;
