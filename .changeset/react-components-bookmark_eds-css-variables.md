---
"@equinor/fusion-framework-react-components-bookmark": major
---

Bookmark components now use EDS CSS custom properties (`var(--eds-color-…)`) instead of the `@equinor/eds-tokens` JavaScript `tokens` object, so row hover and borders, section headings, shared icons and messages follow the active EDS colour scheme, including dark mode.

**Breaking:** the host must load `@equinor/eds-tokens/css/variables`. There are no literal colour fallbacks, so without the stylesheet row borders, hover backgrounds, headings, icons and messages lose their colours. `@equinor/eds-tokens` is no longer a peer dependency. The dev portal already loads the stylesheet.

**Migration:** add `@equinor/eds-tokens` (^2.0.0) to the host and import its CSS variables once at the app or portal entry point:

```ts
import '@equinor/eds-tokens/css/variables';
```

Refs equinor/fusion-core-tasks#2755
