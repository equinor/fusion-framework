import { Faker, en } from '@faker-js/faker';
import { type ApiContextEntity, ApiVersion } from '../../src/context';

import { createHash } from 'node:crypto';

function uuidToSeed(uuid: string): number {
  const hash = createHash('sha256').update(uuid).digest('hex');
  return Number.parseInt(hash.slice(0, 8), 16);
}

export const mockContextItem = <V extends ApiVersion = ApiVersion.v1>(
  id: string,
  version: V = ApiVersion.v1 as V,
): ApiContextEntity<V> => {
  const faker = new Faker({ seed: uuidToSeed(id), locale: en });
  switch (version) {
    case ApiVersion.v1:
      return {
        id: String(id),
        externalId: faker.string.uuid(),
        created: faker.date.recent().toUTCString(),
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
        updated: faker.date.past().toUTCString(),
      } satisfies ApiContextEntity<ApiVersion.v1> as ApiContextEntity<V>;
  }
  throw new Error('Not implemented');
};
