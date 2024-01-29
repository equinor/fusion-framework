import { Subject, Subscription } from 'rxjs';
import { map, takeUntil, withLatestFrom } from 'rxjs/operators';

import { INavigationProvider } from '@equinor/fusion-framework-module-navigation';

import { type IFeatureFlagProvider } from '../../FeatureFlagProvider';

import { assertFeatureFlag } from './assert-feature-flag';

import type { FeatureFlagPlugin, FeatureFlagPluginConfigCallback, IFeatureFlag } from '../../types';
import type { AssertFeatureFlag, Path } from './types';

export const createUrlPlugin = (
    features: Array<IFeatureFlag | string>,
    options?: {
        isFeatureEnabled?: AssertFeatureFlag;
    },
): FeatureFlagPluginConfigCallback => {
    if (!features.length) {
        return () => Promise.resolve({});
    }

    /** when toggling, we are only interested in the keys */
    const featureKeys = features.map((x) => (typeof x === 'string' ? x : x.key));

    return async (configArgs) => {
        if (!configArgs.hasModule('navigation')) {
            throw Error('missing navigation module');
        }

        const navigation = await configArgs.requireInstance<INavigationProvider>('navigation');

        /** if no assertion provided, use default */
        const { isFeatureEnabled = assertFeatureFlag } = options ?? {};

        return {
            order: -1,
            initial: async () => features.filter((x): x is IFeatureFlag => typeof x !== 'string'),
            connect(args: { provider: IFeatureFlagProvider }) {
                const { provider } = args;

                const subscription = new Subscription();

                /** shutdown signal */
                const teardown$ = new Subject();

                /** stream of path changes */
                const path$ = new Subject<Path>();

                /** only include features defined in creation */
                const feature$ = provider.features$.pipe(
                    map((x) => Object.values(x)),
                    map((flags) => flags.filter((flag) => featureKeys.includes(flag.key))),
                );

                /** Observes path changes of the navigator and toggles feature flags */
                const change$ = path$.pipe(
                    withLatestFrom(feature$),
                    map(([path, flags]): Array<{ key: string; enabled: boolean }> => {
                        const search = new URLSearchParams(path.search);
                        return flags.reduce(
                            (acc, flag) => {
                                const { key } = flag;
                                if (search.has(key)) {
                                    const value = search.get(key);
                                    const enabled = isFeatureEnabled({
                                        feature: flag,
                                        value,
                                        path,
                                    });
                                    acc.push({ key, enabled });
                                }
                                return acc;
                            },
                            [] as Array<{ key: string; enabled: boolean }>,
                        );
                    }),
                    takeUntil(teardown$),
                );

                subscription.add(
                    change$.subscribe((features) => provider.toggleFeatures(features)),
                );

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
        } satisfies FeatureFlagPlugin;
    };
};

export default createUrlPlugin;
