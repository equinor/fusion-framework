import type { AnyModule } from '@equinor/fusion-framework-module';

import type { FrameworkConfigurator } from './FrameworkConfigurator.js';
import type { Fusion, FusionModules } from './types.js';

/**
 * Initialize Fusion Framework from a fully-configured
 * {@link FrameworkConfigurator}.
 *
 * This is the main bootstrap entry point. It resolves all module
 * configurations, instantiates every registered module, assigns the
 * resulting {@link Fusion} object to `window.Fusion`, and dispatches
 * the `onFrameworkLoaded` event.
 *
 * @template TModules - Additional module descriptors beyond the built-in
 *   Fusion modules.
 * @template TRef - Reference object forwarded to modules during
 *   initialization (e.g. a parent framework instance).
 *
 * @param configurator - A {@link FrameworkConfigurator} that has been set up
 *   with the desired module configurations (MSAL, HTTP, service discovery,
 *   etc.).
 * @param ref - Optional reference object passed through to each module's
 *   initializer, typically used when an application framework is initialized
 *   within an outer host framework.
 * @returns A promise that resolves to the initialized {@link Fusion}
 *   instance containing all configured module instances.
 *
 * @example
 * ```typescript
 * import { FrameworkConfigurator, init } from '@equinor/fusion-framework';
 *
 * const configurator = new FrameworkConfigurator();
 * configurator.configureMsal({ clientId: '…', authority: '…' });
 *
 * const fusion = await init(configurator);
 * console.log(fusion.modules); // all instantiated modules
 * ```
 */
export const init = async <TModules extends Array<AnyModule>, TRef extends object>(
  configurator: FrameworkConfigurator<TModules>,
  ref?: TRef,
): Promise<Fusion<TModules>> => {
  const modules = await configurator.initialize<FusionModules>(ref);
  const fusion = {
    modules,
  };
  // Expose globally so portal shells and widgets can access the running instance
  window.Fusion = fusion as unknown as Fusion;
  modules.event.dispatchEvent('onFrameworkLoaded', { detail: fusion });

  return fusion as unknown as Fusion<TModules>;
};

export default init;
