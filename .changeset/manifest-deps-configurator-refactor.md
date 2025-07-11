---
"@equinor/fusion-framework-app": patch
"@equinor/fusion-framework": patch
"@equinor/fusion-framework-modules-app": patch
---

- Added new manifest file for `app-react-ag-grid`.
- Updated dependencies and formatting in `@equinor/fusion-framework-app` package.
- Refactored configurator classes to remove logger assignments.
- Removed unused import in app module configurator.

### Details
- Updated `rxjs` dependency and formatting in `packages/app/package.json`.
- Refactored `AppConfigurator` and `FrameworkConfigurator` to remove logger assignments (which previously prepended the configurator name to log messages) and add event$ getter for event stream mapping.
- Removed unused import from `packages/modules/app/src/AppConfigurator.ts`.
