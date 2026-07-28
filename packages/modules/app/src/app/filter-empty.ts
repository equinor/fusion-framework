import { filter, type OperatorFunction } from 'rxjs';

/**
 * RxJS operator that filters out `null` and `undefined` emissions.
 *
 * @template T - The non-nullable value type.
 * @returns An operator that only passes through non-nullable values.
 */
export function filterEmpty<T>(): OperatorFunction<T | null | undefined, T> {
  return filter((value): value is T => value !== undefined && value !== null);
}
