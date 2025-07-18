import type { ObservableInput } from 'rxjs';
import type { AllowedValue, IStateItem } from '../StateItem';

const ID_SEPARATOR = '::';

const extractId = (key: string): { namespace: string; id: string } => {
  const [namespace, id] = key.split(ID_SEPARATOR);
  return { namespace, id };
};

export interface IStorageAdapter<TType extends AllowedValue = AllowedValue> extends Iterable<TType> {
  order?: number;
  readonly initial?: ObservableInput<IStateItem[]>;
  setItem(key: string, item: TType): ObservableInput<void>;
  setItems?(items: { key: string, value?: TType }[]): ObservableInput<void>;
  removeItem(key: string): void;
  getItem<T = TType>(key: string): T | undefined;
  getItems<T = TType>(): Record<string, T>;
  clear(): void;
}

export abstract class StorageAdapter<TType extends AllowedValue> implements IStorageAdapter<TType> {
  #order?: number;
  #storage: Storage;
  constructor(
    public readonly namespace: string,
    storage: Storage,
  ) {
    this.#storage = storage;
  }

  *[Symbol.iterator](): Generator<TType> {
    for (const item of Object.values(this.getItems())) {
      yield item;
    }
  }

  set order(order: number) {
    this.#order = order;
  }

  get order(): number {
    return this.#order || -1;
  }

  abstract get initial(): ObservableInput<IStateItem[]>;

  generateId(key: string): string {
    return [this.namespace, key].join(ID_SEPARATOR);
  }

  async setItem(key: string, value: TType): Promise<void> {
    this.#storage.setItem(this.generateId(key), JSON.stringify(value));
  }

  async setItems(items: { key: string; value?: TType }[]): Promise<void> {
    for (const item of items) {
      this.#storage.setItem(this.generateId(item.key), JSON.stringify(item.value));
    }
  }

  removeItem(key: string): void {
    this.#storage.removeItem(this.generateId(key));
  }

  getItem<T = TType>(key: string): T | undefined {
    const raw = this.#storage.getItem(this.generateId(key));
    return raw ? (JSON.parse(raw) as T) : undefined;
  }

  getItems<T = TType>(): Record<string, T> {
    return this._getItems().reduce((acc, { id, value }) => Object.assign(acc, { [id]: value }), {});
  }

  clear(): void {
    for (const item of this._getItems()) {
      this.#storage.removeItem(item.key);
    }
  }

  protected _getItems(): Array<{ namespace: string; id: string; key: string; value: TType }> {
    const { namespace } = this;
    return Object.entries(this.#storage)
      .map(([key, value]) => ({
        ...extractId(key),
        key,
        value,
      }))
      .filter((x) => x.namespace === namespace)
      .map((item) => {
        return Object.assign(item, { value: JSON.parse(item.value) });
      });
  }
}

export default StorageAdapter;
