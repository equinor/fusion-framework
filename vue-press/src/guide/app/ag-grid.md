---
title: AG-Grid
category: Guide
tag:
    - how to
    - basic
    - app
    - cookbooks
    - ag-grid
---

![AG-Grid](./cli.png)

## Ag-Grid Cookbook

You can easily setup AG Grid in fusion-framework enabled apps by following these steps:

- Setup Ag Grid lisencing according to the [enableAgGrid guide](/fusion-framework/modules/ag-grid/).
- Install the required @ag-grid-community packages
  - @ag-grid-community/core
  - @ag-grid-community/react
- Install the package: [@equinor/fusion-react-ag-grid-styles](https://equinor.github.io/fusion-react-components/?path=/docs/data-ag-grid-styles--page) to use the ``alpine-fusion`` theme.

::: tip AG Grid version
The version of ag grid you install should be the same version as the license key or lower. The current licensed version is: <AgGridVersion />.
:::

See the [AG-Grid cookbok app](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react-ag-grid) for a working example with modules.

### Alpine Fusion theme

```ts
import AgGridReact from '@ag-grid-community/react';
import useStyles from '@equinor/fusion-react-ag-grid-styles';

const MyComponent = (): JSX.Element => {
    const styles = useStyles();

    // aggrid effects...

    return (
        <div className={styles.root}>
            <div className="ag-theme-alpine-fusion">
                <AgGridReact {...agGridProps} />
            </div>
        </div>
    );
};
```

::: tip Licencing
Licensing works in production builds so you get an unlicensed warning in your console when running from CLI.
:::

::: tip AG Grid documentation
The [AG Grid documentation](https://www.ag-grid.com/react-data-grid/) provides examples for advanced use cases.
:::
