import { useCurrentContext } from '@equinor/fusion-framework-react-app/context';
import { useRelatedContext } from './useRelatedContext';

/**
 * App Component
 *
 * This component is responsible for displaying the current context and related context
 * obtained from the `useCurrentContext` and `useRelatedContext` hooks respectively.
 *
 * The current context and related context are displayed in their own sections,
 * each with a heading and the context data formatted in JSON.
 */
export const App = () => {
    const { currentContext } = useCurrentContext();
    const { value: relatedContext } = useRelatedContext();
    return (
        <>
            <section>
                <h3>Current Context:</h3>
                <pre>{JSON.stringify(currentContext, null, 4)}</pre>
            </section>
            <section>
                <h3>Related Context:</h3>
                <pre>{JSON.stringify(relatedContext, null, 4)}</pre>
            </section>
        </>
    );
};

export default App;
