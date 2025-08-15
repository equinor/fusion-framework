import { Faker, da, en } from '@faker-js/faker';
import { type ApiContextEntity, ApiVersion } from '../../src/context';

import { createHash } from 'node:crypto';

/**
 * Converts a string to a seed for the Faker.js library.
 *
 * @param uuid - The UUID string to convert.
 * @returns A numeric seed derived from the UUID.
 */
function stringToSeed(uuid: string): number {
  const hash = createHash('sha256').update(uuid).digest('hex');
  return Number.parseInt(hash.slice(0, 8), 16);
}

/**
 * Since generation of dates might have a slight difference in milliseconds
 * we normalize the date to the nearest minute, so we can compare them.
 *
 * @remarks
 * This might fail at exactly midnight, but the odds for that are slim. Rerun the test if it fails.
 *
 * @param date date to normalize
 * @returns string
 */
function normalizeDateMock(date: Date): string {
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date.toISOString();
}

export const mockContextItem = <V extends ApiVersion = ApiVersion.v1>(
  id: string,
  version: V = ApiVersion.v1 as V,
): ApiContextEntity<V> => {
  const seed = stringToSeed(id);
  const faker = new Faker({ seed, locale: en });
  switch (version) {
    case ApiVersion.v1:
      return {
        id: String(id),
        externalId: faker.string.uuid(),
        created: normalizeDateMock(faker.date.recent()),
        source: faker.string.uuid(),
        type: {
          id: faker.string.uuid(),
          isChildType: false,
          parentTypeIds: null,
        },
        value: null,
        title: faker.lorem.sentence(),
        isActive: true,
        isDeleted: false,
        updated: normalizeDateMock(faker.date.past()),
      } satisfies ApiContextEntity<ApiVersion.v1> as ApiContextEntity<V>;
  }
  throw new Error('Not implemented');
};
