import { StorageAdapter } from './StorageAdapter';

/**
 * Storage adapter backed by `window.sessionStorage`.
 *
 * @template TType - The type of values stored.
 */
export class SessionStorageAdapter<TType = unknown> extends StorageAdapter<TType> {
  /** @param namespace - Prefix applied to all keys in `sessionStorage`. */
  constructor(namespace: string) {
    super(namespace, window.sessionStorage);
  }
}

export default SessionStorageAdapter;
