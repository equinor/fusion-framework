import { useAppModule } from '@equinor/fusion-framework-react-app';
import { useObservableState } from '@equinor/fusion-observable/react';
import { FeatureFlagModule } from '@equinor/fusion-framework-module-feature-flag';
import { useCallback, useMemo } from 'react';
import { IFeatureFlag } from '@equinor/fusion-framework-module-feature-flag';
import { useFeatureFlag } from '@equinor/fusion-framework-react-app/feature-flag';
import FeatureFlag from './FeatureFlag';

export const App = () => {
    const provider = useAppModule<FeatureFlagModule>('featureFlag');
    const features$ = useMemo(() => {
        return provider.getFeatures((_) => true);
    }, [provider]);

    const { value: features } = useObservableState(features$);

    const handleToggle = useCallback(
        (flag: IFeatureFlag) => {
            provider.toggleFeature({
                key: flag.key,
                enabled: !flag.enabled,
            });
        },
        [provider],
    );

    const { feature: fooFlag, setFeatureEnabled } = useFeatureFlag('foo');

    if (!fooFlag) {
        return null;
    }

    return (
        <div style={{ display: 'flex', flexFlow: 'column', padding: '1rem' }}>
            {features?.map((feature) => {
                return <FeatureFlag key={feature.key} flag={feature} onToggle={handleToggle} />;
            })}
            <hr />
            <button onClick={() => setFeatureEnabled(!fooFlag.enabled)}>Toggle 'foo' flag</button>
        </div>
    );
};

export default App;
