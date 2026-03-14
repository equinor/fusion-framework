/**
 * Fusion Framework module for AG Grid.
 *
 * Provides configuration, theming, licensing, and module registration for AG Grid
 * within Fusion applications and portals.
 *
 * @remarks
 * Import {@link enableAgGrid} to register the AG Grid module with a Fusion configurator.
 * Use {@link AgGridConfigurator} to customise license keys, themes, and AG Grid modules.
 * Use {@link AgGridProvider} to access the resolved AG Grid configuration at runtime.
 *
 * @packageDocumentation
 */

export { AgGridConfigurator } from './AgGridConfigurator';
export { AgGridProvider, type IAgGridProvider } from './AgGridProvider';
export {
  enableAgGrid,
  type AgGridModule,
  type AgGridBuilderCallback,
  module as default,
} from './module';
