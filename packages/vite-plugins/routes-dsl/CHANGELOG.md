# @equinor/fusion-framework-vite-plugin-routes-dsl

## 1.0.1

### Patch Changes

- 80c3e4a: Internal: added intent comments to satisfy `fusion-lint` rules (control-flow, iterator/rxjs chains, TSDoc `@template` tags, and single-export-per-file), and referenced tracking issues (#5065, #5066) for pre-existing TODO comments. `InvalidRouteError` was moved to its own module (`invalid-route-error.ts`) in `api-service` to satisfy `single-export-per-file`. No behavior changes.
