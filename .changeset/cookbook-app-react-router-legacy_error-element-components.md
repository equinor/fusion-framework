---
"@equinor/fusion-framework-cookbook-app-react-router-legacy": patch
---

Internal: split `ErrorElementPage.tsx` (clientLoader, ErrorElementPage, ErrorElementBoundary) into separate files under `src/components/`, resolving a `single-export-per-file` lint violation; no consumer-facing behavior change.
