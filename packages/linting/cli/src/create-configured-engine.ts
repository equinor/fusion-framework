import { LintEngine } from '@equinor/fusion-framework-lint-core';
import type { LintConfig } from '@equinor/fusion-framework-lint-core';
import {
  loadLintConfig,
  recommendedConfig,
  recommendedRules,
} from '@equinor/fusion-framework-lint-config';

/** Result of resolving a project's lint config into a ready-to-use engine. */
export interface ConfiguredEngine {
  /** The configured lint engine. */
  engine: LintEngine;
  /** Glob patterns for files/directories to exclude from linting, from the project config. */
  ignorePatterns: string[];
}

/**
 * Builds a {@link LintEngine} for the `lint` and `changed` commands.
 *
 * Severity resolution, lowest to highest precedence:
 * 1. `recommendedConfig` / `recommendedRules`
 * 2. A project `fusion-lint.config.*` / `.fusion-lintrc.*` file, found by
 *    searching from `process.cwd()` upward to the repository root (see
 *    {@link loadLintConfig})
 * 3. `--rule <id>=<severity>` CLI overrides
 *
 * A project config may also scope individual rules to a subset of files via
 * `includePattern`/`excludePattern` (see {@link RuleConfigEntry}); those are
 * applied here by replacing the matching rule's `match` before construction.
 *
 * @param ruleOverrides - Raw `--rule` option values, e.g. `['require-tsdoc=off']`.
 * @returns A configured `LintEngine` plus any `ignorePatterns` declared in the project config,
 *   including any custom rules registered by the project config.
 */
export async function createConfiguredEngine(
  ruleOverrides: string[] = [],
): Promise<ConfiguredEngine> {
  const loaded = await loadLintConfig({ base: recommendedConfig });
  // A project config may register custom rules alongside the recommended set
  const baseRules = loaded ? [...recommendedRules, ...loaded.customRules] : recommendedRules;
  // Apply any includePattern/excludePattern file-scoping declared in the project
  // config, overriding each matching rule's `match` entirely
  const rules = baseRules.map((rule) => {
    const matcherFn = loaded?.ruleMatchers[rule.id];
    return matcherFn ? { ...rule, match: matcherFn } : rule;
  });
  const config: LintConfig = { ...(loaded?.config ?? recommendedConfig) };

  // Process each --rule=id=severity argument, taking precedence over the project config
  for (const override of ruleOverrides) {
    const eqIdx = override.indexOf('=');
    // Guard: skip malformed overrides that lack a '=' separator
    if (eqIdx === -1) continue;
    config[override.slice(0, eqIdx)] = override.slice(eqIdx + 1) as LintConfig[string];
  }

  return {
    engine: new LintEngine(rules, config),
    ignorePatterns: loaded?.ignorePatterns ?? [],
  };
}
