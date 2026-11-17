---
"@equinor/fusion-framework-react-components-roles": minor
---

Role cards, the claim dialog, the claimable-role view and compact role rows now use EDS CSS custom properties (`var(--eds-color-…)` and `var(--eds-elevation-low)`) instead of hard-coded colours, so they follow the active EDS colour scheme, including dark mode.

**Breaking:** the host must load `@equinor/eds-tokens/css/variables`. There are no literal colour fallbacks, so without the stylesheet the compact-row indicators lose their active and inactive colours. This package is pre-1.0, so the breaking change is released as a minor version, which `^0.2` ranges don't pick up. The dev portal already loads the stylesheet.

**Migration:** add `@equinor/eds-tokens` (^2.0.0) to the host and import its CSS variables once at the app or portal entry point:

```ts
import '@equinor/eds-tokens/css/variables';
```

Refs equinor/fusion-core-tasks#2755
