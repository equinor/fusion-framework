import { type ModulesInstance } from '@equinor/fusion-framework-module';
import { type ContextModule } from '../module';
import { type ContextModuleConfig } from '../configurator';
import { concat, EMPTY, first, of } from 'rxjs';

import { type ContextPathResolveArgs, resolveContextFromPath } from './resolve-context-from-path';
import { type NavigationModule } from '@equinor/fusion-framework-module-navigation';

/**
 * Resolves the initial context from the parent module.
 *
 * @param ref - The reference to the module and its associated modules.
 * @returns An Observable of the resolved initial context, or EMPTY if no context is found.
 * @throws Will throw an error if the reference does not support context.
 */
export const resolveContextFromParent: ContextModuleConfig['resolveInitialContext'] = ({ ref }) => {
    const parentContext = (ref as ModulesInstance<[ContextModule]>)?.context;
    // Check if the parent has a context module
    if (!parentContext) {
        throw Error('resolveContextFromNavigation: ref does not support context!');
    }
    // Return the current context from the parent or empty if the parent does not have a context
    return parentContext.currentContext ? of(parentContext.currentContext) : EMPTY;
};

/**
 * Resolves the initial context for a Fusion Framework context module.
 *
 * This function will first attempt to resolve the initial context based on the current path.
 * If unsuccessful, it will fallback to resolving the context from the parent module.
 *
 * @param options - Configuration options for resolving the context path.
 * @returns A function that takes a reference to the module and its associated modules,
 *          then returns an Observable of the resolved initial context.
 */
export const resolveInitialContext =
    (options?: {
        path?: ContextPathResolveArgs;
    }): Required<ContextModuleConfig>['resolveInitialContext'] =>
    ({ ref, modules }) => {
        const { context, navigation } = modules;
        // create a path resolver from the context module
        const pathResolver = resolveContextFromPath(context, options?.path);
        // use the current path from the navigation module, or fallback to the path from the parent navigation module
        const pathname =
            navigation?.path.pathname ??
            (ref as Partial<ModulesInstance<[NavigationModule]>>).navigation?.path.pathname;
        // try to resolve the context from the path, and if that fails, fallback to resolving the context from the parent
        return concat(
            pathname ? pathResolver(pathname) : EMPTY,
            resolveContextFromParent({ ref, modules }),
        ).pipe(first());
    };

export default resolveInitialContext;
