---
"@equinor/fusion-framework-dev-portal": patch
"portal-analytics": patch
---

Internal: bump locked `@equinor/fusion-react-context-selector` from 2.0.11 to 2.0.12. The context selector now uses `@equinor/fusion-react-styles` 2.1.11 like the rest of the portal, so its `ThemeProvider` also keeps EDS colours light regardless of OS or browser settings (equinor/fusion-core-tasks#2120).
