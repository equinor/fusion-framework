# AG Grid

Apply the Fusion-managed AG Grid theme to your `<AgGridReact>` instance.

**Import:**

```ts
import { useTheme } from '@equinor/fusion-framework-react-app/ag-grid';
```

## Overview

The `useTheme` hook returns the current AG Grid theme configured by the Fusion AG Grid module. Pass the returned theme to `<AgGridReact>` to ensure your grid uses the correct Fusion/EDS styling.

> [!IMPORTANT]
> The AG Grid module must be enabled in the app configurator before `useTheme` is available. If the module is not registered, the hook throws an error.

## useTheme

Returns the active AG Grid `Theme` object from the application-scoped AG Grid module.

**Signature:**

```ts
function useTheme(): Theme;
```

**Returns:** A `Theme` object compatible with AG Grid's `theme` prop.

**Throws** if the AG Grid module is not registered in the application.

## Usage

### Setup

Enable the AG Grid module in your app's configurator:

```ts
import { enableAgGrid } from '@equinor/fusion-framework-module-ag-grid';

export const configure = (configurator) => {
  enableAgGrid(configurator);
};
```

### Apply Theme to AgGridReact

```tsx
import { useTheme } from '@equinor/fusion-framework-react-app/ag-grid';
import { AgGridReact } from 'ag-grid-react';

const MyGrid = ({ rowData, columnDefs }) => {
  const theme = useTheme();

  return (
    <div style={{ height: 500 }}>
      <AgGridReact
        theme={theme}
        rowData={rowData}
        columnDefs={columnDefs}
      />
    </div>
  );
};
```

## Notes

- The theme is sourced from `@equinor/fusion-framework-module-ag-grid` — see the module documentation for detailed AG Grid configuration options
- The Fusion AG Grid theme follows EDS design tokens for consistent styling across apps
