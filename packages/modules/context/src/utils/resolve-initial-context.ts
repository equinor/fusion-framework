import { ModulesInstance } from '@equinor/fusion-framework-module';
import { ContextModule } from '../module';
import { type ContextModuleConfig } from '../configurator';
import { concat, EMPTY, first, of } from 'rxjs';

import { ContextPathResolveArgs, resolveContextFromPath } from './resolve-context-from-path';

export const resolveContextFromParent: ContextModuleConfig['resolveInitialContext'] = ({ ref }) => {
    const parentContext = (ref as ModulesInstance<[ContextModule]>)?.context;
    if (!parentContext) {
        throw Error(['resolveContextFromNavigation', 'ref does not support context!'].join('\n'));
    }
    return parentContext.currentContext ? of(parentContext.currentContext) : EMPTY;
};

export const resolveInitialContext =
    (options?: {
        path?: ContextPathResolveArgs;
    }): Required<ContextModuleConfig>['resolveInitialContext'] =>
    ({ ref, modules }) => {
        const { context, navigation } = modules;
        const pathResolver = resolveContextFromPath(context, options?.path);
        return concat(
            navigation ? pathResolver(navigation.path.pathname) : EMPTY,
            resolveContextFromParent({ ref, modules }),
        ).pipe(first());
    };

export default resolveInitialContext;
