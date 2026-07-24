import { LintEngine } from '@equinor/fusion-framework-lint-core';
import type { LintConfig } from '@equinor/fusion-framework-lint-core';
import {
  loadLintConfig,
  recommendedConfig,
  recommendedRules,
} from '@equinor/fusion-framework-lint-config';

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
 * @param ruleOverrides - Raw `--rule` option values, e.g. `['require-tsdoc=off']`.
 * @returns A configured `LintEngine`, including any custom rules registered by the project config.
 */
export async function createConfiguredEngine(ruleOverrides: string[] = []): Promise<LintEngine> {
  const loaded = await loadLintConfig({ base: recommendedConfig });
  // A project config may register custom rules alongside the recommended set
  const rules = loaded ? [...recommendedRules, ...loaded.customRules] : recommendedRules;
  const config: LintConfig = { ...(loaded?.config ?? recommendedConfig) };

  // Process each --rule=id=severity argument, taking precedence over the project config
  for (const override of ruleOverrides) {
    const eqIdx = override.indexOf('=');
    // Guard: skip malformed overrides that lack a '=' separator
    if (eqIdx === -1) continue;
    config[override.slice(0, eqIdx)] = override.slice(eqIdx + 1) as LintConfig[string];
  }

  return new LintEngine(rules, config);
}
