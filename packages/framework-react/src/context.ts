import { createContext, useContext } from 'react';
import type { Fusion } from '@equinor/fusion-framework';

export const context = createContext<Fusion | null>(null);

/**
 * Component for providing framework.
 *
 * @remarks
 * Should be created by {@link createFrameworkProvider}
 *
 * @example
 * ```tsx
 * import {FrameworkProvider} from '@equinor/fusion-framework-react';
 * export const Component = (args: React.PropsWithChildren<{framework: Fusion}>) => {
 *   return (
 *      <FrameworkProvider value={args.framework}>
 *        {args.children}
 *      </FrameworkProvider>
 *   );
 * }
 * ```
 */
export const FrameworkProvider = context.Provider;

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
