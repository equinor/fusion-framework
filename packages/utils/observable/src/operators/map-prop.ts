import { type OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

import { NestedKeys, NestedPropType } from 'src/react/types';

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
