import type {
  IModulesConfigurator,
  Module,
  ModulesInstanceType,
} from '@equinor/fusion-framework-module';

import { AgGridConfigurator } from './AgGridConfigurator';
import { defaultModules } from './default-modules';
import { type IAgGridProvider, AgGridProvider } from './AgGridProvider';

import type { IAgGridConfigurator } from './AgGridConfigurator.interface';

import { createThemeFromTheme, fusionTheme } from './themes';

/**
 * Fusion module type definition for AG Grid.
 *
 * Registered under the `'agGrid'` key in the Fusion module system.
 * Resolves to {@link IAgGridProvider} at runtime and is configured through
 * {@link IAgGridConfigurator}.
 */
export type AgGridModule = Module<'agGrid', IAgGridProvider, IAgGridConfigurator>;

/**
 * Callback signature accepted by {@link enableAgGrid} for configuring AG Grid.
 *
 * @param builder - The AG Grid configuration builder.
 */
export type AgGridBuilderCallback = (builder: IAgGridConfigurator) => void | Promise<void>;

/**
 * AG Grid module definition for the Fusion module system.
 *
 * @remarks
 * When a parent scope (e.g. portal) has already initialised the AG Grid module,
 * the child scope inherits the license key and theme by default, cloning the
 * theme via {@link createThemeFromTheme} to avoid cross-context `instanceof`
 * mismatches.
 */
export const module: AgGridModule = {
  name: 'agGrid',
  configure: (ref?: ModulesInstanceType<[AgGridModule]>) => {
    const licenseKey = ref?.agGrid?.licenseKey;

    const theme = () => (ref?.agGrid?.theme ? createThemeFromTheme(ref.agGrid.theme) : fusionTheme);
    return new AgGridConfigurator({
      licenseKey,
      theme,
      modules: defaultModules,
    });
  },

  initialize: async (args) => {
    const configurator = args.config as AgGridConfigurator;
    const config = await configurator.createConfigAsync(args);
    return new AgGridProvider(config);
  },
};

/**
 * Registers the AG Grid module with a Fusion configurator.
 *
 * Call this function during application or portal setup to enable AG Grid.
 * An optional callback receives the {@link IAgGridConfigurator} builder for
 * setting the license key, theme, and AG Grid feature modules.
 *
 * @example
 * ```ts
 * import { enableAgGrid } from '@equinor/fusion-framework-module-ag-grid';
 *
 * export const configure = (configurator) => {
 *   enableAgGrid(configurator, (builder) => {
 *     builder.setLicenseKey('your-key');
 *   });
 * };
 * ```
 *
 * @param configurator - The Fusion modules configurator to register the AG Grid module on.
 * @param callback - Optional callback to customise the AG Grid configuration.
 */
export const enableAgGrid = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  configurator: IModulesConfigurator<any, any>,
  callback?: AgGridBuilderCallback,
): void => {
  configurator.addConfig({
    module,
    configure: async (config) => {
      if (callback) {
        return Promise.resolve(callback(config));
      }
    },
  });
};

export default module;

declare module '@equinor/fusion-framework-module' {
  /** Extends the Fusion module registry with the AG Grid module. */
  interface Modules {
    /** AG Grid module — provides license, theme, and module registration. */
    agGrid: AgGridModule;
  }
}
