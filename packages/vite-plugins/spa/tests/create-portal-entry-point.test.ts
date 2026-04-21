import { describe, expect, it } from 'vitest';

import { createPortalEntryPoint } from '../src/html/create-portal-entry-point';

describe('createPortalEntryPoint', () => {
  it('should avoid double slashes when proxy prefix and asset path both include slash boundaries', () => {
    const result = createPortalEntryPoint(
      '/portal-proxy',
      '/bundles/templates/app-portal@2.0.1/dist',
      'index.mjs?import',
    );

    expect(result).toBe('/portal-proxy/bundles/templates/app-portal@2.0.1/dist/index.mjs?import');
  });

  it('should normalize trailing and leading slashes across all segments', () => {
    const result = createPortalEntryPoint(
      '/portal-proxy/',
      '/bundles/templates/app-portal@2.0.1/dist/',
      '/index.mjs?import',
    );

    expect(result).toBe('/portal-proxy/bundles/templates/app-portal@2.0.1/dist/index.mjs?import');
  });

  it('should preserve absolute origin when asset path points to an external URL', () => {
    const result = createPortalEntryPoint(
      'https://cdn.example.com/bundles/templates/app-portal@2.0.1/dist/',
      '/index.mjs?import',
    );

    expect(result).toBe('https://cdn.example.com/bundles/templates/app-portal@2.0.1/dist/index.mjs?import');
  });
});
