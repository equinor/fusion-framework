---
"@equinor/fusion-framework-module-ag-grid": major
---

The default Fusion AG Grid theme now follows the active EDS colour scheme, so grids render in dark mode when the host does.

- Accent, background, foreground and border colours use EDS CSS custom properties (`var(--eds-color-…)`) instead of static hex values from the `@equinor/eds-tokens` JavaScript `tokens` object.
- `browserColorScheme` is `inherit`, so native scrollbars and inputs in the grid match the page.
- `@equinor/eds-tokens` is no longer a peer dependency.

**Breaking:** the host must load `@equinor/eds-tokens/css/variables`. The theme has no literal colour fallbacks, so without the stylesheet the grid loses its accent, background, foreground and border colours. The dev portal already loads it.

**Migration:** add `@equinor/eds-tokens` (^2.0.0) to the host and import its CSS variables once at the app or portal entry point. Set `data-color-scheme="light"` or `"dark"` on an ancestor to choose the scheme explicitly.

```ts
import '@equinor/eds-tokens/css/variables';
```

Refs equinor/fusion-core-tasks#2755
