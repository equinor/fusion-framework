import type { LintConfig } from '@equinor/fusion-framework-lint-core';
import { balancedConfig } from './balanced-config.js';
import { defaultConfig } from './default-config.js';
import { strictConfig } from './strict-config.js';
import type { LintPreset } from './lint-preset.js';

/**
 * Resolves a built-in preset name to its severity configuration.
 *
 * @param preset - Built-in preset selected by a project config.
 * @returns The severity configuration for the selected preset.
 * @throws {Error} When a dynamically loaded config contains an unknown preset name.
 */
export function resolvePresetConfig(preset: LintPreset): LintConfig {
  // Keep runtime-loaded JSON and YAML configs aligned with the compile-time preset union.
  switch (preset) {
    case 'default':
      return defaultConfig;
    case 'balanced':
      return balancedConfig;
    case 'strict':
      return strictConfig;
    default:
      throw new Error(`Unknown Fusion lint preset: ${String(preset)}`);
  }
}
