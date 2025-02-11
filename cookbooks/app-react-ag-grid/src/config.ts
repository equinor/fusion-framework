import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { enableAgGrid } from '@equinor/fusion-framework-react-ag-grid';
import { ClientSideRowModelModule } from '@equinor/fusion-framework-react-ag-grid/community';
import {
    ClipboardModule,
    ColumnsToolPanelModule,
    ExcelExportModule,
    FiltersToolPanelModule,
    MenuModule,
} from '@equinor/fusion-framework-react-ag-grid/enterprise';

export const configure: AppModuleInitiator = (configurator, { env }) => {
    /** print render environment arguments */
    console.log('configuring application', env);

    enableAgGrid(configurator, (builder) => {
        builder.setModules([
            ClientSideRowModelModule,
            ColumnsToolPanelModule,
            FiltersToolPanelModule,
            MenuModule,
            ExcelExportModule,
            ClipboardModule,
        ]);
        // builder.setTheme((theme) => {
        //     return theme.withParams({
        //         backgroundColor: 'blue',
        //     });
        // });
    });

    /** callback when configurations is created */
    configurator.onConfigured((config) => {
        console.log('application config created', config);
    });

    /** callback when the application modules has initialized */
    configurator.onInitialized((instance) => {
        console.log('application config initialized', instance);
    });
};

export default configure;
