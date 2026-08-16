import { Faker, en } from '@faker-js/faker';
import { generate } from 'json-schema-faker';

import type { FieldFakerFn } from './types';

/** Options for {@link generateMockFromSchema}. */
export interface GenerateMockFromSchemaOptions {
  /**
   * Seeds both `json-schema-faker`'s own PRNG and `@faker-js/faker`'s global
   * state, so the same schema and seed always fake the same value — useful
   * for a repeatable test rather than asserting against `expect.any(...)`.
   */
  seed?: number;

  /**
   * Function-valued {@link FieldFakerMap} entries, keyed by the synthetic
   * `"__custom.<key>"` faker path {@link applyFieldFakers} annotated the
   * schema with, so those paths resolve during generation.
   */
  customFakers?: Record<string, FieldFakerFn>;
}

/**
 * Fakes a value matching `schema`, using `@faker-js/faker` for any property
 * with a `faker: "module.method"` extension keyword (e.g. `{ faker:
 * "internet.email" }`), and `json-schema-faker`'s own built-in generators
 * (`format`, `pattern`, ranges, ...) for everything else.
 *
 * @param schema - A schema with every `$ref` already inlined; see {@link dereferenceSchema}.
 * @param options - Pass `seed` for deterministic, repeatable output, or `customFakers` for
 *   the function-valued entries {@link applyFieldFakers} produced.
 * @returns A promise resolving to a value shaped by the supplied schema.
 */
export async function generateMockFromSchema(
  schema: unknown,
  options: GenerateMockFromSchemaOptions = {},
): Promise<unknown> {
  // A fresh instance per call, rather than seeding the `faker` singleton, so concurrent
  // calls with different seeds cannot race each other through shared global state.
  const localFaker = new Faker({ locale: [en] });
  // Only a caller-supplied seed makes output deterministic; otherwise this instance stays random.
  if (options.seed !== undefined) localFaker.seed(options.seed);
  return generate(schema as Parameters<typeof generate>[0], {
    // `__custom` is a synthetic namespace `applyFieldFakers` points function-valued
    // field overrides at, resolved by the same dotted-path lookup as a real faker path
    extensions: { faker: { ...localFaker, __custom: options.customFakers ?? {} } },
    seed: options.seed,
    // fake every optional property too, so a consumer sees the whole schema shape rather
    // than a coin-flip subset of it on every run
    alwaysFakeOptionals: true,
    useDefaultValue: true,
  });
}
export default generateMockFromSchema;
