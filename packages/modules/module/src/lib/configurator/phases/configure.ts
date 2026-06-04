// biome-ignore-all lint/suspicious/noExplicitAny: internal type-erased dispatch — the configure phase coordinates opaque module configs without knowing their concrete shapes
import { from, lastValueFrom } from 'rxjs';
import { mergeMap, reduce } from 'rxjs/operators';

import { ModuleEventLevel, type AnyModule, type ModuleEvent } from '../../../types.js';
import type { ModulesConfiguratorConfigCallback } from '../types.js';
import { ModuleConfiguratorEventName } from '../events.js';

/**
 * Context passed to the configure lifecycle phase.
 *
 * Bundles all mutable state the configure phase needs so the phase function
 * remains a pure function of its inputs and is testable in isolation.
 *
 * @template TRef - Reference type forwarded to module configure hooks.
 * @internal
 */
export interface ConfigurePhaseContext<TRef> {
  /** All registered modules to configure. */
  modules: AnyModule[];
  /** User-registered config mutation callbacks (from `addConfig`). */
  configs: ModulesConfiguratorConfigCallback<TRef>[];
  /**
   * Post-configure callbacks — mutable array shared with the configurator.
   * Modules can push their own hooks via `config.onAfterConfiguration`.
   * Typed as `any` — internal type-erased dispatch array; the phase never inspects
   * the config shape, it only forwards the value to each registered callback.
   */
  afterConfiguration: ((config: any) => void | Promise<void>)[];
  /**
   * Post-init callbacks — mutable array shared with the configurator.
   * Modules can push their own hooks via `config.onAfterInit`.
   * Typed as `any` — same rationale as `afterConfiguration`.
   */
  afterInit: ((instance: any) => void | Promise<void>)[];
  /** Emits a structured lifecycle event into the configurator's event stream. */
  registerEvent: (event: ModuleEvent) => void;
}

/**
 * Creates the raw module config map by calling each module's `configure` factory.
 *
 * Runs all module `configure(ref)` calls concurrently via `mergeMap` and
 * accumulates results into a single config object. The object is seeded with
 * `onAfterConfiguration` and `onAfterInit` helpers that allow modules to
 * register additional post-phase callbacks during configuration.
 *
 * @param ctx - The configure phase context.
 * @param ref - Optional reference forwarded to each module's configure factory.
 * @returns A promise resolving to the merged module config map.
 * @internal
 */
export async function createModuleConfigs<TRef>(
  ctx: ConfigurePhaseContext<TRef>,
  ref?: TRef,
): Promise<any> {
  const { modules, afterConfiguration, afterInit, registerEvent } = ctx;

  const config$ = from(modules).pipe(
    mergeMap(async (module) => {
      const configStart = performance.now();
      try {
        const configurator = await module.configure?.(ref);
        const configLoadTime = Math.round(performance.now() - configStart);
        registerEvent({
          level: ModuleEventLevel.Debug,
          name: ModuleConfiguratorEventName.ConfiguratorCreated,
          message: `Configurator created for ${module.name} in ${configLoadTime}ms`,
          properties: {
            moduleName: module.name,
            moduleVersion: module.version?.toString() || 'unknown',
            configLoadTime,
          },
          metric: configLoadTime,
        });
        return { [module.name]: configurator };
      } catch (err) {
        registerEvent({
          level: ModuleEventLevel.Error,
          name: ModuleConfiguratorEventName.ConfiguratorFailed,
          message: `Failed to create configurator for ${module.name}`,
          properties: {
            moduleName: module.name,
            moduleVersion: module.version?.toString() || 'unknown',
          },
          metric: Math.round(performance.now() - configStart),
          error: err,
        });
        throw err;
      }
    }),
    reduce(
      (acc, module) => Object.assign(acc, module),
      // Seed the config object with hooks so modules can register post-phase callbacks
      // during their own configure factory (a common pattern for cross-module wiring).
      {
        onAfterConfiguration(cb: (config: any) => void | Promise<void>) {
          afterConfiguration.push(cb);
        },
        onAfterInit(cb: (instance: any) => void | Promise<void>) {
          afterInit.push(cb);
        },
      },
    ),
  );

  return lastValueFrom(config$);
}

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
 * @internal
 */
export async function runPostConfigureHooks<TRef>(
  ctx: ConfigurePhaseContext<TRef>,
  config: any,
): Promise<void> {
  const { modules, afterConfiguration, registerEvent } = ctx;

  // Run each module's postConfigure hook; failures are isolated so one
  // failing module does not prevent others from completing post-configure.
  await Promise.allSettled(
    modules
      .filter((module) => !!module.postConfigure)
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
    await Promise.allSettled(afterConfiguration.map((x) => Promise.resolve(x(config))));
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

/**
 * Runs the full configure lifecycle phase for a set of modules.
 *
 * Orchestrates three sub-steps in order:
 * 1. {@link createModuleConfigs} — call each module's `configure(ref)` factory.
 * 2. Apply all user-registered config callbacks (`_configs`) sequentially.
 * 3. {@link runPostConfigureHooks} — call `postConfigure` and `afterConfiguration` hooks.
 *
 * @param ctx - The configure phase context.
 * @param ref - Optional reference forwarded through all configure hooks.
 * @returns A promise resolving to the fully configured module config map.
 */
export async function runConfigurePhase<TRef>(
  ctx: ConfigurePhaseContext<TRef>,
  ref?: TRef,
): Promise<any> {
  // Step 1: Create raw config objects for all registered modules
  const config = await createModuleConfigs<TRef>(ctx, ref);

  // Step 2: Apply all user-registered configuration callbacks concurrently.
  await Promise.all(ctx.configs.map((cb) => Promise.resolve(cb(config, ref))));

  // Step 3: Run module postConfigure hooks and afterConfiguration callbacks
  await runPostConfigureHooks(ctx, config);

  return config;
}
