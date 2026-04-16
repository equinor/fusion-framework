import { BaseConfigBuilder } from '@equinor/fusion-framework-module';
import type { ConfigBuilderCallback, ConfigBuilderCallbackArgs } from '@equinor/fusion-framework-module';
import { from } from 'rxjs';
import type { ObservableInput } from 'rxjs';
import { mergeMap, toArray } from 'rxjs';

import {
  createFusionStrategy,
  createFusionEmbedStrategy,
  createFusionIndexStrategy,
  createFusionModelStrategy,
} from './lib/strategies/index.js';
import type { Strategy } from './lib/strategies/types.js';
import type { IAIConfigurator, AIModuleConfig } from './AIConfigurator.interface.js';

export type { AIModuleConfig };

/**
 * @deprecated Use {@link AIModuleConfig} instead.
 * @see {@link AIModuleConfig}
 */
export type AiConfig = AIModuleConfig;

/**
 * Configuration builder for the Fusion AI module.
 *
 * Registers one default strategy per capability (model, embed, index), each backed
 * by Fusion service discovery and MSAL authentication.  Call {@link addStrategy} to
 * register additional or custom strategies alongside the defaults.
 *
 * @example
 * ```typescript
 * enableAI(config, (ai) => {
 *   // Replace the default model strategy with a custom one.
 *   ai.addStrategy(myCustomModelStrategy);
 * });
 * ```
 */
export class AiConfigurator extends BaseConfigBuilder<AIModuleConfig> implements IAIConfigurator {
  #strategies: ConfigBuilderCallback<Strategy>[] = [];

  /**
   * Creates a new `AiConfigurator` and registers the three default Fusion
   * strategies (model, embed, index) backed by service discovery and MSAL.
   */
  constructor() {
    super();

    // Wire the strategy array into the base config builder so it is resolved
    // when createConfigAsync is called.  The closure captures #strategies by
    // reference, so strategies added via addStrategy() after construction are
    // included at build time.
    this._set(
      'strategies',
      (args: ConfigBuilderCallbackArgs): ObservableInput<Strategy[]> =>
        from(this.#strategies).pipe(
          mergeMap((cb) => from(cb(args) as ObservableInput<Strategy>)),
          toArray(),
        ),
    );

    // Register the three default Fusion-backed strategies.
    this.addStrategy(createFusionStrategy(createFusionModelStrategy));
    this.addStrategy(createFusionStrategy(createFusionEmbedStrategy));
    this.addStrategy(createFusionStrategy(createFusionIndexStrategy));
  }

  /**
   * Register a custom or additional strategy with the configurator.
   *
   * Pass a strategy instance for eager initialisation, or a
   * `ConfigBuilderCallback` factory for lazy initialisation during the module
   * initialise phase.  Multiple strategies of the same {@link STRATEGY_TYPE} can
   * coexist; {@link AiProvider} selects by name when `useModel`, `useEmbed`, or
   * `useIndex` is called.
   *
   * @param strategy - A strategy instance or async factory callback.
   * @returns `this` for fluent chaining.
   *
   * @example
   * ```typescript
   * enableAI(config, (ai) => {
   *   ai.addStrategy(createFusionStrategy(myCustomIndexStrategy));
   * });
   * ```
   */
  addStrategy(strategy: Strategy | ConfigBuilderCallback<Strategy>): this {
    if (typeof strategy === 'function') {
      this.#strategies.push(strategy);
    } else {
      this.#strategies.push(async () => strategy);
    }
    return this;
  }
}
