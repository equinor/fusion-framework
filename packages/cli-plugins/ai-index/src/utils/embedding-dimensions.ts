/**
 * Known OpenAI embedding model names and their output vector dimensions.
 *
 * Used by the `ffc ai index create` command to set the `dimensions`
 * property on the `content_vector` field in the Azure AI Search schema.
 *
 * @see https://platform.openai.com/docs/guides/embeddings
 */
const KNOWN_MODEL_DIMENSIONS: ReadonlyMap<string, number> = new Map([
  ['text-embedding-3-large', 3072],
  ['text-embedding-3-small', 1536],
  ['text-embedding-ada-002', 1536],
]);

/**
 * Resolve the embedding vector dimensions for a given model name.
 *
 * Checks the known model→dimensions map first. Falls back to an explicit
 * `dimensions` override from the config. Throws if neither is available.
 *
 * @param model - The embedding model name (e.g. `'text-embedding-3-large'`).
 * @param configDimensions - Optional explicit dimensions from config, used
 *   when the model is not in the known map.
 * @returns The number of dimensions for the embedding vector.
 * @throws {Error} When the model is unknown and no explicit dimensions are configured.
 */
export function resolveEmbeddingDimensions(model: string, configDimensions?: number): number {
  const known = KNOWN_MODEL_DIMENSIONS.get(model);
  if (known !== undefined) return known;

  if (configDimensions !== undefined) return configDimensions;

  const knownModels = [...KNOWN_MODEL_DIMENSIONS.keys()].join(', ');
  throw new Error(
    `Unknown embedding model "${model}". ` +
      `Known models: ${knownModels}. ` +
      'For custom models, set `index.embedding.dimensions` in the config.',
  );
}
