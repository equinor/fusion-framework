import { useContext } from 'react';

import { moduleContext } from './context';

/** Hook for using modules in current context scope */
export const useModules = <T>(): T => useContext(moduleContext) as T;

/** Hook for use a single module in current context scope */
export const useModule = <T, TKey extends keyof T = keyof T>(key: TKey): T[TKey] =>
    useModules<T>()[key];

export default useModules;
