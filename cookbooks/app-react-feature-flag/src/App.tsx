import { useFeatureFlag, useFeatureFlags } from '@equinor/fusion-framework-react-app/feature-flag';
import FeatureFlag from './FeatureFlag';

export const App = () => {
    const { features, setFeatureEnabled } = useFeatureFlags();
    const { feature: fooFlag } = useFeatureFlag('foo');

    if (!fooFlag) {
        return null;
    }

    return (
        <div style={{ display: 'flex', flexFlow: 'column', padding: '1rem' }}>
            {features?.map((feature) => {
                return (
                    <FeatureFlag
                        key={feature.key}
                        flag={feature}
                        onToggle={() => setFeatureEnabled(feature.key, !feature.enabled)}
                    />
                );
            })}
            <hr />
            <button onClick={() => setFeatureEnabled('foo', !fooFlag.enabled)}>
                Toggle 'foo' flag
            </button>
        </div>
    );
};

export default App;
