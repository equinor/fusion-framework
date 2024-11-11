import { createContext } from 'react';
import type { Fusion } from '@equinor/fusion-framework';

// biome-ignore  lint/suspicious/noExplicitAny: allowed in this case
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
