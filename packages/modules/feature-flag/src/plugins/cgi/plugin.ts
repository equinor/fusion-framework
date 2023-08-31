import { Subject, Subscription, from, of } from 'rxjs';
import { concatMap, reduce, takeUntil, withLatestFrom } from 'rxjs/operators';

import { INavigationProvider } from '@equinor/fusion-framework-module-navigation';

import type { AssertFeatureFlag, CgiFeatureFlagPlugin, Path } from './types';

import type { FeatureFlag } from '../../FeatureFlag';

export const assertFeatureFlag: AssertFeatureFlag = (options) => {
    if (options.value === '0' || options.value === 'false') {
        return false;
    }
    return true;
};

export const plugin = (
    args: { navigation: INavigationProvider; initial?: Array<FeatureFlag> },
    options: { onlyProvided?: boolean; isFeatureEnabled?: typeof assertFeatureFlag },
): CgiFeatureFlagPlugin => {
    const { navigation, initial = [] } = args;
    const { isFeatureEnabled = assertFeatureFlag } = options ?? {};
    return {
        initial: async () => initial,
        initialize: ({ provider }) => {
            const features$ = options.onlyProvided ? of(initial) : provider.features$;

            const subscription = new Subscription();
            const teardown$ = new Subject();
            const path$ = new Subject<Path>();

            const change$ = path$.pipe(
                withLatestFrom(features$),
                concatMap(([path, features]) => {
                    const search = new URLSearchParams(path.search);
                    return from(features).pipe(
                        reduce(
                            (acc, feature) => {
                                const { key } = feature;
                                if (search.has(key)) {
                                    const value = search.get(key);
                                    const enabled = isFeatureEnabled({ feature, value, path });
                                    acc.push({ key, enabled });
                                }
                                return acc;
                            },
                            [] as Array<{ key: string; enabled: boolean }>,
                        ),
                    );
                }),
                takeUntil(teardown$),
            );

            subscription.add(change$.subscribe(provider.toggleFeatures));

            /** when disposed, signal teardown of processes */
            subscription.add(() => path$.complete());

            /** subscribe to navigation events  */
            subscription.add(
                navigation.navigator.listen((e) => {
                    path$.next(e.location);
                }),
            );

            /** resolve initial */
            path$.next(navigation.path);

            /** teardown */
            return subscription;
        },
    };
};

export default plugin;
