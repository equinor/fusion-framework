import {
  upsertContextSegmentInAppPath,
  stripContextSegmentFromAppPath,
} from '../utils/navigation-helpers';
import type {
  AppSwitchStrategyInput,
  ContextChangeStrategyInput,
  IContextNavigationStrategyAdapter,
} from './contracts';

/**
 * Modern path strategy — context id as 3rd URL segment.
 * Preserves deeper sub-routes on context change.
 */
export const pathStrategyAdapter: IContextNavigationStrategyAdapter = {
  mode: 'path',
  onContextChange(input: ContextChangeStrategyInput) {
    if (input.newContext === null) {
      const extractedContextId = input.activeContextProvider?.extractContextIdFromPath?.(
        input.portalPathname,
      );
      return {
        pathname: stripContextSegmentFromAppPath(input.portalPathname, extractedContextId),
        search: input.portalSearch ?? '',
      };
    }
    return {
      pathname: upsertContextSegmentInAppPath(input.portalPathname, input.newContext.id),
      search: input.portalSearch ?? '',
    };
  },
  onAppSwitch(input: AppSwitchStrategyInput) {
    return {
      pathname: upsertContextSegmentInAppPath(input.newPathname, input.contextIdToCarry),
      search: input.newSearch,
    };
  },
};
