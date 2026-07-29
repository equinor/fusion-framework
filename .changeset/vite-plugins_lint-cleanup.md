---
"@equinor/fusion-framework-vite-plugin-api-service": patch
"@equinor/fusion-framework-vite-plugin-markdown": patch
"@equinor/fusion-framework-vite-plugin-raw-imports": patch
"@equinor/fusion-framework-vite-plugin-routes-dsl": patch
"@equinor/fusion-framework-vite-plugin-spa": patch
---

Internal: added intent comments to satisfy `fusion-lint` rules (control-flow, iterator/rxjs chains, TSDoc `@template` tags, and single-export-per-file), and referenced tracking issues (#5065, #5066) for pre-existing TODO comments. `InvalidRouteError` was moved to its own module (`invalid-route-error.ts`) in `api-service` to satisfy `single-export-per-file`. No behavior changes.
