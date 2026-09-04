import { reactRouterPlugin as standaloneReactRouterPlugin } from '@equinor/fusion-framework-vite-plugin-react-router';
import { describe, expect, it } from 'vitest';

import { reactRouterPlugin as compatibilityReactRouterPlugin } from '../vite-plugin/index.js';

describe('React Router Vite plugin compatibility entry point', () => {
  it('re-exports the standalone plugin implementation', () => {
    expect(compatibilityReactRouterPlugin).toBe(standaloneReactRouterPlugin);
  });
});
