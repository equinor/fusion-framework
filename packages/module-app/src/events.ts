import { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';
import { App } from './app/App';

import './app/events';

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap {
        onCurrentAppChanged: FrameworkEvent<FrameworkEventInit<{ next?: App; previous?: App }>>;
    }
}
