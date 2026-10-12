# @equinor/fusion-framework-vite-plugin-react-router

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
