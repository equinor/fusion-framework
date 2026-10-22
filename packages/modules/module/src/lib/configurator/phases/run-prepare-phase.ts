import {
  ModuleEventLevel,
  type AnyModule,
  type ModuleConfigType,
  type ModuleEvent,
} from '../../../types.js';
import type { IModuleConfigurator } from '../IModuleConfigurator.js';
import { ModuleConfiguratorEventName } from '../module-configurator-event-name.js';

/**
 * Inputs for synchronous module preparation. Read-only, so a failed preparation cannot leave
 * the orchestrator's registration state half-updated.
 * @template TModule - Registered module descriptor.
 * @template TConfig - Configuration callback type associated with the registration.
 * @internal
 */
export interface PreparePhaseContext<
  TModule extends AnyModule,
  TConfig = ModuleConfigType<TModule>,
> {
  /** The registration being added. */
  registration: Pick<
    IModuleConfigurator<TModule, unknown, TConfig>,
    'module' | 'configurator' | 'prepare'
  >;
  /** Builders already prepared for this host, keyed by exact module descriptor. */
  configurators: ReadonlyMap<AnyModule, unknown>;
  /** Emits a structured lifecycle event into the configurator's event stream. */
  registerEvent: (event: ModuleEvent) => void;
}

/** The builder a registration prepared, which the orchestrator commits on success. */
export interface PreparedConfigurator {
  configurator: unknown;
}

/**
 * Rejects asynchronous preparation without leaving rejected promises unobserved.
 * @param result - Factory or preparation callback result.
 * @param moduleName - Module to identify in the preparation error.
 * @throws {TypeError} When preparation returned a promise or thenable.
 */
function assertSynchronous(result: unknown, moduleName: string): void {
  // Preparation must finish before control returns to host configuration.
  if (
    result !== null &&
    (typeof result === 'object' || typeof result === 'function') &&
    'then' in result &&
    typeof result.then === 'function'
  ) {
    // Invalid async work cannot be canceled, but its eventual rejection must remain visible.
    void Promise.resolve(result).catch(() =>
      console.warn(`Asynchronous preparation failed for module "${moduleName}"`),
    );
    throw new TypeError(`Preparation for module "${moduleName}" must be synchronous`);
  }
}

/**
 * Runs synchronous preparation at the registration boundary, without exposing stored builders.
 * Supplied builders bypass factories; opt-in factories run once per registered descriptor.
 * The ordinary configure phase later receives the same object.
 *
 * Preparation does not mutate orchestrator state: it returns the builder to commit, so a
 * failure leaves the previous registration untouched.
 *
 * @param ctx - Registration and the host's already prepared builders.
 * @returns The builder to commit, or `undefined` for an ordinary, unprepared registration.
 * @template TModule - Registered module descriptor.
 * @template TConfig - Configuration callback type associated with the registration.
 * @throws Rethrows preparation errors after emitting a lifecycle failure event.
 * @internal
 */
export function runPreparePhase<TModule extends AnyModule, TConfig = ModuleConfigType<TModule>>(
  ctx: PreparePhaseContext<TModule, TConfig>,
): PreparedConfigurator | undefined {
  const { registration, configurators, registerEvent } = ctx;
  const { module, configurator, prepare } = registration;
  // Ordinary registrations keep factory creation in the existing configure phase.
  if (configurator === undefined && !prepare) {
    return undefined;
  }
  try {
    // An explicit builder wins; otherwise reuse this descriptor's prepared builder.
    let builder: unknown = configurator ?? configurators.get(module);
    // Only opted-in, reference-independent factories may run before initialize(ref).
    if (builder === undefined) {
      // Never freeze an ordinary factory's missing parent reference by invoking it early.
      if (!module.prepare) {
        throw new TypeError(
          `Module "${module.name}" requires a prepare factory or an explicit configurator for preparation`,
        );
      }
      builder = module.prepare();
      assertSynchronous(builder, module.name);
    }
    // Registered callbacks receive their module's builder only within this lifecycle boundary.
    if (prepare) {
      assertSynchronous(prepare(builder as TConfig), module.name);
    }
    registerEvent({
      level: ModuleEventLevel.Debug,
      name: ModuleConfiguratorEventName.ConfiguratorPrepared,
      message: `Configuration prepared for ${module.name}`,
      properties: { moduleName: module.name },
    });
    return { configurator: builder };
  } catch (error) {
    registerEvent({
      level: ModuleEventLevel.Error,
      name: ModuleConfiguratorEventName.ConfiguratorPrepareError,
      message: `Configuration preparation failed for ${module.name}`,
      properties: { moduleName: module.name },
      error,
    });
    throw error;
  }
}
