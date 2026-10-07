import type { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';
import type { HelpCenterOpenEventDetail } from './useHelpCenter.js';

export { useHelpCenter } from './useHelpCenter.js';
export type { HelpCenterOpenEventDetail } from './useHelpCenter.js';

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    '@Portal::FusionHelp::open': FrameworkEvent<FrameworkEventInit<HelpCenterOpenEventDetail>>;
  }
}
