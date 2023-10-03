import { useAppModule } from '@equinor/fusion-framework-react-app';
import { useObservableState } from '@equinor/fusion-observable/react';
import { FeatureFlagModule } from '@equinor/fusion-framework-module-feature-flag';
import { useMemo } from 'react';
export const App = () => {
    const provider = useAppModule<FeatureFlagModule>('featureFlag');
    const features$ = useMemo(() => {
        return provider.getFeatures((_) => true);
    }, [provider]);

    const { value: features } = useObservableState(features$);

    return (
        <>
            <h1>Feature flags</h1>
            <pre>{JSON.stringify(features)}</pre>
            <ul>
                {features?.map((feature) => {
                    return (
                        <li key={feature.key}>
                            <button
                                onClick={() =>
                                    provider.toggleFeature({
                                        key: feature.key,
                                        enabled: !feature.enabled,
                                    })
                                }
                            >
                                {feature.key} - {feature.enabled ? 'y' : 'n'}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </>
    );
};

export default App;
