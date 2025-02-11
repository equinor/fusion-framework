---
'@equinor/fusion-framework-module-ag-grid': patch
---

---

## "@equinor/fusion-framework-module-ag-grid": patch

**@equinor/fusion-framework-module-ag-grid:**

- Updated `README.md` with detailed documentation for the AG Grid React for Fusion Framework, including installation, configuration, theming, customizing a grid instance, and upgrading from version 32 to 33.
- Refactor: `package.json` to include peer dependencies for `ag-grid-community` and `ag-grid-enterprise`.
- Fixed: `AgGridConfigurator` class to setting the license key on initialization.
- Refactor: import statements to use `ag-grid-enterprise` and `ag-grid-community`.
- Feature: Added `createThemeFromExistingTheme` function to decontruct an existing theme and create a new theme _(AG-Grid type checks with `instanceof` which will break since the parent scope has another instance than the consumer)._

We have chose to only `patch` this release, to conform with the AG Grid versioning scheme, event tho there are some breaking changes. This is because the breaking changes are not related to the API of the module itself, but rather to the dependencies of the module.

- `@equinor/fusion-framework-module-ag-grid/enterprise` and `@equinor/fusion-framework-module-ag-grid/community` have been removed. Instead, the module now relies on the `ag-grid-enterprise` and `ag-grid-community` packages as peer dependencies. This means that you will have to install these packages yourself.
