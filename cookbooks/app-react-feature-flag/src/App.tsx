import { useFeatureFlag, useFeatureFlags, useFrameworkFeatureFlag } from '@equinor/fusion-framework-react-app/feature-flag';
import FeatureFlag from './FeatureFlag';

export const App = () => {
    const { features, setFeatureEnabled } = useFeatureFlags();
    const { feature: fooFlag } = useFeatureFlag('foo');
    const { feature: redHeaderFlag } = useFeatureFlag('redHeader');
    const { feature: pinkBgFlag } = useFrameworkFeatureFlag('pinkBg');

    if (!fooFlag) {
        return null;
    }

    return (
        <div style={{ background: pinkBgFlag?.enabled ? '#ff00cc' : 'transparent' }}>
            <h1 style={{ color: redHeaderFlag?.enabled ? '#ff0000' : '#000000' }}>Feature Flags</h1>
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
        </div>
    );
};

export default App;
