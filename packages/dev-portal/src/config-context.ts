/**
 * Dev-portal context module configuration.
 *
 * This module wires the context module's two URL hooks — the path generator
 * and the path extractor — to the dev-portal's URL conventions.
 *
 * All URL-shaping logic lives in `config-context-utils.ts`. This module only
 * maps those utilities onto the framework's builder API.
 *
 * See `config-context-app-navigation.ts` for the RxJS subscription that keeps
 * the URL updated as the active context changes at runtime.
 */

import type { ContextModuleConfig } from '@equinor/fusion-framework-module-context';
import {
  buildContextUrlForStrategy,
  resolveContextIdFromUrl,
} from '@equinor/fusion-framework-module-context-navigation-handler/utils';

/**
 * Minimal builder surface needed to configure dev-portal context URL behavior.
 */
interface DevPortalContextConfigBuilder {
  /**
   * Registers the path generator used for context-aware navigation.
   *
   * @param fn - Context path generator callback.
   */
  setContextPathGenerator(fn: ContextModuleConfig['generatePathFromContext']): void;
  /**
   * Registers the path extractor used for resolving context from URLs.
   *
   * @param fn - Context path extractor callback.
   */
  setContextPathExtractor(fn: ContextModuleConfig['extractContextIdFromPath']): void;
}

/**
 * Configures dev-portal context routing helpers on the context builder.
 *
 * Passed directly as the builder callback to `enableContext()` in `config.ts`.
 * Wires two hooks:
 *
 * **Path generator** — called whenever the context module needs to produce a
 * URL that encodes a context id (e.g. during app-switch navigation). Delegates
 * to `buildContextUrlForStrategy`, which implements the `query`/`path`/`custom`
 * strategy switch.
 *
 * **Path extractor** — called when the context module needs to read a context
 * id back out of a URL (e.g. on initial page load). Uses query-first resolution
 * so `$contextId` query-param routes take precedence over path-segment routes.
 *
 * @param builder - Context configuration builder supplied by `enableContext()`.
 */
export const configureDevPortalContext = (builder: DevPortalContextConfigBuilder): void => {
  builder.setContextPathGenerator((context, path, routingStrategy) =>
    buildContextUrlForStrategy(context?.id, path, routingStrategy),
  );

  builder.setContextPathExtractor((path) => resolveContextIdFromUrl(path));
};

export default configureDevPortalContext;
