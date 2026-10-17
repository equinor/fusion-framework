# @equinor/fusion-framework-vite-plugin-react-router

## 0.1.4

### Patch Changes

- 1aeab73: Internal: upgrade the test toolchain to Vitest 5 through the shared `vitest` pnpm catalog, keeping `vitest`, `@vitest/browser-playwright`, and `vitest-browser-react` aligned for browser-mode tests. Browser tests now use Vitest 5's explicit partial-text assertions and locator matching where needed.

## 0.1.3

### Patch Changes

- fa4dba6: Fix catastrophic regex backtracking when scanning route modules. Route modules that contain long runs of whitespace inside unfinished `route()`, `layout()`, or DSL `import { ... }` statements could previously stall the Vite transform for seconds to minutes. Route DSL detection, transformation, and import removal behave the same as before.
  
  Resolves CodeQL `js/polynomial-redos` alerts in `react-router-plugin.ts`.

## 0.1.2

### Patch Changes

- 0d1e372: Internal: generate `src/version.ts` in each package's `prebuild` so direct builds and `prepack` no longer depend on the root install script having run. No change to the published output.

## 0.1.1

### Patch Changes

- ce443ae: Generate unique import aliases when route modules in different directories share a basename.
  
  Fixes #5601

## 0.1.0

### Minor Changes

- f7fceec: Add a dedicated Vite plugin package for compiling the Fusion React Router file-route DSL without depending on the router runtime package.
