import type { Fusion } from '@equinor/fusion-framework';
import type { AnyModule } from '@equinor/fusion-framework-module';
import {
  enableTelemetry,
  type MetadataExtractor,
} from '@equinor/fusion-framework-module-telemetry';

import type { AppConfigurator } from './AppConfigurator';
import type { AppModulesInstance, AppEnv } from './types';

/**
 * Runs the telemetry wiring, the caller's configuration callback and module
 * initialization against an already constructed configurator.
 *
 * @remarks
 * Extracted so `mockAppModules` (`@equinor/fusion-framework-app/mock`) can drive the
 * exact same pipeline against an `AppMockConfigurator` instead of reimplementing
 * it — the same way `FrameworkConfigurator` and `FrameworkMockConfigurator`
 * share the framework's `init`.
 *
 * @param configurator - The (real or mock) app configurator to run the pipeline on.
 * @param cb - Configuration callback invoked before module initialization, or `undefined` to skip it.
 * @param args - Object containing the Fusion instance and the application environment.
 * @returns The fully initialized application module instance.
 * @template TModules - Application module descriptors beyond the default set.
 * @template TRef - The parent Fusion instance type.
 * @template TEnv - The application environment descriptor.
 * @template TConfigurator - The (real or mock) `AppConfigurator` subclass driving the pipeline.
 */
export async function initializeAppModules<
  TModules extends Array<AnyModule> | never,
  TRef extends Fusion = Fusion,
  TEnv extends AppEnv = AppEnv,
  // Widened beyond the plain `AppConfigurator` so callers such as `mockAppModules` can
  // drive the same pipeline against a subclass (e.g. `AppMockConfigurator`) and have `cb`
  // typed against that subclass rather than the base `IAppConfigurator` interface.
  TConfigurator extends AppConfigurator<TModules, TRef['modules'], TEnv> = AppConfigurator<
    TModules,
    TRef['modules'],
    TEnv
  >,
>(
  configurator: TConfigurator,
  cb: ((configurator: TConfigurator, args: { fusion: TRef; env: TEnv }) => void | Promise<void>) | undefined,
  args: { fusion: TRef; env: TEnv },
): Promise<AppModulesInstance<TModules>> {
  const { fusion } = args;

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
  // Type cast is safe because AppConfigurator.initialize() returns the exact module
  // instance that was registered and configured above. The intermediate 'unknown'
  // cast is necessary due to TypeScript's generic inference limitations with the
  // configurator's initialization chain, but the runtime value is guaranteed to match.
  const modules: AppModulesInstance<TModules> = (await configurator.initialize(
    args.fusion.modules,
  )) as unknown as AppModulesInstance<TModules>;

  // Dispatch app modules loaded event for app lifecycle tracking
  // TODO(#5061): remove check after fusion-cli is updated (app module is not enabled in fusion-cli)
  if (args.env.manifest?.appKey) {
    modules.event.dispatchEvent('onAppModulesLoaded', {
      detail: { appKey: args.env.manifest.appKey, manifest: args.env.manifest, modules },
    });
  }
  return modules;
}

export default initializeAppModules;
