import { describe, expect, it } from 'vitest';

import { resolveFusion } from '../scope/resolve-fusion.js';

describe('resolveFusion', () => {
  it('does not enable the parent feature-flag mock by default', async () => {
    const fusion = await resolveFusion();

    expect('featureFlag' in fusion.modules).toBe(false);
  });

  it('enables the parent feature-flag mock for an app that declares feature flags', async () => {
    const fusion = await resolveFusion({ mockFeatureFlag: true });

    expect('featureFlag' in fusion.modules).toBe(true);
  });
});
