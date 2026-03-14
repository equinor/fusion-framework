import { StorageAdapter } from './StorageAdapter';

/**
 * Storage adapter backed by `window.localStorage`.
 *
 * @template TType - The type of values stored.
 */
export class LocalStorageAdapter<TType = unknown> extends StorageAdapter<TType> {
  /** @param namespace - Prefix applied to all keys in `localStorage`. */
  constructor(namespace: string) {
    super(namespace, window.localStorage);
  }
}

export default LocalStorageAdapter;
