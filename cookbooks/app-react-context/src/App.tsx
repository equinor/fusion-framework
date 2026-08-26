import { useModuleCurrentContext } from '@equinor/fusion-framework-react-module-context';
import { useRelatedContext } from './useRelatedContext';

/**
 * Displays the current Fusion context item and its related context items.
 * @returns The context inspection view.
 */
export const App = () => {
  const { currentContext } = useModuleCurrentContext();
  // const { value: relatedContext } = useRelatedContext(['EquinorTask']);
  const { value: relatedContext } = useRelatedContext();
  return (
    <main data-testid="context-inspection">
      <section>
        <h3>Current Context:</h3>
        <pre>{JSON.stringify(currentContext, null, 4)}</pre>
      </section>
      <section>
        <h3>Related Context:</h3>
        <pre>{JSON.stringify(relatedContext, null, 4)}</pre>
      </section>
    </main>
  );
};

export default App;
