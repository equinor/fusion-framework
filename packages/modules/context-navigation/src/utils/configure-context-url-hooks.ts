import type { ContextModuleConfig } from '@equinor/fusion-framework-module-context';
import { buildContextUrlForStrategy, resolveContextIdFromUrl } from './url-utils';

interface ContextUrlHooksBuilder {
  setContextPathGenerator(fn: ContextModuleConfig['generatePathFromContext']): void;
  setContextPathExtractor(fn: ContextModuleConfig['extractContextIdFromPath']): void;
}

/**
 * Configures strategy-aware path generator and query-first path extractor
 * on the context module builder.
 *
 * @example
 * ```ts
 * import { configureContextUrlHooks } from '@equinor/fusion-framework-module-context-navigation/utils';
 *
 * enableContext(configurator, (builder) => {
 *   configureContextUrlHooks(builder);
 *   builder.setContextType(['ProjectMaster']);
 * });
 * ```
 */
export const configureContextUrlHooks = (builder: ContextUrlHooksBuilder): void => {
  builder.setContextPathGenerator((context, path, routingStrategy) =>
    buildContextUrlForStrategy(context?.id, path, routingStrategy),
  );
  builder.setContextPathExtractor((path) => resolveContextIdFromUrl(path));
};
