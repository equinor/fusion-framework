import { en, Faker } from '@faker-js/faker';
import { defineService } from '@equinor/fusion-openapi-mock-server/discovery';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Raw Context API entity returned by the local service mock. */
interface ContextEntity {
  id: string;
  externalId: string;
  source: string;
  type: { id: string; isChildType: boolean; parentTypeIds: string[] };
  value: Record<string, unknown>;
  title: string;
  isActive: boolean;
  isDeleted: boolean;
  created: string;
  updated: null;
}

/**
 * Converts a UUID into a deterministic unsigned 32-bit Faker seed.
 * @param id - UUID used to seed generated context data.
 * @returns A numeric seed derived from every character in the UUID.
 */
const uuidToSeed = (id: string): number =>
  // Fold the complete UUID into the seed while keeping the hash unsigned and repeatable.
  [...id].reduce(
    (hash, character) => Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0,
    2166136261,
  );

/**
 * Creates an isolated deterministic Faker instance for a context UUID.
 * @param id - Context UUID used as the Faker seed input.
 * @returns A Faker instance whose output is stable for the UUID.
 */
const createContextFaker = (id: string): Faker => new Faker({ locale: en, seed: uuidToSeed(id) });

/**
 * Generates a deterministic raw Context API entity.
 * @param id - UUID retained as the generated entity ID and Faker seed.
 * @param type - Fusion context type assigned to the generated entity.
 * @returns A stable context entity for the supplied UUID and type.
 */
const createContext = (id: string, type: string): ContextEntity => {
  const faker = createContextFaker(id);
  return {
    id,
    externalId: faker.string.alphanumeric(12),
    source: 'Playwright',
    type: { id: type, isChildType: false, parentTypeIds: [] },
    value: { seed: id },
    title: faker.company.name(),
    isActive: true,
    isDeleted: false,
    created: faker.date.past({ refDate: '2026-01-01T00:00:00.000Z' }).toISOString(),
    updated: null,
  };
};

/**
 * Resolves a seeded context using the ID extracted from the OpenAPI route.
 * @param params - Path parameters for the matched context operation.
 * @returns The matching context response, or a not-found response for an unknown ID.
 */
const getContext = ({
  params,
}: {
  params: Record<string, string>;
}): { status: number; mock: unknown } => {
  // Reject malformed IDs because they cannot provide a valid deterministic UUID seed.
  if (!UUID_PATTERN.test(params.id)) {
    return { status: 404, mock: { message: `Context ${params.id} was not found` } };
  }
  return { status: 200, mock: createContext(params.id, 'ProjectMaster') };
};

/**
 * Generates deterministic related contexts from the requested source context UUID.
 * @param params - Path parameters for the matched related-context operation.
 * @returns Stable facility and discipline relations, or not found for an invalid UUID.
 */
const getRelatedContexts = ({
  params,
}: {
  params: Record<string, string>;
}): { status: number; mock: unknown } => {
  // Reject malformed IDs before using them as deterministic Faker seed input.
  if (!UUID_PATTERN.test(params.id)) {
    return { status: 404, mock: { message: `Context ${params.id} was not found` } };
  }
  const faker = createContextFaker(params.id);
  const facilityId = faker.string.uuid();
  const disciplineId = faker.string.uuid();
  return {
    status: 200,
    mock: [createContext(facilityId, 'Facility'), createContext(disciplineId, 'Discipline')],
  };
};

export default defineService({
  key: 'context',
  serviceDiscovery: 'merge',
  routes: {
    '/contexts/{id}': {
      get: getContext,
    },
    '/contexts/{id}/relations': {
      get: getRelatedContexts,
    },
  },
});
