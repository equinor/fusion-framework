---
"@equinor/fusion-framework-vite-plugin-spa": patch
---

The SPA HTML template now sets the page background to `var(--eds-color-bg-neutral-surface)`, so portals that load the EDS CSS variables get a scheme-aware backdrop instead of the browser default, which is black in dark mode.

Refs equinor/fusion-core-tasks#2755
