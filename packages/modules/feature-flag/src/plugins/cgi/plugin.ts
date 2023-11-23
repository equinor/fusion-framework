import { Subject, Subscription, from, of } from 'rxjs';
import { concatMap, reduce, takeUntil, withLatestFrom } from 'rxjs/operators';

import { INavigationProvider } from '@equinor/fusion-framework-module-navigation';

import type { AssertFeatureFlag, CgiFeatureFlagPlugin, Path } from './types';

import type { FeatureFlag, IFeatureFlag } from '../../FeatureFlag';

import { name as namespace } from '../../FeatureFlagModule';
import { normalizeFlags } from '../../utils/normalize-flags';
import { type IStorageAdapter, createStorage } from '../../utils/storage';

export const assertFeatureFlag: AssertFeatureFlag = (options) => {
    if (options.value === '0' || options.value === 'false') {
        return false;
    }
    return true;
};

export type PluginOptions = {
    isFeatureEnabled?: typeof assertFeatureFlag;
    storage?: IStorageAdapter<IFeatureFlag>;
};

export const plugin = (
    args: { name: string; navigation: INavigationProvider; initial?: Array<FeatureFlag> },
    options?: PluginOptions,
): CgiFeatureFlagPlugin => {
    const { name, navigation, initial = [] } = args;
    const {
        isFeatureEnabled = assertFeatureFlag,
        storage: storageAdapter = createStorage<IFeatureFlag>(namespace, name, 'local'),
    } = options ?? {};
    // TODO - get / create from config
    return {
        initial: async () => {
            const initialFlags = normalizeFlags(initial);

            Object.values(storageAdapter.getItems()).forEach((flag) => {
                const initialFlag = initialFlags[flag.key];
                if (initialFlag && !initialFlag.readonly) {
                    initialFlag.enabled = !!flag.enabled;
                }
            });

            return Object.values(initialFlags);
        },
        onFeatureToggle: ({ flags }) => {
            flags.forEach((flag) => storageAdapter.setItem(flag.key, flag));
        },
        connect: ({ provider }) => {
            const features$ = of(initial);

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

            subscription.add(change$.subscribe((features) => provider.toggleFeatures(features)));

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
