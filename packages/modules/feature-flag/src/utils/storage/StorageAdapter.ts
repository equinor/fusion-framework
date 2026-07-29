const ID_SEPARATOR = '::';

const extractId = (key: string): { namespace: string; id: string } => {
  const [namespace, id] = key.split(ID_SEPARATOR);
  return { namespace, id };
};

/**
 * Interface for a namespaced key-value storage adapter.
 *
 * @template TType - The type of values stored.
 */
export interface IStorageAdapter<TType = unknown> extends Iterable<TType> {
  setItem(key: string, item: TType): void;
  removeItem(key: string): void;
  getItem<T = TType>(key: string): T | undefined;
  getItems<T = TType>(): Record<string, T>;
  clear(): void;
}

/**
 * Namespaced wrapper around the Web Storage API (`localStorage` / `sessionStorage`).
 *
 * All keys are automatically prefixed with a namespace to avoid collisions.
 *
 * @template TType - The type of values stored.
 */
export class StorageAdapter<TType = unknown> implements IStorageAdapter<TType> {
  #storage: Storage;

  /**
   * @param namespace - Prefix applied to all keys.
   * @param storage - The underlying `Storage` backend.
   */
  constructor(
    public readonly namespace: string,
    storage: Storage,
  ) {
    this.#storage = storage;
  }

  /**
   * Iterates over every stored value in this namespace.
   *
   * @returns A generator yielding each stored value.
   */
  *[Symbol.iterator](): Generator<TType> {
    // yield each stored value in turn, ignoring the keys
    for (const item of Object.values(this.getItems())) {
      yield item;
    }
  }

  /**
   * Prefixes `key` with this adapter's namespace.
   *
   * @param key - The unprefixed key.
   * @returns The namespaced storage key.
   */
  generateId(key: string): string {
    return [this.namespace, key].join(ID_SEPARATOR);
  }

  /**
   * Stores `item` under `key`, serialized as JSON.
   *
   * @param key - The unprefixed key.
   * @param item - The value to store.
   */
  setItem(key: string, item: TType) {
    this.#storage.setItem(this.generateId(key), JSON.stringify(item));
  }

  /**
   * Removes the item stored under `key`.
   *
   * @param key - The unprefixed key.
   */
  removeItem(key: string): void {
    this.#storage.removeItem(this.generateId(key));
  }

  /**
   * Retrieves and deserializes the item stored under `key`.
   *
   * @template T - Deserialized value type (defaults to `TType`).
   * @param key - The unprefixed key.
   * @returns The deserialized value, or `undefined` if not found.
   */
  getItem<T = TType>(key: string): T | undefined {
    const raw = this.#storage.getItem(this.generateId(key));
    return raw ? (JSON.parse(raw) as T) : undefined;
  }

  /**
   * Retrieves all items in this namespace, keyed by their unprefixed id.
   *
   * @template T - Deserialized value type (defaults to `TType`).
   * @returns A record of all stored values in this namespace.
   */
  getItems<T = TType>(): Record<string, T> {
    // collapse the namespaced entries into a single id -> value record
    return this._getItems().reduce((acc, { id, value }) => {
      // mutate and return the accumulator so it ends up keyed by each id
      return Object.assign(acc, { [id]: value });
    }, {});
  }

  /**
   * Removes every item stored in this namespace.
   */
  clear(): void {
    // only remove items belonging to this namespace, not the whole storage backend
    for (const item of this._getItems()) {
      this.#storage.removeItem(item.key);
    }
  }

  /**
   * Reads and parses every entry in the underlying storage belonging to this namespace.
   *
   * @returns The namespaced entries with their parsed values.
   */
  protected _getItems(): Array<{ namespace: string; id: string; key: string; value: TType }> {
    const { namespace } = this;
    return (
      Object.entries(this.#storage)
        // split each raw key into its namespace/id parts
        .map(([key, value]) => ({
          ...extractId(key),
          key,
          value,
        }))
        // only keep entries belonging to this adapter's namespace
        .filter((x) => x.namespace === namespace)
        // parse the stored JSON value now that we know it's ours
        .map((item) => {
          // mutate the entry in place with its parsed value
          return Object.assign(item, { value: JSON.parse(item.value) });
        })
    );
  }
}

export default StorageAdapter;
