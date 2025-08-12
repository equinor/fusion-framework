import type { ModulesInstance } from '@equinor/fusion-framework-module';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';

/**
 * Type guard function to check if an instance has the NavigationModule.
 *
 * @param ref - The instance to check for NavigationModule
 * @returns Boolean indicating if the instance has a NavigationModule
 *          and narrows the type to ModulesInstance<[NavigationModule]>
 */
export function hasNavigationModule(ref: unknown): ref is ModulesInstance<[NavigationModule]> {
  return typeof ref === 'object' && ref !== null && 'navigation' in ref;
}

export default hasNavigationModule;
