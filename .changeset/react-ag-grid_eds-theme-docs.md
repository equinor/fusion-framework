---
"@equinor/fusion-framework-react-ag-grid": major
---

**Breaking:** the re-exported `fusionTheme` from `@equinor/fusion-framework-module-ag-grid` 38 now uses EDS CSS custom properties without literal colour fallbacks, so it follows the active EDS colour scheme. The host must load `@equinor/eds-tokens/css/variables`, or the grid loses its colours. The dev portal already loads it.

**Migration:** add `@equinor/eds-tokens` (^2.0.0) to the host and import its CSS variables once at the app or portal entry point:

```ts
import '@equinor/eds-tokens/css/variables';
```

The README theme examples now use EDS CSS custom properties instead of hex values.

Refs equinor/fusion-core-tasks#2755
