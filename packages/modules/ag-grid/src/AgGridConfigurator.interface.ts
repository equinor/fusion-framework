import { type Theme, type Module } from 'ag-grid-community';

export interface AgGridConfig {
    licenseKey?: string;
    theme?: Theme;
    modules?: Array<Module>;
}

/**
 * Interface for configuring AG Grid settings and modules.
 */
export interface IAgGridConfigurator {
    /**
     * sets the global AG Grid license key.
     * @param value - The license key to be set.
     */
    setLicenseKey(value: string | undefined): void;

    /**
     * sets the global AG Grid theme.
     *
     * @example
     * ```ts
     * builder.setTheme({
     *  backgroundColor: "#1f2836",
     *  browserColorScheme: "dark",
     * });
     * ```
     * @param theme - The theme to be set.
     */
    setTheme(theme: Theme): void;

    /**
     * Clears the global AG Grid theme.
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
     * Sets the modules for the configurator.
     * __Note:__ This will override any existing modules.
     *
     * @example
     * ```ts
     * import {
     *   ClientSideRowModelModule,
     *   ValidationModule,
     * } from "@equinor/fusion-framework-module-ag-grid/community";
     *
     * //configuration
     * builder.setModules([ClientSideRowModelModule, ValidationModule]);
     * ```∫
     * @param value - An array of modules to be set.
     */
    setModules(value: Module[]): void;

    /**
     * Adds a module to AG Grid.
     *
     * @example
     * ```ts
     * import { ClientSideRowModelModule } from "@equinor/fusion-framework-module-ag-grid/community";
     * // configuration
     * builder.addModule(ClientSideRowModelModule);
     * ```
     *
     * @param value - The module to be added.
     */
    addModule(value: Module): void;

    /**
     * Removes a module from AG Grid.
     *
     * @example
     * ```ts
     * // configuration
     * builder.removeModule('ClientSideRowModelModule');
     * ```
     *
     * @param value - The module or the name of the module to be removed.
     */
    removeModule(value: Module | string): void;
}
