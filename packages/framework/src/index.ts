import type { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';
import type { Fusion } from './types.js';

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    onFrameworkLoaded: FrameworkEvent<FrameworkEventInit<Fusion>>;
  }
}

declare global {
  interface Window {
    Fusion: Fusion;
  }
}

export {
  FrameworkConfigurator,
  /**
   * @deprecated use FrameworkConfigurator
   */
  FrameworkConfigurator as FusionConfigurator,
} from './FrameworkConfigurator';

export * from './types.js';

export { default, init } from './init';
