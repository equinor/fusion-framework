import type { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';
import type { HelpCenterOpenEventDetail } from './useHelpCenter';

export { useHelpCenter } from './useHelpCenter';
export type { HelpCenterOpenEventDetail };

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    '@Portal::FusionHelp::open': FrameworkEvent<FrameworkEventInit<HelpCenterOpenEventDetail>>;
  }
}
