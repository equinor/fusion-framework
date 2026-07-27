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
