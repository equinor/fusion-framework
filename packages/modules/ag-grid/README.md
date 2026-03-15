# AG Grid Module for Fusion Framework

`@equinor/fusion-framework-module-ag-grid` provides a Fusion module that wraps [AG Grid](https://www.ag-grid.com/) with centralised license-key management, theming, and module registration.
It ensures every Fusion portal and application uses a consistent AG Grid setup.

## When to use this package

- **Portal hosts** — configure the AG Grid license key and default theme once so all child applications inherit them.
- **Applications** — register the specific AG Grid feature modules (row models, toolpanels, export, etc.) needed by each app to keep bundles small via tree-shaking.

> [!TIP]
> This is the **base** package. Both `ag-grid-community` and `ag-grid-enterprise` are required peer dependencies.
> For React-specific hooks and components see [`@equinor/fusion-framework-react-ag-grid`](https://www.npmjs.com/package/@equinor/fusion-framework-react-ag-grid).

## Installation

```sh
pnpm add @equinor/fusion-framework-module-ag-grid
```

> [!WARNING]
> Fusion will try to keep the semantic major and minor versions in sync with AG Grid, but there might be cases where this is not possible. So `@equinor/fusion-framework-module-ag-grid` and `ag-grid` might have different __patch__ versions.

> [!IMPORTANT]
> **v35 Breaking Change**: AG Charts has been moved to a separate package `@equinor/fusion-framework-react-ag-charts`. If you need integrated charting, install both packages and use `IntegratedChartsModule.with(AgChartsEnterpriseModule)`.
>
> Before upgrading to AG Grid 33, remove all previous references to `@equinor/fusion-react-ag-grid-styles`, `@ag-grid-community/*` and `@ag-grid-enterprise/*` from your project dependencies.

## Quick start

Register the module in your portal or application configurator with `enableAgGrid`:

```ts
import { type FrameworkConfigurator } from '@equinor/fusion-framework';
import { enableAgGrid } from '@equinor/fusion-framework-module-ag-grid';

export async function configure(config: FrameworkConfigurator) {
    enableAgGrid(config, (builder) => {
        builder.setLicenseKey('your-license-key');
    });
}
```

The `enableAgGrid` helper accepts an optional callback that receives an `IAgGridConfigurator` builder. Use it to set the license key, theme, and feature modules.

## Theming

This module uses the `alpine` theme as the base [theme for AG Grid](https://www.ag-grid.com/react-data-grid/theming/). 
The theme can be customized by providing a custom theme in the application.

> [!TIP]
> AG Grid has a [theme builder](https://www.ag-grid.com/theme-builder/) that can be used to preview and generate a custom theme.

```ts
enableAgGrid(configurator, (builder) => {
    builder.setTheme((theme) => {
        return theme.withParams({
            backgroundColor: "#1f2836",
            browserColorScheme: "dark",
            chromeBackgroundColor: {
                ref: "foregroundColor",
                mix: 0.07,
                onto: "backgroundColor"
            },
            foregroundColor: "#FFF",
            headerFontSize: 14
        });
    });
});
```

> [!IMPORTANT]
> Themes are by default inherited from parent scopes (aka portals).
> This means that the theme set in the portal will be inherited by the application.
>
> __NOTE:__ Configured themes are global and will affect all instances of AG Grid in the application.

### Customizing a grid instance

The module provides a hook to customize a grid instance.

```tsx
import { useTheme } from '@equinor/fusion-framework-react-ag-grid';

const MyComponent = () => {
    const baseTheme = useTheme();
    const [hasError, setHasError] = useState(false);
    const theme = useMemo(() => baseTheme.withParams({
        // add red text color if error
        cellTextColor: hasError ? "#FF0000" : baseTheme.cellTextColor,
    }), [baseTheme, hasError]);

    return (
        <AgGridReact
            theme={theme}
            ...
        />
    );
};
```

## Registering AG Grid feature modules

Since AG Grid 33, feature modules must be explicitly registered so tree-shaking can remove unused code.
Use `builder.addModule()` or `builder.setModules()` inside the `enableAgGrid` callback:

```ts
import { enableAgGrid } from '@equinor/fusion-framework-module-ag-grid';
import { ClientSideRowModelModule } from 'ag-grid-community';
import {
    ClipboardModule,
    ColumnsToolPanelModule,
    ExcelExportModule,
    FiltersToolPanelModule,
    MenuModule,
} from 'ag-grid-enterprise';

export const configure: AppModuleInitiator = (configurator, { env }) => {
    enableAgGrid(configurator, (builder) => {
        builder.setModules([
            ClientSideRowModelModule,
            ClipboardModule,
            ColumnsToolPanelModule,
            ExcelExportModule,
            FiltersToolPanelModule,
            MenuModule,
        ]);
    });
};
```

> [!IMPORTANT]
> Modules **must** be registered in configuration to enable proper tree-shaking. Only import what you need.

## Key exports

| Export | Purpose |
|---|---|
| `enableAgGrid` | Register the AG Grid module with a Fusion configurator |
| `AgGridConfigurator` | Configuration builder (license key, theme, modules) |
| `AgGridProvider` | Runtime provider exposing the resolved config |
| `fusionTheme` | Default Equinor-branded AG Grid theme (from `./themes`) |
| `createThemeFromTheme` | Clone a theme to avoid cross-context `instanceof` issues (from `./themes`) |

## API reference

### `enableAgGrid(configurator, callback?)`

Registers the AG Grid module. The optional callback receives an `IAgGridConfigurator`:

- `setLicenseKey(key)` — set the enterprise license key
- `setTheme(theme | callback | null)` — set, customise, or clear the global theme
- `setModules(modules)` — replace all registered AG Grid modules
- `addModule(module)` — append a single module
- `removeModule(module | name)` — remove a module by reference or name

### Theme inheritance

Themes configured in a parent scope (portal) are automatically inherited by child scopes (applications). The module clones inherited themes via `createThemeFromTheme` to avoid `instanceof` mismatches across module-federation boundaries.

## Migration from AG Grid 32 to 33

AG Grid 33 consolidated all feature modules into single `ag-grid-community` and `ag-grid-enterprise` packages. Key changes:

- Remove all `@ag-grid-community/*` and `@ag-grid-enterprise/*` dependencies
- Remove `@equinor/fusion-react-ag-grid-styles` — styles are bundled in v33+
- Register feature modules explicitly via `builder.setModules()` for correct tree-shaking

> [!IMPORTANT]
> Read the [AG Grid v33 changelog](https://www.ag-grid.com/changelog/) before upgrading.
> Additionally, developers should also refer to the official AG Grid upgrade guide available at [Upgrading to AG Grid 33](https://www.ag-grid.com/react-data-grid/upgrading-to-ag-grid-33/) for comprehensive details and best practices.

### Imports
__Remove the following imports:__

- `@ag-grid-community/*`
- `@ag-grid-enterprise/*`

__Replace with:__

- `@equinor/fusion-framework-module-ag-grid`

### Modules

Since AG Grid 33, all modules have been aggregated into a single package, which means the modules need to be defined in the application configuration.

Move all `ModuleRegistry.registerModules` to `builder.setModules` in the application configuration.

```diff
// my-app/src/app.ts
- import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
- import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
- import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
- import { MenuModule } from '@ag-grid-enterprise/menu';
- import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
- import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
- import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';

- ModuleRegistry.registerModules([
-     ClientSideRowModelModule,
-     ColumnsToolPanelModule,
-     FiltersToolPanelModule,
-     MenuModule,
-     ExcelExportModule,
-     RangeSelectionModule,
-     ClipboardModule,
- ]);
// config.ts
+ import { enableAgGrid } from '@equinor/fusion-framework-module-ag-grid';
+ import { ClientSideRowModelModule } from '@equinor/fusion-framework-module-ag-grid/community';
+ import {
+     ClipboardModule,
+     ColumnsToolPanelModule,
+     ExcelExportModule,
+     FiltersToolPanelModule,
+     MenuModule,
+ } from '@equinor/fusion-framework-module-ag-grid/enterprise';
  
  export const configure: AppModuleInitiator = (configurator, { env }) => {
+    enableAgGrid(configurator, (builder) => {
+        builder.addModules([
+            ClientSideRowModelModule,
+            ClipboardModule,
+            ColumnsToolPanelModule,
+            ExcelExportModule,
+            FiltersToolPanelModule,
+            MenuModule,
+        ]);
+    });
  };
```