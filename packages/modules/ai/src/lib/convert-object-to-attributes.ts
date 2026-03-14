/**
 * A key-value pair representation of document metadata attributes,
 * suitable for indexing in search services that require flat attribute lists.
 *
 * @template T - Shape of the source attribute object.
 */
export type VectorStoreDocumentAttribute<
  T extends Record<string, unknown> = Record<string, unknown>,
> = Array<{
  key: keyof T;
  value: string;
}>;

/**
 * Convert a plain object into a flat array of `{ key, value }` attribute pairs.
 *
 * Non-string values are serialised with `JSON.stringify` so they can be stored
 * as string-typed search index attributes.
 *
 * @template T - Shape of the source object.
 * @param object - The object whose entries will be converted.
 * @returns An array of key-value attribute pairs.
 */
export const convertObjectToAttributes = <T extends Record<string, unknown>>(
  object: T,
): VectorStoreDocumentAttribute<T> => {
  return Object.entries(object).map(([key, value]) => ({
    key: key as keyof T,
    value: typeof value === 'string' ? value : JSON.stringify(value),
  }));
};
