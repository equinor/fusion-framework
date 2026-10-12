import type { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';
import type { App } from './app/App.js';

import './app/events.js';

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
