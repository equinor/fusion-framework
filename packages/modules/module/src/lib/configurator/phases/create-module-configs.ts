// biome-ignore-all lint/suspicious/noExplicitAny: internal type-erased dispatch — the configure phase coordinates opaque module configs without knowing their concrete shapes
/* eslint-disable @typescript-eslint/no-explicit-any */
import { from, lastValueFrom } from 'rxjs';
import { mergeMap, reduce } from 'rxjs/operators';

import { ModuleEventLevel, type AnyModule, type ModuleEvent } from '../../../types.js';
import type { ModulesConfiguratorConfigCallback } from '../types.js';
import { ModuleConfiguratorEventName } from '../module-configurator-event-name.js';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afterConfiguration: ((config: any) => void | Promise<void>)[];
  /**
   * Post-init callbacks — mutable array shared with the configurator.
   * Modules can push their own hooks via `config.onAfterInit`.
   * Typed as `any` — same rationale as `afterConfiguration`.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
 * @template TRef - Reference type forwarded to module configure hooks.
 * @throws Re-throws any error from a module's `configure` factory after emitting a failure event.
 * @internal
 */
export async function createModuleConfigs<TRef>(
  ctx: ConfigurePhaseContext<TRef>,
  ref?: TRef,
): Promise<any> {
  const { modules, afterConfiguration, afterInit, registerEvent } = ctx;

  // Run each module's configure factory concurrently and track timing/failures
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
    reduce<Record<string, unknown>, Record<string, unknown>>(
      (acc, module) => {
        // Merge each module's config object into the shared accumulator
        const merged = Object.assign(acc, module);
        return merged;
      },
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
