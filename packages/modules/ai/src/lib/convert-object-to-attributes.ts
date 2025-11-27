export type VectorStoreDocumentAttribute<
  T extends Record<string, unknown> = Record<string, unknown>,
> = Array<{
  key: keyof T;
  value: string;
}>;

export const convertObjectToAttributes = <T extends Record<string, unknown>>(
  object: T,
): VectorStoreDocumentAttribute<T> => {
  return Object.entries(object).map(([key, value]) => ({
    key: key as keyof T,
    value: typeof value === 'string' ? value : JSON.stringify(value),
  }));
};
