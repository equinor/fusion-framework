export type { Severity, Diagnostic, Rule, SeverityConfig, LintConfig, LintContext } from './types.js';
export { LintEngine } from './engine.js';
export { collectSuppressions, type SuppressionMap } from './suppressions.js';
export { isSuppressed } from './is-suppressed.js';
export { matchesBasenamePattern } from './glob.js';
export { createMatcher, resolveMatch, type MatcherFn, type RuleMatchOptions, type RuleOptions, type RuleDef } from './matcher.js';
