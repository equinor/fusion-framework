# @equinor/fusion-framework-vite-plugin-raw-imports

## 2.0.0

### Major Changes

- abffa53: Major version bump for Fusion Framework React 19 release.

  All packages are bumped to the next major version as part of the React 19 upgrade. This release drops support for React versions below 18 and includes breaking changes across the framework.

  **Breaking changes:**
  - Peer dependencies now require React 18 or 19 (`^18.0.0 || ^19.0.0`)
  - React Router upgraded from v6 to v7
  - Navigation module refactored with new history API
  - `renderComponent` and `renderApp` now use `createRoot` API

  **Migration:**
  - Update your React version to 18.0.0 or higher before upgrading
  - Replace `NavigationProvider.createRouter()` with `@equinor/fusion-framework-react-router`
  - See individual package changelogs for package-specific migration steps

### Minor Changes

- abffa53: Add new Vite plugin for handling `?raw` imports in library mode.

  This plugin enables importing files as raw strings using the `?raw` query parameter, with reliable support for Vite library builds (`build.lib`) where native `?raw` support may be inconsistent. Handles relative path resolution edge cases.

  ```typescript
  import readmeContent from "../../README.md?raw";
  ```

  The plugin is automatically included when using `@equinor/fusion-framework-cli` for building applications.
