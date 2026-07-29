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
// biome-ignore lint/suspicious/noExplicitAny: `Fusion<any>` widens the context to accept a Fusion instance with any concrete module set
export const context = createContext<Fusion<any> | null>(null);
