import type { ServiceMockDefinition } from '../discovery/discover-services.js';

/**
 * Named, bundled baseline mock sets, addressable by name from
 * `MockServerHandle.use()` or the CLI (`fusion-mock --preset=fusion ./mocks`)
 * without installing or pointing at a separate package.
 *
 * @remarks
 * Each entry loads its preset's specs lazily via a dynamic `import()`, so
 * requesting one preset (or none at all) never pulls another bundled
 * preset's OpenAPI documents and fakers into memory. Faked responses are
 * seeded uniformly by `createMockServer({ seed })`, not per preset.
 */
export const presets: Record<string, () => Promise<Record<string, ServiceMockDefinition>>> = {
  fusion: () => import('./fusion/index.js').then((module) => module.fusionPreset()),
};
