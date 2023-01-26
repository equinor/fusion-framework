import { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';
import { App } from './app/App';

import './app/events';

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap {
        /** fired when the current selected application changes */
        onCurrentAppChanged: FrameworkEvent<
            FrameworkEventInit<{
                /** current application  */
                next?: App;
                /** previous application */
                previous?: App;
            }>
        >;
    }
}
