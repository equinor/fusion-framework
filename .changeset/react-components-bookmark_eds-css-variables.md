---
"@equinor/fusion-framework-react-components-bookmark": minor
---

Bookmark components now use EDS CSS custom properties (`var(--eds-color-…)`) instead of the `@equinor/eds-tokens` JavaScript `tokens` object, so row hover and borders, section headings, shared icons and messages follow the active EDS colour scheme, including dark mode.

The host must load `@equinor/eds-tokens/css/variables`; there are no literal colour fallbacks. `@equinor/eds-tokens` is no longer a peer dependency.

Refs equinor/fusion-core-tasks#2755
