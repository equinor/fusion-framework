import type { OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

import type { NestedKeys, NestedPropType } from '../types';

export const mapProp = <TObject extends Record<string, unknown>, TPath extends NestedKeys<TObject>>(
    path: TPath,
): OperatorFunction<TObject, NestedPropType<TObject, TPath>> =>
    map((obj: TObject) => {
        return String(path)
            .split('.')
            .reduce(
                // biome-ignore  lint/suspicious/noExplicitAny: allowed in this case
                (cur: any, attr: string) => cur[attr],
                obj,
            ) as NestedPropType<TObject, TPath>;
    });

export default mapProp;
