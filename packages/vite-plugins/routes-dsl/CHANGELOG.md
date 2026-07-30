# @equinor/fusion-framework-vite-plugin-routes-dsl

## 1.0.2

### Patch Changes

- ff4a488: Internal: bump `typescript` from `5.9.3` to `7.0.2`, matching the version already used across the rest of the monorepo.
- da8b281: Internal: bump `vite` from `7.3.6` to `8.1.5` and widen the `vite` peer dependency to `^7.0.0 || ^8.0.0`, matching the rest of the vite-plugins packages.

## 1.0.1

### Patch Changes

- 80c3e4a: Internal: added intent comments to satisfy `fusion-lint` rules (control-flow, iterator/rxjs chains, TSDoc `@template` tags, and single-export-per-file), and referenced tracking issues (#5065, #5066) for pre-existing TODO comments. `InvalidRouteError` was moved to its own module (`invalid-route-error.ts`) in `api-service` to satisfy `single-export-per-file`. No behavior changes.
