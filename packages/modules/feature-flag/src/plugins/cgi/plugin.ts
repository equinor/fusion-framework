import { INavigationProvider } from '@equinor/fusion-framework-module-navigation';
import type { AssertFeatureFlag, CgiFeatureFlagPlugin, ICgiPluginClient, Path } from './types';
import { Subject, Subscription, forkJoin, from, of } from 'rxjs';
import { concatMap, map, reduce, takeUntil, withLatestFrom } from 'rxjs/operators';
import { FeatureFlag, IFeatureFlag } from '../../FeatureFlag';
import { IFeatureFlagProvider } from '../../FeatureFlagProvider';
import { normalizeFlags } from '../../utils/normalize-flags';

export const assertFeatureFlag: AssertFeatureFlag = (options) => {
    if (options.value === '0' || options.value === 'false') {
        return false;
    }
    return true;
};

export class CgiPlugin implements CgiFeatureFlagPlugin {
    #cgiClient: ICgiPluginClient;
    #navigation: INavigationProvider;
    #isFeatureEnabled: typeof assertFeatureFlag;
    #features: Array<IFeatureFlag>;

    constructor(args: {
        cgiClient: ICgiPluginClient;
        features: Array<string | IFeatureFlag>;
        navigation: INavigationProvider;
        isFeatureEnabled?: typeof assertFeatureFlag;
    }) {
        const { cgiClient, features, navigation, isFeatureEnabled = assertFeatureFlag } = args;

        this.#features = features
            .map(
                (feature): IFeatureFlag =>
                    typeof feature === 'object' ? feature : { key: feature, enabled: false },
            )
            .map(FeatureFlag.Parse);
        this.#cgiClient = cgiClient;
        this.#navigation = navigation;
        this.#isFeatureEnabled = isFeatureEnabled;
    }

    initial() {
        return forkJoin({
            featureFlags: of(normalizeFlags(this.#features)),
            storedFlags: this.#cgiClient.getFeatureFlags(),
        }).pipe(
            map(({ featureFlags, storedFlags }) => {
                Object.values(storedFlags).forEach((flag) => {
                    const initialFlag = featureFlags[flag.key];
                    if (initialFlag && !initialFlag.readonly) {
                        initialFlag.enabled = !!flag.enabled;
                    }
                });

                return Object.values(featureFlags);
            }),
        );
    }

    onFeatureToggle(event: { flags: Array<IFeatureFlag> }) {
        const { flags } = event;
        this.#cgiClient.storeFeatureFlags(flags);
    }

    connect(args: { provider: IFeatureFlagProvider }) {
        const { provider } = args;

        const subscription = new Subscription();
        const teardown$ = new Subject();
        const path$ = new Subject<Path>();

        const change$ = path$.pipe(
            concatMap((path) => {
                const search = new URLSearchParams(path.search);
                return from(this.#features).pipe(
                    reduce(
                        (acc, feature) => {
                            const { key } = feature;
                            if (search.has(key)) {
                                const value = search.get(key);
                                const enabled = this.#isFeatureEnabled({ feature, value, path });
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
            this.#navigation.navigator.listen((e) => {
                path$.next(e.location);
            }),
        );

        /** resolve initial */
        path$.next(this.#navigation.path);

        /** teardown */
        return subscription;
    }
}

export default CgiPlugin;
