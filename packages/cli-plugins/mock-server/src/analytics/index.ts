/**
 * Analytics settings of `ffc mock-server`: resolving flags, config, and plugin defaults, and
 * keeping the default recording folder out of Git.
 *
 * @module
 */
export { ensureGitIgnoredDir } from './ensure-git-ignored-dir.js';
export {
  resolveAnalytics,
  type ResolveAnalyticsOptions,
  type ResolvedAnalytics,
} from './resolve-analytics.js';
