import { useFeatureLogger } from './hooks/useFeatureLogger';
import { FeatureFlags } from './components';

/**
 * Composes feature-flag event logging with the feature list demonstration.
 * @returns The feature-flag cookbook application content.
 */
export const App = () => {
  useFeatureLogger();
  return <FeatureFlags />;
};

export default App;
