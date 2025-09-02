export type AllowedValue =
  | string
  | Array<unknown>
  | Record<string | symbol | number, unknown>
  | Set<unknown>
  | number
  | boolean
  | undefined
  | null;

/**
 * Represents a storage item with a string key and a value of a permitted type.
 *
 * @typeParam T - The type of the value stored, constrained to `AllowedValue`.
 * @property key - The unique identifier for the storage item.
 * @property value - The value associated with the key.
 */
export type StateItem<T extends AllowedValue = AllowedValue> = {
  key: string;
  value: T;
};
