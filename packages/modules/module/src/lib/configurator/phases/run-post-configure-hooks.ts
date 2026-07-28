import { ModuleEventLevel } from '../../../types.js';
import { ModuleConfiguratorEventName } from '../module-configurator-event-name.js';
import type { ConfigurePhaseContext } from './create-module-configs.js';

/**
 * Runs the post-configure phase: calls each module's `postConfigure` hook and
 * then invokes all registered `afterConfiguration` callbacks.
 *
 * Module `postConfigure` failures are caught individually and emitted as
 * Warning events so one failing module cannot block others.
 *
 * @param ctx - The configure phase context.
 * @param config - The merged module config map produced by {@link createModuleConfigs}.
 * @returns A promise resolving when all post-configure hooks have settled.
 * @template TRef - Reference type forwarded to module configure hooks.
 * @internal
 */
export async function runPostConfigureHooks<TRef>(
  ctx: ConfigurePhaseContext<TRef>,
  // biome-ignore lint/suspicious/noExplicitAny: internal type-erased dispatch — the configure phase coordinates opaque module configs without knowing their concrete shapes
  config: any,
): Promise<void> {
  const { modules, afterConfiguration, registerEvent } = ctx;

  // Run each module's postConfigure hook; failures are isolated so one
  // failing module does not prevent others from completing post-configure.
  await Promise.allSettled(
    modules
      // Only process modules that define a postConfigure hook
      .filter((module) => !!module.postConfigure)
      // Call postConfigure on each module that defines the hook
      .map(async (module) => {
        try {
          const postConfigStart = performance.now();
          await module.postConfigure?.(config);
          registerEvent({
            level: ModuleEventLevel.Debug,
            name: ModuleConfiguratorEventName.ModulePostConfigured,
            message: `Module ${module.name} post-configured successfully`,
            properties: {
              moduleName: module.name,
              moduleVersion: module.version?.toString() || 'unknown',
              postConfigTime: Math.round(performance.now() - postConfigStart),
            },
          });
        } catch (err) {
          registerEvent({
            level: ModuleEventLevel.Warning,
            name: ModuleConfiguratorEventName.ModulePostConfigureError,
            message: `Module ${module.name} post-configure failed`,
            properties: {
              moduleName: module.name,
              moduleVersion: module.version?.toString() || 'unknown',
            },
            error: err,
          });
        }
      }),
  );

  // Skip the afterConfiguration hooks entirely when none are registered
  if (!afterConfiguration.length) return;

  // Run all registered afterConfiguration callbacks. These were added either
  // by addConfig's afterConfig or via config.onAfterConfiguration inside a
  // module's configure factory.
  try {
    registerEvent({
      level: ModuleEventLevel.Debug,
      name: ModuleConfiguratorEventName.PostConfigureHooks,
      message: `Post configure hooks [${afterConfiguration.length}] called`,
    });
    const postConfigHooksStart = performance.now();
    await Promise.allSettled(
      afterConfiguration
        // Invoke every registered afterConfiguration callback with the final config
        .map((x) => Promise.resolve(x(config))),
    );
    const postConfigHooksTime = Math.round(performance.now() - postConfigHooksStart);
    registerEvent({
      level: ModuleEventLevel.Debug,
      name: ModuleConfiguratorEventName.PostConfigureHooksComplete,
      message: 'Post configure hooks complete',
      properties: {
        count: afterConfiguration.length,
        postConfigHooksTime,
      },
      metric: postConfigHooksTime,
    });
  } catch (err) {
    registerEvent({
      level: ModuleEventLevel.Warning,
      name: ModuleConfiguratorEventName.PostConfigureHooksError,
      message: 'Post configure hook failed',
      error: err,
    });
  }
}

export default runPostConfigureHooks;
