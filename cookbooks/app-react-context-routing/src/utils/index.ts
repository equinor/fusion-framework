export {
  extractContextIdFromQuery,
  extractCustomContextIdFromPath,
  extractPathStrategyContextIdFromPath,
  generateCustomPathFromContext,
  resolvePathFromContext,
  resolveCustomPathFromContext,
} from './context-path';
export {
  hasPathContext,
  replaceAppPathSuffix,
  getOutsideFrameworkRouteBHref,
  getPortalAppHref,
  stripContextFromPath,
} from './url';
export { resolveContextMode, resolveRoutingStrategy, resolveStrategyLabel } from './strategy';
export type { ContextRoutingStrategy, ContextMode, InitSource } from './strategy';
