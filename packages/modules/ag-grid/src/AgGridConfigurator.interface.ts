import type { Theme, Module } from 'ag-grid-community';

/**
 * Resolved configuration object for the AG Grid module.
 *
 * Produced by {@link IAgGridConfigurator} during module initialisation and consumed
 * by {@link AgGridProvider} to register the license key, theme, and AG Grid modules.
 */
export interface AgGridConfig {
  /** AG Grid enterprise license key. When omitted, enterprise features are unavailable. */
  licenseKey?: string;
  /** Factory that returns the active AG Grid {@link Theme}. */
  theme?: () => Theme;
  /** AG Grid feature modules to register globally via `ModuleRegistry`. */
  modules?: Array<Module>;
}

/**
 * Configuration builder interface for the AG Grid module.
 *
 * Use this interface to set the AG Grid license key, customise the theme, and
 * register or remove AG Grid feature modules during Fusion application setup.
 *
 * @example
 * ```ts
 * import { enableAgGrid } from '@equinor/fusion-framework-module-ag-grid';
 *
 * enableAgGrid(configurator, (builder) => {
 *   builder.setLicenseKey('your-key');
 *   builder.setTheme((theme) => theme.withParams({ accentColor: '#007079' }));
 * });
 * ```
 */
export interface IAgGridConfigurator {
  /**
   * Sets the global AG Grid enterprise license key.
   *
   * @param value - The license key string, or `undefined` to clear it.
   */
  setLicenseKey(value: string | undefined): void;

  /**
   * Sets the global AG Grid theme to a concrete {@link Theme} instance.
   *
   * @example
   * ```ts
   * import { themeBalham } from 'ag-grid-community';
   * builder.setTheme(themeBalham);
   * ```
   *
   * @param theme - A fully constructed AG Grid theme.
   */
  setTheme(theme: Theme): void;

  /**
   * Clears the global AG Grid theme, reverting to the default Fusion theme.
   *
   * @param theme - Pass `null` to remove any previously configured theme.
   */
  setTheme(theme: null): void;

  /**
   * Sets the global AG Grid theme.
   *
   * @example
   * ```ts
   * builder.setTheme((theme) => theme.withParams({
   *   backgroundColor: "#1f2836",
   *   browserColorScheme: "dark",
   *   chromeBackgroundColor: {
   *     ref: "foregroundColor",
   *     mix: 0.07,
   *     onto: "backgroundColor"
   *   },
   *   foregroundColor: "#FFF",
   *   headerFontSize: 14
   * }));
   * ```
   *
   * @param callback - A callback function that receives the current theme and returns the new theme.
   */
  setTheme(callback: (baseTheme: Theme) => Theme): void;

  /**
   * Replaces all registered AG Grid feature modules.
   *
   * @remarks
   * This **overwrites** any previously registered modules, including defaults.
   * Use {@link IAgGridConfigurator.addModule | addModule} to append without replacing.
   *
   * @example
   * ```ts
   * import {
   *   ClientSideRowModelModule,
   *   ValidationModule,
   * } from '@equinor/fusion-framework-module-ag-grid/community';
   *
   * builder.setModules([ClientSideRowModelModule, ValidationModule]);
   * ```
   *
   * @param value - The full set of AG Grid modules to register.
   */
  setModules(value: Module[]): void;

  /**
   * Appends a single AG Grid feature module to the current module set.
   *
   * @example
   * ```ts
   * import { ClientSideRowModelModule } from '@equinor/fusion-framework-module-ag-grid/community';
   * builder.addModule(ClientSideRowModelModule);
   * ```
   *
   * @param value - The AG Grid module to register.
   */
  addModule(value: Module): void;

  /**
   * Removes a previously registered AG Grid module by reference or by name.
   *
   * @remarks
   * If the module is not found, a warning is logged to the console.
   *
   * @example
   * ```ts
   * builder.removeModule('ClientSideRowModelModule');
   * ```
   *
   * @param value - The AG Grid module instance or its `moduleName` string.
   */
  removeModule(value: Module | string): void;
}
