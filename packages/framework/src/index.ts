/**
 * Entry point for `@equinor/fusion-framework` — the core initialization
 * package of Fusion Framework.
 *
 * @remarks
 * Re-exports the {@link FrameworkConfigurator} (used to configure framework
 * modules before initialization), the {@link init} function (used to
 * bootstrap the framework), and all public type aliases that describe
 * the resulting module graph.
 *
 * @packageDocumentation
 */

import type { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';
import type { Fusion } from './types.js';

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    /**
     * Dispatched after all framework modules have been initialized and the
     * global `window.Fusion` reference has been set.
     */
    onFrameworkLoaded: FrameworkEvent<FrameworkEventInit<Fusion>>;
  }
}

declare global {
  interface Window {
    /** Global Fusion instance, set during {@link init}. */
    Fusion: Fusion;
  }
}

export {
  FrameworkConfigurator,
  /**
   * @deprecated Use {@link FrameworkConfigurator} instead.
   */
  FrameworkConfigurator as FusionConfigurator,
} from './FrameworkConfigurator';

export type { FusionModules, FusionModulesInstance, Fusion, FusionRenderFn } from './types';

export { default, init } from './init';
