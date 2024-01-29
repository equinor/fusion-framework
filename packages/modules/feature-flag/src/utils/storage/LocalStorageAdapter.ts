import { StorageAdapter } from './StorageAdapter';

export class LocalStorageAdapter<TType = unknown> extends StorageAdapter<TType> {
    constructor(namespace: string) {
        super(namespace, window.localStorage);
    }
}

export default LocalStorageAdapter;
