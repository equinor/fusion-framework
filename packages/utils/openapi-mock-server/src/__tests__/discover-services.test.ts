import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { discoverServices } from '../discovery/discover-services.js';
import { mergeServiceDefinitions } from '../discovery/merge-service-definitions.js';

const fixturesDir = fileURLToPath(new URL('./fixtures/mocks', import.meta.url));

describe('discoverServices', () => {
  it('discovers a service spec and its overrides sidecar', async () => {
    const definitions = await discoverServices(fixturesDir);

    expect(definitions).toHaveLength(1);
    expect(definitions[0].key).toBe('pet-store');
    expect(definitions[0].document).toMatchObject({ openapi: '3.0.0' });
    expect(definitions[0].fields).toEqual({ 'Pet.name': 'internet.userName' });
  });

  it('rejects a directory containing an unparsable spec', async () => {
    const brokenDir = fileURLToPath(new URL('./fixtures/broken', import.meta.url));
    await expect(discoverServices(brokenDir)).rejects.toThrow();
  });

  it('lets mergeServiceDefinitions layer directories so a later one overrides by key, not merges it', async () => {
    const overridesDir = fileURLToPath(new URL('./fixtures/overrides', import.meta.url));

    const definitions = mergeServiceDefinitions(
      await discoverServices(fixturesDir),
      await discoverServices(overridesDir),
    );

    expect(definitions).toHaveLength(1);
    expect(definitions[0].document).toMatchObject({ info: { title: 'Pet Store Override' } });
  });

  it('discovers a lone .overrides.* file with no matching spec as a fields-only definition', async () => {
    const fieldsOnlyDir = fileURLToPath(new URL('./fixtures/fields-only', import.meta.url));

    const definitions = await discoverServices(fieldsOnlyDir);

    expect(definitions).toEqual([
      { key: 'pet-store', fields: { 'Pet.name': 'internet.userName' } },
    ]);
  });

  it("lets mergeServiceDefinitions merge a fields-only override onto an earlier definition's fields, keeping its document", async () => {
    const fieldsOnlyDir = fileURLToPath(new URL('./fixtures/fields-only', import.meta.url));

    const definitions = mergeServiceDefinitions(
      await discoverServices(fixturesDir),
      await discoverServices(fieldsOnlyDir),
    );

    expect(definitions).toHaveLength(1);
    expect(definitions[0].document).toMatchObject({ openapi: '3.0.0' });
    expect(definitions[0].fields).toEqual({ 'Pet.name': 'internet.userName' });
  });

  it('rejects mergeServiceDefinitions for a fields-only override with no earlier definition to apply to', () => {
    expect(() =>
      mergeServiceDefinitions([{ key: 'pet-store', fields: { 'Pet.name': 'internet.userName' } }]),
    ).toThrow(/no earlier definition/i);
  });
});
