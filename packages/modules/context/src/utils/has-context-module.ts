import type { ModulesInstance } from '@equinor/fusion-framework-module';
import type { ContextModule } from '../module';

/**
 * Type guard function that checks if a reference contains a Context module.
 *
 * @param ref - The reference to check
 * @returns A type predicate indicating whether the reference is a ModulesInstance containing a ContextModule
 */
export function hasContextModule(ref: unknown): ref is ModulesInstance<[ContextModule]> {
  return typeof ref === 'object' && ref !== null && 'context' in ref;
}

export default hasContextModule;
