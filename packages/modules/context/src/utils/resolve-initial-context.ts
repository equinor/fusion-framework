import type { ModulesInstance } from '@equinor/fusion-framework-module';
import type { ContextModule } from '../module';
import type { ContextModuleConfig } from '../configurator';
import { concat, EMPTY, first, of, type Observable } from 'rxjs';
import type { ContextRoutingStrategy } from '../types';
import type { ContextItem } from '../types';

import { type ContextPathResolveArgs, resolveContextFromPath } from './resolve-context-from-path';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';

type ContextQueryResolveArgs = {
  key?: string;
};

/**
 * Builds context resolution observables in strategy-specific priority order.
 *
 * Query strategy tries query first and then path. Path/custom strategies try
 * path first and then query. Parent context fallback is applied by caller.
 *
 * @param strategy - Routing strategy controlling resolution order.
 * @param queryResolver$ - Query-based context resolution observable.
 * @param pathResolver$ - Path-based context resolution observable.
 * @returns Ordered resolver observables for `concat`.
 */
const resolveContextCandidates = (
  strategy: ContextRoutingStrategy,
  queryResolver$: Observable<ContextItem>,
  pathResolver$: Observable<ContextItem>,
): Observable<ContextItem>[] =>
  strategy === 'query' ? [queryResolver$, pathResolver$] : [pathResolver$, queryResolver$];

/**
 * Extracts a context identifier from query-string input.
 *
 * @param search - URL query-string (with or without leading `?`).
 * @param key - Query key to resolve from.
 * @returns Context identifier when present.
 */
const extractContextIdFromQuery = (search: string, key = '$contextId'): string | undefined => {
  const query = search.startsWith('?') ? search.slice(1) : search;
  const params = new URLSearchParams(query);
  return params.get(key) ?? undefined;
};

/**
 * Resolves the initial context from the parent module.
 *
 * @param ref - parent modules.
 * @returns An Observable of the resolved initial context.
 */
export const resolveContextFromParent: ContextModuleConfig['resolveInitialContext'] = ({ ref }) => {
  const parentContext = (ref as ModulesInstance<[ContextModule]>)?.context;
  // check if the parent has context module
  if (!parentContext) {
    throw Error(['resolveContextFromNavigation', 'ref does not support context!'].join('\n'));
  }
  // return the current context from the parent or empty if the parent does not have a context
  return parentContext.currentContext ? of(parentContext.currentContext) : EMPTY;
};

/**
 * Resolves the initial context for a Fusion Framework context module.
 *
 * will try to resolve the initial context from the path, and if that fails, it will try to resolve the context from the parent.
 *
 * @param options - Optional configuration for resolving the context path.
 * @returns A function that accepts the module's reference and modules, and returns an Observable of the resolved initial context.
 */
export const resolveInitialContext =
  (options?: {
    strategy?: ContextRoutingStrategy;
    query?: ContextQueryResolveArgs;
    path?: ContextPathResolveArgs;
  }): Required<ContextModuleConfig>['resolveInitialContext'] =>
  ({ ref, modules }) => {
    const { context, navigation } = modules;
    const strategy = options?.strategy ?? 'path';

    // create a path resolver from the context module
    const pathResolver = resolveContextFromPath(context, options?.path);
    // use the path from the navigation module, or the path from the parent navigation module
    const navigationPath =
      navigation?.path ?? (ref as Partial<ModulesInstance<[NavigationModule]>>).navigation?.path;
    const pathname =
      navigationPath?.pathname ??
      navigation?.path.pathname ??
      (ref as Partial<ModulesInstance<[NavigationModule]>>).navigation?.path.pathname;

    const search = navigationPath?.search;
    const queryContextId = search
      ? extractContextIdFromQuery(search, options?.query?.key)
      : undefined;
    const queryResolver$ = queryContextId
      ? context.contextClient.resolveContext(queryContextId)
      : EMPTY;

    const pathResolver$ = pathname ? pathResolver(pathname) : EMPTY;

    // Resolve from both query and path (strategy-ordered), then fall back to parent.
    return concat(
      ...resolveContextCandidates(strategy, queryResolver$, pathResolver$),
      resolveContextFromParent({ ref, modules }),
    ).pipe(first());
  };

export default resolveInitialContext;
