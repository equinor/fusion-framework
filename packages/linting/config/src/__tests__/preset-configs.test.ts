import { describe, expect, it } from 'vitest';
import { balancedConfig } from '../balanced-config.js';
import { defaultConfig } from '../default-config.js';
import { recommendedConfig } from '../recommended-config.js';
import { strictConfig } from '../strict-config.js';

describe('lint presets', () => {
  it('uses the loose default as the backwards-compatible recommended config', () => {
    expect(recommendedConfig).toBe(defaultConfig);
    expect(defaultConfig['require-intent-comment/flow']).toBe('off');
    expect(defaultConfig['require-tsdoc']).toBe('warn');
    expect(defaultConfig['require-component-tsdoc']).toBe('warn');
    expect(defaultConfig['require-hook-tsdoc']).toBe('warn');
    expect(defaultConfig['require-property-tsdoc']).toBe('off');
    expect(defaultConfig['no-todo-without-issue']).toBe('warn');
    expect(defaultConfig['no-empty-catch']).toBe('error');
  });

  it('adds public API guidance in the balanced preset', () => {
    expect(balancedConfig['require-tsdoc']).toBe('warn');
    expect(balancedConfig['require-component-tsdoc']).toBe('warn');
    expect(balancedConfig['single-export-per-file']).toBe('warn');
    expect(balancedConfig['require-intent-comment/flow']).toBe('off');
  });

  it('enforces intent and maintainability in the strict preset', () => {
    expect(Object.values(strictConfig)).not.toContain('off');
    expect(Object.values(strictConfig)).not.toContain('warn');
    expect(strictConfig['require-intent-comment/flow']).toBe('error');
    expect(strictConfig['require-tsdoc']).toBe('error');
  });
});
