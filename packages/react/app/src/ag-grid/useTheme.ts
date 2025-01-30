import { useAppModule } from '../useAppModule';
import { type AgGridModule } from '@equinor/fusion-framework-module-ag-grid';
import { type Theme } from '@equinor/fusion-framework-module-ag-grid/themes';

export const useTheme = (): Theme => {
    const agGrid = useAppModule<AgGridModule>('agGrid');

    if (!agGrid) {
        throw new Error('agGrid module is not available');
    }

    return agGrid.theme as Theme;
};
