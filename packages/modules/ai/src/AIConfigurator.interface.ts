import type { ConfigBuilderCallback } from '@equinor/fusion-framework-module';
import type { Strategy } from './lib/strategies/types.js';

/**
 * Configuration shape produced by the Fusion AI module builder.
 *
 * This is the resolved configuration object passed to {@link AiProvider}.
 * Consumer code typically does not interact with this type directly — use
 * {@link IAIConfigurator} to configure the module and {@link IAiProvider} to
 * consume it at runtime.
 */
export type AIModuleConfig = {
  /** Resolved strategies for model, embed, and index operations. */
  strategies: Strategy[];
};

/**
 * Public interface for the Fusion AI module configurator.
 *
 * Use this interface to reference the configurator in framework configuration
 * callbacks without depending on the concrete {@link AiConfigurator} class.
 *
 * @example
 * ```typescript
 * import { enableAI } from '@equinor/fusion-framework-module-ai';
 * import type { IAIConfigurator } from '@equinor/fusion-framework-module-ai';
 *
 * enableAI(config, (ai: IAIConfigurator) => {
 *   ai.addStrategy(myCustomEmbedStrategy);
 * });
 * ```
 */
export interface IAIConfigurator {
  /**
   * Register a strategy with the AI module configurator.
   *
   * Strategies can be provided as a ready-to-use instance (eager init) or as a
   * `ConfigBuilderCallback` factory that resolves the strategy during the module
   * initialise phase (lazy init).
   *
   * Multiple strategies of a given type can coexist; {@link AiProvider} selects
   * the active strategy by name when a method such as `useModel` is called.
   *
   * @param strategy - A strategy instance or async factory callback.
   * @returns `this` for fluent chaining.
   */
  addStrategy(strategy: Strategy | ConfigBuilderCallback<Strategy>): this;
}
