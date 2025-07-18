import { immerable } from 'immer';

export type AllowedValue = string | Array<unknown> | Record<string | symbol | number, unknown> | Set<unknown> | number | boolean | undefined | null;
/**
 *  State Item entity
 */
export interface IStateItem<T extends AllowedValue = AllowedValue> {
  /** unique name of the state item */
  readonly key: string;

  // @TODO: add later
  // /** indicates if `value` has been updated **/
  // readonly isDirty: boolean;

  /** given value for the State item */
  value?: T;

}

export class StateItem<T extends AllowedValue = AllowedValue> implements IStateItem<T> {
  #isDirty = false;

  get value(): T | undefined {
    return this.value;
  }

  set value(value: T) {
    this.value = value;
    this.#isDirty = true;
  }

  // @TODO: add later
  // get isDirty(): boolean {
  //   return this.#isDirty;
  // }

  [immerable] = true;

  static Parse<T extends AllowedValue>(objOrString: IStateItem<T>): StateItem<T> {
    const obj = typeof objOrString === 'string' ? JSON.parse(objOrString) : objOrString;

    return new StateItem<T>(obj.key, obj.value);
  }

  constructor(
    public readonly key: string,
    value: T,
  ) {
    this.value = value;
  }

  public toJSON(): string {
    return JSON.stringify({ key: this.key, value: this.value });
  }
}

