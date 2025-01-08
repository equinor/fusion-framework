---
'@equinor/fusion-framework-module-ag-grid': major
---

Enhanced the AG Grid module with new functionalities and improvements.

- Added TypeScript type definitions for better type support.
- Introduced new exports for `community`, `enterprise`, and `themes`.
- Implemented `AgGridConfigurator` and `AgGridProvider` classes for better configuration and initialization.
- Added support for setting and clearing themes, managing modules, and setting license keys.
- Updated the `module.ts` to use the new configurator and provider classes.
- Removed deprecated files and refactored the module structure for better maintainability.

**Detailed Changes:**

- **package.json**: Updated dependencies and added new exports.
- **AgGridConfigurator.interface.ts**: Defined the interface for configuring AG Grid settings and modules.
- **AgGridConfigurator.ts**: Implemented the `AgGridConfigurator` class for managing AG Grid configuration.
- **AgGridProvider.ts**: Implemented the `AgGridProvider` class for providing AG Grid configuration.
- **community.ts**: Exported all from `ag-grid-community`.
- **default-modules.ts**: Added a placeholder for default modules.
- **enterprise.ts**: Exported all from `ag-grid-enterprise`.
- **index.ts**: Updated exports to use the new configurator and provider.
- **module.ts**: Refactored to use the new configurator and provider classes.
- **themes.ts**: Added a default theme for AG Grid.

**Breaking Changes:**

- `@ag-grid-community/*` and `@ag-grid-enterprise/*` must be removed from the project dependencies.
- The new configurator no longer supports setting license keys directly. Use the `setLicense` function to set license keys.
- Modules are now managed through the `AgGridConfigurator` class. Use the `setModule` or `addModule` function to set/add modules to the configuration.

**References:**

- [AG Grid 33 Migration Guide](https://www.ag-grid.com/react-data-grid/upgrading-to-ag-grid-33/)
- [AG Grid Documentation](https://www.ag-grid.com/)
- [AG Grid Theme Builder](https://www.ag-grid.com/theme-builder/)
