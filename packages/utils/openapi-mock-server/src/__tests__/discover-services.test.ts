import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { discoverServices } from '../discovery/discover-services.js';
import { mergeServiceDefinitions } from '../discovery/merge-service-definitions.js';

const fixturesDir = fileURLToPath(new URL('./fixtures/mocks', import.meta.url));

describe('discoverServices', () => {
  it('discovers a service module and ignores bare schema files', async () => {
    const definitions = await discoverServices(fixturesDir);

    expect(definitions).toHaveLength(1);
    expect(definitions[0].key).toBe('pet-store');
    expect(definitions[0].serviceDiscovery).toBe('replace');
    expect(definitions[0].document).toMatchObject({ openapi: '3.0.0' });
    expect(definitions[0].fields).toEqual({ 'Pet.name': 'internet.userName' });
  });

  it('rejects a mock module without a defineService-shaped default export', async () => {
    const brokenDir = fileURLToPath(new URL('./fixtures/broken', import.meta.url));
    await expect(discoverServices(brokenDir)).rejects.toThrow(/oops\.mock\.ts/);
  });

  it('lets a schema-less merge module inherit and customize an earlier definition', async () => {
    const overridesDir = fileURLToPath(new URL('./fixtures/overrides', import.meta.url));

    const definitions = mergeServiceDefinitions(
      await discoverServices(fixturesDir),
      await discoverServices(overridesDir),
    );

    expect(definitions).toHaveLength(1);
    expect(definitions[0].document).toMatchObject({ info: { title: 'Pets' } });
    expect(definitions[0].fields).toEqual({ 'Pet.name': 'person.fullName' });
  });
});
