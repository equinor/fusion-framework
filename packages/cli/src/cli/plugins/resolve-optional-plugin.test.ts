import { describe, expect, it } from 'vitest';

import { resolveOptionalPlugin } from './resolve-optional-plugin.js';

describe('resolveOptionalPlugin', () => {
  it('rejects a resolved module without a default factory export', async () => {
    const moduleUrl = 'data:text/javascript,export const named = true';

    await expect(resolveOptionalPlugin(moduleUrl)).rejects.toThrow(
      `Expected "${moduleUrl}"'s default export to be a factory function.`,
    );
  });
});
