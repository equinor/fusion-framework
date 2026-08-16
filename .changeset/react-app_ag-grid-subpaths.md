---
"@equinor/fusion-framework-react-app": minor
---

Add AG Grid sub-path entry-points:

- `@equinor/fusion-framework-react-app/ag-grid` — `AgGridReact`, `enableAgGrid`, and related types, forwarded from `@equinor/fusion-framework-react-ag-grid/react`.
- `@equinor/fusion-framework-react-app/ag-grid/community` — forwards `@equinor/fusion-framework-react-ag-grid/community` (`ag-grid-community`).
- `@equinor/fusion-framework-react-app/ag-grid/enterprise` — forwards `@equinor/fusion-framework-react-ag-grid/enterprise` (`ag-grid-enterprise`).
- `@equinor/fusion-framework-react-app/ag-grid/theme` — Fusion theme utilities (`fusionTheme`, `createTheme`, `createThemeFromTheme`, `Theme`) plus the application-scoped `useTheme` hook.
- `@equinor/fusion-framework-react-app/ag-grid/testing` — `suppressAgGridLicenseBanner`, forwarded from `@equinor/fusion-framework-module-ag-grid/testing`.

```typescript
import { AgGridReact } from '@equinor/fusion-framework-react-app/ag-grid';
import { useTheme } from '@equinor/fusion-framework-react-app/ag-grid/theme';
import { suppressAgGridLicenseBanner } from '@equinor/fusion-framework-react-app/ag-grid/testing';
```

`@equinor/fusion-framework-module-ag-grid` and `@equinor/fusion-framework-react-ag-grid` are now optional peer dependencies of `@equinor/fusion-framework-react-app`.
