import { createContext } from 'react';
import type { Fusion } from '@equinor/fusion-framework';

/**
 * Internal React context that holds the current {@link Fusion} instance.
 *
 * @remarks
 * Consumers should not use this directly — prefer the {@link useFramework}
 * hook or the {@link FrameworkProvider} component.
 *
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const context = createContext<Fusion<any> | null>(null);

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
