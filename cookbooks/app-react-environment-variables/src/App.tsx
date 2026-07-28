import { useAppEnvironmentVariables } from '@equinor/fusion-framework-react-app';

/**
 * Displays application environment variables with loading and error states.
 * @returns The environment-variable inspection view.
 */
export const App = () => {
  const { value, complete, error } = useAppEnvironmentVariables();
  // Keep the view explicit while environment variables are still loading.
  if (!complete) {
    return <div>Loading...</div>;
  }
  // Render the provider error instead of attempting to display an unavailable value.
  if (error) {
    return <pre>Error: {JSON.stringify(error, null, 2)}</pre>;
  }
  return <pre>{JSON.stringify(value, null, 2)}</pre>;
};

export default App;
