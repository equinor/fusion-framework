import { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';
import type { Fusion } from './types';

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

export { FusionConfigurator } from './configurator';
export * from './types';

export { default, init } from './init';
