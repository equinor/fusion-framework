# @equinor/fusion-framework-vite-plugin-raw-imports

## 1.1.0-next.1

### Patch Changes

- [#3820](https://github.com/equinor/fusion-framework/pull/3820) [`c787fc6`](https://github.com/equinor/fusion-framework/commit/c787fc6b6db2b2837ec863125220feffca7240ab) Thanks [@odinr](https://github.com/odinr)! - relase next

## 1.1.0-next.0

### Minor Changes

- [#3820](https://github.com/equinor/fusion-framework/pull/3820) [`d252b0d`](https://github.com/equinor/fusion-framework/commit/d252b0d442b7c8c1b50bf2768cf9ecbbb55a76f8) Thanks [@odinr](https://github.com/odinr)! - Add new Vite plugin for handling `?raw` imports in library mode.

  This plugin enables importing files as raw strings using the `?raw` query parameter, with reliable support for Vite library builds (`build.lib`) where native `?raw` support may be inconsistent. Handles relative path resolution edge cases.

  ```typescript
  import readmeContent from "../../README.md?raw";
  ```

  The plugin is automatically included when using `@equinor/fusion-framework-cli` for building applications.

### Patch Changes

- [#3820](https://github.com/equinor/fusion-framework/pull/3820) [`265bb76`](https://github.com/equinor/fusion-framework/commit/265bb767249989eeb1971e83f3fba94879e0813b) Thanks [@odinr](https://github.com/odinr)! - relase next
