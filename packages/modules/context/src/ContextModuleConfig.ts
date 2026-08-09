import type { AnyModuleInstance, ModuleInstance } from '@equinor/fusion-framework-module';
import type { ObservableInput } from 'rxjs';
import type { QueryCtorOptions } from '@equinor/fusion-query';

import type {
  ContextFilterFn,
  ContextItem,
  QueryContextParameters,
  RelatedContextParameters,
} from './types';
import type { GetContextParameters } from './client/ContextClient';
import type { IContextProvider } from './ContextProvider';

/**
 * Resolved configuration for the context module.
 *
 * Holds query clients, type filters, parent-connection settings, and
 * optional callbacks for validation, resolution, and path integration.
 * Produced by {@link ContextModuleConfigurator.createConfigAsync} after all
 * registered config builders have run.
 *
 * @see IContextModuleConfigurator — fluent API for populating this config.
 * @see ContextProvider — runtime consumer of this config.
 */
export interface ContextModuleConfig {
  /**
   * Query client options used to fetch, search, and resolve related context items.
   *
   * - `get` — retrieves a single context item by ID.
   * - `query` — searches context items by text and optional type filter.
   * - `related` — fetches context items related to a given item (used during resolution).
   */
  client: {
    get: QueryCtorOptions<ContextItem, GetContextParameters>;
    query: QueryCtorOptions<ContextItem[], QueryContextParameters>;
    related?: QueryCtorOptions<ContextItem[], RelatedContextParameters>;
  };

  /**
   * Allowed context type IDs (e.g. `['ProjectMaster', 'Facility']`).
   *
   * When set, {@link ContextProvider.validateContext} only accepts items
   * whose `type.id` matches one of these values (case-insensitive).
   */
  contextType?: string[];

  /**
   * Optional post-query filter applied to the result set returned by
   * {@link ContextProvider.queryContext}.
   */
  contextFilter?: ContextFilterFn;

  /**
   * Whether to connect the context module to a parent context module.
   *
   * When `true` (the default), the provider subscribes to the parent's
   * `currentContext$` and mirrors changes into its own state.
   *
   * @defaultValue `true`
   */
  connectParentContext?: boolean;

  /**
   * When `true`, skips resolving an initial context from the path or parent
   * during module post-initialization.
   */
  skipInitialContext?: boolean;

  /**
   * Extracts a context ID from a URL path segment.
   *
   * Used during initial context resolution and deep-link support.
   * If not provided, the default GUID-based extractor is used.
   *
   * @param path - The URL path to inspect.
   * @returns The extracted context ID, or `undefined` if none is found.
   */
  extractContextIdFromPath?: (path: string) => string | undefined;

  /**
   * Generates a URL path that embeds the given context item's ID.
   *
   * Used by navigation integrations to update the browser URL when
   * the context changes.
   *
   * @param context - The active context item.
   * @param path - The current URL path.
   * @returns The updated path, or `undefined` to leave it unchanged.
   */
  generatePathFromContext?: (context: ContextItem, path: string) => string | undefined;

  /**
   * Transforms a user search string and the configured context type into
   * the query parameters sent to the context API.
   *
   * Override this to customise how free-text searches are mapped to the
   * backend query contract.
   */
  contextParameterFn?: (args: {
    search: string;
    type: ContextModuleConfig['contextType'];
  }) => string | QueryContextParameters;

  /**
   * Custom context resolution strategy.
   *
   * Called with `this` bound to the {@link IContextProvider} when a context
   * item fails validation and the caller requests resolution.
   *
   * @param item - The context item to resolve, or `null`.
   * @returns An observable emitting the resolved context item.
   */
  resolveContext?: (
    this: IContextProvider,
    item: ContextItem | null,
  ) => ReturnType<IContextProvider['resolveContext']>;

  /**
   * Custom context validation strategy.
   *
   * Called with `this` bound to the {@link IContextProvider} to decide
   * whether a candidate context item is acceptable.
   *
   * @param item - The context item to validate, or `null`.
   * @returns `true` if the item is valid.
   */
  validateContext?: (
    this: IContextProvider,
    item: ContextItem | null,
  ) => ReturnType<IContextProvider['validateContext']>;

  /**
   * Resolves the initial context during module post-initialization.
   *
   * The default implementation tries to extract a context ID from the
   * current navigation path, falling back to the parent provider's context.
   *
   * @param args - Module reference and instance map.
   * @returns An observable input emitting the initial context item, or void.
   */
  resolveInitialContext?: (args: {
    // biome-ignore lint/suspicious/noExplicitAny: `AnyModuleInstance | any` intentionally widens to accept any module instance shape for `ref`
    ref?: AnyModuleInstance | any;
    modules: ModuleInstance;
    // biome-ignore lint/suspicious/noConfusingVoidType: `void` here relies on TypeScript's special-cased "void-returning callback accepts any return value" behavior — `undefined` would break assignability of resolver functions that only conditionally emit a `ContextItem`
  }) => ObservableInput<ContextItem | void>;
}
