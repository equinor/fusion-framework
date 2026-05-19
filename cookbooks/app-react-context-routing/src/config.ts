/**
 * Context routing strategy integration test app.
 *
 * This is NOT a minimal example — it is a comprehensive test bed that exercises
 * all routing modes (`query`, `path`, `custom`, `none`) with runtime strategy
 * switching. For a minimal context setup, see `app-react-context`.
 *
 * @module @equinor/fusion-framework-cookbook-app-react-context-routing
 */

import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { enableContext } from '@equinor/fusion-framework-react-module-context';
import { enableNavigation } from '@equinor/fusion-framework-module-navigation';
import { resolveInitialContext } from '@equinor/fusion-framework-module-context/utils';
import { from, map } from 'rxjs';

import { resolveContextMode, type ContextRoutingStrategy, type InitSource } from './utils/strategy';
import {
  extractContextIdFromQuery,
  extractCustomContextIdFromPath,
  extractPathStrategyContextIdFromPath,
  generateCustomPathFromContext,
} from './utils/context-path';

type GlobalWithDiagnostics = typeof globalThis & {
  __cookbookContextInitSource?: InitSource;
};

/**
 * Configures the context and navigation modules for the cookbook app.
 *
 * The routing strategy is determined once at startup from the
 * `?routingStrategy=` query parameter. Each strategy wires up a
 * different combination of path extractors, path generators, and
 * initial-context resolvers so developers can compare behaviour.
 */
export const configure: AppModuleInitiator = (configurator, conf) => {
  enableContext(configurator, (builder) => {
    const contextMode = resolveContextMode();
    const isCustomMode = contextMode === 'custom';
    const strategy: ContextRoutingStrategy =
      contextMode === 'query' || contextMode === 'custom' ? contextMode : 'path';
    const pathExtractor =
      contextMode === 'custom'
        ? extractCustomContextIdFromPath
        : contextMode === 'query'
          ? () => undefined
          : extractPathStrategyContextIdFromPath;

    builder.setResolveInitialContext((args) => {
      const resolver = resolveInitialContext();
      return from(resolver(args)).pipe(
        map((item) => {
          const navigationPath = args.modules.navigation?.path;
          const pathname = navigationPath?.pathname ?? '/';
          const search = navigationPath?.search ?? '';
          const queryId = extractContextIdFromQuery(search);
          const pathId = pathExtractor(pathname);

          let source: InitSource = 'parent-or-unknown';

          if (item?.id && queryId && strategy === 'query' && item.id === queryId) {
            source = 'query';
          } else if (item?.id && pathId && item.id === pathId) {
            source = isCustomMode ? 'custom' : 'path';
          }

          (globalThis as GlobalWithDiagnostics).__cookbookContextInitSource = source;

          return item;
        }),
      );
    });

    if (isCustomMode) {
      builder.setRoutingStrategy('path');
      builder.setContextPathExtractor(extractCustomContextIdFromPath);
      builder.setContextPathGenerator(generateCustomPathFromContext);
    } else if (contextMode === 'path' || contextMode === 'none') {
      builder.setContextPathExtractor(extractPathStrategyContextIdFromPath);
    }

    if (contextMode === 'path') {
      builder.setRoutingStrategy('path');
    }
    if (contextMode === 'query') {
      builder.setRoutingStrategy('query');
    }

    builder.setContextType(['projectmaster']);
  });

  enableNavigation(configurator, conf.env.basename);
};

export default configure;
