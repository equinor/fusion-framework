# AG Grid React for Fusion Framework

## Installation

```sh
npm i @equinor/fusion-framework-react-ag-grid
```

## Configuration

```ts
// config.ts
import { enableAgGrid } from '@equinor/fusion-framework-react-ag-grid';

export const configure = (configurator) => {
    enableAgGrid(configurator);
};
```

> [!IMPORTANT]
> Since ag-grid is re-exported from this package, node has a hard time resolving the correct types.
> The solution for now is to have `"moduleResolution": "bundler"` in your `tsconfig.json`.

## Theming

Theming will be provided the host (portal) which configures AG Grid for the applications. But the application can override the theme by providing a custom theme.

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

> [!TIP]
> AG Grid has a [theme builder](https://www.ag-grid.com/theme-builder/) that can be used to preview and generate a custom theme.

## Enterprise and Community Features

Enterprise features are available from the namespace `@equinor/fusion-framework-react-ag-grid/enterprise`.

Community features are available from the namespace `@equinor/fusion-framework-react-ag-grid/community`.

### AG Charts Enterprise Module

The `AgChartsEnterpriseModule` is available from the enterprise namespace for advanced charting features:

```ts
import { AgChartsEnterpriseModule, AgChartsEnterpriseModule } from '@equinor/fusion-framework-react-ag-grid/enterprise';

// Use in AG Grid configuration
enableAgGrid(configurator, (builder) => {
    builder.addModule(IntegratedChartsModule.with(AgChartsEnterpriseModule));
});
```

### Customizing a grid instance

The module provides a hook to customize a grid instance.

```tsx
import { useTheme } from '@equinor/fusion-framework-react-app/ag-grid';

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

## Upgrading from 32 to 33

Before upgrading to AG Grid 33, please read remove all previous references to `@equinor/fusion-react-ag-grid-styles`, `@ag-grid-community/*` and `@ag-grid-enterprise/*` from your project dependencies.

__Only `@equinor/fusion-framework-react-ag-grid` should be installed.__ All references to ag-grid should be removed.