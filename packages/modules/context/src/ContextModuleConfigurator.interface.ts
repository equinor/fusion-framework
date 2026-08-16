import type { Modules, ModuleType } from '@equinor/fusion-framework-module';
import type { QueryCtorOptions, QueryFn } from '@equinor/fusion-query';

import type { ContextModuleConfig } from './ContextModuleConfig';
import type { ContextItem, QueryContextParameters, RelatedContextParameters } from './types';
import type { GetContextParameters } from './client/ContextClient';

/**
 * Callback passed to {@link IContextModuleConfigurator.addConfigBuilder}.
 *
 * Receives the {@link IContextModuleConfigurator} itself and may use its
 * setter methods to populate the context module configuration. The
 * callback may be async.
 */
export type ContextConfigBuilderCallback = (
  builder: IContextModuleConfigurator,
) => void | Promise<void>;

/**
 * Public configurator contract for the context module.
 *
 * Consumers call {@link addConfigBuilder} to register one or more
 * {@link ContextConfigBuilderCallback} functions that will run during
 * module initialization to populate the {@link ContextModuleConfig}, using
 * the fluent setter methods declared below.
 */
export interface IContextModuleConfigurator {
  /**
   * Registers a configuration callback that receives this configurator.
   *
   * Multiple builders can be added; they execute sequentially against the
   * same configurator instance, so later calls win when they touch the
   * same field.
   *
   * @param init - Builder callback invoked during module initialization.
   */
  addConfigBuilder: (init: ContextConfigBuilderCallback) => void;

  /**
   * Requires a module instance by its registered key or name.
   *
   * Only resolvable from within a {@link ContextConfigBuilderCallback} —
   * throws if called before module initialization has started.
   *
   * @param module - The key or name of the module to resolve.
   * @returns A promise that resolves to the requested module instance.
   */
  requireInstance<TKey extends string = Extract<keyof Modules, string>>(
    module: TKey,
  ): Promise<ModuleType<Modules[TKey]>>;
  requireInstance<T>(module: string): Promise<T>;

  /**
   * Sets the context type for the current configuration.
   *
   * @param type - The context type to assign, as defined by `ContextModuleConfig['contextType']`.
   */
  setContextType(type: ContextModuleConfig['contextType']): void;

  /**
   * Sets the context filter function for the configuration.
   *
   * @param filter - A function that determines whether a context should be included, as defined by `ContextModuleConfig['contextFilter']`.
   */
  setContextFilter(filter: ContextModuleConfig['contextFilter']): void;

  /**
   * Sets the function or configuration used to connect to a parent context.
   *
   * @param connect - The function or configuration that defines how to connect to the parent context.
   */
  connectParentContext(connect: ContextModuleConfig['connectParentContext']): void;

  /**
   * Sets the function used to provide context parameters for the module configuration.
   *
   * @param fn - A function conforming to the `contextParameterFn` type defined in `ContextModuleConfig`.
   */
  setContextParameterFn(fn: ContextModuleConfig['contextParameterFn']): void;

  /**
   * Sets the function used to validate the context within the configuration.
   *
   * @param fn - A function that implements the `validateContext` signature from `ContextModuleConfig`.
   */
  setValidateContext(fn: ContextModuleConfig['validateContext']): void;

  /**
   * Sets the function used to resolve the context for the module configuration.
   *
   * @param fn - A function that defines how the context should be resolved, conforming to the `resolveContext` type from `ContextModuleConfig`.
   */
  setResolveContext(fn: ContextModuleConfig['resolveContext']): void;

  /**
   * Sets the function responsible for extracting the context ID from a given path.
   *
   * @param fn - A function that defines how to extract the context ID from a path.
   *             This function should match the type defined in `ContextModuleConfig['extractContextIdFromPath']`.
   */
  setContextPathExtractor(fn: ContextModuleConfig['extractContextIdFromPath']): void;

  /**
   * Sets the function responsible for generating a path from the context.
   *
   * @param fn - A function that takes a context and generates a corresponding path.
   */
  setContextPathGenerator(fn: ContextModuleConfig['generatePathFromContext']): void;

  /**
   * Sets the function used to resolve the initial context during module post-initialization.
   *
   * @param fn - A function that returns an observable input emitting the initial context item.
   *             The default resolver extracts a context ID from the navigation path, falling
   *             back to the parent provider's current context.
   */
  setResolveInitialContext(fn: ContextModuleConfig['resolveInitialContext']): void;

  /**
   * Sets the context client configuration for fetching context items.
   *
   * This method allows you to provide custom query functions or query constructor options
   * for retrieving single context items (`get`), querying multiple context items (`query`),
   * and optionally fetching related context items (`related`). Each query can be provided
   * as either a function or a configuration object. The expiration time for cached results
   * can also be specified.
   *
   * @param client - An object containing the query functions or options for `get`, `query`, and optionally `related` context items.
   * @param expire - Optional. The expiration time (in milliseconds) for cached query results. Defaults to 1 minute.
   */
  setContextClient(
    client: {
      get:
        | QueryFn<ContextItem, GetContextParameters>
        | QueryCtorOptions<ContextItem, GetContextParameters>;
      query:
        | QueryFn<ContextItem[], QueryContextParameters>
        | QueryCtorOptions<ContextItem[], QueryContextParameters>;
      related?:
        | QueryFn<ContextItem[], RelatedContextParameters>
        | QueryCtorOptions<ContextItem[], RelatedContextParameters>;
    },
    expire?: number,
  ): void;
}
