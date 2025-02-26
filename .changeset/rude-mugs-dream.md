---
"@equinor/fusion-framework-module-ag-grid": patch
---

Fixed a bug where when creating a new theme, parts where not added from the source theme to the new theme.

This was due to the fact that the `parts` attribute was not being copied over to the new theme,
since `withPart` is an immutable operation and the result was not being assigned to the new theme.
