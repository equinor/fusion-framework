const ID_SEPARATOR = '::';
const NAME_SEPARATOR = '_';

const extractId = (key: string): { basename: string; id: string } => {
    const [basename, id] = key.split(ID_SEPARATOR);
    return { basename, id };
};

export interface IStorageAdapter<TType = unknown> extends Iterable<TType> {
    setItem(key: string, item: TType): void;
    removeItem(key: string): void;
    getItem<T = TType>(key: string): T | undefined;
    getItems<T = TType>(): Record<string, T>;
    clear(): void;
}

export class StorageAdapter<TType = unknown> implements IStorageAdapter<TType> {
    #storage: Storage;
    constructor(
        public readonly namespace: string,
        public readonly name: string,
        storage: Storage,
    ) {
        this.#storage = storage;
    }

    *[Symbol.iterator](): Generator<TType> {
        for (const item of Object.values(this.getItems())) {
            yield item;
        }
    }

    get basename(): string {
        return [this.namespace, this.name].join(NAME_SEPARATOR);
    }

    generateId(key: string): string {
        return [this.basename, key].join(ID_SEPARATOR);
    }

    setItem(key: string, item: TType) {
        this.#storage.setItem(this.generateId(key), JSON.stringify(item));
    }

    removeItem(key: string): void {
        this.#storage.removeItem(this.generateId(key));
    }

    getItem<T = TType>(key: string): T | undefined {
        const raw = this.#storage.getItem(this.generateId(key));
        return raw ? (JSON.parse(raw) as T) : undefined;
    }

    getItems<T = TType>(): Record<string, T> {
        return this._getItems().reduce(
            (acc, { id, value }) => Object.assign(acc, { [id]: value }),
            {},
        );
    }

    clear(): void {
        this._getItems().forEach((item) => {
            this.#storage.removeItem(item.key);
        });
    }

    protected _getItems(): Array<{ basename: string; id: string; key: string; value: TType }> {
        const { basename } = this;
        return Object.entries(this.#storage)
            .map(([key, value]) => ({
                ...extractId(key),
                key,
                value,
            }))
            .filter((x) => x.basename === basename)
            .map((item) => {
                return Object.assign(item, { value: JSON.parse(item.value) });
            });
    }
}

export default StorageAdapter;
