import { concat, of } from 'rxjs';
import { defaultIfEmpty, first } from 'rxjs/operators';

import { hasNavigationModule } from '@equinor/fusion-framework-module-navigation/utils';

import type { ContextModuleConfig } from '../configurator';

import { type ContextPathResolveArgs, resolveContextFromPath } from './resolve-context-from-path';
import { hasContextModule } from './has-context-module';

/**
 * Creates a function to resolve the initial context for a Context Module.
 *
 * This factory function returns a resolver that determines the initial context by:
 * 1. Attempting to resolve context from the current URL path if navigation module is available
 * 2. Falling back to parent context if path resolution fails or navigation is unavailable
 * 3. Returning null if no context module is found
 *
 * @param options - Configuration options for context resolution
 * @param options.path - Optional path resolution configuration
 * @returns A function that resolves the initial context and returns it as an Observable
 *
 * The returned function:
 * - Uses the navigation module's pathname from current modules or parent reference
 * - Tries to resolve context from the path using the provided resolver
 * - Falls back to the parent context if path resolution fails
 * - Returns an Observable that emits null if no context is resolved
 * - Always completes after emitting exactly one value (using first())
 */
export const resolveInitialContext = (options?: {
  path?: ContextPathResolveArgs;
}): Required<ContextModuleConfig>['resolveInitialContext'] => {
  return (args) => {
    const { ref, modules } = args;

    // use the navigation module's pathname if available from current modules or fall back to the parent's
    const pathname = hasNavigationModule(modules)
      ? modules.navigation.path.pathname
      : hasNavigationModule(ref)
        ? ref.navigation.path.pathname
        : undefined;

    // Get reference context module for potential fallback
    const refContextModule = hasContextModule(ref) ? ref.context : undefined;

    // Determine the context module from either current modules or parent reference
    const contextModule = hasContextModule(modules) ? modules.context : refContextModule;

    // if no context module is found, return an observable that emits null
    if (!contextModule) return of(null);

    // initiate context resolve function from path
    const pathResolver = resolveContextFromPath(contextModule, options?.path);

    // observable for parent context
    const refContext$ = of(refContextModule?.currentContext ?? null);

    // if pathname is available, try resolving context from it.
    // if that fails, fall back to the parent context.
    const initialContext$ = pathname ? concat(pathResolver(pathname), refContext$) : refContext$;

    return initialContext$.pipe(
      // ensure the observable emits null if the source completes without emitting a value
      defaultIfEmpty(null),
      // ensure the observable completes after emitting the first value
      first(),
    );
  };
};

export default resolveInitialContext;
