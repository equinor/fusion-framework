export type {
  Severity,
  Diagnostic,
  Rule,
  SeverityConfig,
  LintConfig,
  LintContext,
} from './types.js';
export { LintEngine } from './LintEngine.js';
export { collectSuppressions, type SuppressionMap } from './collect-suppressions.js';
export { isSuppressed } from './is-suppressed.js';
export { matchesBasenamePattern } from './matches-basename-pattern.js';
export { createMatcher, type MatcherFn } from './create-matcher.js';
export {
  resolveMatch,
  type RuleMatchOptions,
  type RuleOptions,
  type RuleDef,
} from './resolve-match.js';
