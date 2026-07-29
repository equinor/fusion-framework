# @equinor/fusion-framework-vite-plugin-markdown

## 1.1.1

### Patch Changes

- 80c3e4a: Internal: added intent comments to satisfy `fusion-lint` rules (control-flow, iterator/rxjs chains, TSDoc `@template` tags, and single-export-per-file), and referenced tracking issues (#5065, #5066) for pre-existing TODO comments. `InvalidRouteError` was moved to its own module (`invalid-route-error.ts`) in `api-service` to satisfy `single-export-per-file`. No behavior changes.

## 1.1.0

### Minor Changes

- 98d8f08: Add new Vite plugin for handling markdown file imports with `?raw` query parameter.

  The `@equinor/fusion-framework-vite-plugin-markdown` package provides a Vite plugin that transforms imports like `import content from './README.md?raw'` into a module that exports the raw markdown content as a string. This matches the behavior of Vite's built-in `?raw` import.

  ```typescript
  import { markdownPlugin } from "@equinor/fusion-framework-vite-plugin-markdown";

  export default defineConfig({
    plugins: [markdownPlugin()],
  });
  ```
