import type { Fusion } from '@equinor/fusion-framework';
import type { AnyModule } from '@equinor/fusion-framework-module';

import { useContext } from 'react';
import { context } from './context';
/**
 * React hook that returns the current Fusion Framework instance from context.
 *
 * @remarks
 * The hook first looks for a framework instance provided via
 * {@link FrameworkProvider}. If none is found it falls back to the global
 * `window.Fusion` object. A console warning / error is emitted when the
 * framework cannot be resolved.
 *
 * @template TModules - Tuple of additional module types expected on the
 *   framework instance (used for type-narrowing only).
 * @returns The active {@link Fusion} instance.
 *
 * @example
 * ```ts
 * const useMyService = () => {
 *   const fusion = useFramework();
 *   return fusion.modules.http.createClient('my-service');
 * };
 * ```
 */
export const useFramework = <TModules extends Array<AnyModule> = []>(): Fusion<TModules> => {
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

export default useFramework;
