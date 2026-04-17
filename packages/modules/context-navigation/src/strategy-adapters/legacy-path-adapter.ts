import {
  upsertContextSegmentInAppPath,
  stripContextSegmentFromAppPath,
} from '../utils/navigation-helpers';
import { readContextIdFromAppPath } from '../utils/url-utils';
import type {
  AppSwitchStrategyInput,
  ContextChangeStrategyInput,
  IContextNavigationStrategyAdapter,
} from './contracts';

/**
 * Legacy path strategy adapter (context module < 8.0.0).
 *
 * Legacy apps always use path-based context URLs and ignore modern routing
 * strategy declarations. Version gate forces this mode before routingStrategy
 * is ever read.
 */
export const legacyPathStrategyAdapter: IContextNavigationStrategyAdapter = {
  mode: 'legacy',
  onContextChange(input: ContextChangeStrategyInput) {
    if (input.newContext === null) {
      const extractedContextId = input.activeContextProvider?.extractContextIdFromPath?.(
        input.portalPathname,
      );
      return {
        pathname: stripContextSegmentFromAppPath(input.portalPathname, extractedContextId),
        search: '',
      };
    }
    return {
      pathname: upsertContextSegmentInAppPath(input.portalPathname, input.newContext.id),
      search: input.portalSearch ?? '',
    };
  },
  onAppSwitch(input: AppSwitchStrategyInput) {
    const currentContextItem = input.activeContextProvider?.currentContext;
    const generatedLegacyPath =
      currentContextItem && currentContextItem.id === input.contextIdToCarry
        ? input.activeContextProvider?.generatePathFromContext?.(
            currentContextItem,
            input.newPathname,
          )
        : undefined;
    const generatedExtractedContextId = generatedLegacyPath
      ? input.activeContextProvider?.extractContextIdFromPath?.(generatedLegacyPath)
      : undefined;
    const generatedParsedContextId = generatedLegacyPath
      ? readContextIdFromAppPath(generatedLegacyPath)
      : undefined;

    // Only trust app-generated path when it is portal-shaped and carries
    // the context we want. Otherwise fallback to deterministic upsert.
    const safeLegacyPath =
      generatedLegacyPath &&
      generatedLegacyPath.startsWith('/apps/') &&
      (generatedExtractedContextId === input.contextIdToCarry ||
        generatedParsedContextId === input.contextIdToCarry)
        ? generatedLegacyPath
        : undefined;

    return {
      pathname:
        safeLegacyPath ?? upsertContextSegmentInAppPath(input.newPathname, input.contextIdToCarry),
      search: input.newSearch,
    };
  },
};
