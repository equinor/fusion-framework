import type { ModulesInstance } from '@equinor/fusion-framework-module';
import type { ContextModule } from '../module';
import type { ContextModuleConfig } from '../configurator';
import { concat, EMPTY, of, take } from 'rxjs';

/**
 * Resolves the initial context from the parent module.
 *
 * @param ref - parent modules.
 * @returns An Observable of the resolved initial context.
 */
export const resolveContextFromParent: ContextModuleConfig['resolveInitialContext'] = ({ ref }) => {
  const parentContext = (ref as ModulesInstance<[ContextModule]>)?.context;
  if (!parentContext) {
    // No parent context available — either portal level or parent lacks context module.
    return EMPTY;
  }
  // return the current context from the parent or empty if the parent does not have a context
  return parentContext.currentContext ? of(parentContext.currentContext) : EMPTY;
};

/**
 * Resolves the initial context for a Fusion Framework context module.
 *
 * Attempts to resolve the initial context from the parent context provider.
 * URL-based resolution is handled by the context-navigation plugin.
 *
 * @returns A function that accepts the module's reference and modules, and returns an Observable of the resolved initial context.
 */
export const resolveInitialContext =
  (): Required<ContextModuleConfig>['resolveInitialContext'] =>
  ({ ref, modules }) => {
    // Resolve from parent context if available.
    // URL-based resolution is handled by the context-navigation plugin.
    return concat(resolveContextFromParent({ ref, modules })).pipe(take(1));
  };

export default resolveInitialContext;
