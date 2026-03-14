import type { OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

import type { NestedKeys, NestedPropType } from '../types';

/**
 * RxJS operator that extracts a nested property from emitted objects using
 * a dot-separated string path.
 *
 * @template TObject - The source object type.
 * @template TPath - A dot-separated path string matching nested keys of `TObject`.
 * @param path - The dot-separated property path to extract (e.g., `'user.profile.name'`).
 * @returns An `OperatorFunction` that maps each emitted object to the value at the given path.
 *
 * @example
 * ```ts
 * import { mapProp } from '@equinor/fusion-observable/operators';
 *
 * state$.pipe(
 *   mapProp('user.name'),
 * ).subscribe(console.log); // emits the user's name
 * ```
 */
export const mapProp = <TObject extends Record<string, unknown>, TPath extends NestedKeys<TObject>>(
  path: TPath,
): OperatorFunction<TObject, NestedPropType<TObject, TPath>> =>
  map((obj: TObject) => {
    return String(path)
      .split('.')
      .reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (cur: any, attr: string) => cur[attr],
        obj,
      ) as NestedPropType<TObject, TPath>;
  });

export default mapProp;
