// biome-ignore-all lint/suspicious/noExplicitAny: internal type-erased dispatch — the post-initialize phase forwards opaque instances without inspecting their concrete shapes
import { EMPTY, from, lastValueFrom } from 'rxjs';
import { catchError, defaultIfEmpty, filter, mergeMap, tap } from 'rxjs/operators';

import { ModuleEventLevel, type AnyModule, type ModuleEvent } from '../../../types.js';
import { ModuleConfiguratorEventName } from '../events.js';

/**
 * Context passed to the post-initialize lifecycle phase.
 *
 * Bundles all mutable state the post-initialize phase needs so the phase
 * function remains a pure function of its inputs and is testable in isolation.
 *
 * @internal
 */
export interface PostInitializePhaseContext {
  /** All registered modules — only those with `postInitialize` are processed. */
  modules: AnyModule[];
  /** Post-init callbacks registered via `addConfig` afterInit or `onInitialized`. */
  afterInit: ((instance: any) => void | Promise<void>)[];
  /** Emits a structured lifecycle event into the configurator's event stream. */
  registerEvent: (event: ModuleEvent) => void;
}

/**
 * Runs the post-initialize lifecycle phase for all registered modules.
 *
 * Executes two sub-steps in order:
 * 1. Calls each module's `postInitialize` hook (if defined) concurrently.
 *    Individual failures are caught and emitted as Warning events so one
 *    failing module cannot block others.
 * 2. Runs all registered `afterInit` callbacks concurrently via `Promise.allSettled`.
 *
 * @param ctx - The post-initialize phase context.
 * @param instance - The sealed module instance map produced by the initialize phase.
 * @param ref - Optional reference forwarded to each module's `postInitialize` call.
 * @returns A promise resolving when all post-initialize hooks and callbacks have settled.
 */
export async function runPostInitializePhase(
  ctx: PostInitializePhaseContext,
  instance: Record<string, unknown>,
  ref?: unknown,
): Promise<void> {
  const { modules, afterInit, registerEvent } = ctx;

  registerEvent({
    level: ModuleEventLevel.Debug,
    name: ModuleConfiguratorEventName.ConfiguratorPostInitializeStart,
    message: `Post-initializing all modules [${Object.keys(instance).length}]`,
    properties: { modules: Object.keys(instance).join(', ') },
  });

  // Run postInitialize hooks for modules that declare them. Failures are caught
  // per-module via catchError so one failure does not abort the others.
  const postInitialize$ = from(modules).pipe(
    filter((module): module is Required<AnyModule> => !!module.postInitialize),
    tap((module) => {
      registerEvent({
        level: ModuleEventLevel.Debug,
        name: ModuleConfiguratorEventName.ModulePostInitializeStart,
        message: `Module ${module.name} is being post-initialized`,
        properties: {
          moduleName: module.name,
          moduleVersion: module.version?.toString() || 'unknown',
        },
      });
    }),
    mergeMap((module) => {
      const postInitStart = performance.now();
      return from(
        module.postInitialize({
          ref,
          modules: instance,
          instance: instance[module.name],
        }),
      ).pipe(
        tap(() => {
          const postInitTime = Math.round(performance.now() - postInitStart);
          registerEvent({
            level: ModuleEventLevel.Debug,
            name: ModuleConfiguratorEventName.ModulePostInitializeComplete,
            message: `Module ${module.name} has been post-initialized in ${postInitTime}ms`,
            metric: postInitTime,
            properties: {
              moduleName: module.name,
              moduleVersion: module.version?.toString() || 'unknown',
              postInitTime,
            },
          });
        }),
        defaultIfEmpty(null),
        catchError((err) => {
          registerEvent({
            level: ModuleEventLevel.Warning,
            name: ModuleConfiguratorEventName.ModulePostInitializeError,
            message: `Module ${module.name} post-initialize failed`,
            properties: {
              moduleName: module.name,
              moduleVersion: module.version?.toString() || 'unknown',
            },
            error: err,
          });
          // Swallow module-level errors — a failing postInitialize should not
          // prevent other modules from completing their post-initialize work.
          return EMPTY;
        }),
      );
    }),
    defaultIfEmpty(null),
  );

  const postInitStart = performance.now();
  await lastValueFrom(postInitialize$);
  const postInitTime = Math.round(performance.now() - postInitStart);

  registerEvent({
    level: ModuleEventLevel.Debug,
    name: ModuleConfiguratorEventName.PostInitializeComplete,
    message: `Post-initialization of all modules completed in ${postInitTime}ms`,
    properties: { modules: Object.keys(instance).join(', '), postInitTime },
    metric: postInitTime,
  });

  if (!afterInit.length) {
    registerEvent({
      level: ModuleEventLevel.Debug,
      name: ModuleConfiguratorEventName.PostInitializeCompleteNoHooks,
      message: 'Post-initialization complete',
      properties: { modules: Object.keys(instance).join(', '), postInitCompleteTime: postInitTime },
    });
    return;
  }

  // Run all registered afterInit callbacks. These were added either by
  // addConfig's afterInit or via onInitialized on the configurator.
  try {
    registerEvent({
      level: ModuleEventLevel.Debug,
      name: ModuleConfiguratorEventName.PostInitializeHooks,
      message: `Executing post-initialize hooks [${afterInit.length}]`,
      properties: { hooks: afterInit.map((x) => x.name || 'anonymous').join(', ') },
    });
    const afterInitStart = performance.now();
    await Promise.allSettled(afterInit.map((x) => Promise.resolve(x(instance))));
    const afterInitTime = Math.round(performance.now() - afterInitStart);
    registerEvent({
      level: ModuleEventLevel.Debug,
      name: ModuleConfiguratorEventName.PostInitializeHooksComplete,
      message: `Post-initialize hooks completed in ${afterInitTime}ms`,
      properties: {
        hooks: afterInit.map((x) => x.name || 'anonymous').join(', '),
        afterInitTime,
      },
      metric: afterInitTime,
    });
  } catch (err) {
    registerEvent({
      level: ModuleEventLevel.Warning,
      name: ModuleConfiguratorEventName.PostInitializeHooksError,
      message: 'Post-initialize hooks failed',
      properties: { hooks: afterInit.map((x) => x.name || 'anonymous').join(', ') },
      error: err,
    });
  }

  const postInitCompleteTime = Math.round(performance.now() - postInitStart);
  registerEvent({
    level: ModuleEventLevel.Debug,
    name: ModuleConfiguratorEventName.PostInitializeComplete,
    message: 'Post-initialization complete',
    properties: { modules: Object.keys(instance).join(', '), postInitCompleteTime },
  });
}
