import { AnyModule, ModuleKey, Modules, ModuleType } from '@equinor/fusion-framework-module';
import { useContext } from 'react';

import { moduleContext } from './context';

/** Hook for using modules in current context scope */
export const useModules = <T>(): T => useContext(moduleContext) as T;

/** Hook for use a single module in current context scope */
export const useModule = <
    T extends AnyModule = Modules[keyof Modules],
    TKey extends string = ModuleKey<T>
>(
    key: TKey
): ModuleType<TKey extends keyof Modules ? Modules[TKey] : T> => useModules<ModuleType<T>>()[key];

export default useModules;
