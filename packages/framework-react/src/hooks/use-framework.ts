import { useContext } from 'react';
import type { Fusion } from '@equinor/fusion-framework';
import { context } from '../context';
/**
 * @example
 * ```ts
 * const useSometing = () => {
 *  const fusion = useFramework();
 *  return fusion.something;
 * }
 * ```
 */
export const useFramework = (): Fusion => {
    let framework = useContext(context);
    if (!framework) {
        console.warn('could not locate fusion in context!');
    }
    framework ??= window.Fusion;
    if (!framework) {
        console.error('Could not load framework, might not be initiated?');
    }
    return framework;
};
