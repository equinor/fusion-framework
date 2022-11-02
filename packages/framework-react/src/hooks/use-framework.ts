import type { Fusion } from '@equinor/fusion-framework';
import type { AnyModule } from '@equinor/fusion-framework-module';

import _useFramework from '../useFramework';

// TODO - remove next major!

/**
 * @deprecated
 *
 * ```ts
 * import { useFramework } from '@equinor/fusion-framework';
 * ```
 */
export const useFramework = <TModules extends Array<AnyModule> = []>(): Fusion<TModules> => {
    console.warn('@deprecated', 'import { useFramework } from @equinor/fusion-framework');
    return _useFramework();
};
