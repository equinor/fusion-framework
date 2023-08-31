import { StorageAdapter } from './StorageAdapter';

export class LocalStorageAdapter<TType = unknown> extends StorageAdapter<TType> {
    constructor(namespace: string, name: string) {
        super(namespace, name, window.localStorage);
    }
}

export default LocalStorageAdapter;
