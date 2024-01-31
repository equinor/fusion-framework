import { useFeatureLogger } from './useFeatureLogger';
import { FeatureFlags } from './FeatureFlags';

export const App = () => {
    useFeatureLogger();
    return <FeatureFlags />;
};

export default App;
