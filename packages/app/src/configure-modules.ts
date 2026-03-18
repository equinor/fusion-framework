import type { Fusion } from '@equinor/fusion-framework';
import type { AnyModule } from '@equinor/fusion-framework-module';
import {
  enableTelemetry,
  type MetadataExtractor,
} from '@equinor/fusion-framework-module-telemetry';

import { AppConfigurator } from './AppConfigurator';
import type { AppModulesInstance, AppModuleInitiator, AppEnv } from './types';

/**
 * Create an application module initializer for a Fusion application.
 *
 * `configureModules` is the primary entry point for setting up an application’s
 * module pipeline. It returns an async function that, when called with the Fusion
 * instance and the application environment, will:
 *
 * 1. Create an {@link AppConfigurator} with the provided environment.
 * 2. Wire up telemetry scoped to the application.
 * 3. Invoke the optional user-supplied configuration callback.
 * 4. Initialize all registered modules and dispatch an `onAppModulesLoaded` event.
 *
 * @template TModules - Additional application-specific modules to register.
 * @template TRef - The Fusion instance type, used as a configuration reference.
 * @template TEnv - The application environment descriptor (manifest, config, basename).
 *
 * @param cb - Optional configuration callback invoked before modules are initialized.
 *             Use this to register HTTP clients, enable bookmarks, or add custom modules.
 * @returns An async initializer function that accepts `{ fusion, env }` and resolves
 *          with the fully initialized application module instance.
 *
 * @example
 * ```ts
 * import { configureModules } from '@equinor/fusion-framework-app';
 *
 * const initialize = configureModules((configurator, { fusion, env }) => {
 *   configurator.useFrameworkServiceClient('my-service');
 * });
 *
 * // Later, during app bootstrap:
 * const modules = await initialize({ fusion, env });
 * ```
 */
export const configureModules =
  <
    TModules extends Array<AnyModule> | never,
    TRef extends Fusion = Fusion,
    TEnv extends AppEnv = AppEnv,
  >(
    cb?: AppModuleInitiator<TModules, TRef, TEnv>,
  ): ((args: { fusion: TRef; env: TEnv }) => Promise<AppModulesInstance<TModules>>) =>
  /**
   * Async initializer that bootstraps application modules.
   *
   * @param args - Object containing the Fusion instance and the application environment.
   * @param args.fusion - The active Fusion framework instance.
   * @param args.env - The application environment with manifest, config, and basename.
   * @returns The fully initialized application module instance.
   */
  async (args: { fusion: TRef; env: TEnv }): Promise<AppModulesInstance<TModules>> => {
    const { fusion } = args;

    // Create app configurator
    const configurator = new AppConfigurator<TModules, TRef['modules'], TEnv>(args.env);

    // Extract telemetry metadata from app manifest for tracking and debugging
    const metadataExtractor: MetadataExtractor = () => {
      return {
        fusion: {
          type: 'app-telemetry',
          app: {
            key: args.env.manifest?.appKey || 'unknown-app',
            version: args.env.manifest?.build?.version || 'unknown-version',
          },
        },
      };
    };

    // Enable telemetry collection for module configuration events
    // attachConfiguratorEvents automatically prefixes events with configurator class name
    enableTelemetry(configurator, {
      attachConfiguratorEvents: true,
      configure: (builder) => {
        builder.setMetadata(metadataExtractor);
        builder.setParent(fusion.modules.telemetry);
        // Scope telemetry to 'app' level for app-specific event filtering
        builder.setDefaultScope(['app']);
      },
    });

    // Allow user configuration callback to run before module initialization
    if (cb) {
      await Promise.resolve(cb(configurator, args));
    }
    const modules: AppModulesInstance<TModules> = (await configurator.initialize(
      args.fusion.modules,
      // TODO: type cast to unknown should not be needed in future
    )) as unknown as AppModulesInstance<TModules>;

    // Dispatch app modules loaded event for app lifecycle tracking
    // TODO - remove check after fusion-cli is updated (app module is not enabled in fusion-cli)
    if (args.env.manifest?.appKey) {
      modules.event.dispatchEvent('onAppModulesLoaded', {
        detail: { appKey: args.env.manifest.appKey, manifest: args.env.manifest, modules },
      });
    }
    return modules;
  };

export default configureModules;
