import { LinearProgress } from '@equinor/eds-core-react';

const styles = {
  container: {
    padding: '1rem',
  },
};

/**
 * Loader component that displays a linear progress indicator
 * Uses EDS LinearProgress component for consistent styling
 */
export const Loader = () => {
  return (
    <div style={styles.container}>
      <h3 style={{ marginBottom: '0.5rem' }}>Loading...</h3>
      <LinearProgress />
    </div>
  );
};

export default Loader;

