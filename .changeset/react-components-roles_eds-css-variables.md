---
"@equinor/fusion-framework-react-components-roles": patch
---

Role cards, the claim dialog, the claimable-role view and compact role rows now use EDS CSS custom properties (`var(--eds-color-…)` and `var(--eds-elevation-low)`) instead of hard-coded colours, so they follow the active EDS colour scheme, including dark mode.

The host must load `@equinor/eds-tokens/css/variables`; there are no literal colour fallbacks.

Refs equinor/fusion-core-tasks#2755
